/* =====================================================================
   management-dashboard-supabase-adapter.js
   ---------------------------------------------------------------------
   Calls a Supabase RPC function to fetch pre-extracted dashboard data
   (READ-ONLY). Fires "mgmt:data-ready" when done.

   ⚠️  REQUIRED SETUP — run this SQL once in your Supabase SQL editor:
   -----------------------------------------------------------------------
   CREATE OR REPLACE FUNCTION public.mgmt_get_dashboard_data()
   RETURNS TABLE (
     destination  text,
     package_name text,
     package_date timestamptz,
     company_name text,
     staff_name   text,
     total_price  text,
     hotel_name   text,
     city         text,
     area         text
   )
   LANGUAGE sql
   SECURITY DEFINER
   STABLE
   AS $$
     SELECT
       'indonesia'::text,
       name,
       package_indo_user_current_date,
       TRIM(COALESCE((regexp_match(downloaded_pdf_clint_data_page,
         'id="store_google_sheet_clint_company_name_value"[^>]*>([^<]*)<'))[1],'')),
       TRIM(COALESCE((regexp_match(downloaded_pdf_clint_data_page,
         'id="store_google_sheet_package_user_name_value"[^>]*>([^<]*)<'))[1],'')),
       TRIM(COALESCE((regexp_match(downloaded_pdf_package_including_data_page,
         'id="store_google_sheet_package_total_price_value"[^>]*>([^<]*)<'))[1],'')),
       TRIM(COALESCE((regexp_match(downloaded_pdf_hotel_data_page,
         '<h1[^>]*>([^<]+)</h1>'))[1],'')),
       TRIM(COALESCE((regexp_match(downloaded_pdf_hotel_data_page,
         '<h5[^>]*>([^<]+)</h5>'))[1],'')),
       TRIM(COALESCE((regexp_match(downloaded_pdf_hotel_data_page,
         '<h6[^>]*>([^<]+)</h6>'))[1],''))
     FROM public.indo_all_package
     UNION ALL
     SELECT
       'thailand'::text,
       name,
       package_thai_user_current_date,
       TRIM(COALESCE((regexp_match(downloaded_pdf_clint_data_page,
         'id="store_google_sheet_clint_company_name_value"[^>]*>([^<]*)<'))[1],'')),
       TRIM(COALESCE((regexp_match(downloaded_pdf_clint_data_page,
         'id="store_google_sheet_package_user_name_value"[^>]*>([^<]*)<'))[1],'')),
       TRIM(COALESCE((regexp_match(downloaded_pdf_package_including_data_page,
         'id="store_google_sheet_package_total_price_value"[^>]*>([^<]*)<'))[1],'')),
       TRIM(COALESCE((regexp_match(downloaded_pdf_hotel_data_page,
         '<h1[^>]*>([^<]+)</h1>'))[1],'')),
       TRIM(COALESCE((regexp_match(downloaded_pdf_hotel_data_page,
         '<h5[^>]*>([^<]+)</h5>'))[1],'')),
       TRIM(COALESCE((regexp_match(downloaded_pdf_hotel_data_page,
         '<h6[^>]*>([^<]+)</h6>'))[1],''))
     FROM public.thai_all_package;
   $$;

   GRANT EXECUTE ON FUNCTION public.mgmt_get_dashboard_data() TO anon;
   -----------------------------------------------------------------------
   ===================================================================== */
