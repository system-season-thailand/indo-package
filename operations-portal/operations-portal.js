/* =====================================================================
   operations-portal.js
   Season B2B Operations Portal — SHELL ONLY.
   One login experience · one navigation · role-based access · modules
   loaded as separate sections (existing modules embedded as-is, future
   tabs are placeholders). No backend, no business logic, no merging.
   ===================================================================== */
(function () {
  "use strict";

  var P = window.PORTAL_DATA || { roles: [], nav: [], meta: {}, future: [] };

  var ICONS = {
    grid: '<path d="M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z"/>',
    check: '<circle cx="12" cy="12" r="9"/><path d="M8.5 12.2l2.3 2.3 4.7-4.9"/>',
    file: '<path d="M7 3h7l4 4v14H7z"/><path d="M14 3v4h4"/><path d="M9.5 12h6M9.5 15.5h6"/>',
    calendar: '<rect x="4" y="5" width="16" height="16" rx="2"/><path d="M4 9h16M8 3v4M16 3v4"/>',
    building: '<path d="M5 21V5a1 1 0 0 1 1-1h7a1 1 0 0 1 1 1v16"/><path d="M14 9h4a1 1 0 0 1 1 1v11"/><path d="M8 8h3M8 12h3M8 16h3"/>',
    chart: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
    gear: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2"/>',
    menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
    logout: '<path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3"/><path d="M10 17l-5-5 5-5"/><path d="M5 12h11"/>'
  };
  function svg(name, cls) {
    return '<svg class="' + (cls || "ic") + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (ICONS[name] || "") + "</svg>";
  }
  function el(id) { return document.getElementById(id); }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]; }); }
  function roleLabel(id) { var r = P.roles.filter(function (x) { return x.id === id; })[0]; return r ? r.label : id; }

  var state = { role: null, active: null, badges: {} };
  var frames = {};   // moduleId -> iframe (cached so module state survives tab switches)

  function navForRole(role) {
    return P.nav.filter(function (n) { return n.roles.indexOf(role) !== -1; });
  }
  function itemById(id) { return P.nav.filter(function (n) { return n.id === id; })[0]; }

  /* ---------- login ------------------------------------------------- */
  function renderLogin() {
    el("loginRoles").innerHTML = P.roles.map(function (r) {
      return '<button type="button" class="login-role" data-role="' + r.id + '">' +
        '<span class="lr-label">' + esc(r.label) + "</span>" +
        '<span class="lr-desc">' + esc(r.desc) + "</span></button>";
    }).join("");
  }
  function enterPortal(role) {
    state.role = role;
    el("login").hidden = true;
    el("app").hidden = false;
    document.body.classList.add("in-app");
    buildChrome();
    var items = navForRole(role);
    var first = items.filter(function (i) { return i.type === "module"; })[0] || items[0];
    if (first) selectItem(first.id);
  }
  function logout() {
    state.role = null; state.active = null;
    // drop cached iframes so a fresh login starts clean
    Object.keys(frames).forEach(function (k) { if (frames[k] && frames[k].parentNode) frames[k].parentNode.removeChild(frames[k]); });
    frames = {};
    el("moduleHost").innerHTML = "";
    document.body.classList.remove("in-app", "nav-open");
    el("app").hidden = true;
    el("login").hidden = false;
  }

  /* ---------- chrome (sidebar + topbar) ----------------------------- */
  function buildChrome() {
    // role switcher (prototype testing)
    el("roleSwitch").innerHTML = P.roles.map(function (r) {
      return '<button type="button" data-role="' + r.id + '"' + (r.id === state.role ? ' class="active"' : "") + ">" + esc(r.label) + "</button>";
    }).join("");
    el("sideRole").textContent = roleLabel(state.role);
    buildNav();
  }
  function buildNav() {
    var items = navForRole(state.role);
    el("navList").innerHTML = items.map(function (n) {
      var note  = (n.roleNote && n.roleNote[state.role]) ? '<span class="nav-tag">' + esc(n.roleNote[state.role]) + "</span>" : "";
      var ph    = n.type === "placeholder" ? '<span class="nav-soon">قريباً</span>' : "";
      var badge = state.badges[n.id] ? '<span class="nav-badge">' + state.badges[n.id] + "</span>" : "";
      return '<button type="button" class="nav-item' + (n.id === state.active ? " active" : "") + '" data-nav="' + n.id + '">' +
        svg(n.icon, "nav-ic") + '<span class="nav-label">' + esc(n.label) + "</span>" + note + ph + badge + "</button>";
    }).join("");
  }

  /* ---------- content area ------------------------------------------ */
  function selectItem(id) {
    var item = itemById(id);
    if (!item || item.roles.indexOf(state.role) === -1) return;   // hard role guard
    state.active = id;
    buildNav();
    // header
    el("crumbTitle").textContent = item.label;
    var note = (item.roleNote && item.roleNote[state.role]) ? " · " + item.roleNote[state.role] : "";
    el("crumbSub").textContent = (item.desc || "") + note;
    // close mobile menu on selection
    document.body.classList.remove("nav-open");

    if (item.type === "module") showModule(item);
    else showPlaceholder(item);
  }

  function showModule(item) {
    el("placeholderHost").hidden = true;
    el("moduleHost").hidden = false;
    // hide all cached frames
    Object.keys(frames).forEach(function (k) { frames[k].hidden = true; });
    if (!frames[item.id]) {
      var f = document.createElement("iframe");
      f.className = "module-frame";
      f.title = item.label;
      f.setAttribute("loading", "lazy");
      f.src = item.url;
      el("moduleHost").appendChild(f);
      frames[item.id] = f;
    }
    frames[item.id].hidden = false;
  }

  function showPlaceholder(item) {
    el("moduleHost").hidden = true;
    Object.keys(frames).forEach(function (k) { frames[k].hidden = true; });
    var ph = el("placeholderHost");
    ph.hidden = false;
    ph.innerHTML =
      '<div class="ph-card">' +
        '<div class="ph-ic">' + svg(item.icon, "ph-icsvg") + "</div>" +
        '<h2 class="ph-title">' + esc(item.label) + "</h2>" +
        '<p class="ph-desc">' + esc(item.desc || "") + "</p>" +
        '<span class="ph-badge">قيد التطوير — منطقة محجوزة في البوابة</span>' +
        '<div class="ph-road"><span class="ph-road-h">خريطة الوحدات المستقبلية للبوابة</span>' +
          '<div class="ph-chips">' + (P.future || []).map(function (x) { return '<span class="ph-chip">' + esc(x) + "</span>"; }).join("") + "</div>" +
        "</div>" +
      "</div>";
  }

  /* ---------- wiring ------------------------------------------------- */
  function wire() {
    el("loginRoles").addEventListener("click", function (e) {
      var b = e.target.closest("[data-role]"); if (b) enterPortal(b.getAttribute("data-role"));
    });
    el("roleSwitch").addEventListener("click", function (e) {
      var b = e.target.closest("[data-role]"); if (!b) return;
      state.role = b.getAttribute("data-role");
      buildChrome();
      var items = navForRole(state.role);
      var keep = items.filter(function (i) { return i.id === state.active; })[0];
      var target = keep || items.filter(function (i) { return i.type === "module"; })[0] || items[0];
      if (target) selectItem(target.id);
    });
    el("navList").addEventListener("click", function (e) {
      var b = e.target.closest("[data-nav]"); if (b) selectItem(b.getAttribute("data-nav"));
    });
    el("menuToggle").addEventListener("click", function () { document.body.classList.toggle("nav-open"); });
    el("navScrim").addEventListener("click", function () { document.body.classList.remove("nav-open"); });
    el("logoutBtn").addEventListener("click", logout);
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") document.body.classList.remove("nav-open"); });
  }

  /* ---- live badge counts from Supabase adapter -------------------- */
  document.addEventListener("portal:data-ready", function (e) {
    var data = e.detail;
    if (!data) return;
    // Show 30-day quotation count as a badge on the management-dashboard nav item
    if (data.recent30 > 0) {
      state.badges["dashboard"] = data.recent30;
      if (state.role) buildNav();   // refresh nav if user is already logged in
    }
    // Update the login note to reflect live DB status
    var noteEl = el("loginNote");
    if (noteEl && data.asOf) {
      noteEl.textContent = "متّصل بقاعدة البيانات · " + data.total.toLocaleString("ar") + " سجل · آخر تحديث " + data.asOf;
    }
  });

  document.addEventListener("DOMContentLoaded", function () {
    try {
      // brand + meta
      el("brandName").textContent = P.meta.product || "بوابة العمليات";
      el("loginTitle").textContent = P.meta.product || "بوابة العمليات";
      el("loginTag").textContent = P.meta.tagline || "";
      el("loginNote").textContent = P.meta.note || "";
      el("sideBrand").textContent = P.meta.short || P.meta.product || "";
      renderLogin();
      wire();
    } catch (err) {
      console.error(err);
      document.body.insertAdjacentHTML("beforeend", '<pre style="color:#d9645a;padding:16px">خطأ: ' + esc(err.message) + "</pre>");
    }
  });
})();
