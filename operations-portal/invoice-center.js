/* Invoice Center (Phase 6) — one hub, three invoice types, all auto-generated
 * from the Confirmed Booking (+ program JSON) and Transportation File.
 * Employees never create an invoice manually: open a booking → Generate.
 *
 * SALES invoice  = company-facing. Hides driver names + operational costs.
 * OPERATIONS invoice = internal detail (hotels/rooms/nights/prices/flights/
 *   transport/services). Per-line PRICES are not present anywhere in the data
 *   (they live in the protected Pricing Engine), so hotel/flight price cells
 *   are operations-editable and clearly flagged; transport + services pull
 *   from the existing Transportation Invoice.
 * TRANSPORTATION invoice = the existing module (opened via the file).
 *
 * Does NOT modify Travel Book, Transportation Generator, Driver Assignment,
 * Confirmed Booking logic, Pricing, or Program Source — additive layer only.
 */
(function () {
  "use strict";
  var VIEW = "hub", BID = "", BOOKING = null, PROG = null, INV = null, ROLE = "", SEARCH = "", LIB = null, CACHE = {};
  var FILTER_DEST = "all", FILTER_STATUS = "all", FILTER_COMPANY = "all", BLOCK_FINALIZE = false;
  function el(id) { return document.getElementById(id); }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function qp(k) { var m = new RegExp("[?&]" + k + "=([^&]*)").exec(location.search); return m ? decodeURIComponent(m[1]) : ""; }
  function num(v) { var n = parseFloat(v); return isNaN(n) ? 0 : n; }
  function fmt(n) { return (Math.round(n) || 0).toLocaleString("en-US"); }
  function bookings() { return (window.CB_DATA && CB_DATA.bookings) ? CB_DATA.bookings : []; }
  function bookingById(id) { return bookings().filter(function (b) { return b.booking_id === id; })[0] || null; }
  function destAr(d) { return d === "thailand" ? "تايلاند" : d === "indonesia" ? "إندونيسيا" : d === "maldives" ? "المالديف" : (d || "—"); }
  function curOf(b) { return b && b.destination === "thailand" ? "฿" : b && b.destination === "maldives" ? "$" : "Rp"; }
  function money(n, b) { return curOf(b) + " " + fmt(n); }
  function nightsBetween(a, c) { try { var d1 = new Date(a + "T00:00:00"), d2 = new Date(c + "T00:00:00"); var n = Math.round((d2 - d1) / 86400000); return n > 0 ? n : 0; } catch (e) { return 0; } }
  var STATUS_LABEL = { draft: "مسودة · Draft", generated: "مولّدة · Generated", sent: "مُرسلة · Sent", cancelled: "ملغاة · Cancelled" };
  function fetchJSON(u) { return fetch(u).then(function (r) { return r.ok ? r.json() : null; }).catch(function () { return null; }); }

  // ---- program loader (reads the program JSON only; nothing protected is modified) ----
  function loadProgram(booking) {
    var no = booking.program_no || "";
    if (CACHE[booking.booking_id]) return Promise.resolve(CACHE[booking.booking_id]);
    var pP = no ? fetchJSON("travel-book/programs/" + encodeURIComponent(no) + ".json") : Promise.resolve(null);
    return pP.then(function (base) {
      var hotels = (base && base.hotels && base.hotels.length) ? base.hotels.map(function (h) {
        return { name: h.property_name || h.name || "—", room_type: h.room_type || "—", total_room: h.total_room || "", total_nights: h.total_nights || nightsBetween(h.check_in, h.check_out), meal_plan: h.meal_plan || "—", check_in: h.check_in || "", check_out: h.check_out || "" };
      }) : (booking.hotel_name ? [{ name: booking.hotel_name, room_type: "—", total_room: "", total_nights: nightsBetween(booking.check_in, booking.check_out), meal_plan: "—", check_in: booking.check_in || "", check_out: booking.check_out || "" }] : []);
      var flights = (base && base.flights) ? base.flights : { note: "", tickets: [] };
      var transportation = (base && base.transportation && base.transportation.length) ? base.transportation : [];
      var prog = { program_no: no, hotels: hotels, flights: flights, transportation: transportation, customer: (base && base.customer) || null };
      CACHE[booking.booking_id] = prog; return prog;
    });
  }
  function customerOf(booking) { return booking.guest_name || (PROG && PROG.customer && PROG.customer.traveler_name) || booking.company_name || "—"; }
  function transportFile() { return (window.TransportationFileStore && TransportationFileStore.exists(BID)) ? TransportationFileStore.load(BID) : null; }
  function transportInvoice() { return (window.TransportationInvoiceStore && TransportationInvoiceStore.exists(BID)) ? TransportationInvoiceStore.load(BID) : null; }

  // ---- transportation summary (no drivers / no costs) for the sales invoice ----
  function transportLinesNoCost() {
    // Prefer program-level transportation (package description — never carries driver names).
    if (PROG && PROG.transportation && PROG.transportation.length)
      return PROG.transportation.map(function (t) { return { label: t.label || "—", note: t.note || "" }; });
    var tf = transportFile();
    if (tf && tf.movements && tf.movements.length) {
      var TL = { airport_arrival: "استقبال مطار", airport_pickup: "استقبال مطار", airport_departure: "توصيل مطار", airport_dropoff: "توصيل مطار", point_to_point: "نقل", intercity: "نقل بين المدن", internal_flight: "رحلة داخلية", car_with_driver: "سيارة خاصة", tour: "جولة", custom: "حركة" };
      // label + route only (locations) — never the operational note, which may mention a driver.
      return tf.movements.map(function (m) { return { label: (TL[m.type] || m.type) + (m.city ? " — " + m.city : ""), note: (m.from || m.to) ? ((m.from || "—") + " ← " + (m.to || "—")) : "" }; });
    }
    return [];
  }
  function sharedServices() { var ti = transportInvoice(); return (ti && ti.services) ? ti.services : []; }
  // categorize transportation into Arrival / Intercity / Departure / Private transfers (no prices)
  function transferType(label) {
    var l = String(label || "");
    if (/استقبال|وصول|arrival|pickup/i.test(l)) return "وصول · Arrival Transfer";
    if (/توصيل|مغادرة|departure|dropoff/i.test(l)) return "مغادرة · Departure Transfer";
    if (/تنقل|تنقّل|بين المدن|intercity/i.test(l)) return "بين المدن · Intercity Transfer";
    if (/سائق|private|driver/i.test(l)) return "سيارة خاصة · Private Transfer";
    return (l || "نقل · Transfer");
  }
  function salesTransfers() { return transportLinesNoCost().map(function (t) { return { type: transferType(t.label), route: t.note || t.label || "—" }; }); }
  // Hotel supplier price falls back to the operations invoice's per-hotel price (point 2)
  function opsHotelPrice(i) { var op = (window.InvoiceStore && InvoiceStore.load(BID, "operations")); return (op && op.prices && op.prices.hotels) ? num(op.prices.hotels[i]) : 0; }

  // ================= HUB =================
  function invMeta(bid, type) { return (window.InvoiceStore && InvoiceStore.meta(bid, type)) || null; }
  function chip(meta) { if (!meta) return '<span class="ic-chip none">— غير منشأة</span>'; var s = meta.status || "draft"; return '<span class="ic-chip ' + s + '">' + (STATUS_LABEL[s] || s).split(" · ")[0] + "</span>"; }
  function transpChip() { return ""; }
  function hubFlags(bid) {
    return { s: !!invMeta(bid, "sales"), o: !!invMeta(bid, "operations"), h: !!invMeta(bid, "hotel"),
      t: !!(window.TransportationInvoiceStore && TransportationInvoiceStore.exists(bid)) };
  }
  function statusCell(exists, type, bid) {
    return '<button type="button" class="ic-st ' + (exists ? "yes" : "no") + '" data-gen="' + type + '" data-bid="' + esc(bid) + '" title="' + (exists ? "فتح الفاتورة" : "إنشاء الفاتورة") + '">' + (exists ? "✅" : "❌") + "</button>";
  }
  function hubRow(b) {
    var f = hubFlags(b.booking_id), present = (f.s ? 1 : 0) + (f.o ? 1 : 0) + (f.t ? 1 : 0) + (f.h ? 1 : 0);
    var ovCls = present === 4 ? "ic-ov-ok" : present === 0 ? "ic-ov-no" : "ic-ov-part";
    return "<tr><td><b>" + esc(b.booking_id) + "</b></td><td>" + esc(b.company_name || "—") + "</td><td>" + esc(b.guest_name || "—") + "</td><td>" + destAr(b.destination) + "</td>" +
      "<td>" + esc(b.check_in || "—") + "</td><td>" + esc(b.check_out || "—") + "</td>" +
      "<td>" + statusCell(f.s, "sales", b.booking_id) + "</td><td>" + statusCell(f.o, "operations", b.booking_id) + "</td><td>" + statusCell(f.t, "transport", b.booking_id) + "</td><td>" + statusCell(f.h, "hotel", b.booking_id) + "</td>" +
      '<td><span class="ic-ov ' + ovCls + '">' + present + "/4</span></td></tr>";
  }
  function companies() { var set = {}; bookings().forEach(function (b) { if (b.company_name) set[b.company_name] = 1; }); return Object.keys(set).sort(); }
  function hubFilter(b) {
    if (FILTER_DEST !== "all" && b.destination !== FILTER_DEST) return false;
    if (FILTER_COMPANY !== "all" && b.company_name !== FILTER_COMPANY) return false;
    if (FILTER_STATUS !== "all") {
      var f = hubFlags(b.booking_id), present = (f.s ? 1 : 0) + (f.o ? 1 : 0) + (f.t ? 1 : 0) + (f.h ? 1 : 0);
      if (FILTER_STATUS === "ready" && present !== 4) return false;
      if (FILTER_STATUS === "missing" && present === 4) return false;
    }
    return true;
  }
  function hubSummary() {
    var all = bookings(), sc = 0, oc = 0, tc = 0, hc = 0, miss = 0;
    all.forEach(function (b) {
      var f = hubFlags(b.booking_id);
      if (f.s) sc++; if (f.o) oc++; if (f.t) tc++; if (f.h) hc++;
      if ((f.s ? 1 : 0) + (f.o ? 1 : 0) + (f.t ? 1 : 0) + (f.h ? 1 : 0) < 4) miss++;
    });
    function c(n, label, cls) { return '<div class="ic-sum ' + cls + '"><div class="ic-sum-n">' + n + '</div><div class="ic-sum-l">' + label + "</div></div>"; }
    return '<div class="ic-sumgrid">' + c(all.length, "إجمالي الحجوزات", "s-tot") + c(sc, "فواتير المبيعات", "s-sal") + c(oc, "فواتير العمليات", "s-ops") + c(tc, "فواتير المواصلات", "s-trn") + c(hc, "فواتير الفنادق", "s-htl") + c(miss, "فواتير ناقصة", "s-mis") + "</div>";
  }
  function filterBar() {
    function dchip(val, label) { return '<button type="button" class="ic-fchip' + (FILTER_DEST === val ? " on" : "") + '" data-fdest="' + val + '">' + label + "</button>"; }
    function schip(val, label) { return '<button type="button" class="ic-fchip' + (FILTER_STATUS === val ? " on" : "") + '" data-fstat="' + val + '">' + label + "</button>"; }
    var comps = companies().map(function (c) { return '<option value="' + esc(c) + '"' + (FILTER_COMPANY === c ? " selected" : "") + ">" + esc(c) + "</option>"; }).join("");
    return '<div class="ic-filters"><div class="ic-fgrp">' + dchip("all", "الكل") + dchip("indonesia", "إندونيسيا") + dchip("thailand", "تايلند") + dchip("maldives", "المالديف") + "</div>" +
      '<div class="ic-fgrp">' + schip("all", "الكل") + schip("ready", "جاهزة") + schip("missing", "ناقصة") + "</div>" +
      '<select id="icFcomp" class="ic-fsel"><option value="all">كل الشركات</option>' + comps + "</select></div>";
  }
  function renderHub() {
    var q = SEARCH.trim().toLowerCase();
    var rows = bookings().filter(hubFilter).filter(function (b) { return !q || (b.booking_id + " " + (b.company_name || "") + " " + (b.guest_name || "")).toLowerCase().indexOf(q) >= 0; });
    var body = rows.slice(0, 300).map(hubRow).join("");
    el("icRoot").innerHTML =
      '<div class="ic-head"><div><h1>مركز الفواتير · Invoice Center</h1><p class="ic-sub">كل فواتير الحجز في شاشة واحدة — اضغط أي حالة (✅/❌) لفتح الفاتورة مباشرة</p></div></div>' +
      hubSummary() +
      '<div class="ic-toolbar"><input id="icSearch" class="ic-search" placeholder="بحث برقم الحجز / الشركة / العميل" value="' + esc(SEARCH) + '"></div>' +
      filterBar() +
      '<div class="ic-card"><table class="ic-tbl ic-hub"><thead><tr><th>رقم الحجز</th><th>الشركة</th><th>العميل</th><th>الوجهة</th><th>الوصول</th><th>المغادرة</th><th>المبيعات</th><th>العمليات</th><th>المواصلات</th><th>الفنادق</th><th>الحالة</th></tr></thead><tbody>' +
      (body || '<tr><td colspan="11" class="ic-empty">لا نتائج ضمن الفلاتر.</td></tr>') + "</tbody></table></div>";
    if (el("icSearch")) el("icSearch").addEventListener("input", function () { SEARCH = this.value; var s = this.selectionStart; renderHub(); var n = el("icSearch"); if (n) { n.focus(); try { n.setSelectionRange(s, s); } catch (e) {} } });
    Array.prototype.forEach.call(document.querySelectorAll("[data-fdest]"), function (b) { b.addEventListener("click", function () { FILTER_DEST = b.getAttribute("data-fdest"); renderHub(); }); });
    Array.prototype.forEach.call(document.querySelectorAll("[data-fstat]"), function (b) { b.addEventListener("click", function () { FILTER_STATUS = b.getAttribute("data-fstat"); renderHub(); }); });
    if (el("icFcomp")) el("icFcomp").addEventListener("change", function () { FILTER_COMPANY = this.value; renderHub(); });
    Array.prototype.forEach.call(document.querySelectorAll("[data-gen]"), function (btn) {
      btn.addEventListener("click", function () { onGenerate(btn.getAttribute("data-gen"), btn.getAttribute("data-bid")); });
    });
  }
  function onGenerate(type, bid) {
    BID = bid; BOOKING = bookingById(bid);
    if (type === "transport") {
      if (!(window.TransportationFileStore && TransportationFileStore.exists(bid))) { alert("أنشئ ملف المواصلات أولاً ثم ولّد فاتورة المواصلات."); return; }
      try { (window.parent && window.parent !== window ? window.parent : window).postMessage({ type: "open-transport-invoice", bookingId: bid, booking: BOOKING || { booking_id: bid } }, "*"); } catch (e) {}
      return;
    }
    el("icRoot").innerHTML = '<p class="ic-loading">…تحميل بيانات الحجز</p>';
    loadProgram(BOOKING).then(function (prog) { PROG = prog; VIEW = type; loadInvoice(type); renderInvoice(type); });
  }
  function loadInvoice(type) {
    INV = (window.InvoiceStore && InvoiceStore.load(BID, type)) || { booking_id: BID, type: type, status: "draft", prices: { hotels: {}, flights: {} } };
    INV.status = INV.status || "draft"; INV.prices = INV.prices || { hotels: {}, flights: {} };
  }
  function saveInvoice() { if (window.InvoiceStore) InvoiceStore.save(BID, INV.type, INV); setSaved("✓ محفوظ · Saved"); }
  function setInvStatus(s) { INV.status = s; saveInvoice(); renderInvoice(VIEW); }
  function setSaved(t) { if (el("icSaved")) el("icSaved").textContent = t || ""; }

  // ================= INVOICE VIEWS =================
  function statusBar(extra) {
    var s = INV.status, meta = invMeta(BID, INV.type);
    var created = meta && meta.created_at ? new Date(meta.created_at).toLocaleDateString("en-GB") : new Date().toLocaleDateString("en-GB");
    var actions = "";
    if (INV.type === "hotel") {
      if (s === "finalized") actions = '<button type="button" id="icUnlock" class="btn ghost">فتح القفل · Unlock</button>';
      else if (BLOCK_FINALIZE) actions = '<button type="button" class="btn primary" disabled title="أكمل الأسعار الناقصة أولاً">اعتماد · Finalize</button>';
      else actions = '<button type="button" id="icFinalize" class="btn primary">اعتماد · Finalize</button>';
    } else if (s === "draft") actions = '<button type="button" id="icGenBtn" class="btn primary">توليد · Generate</button>';
    else if (s === "generated") actions = '<button type="button" id="icSent" class="btn primary">تعليم كمُرسلة · Sent</button><button type="button" id="icDraft" class="btn ghost">رجوع لمسودة</button>';
    else if (s === "sent") actions = '<button type="button" id="icReopen" class="btn ghost">إعادة فتح</button>';
    else actions = '<button type="button" id="icReopen" class="btn ghost">إعادة فتح</button>';
    var cancel = (s !== "cancelled" && INV.type !== "hotel") ? '<button type="button" id="icCancel" class="btn ghost danger">إلغاء</button>' : "";
    return '<div class="ic-status st-' + s + '"><div><span class="st-pill">' + (STATUS_LABEL[s] || s) + '</span><span class="ic-created">تاريخ الإنشاء: ' + created + '</span></div>' +
      '<div class="st-actions">' + actions + (extra || "") +
      '<button type="button" id="icPrint" class="btn ghost">🖨️ طباعة</button><button type="button" id="icPdf" class="btn ghost">⬇️ PDF</button>' + cancel +
      '<button type="button" id="icSave" class="btn save">حفظ</button><span class="saved-tag" id="icSaved"></span></div></div>';
  }
  function backBar(title) { return '<div class="ic-head"><div><button type="button" id="icBack" class="ic-back">← مركز الفواتير</button><h1>' + title + '</h1><p class="ic-sub">' + esc(BID) + " · " + esc(BOOKING.company_name || "") + "</p></div><span class=\"ic-statemini st-" + INV.status + '">' + (STATUS_LABEL[INV.status] || INV.status).split(" · ")[0] + "</span></div>"; }

  function salesTotals() { return num(BOOKING.booking_value); }
  function renderSales() {
    var hotels = PROG.hotels || [], flights = PROG.flights || {}, transfers = salesTransfers(), services = sharedServices();
    var hotelRows = hotels.length ? hotels.map(function (h, i) { return "<tr><td>" + (i + 1) + "</td><td>" + esc(h.name) + "</td><td>" + esc(h.room_type) + "</td><td>" + (h.total_nights || "—") + "</td><td>" + esc(h.check_in) + " ← " + esc(h.check_out) + "</td></tr>"; }).join("") : '<tr><td colspan="5" class="ic-empty">—</td></tr>';
    var flightLines = (flights.tickets && flights.tickets.length) ? flights.tickets.map(function (t) { return "<li>" + esc(typeof t === "string" ? t : (t.route || t.note || JSON.stringify(t))) + "</li>"; }).join("") : (flights.note ? "<li>" + esc(flights.note) + "</li>" : '<li class="ic-empty">لا طيران داخلي مُسجّل.</li>');
    var transpRows = transfers.length ? transfers.map(function (t) { return '<tr><td><span class="ic-tf">' + esc(t.type) + "</span></td><td>" + esc(t.route) + "</td></tr>"; }).join("") : '<tr><td colspan="2" class="ic-empty">—</td></tr>';
    var svcRows = services.length ? services.map(function (s) { return "<tr><td>" + esc(s.name) + "</td><td>" + num(s.qty) + "</td></tr>"; }).join("") : '<tr><td colspan="2" class="ic-empty">لا خدمات إضافية.</td></tr>';
    el("icRoot").innerHTML = backBar("فاتورة المبيعات · Sales Invoice") + statusBar() + relatedBar() +
      '<div class="ic-note good">فاتورة الشركة — تُرسل للشركة السياحية. لا تظهر أسماء السائقين ولا التكاليف التشغيلية.</div>' +
      '<div class="ic-card"><div class="ic-h">معلومات الفاتورة</div><div class="ic-grid">' +
      kv("رقم الحجز", esc(BID)) + kv("الشركة", esc(BOOKING.company_name || "—")) + kv("العميل", esc(customerOf(BOOKING))) + kv("عدد المسافرين · PAX", esc(String(BOOKING.pax || "—"))) + kv("الوجهة", destAr(BOOKING.destination)) + "</div></div>" +
      '<div class="ic-card"><div class="ic-h">الفنادق</div><table class="ic-tbl"><thead><tr><th>#</th><th>الفندق</th><th>نوع الغرفة</th><th>الليالي</th><th>التواريخ</th></tr></thead><tbody>' + hotelRows + "</tbody></table></div>" +
      '<div class="ic-card"><div class="ic-h">الطيران الداخلي</div><ul class="ic-list">' + flightLines + "</ul></div>" +
      '<div class="ic-card"><div class="ic-h">المواصلات المشمولة · Transfers</div><table class="ic-tbl"><thead><tr><th>نوع النقل</th><th>المسار</th></tr></thead><tbody>' + transpRows + "</tbody></table></div>" +
      '<div class="ic-card"><div class="ic-h">الخدمات الإضافية</div><table class="ic-tbl"><thead><tr><th>الخدمة</th><th>الكمية</th></tr></thead><tbody>' + svcRows + "</tbody></table></div>" +
      '<div class="ic-card ic-grand"><div class="ic-grand-row total"><span>إجمالي الفاتورة · Total</span><b>' + money(salesTotals(), BOOKING) + "</b></div></div>";
    wireInvoice();
  }

  function opsCompute() {
    var hotels = PROG.hotels || [], flights = PROG.flights || {};
    var hp = 0; hotels.forEach(function (h, i) { hp += num(INV.prices.hotels[i]); });
    var ftix = (flights.tickets && flights.tickets.length) ? flights.tickets : (flights.note ? [{ note: flights.note }] : []);
    var fp = 0; ftix.forEach(function (t, i) { fp += num(INV.prices.flights[i]); });
    var ti = transportInvoice();
    var transTotal = 0, svcTotal = 0;
    if (ti) { (ti.movements || []); var costs = ti.costs || {}; Object.keys(costs).forEach(function (k) { transTotal += num(costs[k]); }); (ti.services || []).forEach(function (s) { svcTotal += num(s.qty) * num(s.cost); }); }
    return { hotels: hotels, flights: ftix, hp: hp, fp: fp, transTotal: transTotal, svcTotal: svcTotal, grand: hp + fp + transTotal + svcTotal };
  }
  function renderOperations() {
    var ro = (INV.status === "sent" || INV.status === "cancelled");
    var c = opsCompute(); var ti = transportInvoice();
    var hotelRows = c.hotels.length ? c.hotels.map(function (h, i) {
      var price = ro ? money(num(INV.prices.hotels[i]), BOOKING) : '<input class="ic-price" data-pk="hotels" data-pi="' + i + '" type="number" min="0" step="100000" value="' + (INV.prices.hotels[i] || "") + '" placeholder="0">';
      return "<tr><td>" + esc(h.name) + "</td><td>" + esc(h.room_type) + "</td><td>" + (h.total_room || "—") + "</td><td>" + (h.total_nights || "—") + "</td><td>" + esc(h.meal_plan) + '</td><td class="ic-c">' + price + "</td></tr>";
    }).join("") : '<tr><td colspan="6" class="ic-empty">—</td></tr>';
    var flightRows = c.flights.length ? c.flights.map(function (t, i) {
      var price = ro ? money(num(INV.prices.flights[i]), BOOKING) : '<input class="ic-price" data-pk="flights" data-pi="' + i + '" type="number" min="0" step="100000" value="' + (INV.prices.flights[i] || "") + '" placeholder="0">';
      return "<tr><td>" + esc(typeof t === "string" ? t : (t.route || t.note || "رحلة داخلية")) + '</td><td class="ic-c">' + price + "</td></tr>";
    }).join("") : '<tr><td colspan="2" class="ic-empty">—</td></tr>';
    var transNote = ti ? ("من فاتورة المواصلات — " + money(c.transTotal, BOOKING)) : "لا فاتورة مواصلات — أنشئها لاحتساب المواصلات والخدمات.";
    el("icRoot").innerHTML = backBar("فاتورة العمليات · Operations Detail") + statusBar() + relatedBar() +
      '<div class="ic-note warn">⚠ الأسعار غير متوفّرة في بيانات النظام (مصدرها محرّك التسعير المحمي) — تُدخلها العمليات هنا. الترتيب مبدئي إلى أن تُرفق نسخة الإكسل المعتمدة لمطابقته.</div>' +
      '<div class="ic-card"><div class="ic-h">معلومات</div><div class="ic-grid">' + kv("رقم الحجز", esc(BID)) + kv("الشركة", esc(BOOKING.company_name || "—")) + kv("العميل", esc(customerOf(BOOKING))) + kv("الوجهة", destAr(BOOKING.destination)) + "</div></div>" +
      '<div class="ic-card"><div class="ic-h">الفنادق · الغرف · الليالي · الأسعار</div><table class="ic-tbl"><thead><tr><th>الفندق</th><th>نوع الغرفة</th><th>الغرف</th><th>الليالي</th><th>الإعاشة</th><th>السعر</th></tr></thead><tbody>' + hotelRows + '</tbody></table><div id="icHTot" class="ic-subtot">إجمالي الفنادق: ' + money(c.hp, BOOKING) + "</div></div>" +
      '<div class="ic-card"><div class="ic-h">الطيران الداخلي</div><table class="ic-tbl"><thead><tr><th>الرحلة</th><th>السعر</th></tr></thead><tbody>' + flightRows + '</tbody></table><div id="icFTot" class="ic-subtot">إجمالي الطيران: ' + money(c.fp, BOOKING) + "</div></div>" +
      '<div class="ic-card"><div class="ic-h">المواصلات</div><p class="ic-note small">' + esc(transNote) + "</p></div>" +
      '<div class="ic-card"><div class="ic-h">الخدمات</div><p class="ic-note small">إجمالي الخدمات (من فاتورة المواصلات): ' + money(c.svcTotal, BOOKING) + "</p></div>" +
      '<div class="ic-card ic-grand"><div class="ic-grand-row"><span>الفنادق</span><b id="icGH">' + money(c.hp, BOOKING) + '</b></div><div class="ic-grand-row"><span>الطيران</span><b id="icGF">' + money(c.fp, BOOKING) + '</b></div>' +
      '<div class="ic-grand-row"><span>المواصلات</span><b>' + money(c.transTotal, BOOKING) + '</b></div><div class="ic-grand-row"><span>الخدمات</span><b>' + money(c.svcTotal, BOOKING) + '</b></div>' +
      '<div class="ic-grand-row total"><span>الإجمالي الكلي · Grand Total</span><b id="icGrand">' + money(c.grand, BOOKING) + "</b></div></div>";
    wireInvoice(ro);
  }
  function refreshOps() {
    var c = opsCompute();
    if (el("icHTot")) el("icHTot").textContent = "إجمالي الفنادق: " + money(c.hp, BOOKING);
    if (el("icFTot")) el("icFTot").textContent = "إجمالي الطيران: " + money(c.fp, BOOKING);
    if (el("icGH")) el("icGH").textContent = money(c.hp, BOOKING);
    if (el("icGF")) el("icGF").textContent = money(c.fp, BOOKING);
    if (el("icGrand")) el("icGrand").textContent = money(c.grand, BOOKING);
  }

  // ---- Hotel Supplier Invoice (internal — hotel accounting/settlements) ----
  function hotelCompute() {
    var hotels = PROG.hotels || [];
    var lines = hotels.map(function (h, i) {
      var nights = num(h.total_nights) || 1, rooms = num(h.total_room) || 1;
      var price = num(INV.prices.hotels[i]) || opsHotelPrice(i);  // auto from Operations Invoice
      var missing = !(price > 0);
      return { name: h.name, room_type: h.room_type, nights: nights, rooms: rooms, price: price, missing: missing, total: missing ? 0 : price * nights * rooms };
    });
    return { lines: lines, grand: lines.reduce(function (a, l) { return a + l.total; }, 0) };
  }
  function renderHotel() {
    var ro = (INV.status === "finalized");
    var c = hotelCompute();
    var anyMissing = c.lines.some(function (l) { return l.missing; });
    BLOCK_FINALIZE = anyMissing && !ro;
    var rows = c.lines.length ? c.lines.map(function (l, i) {
      var resolved = num(INV.prices.hotels[i]) || opsHotelPrice(i);
      var price = ro ? (l.missing ? '<span class="ic-missing">Missing Price</span>' : money(l.price, BOOKING)) : '<input class="ic-price" data-pk="hotels" data-pi="' + i + '" type="number" min="0" step="100000" value="' + (resolved || "") + '" placeholder="من فاتورة العمليات">';
      var total = l.missing ? '<span class="ic-missing">Missing Price</span>' : money(l.total, BOOKING);
      return "<tr><td>" + esc(l.name) + "</td><td>" + esc(l.room_type) + "</td><td>" + l.nights + "</td><td>" + l.rooms + '</td><td class="ic-c">' + price + '</td><td class="ic-c" data-htot="' + i + '">' + total + "</td></tr>";
    }).join("") : '<tr><td colspan="6" class="ic-empty">لا فنادق في الحجز.</td></tr>';
    var banner = anyMissing ? '<div class="ic-note danger" id="icHotelBlock">⛔ يوجد أسعار ناقصة تمنع اعتماد الفاتورة — أكمل جميع الأسعار قبل الاعتماد (Finalize).</div>' : "";
    el("icRoot").innerHTML = backBar("فاتورة الفنادق · Hotel Supplier Invoice") + statusBar() + relatedBar() + banner +
      '<div class="ic-note warn">⚠ فاتورة داخلية للمحاسبة والتسويات مع الفنادق فقط — لا تظهر للعميل ولا للشركة. السعر يُجلب تلقائياً من فاتورة العمليات؛ إن لم يوجد يظهر «Missing Price». الإجمالي = السعر/ليلة × الليالي × الغرف.</div>' +
      '<div class="ic-card"><div class="ic-h">معلومات</div><div class="ic-grid">' + kv("رقم الحجز", esc(BID)) + kv("الشركة", esc(BOOKING.company_name || "—")) + kv("العميل", esc(customerOf(BOOKING))) + kv("الوجهة", destAr(BOOKING.destination)) + "</div></div>" +
      '<div class="ic-card"><div class="ic-h">الفنادق</div><table class="ic-tbl"><thead><tr><th>الفندق</th><th>نوع الغرفة</th><th>الليالي</th><th>الغرف</th><th>السعر/ليلة</th><th>الإجمالي</th></tr></thead><tbody>' + rows + "</tbody></table></div>" +
      '<div class="ic-card ic-grand"><div class="ic-grand-row"><span>إجمالي الفنادق</span><b id="icHGrand">' + money(c.grand, BOOKING) + '</b></div><div class="ic-grand-row total"><span>الإجمالي الكلي · Grand Total</span><b id="icHGrand2">' + money(c.grand, BOOKING) + "</b></div></div>";
    wireInvoice(ro);
  }
  function refreshHotel() {
    var c = hotelCompute();
    var anyMissing = c.lines.some(function (l) { return l.missing; });
    if (anyMissing !== BLOCK_FINALIZE) { var foc = document.activeElement; var pk = foc && foc.getAttribute ? foc.getAttribute("data-pi") : null; renderHotel(); if (pk != null) { var n = document.querySelector('.ic-price[data-pi="' + pk + '"]'); if (n) n.focus(); } return; }
    c.lines.forEach(function (l, i) { var cell = document.querySelector('[data-htot="' + i + '"]'); if (cell) cell.innerHTML = l.missing ? '<span class="ic-missing">Missing Price</span>' : money(l.total, BOOKING); });
    if (el("icHGrand")) el("icHGrand").textContent = money(c.grand, BOOKING);
    if (el("icHGrand2")) el("icHGrand2").textContent = money(c.grand, BOOKING);
  }

  // ---- Related Invoices bar (linking) ----
  var REL = [["sales", "المبيعات"], ["operations", "العمليات"], ["transport", "المواصلات"], ["hotel", "الفنادق"]];
  function relatedBar() {
    return '<div class="ic-related"><span class="ic-rel-h">الفواتير المرتبطة · Related:</span>' +
      REL.map(function (r) { var on = (VIEW === r[0]); return '<button type="button" class="ic-rel' + (on ? " on" : "") + '" data-rel="' + r[0] + '">' + r[1] + "</button>"; }).join("") + "</div>";
  }
  function openRelated(type) {
    if (type === VIEW) return;
    if (type === "transport") { if (!(window.TransportationFileStore && TransportationFileStore.exists(BID))) { alert("أنشئ ملف المواصلات أولاً."); return; } onGenerate("transport", BID); return; }
    onGenerate(type, BID);
  }

  function renderInvoice(type) { if (type === "operations") renderOperations(); else if (type === "hotel") renderHotel(); else renderSales(); }
  function kv(k, v) { return '<div class="ic-kv"><span class="ik">' + k + '</span><span class="iv">' + v + "</span></div>"; }

  function wireInvoice(ro) {
    if (el("icBack")) el("icBack").addEventListener("click", function () { VIEW = "hub"; renderHub(); });
    if (el("icSave")) el("icSave").addEventListener("click", saveInvoice);
    if (el("icGenBtn")) el("icGenBtn").addEventListener("click", function () { setInvStatus("generated"); });
    if (el("icSent")) el("icSent").addEventListener("click", function () { setInvStatus("sent"); });
    if (el("icDraft")) el("icDraft").addEventListener("click", function () { setInvStatus("draft"); });
    if (el("icReopen")) el("icReopen").addEventListener("click", function () { setInvStatus("generated"); });
    if (el("icFinalize")) el("icFinalize").addEventListener("click", function () { if (BLOCK_FINALIZE) { alert("يوجد أسعار ناقصة تمنع اعتماد الفاتورة."); return; } setInvStatus("finalized"); });
    if (el("icUnlock")) el("icUnlock").addEventListener("click", function () { setInvStatus("draft"); });
    if (el("icCancel")) el("icCancel").addEventListener("click", function () { if (confirm("إلغاء هذه الفاتورة؟")) setInvStatus("cancelled"); });
    if (el("icPrint")) el("icPrint").addEventListener("click", openPrint);
    if (el("icPdf")) el("icPdf").addEventListener("click", openPrint);
    Array.prototype.forEach.call(document.querySelectorAll("[data-rel]"), function (btn) {
      btn.addEventListener("click", function () { openRelated(btn.getAttribute("data-rel")); });
    });
    if (ro) return;
    Array.prototype.forEach.call(document.querySelectorAll(".ic-price"), function (inp) {
      inp.addEventListener("input", function () { INV.prices[inp.getAttribute("data-pk")][inp.getAttribute("data-pi")] = num(inp.value); setSaved("• غير محفوظ"); if (VIEW === "hotel") refreshHotel(); else refreshOps(); });
    });
  }

  // ================= PDF / PRINT =================
  function docHTML() {
    var sales = INV.type === "sales", hotel = INV.type === "hotel";
    var title = sales ? "فاتورة المبيعات · Sales Invoice" : hotel ? "فاتورة الفنادق · Hotel Supplier Invoice" : "فاتورة العمليات · Operations Detail Invoice";
    var inner = "";
    if (hotel) {
      var hc = hotelCompute();
      inner = '<table><thead><tr><th>الفندق</th><th>نوع الغرفة</th><th>الليالي</th><th>الغرف</th><th>السعر/ليلة</th><th>الإجمالي</th></tr></thead><tbody>' +
        hc.lines.map(function (l) { var pr = l.missing ? "Missing Price" : money(l.price, BOOKING); var tt = l.missing ? "Missing Price" : money(l.total, BOOKING); return "<tr><td>" + esc(l.name) + "</td><td>" + esc(l.room_type) + "</td><td>" + l.nights + "</td><td>" + l.rooms + '</td><td class="r">' + pr + '</td><td class="r">' + tt + "</td></tr>"; }).join("") + "</tbody></table>" +
        '<div class="grand"><div><span>إجمالي الفنادق</span><b>' + money(hc.grand, BOOKING) + '</b></div><div class="tot"><span>الإجمالي الكلي</span><b>' + money(hc.grand, BOOKING) + "</b></div></div>";
    } else if (sales) {
      var hotels = PROG.hotels || [], flights = PROG.flights || {}, transp = transportLinesNoCost(), services = sharedServices();
      inner = '<table><thead><tr><th>#</th><th>الفندق</th><th>نوع الغرفة</th><th>الليالي</th><th>التواريخ</th></tr></thead><tbody>' +
        hotels.map(function (h, i) { return "<tr><td>" + (i + 1) + "</td><td>" + esc(h.name) + "</td><td>" + esc(h.room_type) + "</td><td>" + (h.total_nights || "—") + "</td><td>" + esc(h.check_in) + " ← " + esc(h.check_out) + "</td></tr>"; }).join("") + "</tbody></table>" +
        "<h2>الطيران الداخلي</h2><ul>" + ((flights.tickets && flights.tickets.length) ? flights.tickets.map(function (t) { return "<li>" + esc(typeof t === "string" ? t : (t.route || t.note || "")) + "</li>"; }).join("") : (flights.note ? "<li>" + esc(flights.note) + "</li>" : "<li>—</li>")) + "</ul>" +
        "<h2>المواصلات المشمولة · Transfers</h2><table><tbody>" + (function () { var tf = salesTransfers(); return tf.length ? tf.map(function (t) { return "<tr><td>" + esc(t.type) + "</td><td>" + esc(t.route) + "</td></tr>"; }).join("") : "<tr><td>—</td></tr>"; })() + "</table>" +
        "<h2>الخدمات الإضافية</h2><table><tbody>" + (services.length ? services.map(function (s) { return "<tr><td>" + esc(s.name) + "</td><td>" + num(s.qty) + "</td></tr>"; }).join("") : "<tr><td>—</td></tr>") + "</table>" +
        '<div class="grand"><div class="tot"><span>إجمالي الفاتورة</span><b>' + money(salesTotals(), BOOKING) + "</b></div></div>";
    } else {
      var c = opsCompute();
      inner = '<table><thead><tr><th>الفندق</th><th>الغرفة</th><th>الغرف</th><th>الليالي</th><th>الإعاشة</th><th>السعر</th></tr></thead><tbody>' +
        c.hotels.map(function (h, i) { return "<tr><td>" + esc(h.name) + "</td><td>" + esc(h.room_type) + "</td><td>" + (h.total_room || "—") + "</td><td>" + (h.total_nights || "—") + "</td><td>" + esc(h.meal_plan) + '</td><td class="r">' + money(num(INV.prices.hotels[i]), BOOKING) + "</td></tr>"; }).join("") + "</tbody></table>" +
        "<h2>الطيران الداخلي</h2><table><tbody>" + c.flights.map(function (t, i) { return "<tr><td>" + esc(typeof t === "string" ? t : (t.route || t.note || "رحلة")) + '</td><td class="r">' + money(num(INV.prices.flights[i]), BOOKING) + "</td></tr>"; }).join("") + "</table>" +
        '<div class="grand"><div><span>الفنادق</span><b>' + money(c.hp, BOOKING) + "</b></div><div><span>الطيران</span><b>" + money(c.fp, BOOKING) + "</b></div><div><span>المواصلات</span><b>" + money(c.transTotal, BOOKING) + "</b></div><div><span>الخدمات</span><b>" + money(c.svcTotal, BOOKING) + '</b></div><div class="tot"><span>الإجمالي الكلي</span><b>' + money(c.grand, BOOKING) + "</b></div></div>";
    }
    return '<!DOCTYPE html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><title>' + esc(title) + " " + esc(BID) + '</title><style>' +
      '@page{size:A4;margin:14mm}*{box-sizing:border-box}body{font-family:"Segoe UI",Tahoma,Arial,sans-serif;color:#16233a;margin:0;font-size:10pt}' +
      '.logo{font-size:17pt;font-weight:800;color:#a57c52}.logo small{display:block;font-size:8pt;color:#5b6b85;letter-spacing:2px}' +
      '.top{display:flex;justify-content:space-between;border-bottom:2pt solid #16233a;padding-bottom:3mm;margin-bottom:4mm}.ttl{text-align:left}.ttl h1{font-size:13pt;margin:0}.ttl .badge{border:1px solid #16233a;border-radius:4px;padding:.5mm 2.5mm;font-size:8pt;font-weight:700}' +
      '.grid{display:grid;grid-template-columns:1fr 1fr;gap:.6mm 6mm;font-size:9pt;margin-bottom:4mm}.grid span{color:#5b6b85}' +
      'h2{font-size:10.5pt;border-bottom:1pt solid #16233a;padding-bottom:1mm;margin:4mm 0 1.5mm}table{width:100%;border-collapse:collapse;font-size:8.5pt;margin-bottom:2mm}th,td{border:.5pt solid #b9c2d0;padding:1.3mm 2mm;text-align:right}th{background:#eef2f7}.r{text-align:left}' +
      '.grand{margin-top:4mm;border-top:2pt solid #16233a;padding-top:2mm}.grand div{display:flex;justify-content:space-between;padding:.6mm 0;font-size:10pt}.grand .tot{font-size:12pt;font-weight:800;border-top:1pt solid #b9c2d0;margin-top:1mm;padding-top:1.5mm}' +
      'ul{margin:.5mm 0;padding-inline-start:5mm}.foot{margin-top:6mm;color:#5b6b85;font-size:7.5pt;border-top:.5pt solid #b9c2d0;padding-top:2mm}</style></head><body>' +
      '<div class="top"><div class="logo">سيزون ترافل<small>SEASON TRAVEL</small></div><div class="ttl"><h1>' + esc(title) + '</h1><span class="badge">' + (STATUS_LABEL[INV.status] || INV.status) + "</span></div></div>" +
      '<div class="grid"><div><span>رقم الحجز: </span><b>' + esc(BID) + "</b></div><div><span>الشركة: </span>" + esc(BOOKING.company_name || "—") + "</div><div><span>العميل: </span>" + esc(customerOf(BOOKING)) + "</div><div><span>الوجهة: </span>" + destAr(BOOKING.destination) + "</div><div><span>التواريخ: </span>" + esc(BOOKING.check_in || "—") + " ← " + esc(BOOKING.check_out || "—") + "</div></div>" +
      "<h2>الفنادق</h2>" + inner +
      '<p class="foot">سيزون ترافل · Season Travel — ' + (sales ? "فاتورة مبيعات (للشركة)" : hotel ? "فاتورة فنادق داخلية (محاسبة وتسويات)" : "فاتورة عمليات داخلية") + ". تاريخ الطباعة: " + new Date().toLocaleString("en-GB") + "</p></body></html>";
  }
  function openPrint() {
    var html = docHTML(), w = null;
    try { w = window.open("", "_blank"); } catch (e) { w = null; }
    if (w && w.document) { w.document.open(); w.document.write(html); w.document.close(); setTimeout(function () { try { w.focus(); w.print(); } catch (e) {} }, 350); return; }
    try { var b = new Blob([html], { type: "text/html" }), u = URL.createObjectURL(b), a = document.createElement("a"); a.href = u; a.target = "_blank"; a.rel = "noopener"; document.body.appendChild(a); a.click(); document.body.removeChild(a); setSaved("↗ فُتحت نسخة الطباعة"); } catch (e) { setSaved("تعذّر فتح الطباعة"); }
  }

  // ================= init =================
  function post(t) { try { (window.parent && window.parent !== window ? window.parent : window).postMessage({ type: t }, "*"); } catch (e) {} }
  window.addEventListener("message", function (e) { var d = (e && e.data) || {}; if (d.type === "role" && d.role) ROLE = d.role; if (d.type === "load-booking" && d.role) ROLE = d.role; });
  document.addEventListener("DOMContentLoaded", function () {
    post("request-role");
    var bid = qp("bookingId"), type = qp("type");
    if (bid && (type === "sales" || type === "operations" || type === "hotel")) {
      var bk = bookingById(bid);
      if (bk) { BID = bid; BOOKING = bk; onGenerate(type, bid); return; }
    }
    renderHub();
  });
})();
