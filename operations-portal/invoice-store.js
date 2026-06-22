/* InvoiceStore — sales & operations invoices, keyed by "<bookingId>|<type>".
 * type = "sales" | "operations". Statuses: draft/generated/sent/cancelled.
 * localStorage seam → Supabase `invoices` { id, booking_id, type, status,
 * invoice jsonb, created_at }. (Transportation invoices keep their own store.)
 */
(function () {
  "use strict";
  var NS = "seasoninv:";
  function key(bid, type) { return NS + String(bid) + "|" + type; }
  var LS_OK = (function () { try { var k = NS + "__p"; localStorage.setItem(k, "1"); localStorage.removeItem(k); return true; } catch (e) { return false; } })();
  var mem = {};
  function persist(k, j) { if (LS_OK) { try { localStorage.setItem(k, j); return; } catch (e) {} } mem[k] = j; }
  function readKey(k) { var j = null; if (LS_OK) { try { j = localStorage.getItem(k); } catch (e) {} } if (j == null) j = (mem[k] != null ? mem[k] : null); if (j == null) return null; try { return JSON.parse(j); } catch (e) { return null; } }
  function save(bid, type, invoice) {
    if (!bid || !type) return null;
    var prev = readKey(key(bid, type));
    var rec = { booking_id: String(bid), type: type, created_at: (prev && prev.created_at) || new Date().toISOString(), saved_at: new Date().toISOString(), invoice: invoice };
    persist(key(bid, type), JSON.stringify(rec)); return rec;
  }
  function load(bid, type) { var r = readKey(key(bid, type)); return r ? r.invoice : null; }
  function meta(bid, type) { var r = readKey(key(bid, type)); return r ? { status: (r.invoice && r.invoice.status) || "draft", created_at: r.created_at, saved_at: r.saved_at } : null; }
  function exists(bid, type) { return readKey(key(bid, type)) != null; }
  function remove(bid, type) { var k = key(bid, type); if (LS_OK) { try { localStorage.removeItem(k); } catch (e) {} } delete mem[k]; }
  function list() {
    var out = [], seen = {};
    function add(k) { if (k.indexOf(NS) !== 0 || seen[k]) return; seen[k] = 1; var r = readKey(k); if (r) out.push(r); }
    if (LS_OK) { try { for (var i = 0; i < localStorage.length; i++) { var k = localStorage.key(i); if (k) add(k); } } catch (e) {} }
    Object.keys(mem).forEach(add);
    return out;
  }
  window.InvoiceStore = { save: save, load: load, meta: meta, exists: exists, remove: remove, list: list, _backend: LS_OK ? "localStorage" : "memory" };
})();
