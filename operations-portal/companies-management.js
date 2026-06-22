/* =====================================================================
   companies-management.js
   Standalone PROTOTYPE — Companies Management (CRM) center.
   Reads window.CM_DATA (sample only). No backend, no writes.
   Role context via URL: ?role=management (default) | ?role=sales&emp=E1
   ===================================================================== */
(function () {
  "use strict";

  /* SAMPLE DATA SOURCE → reads window.CM_DATA (company_id is the master key).
     FUTURE SUPABASE DATA SOURCE: swap the data file; keep the shape.
     DO NOT WRITE IN LAB MODE — read & analyse only. */
  var D = window.CM_DATA || {};
  var ALL = (D.companies || []).slice();
  var CUR = (D.meta && D.meta.currency) || "ر.س";

  var STATUS = {
    vip: { label: "VIP", cls: "st-vip" }, growing: { label: "نامية", cls: "st-grow" },
    active: { label: "نشطة", cls: "st-ok" }, at_risk: { label: "في خطر", cls: "st-warn" },
    inactive: { label: "خاملة", cls: "st-bad" }
  };

  var params = new URLSearchParams(location.search);
  var ROLE = params.get("role") || "management";
  var salesMode = ROLE !== "management";
  var state = {
    emp: params.get("emp") || (D.salesEmployees && D.salesEmployees[0] && D.salesEmployees[0].id) || "E1",
    q: "", country: "all", sales: "all", status: "all", dest: "all", activity: "all", openId: null
  };

  /* ---------- helpers ----------------------------------------------- */
  function el(id) { return document.getElementById(id); }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]; }); }
  function fmtInt(n) { return Math.round(n).toLocaleString("en-US"); }
  function trim(x) { var v = x >= 10 ? x.toFixed(0) : x.toFixed(1); return v.replace(/\.0$/, ""); }
  function money(n) { var a = Math.abs(n); if (a >= 1e6) return trim(n / 1e6) + " مليون " + CUR; if (a >= 1e3) return trim(n / 1e3) + " ألف " + CUR; return fmtInt(n) + " " + CUR; }
  function pct(x) { return Math.round(x * 100) + "%"; }
  var AR = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
  function arNum(n) { return String(n).split("").map(function (d) { return /\d/.test(d) ? AR[+d] : d; }).join(""); }
  function destName(id) { var d = (D.destinations || []).filter(function (x) { return x.id === id; })[0]; return d ? d.name : id; }
  function statusChip(s) { var m = STATUS[s] || { label: s, cls: "" }; return '<span class="cm-chip ' + m.cls + '">' + m.label + "</span>"; }
  function growthTag(g) { var cls = g > 0 ? "g-up" : g < 0 ? "g-dn" : "g-flat"; return '<span class="' + cls + '">' + (g > 0 ? "▲ +" : g < 0 ? "▼ " : "") + arNum(Math.abs(g)) + "%</span>"; }
  function riskOf(c) { var d = c.days_since_last_quotation; if (d <= 30) return { cls: "risk-green", label: "نشطة" }; if (d <= 60) return { cls: "risk-yellow", label: "تنبيه" }; return { cls: "risk-red", label: "خطر" }; }
  function empName(id) { var e = (D.salesEmployees || []).filter(function (x) { return x.id === id; })[0]; return e ? e.name : id; }

  // working view (sales mode → only assigned companies)
  function view() { return salesMode ? ALL.filter(function (c) { return c.assigned_sales_employee_id === state.emp; }) : ALL; }

  function rankCard(title, items, fmt) {
    var body = items.length ? items.map(function (it, i) {
      return '<div class="rk-row"><span class="rk-i">' + arNum(i + 1) + '</span><span class="rk-name">' + esc(it.name) + '</span><span class="rk-v">' + esc(fmt(it.value)) + "</span></div>";
    }).join("") : '<p class="empty">—</p>';
    return '<div class="card rk-card"><h3 class="card-title"><span class="pip"></span>' + esc(title) + "</h3>" + body + "</div>";
  }
  function rankBars(items, color, fmt) {
    var max = Math.max.apply(null, items.map(function (i) { return i.value; }).concat([1]));
    return '<div class="rank">' + items.map(function (it) {
      var w = (it.value / max) * 100;
      var bar = '<span class="rank-track"><i style="width:' + w.toFixed(1) + "%;background:" + color + ';"></i></span>';
      return '<div class="rank-row"><div class="rank-top"><span class="rank-name">' + esc(it.label) + '</span><span class="rank-val">' + esc(fmt ? fmt(it.value) : fmtInt(it.value)) + "</span></div>" + bar + "</div>";
    }).join("") + "</div>";
  }

  /* ---------- 1 · Executive Summary --------------------------------- */
  function renderSummary() {
    var V = view(), by = {};
    V.forEach(function (c) { by[c.company_status] = (by[c.company_status] || 0) + 1; });
    var cards = [
      ["إجمالي الشركات", arNum(V.length), ""],
      ["VIP", arNum(by.vip || 0), "vip"],
      ["نامية", arNum(by.growing || 0), "grow"],
      ["نشطة", arNum(by.active || 0), "ok"],
      ["في خطر", arNum(by.at_risk || 0), "warn"],
      ["خاملة", arNum(by.inactive || 0), "bad"]
    ];
    el("summaryGrid").innerHTML = cards.map(function (c) { return '<div class="kpi ' + (c[2] ? "kpi-" + c[2] : "") + '"><span class="kpi-v">' + c[1] + '</span><span class="kpi-k">' + c[0] + "</span></div>"; }).join("");
  }

  /* ---------- 2 · Company Directory --------------------------------- */
  function applyFilters() {
    var V = view(), term = state.q.trim();
    return V.filter(function (c) {
      if (state.country !== "all" && c.country !== state.country) return false;
      if (!salesMode && state.sales !== "all" && c.assigned_sales_employee_id !== state.sales) return false;
      if (state.status !== "all" && c.company_status !== state.status) return false;
      if (state.dest !== "all" && c.preferred_destination !== state.dest) return false;
      if (state.activity !== "all" && riskOf(c).cls !== "risk-" + state.activity) return false;
      if (term && (c.company_name + " " + c.city + " " + c.assigned_sales_employee).indexOf(term) === -1) return false;
      return true;
    });
  }
  function renderDirectory() {
    var rows = applyFilters();
    var body = rows.map(function (c) {
      var rk = riskOf(c);
      return '<tr class="clickable" data-cid="' + esc(c.company_id) + '">' +
        '<td class="name">' + esc(c.company_name) + "</td>" +
        "<td>" + esc(c.country) + " · " + esc(c.city) + "</td>" +
        "<td>" + esc(c.assigned_sales_employee) + "</td>" +
        "<td>" + statusChip(c.company_status) + "</td>" +
        "<td>" + arNum(c.total_quotations) + "</td>" +
        "<td>" + arNum(c.confirmed_bookings) + "</td>" +
        "<td>" + pct(c.conversion_rate) + "</td>" +
        "<td>" + money(c.total_sales_value) + "</td>" +
        '<td><span class="dot ' + rk.cls + '" title="' + rk.label + '"></span></td></tr>';
    }).join("");
    el("dirTable").innerHTML = rows.length
      ? '<div class="table-scroll"><table class="tbl"><thead><tr><th>الشركة</th><th>الدولة · المدينة</th><th>الموظف المسؤول</th><th>الحالة</th><th>العروض</th><th>الحجوزات</th><th>التحويل</th><th>الإيراد</th><th>النشاط</th></tr></thead><tbody>' + body + "</tbody></table></div>"
      : '<p class="empty">لا توجد شركات مطابقة.</p>';
    el("dirCount").textContent = arNum(rows.length) + " شركة";
  }

  /* ---------- 3 · Company 360 Profile -------------------------------- */
  function group(title, rows) {
    return '<div class="pf-group"><h4 class="pf-h">' + esc(title) + '</h4><div class="pf-grid">' +
      rows.map(function (r) { return '<div class="pf-cell"><span class="pf-k">' + r[0] + '</span><span class="pf-v">' + r[1] + "</span></div>"; }).join("") + "</div></div>";
  }
  function openProfile(id) {
    var c = ALL.filter(function (x) { return x.company_id === id; })[0]; if (!c) return;
    if (salesMode && c.assigned_sales_employee_id !== state.emp) return;   // sales sees only assigned
    state.openId = id;
    var rk = riskOf(c);
    var info = group("معلومات الشركة", [
      ["المعرّف", '<b class="cm-key">' + esc(c.company_id) + "</b>"], ["الاسم", esc(c.company_name)],
      ["الدولة · المدينة", esc(c.country) + " · " + esc(c.city)], ["الموظف المسؤول", esc(c.assigned_sales_employee)],
      ["الحالة", statusChip(c.company_status)], ["تاريخ التسجيل", esc(c.registration_date)],
      ["آخر نشاط", esc(c.last_activity_date) + ' <span class="dot ' + rk.cls + '"></span>']
    ]);
    var sales = group("أداء المبيعات", [["إجمالي العروض", arNum(c.total_quotations)], ["إجمالي قيمة المبيعات", money(c.total_sales_value)], ["اتجاه النمو", growthTag(c.growth_pct)]]);
    var booking = group("أداء الحجوزات", [["الحجوزات المؤكّدة", arNum(c.confirmed_bookings)], ["متوسط قيمة الحجز", money(c.average_booking_value)]]);
    var conv = group("أداء التحويل", [["نسبة التحويل", pct(c.conversion_rate)], ["عروض ↦ حجوزات", arNum(c.total_quotations) + " ↦ " + arNum(c.confirmed_bookings)]]);
    var dest = group("تفضيل الوجهة", [["الوجهة المفضّلة", esc(destName(c.preferred_destination))]]);
    var hotel = group("الفنادق المفضّلة", [["الفنادق", esc((c.preferred_hotels || []).join("، ") || "—")]]);
    var timeline = group("الخط الزمني للنشاط", [
      ["آخر عرض سعر", esc(c.last_quotation_date)], ["آخر حجز", esc(c.last_booking_date)],
      ["أيام منذ آخر عرض", arNum(c.days_since_last_quotation)], ["أيام منذ آخر حجز", arNum(c.days_since_last_booking)],
      ["مؤشّر النشاط", '<b class="' + (c.activity_score >= 60 ? "g-up" : c.activity_score >= 35 ? "g-flat" : "g-dn") + '">' + arNum(c.activity_score) + "/١٠٠</b>"],
      ["مستوى الخطر", '<span class="risk-pill ' + rk.cls + '">' + rk.label + "</span>"]
    ]);
    var notes = '<div class="pf-group"><h4 class="pf-h">ملاحظات</h4><p class="pf-note">' + esc(c.notes || "—") + "</p></div>";
    var btns = ["عرض العروض", "عرض الحجوزات", "توليد فاتورة", "توليد تقرير الشركة"]
      .map(function (b) { return '<button type="button" class="gen-btn" disabled title="قريباً — يرتبط لاحقاً عبر company_id">' + b + "</button>"; }).join("");

    el("profileModal").innerHTML =
      '<div class="cm-backdrop" data-close="1"></div>' +
      '<div class="cm-panel" role="dialog" aria-modal="true">' +
        '<div class="cm-head"><div><h3 class="cm-title">' + esc(c.company_name) + '</h3><span class="cm-360">ملف الشركة 360°</span></div>' +
          '<button type="button" class="cm-close" data-close="1" aria-label="إغلاق">✕</button></div>' +
        info + sales + booking + conv + dest + hotel + timeline + notes +
        '<div class="pf-actions"><h4 class="pf-h">إجراءات (تُفعّل لاحقاً)</h4><div class="gen-grid">' + btns + '</div>' +
          '<p class="bp-hint">الأزرار معطّلة الآن — ستُربط لاحقاً عبر company_id.</p></div>' +
      "</div>";
    el("profileModal").hidden = false;
    document.body.classList.add("modal-open");
  }
  function closeProfile() { var m = el("profileModal"); if (m) { m.hidden = true; m.innerHTML = ""; } document.body.classList.remove("modal-open"); state.openId = null; }

  /* ---------- 4 · Top Companies (management) ------------------------- */
  function renderTop() {
    function top(metric, n) {
      return ALL.slice().sort(function (a, b) { return metric(b) - metric(a); }).slice(0, n || 5).map(function (c) { return { name: c.company_name, value: metric(c) }; });
    }
    el("topGrid").innerHTML =
      rankCard("الأكثر عروضاً", top(function (c) { return c.total_quotations; }), function (v) { return arNum(v) + " عرض"; }) +
      rankCard("الأكثر حجوزاً", top(function (c) { return c.confirmed_bookings; }), function (v) { return arNum(v) + " حجز"; }) +
      rankCard("أعلى تحويل", top(function (c) { return c.conversion_rate; }), function (v) { return pct(v); }) +
      rankCard("أعلى إيراد", top(function (c) { return c.total_sales_value; }), function (v) { return money(v); }) +
      rankCard("الأسرع نمواً", top(function (c) { return c.growth_pct; }), function (v) { return (v > 0 ? "+" : "") + arNum(v) + "%"; });
  }

  /* ---------- 5 · Sales Employee Analysis (management) -------------- */
  function renderEmployees() {
    var map = {};
    (D.salesEmployees || []).forEach(function (e) { map[e.id] = { name: e.name, companies: 0, active: 0, inactive: 0, q: 0, b: 0, value: 0, conv: 0 }; });
    ALL.forEach(function (c) {
      var m = map[c.assigned_sales_employee_id]; if (!m) return;
      m.companies++; m.q += c.total_quotations; m.b += c.confirmed_bookings; m.value += c.total_sales_value;
      if (c.days_since_last_quotation <= 30) m.active++; if (c.days_since_last_quotation > 60) m.inactive++;
    });
    var rows = Object.keys(map).map(function (k) { return map[k]; }).sort(function (a, b) { return b.value - a.value; });
    var body = rows.map(function (m) {
      var conv = m.q ? m.b / m.q : 0;
      return "<tr><td class='name'>" + esc(m.name) + "</td><td>" + arNum(m.companies) + "</td><td>" + arNum(m.active) +
        "</td><td>" + arNum(m.inactive) + "</td><td>" + arNum(m.q) + "</td><td>" + arNum(m.b) + "</td><td>" + pct(conv) + "</td><td>" + money(m.value) + "</td></tr>";
    }).join("");
    el("empTable").innerHTML = '<div class="table-scroll"><table class="tbl"><thead><tr><th>الموظف</th><th>الشركات</th><th>نشطة</th><th>خاملة</th><th>العروض</th><th>الحجوزات</th><th>التحويل</th><th>الإيراد</th></tr></thead><tbody>' + body + "</tbody></table></div>";
  }

  /* ---------- 6 · Activity Analysis (both modes) -------------------- */
  function renderActivity() {
    var V = view();
    var g = 0, y = 0, r = 0;
    V.forEach(function (c) { var k = riskOf(c).cls; if (k === "risk-green") g++; else if (k === "risk-yellow") y++; else r++; });
    el("activityLegend").innerHTML =
      '<span class="leg"><span class="dot risk-green"></span>نشطة خلال ٣٠ يوماً · ' + arNum(g) + "</span>" +
      '<span class="leg"><span class="dot risk-yellow"></span>بلا نشاط ٣٠–٦٠ يوماً · ' + arNum(y) + "</span>" +
      '<span class="leg"><span class="dot risk-red"></span>بلا نشاط أكثر من ٦٠ يوماً · ' + arNum(r) + "</span>";
    var rows = V.slice().sort(function (a, b) { return b.days_since_last_quotation - a.days_since_last_quotation; }).map(function (c) {
      var rk = riskOf(c);
      return '<tr class="clickable" data-cid="' + esc(c.company_id) + '"><td class="name">' + esc(c.company_name) + "</td><td>" + esc(c.last_activity_date) +
        "</td><td>" + arNum(c.days_since_last_quotation) + "</td><td>" + arNum(c.days_since_last_booking) + "</td><td>" + arNum(c.activity_score) +
        '</td><td><span class="risk-pill ' + rk.cls + '">' + rk.label + "</span></td></tr>";
    }).join("");
    el("activityTable").innerHTML = '<div class="table-scroll"><table class="tbl"><thead><tr><th>الشركة</th><th>آخر نشاط</th><th>أيام منذ آخر عرض</th><th>أيام منذ آخر حجز</th><th>مؤشّر النشاط</th><th>الخطر</th></tr></thead><tbody>' + rows + "</tbody></table></div>";
  }

  /* ---------- 7 · Destination Analysis (management) ----------------- */
  function renderDestinations() {
    var cards = (D.destinations || []).map(function (d) {
      var cs = ALL.filter(function (c) { return c.preferred_destination === d.id; });
      var q = cs.reduce(function (t, c) { return t + c.total_quotations; }, 0);
      var rev = cs.reduce(function (t, c) { return t + c.total_sales_value; }, 0);
      var gr = cs.length ? Math.round(cs.reduce(function (t, c) { return t + c.growth_pct; }, 0) / cs.length) : 0;
      return '<div class="card dest-card"><h3 class="card-title"><span class="pip"></span>' + esc(d.name) + "</h3>" +
        '<div class="dest-stats"><div><b>' + arNum(cs.length) + "</b><span>شركة مفضِّلة</span></div>" +
        "<div><b>" + arNum(q) + "</b><span>إجمالي العروض</span></div>" +
        "<div><b>" + money(rev) + "</b><span>الإيراد</span></div>" +
        "<div><b>" + growthTag(gr) + "</b><span>متوسط النمو</span></div></div></div>";
    }).join("");
    el("destGrid").innerHTML = cards;
  }

  /* ---------- 8 · Hotel Analysis (management) ----------------------- */
  function renderHotels() {
    var hc = {}, bc = {}, hv = {}, hvn = {};
    ALL.forEach(function (c) {
      (c.preferred_hotels || []).forEach(function (h) {
        hc[h] = (hc[h] || 0) + 1;
        hv[h] = (hv[h] || 0) + c.average_booking_value; hvn[h] = (hvn[h] || 0) + 1;
        var hotel = (D.hotels || []).filter(function (x) { return x.name === h; })[0];
        if (hotel) bc[hotel.brand] = (bc[hotel.brand] || 0) + 1;
      });
    });
    var hotelsR = Object.keys(hc).map(function (k) { return { label: k, value: hc[k] }; }).sort(function (a, b) { return b.value - a.value; }).slice(0, 7);
    var brandsR = Object.keys(bc).map(function (k) { return { label: k, value: bc[k] }; }).sort(function (a, b) { return b.value - a.value; });
    var avgR = Object.keys(hv).map(function (k) { return { label: k, value: Math.round(hv[k] / hvn[k]) }; }).sort(function (a, b) { return b.value - a.value; }).slice(0, 7);
    el("hotelRank").innerHTML = rankBars(hotelsR, "#c9a24b", function (v) { return arNum(v) + " شركة"; });
    el("brandRank").innerHTML = rankBars(brandsR, "#4fb3a0", function (v) { return arNum(v); });
    el("hotelAvg").innerHTML = rankBars(avgR, "#e2c57e", function (v) { return money(v); });
  }

  /* ---------- 9 · Growth Opportunities (management) ----------------- */
  function renderGrowth() {
    var medQ = ALL.map(function (c) { return c.total_quotations; }).sort(function (a, b) { return a - b; })[Math.floor(ALL.length / 2)] || 0;
    var opps = ALL.filter(function (c) { return c.total_quotations >= medQ && c.conversion_rate < 0.25; })
      .sort(function (a, b) { return b.total_quotations - a.total_quotations; });
    el("growthBody").innerHTML = opps.length ? '<div class="table-scroll"><table class="tbl"><thead><tr><th>الشركة</th><th>الموظف المسؤول</th><th>العروض</th><th>التحويل</th><th>الإيراد</th><th></th></tr></thead><tbody>' +
      opps.map(function (c) {
        return '<tr class="clickable" data-cid="' + esc(c.company_id) + '"><td class="name">' + esc(c.company_name) + "</td><td>" + esc(c.assigned_sales_employee) +
          "</td><td>" + arNum(c.total_quotations) + '</td><td><span class="g-dn">' + pct(c.conversion_rate) + "</span></td><td>" + money(c.total_sales_value) +
          '</td><td><span class="flag-attn">يحتاج اهتمام</span></td></tr>';
      }).join("") + "</tbody></table></div>" : '<p class="empty">لا توجد شركات مطابقة حالياً.</p>';
    el("growthNote").textContent = "حجم عروض مرتفع مع تحويل منخفض (<٢٥٪) — فرص يجب أن تتابعها الإدارة. عددها: " + arNum(opps.length);
  }

  /* ---------- 10 · Lost Companies (management) ---------------------- */
  function renderLost() {
    var lost = ALL.filter(function (c) { return c.days_since_last_quotation > 60 && c.days_since_last_booking > 90; })
      .sort(function (a, b) { return b.days_since_last_quotation - a.days_since_last_quotation; });
    el("lostBody").innerHTML = lost.length ? '<div class="table-scroll"><table class="tbl"><thead><tr><th>الشركة</th><th>الموظف المسؤول</th><th>أيام منذ آخر عرض</th><th>أيام منذ آخر حجز</th><th>آخر نشاط</th></tr></thead><tbody>' +
      lost.map(function (c) {
        return '<tr class="clickable" data-cid="' + esc(c.company_id) + '"><td class="name">' + esc(c.company_name) + "</td><td>" + esc(c.assigned_sales_employee) +
          '</td><td><span class="g-dn">' + arNum(c.days_since_last_quotation) + "</span></td><td><span class=\"g-dn\">" + arNum(c.days_since_last_booking) + "</span></td><td>" + esc(c.last_activity_date) + "</td></tr>";
      }).join("") + "</tbody></table></div>" : '<p class="empty">لا توجد شركات مفقودة.</p>';
    el("lostNote").textContent = "لا عروض منذ ٦٠+ يوماً ولا حجوزات منذ ٩٠+ يوماً. عددها: " + arNum(lost.length);
  }

  /* ---------- wiring ------------------------------------------------- */
  function populate() {
    var countries = []; ALL.forEach(function (c) { if (countries.indexOf(c.country) === -1) countries.push(c.country); });
    el("fCountry").innerHTML = '<option value="all">كل الدول</option>' + countries.map(function (c) { return '<option value="' + esc(c) + '">' + esc(c) + "</option>"; }).join("");
    el("fStatus").innerHTML = '<option value="all">كل الحالات</option>' + (D.statuses || []).map(function (s) { return '<option value="' + s.id + '">' + s.label + "</option>"; }).join("");
    el("fDest").innerHTML = '<option value="all">كل الوجهات</option>' + (D.destinations || []).map(function (d) { return '<option value="' + d.id + '">' + d.name + "</option>"; }).join("");
    el("fActivity").innerHTML = '<option value="all">كل المستويات</option><option value="green">نشطة (≤٣٠ يوم)</option><option value="yellow">تنبيه (٣٠–٦٠)</option><option value="red">خطر (٦٠+)</option>';
    if (!salesMode) {
      el("fSales").innerHTML = '<option value="all">كل الموظفين</option>' + (D.salesEmployees || []).map(function (e) { return '<option value="' + e.id + '">' + e.name + "</option>"; }).join("");
    }
  }

  function applyRoleUI() {
    if (salesMode) {
      el("salesBar").hidden = false;
      el("empSelect").innerHTML = (D.salesEmployees || []).map(function (e) { return '<option value="' + e.id + '"' + (e.id === state.emp ? " selected" : "") + ">" + e.name + "</option>"; }).join("");
      el("fSalesWrap").hidden = true;
      // hide management-only sections
      ["sec-top", "sec-emp", "sec-dest", "sec-hotel", "sec-growth", "sec-lost"].forEach(function (id) { var s = el(id); if (s) s.hidden = true; });
      el("roleTag").textContent = "وضع المبيعات — عرض فقط (شركاتك المخصّصة)";
    } else {
      el("roleTag").textContent = "وضع الإدارة — وصول كامل";
    }
  }

  function renderAll() {
    renderSummary(); renderDirectory(); renderActivity();
    if (!salesMode) { renderTop(); renderEmployees(); renderDestinations(); renderHotels(); renderGrowth(); renderLost(); }
  }

  function wire() {
    el("now").textContent = (D.meta && D.meta.now) || "";
    var si;
    el("fSearch").addEventListener("input", function (e) { clearTimeout(si); si = setTimeout(function () { state.q = e.target.value; renderDirectory(); }, 120); });
    el("fCountry").addEventListener("change", function (e) { state.country = e.target.value; renderDirectory(); });
    el("fStatus").addEventListener("change", function (e) { state.status = e.target.value; renderDirectory(); });
    el("fDest").addEventListener("change", function (e) { state.dest = e.target.value; renderDirectory(); });
    el("fActivity").addEventListener("change", function (e) { state.activity = e.target.value; renderDirectory(); });
    if (el("fSales")) el("fSales").addEventListener("change", function (e) { state.sales = e.target.value; renderDirectory(); });
    el("fReset").addEventListener("click", function () {
      state.q = ""; state.country = "all"; state.sales = "all"; state.status = "all"; state.dest = "all"; state.activity = "all";
      el("fSearch").value = ""; ["fCountry", "fStatus", "fDest", "fActivity"].forEach(function (id) { el(id).value = "all"; }); if (el("fSales")) el("fSales").value = "all";
      renderDirectory();
    });
    if (el("empSelect")) el("empSelect").addEventListener("change", function (e) { state.emp = e.target.value; renderAll(); });
    document.addEventListener("click", function (e) {
      if (e.target.closest("[data-close]")) { closeProfile(); return; }
      if (e.target.closest(".gen-btn")) return;
      var row = e.target.closest("[data-cid]"); if (row) openProfile(row.getAttribute("data-cid"));
    });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeProfile(); });
  }

  document.addEventListener("DOMContentLoaded", function () {
    try { populate(); applyRoleUI(); wire(); renderAll(); }
    catch (err) { console.error(err); document.body.insertAdjacentHTML("beforeend", '<pre style="color:#d9645a;padding:16px">خطأ: ' + esc(err.message) + "</pre>"); }
  });
})();
