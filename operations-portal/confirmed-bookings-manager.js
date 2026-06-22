/* =====================================================================
   confirmed-bookings-manager.js
   Standalone PROTOTYPE — Confirmed Bookings Manager.
   Reads window.CB_DATA (sample only). No backend, no writes.
   Sections: Executive Summary · Booking List · Officers Performance ·
             Destination Analysis · Daily Workload Analysis.
   ===================================================================== */
(function () {
  "use strict";

  /* =====================================================================
     SAMPLE DATA SOURCE → all reads come from window.CB_DATA.
     FUTURE SUPABASE DATA SOURCE: swap the data file; keep this shape.
     DO NOT WRITE IN LAB MODE — this module only reads & analyses.
     ===================================================================== */
  var D = window.CB_DATA || {};
  var B = (D.bookings || []).slice();
  var CUR = (D.meta && D.meta.currency) || "ر.س";

  var STATUS = {
    pending_supplier: { label: "بانتظار المورّد", cls: "st-warn" },
    confirmed: { label: "مؤكّد", cls: "st-ok" },
    partial: { label: "مؤكّد جزئياً", cls: "st-partial" },
    cancelled: { label: "ملغى", cls: "st-bad" },
    completed: { label: "مكتمل", cls: "st-done" }
  };
  var C = { brass: "#c9a24b", brassSoft: "#e2c57e", jade: "#4fb3a0", jadeDeep: "#2e7d70", warn: "#d9a441", danger: "#d9645a" };

  var state = { q: "", dest: "all", company: "all", officer: "all", status: "all", from: "", to: "", ops: "all", openId: null };

  /* ---------- helpers ----------------------------------------------- */
  function el(id) { return document.getElementById(id); }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]; }); }
  function fmtInt(n) { return Math.round(n).toLocaleString("en-US"); }
  function trim(x) { var v = x >= 10 ? x.toFixed(0) : x.toFixed(1); return v.replace(/\.0$/, ""); }
  function money(n) { var a = Math.abs(n); if (a >= 1e6) return trim(n / 1e6) + " مليون " + CUR; if (a >= 1e3) return trim(n / 1e3) + " ألف " + CUR; return fmtInt(n) + " " + CUR; }
  function pct(x) { return Math.round(x * 100) + "%"; }
  var AR = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
  function arNum(n) { return String(n).split("").map(function (d) { return /\d/.test(d) ? AR[+d] : d; }).join(""); }
  function sum(a, f) { var t = 0; a.forEach(function (x) { t += f(x); }); return t; }
  function destName(id) { var d = (D.destinations || []).filter(function (x) { return x.id === id; })[0]; return d ? d.name : id; }
  function statusChip(s) { var m = STATUS[s] || { label: s, cls: "" }; return '<span class="st-chip ' + m.cls + '">' + m.label + "</span>"; }
  function parseD(s) { return new Date(s.slice(0, 10) + "T00:00:00"); }
  var DOW_AR = ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];
  var MONTH_AR = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];

  /* ---------- chart helpers (hand-rolled SVG, no libs) -------------- */
  function svgEl(s) { var w = document.createElement("div"); w.innerHTML = s.trim(); return w.firstChild; }
  function barChartV(target, items, opts) {
    opts = opts || {};
    var W = 760, H = 200, padB = 30, padT = 12, padX = 6, n = items.length || 1;
    var max = Math.max.apply(null, items.map(function (i) { return i.value; }).concat([1]));
    var gap = n > 40 ? 1 : n > 16 ? 2 : 5, bw = (W - padX * 2 - gap * (n - 1)) / n, plotH = H - padB - padT;
    var every = Math.ceil(n / 9), bars = "", labels = "";
    items.forEach(function (it, i) {
      var h = Math.max(1, (it.value / max) * plotH), x = padX + i * (bw + gap), y = padT + (plotH - h);
      var fill = it.hot ? C.brassSoft : "url(#bg1)";
      bars += '<rect x="' + x.toFixed(1) + '" y="' + y.toFixed(1) + '" width="' + bw.toFixed(1) + '" height="' + h.toFixed(1) + '" rx="' + Math.min(3, bw / 2).toFixed(1) + '" fill="' + fill + '"><title>' + esc(it.full || it.label) + ": " + esc(opts.fmt ? opts.fmt(it.value) : fmtInt(it.value)) + "</title></rect>";
      if (i % every === 0 || i === n - 1) labels += '<text x="' + (x + bw / 2).toFixed(1) + '" y="' + (H - 10) + '" text-anchor="middle" class="ax">' + esc(it.tick || it.label) + "</text>";
    });
    var grid = "";
    for (var g = 1; g <= 3; g++) { var gy = padT + plotH - plotH * g / 4; grid += '<line x1="' + padX + '" x2="' + (W - padX) + '" y1="' + gy.toFixed(1) + '" y2="' + gy.toFixed(1) + '" class="grid"/>'; }
    target.innerHTML = "";
    target.appendChild(svgEl('<svg viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="none" class="chart-svg"><defs><linearGradient id="bg1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + C.brassSoft + '"/><stop offset="1" stop-color="' + C.brass + '" stop-opacity="0.6"/></linearGradient></defs>' + grid + bars + labels + "</svg>"));
  }
  function rankBars(target, items, opts) {
    opts = opts || {};
    var max = Math.max.apply(null, items.map(function (i) { return i.value; }).concat([1])), color = opts.color || C.brass;
    target.innerHTML = '<div class="rank">' + items.map(function (it) {
      var w = (it.value / max) * 100;
      var sub = it.sub ? ' <span class="rank-sub">' + esc(it.sub) + "</span>" : "";
      var val = esc(opts.fmt ? opts.fmt(it.value) : fmtInt(it.value));
      var bar = '<span class="rank-track"><i style="width:' + w.toFixed(1) + "%;background:" + color + ';"></i></span>';
      return '<div class="rank-row"><div class="rank-top"><span class="rank-name">' + esc(it.label) + sub +
        '</span><span class="rank-val">' + val + "</span></div>" + bar + "</div>";
    }).join("") + "</div>";
  }

  /* ---------- 1 · Executive Summary --------------------------------- */
  function renderSummary() {
    var by = {}; B.forEach(function (b) { by[b.booking_status] = (by[b.booking_status] || 0) + 1; });
    var totalVal = sum(B, function (b) { return b.booking_value; });
    var cards = [
      ["إجمالي الحجوزات", arNum(B.length), ""],
      ["مؤكّدة", arNum(by.confirmed || 0), "ok"],
      ["بانتظار المورّد", arNum(by.pending_supplier || 0), "warn"],
      ["مؤكّد جزئياً", arNum(by.partial || 0), "partial"],
      ["مكتملة", arNum(by.completed || 0), "done"],
      ["ملغاة", arNum(by.cancelled || 0), "bad"]
    ];
    el("summaryGrid").innerHTML = cards.map(function (c) {
      return '<div class="kpi ' + (c[2] ? "kpi-" + c[2] : "") + '"><span class="kpi-v">' + c[1] + '</span><span class="kpi-k">' + c[0] + "</span></div>";
    }).join("") + '<div class="kpi kpi-wide"><span class="kpi-v">' + money(totalVal) + '</span><span class="kpi-k">إجمالي قيمة الحجوزات</span></div>';
  }

  /* ---------- 2 · Booking List + filters ---------------------------- */
  /* ---------- Phase 1 · operational visibility (READ-ONLY) -----------
     Derives operational status from BookingOpsStore + TravelBookStore.
     Never writes; never reads/changes booking_status as state — it only
     reflects it; never modifies the booking record. */
  function travelBookStatus(bid) {
    if (!window.TravelBookStore || !TravelBookStore.exists(bid)) return "none";
    var tb = null; try { tb = TravelBookStore.load(bid); } catch (e) { tb = null; }
    var hotels = (tb && tb.hotels) || [];
    var ready = hotels.length > 0 && hotels.every(function (h) { return String(h.confirmation_number || "").trim() !== ""; });
    return ready ? "ready" : "draft";          // saved but incomplete = draft
  }
  function normalizeOps(ops, b) {
    var d = (window.BookingOpsStore && BookingOpsStore.defaults(b)) || {};
    ops = ops || d;
    ops.hotel_confirmations = ops.hotel_confirmations || d.hotel_confirmations || [];
    ops.tickets = ops.tickets || [];
    ops.required_vouchers = ops.required_vouchers || [];
    ops.current_owner = ops.current_owner || d.current_owner || { id: b.booking_officer_id || "", name: b.booking_officer || "" };
    if (typeof ops.has_flights !== "boolean") ops.has_flights = !!d.has_flights;
    if (typeof ops.notes !== "string") ops.notes = "";
    return ops;
  }
  function deriveOps(ops, b) {
    ops = normalizeOps(ops, b);
    var hc = ops.hotel_confirmations;
    var hotelComplete = hc.length > 0 && hc.every(function (h) { return !!h.confirmed; });
    var hasFlights = !!ops.has_flights;
    var tickets = ops.tickets;
    var ticketsComplete = !hasFlights || (tickets.length > 0 && tickets.every(function (t) { return !!t.uploaded; }));
    var rv = ops.required_vouchers;
    var vouchersComplete = rv.length === 0 || rv.every(function (v) { return !!v.attached; });
    var tb = travelBookStatus(b.booking_id);
    var owner = (ops.current_owner && ops.current_owner.name) ? ops.current_owner.name : (b.booking_officer || "—");
    var missing = [];
    if (b.booking_status !== "confirmed") missing.push("الحجز غير مؤكّد");
    if (!hotelComplete) missing.push("تأكيدات الفنادق");
    if (hasFlights && !ticketsComplete) missing.push("التذاكر");
    if (!vouchersComplete) missing.push("الفوشرات");
    if (tb === "none") missing.push("دليل الرحلة");
    return {
      hotel: hotelComplete ? "complete" : "pending",
      tickets: !hasFlights ? "na" : (ticketsComplete ? "complete" : "pending"),
      vouchers: vouchersComplete ? "complete" : "pending",
      travelBook: tb, owner: owner, hasFlights: hasFlights,
      hc: hc, ticketsList: tickets, vouchersList: rv,
      missing: missing, ready: missing.length === 0
    };
  }
  function opsState(b) {
    var ops = (window.BookingOpsStore && (BookingOpsStore.load(b.booking_id) || BookingOpsStore.defaults(b))) || null;
    return deriveOps(ops, b);
  }
  function pillCls(s) {
    return (s === "complete" || s === "ready") ? "p-ok" : (s === "draft") ? "p-draft" : (s === "na") ? "p-na" : "p-warn";
  }
  function opsCell(s) {
    var ready = s.ready ? '<span class="op-ready ok">جاهز للإرسال</span>' : '<span class="op-ready warn">عناصر ناقصة</span>';
    var tbState = s.travelBook, tbLbl = tbState === "ready" ? "الدليل ✓" : tbState === "draft" ? "الدليل ◐" : "الدليل ✕";
    var mini =
      '<span class="op-pill ' + pillCls(s.hotel) + '">فندق</span>' +
      '<span class="op-pill ' + pillCls(s.tickets) + '">' + (s.tickets === "na" ? "تذاكر —" : "تذاكر") + '</span>' +
      '<span class="op-pill ' + pillCls(s.vouchers) + '">فوشرات</span>' +
      '<span class="op-pill ' + pillCls(tbState) + '">' + tbLbl + '</span>';
    return '<div class="op-cell">' + ready + '<div class="op-mini">' + mini + '</div></div>';
  }

  function applyFilters() {
    var term = state.q.trim();
    return B.filter(function (b) {
      if (state.dest !== "all" && b.destination !== state.dest) return false;
      if (state.company !== "all" && b.company_name !== state.company) return false;
      if (state.officer !== "all" && b.booking_officer_id !== state.officer) return false;
      if (state.status !== "all" && b.booking_status !== state.status) return false;
      if (state.from && b.created_at.slice(0, 10) < state.from) return false;
      if (state.to && b.created_at.slice(0, 10) > state.to) return false;
      if (term && (b.booking_id + " " + b.quotation_id + " " + b.company_name + " " + b.hotel_name + " " + b.sales_employee).indexOf(term) === -1) return false;
      if (state.ops !== "all") {
        var s = opsState(b);
        if (state.ops === "ready" && !s.ready) return false;
        if (state.ops === "miss_hotel" && s.hotel !== "pending") return false;
        if (state.ops === "miss_tickets" && s.tickets !== "pending") return false;
        if (state.ops === "miss_vouchers" && s.vouchers !== "pending") return false;
        if (state.ops === "miss_tb" && s.travelBook !== "none") return false;
      }
      return true;
    });
  }
  function renderList() {
    var rows = applyFilters();
    var body = rows.map(function (b) {
      return '<tr class="clickable" data-bid="' + esc(b.booking_id) + '">' +
        "<td>" + esc(b.booking_id) + "</td>" +
        '<td class="name">' + esc(b.company_name) + "</td>" +
        "<td>" + esc(destName(b.destination)) + "</td>" +
        "<td>" + esc(b.hotel_name) + "</td>" +
        "<td>" + esc(b.check_in) + " ← " + esc(b.check_out) + "</td>" +
        "<td>" + arNum(b.pax) + "</td>" +
        "<td>" + money(b.booking_value) + "</td>" +
        "<td>" + esc(b.booking_officer) + "</td>" +
        "<td>" + statusChip(b.booking_status) + "</td>" +
        "<td>" + opsCell(opsState(b)) + "</td>" +
        '<td class="act-cell"><button type="button" class="mk-book sm" data-makebook="' + esc(b.booking_id) + '" title="إنشاء دليل الرحلة">دليل الرحلة</button>' +
        '<button type="button" class="mk-trans sm" data-maketransport="' + esc(b.booking_id) + '" title="إنشاء ملف المواصلات">المواصلات</button></td></tr>';
    }).join("");
    el("listTable").innerHTML = rows.length
      ? '<div class="table-scroll"><table class="tbl"><thead><tr><th>رقم الحجز</th><th>الشركة</th><th>الوجهة</th><th>الفندق</th><th>الدخول ← الخروج</th><th>المسافرون</th><th>القيمة</th><th>موظف الحجز</th><th>الحالة</th><th>الحالة التشغيلية</th><th>إجراءات</th></tr></thead><tbody>' + body + "</tbody></table></div>"
      : '<p class="empty">لا توجد حجوزات مطابقة للفلاتر.</p>';
    el("listCount").textContent = arNum(rows.length) + " حجز";
  }

  /* ---------- 3 · Booking Officers Performance ---------------------- */
  function renderOfficers() {
    var map = {};
    (D.bookingOfficers || []).forEach(function (o) { map[o.id] = { name: o.name, total: 0, confirmed: 0, cancelled: 0, value: 0 }; });
    B.forEach(function (b) {
      var m = map[b.booking_officer_id]; if (!m) return;
      m.total++;
      if (b.booking_status === "confirmed" || b.booking_status === "completed") m.confirmed++;
      if (b.booking_status === "cancelled") m.cancelled++;
      if (b.booking_status !== "cancelled") m.value += b.booking_value;
    });
    var rows = Object.keys(map).map(function (k) { return map[k]; }).sort(function (a, b) { return b.total - a.total; });
    var body = rows.map(function (m) {
      var crate = m.total ? m.cancelled / m.total : 0;
      return "<tr><td class='name'>" + esc(m.name) + "</td><td>" + arNum(m.total) + "</td><td>" + arNum(m.confirmed) +
        "</td><td>" + '<span class="' + (crate > 0.15 ? "rate-bad" : "rate-ok") + '">' + pct(crate) + "</span></td><td>" + money(m.value) + "</td></tr>";
    }).join("");
    el("officersTable").innerHTML = '<div class="table-scroll"><table class="tbl"><thead><tr><th>موظف الحجوزات</th><th>إجمالي الحجوزات</th><th>المؤكّدة/المكتملة</th><th>نسبة الإلغاء</th><th>قيمة الحجوزات</th></tr></thead><tbody>' + body + "</tbody></table></div>";
  }

  /* ---------- 4 · Destination Analysis ------------------------------ */
  function renderDestinations() {
    var dc = {}, dv = {};
    B.forEach(function (b) { dc[b.destination] = (dc[b.destination] || 0) + 1; dv[b.destination] = (dv[b.destination] || 0) + b.booking_value; });
    var dests = Object.keys(dc).map(function (k) { return { label: destName(k), value: dc[k], sub: money(dv[k]) }; }).sort(function (a, b) { return b.value - a.value; });
    rankBars(el("destRank"), dests, { color: C.jade });

    var hc = {};
    B.forEach(function (b) { hc[b.hotel_name] = (hc[b.hotel_name] || 0) + 1; });
    var hotels = Object.keys(hc).map(function (k) { return { label: k, value: hc[k] }; }).sort(function (a, b) { return b.value - a.value; }).slice(0, 8);
    rankBars(el("hotelRank"), hotels, { color: C.brass, fmt: function (v) { return arNum(v) + " حجز"; } });

    var avgAll = B.length ? sum(B, function (b) { return b.booking_value; }) / B.length : 0;
    var avgRows = Object.keys(dc).map(function (k) {
      var bs = B.filter(function (b) { return b.destination === k; });
      return { label: destName(k), value: bs.length ? sum(bs, function (b) { return b.booking_value; }) / bs.length : 0 };
    }).sort(function (a, b) { return b.value - a.value; });
    el("avgValue").innerHTML =
      '<div class="big-stat"><span class="bs-v">' + money(avgAll) + '</span><span class="bs-k">متوسط قيمة الحجز (إجمالي)</span></div>' +
      '<div class="avg-list">' + avgRows.map(function (r) {
        return '<div class="avg-row"><span>' + esc(r.label) + '</span><b>' + money(r.value) + "</b></div>";
      }).join("") + "</div>";
  }

  /* ---------- 5 · Daily Workload Analysis --------------------------- */
  function renderWorkload() {
    // by day (continuous timeline from earliest booking → now)
    var dates = B.map(function (b) { return b.created_at.slice(0, 10); });
    var minD = parseD(dates.reduce(function (a, b) { return a < b ? a : b; }, dates[0] || "2026-06-18"));
    var maxD = parseD(D.meta.now || "2026-06-18");
    var dayCount = {}; B.forEach(function (b) { var k = b.created_at.slice(0, 10); dayCount[k] = (dayCount[k] || 0) + 1; });
    var dayItems = [], cur = new Date(minD), bestDay = { k: "", v: -1 };
    while (cur <= maxD) {
      var k = cur.toISOString().slice(0, 10), v = dayCount[k] || 0;
      if (v > bestDay.v) bestDay = { k: k, v: v };
      var p = k.split("-");
      dayItems.push({ value: v, tick: arNum(+p[2]) + "/" + arNum(+p[1]), full: k });
      cur.setDate(cur.getDate() + 1);
    }
    barChartV(el("wlDay"), dayItems);

    // by weekday (Sat..Fri)
    var dow = [0, 0, 0, 0, 0, 0, 0]; B.forEach(function (b) { dow[parseD(b.created_at).getDay()]++; });
    var order = [6, 0, 1, 2, 3, 4, 5], maxDow = Math.max.apply(null, dow);
    var dowItems = order.map(function (d) { return { value: dow[d], tick: DOW_AR[d].replace("ال", ""), full: DOW_AR[d], hot: dow[d] === maxDow && maxDow > 0 }; });
    barChartV(el("wlWeekday"), dowItems);

    // by hour (8..19)
    var hr = {}; B.forEach(function (b) { var h = +b.created_at.slice(11, 13); hr[h] = (hr[h] || 0) + 1; });
    var hours = []; for (var h = 8; h <= 19; h++) hours.push(h);
    var maxHr = Math.max.apply(null, hours.map(function (h) { return hr[h] || 0; }).concat([0]));
    var hrItems = hours.map(function (h) { return { value: hr[h] || 0, tick: arNum(h), full: "الساعة " + arNum(h) + ":٠٠", hot: (hr[h] || 0) === maxHr && maxHr > 0 }; });
    barChartV(el("wlHour"), hrItems);

    // insights
    var busiestDow = order.map(function (d) { return { d: d, v: dow[d] }; }).sort(function (a, b) { return b.v - a.v; })[0];
    var busiestHr = hours.map(function (h) { return { h: h, v: hr[h] || 0 }; }).sort(function (a, b) { return b.v - a.v; })[0];
    // peak period blocks
    function blockSum(a, b) { var t = 0; for (var h = a; h < b; h++) t += hr[h] || 0; return t; }
    var blocks = [{ k: "صباحاً (٨–١٢)", v: blockSum(8, 12) }, { k: "ظهراً (١٢–١٦)", v: blockSum(12, 16) }, { k: "مساءً (١٦–٢٠)", v: blockSum(16, 20) }];
    var peak = blocks.sort(function (a, b) { return b.v - a.v; })[0];
    var bd = bestDay.k.split("-");
    var insights = [
      ["أكثر يوم ازدحاماً", bestDay.k ? arNum(+bd[2]) + " " + MONTH_AR[+bd[1] - 1] + " · " + arNum(bestDay.v) + " حجز" : "—"],
      ["أكثر أيام الأسبوع", busiestDow ? DOW_AR[busiestDow.d] + " · " + arNum(busiestDow.v) + " حجز" : "—"],
      ["أكثر ساعات العمل", busiestHr ? "الساعة " + arNum(busiestHr.h) + ":٠٠ · " + arNum(busiestHr.v) + " حجز" : "—"],
      ["فترة الذروة", peak.v ? peak.k + " · " + arNum(peak.v) + " حجز" : "—"]
    ];
    el("wlInsights").innerHTML = insights.map(function (x) {
      return '<div class="insight"><span class="in-k">' + x[0] + '</span><span class="in-v">' + x[1] + "</span></div>";
    }).join("");
  }

  /* ---------- Phase 2 · editable operational control (writes ONLY to BookingOpsStore) */
  var editingOps = null, editingBooking = null, opsSaveT = null;

  function ownerOptions(sel) {
    sel = sel || {};
    var list = (D.bookingOfficers || []).slice();
    var has = list.some(function (o) { return o.id === sel.id; });
    var opts = "";
    if (sel.id && !has && sel.name) opts += '<option value="' + esc(sel.id) + '" selected>' + esc(sel.name) + "</option>";
    list.forEach(function (o) { opts += '<option value="' + esc(o.id) + '"' + (o.id === sel.id ? " selected" : "") + ">" + esc(o.name) + "</option>"; });
    return opts;
  }
  function renderOpSection(b) {
    var ops = editingOps, s = deriveOps(ops, b);
    var hotels = ops.hotel_confirmations.map(function (h, i) {
      return '<div class="op-item">' +
        '<div class="op-item-h">' + esc(h.hotel_name || ("فندق " + arNum(i + 1))) + "</div>" +
        '<label class="op-f"><span>رقم التأكيد</span><input class="op-in" type="text" data-op="hotel-conf" data-i="' + i + '" value="' + esc(h.confirmation_number || "") + '" placeholder="—"></label>' +
        '<label class="op-tog"><input type="checkbox" data-op="hotel-confirmed" data-i="' + i + '"' + (h.confirmed ? " checked" : "") + "><span>مؤكّد</span></label>" +
        "</div>";
    }).join("") || '<div class="op-empty">لا توجد فنادق.</div>';
    var tickets = ops.tickets.map(function (t, i) {
      return '<div class="op-row">' +
        '<input class="op-in" type="text" data-op="ticket-label" data-i="' + i + '" value="' + esc(t.label || "") + '" placeholder="وصف التذكرة (مثال: RUH-CGK)">' +
        '<label class="op-tog"><input type="checkbox" data-op="ticket-uploaded" data-i="' + i + '"' + (t.uploaded ? " checked" : "") + "><span>مرفوعة</span></label>" +
        '<button type="button" class="op-x" data-op="ticket-remove" data-i="' + i + '" title="حذف">✕</button>' +
        "</div>";
    }).join("");
    var vouchers = ops.required_vouchers.map(function (v, i) {
      return '<div class="op-row">' +
        '<input class="op-in" type="text" data-op="voucher-type" data-i="' + i + '" value="' + esc(v.type || v.label || "") + '" placeholder="نوع الفوشر (فندق / خدمة / نقل ...)">' +
        '<label class="op-tog"><input type="checkbox" data-op="voucher-attached" data-i="' + i + '"' + (v.attached ? " checked" : "") + "><span>مرفق</span></label>" +
        '<button type="button" class="op-x" data-op="voucher-remove" data-i="' + i + '" title="حذف">✕</button>' +
        "</div>";
    }).join("");
    var ready = '<span class="ck-ready ' + (s.ready ? "ok" : "warn") + '" id="opReady">' + (s.ready ? "جاهز للإرسال" : "عناصر ناقصة") + "</span>";
    var miss = '<div class="op-miss" id="opMiss">' + (s.ready ? "لا عناصر ناقصة — جاهز للإرسال" : ("ناقص: " + esc(s.missing.join(" · ")))) + "</div>";
    return '<div class="op-head">مركز التحكم التشغيلي · Operational Control' +
        '<span class="op-head-r">' + ready + '<button type="button" class="op-save" data-op="op-save">حفظ · Save</button><span class="op-stat" id="opStat"></span></span></div>' +
      '<div class="op-block"><div class="op-bt">تأكيدات الفنادق</div>' + hotels + "</div>" +
      '<div class="op-block"><div class="op-bt">التذاكر <label class="op-tog inline"><input type="checkbox" data-op="has-flights"' + (ops.has_flights ? " checked" : "") + "><span>الحجز يتضمن رحلات</span></label></div>" +
        tickets + '<button type="button" class="op-add" data-op="ticket-add">+ إضافة تذكرة</button>' +
        (ops.has_flights ? "" : '<div class="op-hint">التذاكر غير مطلوبة (لا رحلات).</div>') + "</div>" +
      '<div class="op-block"><div class="op-bt">الفوشرات المطلوبة</div>' + vouchers + '<button type="button" class="op-add" data-op="voucher-add">+ إضافة فوشر</button></div>' +
      '<div class="op-block"><label class="op-f"><span>المسؤول الحالي</span><select class="op-in" data-op="owner">' + ownerOptions(ops.current_owner) + "</select></label></div>" +
      '<div class="op-block"><label class="op-f"><span>ملاحظات تشغيلية</span><textarea class="op-in op-notes" data-op="notes" rows="3" placeholder="ملاحظات الفريق ...">' + esc(ops.notes || "") + "</textarea></label></div>" +
      miss;
  }
  function refreshOpDerived() {
    if (!editingBooking || !editingOps) return;
    var s = deriveOps(editingOps, editingBooking);
    var r = document.getElementById("opReady");
    if (r) { r.textContent = s.ready ? "جاهز للإرسال" : "عناصر ناقصة"; r.className = "ck-ready " + (s.ready ? "ok" : "warn"); }
    var m = document.getElementById("opMiss");
    if (m) { m.textContent = s.ready ? "لا عناصر ناقصة — جاهز للإرسال" : ("ناقص: " + s.missing.join(" · ")); }
  }
  function setOpStat(t) { var e = document.getElementById("opStat"); if (e) e.textContent = t; }
  function persistOps() { if (editingBooking && editingOps && window.BookingOpsStore) { BookingOpsStore.save(editingBooking.booking_id, editingOps); setOpStat("✓ محفوظ"); renderList(); } }
  function scheduleOpsSave() { setOpStat("…"); if (opsSaveT) clearTimeout(opsSaveT); opsSaveT = setTimeout(persistOps, 600); }
  function rerenderOpSection() { var host = document.getElementById("opSection"); if (host && editingBooking) host.innerHTML = renderOpSection(editingBooking); }
  function handleOpButton(op, i) {
    if (op === "op-save") { persistOps(); setOpStat("✓ تم الحفظ"); return; }
    if (!editingOps) return;
    i = +i;
    if (op === "ticket-add") editingOps.tickets.push({ label: "", uploaded: false });
    else if (op === "ticket-remove") editingOps.tickets.splice(i, 1);
    else if (op === "voucher-add") editingOps.required_vouchers.push({ type: "", attached: false });
    else if (op === "voucher-remove") editingOps.required_vouchers.splice(i, 1);
    else return;
    rerenderOpSection(); persistOps();
  }

  /* ---------- booking detail modal ---------------------------------- */
  function openBooking(id) {
    var b = B.filter(function (x) { return x.booking_id === id; })[0]; if (!b) return;
    state.openId = id;
    editingBooking = b;
    editingOps = normalizeOps((window.BookingOpsStore && (BookingOpsStore.load(id) || BookingOpsStore.defaults(b))) || {}, b);
    var nights = Math.round((parseD(b.check_out) - parseD(b.check_in)) / 86400000);
    var facts = [
      ["رقم الحجز", esc(b.booking_id)],
      ["العرض المصدر", esc(b.quotation_id)],
      ["الشركة", esc(b.company_name)],
      ["موظف المبيعات", esc(b.sales_employee)],
      ["موظف الحجوزات", esc(b.booking_officer)],
      ["الوجهة", esc(destName(b.destination))],
      ["الفندق", esc(b.hotel_name)],
      ["الدخول", esc(b.check_in)],
      ["الخروج", esc(b.check_out) + " (" + arNum(nights) + " ليلة)"],
      ["عدد المسافرين", arNum(b.pax)],
      ["قيمة الحجز", money(b.booking_value)],
      ["الحالة", statusChip(b.booking_status)],
      ["مرجع الحجز", esc(b.booking_reference)],
      ["تاريخ الإنشاء", esc(b.created_at)]
    ].map(function (f) { return '<div class="bm-fact"><span class="bm-k">' + f[0] + '</span><span class="bm-v">' + f[1] + "</span></div>"; }).join("");
    var note = b.notes ? '<div class="bm-note"><span>ملاحظة</span><p>' + esc(b.notes) + "</p></div>" : "";
    el("bookingModal").innerHTML =
      '<div class="bm-backdrop" data-close="1"></div>' +
      '<div class="bm-panel" role="dialog" aria-modal="true">' +
        '<div class="bm-head"><h3 class="bm-title">تفاصيل الحجز</h3><button type="button" class="bm-close" data-close="1" aria-label="إغلاق">✕</button></div>' +
        '<div class="bm-facts">' + facts + "</div>" + note +
        '<div id="opSection" class="bm-op">' + renderOpSection(b) + "</div>" +
        '<div class="bm-actions"><button type="button" class="mk-book" data-makebook="' + esc(b.booking_id) + '">إنشاء دليل الرحلة</button>' +
        '<button type="button" class="mk-trans" data-maketransport="' + esc(b.booking_id) + '">إنشاء ملف المواصلات</button></div>' +
      "</div>";
    el("bookingModal").hidden = false;
    document.body.classList.add("modal-open");
  }
  function closeBooking() {
    if (opsSaveT) { clearTimeout(opsSaveT); opsSaveT = null; }
    if (editingBooking && editingOps && window.BookingOpsStore) { try { BookingOpsStore.save(editingBooking.booking_id, editingOps); } catch (e) { } }
    var m = el("bookingModal"); if (m) { m.hidden = true; m.innerHTML = ""; }
    document.body.classList.remove("modal-open"); state.openId = null;
    editingOps = null; editingBooking = null; renderList();
  }

  /* DS6 — hand this confirmed booking to the dashboard shell, which opens the
     Travel Book module and auto-loads the program (no manual program number). */
  function makeTravelBook(id) {
    var b = B.filter(function (x) { return x.booking_id === id; })[0]; if (!b) return;
    var payload = { type: "open-travel-book", bookingId: b.booking_id, booking: b };
    try {
      var target = (window.parent && window.parent !== window) ? window.parent : window;
      target.postMessage(payload, "*");
    } catch (err) { /* standalone: shell not present */ }
    closeBooking();
  }
  function makeTransportFile(id) {
    var b = B.filter(function (x) { return x.booking_id === id; })[0]; if (!b) return;
    var payload = { type: "open-transport-file", bookingId: b.booking_id, booking: b };
    try {
      var target = (window.parent && window.parent !== window) ? window.parent : window;
      target.postMessage(payload, "*");
    } catch (err) { /* standalone: shell not present */ }
    closeBooking();
  }

  /* ---------- filters population + wiring ---------------------------- */
  function populate() {
    el("fStatus").innerHTML = '<option value="all">كل الحالات</option>' + (D.statuses || []).map(function (s) { return '<option value="' + s.id + '">' + s.label + "</option>"; }).join("");
    el("fDest").innerHTML = '<option value="all">كل الوجهات</option>' + (D.destinations || []).map(function (d) { return '<option value="' + d.id + '">' + d.name + "</option>"; }).join("");
    el("fOfficer").innerHTML = '<option value="all">كل الموظفين</option>' + (D.bookingOfficers || []).map(function (o) { return '<option value="' + o.id + '">' + o.name + "</option>"; }).join("");
    el("fCompany").innerHTML = '<option value="all">كل الشركات</option>' + (D.companies || []).map(function (c) { return '<option value="' + esc(c) + '">' + esc(c) + "</option>"; }).join("");
  }
  function renderAll() { renderSummary(); renderList(); renderOfficers(); renderDestinations(); renderWorkload(); }

  function wire() {
    el("now").textContent = (D.meta && D.meta.now) || "";
    var si;
    el("fSearch").addEventListener("input", function (e) { clearTimeout(si); si = setTimeout(function () { state.q = e.target.value; renderList(); }, 120); });
    el("fStatus").addEventListener("change", function (e) { state.status = e.target.value; renderList(); });
    el("fOps").addEventListener("change", function (e) { state.ops = e.target.value; renderList(); });
    el("fDest").addEventListener("change", function (e) { state.dest = e.target.value; renderList(); });
    el("fOfficer").addEventListener("change", function (e) { state.officer = e.target.value; renderList(); });
    el("fCompany").addEventListener("change", function (e) { state.company = e.target.value; renderList(); });
    el("fFrom").addEventListener("change", function (e) { state.from = e.target.value; renderList(); });
    el("fTo").addEventListener("change", function (e) { state.to = e.target.value; renderList(); });
    el("fReset").addEventListener("click", function () {
      state.q = ""; state.status = "all"; state.dest = "all"; state.officer = "all"; state.company = "all"; state.from = ""; state.to = ""; state.ops = "all";
      el("fSearch").value = ""; ["fStatus", "fDest", "fOfficer", "fCompany", "fOps"].forEach(function (id) { el(id).value = "all"; }); el("fFrom").value = ""; el("fTo").value = "";
      renderList();
    });
    // read-only live refresh: reflect Travel Book / ops changes made in other modules (same origin)
    window.addEventListener("storage", function (e) { if (e.key && (/^seasontb:/.test(e.key) || /^seasonbops:/.test(e.key))) renderList(); });
    // Phase 2 — editable operational fields (write ONLY to BookingOpsStore)
    document.addEventListener("input", function (e) {
      var t = e.target, op = t.getAttribute && t.getAttribute("data-op"); if (!op || !editingOps) return;
      var i = +t.getAttribute("data-i");
      if (op === "hotel-conf") editingOps.hotel_confirmations[i].confirmation_number = t.value;
      else if (op === "ticket-label") editingOps.tickets[i].label = t.value;
      else if (op === "voucher-type") editingOps.required_vouchers[i].type = t.value;
      else if (op === "notes") editingOps.notes = t.value;
      else return;
      refreshOpDerived(); scheduleOpsSave();
    });
    document.addEventListener("change", function (e) {
      var t = e.target, op = t.getAttribute && t.getAttribute("data-op"); if (!op || !editingOps) return;
      var i = +t.getAttribute("data-i");
      if (op === "hotel-confirmed") editingOps.hotel_confirmations[i].confirmed = t.checked;
      else if (op === "ticket-uploaded") editingOps.tickets[i].uploaded = t.checked;
      else if (op === "voucher-attached") editingOps.required_vouchers[i].attached = t.checked;
      else if (op === "has-flights") { editingOps.has_flights = t.checked; rerenderOpSection(); persistOps(); return; }
      else if (op === "owner") { var o = (D.bookingOfficers || []).filter(function (x) { return x.id === t.value; })[0]; editingOps.current_owner = o ? { id: o.id, name: o.name } : { id: t.value, name: t.options[t.selectedIndex].text }; }
      else return;
      refreshOpDerived(); scheduleOpsSave();
    });
    window.addEventListener("pagehide", function () { if (editingBooking && editingOps && window.BookingOpsStore) { try { BookingOpsStore.save(editingBooking.booking_id, editingOps); } catch (e) { } } });
    document.addEventListener("click", function (e) {
      var opb = e.target.closest("[data-op]");
      if (opb && opb.tagName === "BUTTON") { e.preventDefault(); e.stopPropagation(); handleOpButton(opb.getAttribute("data-op"), opb.getAttribute("data-i")); return; }
      var mk = e.target.closest("[data-makebook]");
      if (mk) { e.preventDefault(); e.stopPropagation(); makeTravelBook(mk.getAttribute("data-makebook")); return; }
      var mt = e.target.closest("[data-maketransport]");
      if (mt) { e.preventDefault(); e.stopPropagation(); makeTransportFile(mt.getAttribute("data-maketransport")); return; }
      if (e.target.closest("[data-close]")) { closeBooking(); return; }
      var row = e.target.closest("[data-bid]"); if (row) openBooking(row.getAttribute("data-bid"));
    });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeBooking(); });
  }

  document.addEventListener("DOMContentLoaded", function () {
    try { populate(); wire(); renderAll(); }
    catch (err) { console.error(err); document.body.insertAdjacentHTML("beforeend", '<pre style="color:#d9645a;padding:16px">خطأ: ' + esc(err.message) + "</pre>"); }
  });
})();
