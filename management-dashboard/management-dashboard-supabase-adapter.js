/* =====================================================================
   management-dashboard-supabase-adapter.js
   ---------------------------------------------------------------------
   Connects the management dashboard to the real Supabase database.
   Fetches all rows from indo_all_package, parses the stored HTML to
   extract structured data, and builds window.MGMT_DATA in exactly the
   shape expected by management-dashboard.js.

   Read-only — this file never writes, updates, or deletes anything.
   Only SELECT is used. No RLS bypass.
   ===================================================================== */
(function () {
  "use strict";

  var SUPABASE_URL = "https://zrunsrimyijarswjfycw.supabase.co";
  var SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpydW5zcmlteWlqYXJzd2pmeWN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY3MjgzOTEsImV4cCI6MjA2MjMwNDM5MX0.UdW4LiIY-t1jZlrat1VUGnW0yRE7YEzW5SHbpkE29H8";

  /* ── Overlay helpers ────────────────────────────────────────────── */
  function showLoading(msg) {
    var el = document.getElementById("mgmt-loading");
    if (!el) return;
    var t = el.querySelector(".mgmt-loading-text");
    if (t && msg) t.textContent = msg;
    el.removeAttribute("hidden");
  }
  function hideLoading() {
    var el = document.getElementById("mgmt-loading");
    if (el) el.setAttribute("hidden", "");
  }
  function showError(msg) {
    hideLoading();
    var el = document.getElementById("mgmt-load-error");
    if (!el) return;
    var t = el.querySelector(".err-msg");
    if (t) t.textContent = msg;
    el.removeAttribute("hidden");
  }

  /* ── DOM / number helpers ───────────────────────────────────────── */
  var _domParser = new DOMParser();

  function parseHTML(html) {
    return _domParser.parseFromString(html || "", "text/html");
  }

  function getById(doc, id) {
    var el = doc.getElementById(id);
    return el ? el.textContent.trim() : "";
  }

  /* Arabic-Indic → Western digits */
  function toWestern(str) {
    return (str || "").replace(/[٠-٩]/g, function (ch) {
      return ch.charCodeAt(0) - 1632;
    });
  }

  /* Extract the first numeric value from a possibly Arabic-formatted price string */
  function parsePrice(text) {
    if (!text) return 0;
    var n = parseFloat(toWestern(text).replace(/[^\d.]/g, ""));
    return isNaN(n) ? 0 : n;
  }

  function parseIntSafe(text) {
    if (!text) return 0;
    var n = parseInt(toWestern(text).replace(/[^\d]/g, ""), 10);
    return isNaN(n) ? 0 : n;
  }

  /* Convert any parseable date value to YYYY-MM-DD; empty string if not parseable */
  function toDateKey(val) {
    if (!val) return "";
    var d = new Date(val);
    return isNaN(d.getTime()) ? "" : d.toISOString().slice(0, 10);
  }

  /* Try to parse Arabic or mixed date strings like "٢٥ يونيو ٢٠٢٦" */
  function parseArabicDate(str) {
    if (!str) return "";
    // First try direct ISO / RFC parse
    var direct = new Date(str);
    if (!isNaN(direct.getTime())) return direct.toISOString().slice(0, 10);
    // Arabic month map
    var mo = {
      "يناير":"01","فبراير":"02","مارس":"03","أبريل":"04",
      "مايو":"05","يونيو":"06","يوليو":"07","أغسطس":"08",
      "سبتمبر":"09","أكتوبر":"10","نوفمبر":"11","ديسمبر":"12"
    };
    var s = toWestern(str);
    for (var m in mo) {
      if (str.indexOf(m) !== -1) {
        var nums = s.match(/\d+/g) || [];
        var year = (nums.find(function (n) { return n.length === 4; }) || "");
        var day  = (nums.find(function (n) { return n.length <= 2; }) || "01").padStart(2, "0");
        if (year) return year + "-" + mo[m] + "-" + day;
      }
    }
    return "";
  }

  /* ── Parse one row from indo_all_package ────────────────────────── */
  function parseRow(row) {
    var clintDoc = parseHTML(row.downloaded_pdf_clint_data_page);
    var hotelDoc = parseHTML(row.downloaded_pdf_hotel_data_page);
    var pkgDoc   = parseHTML(row.downloaded_pdf_package_including_data_page);

    /* ── Company name (stored inside client-data page) ── */
    var companyName = getById(clintDoc, "store_google_sheet_clint_company_name_value")
                   || "شركة غير محددة";

    /* ── Staff name ──
       Primary  : store_google_sheet_package_user_name_value inside the HTML
       Fallback : extract from package code "StaffName_indo_YY_NNN"              */
    var staffName = getById(clintDoc, "store_google_sheet_package_user_name_value");
    if (!staffName && row.name) {
      var parts = row.name.split("_indo_");
      staffName = parts[0] || "";
    }
    if (!staffName) staffName = "موظف";

    /* ── Quotation date ──
       Use the package creation timestamp (when it was saved to DB)               */
    var date = toDateKey(row.package_indo_user_current_date) || toDateKey(new Date());

    /* ── Pax (passengers) ── */
    var adults  = parseIntSafe(getById(clintDoc, "store_google_sheet_package_adult_amount_value"));
    var kids    = parseIntSafe(getById(clintDoc, "store_google_sheet_package_kids_amount_value"));
    var pax     = Math.max(adults + kids, 1);

    /* ── Nights ── */
    var nights = parseIntSafe(getById(clintDoc, "store_google_sheet_whole_package_total_nights_value"));
    if (nights <= 0) nights = 7;

    /* ── Hotel name & city & area ──
       Hotel data page: each hotel row has h1 (name), h5 (city), h6 (Bali area)
       We use the first hotel found as the representative hotel for this package  */
    var hotelName = "";
    var hotelCity = "";
    var hotelArea = "";
    var h1 = hotelDoc.querySelector("h1");
    if (h1) hotelName = h1.textContent.trim();
    var h5 = hotelDoc.querySelector("h5");
    if (h5) hotelCity = h5.textContent.trim();
    var h6 = hotelDoc.querySelector("h6");
    if (h6) hotelArea = h6.textContent.trim();
    if (!hotelName) hotelName = "فندق غير محدد";
    if (!hotelCity) hotelCity = "إندونيسيا";

    /* ── Total price ──
       Stored in the package-including page as store_google_sheet_package_total_price_value */
    var priceRaw = getById(pkgDoc, "store_google_sheet_package_total_price_value")
                || getById(clintDoc, "store_google_sheet_package_total_price_value");
    var value = parsePrice(priceRaw);

    /* ── Status ── packages with a price are approved; without price = sent */
    var status = value > 0 ? "approved" : "sent";

    return {
      companyName : companyName,
      staffName   : staffName,
      hotelName   : hotelName,
      hotelCity   : hotelCity,
      hotelArea   : hotelArea,
      date        : date,
      nights      : nights,
      pax         : pax,
      value       : value,
      status      : status
    };
  }

  /* ── Build normalized MGMT_DATA from raw Supabase rows ─────────── */
  function buildMgmtData(rows) {
    var companyMap = {};   /* name → { id, name, created } */
    var staffMap   = {};   /* name → { id, name, role }    */
    var hotelMap   = {};   /* name → { id, name, city, area } */
    var quotations = [];

    var cSeq = 0, sSeq = 0, hSeq = 0, qSeq = 0;

    function pad(prefix, n) {
      return prefix + String(n).padStart(2, "0");
    }

    rows.forEach(function (row) {
      var p;
      try { p = parseRow(row); }
      catch (e) {
        console.warn("[adapter] Parse error for row:", row.name, e);
        return;
      }

      /* Register / update company (track earliest-seen date as "created") */
      if (!companyMap[p.companyName]) {
        companyMap[p.companyName] = {
          id: pad("C", ++cSeq), name: p.companyName, created: p.date
        };
      } else if (p.date && p.date < companyMap[p.companyName].created) {
        companyMap[p.companyName].created = p.date;
      }

      /* Register staff */
      if (!staffMap[p.staffName]) {
        staffMap[p.staffName] = {
          id: pad("S", ++sSeq), name: p.staffName, role: "sales"
        };
      }

      /* Register hotel */
      if (!hotelMap[p.hotelName]) {
        hotelMap[p.hotelName] = {
          id: pad("H", ++hSeq),
          name: p.hotelName,
          city: p.hotelCity,
          area: p.hotelArea || p.hotelCity
        };
      }

      /* Build quotation entry */
      var co    = companyMap[p.companyName];
      var staff = staffMap[p.staffName];
      var hotel = hotelMap[p.hotelName];
      var region = p.hotelArea
        ? p.hotelCity + " – " + p.hotelArea
        : p.hotelCity;

      quotations.push({
        id        : "Q-" + (++qSeq),
        date      : p.date,
        companyId : co.id,
        staffId   : staff.id,
        hotelId   : hotel.id,
        city      : p.hotelCity,
        region    : region,
        pax       : p.pax,
        nights    : p.nights,
        value     : p.value,
        status    : p.status
      });
    });

    /* Newest first */
    quotations.sort(function (a, b) {
      return a.date < b.date ? 1 : a.date > b.date ? -1 : 0;
    });

    /* Determine overall date range */
    var today      = new Date().toISOString().slice(0, 10);
    var rangeStart = today;
    quotations.forEach(function (q) {
      if (q.date && q.date < rangeStart) rangeStart = q.date;
    });

    return {
      meta: {
        product    : "سيزون ترافل — لوحة الإدارة",
        currency   : "ر.س",
        asOf       : today,
        rangeStart : rangeStart,
        generated  : "بيانات حقيقية · Supabase · جدول indo_all_package",
        access     : {
          roles          : ["admin", "manager", "sales"],
          dashboardRoles : ["admin", "manager"]
        }
      },
      companies  : Object.values(companyMap),
      staff      : Object.values(staffMap),
      hotels     : Object.values(hotelMap),
      quotations : quotations
    };
  }

  /* ── Dynamically load dashboard.js after data is ready ─────────── */
  function loadDashboard() {
    var s = document.createElement("script");
    s.src = "management-dashboard.js";
    s.onerror = function () {
      showError("تعذّر تحميل ملف management-dashboard.js.");
    };
    document.body.appendChild(s);
  }

  /* ── Main entry point ───────────────────────────────────────────── */
  document.addEventListener("DOMContentLoaded", function () {
    if (!window.supabase) {
      showError("مكتبة Supabase غير محملة. يرجى التحقق من الاتصال بالإنترنت.");
      return;
    }

    showLoading("جارٍ الاتصال بقاعدة البيانات…");

    var sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

    sb.from("indo_all_package")
      .select([
        "name",
        "package_indo_user_current_date",
        "package_indo_last_month_date",
        "downloaded_pdf_clint_data_page",
        "downloaded_pdf_hotel_data_page",
        "downloaded_pdf_package_including_data_page"
      ].join(", "))
      .order("package_indo_user_current_date", { ascending: false })
      .then(function (result) {
        if (result.error) {
          console.error("[adapter] Supabase error:", result.error);
          showError("تعذّر الاتصال بقاعدة البيانات: " + result.error.message);
          return;
        }

        var rows = result.data || [];

        if (rows.length === 0) {
          showError("لا توجد بيانات في جدول indo_all_package حتى الآن.");
          return;
        }

        showLoading("جارٍ معالجة " + rows.length + " حزمة…");

        /* Use setTimeout(0) so the loading text update renders before heavy parsing */
        setTimeout(function () {
          try {
            window.MGMT_DATA = buildMgmtData(rows);
          } catch (e) {
            console.error("[adapter] Build error:", e);
            showError("حدث خطأ أثناء معالجة البيانات: " + e.message);
            return;
          }

          hideLoading();
          loadDashboard();
        }, 0);
      });
  });

})();
