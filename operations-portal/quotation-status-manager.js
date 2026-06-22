/* =====================================================================
   quotation-status-manager.js
   Standalone PROTOTYPE — converts quotations into operational statuses.
   No backend. All changes are in-memory (reset on reload). Sample data
   comes from window.QS_DATA (loaded first).
   Roles (prototype switch, no auth):
     sales      → view only (conversion credited to them)
     booking    → can change status / add note / add booking reference
     management → view all + analytics + who created / who confirmed
   ===================================================================== */
(function () {
  "use strict";

  var SRC = window.QS_DATA || {};
  var Q = [];                                   // mutable working copy
  function cloneData() { Q = (SRC.quotations || []).map(function (o) { return Object.assign({}, o); }); }
  cloneData();

  var STATUS = {
    quotation: { label: "عرض سعر", cls: "st-quote" },
    confirmed: { label: "مؤكّد", cls: "st-ok" },
    lost: { label: "مفقود", cls: "st-bad" },
    cancelled: { label: "ملغى", cls: "st-warn" }
  };

  var state = {
    role: "booking",                            // 'sales' | 'booking' | 'management'
    bookingUserId: (SRC.bookingStaff && SRC.bookingStaff[0] && SRC.bookingStaff[0].id) || "B1",
    filters: { q: "", status: "all", dest: "all", sales: "all", from: "", to: "" },
    openId: null
  };

  /* ---------- helpers ----------------------------------------------- */
  function el(id) { return document.getElementById(id); }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]; }); }
  function fmtInt(n) { return Math.round(n).toLocaleString("en-US"); }
  var CUR = (SRC.meta && SRC.meta.currency) || "ر.س";
  function money(n) {
    var a = Math.abs(n);
    if (a >= 1e6) return trim(n / 1e6) + " مليون " + CUR;
    if (a >= 1e3) return trim(n / 1e3) + " ألف " + CUR;
    return fmtInt(n) + " " + CUR;
  }
  function trim(x) { var v = x >= 10 ? x.toFixed(0) : x.toFixed(1); return v.replace(/\.0$/, ""); }
  function pct(x) { return Math.round(x * 100) + "%"; }
  var AR = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
  function arNum(n) { return String(n).split("").map(function (d) { return AR[+d] != null && /\d/.test(d) ? AR[+d] : d; }).join(""); }
  function fmtNow() {
    var d = new Date(); function p(n) { return ("0" + n).slice(-2); }
    return d.getFullYear() + "-" + p(d.getMonth() + 1) + "-" + p(d.getDate()) + " " + p(d.getHours()) + ":" + p(d.getMinutes());
  }
  function destName(id) { var d = (SRC.destinations || []).filter(function (x) { return x.id === id; })[0]; return d ? d.name : id; }
  function bookingName(id) { var s = (SRC.bookingStaff || []).filter(function (x) { return x.id === id; })[0]; return s ? s.name : id; }
  function statusChip(s) { var m = STATUS[s] || { label: s, cls: "" }; return '<span class="st-chip ' + m.cls + '">' + m.label + "</span>"; }
  function isBooking() { return state.role === "booking"; }

  /* ---------- analytics --------------------------------------------- */
  function renderAnalytics() {
    var total = Q.length;
    var by = { confirmed: 0, lost: 0, cancelled: 0, quotation: 0 };
    var confirmedValue = 0;
    Q.forEach(function (q) { by[q.status] = (by[q.status] || 0) + 1; if (q.status === "confirmed") confirmedValue += q.quotation_value; });
    var conv = total ? by.confirmed / total : 0;

    var cards = [
      ["إجمالي العروض", arNum(total), ""],
      ["مؤكّدة (حجوزات)", arNum(by.confirmed), "ok"],
      ["مفقودة", arNum(by.lost), "bad"],
      ["ملغاة", arNum(by.cancelled), "warn"],
      ["قيد الانتظار", arNum(by.quotation), "quote"],
      ["نسبة التحويل", pct(conv), "rate"]
    ];
    el("analyticsGrid").innerHTML = cards.map(function (c) {
      return '<div class="kpi ' + (c[2] ? "kpi-" + c[2] : "") + '"><span class="kpi-v">' + c[1] + '</span><span class="kpi-k">' + c[0] + "</span></div>";
    }).join("") +
      '<div class="kpi kpi-wide"><span class="kpi-v">' + money(confirmedValue) + '</span><span class="kpi-k">إجمالي قيمة الحجوزات المؤكّدة</span></div>';
  }

  /* ---------- quotation list + filters ------------------------------ */
  function applyFilters() {
    var f = state.filters, term = f.q.trim();
    return Q.filter(function (q) {
      if (f.status !== "all" && q.status !== f.status) return false;
      if (f.dest !== "all" && q.destination !== f.dest) return false;
      if (f.sales !== "all" && q.sales_employee_id !== f.sales) return false;
      if (f.from && q.created_at.slice(0, 10) < f.from) return false;
      if (f.to && q.created_at.slice(0, 10) > f.to) return false;
      if (term && (q.quotation_id + " " + q.company_name + " " + q.sales_employee).indexOf(term) === -1) return false;
      return true;
    });
  }
  function renderList() {
    var rows = applyFilters();
    var actionLabel = isBooking() ? "إدارة الحالة" : "عرض التفاصيل";
    var showWho = state.role === "management";
    var head = "<tr><th>رقم العرض</th><th>الشركة</th><th>موظف المبيعات</th><th>الوجهة</th><th>التاريخ</th><th>القيمة</th><th>الحالة</th>" +
      (showWho ? "<th>نفّذ التغيير</th>" : "") + "<th></th></tr>";
    var body = rows.map(function (q) {
      return '<tr class="clickable" data-qid="' + esc(q.quotation_id) + '">' +
        "<td>" + esc(q.quotation_id) + "</td>" +
        '<td class="name">' + esc(q.company_name) + "</td>" +
        "<td>" + esc(q.sales_employee) + "</td>" +
        "<td>" + esc(destName(q.destination)) + "</td>" +
        "<td>" + esc(q.created_at.slice(0, 10)) + "</td>" +
        "<td>" + money(q.quotation_value) + "</td>" +
        "<td>" + statusChip(q.status) + "</td>" +
        (showWho ? "<td>" + esc(q.status_updated_by || "—") + "</td>" : "") +
        '<td><button type="button" class="row-act" data-qid="' + esc(q.quotation_id) + '">' + actionLabel + "</button></td>" +
        "</tr>";
    }).join("");
    el("listTable").innerHTML = rows.length
      ? '<div class="table-scroll"><table class="tbl"><thead>' + head + "</thead><tbody>" + body + "</tbody></table></div>"
      : '<p class="empty">لا توجد عروض مطابقة للفلاتر.</p>';
    el("listCount").textContent = arNum(rows.length) + " عرض";
  }

  /* ---------- sales conversion table -------------------------------- */
  function renderSalesTable() {
    var map = {};
    (SRC.salesEmployees || []).forEach(function (s) { map[s.id] = { name: s.name, created: 0, confirmed: 0, value: 0 }; });
    Q.forEach(function (q) {
      var m = map[q.sales_employee_id]; if (!m) return;
      m.created++;
      if (q.status === "confirmed") { m.confirmed++; m.value += q.quotation_value; }
    });
    var rows = Object.keys(map).map(function (k) { return map[k]; })
      .sort(function (a, b) { return b.confirmed - a.confirmed; });
    var body = rows.map(function (m) {
      var conv = m.created ? m.confirmed / m.created : 0;
      return "<tr><td class='name'>" + esc(m.name) + "</td><td>" + arNum(m.created) + "</td><td>" + arNum(m.confirmed) +
        "</td><td>" + pct(conv) + "</td><td>" + money(m.value) + "</td></tr>";
    }).join("");
    el("salesTable").innerHTML = '<div class="table-scroll"><table class="tbl"><thead><tr><th>موظف المبيعات</th><th>عروض أنشأها</th><th>حجوزات مؤكّدة</th><th>نسبة التحويل</th><th>قيمة الحجوزات</th></tr></thead><tbody>' + body + "</tbody></table></div>";
  }

  /* ---------- booking activity table -------------------------------- */
  function renderBookingTable() {
    var map = {};
    (SRC.bookingStaff || []).forEach(function (s) { map[s.id] = { name: s.name, confirmed: 0, lost: 0, cancelled: 0, notes: 0 }; });
    Q.forEach(function (q) {
      var m = map[q.status_updated_by_id]; if (!m) return;
      if (q.status === "confirmed") m.confirmed++;
      else if (q.status === "lost") m.lost++;
      else if (q.status === "cancelled") m.cancelled++;
      if (q.status_note) m.notes++;
    });
    var rows = Object.keys(map).map(function (k) { return map[k]; });
    var body = rows.map(function (m) {
      return "<tr><td class='name'>" + esc(m.name) + "</td><td>" + arNum(m.confirmed) + "</td><td>" + arNum(m.lost) +
        "</td><td>" + arNum(m.cancelled) + "</td><td>" + arNum(m.notes) + "</td></tr>";
    }).join("");
    el("bookingTable").innerHTML = '<div class="table-scroll"><table class="tbl"><thead><tr><th>موظف الحجوزات</th><th>تأكيدات</th><th>تحديد مفقود</th><th>تحديد ملغى</th><th>ملاحظات مُضافة</th></tr></thead><tbody>' + body + "</tbody></table></div>";
  }

  /* ---------- status action panel (modal) --------------------------- */
  function recById(id) { return Q.filter(function (q) { return q.quotation_id === id; })[0]; }

  function openStatusModal(id) {
    var q = recById(id); if (!q) return;
    state.openId = id;
    var facts = [
      ["رقم العرض", esc(q.quotation_id)],
      ["الشركة", esc(q.company_name)],
      ["الاحتساب (المبيعات)", '<b class="credit">' + esc(q.sales_employee) + "</b>"],
      ["الوجهة", esc(destName(q.destination))],
      ["تاريخ الإنشاء", esc(q.created_at)],
      ["قيمة العرض", money(q.quotation_value)],
      ["الحالة الحالية", statusChip(q.status)],
      ["آخر تحديث", esc(q.status_updated_at || "—")],
      ["نفّذ التغيير (الحجوزات)", esc(q.status_updated_by || "—")],
      ["مرجع الحجز", esc(q.booking_reference || "—")]
    ].map(function (f) {
      return '<div class="qm-fact"><span class="qm-k">' + f[0] + '</span><span class="qm-v">' + f[1] + "</span></div>";
    }).join("");

    var noteBlock = q.status_note
      ? '<div class="qm-note"><span>ملاحظة</span><p>' + esc(q.status_note) + "</p></div>" : "";

    var action;
    if (isBooking()) {
      action =
        '<div class="qm-action">' +
          '<h4 class="qm-ah">إجراء الحالة — بصفتك: <b>' + esc(bookingName(state.bookingUserId)) + "</b></h4>" +
          '<label class="qm-lbl">مرجع الحجز<input type="text" id="qmRef" class="qm-input" placeholder="مثال: BR-2026-1234" value="' + esc(q.booking_reference || "") + '"></label>' +
          '<label class="qm-lbl">ملاحظة<textarea id="qmNote" class="qm-input" rows="2" placeholder="أضف ملاحظة…">' + esc(q.status_note || "") + "</textarea></label>" +
          '<div class="qm-btns">' +
            '<button type="button" class="qm-btn ok" data-act="confirmed">تأكيد الحجز</button>' +
            '<button type="button" class="qm-btn bad" data-act="lost">تحديد كمفقود</button>' +
            '<button type="button" class="qm-btn warn" data-act="cancelled">تحديد كملغى</button>' +
            '<button type="button" class="qm-btn ghost" data-act="save">حفظ الملاحظة / المرجع</button>' +
          "</div>" +
          '<p class="qm-hint">الاحتساب يبقى لموظف المبيعات الأصلي؛ يُسجَّل اسمك كمن نفّذ التغيير فقط.</p>' +
        "</div>";
    } else {
      action = '<div class="qm-readonly">العمليات متاحة لفريق الحجوزات فقط. دورك الحالي: <b>' + roleLabel(state.role) + "</b> (عرض فقط).</div>";
    }

    el("statusModal").innerHTML =
      '<div class="qm-backdrop" data-close="1"></div>' +
      '<div class="qm-panel" role="dialog" aria-modal="true">' +
        '<div class="qm-head"><h3 class="qm-title">إدارة حالة العرض</h3>' +
          '<button type="button" class="qm-close" data-close="1" aria-label="إغلاق">✕</button></div>' +
        '<div class="qm-facts">' + facts + "</div>" + noteBlock + action +
      "</div>";
    el("statusModal").hidden = false;
    document.body.classList.add("modal-open");
  }
  function closeStatusModal() {
    var m = el("statusModal"); if (!m || m.hidden) return;
    m.hidden = true; m.innerHTML = ""; state.openId = null;
    document.body.classList.remove("modal-open");
  }

  function applyAction(act) {
    if (!isBooking()) return;
    var q = recById(state.openId); if (!q) return;
    /* ===================================================================
       FUTURE SUPABASE DATA SOURCE / DO NOT WRITE IN LAB MODE
       -------------------------------------------------------------------
       LAB MODE: the lines below mutate the IN-MEMORY record only — no DB
       write, resets on reload. Later (Bandar): persist these same fields
       to Supabase here (status, status_updated_at, status_updated_by,
       booking_reference, status_note) with role-gated WRITE access, and
       KEEP the original sales_employee attribution (never overwrite it).
       =================================================================== */
    var ref = (el("qmRef") && el("qmRef").value || "").trim();
    var note = (el("qmNote") && el("qmNote").value || "").trim();
    q.booking_reference = ref || q.booking_reference || null;
    q.status_note = note || null;
    q.status_updated_at = fmtNow();
    q.status_updated_by = bookingName(state.bookingUserId);
    q.status_updated_by_id = state.bookingUserId;
    if (act === "confirmed" || act === "lost" || act === "cancelled") q.status = act;
    // 'save' keeps current status, only persists ref/note/updated-by
    renderAll();
    openStatusModal(state.openId);   // refresh modal with new values
  }

  /* ---------- role bar / filters ------------------------------------ */
  function roleLabel(r) { return r === "sales" ? "المبيعات" : r === "booking" ? "الحجوزات" : "الإدارة"; }
  function setActiveBtn(container, btn) {
    var bs = el(container).querySelectorAll("button"); for (var i = 0; i < bs.length; i++) bs[i].classList.remove("active");
    btn.classList.add("active");
  }
  function syncRoleUI() {
    el("bookingUserWrap").hidden = !isBooking();
    el("roleNote").textContent =
      state.role === "booking" ? "فريق الحجوزات: يمكنك تأكيد العروض أو تحديدها كمفقودة/ملغاة وإضافة ملاحظات ومرجع حجز."
        : state.role === "sales" ? "فريق المبيعات: عرض فقط — الاحتساب يُنسب إليك، ولا يمكنك تغيير الحالة."
          : "الإدارة: عرض كل العروض والتحليلات ومن أنشأ العرض ومن نفّذ التغيير.";
  }

  function populateFilters() {
    var sOpts = '<option value="all">كل الحالات</option>' + (SRC.statuses || []).map(function (s) { return '<option value="' + s.id + '">' + s.label + "</option>"; }).join("");
    el("fStatus").innerHTML = sOpts;
    var dOpts = '<option value="all">كل الوجهات</option>' + (SRC.destinations || []).map(function (d) { return '<option value="' + d.id + '">' + d.name + "</option>"; }).join("");
    el("fDest").innerHTML = dOpts;
    var eOpts = '<option value="all">كل الموظفين</option>' + (SRC.salesEmployees || []).map(function (e) { return '<option value="' + e.id + '">' + e.name + "</option>"; }).join("");
    el("fSales").innerHTML = eOpts;
    var bOpts = (SRC.bookingStaff || []).map(function (s) { return '<option value="' + s.id + '">' + s.name + "</option>"; }).join("");
    el("bookingUser").innerHTML = bOpts;
  }

  function renderAll() {
    renderAnalytics();
    renderList();
    renderSalesTable();
    renderBookingTable();
  }

  function wire() {
    el("now").textContent = (SRC.meta && SRC.meta.now) || "";
    // role selector
    el("roleControl").addEventListener("click", function (e) {
      var b = e.target.closest("[data-role]"); if (!b) return;
      state.role = b.getAttribute("data-role"); setActiveBtn("roleControl", b);
      syncRoleUI(); renderAll();
    });
    el("bookingUser").addEventListener("change", function (e) { state.bookingUserId = e.target.value; });
    // filters
    var si;
    el("fSearch").addEventListener("input", function (e) { clearTimeout(si); si = setTimeout(function () { state.filters.q = e.target.value; renderList(); }, 120); });
    el("fStatus").addEventListener("change", function (e) { state.filters.status = e.target.value; renderList(); });
    el("fDest").addEventListener("change", function (e) { state.filters.dest = e.target.value; renderList(); });
    el("fSales").addEventListener("change", function (e) { state.filters.sales = e.target.value; renderList(); });
    el("fFrom").addEventListener("change", function (e) { state.filters.from = e.target.value; renderList(); });
    el("fTo").addEventListener("change", function (e) { state.filters.to = e.target.value; renderList(); });
    el("fReset").addEventListener("click", function () {
      state.filters = { q: "", status: "all", dest: "all", sales: "all", from: "", to: "" };
      el("fSearch").value = ""; el("fStatus").value = "all"; el("fDest").value = "all"; el("fSales").value = "all"; el("fFrom").value = ""; el("fTo").value = "";
      renderList();
    });
    el("dataReset").addEventListener("click", function () { cloneData(); renderAll(); closeStatusModal(); });
    // open modal (row or action button)
    document.addEventListener("click", function (e) {
      if (e.target.closest("[data-close]")) { closeStatusModal(); return; }
      var act = e.target.closest(".qm-btn");
      if (act) { applyAction(act.getAttribute("data-act")); return; }
      var row = e.target.closest("[data-qid]");
      if (row) openStatusModal(row.getAttribute("data-qid"));
    });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeStatusModal(); });
  }

  document.addEventListener("DOMContentLoaded", function () {
    try {
      populateFilters();
      // default active role button
      var rb = document.querySelector('#roleControl [data-role="booking"]'); if (rb) rb.classList.add("active");
      syncRoleUI();
      wire();
      renderAll();
    } catch (err) {
      console.error(err);
      document.body.insertAdjacentHTML("beforeend", '<pre style="color:#d9645a;padding:16px">خطأ: ' + esc(err.message) + "</pre>");
    }
  });
})();
