/* =====================================================================
   companies-management-sample-data.js
   Standalone SAMPLE data for the Companies Management (CRM) module.
   Company is the MASTER business entity. Exposes window.CM_DATA.
   ===================================================================== */

/* =====================================================================
   ▼▼▼  SAMPLE DATA SOURCE  (LAB MODE — no backend)  ▼▼▼
   ---------------------------------------------------------------------
   FUTURE SUPABASE DATA SOURCE (for Bandar):
   `company_id` is the MASTER key. Replace window.CM_DATA.companies with
   a Supabase query (companies joined to aggregated quotation/booking
   metrics). Keep the SAME field shape. Every other module links back
   here through company_id (Quotations → Bookings → Invoices → Reports).
   DO NOT WRITE IN LAB MODE — read & analyse only.
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
  function rf(a, b) { return a + rng() * (b - a); }
  function pick(a) { return a[Math.floor(rng() * a.length)]; }
  function clamp(x, a, b) { return Math.max(a, Math.min(b, x)); }
  var NOW = new Date("2026-06-18T00:00:00");
  function addDays(d, n) { var x = new Date(d); x.setDate(x.getDate() + n); return x; }
  function dkey(d) { return d.toISOString().slice(0, 10); }

  var salesEmployees = [
    { id: "E1", name: "معتز الحربي" }, { id: "E2", name: "سارة المنصور" },
    { id: "E3", name: "أحمد العتيبي" }, { id: "E4", name: "نورة القحطاني" },
    { id: "E5", name: "خالد الدوسري" }
  ];
  var places = [
    { country: "السعودية", city: "الرياض" }, { country: "السعودية", city: "جدة" },
    { country: "السعودية", city: "الدمام" }, { country: "السعودية", city: "مكة المكرمة" },
    { country: "الكويت", city: "مدينة الكويت" }, { country: "الإمارات", city: "دبي" },
    { country: "الإمارات", city: "أبوظبي" }, { country: "قطر", city: "الدوحة" },
    { country: "البحرين", city: "المنامة" }
  ];
  var destinations = [{ id: "indonesia", name: "إندونيسيا" }, { id: "thailand", name: "تايلاند" }];
  var hotels = [
    { id: "H1", name: "ذا موليا بالي", brand: "موليا", destination: "indonesia" },
    { id: "H2", name: "فور سيزونز بالي", brand: "فور سيزونز", destination: "indonesia" },
    { id: "H3", name: "أيانا ريزورت بالي", brand: "أيانا", destination: "indonesia" },
    { id: "H4", name: "ذا ريتز كارلتون جاكرتا", brand: "ريتز كارلتون", destination: "indonesia" },
    { id: "H5", name: "فور سيزونز بانكوك", brand: "فور سيزونز", destination: "thailand" },
    { id: "H6", name: "بانيان تري بانكوك", brand: "بانيان تري", destination: "thailand" },
    { id: "H7", name: "ذا سيام بانكوك", brand: "ذا سيام", destination: "thailand" },
    { id: "H8", name: "رايافادي كرابي", brand: "رايافادي", destination: "thailand" },
    { id: "H9", name: "أنانتارا بوكيت", brand: "أنانتارا", destination: "thailand" }
  ];
  var names = [
    "شركة الأفق للسياحة", "رحلات النخبة", "بوابة آسيا للسفر", "نجمة الشرق للسياحة",
    "مسارات الخليج للسفر", "أجنحة بانكوك للسياحة", "ديار السفر", "منارة الأسفار",
    "رحال الخليج", "واحة الرحلات", "سحاب للسياحة والسفر", "ليالي السفر",
    "درب الرحالة", "ربوع آسيا للسياحة", "مرافئ السفر", "طيف الوجهات",
    "قمم السياحة", "بصمة سفر", "تطواف للسياحة", "ميلاد الرحلات",
    "أصداء السفر", "لمسة وجهات", "نورس للسياحة", "عبير الأسفار",
    "مدارات السفر", "شموخ الرحلات"
  ];

  var statuses = [
    { id: "vip", label: "VIP" }, { id: "growing", label: "نامية" }, { id: "active", label: "نشطة" },
    { id: "at_risk", label: "في خطر" }, { id: "inactive", label: "خاملة" }
  ];

  // status profile ranges: [daysSinceQuotation, totalQuotations, conv, growth%, avgValue]
  var PROFILE = {
    vip:      { dq: [1, 18],  q: [50, 92], conv: [0.40, 0.60], g: [15, 45],   av: [130000, 300000] },
    growing:  { dq: [1, 25],  q: [26, 56], conv: [0.30, 0.50], g: [22, 60],   av: [85000, 180000] },
    active:   { dq: [1, 28],  q: [20, 52], conv: [0.25, 0.45], g: [-6, 18],   av: [70000, 160000] },
    at_risk:  { dq: [31, 58], q: [22, 50], conv: [0.10, 0.23], g: [-32, -8],  av: [60000, 140000] },
    inactive: { dq: [64, 165],q: [6, 30],  conv: [0.10, 0.30], g: [-55, -20], av: [50000, 120000] }
  };
  // 26 companies: 3 VIP · 5 Growing · 8 Active · 5 At-Risk · 5 Inactive
  var plan = ["vip","vip","vip","growing","growing","growing","growing","growing",
    "active","active","active","active","active","active","active","active",
    "at_risk","at_risk","at_risk","at_risk","at_risk","inactive","inactive","inactive","inactive","inactive"];

  var notesBy = {
    vip: ["عميل استراتيجي — حجم مرتفع وعلاقة ممتازة.", "أولوية قصوى في المتابعة الشهرية."],
    growing: ["نمو ملحوظ في آخر فترة — فرصة لزيادة الحصة.", "زيادة مطّردة في عدد العروض."],
    active: ["تعامل منتظم ومستقر.", "علاقة جيدة وتحويل ثابت."],
    at_risk: ["انخفاض في التحويل رغم حجم العروض — يحتاج متابعة.", "تراجع في النشاط مؤخراً."],
    inactive: ["لا نشاط منذ فترة طويلة — يحتاج إعادة تنشيط.", "توقّف التعامل — مرشّح للمتابعة العاجلة."]
  };

  var companies = [];
  for (var i = 0; i < names.length; i++) {
    var st = plan[i], pf = PROFILE[st], place = pick(places), emp = pick(salesEmployees);
    var daysQ = ri(pf.dq[0], pf.dq[1]);
    var daysB = daysQ + ri(20, 60);
    var totalQ = ri(pf.q[0], pf.q[1]);
    var conv = +rf(pf.conv[0], pf.conv[1]).toFixed(2);
    var bookings = Math.max(0, Math.round(totalQ * conv));
    var avg = Math.round(rf(pf.av[0], pf.av[1]) / 1000) * 1000;
    var totalValue = bookings * avg;
    var growth = Math.round(rf(pf.g[0], pf.g[1]));
    var dest = rng() < 0.55 ? destinations[0] : destinations[1];
    var destHotels = hotels.filter(function (h) { return h.destination === dest.id; });
    var prefHotels = []; var nh = ri(1, 3);
    var pool = destHotels.slice();
    for (var k = 0; k < nh && pool.length; k++) { var idx = Math.floor(rng() * pool.length); prefHotels.push(pool.splice(idx, 1)[0].name); }
    var score = clamp(Math.round(55 + (30 - daysQ) * 0.5 + conv * 60 + growth * 0.25), 4, 99);

    companies.push({
      company_id: "C-" + (101 + i),
      company_name: names[i],
      country: place.country,
      city: place.city,
      assigned_sales_employee: emp.name,
      assigned_sales_employee_id: emp.id,
      company_status: st,
      registration_date: dkey(addDays(NOW, -ri(220, 1100))),
      last_activity_date: dkey(addDays(NOW, -Math.min(daysQ, daysB))),
      last_quotation_date: dkey(addDays(NOW, -daysQ)),
      last_booking_date: dkey(addDays(NOW, -daysB)),
      days_since_last_quotation: daysQ,
      days_since_last_booking: daysB,
      total_quotations: totalQ,
      confirmed_bookings: bookings,
      conversion_rate: conv,
      total_sales_value: totalValue,
      average_booking_value: avg,
      preferred_destination: dest.id,
      preferred_hotels: prefHotels,
      growth_pct: growth,
      activity_score: score,
      notes: pick(notesBy[st])
    });
  }

  window.CM_DATA = {
    meta: { product: "سيزون ترافل — إدارة الشركات (CRM)", currency: "ر.س", now: dkey(NOW), note: "بيانات تجريبية فقط — غير متصلة بقاعدة بيانات" },
    statuses: statuses,
    salesEmployees: salesEmployees,
    destinations: destinations,
    hotels: hotels,
    companies: companies
  };
})();
