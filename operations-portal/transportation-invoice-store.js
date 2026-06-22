/* TransportationInvoiceStore — stores ONLY the invoice's own data
 * (costs, services, status, agent, source signature, finalized snapshot).
 * Structure/header are always generated from the Transportation File, which
 * remains the single source of truth. localStorage seam → Supabase
 * `transportation_invoices` { id, booking_id unique, invoice jsonb, saved_at }.
 */
(function () {
  "use strict";
  var NS = "seasontinv:";
  function key(b) { return NS + String(b); }
  var LS_OK = (function () { try { var k = NS + "__p"; localStorage.setItem(k, "1"); localStorage.removeItem(k); return true; } catch (e) { return false; } })();
  var mem = {};
  function persist(b, j) { if (LS_OK) { try { localStorage.setItem(key(b), j); return; } catch (e) {} } mem[key(b)] = j; }
  function read(b) {
    if (!b) return null; var j = null;
    if (LS_OK) { try { j = localStorage.getItem(key(b)); } catch (e) { j = null; } }
    if (j == null) j = (mem[key(b)] != null ? mem[key(b)] : null);
    if (j == null) return null;
    try { return JSON.parse(j); } catch (e) { return null; }
  }
  function save(bid, invoice) {
    if (!bid) return null;
    var rec = { booking_id: String(bid), saved_at: new Date().toISOString(), invoice: invoice };
    persist(bid, JSON.stringify(rec)); return rec;
  }
  function load(bid) { var r = read(bid); return r ? r.invoice : null; }
  function exists(bid) { return read(bid) != null; }
  function remove(bid) { if (LS_OK) { try { localStorage.removeItem(key(bid)); } catch (e) {} } delete mem[key(bid)]; }
  function allKeys() {
    var ids = {};
    if (LS_OK) { try { for (var i = 0; i < localStorage.length; i++) { var k = localStorage.key(i); if (k && k.indexOf(NS) === 0) ids[k.slice(NS.length)] = 1; } } catch (e) {} }
    Object.keys(mem).forEach(function (k) { if (k.indexOf(NS) === 0) ids[k.slice(NS.length)] = 1; });
    return Object.keys(ids);
  }
  function list() { return allKeys().map(function (bid) { var r = read(bid); if (!r) return null; var v = r.invoice || {}; if (v && typeof v === "object") v.booking_id = v.booking_id || r.booking_id || bid; return v; }).filter(Boolean); }
  window.TransportationInvoiceStore = { save: save, load: load, exists: exists, remove: remove, list: list, keys: allKeys, _backend: LS_OK ? "localStorage" : "memory" };
})();
