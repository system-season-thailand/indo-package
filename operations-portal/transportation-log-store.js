/* TransportationLogStore — lightweight per-booking change log.
 * localStorage seam. Bandar swaps to Supabase table `transportation_log`
 * { id, booking_id, role, action, detail, at } in production.
 * Intentionally minimal: who / what / when. No enterprise audit system.
 */
(function () {
  "use strict";
  var NS = "seasontflog:";
  function key(bid) { return NS + bid; }
  function read(bid) { try { var raw = localStorage.getItem(key(bid)); return raw ? JSON.parse(raw) : []; } catch (e) { return []; } }
  function write(bid, list) { try { localStorage.setItem(key(bid), JSON.stringify(list)); } catch (e) {} }
  window.TransportationLogStore = {
    add: function (bid, entry) {
      if (!bid || !entry) return [];
      var list = read(bid);
      list.push({ role: entry.role || "", action: entry.action || "", detail: entry.detail || "", at: entry.at || new Date().toISOString() });
      if (list.length > 200) list = list.slice(-200);   // keep lightweight
      write(bid, list);
      return list;
    },
    list: function (bid) { return read(bid); },
    clear: function (bid) { write(bid, []); }
  };
})();
