/* Daily Boards — the operations one-screen dashboard (Phase 4).
 * DATA SOURCE: actual saved Transportation Files ONLY (no sample/mock data).
 * Tabs: Arrivals / Departures / Forecast / Driver Workload / Missing.
 * READ-ONLY. Does not modify Travel Book, Program Source, Pricing,
 * Confirmed Booking, Quotation, or Driver-Assignment logic.
 */
(function () {
  "use strict";
  var TAB = "arrivals", BOARD_DATE = "", CC_FILTER = "90", CC_COMP_FILTER = null;
  function el(id) { return document.getElementById(id); }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function iso(d) { return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); }
  function today() { return iso(new Date()); }
  function shift(n) { var d = new Date(); d.setDate(d.getDate() + n); return iso(d); }
  function num(v) { var n = parseInt(v, 10); return isNaN(n) ? 0 : n; }
  function daysTo(ds) { if (!ds) return null; var a = new Date(ds + "T00:00:00"), b = new Date(today() + "T00:00:00"); return Math.round((a - b) / 86400000); }

  function files() { return (window.TransportationFileStore && TransportationFileStore.list) ? TransportationFileStore.list() : []; }
  function statusOf(f) { return (f && f.status) || (f && f.ready_to_send ? "ready" : "draft"); }
  function active() { return files().filter(function (f) { return statusOf(f) !== "cancelled"; }); }
  function destAr(d) { return d === "thailand" ? "تايلاند" : d === "indonesia" ? "إندونيسيا" : d === "maldives" ? "المالديف" : (d || "—"); }
  var STATUS = { draft: ["مسودة", "b-draft"], ready: ["جاهز", "b-ready"], completed: ["مكتمل", "b-completed"], cancelled: ["ملغى", "b-cancelled"] };
  function badge(st) { var s = STATUS[st] || ["—", "b-none"]; return '<span class="b-badge ' + s[1] + '">' + s[0] + "</span>"; }
  function isArr(t) { return t === "airport_arrival" || t === "airport_pickup"; }
  function isDep(t) { return t === "airport_departure" || t === "airport_dropoff"; }
  function firstMv(f, pred) { var ms = (f && f.movements) || []; for (var i = 0; i < ms.length; i++) if (pred(ms[i].type)) return ms[i]; return null; }
  function lastMv(f, pred) { var ms = (f && f.movements) || [], r = null; for (var i = 0; i < ms.length; i++) if (pred(ms[i].type)) r = ms[i]; return r; }
  function arrivalDate(f) { var m = firstMv(f, isArr); return (m && m.date) || (f.dates && f.dates.start) || ""; }
  function departureDate(f) { var m = lastMv(f, isDep); return (m && m.date) || (f.dates && f.dates.end) || ""; }
  function openItems(f) {
    if (f && f.open_items && typeof f.open_items.length === "number") return f.open_items;
    var b = []; if (!f) return b;
    if (!f.customer_name) b.push("اسم العميل");
    if (!(f.movements && f.movements.length)) b.push("حركة واحدة على الأقل");
    (f.movements || []).forEach(function (m, i) { if (!m.driver_id) b.push("سائق (حركة " + (i + 1) + ")"); });
    return b;
  }

  // ---------- SUMMARY CARDS ----------
  function summaryCards() {
    var t = today(), all = files(), act = active();
    var arr = act.filter(function (f) { return arrivalDate(f) === t; }).length;
    var dep = act.filter(function (f) { return departureDate(f) === t; }).length;
    var ready = all.filter(function (f) { return statusOf(f) === "ready"; }).length;
    var miss = all.filter(function (f) { return statusOf(f) === "draft" && openItems(f).length > 0; }).length;
    function c(n, label, cls) { return '<div class="sum-card ' + cls + '"><div class="sum-n">' + n + '</div><div class="sum-l">' + label + "</div></div>"; }
    return '<div class="sum-grid">' +
      c(arr, "وصولات اليوم · Arrivals Today", "s-arr") +
      c(dep, "مغادرات اليوم · Departures Today", "s-dep") +
      c(ready, "ملفات جاهزة · Ready Files", "s-ready") +
      c(miss, "ملفات ناقصة · Missing Files", "s-miss") + "</div>";
  }
  // PAX + tomorrow KPIs — counted from actual transportation files
  function opsKpiCards() {
    var t = today(), tom = shift(1), w6 = shift(6), act = active();
    function paxIn(lo, hi) { return act.reduce(function (a, f) { var d = arrivalDate(f); return a + ((d && d >= lo && d <= hi) ? num(f.pax) : 0); }, 0); }
    var arrTom = act.filter(function (f) { return arrivalDate(f) === tom; }).length;
    var depTom = act.filter(function (f) { return departureDate(f) === tom; }).length;
    var paxToday = paxIn(t, t), paxTom = paxIn(tom, tom), pax7 = paxIn(t, w6);
    function c(n, label, cls) { return '<div class="sum-card ' + cls + '"><div class="sum-n">' + n + '</div><div class="sum-l">' + label + "</div></div>"; }
    return '<div class="sum-grid ops-kpi">' +
      c(arrTom, "وصولات الغد · Arrivals Tomorrow", "s-arr") +
      c(depTom, "مغادرات الغد · Departures Tomorrow", "s-dep") +
      c(paxToday, "مسافرو اليوم · PAX Today", "s-pax") +
      c(paxTom, "مسافرو الغد · PAX Tomorrow", "s-pax") +
      c(pax7, "مسافرو ٧ أيام · PAX Next 7 Days", "s-pax") + "</div>";
  }

  // ---------- ARRIVALS / DEPARTURES ----------
  function boardRows(dateFn, mvPred) {
    var d = BOARD_DATE || today();
    return active().filter(function (f) { return dateFn(f) === d; }).map(function (f) {
      var mv = firstMv(f, mvPred) || lastMv(f, mvPred);
      return { bid: f.booking_id, date: d, time: (mv && mv.time) || "", customer: f.customer_name || "—", pax: num(f.pax),
        dest: destAr(f.destination_id), city: (mv && mv.city) || "", driver: (mv && mv.driver_name) || "", status: statusOf(f) };
    }).sort(function (a, b) { return String(a.time).localeCompare(String(b.time)) || String(a.bid).localeCompare(String(b.bid)); });
  }
  // clickable cell → opens the Transportation File for that booking
  function fileLink(bid, text) { return '<button type="button" class="bd-link" data-openfile="' + esc(bid) + '">' + esc(text) + "</button>"; }
  function dateBar() {
    var d = BOARD_DATE || today();
    function c(label, val) { return '<button type="button" class="bd-chip' + (d === val ? " on" : "") + '" data-date="' + val + '">' + label + "</button>"; }
    return '<div class="bd-datebar">' + c("اليوم · Today", today()) + c("غداً · Tomorrow", shift(1)) +
      '<label class="bd-pick">تاريخ <input type="date" id="bdDate" value="' + esc(d) + '"></label></div>';
  }
  function arrivalsView() {
    var rows = boardRows(arrivalDate, isArr);
    var body = rows.length ? rows.map(function (r) {
      return "<tr><td>" + fileLink(r.bid, r.bid) + "</td><td>" + (esc(r.time) || '<span class="b-miss">— مطلوب</span>') + "</td><td>" + fileLink(r.bid, r.customer) + "</td><td>" + esc(r.dest) +
        "</td><td>" + (esc(r.city) || "—") + '</td><td class="bd-pax">' + (r.pax || "—") + "</td><td>" + (esc(r.driver) || '<span class="b-miss">لم يُسند</span>') + "</td><td>" + badge(r.status) + "</td></tr>";
    }).join("") : '<tr><td colspan="8" class="bd-empty">لا وصولات في هذا التاريخ (من ملفات المواصلات).</td></tr>';
    return dateBar() + '<div class="bd-card"><table class="bd-tbl"><thead><tr><th>الحجز</th><th>وقت الوصول</th><th>العميل</th><th>الوجهة</th><th>المدينة</th><th>PAX</th><th>السائق</th><th>الحالة</th></tr></thead><tbody>' + body + "</tbody></table></div>";
  }
  function departuresView() {
    var rows = boardRows(departureDate, isDep);
    var body = rows.length ? rows.map(function (r) {
      return "<tr><td>" + fileLink(r.bid, r.bid) + "</td><td>" + (esc(r.time) || '<span class="b-miss">— مطلوب</span>') + "</td><td>" + fileLink(r.bid, r.customer) + "</td><td>" + esc(r.dest) +
        '</td><td class="bd-pax">' + (r.pax || "—") + "</td><td>" + (esc(r.driver) || '<span class="b-miss">لم يُسند</span>') + "</td><td>" + badge(r.status) + "</td></tr>";
    }).join("") : '<tr><td colspan="7" class="bd-empty">لا مغادرات في هذا التاريخ (من ملفات المواصلات).</td></tr>';
    return dateBar() + '<div class="bd-card"><table class="bd-tbl"><thead><tr><th>الحجز</th><th>وقت المغادرة</th><th>العميل</th><th>الوجهة</th><th>PAX</th><th>السائق</th><th>الحالة</th></tr></thead><tbody>' + body + "</tbody></table></div>";
  }

  // ---------- TOMORROW OPERATIONS (everything happening tomorrow) ----------
  function tomorrowOpsView() {
    var tom = shift(1);
    function rowsFor(dateFn, mvPred) {
      return active().filter(function (f) { return dateFn(f) === tom; }).map(function (f) {
        var mv = firstMv(f, mvPred) || lastMv(f, mvPred);
        return { bid: f.booking_id, customer: f.customer_name || "—", pax: num(f.pax), dest: destAr(f.destination_id), city: (mv && mv.city) || "", time: (mv && mv.time) || "", driver: (mv && mv.driver_name) || "", status: statusOf(f) };
      }).sort(function (a, b) { return String(a.time).localeCompare(String(b.time)); });
    }
    var arr = rowsFor(arrivalDate, isArr), dep = rowsFor(departureDate, isDep);
    var aBody = arr.length ? arr.map(function (r) {
      return "<tr><td>" + fileLink(r.bid, r.bid) + "</td><td>" + fileLink(r.bid, r.customer) + "</td><td>" + esc(r.dest) + "</td><td>" + (esc(r.city) || "—") + "</td><td>" + (esc(r.time) || '<span class="b-miss">— مطلوب</span>') + '</td><td class="bd-pax">' + (r.pax || "—") + "</td><td>" + (esc(r.driver) || '<span class="b-miss">لم يُسند</span>') + "</td><td>" + badge(r.status) + "</td></tr>";
    }).join("") : '<tr><td colspan="8" class="bd-empty">لا وصولات غداً.</td></tr>';
    var dBody = dep.length ? dep.map(function (r) {
      return "<tr><td>" + fileLink(r.bid, r.bid) + "</td><td>" + fileLink(r.bid, r.customer) + "</td><td>" + esc(r.dest) + "</td><td>" + (esc(r.time) || '<span class="b-miss">— مطلوب</span>') + '</td><td class="bd-pax">' + (r.pax || "—") + "</td><td>" + (esc(r.driver) || '<span class="b-miss">لم يُسند</span>') + "</td><td>" + badge(r.status) + "</td></tr>";
    }).join("") : '<tr><td colspan="7" class="bd-empty">لا مغادرات غداً.</td></tr>';
    return '<p class="bd-note">عمليات الغد (' + esc(tom) + ') — افتحها صباحاً لتعرف كل ما سيحدث غداً. (اضغط الحجز أو العميل لفتح الملف)</p>' +
      '<div class="bd-card"><div class="bd-grp-h u-mid">الوصولات غداً · Arrivals Tomorrow</div><table class="bd-tbl"><thead><tr><th>الحجز</th><th>العميل</th><th>الوجهة</th><th>المدينة</th><th>وقت الوصول</th><th>PAX</th><th>السائق</th><th>حالة الملف</th></tr></thead><tbody>' + aBody + "</tbody></table></div>" +
      '<div class="bd-card"><div class="bd-grp-h u-mid">المغادرات غداً · Departures Tomorrow</div><table class="bd-tbl"><thead><tr><th>الحجز</th><th>العميل</th><th>الوجهة</th><th>وقت المغادرة</th><th>PAX</th><th>السائق</th><th>حالة الملف</th></tr></thead><tbody>' + dBody + "</tbody></table></div>";
  }

  // ---------- 7-DAY OPERATIONAL FORECAST (from confirmed bookings) ----------
  function forecastView() {
    var t = today(), end = shift(6), byDate = {};
    ((window.CB_DATA && CB_DATA.bookings) ? CB_DATA.bookings : []).forEach(function (b) {
      var ci = b.check_in || ""; if (!ci || ci < t || ci > end) return;
      var dest = b.destination || "—";
      byDate[ci] = byDate[ci] || {};
      byDate[ci][dest] = byDate[ci][dest] || { pax: 0, count: 0, customers: {} };
      byDate[ci][dest].pax += num(b.pax); byDate[ci][dest].count += 1;
      byDate[ci][dest].customers[(b.guest_name || b.company_name || b.booking_id)] = 1;
    });
    var dates = []; for (var i = 0; i <= 6; i++) dates.push(shift(i));
    if (!Object.keys(byDate).length) return '<div class="bd-card"><p class="bd-empty">لا حجوزات قادمة خلال ٧ أيام.</p></div>';
    return '<p class="bd-note">توقّع تشغيلي حقيقي لأيام الأسبوع القادمة — من الحجوزات المؤكدة (عميل · مسافر · حجز لكل دولة).</p>' +
      dates.map(function (d) {
        var dests = byDate[d];
        if (!dests) return '<div class="bd-card bd-fc"><div class="bd-fc-h">' + esc(d) + ' <span class="bd-fc-tot muted">لا وصول</span></div></div>';
        var dpax = 0, dbk = 0, dcust = {};
        var rows = Object.keys(dests).map(function (k) {
          var cust = Object.keys(dests[k].customers).length; dpax += dests[k].pax; dbk += dests[k].count;
          Object.keys(dests[k].customers).forEach(function (c) { dcust[c] = 1; });
          return "<tr><td>" + destAr(k) + "</td><td>" + cust + "</td><td>" + dests[k].pax + "</td><td>" + dests[k].count + "</td></tr>";
        }).join("");
        return '<div class="bd-card bd-fc"><div class="bd-fc-h">' + esc(d) + ' <span class="bd-fc-tot">' + Object.keys(dcust).length + " عميل · " + dpax + " مسافر · " + dbk + " حجز</span></div>" +
          '<table class="bd-tbl"><thead><tr><th>الدولة</th><th>العملاء</th><th>المسافرون PAX</th><th>الحجوزات</th></tr></thead><tbody>' + rows + "</tbody></table></div>";
      }).join("");
  }

  // ---------- DRIVER WORKLOAD ----------
  function workloadView() {
    var t = today(), tom = shift(1), w6 = shift(6);
    var map = {}; // driver_id -> {name, today, tomorrow, week}
    (window.DriverRegistry && DriverRegistry.all ? DriverRegistry.all() : []).forEach(function (d) { map[d.driver_id] = { name: d.driver_name, today: 0, tomorrow: 0, week: 0 }; });
    active().forEach(function (f) {
      (f.movements || []).forEach(function (m) {
        if (!m.driver_id || !m.date) return;
        if (!map[m.driver_id]) map[m.driver_id] = { name: m.driver_name || m.driver_id, today: 0, tomorrow: 0, week: 0 };
        if (m.date === t) map[m.driver_id].today++;
        if (m.date === tom) map[m.driver_id].tomorrow++;
        if (m.date >= t && m.date <= w6) map[m.driver_id].week++;
      });
    });
    var rows = Object.keys(map).map(function (id) { return map[id]; }).sort(function (a, b) { return b.week - a.week || b.today - a.today; });
    var body = rows.length ? rows.map(function (r) {
      var heavy = r.week >= 18 ? " wl-heavy" : "";
      return '<tr class="' + heavy + '"><td>' + esc(r.name) + "</td><td>" + r.today + "</td><td>" + r.tomorrow + "</td><td>" + r.week + "</td></tr>";
    }).join("") : '<tr><td colspan="4" class="bd-empty">لا حركات مُسندة بعد.</td></tr>';
    return '<div class="bd-card"><p class="bd-note">عدد الحركات المُسندة لكل سائق — لتفادي تحميل سائق واحد. (المظلّل = أسبوع مزدحم)</p>' +
      '<table class="bd-tbl"><thead><tr><th>السائق</th><th>اليوم</th><th>غداً</th><th>الأسبوع</th></tr></thead><tbody>' + body + "</tbody></table></div>";
  }

  // ---------- MISSING (prioritized) ----------
  function missingView() {
    var groups = { crit: [], imp: [], fut: [], nodate: [] };
    files().forEach(function (f) {
      if (statusOf(f) !== "draft") return;
      var items = openItems(f); if (!items.length) return;
      var ds = arrivalDate(f), days = daysTo(ds);
      var row = { bid: f.booking_id, customer: f.customer_name || "—", date: ds, days: days, items: items };
      if (days == null) groups.nodate.push(row);
      else if (days <= 2) groups.crit.push(row);
      else if (days <= 7) groups.imp.push(row);
      else groups.fut.push(row);
    });
    function sortByDate(a, b) { return String(a.date).localeCompare(String(b.date)); }
    ["crit", "imp", "fut", "nodate"].forEach(function (k) { groups[k].sort(sortByDate); });
    var total = groups.crit.length + groups.imp.length + groups.fut.length + groups.nodate.length;
    if (!total) return '<div class="bd-card"><p class="bd-empty">لا نواقص — كل ملفات المسودة مكتملة.</p></div>';
    function grp(key, label, cls) {
      var rows = groups[key]; if (!rows.length) return "";
      return '<div class="bd-card bd-grp"><div class="bd-grp-h ' + cls + '">' + label + ' <span class="bd-grp-n">' + rows.length + "</span></div>" +
        '<table class="bd-tbl"><thead><tr><th>الحجز</th><th>العميل</th><th>تاريخ الوصول</th><th>النواقص</th></tr></thead><tbody>' +
        rows.map(function (r) { return "<tr><td>" + esc(r.bid) + "</td><td>" + esc(r.customer) + "</td><td>" + (esc(r.date) || "—") + '</td><td class="bd-items">' + r.items.map(function (x) { return '<span class="bd-item">⚠ ' + esc(x) + "</span>"; }).join("") + "</td></tr>"; }).join("") +
        "</tbody></table></div>";
    }
    return grp("crit", "🔴 حرِج · خلال 48 ساعة", "u-crit") + grp("imp", "🟠 مهم · خلال 7 أيام", "u-imp") + grp("fut", "🟡 مستقبلي · بعد 7 أيام", "u-fut") + grp("nodate", "بدون تاريخ وصول", "u-fut");
  }

  // ---------- INVOICE COUNTERS (Phase 5/6 integration, additive) ----------
  function invSummary() {
    var tinv = (window.TransportationInvoiceStore && TransportationInvoiceStore.list) ? TransportationInvoiceStore.list() : [];
    var binv = (window.InvoiceStore && InvoiceStore.list) ? InvoiceStore.list().map(function (r) { return r.invoice || {}; }) : [];
    var all = tinv.concat(binv);
    var gen = all.filter(function (v) { return v.status === "generated" || v.status === "finalized" || v.status === "sent"; }).length;
    var pend = all.filter(function (v) { return v.status === "draft"; }).length;
    var byBid = {}; tinv.forEach(function (v) { byBid[v.booking_id] = v; });
    var miss = files().filter(function (f) { var s = statusOf(f); return (s === "ready" || s === "completed") && !byBid[f.booking_id]; }).length;
    var hotelGen = (window.InvoiceStore && InvoiceStore.list) ? InvoiceStore.list().filter(function (r) { return r.type === "hotel"; }).length : 0;
    function c(n, label, cls) { return '<div class="sum-card ' + cls + '"><div class="sum-n">' + n + '</div><div class="sum-l">' + label + "</div></div>"; }
    return '<div class="sum-grid sum-inv">' + c(gen, "فواتير مُولّدة · Invoices Generated", "s-igen") + c(miss, "فواتير ناقصة · Invoices Missing", "s-imiss") + c(pend, "فواتير قيد الإعداد · Invoices Pending", "s-ipend") + c(hotelGen, "فواتير فنادق · Hotel Invoices", "s-ihotel") + "</div>";
  }

  // ---------- CROSS CHECK LAYER (read-only reconciliation) ----------
  // Source of truth = Confirmed Bookings. Verifies each booking against its
  // Transportation File + Sales Invoice + Operations Invoice. Creates/changes
  // nothing — it only reads the stores and navigates to the missing item.
  function ccBookings() { return (window.CB_DATA && CB_DATA.bookings) ? CB_DATA.bookings : []; }
  function fileState(bid) {
    if (!(window.TransportationFileStore && TransportationFileStore.exists(bid))) return { k: "missing", s: "غير موجود" };
    var f = TransportationFileStore.load(bid) || {}; var st = f.status || (f.ready_to_send ? "ready" : "draft");
    if (st === "cancelled") return { k: "missing", s: "ملغى" };
    if (st === "ready" || st === "completed") return { k: "ok", s: st === "completed" ? "مكتمل" : "جاهز" };
    return { k: "pending", s: "مسودة" };
  }
  function invState(bid, type) {
    var m = (window.InvoiceStore && InvoiceStore.meta) ? InvoiceStore.meta(bid, type) : null;
    if (!m) return { k: "missing", s: "غير موجودة" };
    if (m.status === "cancelled") return { k: "missing", s: "ملغاة" };
    if (m.status === "sent" || m.status === "finalized") return { k: "ok", s: m.status === "finalized" ? "معتمدة" : "مُرسلة" };
    return { k: "pending", s: m.status === "generated" ? "مولّدة (لم تُرسل)" : "مسودة" };
  }
  function ccOverall(tf, sa, op, ho, crit) {
    if (crit === "arrival") return { k: "critical", label: "وصول بلا سائق · Arrival Without Driver" };
    if (crit === "departure") return { k: "critical", label: "مغادرة بلا سائق · Departure Without Driver" };
    if (tf.k === "missing") return { k: "critical", label: "نقص ملف المواصلات · Missing Transportation File" };
    if (op.k === "missing") return { k: "high", label: "نقص فاتورة العمليات · Missing Operations Invoice" };
    if (sa.k === "missing") return { k: "medium", label: "نقص فاتورة المبيعات · Missing Sales Invoice" };
    if (ho.k === "missing") return { k: "low", label: "نقص فاتورة الفنادق · Missing Hotel Invoice" };
    if (tf.k === "pending") return { k: "pending", label: "المواصلات غير جاهزة · Transportation Not Ready" };
    if (sa.k === "pending" || op.k === "pending" || ho.k === "pending") return { k: "pending", label: "فاتورة لم تُرسل · Invoice Not Sent" };
    return { k: "ok", label: "مكتمل · Complete" };
  }
  // Only count bookings that still matter: exclude trips that already ended.
  function ccInWindow(b) {
    var ci = b.check_in || "", co = b.check_out || "", t = today();
    if (co && co < t) return false;                 // finished → never counted (no misleading old numbers)
    if (CC_FILTER === "all") return true;            // all active (not finished)
    if (CC_FILTER === "today") return !ci || ci <= t; // active today / starting today
    var days = ({ "7": 7, "30": 30, "90": 90 })[CC_FILTER] || 90;
    return !ci || ci <= shift(days);                 // starts within N days or already ongoing
  }
  // imminent (today/tomorrow) arrival or departure on an existing file with no driver
  function imminentNoDriver(bid) {
    if (!(window.TransportationFileStore && TransportationFileStore.exists(bid))) return null;
    var f = TransportationFileStore.load(bid) || {}; if (statusOf(f) === "cancelled") return null;
    var t = today(), tom = shift(1);
    var am = firstMv(f, isArr); if (am && (am.date === t || am.date === tom) && !am.driver_id) return "arrival";
    var dm = lastMv(f, isDep); if (dm && (dm.date === t || dm.date === tom) && !dm.driver_id) return "departure";
    return null;
  }
  function crossRows() {
    return ccBookings().filter(ccInWindow).map(function (b) {
      var tf = fileState(b.booking_id), sa = invState(b.booking_id, "sales"), op = invState(b.booking_id, "operations"), ho = invState(b.booking_id, "hotel");
      var crit = imminentNoDriver(b.booking_id);
      return { b: b, tf: tf, sa: sa, op: op, ho: ho, crit: crit, ov: ccOverall(tf, sa, op, ho, crit) };
    });
  }
  var CC_RANK = { critical: 0, high: 1, medium: 2, low: 3, pending: 4, ok: 5 };
  function ccIcon(k) { return k === "ok" ? "✅ " : k === "pending" ? "⚠ " : k === "critical" ? "⛔ " : "🔴 "; }
  function ovIcon(k) { return ({ critical: "⛔ ", high: "🔴 ", medium: "🟠 ", low: "🔵 ", pending: "⚠ ", ok: "✅ " })[k] || ""; }
  function invCount(bid) {
    var n = 0;
    if (window.InvoiceStore) { if (InvoiceStore.meta(bid, "sales")) n++; if (InvoiceStore.meta(bid, "operations")) n++; if (InvoiceStore.meta(bid, "hotel")) n++; }
    if (window.TransportationInvoiceStore && TransportationInvoiceStore.exists(bid)) n++;
    return n;
  }
  function ccCell(state, bid, action) { return '<button type="button" class="cc-cell cc-' + state.k + '" data-cc="' + action + '" data-bid="' + esc(bid) + '">' + ccIcon(state.k) + esc(state.s) + "</button>"; }
  function rowPrimary(r) {
    if (r.crit) return "file";
    if (r.tf.k === "missing" || r.tf.k === "pending") return "file";
    if (r.op.k === "missing" || r.op.k === "pending") return "operations";
    if (r.sa.k === "missing" || r.sa.k === "pending") return "sales";
    if (r.ho.k === "missing" || r.ho.k === "pending") return "hotel";
    return "";
  }
  function driverGaps() {
    var t = today(), tom = shift(1), awd = 0, dwd = 0;
    active().forEach(function (f) {
      var am = firstMv(f, isArr); if (am && (am.date === t || am.date === tom) && !am.driver_id) awd++;
      var dm = lastMv(f, isDep); if (dm && (dm.date === t || dm.date === tom) && !dm.driver_id) dwd++;
    });
    return { awd: awd, dwd: dwd };
  }
  function ccFilterBar() {
    function c(val, label) { return '<button type="button" class="bd-chip' + (CC_FILTER === val ? " on" : "") + '" data-ccf="' + val + '">' + label + "</button>"; }
    return '<div class="bd-datebar">' + c("today", "اليوم") + c("7", "٧ أيام") + c("30", "٣٠ يوم") + c("90", "٩٠ يوم") + c("all", "كل النشِط") + "</div>";
  }
  function crossCheckView() {
    var rows = crossRows(), dg = driverGaps();
    var complete = 0, mtf = 0, msa = 0, mop = 0, pf = 0, pi = 0;
    rows.forEach(function (r) {
      if (r.ov.k === "ok") complete++;
      if (r.tf.k === "missing") mtf++; if (r.sa.k === "missing") msa++; if (r.op.k === "missing") mop++;
      if (r.tf.k === "pending") pf++; if (r.sa.k === "pending" || r.op.k === "pending") pi++;
    });
    function kc(n, label, cls) { return '<div class="sum-card ' + cls + '"><div class="sum-n">' + n + '</div><div class="sum-l">' + label + "</div></div>"; }
    function kcT(n, label, cls, tip) { return '<div class="sum-card ' + cls + '" title="' + esc(tip) + '"><div class="sum-n">' + n + '</div><div class="sum-l">' + label + "</div></div>"; }
    var critRow = '<div class="sum-grid cc-crit">' + kc(dg.awd, "وصول بلا سائق · Arrivals Without Driver", "cc-k-crit") + kc(dg.dwd, "مغادرة بلا سائق · Departures Without Driver", "cc-k-crit") + "</div>";
    var kpis = '<div class="sum-grid cc-kpi">' +
      kc(complete, "حجوزات مكتملة · Complete", "cc-k-ok") + kc(mtf, "نقص ملفات مواصلات · Missing TF", "cc-k-miss") +
      kc(mop, "نقص فواتير عمليات · Missing Ops", "cc-k-miss") + kc(msa, "نقص فواتير مبيعات · Missing Sales", "cc-k-miss") +
      kc(pf, "ملفات قيد الإعداد · Pending Files", "cc-k-pend") + kc(pi, "فواتير قيد الإعداد · Pending Invoices", "cc-k-pend") + "</div>";
    rows.sort(function (a, b) { return CC_RANK[a.ov.k] - CC_RANK[b.ov.k] || String(a.b.booking_id).localeCompare(String(b.b.booking_id)); });
    var shown = (CC_COMP_FILTER === null) ? rows : rows.filter(function (r) { return invCount(r.b.booking_id) === CC_COMP_FILTER; });
    var body = shown.slice(0, 300).map(function (r) {
      var act = rowPrimary(r);
      return '<tr class="cc-row" data-row="' + esc(r.b.booking_id) + '" data-act="' + act + '"><td><b>' + esc(r.b.booking_id) + "</b></td><td>" + esc(r.b.company_name || "—") + "</td><td>" + esc(r.b.guest_name || "—") + "</td><td>" + destAr(r.b.destination) + "</td>" +
        "<td>" + ccCell(r.tf, r.b.booking_id, "file") + "</td><td>" + ccCell(r.sa, r.b.booking_id, "sales") + "</td><td>" + ccCell(r.op, r.b.booking_id, "operations") + "</td><td>" + ccCell(r.ho, r.b.booking_id, "hotel") + "</td>" +
        '<td><span class="cc-ov cc-' + r.ov.k + '">' + ovIcon(r.ov.k) + esc(r.ov.label.split(" · ")[0]) + "</span></td></tr>";
    }).join("");
    var comp = { 4: 0, 3: 0, 2: 0, 1: 0, 0: 0 };
    rows.forEach(function (r) { comp[invCount(r.b.booking_id)]++; });
    function compCard(n, label, cls, tip, val) { return '<div class="sum-card ' + cls + (CC_COMP_FILTER === val ? " comp-on" : "") + '" title="' + esc(tip) + '" data-comp="' + val + '"><div class="sum-n">' + n + '</div><div class="sum-l">' + label + "</div></div>"; }
    var compRow = '<div class="cc-comp-h">اكتمال الفواتير · Invoice Completeness (المبيعات · العمليات · المواصلات · الفنادق) — اضغط أي كرت لتصفية الجدول' + (CC_COMP_FILTER !== null ? ' · <a href="#" data-comp="clear" class="cc-clear">إلغاء التصفية ✕</a>' : "") + '</div><div class="sum-grid cc-comp">' +
      compCard(comp[4], "4 من 4 · مكتملة", "cc-c4", "كل الفواتير الأربع موجودة: المبيعات والعمليات والمواصلات والفنادق", 4) +
      compCard(comp[3], "3 من 4", "cc-c3", "ثلاث فواتير موجودة — تنقص فاتورة واحدة", 3) +
      compCard(comp[2], "2 من 4", "cc-c2", "فاتورتان موجودتان — تنقص فاتورتان", 2) +
      compCard(comp[1], "1 من 4", "cc-c1", "فاتورة واحدة فقط — تنقص ثلاث فواتير", 1) +
      compCard(comp[0], "0 من 4", "cc-c0", "لا توجد أي فاتورة لهذا الحجز", 0) + "</div>";
    return ccFilterBar() + critRow + kpis + compRow + '<p class="bd-note">المصدر: الحجوزات المؤكدة (ضمن النافذة المختارة — تُستبعد الحجوزات المنتهية). الأولوية: ⛔ حرِج (لا سائق / لا ملف) ← 🔴 عمليات ← 🟠 مبيعات ← 🔵 فنادق. اضغط أي صف أو خلية لفتح العنصر الناقص. (قراءة فقط)</p>' +
      '<div class="bd-card"><table class="bd-tbl cc-tbl"><thead><tr><th>رقم الحجز</th><th>الشركة</th><th>العميل</th><th>الوجهة</th><th>ملف المواصلات</th><th>فاتورة المبيعات</th><th>فاتورة العمليات</th><th>فاتورة الفنادق</th><th>الحالة العامة</th></tr></thead><tbody>' +
      (body || '<tr><td colspan="9" class="bd-empty">لا حجوزات ضمن هذه النافذة' + (CC_COMP_FILTER !== null ? " / التصفية" : "") + ".</td></tr>") + "</tbody></table></div>";
  }
  function ccPost(type, extra) { var msg = { type: type }; if (extra) Object.keys(extra).forEach(function (k) { msg[k] = extra[k]; }); try { (window.parent && window.parent !== window ? window.parent : window).postMessage(msg, "*"); } catch (e) {} }
  function wireCrossCheck() {
    Array.prototype.forEach.call(document.querySelectorAll("[data-ccf]"), function (b) { b.addEventListener("click", function () { CC_FILTER = b.getAttribute("data-ccf"); render(); }); });
    Array.prototype.forEach.call(document.querySelectorAll("[data-comp]"), function (b) {
      b.addEventListener("click", function (e) { e.preventDefault(); var v = b.getAttribute("data-comp"); if (v === "clear") { CC_COMP_FILTER = null; } else { var n = parseInt(v, 10); CC_COMP_FILTER = (CC_COMP_FILTER === n) ? null : n; } render(); });
    });
    function openFor(bid, what) {
      var bk = ccBookings().filter(function (x) { return x.booking_id === bid; })[0] || { booking_id: bid };
      if (what === "file") ccPost("open-transport-file", { bookingId: bid, booking: bk });
      else if (what === "sales" || what === "operations") ccPost("open-invoice-center", { bookingId: bid, invType: what, booking: bk });
    }
    Array.prototype.forEach.call(document.querySelectorAll("[data-cc]"), function (btn) {
      btn.addEventListener("click", function (e) { e.stopPropagation(); openFor(btn.getAttribute("data-bid"), btn.getAttribute("data-cc")); });
    });
    Array.prototype.forEach.call(document.querySelectorAll(".cc-row"), function (tr) {
      tr.addEventListener("click", function () { var act = tr.getAttribute("data-act"); if (act) openFor(tr.getAttribute("data-row"), act); });
    });
  }

  function render() {
    function tab(key, label) { return '<button type="button" class="bd-tab' + (TAB === key ? " on" : "") + '" data-tab="' + key + '">' + label + "</button>"; }
    var view = TAB === "departures" ? departuresView() : TAB === "tomorrow" ? tomorrowOpsView() : TAB === "forecast" ? forecastView() : TAB === "workload" ? workloadView() : TAB === "missing" ? missingView() : TAB === "crosscheck" ? crossCheckView() : arrivalsView();
    el("boardRoot").innerHTML =
      '<div class="bd-head"><div><h1>اللوحات اليومية · Daily Boards</h1>' +
      '<p class="bd-sub">عمليات المواصلات في شاشة واحدة — من ملفات المواصلات الفعلية</p></div></div>' +
      summaryCards() + opsKpiCards() + invSummary() +
      '<div class="bd-tabs">' +
      tab("arrivals", "الوصولات · Arrivals") + tab("departures", "المغادرات · Departures") +
      tab("tomorrow", "عمليات الغد · Tomorrow") + tab("forecast", "توقّع ٧ أيام · Forecast") +
      tab("workload", "أحمال السائقين · Driver Workload") + tab("missing", "النواقص · Missing") +
      tab("crosscheck", "التحقق الشامل · Cross Check") + "</div>" +
      view;

    Array.prototype.forEach.call(document.querySelectorAll("[data-tab]"), function (b) { b.addEventListener("click", function () { TAB = b.getAttribute("data-tab"); render(); }); });
    Array.prototype.forEach.call(document.querySelectorAll("[data-date]"), function (b) { b.addEventListener("click", function () { BOARD_DATE = b.getAttribute("data-date"); render(); }); });
    if (el("bdDate")) el("bdDate").addEventListener("change", function () { BOARD_DATE = this.value; render(); });
    Array.prototype.forEach.call(document.querySelectorAll("[data-openfile]"), function (btn) {
      btn.addEventListener("click", function (e) {
        e.stopPropagation(); var bid = btn.getAttribute("data-openfile");
        var bk = ((window.CB_DATA && CB_DATA.bookings) ? CB_DATA.bookings.filter(function (x) { return x.booking_id === bid; })[0] : null) || { booking_id: bid };
        ccPost("open-transport-file", { bookingId: bid, booking: bk });
      });
    });
    if (TAB === "crosscheck") wireCrossCheck();
  }

  document.addEventListener("DOMContentLoaded", function () { BOARD_DATE = today(); render(); });
})();
