/* =====================================================================
   driver-registry.js   (Transportation — Phase 2.1)
   A SIMPLE driver master list. Not a fleet/GPS/ops system — just the people
   you assign movements to, so staff pick a real driver by NAME (not a group)
   and stop sending a movement to the wrong driver.

   Driver object:
     { driver_id, driver_name, country, phone, active }

   API:
     DriverRegistry.all()                 -> all drivers
     DriverRegistry.active()              -> active only
     DriverRegistry.byDestination(destId) -> active drivers for "indonesia"/"thailand"
     DriverRegistry.byId(id)              -> driver | null
     DriverRegistry.add({driver_name, country, phone}) -> driver  (persists)
     DriverRegistry.update(id, patch)     -> driver  (persists)
     DriverRegistry.setActive(id, bool)   -> driver  (persists)

   Scales from 2 → 50 drivers with ZERO architectural change: adding a driver
   is a pure data operation. Country is the simple "group" layer; inside a
   movement the driver's own NAME is shown, never just the group.

   ▼ FUTURE (Bandar / Supabase): replace ONLY `persist` / `read` with a
     `drivers` table (same object shape). Callers use the API only.
   ===================================================================== */
(function () {
  "use strict";
  var NS = "seasondrv:", KEY = NS + "registry";
  var LS_OK = (function () { try { localStorage.setItem(NS + "__p", "1"); localStorage.removeItem(NS + "__p"); return true; } catch (e) { return false; } })();
  var mem = null;

  // seed list — Indonesia: كاكا, أرسلان · Thailand: أنور, مبارك
  var SEED = [
    { driver_id: "DR-IDN-1", driver_name: "كاكا", country: "indonesia", phone: "+62 811 100 201", active: true },
    { driver_id: "DR-IDN-2", driver_name: "أرسلان", country: "indonesia", phone: "+62 811 100 202", active: true },
    { driver_id: "DR-THA-1", driver_name: "أنور", country: "thailand", phone: "+66 81 200 301", active: true },
    { driver_id: "DR-THA-2", driver_name: "مبارك", country: "thailand", phone: "+66 81 200 302", active: true }
  ];

  function persist(list) { var j = JSON.stringify(list); if (LS_OK) { try { localStorage.setItem(KEY, j); return; } catch (e) {} } mem = j; }
  function read() {
    var j = null;
    if (LS_OK) { try { j = localStorage.getItem(KEY); } catch (e) { j = null; } }
    if (j == null) j = mem;
    if (j == null) return null;
    try { return JSON.parse(j); } catch (e) { return null; }
  }
  function load() {
    var list = read();
    if (!list || !list.length) { list = JSON.parse(JSON.stringify(SEED)); persist(list); }
    return list;
  }
  function newId() { return "DR-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 6); }

  function all() { return load(); }
  function active() { return load().filter(function (d) { return d.active !== false; }); }
  function byDestination(destId) { var c = (destId || "").toLowerCase(); return active().filter(function (d) { return (d.country || "").toLowerCase() === c; }); }
  function byId(id) { return load().filter(function (d) { return d.driver_id === id; })[0] || null; }
  function add(o) {
    o = o || {};
    var d = { driver_id: newId(), driver_name: (o.driver_name || "").trim(), country: (o.country || "").toLowerCase(), phone: o.phone || "", active: true };
    if (!d.driver_name) return null;
    var list = load(); list.push(d); persist(list); return d;
  }
  function update(id, patch) {
    var list = load(), d = list.filter(function (x) { return x.driver_id === id; })[0];
    if (!d) return null; Object.keys(patch || {}).forEach(function (k) { d[k] = patch[k]; }); persist(list); return d;
  }
  function setActive(id, on) { return update(id, { active: !!on }); }

  window.DriverRegistry = { all: all, active: active, byDestination: byDestination, byId: byId, add: add, update: update, setActive: setActive, _backend: LS_OK ? "localStorage" : "memory" };
})();
