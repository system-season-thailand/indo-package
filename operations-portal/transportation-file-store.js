/* =====================================================================
   transportation-file-store.js   (Auto Transportation File — Phase 1)
   Persistence seam for the Transportation File, keyed by booking_id.
   ONE transportation file per booking.

       TransportationFileStore.save(bookingId, file) -> { booking_id, saved_at, file }
       TransportationFileStore.load(bookingId)       -> file | null
       TransportationFileStore.exists(bookingId)     -> boolean
       TransportationFileStore.savedAt(bookingId)    -> ISO timestamp | null
       TransportationFileStore.remove(bookingId)     -> void

   The file's movements are AUTO-GENERATED from the confirmed program (see
   transportation-source.js); this store only persists the result + the staff
   selections (driver group, ready-to-send). It never writes booking records.

   ▼ FUTURE (Bandar / Supabase): replace ONLY `persist` / `read` with upsert/
     select on a `transportation_files` table keyed by booking_id (jsonb file
     + saved_at). Callers use the public API only.
   ===================================================================== */
(function () {
  "use strict";
  var NS = "seasontf:";
  function key(bid) { return NS + String(bid); }
  var LS_OK = (function () { try { var k = NS + "__p"; localStorage.setItem(k, "1"); localStorage.removeItem(k); return true; } catch (e) { return false; } })();
  var mem = {};

  function persist(bid, json) { if (LS_OK) { try { localStorage.setItem(key(bid), json); return; } catch (e) {} } mem[key(bid)] = json; }
  function read(bid) {
    if (!bid) return null; var json = null;
    if (LS_OK) { try { json = localStorage.getItem(key(bid)); } catch (e) { json = null; } }
    if (json == null) json = (mem[key(bid)] != null ? mem[key(bid)] : null);
    if (json == null) return null;
    try { return JSON.parse(json); } catch (e) { return null; }
  }

  function save(bookingId, file) {
    if (!bookingId) return null;
    var rec = { booking_id: String(bookingId), saved_at: new Date().toISOString(), file: file };
    persist(bookingId, JSON.stringify(rec));
    return rec;
  }
  function load(bookingId) { var r = read(bookingId); return r ? r.file : null; }
  function savedAt(bookingId) { var r = read(bookingId); return r ? r.saved_at : null; }
  function exists(bookingId) { return read(bookingId) != null; }
  function remove(bookingId) { if (LS_OK) { try { localStorage.removeItem(key(bookingId)); } catch (e) {} } delete mem[key(bookingId)]; }
  function allKeys() {
    var ids = {};
    if (LS_OK) { try { for (var i = 0; i < localStorage.length; i++) { var k = localStorage.key(i); if (k && k.indexOf(NS) === 0) ids[k.slice(NS.length)] = 1; } } catch (e) {} }
    Object.keys(mem).forEach(function (k) { if (k.indexOf(NS) === 0) ids[k.slice(NS.length)] = 1; });
    return Object.keys(ids);
  }
  function list() {
    // returns every saved file object (with booking_id + saved_at attached)
    return allKeys().map(function (bid) {
      var r = read(bid); if (!r) return null;
      var f = r.file || {}; if (f && typeof f === "object") { f.booking_id = f.booking_id || r.booking_id || bid; f._saved_at = r.saved_at; }
      return f;
    }).filter(Boolean);
  }

  window.TransportationFileStore = {
    save: save, load: load, exists: exists, savedAt: savedAt, remove: remove,
    list: list, keys: allKeys,
    _backend: LS_OK ? "localStorage" : "memory"
  };
})();
