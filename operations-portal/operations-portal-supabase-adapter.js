/* =====================================================================
   operations-portal-supabase-adapter.js
   Connects the Operations Portal shell to the Supabase database.
   Fetches a quick summary from mgmt_dashboard_cache (READ-ONLY) to
   populate live badge counts on the nav items.
   Fires "portal:data-ready" when done, whether or not it succeeds.

   ⚠️  REQUIRES the cache table to be populated.
       Run the two SQL steps from management-dashboard-supabase-adapter.js
       in the Supabase SQL Editor first (STEP 1 + STEP 2).
   ===================================================================== */
(function () {
  "use strict";

  /* ============================================================
     SUPABASE CONFIG — same project as the management dashboard
     ============================================================ */
  var SUPABASE_URL      = "https://zrunsrimyijarswjfycw.supabase.co";
  var SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpydW5zcmlteWlqYXJzd2pmeWN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY3MjgzOTEsImV4cCI6MjA2MjMwNDM5MX0.UdW4LiIY-t1jZlrat1VUGnW0yRE7YEzW5SHbpkE29H8";

  var BASE_HEADERS = {
    "apikey":        SUPABASE_ANON_KEY,
    "Authorization": "Bearer " + SUPABASE_ANON_KEY
  };

  /* ---- helpers --------------------------------------------------- */
  function parseContentRangeTotal(r) {
    var cr = r.headers.get("Content-Range") || r.headers.get("content-range") || "";
    var m  = cr.match(/\/(\d+)$/);
    return m ? parseInt(m[1], 10) : 0;
  }

  /* ---- fetch total record count + latest date ------------------- */
  function fetchTotal() {
    return fetch(
      SUPABASE_URL + "/rest/v1/mgmt_dashboard_cache?select=id,package_date&order=package_date.desc&limit=1",
      { headers: Object.assign({ "Prefer": "count=exact" }, BASE_HEADERS) }
    ).then(function (r) {
      if (!r.ok) throw new Error("HTTP " + r.status);
      var total = parseContentRangeTotal(r);
      return r.json().then(function (rows) {
        var asOf = rows && rows[0] && rows[0].package_date
          ? rows[0].package_date.slice(0, 10) : null;
        return { total: total, asOf: asOf };
      });
    });
  }

  /* ---- fetch count of records in the last 30 days -------------- */
  function fetchRecent30() {
    var since = new Date();
    since.setDate(since.getDate() - 30);
    var iso = since.toISOString().slice(0, 10);
    return fetch(
      SUPABASE_URL + "/rest/v1/mgmt_dashboard_cache?select=id&package_date=gte." + iso,
      { headers: Object.assign({ "Prefer": "count=exact" }, BASE_HEADERS) }
    ).then(function (r) {
      if (!r.ok) throw new Error("HTTP " + r.status);
      return parseContentRangeTotal(r);
    });
  }

  /* ---- fetch count of records in the last 7 days --------------- */
  function fetchRecent7() {
    var since = new Date();
    since.setDate(since.getDate() - 7);
    var iso = since.toISOString().slice(0, 10);
    return fetch(
      SUPABASE_URL + "/rest/v1/mgmt_dashboard_cache?select=id&package_date=gte." + iso,
      { headers: Object.assign({ "Prefer": "count=exact" }, BASE_HEADERS) }
    ).then(function (r) {
      if (!r.ok) throw new Error("HTTP " + r.status);
      return parseContentRangeTotal(r);
    });
  }

  /* ---- run all three fetches in parallel ----------------------- */
  Promise.all([fetchTotal(), fetchRecent30(), fetchRecent7()])
    .then(function (results) {
      window.PORTAL_LIVE = {
        total:    results[0].total,
        asOf:     results[0].asOf,
        recent30: results[1],
        recent7:  results[2]
      };
      document.dispatchEvent(new CustomEvent("portal:data-ready", {
        detail: window.PORTAL_LIVE
      }));
    })
    .catch(function (err) {
      /* Fail silently — portal works fine without live badges */
      console.warn("[portal-adapter] Supabase connection failed:", err.message);
      window.PORTAL_LIVE = null;
      document.dispatchEvent(new CustomEvent("portal:data-ready", { detail: null }));
    });
})();
