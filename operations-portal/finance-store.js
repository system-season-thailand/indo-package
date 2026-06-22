/* FinanceStore — DS5-A. Holds payments (with embedded allocations) + manual bank records.
 * Receivables are DERIVED from Sales Invoices; this store never writes to invoices/bookings.
 * Namespace "seasonfin:". Keys: "pay:<id>", "bank:<id>".
 */
(function () {
  "use strict";
  var NS = "seasonfin:";
  var mem = {};
  var LS_OK = (function () { try { var k = NS + "__p"; localStorage.setItem(k, "1"); localStorage.removeItem(k); return true; } catch (e) { return false; } })();
  function persist(k, j) { if (LS_OK) { try { localStorage.setItem(k, j); return; } catch (e) {} } mem[k] = j; }
  function readKey(k) { var j = null; if (LS_OK) { try { j = localStorage.getItem(k); } catch (e) {} } if (j == null) j = (mem[k] != null ? mem[k] : null); if (j == null) return null; try { return JSON.parse(j); } catch (e) { return null; } }
  function removeKey(k) { if (LS_OK) { try { localStorage.removeItem(k); } catch (e) {} } delete mem[k]; }
  function allKeys() { var out = [], seen = {}; if (LS_OK) { try { for (var i = 0; i < localStorage.length; i++) { var k = localStorage.key(i); if (k && k.indexOf(NS) === 0 && !seen[k]) { seen[k] = 1; out.push(k); } } } catch (e) {} } Object.keys(mem).forEach(function (k) { if (k.indexOf(NS) === 0 && !seen[k]) { seen[k] = 1; out.push(k); } }); return out; }

  // collision-proof id
  function genId(prefix) { return prefix + "-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 8); }

  // ---- payments ----
  function savePayment(p) {
    if (!p) return null;
    if (!p.id) p.id = genId("PMT");
    p.created_at = p.created_at || new Date().toISOString();
    p.allocations = p.allocations || [];
    p.void = p.void || null;
    persist(NS + "pay:" + p.id, JSON.stringify(p));
    return p;
  }
  function getPayment(id) { return readKey(NS + "pay:" + id); }
  function listPayments() {
    return allKeys().filter(function (k) { return k.indexOf(NS + "pay:") === 0; }).map(readKey).filter(Boolean)
      .sort(function (a, b) { return String(b.date || b.created_at).localeCompare(String(a.date || a.created_at)); });
  }
  function voidPayment(id, reason, actor) {
    var p = getPayment(id); if (!p || p.void) return null;
    p.void = { reason: String(reason || ""), at: new Date().toISOString(), actor: String(actor || "—") };
    persist(NS + "pay:" + p.id, JSON.stringify(p)); return p;
  }

  // ---- banks (manual records) ----
  function saveBank(b) {
    if (!b) return null;
    if (!b.id) b.id = genId("BNK");
    b.updated_at = new Date().toISOString();
    persist(NS + "bank:" + b.id, JSON.stringify(b));
    return b;
  }
  function listBanks() { return allKeys().filter(function (k) { return k.indexOf(NS + "bank:") === 0; }).map(readKey).filter(Boolean).sort(function (a, b) { return String(a.name).localeCompare(String(b.name)); }); }
  function removeBank(id) { removeKey(NS + "bank:" + id); }

  // ---- bank movements (DS5-B: manual register, no reconciliation) ----
  function saveMovement(m) { if (!m) return null; if (!m.id) m.id = genId("MOV"); persist(NS + "bmv:" + m.id, JSON.stringify(m)); return m; }
  function listMovements(bankId) {
    var all = allKeys().filter(function (k) { return k.indexOf(NS + "bmv:") === 0; }).map(readKey).filter(Boolean);
    if (bankId) all = all.filter(function (m) { return m.bank_id === bankId; });
    return all.sort(function (a, b) { return String(a.date).localeCompare(String(b.date)) || String(a.id).localeCompare(String(b.id)); });
  }
  function removeMovement(id) { removeKey(NS + "bmv:" + id); }

  // ---- supplier status (DS5-B: tracking only, no reconciliation) ----
  function supStatuses() { return readKey(NS + "supstat") || {}; }
  function setSupStatus(k, status) { var m = supStatuses(); if (status) m[k] = status; else delete m[k]; persist(NS + "supstat", JSON.stringify(m)); return m; }

  window.FinanceStore = {
    genId: genId,
    savePayment: savePayment, getPayment: getPayment, listPayments: listPayments, voidPayment: voidPayment,
    saveBank: saveBank, listBanks: listBanks, removeBank: removeBank,
    saveMovement: saveMovement, listMovements: listMovements, removeMovement: removeMovement,
    supStatuses: supStatuses, setSupStatus: setSupStatus,
    _backend: LS_OK ? "localStorage" : "memory"
  };
})();
