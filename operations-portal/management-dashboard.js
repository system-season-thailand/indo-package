/* =====================================================================
   management-dashboard.js
   ---------------------------------------------------------------------
   Reads window.MGMT_DATA (sample only). Computes every metric in the
   browser and renders the management view. No network, no backend.
   ===================================================================== */
(function () {
  "use strict";

  var DATA = window.MGMT_DATA;
  if (!DATA) { console.error("MGMT_DATA missing — load sample data first."); return; }

  var CUR = DATA.meta.currency;
  var AS_OF = parseDate(DATA.meta.asOf);

  // lookups
  var companyById = index(DATA.companies); // full lookup
  var staffById = index(DATA.staff); // full lookup
  var hotelById = index(DATA.hotels); // full lookup

  // palette (mirrors CSS tokens; used inside SVG)
  var C = {
    brass: "#c9a24b", brassSoft: "#e2c57e", jade: "#4fb3a0", jadeDeep: "#2e7d70",
    coral: "#d98e6a", danger: "#d9645a", muted: "#7e8c86", text2: "#b7c2bc",
    line: "rgba(240,235,224,0.10)", track: "rgba(240,235,224,0.06)"
  };
  var STATUS_META = {
    approved: { label: "مقبول", color: C.jade },
    sent: { label: "مُرسل", color: C.brass },
    draft: { label: "مسودة", color: C.muted },
    rejected: { label: "مرفوض", color: C.danger }
  };

  // shared state
  var state = {
    period: 30,                 // 'today'|'yesterday'|7|30|90|'month'|'custom'
    customFrom: null,           // 'YYYY-MM-DD' (used when period === 'custom')
    customTo: null,
    monthlyMetric: "count",     // 'count' | 'value'
    companyQuery: "",
    staffSort: { key: "count", dir: -1 },   // management default = activity (count), not value
    companySort: { key: "count", dir: -1 }, // management default = activity (count), not value
    destination: "all"          // 'all' | destination id (e.g. 'indonesia' | 'thailand')
  };

  /* =====================================================================
     FUTURE quotation-status tracking — ARCHITECTURE ONLY (Phase 7 §8)
     ---------------------------------------------------------------------
     Not implemented yet. When operations start tracking real outcomes,
     each quotation will carry one of these lifecycle statuses, and this
     will become the primary management KPI (conversion / loss reasons).
     To activate later: populate quotation.trackStatus from the source,
     then build KPIs off TRACK_STATUS. Nothing here renders today.
     ===================================================================== */
  var TRACK_STATUS = {
    confirmed: { id: "confirmed", label: "مؤكد" },
    lost:      { id: "lost",      label: "مفقود" },
    cancelled: { id: "cancelled", label: "ملغى" }
  };
  // (intentionally unused for now — kept ready for future integration)
  void TRACK_STATUS;

  // destination-filtered working view (recomputed by applyDestination)
  var QSET = DATA.quotations;     // active quotations for the selected destination
  var VCOMP = DATA.companies;     // companies active in the selected destination
  var VSTAFF = DATA.staff;        // staff active in the selected destination
  function applyDestination() {
    var d = state.destination;
    QSET = (d === "all") ? DATA.quotations
      : DATA.quotations.filter(function (q) { return q.destination === d; });
    var coIds = {}, stIds = {};
    QSET.forEach(function (q) { coIds[q.companyId] = 1; stIds[q.staffId] = 1; });
    VCOMP = DATA.companies.filter(function (c) { return coIds[c.id]; });
    VSTAFF = DATA.staff.filter(function (s) { return stIds[s.id]; });
  }

  /* =====================================================================
     طبقة الدخول والصلاحيات — Admin Access Layer (Phase 4)
     ACCESS CONTROL + prototype login gate
     ---------------------------------------------------------------------
     • هذه اللوحة مخصّصة للإدارة فقط (Management Only).
     • الأدوار:  admin · manager · sales
     • المسموح لهم بفتح اللوحة:  admin و manager فقط.  (sales ممنوع دائماً)
     • لا يوجد نظام مصادقة حقيقي ولا اتصال بقاعدة بيانات — بوّابة تجريبية فقط.

     ▸ نقطة الربط الوحيدة مستقبلاً مع نظام بندر =  ACCESS.getCurrentRole()
       يكفي لاحقاً أن تُعيد هذه الدالة دور المستخدم الحقيقي (admin/manager/sales)
       من نظام الدخول لدى بندر، وتُحذف البوّابة التجريبية أدناه. لا شيء آخر يتغيّر.
     ===================================================================== */

  /* ⚠️⚠️ كلمات مرور تجريبية للنموذج الأولي فقط — غير آمنة وموجودة في الواجهة.
         يجب حذفها واستبدالها بنظام الدخول الحقيقي عند الربط الفعلي.
         PROTOTYPE PASSWORDS ONLY — insecure, client-side. Replace on real integration. */
  var PROTOTYPE_PASSWORDS = {
    admin: "admin123",
    manager: "manager123",
    staff: "staff123"
  };

  /* تخزين الجلسة مؤقتاً (sessionStorage) مع تراجع آمن إلى الذاكرة إن مُنع التخزين */
  var SESSION = {
    KEY: "season_dashboard_role",
    _mem: null,
    get: function () { try { return sessionStorage.getItem(SESSION.KEY) || SESSION._mem; } catch (e) { return SESSION._mem; } },
    set: function (role) { SESSION._mem = role; try { sessionStorage.setItem(SESSION.KEY, role); } catch (e) {} },
    clear: function () { SESSION._mem = null; try { sessionStorage.removeItem(SESSION.KEY); } catch (e) {} }
  };

  /* يتحقّق من كلمة المرور حسب نوع الدخول ويُعيد الدور أو null.
     mode: "admin" (دخول الإدارة) | "staff" (دخول الموظفين) */
  function checkPrototypeLogin(mode, password) {
    if (mode === "staff") return password === PROTOTYPE_PASSWORDS.staff ? "staff" : null;
    if (password === PROTOTYPE_PASSWORDS.admin) return "admin";
    if (password === PROTOTYPE_PASSWORDS.manager) return "manager";
    return null;
  }

  var ACCESS = {
    // أسماء الأدوار الرسميّة (يجب أن تطابق ما يُستخدم في نظام بندر لاحقاً)
    ROLES: { ADMIN: "admin", MANAGER: "manager", SALES: "sales" },

    // الأدوار المسموح لها بعرض لوحة الإدارة (sales مستثنى دائماً)
    DASHBOARD_ROLES: ["admin", "manager"],

    // تسميات عربية للعرض فقط
    LABELS: { admin: "مدير النظام", manager: "مدير", sales: "مبيعات", staff: "موظف" },

    /* 🔌 نقطة الربط المستقبليّة الوحيدة — هنا فقط يُستبدل الكود لاحقاً.
       الآن (نموذج): الدور يأتي من جلسة بوّابة الدخول التجريبية (SESSION).
       لاحقاً (نظام بندر): أعِد دور المستخدم الحقيقي من جلسته، مثال:
           return bandarAuth.getCurrentUser()?.role;   // 'admin' | 'manager' | 'sales'
       ثم احذف PROTOTYPE_PASSWORDS وبوّابة الدخول. */
    getCurrentRole: function () {
      return SESSION.get();   // null إذا لم تُفتح جلسة بعد
    },

    canAccessDashboard: function (role) {
      return ACCESS.DASHBOARD_ROLES.indexOf(role) !== -1;
    },
    label: function (role) { return ACCESS.LABELS[role] || role || "—"; }
  };

  /* ---------- helpers ------------------------------------------------ */
  function index(arr) { var m = {}; arr.forEach(function (x) { m[x.id] = x; }); return m; }
  function parseDate(s) { return new Date(s + "T00:00:00"); }
  function dayKey(d) { return d.toISOString().slice(0, 10); }
  function addDays(d, n) { var x = new Date(d); x.setDate(x.getDate() + n); return x; }
  function daysAgo(s) { return Math.round((AS_OF - parseDate(s)) / 86400000); }
  function clamp01(x) { return Math.max(0, Math.min(1, x)); }

  function fmtInt(n) { return Math.round(n).toLocaleString("en-US"); }
  function fmtCompact(n) {
    var a = Math.abs(n);
    if (a >= 1e6) return trim(n / 1e6) + " مليون";
    if (a >= 1e3) return trim(n / 1e3) + " ألف";
    return fmtInt(n);
  }
  function trim(x) { var v = x >= 10 ? x.toFixed(0) : x.toFixed(1); return v.replace(/\.0$/, ""); }
  function money(n) { return fmtInt(n) + " " + CUR; }
  function moneyC(n) { return fmtCompact(n) + " " + CUR; }
  function pct(x) { return Math.round(x * 100) + "%"; }
  function el(id) { return document.getElementById(id); }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]; }); }

  var AR_DIGITS = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
  function arNum(n) { return String(n).split("").map(function (d) { return AR_DIGITS[+d] || d; }).join(""); }

  var MONTH_AR = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];
  function monthLabel(key) { var p = key.split("-"); return MONTH_AR[+p[1] - 1] + " " + p[0]; }
  var DOW_AR = ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];

  /* ---------- date windows ------------------------------------------ */
  function currentWindow() {
    var p = state.period;
    if (p === "today") return { from: AS_OF, to: AS_OF, days: 1, label: "اليوم" };
    if (p === "yesterday") { var y = addDays(AS_OF, -1); return { from: y, to: y, days: 1, label: "أمس" }; }
    if (p === "month") {
      var first = new Date(AS_OF.getFullYear(), AS_OF.getMonth(), 1);
      return { from: first, to: AS_OF, days: Math.round((AS_OF - first) / 86400000) + 1, label: "هذا الشهر" };
    }
    if (p === "custom") {
      var f = state.customFrom ? parseDate(state.customFrom) : addDays(AS_OF, -29);
      var t = state.customTo ? parseDate(state.customTo) : AS_OF;
      if (f > t) { var tmp = f; f = t; t = tmp; }
      return { from: f, to: t, days: Math.round((t - f) / 86400000) + 1, label: "نطاق مخصّص", custom: true };
    }
    var n = +p;   // numeric days (7 / 30 / 90)
    return { from: addDays(AS_OF, -(n - 1)), to: AS_OF, days: n, label: "آخر " + n + " يوم" };
  }
  function inRange(q, w) { var d = parseDate(q.date); return d >= w.from && d <= w.to; }
  function quotesIn(w) { return QSET.filter(function (q) { return inRange(q, w); }); }

  /* ---------- SVG chart helpers ------------------------------------- */
  function svgEl(node) { var w = document.createElement("div"); w.innerHTML = node.trim(); return w.firstChild; }

  // vertical bars across a time/category axis
  function barChartV(target, items, opts) {
    opts = opts || {};
    var W = 760, H = 220, padB = 34, padT = 14, padX = 6;
    var n = items.length || 1;
    var max = Math.max.apply(null, items.map(function (i) { return i.value; }).concat([1]));
    var gap = n > 40 ? 1 : n > 16 ? 2 : 4;
    var bw = (W - padX * 2 - gap * (n - 1)) / n;
    var plotH = H - padB - padT;
    var bars = "", labels = "";
    var labelEvery = Math.ceil(n / 8);
    items.forEach(function (it, i) {
      var h = Math.max(1, (it.value / max) * plotH);
      var x = padX + i * (bw + gap);
      var y = padT + (plotH - h);
      bars += '<rect x="' + x.toFixed(1) + '" y="' + y.toFixed(1) + '" width="' + bw.toFixed(1) +
        '" height="' + h.toFixed(1) + '" rx="' + Math.min(3, bw / 2).toFixed(1) +
        '" fill="url(#barGrad)"><title>' + esc(it.full || it.label) + ": " +
        esc(opts.format ? opts.format(it.value) : fmtInt(it.value)) + "</title></rect>";
      if (it.mark) bars += '<rect x="' + x.toFixed(1) + '" y="' + (padT - 0) + '" width="' + bw.toFixed(1) + '" height="' + plotH + '" fill="rgba(201,162,75,0.06)" />';
      if (i % labelEvery === 0 || i === n - 1) {
        labels += '<text x="' + (x + bw / 2).toFixed(1) + '" y="' + (H - 12) + '" text-anchor="middle" class="ax">' + esc(it.tick || it.label) + "</text>";
      }
    });
    var grid = "";
    for (var g = 1; g <= 3; g++) {
      var gy = padT + plotH - (plotH * g / 4);
      grid += '<line x1="' + padX + '" x2="' + (W - padX) + '" y1="' + gy.toFixed(1) + '" y2="' + gy.toFixed(1) + '" class="grid" />';
    }
    target.innerHTML = "";
    target.appendChild(svgEl(
      '<svg viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="none" class="chart-svg" role="img">' +
      '<defs><linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">' +
      '<stop offset="0" stop-color="' + C.brassSoft + '"/><stop offset="1" stop-color="' + C.brass + '" stop-opacity="0.65"/>' +
      "</linearGradient></defs>" + grid + bars + labels + "</svg>"
    ));
  }

  // horizontal ranked bars
  function rankBars(target, items, opts) {
    opts = opts || {};
    var max = Math.max.apply(null, items.map(function (i) { return i.value; }).concat([1]));
    var color = opts.color || C.brass;
    var html = '<div class="rank">';
    var idAttr = opts.idAttr || "data-co";
    items.forEach(function (it, i) {
      var w = (it.value / max) * 100;
      var co = it.id ? " " + idAttr + '="' + esc(it.id) + '" role="button" tabindex="0"' : "";
      html += '<div class="rank-row' + (it.id ? " clickable" : "") + '"' + co + '>' +
        '<div class="rank-head"><span class="rank-name"><b class="rank-i">' + arNum(i + 1) + "</b>" + esc(it.label) +
        (it.sub ? '<span class="rank-sub">' + esc(it.sub) + "</span>" : "") + "</span>" +
        '<span class="rank-val">' + esc(opts.format ? opts.format(it.value) : fmtInt(it.value)) + "</span></div>" +
        '<div class="rank-track"><span class="rank-fill" style="width:' + w.toFixed(1) + "%;background:" + color + '"></span></div>' +
        "</div>";
    });
    target.innerHTML = html + "</div>";
  }

  // donut with legend
  function donut(target, items) {
    var total = items.reduce(function (s, i) { return s + i.value; }, 0) || 1;
    var R = 54, sw = 18, cx = 70, cy = 70, circ = 2 * Math.PI * R;
    var off = 0, segs = "";
    items.forEach(function (it) {
      var frac = it.value / total;
      var len = frac * circ;
      segs += '<circle cx="' + cx + '" cy="' + cy + '" r="' + R + '" fill="none" stroke="' + it.color +
        '" stroke-width="' + sw + '" stroke-dasharray="' + len.toFixed(2) + " " + (circ - len).toFixed(2) +
        '" stroke-dashoffset="' + (-off).toFixed(2) + '" transform="rotate(-90 ' + cx + " " + cy + ')"><title>' +
        esc(it.label) + ": " + fmtInt(it.value) + " (" + pct(frac) + ")</title></circle>";
      off += len;
    });
    var legend = items.map(function (it) {
      return '<li><span class="dot" style="background:' + it.color + '"></span>' + esc(it.label) +
        '<b>' + fmtInt(it.value) + "</b><i>" + pct(it.value / total) + "</i></li>";
    }).join("");
    target.innerHTML =
      '<div class="donut-wrap"><svg viewBox="0 0 140 140" class="donut">' +
      '<circle cx="70" cy="70" r="54" fill="none" stroke="' + C.track + '" stroke-width="18"/>' + segs +
      '<text x="70" y="64" text-anchor="middle" class="donut-num">' + fmtInt(total) + "</text>" +
      '<text x="70" y="84" text-anchor="middle" class="donut-cap">إجمالي العروض</text></svg>' +
      '<ul class="legend">' + legend + "</ul></div>";
  }

  function sparkline(target, values, color) {
    var W = 220, H = 46, max = Math.max.apply(null, values.concat([1])), min = Math.min.apply(null, values);
    var span = max - min || 1, n = values.length;
    var pts = values.map(function (v, i) {
      var x = (i / (n - 1)) * W;
      var y = H - 4 - ((v - min) / span) * (H - 10);
      return x.toFixed(1) + "," + y.toFixed(1);
    });
    var area = "0," + H + " " + pts.join(" ") + " " + W + "," + H;
    target.innerHTML =
      '<svg viewBox="0 0 ' + W + " " + H + '" preserveAspectRatio="none" class="spark">' +
      '<defs><linearGradient id="spkG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + (color || C.brass) +
      '" stop-opacity="0.32"/><stop offset="1" stop-color="' + (color || C.brass) + '" stop-opacity="0"/></linearGradient></defs>' +
      '<polygon points="' + area + '" fill="url(#spkG)"/>' +
      '<polyline points="' + pts.join(" ") + '" fill="none" stroke="' + (color || C.brass) + '" stroke-width="2" stroke-linejoin="round"/></svg>';
  }

  /* ---------- aggregation -------------------------------------------- */
  function sum(arr, f) { return arr.reduce(function (s, x) { return s + f(x); }, 0); }
  function groupCount(arr, key) {
    var m = {}; arr.forEach(function (x) { var k = key(x); m[k] = (m[k] || 0) + 1; }); return m;
  }

  function lastActivity(companyId) {
    var last = null;
    for (var i = 0; i < QSET.length; i++) {
      var q = QSET[i];
      if (q.companyId === companyId) { if (!last || q.date > last) last = q.date; }
    }
    return last;
  }

  function companyStats(companyId, w) {
    var qs = QSET.filter(function (q) { return q.companyId === companyId && (!w || inRange(q, w)); });
    var approved = qs.filter(function (q) { return q.status === "approved"; }).length;
    var approvedVal = sum(qs.filter(function (q) { return q.status === "approved"; }), function (q) { return q.value; });
    return { count: qs.length, value: sum(qs, function (q) { return q.value; }), approved: approved, approvedVal: approvedVal };
  }

  function win(a, b) { return { from: addDays(AS_OF, a), to: addDays(AS_OF, b) }; }

  // distinct months that have any quote for this company
  function monthsActiveCount(companyId) {
    var m = {};
    QSET.forEach(function (q) { if (q.companyId === companyId) m[q.date.slice(0, 7)] = 1; });
    return Object.keys(m).length;
  }

  // the company's single best historical month (by value)
  function bestMonthFor(companyId) {
    var m = {};
    QSET.forEach(function (q) {
      if (q.companyId !== companyId) return;
      var k = q.date.slice(0, 7);
      if (!m[k]) m[k] = { key: k, count: 0, value: 0 };
      m[k].count++; m[k].value += q.value;
    });
    var best = null;
    Object.keys(m).forEach(function (k) { if (!best || m[k].value > best.value) best = m[k]; });
    return best;
  }

  // staff member who handled the most quotes for a company (the account owner)
  function responsibleStaff(companyId) {
    var c = {}; var bestId = null, bestN = -1;
    QSET.forEach(function (q) { if (q.companyId === companyId) c[q.staffId] = (c[q.staffId] || 0) + 1; });
    Object.keys(c).forEach(function (s) { if (c[s] > bestN) { bestN = c[s]; bestId = s; } });
    return bestId ? { id: bestId, name: (staffById[bestId] || {}).name || bestId, handled: bestN } : null;
  }

  /* ---------- Company Health Score ----------------------------------- *
     Five tiers derived from four signals the brief asks for:
       • volume   — lifetime number of quotations
       • value    — lifetime quotation value
       • recency  — days since last activity
       • momentum — last 30 days vs the company's own normal run-rate
     Recency/decline produce the two warning tiers (At Risk, Lost); the
     remaining active clients are ranked into Platinum / Gold / Silver by a
     cohort-relative composite score so the bands adapt to the dataset.   */
  var HEALTH_TIERS = {
    platinum: { label: "بلاتيني", rank: 5, cls: "h-plat", color: "#c7d2da" },
    gold: { label: "ذهبي", rank: 4, cls: "h-gold", color: "#c9a24b" },
    silver: { label: "فضي", rank: 3, cls: "h-silver", color: "#93a59d" },
    risk: { label: "في خطر", rank: 2, cls: "h-risk", color: "#d9a441" },
    lost: { label: "مفقود", rank: 1, cls: "h-lost", color: "#d9645a" }
  };
  var TIER_ORDER = ["platinum", "gold", "silver", "risk", "lost"];

  var HEALTH = [];        // array of health records, sorted best→worst
  var HEALTH_BY_ID = {};  // id → record

  function computeHealth() {
    var recs = VCOMP.map(function (c) {
      var all = companyStats(c.id, null);
      var la = lastActivity(c.id);
      var gap = la ? daysAgo(la) : 99999;
      var r30 = companyStats(c.id, win(-29, 0));
      var p30 = companyStats(c.id, win(-59, -30));
      var monthsAct = monthsActiveCount(c.id) || 1;
      var baseMonthly = all.count / monthsAct;                 // own normal monthly volume
      var declineVsBase = baseMonthly > 0 ? r30.count / baseMonthly : 1;
      var momentum = p30.count > 0 ? (r30.count - p30.count) / p30.count : (r30.count > 0 ? 1 : 0);
      return {
        c: c, all: all, la: la, gap: gap, r30: r30, p30: p30,
        age: daysAgo(c.created), monthsAct: monthsAct, baseMonthly: baseMonthly,
        declineVsBase: declineVsBase, momentum: momentum,
        rate: all.count ? all.approved / all.count : 0,
        best: bestMonthFor(c.id), staff: responsibleStaff(c.id)
      };
    });

    // cohort norms across companies that have any history
    var withData = recs.filter(function (r) { return r.all.count > 0; });
    var maxVal = Math.max.apply(null, withData.map(function (r) { return r.all.value; }).concat([1]));
    var maxCnt = Math.max.apply(null, withData.map(function (r) { return r.all.count; }).concat([1]));
    // median lifetime count (used as an activity floor for top tiers / key accounts)
    var cntsSorted = withData.map(function (r) { return r.all.count; }).sort(function (a, b) { return a - b; });
    var medianCnt = cntsSorted.length ? cntsSorted[Math.floor(cntsSorted.length / 2)] : 0;
    // "key account" line — TIGHTENED: top 20% by value AND above-median activity
    var sortedVal = withData.map(function (r) { return r.all.value; }).sort(function (a, b) { return b - a; });
    var keyCut = sortedVal[Math.max(0, Math.ceil(sortedVal.length * 0.2) - 1)] || 0;

    recs.forEach(function (r) {
      // key account now requires BOTH high value AND real volume (not value alone)
      r.keyAccount = r.all.value > 0 && r.all.value >= keyCut && r.all.count >= medianCnt;
      // potential tier on lifetime strength alone (ignoring recency) — for "was strong, now slipping"
      var lifeComposite = 0.50 * (r.all.value / maxVal) + 0.35 * (r.all.count / maxCnt) + 0.15 * r.rate;
      r.pastTier = lifeComposite >= 0.62 ? "platinum" : lifeComposite >= 0.42 ? "gold" : "silver";

      if (r.all.count === 0) { r.tier = "silver"; r.score = 0; return; }
      // collapsing = running far below the company's own established norm
      var collapsing = r.baseMonthly >= 5 && r.declineVsBase < 0.5;
      if (r.gap > 60) { r.tier = "lost"; r.score = 0; return; }
      if (r.gap > 30 || collapsing) { r.tier = "risk"; r.score = 0.30; return; }

      // active clients → cohort-relative composite.
      // Management wants ACTIVITY weighted, not value alone → volume + momentum carry more.
      var valueScore = r.all.value / maxVal;
      var volumeScore = r.all.count / maxCnt;
      var approvalScore = r.rate;
      var momentumScore = clamp01(0.5 + r.momentum / 2);
      var composite = 0.30 * valueScore + 0.34 * volumeScore + 0.18 * approvalScore + 0.18 * momentumScore;
      r.score = composite;
      // TIGHTENED tiers:
      // Platinum = established (>60d), genuinely high composite, real volume AND good approval.
      if (composite >= 0.68 && r.age > 60 && volumeScore >= 0.45 && approvalScore >= 0.50) r.tier = "platinum";
      else if (composite >= 0.48 && volumeScore >= 0.22) r.tier = "gold";
      else r.tier = "silver";
    });

    recs.sort(function (a, b) {
      var d = HEALTH_TIERS[b.tier].rank - HEALTH_TIERS[a.tier].rank;
      return d !== 0 ? d : b.all.value - a.all.value;
    });
    HEALTH = recs;
    HEALTH_BY_ID = {};
    recs.forEach(function (r) { HEALTH_BY_ID[r.c.id] = r; });
    return recs;
  }
  function tierBadge(tier) {
    var t = HEALTH_TIERS[tier];
    return '<span class="hbadge ' + t.cls + '">' + t.label + "</span>";
  }
  function trendTag(m) {
    if (Math.abs(m) < 0.04) return '<span class="trend flat">— ثابت</span>';
    var up = m > 0;
    return '<span class="trend ' + (up ? "up" : "down") + '">' + (up ? "▲" : "▼") + " " + pct(Math.abs(m)) + "</span>";
  }

  /* ---------- renderers ---------------------------------------------- */
  function renderOverview() {
    var w = currentWindow();
    var qs = quotesIn(w);
    var today = QSET.filter(function (q) { return q.date === DATA.meta.asOf; });

    // this month vs last month
    var mKey = DATA.meta.asOf.slice(0, 7);
    var lastM = new Date(AS_OF.getFullYear(), AS_OF.getMonth() - 1, 1);
    var lastKey = dayKey(lastM).slice(0, 7);
    var thisMonth = QSET.filter(function (q) { return q.date.slice(0, 7) === mKey; });
    var prevMonth = QSET.filter(function (q) { return q.date.slice(0, 7) === lastKey; });
    var delta = prevMonth.length ? (thisMonth.length - prevMonth.length) / prevMonth.length : 0;

    var totalVal = sum(qs, function (q) { return q.value; });
    var avgVal = qs.length ? totalVal / qs.length : 0;
    var approved = qs.filter(function (q) { return q.status === "approved"; }).length;
    var approvalRate = qs.length ? approved / qs.length : 0;

    // active companies in last 30 days (fixed window)
    var w30 = { from: addDays(AS_OF, -29), to: AS_OF };
    var active = {};
    QSET.forEach(function (q) { if (inRange(q, w30)) active[q.companyId] = 1; });

    // daily sparkline (last 30 days)
    var spark = dailySeries({ from: addDays(AS_OF, -29), to: AS_OF, days: 30 }).map(function (d) { return d.value; });

    // ---- headline management snapshot (always-on) ----
    var lostCount = HEALTH.filter(function (r) { return r.tier === "lost"; }).length;
    var activeCount = Object.keys(active).length;
    var estRevenue = sum(thisMonth.filter(function (q) { return q.status === "approved"; }), function (q) { return q.value; });
    var estRevenueAll = sum(QSET.filter(function (q) { return q.status === "approved"; }), function (q) { return q.value; });
    // best employee by approved value (lifetime)
    var staffVal = {};
    QSET.forEach(function (q) {
      if (q.status !== "approved") return;
      staffVal[q.staffId] = (staffVal[q.staffId] || 0) + q.value;
    });
    var bestEmpId = null, bestEmpVal = -1;
    Object.keys(staffVal).forEach(function (s) { if (staffVal[s] > bestEmpVal) { bestEmpVal = staffVal[s]; bestEmpId = s; } });
    var bestEmpName = bestEmpId ? (staffById[bestEmpId] || {}).name : "—";

    var dUp = delta >= 0;
    var headline = [
      { k: "عروض اليوم", v: fmtInt(today.length), s: DOW_AR[AS_OF.getDay()] + " · " + arNum(DATA.meta.asOf.slice(8)) + "/" + arNum(+DATA.meta.asOf.slice(5, 7)) },
      { k: "عروض هذا الشهر", v: fmtInt(thisMonth.length), s: '<span class="' + (dUp ? "up" : "down") + '">' + (dUp ? "▲" : "▼") + " " + pct(Math.abs(delta)) + "</span> مقارنةً بالشهر السابق", raw: true },
      { k: "الشركات النشطة", v: fmtInt(activeCount), s: "نشطة آخر ٣٠ يوم · من " + arNum(VCOMP.length) },
      { k: "الشركات المفقودة", v: fmtInt(lostCount), s: "منقطعة أكثر من ٦٠ يوماً", tone: lostCount > 0 ? "bad" : "ok" },
      { k: "الإيرادات التقديرية", v: moneyC(estRevenue), s: "مقبولة هذا الشهر · " + moneyC(estRevenueAll) + " تراكمياً" },
      { k: "أفضل موظف", v: bestEmpName, s: moneyC(bestEmpVal) + " قيمة مقبولة", name: true }
    ];
    el("headlineKpis").innerHTML = headline.map(function (c) {
      return '<div class="kpi card reveal' + (c.tone ? " tone-" + c.tone : "") + (c.name ? " kpi--name" : "") + '">' +
        '<div class="kpi-k">' + esc(c.k) + "</div>" +
        '<div class="kpi-v">' + esc(c.v) + "</div>" +
        '<div class="kpi-s">' + (c.raw ? c.s : esc(c.s)) + "</div></div>";
    }).join("");

    // ---- period-scoped detail KPIs ----
    var kpis = [
      { k: "عروض هذه الفترة", v: fmtInt(qs.length), s: w.label },
      { k: "متوسط قيمة العرض", v: moneyC(avgVal), s: w.label },
      { k: "إجمالي القيمة", v: moneyC(totalVal), s: w.label },
      { k: "معدل القبول", v: pct(approvalRate), s: w.label }
    ];

    el("kpiGrid").innerHTML = kpis.map(function (c) {
      return '<div class="kpi card reveal"><div class="kpi-k">' + esc(c.k) + "</div>" +
        '<div class="kpi-v">' + esc(c.v) + "</div>" +
        '<div class="kpi-s">' + esc(c.s) + (c.q ? ' · <span class="kpi-q">' + esc(c.q) + "</span>" : "") + "</div></div>";
    }).join("");

    // feature card (this month + delta + sparkline)
    var up = delta >= 0;
    el("monthFeature").innerHTML =
      '<div class="feat-top"><span class="eyebrow-min">نبض هذا الشهر</span>' +
      '<span class="delta ' + (up ? "up" : "down") + '">' + (up ? "▲" : "▼") + " " + pct(Math.abs(delta)) +
      ' <i>مقارنةً بـ' + monthLabel(lastKey).split(" ")[0] + "</i></span></div>" +
      '<div class="feat-num">' + fmtInt(thisMonth.length) + '<span>عرض سعر</span></div>' +
      '<div class="feat-val">' + moneyC(sum(thisMonth, function (q) { return q.value; })) + " · " + monthLabel(mKey) + "</div>" +
      '<div id="featSpark" class="feat-spark"></div>';
    sparkline(el("featSpark"), spark, C.brass);

    // status donut (this period)
    var sc = groupCount(qs, function (q) { return q.status; });
    var donutItems = ["approved", "sent", "draft", "rejected"].map(function (k) {
      return { label: STATUS_META[k].label, value: sc[k] || 0, color: STATUS_META[k].color };
    });
    donut(el("statusDonut"), donutItems);
  }

  function dailySeries(w) {
    var byDay = groupCount(quotesIn(w), function (q) { return q.date; });
    var out = [], cur = new Date(w.from);
    for (var i = 0; i < w.days; i++) {
      var key = dayKey(cur);
      out.push({
        key: key, value: byDay[key] || 0,
        label: arNum(cur.getDate()),
        tick: arNum(cur.getDate()) + "/" + arNum(cur.getMonth() + 1),
        full: DOW_AR[cur.getDay()] + " " + key
      });
      cur = addDays(cur, 1);
    }
    return out;
  }

  function renderDaily() {
    var w = currentWindow();
    var series = dailySeries(w);
    barChartV(el("dailyChart"), series, { format: fmtInt });
    var vals = series.map(function (d) { return d.value; });
    var total = vals.reduce(function (a, b) { return a + b; }, 0);
    var avg = total / (vals.length || 1);
    var peak = series.reduce(function (m, d) { return d.value > m.value ? d : m; }, series[0] || { value: 0 });
    el("dailyStats").innerHTML =
      stat("المتوسط اليومي", fmtInt(avg) + " عرض") +
      stat("أعلى يوم", fmtInt(peak.value) + " عرض", peak.full) +
      stat("إجمالي الفترة", fmtInt(total) + " عرض", w.label);
  }
  function stat(k, v, s) {
    return '<div class="mini"><span class="mini-k">' + esc(k) + '</span><span class="mini-v">' + esc(v) + "</span>" +
      (s ? '<span class="mini-s">' + esc(s) + "</span>" : "") + "</div>";
  }

  function monthlySeries() {
    var months = [];
    var start = parseDate(DATA.meta.rangeStart);
    var cur = new Date(start.getFullYear(), start.getMonth(), 1);
    var endKey = DATA.meta.asOf.slice(0, 7);
    while (true) {
      var key = dayKey(cur).slice(0, 7);
      var qs = QSET.filter(function (q) { return q.date.slice(0, 7) === key; });
      months.push({ key: key, count: qs.length, value: sum(qs, function (q) { return q.value; }), partial: key === endKey });
      if (key === endKey) break;
      cur = new Date(cur.getFullYear(), cur.getMonth() + 1, 1);
    }
    return months;
  }

  function renderMonthly() {
    var months = monthlySeries();
    var metric = state.monthlyMetric;
    var items = months.map(function (m) {
      return {
        value: metric === "count" ? m.count : m.value,
        tick: MONTH_AR[(+m.key.split("-")[1]) - 1].slice(0, 4) + (m.partial ? "*" : ""),
        label: monthLabel(m.key),
        full: monthLabel(m.key) + (m.partial ? " (حتى تاريخه)" : ""),
        mark: m.partial
      };
    });
    barChartV(el("monthlyChart"), items, { format: metric === "count" ? fmtInt : moneyC });

    var n = months.length;
    var cur = months[n - 1], prev = months[n - 2] || cur;
    var curV = metric === "count" ? cur.count : cur.value;
    var prevV = metric === "count" ? prev.count : prev.value;
    var d = prevV ? (curV - prevV) / prevV : 0;
    el("monthlyNote").innerHTML =
      '<span class="note-dim">* ' + monthLabel(cur.key) + " حتى تاريخه فقط.</span> " +
      "الشهر الحالي " + (d >= 0 ? "أعلى" : "أقل") + " بنسبة <b>" + pct(Math.abs(d)) +
      "</b> من " + monthLabel(prev.key) + ".";
  }

  function renderCompanies() {
    var w = currentWindow();
    var q = state.companyQuery.trim();
    function match(c) { return !q || c.name.indexOf(q) !== -1; }

    // Best companies — management default = activity (count); sortable by count/value/avg
    var bestRows = VCOMP.map(function (c) {
      var st = companyStats(c.id, w);
      return { c: c, count: st.count, value: st.value, avg: st.count ? st.value / st.count : 0, approved: st.approved };
    }).filter(function (r) { return r.count > 0 && match(r.c); });
    var ck = state.companySort.key, cdir = state.companySort.dir;
    bestRows.sort(function (a, b) { return (a[ck] - b[ck]) * cdir; });
    var best = bestRows.slice(0, 8);

    var cHeads = [
      { t: "#", k: null }, { t: "الشركة", k: null }, { t: "العروض", k: "count" },
      { t: "القيمة", k: "value" }, { t: "المتوسط", k: "avg" }, { t: "القبول", k: null }
    ];
    var cThead = "<tr>" + cHeads.map(function (h) {
      if (!h.k) return "<th>" + h.t + "</th>";
      var on = ck === h.k;
      return '<th class="sortable' + (on ? " on" : "") + '" data-csort="' + h.k + '">' + h.t +
        '<i class="sort-ar">' + (on ? (cdir < 0 ? "▼" : "▲") : "↕") + "</i></th>";
    }).join("") + "</tr>";
    var cBody = best.map(function (r, i) {
      return '<tr data-co="' + esc(r.c.id) + '" class="clickable">' +
        '<td><b class="ri">' + arNum(i + 1) + "</b></td>" +
        '<td class="name">' + esc(r.c.name) + "</td>" +
        "<td>" + fmtInt(r.count) + "</td>" +
        "<td>" + moneyC(r.value) + "</td>" +
        "<td>" + moneyC(r.avg) + "</td>" +
        "<td>" + chip(pct(r.count ? r.approved / r.count : 0), "ok") + "</td></tr>";
    }).join("");
    el("bestCompanies").innerHTML = best.length
      ? '<div class="table-scroll"><table class="tbl"><thead>' + cThead + "</thead><tbody>" + cBody + "</tbody></table></div>"
      : empty("لا توجد شركات نشطة ضمن هذه الفترة.");

    // At-risk: disappeared (>45d silent) or sharp recent drop
    var w30 = { from: addDays(AS_OF, -29), to: AS_OF };
    var wPrev = { from: addDays(AS_OF, -59), to: addDays(AS_OF, -30) };
    var atRisk = [];
    VCOMP.forEach(function (c) {
      if (!match(c)) return;
      var la = lastActivity(c.id);
      if (!la) return;
      var gap = daysAgo(la);
      var recent = companyStats(c.id, w30).count;
      var before = companyStats(c.id, wPrev).count;
      var allTime = companyStats(c.id, null).count;
      if (gap > 45) {
        atRisk.push({ c: c, gap: gap, status: "اختفت", sev: "bad", note: "آخر نشاط قبل " + arNum(gap) + " يوم", hist: allTime });
      } else if (before >= 8 && recent < before * 0.4) {
        atRisk.push({ c: c, gap: gap, status: "نشاط منخفض", sev: "warn", note: "هبط من " + arNum(before) + " إلى " + arNum(recent) + " عرض", hist: allTime });
      }
    });
    atRisk.sort(function (a, b) { return b.gap - a.gap; });
    el("atRiskCompanies").innerHTML = atRisk.length ? tableHTML(
      ["الشركة", "الحالة", "التفاصيل", "إجمالي سابق"],
      atRisk.map(function (r) {
        return [esc(r.c.name), chip(r.status, r.sev), esc(r.note), fmtInt(r.hist) + " عرض"];
      }),
      atRisk.map(function (r) { return 'data-co="' + r.c.id + '" class="clickable"'; })
    ) : empty("لا توجد شركات متعثرة مطابقة.");

    // New-company growth KPIs (this month + last 90 days)
    var mFirst = new Date(AS_OF.getFullYear(), AS_OF.getMonth(), 1);
    var d90 = addDays(AS_OF, -89);
    var newMonth = VCOMP.filter(function (c) { return parseDate(c.created) >= mFirst; }).length;
    var new90 = VCOMP.filter(function (c) { return parseDate(c.created) >= d90; }).length;
    var nk = el("newCompanyStats");
    if (nk) nk.innerHTML =
      '<div class="newco-kpi"><span class="nk-v">' + arNum(newMonth) + '</span><span class="nk-k">جديدة هذا الشهر</span></div>' +
      '<div class="newco-kpi"><span class="nk-v">' + arNum(new90) + '</span><span class="nk-k">جديدة آخر ٩٠ يوم</span></div>';

    // New active companies (created within 60 days + have quotes)
    var news = VCOMP.map(function (c) {
      return { c: c, age: daysAgo(c.created), st: companyStats(c.id, null) };
    }).filter(function (r) { return r.age <= 60 && r.st.count > 0 && match(r.c); })
      .sort(function (a, b) { return b.st.value - a.st.value; });

    el("newCompanies").innerHTML = news.length ? tableHTML(
      ["الشركة", "منذ", "العروض", "القيمة"],
      news.map(function (r) {
        return [esc(r.c.name), chip("قبل " + arNum(r.age) + " يوم", "new"), fmtInt(r.st.count), moneyC(r.st.value)];
      }),
      news.map(function (r) { return 'data-co="' + r.c.id + '" class="clickable"'; })
    ) : empty("لا توجد شركات جديدة نشطة مطابقة.");
  }

  /* ---------- Health section ----------------------------------------- */
  function renderHealth() {
    var counts = { platinum: 0, gold: 0, silver: 0, risk: 0, lost: 0 };
    HEALTH.forEach(function (r) { counts[r.tier]++; });
    var total = HEALTH.length || 1;

    // stacked distribution bar
    var segs = TIER_ORDER.map(function (t) {
      var n = counts[t]; if (!n) return "";
      var wpc = (n / total) * 100;
      return '<span class="hd-seg ' + HEALTH_TIERS[t].cls + '" style="width:' + wpc.toFixed(2) + '%" title="' +
        HEALTH_TIERS[t].label + ": " + n + '"></span>';
    }).join("");
    var chips = TIER_ORDER.map(function (t) {
      return '<li><span class="hd-dot ' + HEALTH_TIERS[t].cls + '"></span>' + HEALTH_TIERS[t].label +
        "<b>" + arNum(counts[t]) + "</b></li>";
    }).join("");
    el("healthDist").innerHTML =
      '<div class="hd-bar">' + segs + "</div>" +
      '<ul class="hd-legend">' + chips + "</ul>";

    // detail table (all companies, best → worst)
    el("healthTable").innerHTML = tableHTML(
      ["الشركة", "التصنيف", "العروض (الكل)", "القيمة (الكل)", "آخر نشاط", "الاتجاه ٣٠ يوم"],
      HEALTH.map(function (r) {
        var last = r.la ? "قبل " + arNum(r.gap) + " يوم" : "لا يوجد";
        return [
          '<span class="name">' + esc(r.c.name) + (r.keyAccount ? ' <span class="key-tag">عميل رئيسي</span>' : "") + "</span>",
          tierBadge(r.tier),
          fmtInt(r.all.count),
          moneyC(r.all.value),
          esc(last),
          trendTag(r.momentum)
        ];
      }),
      HEALTH.map(function (r) { return 'data-co="' + r.c.id + '" class="clickable"'; })
    );
    el("healthCriteria").innerHTML =
      "يُحتسب التصنيف من أربعة عوامل: عدد العروض، قيمتها، آخر نشاط، والتغير مقابل المعدل الطبيعي للشركة. " +
      "<b>مفقود</b>: انقطاع أكثر من ٦٠ يوماً · <b>في خطر</b>: انقطاع ٣٠–٦٠ يوماً أو هبوط حاد عن المعتاد · " +
      "<b>بلاتيني/ذهبي/فضي</b>: شركات نشطة مرتّبة حسب القيمة والحجم ومعدل القبول.";
  }

  /* ---------- Top companies — lifetime vs 90d vs month --------------- */
  function topCompaniesBy(w, limit) {
    return VCOMP.map(function (c) {
      var st = companyStats(c.id, w);
      return { id: c.id, label: c.name, value: st.value, sub: arNum(st.count) + " عرض" };
    }).filter(function (r) { return r.value > 0; })
      .sort(function (a, b) { return b.value - a.value; }).slice(0, limit || 6);
  }
  function renderTopLifetime() {
    var life = topCompaniesBy(null, 6);
    var d90 = topCompaniesBy(win(-89, 0), 6);
    var mFirst = new Date(AS_OF.getFullYear(), AS_OF.getMonth(), 1);
    var month = VCOMP.map(function (c) {
      var qs = QSET.filter(function (q) { return q.companyId === c.id && parseDate(q.date) >= mFirst; });
      return { id: c.id, label: c.name, value: sum(qs, function (q) { return q.value; }), sub: arNum(qs.length) + " عرض" };
    }).filter(function (r) { return r.value > 0; }).sort(function (a, b) { return b.value - a.value; }).slice(0, 6);

    rankBars(el("topLifetime"), life, { color: C.brass, format: moneyC });
    rankBars(el("top90"), d90, { color: C.jade, format: moneyC });
    el("topMonthCompanies").innerHTML = "";
    if (month.length) rankBars(el("topMonthCompanies"), month, { color: C.brassSoft, format: moneyC });
    else el("topMonthCompanies").innerHTML = empty("لا توجد عروض هذا الشهر بعد.");
  }

  /* ---------- Lost Companies Center ---------------------------------- */
  function renderLostCenter() {
    var lost = HEALTH.filter(function (r) { return r.tier === "lost"; })
      .sort(function (a, b) { return b.all.value - a.all.value; });

    var totalLost = 0;
    var html = lost.map(function (r) {
      var monthsDormant = Math.max(1, Math.floor(r.gap / 30));
      var avgMonthlyVal = r.all.value / r.monthsAct;
      var estLost = avgMonthlyVal * monthsDormant;
      totalLost += estLost;
      var bestM = r.best ? monthLabel(r.best.key) + " · " + moneyC(r.best.value) : "—";
      var reco = r.best && r.best.value >= 200000
        ? "اتصال مباشر من مدير المبيعات وعرض حصري لإعادة التفعيل"
        : "رسالة متابعة ودّية مع استبيان لسبب التوقّف";
      var facts = [
        ["آخر عرض", (r.la || "—")],
        ["أيام الانقطاع", arNum(r.gap) + " يوم (" + arNum(monthsDormant) + " شهر)"],
        ["إجمالي العروض التاريخية", arNum(r.all.count) + " عرض"],
        ["أعلى شهر سابق", bestM],
        ["القيمة التقديرية المفقودة", moneyC(estLost)],
        ["الموظف المسؤول", r.staff ? r.staff.name : "—"]
      ].map(function (f) {
        return '<div class="lost-fact"><span class="lf-k">' + esc(f[0]) + '</span><span class="lf-v">' + esc(f[1]) + "</span></div>";
      }).join("");
      return '<div class="lost-card reveal clickable" data-co="' + esc(r.c.id) + '" role="button" tabindex="0">' +
        '<div class="lost-head"><span class="lost-name">' + esc(r.c.name) + "</span>" +
        tierBadge("lost") + "</div>" +
        '<div class="lost-facts">' + facts + "</div>" +
        '<div class="lost-reco"><span>توصية المتابعة</span>' + esc(reco) + "</div></div>";
    }).join("");

    el("lostCenter").innerHTML = lost.length ? html : empty("لا توجد شركات مفقودة حالياً — كل العملاء نشطون خلال آخر ٦٠ يوماً.");
    el("lostTotal").textContent = lost.length ? moneyC(totalLost) : "٠ " + CUR;
  }

  function renderStaff() {
    var w = currentWindow();
    var rows = VSTAFF.map(function (s) {
      var qs = QSET.filter(function (q) { return q.staffId === s.id && inRange(q, w); });
      var val = sum(qs, function (q) { return q.value; });
      var approved = qs.filter(function (q) { return q.status === "approved"; }).length;
      return { s: s, count: qs.length, value: val, avg: qs.length ? val / qs.length : 0, rate: qs.length ? approved / qs.length : 0 };
    });
    var totalCount = sum(rows, function (r) { return r.count; }) || 1;
    var k = state.staffSort.key, dir = state.staffSort.dir;
    rows.sort(function (a, b) { return (a[k] - b[k]) * dir; });
    var maxCount = Math.max.apply(null, rows.map(function (r) { return r.count; }).concat([1]));

    var heads = [
      { t: "الموظف", k: null }, { t: "العروض", k: "count" }, { t: "القيمة", k: "value" },
      { t: "متوسط العرض", k: "avg" }, { t: "القبول", k: "rate" }, { t: "الحصة", k: null }
    ];
    var thead = "<tr>" + heads.map(function (h) {
      if (!h.k) return "<th>" + h.t + "</th>";
      var on = state.staffSort.key === h.k;
      return '<th class="sortable' + (on ? " on" : "") + '" data-sort="' + h.k + '">' + h.t +
        '<i class="sort-ar">' + (on ? (dir < 0 ? "▼" : "▲") : "↕") + "</i></th>";
    }).join("") + "</tr>";

    var body = rows.map(function (r, i) {
      return '<tr data-staff="' + esc(r.s.id) + '" class="clickable">' +
        '<td class="name"><b class="ri">' + arNum(i + 1) + "</b>" + esc(r.s.name) + "</td>" +
        "<td>" + fmtInt(r.count) + "</td>" +
        "<td>" + moneyC(r.value) + "</td>" +
        "<td>" + moneyC(r.avg) + "</td>" +
        "<td>" + chip(pct(r.rate), r.rate >= 0.65 ? "ok" : r.rate >= 0.55 ? "warn" : "bad") + "</td>" +
        '<td class="sharecell"><span class="share-bar"><i style="width:' + ((r.count / maxCount) * 100).toFixed(0) +
        '%"></i></span><span class="share-pct">' + pct(r.count / totalCount) + "</span></td>" +
        "</tr>";
    }).join("");

    el("staffTable").innerHTML = '<div class="table-scroll"><table class="tbl"><thead>' + thead + "</thead><tbody>" + body + "</tbody></table></div>";
  }

  function renderHotelsRegions() {
    var w = currentWindow();
    var qs = quotesIn(w);
    var hc = groupCount(qs, function (q) { return q.hotelId; });
    var hotels = Object.keys(hc).map(function (id) {
      return { id: id, label: (hotelById[id] || {}).name || id, sub: (hotelById[id] || {}).city, value: hc[id] };
    }).sort(function (a, b) { return b.value - a.value; }).slice(0, 8);
    rankBars(el("topHotels"), hotels, { color: C.brass, idAttr: "data-hotel" });

    var rc = groupCount(qs, function (q) { return q.region; });
    var regions = Object.keys(rc).map(function (r) { return { label: r, value: rc[r] }; })
      .sort(function (a, b) { return b.value - a.value; }).slice(0, 8);
    rankBars(el("topRegions"), regions, { color: C.jade });
  }

  /* ---------- Demand Analysis (Phase 7) ------------------------------ */
  function renderDemand() {
    var w = currentWindow();
    var qs = quotesIn(w);

    // A) by day of week — management order: Sat, Sun, Mon, Tue, Wed, Thu, Fri
    var dowCount = [0, 0, 0, 0, 0, 0, 0]; // index = JS getDay (0=Sun..6=Sat)
    qs.forEach(function (q) { dowCount[parseDate(q.date).getDay()]++; });
    var dowOrder = [6, 0, 1, 2, 3, 4, 5];
    var dayItems = dowOrder.map(function (d) {
      return { value: dowCount[d], label: DOW_AR[d].replace("ال", ""), tick: DOW_AR[d].replace("ال", ""), full: DOW_AR[d] };
    });
    barChartV(el("demandDay"), dayItems);
    // strongest / weakest annotation
    var best = dayItems[0], worst = dayItems[0];
    dayItems.forEach(function (it) { if (it.value > best.value) best = it; if (it.value < worst.value) worst = it; });
    el("demandDayNote").innerHTML = qs.length
      ? 'الأعلى: <b>' + esc(best.full) + "</b> (" + arNum(best.value) + ") · الأدنى: <b>" + esc(worst.full) + "</b> (" + arNum(worst.value) + ")"
      : "لا توجد بيانات ضمن الفترة.";

    // B) by hour (business hours 7–22, where timestamps exist)
    var hourCount = {};
    qs.forEach(function (q) { if (q.hour != null) hourCount[q.hour] = (hourCount[q.hour] || 0) + 1; });
    var hourItems = [];
    for (var h = 7; h <= 22; h++) {
      hourItems.push({ value: hourCount[h] || 0, label: arNum(h), tick: arNum(h), full: "الساعة " + arNum(h) + ":٠٠" });
    }
    barChartV(el("demandHour"), hourItems);
    var peak = hourItems[0];
    hourItems.forEach(function (it) { if (it.value > peak.value) peak = it; });
    el("demandHourNote").innerHTML = qs.length
      ? "ذروة الطلب حول <b>" + esc(peak.full) + "</b> — يفيد في جدولة المناوبات."
      : "لا توجد بيانات ضمن الفترة.";

    // C) by month — seasonal trend across the full range (ignores the period filter)
    var mc = {};
    QSET.forEach(function (q) { var k = q.date.slice(0, 7); mc[k] = (mc[k] || 0) + 1; });
    var months = Object.keys(mc).sort();
    var monthItems = months.map(function (k) {
      var p = k.split("-");
      return { value: mc[k], label: MONTH_AR[+p[1] - 1].slice(0, 3), tick: MONTH_AR[+p[1] - 1].slice(0, 3), full: monthLabel(k) };
    });
    barChartV(el("demandMonth"), monthItems);
  }

  /* ---------- Company Activity Heat Map (Phase 7) -------------------- */
  function renderHeatmap() {
    var rows = VCOMP.map(function (c) {
      var q30 = companyStats(c.id, win(-29, 0)).count;
      var q90 = companyStats(c.id, win(-89, 0)).count;
      var p30 = companyStats(c.id, win(-59, -30)).count;
      var momentum = p30 > 0 ? (q30 - p30) / p30 : (q30 > 0 ? 1 : 0);
      return { c: c, q30: q30, q90: q90, momentum: momentum };
    }).filter(function (r) { return r.q90 > 0; })
      .sort(function (a, b) { return b.q90 - a.q90; });

    var max30 = Math.max.apply(null, rows.map(function (r) { return r.q30; }).concat([1]));
    var body = rows.map(function (r) {
      var intensity = (r.q30 / max30);
      var heat = "background:rgba(79,179,160," + (0.05 + intensity * 0.5).toFixed(2) + ")";
      var warn = (r.momentum < -0.3 && r.q30 >= 0) ? " hm-warn" : "";
      return '<tr data-co="' + esc(r.c.id) + '" class="clickable' + warn + '">' +
        '<td class="name">' + esc(r.c.name) + "</td>" +
        '<td class="hm-cell" style="' + heat + '">' + fmtInt(r.q30) + "</td>" +
        "<td>" + fmtInt(r.q90) + "</td>" +
        "<td>" + trendTag(r.momentum) + "</td></tr>";
    }).join("");
    el("heatmapTable").innerHTML = rows.length
      ? '<div class="table-scroll"><table class="tbl"><thead><tr><th>الشركة</th><th>آخر ٣٠ يوم</th><th>آخر ٩٠ يوم</th><th>الاتجاه</th></tr></thead><tbody>' + body + "</tbody></table></div>"
      : empty("لا توجد شركات نشطة ضمن آخر ٩٠ يوماً.");
  }

  function renderAlerts() {
    var alerts = [];
    var flagged = {};  // company id → already has a company-level alert

    // ---- company-level alerts, driven by the health model ----
    HEALTH.forEach(function (r) {
      var c = r.c;

      // 1) a strong/key account that has slipped into At Risk or Lost
      if ((r.tier === "risk" || r.tier === "lost") && (r.keyAccount || r.pastTier === "platinum" || r.pastTier === "gold")) {
        var wasLabel = r.pastTier === "platinum" ? "بلاتينية" : "ذهبية";
        if (r.tier === "lost") {
          alerts.push({ sev: "high", title: "عميل رئيسي توقّف", who: c.name,
            detail: "شركة كانت بتصنيف " + wasLabel + " (" + arNum(r.all.count) + " عرض بقيمة " + moneyC(r.all.value) +
              ") لكنها انقطعت منذ " + arNum(r.gap) + " يوم.",
            action: "تصعيد لمدير المبيعات وخطة استعادة" });
        } else {
          alerts.push({ sev: "high", title: "شركة مميّزة أصبحت في خطر", who: c.name,
            detail: "كانت من الفئة ال" + wasLabel + "، وانخفض نشاطها إلى " + arNum(r.r30.count) +
              " عرض في آخر ٣٠ يوم مقابل معدّل طبيعي " + arNum(Math.round(r.baseMonthly)) + " شهرياً.",
            action: "تواصل مباشر قبل أن تتحول إلى عميل مفقود" });
        }
        flagged[c.id] = 1;
        return;
      }

      // 2) other lost / at-risk companies (lower priority)
      if (r.tier === "lost" && r.all.count >= 6) {
        alerts.push({ sev: "med", title: "عميل توقّف عن الطلب", who: c.name,
          detail: "لا يوجد نشاط منذ " + arNum(r.gap) + " يوم، بعد " + arNum(r.all.count) + " عرض سابق.",
          action: "مكالمة متابعة لمعرفة السبب" });
        flagged[c.id] = 1;
        return;
      }
      if (r.tier === "risk") {
        alerts.push({ sev: "med", title: "هبوط في نشاط العميل", who: c.name,
          detail: "النشاط الحالي " + arNum(r.r30.count) + " عرض في آخر ٣٠ يوم، أقل من معدّله المعتاد.",
          action: "مراجعة الأسعار ومستوى الخدمة" });
        flagged[c.id] = 1;
        return;
      }

      // 3) many quotations but very low approval (a "quote shopper")
      if (!flagged[c.id] && r.all.count >= 12 && r.rate < 0.35) {
        alerts.push({ sev: "med", title: "عروض كثيرة بلا قبول", who: c.name,
          detail: arNum(r.all.count) + " عرض سعر بمعدل قبول " + pct(r.rate) + " فقط — قد تكون المشكلة في التسعير أو التأهيل.",
          action: "مراجعة جودة العروض ومطابقتها للطلب" });
        flagged[c.id] = 1;
        return;
      }

      // 4) a new company that started strong and needs nurturing
      if (!flagged[c.id] && r.age <= 60 && r.r30.count >= 5 && r.all.value > 0) {
        alerts.push({ sev: "low", title: "عميل جديد انطلق بقوة", who: c.name,
          detail: "انضم قبل " + arNum(r.age) + " يوم وقدّم " + arNum(r.all.count) + " عرض بقيمة " + moneyC(r.all.value) + " بالفعل.",
          action: "تخصيص مدير حساب لترسيخ العلاقة مبكراً" });
        flagged[c.id] = 1;
      }
    });

    // ---- staff over-reliance on a single company ----
    VSTAFF.forEach(function (s) {
      var byCo = {}, total = 0;
      QSET.forEach(function (q) {
        if (q.staffId !== s.id) return;
        byCo[q.companyId] = (byCo[q.companyId] || 0) + q.value;
        total += q.value;
      });
      if (total <= 0) return;
      var topId = null, topV = 0, count = 0;
      Object.keys(byCo).forEach(function (cid) { count++; if (byCo[cid] > topV) { topV = byCo[cid]; topId = cid; } });
      var share = topV / total;
      if (share >= 0.45 && count >= 2) {
        alerts.push({ sev: "med", title: "تركّز مخاطر على عميل واحد", who: s.name,
          detail: "يعتمد " + s.name + " على «" + ((companyById[topId] || {}).name || topId) + "» بنسبة " +
            pct(share) + " من قيمة أعماله — خسارة العميل تعني خسارة معظم محفظته.",
          action: "توزيع الحسابات وبناء علاقات احتياطية" });
      }
    });

    // ---- stale high-value pending quotations ----
    var valSorted = QSET.slice().sort(function (a, b) { return b.value - a.value; });
    var highCut = valSorted[Math.floor(valSorted.length * 0.15)] ? valSorted[Math.floor(valSorted.length * 0.15)].value : 0;
    var stale = QSET.filter(function (q) {
      return q.status === "sent" && q.value >= highCut && daysAgo(q.date) >= 7 && daysAgo(q.date) <= 45;
    }).sort(function (a, b) { return b.value - a.value; }).slice(0, 4);
    stale.forEach(function (q) {
      alerts.push({ sev: "high", title: "عرض مرتفع القيمة معلّق", who: (companyById[q.companyId] || {}).name,
        detail: "عرض " + esc(q.id) + " بقيمة " + moneyC(q.value) + " مُرسل منذ " + arNum(daysAgo(q.date)) + " يوم بلا رد.",
        action: "متابعة القبول قبل انتهاء الصلاحية" });
    });

    var order = { high: 0, med: 1, low: 2 };
    alerts.sort(function (a, b) { return order[a.sev] - order[b.sev]; });

    var sevLabel = { high: "عاجل", med: "متابعة", low: "ملاحظة" };
    el("alertsList").innerHTML = alerts.length ? alerts.map(function (a) {
      return '<div class="alert ' + a.sev + ' reveal"><div class="alert-side"><span class="alert-dot"></span>' +
        '<span class="alert-sev">' + sevLabel[a.sev] + "</span></div>" +
        '<div class="alert-body"><div class="alert-title">' + esc(a.title) +
        '<span class="alert-who">' + esc(a.who || "") + "</span></div>" +
        '<p class="alert-detail">' + a.detail + "</p>" +
        '<div class="alert-action"><span>الإجراء المقترح</span> ' + esc(a.action) + "</div></div></div>";
    }).join("") : empty("لا توجد تنبيهات حالياً.");

    el("alertCount").textContent = arNum(alerts.length);
  }

  /* ---------- small markup helpers ----------------------------------- */
  // rowAttrs (optional): array of attribute strings applied per <tr>, e.g. 'data-co="C01"'
  function tableHTML(heads, rows, rowAttrs) {
    return '<div class="table-scroll"><table class="tbl"><thead><tr>' +
      heads.map(function (h) { return "<th>" + h + "</th>"; }).join("") + "</tr></thead><tbody>" +
      rows.map(function (r, i) {
        var attr = rowAttrs && rowAttrs[i] ? " " + rowAttrs[i] : "";
        return "<tr" + attr + ">" + r.map(function (c) { return "<td>" + c + "</td>"; }).join("") + "</tr>";
      }).join("") +
      "</tbody></table></div>";
  }
  function chip(text, kind) { return '<span class="chip ' + (kind || "") + '">' + esc(text) + "</span>"; }
  function empty(msg) { return '<p class="empty">' + esc(msg) + "</p>"; }

  /* =====================================================================
     Company Timeline — click any company → detail panel
     ===================================================================== */
  // last-N-months series for one company (count + value per calendar month)
  function companyMonthlySeries(companyId, months) {
    months = months || 12;
    var m = {};
    QSET.forEach(function (q) {
      if (q.companyId !== companyId) return;
      var k = q.date.slice(0, 7);
      if (!m[k]) m[k] = { count: 0, value: 0, approved: 0 };
      m[k].count++; m[k].value += q.value;
      if (q.status === "approved") m[k].approved++;
    });
    var out = [], base = new Date(AS_OF.getFullYear(), AS_OF.getMonth(), 1);
    for (var i = months - 1; i >= 0; i--) {
      var d = new Date(base.getFullYear(), base.getMonth() - i, 1);
      var k = dayKey(d).slice(0, 7);
      var rec = m[k] || { count: 0, value: 0, approved: 0 };
      out.push({ key: k, count: rec.count, value: rec.value, short: MONTH_AR[d.getMonth()].slice(0, 3) });
    }
    return out;
  }

  // clear, tier-aware follow-up recommendation for any company
  function companyReco(r) {
    if (r.tier === "lost") {
      return r.best && r.best.value >= 200000
        ? "عميل مفقود عالي القيمة — تصعيد فوري لمدير المبيعات مع عرض حصري لإعادة التفعيل."
        : "عميل مفقود — رسالة متابعة ودّية واستبيان قصير لمعرفة سبب التوقّف.";
    }
    if (r.tier === "risk") {
      return "نشاطه يتراجع — تواصل مباشر هذا الأسبوع، ومراجعة التسعير ومستوى الخدمة قبل أن يتحوّل إلى عميل مفقود.";
    }
    if (r.age <= 60) {
      return "عميل جديد بداية واعدة — خصّص مدير حساب وتابعه عن قرب لترسيخ العلاقة مبكراً.";
    }
    if (r.tier === "platinum") {
      return "عميل استراتيجي — حافظ على العلاقة بمتابعة دورية وعروض حصرية، ولا تتركه بلا تواصل.";
    }
    if (r.tier === "gold") {
      return "عميل قوي — فرصة لرفع الحصة عبر عروض مخصّصة وحزم إضافية.";
    }
    return "عميل مستقر — حفّزه بعروض موسمية وتذكيرات دورية لرفع وتيرة الطلب.";
  }

  // simple dual-metric monthly chart: count bars + value line
  function companyMonthlyChart(target, series) {
    var W = 560, H = 188, padX = 16, padT = 16, padB = 28;
    var plotH = H - padT - padB, plotW = W - padX * 2, n = series.length;
    var maxC = Math.max.apply(null, series.map(function (s) { return s.count; }).concat([1]));
    var maxV = Math.max.apply(null, series.map(function (s) { return s.value; }).concat([1]));
    var slot = plotW / n, bw = Math.min(30, slot * 0.5);
    var bars = "", labels = "", pts = [], dots = "";
    series.forEach(function (s, i) {
      var cx = padX + slot * i + slot / 2;
      var h = (s.count / maxC) * plotH;
      var x = cx - bw / 2, y = padT + plotH - h;
      bars += '<rect x="' + x.toFixed(1) + '" y="' + y.toFixed(1) + '" width="' + bw.toFixed(1) +
        '" height="' + Math.max(0, h).toFixed(1) + '" rx="3" fill="url(#cmGrad)"><title>' +
        esc(monthLabel(s.key)) + " — " + arNum(s.count) + " عرض · " + moneyC(s.value) + "</title></rect>";
      var vy = padT + plotH - (s.value / maxV) * plotH;
      pts.push(cx.toFixed(1) + "," + vy.toFixed(1));
      if (s.value > 0) dots += '<circle cx="' + cx.toFixed(1) + '" cy="' + vy.toFixed(1) + '" r="2.8" fill="' + C.jade + '"/>';
      labels += '<text x="' + cx.toFixed(1) + '" y="' + (H - 9) + '" text-anchor="middle" class="ax">' + esc(s.short) + "</text>";
    });
    var grid = "";
    for (var g = 1; g <= 3; g++) {
      var gy = padT + plotH - (plotH * g / 4);
      grid += '<line x1="' + padX + '" x2="' + (W - padX) + '" y1="' + gy.toFixed(1) + '" y2="' + gy.toFixed(1) + '" class="grid"/>';
    }
    target.innerHTML =
      '<div class="cm-legend"><span class="cm-key cm-bar">عدد العروض</span><span class="cm-key cm-ln">قيمة العروض</span></div>' +
      '<svg viewBox="0 0 ' + W + " " + H + '" class="cm-svg" role="img" aria-label="رسم شهري للشركة">' +
      '<defs><linearGradient id="cmGrad" x1="0" y1="0" x2="0" y2="1">' +
      '<stop offset="0" stop-color="' + C.brassSoft + '"/><stop offset="1" stop-color="' + C.brass + '" stop-opacity="0.55"/>' +
      "</linearGradient></defs>" + grid + bars +
      '<polyline points="' + pts.join(" ") + '" fill="none" stroke="' + C.jade + '" stroke-width="2" stroke-linejoin="round"/>' +
      dots + labels + "</svg>";
  }

  /* ---------- shared drill-down modal shell -------------------------- */
  function openModal(name, subHTML, bodyHTML) {
    var box = el("companyModal");
    box.innerHTML =
      '<div class="ct-backdrop" data-close="1"></div>' +
      '<div class="ct-panel" role="dialog" aria-modal="true" aria-label="' + esc(name) + '">' +
        '<div class="ct-head">' +
          '<div class="ct-titles"><h3 class="ct-name">' + esc(name) + "</h3>" +
            (subHTML ? '<span class="ct-sub">' + subHTML + "</span>" : "") + "</div>" +
          '<button type="button" class="ct-close" data-close="1" aria-label="إغلاق">✕</button>' +
        "</div>" + bodyHTML +
      "</div>";
    box.hidden = false;
    document.body.classList.add("modal-open");
    var cl = box.querySelector(".ct-close");
    if (cl) cl.focus();
  }
  function closeCompany() {
    var box = el("companyModal");
    if (!box || box.hidden) return;
    box.hidden = true;
    box.innerHTML = "";
    document.body.classList.remove("modal-open");
  }
  function factsGrid(facts) {
    return '<div class="ct-facts">' + facts.map(function (f) {
      return '<div class="ct-fact"><span class="ct-k">' + f[0] + '</span><span class="ct-v">' + f[1] + "</span></div>";
    }).join("") + "</div>";
  }
  function miniList(items) {
    if (!items.length) return '<p class="empty">لا يوجد</p>';
    return '<ol class="ct-list">' + items.map(function (it) {
      return '<li><span class="ct-li-name">' + esc(it.label) + '</span><span class="ct-li-val">' + esc(it.val) + "</span></li>";
    }).join("") + "</ol>";
  }
  // group a set of quotes by a key, rank by count or value, return top N
  function topGroup(quotes, keyFn, rankBy, nameFn, limit) {
    var m = {};
    quotes.forEach(function (q) {
      var k = keyFn(q); if (k == null) return;
      if (!m[k]) m[k] = { key: k, count: 0, value: 0 };
      m[k].count++; m[k].value += q.value;
    });
    return Object.keys(m).map(function (k) {
      return { key: k, count: m[k].count, value: m[k].value, label: nameFn(k) };
    }).sort(function (a, b) { return b[rankBy] - a[rankBy]; }).slice(0, limit || 5);
  }

  /* ---------- Company drill-down ------------------------------------- */
  function openCompany(companyId) {
    var r = HEALTH_BY_ID[companyId];
    if (!r) return;
    var series = companyMonthlySeries(companyId, 12);
    var active = series.filter(function (s) { return s.count > 0; });
    var w12 = { from: addDays(AS_OF, -364), to: AS_OF };
    var s12 = companyStats(companyId, w12);
    var rate12 = s12.count ? s12.approved / s12.count : 0;

    var bestM = null, worstM = null;
    active.forEach(function (s) {
      if (!bestM || s.value > bestM.value) bestM = s;
      if (!worstM || s.value < worstM.value) worstM = s;
    });
    var bestTxt = bestM ? monthLabel(bestM.key) + " · " + moneyC(bestM.value) : "—";
    var worstTxt = (worstM && active.length > 1) ? monthLabel(worstM.key) + " · " + moneyC(worstM.value) : "—";
    var lastTxt = r.la ? r.la + " · قبل " + arNum(r.gap) + " يوم" : "لا يوجد نشاط";

    var facts = factsGrid([
      ["التصنيف الحالي", tierBadge(r.tier)],
      ["آخر نشاط", esc(lastTxt)],
      ["الموظف المسؤول", esc(r.staff ? r.staff.name : "—")],
      ["عدد العروض (١٢ شهر)", arNum(s12.count)],
      ["العروض المقبولة", arNum(s12.approved)],
      ["إجمالي القيمة", moneyC(s12.value)],
      ["معدل القبول", pct(rate12)],
      ["أفضل شهر", esc(bestTxt)],
      ["أسوأ شهر", esc(worstTxt)]
    ]);
    var sub = tierBadge(r.tier) + (r.keyAccount ? ' <span class="key-tag">عميل رئيسي</span>' : "");
    var body = facts +
      '<div class="ct-chart-card"><h4 class="ct-chart-title">النشاط الشهري — آخر ١٢ شهر</h4><div id="ctChart"></div></div>' +
      '<div class="ct-reco"><span>توصية المتابعة</span><p>' + esc(companyReco(r)) + "</p></div>";
    openModal(r.c.name, sub, body);
    companyMonthlyChart(el("ctChart"), series);
  }

  /* ---------- Staff drill-down --------------------------------------- */
  function staffRankById(id, w) {
    var totals = VSTAFF.map(function (s) {
      var qs = QSET.filter(function (q) { return q.staffId === s.id && (!w || inRange(q, w)); });
      return { id: s.id, count: qs.length };
    }).sort(function (a, b) { return b.count - a.count; });
    var rank = totals.length;
    for (var i = 0; i < totals.length; i++) { if (totals[i].id === id) { rank = i + 1; break; } }
    return { rank: rank, total: totals.length };
  }
  function openStaff(staffId) {
    var s = staffById[staffId];
    if (!s) return;
    var w = currentWindow();
    var qs = QSET.filter(function (q) { return q.staffId === staffId && inRange(q, w); });
    var approved = qs.filter(function (q) { return q.status === "approved"; }).length;
    var value = sum(qs, function (q) { return q.value; });
    var rate = qs.length ? approved / qs.length : 0;
    var rk = staffRankById(staffId, w);

    var topCos = topGroup(qs, function (q) { return q.companyId; }, "value",
      function (k) { return (companyById[k] || {}).name || k; }, 5)
      .map(function (g) { return { label: g.label, val: moneyC(g.value) }; });
    var topHos = topGroup(qs, function (q) { return q.hotelId; }, "count",
      function (k) { return (hotelById[k] || {}).name || k; }, 5)
      .map(function (g) { return { label: g.label, val: arNum(g.count) + " عرض" }; });

    var facts = factsGrid([
      ["إجمالي العروض", arNum(qs.length)],
      ["العروض المقبولة", arNum(approved)],
      ["معدل القبول", pct(rate)],
      ["إجمالي القيمة", moneyC(value)],
      ["الترتيب بين الموظفين", "المرتبة " + arNum(rk.rank) + " من " + arNum(rk.total)],
      ["متوسط قيمة العرض", moneyC(qs.length ? value / qs.length : 0)]
    ]);
    var sub = '<span class="role-pill">' + ACCESS.label(s.role) + '</span> <span class="scope-pill">' + esc(w.label) + "</span>";
    var body = facts +
      '<div class="ct-2col">' +
        '<div class="ct-block"><h4 class="ct-sub-h">أكثر الشركات تعاملاً</h4>' + miniList(topCos) + "</div>" +
        '<div class="ct-block"><h4 class="ct-sub-h">أكثر الفنادق طلباً</h4>' + miniList(topHos) + "</div>" +
      "</div>";
    openModal(s.name, sub, body);
  }

  /* ---------- Hotel drill-down --------------------------------------- */
  function openHotel(hotelId) {
    var h = hotelById[hotelId];
    if (!h) return;
    var w = currentWindow();
    var qs = QSET.filter(function (q) { return q.hotelId === hotelId && inRange(q, w); });
    var value = sum(qs, function (q) { return q.value; });

    var topCos = topGroup(qs, function (q) { return q.companyId; }, "count",
      function (k) { return (companyById[k] || {}).name || k; }, 5)
      .map(function (g) { return { label: g.label, val: arNum(g.count) + " عرض" }; });
    var topStaff = topGroup(qs, function (q) { return q.staffId; }, "count",
      function (k) { return (staffById[k] || {}).name || k; }, 5)
      .map(function (g) { return { label: g.label, val: arNum(g.count) + " عرض" }; });

    var facts = factsGrid([
      ["عدد العروض", arNum(qs.length)],
      ["إجمالي القيمة", moneyC(value)],
      ["الوجهة", esc(h.city || "—")],
      ["المنطقة", esc(h.area || "—")]
    ]);
    var sub = '<span class="hotel-loc">' + esc((h.city || "") + (h.area ? " · " + h.area : "")) + '</span> <span class="scope-pill">' + esc(w.label) + "</span>";
    var body = facts +
      '<div class="ct-2col">' +
        '<div class="ct-block"><h4 class="ct-sub-h">الشركات الطالبة له</h4>' + miniList(topCos) + "</div>" +
        '<div class="ct-block"><h4 class="ct-sub-h">الأكثر استخداماً من الموظفين</h4>' + miniList(topStaff) + "</div>" +
      "</div>";
    openModal(h.name, sub, body);
  }

  /* ---------- Destination comparison (always from full data) --------- */
  function destStats(destId) {
    var qs = DATA.quotations.filter(function (q) { return q.destination === destId; });
    var coVal = {}, stVal = {}, coSeen = {}, stSeen = {}, value = 0;
    qs.forEach(function (q) {
      coSeen[q.companyId] = 1; stSeen[q.staffId] = 1;
      coVal[q.companyId] = (coVal[q.companyId] || 0) + q.value;
      stVal[q.staffId] = (stVal[q.staffId] || 0) + q.value;
      value += q.value;
    });
    function topKey(obj) { var b = null, bv = -1; Object.keys(obj).forEach(function (k) { if (obj[k] > bv) { bv = obj[k]; b = k; } }); return b; }
    var tc = topKey(coVal), ts = topKey(stVal);
    return {
      count: qs.length,
      companies: Object.keys(coSeen).length,
      staff: Object.keys(stSeen).length,
      value: value,
      topCompany: tc ? ((companyById[tc] || {}).name || "—") : "—",
      topEmployee: ts ? ((staffById[ts] || {}).name || "—") : "—"
    };
  }
  function renderComparison() {
    var box = el("destCompare"); if (!box) return;
    var dests = DATA.destinations || [];
    if (dests.length < 2) { box.innerHTML = ""; return; }
    // stable color per destination (cycles → future-proof for more destinations)
    var palette = [C.brass, C.jade, C.coral, C.brassSoft, C.jadeDeep, C.danger];
    var stats = dests.map(function (d, i) {
      var s = destStats(d.id);
      s.avg = s.count ? s.value / s.count : 0;
      return { d: d, s: s, color: palette[i % palette.length] };
    });

    var metrics = [
      { k: "إجمالي العروض",    get: function (s) { return s.count; },       fmt: function (v) { return fmtInt(v); },  num: true },
      { k: "قيمة العروض",      get: function (s) { return s.value; },       fmt: function (v) { return moneyC(v); },  num: true },
      { k: "متوسط قيمة العرض", get: function (s) { return s.avg; },         fmt: function (v) { return moneyC(v); },  num: true },
      { k: "الشركات النشطة",   get: function (s) { return s.companies; },   fmt: function (v) { return fmtInt(v); },  num: true },
      { k: "الموظفون النشطون", get: function (s) { return s.staff; },       fmt: function (v) { return fmtInt(v); },  num: true },
      { k: "أفضل شركة",        get: function (s) { return s.topCompany; },  fmt: function (v) { return esc(v); },     num: false },
      { k: "أفضل موظف",        get: function (s) { return s.topEmployee; }, fmt: function (v) { return esc(v); },     num: false }
    ];

    box.innerHTML = metrics.map(function (m) {
      var vals = stats.map(function (x) { return m.get(x.s); });
      var leadIdx = -1, total = 0;
      if (m.num) {
        var best = -Infinity;
        vals.forEach(function (v, i) { total += v; if (v > best) { best = v; leadIdx = i; } });
      }
      var sides = stats.map(function (x, i) {
        var lead = (m.num && i === leadIdx) ? " vs-lead" : "";
        return '<div class="vs-side' + lead + '">' +
          '<span class="vs-dest"><i class="vs-dot" style="background:' + x.color + '"></i>' + esc(x.d.name) + "</span>" +
          '<span class="vs-val">' + m.fmt(vals[i]) + "</span>" +
          (m.num && i === leadIdx ? '<span class="vs-tag">الأعلى</span>' : "") +
          "</div>";
      });
      var pair = (stats.length === 2)
        ? sides[0] + '<span class="vs-vs">VS</span>' + sides[1]
        : sides.join("");
      var bar = "";
      if (m.num && total > 0) {
        bar = '<div class="vs-bar">' + stats.map(function (x, i) {
          return '<i style="width:' + ((vals[i] / total) * 100).toFixed(1) + "%;background:" + x.color + '"></i>';
        }).join("") + "</div>";
      }
      return '<div class="vs-card' + (m.num ? "" : " vs-text") + '">' +
        '<div class="vs-metric">' + m.k + "</div>" +
        '<div class="vs-pair">' + pair + "</div>" + bar + "</div>";
    }).join("");
  }

  /* ---------- Filter Validation panel (temporary, removable) --------- */
  function renderValidation() {
    var w = currentWindow();
    var used = quotesIn(w).length;
    var fromK = dayKey(w.from), toK = dayKey(w.to);
    el("vSelPeriod").textContent = w.label + " · " + arNum(w.days) + " يوم";
    el("vRecords").textContent = arNum(used) + " عرض";
    el("vRange").textContent = fromK + " → " + toK;
    // keep the custom date inputs in sync with the active window (unless user is editing)
    var vf = el("vFrom"), vt = el("vTo");
    if (vf && document.activeElement !== vf) vf.value = state.customFrom || fromK;
    if (vt && document.activeElement !== vt) vt.value = state.customTo || toK;

    var follows = [
      ["النظرة التنفيذية — تفاصيل الفترة", used],
      ["ترتيب الموظفين", used],
      ["ترتيب الشركات", used],
      ["ترتيب الفنادق والوجهات", used],
      ["تحليل الطلب — اليوم / الساعة", used]
    ];
    var fixed = [
      ["النظرة التنفيذية — اللقطة العلوية", "ثابت: اليوم · الشهر · آخر ٣٠ يوم"],
      ["مقارنة الوجهات", "ثابت: كل الفترات (بالتصميم)"],
      ["صحة الشركات", "ثابت: تراكمي + آخر ٣٠/٦٠ يوم"],
      ["مركز الشركات المفقودة", "ثابت: خمول ≥ ٦٠ يوم"],
      ["أفضل الشركات — مقارنة زمنية", "ثابت: تراكمي · ٩٠ يوم · الشهر"],
      ["تحليل الطلب — الشهر", "ثابت: كل الأشهر (موسمية)"],
      ["خريطة نشاط الشركات", "ثابت: آخر ٣٠ و٩٠ يوم"]
    ];
    var rows = follows.map(function (r) {
      return "<tr><td>" + r[0] + '</td><td><span class="vs-follow">يتبع الفترة</span></td><td>' + arNum(r[1]) + " عرض</td></tr>";
    }).join("") + fixed.map(function (r) {
      return "<tr><td>" + r[0] + '</td><td><span class="vs-fixed">نطاق ثابت</span></td><td>' + r[1] + "</td></tr>";
    }).join("");
    el("vSectionScope").innerHTML =
      '<div class="table-scroll"><table class="tbl"><thead><tr><th>القسم</th><th>النطاق</th><th>السجلات / الملاحظة</th></tr></thead><tbody>' +
      rows + "</tbody></table></div>" +
      '<p class="valid-foot">كل الأقسام التي «تتبع الفترة» تستخدم نفس مجموعة السجلات (' + arNum(used) +
      " عرض). أي تغيير في الفلتر ينعكس عليها فوراً وبنفس القيمة — لا تستخدم أي بيانات تراكمية. الأقسام «ذات النطاق الثابت» محسوبة على نطاق ثابت بطبيعتها (لا تتأثر بالفلتر بالتصميم).</p>";
  }

  /* ---------- render all + wiring ------------------------------------ */
  function renderAll() {
    applyDestination();     // scope the working view to the selected destination
    computeHealth();        // lifetime model shared by several sections
    renderValidation();     // TEMP: proves which sections follow the period
    renderOverview();
    renderComparison();     // Indonesia vs Thailand (always from full data)
    renderDaily();
    renderMonthly();
    renderHealth();
    renderCompanies();
    renderTopLifetime();
    renderLostCenter();
    renderStaff();
    renderHotelsRegions();
    renderDemand();
    renderHeatmap();
    renderAlerts();
    revealObserve();
  }

  function wire() {
    el("asof").textContent = DATA.meta.asOf;

    // destination selector (built from the destination registry → future-ready)
    var destBox = el("destControl");
    if (destBox) {
      var opts = [{ id: "all", name: "كل الوجهات" }].concat(DATA.destinations || []);
      destBox.innerHTML = opts.map(function (o) {
        return '<button type="button" data-dest="' + esc(o.id) + '"' +
          (o.id === state.destination ? ' class="active"' : "") + ">" + esc(o.name) + "</button>";
      }).join("");
      destBox.addEventListener("click", function (e) {
        var b = e.target.closest("[data-dest]"); if (!b) return;
        state.destination = b.getAttribute("data-dest");
        setActive("destControl", b);
        renderAll();   // full re-render (recomputes health for the new scope)
      });
    }

    // period control
    el("periodControl").addEventListener("click", function (e) {
      var b = e.target.closest("[data-period]"); if (!b) return;
      var p = b.getAttribute("data-period");
      setActive("periodControl", b);
      if (p === "custom") {
        state.period = "custom";
        renderAll();   // re-render EVERYTHING so all period-scoped sections stay in sync
        var vp = el("sec-validation"); if (vp) vp.scrollIntoView({ behavior: "smooth", block: "start" });
        var vf = el("vFrom"); if (vf) vf.focus();
        return;
      }
      state.period = (p === "month" || p === "today" || p === "yesterday") ? p : parseInt(p, 10);
      renderAll();     // single source of truth → no section can fall out of sync
    });

    // custom date range (validation panel)
    function applyCustom() {
      var f = el("vFrom").value, t = el("vTo").value;
      if (!f || !t) return;
      state.customFrom = f; state.customTo = t; state.period = "custom";
      var cb = document.querySelector('#periodControl [data-period="custom"]');
      if (cb) setActive("periodControl", cb);
      renderAll();
    }
    el("vApply").addEventListener("click", applyCustom);

    // monthly metric toggle
    el("monthlyMetric").addEventListener("click", function (e) {
      var b = e.target.closest("[data-metric]"); if (!b) return;
      state.monthlyMetric = b.getAttribute("data-metric");
      setActive("monthlyMetric", b);
      renderMonthly();
    });

    // company search
    var si;
    el("companySearch").addEventListener("input", function (e) {
      clearTimeout(si);
      si = setTimeout(function () { state.companyQuery = e.target.value; renderCompanies(); }, 120);
    });

    // staff sort
    el("staffTable").addEventListener("click", function (e) {
      var th = e.target.closest("[data-sort]"); if (!th) return;
      var key = th.getAttribute("data-sort");
      if (state.staffSort.key === key) state.staffSort.dir *= -1;
      else state.staffSort = { key: key, dir: -1 };
      renderStaff();
    });

    // best-companies sortable headers (count / value / average)
    el("bestCompanies").addEventListener("click", function (e) {
      var th = e.target.closest("[data-csort]"); if (!th) return;
      var key = th.getAttribute("data-csort");
      if (state.companySort.key === key) state.companySort.dir *= -1;
      else state.companySort = { key: key, dir: -1 };
      renderCompanies();
    });

    // ---- drill-down: open detail modal for company / staff / hotel ----
    document.addEventListener("click", function (e) {
      if (e.target.closest("[data-close]")) { closeCompany(); return; }
      var co = e.target.closest("[data-co]"); if (co) { openCompany(co.getAttribute("data-co")); return; }
      var st = e.target.closest("[data-staff]"); if (st) { openStaff(st.getAttribute("data-staff")); return; }
      var ho = e.target.closest("[data-hotel]"); if (ho) { openHotel(ho.getAttribute("data-hotel")); return; }
    });
    // keyboard: Enter/Space opens the focused entity; Esc closes the panel
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") { closeCompany(); return; }
      if (e.key === "Enter" || e.key === " ") {
        var t = e.target.closest && (e.target.closest("[data-co]") || e.target.closest("[data-staff]") || e.target.closest("[data-hotel]"));
        if (!t) return;
        e.preventDefault();
        if (t.hasAttribute("data-co")) openCompany(t.getAttribute("data-co"));
        else if (t.hasAttribute("data-staff")) openStaff(t.getAttribute("data-staff"));
        else if (t.hasAttribute("data-hotel")) openHotel(t.getAttribute("data-hotel"));
      }
    });

    // logout
    var lo = el("logoutBtn");
    if (lo) lo.addEventListener("click", logout);
  }
  function setActive(containerId, btn) {
    var nodes = el(containerId).querySelectorAll("button");
    for (var i = 0; i < nodes.length; i++) nodes[i].classList.remove("active");
    btn.classList.add("active");
  }

  // gentle scroll reveal (respects reduced motion)
  var io;
  function revealObserve() {
    var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var nodes = document.querySelectorAll(".reveal:not(.shown)");
    if (reduce || !("IntersectionObserver" in window)) {
      nodes.forEach(function (n) { n.classList.add("shown"); }); return;
    }
    if (!io) {
      io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("shown"); io.unobserve(en.target); } });
      }, { threshold: 0.08 });
    }
    nodes.forEach(function (n) { io.observe(n); });
  }

  /* =====================================================================
     View routing: login  →  dashboard (admin/manager)  →  denied (staff)
     ===================================================================== */
  var APP_WIRED = false;       // wire dashboard listeners only once
  var loginMode = "admin";     // "admin" (الإدارة) | "staff" (الموظفون)

  function setView(view) {
    var topbar = document.querySelector(".topbar");
    var wrap = document.querySelector(".wrap");
    if (topbar) topbar.hidden = (view !== "dashboard");
    if (wrap) wrap.hidden = (view !== "dashboard");
    el("loginGate").hidden = (view !== "login");
    el("accessDenied").hidden = (view !== "denied");
  }

  // central entry point — decides what to show based on the session role
  function route() {
    var role = ACCESS.getCurrentRole();
    if (!role) { setView("login"); renderLogin(); return; }          // no session → login
    if (!ACCESS.canAccessDashboard(role)) { renderAccessDenied(role); return; }  // staff/sales → denied
    showDashboard(role);                                              // admin/manager → dashboard
  }

  function showDashboard(role) {
    setView("dashboard");
    var badge = el("roleBadge");
    if (badge) badge.textContent = ACCESS.label(role);
    if (!APP_WIRED) { wire(); APP_WIRED = true; }
    renderAll();
  }

  function logout() { SESSION.clear(); loginMode = "admin"; route(); }

  function renderLogin() {
    var box = el("loginGate");
    var isAdmin = loginMode === "admin";
    box.innerHTML =
      '<div class="login-card">' +
        '<div class="login-brand">' +
          '<svg viewBox="0 0 40 40" fill="none"><path d="M20 3 L24 16 L37 20 L24 24 L20 37 L16 24 L3 20 L16 16 Z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><circle cx="20" cy="20" r="3.4" fill="currentColor"/></svg>' +
          '<span class="lb-name">سيزون ترافل</span>' +
        '</div>' +
        '<p class="login-title">لوحة الإدارة — تسجيل الدخول</p>' +
        '<div class="login-tabs" role="group" aria-label="نوع الدخول">' +
          '<button type="button" class="login-tab' + (isAdmin ? " active" : "") + '" data-mode="admin">دخول الإدارة</button>' +
          '<button type="button" class="login-tab' + (!isAdmin ? " active" : "") + '" data-mode="staff">دخول الموظفين</button>' +
        '</div>' +
        '<label class="login-field-label" for="loginPwd">كلمة المرور</label>' +
        '<input type="password" id="loginPwd" class="login-input" autocomplete="off" placeholder="••••••••">' +
        '<p class="login-hint">' + (isAdmin ? "للمدير ومدير النظام فقط." : "دخول الموظفين — اللوحة غير متاحة لهم.") + "</p>" +
        '<p class="login-error" id="loginError" role="alert"></p>' +
        '<button type="button" class="login-btn" id="loginSubmit">تسجيل الدخول</button>' +
        '<p class="login-foot">نموذج أولي — بوّابة دخول تجريبية بدون مصادقة حقيقية.</p>' +
      "</div>";

    // tab switching
    var tabs = box.querySelectorAll(".login-tab");
    for (var i = 0; i < tabs.length; i++) {
      tabs[i].addEventListener("click", function () {
        loginMode = this.getAttribute("data-mode");
        renderLogin();
        var f = el("loginPwd"); if (f) f.focus();
      });
    }
    function submit() {
      var pwd = (el("loginPwd").value || "").trim();
      var role = checkPrototypeLogin(loginMode, pwd);
      if (!role) { el("loginError").textContent = "كلمة المرور غير صحيحة."; return; }
      SESSION.set(role);
      route();
    }
    el("loginSubmit").addEventListener("click", submit);
    el("loginPwd").addEventListener("keydown", function (e) { if (e.key === "Enter") submit(); });
    el("loginPwd").focus();
  }

  function renderAccessDenied(role) {
    setView("denied");
    var box = el("accessDenied");
    if (!box) return;
    box.innerHTML =
      '<div class="ad-card">' +
        '<span class="ad-mark" aria-hidden="true">' +
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">' +
          '<rect x="4.5" y="10.5" width="15" height="10" rx="2"/><path d="M8 10.5V7.5a4 4 0 0 1 8 0v3"/>' +
          '<circle cx="12" cy="15.5" r="1.3" fill="currentColor" stroke="none"/></svg>' +
        '</span>' +
        '<h1 class="ad-title">هذه الصفحة مخصصة للإدارة فقط</h1>' +
        '<p class="ad-text">لوحة الإدارة متاحة لأصحاب صلاحية <b>مدير النظام</b> أو <b>مدير</b> فقط.</p>' +
        '<p class="ad-sub">دورك الحالي: <b>' + esc(ACCESS.label(role)) + '</b> — لا يملك صلاحية عرض هذه اللوحة.</p>' +
        '<button type="button" class="ad-back" id="adBack">العودة لتسجيل الدخول</button>' +
      '</div>';
    var back = el("adBack");
    if (back) back.addEventListener("click", logout);
  }

  /* When this script is injected dynamically (by the Supabase adapter),
     DOMContentLoaded has already fired — handle both cases. */
  function _initDashboard() {
    try { route(); }
    catch (err) { console.error(err); document.body.insertAdjacentHTML("beforeend", '<pre style="color:#d9645a;padding:16px">خطأ في العرض: ' + esc(err.message) + "</pre>"); }
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", _initDashboard);
  } else {
    _initDashboard();
  }
})();
