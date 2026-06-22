/* =====================================================================
   booking-pipeline-sample-data.js
   Standalone SAMPLE data for the Booking Pipeline prototype.
   Connects the operational lifecycle:
     Quotation → Confirmed → Booking → Final Program → Invoices →
     Destination Guide → Completed.
   Exposes a single global: window.BP_DATA.
   ===================================================================== */

/* =====================================================================
   ▼▼▼  SAMPLE DATA SOURCE  (LAB MODE — no backend)  ▼▼▼
   ---------------------------------------------------------------------
   FUTURE SUPABASE DATA SOURCE (for Bandar):
   Each pipeline record is keyed by booking_id (the main key AFTER a
   quotation is confirmed). Replace `window.BP_DATA.pipeline` with a
   Supabase view that joins the confirmed quotation + booking + the
   operational sub-statuses. Keep the SAME field shape (19 fields).
   DO NOT WRITE IN LAB MODE — read & visualise only; stage transitions
   are simulated, not persisted.
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
  function pick(a) { return a[Math.floor(rng() * a.length)]; }
  function pad(n, w) { return ("000000" + n).slice(-w); }
  var NOW = new Date("2026-06-18T00:00:00");
  function addDays(d, n) { var x = new Date(d); x.setDate(x.getDate() + n); return x; }
  function dkey(d) { return d.toISOString().slice(0, 10); }

  // ---- ordered lifecycle stages (the 9 stages) ----------------------
  var stages = [
    { id: "quotation_created", label: "عرض مُنشأ", n: 1 },
    { id: "quotation_confirmed", label: "عرض مؤكّد", n: 2 },
    { id: "booking_created", label: "حجز مُنشأ", n: 3 },
    { id: "supplier_pending", label: "بانتظار تأكيد المورّد", n: 4 },
    { id: "fully_confirmed", label: "مؤكّد بالكامل", n: 5 },
    { id: "final_program_ready", label: "البرنامج النهائي جاهز", n: 6 },
    { id: "invoice_ready", label: "الفاتورة جاهزة", n: 7 },
    { id: "guide_ready", label: "دليل الوجهة جاهز", n: 8 },
    { id: "completed", label: "مكتمل", n: 9 }
  ];

  var teams = ["الحجوزات", "العمليات", "المالية"];
  var salesEmployees = ["معتز الحربي", "سارة المنصور", "أحمد العتيبي", "نورة القحطاني", "خالد الدوسري"];
  var bookingOfficers = ["ليلى الزهراني", "فهد الشمري", "ريم الغامدي"];
  var destinations = [{ id: "indonesia", name: "إندونيسيا" }, { id: "thailand", name: "تايلاند" }];
  var hotels = {
    indonesia: ["ذا موليا بالي", "فور سيزونز بالي", "أيانا ريزورت بالي", "ذا ريتز كارلتون جاكرتا"],
    thailand: ["فور سيزونز بانكوك", "بانيان تري بانكوك", "ذا سيام بانكوك", "رايافادي كرابي", "أنانتارا بوكيت"]
  };
  var companies = [
    "شركة الأفق للسياحة", "رحلات النخبة", "بوابة آسيا للسفر", "نجمة الشرق للسياحة",
    "مسارات الخليج للسفر", "ديار السفر", "منارة الأسفار", "رحال الخليج", "واحة الرحلات", "ليالي السفر"
  ];

  // next action + responsible team, derived from the active stage
  var STAGE_FLOW = {
    booking_created: { next: "إرسال طلب التأكيد للمورّد", team: "الحجوزات", due: 9 },
    supplier_pending: { next: "متابعة تأكيد المورّد", team: "الحجوزات", due: 5 },
    fully_confirmed: { next: "إعداد البرنامج النهائي", team: "العمليات", due: 6 },
    final_program_ready: { next: "إصدار فاتورة الشركة", team: "المالية", due: 4 },
    invoice_ready: { next: "إعداد دليل الوجهة", team: "العمليات", due: 3 },
    guide_ready: { next: "تسليم العميل وإغلاق الملف", team: "العمليات", due: 2 },
    completed: { next: "—", team: "—", due: 0 }
  };

  // booking records live in stages 3..9 (1–2 happen in the Quotation Status module)
  var activeStageIds = ["booking_created", "supplier_pending", "fully_confirmed", "final_program_ready", "invoice_ready", "guide_ready", "completed"];
  // weight toward the middle of the pipeline
  var stageWeights = { booking_created: 2, supplier_pending: 4, fully_confirmed: 4, final_program_ready: 3, invoice_ready: 2, guide_ready: 2, completed: 3 };
  var stagePool = []; activeStageIds.forEach(function (s) { for (var i = 0; i < stageWeights[s]; i++) stagePool.push(s); });

  function n(id) { return stages.filter(function (s) { return s.id === id; })[0].n; }
  function ready(stageN, threshold) { return stageN >= threshold ? "ready" : "not_ready"; }

  var pipeline = [];
  var N = 60, refSeq = 1500;
  for (var i = 0; i < N; i++) {
    var stage = pick(stagePool), sn = n(stage);
    var dest = pick(destinations);
    var hotel = pick(hotels[dest.id]);
    var created = addDays(NOW, -(5 + Math.floor(rng() * 70)));
    var checkIn = addDays(created, 14 + Math.floor(rng() * 55));
    var checkOut = addDays(checkIn, 3 + Math.floor(rng() * 9));

    var supplier_status = sn <= 4 ? "pending" : "confirmed";
    var payment_status = sn <= 4 ? "unpaid" : sn <= 6 ? "partial" : "paid";
    var booking_status = sn <= 4 ? "pending_supplier" : sn === 9 ? "completed" : "confirmed";
    var flow = STAGE_FLOW[stage];

    // due date — ~28% overdue for active stages
    var due = "";
    if (stage !== "completed") {
      if (rng() < 0.28) due = dkey(addDays(NOW, -(1 + Math.floor(rng() * 9))));   // overdue
      else due = dkey(addDays(NOW, 1 + Math.floor(rng() * flow.due)));
    }

    pipeline.push({
      quotation_id: "Q-" + (3200 + i),
      booking_id: "BK-" + (50001 + i),
      company_name: pick(companies),
      sales_employee: pick(salesEmployees),
      booking_officer: pick(bookingOfficers),
      destination: dest.id,
      hotel_name: hotel,
      check_in: dkey(checkIn),
      check_out: dkey(checkOut),
      booking_status: booking_status,
      supplier_status: supplier_status,
      payment_status: payment_status,
      final_program_status: ready(sn, 6),
      invoice_status: ready(sn, 7),
      destination_guide_status: ready(sn, 8),
      current_stage: stage,
      next_action: flow.next,
      responsible_team: flow.team,
      due_date: due,
      booking_reference: "BR-2026-" + pad(++refSeq, 4)
    });
  }

  window.BP_DATA = {
    meta: {
      product: "سيزون ترافل — مسار الحجوزات",
      currency: "ر.س",
      now: dkey(NOW),
      note: "بيانات تجريبية فقط — غير متصلة بقاعدة بيانات"
    },
    // the documents a confirmed booking later becomes the SOURCE for
    documents: ["البرنامج النهائي", "فاتورة الشركة", "فاتورة النقل", "دليل الوجهة", "تقرير العمليات"],
    stages: stages,
    teams: teams,
    destinations: destinations,
    pipeline: pipeline
  };
})();
