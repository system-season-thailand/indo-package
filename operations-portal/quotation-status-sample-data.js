/* =====================================================================
   quotation-status-sample-data.js
   Standalone SAMPLE data for the Quotation Status Manager prototype.
   NOT connected to any backend. Exposes a single global: window.QS_DATA.
   All values are fictional. Conversion credit always stays with the
   original sales employee; booking staff only execute status changes.
   ===================================================================== */

/* =====================================================================
   ▼▼▼  SAMPLE DATA SOURCE  (LAB MODE)  ▼▼▼
   ---------------------------------------------------------------------
   FUTURE SUPABASE DATA SOURCE (for Bandar):
   Replace `window.QS_DATA.quotations` (generated below) with a Supabase
   query. Required REAL fields per quotation record:
     quotation_id · company_name · sales_employee · destination ·
     created_at · quotation_value · status · status_updated_at ·
     status_updated_by · booking_reference · status_note
   Status writes (confirm / lost / cancelled / note / reference) will
   later need WRITE access — and MUST preserve the original
   sales_employee attribution.
   DO NOT WRITE IN LAB MODE — in the Lab, status changes stay in memory
   only and reset on reload.
   ===================================================================== */
(function () {
  "use strict";

  function mulberry32(a) {
    return function () {
      a |= 0; a = (a + 0x6d2b79f5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  var rng = mulberry32(20260618);
  function pick(arr) { return arr[Math.floor(rng() * arr.length)]; }
  function pad(n, w) { return ("000000" + n).slice(-w); }

  var NOW = new Date("2026-06-18T13:00:00");
  function dkey(d) { return d.toISOString().slice(0, 10); }
  function dtkey(d) { return d.toISOString().slice(0, 16).replace("T", " "); }
  function addDays(d, n) { var x = new Date(d); x.setDate(x.getDate() + n); return x; }

  // ---- Reference lists ------------------------------------------------
  var salesEmployees = [
    { id: "E1", name: "معتز الحربي" },
    { id: "E2", name: "سارة المنصور" },
    { id: "E3", name: "أحمد العتيبي" },
    { id: "E4", name: "نورة القحطاني" },
    { id: "E5", name: "خالد الدوسري" }
  ];
  var bookingStaff = [
    { id: "B1", name: "ليلى الزهراني" },
    { id: "B2", name: "فهد الشمري" }
  ];
  var destinations = [
    { id: "indonesia", name: "إندونيسيا" },
    { id: "thailand", name: "تايلاند" }
  ];
  var companies = [
    "شركة الأفق للسياحة", "رحلات النخبة", "بوابة آسيا للسفر", "نجمة الشرق للسياحة",
    "مسارات الخليج للسفر", "أجنحة بانكوك للسياحة", "ديار السفر", "منارة الأسفار",
    "رحال الخليج", "واحة الرحلات", "سحاب للسياحة والسفر", "ليالي السفر"
  ];

  var confirmNotes = ["تم تأكيد الحجز ودفع العربون.", "العميل أكّد المواعيد والفندق.", "حجز مؤكّد — بانتظار التذاكر.", ""];
  var lostNotes = ["اختار العميل عرضاً منافساً أرخص.", "تجاوز السعر ميزانية العميل.", "لم يردّ العميل بعد عدة محاولات.", ""];
  var cancelNotes = ["ألغى العميل الرحلة لظروف خاصة.", "تغيّرت خطط السفر لدى المجموعة.", "طلب العميل التأجيل لموعد لاحق.", ""];

  // ---- Generate quotations -------------------------------------------
  var quotations = [];
  var N = 64;
  var brSeq = 1000;
  for (var i = 0; i < N; i++) {
    var created = addDays(NOW, -Math.floor(rng() * 76));     // last ~75 days
    created.setHours(8 + Math.floor(rng() * 11), Math.floor(rng() * 60), 0, 0);
    var sales = pick(salesEmployees);
    var dest = pick(destinations);
    var value = (12 + Math.floor(rng() * 46)) * 5000;        // 60k – 290k SAR

    // status mix: quotation 38% · confirmed 34% · lost 16% · cancelled 12%
    var r = rng(), status = "quotation";
    if (r < 0.34) status = "confirmed";
    else if (r < 0.50) status = "lost";
    else if (r < 0.62) status = "cancelled";
    // (else stays "quotation")

    var rec = {
      quotation_id: "Q-" + (2001 + i),
      company_name: pick(companies),
      sales_employee: sales.name,
      sales_employee_id: sales.id,
      destination: dest.id,
      created_at: dtkey(created),
      quotation_value: value,
      status: status,
      status_updated_at: null,
      status_updated_by: null,
      booking_reference: null,
      status_note: null
    };

    if (status !== "quotation") {
      var actor = pick(bookingStaff);
      var upd = addDays(created, 1 + Math.floor(rng() * 9));
      if (upd > NOW) upd = NOW;
      upd.setHours(9 + Math.floor(rng() * 8), Math.floor(rng() * 60), 0, 0);
      rec.status_updated_at = dtkey(upd);
      rec.status_updated_by = actor.name;
      rec.status_updated_by_id = actor.id;
      if (status === "confirmed") {
        rec.booking_reference = "BR-2026-" + pad(++brSeq, 4);
        rec.status_note = pick(confirmNotes);
      } else if (status === "lost") {
        rec.status_note = pick(lostNotes);
      } else {
        rec.status_note = pick(cancelNotes);
      }
    }
    quotations.push(rec);
  }

  // newest first
  quotations.sort(function (a, b) { return a.created_at < b.created_at ? 1 : a.created_at > b.created_at ? -1 : 0; });

  window.QS_DATA = {
    meta: {
      product: "سيزون ترافل — إدارة حالات العروض",
      currency: "ر.س",
      now: dtkey(NOW),
      generated: "بيانات تجريبية فقط — غير متصلة بقاعدة بيانات"
    },
    statuses: [
      { id: "quotation", label: "عرض سعر" },
      { id: "confirmed", label: "مؤكّد" },
      { id: "lost", label: "مفقود" },
      { id: "cancelled", label: "ملغى" }
    ],
    salesEmployees: salesEmployees,
    bookingStaff: bookingStaff,
    destinations: destinations,
    quotations: quotations
  };
})();
