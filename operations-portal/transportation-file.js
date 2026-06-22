/* transportation-file.js — Auto Transportation File module (Phase 1)
   - receives a confirmed booking from the dashboard shell (postMessage)
   - opens the saved file if one exists, else AUTO-GENERATES from the program
   - shows it read-only; the only editable control is the default driver group
   - Save + Mark Ready to Send, persisted per booking_id via TransportationFileStore */
(function () {
  "use strict";
  function el(id) { return document.getElementById(id); }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]; }); }
  function qp(k) { var m = (location.search || "").match(new RegExp("[?&]" + k + "=([^&]+)")); return m ? decodeURIComponent(m[1]) : ""; }

  var BID = "", FILE = null, BOOKING = null, dirty = false, FROM_WORKLIST = false, WL_FILTER = "action";
  var WL_STATUS = "all", WL_DATE = "all", WL_FROM = "", WL_TO = "";
  var CURRENT_ROLE = "";
  function roleLabel(r) { return ({ management: "الإدارة", booking: "الحجوزات", sales: "المبيعات" })[r] || (r || "—"); }
  function logChange(action, detail) { if (window.TransportationLogStore && BID) TransportationLogStore.add(BID, { role: roleLabel(CURRENT_ROLE), action: action, detail: detail || "" }); }

  function setStatus(t) { var e = el("tfStatus"); if (e) e.textContent = t || ""; }
  function setSaved(t) { var e = el("tfSaved"); if (e) e.textContent = t || ""; }

  function typePill(t) {
    var cls = t.type === "airport_arrival" ? "t-arr" : t.type === "airport_departure" ? "t-dep" :
      t.type === "internal_flight" ? "t-fly" : t.type === "intercity" ? "t-city" : "t-tour";
    var short = t.type === "airport_arrival" ? "استقبال" : t.type === "airport_departure" ? "مغادرة" :
      t.type === "internal_flight" ? "رحلة داخلية" : t.type === "intercity" ? "تنقل" : "جولة";
    return '<span class="mv-type ' + cls + '">' + short + "</span>";
  }

  /* ---- driver assignment layer (BY REGION, with optional override) --
     Default = one driver per region; the system fans that driver out to every
     movement in the region. Per-movement override is kept for the rare case. */
  var OVR_OPEN = {};   // movement ids whose override picker is expanded
  var REGION_LABEL = {
    id_main: "السائق الرئيسي إندونيسيا (جاكرتا / بونشاك / باندونق)",
    id_bali: "سائق بالي · Bali Driver",
    th: "سائق تايلاند · Thailand Driver"
  };
  var REGION_SHORT = { id_main: "إندونيسيا الرئيسي", id_bali: "بالي", th: "تايلاند" };
  var REGION_ORDER = ["id_main", "id_bali", "th"];

  function regionOf(m) {
    var city = m.city || "";
    if ((FILE.destination_id || "") === "thailand") return "th";
    if (/بالي|bali/i.test(city)) return "id_bali";
    return "id_main";   // jakarta / puncak / bandung + default for indonesia
  }
  function regionsInFile() {
    var seen = {}; FILE.movements.forEach(function (m) { seen[m.region] = 1; });
    return REGION_ORDER.filter(function (r) { return seen[r]; });
  }
  function countInRegion(r) { return FILE.movements.filter(function (m) { return m.region === r; }).length; }
  function driversForFile() { return (window.DriverRegistry ? DriverRegistry.byDestination(FILE.destination_id) : []); }
  function assignedCount() { return FILE.movements.filter(function (m) { return !!m.driver_id; }).length; }
  function allAssigned() { return FILE.movements.length > 0 && FILE.movements.every(function (m) { return !!m.driver_id; }); }
  function driverPhone(m) { var d = (window.DriverRegistry && m.driver_id) ? DriverRegistry.byId(m.driver_id) : null; return d ? d.phone : ""; }

  // fan region drivers out to all NON-overridden movements
  function applyRegions() {
    FILE.movements.forEach(function (m) {
      if (m.override) return;
      var did = FILE.region_drivers[m.region] || "";
      var d = (did && window.DriverRegistry) ? DriverRegistry.byId(did) : null;
      m.driver_id = d ? d.driver_id : ""; m.driver_name = d ? d.driver_name : "";
    });
  }
  function driverSelectHTML(m) {
    var drv = driversForFile();
    return '<select class="mv-driver" data-mv="' + esc(m.id) + '"><option value="">— حسب المنطقة —</option>' +
      drv.map(function (d) { return '<option value="' + esc(d.driver_id) + '"' + (d.driver_id === m.driver_id ? " selected" : "") + ">" + esc(d.driver_name) + "</option>"; }).join("") +
      "</select>";
  }
  function defaultType() { return (FILE.source === "program" && FILE.movements && FILE.movements.length) ? "full_program" : "transport_only"; }
  function normalizeMovements() {
    if (!FILE) return;
    FILE.movements = FILE.movements || [];
    FILE.region_drivers = FILE.region_drivers || {};
    if (!FILE.transport_type) FILE.transport_type = defaultType();
    if (typeof FILE.customer_phone !== "string") FILE.customer_phone = "";
    if (typeof FILE.flight_no !== "string") FILE.flight_no = "";
    if (FILE.pax == null) FILE.pax = "";
    if (!FILE.status) FILE.status = FILE.ready_to_send ? "ready" : "draft";
    FILE.ready_to_send = (FILE.status === "ready" || FILE.status === "completed");
    FILE.movements.forEach(function (m) {
      ["driver_id", "driver_name", "time", "from", "to", "flight"].forEach(function (k) { if (typeof m[k] !== "string") m[k] = m[k] || ""; });
      m.region = regionOf(m);
      m.override = m.override === true;
    });
    if (FILE.transport_type === "full_program") applyRegions();
  }
  function isPointType(t) { return t === "airport_pickup" || t === "airport_dropoff" || t === "point_to_point" || t === "airport_arrival" || t === "airport_departure" || t === "intercity" || t === "internal_flight"; }
  var MT_TYPES = [
    { v: "airport_pickup", l: "استقبال مطار · Airport pickup" },
    { v: "airport_dropoff", l: "توصيل مطار · Airport drop-off" },
    { v: "point_to_point", l: "نقل نقطة-لنقطة · Point-to-point" },
    { v: "car_with_driver", l: "سيارة مع سائق · Car with driver" },
    { v: "custom", l: "أخرى · Custom" }
  ];
  function newMtId() { return "MT-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 5); }
  function drvLineHTML(m) {
    return m.driver_id
      ? '<div class="mv-drv on">🟢 <span class="mv-drv-l">السائق:</span> <b>' + esc(m.driver_name) + "</b>" + (driverPhone(m) ? ' <span class="mv-drv-ph">· جوال: ' + esc(driverPhone(m)) + "</span>" : "") + "</div>"
      : '<div class="mv-drv off">🔴 <span class="mv-drv-l">لا يوجد سائق · Driver Missing</span></div>';
  }
  function readyBlockers() {
    var b = [];
    if (FILE.transport_type === "transport_only") {
      if (!FILE.customer_name) b.push("اسم العميل · Customer name");
      if (!FILE.movements.length) b.push("حركة واحدة على الأقل · At least one movement");
      FILE.movements.forEach(function (m, i) {
        var n = i + 1;
        if (!m.driver_id) b.push("سائق (حركة " + n + ") · Driver");
        if (isPointType(m.type)) {
          if (!m.from) b.push("مكان الانطلاق (حركة " + n + ") · Pickup location");
          if (!m.to) b.push("مكان الوصول (حركة " + n + ") · Drop-off location");
          if (!(m.time || m.flight || FILE.flight_no)) b.push("الوقت أو رقم الرحلة (حركة " + n + ") · Time/Flight");
        } else if (!(m.city || m.from)) { b.push("المدينة/المنطقة (حركة " + n + ") · City"); }
      });
    } else {
      if (FILE.source !== "program") b.push("برنامج مرتبط · Program linked");
      if (!FILE.customer_name) b.push("اسم العميل · Customer name");
      if (!FILE.movements.length) b.push("حركات البرنامج · Movements");
      if (!allAssigned()) b.push("سائقو المناطق غير مكتملين · Region drivers");
    }
    return b;
  }
  // surgical gate refresh — used on text edits so we never rebuild (and detach) the inputs/Add button
  function refreshGate() {
    if (!FILE) return;
    var blockers = readyBlockers(), can = blockers.length === 0;
    var rb = el("tfReady"); if (rb) rb.disabled = (!can && !FILE.ready_to_send);
    var gw = el("tfGateWarn");
    if (gw) { gw.style.display = can ? "none" : ""; gw.textContent = "🔴 عناصر ناقصة (" + blockers.length + ") — لا يمكن وضع جاهز"; }
    if (FILE.transport_type === "transport_only") {
      var cnt = el("tfMissCnt"); if (cnt) { cnt.textContent = blockers.length; cnt.className = "cnt " + (blockers.length ? "bad" : "ok"); }
      var body = el("tfMissBody");
      if (body) body.innerHTML = blockers.length ? blockers.map(function (x) { return '<div class="miss">⚠ ' + esc(x) + "</div>"; }).join("") : '<p class="tf-ok">لا عناصر ناقصة — الملف مكتمل.</p>';
    }
  }
  function addDriverBlockHTML() {
    var pool = driversForFile();
    return '<div class="addrv"><span class="addrv-h">إضافة سائق جديد · Add driver</span>' +
      '<input id="ndName" class="drv-in" placeholder="اسم السائق" autocomplete="off">' +
      '<input id="ndPhone" class="drv-in" placeholder="رقم الجوال" autocomplete="off">' +
      '<button type="button" id="ndAdd" class="btn primary sm">+ إضافة</button>' +
      '<span class="addrv-note" id="ndNote"></span></div>' +
      (pool.length ? "" : '<p class="tf-empty">لا يوجد سائقون لهذه الوجهة — أضف سائقاً.</p>');
  }
  function toMovementRow(m, i) {
    var drv = driversForFile();
    function inp(label, fld, val, wide) { return '<label class="to-f' + (wide ? " wide" : "") + '"><span class="to-fl">' + label + '</span><input class="to-in" data-f="' + fld + '" value="' + esc(val || "") + '" autocomplete="off"></label>'; }
    var inList = MT_TYPES.some(function (o) { return o.v === m.type; });
    var typeSel = '<label class="to-f"><span class="to-fl">النوع · Type</span><select class="to-in" data-f="type">' +
      (inList ? "" : '<option value="' + esc(m.type) + '" selected>' + esc((window.TransportationSource && TransportationSource.TYPE_LABEL && TransportationSource.TYPE_LABEL[m.type]) || m.type) + "</option>") +
      MT_TYPES.map(function (o) { return '<option value="' + o.v + '"' + (o.v === m.type ? " selected" : "") + ">" + o.l + "</option>"; }).join("") + "</select></label>";
    var drvSel = '<label class="to-f"><span class="to-fl">السائق · Driver</span><select class="to-driver"><option value="">— اختر السائق —</option>' +
      drv.map(function (d) { return '<option value="' + esc(d.driver_id) + '"' + (d.driver_id === m.driver_id ? " selected" : "") + ">" + esc(d.driver_name) + "</option>"; }).join("") + "</select></label>";
    return '<div class="to-mv' + (m.driver_id ? "" : " mv-missing") + '" data-mv="' + esc(m.id) + '">' +
      '<div class="to-mv-h"><span class="to-mv-n">حركة ' + (i + 1) + "</span>" + drvLineHTML(m) + '<button type="button" class="lnk del" data-del="' + esc(m.id) + '">حذف</button></div>' +
      '<div class="to-mv-grid">' + typeSel + inp("التاريخ", "date", m.date) + inp("الوقت", "time", m.time) +
      inp("المدينة/المنطقة", "city", m.city) + inp("من · From", "from", m.from) + inp("إلى · To", "to", m.to) +
      inp("رقم الرحلة", "flight", m.flight) + drvSel + "</div>" +
      inp("ملاحظات · Notes", "note", m.note, true) + "</div>";
  }
  function transportOnlyBuilder() {
    return '<div class="tf-card"><div class="tf-h">حركات المواصلات (إدخال يدوي) · Manual Movements <span class="cnt">' + FILE.movements.length + "</span></div>" +
      (FILE.movements.length ? '<div class="to-mv-list">' + FILE.movements.map(toMovementRow).join("") + "</div>" : '<p class="tf-empty">لا توجد حركات بعد — أضف حركة واحدة على الأقل.</p>') +
      '<button type="button" id="toAdd" class="btn primary sm add-mv">+ إضافة حركة · Add movement</button>' +
      addDriverBlockHTML() + "</div>";
  }
  function toField(label, ff, val) { return '<label class="to-f"><span class="to-fl">' + label + '</span><input class="to-in" data-ff="' + ff + '" value="' + esc(val || "") + '" autocomplete="off"></label>'; }

  function render() {
    if (!FILE) return;
    var rem = (window.TransportationSource && TransportationSource.reminders(FILE, new Date())) || [];
    var ready = !!FILE.ready_to_send;

    var TT = FILE.transport_type;
    var customer;
    if (TT === "transport_only") {
      customer = '<div class="tf-card"><div class="tf-h">معلومات العميل · Customer</div><div class="to-form">' +
        toField("اسم العميل *", "customer_name", FILE.customer_name) +
        toField("جوال العميل", "customer_phone", FILE.customer_phone) +
        toField("الوجهة / الدولة", "destination", FILE.destination) +
        toField("عدد المسافرين", "pax", FILE.pax) +
        toField("تاريخ الوصول", "date_start", FILE.dates.start) +
        toField("رقم الرحلة (إن وجد)", "flight_no", FILE.flight_no) +
        "</div></div>";
    } else {
      customer =
        '<div class="tf-card"><div class="tf-h">معلومات العميل · Customer</div><div class="kv-grid">' +
        kv("اسم العميل", esc(FILE.customer_name) || dash()) +
        kv("رقم البرنامج", esc(FILE.program_no) || dash()) +
        kv("الوجهة", esc(FILE.destination) || dash()) +
        kv("تواريخ الرحلة", FILE.dates.start ? (esc(FILE.dates.start) + " ← " + esc(FILE.dates.end || "—")) : dash()) +
        kv("تصنيف العميل", FILE.vip ? '<span class="vip on">VIP</span>' : '<span class="vip">عادي · Standard</span>') +
        kv("المصدر", FILE.source === "program" ? "برنامج مؤكّد · Confirmed program" : '<span class="warn">ملخّص الحجز فقط · Booking summary</span>') +
        "</div></div>";
    }

    var hotels = '<div class="tf-card"><div class="tf-h">الفنادق · Hotels</div>' +
      (FILE.hotels.length ? '<div class="ht-list">' + FILE.hotels.map(function (h) {
        return '<div class="ht"><div class="ht-n">' + esc(h.name || "—") + '</div><div class="ht-d">' +
          esc(h.check_in || "—") + " ← " + esc(h.check_out || "—") + (h.address ? ' · <span class="ht-a">' + esc(h.address) + "</span>" : "") + "</div></div>";
      }).join("") + "</div>" : '<p class="tf-empty">لا توجد فنادق في المصدر.</p>') + "</div>";

    var moves = '<div class="tf-card"><div class="tf-h">حركات المواصلات · Movements <span class="cnt">' + FILE.movements.length + "</span>" +
      (FILE.movements.length ? '<span class="cnt ' + (allAssigned() ? "ok" : "bad") + '">' + assignedCount() + "/" + FILE.movements.length + " معيّن</span>" : "") + "</div>" +
      (FILE.movements.length ? '<div class="mv-list">' + FILE.movements.map(function (m) {
        var on = !!m.driver_id;
        var drvLine = on
          ? '<div class="mv-drv on">🟢 <span class="mv-drv-l">السائق:</span> <b>' + esc(m.driver_name) + "</b>" + (driverPhone(m) ? ' <span class="mv-drv-ph">· جوال: ' + esc(driverPhone(m)) + "</span>" : "") + "</div>"
          : '<div class="mv-drv off">🔴 <span class="mv-drv-l">لا يوجد سائق · Driver Missing</span></div>';
        var showSel = m.override || OVR_OPEN[m.id];
        var ctrl = m.override
          ? '<span class="ovr-badge">مخصّص</span><button type="button" class="lnk" data-revert="' + esc(m.id) + '">↺ إرجاع للمنطقة</button>'
          : '<button type="button" class="lnk" data-override="' + esc(m.id) + '">تخصيص سائق لهذه الحركة</button>';
        return '<div class="mv' + (on ? "" : " mv-missing") + (m.override ? " mv-ovr-on" : "") + '">' + typePill(m) +
          '<div class="mv-body"><div class="mv-top"><span class="mv-date">' + (esc(m.date) || '<span class="warn">تاريخ ناقص</span>') + "</span>" +
          '<span class="mv-city">' + (esc(m.city) || '<span class="warn">مدينة ناقصة</span>') + "</span>" +
          '<span class="reg-tag">' + esc(REGION_SHORT[m.region] || "") + "</span></div>" +
          '<div class="mv-note">' + (esc(m.note) || "—") + "</div>" +
          '<div class="mv-assign">' + drvLine + '<span class="mv-ctrl">' + ctrl + "</span></div>" +
          (showSel ? '<div class="mv-ovr-box">' + driverSelectHTML(m) + "</div>" : "") +
          "</div></div>";
      }).join("") + "</div>" : '<p class="tf-empty">لا توجد حركات في البرنامج — تظهر كعنصر ناقص أدناه.</p>') + "</div>";

    var pool = driversForFile();
    var regs = regionsInFile();
    var regionCard = '<div class="tf-card"><div class="tf-h">إسناد حسب المنطقة · Assign by Region</div>' +
      '<p class="reg-hint">اختر سائقاً واحداً لكل منطقة — يُسند النظام كل حركات المنطقة لذلك السائق تلقائياً.</p>' +
      '<div class="reg-list">' + regs.map(function (r) {
        var did = FILE.region_drivers[r] || "";
        return '<div class="reg-row' + (did ? "" : " reg-empty") + '"><div class="reg-meta"><span class="reg-name">' + esc(REGION_LABEL[r] || r) + "</span>" +
          '<span class="reg-cnt">' + countInRegion(r) + " حركة</span></div>" +
          '<select class="reg-sel" data-reg="' + r + '"><option value="">— اختر سائق المنطقة —</option>' +
          pool.map(function (d) { return '<option value="' + esc(d.driver_id) + '"' + (d.driver_id === did ? " selected" : "") + ">" + esc(d.driver_name) + (d.phone ? " · " + esc(d.phone) : "") + "</option>"; }).join("") +
          "</select></div>";
      }).join("") + "</div>" +
      '<div class="addrv"><span class="addrv-h">إضافة سائق جديد · Add driver</span>' +
      '<input id="ndName" class="drv-in" placeholder="اسم السائق" autocomplete="off">' +
      '<input id="ndPhone" class="drv-in" placeholder="رقم الجوال" autocomplete="off">' +
      '<button type="button" id="ndAdd" class="btn primary sm">+ إضافة</button>' +
      '<span class="addrv-note" id="ndNote"></span></div>' +
      (pool.length ? "" : '<p class="tf-empty">لا يوجد سائقون لهذه الوجهة — أضف سائقاً.</p>') + "</div>";

    var missItems = TT === "transport_only" ? readyBlockers() : (FILE.missing || []);
    var missing = '<div class="tf-card"><div class="tf-h">العناصر الناقصة · Missing Items <span class="cnt ' + (missItems.length ? "bad" : "ok") + '" id="tfMissCnt">' + missItems.length + "</span></div>" +
      '<div id="tfMissBody">' + (missItems.length ? '<div class="miss-list">' + missItems.map(function (x) { return '<div class="miss">⚠ ' + esc(x) + "</div>"; }).join("") + "</div>"
        : '<p class="tf-ok">لا عناصر ناقصة — الملف مكتمل.</p>') + "</div></div>";

    var reminders = '<div class="tf-card"><div class="tf-h">مؤشرات التذكير · Reminders <span class="muted">(عرض فقط)</span></div><div class="rem-list">' +
      rem.map(function (r) {
        var d = r.days_to_arrival;
        var state = r.active ? '<span class="rem-b on">الآن</span>' : (d == null ? '<span class="rem-b">—</span>' : '<span class="rem-b">بعد ' + d + " يوم</span>");
        return '<div class="rem"><span class="rem-l">' + esc(r.label) + "</span>" + state + "</div>";
      }).join("") + "</div></div>";

    var status = FILE.status || (FILE.ready_to_send ? "ready" : "draft");
    var blockers = readyBlockers();
    var canRdy = blockers.length === 0;
    var stActions = "";
    if (status === "draft") {
      stActions =
        '<span class="gate-warn" id="tfGateWarn"' + (canRdy ? ' style="display:none"' : "") + ">🔴 عناصر ناقصة (" + blockers.length + ") — لا يمكن وضع جاهز</span>" +
        '<button type="button" id="tfReady" class="btn primary"' + (!canRdy ? " disabled" : "") + ">وضع علامة جاهز · Ready</button>" +
        '<button type="button" id="tfCancel" class="btn ghost">إلغاء الملف</button>';
    } else if (status === "ready") {
      stActions =
        '<button type="button" id="tfComplete" class="btn primary">إكمال الرحلة · Completed</button>' +
        '<button type="button" id="tfReady" class="btn ghost">إرجاع لمسودة</button>' +
        '<button type="button" id="tfCancel" class="btn ghost">إلغاء الملف</button>';
    } else if (status === "completed") {
      stActions = '<button type="button" id="tfReopen" class="btn ghost">إعادة فتح · Reopen</button>';
    } else { // cancelled
      stActions = '<button type="button" id="tfReopen" class="btn ghost">إعادة فتح · Reopen</button>';
    }
    var invoiceBtn = (status === "ready" || status === "completed") ? '<button type="button" id="tfInvoice" class="btn primary">🧾 توليد فاتورة المواصلات</button>' : "";
    var statusBar = '<div class="tf-status st-' + status + '">' +
      '<span class="st-pill">' + (STATUS_LABEL[status] || status) + "</span>" +
      '<div class="st-actions">' + stActions + invoiceBtn +
      '<button type="button" id="tfPrint" class="btn ghost">🖨️ طباعة · Print</button>' +
      '<button type="button" id="tfPdf" class="btn ghost">⬇️ PDF</button>' +
      '<button type="button" id="tfSave" class="btn save">حفظ · Save</button>' +
      '<span class="saved-tag" id="tfSaved"></span>' +
      "</div></div>";

    var typeBar = '<div class="tf-card tt-card"><div class="tt-row"><span class="tt-label">نوع المواصلات · Transport Type</span>' +
      '<div class="tt-toggle">' +
      '<button type="button" class="tt-btn' + (TT === "full_program" ? " on" : "") + '" data-tt="full_program">برنامج كامل · Full Program</button>' +
      '<button type="button" class="tt-btn' + (TT === "transport_only" ? " on" : "") + '" data-tt="transport_only">مواصلات فقط · Transport Only</button>' +
      "</div></div>" +
      '<p class="tt-hint">' + (TT === "full_program" ? "حركات مُولّدة تلقائياً من البرنامج المؤكّد." : "إدخال يدوي مبسّط لحركات المواصلات بدون برنامج.") + "</p></div>";

    var body, hotelsCard = "";
    if (TT === "full_program") {
      hotelsCard = hotels;
      body = regionCard + moves;
    } else {
      body = transportOnlyBuilder();
    }

    el("tfRoot").innerHTML =
      '<div class="tf-headline"><div><h1>ملف المواصلات · Transportation File</h1>' +
      '<p class="tf-sub">' + esc(FILE.booking_id) + " · " + (TT === "full_program" ? "برنامج كامل · Full Program" : "مواصلات فقط · Transport Only") + "</p></div>" +
      '<div class="tf-head-actions">' + (FROM_WORKLIST ? '<button type="button" id="tfBack" class="btn ghost sm">← القائمة</button>' : "") +
      '<span class="tf-statemini st-' + status + '">' + (STATUS_LABEL[status] || status).split(" · ")[0] + "</span></div></div>" +
      typeBar + statusBar + customer + hotelsCard + body + missing + reminders + changeLogCard();

    if (el("tfBack")) el("tfBack").addEventListener("click", function () { renderWorklist(); });

    // transport type toggle
    Array.prototype.forEach.call(document.querySelectorAll("[data-tt]"), function (btn) {
      btn.addEventListener("click", function () {
        FILE.transport_type = btn.getAttribute("data-tt");
        if (FILE.transport_type === "full_program") applyRegions();
        dirty = true; render(); setSaved("• غير محفوظ");
      });
    });
    // full_program: region driver fan-out
    Array.prototype.forEach.call(document.querySelectorAll(".reg-sel"), function (sel) {
      sel.addEventListener("change", function (e) {
        var reg = e.target.getAttribute("data-reg");
        var oldId = FILE.region_drivers[reg] || "";
        var oldName = (oldId && window.DriverRegistry && DriverRegistry.byId(oldId)) ? DriverRegistry.byId(oldId).driver_name : "—";
        var newName = (e.target.value && window.DriverRegistry && DriverRegistry.byId(e.target.value)) ? DriverRegistry.byId(e.target.value).driver_name : "—";
        FILE.region_drivers[reg] = e.target.value || "";
        applyRegions();
        if (oldId !== (e.target.value || "")) logChange("تغيير سائق المنطقة", (REGION_SHORT[reg] || reg) + ": " + oldName + " → " + newName);
        dirty = true; render(); setSaved("• غير محفوظ");
      });
    });
    Array.prototype.forEach.call(document.querySelectorAll("[data-override]"), function (btn) {
      btn.addEventListener("click", function () { OVR_OPEN[btn.getAttribute("data-override")] = true; render(); });
    });
    Array.prototype.forEach.call(document.querySelectorAll("[data-revert]"), function (btn) {
      btn.addEventListener("click", function () {
        var id = btn.getAttribute("data-revert"); OVR_OPEN[id] = false;
        var m = FILE.movements.filter(function (x) { return x.id === id; })[0];
        if (m) { m.override = false; applyRegions(); }
        dirty = true; render(); setSaved("• غير محفوظ");
      });
    });
    Array.prototype.forEach.call(document.querySelectorAll(".mv-driver"), function (sel) {
      sel.addEventListener("change", function (e) {
        var mid = e.target.getAttribute("data-mv");
        var m = FILE.movements.filter(function (x) { return x.id === mid; })[0]; if (!m) return;
        var oldName = m.driver_name || "—";
        if (!e.target.value) { m.override = false; OVR_OPEN[mid] = false; applyRegions(); }
        else { var d = window.DriverRegistry ? DriverRegistry.byId(e.target.value) : null; m.override = true; m.driver_id = d ? d.driver_id : ""; m.driver_name = d ? d.driver_name : ""; }
        if (oldName !== (m.driver_name || "—")) logChange("تخصيص سائق لحركة", oldName + " → " + (m.driver_name || "—"));
        dirty = true; render(); setSaved("• غير محفوظ");
      });
    });
    // transport_only: file-level fields — input updates model + gate only (never rebuilds the tree)
    Array.prototype.forEach.call(document.querySelectorAll("[data-ff]"), function (inp) {
      inp.addEventListener("input", function () {
        var f = inp.getAttribute("data-ff"), v = inp.value;
        if (f === "date_start") FILE.dates.start = v; else FILE[f] = v;
        dirty = true; setSaved("• غير محفوظ"); refreshGate();
      });
      inp.addEventListener("change", function () {
        if (inp.getAttribute("data-ff") === "customer_name" && inp.value !== inp.defaultValue) logChange("تغيير اسم العميل", inp.value || "—");
      });
    });
    // transport_only: per-movement TEXT edits — model + gate only; log time/flight changes on blur
    Array.prototype.forEach.call(document.querySelectorAll(".to-mv input[data-f]"), function (inp) {
      inp.addEventListener("input", function () {
        var row = inp.closest("[data-mv]"); var m = FILE.movements.filter(function (x) { return x.id === row.getAttribute("data-mv"); })[0];
        if (m) { m[inp.getAttribute("data-f")] = inp.value; dirty = true; setSaved("• غير محفوظ"); refreshGate(); }
      });
      inp.addEventListener("change", function () {
        var fld = inp.getAttribute("data-f");
        if ((fld === "time" || fld === "flight") && inp.value !== inp.defaultValue) {
          logChange(fld === "time" ? "تغيير وقت الحركة" : "تغيير رقم الرحلة", inp.value || "—");
        }
      });
    });
    // transport_only: movement TYPE select — structural change, full render
    Array.prototype.forEach.call(document.querySelectorAll('.to-mv select[data-f="type"]'), function (sel) {
      sel.addEventListener("change", function () {
        var row = sel.closest("[data-mv]"); var m = FILE.movements.filter(function (x) { return x.id === row.getAttribute("data-mv"); })[0];
        if (m) { m.type = sel.value; dirty = true; render(); setSaved("• غير محفوظ"); }
      });
    });
    // transport_only: per-movement driver
    Array.prototype.forEach.call(document.querySelectorAll(".to-driver"), function (sel) {
      sel.addEventListener("change", function () {
        var row = sel.closest("[data-mv]"); var m = FILE.movements.filter(function (x) { return x.id === row.getAttribute("data-mv"); })[0]; if (!m) return;
        var oldName = m.driver_name || "—";
        var d = (window.DriverRegistry && sel.value) ? DriverRegistry.byId(sel.value) : null;
        m.driver_id = d ? d.driver_id : ""; m.driver_name = d ? d.driver_name : "";
        if (oldName !== (m.driver_name || "—")) logChange("تخصيص سائق لحركة", oldName + " → " + (m.driver_name || "—"));
        dirty = true; render(); setSaved("• غير محفوظ");
      });
    });
    // transport_only: add / remove movement
    if (el("toAdd")) el("toAdd").addEventListener("click", function () {
      FILE.movements.push({ id: newMtId(), type: "airport_pickup", type_label: "", date: FILE.dates.start || "", time: "", city: "", from: "", to: "", flight: "", note: "", driver_id: "", driver_name: "", override: false });
      dirty = true; render(); setSaved("• غير محفوظ");
    });
    Array.prototype.forEach.call(document.querySelectorAll("[data-del]"), function (btn) {
      btn.addEventListener("click", function () {
        var id = btn.getAttribute("data-del");
        FILE.movements = FILE.movements.filter(function (x) { return x.id !== id; });
        dirty = true; render(); setSaved("• غير محفوظ");
      });
    });
    // add a new driver (data-only)
    if (el("ndAdd")) el("ndAdd").addEventListener("click", function () {
      var name = (el("ndName").value || "").trim(), phone = (el("ndPhone").value || "").trim();
      if (!name) { if (el("ndNote")) el("ndNote").textContent = "أدخل اسم السائق"; return; }
      if (!window.DriverRegistry) return;
      DriverRegistry.add({ driver_name: name, country: FILE.destination_id, phone: phone });
      render(); if (el("ndNote")) el("ndNote").textContent = "✓ أُضيف " + name;
    });
    if (el("tfSave")) el("tfSave").addEventListener("click", save);
    if (el("tfReady")) el("tfReady").addEventListener("click", toggleReady);
    if (el("tfComplete")) el("tfComplete").addEventListener("click", function () { setFileStatus("completed"); });
    if (el("tfReopen")) el("tfReopen").addEventListener("click", function () { setFileStatus("draft"); });
    if (el("tfCancel")) el("tfCancel").addEventListener("click", function () { setFileStatus("cancelled"); });
    if (el("tfPrint")) el("tfPrint").addEventListener("click", openPrint);
    if (el("tfPdf")) el("tfPdf").addEventListener("click", openPrint);
    if (el("tfInvoice")) el("tfInvoice").addEventListener("click", function () {
      if (dirty) save();   // ensure latest file is persisted before generating the invoice
      try { (window.parent && window.parent !== window ? window.parent : window).postMessage({ type: "open-transport-invoice", bookingId: BID, booking: BOOKING || { booking_id: BID } }, "*"); } catch (e) {}
    });
    setStatus("");
  }
  function changeLogCard() {
    var entries = (window.TransportationLogStore && BID) ? TransportationLogStore.list(BID).slice().reverse() : [];
    return '<div class="tf-card"><div class="tf-h">سجل التغييرات · Change Log <span class="muted">(' + entries.length + ")</span></div>" +
      (entries.length ? '<div class="log-list">' + entries.slice(0, 15).map(function (e) {
        var dt = ""; try { dt = new Date(e.at).toLocaleString("en-GB"); } catch (x) { dt = esc(e.at); }
        return '<div class="log-row"><span class="log-actor">' + esc(e.role || "—") + '</span><span class="log-act">' + esc(e.action) + (e.detail ? ": " + esc(e.detail) : "") + '</span><span class="log-at">' + dt + "</span></div>";
      }).join("") + "</div>" : '<p class="tf-empty">لا تغييرات بعد.</p>') + "</div>";
  }
  function kv(k, v) { return '<div class="kv"><span class="kk">' + k + '</span><span class="kv-v">' + v + "</span></div>"; }
  function dash() { return '<span class="warn">ناقص · Missing</span>'; }

  function save() {
    if (!FILE || !window.TransportationFileStore) return;
    FILE.open_items = readyBlockers();   // snapshot for the Missing board
    TransportationFileStore.save(BID, FILE); dirty = false; setSaved("✓ محفوظ · Saved");
  }
  var STATUS_LABEL = { draft: "مسودة · Draft", ready: "جاهز · Ready", completed: "مكتمل · Completed", cancelled: "ملغى · Cancelled" };
  function setFileStatus(s) {
    if (!FILE) return;
    var old = FILE.status;
    FILE.status = s;
    FILE.ready_to_send = (s === "ready" || s === "completed");
    if (old !== s) logChange("تغيير الحالة", (STATUS_LABEL[old] || old || "—").split(" · ")[0] + " → " + (STATUS_LABEL[s] || s).split(" · ")[0]);
    save(); render();
  }
  function toggleReady() {
    if (!FILE) return;
    if (FILE.status !== "ready" && FILE.status !== "completed") { if (readyBlockers().length) { setSaved("🔴 أكمل العناصر الناقصة قبل الإرسال"); return; } }
    setFileStatus(FILE.status === "ready" ? "draft" : "ready");
  }
  // ---- Print / Export PDF (A4 print view, browser save-as-PDF; no server, no template reuse) ----
  function printDocHTML() {
    var f = FILE;
    var destAr = f.destination || (f.destination_id === "thailand" ? "تايلاند" : f.destination_id === "maldives" ? "المالديف" : "إندونيسيا");
    var rows = (f.movements || []).map(function (m, i) {
      var tlabel = (window.TransportationSource && TransportationSource.TYPE_LABEL && TransportationSource.TYPE_LABEL[m.type]) || mtLabel(m.type) || m.type || "";
      var drv = m.driver_name ? (esc(m.driver_name) + (driverPhone(m) ? " · " + esc(driverPhone(m)) : "")) : "—";
      var route = (m.from || m.to) ? (esc(m.from || "—") + " ← " + esc(m.to || "—")) : "—";
      return "<tr><td>" + (i + 1) + "</td><td>" + esc(m.date || "—") + (m.time ? "<br>" + esc(m.time) : "") + "</td><td>" + esc(tlabel) +
        "</td><td>" + (esc(m.city) || "—") + "</td><td>" + route + "</td><td>" + (esc(m.flight) || esc(f.flight_no) || "—") + "</td><td>" + drv + "</td><td>" + (esc(m.note) || "") + "</td></tr>";
    }).join("");
    var hotels = (f.hotels || []).map(function (h) { return "<tr><td>" + esc(h.name || "—") + "</td><td>" + esc(h.check_in || "—") + " ← " + esc(h.check_out || "—") + "</td><td>" + (esc(h.address) || "—") + "</td></tr>"; }).join("");
    return '<!DOCTYPE html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><title>ملف المواصلات ' + esc(f.booking_id) + '</title><style>' +
      '@page{size:A4;margin:14mm}*{box-sizing:border-box}body{font-family:"Segoe UI",Tahoma,Arial,sans-serif;color:#16233a;margin:0}' +
      'h1{font-size:18pt;margin:0 0 2mm}.sub{color:#5b6b85;font-size:9pt;margin:0 0 4mm}' +
      '.badge{display:inline-block;border:1px solid #16233a;border-radius:4px;padding:1mm 3mm;font-size:9pt;font-weight:700}' +
      '.grid{display:grid;grid-template-columns:1fr 1fr;gap:1mm 6mm;margin:3mm 0 5mm;font-size:10pt}.grid div span{color:#5b6b85}' +
      'h2{font-size:11pt;border-bottom:1.5pt solid #16233a;padding-bottom:1mm;margin:5mm 0 2mm}' +
      'table{width:100%;border-collapse:collapse;font-size:8.5pt}th,td{border:0.5pt solid #b9c2d0;padding:1.5mm 2mm;text-align:right;vertical-align:top}th{background:#eef2f7}' +
      '.foot{margin-top:6mm;color:#5b6b85;font-size:8pt;border-top:0.5pt solid #b9c2d0;padding-top:2mm}</style></head><body>' +
      '<h1>ملف المواصلات · Transportation File</h1>' +
      '<p class="sub">' + esc(f.booking_id) + ' · ' + (f.transport_type === "full_program" ? "برنامج كامل · Full Program" : "مواصلات فقط · Transport Only") + ' · <span class="badge">' + (STATUS_LABEL[f.status] || f.status) + '</span></p>' +
      '<div class="grid">' +
      '<div><span>اسم العميل: </span><b>' + (esc(f.customer_name) || "—") + '</b></div>' +
      '<div><span>الجوال: </span>' + (esc(f.customer_phone) || "—") + '</div>' +
      '<div><span>الوجهة: </span>' + esc(destAr) + '</div>' +
      '<div><span>عدد المسافرين: </span>' + (esc(String(f.pax)) || "—") + '</div>' +
      '<div><span>التواريخ: </span>' + (esc(f.dates && f.dates.start) || "—") + " ← " + (esc(f.dates && f.dates.end) || "—") + '</div>' +
      '<div><span>رقم البرنامج: </span>' + (esc(f.program_no) || "—") + '</div>' +
      '<div><span>تصنيف العميل: </span>' + (f.vip ? '<b style="color:#a57c52">★ VIP</b>' : "عادي · Standard") + '</div>' +
      '</div>' +
      '<h2>حركات المواصلات · Movements</h2>' +
      '<table><thead><tr><th>#</th><th>التاريخ/الوقت</th><th>النوع</th><th>المدينة</th><th>من ← إلى</th><th>الرحلة</th><th>السائق</th><th>ملاحظات</th></tr></thead><tbody>' +
      (rows || '<tr><td colspan="8">لا توجد حركات</td></tr>') + '</tbody></table>' +
      (hotels ? '<h2>الفنادق · Hotels</h2><table><thead><tr><th>الفندق</th><th>التواريخ</th><th>العنوان</th></tr></thead><tbody>' + hotels + '</tbody></table>' : "") +
      '<p class="foot">سيزون ترافل · Season Travel — ملف عمليات المواصلات. تمت الطباعة: ' + new Date().toLocaleString("en-GB") + '</p>' +
      '</body></html>';
  }
  function openPrint() {
    if (!FILE) return;
    var html = printDocHTML();
    var w = null;
    try { w = window.open("", "_blank"); } catch (e) { w = null; }
    if (w && w.document) {
      w.document.open(); w.document.write(html); w.document.close();
      setTimeout(function () { try { w.focus(); w.print(); } catch (e) {} }, 350);
      return;
    }
    // fallback: blob url (popup blocked)
    try {
      var blob = new Blob([html], { type: "text/html" });
      var url = URL.createObjectURL(blob);
      var a = document.createElement("a"); a.href = url; a.target = "_blank"; a.rel = "noopener";
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      setSaved("↗ فُتحت نسخة الطباعة في تبويب جديد");
    } catch (e) { setSaved("تعذّر فتح نافذة الطباعة — اسمح بالنوافذ المنبثقة"); }
  }

  function onBooking(booking) {
    if (!booking) { showEmpty(); return; }
    OVR_OPEN = {};
    BOOKING = booking; BID = booking.booking_id || BID;
    if (window.TransportationFileStore && TransportationFileStore.exists(BID)) {
      FILE = TransportationFileStore.load(BID); normalizeMovements(); render(); setSaved("✓ محفوظ مسبقاً");
      return;
    }
    setStatus("…جارٍ توليد ملف المواصلات من حركات البرنامج");
    (window.TransportationSource ? TransportationSource.buildFile(booking) : Promise.resolve(null)).then(function (f) {
      FILE = f; if (!FILE) { showEmpty(); return; }
      normalizeMovements(); render(); setSaved("• غير محفوظ");
    });
  }
  function openFromWorklist(booking) { FROM_WORKLIST = true; onBooking(booking); }
  function wlStatus(bid) {
    if (window.TransportationFileStore && TransportationFileStore.exists(bid)) {
      var f = TransportationFileStore.load(bid) || {};
      return f.status || (f.ready_to_send ? "ready" : "draft");
    }
    return "none";
  }
  function wlDate(b) {
    if (window.TransportationFileStore && TransportationFileStore.exists(b.booking_id)) {
      var f = TransportationFileStore.load(b.booking_id) || {};
      if (f.dates && f.dates.start) return f.dates.start;
    }
    return b.check_in || "";
  }
  function isoToday() { var d = new Date(); return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); }
  function isoShift(n) { var d = new Date(); d.setDate(d.getDate() + n); return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); }
  function inDateRange(ds) {
    if (WL_DATE === "all") return true;
    if (!ds) return false;
    var t = isoToday();
    if (WL_DATE === "today") return ds === t;
    if (WL_DATE === "tomorrow") return ds === isoShift(1);
    if (WL_DATE === "week") return ds >= t && ds <= isoShift(6);
    if (WL_DATE === "month") return ds.slice(0, 7) === t.slice(0, 7);
    if (WL_DATE === "custom") return (!WL_FROM || ds >= WL_FROM) && (!WL_TO || ds <= WL_TO);
    return true;
  }
  var WL_BADGE = { draft: ["مسودة · Draft", "wl-draft"], ready: ["جاهز · Ready", "wl-ready"], completed: ["مكتمل · Completed", "wl-completed"], cancelled: ["ملغى · Cancelled", "wl-cancelled"], none: ["لم يُنشأ · Not created", "wl-none"] };
  function renderWorklist() {
    FILE = null; BOOKING = null; FROM_WORKLIST = false;
    var bookings = (window.CB_DATA && CB_DATA.bookings) ? CB_DATA.bookings.slice() : [];
    if (!bookings.length) { showEmpty(); return; }
    var rows = bookings.map(function (b) { return { b: b, bid: b.booking_id, status: wlStatus(b.booking_id), date: wlDate(b) }; });
    // date filter first, then status counts reflect the date-scoped set
    var dscoped = rows.filter(function (r) { return inDateRange(r.date); });
    var counts = { all: 0, draft: 0, ready: 0, completed: 0, cancelled: 0, none: 0 };
    dscoped.forEach(function (r) { counts[r.status]++; });
    counts.all = dscoped.length;
    var order = { draft: 0, ready: 1, none: 2, completed: 3, cancelled: 4 };
    dscoped.sort(function (a, b) { return (order[a.status] - order[b.status]) || String(a.date).localeCompare(String(b.date)) || String(a.bid).localeCompare(String(b.bid)); });
    var shown = dscoped.filter(function (r) { return WL_STATUS === "all" ? true : r.status === WL_STATUS; });

    function schip(key, label) { var n = key === "all" ? counts.all : counts[key]; return '<button type="button" class="wl-chip' + (WL_STATUS === key ? " on" : "") + '" data-wls="' + key + '">' + label + ' <span class="wl-chip-n">' + n + "</span></button>"; }
    function dchip(key, label) { return '<button type="button" class="wl-chip' + (WL_DATE === key ? " on" : "") + '" data-wld="' + key + '">' + label + "</button>"; }
    var list = shown.length ? '<div class="wl-list">' + shown.map(function (r) {
      var b = r.b, badge = WL_BADGE[r.status];
      var who = esc(b.guest_name || b.company_name || "—");
      var dest = b.destination === "thailand" ? "تايلاند" : b.destination === "indonesia" ? "إندونيسيا" : b.destination === "maldives" ? "المالديف" : esc(b.destination || "—");
      return '<button type="button" class="wl-row" data-wlbid="' + esc(r.bid) + '">' +
        '<span class="wl-bid">' + esc(r.bid) + "</span>" +
        '<span class="wl-who">' + who + "</span>" +
        '<span class="wl-date">' + (esc(r.date) || "—") + "</span>" +
        '<span class="wl-dest">' + dest + "</span>" +
        '<span class="wl-badge ' + badge[1] + '">' + badge[0] + "</span></button>";
    }).join("") + "</div>" : '<p class="tf-empty">لا عناصر في هذا التصنيف.</p>';

    var custom = WL_DATE === "custom" ? '<div class="wl-custom"><label>من <input type="date" id="wlFrom" value="' + esc(WL_FROM) + '"></label><label>إلى <input type="date" id="wlTo" value="' + esc(WL_TO) + '"></label></div>' : "";

    el("tfRoot").innerHTML =
      '<div class="tf-headline"><div><h1>ملفات المواصلات · Transportation Files</h1>' +
      '<p class="tf-sub">قائمة عمل · أرشيف دائم — صفِّ بالحالة والتاريخ</p></div></div>' +
      '<div class="tf-card wl-bar"><div class="wl-grp-l">الحالة</div>' +
      schip("all", "الكل") + schip("draft", "مسودة") + schip("ready", "جاهز") + schip("completed", "مكتمل") + schip("cancelled", "ملغى") + schip("none", "لم يُنشأ") +
      '</div>' +
      '<div class="tf-card wl-bar"><div class="wl-grp-l">التاريخ</div>' +
      dchip("all", "الكل") + dchip("today", "اليوم") + dchip("tomorrow", "غداً") + dchip("week", "هذا الأسبوع") + dchip("month", "هذا الشهر") + dchip("custom", "نطاق مخصص") +
      custom + '</div>' +
      '<div class="tf-card">' + list + "</div>";

    Array.prototype.forEach.call(document.querySelectorAll("[data-wls]"), function (c) {
      c.addEventListener("click", function () { WL_STATUS = c.getAttribute("data-wls"); renderWorklist(); });
    });
    Array.prototype.forEach.call(document.querySelectorAll("[data-wld]"), function (c) {
      c.addEventListener("click", function () { WL_DATE = c.getAttribute("data-wld"); renderWorklist(); });
    });
    if (el("wlFrom")) el("wlFrom").addEventListener("change", function () { WL_FROM = this.value; renderWorklist(); });
    if (el("wlTo")) el("wlTo").addEventListener("change", function () { WL_TO = this.value; renderWorklist(); });
    Array.prototype.forEach.call(document.querySelectorAll("[data-wlbid]"), function (rw) {
      rw.addEventListener("click", function () {
        var bid = rw.getAttribute("data-wlbid");
        var hit = bookings.filter(function (x) { return x.booking_id === bid; })[0];
        if (hit) openFromWorklist(hit);
      });
    });
    setStatus("");
  }
  function showEmpty() {
    el("tfRoot").innerHTML = '<div class="tf-headline"><h1>ملف المواصلات · Transportation File</h1></div>' +
      '<div class="tf-card"><p class="tf-empty">افتح هذا الملف من «الحجوزات المؤكّدة» عبر زر «إنشاء ملف المواصلات».</p></div>';
  }

  function requestBooking() {
    try { (window.parent && window.parent !== window ? window.parent : window).postMessage({ type: "request-booking" }, "*"); } catch (e) {}
  }
  function requestRole() {
    try { (window.parent && window.parent !== window ? window.parent : window).postMessage({ type: "request-role" }, "*"); } catch (e) {}
  }
  window.addEventListener("message", function (e) {
    var d = (e && e.data) || {};
    if (d.type === "load-booking") { if (d.role) CURRENT_ROLE = d.role; onBooking(d.booking || null); }
    else if (d.type === "role") { if (d.role) CURRENT_ROLE = d.role; }
  });

  document.addEventListener("DOMContentLoaded", function () {
    requestRole();
    BID = qp("bookingId");
    if (!BID) { renderWorklist(); return; }
    setStatus("…جارٍ تحميل الحجز");
    requestBooking();
    // fallback if no shell answers
    setTimeout(function () { if (!FILE && !BOOKING) showEmpty(); }, 2500);
  });
})();
