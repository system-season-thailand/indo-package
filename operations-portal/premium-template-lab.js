/* =====================================================================
   premium-template-lab.js — Premium Travel Pack Template Engine
   One reusable engine assembles a destination guide from reusable BLOCKS,
   rendered in three concepts (Luxury Magazine / Mobile First / Premium
   Concierge). Same content, different presentation. Consumes window.CS_DATA
   (destination/hotel/media/brand) + window.TPL_DATA (content blocks).
   Sample only · no PDF · no Supabase · no production logic · no writes.
   ===================================================================== */
(function () {
  "use strict";
  if (window.ContentStore) window.ContentStore.hydrate(window.CS_DATA);
  var CS = window.CS_DATA || {}, TPL = window.TPL_DATA || {};
  var DEST = CS.destinations || [], BRANDS = CS.brands || {};
  var CONCEPTS = TPL.concepts || [];
  // Content is consumed from the Content Studio destination model (CS_DATA).
  // The engine owns NO destination content — only the concept compositions.
  function blocksFor(d) {
    return { intro: d.description || d.tagline || "", restaurants: d.dining || [], shopping: d.shopping || [], cafes: d.cafes || [], exchange: d.exchange || [], topRecs: d.topRecs || [], tips: d.tips || [] };
  }
  // surface Bali/Jakarta/Puncak/Phuket first (hero system validation set)
  var order = ["bali", "jakarta", "puncak", "phuket", "bangkok"];
  function rebuildDest() { DEST = (CS.destinations || []).slice().sort(function (a, b) { var ia = order.indexOf(a.id), ib = order.indexOf(b.id); return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib); }); }
  rebuildDest();

  /* ---- live content reflection: always pull the latest saved snapshot ---- */
  var lastHydratedTs = 0, lastHydratedAt = 0, dataSourceExists = false, dbgOpen = false;
  function freshHydrate() {
    if (!window.ContentStore) return;
    try {
      var m = window.ContentStore.meta ? window.ContentStore.meta() : { ts: 0, exists: false };
      window.ContentStore.hydrate(window.CS_DATA);
      rebuildDest();
      lastHydratedTs = m.ts; lastHydratedAt = Date.now(); dataSourceExists = m.exists;
    } catch (e) {}
  }
  /* classify how a given asset id resolves (for the debug panel) */
  function resolveKind(id) {
    if (!id) return { t: "بديل مولّد — لا إسناد", c: "dbg-ph" };
    if (window.ImageResolver.isDirect(id)) return { t: "صورة مرفوعة (src مباشر)", c: "dbg-real" };
    var a = asset(id);
    if (a && a.src) return { t: "أصل وسائط + src مرفوع · " + id, c: "dbg-real" };
    if (a) return { t: "أصل وسائط بلا src → رسم بديل · " + id, c: "dbg-ph" };
    return { t: "معرّف غير موجود → بديل · " + id, c: "dbg-ph" };
  }
  function fmtTs(ts) { if (!ts) return "—"; try { var dt = new Date(ts); return dt.toLocaleTimeString() + " · " + dt.toLocaleDateString("en-CA"); } catch (e) { return String(ts); } }
  function hashStr(s) { var h = 5381, i = s.length; while (i) { h = (h * 33) ^ s.charCodeAt(--i); } return (h >>> 0).toString(16); }
  function resolvedSrc(id, fbScene, fbHue) { var r = window.ImageResolver.classify(id, CS.media, fbScene, fbHue); return r.type === "img" ? r.src : null; }
  function dbgRows(d) {
    var rows = [], slots = [], coverSrc = resolvedSrc(d.cover_asset, d.scene, d.hue);
    function fp(src) { return "#" + hashStr(src).slice(0, 8) + " · " + src.length + " ح"; }
    function add(label, id, fbScene, fbHue, isCoverRow) {
      var src = resolvedSrc(id, fbScene, fbHue), direct = window.ImageResolver.isDirect(id), cls, t;
      if (src) {
        var reusesCover = !isCoverRow && coverSrc && src === coverSrc;
        cls = reusesCover ? "dbg-ph" : "dbg-real";
        t = (reusesCover ? "⚠ نفس صورة الغلاف · " : (direct ? "src مباشر · " : "وسائط+src · ")) + fp(src);
        slots.push({ label: label, src: src });
      } else { cls = "dbg-ph"; t = "بديل (رسم) — لا صورة" + (id ? " · id=" + id : " · لا إسناد"); }
      rows.push('<div class="dbg-row"><span class="dbg-k">' + esc(label) + '</span><span class="dbg-src ' + cls + '">' + esc(t) + "</span></div>");
    }
    add("الغلاف · cover", d.cover_asset, d.scene, d.hue, true);
    add("الوصول · arrival", d.arrival_asset, "island", 205);
    var h = hotelForDest(d); add("الفندق · hotel", h ? h.cover_asset : null, (h && h.scene) || d.scene, (h && h.hue) || d.hue);
    (d.dining || []).forEach(function (it, i) { add("مطعم[" + i + "] " + (it.n || ""), it.asset, it.scene, it.hue); });
    (d.cafes || []).forEach(function (it, i) { add("مقهى[" + i + "] " + (it.n || ""), it.asset, it.scene, it.hue); });
    (d.shopping || []).forEach(function (it, i) { add("تسوّق[" + i + "] " + (it.n || ""), it.asset, it.scene, it.hue); });
    (d.exchange || []).forEach(function (it, i) { add("صرافة[" + i + "] " + (it.n || ""), it.asset, it.scene, it.hue); });
    var bySrc = {}; slots.forEach(function (s) { (bySrc[s.src] = bySrc[s.src] || []).push(s.label); });
    var dups = Object.keys(bySrc).filter(function (k) { return bySrc[k].length > 1; });
    var dupHtml = dups.length
      ? '<div class="dbg-sub" style="color:#e0b04a">⚠ صور متكرّرة — نفس المصدر لأكثر من خانة (أسنِد صوراً مختلفة في الاستوديو):</div>' +
        dups.map(function (k) { return '<div class="dbg-row"><span class="dbg-k">#' + esc(hashStr(k).slice(0, 8)) + '</span><span class="dbg-src dbg-ph">' + esc(bySrc[k].join("  ·  ")) + "</span></div>"; }).join("")
      : '<div class="dbg-sub" style="color:#6fe0c8">✓ لا تكرار — كل خانة لها مصدر مختلف.</div>';
    return rows.join("") + dupHtml;
  }
  function renderDebug() {
    var host = document.getElementById("dbgPanel"); if (!host || host.hidden) return;
    var d = destById(state.destId);
    var saved = (window.ContentStore && window.ContentStore.meta) ? window.ContentStore.meta() : { ts: 0, exists: false };
    var srcLabel = saved.exists ? "ContentStore snapshot (تعديلات الاستوديو)" : "العيّنة الأساسية — لا تعديلات محفوظة";
    var stale = saved.ts && saved.ts > lastHydratedTs;
    var snapKB = 0; try { var _raw = window.localStorage.getItem("season_lab_content_v1"); snapKB = _raw ? Math.round(_raw.length / 1024) : 0; } catch (e) {}
    var snapWarn = snapKB > 3500;
    host.innerHTML =
      '<div class="dbg-head"><b>🔎 مصدر البيانات (مختبر)</b><button type="button" id="dbgClose" class="dbg-x">×</button></div>' +
      '<div class="dbg-meta">' +
        '<div class="dbg-row"><span class="dbg-k">الوجهة المختارة</span><span class="dbg-src">' + esc(state.destId || "—") + "</span></div>" +
        '<div class="dbg-row"><span class="dbg-k">مصدر بيانات المحرّك</span><span class="dbg-src ' + (saved.exists ? "dbg-real" : "dbg-ph") + '">' + esc(srcLabel) + "</span></div>" +
        '<div class="dbg-row"><span class="dbg-k">آخر حفظ (Studio)</span><span class="dbg-src">' + esc(fmtTs(saved.ts)) + "</span></div>" +
        '<div class="dbg-row"><span class="dbg-k">آخر ترطيب (Engine)</span><span class="dbg-src ' + (stale ? "dbg-ph" : "dbg-real") + '">' + esc(fmtTs(lastHydratedAt)) + (stale ? " · تحديث غير مُحمّل…" : " · محدّث") + "</span></div>" +
        '<div class="dbg-row"><span class="dbg-k">حجم اللقطة المحفوظة</span><span class="dbg-src ' + (snapWarn ? "dbg-ph" : "dbg-real") + '">' + snapKB + " KB" + (snapWarn ? " · ⚠ قد يتجاوز حد التخزين (الحفظ قد يفشل)" : "") + "</span></div>" +
      "</div>" +
      '<div class="dbg-sub">مصدر صورة كل خانة مرئية:</div><div class="dbg-list">' + dbgRows(d) + "</div>" +
      '<button type="button" id="dbgForce" class="dbg-force">↻ سحب أحدث البيانات الآن</button>';
  }
  function mountDebug() {
    if (document.getElementById("dbgToggle")) return;
    var t = document.createElement("button"); t.id = "dbgToggle"; t.type = "button"; t.className = "dbg-toggle"; t.textContent = "🔎 مصدر البيانات";
    var p = document.createElement("div"); p.id = "dbgPanel"; p.className = "dbg-panel"; p.hidden = true;
    document.body.appendChild(t); document.body.appendChild(p);
    t.addEventListener("click", function () { dbgOpen = !dbgOpen; p.hidden = !dbgOpen; renderDebug(); });
    document.addEventListener("click", function (e) {
      if (!e.target) return;
      if (e.target.id === "dbgClose") { dbgOpen = false; p.hidden = true; }
      if (e.target.id === "dbgForce") { freshHydrate(); render(); }
    });
  }
  var state = { destId: (DEST[0] || {}).id, concept: "magazine", layers: false, pdfStyle: "magazine" };

  function el(id) { return document.getElementById(id); }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]; }); }
  function destById(id) { return DEST.filter(function (d) { return d.id === id; })[0] || DEST[0]; }
  function brandOf(id) { return BRANDS[id] || BRANDS["season-indonesia"] || {}; }
  function asset(id) { return (CS.media || []).filter(function (a) { return a.asset_id === id; })[0]; }

  var ICON = {
    utensils: "M5 3v7a2 2 0 004 0V3M7 11v10M17 3c-2 0-3 2-3 5s1 4 3 4v9",
    bag: "M6 8h12l-1 12H7L6 8zM9 8V6a3 3 0 016 0v2",
    coffee: "M4 8h13v4a4 4 0 01-4 4H8a4 4 0 01-4-4V8zM17 9h2a2 2 0 010 4h-2M5 21h13",
    cash: "M2 7h20v10H2zM12 9a3 3 0 100 6 3 3 0 000-6z",
    shield: "M12 3l7 3v6c0 4-3 6.5-7 8-4-1.5-7-4-7-8V6l7-3z",
    car: "M5 11l1.6-4.2h10.8L19 11M4 16h16v-3H4zM7 16v2M17 16v2",
    sim: "M8 3h6l4 4v14H8zM11 13h4v5h-4z",
    plane: "M10.5 13.5 3 12l18-7-7 18-2.5-7.5z",
    star: "M12 3l2.6 5.3 5.9.9-4.2 4.1 1 5.8-5.3-2.8-5.3 2.8 1-5.8L3.5 9.2l5.9-.9z",
    info: "M12 16v-5M12 8h.01M12 21a9 9 0 100-18 9 9 0 000 18z",
    map: "M12 21s7-6.5 7-12a7 7 0 10-14 0c0 5.5 7 12 7 12zM12 11a2 2 0 100-4 2 2 0 000 4z",
    compass: "M12 21a9 9 0 100-18 9 9 0 000 18zM15.5 8.5l-2 5-5 2 2-5 5-2z",
    phone: "M5 4h4l2 5-2.5 1.5a12 12 0 006 6L16 14l5 2v4a2 2 0 01-2 2A16 16 0 013 6a2 2 0 012-2z",
    bed: "M3 7v11M3 12h18v6M21 12V9a2 2 0 00-2-2h-7v5M7 11a2 2 0 100-3 2 2 0 000 3z",
    key: "M14 7a4 4 0 11-3.4 6.1L4 19.7 6.3 22M10.6 13.1 8 15.7",
    calendar: "M4 5h16v16H4zM4 9h16M9 3v4M15 3v4",
    pin: "M12 21s7-6.5 7-12a7 7 0 10-14 0c0 5.5 7 12 7 12zM12 11a2 2 0 100-4 2 2 0 000 4z",
    sprig: "M12 21c0-7 0-10 0-13M12 8c3.2 0 5-2 5-5-3.2 0-5 2-5 5zM12 12c-3.2 0-5-2-5-5 3.2 0 5 2 5 5z",
    cross: "M10 4h4v6h6v4h-6v6h-4v-6H4v-4h6z",
    headset: "M4 13a8 8 0 0116 0M4 13v3a2 2 0 002 2h1v-6H6a2 2 0 00-2 1zM20 13v3a2 2 0 01-2 2h-1v-6h1a2 2 0 012 1z",
    embassy: "M3 21h18M5 21V10M9 21V10M15 21V10M19 21V10M4 10h16M12 3l8 5H4z"
  };
  function icon(n) { return '<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="' + (ICON[n] || ICON.info) + '"/></svg>'; }

  function scenery(scene, h) {
    var sun = '<circle cx="312" cy="42" r="22" fill="rgba(255,242,205,0.5)"/><circle cx="312" cy="42" r="12" fill="rgba(255,247,228,0.9)"/>';
    if (scene === "temple") return sun + '<path d="M0 ' + (h - 24) + ' H400 V' + h + ' H0Z" fill="rgba(0,0,0,0.22)"/><path d="M150 ' + (h - 24) + ' l32 -80 32 80z" fill="rgba(0,0,0,0.4)"/><path d="M70 ' + (h - 24) + ' l22 -54 22 54z" fill="rgba(0,0,0,0.3)"/><path d="M250 ' + (h - 24) + ' l24 -60 24 60z" fill="rgba(0,0,0,0.28)"/>';
    if (scene === "island") return sun + '<path d="M0 ' + (h - 22) + ' Q120 ' + (h - 44) + ' 240 ' + (h - 26) + ' T400 ' + (h - 30) + ' V' + h + ' H0Z" fill="rgba(0,0,0,0.22)"/><path d="M-10 ' + (h - 30) + ' Q70 ' + (h - 86) + ' 150 ' + (h - 30) + 'Z" fill="rgba(0,0,0,0.38)"/><path d="M150 ' + (h - 30) + ' Q250 ' + (h - 104) + ' 350 ' + (h - 30) + 'Z" fill="rgba(0,0,0,0.3)"/>';
    if (scene === "city") return sun + '<g fill="rgba(0,0,0,0.34)"><rect x="40" y="' + (h - 78) + '" width="40" height="78"/><rect x="92" y="' + (h - 56) + '" width="34" height="56"/><rect x="140" y="' + (h - 96) + '" width="30" height="96"/><rect x="182" y="' + (h - 64) + '" width="40" height="64"/><rect x="236" y="' + (h - 84) + '" width="32" height="84"/><rect x="280" y="' + (h - 50) + '" width="44" height="50"/></g>';
    if (scene === "resort") return sun + '<path d="M0 ' + (h - 24) + ' H400 V' + h + ' H0Z" fill="rgba(0,0,0,0.22)"/><rect x="70" y="' + (h - 70) + '" width="110" height="46" rx="4" fill="rgba(0,0,0,0.32)"/><rect x="206" y="' + (h - 56) + '" width="84" height="32" rx="4" fill="rgba(0,0,0,0.26)"/>';
    return sun + '<path d="M0 ' + (h - 24) + ' Q100 ' + (h - 40) + ' 200 ' + (h - 26) + ' T400 ' + (h - 30) + ' V' + h + ' H0Z" fill="rgba(0,0,0,0.2)"/><path d="M64 ' + (h - 24) + ' v-44 M64 ' + (h - 68) + ' q-18 -6 -28 6 M64 ' + (h - 68) + ' q18 -6 28 6" stroke="rgba(0,0,0,0.4)" stroke-width="3" fill="none"/>';
  }
  function svg(scene, hue, h) {
    var c1 = "hsl(" + hue + ",46%,18%)", c2 = "hsl(" + hue + ",42%,37%)";
    return '<svg class="img-svg" viewBox="0 0 400 ' + h + '" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><defs><linearGradient id="tg' + hue + "_" + h + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + c1 + '"/><stop offset="0.6" stop-color="' + c2 + '"/><stop offset="1" stop-color="' + c1 + '"/></linearGradient></defs><rect width="400" height="' + h + '" fill="url(#tg' + hue + "_" + h + ')"/>' + scenery(scene, h) + "</svg>";
  }
  function destImg(d, h) { return window.ImageResolver.render(d.cover_asset, d.scene, d.hue, h, { media: CS.media, svg: svg }); }
  function logo(t) { return '<svg viewBox="0 0 40 40" fill="none" class="tpl-logo"><path d="M20 3 L24 16 L37 20 L24 24 L20 37 L16 24 L3 20 L16 16 Z" stroke="' + t + '" stroke-width="1.6" stroke-linejoin="round"/><circle cx="20" cy="20" r="3.4" fill="' + t + '"/></svg>'; }

  /* ---------- reusable BLOCKS --------------------------------------- */
  function blkHero(d, br) {
    return '<header class="tpl-hero">' + destImg(d, 280) + '<div class="tpl-hero-ov"><div class="tpl-brandrow">' + logo(br.logoTint) + '<span class="tpl-brand">' + esc(br.name) + '</span></div><span class="tpl-tag">' + esc(d.tagline || d.country || "") + '</span><h1 class="tpl-title">' + esc(d.name) + "</h1></div></header>";
  }
  function blkIntro(d, b) { return '<section class="blk blk-intro"><p class="intro-p">' + esc(b.intro || d.tagline || "") + "</p></section>"; }
  function blkWelcome(d, b) { return '<section class="blk blk-welcome"><span class="wl-k">أهلاً بك في</span><h2 class="wl-h">' + esc(d.name) + '</h2><p class="intro-p">' + esc(b.intro || "") + "</p></section>"; }
  function recImg(r, h) { return window.ImageResolver.render(r.asset, r.scene, r.hue, h, { media: CS.media, svg: svg }); }
  function recCards(items) {
    return '<div class="rec-grid">' + (items || []).map(function (r) {
      return '<article class="rec"><div class="rec-img">' + recImg(r, 110) + '</div><div class="rec-b"><span class="rec-n">' + esc(r.n) + '</span>' + (r.area ? '<span class="rec-area">' + icon("map") + esc(r.area) + "</span>" : "") + '<span class="rec-note">' + esc(r.note || "") + "</span></div></article>";
    }).join("") + "</div>";
  }
  function blk(key, title, ic, inner) { return '<section class="blk blk-' + key + '"><h3 class="blk-h">' + icon(ic) + "<span>" + title + "</span></h3>" + inner + "</section>"; }
  function blkRecs(b) { return blk("restaurants", "أين تأكل", "utensils", recCards(b.restaurants)); }
  function blkShopping(b) { return blk("shopping", "التسوّق", "bag", recCards(b.shopping)); }
  function blkCafes(b) { return blk("cafes", "المقاهي", "coffee", recCards(b.cafes)); }
  function blkExchange(b) { return blk("exchange", "صرافة العملات", "cash", recCards(b.exchange)); }
  function blkAreas(d) {
    var items = (d.areas || []).map(function (aid) { var a = destById(aid); return a && a.id ? a : null; }).filter(Boolean);
    if (!items.length) return "";
    return blk("areas", "المناطق الموصى بها", "compass", '<div class="area-grid">' + items.map(function (a) { return '<div class="area-card">' + destImg(a, 90) + '<div class="area-b"><span class="area-n">' + esc(a.name) + '</span><span class="area-d">' + esc(a.tagline || "") + "</span></div></div>"; }).join("") + "</div>");
  }
  function kv(k, v) { return '<div class="kv"><span class="kv-k">' + k + '</span><span class="kv-v">' + esc(v) + "</span></div>"; }
  function blkArrival(d) { var a = d.arrival || {}; return blk("arrival", "معلومات الوصول", "plane", kv("المطار", a.airport) + (a.notes ? kv("ملاحظات", a.notes) : "") + kv("الجوازات", a.immigration) + kv("أول الخطوات", a.firstSteps)); }
  function blkSim(d) { return blk("sim", "شريحة الاتصال", "sim", kv("الشريحة", d.sim) + (d.internetTips ? kv("الإنترنت", d.internetTips) : "")); }
  function blkCurrency(d) { return blk("currency", "العملة", "cash", kv("العملة", d.currency) + (d.exchangeTips ? kv("الصرف", d.exchangeTips) : "")); }
  function blkTransport(d) { return blk("transport", "التنقّل", "car", kv("الوسائل", d.transport)); }
  function blkEmergency(d) { return '<section class="blk blk-emergency"><div class="emo">' + icon("shield") + '<div><span class="emo-k">جهات الطوارئ</span><span class="emo-v">' + esc(d.emergency) + (d.hospital ? " · " + esc(d.hospital) : "") + (d.support247 ? "<br>" + esc(d.support247) : "") + "</span></div></div></section>"; }
  function blkTop(b) { return blk("top", "اخترنا لك", "star", '<div class="top-grid">' + (b.topRecs || []).map(function (r) { return '<div class="top-card"><span class="top-n">' + esc(r.n) + '</span><span class="top-d">' + esc(r.note || "") + "</span></div>"; }).join("") + "</div>"); }
  function blkTips(b) { return blk("tips", "نصائح مهمة", "info", '<ul class="tips-list">' + (b.tips || []).map(function (t) { var o = (t && typeof t === "object") ? t : { t: String(t), d: "", cat: "" }; return '<li>' + (o.cat ? '<span class="tip-cat">' + esc(o.cat) + "</span>" : "") + '<b class="tip-t">' + esc(o.t) + "</b>" + (o.d ? '<span class="tip-d">' + esc(o.d) + "</span>" : "") + "</li>"; }).join("") + "</ul>"); }

  var BLKFN = {
    hero: function (d, b, br) { return blkHero(d, br); }, intro: function (d, b) { return blkIntro(d, b); }, welcome: function (d, b) { return blkWelcome(d, b); },
    areas: function (d) { return blkAreas(d); }, restaurants: function (d, b) { return blkRecs(b); }, shopping: function (d, b) { return blkShopping(b); },
    cafes: function (d, b) { return blkCafes(b); }, exchange: function (d, b) { return blkExchange(b); }, arrival: function (d) { return blkArrival(d); },
    sim: function (d) { return blkSim(d); }, currency: function (d) { return blkCurrency(d); }, transport: function (d) { return blkTransport(d); },
    emergency: function (d) { return blkEmergency(d); }, topRecs: function (d, b) { return blkTop(b); }, tips: function (d, b) { return blkTips(b); }
  };

  /* ---------- compose a concept from blocks ------------------------- */
  function compose(conceptId, d) {
    var c = CONCEPTS.filter(function (x) { return x.id === conceptId; })[0] || CONCEPTS[0];
    var b = blocksFor(d), br = brandOf(d.brand);
    var html = c.blocks.map(function (k) { var fn = BLKFN[k]; return fn ? fn(d, b, br) : ""; }).join("");
    return '<div class="tpl-doc concept-' + c.id + '" style="--bp:' + br.palette[1] + ";--ba:" + br.palette[2] + ";--bg1:" + br.palette[0] + '">' + html + '<p class="tpl-foot">يُجمَّع هذا الدليل من بلوكات تستهلك محتوى الاستوديو — لا صفحات ثابتة. (نموذج)</p></div>';
  }

  /* ---------- PDF preview — Luxury Travel Magazine system ----------- */
  var PDF_STYLES = [["magazine", "مجلة فاخرة"], ["guide", "دليل سفر حديث"], ["concierge", "كونسيرج مينمال"]];
  function imgFill(assetId, scene, hue, h) { return window.ImageResolver.render(assetId, scene, hue, h, { media: CS.media, svg: svg }); }
  function hotelForDest(d) { var hs = (CS.hotels || []); var direct = hs.filter(function (h) { return h.destination === d.id; }); if (direct[0]) return direct[0]; var areas = d.areas || []; var inArea = hs.filter(function (h) { return areas.indexOf(h.destination) >= 0; }); return inArea[0] || null; }
  function top3(arr) { return (arr || []).slice(0, 3); }
  function pdfFoot(n, br, total) { return '<footer class="pdf-foot"><span>' + esc(br.name) + '</span><span dir="ltr">' + n + " / " + (total || 6) + "</span></footer>"; }
  function pdfBanner(eyebrow, title, assetId, scene, hue) { return '<div class="pdf-banner">' + imgFill(assetId, scene, hue, 460) + '<div class="pdf-banner-grad"></div><div class="pdf-banner-tx"><span class="pdf-eyebrow">' + esc(eyebrow) + '</span><h2 class="pdf-h2">' + esc(title) + "</h2></div></div>"; }
  function iconCard(ic, label, value) { if (!value) return ""; return '<div class="pdf-icard"><div class="pdf-ic">' + icon(ic) + '</div><span class="pdf-icard-k">' + esc(label) + '</span><span class="pdf-icard-v">' + esc(value) + "</span></div>"; }
  function recCard(r) { return '<article class="pdf-rcard"><div class="pdf-rcard-img">' + imgFill(r.asset, r.scene, r.hue, 360) + '</div><div class="pdf-rcard-b"><h4 class="pdf-rcard-n">' + esc(r.n) + "</h4>" + (r.area ? '<span class="pdf-rcard-a">' + icon("pin") + esc(r.area) + "</span>" : "") + (r.note ? '<p class="pdf-rcard-d">' + esc(r.note) + "</p>" : "") + "</div></article>"; }
  function recFeature(r) { if (!r) return ""; return '<article class="pdf-feature"><div class="pdf-feature-img">' + imgFill(r.asset, r.scene, r.hue, 520) + '</div><div class="pdf-feature-b"><span class="pdf-feature-tag">توصية مختارة</span><h4 class="pdf-feature-n">' + esc(r.n) + "</h4>" + (r.area ? '<span class="pdf-rcard-a">' + icon("pin") + esc(r.area) + "</span>" : "") + (r.note ? '<p class="pdf-feature-d">' + esc(r.note) + "</p>" : "") + "</div></article>"; }
  function recTrio(items) { return '<div class="pdf-trio">' + top3(items).map(recCard).join("") + "</div>"; }

  /* editorial guide helpers ----------------------------------------- */
  function edProse(parts) { return parts.filter(Boolean).join("، ").replace(/←/g, "ثم").replace(/·/g, "،") + "."; }
  function arrivalProse(a) { return edProse([a.airport ? "تصل رحلتك إلى مطار " + a.airport : "", a.immigration ? "ويُمنح المسافرون " + a.immigration : "", a.notes, a.firstSteps]); }
  function simProse(d) { return edProse([d.sim ? "تتوفّر شريحة الاتصال " + d.sim + " فور وصولك" : "", d.internetTips]); }
  function currencyProse(d) { return edProse([d.currency ? "العملة المحلية هي " + d.currency : "", d.exchangeTips]); }
  function edFeaturePage(n, total, br, o) {
    return '<section class="pdf-page pdf-ed"><div class="pdf-ed-img">' + imgFill(o.asset, o.scene, o.hue, 760) + '</div><div class="pdf-ed-body">' + (o.eyebrow ? '<span class="pdf-ed-eyebrow">' + esc(o.eyebrow) + "</span>" : "") + '<h2 class="pdf-ed-title">' + esc(o.title) + "</h2>" + (o.area ? '<span class="pdf-ed-area">' + esc(o.area) + "</span>" : "") + (o.paragraph ? '<p class="pdf-ed-text">' + esc(o.paragraph) + "</p>" : "") + (o.detail ? '<div class="pdf-ed-detail">' + esc(o.detail) + "</div>" : "") + '<span class="pdf-ed-divider"></span></div>' + pdfFoot(n, br, total) + "</section>";
  }
  function edEmergencyPage(n, total, br, d) {
    function row(k, v) { return v ? '<div class="pdf-em-row"><span class="pdf-em-k">' + esc(k) + '</span><span class="pdf-em-v2">' + esc(v) + "</span></div>" : ""; }
    return '<section class="pdf-page pdf-ed pdf-em-page"><div class="pdf-ed-body pdf-em-body"><span class="pdf-ed-eyebrow">معلومات مهمة</span><h2 class="pdf-ed-title">الطوارئ والدعم</h2><div class="pdf-em-list">' + row("الطوارئ", d.emergency) + row("المستشفى", d.hospital) + row("السفارة", "سفارة المملكة العربية السعودية · جاكرتا") + row("دعم سيزون على مدار الساعة", d.support247) + '</div><span class="pdf-ed-divider"></span></div>' + pdfFoot(n, br, total) + "</section>";
  }
  function edHero(asset, scene, hue, h) { return '<div class="ed-hero-img">' + imgFill(asset, scene, hue, h || 640) + "</div>"; }
  function edFeatTx(eyebrow, r) { return '<span class="pdf-ed-eyebrow">' + esc(eyebrow) + '</span><h3 class="ed-feat-title">' + esc(r.n) + "</h3>" + (r.area ? '<span class="pdf-ed-area">' + esc(r.area) + "</span>" : "") + (r.note ? '<p class="ed-feat-text">' + esc(r.note) + "</p>" : ""); }
  function edSecondary(r) { return '<article class="ed-sec2"><div class="ed-sec2-img">' + imgFill(r.asset, r.scene, r.hue, 280) + '</div><div class="ed-sec2-b"><h4 class="ed-sec2-n">' + esc(r.n) + "</h4>" + (r.area ? '<span class="ed-sec2-a">' + esc(r.area) + "</span>" : "") + (r.note ? '<p class="ed-sec2-d">' + esc(r.note) + "</p>" : "") + "</div></article>"; }
  function edSub(r) { return '<article class="ed-sub"><div class="ed-sub-img">' + imgFill(r.asset, r.scene, r.hue, 280) + '</div><h4 class="ed-sub-n">' + esc(r.n) + "</h4>" + (r.area ? '<span class="ed-sub-a">' + esc(r.area) + "</span>" : "") + (r.note ? '<p class="ed-sub-d">' + esc(r.note) + "</p>" : "") + "</article>"; }
  function edSubGroup(subs) { if (!subs.length) return ""; return '<span class="ed-sep"></span><div class="ed-sec-fill">' + subs.slice(0, 2).map(edSecondary).join("") + "</div>"; }
  function edRecPage(n, total, br, eyebrow, items) {
    var f = items[0];
    return '<section class="pdf-page pdf-ed ed-recpage">' + edHero(f.asset, f.scene, f.hue, 470) + '<div class="pdf-ed-body ed-recbody">' + edFeatTx(eyebrow, f) + edSubGroup(items.slice(1, 3)) + "</div>" + pdfFoot(n, br, total) + "</section>";
  }
  function edWelcomePage(n, total, br, d, a) {
    var conn = simProse(d);
    var arrHero = d.arrival_asset || null;
    return '<section class="pdf-page pdf-ed ed-infopage">' + edHero(arrHero, "island", 205, 640) + '<div class="pdf-ed-body"><span class="pdf-ed-eyebrow">أهلاً بك</span><h2 class="pdf-ed-title">الوصول إلى ' + esc(d.name) + '</h2><p class="pdf-ed-text">' + esc(arrivalProse(a)) + "</p>" + (conn ? '<div class="ed-note"><span class="ed-note-k">الاتصال والإنترنت</span><span class="ed-note-v">' + esc(conn) + "</span></div>" : "") + '<span class="pdf-ed-divider"></span></div>' + pdfFoot(n, br, total) + "</section>";
  }
  function edMoneyPage(n, total, br, d, items) {
    function office(r) { return '<div class="ed-money-row"><div class="ed-money-h"><span class="ed-money-n">' + esc(r.n) + "</span>" + (r.area ? '<span class="ed-money-a">' + esc(r.area) + "</span>" : "") + "</div>" + (r.note ? '<span class="ed-money-d">' + esc(r.note) + "</span>" : "") + "</div>"; }
    return '<section class="pdf-page pdf-ed ed-moneypage"><div class="pdf-ed-body"><span class="pdf-ed-eyebrow">المال والصرافة</span><h2 class="pdf-ed-title">تبديل العملات</h2><p class="pdf-ed-text">' + esc(currencyProse(d)) + "</p>" + (items.length ? '<div class="ed-money-list">' + items.slice(0, 3).map(office).join("") + "</div>" : "") + '<div class="ed-money-notes"><span class="ed-money-notes-h">ملاحظات</span><p class="ed-money-notes-p">احتفظ بإيصال التبديل، وتأكّد من سعر الصرف المعروض قبل إتمام العملية. تتوفّر أجهزة الصراف الآلي في المراكز التجارية الكبرى.</p></div><span class="pdf-ed-divider"></span></div>' + pdfFoot(n, br, total) + "</section>";
  }
  function edHotelPage(n, total, br, hModel, d, det) {
    var hls = (hModel.highlights || []).slice(0, 3).map(function (h) { return '<div class="ed-hotel-hl"><span class="ed-hotel-hl-dot"></span><span class="ed-hotel-hl-t">' + esc(h) + "</span></div>"; }).join("");
    return '<section class="pdf-page pdf-ed ed-infopage ed-hotelpage">' + edHero(hModel.cover_asset, hModel.scene || d.scene, hModel.hue || d.hue, 640) + '<div class="pdf-ed-body"><span class="pdf-ed-eyebrow">إقامتك</span><h2 class="pdf-ed-title">' + esc(hModel.name) + "</h2>" + ((hModel.location || d.name) ? '<span class="pdf-ed-area">' + esc(hModel.location || d.name) + "</span>" : "") + (hModel.description ? '<p class="pdf-ed-text">' + esc(hModel.description) + "</p>" : "") + (hls ? '<div class="ed-hotel-hls">' + hls + "</div>" : "") + (det ? '<div class="pdf-ed-detail">' + esc(det) + "</div>" : "") + '<span class="pdf-ed-divider"></span></div>' + pdfFoot(n, br, total) + "</section>";
  }
  function buildPDF(d, style) {
    var br = brandOf(d.brand), b = blocksFor(d), a = d.arrival || {}, tr = (window.TPL_DATA && TPL_DATA.previewTrip) || {}, hotel = hotelForDest(d);
    var hModel = hotel || { name: "يُحدَّد عند تأكيد الحجز", location: d.name, checkIn: "١٥:٠٠", checkOut: "١٢:٠٠", cover_asset: null, scene: d.scene, hue: d.hue, highlights: [] };
    var L = br.palette, hero = d.cover_asset;
    var cover = '<section class="pdf-page pdf-cover-page">' + imgFill(hero, d.scene, d.hue, 1123) + '<div class="pdf-cover-grad"></div><div class="pdf-cover-top">' + logo(br.logoTint) + '<span class="pdf-cover-brand">' + esc(br.name) + '</span></div><div class="pdf-cover-ov"><span class="pdf-cover-eyebrow">دليل سفر سيزون</span><h1 class="pdf-cover-title">' + esc(d.name) + '</h1><div class="pdf-cover-meta"><span>' + esc(tr.traveler || "") + '</span><span class="pdf-cover-dot">·</span><span dir="auto">' + esc(tr.dates || "") + "</span></div></div></section>";
    var why = (hModel.highlights || []).join(" · ");
    var det = ["تسجيل الدخول " + (hModel.checkIn || "١٥:٠٠"), "تسجيل الخروج " + (hModel.checkOut || "١٢:٠٠"), tr.confirmation ? "رقم التأكيد " + tr.confirmation : ""].filter(Boolean).join("    ·    ");
    var pages = [];
    pages.push(function (n, t) { return cover; });
    pages.push(function (n, t) { return edWelcomePage(n, t, br, d, a); });
    pages.push(function (n, t) { return edHotelPage(n, t, br, hModel, d, det); });
    if (top3(b.restaurants).length) pages.push(function (n, t) { return edRecPage(n, t, br, "مطعم موصى به", top3(b.restaurants)); });
    if (top3(b.cafes).length) pages.push(function (n, t) { return edRecPage(n, t, br, "مقهى موصى به", top3(b.cafes)); });
    if (top3(b.shopping).length) pages.push(function (n, t) { return edRecPage(n, t, br, "وجهة تسوّق", top3(b.shopping)); });
    pages.push(function (n, t) { return edMoneyPage(n, t, br, d, b.exchange || []); });
    pages.push(function (n, t) { return edEmergencyPage(n, t, br, d); });
    var total = pages.length, html = pages.map(function (fn, i) { return fn(i + 1, total); }).join("");
    return '<div class="pdf-doc pdf-style-' + (style || "magazine") + '" id="pdfDoc" style="--pa:' + L[2] + ";--pp:" + L[1] + ";--pd:" + L[0] + '">' + html + "</div>";
  }
  function fitPDF() { var doc = document.getElementById("pdfDoc"); if (doc) { try { doc.style.zoom = Math.min(1, (window.innerWidth - 24) / 794); } catch (e) {} } }
  function renderPDFDoc() { freshHydrate(); var sc = document.querySelector("#pdfOverlay .pdf-scroll"); if (!sc) return; sc.innerHTML = buildPDF(destById(state.destId), state.pdfStyle); fitPDF(); }
  function openPDF() {
    freshHydrate();
    var d = destById(state.destId);
    if (!state.pdfStyle) state.pdfStyle = "magazine";
    var ov = document.getElementById("pdfOverlay");
    if (!ov) { ov = document.createElement("div"); ov.id = "pdfOverlay"; ov.className = "pdf-overlay"; document.body.appendChild(ov); }
    var styleBtns = PDF_STYLES.map(function (s) { return '<button type="button" class="pdf-style-btn' + (state.pdfStyle === s[0] ? " on" : "") + '" data-pdfstyle="' + s[0] + '">' + s[1] + "</button>"; }).join("");
    ov.innerHTML = '<div class="pdf-toolbar"><span class="pdf-ttl">معاينة المجلة — ' + esc(d.name) + '</span><div class="pdf-styles">' + styleBtns + '</div><div class="pdf-tacts"><button type="button" class="pdf-print" id="pdfServer">توليد PDF (خادم)</button><button type="button" class="pdf-print" id="pdfPrint">حفظ / طباعة</button><button type="button" class="pdf-close" id="pdfCloseBtn">إغلاق</button></div></div><div class="pdf-scroll"></div><p class="pdf-note">معاينة بصرية — يُولَّد من محتوى استوديو المحتوى نفسه. «توليد PDF (خادم)» ينتج ملفاً نهائياً عبر Chromium ويُنزّله مباشرة.</p>';
    ov.hidden = false; document.body.classList.add("pdf-open");
    var srvBtn = document.getElementById("pdfServer");
    if (srvBtn) srvBtn.addEventListener("click", function () {
      if (typeof window.exportSeasonPDF !== "function") { alert("خدمة التوليد غير محمّلة."); return; }
      srvBtn.disabled = true; var t = srvBtn.textContent; srvBtn.textContent = "...جارٍ التوليد";
      Promise.resolve(window.exportSeasonPDF(state.destId, state.pdfStyle))
        .catch(function (e) { alert("تعذّر التوليد: " + (e && e.message || e)); })
        .then(function () { srvBtn.disabled = false; srvBtn.textContent = t; });
    });
    document.getElementById("pdfPrint").addEventListener("click", printPDF);
    document.getElementById("pdfCloseBtn").addEventListener("click", closePDF);
    ov.querySelector(".pdf-styles").addEventListener("click", function (e) { var btn = e.target.closest("[data-pdfstyle]"); if (!btn) return; state.pdfStyle = btn.getAttribute("data-pdfstyle"); Array.prototype.forEach.call(ov.querySelectorAll("[data-pdfstyle]"), function (x) { x.classList.toggle("on", x === btn); }); renderPDFDoc(); });
    renderPDFDoc();
  }
  function closePDF() { var ov = document.getElementById("pdfOverlay"); if (ov) { ov.hidden = true; ov.innerHTML = ""; } document.body.classList.remove("pdf-open"); }
  function printPDF() {
    var doc = document.getElementById("pdfDoc"); if (!doc) return;
    var w = null; try { w = window.open("", "_blank"); } catch (e) { w = null; }
    if (!w) { window.print(); return; }
    var head = "";
    Array.prototype.forEach.call(document.querySelectorAll('link[rel="stylesheet"]'), function (l) { var href = l.getAttribute("href"); if (href) { try { head += '<link rel="stylesheet" href="' + new URL(href, location.href).href + '">'; } catch (e) {} } });
    var html = '<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8">' + head + '<style>@page{size:A4;margin:0}html,body{margin:0!important;padding:0!important;background:#fff}#pdfDoc{zoom:1!important;width:auto!important;display:block!important;margin:0!important;padding:0!important;gap:0!important;line-height:0!important;font-size:0!important}.pdf-page{box-shadow:none!important;margin:0 auto!important;padding:0!important;box-sizing:border-box;width:210mm;height:296mm;zoom:0.82;overflow:hidden;line-height:normal;font-size:medium;page-break-inside:avoid;break-inside:avoid}.pdf-page:not(:first-child){page-break-before:always;break-before:page}</style></head><body>' + doc.outerHTML + "</body></html>";
    w.document.open(); w.document.write(html); w.document.close();
    var done = false;
    function go() { if (done) return; done = true; try { w.focus(); w.print(); } catch (e) {} }
    function whenImagesReady() {
      var imgs = [];
      try { imgs = Array.prototype.slice.call(w.document.images || []); } catch (e) { return go(); }
      var pending = imgs.filter(function (im) { return !im.complete || im.naturalWidth === 0; });
      if (!pending.length) return go();
      var left = pending.length;
      function tick() { left--; if (left <= 0) go(); }
      pending.forEach(function (im) { im.addEventListener("load", tick); im.addEventListener("error", tick); });
      setTimeout(go, 2500); // safety fallback so print never hangs
    }
    try {
      if (w.document.readyState === "complete") whenImagesReady();
      else w.addEventListener("load", whenImagesReady);
    } catch (e) { /* cross-origin guard */ }
    setTimeout(whenImagesReady, 700); // in case load already fired before listener attached
  }

  /* ---------- Restaurant Feature Card — finalized (R1) ------------- */
  /* ---------- editorial recommendation blocks (magazine layout) ---- */
  function editorialBlock(r) {
    return '<article class="eb"><div class="eb-img">' + imgFill(r.asset, r.scene, r.hue, 760) + '</div><div class="eb-body"><h3 class="eb-name">' + esc(r.n) + "</h3>" + (r.area ? '<span class="eb-area">' + esc(r.area) + "</span>" : "") + (r.note ? '<p class="eb-note">' + esc(r.note) + "</p>" : "") + "</div></article>";
  }
  function editorialSection(title, items) {
    if (!items || !items.length) return "";
    return '<section class="eb-sec"><h2 class="eb-sec-h">' + title + "</h2>" + items.map(editorialBlock).join("") + "</section>";
  }
  function openCards() {
    var d = destById(state.destId), b = blocksFor(d);
    var ov = document.getElementById("cardsOverlay");
    if (!ov) { ov = document.createElement("div"); ov.id = "cardsOverlay"; ov.className = "pdf-overlay cards-overlay"; document.body.appendChild(ov); }
    var html = editorialSection("مطاعم موصى بها", b.restaurants) + editorialSection("مقاهٍ مختارة", b.cafes) + editorialSection("وجهات التسوّق", b.shopping) + editorialSection("صرافة العملات", b.exchange);
    if (!html) html = '<p class="pdf-note">لا توصيات لهذه الوجهة.</p>';
    ov.innerHTML = '<div class="pdf-toolbar"><span class="pdf-ttl">التوصيات — أسلوب مجلة السفر · ' + esc(d.name) + '</span><button type="button" class="pdf-close" id="cardsClose">إغلاق</button></div><div class="pdf-scroll eb-scroll"><div class="eb-page">' + html + '</div></div><p class="pdf-note">بلوكات تحريرية مكدّسة عمودياً بأسلوب مجلة السفر — لا كروت ولا شبكات. تستهلك محتوى استوديو المحتوى نفسه. (لم تُمسّ صفحات الـPDF.)</p>';
    ov.hidden = false; document.body.classList.add("pdf-open");
    document.getElementById("cardsClose").addEventListener("click", closeCards);
  }
  function closeCards() { var ov = document.getElementById("cardsOverlay"); if (ov) { ov.hidden = true; ov.innerHTML = ""; } document.body.classList.remove("pdf-open"); }

  /* ---------- 5-layer inspector ------------------------------------- */
  function layerPanel(d) {
    var b = blocksFor(d), br = brandOf(d.brand), cov = asset(d.cover_asset);
    var recCount = ((b.restaurants || []).length + (b.shopping || []).length + (b.cafes || []).length + (b.exchange || []).length);
    var areaCount = (d.areas || []).length;
    var rows = [
      ["١", "صورة البطل (Hero)", (d.cover_asset || "—") + (cov ? " · " + cov.status : "")],
      ["٢", "صور المناطق", areaCount ? areaCount + " منطقة" : "لا مناطق"],
      ["٣", "صور التوصيات", recCount + " عنصر"],
      ["٤", "الأيقونات", "مجموعة موحّدة (SVG)"],
      ["٥", "عناصر العلامة", br.name + " · شعار + لوحة ألوان"]
    ];
    return '<div class="layers' + (state.layers ? " open" : "") + '"><div class="layers-h">نظام الطبقات (٥)</div>' + rows.map(function (r) { return '<div class="layer-row"><span class="layer-n">' + r[0] + '</span><div class="layer-b"><span class="layer-t">' + r[1] + '</span><span class="layer-s">' + esc(r[2]) + "</span></div></div>"; }).join("") + "</div>";
  }

  /* ---------- render ------------------------------------------------- */
  function render() {
    var d = destById(state.destId), br = brandOf(d.brand);
    el("resolveChip").innerHTML = 'العلامة تُحلّ تلقائياً: <b>' + esc(d.name) + '</b> → <b>' + esc(br.name) + "</b>";
    Array.prototype.forEach.call(document.querySelectorAll("[data-concept]"), function (x) { x.classList.toggle("on", x.getAttribute("data-concept") === state.concept); });
    el("layerBtn").classList.toggle("on", state.layers);
    el("stage").innerHTML = compose(state.concept, d);
    el("inspector").innerHTML = layerPanel(d);
    renderDebug();
  }
  function wire() {
    el("now").textContent = (TPL.meta && TPL.meta.now) || "";
    el("destSelect").innerHTML = DEST.map(function (d) { return '<option value="' + d.id + '">' + esc(d.name) + " · " + esc(brandOf(d.brand).name) + "</option>"; }).join("");
    el("destSelect").addEventListener("change", function (e) { state.destId = e.target.value; render(); });
    el("conceptTabs").innerHTML = CONCEPTS.map(function (c) { return '<button type="button" class="ctab" data-concept="' + c.id + '">' + esc(c.name) + "</button>"; }).join("");
    document.addEventListener("click", function (e) {
      var c = e.target.closest("[data-concept]"); if (c) { state.concept = c.getAttribute("data-concept"); render(); return; }
      if (e.target.closest("#layerBtn")) { state.layers = !state.layers; render(); }
      if (e.target.closest("#pdfBtn")) { openPDF(); }
      if (e.target.closest("#cardsBtn")) { openCards(); }
    });
    window.addEventListener("resize", function () { if (document.body.classList.contains("pdf-open")) fitPDF(); });
  }
  /* ---------- dedicated PDF render mode (/pdf-render.html) ----------
     Reuses the EXACT page builders (buildPDF) the preview uses, so the
     exported PDF and the on-screen preview share ONE editorial layout and
     can never drift. In this mode the engine builds ONLY the A4 pages —
     no header, toolbar, overlay, or scroll UI is created. Chromium/Playwright
     captures this page; iOS Safari print is no longer involved. */
  function repl(arr, next) { if (arr && next) { arr.length = 0; for (var i = 0; i < next.length; i++) arr.push(next[i]); } }
  function applySnapshot(s) {
    if (!s) return;
    repl(CS.destinations, s.destinations);
    repl(CS.hotels, s.hotels);
    repl(CS.media, s.media);
    if (s.brands) { CS.brands = s.brands; BRANDS = CS.brands; }
    try { if (window.ContentStore && window.ContentStore.repair) window.ContentStore.repair(CS); } catch (e) {}
    rebuildDest();
  }
  window.__buildPDFDoc = function (destId, style) {
    return buildPDF(destById(destId || (DEST[0] && DEST[0].id)), style || "magazine");
  };
  function bootRender() {
    // 1) Content source: an injected snapshot (headless Chromium) wins;
    //    otherwise the same Content Studio store the app uses (localStorage).
    if (window.__CS_SNAPSHOT) applySnapshot(window.__CS_SNAPSHOT);
    else { try { freshHydrate(); } catch (e) {} }
    // 2) Which destination + style — read from the URL (?dest=bali&style=magazine).
    var params = new URLSearchParams(location.search || "");
    var destId = params.get("dest") || (DEST[0] && DEST[0].id);
    var style = params.get("style") || "magazine";
    var root = document.getElementById("pdfRenderRoot");
    if (!root) { root = document.createElement("div"); root.id = "pdfRenderRoot"; document.body.appendChild(root); }
    root.innerHTML = buildPDF(destById(destId), style);
    // 3) Mark ready ONLY after fonts AND images settle, so the capture never
    //    fires on a half-rendered page (this is what made Safari export flaky).
    signalPdfReady(root);
  }
  function signalPdfReady(root) {
    var imgs = Array.prototype.slice.call((root || document).querySelectorAll("img"));
    function settled() { return imgs.every(function (im) { return im.complete; }); }
    function done() { window.__pdfReady = true; document.documentElement.setAttribute("data-pdf-ready", "1"); }
    var fontsP = (document.fonts && document.fonts.ready) ? document.fonts.ready : Promise.resolve();
    fontsP.then(function () {
      var waited = 0;
      (function poll() { if (settled() || waited >= 8000) return done(); waited += 100; setTimeout(poll, 100); })();
    }, done);
  }
  document.addEventListener("DOMContentLoaded", function () {
    if (window.PDF_RENDER_MODE) {
      try { bootRender(); }
      catch (err) { try { console.error(err); } catch (e) {} document.documentElement.setAttribute("data-pdf-error", (err && err.message) || "render"); window.__pdfReady = true; }
      return;
    }
    try {
      freshHydrate();
      wire(); render(); mountDebug();
      if (window.ContentStore) window.ContentStore.onChange(function () { freshHydrate(); render(); });
      // Poll the store so a suspended/hidden iframe (e.g. iOS Safari) catches up
      // with Studio edits it may have missed via events — guarantees no stale data.
      setInterval(function () {
        if (!window.ContentStore || !window.ContentStore.meta) return;
        try { var m = window.ContentStore.meta(); if (m.exists && m.ts > lastHydratedTs) { freshHydrate(); render(); } else if (dbgOpen) { renderDebug(); } } catch (e) {}
      }, 800);
      // Re-pull whenever the tab/iframe regains visibility or focus.
      document.addEventListener("visibilitychange", function () { if (!document.hidden) { freshHydrate(); render(); } });
      window.addEventListener("focus", function () { freshHydrate(); render(); });
      window.addEventListener("pageshow", function () { freshHydrate(); render(); });
    } catch (err) {
      console.error(err);
      document.body.insertAdjacentHTML("beforeend", '<pre style="color:#d9645a;padding:16px">خطأ: ' + esc(err.message) + "</pre>");
    }
  });
})();