(function () {
  "use strict";

  /* ============================================================
     SUPABASE CONFIG — same project used by the main system
     ============================================================ */
  var SUPABASE_URL      = "https://zrunsrimyijarswjfycw.supabase.co";
  var SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpydW5zcmlteWlqYXJzd2pmeWN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY3MjgzOTEsImV4cCI6MjA2MjMwNDM5MX0.UdW4LiIY-t1jZlrat1VUGnW0yRE7YEzW5SHbpkE29H8";

  /* ============================================================
     STAFF PREFIX MAP
     Package name prefix (e.g. "ss_123") → staff display name
     ============================================================ */
  var STAFF_BY_PREFIX = {
    "ss": "مستر سامي",
    "mm": "معتز",
    "oo": "عبد الرحمن",
    "tt": "عبد الله",
    "ww": "وائل",
    "aa": "علي",
    "zz": "ناصر",
    "hh": "محمد",
    "kk": "صبري",
    "jj": "جلال",
    "bb": "بندر"
  };

  /* ============================================================
     LOADING SCREEN (shown while fetching from Supabase)
     ============================================================ */
  function buildLoadingScreen() {
    var div = document.createElement("div");
    div.id = "mgmt_loading_screen";
    div.style.cssText = [
      "position:fixed;inset:0;background:#0e1817",
      "display:flex;flex-direction:column;align-items:center;justify-content:center",
      "z-index:99999;gap:18px;font-family:system-ui,sans-serif"
    ].join(";");
    div.innerHTML =
      "<svg viewBox='0 0 40 40' fill='none' style='width:44px;height:44px;color:#c9a24b'>" +
        "<path d='M20 3 L24 16 L37 20 L24 24 L20 37 L16 24 L3 20 L16 16 Z' stroke='currentColor' stroke-width='1.6' stroke-linejoin='round'/>" +
        "<circle cx='20' cy='20' r='3.4' fill='currentColor'/>" +
      "</svg>" +
      "<p id='mgmt_loading_msg' style='margin:0;font-size:14px;color:#b7c2bc;letter-spacing:0.05em'>جاري تحميل البيانات…</p>" +
      "<div style='width:200px;height:3px;background:rgba(240,235,224,0.08);border-radius:2px;overflow:hidden'>" +
        "<div id='mgmt_progress_fill' style='height:100%;width:0%;background:#c9a24b;transition:width 0.5s ease;border-radius:2px'></div>" +
      "</div>";
    return div;
  }

  function showLoadingScreen() {
    var existing = document.getElementById("mgmt_loading_screen");
    if (existing) return;
    var div = buildLoadingScreen();
    if (document.body) {
      document.body.appendChild(div);
    } else {
      document.addEventListener("DOMContentLoaded", function () {
        document.body.appendChild(div);
      });
    }
    setTimeout(function () { setProgress(15); }, 200);
    setTimeout(function () { setProgress(40); }, 2000);
    setTimeout(function () { setProgress(70); }, 5000);
  }

  function setProgress(pct) {
    var fill = document.getElementById("mgmt_progress_fill");
    if (fill) fill.style.width = pct + "%";
  }

  function hideLoadingScreen() {
    setProgress(100);
    setTimeout(function () {
      var div = document.getElementById("mgmt_loading_screen");
      if (!div) return;
      div.style.transition = "opacity 0.35s";
      div.style.opacity   = "0";
      setTimeout(function () { if (div.parentNode) div.parentNode.removeChild(div); }, 370);
    }, 250);
  }

  function showLoadingError(msg) {
    var div = document.getElementById("mgmt_loading_screen");
    if (!div) {
      div = buildLoadingScreen();
      document.body.appendChild(div);
    }
    div.innerHTML =
      "<div style='max-width:480px;text-align:center;padding:32px;color:#d9645a'>" +
        "<svg viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='1.6' style='width:40px;height:40px;margin-bottom:12px'>" +
          "<circle cx='12' cy='12' r='10'/><line x1='12' y1='8' x2='12' y2='12'/><line x1='12' y1='16' x2='12.01' y2='16'/>" +
        "</svg>" +
        "<p style='font-size:16px;font-weight:600;margin:0 0 8px'>تعذّر تحميل البيانات</p>" +
        "<p style='font-size:13px;color:#b7c2bc;margin:0 0 20px;line-height:1.6'>" + msg + "</p>" +
        "<button onclick='location.reload()' style='padding:9px 22px;background:#c9a24b;border:none;border-radius:6px;cursor:pointer;font-size:13px;color:#0e1817;font-weight:600'>إعادة المحاولة</button>" +
      "</div>";
  }

  /* ============================================================
     RPC FETCH — POST to the server-side extraction function.
     Paginates using the Range header (PostgREST standard).
     Query params on RPC GET requests are treated as function
     arguments, so we use POST + Range instead.
     ============================================================ */
  var RPC_BATCH = 1000;

  function fetchRPC() {
    var allRows = [];

    function fetchPage(start) {
      var end = start + RPC_BATCH - 1;
      return fetch(SUPABASE_URL + "/rest/v1/rpc/mgmt_get_dashboard_data", {
        method: "POST",
        headers: {
          "apikey":        SUPABASE_ANON_KEY,
          "Authorization": "Bearer " + SUPABASE_ANON_KEY,
          "Content-Type":  "application/json",
          "Accept":        "application/json",
          "Range":         start + "-" + end,
          "Prefer":        "count=exact"
        },
        body: "{}"
      }).then(function (r) {
        if (r.status === 404 || r.status === 400) {
          return r.json().catch(function () { return {}; }).then(function (body) {
            var hint = (body && (body.message || body.hint)) ? " (" + (body.message || body.hint) + ")" : "";
            throw new Error(
              "يبدو أن دالة قاعدة البيانات (mgmt_get_dashboard_data) غير موجودة أو غير صحيحة." + hint + " — " +
              "يرجى تشغيل كود SQL الموجود في ملف المُحوّل داخل Supabase SQL Editor أولاً، ثم تأكّد من تنفيذ: GRANT EXECUTE ON FUNCTION public.mgmt_get_dashboard_data() TO anon;"
            );
          });
        }
        if (!r.ok) throw new Error("HTTP " + r.status + " (RPC)");
        var contentRange = r.headers.get("content-range");
        return r.json().then(function (rows) {
          return { rows: rows, contentRange: contentRange };
        });
      }).then(function (result) {
        var rows = result.rows;
        var contentRange = result.contentRange;
        if (!Array.isArray(rows) || rows.length === 0) return allRows;
        allRows = allRows.concat(rows);
        /* Check Content-Range to see if there are more pages */
        if (contentRange) {
          var match = contentRange.match(/\/(\d+)$/);
          if (match && start + rows.length >= parseInt(match[1], 10)) return allRows;
        }
        if (rows.length < RPC_BATCH) return allRows;
        return fetchPage(start + RPC_BATCH);
      });
    }

    return fetchPage(0);
  }

  /* ============================================================
     STAFF PREFIX FALLBACK
     ============================================================ */
  function staffFromPrefix(packageName) {
    if (!packageName) return null;
    var lower = (packageName + "").toLowerCase();
    for (var prefix in STAFF_BY_PREFIX) {
      if (lower.indexOf(prefix) === 0) return STAFF_BY_PREFIX[prefix];
    }
    return null;
  }

  /* ============================================================
     BUILD window.MGMT_DATA from the pre-extracted RPC rows
     Each row: { destination, package_name, package_date,
                 company_name, staff_name, total_price,
                 hotel_name, city, area }
     ============================================================ */
  function buildMgmtData(rows) {
    var companies      = {};
    var staffRegistry  = {};
    var hotelRegistry  = {};
    var quotations     = [];

    var coSeq = 0, stSeq = 0, htSeq = 0, qSeq = 0;
    var asOf = null, rangeStart = null;

    function addCompany(name, dateStr) {
      name = (name || "").trim() || "شركة غير معروفة";
      if (!companies[name]) {
        coSeq++;
        companies[name] = { id: "C" + coSeq, name: name, created: dateStr };
      } else if (dateStr && (!companies[name].created || dateStr < companies[name].created)) {
        companies[name].created = dateStr;
      }
      return companies[name].id;
    }

    function addStaff(name) {
      name = (name || "").trim() || "موظف";
      if (!staffRegistry[name]) {
        stSeq++;
        staffRegistry[name] = { id: "S" + stSeq, name: name, role: "sales" };
      }
      return staffRegistry[name].id;
    }

    function addHotel(name, city, area, country) {
      if (!name) return null;
      name = name.trim();
      if (!hotelRegistry[name]) {
        htSeq++;
        hotelRegistry[name] = {
          id:      "H" + htSeq,
          name:    name,
          city:    (city  || "").trim(),
          area:    (area  || "").trim(),
          country: country || "unknown"
        };
      }
      return hotelRegistry[name].id;
    }

    (rows || []).forEach(function (row) {
      var timestamp = row.package_date;
      if (!timestamp) return;

      var dateStr = (timestamp + "").slice(0, 10);
      var hourNum = parseInt((timestamp + "").slice(11, 13) || "9", 10);

      if (!rangeStart || dateStr < rangeStart) rangeStart = dateStr;
      if (!asOf      || dateStr > asOf)        asOf      = dateStr;

      var destination = row.destination || "indonesia";
      var companyName = (row.company_name || "").trim() || "شركة غير معروفة";
      var staffName   = (row.staff_name   || "").trim()
                     || staffFromPrefix(row.package_name)
                     || "موظف";
      var priceRaw   = (row.total_price || "").replace(/[^0-9.]/g, "");
      var price      = parseFloat(priceRaw) || 0;
      var hotelName  = (row.hotel_name || "").trim() || null;
      var city       = (row.city       || "").trim();
      var area       = (row.area       || "").trim();

      var companyId = addCompany(companyName, dateStr);
      var staffId   = addStaff(staffName);
      var hotelId   = addHotel(hotelName, city, area, destination) || "H_unknown";

      qSeq++;
      var region = city ? (area ? city + " – " + area : city) : "";

      quotations.push({
        id:          "Q-" + qSeq,
        date:        dateStr,
        hour:        isNaN(hourNum) ? 9 : hourNum,
        destination: destination,
        companyId:   companyId,
        staffId:     staffId,
        hotelId:     hotelId,
        city:        city,
        region:      region,
        value:       Math.round(price),
        status:      "approved"
      });
    });

    quotations.sort(function (a, b) {
      return a.date < b.date ? 1 : a.date > b.date ? -1 : 0;
    });

    var today = new Date().toISOString().slice(0, 10);
    asOf       = asOf       || today;
    rangeStart = rangeStart || today;

    if (Object.keys(hotelRegistry).length === 0) {
      hotelRegistry["فندق"] = { id: "H_unknown", name: "فندق", city: "", area: "", country: "indonesia" };
    }
    if (Object.keys(staffRegistry).length === 0) {
      staffRegistry["موظف"] = { id: "S1", name: "موظف", role: "sales" };
    }

    return {
      meta: {
        product:    "سيزون ترافل — لوحة الإدارة",
        currency:   "ر.س",
        asOf:       asOf,
        rangeStart: rangeStart,
        generated:  "بيانات حقيقية من Supabase — قراءة فقط"
      },
      destinations: [
        { id: "indonesia", name: "إندونيسيا" },
        { id: "thailand",  name: "تايلاند"   }
      ],
      companies:  Object.keys(companies).map(function (k) { return companies[k]; }),
      staff:      Object.keys(staffRegistry).map(function (k) { return staffRegistry[k]; }),
      hotels:     Object.keys(hotelRegistry).map(function (k) { return hotelRegistry[k]; }),
      quotations: quotations
    };
  }

  /* ============================================================
     BOOT
     ============================================================ */
  showLoadingScreen();

  fetchRPC().then(function (rows) {
    try {
      window.MGMT_DATA = buildMgmtData(rows);
      hideLoadingScreen();
      document.dispatchEvent(new CustomEvent("mgmt:data-ready"));
    } catch (buildErr) {
      showLoadingError("خطأ في معالجة البيانات: " + buildErr.message);
    }
  }).catch(function (fetchErr) {
    var msg = (fetchErr && fetchErr.message) ? fetchErr.message : String(fetchErr);
    if (msg.indexOf("401") !== -1 || msg.indexOf("403") !== -1) {
      msg = "تأكّد من منح صلاحية EXECUTE للمستخدم anon على الدالة في Supabase. (" + msg + ")";
    }
    showLoadingError(msg);
  });

})();
