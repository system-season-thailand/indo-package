/* =====================================================================
   operations-workspace-sample-data.js
   Standalone SAMPLE data for the Operations Workspace — the unified
   operational cockpit. One record carries the WHOLE lifecycle so the
   booking team never jumps between modules.
   Exposes a single global: window.OW_DATA.
   ===================================================================== */

/* =====================================================================
   ▼▼▼  SAMPLE DATA SOURCE  (LAB MODE — no backend)  ▼▼▼
   ---------------------------------------------------------------------
   CONSOLIDATION NOTE (for Bandar):
   This is the SINGLE operational record. In production it replaces the
   three separate sample sets (Quotation Status / Confirmed Bookings /
   Booking Pipeline) with ONE source of truth keyed by booking_id
   (and quotation_id before confirmation).
   FUTURE SUPABASE DATA SOURCE: replace window.OW_DATA.records with a
   Supabase view joining quotation + booking + operational sub-statuses.
   DO NOT WRITE IN LAB MODE — read & visualise only.
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
  function ri(a, b) { return a + Math.floor(rng() * (b - a + 1)); }
  function pick(a) { return a[Math.floor(rng() * a.length)]; }
  function pad(n, w) { return ("000000" + n).slice(-w); }
  var NOW = new Date("2026-06-18T00:00:00");
  function addDays(d, n) { var x = new Date(d); x.setDate(x.getDate() + n); return x; }
  function dkey(d) { return d.toISOString().slice(0, 10); }

  var stages = [
    { id: "quotation_created", label: "عرض مُنشأ", n: 1 },
    { id: "quotation_confirmed", label: "عرض مؤكّد", n: 2 },
    { id: "booking_created", label: "حجز مُنشأ", n: 3 },
    { id: "supplier_pending", label: "بانتظار المورّد", n: 4 },
    { id: "fully_confirmed", label: "مؤكّد بالكامل", n: 5 },
    { id: "final_program_ready", label: "البرنامج النهائي جاهز", n: 6 },
    { id: "invoice_ready", label: "الفاتورة جاهزة", n: 7 },
    { id: "guide_ready", label: "دليل الوجهة جاهز", n: 8 },
    { id: "completed", label: "مكتمل", n: 9 }
  ];
  var teams = ["الحجوزات", "العمليات", "المالية"];
  var salesEmployees = [
    { id: "E1", name: "معتز الحربي" }, { id: "E2", name: "سارة المنصور" },
    { id: "E3", name: "أحمد العتيبي" }, { id: "E4", name: "نورة القحطاني" }, { id: "E5", name: "خالد الدوسري" }
  ];
  var bookingOfficers = [
    { id: "O1", name: "ليلى الزهراني" }, { id: "O2", name: "فهد الشمري" }, { id: "O3", name: "ريم الغامدي" }
  ];
  var destinations = [{ id: "indonesia", name: "إندونيسيا" }, { id: "thailand", name: "تايلاند" }];
  var hotelsBy = {
    indonesia: ["فور سيزونز بالي", "ذا موليا بالي", "أيانا ريزورت بالي", "ذا ريتز كارلتون جاكرتا"],
    thailand: ["فور سيزونز بانكوك", "بانيان تري بانكوك", "ذا سيام بانكوك", "رايافادي كرابي", "أنانتارا بوكيت"]
  };
  var companies = [
    "شركة الأفق للسياحة", "رحلات النخبة", "بوابة آسيا للسفر", "نجمة الشرق للسياحة", "مسارات الخليج للسفر",
    "ديار السفر", "منارة الأسفار", "رحال الخليج", "واحة الرحلات", "ليالي السفر", "سحاب للسياحة والسفر", "درب الرحلات"
  ];

  var FLOW = {
    booking_created: { next: "إرسال طلب التأكيد للمورّد", team: "الحجوزات", due: 9 },
    supplier_pending: { next: "متابعة تأكيد المورّد", team: "الحجوزات", due: 5 },
    fully_confirmed: { next: "إعداد البرنامج النهائي", team: "العمليات", due: 6 },
    final_program_ready: { next: "إصدار فاتورة الشركة", team: "المالية", due: 4 },
    invoice_ready: { next: "إعداد دليل الوجهة", team: "العمليات", due: 3 },
    guide_ready: { next: "تسليم العميل وإغلاق الملف", team: "العمليات", due: 2 },
    completed: { next: "—", team: "—", due: 0 }
  };
  var activeIds = ["booking_created", "supplier_pending", "fully_confirmed", "final_program_ready", "invoice_ready", "guide_ready", "completed"];
  var weights = { booking_created: 2, supplier_pending: 4, fully_confirmed: 4, final_program_ready: 3, invoice_ready: 2, guide_ready: 2, completed: 3 };
  var pool = []; activeIds.forEach(function (s) { for (var i = 0; i < weights[s]; i++) pool.push(s); });
  function n(id) { return stages.filter(function (s) { return s.id === id; })[0].n; }
  function ready(sn, th) { return sn >= th ? "ready" : "not_ready"; }

  var records = [], refSeq = 1500;
  var N = 60;
  for (var i = 0; i < N; i++) {
    var stage = pick(pool), sn = n(stage);
    var dest = pick(destinations);
    var hotel = pick(hotelsBy[dest.id]);
    var sales = pick(salesEmployees);
    var officer = pick(bookingOfficers);
    var created = addDays(NOW, -ri(5, 70));

    // check-in: completed → past; active → future, ~18% imminent (≤7 days)
    var checkIn;
    if (stage === "completed") checkIn = addDays(NOW, -ri(5, 30));
    else if (rng() < 0.18) checkIn = addDays(NOW, ri(1, 7));
    else checkIn = addDays(NOW, ri(10, 70));
    var nights = ri(3, 11);
    var checkOut = addDays(checkIn, nights);
    var pax = ri(2, 40);
    var bookingValue = Math.round((nights * ri(700, 2400) * (1 + pax / 14)) / 1000) * 1000;

    var supplier_status = sn <= 4 ? "pending" : "confirmed";
    var payment_status = sn <= 4 ? "unpaid" : sn <= 6 ? "partial" : "paid";
    var booking_status = sn <= 4 ? "pending_supplier" : sn === 9 ? "completed" : "confirmed";
    var flow = FLOW[stage];

    var due = "";
    if (stage !== "completed") {
      if (rng() < 0.28) due = dkey(addDays(NOW, -ri(1, 9)));
      else due = dkey(addDays(NOW, ri(1, flow.due)));
    }

    records.push({
      quotation_id: "Q-" + (3200 + i),
      booking_id: "BK-" + (50001 + i),
      company_name: pick(companies),
      destination: dest.id,
      hotel_name: hotel,
      sales_employee: sales.name,
      sales_employee_id: sales.id,
      booking_officer: officer.name,
      booking_officer_id: officer.id,
      current_stage: stage,
      booking_status: booking_status,
      supplier_status: supplier_status,
      payment_status: payment_status,
      final_program_status: ready(sn, 6),
      invoice_status: ready(sn, 7),
      destination_guide_status: ready(sn, 8),
      check_in: dkey(checkIn),
      check_out: dkey(checkOut),
      pax: pax,
      booking_value: bookingValue,
      next_action: flow.next,
      responsible_team: flow.team,
      due_date: due,
      booking_reference: "BR-2026-" + pad(++refSeq, 4),
      notes: ""
    });
  }

  window.OW_DATA = {
    meta: {
      product: "سيزون ترافل — مساحة العمليات",
      currency: "ر.س",
      now: dkey(NOW),
      note: "بيانات تجريبية فقط — المصدر الموحّد للعمليات"
    },
    documents: ["البرنامج النهائي", "فاتورة الشركة", "فاتورة النقل", "دليل الوجهة"],
    stages: stages,
    teams: teams,
    destinations: destinations,
    salesEmployees: salesEmployees,
    bookingOfficers: bookingOfficers,
    records: records
  };
})();
