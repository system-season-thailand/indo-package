/* =====================================================================
   voucher-experience-lab.js  — Document Experience Lab
   Visual prototype of future CLIENT documents (previews only).
   Reads window.VLAB_DATA (sample). No PDF, no release, no writes.
   Brand (logo/colors/header) is RESOLVED from the booking — never picked.
   ===================================================================== */
(function () {
  "use strict";

  var D = window.VLAB_DATA || {};
  var BOOKINGS = D.bookings || [], BRANDS = D.brands || {}, HOTELS = D.hotels || {}, DEST = D.destinations || {};
  var state = { bookingId: (BOOKINGS[0] || {}).booking_id, view: "hotel" };

  function el(id) { return document.getElementById(id); }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]; }); }
  var AR = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
  function arNum(x) { return String(x).split("").map(function (d) { return /\d/.test(d) ? AR[+d] : d; }).join(""); }
  function booking() { return BOOKINGS.filter(function (b) { return b.booking_id === state.bookingId; })[0] || BOOKINGS[0]; }
  function brandOf(b) { return BRANDS[b.program_brand_id] || {}; }
  function destOf(id) { return DEST[id] || {}; }
  function names(b) { return (b.travelers || []).map(function (t) { return t.name; }); }

  // ---- icon set (inline SVG, stroke = currentColor) -----------------
  var ICON = {
    plane: "M10.5 13.5 3 12l18-7-7 18-2.5-7.5z",
    car: "M5 11l1.6-4.2h10.8L19 11M4 16h16v-3H4zM7 16v2M17 16v2",
    bed: "M3 7v10M3 12h18v5M21 12v-2a2 2 0 0 0-2-2h-7v4",
    map: "M12 21s7-6.5 7-12a7 7 0 1 0-14 0c0 5.5 7 12 7 12zM12 11a2 2 0 100-4 2 2 0 000 4z",
    sun: "M12 8a4 4 0 100 8 4 4 0 000-8zM12 3v2M12 19v2M3 12h2M19 12h2M6 6l1.4 1.4M16.6 16.6 18 18M18 6l-1.4 1.4M7.4 16.6 6 18",
    info: "M12 16v-5M12 8h.01M12 21a9 9 0 100-18 9 9 0 000 18z",
    compass: "M12 21a9 9 0 100-18 9 9 0 000 18zM15.5 8.5l-2 5-5 2 2-5 5-2z",
    shield: "M12 3l7 3v6c0 4-3 6.5-7 8-4-1.5-7-4-7-8V6l7-3z",
    sim: "M8 3h6l4 4v14H8zM11 13h4v5h-4z",
    cash: "M2 7h20v10H2zM12 9a3 3 0 100 6 3 3 0 000-6z",
    phone: "M5 4h4l2 5-3 2a11 11 0 005 5l2-3 5 2v4a2 2 0 01-2 2A16 16 0 013 6a2 2 0 012-2z",
    clock: "M12 21a9 9 0 100-18 9 9 0 000 18zM12 7v5l3 2"
  };
  function icon(n) { return '<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="' + (ICON[n] || ICON.info) + '"/></svg>'; }

  // ---- scene hero (luxury travel illustration, not a flat block) -----
  function scenery(scene, h) {
    var sun = '<circle cx="312" cy="46" r="26" fill="rgba(255,240,200,0.55)"/><circle cx="312" cy="46" r="14" fill="rgba(255,246,225,0.9)"/>';
    if (scene === "temple") {
      return sun +
        '<path d="M0 ' + (h - 30) + ' H400 V' + h + ' H0 Z" fill="rgba(0,0,0,0.22)"/>' +
        '<path d="M70 ' + (h - 30) + ' l24 -64 24 64 z" fill="rgba(0,0,0,0.32)"/>' +
        '<path d="M150 ' + (h - 30) + ' l34 -92 34 92 z" fill="rgba(0,0,0,0.42)"/>' +
        '<path d="M250 ' + (h - 30) + ' l26 -70 26 70 z" fill="rgba(0,0,0,0.30)"/>' +
        '<path d="M184 ' + (h - 122) + ' l-6 -14 6 -10 6 10 z" fill="rgba(0,0,0,0.42)"/>';
    }
    if (scene === "island") {
      return sun +
        '<path d="M0 ' + (h - 26) + ' Q120 ' + (h - 50) + ' 240 ' + (h - 30) + ' T400 ' + (h - 34) + ' V' + h + ' H0 Z" fill="rgba(0,0,0,0.22)"/>' +
        '<path d="M-10 ' + (h - 34) + ' Q70 ' + (h - 96) + ' 150 ' + (h - 34) + ' Z" fill="rgba(0,0,0,0.40)"/>' +
        '<path d="M150 ' + (h - 34) + ' Q250 ' + (h - 120) + ' 350 ' + (h - 34) + ' Z" fill="rgba(0,0,0,0.32)"/>';
    }
    if (scene === "resort") {
      return sun +
        '<path d="M0 ' + (h - 28) + ' H400 V' + h + ' H0 Z" fill="rgba(0,0,0,0.22)"/>' +
        '<rect x="60" y="' + (h - 86) + '" width="120" height="58" rx="4" fill="rgba(0,0,0,0.34)"/>' +
        '<rect x="200" y="' + (h - 70) + '" width="90" height="42" rx="4" fill="rgba(0,0,0,0.28)"/>' +
        '<path d="M330 ' + (h - 28) + ' v-46 M330 ' + (h - 74) + ' q-16 -4 -26 4 M330 ' + (h - 74) + ' q16 -4 26 4 M330 ' + (h - 74) + ' q-6 -14 4 -22 M330 ' + (h - 74) + ' q6 -14 -4 -22" stroke="rgba(0,0,0,0.45)" stroke-width="3" fill="none"/>';
    }
    // beach (default)
    return sun +
      '<path d="M0 ' + (h - 30) + ' Q100 ' + (h - 46) + ' 200 ' + (h - 32) + ' T400 ' + (h - 36) + ' V' + h + ' H0 Z" fill="rgba(0,0,0,0.20)"/>' +
      '<path d="M0 ' + (h - 16) + ' Q120 ' + (h - 36) + ' 240 ' + (h - 18) + ' T400 ' + (h - 22) + ' V' + h + ' H0 Z" fill="rgba(0,0,0,0.30)"/>' +
      '<path d="M64 ' + (h - 30) + ' v-50 M64 ' + (h - 80) + ' q-20 -6 -32 6 M64 ' + (h - 80) + ' q20 -6 32 6 M64 ' + (h - 80) + ' q-8 -18 6 -28 M64 ' + (h - 80) + ' q8 -18 -6 -28" stroke="rgba(0,0,0,0.42)" stroke-width="3" fill="none"/>';
  }
  function hero(scene, hue, tall) {
    var h = tall ? 210 : 156, br = brandOf(booking());
    var c1 = "hsl(" + hue + ",46%,19%)", c2 = "hsl(" + hue + ",42%,38%)";
    return '<svg class="hero-svg" viewBox="0 0 400 ' + h + '" preserveAspectRatio="xMidYMid slice" role="img" aria-label="travel">' +
      '<defs><linearGradient id="sky' + hue + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + c1 + '"/><stop offset="0.6" stop-color="' + c2 + '"/><stop offset="1" stop-color="' + c1 + '"/></linearGradient>' +
      '<radialGradient id="glow' + hue + '" cx="0.78" cy="0.2" r="0.7"><stop offset="0" stop-color="' + (br.accent || "#4fb3a0") + '" stop-opacity="0.5"/><stop offset="1" stop-color="' + (br.accent || "#4fb3a0") + '" stop-opacity="0"/></radialGradient></defs>' +
      '<rect width="400" height="' + h + '" fill="url(#sky' + hue + ')"/><rect width="400" height="' + h + '" fill="url(#glow' + hue + ')"/>' +
      scenery(scene, h) +
      '<rect width="400" height="' + h + '" fill="url(#fade' + hue + ')"/>' +
      '<defs><linearGradient id="fade' + hue + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0.45" stop-color="rgba(6,13,11,0)"/><stop offset="1" stop-color="rgba(6,13,11,0.55)"/></linearGradient></defs></svg>';
  }
  function logo(tint) { return '<svg viewBox="0 0 40 40" fill="none" class="brand-logo" aria-hidden="true"><path d="M20 3 L24 16 L37 20 L24 24 L20 37 L16 24 L3 20 L16 16 Z" stroke="' + tint + '" stroke-width="1.6" stroke-linejoin="round"/><circle cx="20" cy="20" r="3.4" fill="' + tint + '"/></svg>'; }
  function vHeader(br, kind) { return '<div class="v-head"><div class="vh-brand">' + logo(br.logoTint) + '<div class="vh-text"><span class="vh-name">' + esc(br.name) + '</span><span class="vh-tag">' + esc(br.tag || "") + '</span></div></div><span class="vh-kind">' + kind + "</span></div>"; }
  function field(k, v) { return '<div class="vf"><span class="vf-k">' + k + '</span><span class="vf-v">' + v + "</span></div>"; }
  function iconCard(ic, title, body) { return '<div class="ig-card"><div class="ig-ic">' + icon(ic) + '</div><div class="ig-b"><span class="ig-t">' + title + '</span><span class="ig-d">' + body + "</span></div></div>"; }

  /* ---------- 1 · Hotel Voucher ------------------------------------- */
  function viewHotel() {
    var b = booking(), br = brandOf(b);
    return (b.hotels || []).map(function (h) {
      var lib = HOTELS[h.hotel_id] || {};
      return '<article class="voucher">' + vHeader(br, "قسيمة فندق") + hero(lib.scene || "resort", lib.hue || 168, false) +
        '<div class="v-body"><h3 class="v-title">' + esc(lib.name || "") + '</h3><p class="v-addr">' + icon("map") + esc(lib.address || "") + "</p>" +
        '<div class="v-grid">' +
          field("النزلاء", esc(names(b).join("، "))) +
          field("رقم التأكيد", '<b class="v-conf">' + esc(h.confirmation_number) + "</b>") +
          field("الدخول", esc(h.check_in) + " · " + esc(lib.checkIn || "")) +
          field("الخروج", esc(h.check_out) + " · " + esc(lib.checkOut || "")) +
          field("الليالي", arNum(h.nights)) +
          field("تواصل الفندق", esc(lib.contact || "—")) +
        "</div>" +
        (lib.highlights ? '<div class="v-tags">' + lib.highlights.map(function (x) { return '<span class="v-tag">' + esc(x) + "</span>"; }).join("") + "</div>" : "") +
        '<p class="v-desc">' + esc(lib.description || "") + "</p>" +
        '<div class="v-callout">' + icon("info") + '<span>' + esc(lib.notes || "") + "</span></div>" +
        "</div></article>";
    }).join("");
  }

  /* ---------- 2 · Transportation Voucher (≤10s readability) --------- */
  function viewTransfer() {
    var b = booking(), br = brandOf(b);
    return (b.transfers || []).map(function (t) {
      var dtel = esc((t.driver_contact || "").replace(/\s/g, "")), etel = esc((t.emergency_contact || "").replace(/\s/g, ""));
      return '<article class="voucher">' + vHeader(br, "قسيمة نقل") +
        '<div class="v-body"><div class="tr-hero"><span class="tr-k">' + icon("clock") + 'وقت الانطلاق</span><span class="tr-time">' + esc(t.pickup_datetime) + "</span>" +
        '<span class="tr-loc">' + icon("map") + esc(t.pickup_location) + "</span></div>" +
        '<div class="v-grid two">' + field("النزلاء", esc(names(b).join("، "))) + field("نوع النقل", esc(t.type)) + field("الوجهة", esc(t.dropoff)) + field("المركبة", esc(t.vehicle || "—")) + "</div>" +
        '<div class="v-contacts"><a class="v-call" href="tel:' + dtel + '">' + icon("phone") + '<span class="vc-t"><span class="vc-k">السائق</span><span class="vc-v">' + esc(t.driver_name) + " · " + esc(t.driver_contact) + "</span></span></a>" +
        '<a class="v-call urgent" href="tel:' + etel + '">' + icon("shield") + '<span class="vc-t"><span class="vc-k">طوارئ</span><span class="vc-v">' + esc(t.emergency_contact) + "</span></span></a></div></div></article>";
    }).join("");
  }

  /* ---------- 3 · Flight Information Sheet --------------------------- */
  function viewFlights() {
    var b = booking(), br = brandOf(b);
    return (b.flights || []).map(function (f) {
      return '<article class="voucher flight">' + vHeader(br, f.type === "داخلي" ? "رحلة داخلية" : "رحلة دولية") +
        '<div class="v-body"><div class="fl-route"><div class="fl-pt"><span class="fl-ap">' + esc(f.dep_airport) + '</span><span class="fl-tm">' + esc(f.dep_time) + '</span></div><span class="fl-mid">' + icon("plane") + '<span class="fl-fn">' + esc(f.flight_no) + '</span></span><div class="fl-pt left"><span class="fl-ap">' + esc(f.arr_airport) + '</span><span class="fl-tm">' + esc(f.arr_time) + "</span></div></div>" +
        '<div class="v-grid">' + field("شركة الطيران", esc(f.airline)) + field("رقم الرحلة", esc(f.flight_no)) + field("PNR", '<b class="v-conf">' + esc(f.pnr) + "</b>") + field("النوع", esc(f.type)) + "</div>" +
        '<div class="fl-tix"><span class="fl-tix-h">التذاكر والتذكرة الإلكترونية</span>' +
        (b.travelers || []).map(function (tr) {
          return '<div class="fl-tk"><div class="etk-thumb" data-tk="' + esc(tr.ticket) + '" data-name="' + esc(tr.name) + '" data-flight="' + esc(f.flight_no) + '"><span class="etk-pdf">PDF</span></div>' +
            '<div class="fl-tk-b"><span class="fl-name">' + esc(tr.name) + '</span><span class="fl-no">تذكرة: ' + esc(tr.ticket) + '</span></div>' +
            '<button type="button" class="etk-btn" data-tk="' + esc(tr.ticket) + '" data-name="' + esc(tr.name) + '" data-flight="' + esc(f.flight_no) + '">عرض</button></div>';
        }).join("") + "</div></div></article>";
    }).join("");
  }

  /* ---------- 4 · Destination Guide (redesigned, not a brochure) ---- */
  function viewGuide() {
    var b = booking(), br = brandOf(b), d = destOf(b.destination_id);
    var arr = d.arrival || {};
    var heroBlock = '<div class="g-hero">' + hero(d.scene || "beach", d.hue || 168, true) +
      '<div class="g-hero-ov">' + logo(br.logoTint) + '<span class="g-brand">' + esc(br.name) + '</span><h2 class="g-title">' + esc(d.name || "") + '</h2><p class="g-welcome">' + esc(d.welcome || "") + "</p></div></div>";
    var quick = '<div class="g-quick">' +
      '<a class="gq gq-bad" href="#g-emergency">' + icon("shield") + 'طوارئ</a>' +
      '<a class="gq" href="#g-money">' + icon("cash") + 'العملة</a>' +
      '<a class="gq" href="#g-money">' + icon("sim") + 'الشريحة</a></div>';
    var arrival = '<section class="g-sec"><h4 class="g-h">' + icon("plane") + 'معلومات الوصول</h4><div class="ig-list">' +
      iconCard("plane", "المطار", esc(arr.airport || "")) +
      iconCard("info", "الجوازات", esc(arr.immigration || "")) +
      iconCard("compass", "أول الخطوات", esc(arr.firstSteps || "")) + "</div></section>";
    var money = '<section class="g-sec" id="g-money"><h4 class="g-h">' + icon("cash") + 'الاتصال والعملة</h4><div class="ig-list">' +
      iconCard("sim", "شريحة الاتصال", esc(d.sim || "")) +
      iconCard("cash", "العملة", esc(d.currency || "")) + "</div></section>";
    var around = '<section class="g-sec"><h4 class="g-h">' + icon("compass") + 'التنقّل</h4><div class="ig-list">' +
      iconCard("compass", "وسائل التنقّل", esc(d.transport || "")) +
      iconCard("sun", "الطقس", esc(d.weather || "")) + "</div></section>";
    var emergency = '<section class="g-sec" id="g-emergency"><div class="g-emo">' + icon("shield") + '<div><span class="g-emo-k">أرقام الطوارئ</span><span class="g-emo-v">' + esc(d.emergency || "") + "</span></div></div></section>";
    var recs = '<section class="g-sec"><h4 class="g-h">' + icon("map") + 'توصيات محلية</h4>' +
      '<div class="g-gallery">' + [d.scene, "resort", d.scene].slice(0, 3).map(function (sc) { return '<div class="g-gimg">' + hero(sc || "beach", d.hue || 168, false) + "</div>"; }).join("") + "</div>" +
      '<div class="ig-list">' + (d.localRecs || []).map(function (r) { return iconCard("map", esc(r.n), esc(r.d)); }).join("") + "</div></section>";
    var tips = '<section class="g-sec"><h4 class="g-h">' + icon("info") + 'نصائح سفر مهمة</h4><ul class="g-tips">' + (d.tips || []).map(function (t) { return "<li>" + esc(t) + "</li>"; }).join("") + "</ul>" +
      '<div class="g-cult">' + icon("info") + "<span>ثقافياً: ملاحظات تُحترم محلياً.</span></div></section>";
    return '<div class="guide">' + heroBlock + quick + arrival + money + around + emergency + recs + tips +
      '<p class="pk-foot">دليل عملي — معاينة تجربة فقط، لا توليد فعلي.</p></div>';
  }

  /* ---------- 5 · Final Travel Program (day-by-day) ----------------- */
  function viewProgram() {
    var b = booking(), br = brandOf(b), d = destOf(b.destination_id);
    var cover = '<div class="g-hero">' + hero(d.scene || "beach", d.hue || 168, true) +
      '<div class="g-hero-ov">' + logo(br.logoTint) + '<span class="g-brand">' + esc(br.name) + '</span><h2 class="g-title">برنامج رحلة ' + esc(d.name || "") + '</h2>' +
      '<p class="g-welcome">' + esc(names(b)[0]) + (names(b).length > 1 ? " +" + arNum(names(b).length - 1) : "") + " · " + esc(b.dates.start) + " ← " + esc(b.dates.end) + "</p></div></div>";
    var timeline = '<div class="tl">' + (b.program || []).map(function (p) {
      return '<div class="tl-day"><div class="tl-badge"><span class="tl-d">يوم</span><span class="tl-n">' + esc(p.day) + '</span></div>' +
        '<div class="tl-card"><h4 class="tl-t">' + esc(p.title) + '</h4>' + (p.items || []).map(function (it) {
          return '<div class="tl-it">' + icon(it.i) + "<span>" + esc(it.t) + "</span></div>";
        }).join("") + "</div></div>";
    }).join("") + "</div>";
    return '<div class="program">' + cover + timeline + '<p class="pk-foot">برنامج يوم بيوم — معاينة تجربة فقط.</p></div>';
  }

  /* ---------- brand resolution + render ----------------------------- */
  function applyBrand() {
    var br = brandOf(booking()), dev = el("device");
    dev.style.setProperty("--bp", br.primary || "#2e7d70");
    dev.style.setProperty("--ba", br.accent || "#4fb3a0");
    dev.style.setProperty("--bg1", (br.grad || [])[0] || "#0e2a25");
    dev.style.setProperty("--bg2", (br.grad || [])[1] || "#2e7d70");
    dev.style.setProperty("--blogo", br.logoTint || "#6fe0c8");
    var b = booking();
    el("resolveChip").innerHTML = 'القالب والشعار يُحلّان تلقائياً: <b>' + esc(b.booking_id) + '</b> → <b>' + esc(br.name) + '</b> → <b>' + esc(br.voucher_template_id) + "</b>";
  }
  function renderScreen() {
    var v = state.view;
    el("screen").innerHTML = v === "hotel" ? viewHotel() : v === "transfer" ? viewTransfer() : v === "flights" ? viewFlights() : v === "guide" ? viewGuide() : viewProgram();
    el("screen").scrollTop = 0;
  }
  function renderAll() { applyBrand(); renderScreen(); }

  function openEticket(name, flight, tk) {
    var br = brandOf(booking());
    el("etkModal").innerHTML = '<div class="etk-back" data-close="1"></div><div class="etk-card" role="dialog" aria-modal="true">' + vHeader(br, "تذكرة إلكترونية") +
      '<div class="v-body"><div class="v-grid two">' + field("المسافر", esc(name)) + field("الرحلة", esc(flight)) + field("رقم التذكرة", '<b class="v-conf">' + esc(tk) + "</b>") + field("الحالة", "صادرة") + "</div>" +
      '<div class="etk-bar">||█|‖|█||‖|█|‖||█|‖|█||‖|█||‖|█|‖||</div>' +
      '<p class="v-note">معاينة فقط — لا ملف PDF فعلي في المختبر.</p><button type="button" class="etk-close" data-close="1">إغلاق</button></div></div>';
    el("etkModal").hidden = false; document.body.classList.add("modal-open");
  }
  function closeEtk() { var m = el("etkModal"); if (m) { m.hidden = true; m.innerHTML = ""; } document.body.classList.remove("modal-open"); }

  function wire() {
    el("now").textContent = (D.meta && D.meta.now) || "";
    el("bookingSelect").innerHTML = BOOKINGS.map(function (b) { return '<option value="' + b.booking_id + '">' + esc((BRANDS[b.program_brand_id] || {}).short) + " · " + esc(b.label) + "</option>"; }).join("");
    el("bookingSelect").addEventListener("change", function (e) { state.bookingId = e.target.value; renderAll(); });
    Array.prototype.forEach.call(document.querySelectorAll("[data-view]"), function (btn) {
      btn.addEventListener("click", function () {
        state.view = btn.getAttribute("data-view");
        Array.prototype.forEach.call(document.querySelectorAll("[data-view]"), function (x) { x.classList.toggle("on", x === btn); });
        renderScreen();
      });
    });
    document.addEventListener("click", function (e) {
      if (e.target.closest("[data-close]")) { closeEtk(); return; }
      var t = e.target.closest(".etk-btn, .etk-thumb");
      if (t) openEticket(t.getAttribute("data-name"), t.getAttribute("data-flight"), t.getAttribute("data-tk"));
    });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeEtk(); });
  }
  document.addEventListener("DOMContentLoaded", function () {
    try { wire(); renderAll(); } catch (err) { console.error(err); document.body.insertAdjacentHTML("beforeend", '<pre style="color:#d9645a;padding:16px">خطأ: ' + esc(err.message) + "</pre>"); }
  });
})();
