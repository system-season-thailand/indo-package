/* Finance Center — DS5-A + DS5-B. Controlled accounting layer.
   Source of truth = Sales Invoices (read-only). Writes only to FinanceStore. */
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
  function curOf(dest) { return CURLBL[dest] || "Rp"; }
  var CUR_LIST = ["Rp", "THB", "USD"];
  function dnum(s) { return (s || "").slice(0, 10); }
  function today() { return new Date().toISOString().slice(0, 10); }
  function curMonth() { return today().slice(0, 7); }
  function daysUntil(d) { if (!d) return 99999; var x = Math.round((new Date(dnum(d)) - new Date(today())) / 86400000); return isFinite(x) ? x : 99999; }
  function ageDays(d) { return -daysUntil(d); }
  function money(cur, n) { return cur + " " + thou(n); }
  function fmtMap(map) { var ks = CUR_LIST.filter(function (c) { return map[c]; }); return ks.length ? ks.map(function (c) { return money(c, map[c]); }).join(" · ") : "—"; }
  function addCur(map, cur, v) { map[cur] = (map[cur] || 0) + v; }
  var ACTOR = "management";

  // ---- programs preload (supplier hotel amounts) ----
  var PROGRAMS = {};
  function preloadPrograms(cb) {
    var nos = {}; bookings().forEach(function (b) { if (b.program_no) nos[b.program_no] = 1; });
    var list = Object.keys(nos), left = list.length;
    if (!left) { cb(); return; }
    list.forEach(function (no) {
      fetch("travel-book/programs/" + no + ".json").then(function (r) { return r.json(); }).then(function (j) {
        PROGRAMS[no] = (j.hotels || []).map(function (h) { return { name: h.property_name || h.name, nights: num(h.total_nights) || 0, rooms: num(h.total_room) || 1 }; });
      }).catch(function () {}).then(function () { if (--left <= 0) cb(); });
    });
  }
  function hotelsFor(b) { if (b.program_no && PROGRAMS[b.program_no] && PROGRAMS[b.program_no].length) return PROGRAMS[b.program_no]; return [{ name: b.hotel_name || "—", nights: Math.max(1, daysUntil(b.check_out) - daysUntil(b.check_in)), rooms: 1 }]; }

  // ---- receivables (derived from generated Sales Invoices) ----
  function receivables() {
    if (!window.InvoiceStore) return [];
    return InvoiceStore.list().filter(function (r) { return r.type === "sales" && r.invoice && (r.invoice.status === "generated" || r.invoice.status === "sent"); })
      .map(function (r) { var b = byId(r.booking_id); if (!b) return null; return { booking_id: b.booking_id, company: b.company_name || "—", customer: b.guest_name || "—", destination: b.destination, currency: curOf(b.destination), arrival: dnum(b.check_in), amount: num(b.booking_value), invoiceDate: dnum(r.created_at) }; })
      .filter(Boolean);
  }
  function allocMap() { var m = {}; (window.FinanceStore ? FinanceStore.listPayments() : []).forEach(function (p) { if (p.void) return; (p.allocations || []).forEach(function (a) { m[a.booking_id] = (m[a.booking_id] || 0) + num(a.amount); }); }); return m; }
  function withBalances() {
    var am = allocMap();
    return receivables().map(function (r) { var paid = am[r.booking_id] || 0, rem = r.amount - paid; r.paid = paid; r.remaining = rem < 0 ? 0 : rem; r.status = paid <= 0 ? "unpaid" : (paid >= r.amount ? "paid" : "partial"); return r; });
  }
  var STLBL = { unpaid: "غير مدفوعة · Unpaid", partial: "جزئية · Partial", paid: "مدفوعة · Paid" };
  function stPill(s) { return '<span class="fc-st st-' + s + '">' + (STLBL[s] || s).split(" · ")[0] + "</span>"; }

  // ---- export (Module 8) ----
  var XT = { title: "", headers: [], rows: [] };
  function setXT(title, headers, rows) { XT = { title: title, headers: headers, rows: rows }; }
  function exportBar() { return '<div class="fc-exportbar"><button type="button" class="fc-btn ghost sm" id="fcCsv">⬇️ Excel (CSV)</button><button type="button" class="fc-btn ghost sm" id="fcPdf">🖨️ PDF</button></div>'; }
  function wireExport() { if (el("fcCsv")) el("fcCsv").addEventListener("click", exportCSV); if (el("fcPdf")) el("fcPdf").addEventListener("click", exportPDF); }
  function exportCSV() {
    var lines = [XT.headers.join(",")];
    XT.rows.forEach(function (r) { lines.push(r.map(function (c) { var s = String(c == null ? "" : c); return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; }).join(",")); });
    var blob = new Blob(["\ufeff" + lines.join("\r\n")], { type: "text/csv;charset=utf-8;" }), u = URL.createObjectURL(blob), a = document.createElement("a");
    a.href = u; a.download = (XT.title.split(" · ")[0] || "finance") + "-" + today() + ".csv"; document.body.appendChild(a); a.click(); document.body.removeChild(a);
  }
  function exportPDF() {
    var html = '<!DOCTYPE html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><title>' + esc(XT.title) + '</title><style>@page{size:A4 landscape;margin:12mm}*{box-sizing:border-box}body{font-family:"Segoe UI",Tahoma,Arial,sans-serif;color:#16233a;margin:0;font-size:9.5pt}.top{display:flex;justify-content:space-between;border-bottom:2pt solid #16233a;padding-bottom:3mm;margin-bottom:4mm}.logo{font-size:16pt;font-weight:800;color:#a57c52}.logo small{display:block;font-size:7.5pt;color:#5b6b85;letter-spacing:2px}.ttl h1{font-size:13pt;margin:0;text-align:left}table{width:100%;border-collapse:collapse;font-size:8.5pt}th,td{border:.5pt solid #b9c2d0;padding:1.5mm 2mm;text-align:right}th{background:#eef2f7}.foot{margin-top:5mm;color:#5b6b85;font-size:7.5pt;border-top:.5pt solid #b9c2d0;padding-top:2mm}</style></head><body>' +
      '<div class="top"><div class="logo">سيزون ترافل<small>SEASON TRAVEL</small></div><div class="ttl"><h1>' + esc(XT.title) + '</h1></div></div>' +
      '<table><thead><tr>' + XT.headers.map(function (h) { return "<th>" + esc(h) + "</th>"; }).join("") + "</tr></thead><tbody>" +
      XT.rows.map(function (r) { return "<tr>" + r.map(function (c) { return "<td>" + esc(c) + "</td>"; }).join("") + "</tr>"; }).join("") + "</tbody></table>" +
      '<p class="foot">سيزون ترافل · Season Travel — تقرير محاسبي. تاريخ الطباعة: ' + new Date().toLocaleString("en-GB") + "</p></body></html>";
    var w = null; try { w = window.open("", "_blank"); } catch (e) { w = null; }
    if (w && w.document) { w.document.open(); w.document.write(html); w.document.close(); setTimeout(function () { try { w.focus(); w.print(); } catch (e) {} }, 350); return; }
    try { var b = new Blob([html], { type: "text/html" }), u = URL.createObjectURL(b), a = document.createElement("a"); a.href = u; a.target = "_blank"; a.rel = "noopener"; document.body.appendChild(a); a.click(); document.body.removeChild(a); } catch (e) {}
  }

  // ============ ACCOUNTANT DASHBOARD (DS5-A) ============
  function renderDashboard() {
    var rec = withBalances(), outstanding = {};
    rec.forEach(function (r) { if (r.remaining > 0) addCur(outstanding, r.currency, r.remaining); });
    var paidMonth = {}; (window.FinanceStore ? FinanceStore.listPayments() : []).forEach(function (p) { if (!p.void && dnum(p.date).slice(0, 7) === curMonth()) addCur(paidMonth, p.currency, num(p.amount)); });
    var open = rec.filter(function (r) { return r.remaining > 0; });
    var debt = {}; open.forEach(function (r) { debt[r.company] = 1; });
    var soon = open.filter(function (r) { var d = daysUntil(r.arrival); return d >= 0 && d <= 7; }).sort(function (a, b) { return daysUntil(a.arrival) - daysUntil(b.arrival); });
    var oldest = open.slice().sort(function (a, b) { return String(a.arrival).localeCompare(String(b.arrival)); })[0];
    function card(n, l, c) { return '<div class="fc-kpi ' + (c || "") + '"><div class="fc-kpi-n">' + n + '</div><div class="fc-kpi-l">' + l + "</div></div>"; }
    var cards = '<div class="fc-kpis">' + card(fmtMap(outstanding), "إجمالي المستحقات · Total Outstanding", "k-out") + card(fmtMap(paidMonth), "مدفوعات هذا الشهر · Paid This Month", "k-paid") + card(open.length, "فواتير مفتوحة · Open Invoices", "k-n") + card(Object.keys(debt).length, "شركات عليها مديونية · Companies With Debt", "k-n") + card(soon.length, "وصول خلال ٧ أيام · Follow-Up", "k-warn") + card(oldest ? (oldest.booking_id + " · " + destAr(oldest.destination)) : "—", "أقدم فاتورة مستحقة · Oldest Outstanding", "k-old") + "</div>";
    var rows = soon.map(function (r) { return "<tr><td>" + esc(r.company) + "</td><td>" + esc(r.customer) + "</td><td>" + esc(r.arrival) + '</td><td class="fc-r">' + money(r.currency, r.remaining) + "</td><td>" + daysUntil(r.arrival) + " يوم</td><td>" + stPill(r.status) + "</td></tr>"; }).join("");
    el("fcBody").innerHTML = cards + '<div class="fc-h2">وصول خلال ٧ أيام مع رصيد مستحق · Arrivals Within 7 Days</div>' + '<div class="fc-card"><table class="fc-tbl"><thead><tr><th>الشركة</th><th>العميل</th><th>الوصول</th><th>المستحق</th><th>أيام</th><th>الحالة</th></tr></thead><tbody>' + (rows || '<tr><td colspan="6" class="fc-empty">لا وصول خلال ٧ أيام مع رصيد.</td></tr>') + "</tbody></table></div>" + '<p class="fc-foot">المصدر: فواتير المبيعات المولّدة. العملات منفصلة.</p>';
  }

  // ============ COMPANY STATEMENT (Module 1) ============
  var STMT = { co: null, from: "", to: "", dest: "all" };
  function statementRows(co) {
    return withBalances().filter(function (r) { return r.company === co && (STMT.dest === "all" || r.destination === STMT.dest) && (!STMT.from || r.invoiceDate >= STMT.from) && (!STMT.to || r.invoiceDate <= STMT.to); }).sort(function (a, b) { return String(a.invoiceDate).localeCompare(String(b.invoiceDate)); });
  }
  function renderStatement() {
    var comps = {}; withBalances().forEach(function (r) { comps[r.company] = 1; });
    function selCo() { return '<select id="stCo"><option value="">— كل الشركات (قائمة) —</option>' + Object.keys(comps).sort().map(function (c) { return '<option value="' + esc(c) + '"' + (STMT.co === c ? " selected" : "") + ">" + esc(c) + "</option>"; }).join("") + "</select>"; }
    function selDest() { return '<select id="stDest">' + [["all", "كل الوجهات"], ["indonesia", "إندونيسيا"], ["thailand", "تايلند"], ["maldives", "المالديف"]].map(function (o) { return '<option value="' + o[0] + '"' + (STMT.dest === o[0] ? " selected" : "") + ">" + o[1] + "</option>"; }).join("") + "</select>"; }
    var bar = '<div class="fc-filters"><label class="fc-f"><span>الشركة</span>' + selCo() + '</label><label class="fc-f"><span>الوجهة</span>' + selDest() + '</label><label class="fc-f"><span>من (تاريخ الفاتورة)</span><input type="date" id="stFrom" value="' + esc(STMT.from) + '"></label><label class="fc-f"><span>إلى</span><input type="date" id="stTo" value="' + esc(STMT.to) + '"></label></div>';
    var html = bar;
    if (!STMT.co) {
      var g = companyAgg(), list = Object.keys(g).map(function (k) { return g[k]; }).sort(function (a, b) { return a.co.localeCompare(b.co); });
      var body = list.length ? list.map(function (x) { return '<tr class="fc-corow" data-co="' + esc(x.co) + '"><td class="fc-k">' + esc(x.co) + "</td><td>" + fmtMap(x.inv) + "</td><td>" + fmtMap(x.paid) + '</td><td class="fc-r">' + fmtMap(x.out) + "</td><td>" + x.open + "</td></tr>"; }).join("") : '<tr><td colspan="5" class="fc-empty">لا فواتير.</td></tr>';
      setXT("كشف حساب الشركات · Company Statements", ["الشركة", "إجمالي الفواتير", "المدفوع", "المستحق", "مفتوحة"], list.map(function (x) { return [x.co, fmtMap(x.inv), fmtMap(x.paid), fmtMap(x.out), String(x.open)]; }));
      html += exportBar() + '<p class="fc-hint">اختر شركة لعرض كشف حسابها التفصيلي مع الرصيد الجاري.</p><div class="fc-card"><table class="fc-tbl"><thead><tr><th>الشركة</th><th>إجمالي الفواتير</th><th>المدفوع</th><th>المستحق</th><th>مفتوحة</th></tr></thead><tbody>' + body + "</tbody></table></div>";
      el("fcBody").innerHTML = html;
      Array.prototype.forEach.call(document.querySelectorAll(".fc-corow"), function (tr) { tr.addEventListener("click", function () { STMT.co = tr.getAttribute("data-co"); render(); }); });
    } else {
      var rows = statementRows(STMT.co), run = {};
      var body = rows.length ? rows.map(function (r) { run[r.currency] = (run[r.currency] || 0) + r.remaining; return "<tr><td>" + esc(r.invoiceDate) + "</td><td>" + esc(r.booking_id) + "</td><td>" + esc(r.customer) + "</td><td>" + esc(r.arrival) + '</td><td class="fc-r">' + money(r.currency, r.amount) + '</td><td class="fc-r">' + money(r.currency, r.paid) + '</td><td class="fc-r">' + money(r.currency, r.remaining) + "</td><td>" + stPill(r.status) + '</td><td class="fc-r">' + money(r.currency, run[r.currency]) + "</td></tr>"; }).join("") : '<tr><td colspan="9" class="fc-empty">لا فواتير ضمن الفلاتر.</td></tr>';
      // DS5-B.1: balance flow (invoices + payments) + payment history + receipt
      var pays = (window.FinanceStore ? FinanceStore.listPayments() : []).filter(function (p) { return !p.void && p.company === STMT.co && (!STMT.from || dnum(p.date) >= STMT.from) && (!STMT.to || dnum(p.date) <= STMT.to); });
      var flow = [];
      rows.forEach(function (r) { flow.push({ date: r.invoiceDate, desc: "إنشاء فاتورة · Invoice Created", ref: r.booking_id, debit: r.amount, credit: 0, cur: r.currency }); });
      pays.forEach(function (p) { var applied = (p.allocations || []).reduce(function (a, al) { return a + num(al.amount); }, 0) || num(p.amount); flow.push({ date: dnum(p.date), desc: "دفعة مستلمة · Payment Received" + (p.bank ? " (" + p.bank + ")" : ""), ref: p.reference || p.id, debit: 0, credit: applied, cur: p.currency }); });
      flow.sort(function (a, b) { return String(a.date).localeCompare(String(b.date)) || (b.debit - a.debit); });
      var frun = {}; flow.forEach(function (t) { frun[t.cur] = (frun[t.cur] || 0) + t.debit - t.credit; t.run = frun[t.cur]; });
      var flowBody = flow.length ? flow.map(function (t) { return "<tr><td>" + esc(t.date) + "</td><td>" + esc(t.desc.split(" · ")[0]) + "</td><td>" + esc(t.ref) + '</td><td class="fc-r fc-debit">' + (t.debit ? "+" + money(t.cur, t.debit) : "—") + '</td><td class="fc-r fc-credit">' + (t.credit ? "−" + money(t.cur, t.credit) : "—") + '</td><td class="fc-r">' + money(t.cur, t.run) + "</td></tr>"; }).join("") : '<tr><td colspan="6" class="fc-empty">لا حركة.</td></tr>';
      var ph = []; pays.forEach(function (p) { var al = p.allocations || []; if (al.length) al.forEach(function (a) { ph.push({ date: dnum(p.date), inv: a.booking_id, amt: num(a.amount), cur: p.currency, ref: p.reference || "—", notes: p.notes || "—", att: p.attachment }); }); else ph.push({ date: dnum(p.date), inv: "—", amt: num(p.amount), cur: p.currency, ref: p.reference || "—", notes: p.notes || "—", att: p.attachment }); });
      ph.sort(function (a, b) { return String(a.date).localeCompare(String(b.date)); });
      var phBody = ph.length ? ph.map(function (x) { return "<tr><td>" + esc(x.date) + "</td><td>" + esc(STMT.co) + "</td><td>" + esc(x.inv) + '</td><td class="fc-r">' + money(x.cur, x.amt) + "</td><td>" + esc(x.cur) + "</td><td>" + esc(x.ref) + "</td><td>" + esc(x.notes) + "</td><td>" + (x.att ? '<a href="' + esc(x.att.dataUrl) + '" download="' + esc(x.att.name) + '" class="fc-link" title="' + esc(x.att.name) + '">📎</a>' : "—") + "</td></tr>"; }).join("") : '<tr><td colspan="8" class="fc-empty">لا مدفوعات.</td></tr>';
      // export = balance flow: includes invoices (+), payments (−), and running balance
      setXT("كشف حساب · " + STMT.co, ["التاريخ", "البيان", "المرجع", "مدين (+)", "دائن (−)", "الرصيد الجاري"], flow.map(function (t) { return [t.date, t.desc.split(" · ")[0], t.ref, t.debit ? "+" + money(t.cur, t.debit) : "", t.credit ? "−" + money(t.cur, t.credit) : "", money(t.cur, t.run)]; }));
      html = '<button type="button" class="fc-back" id="stBack">← كل الشركات</button>' + bar + exportBar() + '<div class="fc-h2">كشف حساب · ' + esc(STMT.co) + "</div>" +
        '<div class="fc-card"><table class="fc-tbl"><thead><tr><th>تاريخ الفاتورة</th><th>الحجز</th><th>العميل</th><th>الوصول</th><th>المبلغ</th><th>المدفوع</th><th>المستحق</th><th>الحالة</th><th>الرصيد الجاري</th></tr></thead><tbody>' + body + "</tbody></table></div>" +
        '<div class="fc-h2">تدفّق الرصيد · Balance Flow</div><div class="fc-card"><table class="fc-tbl"><thead><tr><th>التاريخ</th><th>البيان</th><th>المرجع</th><th>مدين (+)</th><th>دائن (−)</th><th>الرصيد الجاري</th></tr></thead><tbody>' + flowBody + "</tbody></table></div>" +
        '<div class="fc-h2">سجل المدفوعات · Payment History</div><div class="fc-card"><table class="fc-tbl"><thead><tr><th>تاريخ الدفعة</th><th>الشركة</th><th>رقم الفاتورة</th><th>المبلغ المدفوع</th><th>العملة</th><th>المرجع</th><th>ملاحظات</th><th>الإيصال</th></tr></thead><tbody>' + phBody + "</tbody></table></div>" +
        '<p class="fc-foot">تدفّق الرصيد: الفاتورة تزيد الرصيد (+)، الدفعة تخفّضه (−)، الرصيد الجاري لكل عملة. التصدير (PDF/Excel) يشمل الفواتير والمدفوعات والرصيد الجاري. الإيصال للعرض فقط.</p>';
      el("fcBody").innerHTML = html;
      if (el("stBack")) el("stBack").addEventListener("click", function () { STMT.co = null; render(); });
    }
    if (el("stCo")) el("stCo").addEventListener("change", function () { STMT.co = this.value || null; render(); });
    if (el("stDest")) el("stDest").addEventListener("change", function () { STMT.dest = this.value; render(); });
    if (el("stFrom")) el("stFrom").addEventListener("change", function () { STMT.from = this.value; render(); });
    if (el("stTo")) el("stTo").addEventListener("change", function () { STMT.to = this.value; render(); });
    wireExport();
  }
  function companyAgg() {
    var rec = withBalances(), g = {};
    rec.forEach(function (r) { var x = g[r.company] || (g[r.company] = { co: r.company, inv: {}, paid: {}, out: {}, open: 0, lastPay: "", nextArr: "" }); addCur(x.inv, r.currency, r.amount); addCur(x.paid, r.currency, r.paid); if (r.remaining > 0) { addCur(x.out, r.currency, r.remaining); x.open++; } var d = daysUntil(r.arrival); if (d >= 0 && (!x.nextArr || r.arrival < x.nextArr)) x.nextArr = r.arrival; });
    (window.FinanceStore ? FinanceStore.listPayments() : []).forEach(function (p) { if (p.void) return; var x = g[p.company]; if (x && dnum(p.date) > x.lastPay) x.lastPay = dnum(p.date); });
    return g;
  }

  // ============ OPEN INVOICES (DS5-A) ============
  var OPEN_F = { status: "all", company: "all" };
  function renderOpen() {
    var rec = withBalances();
    var rows = rec.filter(function (r) { return (OPEN_F.status === "all" || r.status === OPEN_F.status) && (OPEN_F.company === "all" || r.company === OPEN_F.company); }).sort(function (a, b) { return String(a.arrival).localeCompare(String(b.arrival)); });
    var comps = {}; rec.forEach(function (r) { comps[r.company] = 1; });
    function sel(id, val, opts) { return '<select id="' + id + '">' + opts.map(function (o) { return '<option value="' + esc(o[0]) + '"' + (val === o[0] ? " selected" : "") + ">" + esc(o[1]) + "</option>"; }).join("") + "</select>"; }
    var bar = '<div class="fc-filters"><label class="fc-f"><span>الحالة</span>' + sel("fcOStatus", OPEN_F.status, [["all", "الكل"], ["unpaid", "غير مدفوعة"], ["partial", "جزئية"], ["paid", "مدفوعة"]]) + '</label><label class="fc-f"><span>الشركة</span>' + sel("fcOComp", OPEN_F.company, [["all", "كل الشركات"]].concat(Object.keys(comps).sort().map(function (c) { return [c, c]; }))) + "</label></div>";
    setXT("الفواتير المفتوحة · Open Invoices", ["رقم الفاتورة", "الشركة", "العميل", "الوصول", "المبلغ", "المدفوع", "المتبقي", "الحالة"], rows.map(function (r) { return [r.booking_id, r.company, r.customer, r.arrival, money(r.currency, r.amount), money(r.currency, r.paid), money(r.currency, r.remaining), (STLBL[r.status] || r.status).split(" · ")[0]]; }));
    var body = rows.length ? rows.map(function (r) { return "<tr><td class='fc-k'>" + esc(r.booking_id) + "</td><td>" + esc(r.company) + "</td><td>" + esc(r.customer) + "</td><td>" + esc(r.arrival) + '</td><td class="fc-r">' + money(r.currency, r.amount) + '</td><td class="fc-r">' + money(r.currency, r.paid) + '</td><td class="fc-r">' + money(r.currency, r.remaining) + "</td><td>" + stPill(r.status) + "</td></tr>"; }).join("") : '<tr><td colspan="8" class="fc-empty">لا فواتير.</td></tr>';
    el("fcBody").innerHTML = bar + exportBar() + '<div class="fc-card"><table class="fc-tbl"><thead><tr><th>رقم الفاتورة</th><th>الشركة</th><th>العميل</th><th>الوصول</th><th>المبلغ</th><th>المدفوع</th><th>المتبقي</th><th>الحالة</th></tr></thead><tbody>' + body + "</tbody></table></div>";
    if (el("fcOStatus")) el("fcOStatus").addEventListener("change", function () { OPEN_F.status = this.value; render(); });
    if (el("fcOComp")) el("fcOComp").addEventListener("change", function () { OPEN_F.company = this.value; render(); });
    wireExport();
  }

  // ============ UNPAID COMPANIES (Module 2) ============
  var UNPAID_F = "all";
  function renderUnpaid() {
    var rec = withBalances().filter(function (r) { return r.remaining > 0; });
    if (UNPAID_F !== "all") { var lim = UNPAID_F === "7" ? 7 : 30; rec = rec.filter(function (r) { var d = daysUntil(r.arrival); return d >= 0 && d <= lim; }); }
    var g = {};
    rec.forEach(function (r) { var x = g[r.company] || (g[r.company] = { co: r.company, out: {}, n: 0, near: "", oldest: "", sortv: 0 }); addCur(x.out, r.currency, r.remaining); x.n++; x.sortv += r.remaining; var d = daysUntil(r.arrival); if (d >= 0 && (!x.near || r.arrival < x.near)) x.near = r.arrival; if (!x.oldest || r.arrival < x.oldest) x.oldest = r.arrival; });
    var rows = Object.keys(g).map(function (k) { return g[k]; }).sort(function (a, b) { return b.sortv - a.sortv; });
    function chip(v, l) { return '<button type="button" class="fc-chip' + (UNPAID_F === v ? " on" : "") + '" data-uf="' + v + '">' + l + "</button>"; }
    var bar = '<div class="fc-chips">' + chip("7", "وصول خلال ٧ أيام") + chip("30", "خلال ٣٠ يوم") + chip("all", "الكل") + "</div>";
    setXT("شركات عليها مديونية · Companies With Outstanding", ["الشركة", "إجمالي المستحق", "فواتير غير مدفوعة", "أقرب وصول", "أقدم دين"], rows.map(function (x) { return [x.co, fmtMap(x.out), String(x.n), x.near || "—", x.oldest || "—"]; }));
    var body = rows.length ? rows.map(function (x) { return '<tr><td class="fc-k">' + esc(x.co) + '</td><td class="fc-r">' + fmtMap(x.out) + "</td><td>" + x.n + "</td><td>" + (x.near || "—") + "</td><td>" + (x.oldest || "—") + "</td></tr>"; }).join("") : '<tr><td colspan="5" class="fc-empty">لا شركات مدينة ضمن الفلتر.</td></tr>';
    el("fcBody").innerHTML = bar + exportBar() + '<p class="fc-hint">مرتّبة حسب الأعلى مديونية. العملات منفصلة.</p><div class="fc-card"><table class="fc-tbl"><thead><tr><th>الشركة</th><th>إجمالي المستحق</th><th>فواتير غير مدفوعة</th><th>أقرب وصول</th><th>أقدم دين</th></tr></thead><tbody>' + body + "</tbody></table></div>";
    Array.prototype.forEach.call(document.querySelectorAll("[data-uf]"), function (b) { b.addEventListener("click", function () { UNPAID_F = b.getAttribute("data-uf"); render(); }); });
    wireExport();
  }

  // ============ AR DASHBOARD (Module 3) ============
  function bucketOf(arrival) { var a = ageDays(arrival); if (a <= 0) return "current"; if (a <= 30) return "b30"; if (a <= 60) return "b60"; if (a <= 90) return "b90"; return "b90p"; }
  var BUCKETS = [["current", "حالي · Current"], ["b30", "٠–٣٠"], ["b60", "٣١–٦٠"], ["b90", "٦١–٩٠"], ["b90p", "٩٠+"]];
  function renderAR() {
    var rec = withBalances().filter(function (r) { return r.remaining > 0; });
    var total = {}, byBucket = {}; BUCKETS.forEach(function (b) { byBucket[b[0]] = {}; });
    var g = {};
    rec.forEach(function (r) { addCur(total, r.currency, r.remaining); var bk = bucketOf(r.arrival); addCur(byBucket[bk], r.currency, r.remaining); var x = g[r.company] || (g[r.company] = { co: r.company, b: {}, n: 0, oldest: "" }); BUCKETS.forEach(function (bb) { x.b[bb[0]] = x.b[bb[0]] || {}; }); addCur(x.b[bk], r.currency, r.remaining); x.n++; if (!x.oldest || r.arrival < x.oldest) x.oldest = r.arrival; });
    function card(n, l, c) { return '<div class="fc-kpi ' + (c || "") + '"><div class="fc-kpi-n">' + n + '</div><div class="fc-kpi-l">' + l + "</div></div>"; }
    var cards = '<div class="fc-kpis fc-kpis6">' + card(fmtMap(total), "إجمالي الذمم · Total Receivable", "k-out") + BUCKETS.map(function (b) { return card(fmtMap(byBucket[b[0]]), b[1], b[0] === "b90p" ? "k-warn" : ""); }).join("") + "</div>";
    var rows = Object.keys(g).map(function (k) { return g[k]; }).sort(function (a, b) { return a.co.localeCompare(b.co); });
    setXT("لوحة الذمم · AR Aging", ["الشركة"].concat(BUCKETS.map(function (b) { return b[1]; })).concat(["عدد", "أقدم"]), rows.map(function (x) { return [x.co].concat(BUCKETS.map(function (b) { return fmtMap(x.b[b[0]]); })).concat([String(x.n), x.oldest || "—"]); }));
    var body = rows.length ? rows.map(function (x) { return '<tr><td class="fc-k">' + esc(x.co) + "</td>" + BUCKETS.map(function (b) { return '<td class="fc-r">' + fmtMap(x.b[b[0]]) + "</td>"; }).join("") + "<td>" + x.n + "</td><td>" + (x.oldest || "—") + "</td></tr>"; }).join("") : '<tr><td colspan="8" class="fc-empty">لا ذمم مستحقة.</td></tr>';
    el("fcBody").innerHTML = cards + exportBar() + '<p class="fc-hint">أعمار الذمم حسب تاريخ الوصول. «حالي» = لم يصل بعد. العملات منفصلة.</p><div class="fc-card"><table class="fc-tbl"><thead><tr><th>الشركة</th>' + BUCKETS.map(function (b) { return "<th>" + b[1] + "</th>"; }).join("") + "<th>عدد</th><th>أقدم</th></tr></thead><tbody>" + body + "</tbody></table></div>";
    wireExport();
  }

  // ============ PAYMENTS (DS5-A) ============
  var PF = { date: "", company: "", currency: "Rp", amount: "", bank: "", reference: "", notes: "", alloc: {}, attachment: null };
  function companyOpenInv(co, cur) { return withBalances().filter(function (r) { return r.company === co && r.currency === cur && r.remaining > 0; }).sort(function (a, b) { return String(a.arrival).localeCompare(String(b.arrival)); }); }
  function renderPayments() {
    var rec = withBalances(), comps = {}; rec.forEach(function (r) { comps[r.company] = 1; });
    var banks = window.FinanceStore ? FinanceStore.listBanks() : [];
    function sel(id, val, opts, ph) { return '<select id="' + id + '">' + (ph ? '<option value="">' + ph + "</option>" : "") + opts.map(function (o) { return '<option value="' + esc(o[0]) + '"' + (val === o[0] ? " selected" : "") + ">" + esc(o[1]) + "</option>"; }).join("") + "</select>"; }
    var openInv = (PF.company ? companyOpenInv(PF.company, PF.currency) : []);
    var allocRows = openInv.length ? openInv.map(function (r) { return '<tr><td>' + esc(r.booking_id) + "</td><td>" + esc(r.customer) + "</td><td>" + esc(r.arrival) + '</td><td class="fc-r">' + money(r.currency, r.remaining) + '</td><td><input type="number" min="0" step="1" class="fc-alloc" data-bid="' + esc(r.booking_id) + '" data-max="' + r.remaining + '" value="' + (PF.alloc[r.booking_id] || "") + '" placeholder="0"></td></tr>'; }).join("") : '<tr><td colspan="5" class="fc-empty">' + (PF.company ? "لا فواتير مفتوحة بهذه العملة." : "اختر الشركة والعملة.") + "</td></tr>";
    var allocSum = openInv.reduce(function (a, r) { return a + num(PF.alloc[r.booking_id]); }, 0), unalloc = num(PF.amount) - allocSum;
    var form = '<div class="fc-card fc-form"><div class="fc-h">تسجيل دفعة · Register Payment</div><div class="fc-grid">' +
      '<label class="fc-f"><span>التاريخ</span><input type="date" id="pfDate" value="' + esc(PF.date || today()) + '"></label>' +
      '<label class="fc-f"><span>الشركة</span>' + sel("pfCo", PF.company, Object.keys(comps).sort().map(function (c) { return [c, c]; }), "— اختر —") + "</label>" +
      '<label class="fc-f"><span>العملة</span>' + sel("pfCur", PF.currency, CUR_LIST.map(function (c) { return [c, c]; })) + "</label>" +
      '<label class="fc-f"><span>المبلغ</span><input type="number" min="0" step="1" id="pfAmt" value="' + esc(PF.amount) + '" placeholder="0"></label>' +
      '<label class="fc-f"><span>البنك</span>' + sel("pfBank", PF.bank, banks.map(function (b) { return [b.name, b.name + " · " + b.currency]; }), "—") + "</label>" +
      '<label class="fc-f"><span>المرجع</span><input type="text" id="pfRef" value="' + esc(PF.reference) + '"></label>' +
      '<label class="fc-f fc-wide"><span>ملاحظات</span><input type="text" id="pfNotes" value="' + esc(PF.notes) + '"></label>' +
      '<label class="fc-f fc-wide"><span>إيصال (اختياري)</span><input type="file" id="pfFile" accept="image/*,application/pdf">' + (PF.attachment ? '<span class="fc-att">📎 ' + esc(PF.attachment.name) + "</span>" : "") + "</label></div>" +
      '<div class="fc-h">التخصيص · Allocation</div><table class="fc-tbl"><thead><tr><th>الفاتورة</th><th>العميل</th><th>الوصول</th><th>المتبقي</th><th>المخصّص</th></tr></thead><tbody>' + allocRows + "</tbody></table>" +
      '<div class="fc-allocbar"><button type="button" class="fc-btn ghost" id="pfAuto">توزيع تلقائي</button><span class="fc-allocsum">المخصّص: ' + money(PF.currency, allocSum) + " · غير مخصّص: " + money(PF.currency, unalloc < 0 ? 0 : unalloc) + "</span></div>" +
      (allocSum > num(PF.amount) ? '<div class="fc-err">⚠ المخصّص أكبر من مبلغ الدفعة.</div>' : "") +
      '<div class="fc-allocbar"><button type="button" class="fc-btn" id="pfSave">حفظ الدفعة</button><span id="pfMsg" class="fc-msg"></span></div></div>';
    var pays = window.FinanceStore ? FinanceStore.listPayments() : [];
    var plist = pays.length ? pays.map(function (p) { var applied = (p.allocations || []).reduce(function (a, al) { return a + num(al.amount); }, 0); return '<tr class="' + (p.void ? "fc-void" : "") + '"><td>' + esc(dnum(p.date)) + "</td><td>" + esc(p.company) + '</td><td class="fc-r">' + money(p.currency, num(p.amount)) + "</td><td>" + esc(p.bank || "—") + "</td><td>" + esc(p.reference || "—") + '</td><td class="fc-r">' + money(p.currency, applied) + "</td><td>" + (p.attachment ? '<a href="' + esc(p.attachment.dataUrl) + '" download="' + esc(p.attachment.name) + '" class="fc-link">📎</a>' : "—") + "</td><td>" + (p.void ? '<span class="fc-st st-void" title="' + esc(p.void.reason + " · " + p.void.actor + " · " + dnum(p.void.at)) + '">ملغاة</span>' : '<button type="button" class="fc-btn ghost sm" data-void="' + esc(p.id) + '">إلغاء</button>') + "</td></tr>"; }).join("") : '<tr><td colspan="8" class="fc-empty">لا مدفوعات.</td></tr>';
    el("fcBody").innerHTML = form + '<div class="fc-h2">سجل المدفوعات · Payment Registry</div><div class="fc-card"><table class="fc-tbl"><thead><tr><th>التاريخ</th><th>الشركة</th><th>المبلغ</th><th>البنك</th><th>المرجع</th><th>المخصّص</th><th>إيصال</th><th></th></tr></thead><tbody>' + plist + "</tbody></table></div><p class=\"fc-foot\">المدفوعات تُلغى فقط (Void) بسبب وتوقيت ومنفّذ. العملات لا تُخلط.</p>";
    wirePayments(openInv);
  }
  function wirePayments(openInv) {
    function bindF(id, k) { var n = el(id); if (n) n.addEventListener("input", function () { PF[k] = this.value; }); }
    function bindS(id, k) { var n = el(id); if (n) n.addEventListener("change", function () { PF[k] = this.value; if (k === "company" || k === "currency") { PF.alloc = {}; render(); } }); }
    bindF("pfDate", "date"); bindS("pfCo", "company"); bindS("pfCur", "currency"); bindF("pfAmt", "amount"); bindS("pfBank", "bank"); bindF("pfRef", "reference"); bindF("pfNotes", "notes");
    Array.prototype.forEach.call(document.querySelectorAll(".fc-alloc"), function (inp) { inp.addEventListener("input", function () { PF.alloc[inp.getAttribute("data-bid")] = num(inp.value); var sum = 0; Array.prototype.forEach.call(document.querySelectorAll(".fc-alloc"), function (i) { sum += num(i.value); }); var node = document.querySelector(".fc-allocsum"); if (node) node.textContent = "المخصّص: " + money(PF.currency, sum) + " · غير مخصّص: " + money(PF.currency, Math.max(0, num(PF.amount) - sum)); }); });
    if (el("pfFile")) el("pfFile").addEventListener("change", function () { var f = this.files && this.files[0]; if (!f) return; if (f.size > 3 * 1024 * 1024) { if (el("pfMsg")) el("pfMsg").textContent = "الملف كبير (>3MB)."; this.value = ""; return; } var rd = new FileReader(); rd.onload = function () { PF.attachment = { name: f.name, type: f.type, dataUrl: rd.result }; render(); }; rd.readAsDataURL(f); });
    if (el("pfAuto")) el("pfAuto").addEventListener("click", function () { var left = num(PF.amount); PF.alloc = {}; openInv.forEach(function (r) { if (left <= 0) return; var a = Math.min(left, r.remaining); PF.alloc[r.booking_id] = a; left -= a; }); render(); });
    if (el("pfSave")) el("pfSave").addEventListener("click", savePayment);
    Array.prototype.forEach.call(document.querySelectorAll("[data-void]"), function (b) { b.addEventListener("click", function () { doVoid(b.getAttribute("data-void")); }); });
  }
  function savePayment() {
    var amt = num(PF.amount); if (!PF.company) { if (el("pfMsg")) el("pfMsg").textContent = "اختر الشركة."; return; } if (amt <= 0) { if (el("pfMsg")) el("pfMsg").textContent = "أدخل مبلغاً."; return; }
    var allocs = [], sum = 0, over = false;
    Array.prototype.forEach.call(document.querySelectorAll(".fc-alloc"), function (i) { var a = num(i.value), max = num(i.getAttribute("data-max")); if (a > 0) { if (a > max + 0.5) over = true; allocs.push({ booking_id: i.getAttribute("data-bid"), amount: a }); sum += a; } });
    if (over) { if (el("pfMsg")) el("pfMsg").textContent = "التخصيص يتجاوز رصيد فاتورة."; return; }
    if (sum > amt + 0.5) { if (el("pfMsg")) el("pfMsg").textContent = "التخصيص أكبر من الدفعة."; return; }
    FinanceStore.savePayment({ date: dnum(PF.date) || today(), company: PF.company, amount: amt, currency: PF.currency, bank: PF.bank, reference: PF.reference, notes: PF.notes, attachment: PF.attachment, allocations: allocs, actor: ACTOR });
    PF = { date: "", company: "", currency: "Rp", amount: "", bank: "", reference: "", notes: "", alloc: {}, attachment: null }; render();
  }
  function doVoid(id) { var reason = window.prompt("سبب إلغاء الدفعة (إلزامي):", ""); if (reason == null) return; if (!String(reason).trim()) { alert("السبب إلزامي."); return; } FinanceStore.voidPayment(id, reason, ACTOR); render(); }

  // ============ SUPPLIER LEDGER (Module 4 — tracking only) ============
  var SUP_F = "hotels";
  function transportTotal(bid) { var inv = (window.TransportationInvoiceStore && TransportationInvoiceStore.exists(bid)) ? TransportationInvoiceStore.load(bid) : null; if (!inv) return 0; var t = 0; Object.keys(inv.costs || {}).forEach(function (k) { t += num(inv.costs[k]); }); (inv.services || []).forEach(function (s) { t += num(s.qty) * num(s.cost); }); return t; }
  function supplierLines() {
    var lines = [], statuses = (window.FinanceStore ? FinanceStore.supStatuses() : {});
    if (SUP_F === "hotels") {
      (window.InvoiceStore ? InvoiceStore.list() : []).filter(function (r) { return r.type === "hotel" && r.invoice && r.invoice.prices && r.invoice.prices.hotels; }).forEach(function (r) {
        var b = byId(r.booking_id); if (!b) return; var hs = hotelsFor(b);
        hs.forEach(function (h, i) { var p = num(r.invoice.prices.hotels[i]); if (p <= 0) return; var amt = p * (h.nights || 1) * (h.rooms || 1); var key = b.booking_id + "|hotels|" + (h.name || i); lines.push({ key: key, supplier: h.name || "—", amount: amt, currency: curOf(b.destination), booking: b.booking_id, customer: b.guest_name, destination: b.destination, status: statuses[key] || "notpaid" }); });
      });
    } else if (SUP_F === "transport") {
      (window.TransportationInvoiceStore ? bookings() : []).forEach(function (b) { if (!(TransportationInvoiceStore.exists(b.booking_id))) return; var amt = transportTotal(b.booking_id); var key = b.booking_id + "|transport|driver"; lines.push({ key: key, supplier: "مواصلات · Transportation", amount: amt, currency: curOf(b.destination), booking: b.booking_id, customer: b.guest_name, destination: b.destination, status: statuses[key] || "notpaid" }); });
    }
    return lines;
  }
  var SUPST = { notpaid: "غير مدفوع · Not Paid", partial: "جزئي · Partial", paid: "مدفوع · Paid" };
  function renderSupplier() {
    function chip(v, l) { return '<button type="button" class="fc-chip' + (SUP_F === v ? " on" : "") + '" data-sf="' + v + '">' + l + "</button>"; }
    var bar = '<div class="fc-chips">' + chip("hotels", "الفنادق · Hotels") + chip("transport", "المواصلات · Transportation") + chip("tours", "الجولات · Tours") + chip("flights", "الطيران · Flights") + "</div>";
    var lines = (SUP_F === "tours" || SUP_F === "flights") ? [] : supplierLines();
    setXT("دفتر الموردين · Supplier Ledger (" + SUP_F + ")", ["المورّد", "المبلغ", "الحجز", "العميل", "الوجهة", "الحالة"], lines.map(function (l) { return [l.supplier, money(l.currency, l.amount), l.booking, l.customer, destAr(l.destination), (SUPST[l.status] || l.status).split(" · ")[0]]; }));
    var note = (SUP_F === "tours" || SUP_F === "flights") ? '<p class="fc-hint">لا توجد بيانات تكلفة لـ' + (SUP_F === "tours" ? "الجولات" : "الطيران") + " بعد في النظام — تتبّع فقط (التكلفة تُضاف في مرحلة لاحقة).</p>" : '<p class="fc-hint">تتبّع فقط — بدون تسوية مدفوعات. الحالة يدوية (DS5-C: مدفوعات الموردين). المصدر: ' + (SUP_F === "hotels" ? "فواتير الفنادق" : "فواتير المواصلات") + ".</p>";
    function statusSel(l) { return '<select class="fc-supst" data-key="' + esc(l.key) + '">' + Object.keys(SUPST).map(function (k) { return '<option value="' + k + '"' + (l.status === k ? " selected" : "") + ">" + SUPST[k].split(" · ")[0] + "</option>"; }).join("") + "</select>"; }
    var body = lines.length ? lines.map(function (l) { return '<tr><td class="fc-k">' + esc(l.supplier) + '</td><td class="fc-r">' + money(l.currency, l.amount) + "</td><td>" + esc(l.booking) + "</td><td>" + esc(l.customer) + "</td><td>" + destAr(l.destination) + "</td><td>" + statusSel(l) + "</td></tr>"; }).join("") : '<tr><td colspan="6" class="fc-empty">' + ((SUP_F === "tours" || SUP_F === "flights") ? "—" : "لا بيانات موردين لهذا النوع.") + "</td></tr>";
    el("fcBody").innerHTML = bar + note + exportBar() + '<div class="fc-card"><table class="fc-tbl"><thead><tr><th>المورّد</th><th>المبلغ</th><th>الحجز</th><th>العميل</th><th>الوجهة</th><th>الحالة</th></tr></thead><tbody>' + body + "</tbody></table></div>";
    Array.prototype.forEach.call(document.querySelectorAll("[data-sf]"), function (b) { b.addEventListener("click", function () { SUP_F = b.getAttribute("data-sf"); render(); }); });
    Array.prototype.forEach.call(document.querySelectorAll(".fc-supst"), function (s) { s.addEventListener("change", function () { FinanceStore.setSupStatus(s.getAttribute("data-key"), this.value); }); });
    wireExport();
  }

  // ============ BANKING + BANK REGISTER (Module 5) ============
  var BANK_OPEN = null;
  function seedBanks() { if (!window.FinanceStore || FinanceStore.listBanks().length) return; [["Al Rajhi", "USD"], ["Alinma", "USD"], ["Mandiri", "Rp"], ["BCA", "Rp"]].forEach(function (b) { FinanceStore.saveBank({ name: b[0], currency: b[1], balance: 0, totalIn: 0, totalOut: 0 }); }); }
  function bankComputed(b) { var mv = FinanceStore.listMovements(b.id); var inn = 0, out = 0; mv.forEach(function (m) { if (m.type === "in") inn += num(m.amount); else out += num(m.amount); }); return { inn: inn, out: out, bal: num(b.balance) + inn - out, mv: mv }; }
  function renderBanking() {
    if (BANK_OPEN) return renderBankRegister(BANK_OPEN);
    var banks = window.FinanceStore ? FinanceStore.listBanks() : [];
    var body = banks.length ? banks.map(function (b) { var c = bankComputed(b); return '<tr><td class="fc-k fc-bankrow" data-bank="' + b.id + '">' + esc(b.name) + "</td><td>" + esc(b.currency) + '</td><td class="fc-r">' + money(b.currency, c.bal) + '</td><td class="fc-r">' + money(b.currency, c.inn) + '</td><td class="fc-r">' + money(b.currency, c.out) + "</td><td>" + esc(dnum(b.updated_at)) + '</td><td><button type="button" class="fc-btn ghost sm" data-bopen="' + b.id + '">الحركات</button> <button type="button" class="fc-btn ghost sm" data-bdel="' + b.id + '">حذف</button></td></tr>'; }).join("") : '<tr><td colspan="7" class="fc-empty">لا بنوك.</td></tr>';
    setXT("لوحة البنوك · Banking", ["البنك", "العملة", "الرصيد الحالي", "الوارد", "الصادر", "آخر تحديث"], banks.map(function (b) { var c = bankComputed(b); return [b.name, b.currency, money(b.currency, c.bal), money(b.currency, c.inn), money(b.currency, c.out), dnum(b.updated_at)]; }));
    el("fcBody").innerHTML = '<div class="fc-card fc-form"><div class="fc-h">إضافة بنك · Add Bank</div><div class="fc-grid"><label class="fc-f"><span>الاسم</span><input type="text" id="bkName"></label><label class="fc-f"><span>العملة</span><select id="bkCur">' + CUR_LIST.map(function (c) { return '<option value="' + c + '">' + c + "</option>"; }).join("") + '</select></label><label class="fc-f"><span>الرصيد الافتتاحي</span><input type="number" step="1" id="bkBal" value="0"></label><button type="button" class="fc-btn" id="bkAdd">إضافة</button></div></div>' +
      '<div class="fc-h2">لوحة البنوك · Banking Dashboard</div>' + exportBar() + '<div class="fc-card"><table class="fc-tbl"><thead><tr><th>البنك</th><th>العملة</th><th>الرصيد الحالي</th><th>الوارد</th><th>الصادر</th><th>آخر تحديث</th><th></th></tr></thead><tbody>' + body + "</tbody></table></div><p class=\"fc-foot\">الرصيد الحالي = الافتتاحي + الوارد − الصادر (من سجل الحركات). بدون تسوية بنكية.</p>";
    if (el("bkAdd")) el("bkAdd").addEventListener("click", function () { var n = el("bkName").value.trim(); if (!n) return; FinanceStore.saveBank({ name: n, currency: el("bkCur").value, balance: num(el("bkBal").value), totalIn: 0, totalOut: 0 }); render(); });
    Array.prototype.forEach.call(document.querySelectorAll("[data-bopen]"), function (b) { b.addEventListener("click", function () { BANK_OPEN = b.getAttribute("data-bopen"); render(); }); });
    Array.prototype.forEach.call(document.querySelectorAll(".fc-bankrow"), function (b) { b.addEventListener("click", function () { BANK_OPEN = b.getAttribute("data-bank"); render(); }); });
    Array.prototype.forEach.call(document.querySelectorAll("[data-bdel]"), function (b) { b.addEventListener("click", function (e) { e.stopPropagation(); if (confirm("حذف البنك؟")) { FinanceStore.removeBank(b.getAttribute("data-bdel")); render(); } }); });
    wireExport();
  }
  var BMV = { date: "", desc: "", amount: "", type: "in" };
  function renderBankRegister(bankId) {
    var b = FinanceStore.listBanks().filter(function (x) { return x.id === bankId; })[0]; if (!b) { BANK_OPEN = null; return render(); }
    var c = bankComputed(b), run = num(b.balance);
    var rows = c.mv.map(function (m) { run += (m.type === "in" ? 1 : -1) * num(m.amount); return { m: m, run: run }; });
    setXT("سجل حركات · " + b.name, ["التاريخ", "البيان", "النوع", "المبلغ", "الرصيد الجاري"], rows.map(function (x) { return [dnum(x.m.date), x.m.desc, x.m.type === "in" ? "وارد" : "صادر", money(b.currency, num(x.m.amount)), money(b.currency, x.run)]; }));
    var body = rows.length ? rows.map(function (x) { return "<tr><td>" + esc(dnum(x.m.date)) + "</td><td>" + esc(x.m.desc) + '</td><td>' + (x.m.type === "in" ? '<span class="fc-st st-paid">وارد</span>' : '<span class="fc-st st-unpaid">صادر</span>') + '</td><td class="fc-r">' + money(b.currency, num(x.m.amount)) + '</td><td class="fc-r">' + money(b.currency, x.run) + '</td><td><button type="button" class="fc-btn ghost sm" data-mdel="' + x.m.id + '">حذف</button></td></tr>'; }).join("") : '<tr><td colspan="6" class="fc-empty">لا حركات.</td></tr>';
    var form = '<div class="fc-card fc-form"><div class="fc-h">حركة جديدة · ' + esc(b.name) + " (" + esc(b.currency) + ')</div><div class="fc-grid"><label class="fc-f"><span>التاريخ</span><input type="date" id="mvDate" value="' + esc(BMV.date || today()) + '"></label><label class="fc-f fc-wide"><span>البيان</span><input type="text" id="mvDesc" value="' + esc(BMV.desc) + '"></label><label class="fc-f"><span>النوع</span><select id="mvType"><option value="in"' + (BMV.type === "in" ? " selected" : "") + '>وارد · Incoming</option><option value="out"' + (BMV.type === "out" ? " selected" : "") + '>صادر · Outgoing</option></select></label><label class="fc-f"><span>المبلغ</span><input type="number" step="1" id="mvAmt" value="' + esc(BMV.amount) + '"></label><button type="button" class="fc-btn" id="mvAdd">إضافة حركة</button></div></div>';
    el("fcBody").innerHTML = '<button type="button" class="fc-back" id="bkBack">← كل البنوك</button>' + form + '<div class="fc-h2">سجل الحركات · Bank Register — ' + esc(b.name) + "</div>" + exportBar() + '<div class="fc-card"><table class="fc-tbl"><thead><tr><th>التاريخ</th><th>البيان</th><th>النوع</th><th>المبلغ</th><th>الرصيد الجاري</th><th></th></tr></thead><tbody>' + body + "</tbody></table></div><p class=\"fc-foot\">الرصيد الجاري = الافتتاحي + الوارد − الصادر. عملة البنك: " + esc(b.currency) + ".</p>";
    if (el("bkBack")) el("bkBack").addEventListener("click", function () { BANK_OPEN = null; render(); });
    if (el("mvDate")) el("mvDate").addEventListener("input", function () { BMV.date = this.value; });
    if (el("mvDesc")) el("mvDesc").addEventListener("input", function () { BMV.desc = this.value; });
    if (el("mvType")) el("mvType").addEventListener("change", function () { BMV.type = this.value; });
    if (el("mvAmt")) el("mvAmt").addEventListener("input", function () { BMV.amount = this.value; });
    if (el("mvAdd")) el("mvAdd").addEventListener("click", function () { if (num(BMV.amount) <= 0) return; FinanceStore.saveMovement({ bank_id: bankId, date: dnum(BMV.date) || today(), desc: BMV.desc, amount: num(BMV.amount), currency: b.currency, type: BMV.type }); BMV = { date: "", desc: "", amount: "", type: "in" }; render(); });
    Array.prototype.forEach.call(document.querySelectorAll("[data-mdel]"), function (btn) { btn.addEventListener("click", function () { FinanceStore.removeMovement(btn.getAttribute("data-mdel")); render(); }); });
    wireExport();
  }

  // ============ FOLLOW-UP QUEUE (Module 6) ============
  function renderFollowup() {
    var rec = withBalances().filter(function (r) { return r.remaining > 0; }).filter(function (r) { var d = daysUntil(r.arrival); return d >= 0 && d <= 30; }).sort(function (a, b) { return daysUntil(a.arrival) - daysUntil(b.arrival); });
    setXT("قائمة المتابعة · Follow-Up Queue", ["الشركة", "العميل", "الوصول", "المبلغ", "أيام متبقية", "الحالة"], rec.map(function (r) { return [r.company, r.customer, r.arrival, money(r.currency, r.remaining), String(daysUntil(r.arrival)), (STLBL[r.status] || r.status).split(" · ")[0]]; }));
    var body = rec.length ? rec.map(function (r) { var d = daysUntil(r.arrival); return '<tr class="' + (d <= 7 ? "fc-soon" : "") + '"><td class="fc-k">' + esc(r.company) + "</td><td>" + esc(r.customer) + "</td><td>" + esc(r.arrival) + '</td><td class="fc-r">' + money(r.currency, r.remaining) + "</td><td>" + d + " يوم</td><td>" + stPill(r.status) + "</td></tr>"; }).join("") : '<tr><td colspan="6" class="fc-empty">لا متابعات — لا وصول خلال ٣٠ يوماً مع رصيد مستحق.</td></tr>';
    el("fcBody").innerHTML = '<p class="fc-hint">شاشة المحاسب اليومية — شركات عليها رصيد مستحق ووصول خلال ٣٠ يوماً، الأقرب أولاً. المظلّل = خلال ٧ أيام.</p>' + exportBar() + '<div class="fc-card"><table class="fc-tbl"><thead><tr><th>الشركة</th><th>العميل</th><th>الوصول</th><th>المبلغ</th><th>أيام متبقية</th><th>الحالة</th></tr></thead><tbody>' + body + "</tbody></table></div>";
    wireExport();
  }

  // ============ FINANCE EXECUTIVE DASHBOARD (Module 7) ============
  function renderExec() {
    var rec = withBalances(), open = rec.filter(function (r) { return r.remaining > 0; });
    var outstanding = {}; open.forEach(function (r) { addCur(outstanding, r.currency, r.remaining); });
    var debt = {}; open.forEach(function (r) { debt[r.company] = 1; });
    var notPaidArr = open.filter(function (r) { return daysUntil(r.arrival) >= 0; });
    var aging = {}; BUCKETS.forEach(function (b) { aging[b[0]] = {}; }); open.forEach(function (r) { addCur(aging[bucketOf(r.arrival)], r.currency, r.remaining); });
    var banks = window.FinanceStore ? FinanceStore.listBanks() : [];
    var topG = {}; open.forEach(function (r) { topG[r.company] = (topG[r.company] || 0) + r.remaining; });
    var top = Object.keys(topG).map(function (k) { return { co: k, v: topG[k] }; }).sort(function (a, b) { return b.v - a.v; }).slice(0, 5);
    function card(n, l, c) { return '<div class="fc-kpi ' + (c || "") + '"><div class="fc-kpi-n">' + n + '</div><div class="fc-kpi-l">' + l + "</div></div>"; }
    var cards = '<div class="fc-kpis">' + card(fmtMap(outstanding), "إجمالي الذمم · Outstanding Receivables", "k-out") + card(Object.keys(debt).length, "شركات عليها مديونية · Companies With Debt", "k-n") + card(notPaidArr.length, "وصول قادم غير مدفوع · Upcoming Arrivals Not Paid", "k-warn") + "</div>";
    var agingTbl = '<div class="fc-h2">ملخّص الأعمار · Aging Summary</div><div class="fc-card"><table class="fc-tbl"><thead><tr>' + BUCKETS.map(function (b) { return "<th>" + b[1] + "</th>"; }).join("") + "</tr></thead><tbody><tr>" + BUCKETS.map(function (b) { return '<td class="fc-r">' + fmtMap(aging[b[0]]) + "</td>"; }).join("") + "</tr></tbody></table></div>";
    var bankTbl = '<div class="fc-h2">أرصدة البنوك · Bank Balances</div><div class="fc-card"><table class="fc-tbl"><thead><tr><th>البنك</th><th>العملة</th><th>الرصيد</th></tr></thead><tbody>' + (banks.length ? banks.map(function (b) { var c = bankComputed(b); return "<tr><td class='fc-k'>" + esc(b.name) + "</td><td>" + esc(b.currency) + '</td><td class="fc-r">' + money(b.currency, c.bal) + "</td></tr>"; }).join("") : '<tr><td colspan="3" class="fc-empty">لا بنوك.</td></tr>') + "</tbody></table></div>";
    var topTbl = '<div class="fc-h2">أعلى الشركات مديونية · Top Debtor Companies</div><div class="fc-card"><table class="fc-tbl"><thead><tr><th>#</th><th>الشركة</th><th>المستحق</th></tr></thead><tbody>' + (top.length ? top.map(function (t, i) { return "<tr><td>" + (i + 1) + "</td><td class='fc-k'>" + esc(t.co) + '</td><td class="fc-r">' + thou(t.v) + "</td></tr>"; }).join("") : '<tr><td colspan="3" class="fc-empty">—</td></tr>') + "</tbody></table></div>";
    el("fcBody").innerHTML = '<p class="fc-hint">لوحة إدارية للقراءة فقط. العملات منفصلة. (قيم «أعلى المدينين» مجمّعة رقمياً للترتيب فقط)</p>' + cards + agingTbl + bankTbl + topTbl;
  }

  // ---- tabs / render ----
  var TAB = "followup", LEDGER_CO = null;
  var TABS = [["followup", "متابعة"], ["dashboard", "لوحة المحاسب"], ["statement", "كشف حساب"], ["open", "الفواتير المفتوحة"], ["unpaid", "شركات مدينة"], ["ar", "لوحة الذمم"], ["payments", "المدفوعات"], ["supplier", "الموردون"], ["banking", "البنوك"], ["exec", "تنفيذية"]];
  function renderTabs() {
    el("fcTabs").innerHTML = TABS.map(function (t) { return '<button type="button" class="fc-tab' + (TAB === t[0] ? " on" : "") + '" data-tab="' + t[0] + '">' + t[1] + "</button>"; }).join("");
    Array.prototype.forEach.call(document.querySelectorAll("[data-tab]"), function (b) { b.addEventListener("click", function () { TAB = b.getAttribute("data-tab"); if (TAB !== "statement") STMT.co = null; if (TAB !== "banking") BANK_OPEN = null; render(); }); });
  }
  function render() {
    renderTabs();
    if (TAB === "followup") renderFollowup();
    else if (TAB === "dashboard") renderDashboard();
    else if (TAB === "statement") renderStatement();
    else if (TAB === "open") renderOpen();
    else if (TAB === "unpaid") renderUnpaid();
    else if (TAB === "ar") renderAR();
    else if (TAB === "payments") renderPayments();
    else if (TAB === "supplier") renderSupplier();
    else if (TAB === "banking") renderBanking();
    else renderExec();
  }
  function post(t) { try { (window.parent && window.parent !== window ? window.parent : window).postMessage({ type: t }, "*"); } catch (e) {} }
  window.addEventListener("message", function (e) { var d = (e && e.data) || {}; if ((d.type === "role" || d.type === "load-booking") && d.role) ACTOR = d.role; });
  document.addEventListener("DOMContentLoaded", function () {
    post("request-role"); seedBanks();
    el("fcRoot").innerHTML = '<div class="fc-head"><div><h1>مركز المالية · Finance Center</h1><p class="fc-sub">طبقة محاسبية تشغيلية — المصدر فواتير المبيعات. المدفوعات تؤثر على أرصدة المالية فقط</p></div></div><div class="fc-tabs" id="fcTabs"></div><div id="fcBody"></div>';
    preloadPrograms(function () { render(); });
  });
})();
