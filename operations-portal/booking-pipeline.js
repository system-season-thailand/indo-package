/* =====================================================================
   booking-pipeline.js
   Standalone PROTOTYPE — Booking Pipeline (operational lifecycle).
   Reads window.BP_DATA (sample only). No backend, no writes.
   booking_id is the main key after a quotation is confirmed.
   ===================================================================== */
(function () {
  "use strict";

  /* SAMPLE DATA SOURCE → reads window.BP_DATA.
     FUTURE SUPABASE DATA SOURCE: swap the data file, keep the shape.
     DO NOT WRITE IN LAB MODE — stage transitions are simulated only. */
  var D = window.BP_DATA || {};
  var P = (D.pipeline || []).slice();
  var NOW = D.meta && D.meta.now || "2026-06-18";

  var STAGE = {}; (D.stages || []).forEach(function (s) { STAGE[s.id] = s; });
  function stageN(id) { return (STAGE[id] || { n: 0 }).n; }
  function stageLabel(id) { return (STAGE[id] || { label: id }).label; }
  function stageCls(id) {
    var n = stageN(id);
    if (n >= 9) return "sg-done";
    if (n >= 7) return "sg-late";
    if (n >= 5) return "sg-mid";
    return "sg-early";
  }

  var state = { q: "", stage: "all", team: "all", queue: "all", openId: null };

  /* ---------- helpers ----------------------------------------------- */
  function el(id) { return document.getElementById(id); }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]; }); }
  function fmtInt(n) { return Math.round(n).toLocaleString("en-US"); }
  var AR = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
  function arNum(n) { return String(n).split("").map(function (d) { return /\d/.test(d) ? AR[+d] : d; }).join(""); }
  function destName(id) { var d = (D.destinations || []).filter(function (x) { return x.id === id; })[0]; return d ? d.name : id; }

  function isOverdue(r) { return r.current_stage !== "completed" && r.due_date && r.due_date < NOW; }
  function inQueue(r, q) {
    if (q === "overdue") return isOverdue(r);
    if (q === "supplier") return r.supplier_status === "pending";
    if (q === "invoice") return r.current_stage !== "completed" && r.invoice_status !== "ready";
    if (q === "program") return r.current_stage !== "completed" && r.final_program_status !== "ready";
    if (q === "guide") return r.current_stage !== "completed" && r.destination_guide_status !== "ready";
    return true;
  }

  /* ---------- conceptual flow (top) --------------------------------- */
  function renderConcept() {
    var chips = (D.stages || []).map(function (s, i) {
      return '<span class="cf-stage ' + stageCls(s.id) + '">' + esc(s.label) + "</span>" +
        (i < D.stages.length - 1 ? '<span class="cf-arrow">‹</span>' : "");
    }).join("");
    var docs = (D.documents || []).map(function (x) { return '<span class="cf-doc">' + esc(x) + "</span>"; }).join("");
    el("conceptFlow").innerHTML =
      '<div class="cf-row cf-life">' + chips + "</div>" +
      '<div class="cf-bridge"><span class="cf-key">booking_id</span> هو المفتاح الرئيسي بعد تأكيد العرض — ومنه تتفرّع المستندات:</div>' +
      '<div class="cf-row cf-docs">' + docs + "</div>";
  }

  /* ---------- funnel + KPIs ----------------------------------------- */
  function renderFunnel() {
    var active = P.filter(function (r) { return r.current_stage !== "completed"; });
    var overdue = P.filter(isOverdue).length;
    var supplier = P.filter(function (r) { return r.supplier_status === "pending"; }).length;
    var completed = P.filter(function (r) { return r.current_stage === "completed"; }).length;
    el("kpiGrid").innerHTML = [
      ["السجلات النشطة", arNum(active.length), ""],
      ["متأخرة عن الموعد", arNum(overdue), overdue ? "bad" : ""],
      ["بانتظار المورّد", arNum(supplier), supplier ? "warn" : ""],
      ["مكتملة", arNum(completed), "done"]
    ].map(function (c) { return '<div class="kpi ' + (c[2] ? "kpi-" + c[2] : "") + '"><span class="kpi-v">' + c[1] + '</span><span class="kpi-k">' + c[0] + "</span></div>"; }).join("");

    // funnel by active stage (3..9)
    var counts = {};
    P.forEach(function (r) { counts[r.current_stage] = (counts[r.current_stage] || 0) + 1; });
    var order = ["booking_created", "supplier_pending", "fully_confirmed", "final_program_ready", "invoice_ready", "guide_ready", "completed"];
    var max = Math.max.apply(null, order.map(function (s) { return counts[s] || 0; }).concat([1]));
    el("funnel").innerHTML = order.map(function (s) {
      var v = counts[s] || 0, w = (v / max) * 100;
      var bar = '<span class="fn-track"><i class="' + stageCls(s) + '" style="width:' + w.toFixed(1) + '%;"></i></span>';
      return '<div class="fn-row"><div class="fn-top"><span class="fn-name"><b class="fn-n">' + arNum(stageN(s)) + "</b>" + esc(stageLabel(s)) + '</span><span class="fn-v">' + arNum(v) + "</span></div>" + bar + "</div>";
    }).join("");
  }

  /* ---------- operational queues (clickable filters) ---------------- */
  function renderQueues() {
    var q = {
      overdue: P.filter(function (r) { return inQueue(r, "overdue"); }).length,
      supplier: P.filter(function (r) { return inQueue(r, "supplier"); }).length,
      invoice: P.filter(function (r) { return inQueue(r, "invoice"); }).length,
      program: P.filter(function (r) { return inQueue(r, "program"); }).length,
      guide: P.filter(function (r) { return inQueue(r, "guide"); }).length
    };
    var defs = [
      ["overdue", "عناصر متأخرة", q.overdue, "bad"],
      ["supplier", "محجوبة على المورّد", q.supplier, "warn"],
      ["program", "بلا برنامج نهائي", q.program, "brass"],
      ["invoice", "بلا فاتورة", q.invoice, "brass"],
      ["guide", "بلا دليل وجهة", q.guide, "brass"]
    ];
    el("queues").innerHTML = defs.map(function (d) {
      var on = state.queue === d[0] ? " on" : "";
      return '<button type="button" class="queue q-' + d[3] + on + '" data-queue="' + d[0] + '"><span class="q-v">' + arNum(d[2]) + '</span><span class="q-k">' + d[1] + "</span></button>";
    }).join("");
  }

  /* ---------- pipeline table ---------------------------------------- */
  function applyFilters() {
    var term = state.q.trim();
    return P.filter(function (r) {
      if (state.stage !== "all" && r.current_stage !== state.stage) return false;
      if (state.team !== "all" && r.responsible_team !== state.team) return false;
      if (state.queue !== "all" && !inQueue(r, state.queue)) return false;
      if (term && (r.booking_id + " " + r.quotation_id + " " + r.company_name + " " + r.hotel_name).indexOf(term) === -1) return false;
      return true;
    });
  }
  function renderTable() {
    var rows = applyFilters();
    var body = rows.map(function (r) {
      var od = isOverdue(r);
      var due = r.due_date ? (od ? '<span class="due-bad">' + esc(r.due_date) + " ⚠</span>" : esc(r.due_date)) : "—";
      return '<tr class="clickable" data-bid="' + esc(r.booking_id) + '">' +
        "<td>" + esc(r.booking_id) + "</td>" +
        '<td class="name">' + esc(r.company_name) + "</td>" +
        "<td>" + esc(destName(r.destination)) + "</td>" +
        '<td><span class="sg-chip ' + stageCls(r.current_stage) + '">' + arNum(stageN(r.current_stage)) + "· " + esc(stageLabel(r.current_stage)) + "</span></td>" +
        "<td>" + esc(r.next_action) + "</td>" +
        '<td><span class="team-tag">' + esc(r.responsible_team) + "</span></td>" +
        "<td>" + due + "</td></tr>";
    }).join("");
    el("pipelineTable").innerHTML = rows.length
      ? '<div class="table-scroll"><table class="tbl"><thead><tr><th>رقم الحجز</th><th>الشركة</th><th>الوجهة</th><th>المرحلة الحالية</th><th>الإجراء التالي</th><th>الفريق المسؤول</th><th>تاريخ الاستحقاق</th></tr></thead><tbody>' + body + "</tbody></table></div>"
      : '<p class="empty">لا توجد سجلات مطابقة.</p>';
    el("tableCount").textContent = arNum(rows.length) + " سجل";
  }

  /* ---------- detail modal ------------------------------------------ */
  function recById(id) { return P.filter(function (r) { return r.booking_id === id; })[0]; }
  function tick(ok, mid) { return ok ? '<span class="lc-ok">✓</span>' : mid ? '<span class="lc-mid">◐</span>' : '<span class="lc-no">○</span>'; }
  function openRec(id) {
    var r = recById(id); if (!r) return;
    state.openId = id;
    var facts = [
      ["العرض المصدر", esc(r.quotation_id)], ["رقم الحجز", '<b class="bp-key">' + esc(r.booking_id) + "</b>"],
      ["الشركة", esc(r.company_name)], ["موظف المبيعات", esc(r.sales_employee)],
      ["موظف الحجوزات", esc(r.booking_officer)], ["الوجهة", esc(destName(r.destination))],
      ["الفندق", esc(r.hotel_name)], ["الدخول ← الخروج", esc(r.check_in) + " ← " + esc(r.check_out)],
      ["المرحلة الحالية", '<span class="sg-chip ' + stageCls(r.current_stage) + '">' + arNum(stageN(r.current_stage)) + "· " + esc(stageLabel(r.current_stage)) + "</span>"],
      ["الإجراء التالي", esc(r.next_action)], ["الفريق المسؤول", esc(r.responsible_team)],
      ["تاريخ الاستحقاق", r.due_date ? (isOverdue(r) ? '<span class="due-bad">' + esc(r.due_date) + " (متأخر)</span>" : esc(r.due_date)) : "—"]
    ].map(function (f) { return '<div class="bp-fact"><span class="bp-k">' + f[0] + '</span><span class="bp-v">' + f[1] + "</span></div>"; }).join("");

    var lifecycle = [
      ["تأكيد المورّد", r.supplier_status === "confirmed", false],
      ["الدفع", r.payment_status === "paid", r.payment_status === "partial"],
      ["البرنامج النهائي", r.final_program_status === "ready", false],
      ["فاتورة الشركة", r.invoice_status === "ready", false],
      ["دليل الوجهة", r.destination_guide_status === "ready", false]
    ].map(function (s) { return '<div class="lc-row">' + tick(s[1], s[2]) + "<span>" + s[0] + "</span></div>"; }).join("");

    var docs = ["توليد البرنامج النهائي", "توليد فاتورة الشركة", "توليد فاتورة النقل", "توليد دليل الوجهة"]
      .map(function (d) { return '<button type="button" class="gen-btn" disabled title="قريباً — تُولّد لاحقاً من booking_id">' + d + "</button>"; }).join("");

    el("recModal").innerHTML =
      '<div class="bp-backdrop" data-close="1"></div>' +
      '<div class="bp-panel" role="dialog" aria-modal="true">' +
        '<div class="bp-head"><h3 class="bp-title">سجل المسار التشغيلي</h3><button type="button" class="bp-close" data-close="1" aria-label="إغلاق">✕</button></div>' +
        '<div class="bp-facts">' + facts + "</div>" +
        '<div class="bp-life"><h4 class="bp-sub">حالة دورة الحياة</h4><div class="lc-grid">' + lifecycle + "</div></div>" +
        '<div class="bp-docs"><h4 class="bp-sub">المستندات (تُولّد لاحقاً من booking_id)</h4><div class="gen-grid">' + docs + "</div>" +
          '<p class="bp-hint">الأزرار معطّلة في هذه المرحلة — ستُفعّل لاحقاً لتوليد المستندات من سجل الحجز.</p></div>' +
      "</div>";
    el("recModal").hidden = false;
    document.body.classList.add("modal-open");
  }
  function closeRec() { var m = el("recModal"); if (m) { m.hidden = true; m.innerHTML = ""; } document.body.classList.remove("modal-open"); state.openId = null; }

  /* ---------- wiring ------------------------------------------------- */
  function populate() {
    el("fStage").innerHTML = '<option value="all">كل المراحل</option>' +
      ["booking_created", "supplier_pending", "fully_confirmed", "final_program_ready", "invoice_ready", "guide_ready", "completed"]
        .map(function (s) { return '<option value="' + s + '">' + arNum(stageN(s)) + "· " + stageLabel(s) + "</option>"; }).join("");
    el("fTeam").innerHTML = '<option value="all">كل الفرق</option>' + (D.teams || []).map(function (t) { return '<option value="' + esc(t) + '">' + esc(t) + "</option>"; }).join("");
  }
  function renderAll() { renderFunnel(); renderQueues(); renderTable(); }

  function wire() {
    el("now").textContent = NOW;
    var si;
    el("fSearch").addEventListener("input", function (e) { clearTimeout(si); si = setTimeout(function () { state.q = e.target.value; renderTable(); }, 120); });
    el("fStage").addEventListener("change", function (e) { state.stage = e.target.value; renderTable(); });
    el("fTeam").addEventListener("change", function (e) { state.team = e.target.value; renderTable(); });
    el("queues").addEventListener("click", function (e) {
      var b = e.target.closest("[data-queue]"); if (!b) return;
      var qv = b.getAttribute("data-queue");
      state.queue = state.queue === qv ? "all" : qv;   // toggle
      renderQueues(); renderTable();
    });
    el("fReset").addEventListener("click", function () {
      state.q = ""; state.stage = "all"; state.team = "all"; state.queue = "all";
      el("fSearch").value = ""; el("fStage").value = "all"; el("fTeam").value = "all";
      renderQueues(); renderTable();
    });
    document.addEventListener("click", function (e) {
      if (e.target.closest("[data-close]")) { closeRec(); return; }
      if (e.target.closest(".gen-btn")) return;   // disabled docs — no-op
      var row = e.target.closest("[data-bid]"); if (row) openRec(row.getAttribute("data-bid"));
    });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeRec(); });
  }

  document.addEventListener("DOMContentLoaded", function () {
    try { renderConcept(); populate(); wire(); renderAll(); }
    catch (err) { console.error(err); document.body.insertAdjacentHTML("beforeend", '<pre style="color:#d9645a;padding:16px">خطأ: ' + esc(err.message) + "</pre>"); }
  });
})();
