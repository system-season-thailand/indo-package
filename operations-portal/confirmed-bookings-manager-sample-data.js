/* =====================================================================
   confirmed-bookings-manager-sample-data.js
   Standalone SAMPLE data for the Confirmed Bookings Manager prototype.
   Business flow:  Quotation → Confirmed → Booking Record.
   Only bookings that originated from a CONFIRMED quotation live here.
   Exposes a single global: window.CB_DATA.
   ===================================================================== */

/* =====================================================================
   ▼▼▼  SAMPLE DATA SOURCE  (LAB MODE — no backend)  ▼▼▼
   ---------------------------------------------------------------------
   FUTURE SUPABASE DATA SOURCE (for Bandar):
   Replace `window.CB_DATA.bookings` (generated below) with a Supabase
   query that returns one row per CONFIRMED quotation that became a
   booking. Keep the EXACT same shape so no module code changes.
   Required REAL fields per booking record:
     booking_id · quotation_id · company_name · sales_employee ·
     booking_officer · destination · hotel_name · check_in · check_out ·
     pax · booking_value · booking_status · booking_reference ·
     created_at · notes
   This module is the future source for: Transportation Invoices,
   Company Invoices, Destination Guides, Operations Reports — so each
   record carries company / destination / hotel / dates / pax / value.
   DO NOT WRITE IN LAB MODE — sample only, resets on reload.
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

  var NOW = new Date("2026-06-18T13:00:00");
  function addDays(d, n) { var x = new Date(d); x.setDate(x.getDate() + n); return x; }
  function dkey(d) { return d.toISOString().slice(0, 10); }
  function dtkey(d) { return d.toISOString().slice(0, 16).replace("T", " "); }

  // ---- reference lists ----------------------------------------------
  var bookingOfficers = [
    { id: "O1", name: "ليلى الزهراني" },
    { id: "O2", name: "فهد الشمري" },
    { id: "O3", name: "ريم الغامدي" }
  ];
  var salesEmployees = [
    { id: "E1", name: "معتز الحربي" }, { id: "E2", name: "سارة المنصور" },
    { id: "E3", name: "أحمد العتيبي" }, { id: "E4", name: "نورة القحطاني" },
    { id: "E5", name: "خالد الدوسري" }
  ];
  var destinations = [
    { id: "indonesia", name: "إندونيسيا" },
    { id: "thailand", name: "تايلاند" }
    // FUTURE: { id:"maldives", name:"المالديف" }, { id:"malaysia", name:"ماليزيا" }, ...
  ];
  var hotels = [
    { id: "H1", name: "ذا موليا بالي", city: "بالي", destination: "indonesia" },
    { id: "H2", name: "فور سيزونز بالي", city: "بالي", destination: "indonesia" },
    { id: "H3", name: "أيانا ريزورت بالي", city: "بالي", destination: "indonesia" },
    { id: "H4", name: "ذا ريتز كارلتون جاكرتا", city: "جاكرتا", destination: "indonesia" },
    { id: "H5", name: "موليا جاكرتا", city: "جاكرتا", destination: "indonesia" },
    { id: "H6", name: "فور سيزونز بانكوك", city: "بانكوك", destination: "thailand" },
    { id: "H7", name: "بانيان تري بانكوك", city: "بانكوك", destination: "thailand" },
    { id: "H8", name: "ذا سيام بانكوك", city: "بانكوك", destination: "thailand" },
    { id: "H9", name: "رايافادي كرابي", city: "كرابي", destination: "thailand" },
    { id: "H10", name: "أنانتارا بوكيت", city: "بوكيت", destination: "thailand" }
  ];
  var companies = [
    "شركة الأفق للسياحة", "رحلات النخبة", "بوابة آسيا للسفر", "نجمة الشرق للسياحة",
    "مسارات الخليج للسفر", "أجنحة بانكوك للسياحة", "ديار السفر", "منارة الأسفار",
    "رحال الخليج", "واحة الرحلات", "سحاب للسياحة والسفر", "ليالي السفر"
  ];
  var statuses = [
    { id: "pending_supplier", label: "بانتظار المورّد" },
    { id: "confirmed", label: "مؤكّد" },
    { id: "partial", label: "مؤكّد جزئياً" },
    { id: "cancelled", label: "ملغى" },
    { id: "completed", label: "مكتمل" }
  ];

  var notesBy = {
    pending_supplier: ["بانتظار تأكيد الفندق.", "أرسلنا الطلب للمورّد.", ""],
    confirmed: ["تأكيد كامل من المورّد.", "كل الخدمات مؤكّدة.", ""],
    partial: ["الفندق مؤكّد والنقل بانتظار التأكيد.", "تأكيد جزئي — بانتظار الطيران.", ""],
    cancelled: ["ألغى العميل الحجز.", "تعذّر توفّر الغرف.", ""],
    completed: ["انتهت الرحلة بنجاح.", "حجز مكتمل ومؤرشف.", ""]
  };

  // weekday weights (0=Sun..6=Sat) → Sun–Wed busiest, Friday lightest
  var DOW_W = [1.1, 1.25, 1.3, 1.25, 1.0, 0.35, 0.8], DOW_MAX = 1.3;
  // business-hours pool (peak late morning → mid afternoon)
  var HW = { 8: 2, 9: 5, 10: 9, 11: 10, 12: 7, 13: 6, 14: 9, 15: 8, 16: 6, 17: 4, 18: 3, 19: 2 };
  var hourPool = []; Object.keys(HW).forEach(function (h) { for (var i = 0; i < HW[h]; i++) hourPool.push(+h); });

  function weightedCreatedDay() {
    for (var tries = 0; tries < 30; tries++) {
      var d = addDays(NOW, -Math.floor(rng() * 76));
      if (rng() <= DOW_W[d.getDay()] / DOW_MAX) return d;
    }
    return addDays(NOW, -Math.floor(rng() * 76));
  }

  // ---- generate bookings --------------------------------------------
  var bookings = [];
  var N = 84, refSeq = 1500, qSeq = 3200;
  for (var i = 0; i < N; i++) {
    var dest = pick(destinations);
    var hotelOpts = hotels.filter(function (h) { return h.destination === dest.id; });
    var hotel = pick(hotelOpts);
    var officer = pick(bookingOfficers);
    var sales = pick(salesEmployees);

    var created = weightedCreatedDay();
    created.setHours(pick(hourPool), Math.floor(rng() * 60), 0, 0);

    var checkIn = addDays(created, 7 + Math.floor(rng() * 60));
    var nights = 3 + Math.floor(rng() * 9);
    var checkOut = addDays(checkIn, nights);
    var pax = 2 + Math.floor(rng() * 38);
    var perNight = 700 + Math.floor(rng() * 1900);
    var bookingValue = Math.round((nights * perNight * (1 + pax / 14)) / 1000) * 1000;

    var r = rng(), status = "confirmed";
    if (r < 0.20) status = "pending_supplier";
    else if (r < 0.62) status = "confirmed";
    else if (r < 0.74) status = "partial";
    else if (r < 0.84) status = "cancelled";
    else status = "completed";

    bookings.push({
      booking_id: "BK-" + (50001 + i),
      quotation_id: "Q-" + (qSeq + i),
      company_name: pick(companies),
      sales_employee: sales.name,
      sales_employee_id: sales.id,
      booking_officer: officer.name,
      booking_officer_id: officer.id,
      destination: dest.id,
      hotel_name: hotel.name,
      hotel_id: hotel.id,
      check_in: dkey(checkIn),
      check_out: dkey(checkOut),
      pax: pax,
      booking_value: bookingValue,
      booking_status: status,
      booking_reference: "BR-2026-" + pad(++refSeq, 4),
      created_at: dtkey(created),
      notes: pick(notesBy[status])
    });
  }
  bookings.sort(function (a, b) { return a.created_at < b.created_at ? 1 : a.created_at > b.created_at ? -1 : 0; });

  /* DS6 — two REAL anchor bookings linked to the existing Travel Book programs.
     A confirmed booking carries `program_no` (its confirmed quotation); the
     Travel Book adapter resolves it to the program snapshot. These are the
     acceptance-test bookings. (Additive — does not alter the generated set.) */
  bookings.unshift(
    {
      booking_id: "BK-IDN-0001", quotation_id: "IDN-Q-2026-00001", program_no: "IDN-Q-2026-00001",
      company_name: "شركة الأفق للسياحة", sales_employee: "معتز الحربي", sales_employee_id: "E1",
      booking_officer: "ليلى الزهراني", booking_officer_id: "O1",
      destination: "indonesia", guest_name: "MR. SAAD ABDULMOHSEN MATAOQ HADAEDI",
      hotel_name: "ذا ريتز كارلتون جاكرتا", hotel_id: "H4",
      check_in: "2026-07-06", check_out: "2026-07-19", pax: 4, booking_value: 86000,
      booking_status: "confirmed", booking_reference: "BR-2026-1801", created_at: "2026-06-18 11:20",
      notes: "تأكيد كامل من المورّد. مرتبط ببرنامج دليل الرحلة IDN-Q-2026-00001."
    },
    {
      booking_id: "BK-THA-0001", quotation_id: "THA-Q-2026-00001", program_no: "THA-Q-2026-00001",
      company_name: "أجنحة بانكوك للسياحة", sales_employee: "سارة المنصور", sales_employee_id: "E2",
      booking_officer: "فهد الشمري", booking_officer_id: "O2",
      destination: "thailand", guest_name: "MR. FAHAD ALI ALQAHTANI",
      hotel_name: "فور سيزونز بانكوك", hotel_id: "H6",
      check_in: "2026-08-05", check_out: "2026-08-15", pax: 2, booking_value: 64000,
      booking_status: "confirmed", booking_reference: "BR-2026-1802", created_at: "2026-06-18 12:05",
      notes: "كل الخدمات مؤكّدة. مرتبط ببرنامج دليل الرحلة THA-Q-2026-00001."
    }
  );

  window.CB_DATA = {
    meta: {
      product: "سيزون ترافل — إدارة الحجوزات المؤكّدة",
      currency: "ر.س",
      now: dtkey(NOW),
      note: "بيانات تجريبية فقط — غير متصلة بقاعدة بيانات"
    },
    statuses: statuses,
    destinations: destinations,
    hotels: hotels,
    companies: companies,
    salesEmployees: salesEmployees,
    bookingOfficers: bookingOfficers,
    bookings: bookings
  };
})();
