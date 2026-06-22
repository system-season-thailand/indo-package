/* =====================================================================
   management-dashboard-supabase-adapter.js
   Fetches all rows from mgmt_dashboard_cache (READ-ONLY) from Supabase,
   normalizes them into the shape management-dashboard.js expects, sets
   window.MGMT_DATA, then dynamically loads management-dashboard.js.

   Also fires "portal:data-ready" with summary badge counts so the
   operations-portal shell can show live stats.

   The management-dashboard.js is NOT included as a static <script> tag
   in management-dashboard.html — this adapter injects it after data is ready.
   ===================================================================== */
(function () {
  "use strict";

  /* ============================================================
     SUPABASE CONFIG
     ============================================================ */
  var SUPABASE_URL      = "https://zrunsrimyijarswjfycw.supabase.co";
  var SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpydW5zcmlteWlqYXJzd2pmeWN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY3MjgzOTEsImV4cCI6MjA2MjMwNDM5MX0.UdW4LiIY-t1jZlrat1VUGnW0yRE7YEzW5SHbpkE29H8";

  var BASE    = SUPABASE_URL + "/rest/v1/mgmt_dashboard_cache";
  var HEADERS = {
    "apikey":        SUPABASE_ANON_KEY,
    "Authorization": "Bearer " + SUPABASE_ANON_KEY
  };
  var PAGE_SIZE = 1000;

  /* ---- Loading overlay (shown while fetching) ---- */
  var overlay = document.createElement("div");
  overlay.id  = "_db_loading_overlay";
  overlay.style.cssText = [
    "position:fixed",
    "inset:0",
    "background:#141f1b",
    "display:flex",
    "align-items:center",
    "justify-content:center",
    "z-index:9999",
    "font-family:system-ui,sans-serif"
  ].join(";");
  overlay.innerHTML = [
    '<style>',
    '  @keyframes _spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}',
    '  @keyframes _pulse{0%,100%{opacity:.7}50%{opacity:1}}',
    '  #_db_loading_overlay p{margin:0}',
    '</style>',
    '<div style="text-align:center;color:#f0ebe0;padding:32px">',
    '  <svg style="width:56px;height:56px;animation:_spin 2.4s linear infinite;margin-bottom:24px"',
    '       viewBox="0 0 40 40" fill="none">',
    '    <path d="M20 3 L24 16 L37 20 L24 24 L20 37 L16 24 L3 20 L16 16 Z"',
    '          stroke="#c9a24b" stroke-width="1.6" stroke-linejoin="round"/>',
    '    <circle cx="20" cy="20" r="3.4" fill="#c9a24b"/>',
    '  </svg>',
    '  <p style="font-size:1.15rem;font-weight:700;margin-bottom:8px;letter-spacing:-.01em">',
    '    سيزون ترافل — لوحة الإدارة',
    '  </p>',
    '  <p id="_db_progress" style="font-size:0.85rem;opacity:.6;animation:_pulse 1.6s ease-in-out infinite">',
    '    يتصل بقاعدة البيانات…',
    '  </p>',
    '</div>'
  ].join("");
  document.body.appendChild(overlay);

  function setProgress(msg) {
    var el = document.getElementById("_db_progress");
    if (el) el.textContent = msg;
  }

  function showError(msg) {
    overlay.innerHTML = [
      '<div style="text-align:center;color:#f0ebe0;padding:32px;max-width:420px">',
      '  <svg style="width:48px;height:48px;margin-bottom:20px;color:#d9645a"',
      '       viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"',
      '       stroke-linecap="round" stroke-linejoin="round">',
      '    <circle cx="12" cy="12" r="9"/>',
      '    <line x1="12" y1="8" x2="12" y2="12"/>',
      '    <circle cx="12" cy="16" r=".5" fill="currentColor"/>',
      '  </svg>',
      '  <p style="font-size:1.05rem;font-weight:700;color:#d9645a;margin-bottom:10px">',
      '    خطأ في الاتصال بقاعدة البيانات',
      '  </p>',
      '  <p style="font-size:0.82rem;opacity:.75;margin-bottom:20px;line-height:1.6">',
      msg,
      '  </p>',
      '  <button onclick="location.reload()" style="',
      '    padding:10px 24px;background:#c9a24b;color:#141f1b;border:none;',
      '    border-radius:8px;cursor:pointer;font-size:0.9rem;font-weight:600',
      '  ">إعادة المحاولة</button>',
      '</div>'
    ].join("");
  }

  /* ---- Helpers ---- */
  function parseContentRangeTotal(response) {
    var cr = response.headers.get("Content-Range") || response.headers.get("content-range") || "";
    var m  = cr.match(/\/(\*|\d+)$/);
    if (!m || m[1] === "*") return -1;
    return parseInt(m[1], 10);
  }

  /* Normalize destination string → stable lowercase ID */
  function normalizeDest(str) {
    if (!str) return null;
    var s = String(str).toLowerCase().trim();
    if (s === "indonesia" || s === "idn" || s === "إندونيسيا" || s.indexOf("indo") !== -1)
      return "indonesia";
    if (s === "thailand" || s === "tha" || s === "th" || s === "تايلاند" || s.indexOf("thai") !== -1)
      return "thailand";
    /* Unknown destination: create a stable slug */
    return s.replace(/[^\w؀-ۿ]+/g, "-").replace(/^-+|-+$/g, "") || "other";
  }

  /* Human-readable Arabic name for a destination ID */
  function destDisplayName(id, originalStr) {
    if (id === "indonesia") return "إندونيسيا";
    if (id === "thailand")  return "تايلاند";
    return (originalStr || id); /* fall back to whatever was in the DB */
  }

  /* Parse price from a text field (handles commas, currency symbols, Arabic digits) */
  function parsePrice(str) {
    if (str == null || str === "") return 0;
    var s = String(str);
    /* Convert Arabic-Indic digits → ASCII */
    s = s.replace(/[٠-٩]/g, function (c) { return String(c.charCodeAt(0) - 0x0660); });
    /* Strip everything except digits, dots, commas, minus */
    s = s.replace(/[^\d.,-]/g, "");
    /* Handle European-style thousands: 1.234,56 → strip dots first, then comma=dot */
    if (/,\d{1,2}$/.test(s) && s.indexOf(".") !== -1) {
      s = s.replace(/\./g, "").replace(",", ".");
    } else {
      s = s.replace(/,/g, "");
    }
    var n = parseFloat(s);
    return isNaN(n) || n < 0 ? 0 : n;
  }

  /* ---- Paginated fetch ---- */
  function fetchPage(offset) {
    return fetch(
      BASE + "?select=*&order=id&limit=" + PAGE_SIZE + "&offset=" + offset,
      { headers: Object.assign({ "Prefer": "count=exact" }, HEADERS) }
    ).then(function (r) {
      if (!r.ok) throw new Error("HTTP " + r.status + " — " + r.statusText);
      var total = parseContentRangeTotal(r);
      return r.json().then(function (rows) { return { rows: rows || [], total: total }; });
    });
  }

  function fetchAllRows() {
    return fetchPage(0).then(function (first) {
      var total   = first.total;
      var allRows = first.rows.slice();

      if (total < 0 || total <= PAGE_SIZE) return allRows; /* single page */

      setProgress("جارٍ تحميل " + total.toLocaleString("en-US") + " سجل…");

      /* Build remaining page offsets */
      var offsets = [];
      for (var off = PAGE_SIZE; off < total; off += PAGE_SIZE) offsets.push(off);

      return Promise.all(offsets.map(fetchPage)).then(function (pages) {
        pages.forEach(function (p) { allRows = allRows.concat(p.rows); });
        return allRows;
      });
    });
  }

  /* ---- Build window.MGMT_DATA from raw DB rows ---- */
  function buildMgmtData(rows) {

    /* Index structures */
    var coByName  = {};  /* company_name  → internal ID */
    var stByName  = {};  /* staff_name    → internal ID */
    var hoByKey   = {};  /* "hotel|city"  → internal ID */
    var destById  = {};  /* dest id       → { id, name } */

    var coList    = [];
    var stList    = [];
    var hoList    = [];
    var coEarliest = {}; /* companyId → earliest date string */

    /* ---- Pass 1: build entity registries ---- */
    rows.forEach(function (row) {
      var cn   = (row.company_name || "").trim();
      var sn   = (row.staff_name   || "").trim();
      var hn   = (row.hotel_name   || "").trim();
      var city = (row.city         || "").trim();
      var area = (row.area         || "").trim();
      var dest = normalizeDest(row.destination);
      var dt   = row.package_date;

      /* Destinations */
      if (dest && !destById[dest]) {
        destById[dest] = { id: dest, name: destDisplayName(dest, row.destination) };
      }

      /* Companies */
      if (cn && !coByName[cn]) {
        var cid = "C" + (coList.length + 1);
        coByName[cn] = cid;
        coList.push({ id: cid, name: cn, created: null });
      }
      if (cn && dt) {
        var dateStr = String(dt).slice(0, 10);
        var cid2    = coByName[cn];
        if (!coEarliest[cid2] || dateStr < coEarliest[cid2]) coEarliest[cid2] = dateStr;
      }

      /* Staff */
      if (sn && !stByName[sn]) {
        var sid = "S" + (stList.length + 1);
        stByName[sn] = sid;
        stList.push({ id: sid, name: sn, role: "sales" });
      }

      /* Hotels (unique by name + city) */
      if (hn) {
        var hKey = hn + "\x00" + city;
        if (!hoByKey[hKey]) {
          var hid = "H" + (hoList.length + 1);
          hoByKey[hKey] = hid;
          hoList.push({
            id:      hid,
            name:    hn,
            city:    city,
            area:    area,
            country: dest || "indonesia"
          });
        }
      }
    });

    /* Apply earliest-package-date as company "created" date */
    coList.forEach(function (c) {
      c.created = coEarliest[c.id] || new Date().toISOString().slice(0, 10);
    });

    /* ---- Pass 2: build quotations ---- */
    var quotations = [];

    rows.forEach(function (row) {
      if (!row.package_date) return;          /* skip rows without a date */
      var cn = (row.company_name || "").trim();
      if (!cn) return;                        /* skip rows without a company */

      var sn   = (row.staff_name  || "").trim();
      var hn   = (row.hotel_name  || "").trim();
      var city = (row.city        || "").trim();
      var area = (row.area        || "").trim();
      var dest = normalizeDest(row.destination) || "indonesia";
      var hKey = hn + "\x00" + city;

      /* Date + hour */
      var dtStr  = String(row.package_date);
      var date   = dtStr.slice(0, 10);
      var dtObj  = new Date(dtStr);
      var hour   = isNaN(dtObj.getTime()) ? null : dtObj.getUTCHours();

      /* Region string (city – area) used in the Hotels & Regions section */
      var region = city + (area && area !== city ? " – " + area : "");

      quotations.push({
        id:          row.package_name || ("Q-" + row.id),
        date:        date,
        hour:        hour,
        destination: dest,
        companyId:   coByName[cn]  || null,
        staffId:     sn ? stByName[sn] : null,
        hotelId:     hn ? hoByKey[hKey] : null,
        city:        city,
        region:      region,
        value:       parsePrice(row.total_price),
        /* The cache table has no status column — defaulting to "approved".
           All records in this cache are treated as confirmed packages. */
        status:      "approved"
      });
    });

    /* Sort newest-first (matches dashboard expectation) */
    quotations.sort(function (a, b) {
      return a.date < b.date ? 1 : a.date > b.date ? -1 : 0;
    });

    /* Meta dates */
    var allDates  = quotations.map(function (q) { return q.date; }).filter(Boolean).sort();
    var asOf      = allDates[allDates.length - 1] || new Date().toISOString().slice(0, 10);
    var rangeStart = allDates[0] || asOf;

    /* Destinations list — sorted (Indonesia first, Thailand second, others after) */
    var DEST_ORDER = { indonesia: 0, thailand: 1 };
    var destinations = Object.keys(destById).map(function (k) { return destById[k]; });
    destinations.sort(function (a, b) {
      var oa = DEST_ORDER[a.id] != null ? DEST_ORDER[a.id] : 99;
      var ob = DEST_ORDER[b.id] != null ? DEST_ORDER[b.id] : 99;
      return oa - ob;
    });

    /* ---- Assemble the final MGMT_DATA object ---- */
    return {
      meta: {
        product:   "سيزون ترافل — لوحة الإدارة",
        currency:  "ر.س",
        asOf:       asOf,
        generated: "بيانات حقيقية · Supabase · " + quotations.length.toLocaleString("en-US") + " سجل",
        rangeStart: rangeStart,
        access: {
          roles:          ["admin", "manager", "sales"],
          dashboardRoles: ["admin", "manager"]
        }
      },
      destinations: destinations,
      companies:    coList,
      staff:        stList,
      hotels:       hoList,
      quotations:   quotations
    };
  }

  /* ---- Entry point ---- */
  fetchAllRows()
    .then(function (rows) {
      setProgress("جارٍ معالجة البيانات…");

      var mgmtData = buildMgmtData(rows);
      window.MGMT_DATA = mgmtData;

      /* ---- Fire portal:data-ready for the portal shell badge counts ---- */
      var today    = new Date();
      var s30      = new Date(today); s30.setDate(s30.getDate() - 30);
      var s7       = new Date(today); s7.setDate(s7.getDate() - 7);
      var iso30    = s30.toISOString().slice(0, 10);
      var iso7     = s7.toISOString().slice(0, 10);
      var qs       = mgmtData.quotations;
      var recent30 = qs.filter(function (q) { return q.date >= iso30; }).length;
      var recent7  = qs.filter(function (q) { return q.date >= iso7;  }).length;

      window.PORTAL_LIVE = {
        total:    qs.length,
        asOf:     mgmtData.meta.asOf,
        recent30: recent30,
        recent7:  recent7
      };
      document.dispatchEvent(new CustomEvent("portal:data-ready", {
        detail: window.PORTAL_LIVE
      }));

      /* ---- Remove loading overlay ---- */
      overlay.parentNode && overlay.parentNode.removeChild(overlay);

      /* ---- Dynamically inject management-dashboard.js ---- *
         The dashboard checks `window.MGMT_DATA` at the top of its IIFE.
         We inject it AFTER setting MGMT_DATA so the check always passes.
         The dashboard's DOMContentLoaded handler is guarded to fire
         even when the DOM is already loaded (see management-dashboard.js). */
      var s = document.createElement("script");
      s.src = "management-dashboard.js";
      document.body.appendChild(s);
    })
    .catch(function (err) {
      console.error("[mgmt-adapter] Supabase fetch failed:", err.message);
      showError(err.message || "تعذّر الاتصال بقاعدة البيانات.");
      /* Let the portal shell know we failed */
      window.PORTAL_LIVE = null;
      document.dispatchEvent(new CustomEvent("portal:data-ready", { detail: null }));
    });

})();
