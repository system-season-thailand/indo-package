/* =====================================================================
   transportation-source.js   (Auto Transportation File — Phase 1)
   Builds a Transportation File by REUSING the confirmed program movements.
   It does NOT ask staff to re-enter anything: it resolves the same program
   the Travel Book uses (via ConfirmedBookingAdapter + ProgramSource.buildBookData)
   and maps its itinerary / transportation / hotels into a movement list.

       buildFile(booking) -> Promise<transportationFile>

   Reuse, not rebuild:
     - ConfirmedBookingAdapter.confirmedBookingToTravelBook()  (existing)
     - ProgramSource.buildBookData()                           (existing, pure)
   Program data is read from the existing travel-book/ location; nothing in
   travel-book/ is modified.

   ▼ FUTURE (Bandar): in production a confirmed booking carries its full
     movements; point PROGRAM_BASE / LIB_URL at the real source (or swap the
     two fetches) and the mapping below is unchanged.
   ===================================================================== */
(function () {
  "use strict";

  var PROGRAM_BASE = "travel-book/programs/";          // root-relative (module lives at root)
  var LIB_URL = "travel-book/destination-library.json";

  // Fixed driver groups for now (per spec) — simple lists, no driver profiles.
  var DRIVER_GROUPS = {
    indonesia: ["كاكا", "أرسنال", "سائق جاكرتا", "سائق بونشاك", "سائق باندونق", "سائق بالي"],
    thailand: ["أنور", "مبارك", "سائق بانكوك", "سائق باتايا", "سائق بوكيت"]
  };
  function groupsFor(destId) { return DRIVER_GROUPS[(destId || "").toLowerCase()] || []; }

  var TYPE_LABEL = {
    airport_arrival: "استقبال المطار · Airport Arrival",
    intercity: "تنقل بين المدن · Intercity Transfer",
    internal_flight: "رحلة داخلية · Internal Flight Transfer",
    tour: "جولة يومية · Daily Tour",
    airport_departure: "توصيل المغادرة · Airport Departure"
  };

  function fetchJSON(url) { return fetch(url).then(function (r) { return r.ok ? r.json() : null; }).catch(function () { return null; }); }

  function deriveMovements(DATA) {
    var it = DATA.itinerary || [];
    var cities = (DATA.cities || []).map(function (c) { return c.name_ar || c.name_en; }).filter(Boolean);
    var dates = (DATA.meta && DATA.meta.dates) || {};
    var trans = (DATA.meta && DATA.meta.transportation) || [];
    function transNote(re) { var m = trans.filter(function (t) { return re.test(t.label || "") || re.test(t.note || ""); })[0]; return m ? (m.note || m.label || "") : ""; }
    var firstCity = (it[0] && it[0].city) || cities[0] || "";
    var lastCity = (it.length && it[it.length - 1].city) || cities[cities.length - 1] || "";

    var movements = [], mid = 0;
    function add(o) { o.id = "M" + (++mid); o.type_label = TYPE_LABEL[o.type] || o.type; o.driver_override = ""; movements.push(o); }

    add({ type: "airport_arrival", date: dates.start || "", city: firstCity, note: transNote(/استقبال|arrival/) });
    var prev = "";
    it.forEach(function (d) {
      var prog = d.program || "";
      var isFlight = /رحلة داخلية|الطيران الداخلي|طيران|flight/.test(prog);
      var changed = prev && d.city && d.city !== prev;
      var type = isFlight ? "internal_flight" : (changed ? "intercity" : "tour");
      add({ type: type, date: d.date || "", city: d.city || "", note: prog });
      if (d.city) prev = d.city;
    });
    add({ type: "airport_departure", date: dates.end || "", city: lastCity, note: transNote(/مغادرة|توصيل المغادرة|departure/) });
    return movements;
  }

  function computeMissing(file) {
    var m = [];
    if (!file.customer_name) m.push("اسم العميل · Customer name");
    if (!file.program_no) m.push("رقم البرنامج · Program number");
    if (!file.dates.start) m.push("تاريخ الوصول · Arrival date");
    if (!file.dates.end) m.push("تاريخ المغادرة · Departure date");
    if (!file.cities.length) m.push("المدن · Cities");
    if (!file.hotels.length) m.push("الفنادق · Hotels");
    if (file.source !== "program") m.push("حركات البرنامج (خط السير) · Program movements");
    var noDate = file.movements.filter(function (x) { return !x.date; }).length;
    var noCity = file.movements.filter(function (x) { return !x.city; }).length;
    if (noDate) m.push("تواريخ حركات ناقصة (" + noDate + ") · Movement dates");
    if (noCity) m.push("مدن حركات ناقصة (" + noCity + ") · Movement cities");
    return m;
  }

  function buildFile(booking) {
    if (!booking) return Promise.resolve(null);
    var no = (window.ConfirmedBookingAdapter && ConfirmedBookingAdapter.programNoFor(booking)) || null;
    var baseP = no ? fetchJSON(PROGRAM_BASE + encodeURIComponent(no) + ".json") : Promise.resolve(null);
    return Promise.all([baseP, fetchJSON(LIB_URL)]).then(function (res) {
      var baseProgram = res[0], lib = res[1] || {};
      var program = window.ConfirmedBookingAdapter
        ? ConfirmedBookingAdapter.confirmedBookingToTravelBook(booking, baseProgram, lib)
        : (baseProgram || {});
      var DATA = window.ProgramSource ? ProgramSource.buildBookData(program, lib) : {};
      var dates = (DATA.meta && DATA.meta.dates) || { start: booking.check_in || "", end: booking.check_out || "" };
      var cities = (DATA.cities || []).map(function (c) { return c.name_ar || c.name_en; }).filter(Boolean);
      var hotels = (DATA.hotels || []).map(function (h) {
        return { name: h.property_name || "", check_in: h.check_in || "", check_out: h.check_out || "", address: h.address || "" };
      });
      var file = {
        booking_id: booking.booking_id || "",
        customer_name: DATA.traveler_name || booking.guest_name || "",
        program_no: (DATA.meta && DATA.meta.program_no) || booking.quotation_id || booking.booking_id || "",
        destination: DATA.country_ar || DATA.country_en || booking.destination || "",
        destination_id: (booking.destination || "").toLowerCase(),
        dates: { start: dates.start || "", end: dates.end || "" },
        cities: cities,
        hotels: hotels,
        movements: deriveMovements(DATA),
        vip: !!(booking.vip || program.vip),
        driver_group: "",
        ready_to_send: false,
        internal_note: "",
        source: baseProgram ? "program" : "inline",
        generated_at: new Date().toISOString()
      };
      file.missing = computeMissing(file);
      return file;
    });
  }

  /* Reminder INDICATORS only (no automation): computed from arrival date. */
  function reminders(file, now) {
    now = now || new Date();
    var start = file && file.dates && file.dates.start ? new Date(file.dates.start + "T00:00:00") : null;
    var days = start ? Math.round((start - now) / 86400000) : null;
    function rule(key, label, within, active) {
      return { key: key, label: label, days_to_arrival: days, active: active, within: within };
    }
    var out = [];
    out.push(rule("missing_items", "رفع العناصر الناقصة قبل الوصول بـ٧ أيام", 7, days != null && days <= 7 && (file.missing || []).length > 0));
    out.push(rule("arrival_prep", "تجهيز الوصول قبل الوصول بيومين", 2, days != null && days <= 2 && days >= 0));
    if ((file.movements || []).some(function (m) { return m.type === "internal_flight"; }))
      out.push(rule("internal_flight", "تذكير الرحلة الداخلية قبل الرحلة بيوم", 1, days != null && days <= 1 && days >= 0));
    return out;
  }

  window.TransportationSource = {
    buildFile: buildFile,
    groupsFor: groupsFor,
    DRIVER_GROUPS: DRIVER_GROUPS,
    TYPE_LABEL: TYPE_LABEL,
    reminders: reminders
  };
})();
