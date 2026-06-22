/* =====================================================================
   travel-book-store.js
   Persistence seam for the Travel Book as a MUTABLE OPERATIONAL RECORD,
   one record per booking (keyed by booking_id).

       TravelBookStore.save(bookingId, data)   -> record | null
       TravelBookStore.load(bookingId)         -> data | null
       TravelBookStore.exists(bookingId)       -> boolean
       TravelBookStore.remove(bookingId)       -> void   (helper)

   LAB MODE: backed by localStorage (same origin as the dashboard shell, so
   the record survives close/reopen and iframe reloads). A private-mode /
   no-storage fallback keeps an in-memory copy for the session.

   ▼ FUTURE (Bandar / Supabase): replace ONLY the bodies of `persist` and
     `read` below with Supabase upsert/select on a `travel_books` table
     keyed by booking_id (returning the same { booking_id, saved_at, data }
     record shape). The editor calls save/load/exists ONLY — no storage
     details leak out of this file, so nothing else changes.

   ALL storage access lives here. No localStorage calls anywhere else.
   ===================================================================== */
(function () {
  "use strict";

  var NS = "seasontb:";                       // localStorage namespace
  function key(bid) { return NS + String(bid); }

  // is localStorage usable? (Safari private mode etc. can throw)
  var LS_OK = (function () {
    try { var k = NS + "__probe"; localStorage.setItem(k, "1"); localStorage.removeItem(k); return true; }
    catch (e) { return false; }
  })();
  var mem = {};                               // session fallback

  // --- the only two functions Bandar swaps for Supabase ------------------
  function persist(bid, json) {
    if (LS_OK) { try { localStorage.setItem(key(bid), json); return; } catch (e) { /* fall through */ } }
    mem[key(bid)] = json;
  }
  function read(bid) {
    if (!bid) return null;
    var json = null;
    if (LS_OK) { try { json = localStorage.getItem(key(bid)); } catch (e) { json = null; } }
    if (json == null) json = (mem[key(bid)] != null ? mem[key(bid)] : null);
    if (json == null) return null;
    try { return JSON.parse(json); } catch (e) { return null; }
  }
  // -----------------------------------------------------------------------

  function save(bookingId, data) {
    if (!bookingId) return null;
    var rec = { booking_id: String(bookingId), saved_at: new Date().toISOString(), data: data };
    persist(bookingId, JSON.stringify(rec));
    return rec;
  }
  function load(bookingId) { var rec = read(bookingId); return rec ? rec.data : null; }
  function savedAt(bookingId) { var rec = read(bookingId); return rec ? rec.saved_at : null; }
  function exists(bookingId) { return read(bookingId) != null; }
  function remove(bookingId) {
    if (LS_OK) { try { localStorage.removeItem(key(bookingId)); } catch (e) { /* ignore */ } }
    delete mem[key(bookingId)];
  }

  window.TravelBookStore = {
    save: save, load: load, exists: exists, remove: remove, savedAt: savedAt,
    _backend: LS_OK ? "localStorage" : "memory"
  };
})();
