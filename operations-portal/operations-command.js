/* Operations Command Center — DS6 + refinement. READ-ONLY orchestration.
   Aggregates existing data (bookings, transport files, invoices, finance). No business logic. */
(function () {
  "use strict";
  function el(id) { return document.getElementById(id); }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]; }); }
  function num(v) { var n = parseFloat(v); return isNaN(n) ? 0 : n; }
  function thou(n) { return Math.round(n).toLocaleString("en-US"); }
  function bookings() { return (window.CB_DATA && CB_DATA.bookings) || []; }
  function byId(bid) { return bookings().filter(function (x) { return x.booking_id === bid; })[0] || null; }
  var DEST_AR = { indonesia: "إندونيسيا", thailand: "تايلند", maldives: "المالديف" };
  function destAr(d) { return DEST_AR[d] || d || "—"; }
  var CURLBL = { indonesia: "Rp", thailand: "THB", maldives: "USD" };
  function curOf(d) { return CURLBL[d] || "Rp"; }
  var CUR_LIST = ["Rp", "THB", "USD"];
  function dnum(s) { return (s || "").slice(0, 10); }
  function today() { return new Date().toISOString().slice(0, 10); }
  function daysUntil(d) { if (!d) return 99999; var x = Math.round((new Date(dnum(d)) - new Date(today())) / 86400000); return isFinite(x) ? x : 99999; }
  function money(cur, n) { return cur + " " + thou(n); }
  function addCur(m, c, v) { m[c] = (m[c] || 0) + v; }
  function fmtMap(m) { var ks = CUR_LIST.filter(function (c) { return m[c]; }); return ks.length ? ks.map(function (c) { return money(c, m[c]); }).join(" · ") : "—"; }

  // ---- read-only probes ----
  function tfInfo(bid) {
    if (!(window.TransportationFileStore && TransportationFileStore.exists(bid))) return { exists: false, status: "none", drivers: [], noDriver: true, ready: false };
    var f = TransportationFileStore.load(bid) || {}, mv = f.movements || [];
    var st = f.status || (f.ready_to_send ? "ready" : "draft");
    var drivers = []; mv.forEach(function (m) { if (m.driver_name && drivers.indexOf(m.driver_name) < 0) drivers.push(m.driver_name); });
    var assigned = mv.filter(function (m) { return m.driver_id; }).length;
    return { exists: true, status: st, drivers: drivers, noDriver: (mv.length === 0 || assigned < mv.length), ready: (st === "ready" || st === "completed") };
  }
  function invState(bid, type) {
    if (type === "transport") { if (window.TransportationInvoiceStore && TransportationInvoiceStore.exists(bid)) { var v = TransportationInvoiceStore.load(bid) || {}; if (v.status === "sent" || v.status === "finalized") return "ok"; if (v.status === "cancelled") return "missing"; return "pending"; } return "missing"; }
    var m = window.InvoiceStore && InvoiceStore.meta(bid, type);
    if (!m || m.status === "cancelled") return "missing";
    if (m.status === "sent" || m.status === "finalized") return "ok";
    return "pending";
  }
  function invLabel(s) { return s === "ok" ? "معتمدة" : (s === "pending" ? "قيد الإعداد" : "ناقصة"); }

  // ---- receivables / remaining (read-only, same derivation as Finance) ----
  function allocMap() { var m = {}; (window.FinanceStore ? FinanceStore.listPayments() : []).forEach(function (p) { if (p.void) return; (p.allocations || []).forEach(function (a) { m[a.booking_id] = (m[a.booking_id] || 0) + num(a.amount); }); }); return m; }
  function remMap() {
    var am = allocMap(), m = {};
    if (window.InvoiceStore) InvoiceStore.list().forEach(function (r) { if (r.type === "sales" && r.invoice && (r.invoice.status === "generated" || r.invoice.status === "sent")) { var b = byId(r.booking_id); if (b) { var rem = num(b.booking_value) - (am[r.booking_id] || 0); if (rem > 0) m[r.booking_id] = { rem: rem, cur: curOf(b.destination) }; } } });
    return m;
  }
  function companyOutstanding(RM) {
    var g = {};
    Object.keys(RM).forEach(function (bid) { var b = byId(bid); if (!b) return; var x = g[b.company_name] || (g[b.company_name] = { co: b.company_name, out: {}, next: "" }); addCur(x.out, RM[bid].cur, RM[bid].rem); var d = daysUntil(b.check_in); if (d >= 0 && (!x.next || dnum(b.check_in) < x.next)) x.next = dnum(b.check_in); });
    return g;
  }

  // ---- missing items + badges ----
  function missingItems(b) {
    var t = tfInfo(b.booking_id), m = [];
    if (!t.exists) m.push("ملف نقل"); else { if (t.noDriver) m.push("سائق"); if (!t.ready) m.push("اعتماد ملف النقل"); }
    if (invState(b.booking_id, "sales") === "missing") m.push("فاتورة مبيعات");
    if (invState(b.booking_id, "operations") === "missing") m.push("فاتورة عمليات");
    if (invState(b.booking_id, "hotel") === "missing") m.push("فاتورة فندق");
    return m;
  }
  var BADGE = { "ملف نقل": "red", "سائق": "black", "فاتورة مبيعات": "blue", "فاتورة عمليات": "orange", "اعتماد ملف النقل": "orange", "مسؤول تشغيلي": "grey", "فاتورة فندق": "yellow" };
  function badges(arr) { return arr.length ? arr.map(function (m) { var c = BADGE[m] || "yellow"; return '<span class="oc-badge b-' + c + '">' + esc(m) + "</span>"; }).join(" ") : '<span class="oc-badge b-green">مكتمل</span>'; }

  // ---- readiness + priority level ----
  function readiness(b) { var m = missingItems(b).filter(function (x) { return x !== "فاتورة فندق"; }); var d = daysUntil(b.check_in); return { miss: missingItems(b), level: m.length === 0 ? "green" : ((d >= 0 && d <= 2) ? "red" : "yellow") }; }
  function levelOf(b, RM) {
    var d = daysUntil(b.check_in), dep = daysUntil(b.check_out), t = tfInfo(b.booking_id);
    var noFile = !t.exists, noDriver = t.exists && t.noDriver, notReady = t.exists && !t.ready;
    var sales = invState(b.booking_id, "sales") === "missing", ops = invState(b.booking_id, "operations") === "missing", hotel = invState(b.booking_id, "hotel") === "missing";
    var rem = RM[b.booking_id] ? RM[b.booking_id].rem : 0;
    var incomplete = noFile || noDriver || notReady || sales || ops;
    if (d >= 0 && d <= 2 && incomplete) return "critical";
    if (dep >= 0 && dep <= 2 && (noFile || noDriver)) return "critical";
    if (noFile && d >= 0 && d <= 7) return "critical";
    if (ops) return "high";
    if (rem > 0 && d >= 0 && d <= 7) return "high";
    if (noFile || noDriver) return "high";
    if (sales) return "medium";
    if (hotel) return "medium";
    return "low";
  }
  var SEV_RANK = { critical: 0, high: 1, medium: 2, low: 3 };
  var SEV_LBL = { critical: "🔴 حرجة", high: "🟠 عالية", medium: "🟡 متوسطة", low: "⚪ منخفضة" };

  // ---- filters ----
  var F = { window: "30", dest: "all", company: "all", status: "all" };
  function winDays() { return F.window === "all" ? 1e9 : num(F.window); }
  function passDC(b) { return (F.dest === "all" || b.destination === F.dest) && (F.company === "all" || b.company_name === F.company); }
  function inWinArr(b) { var d = daysUntil(b.check_in); return d >= 0 && d <= winDays(); }
  function inWinDep(b) { var d = daysUntil(b.check_out); return d >= 0 && d <= winDays(); }

  // ---- export ----
  var SNAP = [];
  function addSnap(title, headers, rows) { SNAP.push({ title: title, headers: headers, rows: rows }); }
  function exportCSV() {
    var blocks = SNAP.map(function (s) { var lines = ["# " + s.title, s.headers.join(",")]; s.rows.forEach(function (r) { lines.push(r.map(function (c) { var t = String(c == null ? "" : c); return /[",\n]/.test(t) ? '"' + t.replace(/"/g, '""') + '"' : t; }).join(",")); }); return lines.join("\r\n"); });
    var blob = new Blob(["\ufeff" + blocks.join("\r\n\r\n")], { type: "text/csv;charset=utf-8;" }), u = URL.createObjectURL(blob), a = document.createElement("a");
    a.href = u; a.download = "operations-command-" + today() + ".csv"; document.body.appendChild(a); a.click(); document.body.removeChild(a);
  }
  function exportPDF() {
    var tbls = SNAP.map(function (s) { return "<h2>" + esc(s.title) + "</h2><table><thead><tr>" + s.headers.map(function (h) { return "<th>" + esc(h) + "</th>"; }).join("") + "</tr></thead><tbody>" + (s.rows.length ? s.rows.map(function (r) { return "<tr>" + r.map(function (c) { return "<td>" + esc(c) + "</td>"; }).join("") + "</tr>"; }).join("") : '<tr><td colspan="' + s.headers.length + '">—</td></tr>') + "</tbody></table>"; }).join("");
    var html = '<!DOCTYPE html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><title>Operations Command Center</title><style>@page{size:A4 landscape;margin:12mm}*{box-sizing:border-box}body{font-family:"Segoe UI",Tahoma,Arial,sans-serif;color:#16233a;margin:0;font-size:9pt}.top{display:flex;justify-content:space-between;border-bottom:2pt solid #16233a;padding-bottom:3mm;margin-bottom:4mm}.logo{font-size:15pt;font-weight:800;color:#a57c52}.logo small{display:block;font-size:7pt;color:#5b6b85;letter-spacing:2px}h1{font-size:12pt;margin:0;text-align:left}h2{font-size:10pt;margin:5mm 0 2mm}table{width:100%;border-collapse:collapse;font-size:8pt;margin-bottom:3mm}th,td{border:.5pt solid #b9c2d0;padding:1.3mm 2mm;text-align:right}th{background:#eef2f7}.foot{margin-top:5mm;color:#5b6b85;font-size:7pt;border-top:.5pt solid #b9c2d0;padding-top:2mm}</style></head><body><div class="top"><div class="logo">سيزون ترافل<small>SEASON TRAVEL</small></div><h1>مركز العمليات التنفيذي · Operations Command Center</h1></div>' + tbls + '<p class="foot">قراءة فقط — لقطة تشغيلية ضمن نافذة ' + esc(F.window) + ". " + new Date().toLocaleString("en-GB") + "</p></body></html>";
    var w = null; try { w = window.open("", "_blank"); } catch (e) { w = null; }
    if (w && w.document) { w.document.open(); w.document.write(html); w.document.close(); setTimeout(function () { try { w.focus(); w.print(); } catch (e) {} }, 350); return; }
    try { var b = new Blob([html], { type: "text/html" }), u = URL.createObjectURL(b), a = document.createElement("a"); a.href = u; a.target = "_blank"; a.rel = "noopener"; document.body.appendChild(a); a.click(); document.body.removeChild(a); } catch (e) {}
  }
  function navTo(id) { try { (window.parent && window.parent !== window ? window.parent : window).postMessage({ type: "nav-to", id: id }, "*"); } catch (e) {} }

  function render() {
    SNAP = [];
    var all = bookings(), tdy = today(), RM = remMap();
    var inWin = all.filter(passDC).filter(inWinArr);

    // alerts (within window, with missing items), 4-level priority sort
    var alerts = inWin.filter(function (b) { return missingItems(b).length > 0; }).map(function (b) { return { lvl: levelOf(b, RM), bid: b.booking_id, company: b.company_name, miss: missingItems(b), days: daysUntil(b.check_in) }; });
    alerts.sort(function (a, b) { return (SEV_RANK[a.lvl] - SEV_RANK[b.lvl]) || (a.days - b.days); });
    if (F.status !== "all") { var lvlMap = { red: "critical", yellow: "medium", green: null }; }
    var crit = alerts.filter(function (a) { return a.lvl === "critical"; });

    // arrivals / departures within window
    var arrivals = all.filter(passDC).filter(inWinArr).sort(function (a, b) { return daysUntil(a.check_in) - daysUntil(b.check_in); });
    if (F.status !== "all") arrivals = arrivals.filter(function (b) { return readiness(b).level === F.status; });
    var departures = all.filter(passDC).filter(inWinDep).sort(function (a, b) { return daysUntil(a.check_out) - daysUntil(b.check_out); });

    // follow-up: outstanding + arrival within 7 days
    var co = companyOutstanding(RM);
    var followup = Object.keys(co).map(function (k) { return co[k]; }).filter(function (x) { return x.next && daysUntil(x.next) >= 0 && daysUntil(x.next) <= 7; }).sort(function (a, b) { return daysUntil(a.next) - daysUntil(b.next); });

    // missing assignment monitor (within window)
    var missing = inWin.map(function (b) { var t = tfInfo(b.booking_id), m = []; if (!t.exists) m.push("ملف نقل"); else { if (t.noDriver) m.push("سائق"); if (!t.ready) m.push("اعتماد ملف النقل"); } if (!b.booking_officer) m.push("مسؤول تشغيلي"); return m.length ? { bid: b.booking_id, client: b.guest_name, company: b.company_name, miss: m } : null; }).filter(Boolean);

    // ---- Needs Action Today (urgent only, categorized) ----
    var naArr = 0, naDep = 0, naFile = 0;
    inWin.forEach(function (b) {
      var d = daysUntil(b.check_in), dep = daysUntil(b.check_out), t = tfInfo(b.booking_id);
      var noFile = !t.exists, noDriver = t.exists && t.noDriver, notReady = t.exists && !t.ready;
      var incomplete = noFile || noDriver || notReady || invState(b.booking_id, "sales") === "missing" || invState(b.booking_id, "operations") === "missing";
      if (d >= 0 && d <= 2 && incomplete) { naArr++; return; }
      if (dep >= 0 && dep <= 2 && noDriver) { naDep++; return; }
      if (noFile && d >= 0 && d <= 7) { naFile++; return; }
    });
    var naFollow = followup.length;
    var needsAction = naArr + naDep + naFile + naFollow;

    // cards
    var arrToday = all.filter(passDC).filter(function (b) { return dnum(b.check_in) === tdy; }).length;
    var depToday = all.filter(passDC).filter(function (b) { return dnum(b.check_out) === tdy; }).length;
    var debtCount = Object.keys(co).length;
    var incompleteFiles = inWin.filter(function (b) { var t = tfInfo(b.booking_id); return !t.exists || !t.ready || t.noDriver; }).length;

    function card(n, l, c) { return '<div class="oc-kpi ' + (c || "") + '"><div class="oc-kpi-n">' + n + '</div><div class="oc-kpi-l">' + l + "</div></div>"; }
    var cards = '<div class="oc-kpis oc-kpis5">' + card(crit.length, "تنبيهات حرجة · Critical Alerts", "k-crit") + card(debtCount, "شركات عليها مديونية · Companies With Debt", "k-warn") + card(arrToday, "وصول اليوم · Arrivals Today", "k-a") + card(depToday, "مغادرة اليوم · Departures Today", "k-a") + card(incompleteFiles, "ملفات غير مكتملة · Incomplete Files", "k-warn") + "</div>";

    // Needs Action Today banner (prominent, executive summary)
    var naLines = [];
    if (naArr) naLines.push("<li><b>" + naArr + "</b> وصول خلال ٤٨ ساعة غير مكتمل</li>");
    if (naDep) naLines.push("<li><b>" + naDep + "</b> مغادرة خلال ٤٨ ساعة بدون سائق</li>");
    if (naFile) naLines.push("<li><b>" + naFile + "</b> ملفات نقل مفقودة لوصول قريب</li>");
    if (naFollow) naLines.push("<li><b>" + naFollow + "</b> شركات تحتاج متابعة تحصيل</li>");
    if (!naLines.length) naLines.push("<li>لا عناصر عاجلة اليوم ✅</li>");
    var naBanner = '<div class="oc-needs ' + (needsAction > 0 ? "on" : "") + '"><div class="oc-needs-n">' + needsAction + '</div><div class="oc-needs-body"><strong>عنصر يحتاج إجراء اليوم · Items Need Action Today</strong><ul class="oc-needs-list">' + naLines.join("") + "</ul></div></div>";

    // filters
    function chip(v, l) { return '<button type="button" class="oc-chip' + (F.window === v ? " on" : "") + '" data-win="' + v + '">' + l + "</button>"; }
    function sel(id, val, opts) { return '<select id="' + id + '">' + opts.map(function (o) { return '<option value="' + esc(o[0]) + '"' + (val === o[0] ? " selected" : "") + ">" + esc(o[1]) + "</option>"; }).join("") + "</select>"; }
    var comps = {}; all.forEach(function (b) { comps[b.company_name] = 1; });
    var filters = '<div class="oc-filters"><div class="oc-winrow"><span class="oc-winlbl">النافذة التشغيلية:</span>' + chip("7", "٧ أيام") + chip("30", "٣٠ يوم") + chip("90", "٩٠ يوم") + chip("all", "الكل") + '</div>' +
      '<label class="oc-f"><span>الوجهة</span>' + sel("ocDest", F.dest, [["all", "كل الوجهات"], ["indonesia", "إندونيسيا"], ["thailand", "تايلند"], ["maldives", "المالديف"]]) + "</label>" +
      '<label class="oc-f"><span>الشركة</span>' + sel("ocComp", F.company, [["all", "كل الشركات"]].concat(Object.keys(comps).sort().map(function (c) { return [c, c]; }))) + "</label>" +
      '<label class="oc-f"><span>الجاهزية</span>' + sel("ocStatus", F.status, [["all", "الكل"], ["green", "🟢 مكتمل"], ["yellow", "🟡 ناقص"], ["red", "🔴 حرج"]]) + "</label>" +
      '<span class="oc-exp"><button type="button" class="oc-btn" id="ocCsv">⬇️ Excel</button><button type="button" class="oc-btn" id="ocPdf">🖨️ PDF</button></span></div>';

    // quick actions (navigation only)
    var qa = '<div class="oc-qa"><span class="oc-qa-t">إجراءات سريعة:</span>' +
      '<button type="button" class="oc-qbtn" data-nav="bookings">فتح الحجز</button>' +
      '<button type="button" class="oc-qbtn" data-nav="transport-file">فتح ملف النقل</button>' +
      '<button type="button" class="oc-qbtn" data-nav="invoice-center">فتح مركز الفواتير</button>' +
      '<button type="button" class="oc-qbtn" data-nav="finance">فتح دفتر الشركات</button></div>';

    // Section 3: Critical Alerts (badges)
    addSnap("التنبيهات التشغيلية · Operational Alerts", ["الخطورة", "الحجز", "الشركة", "النواقص", "أيام متبقية"], alerts.map(function (a) { return [SEV_LBL[a.lvl].replace(/^[^ ]+ /, ""), a.bid, a.company, a.miss.join(" / "), String(a.days)]; }));
    var alertRows = alerts.length ? alerts.slice(0, 50).map(function (a) { return '<tr class="oc-sev-' + a.lvl + '"><td>' + SEV_LBL[a.lvl] + '</td><td class="oc-k">' + esc(a.bid) + "</td><td>" + esc(a.company) + '</td><td class="oc-badges">' + badges(a.miss) + "</td><td>" + a.days + " يوم</td></tr>"; }).join("") : '<tr><td colspan="5" class="oc-empty">لا تنبيهات ضمن النافذة.</td></tr>';
    var alertCard = '<div class="oc-h2">🚨 التنبيهات التشغيلية الحرجة · Critical Operational Alerts</div><div class="oc-card"><table class="oc-tbl"><thead><tr><th>الخطورة</th><th>الحجز</th><th>الشركة</th><th>النواقص</th><th>أيام متبقية</th></tr></thead><tbody>' + alertRows + "</tbody></table></div>";

    // Section 1/2: Upcoming Arrivals / Departures
    addSnap("الوصول القادم · Upcoming Arrivals", ["الوصول", "الحجز", "الشركة", "العميل", "الوجهة", "السائق", "ملف النقل", "الفاتورة"], arrivals.map(function (b) { var t = tfInfo(b.booking_id); return [dnum(b.check_in), b.booking_id, b.company_name, b.guest_name, destAr(b.destination), (t.drivers.join("، ") || "لم يُسند"), (t.exists ? t.status : "لا ملف"), invLabel(invState(b.booking_id, "sales"))]; }));
    var arrRows = arrivals.length ? arrivals.slice(0, 50).map(function (b) { var t = tfInfo(b.booking_id), r = readiness(b), d = daysUntil(b.check_in); return '<tr class="' + (d <= 2 ? "oc-soon" : "") + '"><td>' + esc(dnum(b.check_in)) + " <small>(" + d + "ي)</small></td><td class=\"oc-k\">" + esc(b.booking_id) + "</td><td>" + esc(b.company_name) + "</td><td>" + esc(b.guest_name) + "</td><td>" + destAr(b.destination) + "</td><td>" + (t.drivers.length ? esc(t.drivers.join("، ")) : '<span class="oc-miss">لم يُسند</span>') + "</td><td>" + (t.exists ? esc(t.status) : '<span class="oc-miss">لا ملف</span>') + "</td><td>" + (r.level === "green" ? "🟢" : r.level === "yellow" ? "🟡" : "🔴") + "</td></tr>"; }).join("") : '<tr><td colspan="8" class="oc-empty">لا وصول ضمن النافذة.</td></tr>';
    var arrCard = '<div class="oc-h2">🛬 الوصول القادم · Upcoming Arrivals</div><div class="oc-card"><table class="oc-tbl"><thead><tr><th>الوصول</th><th>الحجز</th><th>الشركة</th><th>العميل</th><th>الوجهة</th><th>السائق</th><th>ملف النقل</th><th>المؤشر</th></tr></thead><tbody>' + arrRows + "</tbody></table></div>";

    addSnap("المغادرة القادمة · Upcoming Departures", ["المغادرة", "الحجز", "العميل", "الشركة", "الفندق", "السائق", "الحالة"], departures.map(function (b) { var t = tfInfo(b.booking_id); return [dnum(b.check_out), b.booking_id, b.guest_name, b.company_name, b.hotel_name || "—", (t.drivers.join("، ") || "لم يُسند"), (t.exists ? t.status : "لا ملف")]; }));
    var depRows = departures.length ? departures.slice(0, 50).map(function (b) { var t = tfInfo(b.booking_id), d = daysUntil(b.check_out); return '<tr class="' + (d <= 2 ? "oc-soon" : "") + '"><td>' + esc(dnum(b.check_out)) + " <small>(" + d + "ي)</small></td><td class=\"oc-k\">" + esc(b.booking_id) + "</td><td>" + esc(b.guest_name) + "</td><td>" + esc(b.company_name) + "</td><td>" + esc(b.hotel_name || "—") + "</td><td>" + (t.drivers.length ? esc(t.drivers.join("، ")) : '<span class="oc-miss">لم يُسند</span>') + "</td><td>" + (t.exists ? esc(t.status) : '<span class="oc-miss">لا ملف</span>') + "</td></tr>"; }).join("") : '<tr><td colspan="7" class="oc-empty">لا مغادرة ضمن النافذة.</td></tr>';
    var depCard = '<div class="oc-h2">🛫 المغادرة القادمة · Upcoming Departures</div><div class="oc-card"><table class="oc-tbl"><thead><tr><th>المغادرة</th><th>الحجز</th><th>العميل</th><th>الشركة</th><th>الفندق</th><th>السائق</th><th>الحالة</th></tr></thead><tbody>' + depRows + "</tbody></table></div>";

    // Section 4: Follow-up
    addSnap("شركات تحتاج متابعة · Companies Requiring Follow-Up", ["الشركة", "الرصيد المستحق", "الوصول القادم", "أيام للوصول"], followup.map(function (x) { return [x.co, fmtMap(x.out), x.next, String(daysUntil(x.next))]; }));
    var fuRows = followup.length ? followup.map(function (x) { return '<tr><td class="oc-k">' + esc(x.co) + '</td><td class="oc-r">' + fmtMap(x.out) + "</td><td>" + esc(x.next) + "</td><td>" + daysUntil(x.next) + " يوم</td></tr>"; }).join("") : '<tr><td colspan="4" class="oc-empty">لا شركات تحتاج متابعة خلال ٧ أيام.</td></tr>';
    var fuCard = '<div class="oc-h2">💰 شركات تحتاج متابعة · Companies Requiring Follow-Up</div><div class="oc-card"><table class="oc-tbl"><thead><tr><th>الشركة</th><th>الرصيد المستحق</th><th>الوصول القادم</th><th>أيام للوصول</th></tr></thead><tbody>' + fuRows + '</tbody></table></div><p class="oc-foot">من بيانات المالية — رصيد مستحق ووصول خلال ٧ أيام (متابعة تحصيل تشغيلية).</p>';

    // Section 5: Missing assignment monitor (detailed, lower)
    addSnap("مراقب الإسنادات الناقصة · Missing Assignment Monitor", ["الحجز", "العميل", "الشركة", "النواقص"], missing.map(function (x) { return [x.bid, x.client, x.company, x.miss.join(" / ")]; }));
    var msRows = missing.length ? missing.slice(0, 50).map(function (x) { return '<tr><td class="oc-k">' + esc(x.bid) + "</td><td>" + esc(x.client) + "</td><td>" + esc(x.company) + '</td><td class="oc-badges">' + badges(x.miss) + "</td></tr>"; }).join("") : '<tr><td colspan="4" class="oc-empty">لا إسنادات ناقصة ضمن النافذة.</td></tr>';
    var msCard = '<div class="oc-h2">📋 مراقب الإسنادات الناقصة · Missing Assignment Monitor</div><div class="oc-card"><table class="oc-tbl"><thead><tr><th>الحجز</th><th>العميل</th><th>الشركة</th><th>النواقص</th></tr></thead><tbody>' + msRows + "</tbody></table></div>";

    el("ocBody").innerHTML = filters + cards + naBanner + qa + alertCard + arrCard + depCard + fuCard + msCard;

    Array.prototype.forEach.call(document.querySelectorAll("[data-win]"), function (b) { b.addEventListener("click", function () { F.window = b.getAttribute("data-win"); render(); }); });
    if (el("ocDest")) el("ocDest").addEventListener("change", function () { F.dest = this.value; render(); });
    if (el("ocComp")) el("ocComp").addEventListener("change", function () { F.company = this.value; render(); });
    if (el("ocStatus")) el("ocStatus").addEventListener("change", function () { F.status = this.value; render(); });
    if (el("ocCsv")) el("ocCsv").addEventListener("click", exportCSV);
    if (el("ocPdf")) el("ocPdf").addEventListener("click", exportPDF);
    Array.prototype.forEach.call(document.querySelectorAll("[data-nav]"), function (btn) { btn.addEventListener("click", function () { navTo(btn.getAttribute("data-nav")); }); });
  }

  document.addEventListener("DOMContentLoaded", function () {
    el("ocRoot").innerHTML = '<div class="oc-head"><div><h1>مركز العمليات التنفيذي · Operations Command Center</h1><p class="oc-sub">شاشة إدارية واحدة — قراءة فقط. النافذة الافتراضية ٣٠ يوماً</p></div></div><div id="ocBody"></div>';
    render();
  });
})();
