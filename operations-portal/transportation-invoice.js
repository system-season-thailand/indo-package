/* Transportation Invoice Generator (Phase 5)
 * SOURCE OF TRUTH = the Transportation File. This module generates the
 * operational transportation invoice from it (header, movements, drivers,
 * regions). The only invoice-specific inputs are COSTS and ADDITIONAL
 * SERVICES (these do not exist anywhere else). Totals are auto-computed.
 * Does NOT modify Travel Book, Program Source, Pricing, Quotation,
 * Confirmed Booking, Driver Assignment, or Daily Boards logic.
 */
(function () {
  "use strict";
  var BID = "", FILE = null, INV = null, CURRENT_ROLE = "";
  function el(id) { return document.getElementById(id); }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function qp(k) { var m = new RegExp("[?&]" + k + "=([^&]*)").exec(location.search); return m ? decodeURIComponent(m[1]) : ""; }
  function num(v) { var n = parseFloat(v); return isNaN(n) ? 0 : n; }
  function fmt(n) { return (Math.round(n) || 0).toLocaleString("en-US"); }
  function roleLabel(r) { return ({ management: "الإدارة", booking: "الحجوزات", sales: "المبيعات" })[r] || (r || "—"); }
  var TYPE_LABEL = { airport_arrival: "استقبال مطار", airport_pickup: "استقبال مطار", airport_departure: "توصيل مطار", airport_dropoff: "توصيل مطار", point_to_point: "نقل نقطة-لنقطة", intercity: "نقل بين المدن", internal_flight: "رحلة داخلية", car_with_driver: "سيارة مع سائق", tour: "جولة", custom: "أخرى" };
  var QUICK_SERVICES = ["شريحة SIM", "شريحة E-SIM", "ورد", "كيك", "علبة عود", "خدمة VIP بالمطار", "مسار سريع Fast Track", "عشاء رومانسي"];
  var STATUS_LABEL = { draft: "مسودة · Draft", generated: "مولّدة · Generated", finalized: "معتمدة · Finalized" };
  function curOf() { return (FILE && FILE.destination_id === "thailand") ? "฿" : (FILE && FILE.destination_id === "maldives") ? "$" : "Rp"; }
  function money(n) { return curOf() + " " + fmt(n); }
  function destAr(d) { return d === "thailand" ? "تايلاند" : d === "indonesia" ? "إندونيسيا" : d === "maldives" ? "المالديف" : (d || "—"); }
  function describe(m) {
    var t = TYPE_LABEL[m.type] || m.type || "حركة";
    var route = (m.from || m.to) ? ((m.from || "—") + " ← " + (m.to || "—")) : "";
    return t + (route ? ": " + route : (m.city ? " — " + m.city : ""));
  }
  function signature(f) { try { return JSON.stringify({ m: (f.movements || []).map(function (m) { return [m.id, m.driver_id, m.city, m.date, m.type, m.from, m.to]; }), h: (f.hotels || []).map(function (h) { return h.name; }), d: f.dates, c: f.customer_name, p: f.pax }); } catch (e) { return ""; } }

  function newInvoice() { return { booking_id: BID, status: "draft", agent: "", costs: {}, services: [], source_sig: signature(FILE), generated_at: "", snapshot: null }; }
  function loadInvoice() {
    INV = (window.TransportationInvoiceStore && TransportationInvoiceStore.load(BID)) || newInvoice();
    INV.costs = INV.costs || {}; INV.services = INV.services || []; INV.status = INV.status || "draft"; if (typeof INV.agent !== "string") INV.agent = "";
  }
  function liveRows() {
    return (FILE.movements || []).map(function (m) {
      return { mid: m.id, date: m.date || "", desc: describe(m), driver: m.driver_name || "", city: m.city || "—", cost: num(INV.costs[m.id]), note: m.note || "" };
    });
  }
  function computeTotals(rows, services) {
    var byCity = {}, byDriver = {}, moveTotal = 0;
    rows.forEach(function (r) { moveTotal += num(r.cost); var c = r.city || "—"; byCity[c] = (byCity[c] || 0) + num(r.cost); var d = r.driver || "بدون سائق"; byDriver[d] = (byDriver[d] || 0) + num(r.cost); });
    var svcTotal = (services || []).reduce(function (a, s) { return a + num(s.qty) * num(s.cost); }, 0);
    return { byCity: byCity, byDriver: byDriver, moveTotal: moveTotal, svcTotal: svcTotal, grand: moveTotal + svcTotal };
  }
  function headerData() {
    var intl = FILE.flight_no || "";
    var dom = (FILE.movements || []).filter(function (m) { return m.type === "internal_flight"; }).map(function (m) { return m.flight; }).filter(Boolean).join("، ");
    var drivers = []; (FILE.movements || []).forEach(function (m) { if (m.driver_name && drivers.indexOf(m.driver_name) === -1) drivers.push(m.driver_name); });
    return { booking_no: FILE.booking_id, program_no: FILE.program_no || "—", customer: FILE.customer_name || "—", agent: INV.agent, pax: FILE.pax || "—", intl: intl || "—", dom: dom || "—", start: (FILE.dates && FILE.dates.start) || "—", end: (FILE.dates && FILE.dates.end) || "—", drivers: drivers.length ? drivers.join("، ") : "—", vip: !!FILE.vip, destination: destAr(FILE.destination_id) };
  }

  // ---------- render ----------
  function render() {
    if (!FILE) { showNoFile(); return; }
    var finalized = INV.status === "finalized" && INV.snapshot;
    var h = finalized ? INV.snapshot.header : headerData();
    var rows = finalized ? INV.snapshot.rows : liveRows();
    var services = finalized ? INV.snapshot.services : INV.services;
    var t = computeTotals(rows, services);
    var ro = finalized; // read-only when finalized
    var changed = INV.source_sig && signature(FILE) !== INV.source_sig;

    var headCard = '<div class="inv-card"><div class="inv-h">معلومات الفاتورة · Invoice Header <span class="inv-auto">تُسحب تلقائياً من ملف المواصلات</span></div>' +
      '<div class="inv-grid">' +
      kv("رقم الحجز", esc(h.booking_no)) + kv("رقم البرنامج", esc(h.program_no)) +
      kv("اسم العميل", esc(h.customer)) +
      '<div class="inv-kv"><span class="ik">الوكيل · Agent</span>' + (ro ? '<span class="iv">' + (esc(h.agent) || "—") + '</span>' : '<input class="inv-in" data-agent value="' + esc(h.agent) + '" placeholder="اسم الوكيل (اختياري)">') + '</div>' +
      kv("عدد المسافرين", esc(String(h.pax))) + kv("التواريخ", esc(h.start) + " ← " + esc(h.end)) +
      kv("رحلة دولية", esc(h.intl)) + kv("رحلة داخلية", esc(h.dom)) +
      kv("السائقون", esc(h.drivers)) + kv("التصنيف", h.vip ? '<b class="vip">★ VIP</b>' : "عادي") +
      "</div></div>";

    var syncBanner = (changed && !ro) ? '<div class="inv-sync">⚠ تم تحديث ملف المواصلات — الفاتورة بحاجة لتحديث. <button type="button" id="invRegen" class="btn sm">تحديث الفاتورة</button></div>'
      : (changed && ro) ? '<div class="inv-sync warn">⚠ تغيّر ملف المواصلات بعد الاعتماد. الفاتورة المعتمدة محفوظة كما هي — لإعادة التوليد افتح القفل.</div>' : "";

    var moveRows = rows.length ? rows.map(function (r, i) {
      var costCell = ro ? money(r.cost) : '<input class="inv-cost" data-mid="' + esc(r.mid) + '" type="number" min="0" step="1000" value="' + (r.cost || "") + '" placeholder="0">';
      return "<tr><td>" + (i + 1) + "</td><td>" + (esc(r.date) || "—") + "</td><td>" + esc(r.desc) + "</td><td>" + (esc(r.driver) || '<span class="inv-miss">—</span>') +
        "</td><td>" + esc(r.city) + '</td><td class="inv-c">' + costCell + "</td><td>" + (esc(r.note) || "") + "</td></tr>";
    }).join("") : '<tr><td colspan="7" class="inv-empty">لا حركات في الملف.</td></tr>';
    var movesCard = '<div class="inv-card"><div class="inv-h">حركات المواصلات · Movements</div><table class="inv-tbl"><thead><tr><th>#</th><th>التاريخ</th><th>الوصف</th><th>السائق</th><th>المنطقة</th><th>التكلفة</th><th>ملاحظات</th></tr></thead><tbody>' + moveRows + "</tbody></table></div>";

    // additional services
    var svcRows = (services || []).map(function (s, i) {
      var line = num(s.qty) * num(s.cost);
      if (ro) return "<tr><td>" + esc(s.name) + "</td><td>" + num(s.qty) + "</td><td>" + money(num(s.cost)) + "</td><td>" + money(line) + "</td></tr>";
      return '<tr data-si="' + i + '"><td><input class="inv-in" data-sf="name" value="' + esc(s.name) + '"></td>' +
        '<td><input class="inv-in sm" data-sf="qty" type="number" min="0" value="' + (s.qty || "") + '"></td>' +
        '<td><input class="inv-in" data-sf="cost" type="number" min="0" step="1000" value="' + (s.cost || "") + '"></td>' +
        '<td class="inv-c">' + money(line) + '</td><td><button type="button" class="lnk del" data-sdel="' + i + '">حذف</button></td></tr>';
    }).join("");
    var quick = ro ? "" : '<div class="inv-quick">' + QUICK_SERVICES.map(function (n) { return '<button type="button" class="inv-qchip" data-qsvc="' + esc(n) + '">+ ' + esc(n) + "</button>"; }).join("") + '<button type="button" class="inv-qchip alt" data-qsvc="">+ خدمة مخصصة</button></div>';
    var svcCard = '<div class="inv-card"><div class="inv-h">خدمات إضافية · Additional Services</div>' +
      '<table class="inv-tbl"><thead><tr><th>الخدمة</th><th>الكمية</th><th>التكلفة</th><th>الإجمالي</th>' + (ro ? "" : "<th></th>") + "</tr></thead><tbody id=\"invSvcBody\">" + (svcRows || '<tr><td colspan="' + (ro ? 4 : 5) + '" class="inv-empty">لا خدمات إضافية.</td></tr>') + "</tbody></table>" + quick + "</div>";

    // regional + driver totals
    var regCard = '<div class="inv-card"><div class="inv-h">إجماليات المناطق · Regional Totals</div><div id="invReg">' + regionalHTML(t) + "</div></div>";
    var drvCard = '<div class="inv-card"><div class="inv-h">إجماليات السائقين · Driver Totals <span class="inv-auto">للمراجعة المحاسبية</span></div><div id="invDrv">' + driverHTML(t) + "</div></div>";
    var grandCard = '<div class="inv-card inv-grand"><div class="inv-grand-row"><span>إجمالي المناطق</span><b id="invMoveTot">' + money(t.moveTotal) + "</b></div>" +
      '<div class="inv-grand-row"><span>الخدمات الإضافية</span><b id="invSvcTot">' + money(t.svcTotal) + "</b></div>" +
      '<div class="inv-grand-row total"><span>الإجمالي الكلي · Grand Total</span><b id="invGrand">' + money(t.grand) + "</b></div></div>";

    // status bar
    var st = INV.status;
    var actions = "";
    if (st === "draft") actions = '<button type="button" id="invGen" class="btn primary">توليد الفاتورة · Generate</button>';
    else if (st === "generated") actions = '<button type="button" id="invFinal" class="btn primary">اعتماد · Finalize</button><button type="button" id="invDraft" class="btn ghost">رجوع لمسودة</button>';
    else if (st === "finalized") actions = '<button type="button" id="invUnlock" class="btn ghost">فتح القفل · Unlock</button>';
    var statusBar = '<div class="inv-status st-' + st + '"><span class="st-pill">' + (STATUS_LABEL[st] || st) + "</span><div class=\"st-actions\">" + actions +
      '<button type="button" id="invPrint" class="btn ghost">🖨️ طباعة</button><button type="button" id="invPdf" class="btn ghost">⬇️ PDF</button>' +
      '<button type="button" id="invSave" class="btn save">حفظ · Save</button><span class="saved-tag" id="invSaved"></span></div></div>';

    el("invRoot").innerHTML =
      '<div class="inv-head"><div><h1>فاتورة المواصلات · Transportation Invoice</h1>' +
      '<p class="inv-sub">' + esc(FILE.booking_id) + " · فاتورة تشغيلية (محاسبة السائقين) — ليست فاتورة المبيعات</p></div>" +
      '<span class="inv-statemini st-' + st + '">' + (STATUS_LABEL[st] || st).split(" · ")[0] + "</span></div>" +
      statusBar + syncBanner + headCard + movesCard + svcCard + regCard + drvCard + grandCard;

    wire(ro);
    setSaved("");
  }
  function regionalHTML(t) {
    var cities = Object.keys(t.byCity).filter(function (c) { return c && c !== "—"; });
    if (!cities.length) return '<p class="inv-empty">لا مناطق بعد.</p>';
    return '<table class="inv-tbl"><tbody>' + cities.map(function (c) { return "<tr><td>إجمالي " + esc(c) + '</td><td class="inv-c">' + money(t.byCity[c]) + "</td></tr>"; }).join("") + "</tbody></table>";
  }
  function driverHTML(t) {
    var ds = Object.keys(t.byDriver).filter(function (d) { return d && d !== "بدون سائق"; });
    if (!ds.length) return '<p class="inv-empty">لا سائقين بعد.</p>';
    ds.sort(function (a, b) { return t.byDriver[b] - t.byDriver[a]; });
    return '<table class="inv-tbl"><tbody>' + ds.map(function (d) { return "<tr><td>" + esc(d) + '</td><td class="inv-c">' + money(t.byDriver[d]) + "</td></tr>"; }).join("") + "</tbody></table>";
  }
  function refreshTotals() {
    var rows = liveRows(), t = computeTotals(rows, INV.services);
    if (el("invReg")) el("invReg").innerHTML = regionalHTML(t);
    if (el("invDrv")) el("invDrv").innerHTML = driverHTML(t);
    if (el("invMoveTot")) el("invMoveTot").textContent = money(t.moveTotal);
    if (el("invSvcTot")) el("invSvcTot").textContent = money(t.svcTotal);
    if (el("invGrand")) el("invGrand").textContent = money(t.grand);
    // refresh per-service line totals
    Array.prototype.forEach.call(document.querySelectorAll("#invSvcBody tr[data-si]"), function (tr) {
      var s = INV.services[+tr.getAttribute("data-si")]; if (s) { var cell = tr.querySelector(".inv-c"); if (cell) cell.textContent = money(num(s.qty) * num(s.cost)); }
    });
  }
  function kv(k, v) { return '<div class="inv-kv"><span class="ik">' + k + '</span><span class="iv">' + v + "</span></div>"; }

  function wire(ro) {
    if (el("invSave")) el("invSave").addEventListener("click", save);
    if (el("invPrint")) el("invPrint").addEventListener("click", openPrint);
    if (el("invPdf")) el("invPdf").addEventListener("click", openPrint);
    if (el("invGen")) el("invGen").addEventListener("click", function () { setInvStatus("generated"); });
    if (el("invDraft")) el("invDraft").addEventListener("click", function () { setInvStatus("draft"); });
    if (el("invFinal")) el("invFinal").addEventListener("click", finalize);
    if (el("invUnlock")) el("invUnlock").addEventListener("click", function () { INV.status = "generated"; INV.snapshot = null; save(); render(); });
    if (el("invRegen")) el("invRegen").addEventListener("click", function () { INV.source_sig = signature(FILE); dirtySave(); render(); setSaved("✓ حُدّثت الفاتورة"); });
    if (ro) return;
    Array.prototype.forEach.call(document.querySelectorAll(".inv-cost"), function (inp) {
      inp.addEventListener("input", function () { INV.costs[inp.getAttribute("data-mid")] = num(inp.value); markUnsaved(); refreshTotals(); });
    });
    var ag = document.querySelector("[data-agent]"); if (ag) ag.addEventListener("input", function () { INV.agent = ag.value; markUnsaved(); });
    Array.prototype.forEach.call(document.querySelectorAll("#invSvcBody tr[data-si] [data-sf]"), function (inp) {
      inp.addEventListener("input", function () {
        var i = +inp.closest("tr").getAttribute("data-si"), f = inp.getAttribute("data-sf");
        if (INV.services[i]) { INV.services[i][f] = (f === "name") ? inp.value : num(inp.value); markUnsaved(); refreshTotals(); }
      });
    });
    Array.prototype.forEach.call(document.querySelectorAll("[data-sdel]"), function (b) { b.addEventListener("click", function () { INV.services.splice(+b.getAttribute("data-sdel"), 1); render(); markUnsaved(); }); });
    Array.prototype.forEach.call(document.querySelectorAll("[data-qsvc]"), function (b) { b.addEventListener("click", function () { INV.services.push({ name: b.getAttribute("data-qsvc") || "خدمة", qty: 1, cost: 0 }); render(); markUnsaved(); }); });
  }

  function setSaved(t) { if (el("invSaved")) el("invSaved").textContent = t || ""; }
  function markUnsaved() { setSaved("• غير محفوظ"); }
  function dirtySave() { if (window.TransportationInvoiceStore) TransportationInvoiceStore.save(BID, INV); }
  function save() { dirtySave(); setSaved("✓ محفوظ · Saved"); }
  function setInvStatus(s) { INV.status = s; if (s === "generated") { INV.source_sig = signature(FILE); INV.generated_at = new Date().toISOString(); } save(); render(); }
  function finalize() {
    var rows = liveRows(); var t = computeTotals(rows, INV.services);
    INV.snapshot = { header: headerData(), rows: rows, services: INV.services.slice(), totals: { moveTotal: t.moveTotal, svcTotal: t.svcTotal, grand: t.grand }, currency: curOf(), at: new Date().toISOString() };
    INV.status = "finalized"; INV.source_sig = signature(FILE); save(); render();
  }

  // ---------- PDF / Print ----------
  function invoiceDocHTML() {
    var finalized = INV.status === "finalized" && INV.snapshot;
    var h = finalized ? INV.snapshot.header : headerData();
    var rows = finalized ? INV.snapshot.rows : liveRows();
    var services = finalized ? INV.snapshot.services : INV.services;
    var t = computeTotals(rows, services);
    var moveRows = rows.map(function (r, i) { return "<tr><td>" + (i + 1) + "</td><td>" + esc(r.date || "—") + "</td><td>" + esc(r.desc) + "</td><td>" + esc(r.driver || "—") + "</td><td>" + esc(r.city || "—") + '</td><td class="r">' + money(r.cost) + "</td></tr>"; }).join("");
    var svc = services.map(function (s) { return "<tr><td>" + esc(s.name) + "</td><td>" + num(s.qty) + '</td><td class="r">' + money(num(s.cost)) + '</td><td class="r">' + money(num(s.qty) * num(s.cost)) + "</td></tr>"; }).join("");
    var cities = Object.keys(t.byCity).filter(function (c) { return c && c !== "—"; });
    var reg = cities.map(function (c) { return '<tr><td>إجمالي ' + esc(c) + '</td><td class="r">' + money(t.byCity[c]) + "</td></tr>"; }).join("");
    var ds = Object.keys(t.byDriver).filter(function (d) { return d && d !== "بدون سائق"; }).sort(function (a, b) { return t.byDriver[b] - t.byDriver[a]; });
    var drv = ds.map(function (d) { return "<tr><td>" + esc(d) + '</td><td class="r">' + money(t.byDriver[d]) + "</td></tr>"; }).join("");
    return '<!DOCTYPE html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><title>فاتورة المواصلات ' + esc(h.booking_no) + '</title><style>' +
      '@page{size:A4;margin:13mm}*{box-sizing:border-box}body{font-family:"Segoe UI",Tahoma,Arial,sans-serif;color:#16233a;margin:0;font-size:10pt}' +
      '.logo{font-size:17pt;font-weight:800;color:#a57c52;letter-spacing:.5px}.logo small{display:block;font-size:8pt;color:#5b6b85;font-weight:400;letter-spacing:2px}' +
      '.top{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:2pt solid #16233a;padding-bottom:3mm;margin-bottom:4mm}' +
      '.ttl{text-align:left}.ttl h1{font-size:14pt;margin:0}.ttl .badge{display:inline-block;border:1px solid #16233a;border-radius:4px;padding:.5mm 2.5mm;font-size:8pt;font-weight:700;margin-top:1mm}' +
      '.grid{display:grid;grid-template-columns:1fr 1fr;gap:.6mm 6mm;font-size:9pt;margin-bottom:4mm}.grid span{color:#5b6b85}' +
      'h2{font-size:10.5pt;border-bottom:1pt solid #16233a;padding-bottom:1mm;margin:4mm 0 1.5mm}' +
      'table{width:100%;border-collapse:collapse;font-size:8.5pt}th,td{border:.5pt solid #b9c2d0;padding:1.3mm 2mm;text-align:right}th{background:#eef2f7}.r{text-align:left;font-variant-numeric:tabular-nums}' +
      '.two{display:flex;gap:6mm}.two>div{flex:1}' +
      '.grand{margin-top:4mm;border-top:2pt solid #16233a;padding-top:2mm}.grand div{display:flex;justify-content:space-between;font-size:10pt;padding:.6mm 0}.grand .tot{font-size:12pt;font-weight:800;border-top:1pt solid #b9c2d0;margin-top:1mm;padding-top:1.5mm}' +
      '.foot{margin-top:6mm;color:#5b6b85;font-size:7.5pt;border-top:.5pt solid #b9c2d0;padding-top:2mm}</style></head><body>' +
      '<div class="top"><div class="logo">سيزون ترافل<small>SEASON TRAVEL</small></div>' +
      '<div class="ttl"><h1>فاتورة المواصلات · Transportation Invoice</h1><span class="badge">' + (STATUS_LABEL[INV.status] || INV.status) + (h.vip ? ' · ★ VIP' : '') + '</span></div></div>' +
      '<div class="grid"><div><span>رقم الحجز: </span><b>' + esc(h.booking_no) + '</b></div><div><span>الشركة: </span>' + esc((FILE && FILE.company_name) || "—") + '</div>' +
      '<div><span>العميل: </span><b>' + esc(h.customer) + '</b></div><div><span>الوجهة: </span>' + esc(h.destination) + '</div>' +
      '<div><span>التواريخ: </span>' + esc(h.start) + ' ← ' + esc(h.end) + '</div><div><span>المسافرون: </span>' + esc(String(h.pax)) + '</div>' +
      '<div><span>رقم البرنامج: </span>' + esc(h.program_no) + '</div><div><span>الوكيل: </span>' + (esc(h.agent) || "—") + '</div>' +
      '<div><span>رحلة دولية/داخلية: </span>' + esc(h.intl) + ' / ' + esc(h.dom) + '</div>' +
      '<div><span>السائقون: </span>' + esc(h.drivers) + '</div></div>' +
      '<h2>حركات المواصلات</h2><table><thead><tr><th>#</th><th>التاريخ</th><th>الوصف</th><th>السائق</th><th>المنطقة</th><th>التكلفة</th></tr></thead><tbody>' + (moveRows || '<tr><td colspan="6">—</td></tr>') + '</tbody></table>' +
      (svc ? '<h2>خدمات إضافية</h2><table><thead><tr><th>الخدمة</th><th>الكمية</th><th>التكلفة</th><th>الإجمالي</th></tr></thead><tbody>' + svc + '</tbody></table>' : '') +
      '<div class="two"><div><h2>إجماليات المناطق</h2><table><tbody>' + (reg || '<tr><td>—</td></tr>') + '</tbody></table></div>' +
      '<div><h2>إجماليات السائقين</h2><table><tbody>' + (drv || '<tr><td>—</td></tr>') + '</tbody></table></div></div>' +
      '<div class="grand"><div><span>إجمالي المناطق</span><b>' + money(t.moveTotal) + '</b></div><div><span>الخدمات الإضافية</span><b>' + money(t.svcTotal) + '</b></div>' +
      '<div class="tot"><span>الإجمالي الكلي · Grand Total</span><b>' + money(t.grand) + '</b></div></div>' +
      '<p class="foot">سيزون ترافل · Season Travel — فاتورة مواصلات تشغيلية. تمت الطباعة: ' + new Date().toLocaleString("en-GB") + '</p></body></html>';
  }
  function openPrint() {
    var html = invoiceDocHTML(); var w = null;
    try { w = window.open("", "_blank"); } catch (e) { w = null; }
    if (w && w.document) { w.document.open(); w.document.write(html); w.document.close(); setTimeout(function () { try { w.focus(); w.print(); } catch (e) {} }, 350); return; }
    try { var blob = new Blob([html], { type: "text/html" }); var url = URL.createObjectURL(blob); var a = document.createElement("a"); a.href = url; a.target = "_blank"; a.rel = "noopener"; document.body.appendChild(a); a.click(); document.body.removeChild(a); setSaved("↗ فُتحت نسخة الطباعة"); }
    catch (e) { setSaved("تعذّر فتح نافذة الطباعة"); }
  }

  function showNoFile() { el("invRoot").innerHTML = '<div class="inv-head"><h1>فاتورة المواصلات</h1></div><div class="inv-card"><p class="inv-empty">لا يوجد ملف مواصلات لهذا الحجز — أنشئ ملف المواصلات أولاً ثم ولّد الفاتورة.</p></div>'; }
  function showEmpty() { el("invRoot").innerHTML = '<div class="inv-head"><h1>فاتورة المواصلات</h1></div><div class="inv-card"><p class="inv-empty">افتح الفاتورة من ملف المواصلات عبر زر «توليد فاتورة المواصلات».</p></div>'; }
  function onBooking(booking) {
    if (!booking) { showEmpty(); return; }
    BID = booking.booking_id || BID;
    FILE = (window.TransportationFileStore && TransportationFileStore.load(BID)) || null;
    if (!FILE) { showNoFile(); return; }
    loadInvoice(); render();
  }

  function post(type) { try { (window.parent && window.parent !== window ? window.parent : window).postMessage({ type: type }, "*"); } catch (e) {} }
  window.addEventListener("message", function (e) { var d = (e && e.data) || {}; if (d.type === "load-booking") { if (d.role) CURRENT_ROLE = d.role; onBooking(d.booking || null); } else if (d.type === "role") { if (d.role) CURRENT_ROLE = d.role; } });
  document.addEventListener("DOMContentLoaded", function () {
    post("request-role"); BID = qp("bookingId");
    if (!BID) { showEmpty(); return; }
    post("request-booking");
    setTimeout(function () { if (!FILE && !INV) { /* try local file directly */ FILE = (window.TransportationFileStore && TransportationFileStore.load(BID)) || null; if (FILE) { loadInvoice(); render(); } else showNoFile(); } }, 1800);
  });
})();
