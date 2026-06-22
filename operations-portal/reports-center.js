/* Reports Center — DS4. READ ONLY management reporting over existing data.
   Reads CB_DATA, InvoiceStore, TransportationInvoiceStore, program JSONs. Writes nothing. */
(function () {
  "use strict";
  function el(id) { return document.getElementById(id); }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]; }); }
  function num(v) { var n = parseFloat(v); return isNaN(n) ? 0 : n; }
  function thou(n) { return Math.round(n).toLocaleString("en-US"); }
  function bookings() { return (window.CB_DATA && CB_DATA.bookings) || []; }
  var DEST_AR = { indonesia: "إندونيسيا", thailand: "تايلند", maldives: "المالديف" };
  function destAr(d) { return DEST_AR[d] || d || "—"; }
  var CUR = { indonesia: "Rp", thailand: "฿", maldives: "$" };
  function curOf(d) { return CUR[d] || "Rp"; }
  function dnum(s) { return (s || "").slice(0, 10); }
  function nightsOf(b) { var a = new Date(b.check_in), c = new Date(b.check_out); var n = Math.round((c - a) / 86400000); return (n > 0 && isFinite(n)) ? n : 0; }
  function today() { return new Date().toISOString().slice(0, 10); }
  function curMonth() { return today().slice(0, 7); }
  function byId(bid) { return bookings().filter(function (x) { return x.booking_id === bid; })[0] || {}; }

  // ---- programs preload (per-hotel nights for allocation) ----
  var PROGRAMS = {};
  function preloadPrograms(cb) {
    var nos = {}; bookings().forEach(function (b) { if (b.program_no) nos[b.program_no] = 1; });
    var list = Object.keys(nos), left = list.length;
    if (!left) { cb(); return; }
    list.forEach(function (no) {
      fetch("travel-book/programs/" + no + ".json").then(function (r) { return r.json(); }).then(function (j) {
        PROGRAMS[no] = (j.hotels || []).map(function (h) { return { name: h.property_name || h.name, nights: num(h.total_nights) || 0, rooms: num(h.total_room) || 1 }; });
      }).catch(function () { }).then(function () { if (--left <= 0) cb(); });
    });
  }
  function hotelsFor(b) {
    if (b.program_no && PROGRAMS[b.program_no] && PROGRAMS[b.program_no].length) return PROGRAMS[b.program_no];
    return [{ name: b.hotel_name || "—", nights: nightsOf(b), rooms: 1 }];
  }
  function hotelCostOf(bid) {
    if (!window.InvoiceStore) return 0;
    var inv = InvoiceStore.load(bid, "hotel"); if (!inv || !inv.prices || !inv.prices.hotels) return 0;
    var b = byId(bid), hs = hotelsFor(b), sum = 0;
    hs.forEach(function (h, i) { var p = num(inv.prices.hotels[i]); if (p > 0) sum += p * (h.nights || nightsOf(b)) * (h.rooms || 1); });
    return sum;
  }

  // ---- currency money maps ----
  function addCur(map, cur, val) { map[cur] = (map[cur] || 0) + val; }
  function fmtCurMap(map) { var ks = Object.keys(map).filter(function (c) { return map[c]; }); return ks.length ? ks.map(function (c) { return c + " " + thou(map[c]); }).join(" · ") : "—"; }
  function avgCurMap(sumMap, cntMap) { var m = {}; Object.keys(sumMap).forEach(function (c) { m[c] = cntMap[c] ? sumMap[c] / cntMap[c] : 0; }); return m; }

  // ---- filters ----
  var TAB = "company";
  var F = { from: "", to: "", dest: "all", company: "all", employee: "all", hotel: "all" };
  function inRange(b) { var d = dnum(b.created_at) || dnum(b.check_in); if (F.from && d < F.from) return false; if (F.to && d > F.to) return false; return true; }
  function filtered(opts) {
    opts = opts || {};
    return bookings().filter(function (b) {
      if (!inRange(b)) return false;
      if (F.dest !== "all" && b.destination !== F.dest) return false;
      if (opts.company && F.company !== "all" && b.company_name !== F.company) return false;
      if (opts.employee && F.employee !== "all" && b.sales_employee !== F.employee) return false;
      if (opts.hotel && F.hotel !== "all") { var hs = hotelsFor(b).map(function (h) { return h.name; }); if (hs.indexOf(F.hotel) < 0) return false; }
      return true;
    });
  }
  function distinct(fn) { var s = {}; bookings().forEach(function (b) { var v = fn(b); if (v) s[v] = 1; }); return Object.keys(s).sort(); }
  function hotelNames() { var s = {}; bookings().forEach(function (b) { hotelsFor(b).forEach(function (h) { if (h.name) s[h.name] = 1; }); }); return Object.keys(s).sort(); }

  // ---- current table model for export ----
  var CUR_TABLE = { title: "", headers: [], rows: [] };
  function setTable(title, headers, rows) { CUR_TABLE = { title: title, headers: headers, rows: rows }; }

  // ============ MODULE 1 — COMPANY ============
  function renderCompany() {
    var list = filtered({ company: true, employee: true });
    var g = {};
    list.forEach(function (b) {
      var k = b.company_name || "—", r = g[k] || (g[k] = { k: k, n: 0, pax: 0, nights: 0, sales: {}, scnt: {}, hcost: {}, last: "", dest: {} });
      r.n++; r.pax += num(b.pax); r.nights += nightsOf(b);
      var cur = curOf(b.destination); addCur(r.sales, cur, num(b.booking_value)); r.scnt[cur] = (r.scnt[cur] || 0) + 1;
      var hc = hotelCostOf(b.booking_id); if (hc > 0) addCur(r.hcost, cur, hc);
      var d = dnum(b.check_in); if (d > r.last) r.last = d;
      r.dest[b.destination] = (r.dest[b.destination] || 0) + 1;
    });
    var rows = Object.keys(g).map(function (k) { return g[k]; }).sort(function (a, b) { return b.n - a.n; });
    function mainDest(m) { var best = "", x = -1; Object.keys(m).forEach(function (d) { if (m[d] > x) { x = m[d]; best = d; } }); return destAr(best); }
    var headers = ["الشركة", "الحجوزات", "المسافرون", "الليالي", "إجمالي المبيعات", "تكلفة الفنادق", "متوسط قيمة الحجز", "آخر حجز", "الوجهة الرئيسية"];
    var trows = rows.map(function (r) { return [r.k, String(r.n), String(r.pax), String(r.nights), fmtCurMap(r.sales), fmtCurMap(r.hcost), fmtCurMap(avgCurMap(r.sales, r.scnt)), r.last || "—", mainDest(r.dest)]; });
    setTable("تقرير الشركات · Company Reports", headers, trows);
    el("rcBody").innerHTML = filterBar(["from", "to", "dest", "company", "employee"]) + tableCard(headers, trows, "لا بيانات ضمن الفلاتر.") + exportNote();
    wireCommon();
  }

  // ============ MODULE 2 — EMPLOYEE ============
  function renderEmployee() {
    var list = filtered({ employee: true });
    var g = {};
    list.forEach(function (b) {
      var k = b.sales_employee || "—", r = g[k] || (g[k] = { k: k, n: 0, pax: 0, sales: {}, scnt: {}, comp: {} });
      r.n++; r.pax += num(b.pax); var cur = curOf(b.destination); addCur(r.sales, cur, num(b.booking_value)); r.scnt[cur] = (r.scnt[cur] || 0) + 1; r.comp[b.company_name] = 1;
    });
    var rows = Object.keys(g).map(function (k) { return g[k]; }).sort(function (a, b) { return b.n - a.n; });
    var headers = ["#", "الموظف", "الحجوزات", "المبيعات", "المسافرون", "الشركات النشطة", "متوسط قيمة الحجز"];
    var trows = rows.map(function (r, i) { return [String(i + 1), r.k, String(r.n), fmtCurMap(r.sales), String(r.pax), String(Object.keys(r.comp).length), fmtCurMap(avgCurMap(r.sales, r.scnt))]; });
    setTable("تقرير الموظفين · Employee Reports", headers, trows);
    el("rcBody").innerHTML = filterBar(["from", "to", "dest", "employee"]) +
      '<p class="rc-hint">الترتيب حسب عدد الحجوزات (محايد للعملة، إذ تختلف عملة كل وجهة). المبيعات معروضة لكل عملة على حدة.</p>' +
      tableCard(headers, trows, "لا بيانات ضمن الفلاتر.") + exportNote();
    wireCommon();
  }

  // ============ MODULE 3 — DESTINATION ============
  function renderDestination() {
    var list = filtered({});
    var g = {};
    list.forEach(function (b) {
      var k = b.destination || "—", r = g[k] || (g[k] = { k: k, n: 0, pax: 0, nights: 0, rev: 0 });
      r.n++; r.pax += num(b.pax); r.nights += nightsOf(b); r.rev += num(b.booking_value);
    });
    var rows = Object.keys(g).map(function (k) { return g[k]; }).sort(function (a, b) { return b.n - a.n; });
    var headers = ["الوجهة", "الحجوزات", "المسافرون", "الليالي", "الإيرادات"];
    var trows = rows.map(function (r) { return [destAr(r.k), String(r.n), String(r.pax), String(r.nights), curOf(r.k) + " " + thou(r.rev)]; });
    setTable("تقرير الوجهات · Destination Reports", headers, trows);
    el("rcBody").innerHTML = filterBar(["from", "to", "dest"]) + tableCard(headers, trows, "لا بيانات ضمن الفلاتر.") + exportNote();
    wireCommon();
  }

  // ============ MODULE 4 — HOTEL ============
  function renderHotel() {
    var list = filtered({ hotel: true });
    var g = {};
    list.forEach(function (b) {
      var hs = hotelsFor(b), totN = hs.reduce(function (a, h) { return a + (h.nights || 0); }, 0) || 1, cur = curOf(b.destination);
      hs.forEach(function (h) {
        if (F.hotel !== "all" && h.name !== F.hotel) return;
        var k = h.name || "—", r = g[k] || (g[k] = { k: k, n: 0, nights: 0, rev: {}, revN: {}, comp: {}, dest: b.destination });
        r.n++; r.nights += (h.nights || 0);
        addCur(r.rev, cur, num(b.booking_value) * ((h.nights || 0) / totN)); r.revN[cur] = (r.revN[cur] || 0) + (h.nights || 0);
        r.comp[b.company_name] = (r.comp[b.company_name] || 0) + 1;
      });
    });
    var rows = Object.keys(g).map(function (k) { return g[k]; }).sort(function (a, b) { return b.n - a.n; });
    function topComp(m) { return Object.keys(m).sort(function (a, b) { return m[b] - m[a]; }).slice(0, 2).join("، ") || "—"; }
    var headers = ["الفندق", "الوجهة", "الحجوزات", "الليالي", "الإيرادات (موزّعة)", "متوسط سعر البيع/ليلة", "أبرز الشركات"];
    var trows = rows.map(function (r) { return [r.k, destAr(r.dest), String(r.n), String(r.nights), fmtCurMap(r.rev), fmtCurMap(avgCurMap(r.rev, r.revN)), topComp(r.comp)]; });
    setTable("تقرير الفنادق · Hotel Reports", headers, trows);
    el("rcBody").innerHTML = filterBar(["from", "to", "dest", "hotel"]) +
      '<p class="rc-hint">الإيرادات موزّعة على فنادق البرنامج حسب عدد الليالي (قيمة الحجز إجمالية وليست لكل فندق). متوسط سعر البيع = الإيراد ÷ الليالي.</p>' +
      tableCard(headers, trows, "لا بيانات ضمن الفلاتر.") + exportNote();
    wireCommon();
  }

  // ============ MODULE 5 — INVOICE ============
  function invStateOf(bid, type) {
    var m;
    if (type === "transport") m = (window.TransportationInvoiceStore && TransportationInvoiceStore.exists(bid)) ? { status: (TransportationInvoiceStore.load(bid) || {}).status || "draft" } : null;
    else m = window.InvoiceStore && InvoiceStore.meta(bid, type);
    if (!m || m.status === "cancelled") return "missing";
    if (m.status === "sent" || m.status === "finalized") return "generated";
    return "pending";
  }
  function renderInvoice() {
    var list = filtered({});
    var types = [["sales", "فاتورة المبيعات · Sales"], ["operations", "فاتورة العمليات · Operations"], ["hotel", "فاتورة الفنادق · Hotel Supplier"], ["transport", "فاتورة المواصلات · Transportation"]];
    var headers = ["نوع الفاتورة", "مُولّدة · Generated", "قيد الإعداد · Pending", "ناقصة · Missing", "الإجمالي"];
    var trows = types.map(function (t) {
      var gen = 0, pen = 0, mis = 0;
      list.forEach(function (b) { var s = invStateOf(b.booking_id, t[0]); if (s === "generated") gen++; else if (s === "pending") pen++; else mis++; });
      return [t[1], String(gen), String(pen), String(mis), String(list.length)];
    });
    setTable("تقرير الفواتير · Invoice Reports", headers, trows);
    el("rcBody").innerHTML = filterBar(["from", "to", "dest"]) +
      '<p class="rc-hint">مُولّدة = مُرسلة/معتمدة · قيد الإعداد = مسودة/لم تُرسل · ناقصة = غير منشأة. النواقص تشمل حجوزات تاريخية لم تُنشأ لها فواتير (ليست أعطالاً).</p>' +
      tableCard(headers, trows, "لا بيانات.") + exportNote();
    wireCommon();
  }

  // ============ MODULE 6 — EXECUTIVE ============
  function renderExecutive() {
    var all = bookings(), tdy = today(), mon = curMonth();
    var tdyB = all.filter(function (b) { return dnum(b.created_at) === tdy; });
    var monB = all.filter(function (b) { return (b.created_at || "").slice(0, 7) === mon; });
    var monSales = {}; monB.forEach(function (b) { addCur(monSales, curOf(b.destination), num(b.booking_value)); });
    function topBy(fn) { var g = {}; all.forEach(function (b) { var k = fn(b); if (k) g[k] = (g[k] || 0) + 1; }); var best = "", x = -1; Object.keys(g).forEach(function (k) { if (g[k] > x) { x = k && g[k]; best = k; } }); return best ? best + " (" + g[best] + ")" : "—"; }
    function sumPax(arr) { return arr.reduce(function (a, b) { return a + num(b.pax); }, 0); }
    var cards = [
      ["حجوزات اليوم · Today's Bookings", String(tdyB.length), "e-a"],
      ["حجوزات الشهر · This Month", String(monB.length), "e-a"],
      ["مسافرو اليوم · Today's PAX", String(sumPax(tdyB)), "e-b"],
      ["مسافرو الشهر · Month PAX", String(sumPax(monB)), "e-b"],
      ["مبيعات الشهر · Monthly Sales", fmtCurMap(monSales), "e-c"],
      ["أعلى شركة · Top Company", topBy(function (b) { return b.company_name; }), "e-d"],
      ["أعلى موظف · Top Employee", topBy(function (b) { return b.sales_employee; }), "e-d"],
      ["أعلى وجهة · Top Destination", topBy(function (b) { return destAr(b.destination); }), "e-d"]
    ];
    var cardsHtml = '<div class="rc-kpis">' + cards.map(function (c) { return '<div class="rc-kpi ' + c[2] + '"><div class="rc-kpi-n">' + esc(c[1]) + '</div><div class="rc-kpi-l">' + c[0] + "</div></div>"; }).join("") + "</div>";
    setTable("اللوحة التنفيذية · Executive Dashboard", ["المؤشر", "القيمة"], cards.map(function (c) { return [c[0], c[1]]; }));
    el("rcBody").innerHTML = '<p class="rc-hint">لقطة لحظية بتاريخ اليوم (' + tdy + '). «اليوم» و«الشهر» تعتمد تاريخ إنشاء الحجز. «الأعلى» حسب عدد الحجوزات في كامل البيانات.</p>' +
      cardsHtml + '<div class="rc-exportbar"><button type="button" class="rc-btn" id="rcCsv">⬇️ Excel (CSV)</button><button type="button" class="rc-btn" id="rcPdf">🖨️ PDF</button></div>';
    wireExport();
  }

  // ---- shared UI ----
  function filterBar(which) {
    function dateF(id, label, val) { return '<label class="rc-f"><span>' + label + '</span><input type="date" id="' + id + '" value="' + esc(val) + '"></label>'; }
    function sel(id, label, val, opts) { return '<label class="rc-f"><span>' + label + '</span><select id="' + id + '">' + opts.map(function (o) { return '<option value="' + esc(o[0]) + '"' + (val === o[0] ? " selected" : "") + ">" + esc(o[1]) + "</option>"; }).join("") + "</select></label>"; }
    var parts = [];
    if (which.indexOf("from") >= 0) parts.push(dateF("rcFrom", "من", F.from));
    if (which.indexOf("to") >= 0) parts.push(dateF("rcTo", "إلى", F.to));
    if (which.indexOf("dest") >= 0) parts.push(sel("rcDest", "الوجهة", F.dest, [["all", "كل الوجهات"], ["indonesia", "إندونيسيا"], ["thailand", "تايلند"], ["maldives", "المالديف"]]));
    if (which.indexOf("company") >= 0) parts.push(sel("rcCompany", "الشركة", F.company, [["all", "كل الشركات"]].concat(distinct(function (b) { return b.company_name; }).map(function (c) { return [c, c]; }))));
    if (which.indexOf("employee") >= 0) parts.push(sel("rcEmployee", "الموظف", F.employee, [["all", "كل الموظفين"]].concat(distinct(function (b) { return b.sales_employee; }).map(function (c) { return [c, c]; }))));
    if (which.indexOf("hotel") >= 0) parts.push(sel("rcHotel", "الفندق", F.hotel, [["all", "كل الفنادق"]].concat(hotelNames().map(function (c) { return [c, c]; }))));
    parts.push('<button type="button" class="rc-clear" id="rcClear">إعادة ضبط</button>');
    return '<div class="rc-filters">' + parts.join("") + "</div>";
  }
  function tableCard(headers, rows, empty) {
    var body = rows.length ? rows.map(function (r) { return "<tr>" + r.map(function (c, i) { return "<td" + (i === 0 ? ' class="rc-k"' : "") + ">" + esc(c) + "</td>"; }).join("") + "</tr>"; }).join("") : '<tr><td colspan="' + headers.length + '" class="rc-empty">' + esc(empty) + "</td></tr>";
    return '<div class="rc-exportbar"><button type="button" class="rc-btn" id="rcCsv">⬇️ Excel (CSV)</button><button type="button" class="rc-btn" id="rcPdf">🖨️ PDF</button></div>' +
      '<div class="rc-card"><table class="rc-tbl"><thead><tr>' + headers.map(function (h) { return "<th>" + esc(h) + "</th>"; }).join("") + "</tr></thead><tbody>" + body + "</tbody></table></div>";
  }
  function exportNote() { return '<p class="rc-foot">قراءة فقط — تقارير محسوبة من بيانات النظام القائمة دون أي تعديل. تكلفة الفنادق تظهر فقط حيث أُدخلت أسعار فاتورة الفنادق.</p>'; }

  function wireCommon() {
    function onF(id, key, re) { var n = el(id); if (n) n.addEventListener(re ? "input" : "change", function () { F[key] = this.value; render(); }); }
    onF("rcFrom", "from"); onF("rcTo", "to"); onF("rcDest", "dest"); onF("rcCompany", "company"); onF("rcEmployee", "employee"); onF("rcHotel", "hotel");
    if (el("rcClear")) el("rcClear").addEventListener("click", function () { F = { from: "", to: "", dest: "all", company: "all", employee: "all", hotel: "all" }; render(); });
    wireExport();
  }
  function wireExport() {
    if (el("rcCsv")) el("rcCsv").addEventListener("click", exportCSV);
    if (el("rcPdf")) el("rcPdf").addEventListener("click", exportPDF);
  }

  // ---- export ----
  function exportCSV() {
    var t = CUR_TABLE, lines = [t.headers.join(",")];
    t.rows.forEach(function (r) { lines.push(r.map(function (c) { var s = String(c == null ? "" : c); return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; }).join(",")); });
    var blob = new Blob(["\ufeff" + lines.join("\r\n")], { type: "text/csv;charset=utf-8;" });
    var url = URL.createObjectURL(blob), a = document.createElement("a");
    a.href = url; a.download = (t.title.split(" · ")[0] || "report") + "-" + today() + ".csv"; document.body.appendChild(a); a.click(); document.body.removeChild(a);
  }
  function exportPDF() {
    var t = CUR_TABLE;
    var html = '<!DOCTYPE html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><title>' + esc(t.title) + '</title><style>' +
      '@page{size:A4 landscape;margin:12mm}*{box-sizing:border-box}body{font-family:"Segoe UI",Tahoma,Arial,sans-serif;color:#16233a;margin:0;font-size:9.5pt}' +
      '.top{display:flex;justify-content:space-between;border-bottom:2pt solid #16233a;padding-bottom:3mm;margin-bottom:4mm}.logo{font-size:16pt;font-weight:800;color:#a57c52}.logo small{display:block;font-size:7.5pt;color:#5b6b85;letter-spacing:2px}.ttl h1{font-size:13pt;margin:0;text-align:left}' +
      'table{width:100%;border-collapse:collapse;font-size:8.5pt}th,td{border:.5pt solid #b9c2d0;padding:1.5mm 2mm;text-align:right}th{background:#eef2f7}' +
      '.foot{margin-top:5mm;color:#5b6b85;font-size:7.5pt;border-top:.5pt solid #b9c2d0;padding-top:2mm}</style></head><body>' +
      '<div class="top"><div class="logo">سيزون ترافل<small>SEASON TRAVEL</small></div><div class="ttl"><h1>' + esc(t.title) + "</h1></div></div>" +
      '<table><thead><tr>' + t.headers.map(function (h) { return "<th>" + esc(h) + "</th>"; }).join("") + "</tr></thead><tbody>" +
      t.rows.map(function (r) { return "<tr>" + r.map(function (c) { return "<td>" + esc(c) + "</td>"; }).join("") + "</tr>"; }).join("") + "</tbody></table>" +
      '<p class="foot">سيزون ترافل · Season Travel — تقرير إداري (قراءة فقط). تاريخ الطباعة: ' + new Date().toLocaleString("en-GB") + "</p></body></html>";
    var w = null; try { w = window.open("", "_blank"); } catch (e) { w = null; }
    if (w && w.document) { w.document.open(); w.document.write(html); w.document.close(); setTimeout(function () { try { w.focus(); w.print(); } catch (e) { } }, 350); return; }
    try { var b = new Blob([html], { type: "text/html" }), u = URL.createObjectURL(b), a = document.createElement("a"); a.href = u; a.target = "_blank"; a.rel = "noopener"; document.body.appendChild(a); a.click(); document.body.removeChild(a); } catch (e) { }
  }

  // ---- tabs / render ----
  var TABS = [["company", "الشركات"], ["employee", "الموظفون"], ["destination", "الوجهات"], ["hotel", "الفنادق"], ["invoice", "الفواتير"], ["executive", "اللوحة التنفيذية"]];
  function renderTabs() {
    el("rcTabs").innerHTML = TABS.map(function (t) { return '<button type="button" class="rc-tab' + (TAB === t[0] ? " on" : "") + '" data-tab="' + t[0] + '">' + t[1] + "</button>"; }).join("");
    Array.prototype.forEach.call(document.querySelectorAll("[data-tab]"), function (b) { b.addEventListener("click", function () { TAB = b.getAttribute("data-tab"); render(); }); });
  }
  function render() {
    renderTabs();
    if (TAB === "company") renderCompany();
    else if (TAB === "employee") renderEmployee();
    else if (TAB === "destination") renderDestination();
    else if (TAB === "hotel") renderHotel();
    else if (TAB === "invoice") renderInvoice();
    else renderExecutive();
  }
  document.addEventListener("DOMContentLoaded", function () {
    el("rcRoot").innerHTML = '<div class="rc-head"><div><h1>مركز التقارير · Reports Center</h1><p class="rc-sub">طبقة تقارير إدارية للقراءة فقط — محسوبة من بيانات النظام القائمة</p></div></div><div class="rc-tabs" id="rcTabs"></div><div id="rcBody"></div>';
    preloadPrograms(function () { render(); });
  });
})();
