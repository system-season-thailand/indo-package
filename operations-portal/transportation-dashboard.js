/* Transportation Operations Dashboard (Phase 3)
 * READ-ONLY reporting over confirmed bookings + transportation files.
 * Does NOT modify Confirmed Booking, Program Source, Travel Book, Pricing,
 * PDF templates, Companies, Quotations, or Driver Assignment logic.
 */
(function () {
  "use strict";
  var COUNTRIES = [["indonesia", "إندونيسيا"], ["thailand", "تايلاند"], ["maldives", "المالديف"]];
  var KPI_RANGE = "all", FUTURE_DATE = "";
  function el(id) { return document.getElementById(id); }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  // Phase 4: statistics come from ACTUAL transportation files, not sample data.
  function statusOf(f) { return (f && f.status) || (f && f.ready_to_send ? "ready" : "draft"); }
  function isArr(t) { return t === "airport_arrival" || t === "airport_pickup"; }
  function isDep(t) { return t === "airport_departure" || t === "airport_dropoff"; }
  function mvDate(f, pred, fb) { var ms = (f && f.movements) || []; for (var i = 0; i < ms.length; i++) if (pred(ms[i].type)) return ms[i].date || fb; return fb; }
  function bookings() {
    var list = (window.TransportationFileStore && TransportationFileStore.list) ? TransportationFileStore.list() : [];
    return list.filter(function (f) { return statusOf(f) !== "cancelled"; }).map(function (f) {
      return {
        booking_id: f.booking_id,
        destination: f.destination_id || "",
        check_in: mvDate(f, isArr, (f.dates && f.dates.start) || ""),
        check_out: mvDate(f, isDep, (f.dates && f.dates.end) || ""),
        pax: f.pax,
        guest_name: f.customer_name || ""
      };
    });
  }
  function iso(d) { return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); }
  function today() { return iso(new Date()); }
  function shift(n) { var d = new Date(); d.setDate(d.getDate() + n); return iso(d); }
  function num(v) { var n = parseInt(v, 10); return isNaN(n) ? 0 : n; }

  // ---- aggregation: distinct customers / bookings / passengers per country ----
  function agg(list) {
    var g = {}; COUNTRIES.forEach(function (c) { g[c[0]] = { cust: {}, b: 0, p: 0 }; });
    list.forEach(function (bk) {
      var c = bk.destination; if (!g[c]) return;
      g[c].b++; g[c].p += num(bk.pax);
      g[c].cust[bk.guest_name || bk.company_name || bk.booking_id] = 1;
    });
    return g;
  }
  function rowsFor(g) { return COUNTRIES.map(function (c) { var x = g[c[0]]; return { name: c[1], customers: Object.keys(x.cust).length, bookings: x.b, pax: x.p }; }); }
  function tbl(rows) {
    var tot = rows.reduce(function (a, r) { return { customers: a.customers + r.customers, bookings: a.bookings + r.bookings, pax: a.pax + r.pax }; }, { customers: 0, bookings: 0, pax: 0 });
    return '<table class="dash-tbl"><thead><tr><th>الوجهة</th><th>عملاء</th><th>حجوزات</th><th>مسافرون</th></tr></thead><tbody>' +
      rows.map(function (r) { return "<tr><td>" + r.name + "</td><td>" + r.customers + "</td><td>" + r.bookings + "</td><td>" + r.pax + "</td></tr>"; }).join("") +
      '<tr class="dash-tot"><td>الإجمالي</td><td>' + tot.customers + "</td><td>" + tot.bookings + "</td><td>" + tot.pax + "</td></tr>" +
      "</tbody></table>";
  }
  function byField(field, pred) { return bookings().filter(function (b) { return b[field] && pred(b[field]); }); }

  // ---- KPI over transportation FILES, by file arrival date in selected range ----
  function rangePred(mode) {
    var t = today();
    if (mode === "all") return function () { return true; };
    if (mode === "today") return function (d) { return d === t; };
    if (mode === "tomorrow") return function (d) { return d === shift(1); };
    if (mode === "week") return function (d) { return d >= t && d <= shift(6); };
    if (mode === "month") return function (d) { return String(d).slice(0, 7) === t.slice(0, 7); };
    return function () { return true; };
  }
  function kpi(mode) {
    var pred = rangePred(mode), c = { total: 0, draft: 0, ready: 0, completed: 0, cancelled: 0 };
    if (!window.TransportationFileStore) return c;
    bookings().forEach(function (b) {
      if (!TransportationFileStore.exists(b.booking_id)) return;
      var f = TransportationFileStore.load(b.booking_id) || {};
      var d = (f.dates && f.dates.start) || b.check_in || "";
      if (!pred(d)) return;
      var s = f.status || (f.ready_to_send ? "ready" : "draft");
      c.total++; if (c[s] != null) c[s]++;
    });
    return c;
  }

  function kchip(key, label) { return '<button type="button" class="dash-chip' + (KPI_RANGE === key ? " on" : "") + '" data-kpi="' + key + '">' + label + "</button>"; }
  function card(label, val, cls) { return '<div class="kpi-card ' + (cls || "") + '"><div class="kpi-n">' + val + '</div><div class="kpi-l">' + label + "</div></div>"; }
  function block(title, rows) { return '<div class="dash-card"><div class="dash-h">' + title + "</div>" + tbl(rows) + "</div>"; }

  function render() {
    var t = today(), tom = shift(1), w6 = shift(6);
    var k = kpi(KPI_RANGE);

    var arrToday = rowsFor(agg(byField("check_in", function (d) { return d === t; })));
    var arrTom = rowsFor(agg(byField("check_in", function (d) { return d === tom; })));
    var arrWeek = rowsFor(agg(byField("check_in", function (d) { return d >= t && d <= w6; })));
    var depToday = rowsFor(agg(byField("check_out", function (d) { return d === t; })));
    var depTom = rowsFor(agg(byField("check_out", function (d) { return d === tom; })));
    var depWeek = rowsFor(agg(byField("check_out", function (d) { return d >= t && d <= w6; })));

    var fdate = FUTURE_DATE || "";
    var futureRows = fdate ? rowsFor(agg(byField("check_in", function (d) { return d === fdate; }))) : null;

    el("dashRoot").innerHTML =
      '<div class="dash-head"><div><h1>لوحة عمليات المواصلات · Transportation Operations</h1>' +
      '<p class="dash-sub">إحصاءات الوصول والمغادرة وحالة ملفات المواصلات · تاريخ اليوم ' + t + "</p></div></div>" +

      // KPI panel
      '<div class="dash-card"><div class="dash-h">مؤشرات ملفات المواصلات · KPIs <span class="dash-muted">(حسب النطاق)</span></div>' +
      '<div class="dash-chips">' + kchip("today", "اليوم") + kchip("tomorrow", "غداً") + kchip("week", "هذا الأسبوع") + kchip("month", "هذا الشهر") + kchip("all", "الكل") + "</div>" +
      '<div class="kpi-grid">' +
      card("إجمالي الملفات · Total", k.total, "k-total") +
      card("مسودة · Draft", k.draft, "k-draft") +
      card("جاهز · Ready", k.ready, "k-ready") +
      card("مكتمل · Completed", k.completed, "k-completed") +
      card("ملغى · Cancelled", k.cancelled, "k-cancelled") +
      "</div></div>" +

      // Arrivals
      '<h2 class="dash-sec">الوصول · Arrivals</h2>' +
      '<div class="dash-3">' + block("اليوم · Today", arrToday) + block("غداً · Tomorrow", arrTom) + block("خلال 7 أيام · Next 7 Days", arrWeek) + "</div>" +

      // Departures
      '<h2 class="dash-sec">المغادرة · Departures</h2>' +
      '<div class="dash-3">' + block("اليوم · Today", depToday) + block("غداً · Tomorrow", depTom) + block("خلال 7 أيام · Next 7 Days", depWeek) + "</div>" +

      // Future calendar
      '<h2 class="dash-sec">بحث وصول بتاريخ مستقبلي · Future Arrival Lookup</h2>' +
      '<div class="dash-card"><div class="dash-future"><label>اختر التاريخ <input type="date" id="futureDate" value="' + esc(fdate) + '"></label></div>' +
      (futureRows ? '<div class="dash-future-res"><div class="dash-h">وصول بتاريخ ' + esc(fdate) + "</div>" + tbl(futureRows) + "</div>" : '<p class="dash-empty">اختر تاريخاً لعرض أعداد الوصول لكل وجهة.</p>') +
      "</div>";

    Array.prototype.forEach.call(document.querySelectorAll("[data-kpi]"), function (c) {
      c.addEventListener("click", function () { KPI_RANGE = c.getAttribute("data-kpi"); render(); });
    });
    if (el("futureDate")) el("futureDate").addEventListener("change", function () { FUTURE_DATE = this.value; render(); });
  }

  document.addEventListener("DOMContentLoaded", render);
})();
