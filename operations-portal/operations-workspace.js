/* =====================================================================
   operations-workspace.js
   The unified Operations Workspace — operational cockpit for the booking
   team (read-only for management; sales sees only their own records).
   Reads window.OW_DATA (single sample source). No backend, no writes.
   Role via URL: ?role=management|booking|sales (&emp=E1 for sales).
   ===================================================================== */
(function () {
  "use strict";

  /* SAMPLE DATA SOURCE → window.OW_DATA (single source of truth).
     FUTURE SUPABASE DATA SOURCE: swap data file, keep shape.
     DO NOT WRITE IN LAB MODE — read & visualise only. */
  var D = window.OW_DATA || {};
  var ALL = (D.records || []).slice();
  var NOW = (D.meta && D.meta.now) || "2026-06-18";
  var CUR = (D.meta && D.meta.currency) || "ر.س";

  var params = new URLSearchParams(location.search);
  var ROLE = params.get("role") || "management";
  var EMP = params.get("emp") || (D.salesEmployees && D.salesEmployees[0] && D.salesEmployees[0].id) || "E1";

  var STAGE = {}; (D.stages || []).forEach(function (s) { STAGE[s.id] = s; });
  function sN(id) { return (STAGE[id] || { n: 0 }).n; }
  function sLabel(id) { return (STAGE[id] || { label: id }).label; }
  function sCls(id) { var n = sN(id); return n >= 9 ? "sg-done" : n >= 7 ? "sg-late" : n >= 5 ? "sg-mid" : "sg-early"; }

  var state = { q: "", stage: "all", priority: "all" };

  /* ---------- helpers ----------------------------------------------- */
  function el(id) { return document.getElementById(id); }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]; }); }
  function fmtInt(x) { return Math.round(x).toLocaleString("en-US"); }
  function trim(x) { var v = x >= 10 ? x.toFixed(0) : x.toFixed(1); return v.replace(/\.0$/, ""); }
  function money(x) { var a = Math.abs(x); if (a >= 1e6) return trim(x / 1e6) + " مليون " + CUR; if (a >= 1e3) return trim(x / 1e3) + " ألف " + CUR; return fmtInt(x) + " " + CUR; }
  var AR = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
  function arNum(x) { return String(x).split("").map(function (d) { return /\d/.test(d) ? AR[+d] : d; }).join(""); }
  function destName(id) { var d = (D.destinations || []).filter(function (x) { return x.id === id; })[0]; return d ? d.name : id; }
  function daysUntil(dstr) { return Math.round((new Date(dstr + "T00:00:00") - new Date(NOW + "T00:00:00")) / 86400000); }

  function scoped() { return ROLE === "sales" ? ALL.filter(function (r) { return r.sales_employee_id === EMP; }) : ALL; }

  /* ---------- attention flags / urgency ----------------------------- */
  function isOverdue(r) { return r.current_stage !== "completed" && r.due_date && r.due_date < NOW; }
  function isCheckinSoon(r) { if (r.current_stage === "completed") return false; var d = daysUntil(r.check_in); return d >= 0 && d <= 7; }
  function flags(r) {
    var f = [];
    if (isOverdue(r)) f.push({ k: "overdue", t: "متأخر", w: 5, cls: "fl-bad" });
    if (isCheckinSoon(r)) f.push({ k: "checkin", t: "دخول خلال " + arNum(daysUntil(r.check_in)) + " يوم", w: 5, cls: "fl-bad" });
    if (r.supplier_status === "pending") f.push({ k: "supplier", t: "بانتظار المورّد", w: 3, cls: "fl-warn" });
    if (r.current_stage !== "completed" && r.final_program_status !== "ready") f.push({ k: "program", t: "بلا برنامج", w: 2, cls: "fl-soft" });
    if (r.current_stage !== "completed" && r.invoice_status !== "ready") f.push({ k: "invoice", t: "بلا فاتورة", w: 2, cls: "fl-soft" });
    if (r.current_stage !== "completed" && r.destination_guide_status !== "ready") f.push({ k: "guide", t: "بلا دليل", w: 1, cls: "fl-soft" });
    return f;
  }
  function urgency(r) { return flags(r).reduce(function (a, x) { return a + x.w; }, 0); }

  // ---- priority layer (operational decision layer; no new data) ------
  function missProgram(r) { return r.current_stage !== "completed" && r.final_program_status !== "ready"; }
  function missInvoice(r) { return r.current_stage !== "completed" && r.invoice_status !== "ready"; }
  function missGuide(r) { return r.current_stage !== "completed" && r.destination_guide_status !== "ready"; }
  function supplierPending(r) { return r.supplier_status === "pending"; }
  function needsFollowup(r) { return r.current_stage !== "completed" && urgency(r) > 0; }
  // Section 3 — ordering: overdue → checkin → supplier → program → invoice → guide → rest
  function priorityRank(r) {
    if (isOverdue(r)) return 1;
    if (isCheckinSoon(r)) return 2;
    if (supplierPending(r)) return 3;
    if (missProgram(r)) return 4;
    if (missInvoice(r)) return 5;
    if (missGuide(r)) return 6;
    return 7;
  }
  // Section 4 — visual urgency level
  function levelOf(r) {
    var d = daysUntil(r.check_in);
    if (isOverdue(r) || (r.current_stage !== "completed" && d >= 0 && d <= 3)) return "critical";
    if (supplierPending(r) || missProgram(r)) return "high";
    if (missInvoice(r) || missGuide(r)) return "medium";
    return "low";
  }
  var LEVEL = { critical: ["حرج", "lv-crit"], high: ["عالٍ", "lv-high"], medium: ["متوسط", "lv-med"], low: ["عادي", "lv-low"] };
  // Section 2 — priority-card → filter predicate
  function matchPriority(r, p) {
    if (p === "all") return true;
    if (p === "followup") return needsFollowup(r);
    if (p === "overdue") return isOverdue(r);
    if (p === "checkin") return isCheckinSoon(r);
    if (p === "supplier") return supplierPending(r);
    if (p === "program") return missProgram(r);
    if (p === "invoice") return missInvoice(r);
    if (p === "guide") return missGuide(r);
    return true;
  }
  // the 7 priority definitions (single source: scoped() records)
  var PRIORITIES = [
    { k: "followup", label: "يحتاج متابعة اليوم", exp: "بنود تحتاج تدخّلاً", tone: "brass" },
    { k: "overdue", label: "متأخر", exp: "تجاوز تاريخ الاستحقاق", tone: "bad" },
    { k: "checkin", label: "دخول خلال ٧ أيام", exp: "مغادرة قريبة", tone: "bad" },
    { k: "supplier", label: "بانتظار المورّد", exp: "بانتظار تأكيد المورّد", tone: "warn" },
    { k: "program", label: "بلا برنامج نهائي", exp: "لم يُعدّ البرنامج بعد", tone: "soft" },
    { k: "invoice", label: "بلا فاتورة", exp: "لم تُصدر الفاتورة", tone: "soft" },
    { k: "guide", label: "بلا دليل وجهة", exp: "لم يُجهّز الدليل", tone: "soft" }
  ];
  function priorityLabel(p) { var x = PRIORITIES.filter(function (d) { return d.k === p; })[0]; return x ? x.label : ""; }

  /* ---------- 1 · Operations Priority Dashboard --------------------- */
  function counts() {
    var R = scoped(), c = {};
    PRIORITIES.forEach(function (d) { c[d.k] = R.filter(function (r) { return matchPriority(r, d.k); }).length; });
    return c;
  }
  function renderPriority() {
    var c = counts();
    // Section 5 — compact daily summary (immediately visible)
    el("dailySummary").innerHTML =
      '<span class="ds-lead">اليوم</span>' +
      '<span class="ds-item"><b>' + arNum(c.followup) + "</b> يحتاج متابعة</span>" +
      '<span class="ds-sep">·</span><span class="ds-item"><b>' + arNum(c.checkin) + "</b> مغادرة قريبة</span>" +
      '<span class="ds-sep">·</span><span class="ds-item ds-bad"><b>' + arNum(c.overdue) + "</b> متأخرة</span>" +
      '<span class="ds-sep">·</span><span class="ds-item"><b>' + arNum(c.supplier) + "</b> بانتظار المورّد</span>";
    // Section 1+2 — clickable priority cards
    el("priorityGrid").innerHTML = PRIORITIES.map(function (d) {
      var on = state.priority === d.k ? " on" : "";
      return '<button type="button" class="pcard tone-' + d.tone + on + '" data-priority="' + d.k + '" aria-pressed="' + (state.priority === d.k) + '">' +
        '<span class="pc-v">' + arNum(c[d.k]) + "</span>" +
        '<span class="pc-k">' + d.label + "</span>" +
        '<span class="pc-exp">' + d.exp + "</span></button>";
    }).join("");
  }

  /* ---------- filter indicator -------------------------------------- */
  function renderIndicator(shown) {
    var active = state.priority !== "all" || state.stage !== "all" || state.q.trim();
    var ind = el("filterIndicator");
    if (!active) { ind.hidden = true; return; }
    var parts = [];
    if (state.priority !== "all") parts.push(priorityLabel(state.priority));
    if (state.stage !== "all") parts.push(sLabel(state.stage));
    if (state.q.trim()) parts.push('بحث: "' + esc(state.q.trim()) + '"');
    ind.hidden = false;
    ind.innerHTML = '<span class="fi-txt">التصفية: <b>' + parts.join(" · ") + "</b> — " + arNum(shown) + " سجل</span>" +
      '<button type="button" class="fi-clear" id="clearFilter">إلغاء التصفية ✕</button>';
  }

  /* ---------- 2 · Workflow Stage View ------------------------------- */
  function renderStageView() {
    var R = scoped();
    var counts = {}; R.forEach(function (r) { counts[r.current_stage] = (counts[r.current_stage] || 0) + 1; });
    el("stageView").innerHTML = (D.stages || []).map(function (s, i) {
      var c = counts[s.id] || 0;
      var node = '<div class="sv-node ' + sCls(s.id) + (c ? " has" : "") + '" data-stage="' + s.id + '">' +
        '<span class="sv-n">' + arNum(s.n) + '</span><span class="sv-label">' + esc(s.label) + '</span><span class="sv-count">' + arNum(c) + "</span></div>";
      return node + (i < D.stages.length - 1 ? '<span class="sv-arrow">‹</span>' : "");
    }).join("");
  }

  /* ---------- 3 · Action Required ----------------------------------- */
  function renderActionRequired() {
    var R = scoped().filter(function (r) { return urgency(r) > 0; })
      .sort(function (a, b) {
        var d = priorityRank(a) - priorityRank(b); if (d) return d;
        return daysUntil(a.check_in) - daysUntil(b.check_in);
      });
    el("actionCount").textContent = arNum(R.length) + " بحاجة إجراء";
    if (!R.length) { el("actionList").innerHTML = '<p class="empty">لا توجد عناصر تحتاج إجراءً الآن.</p>'; return; }
    el("actionList").innerHTML = R.slice(0, 12).map(function (r) {
      var tags = flags(r).map(function (f) { return '<span class="fl ' + f.cls + '">' + f.t + "</span>"; }).join("");
      return '<button type="button" class="action-item" data-bid="' + esc(r.booking_id) + '">' +
        '<div class="ai-main"><span class="ai-co">' + esc(r.company_name) + '</span>' +
        '<span class="ai-meta">' + esc(r.booking_id) + " · " + esc(destName(r.destination)) + " · " + esc(r.hotel_name) + "</span></div>" +
        '<div class="ai-tags">' + tags + "</div>" +
        '<div class="ai-next"><span class="ai-stage ' + sCls(r.current_stage) + '">' + esc(sLabel(r.current_stage)) + '</span><span class="ai-action">▸ ' + esc(r.next_action) + "</span></div>" +
        "</button>";
    }).join("");
  }

  /* ---------- 1 · Operational Queue --------------------------------- */
  function statusDot(s, kind) {
    if (kind === "supplier") return s === "confirmed" ? '<span class="dot ok">مؤكّد</span>' : '<span class="dot warn">بانتظار</span>';
    return s === "paid" ? '<span class="dot ok">مدفوع</span>' : s === "partial" ? '<span class="dot soft">جزئي</span>' : '<span class="dot no">غير مدفوع</span>';
  }
  function applyFilters() {
    var term = state.q.trim();
    return scoped().filter(function (r) {
      if (state.stage !== "all" && r.current_stage !== state.stage) return false;
      if (state.priority !== "all" && !matchPriority(r, state.priority)) return false;
      if (term && (r.quotation_id + " " + r.booking_id + " " + r.company_name + " " + r.hotel_name + " " + r.sales_employee).indexOf(term) === -1) return false;
      return true;
    });
  }
  function renderQueue() {
    // Section 3 — most urgent first; Section 4 — visual badge
    var rows = applyFilters().sort(function (a, b) {
      var d = priorityRank(a) - priorityRank(b); if (d) return d;
      var ca = daysUntil(a.check_in), cb = daysUntil(b.check_in);
      return ca - cb;
    });
    var body = rows.map(function (r) {
      var od = isOverdue(r);
      var due = r.due_date ? (od ? '<span class="due-bad">' + esc(r.due_date) + " ⚠</span>" : esc(r.due_date)) : "—";
      var lv = LEVEL[levelOf(r)];
      return '<tr class="clickable" data-bid="' + esc(r.booking_id) + '">' +
        '<td><span class="lv ' + lv[1] + '">' + lv[0] + "</span></td>" +
        "<td>" + esc(r.quotation_id) + "</td>" +
        "<td>" + esc(r.booking_id) + "</td>" +
        '<td class="name">' + esc(r.company_name) + "</td>" +
        "<td>" + esc(destName(r.destination)) + "</td>" +
        "<td>" + esc(r.hotel_name) + "</td>" +
        "<td>" + esc(r.sales_employee) + "</td>" +
        "<td>" + esc(r.booking_officer) + "</td>" +
        '<td><span class="sg-chip ' + sCls(r.current_stage) + '">' + arNum(sN(r.current_stage)) + "· " + esc(sLabel(r.current_stage)) + "</span></td>" +
        "<td>" + statusDot(r.supplier_status, "supplier") + "</td>" +
        "<td>" + statusDot(r.payment_status, "pay") + "</td>" +
        "<td>" + due + "</td></tr>";
    }).join("");
    el("queueTable").innerHTML = rows.length
      ? '<div class="table-scroll"><table class="tbl"><thead><tr><th>الأولوية</th><th>رقم العرض</th><th>رقم الحجز</th><th>الشركة</th><th>الوجهة</th><th>الفندق</th><th>المبيعات</th><th>موظف الحجز</th><th>المرحلة</th><th>المورّد</th><th>الدفع</th><th>الاستحقاق</th></tr></thead><tbody>' + body + "</tbody></table></div>"
      : '<p class="empty">لا توجد سجلات مطابقة.</p>';
    el("queueCount").textContent = arNum(rows.length) + " سجل";
    renderIndicator(rows.length);
  }

  /* ---------- 4 · Record Workspace (modal) -------------------------- */
  function recById(id) { return ALL.filter(function (r) { return r.booking_id === id; })[0]; }
  function progress(stageId) {
    var cur = sN(stageId);
    return '<div class="prog">' + (D.stages || []).map(function (s) {
      var cls = s.n < cur ? "done" : s.n === cur ? "cur" : "todo";
      return '<div class="prog-step ' + cls + '"><span class="ps-dot"></span><span class="ps-label">' + arNum(s.n) + "· " + esc(s.label) + "</span></div>";
    }).join("") + "</div>";
  }
  function fact(k, v) { return '<div class="ow-fact"><span class="ow-k">' + k + '</span><span class="ow-v">' + v + "</span></div>"; }
  function openRecord(id) {
    var r = recById(id); if (!r) return;
    var nights = Math.round((new Date(r.check_out) - new Date(r.check_in)) / 86400000);
    var commercial = [fact("الشركة", esc(r.company_name)), fact("موظف المبيعات", esc(r.sales_employee)), fact("رقم العرض", esc(r.quotation_id)), fact("رقم الحجز", '<b class="ow-key">' + esc(r.booking_id) + "</b>")].join("");
    var booking = [fact("الفندق", esc(r.hotel_name)), fact("الوجهة", esc(destName(r.destination))), fact("الدخول ← الخروج", esc(r.check_in) + " ← " + esc(r.check_out) + " (" + arNum(nights) + " ليلة)"), fact("المسافرون", arNum(r.pax)), fact("قيمة الحجز", money(r.booking_value)), fact("مرجع الحجز", esc(r.booking_reference))].join("");
    var oper = [
      fact("المرحلة الحالية", '<span class="sg-chip ' + sCls(r.current_stage) + '">' + arNum(sN(r.current_stage)) + "· " + esc(sLabel(r.current_stage)) + "</span>"),
      fact("الإجراء التالي", esc(r.next_action)), fact("الفريق المسؤول", esc(r.responsible_team)),
      fact("المورّد", statusDot(r.supplier_status, "supplier")), fact("الدفع", statusDot(r.payment_status, "pay")),
      fact("الاستحقاق", r.due_date ? (isOverdue(r) ? '<span class="due-bad">' + esc(r.due_date) + " (متأخر)</span>" : esc(r.due_date)) : "—")
    ].join("");
    var docs = (D.documents || []).map(function (d) { return '<button type="button" class="gen-btn" disabled title="قريباً — تُولّد لاحقاً من booking_id">توليد ' + d + "</button>"; }).join("");

    el("recordModal").innerHTML =
      '<div class="ow-backdrop" data-close="1"></div>' +
      '<div class="ow-panel" role="dialog" aria-modal="true">' +
        '<div class="ow-head"><div><h3 class="ow-title">' + esc(r.company_name) + '</h3><span class="ow-subid">' + esc(r.booking_id) + " · " + esc(r.quotation_id) + '</span></div><button type="button" class="ow-close" data-close="1" aria-label="إغلاق">✕</button></div>' +
        progress(r.current_stage) +
        '<h4 class="ow-sec">المعلومات التجارية</h4><div class="ow-facts">' + commercial + "</div>" +
        '<h4 class="ow-sec">معلومات الحجز</h4><div class="ow-facts">' + booking + "</div>" +
        '<h4 class="ow-sec">المعلومات التشغيلية</h4><div class="ow-facts">' + oper + "</div>" +
        '<h4 class="ow-sec">المستندات (تُولّد لاحقاً من booking_id)</h4><div class="gen-grid">' + docs + "</div>" +
        '<p class="ow-hint">الأزرار معطّلة في هذه المرحلة. الإجراءات التشغيلية ستُفعّل لفريق الحجوزات عند الربط — مع بقاء عرض الإدارة والمبيعات للقراءة فقط.</p>' +
      "</div>";
    el("recordModal").hidden = false; document.body.classList.add("modal-open");
  }
  function closeRecord() { var m = el("recordModal"); if (m) { m.hidden = true; m.innerHTML = ""; } document.body.classList.remove("modal-open"); }

  /* ---------- role + wiring ----------------------------------------- */
  function applyRole() {
    var tag = ROLE === "booking" ? "وضع الحجوزات — تشغيلي" : ROLE === "sales" ? "وضع المبيعات — سجلاتك فقط (عرض فقط)" : "وضع الإدارة — عرض فقط";
    el("roleTag").textContent = tag;
    var sb = el("salesBar");
    if (ROLE === "sales") {
      sb.hidden = false;
      el("empSelect").innerHTML = (D.salesEmployees || []).map(function (e) { return '<option value="' + e.id + '"' + (e.id === EMP ? " selected" : "") + ">" + esc(e.name) + "</option>"; }).join("");
    } else sb.hidden = true;
  }
  function populate() {
    el("fStage").innerHTML = '<option value="all">كل المراحل</option>' +
      ["booking_created", "supplier_pending", "fully_confirmed", "final_program_ready", "invoice_ready", "guide_ready", "completed"]
        .map(function (s) { return '<option value="' + s + '">' + arNum(sN(s)) + "· " + sLabel(s) + "</option>"; }).join("");
  }
  function renderAll() { renderPriority(); renderStageView(); renderActionRequired(); renderQueue(); }

  function wire() {
    el("now").textContent = NOW;
    var si;
    el("fSearch").addEventListener("input", function (e) { clearTimeout(si); si = setTimeout(function () { state.q = e.target.value; renderQueue(); }, 120); });
    el("fStage").addEventListener("change", function (e) { state.stage = e.target.value; renderPriority(); renderQueue(); });
    // priority cards → filter the queue (Section 2)
    el("priorityGrid").addEventListener("click", function (e) {
      var card = e.target.closest("[data-priority]"); if (!card) return;
      var p = card.getAttribute("data-priority");
      state.priority = state.priority === p ? "all" : p;   // toggle
      state.stage = "all"; el("fStage").value = "all";      // priority slice is pure
      renderPriority(); renderQueue();
      el("queueWrap").scrollIntoView({ behavior: "smooth", block: "start" });
    });
    el("fReset").addEventListener("click", function () { clearAll(); });
    el("empSelect") && el("empSelect").addEventListener("change", function (e) { EMP = e.target.value; renderAll(); });
    el("stageView").addEventListener("click", function (e) {
      var node = e.target.closest("[data-stage]"); if (!node) return;
      var s = node.getAttribute("data-stage");
      state.stage = state.stage === s ? "all" : s; el("fStage").value = state.stage; renderQueue();
      el("queueWrap").scrollIntoView({ behavior: "smooth", block: "start" });
    });
    document.addEventListener("click", function (e) {
      if (e.target.closest("#clearFilter")) { clearAll(); return; }
      if (e.target.closest("[data-close]")) { closeRecord(); return; }
      if (e.target.closest(".gen-btn")) return;
      var hit = e.target.closest("[data-bid]"); if (hit) openRecord(hit.getAttribute("data-bid"));
    });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeRecord(); });
  }
  function clearAll() {
    state.q = ""; state.stage = "all"; state.priority = "all";
    el("fSearch").value = ""; el("fStage").value = "all";
    renderPriority(); renderQueue();
  }

  document.addEventListener("DOMContentLoaded", function () {
    try { applyRole(); populate(); wire(); renderAll(); }
    catch (err) { console.error(err); document.body.insertAdjacentHTML("beforeend", '<pre style="color:#d9645a;padding:16px">خطأ: ' + esc(err.message) + "</pre>"); }
  });
})();
