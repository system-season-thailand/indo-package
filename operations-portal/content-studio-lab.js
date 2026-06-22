/* =====================================================================
   content-studio-lab.js — Content Studio: management workspace
   (Phases 14.8 + 14.9 + 14.95). Source of truth for content; documents
   consume it. Management can MANAGE content (simulation): replace cover,
   add/remove gallery, edit fields, and move media through its lifecycle.
   Sample only · no PDF · no Supabase · no real uploads · no writes.
   ===================================================================== */
(function () {
  "use strict";
  var D = window.CS_DATA || {};
  if (window.ContentStore) window.ContentStore.hydrate(D);
  var DEST = D.destinations || [], HOTELS = D.hotels || [], BRANDS = D.brands || {}, MEDIA = D.media || [];
  var state = { section: "destinations", selDest: null, selHotel: null, mediaFilter: "all", itemCtx: null };
  var pendingUpload = null; // in-memory only: {src, filename, dimensions, sizeKB} — never persisted

  function el(id) { return document.getElementById(id); }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]; }); }
  function asset(id) { return MEDIA.filter(function (a) { return a.asset_id === id; })[0]; }
  /* Collision-proof asset id: max existing numeric id + 1, guarded against any
     existing id (count-based ids collide after removals/hydrate and make
     item.asset resolve to the wrong pre-existing media — e.g. the cover). */
  function newAssetId() {
    var max = 0;
    MEDIA.forEach(function (a) { var n = parseInt(String(a.asset_id || "").replace(/^IMG-/, ""), 10); if (!isNaN(n) && n > max) max = n; });
    var n = max + 1, id = "IMG-" + ("000" + n).slice(-3);
    while (asset(id)) { n++; id = "IMG-" + ("000" + n).slice(-3); }
    return id;
  }
  function brandOf(id) { return BRANDS[id] || BRANDS["season-indonesia"] || {}; }
  function destById(id) { return DEST.filter(function (d) { return d.id === id; })[0]; }
  function hotelById(id) { return HOTELS.filter(function (h) { return h.id === id; })[0]; }
  function ownerOf(kind, oid) { return kind === "dest" ? destById(oid) : hotelById(oid); }

  var ST = { draft: ["مسودة", "st-draft"], review: ["مراجعة", "st-review"], approved: ["معتمد", "st-ok"], rejected: ["مرفوض", "st-rej"], archived: ["مؤرشف", "st-arc"] };
  function chip(s) { var x = ST[s] || ST.draft; return '<span class="st ' + x[1] + '">' + x[0] + "</span>"; }

  var USAGE = {
    destCover: ["دليل الوجهة", "غلاف حقيبة السفر", "قسم الوصول"], destGallery: ["دليل الوجهة (معرض)", "حقيبة السفر"],
    arrival: ["دليل الوجهة — الوصول", "برنامج الرحلة — اليوم الأول"], connectivity: ["دليل الوجهة — الاتصال"],
    currency: ["دليل الوجهة — العملة"], emergency: ["دليل الوجهة — الطوارئ", "قسيمة النقل (طوارئ)"], areas: ["دليل الوجهة — مناطق موصى بها"],
    hotelCover: ["قسيمة الفندق", "البرنامج النهائي", "قسم الفنادق في الحقيبة"], hotelGallery: ["قسيمة الفندق", "حقيبة السفر"], hotelDesc: ["قسيمة الفندق", "حقيبة السفر"], hotelHighlights: ["قسيمة الفندق", "حقيبة السفر"]
  };
  function usage(key) { return '<div class="usage"><span class="usage-h">يُستخدم في</span><div class="usage-row">' + (USAGE[key] || []).map(function (u) { return '<span class="usage-i">✓ ' + esc(u) + "</span>"; }).join("") + "</div></div>"; }

  function destScore(d) { var items = [["صورة غلاف", !!d.cover_asset], ["معرض صور", (d.gallery_assets || []).length > 0], ["وصف", !!d.description], ["معلومات وصول", !!(d.arrival && d.arrival.airport)], ["عملة", !!d.currency], ["طوارئ", !!d.emergency]]; var got = items.filter(function (x) { return x[1]; }).length; return { score: Math.round(got / items.length * 100), items: items }; }
  function hotelScore(h) { var items = [["صورة غلاف", !!h.cover_asset], ["معرض صور", (h.gallery_assets || []).length > 0], ["وصف", !!h.description], ["مميزات", (h.highlights || []).length > 0], ["موقع", !!h.location], ["أوقات", !!(h.checkIn && h.checkOut)]]; var got = items.filter(function (x) { return x[1]; }).length; return { score: Math.round(got / items.length * 100), items: items }; }
  function scoreClass(s) { return s >= 85 ? "sc-ok" : s >= 60 ? "sc-mid" : "sc-low"; }
  function scoreBadge(sc) { return '<div class="score ' + scoreClass(sc.score) + '"><div class="score-num">' + sc.score + '<span>/100</span></div><div class="score-items">' + sc.items.map(function (it) { return '<span class="sci ' + (it[1] ? "on" : "off") + '">' + (it[1] ? "✓" : "○") + " " + esc(it[0]) + "</span>"; }).join("") + "</div></div>"; }

  function scenery(scene, h) {
    var sun = '<circle cx="312" cy="42" r="22" fill="rgba(255,242,205,0.5)"/><circle cx="312" cy="42" r="12" fill="rgba(255,247,228,0.9)"/>';
    if (scene === "temple") return sun + '<path d="M0 ' + (h - 24) + ' H400 V' + h + ' H0Z" fill="rgba(0,0,0,0.22)"/><path d="M150 ' + (h - 24) + ' l32 -80 32 80z" fill="rgba(0,0,0,0.4)"/><path d="M70 ' + (h - 24) + ' l22 -54 22 54z" fill="rgba(0,0,0,0.3)"/><path d="M250 ' + (h - 24) + ' l24 -60 24 60z" fill="rgba(0,0,0,0.28)"/>';
    if (scene === "island") return sun + '<path d="M0 ' + (h - 22) + ' Q120 ' + (h - 44) + ' 240 ' + (h - 26) + ' T400 ' + (h - 30) + ' V' + h + ' H0Z" fill="rgba(0,0,0,0.22)"/><path d="M-10 ' + (h - 30) + ' Q70 ' + (h - 86) + ' 150 ' + (h - 30) + 'Z" fill="rgba(0,0,0,0.38)"/><path d="M150 ' + (h - 30) + ' Q250 ' + (h - 104) + ' 350 ' + (h - 30) + 'Z" fill="rgba(0,0,0,0.3)"/>';
    if (scene === "city") return sun + '<g fill="rgba(0,0,0,0.34)"><rect x="40" y="' + (h - 78) + '" width="40" height="78"/><rect x="92" y="' + (h - 56) + '" width="34" height="56"/><rect x="140" y="' + (h - 96) + '" width="30" height="96"/><rect x="182" y="' + (h - 64) + '" width="40" height="64"/><rect x="236" y="' + (h - 84) + '" width="32" height="84"/><rect x="280" y="' + (h - 50) + '" width="44" height="50"/></g>';
    if (scene === "resort") return sun + '<path d="M0 ' + (h - 24) + ' H400 V' + h + ' H0Z" fill="rgba(0,0,0,0.22)"/><rect x="70" y="' + (h - 70) + '" width="110" height="46" rx="4" fill="rgba(0,0,0,0.32)"/><rect x="206" y="' + (h - 56) + '" width="84" height="32" rx="4" fill="rgba(0,0,0,0.26)"/>';
    return sun + '<path d="M0 ' + (h - 24) + ' Q100 ' + (h - 40) + ' 200 ' + (h - 26) + ' T400 ' + (h - 30) + ' V' + h + ' H0Z" fill="rgba(0,0,0,0.2)"/><path d="M64 ' + (h - 24) + ' v-44 M64 ' + (h - 68) + ' q-18 -6 -28 6 M64 ' + (h - 68) + ' q18 -6 28 6" stroke="rgba(0,0,0,0.4)" stroke-width="3" fill="none"/>';
  }
  function svg(scene, hue, h) { var c1 = "hsl(" + hue + ",46%,18%)", c2 = "hsl(" + hue + ",42%,37%)"; return '<svg class="img-svg" viewBox="0 0 400 ' + h + '" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><defs><linearGradient id="g' + hue + "_" + h + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + c1 + '"/><stop offset="0.6" stop-color="' + c2 + '"/><stop offset="1" stop-color="' + c1 + '"/></linearGradient></defs><rect width="400" height="' + h + '" fill="url(#g' + hue + "_" + h + ')"/>' + scenery(scene, h) + "</svg>"; }
  function assetImg(id, h) {
    var r = window.ImageResolver.classify(id, MEDIA, null, null);
    var a = window.ImageResolver.isDirect(id) ? null : asset(id);
    if (r.type === "img") {
      var flag = (a && a.status !== "approved") ? '<span class="img-flag ' + ST[a.status][1] + '">' + ST[a.status][0] + "</span>" : "";
      return '<img class="img-real" src="' + r.src + '" alt="">' + flag;
    }
    if (!a) return '<div class="img-miss">لا صورة</div>';
    var flag2 = a.status !== "approved" ? '<span class="img-flag ' + ST[a.status][1] + '">' + ST[a.status][0] + "</span>" : "";
    return window.ImageResolver.fallbackSVG(r.scene, r.hue, h) + '<span class="img-ph-flag">بديل · لا صورة حقيقية</span>' + flag2;
  }
  function isReal(id) { return window.ImageResolver.isReal(id, MEDIA); }
  function realBadge(id) { return isReal(id) ? '<span class="vm-badge vm-real">صورة حقيقية</span>' : '<span class="vm-badge vm-ph">بديل — لا صورة حقيقية</span>'; }
  function logo(t) { return '<svg viewBox="0 0 40 40" fill="none" class="cs-logo"><path d="M20 3 L24 16 L37 20 L24 24 L20 37 L16 24 L3 20 L16 16 Z" stroke="' + t + '" stroke-width="1.6" stroke-linejoin="round"/><circle cx="20" cy="20" r="3.4" fill="' + t + '"/></svg>'; }
  function inp(label, path, val, area) { var f = area ? '<textarea class="f-in" rows="2" data-path="' + path + '">' + esc(val == null ? "" : val) + "</textarea>" : '<input class="f-in" data-path="' + path + '" value="' + esc(val == null ? "" : val) + '">'; return '<label class="f-row"><span class="f-k">' + label + "</span>" + f + "</label>"; }
  function sect(title, body, actions) { return '<section class="d-sec"><div class="d-sechead"><h4 class="d-h">' + title + "</h4>" + (actions || "") + "</div>" + body + "</section>"; }
  function gbItems(items, isText) { return '<div class="gb-items">' + (items || []).map(function (r) { return '<span class="gl-item">' + (isText ? esc(r) : (esc(r.n) + (r.area ? " · " + esc(r.area) : ""))) + "</span>"; }).join("") + "</div>"; }
  function gblock(label, items, isText) { return '<div class="gb"><span class="gb-k">' + label + " (" + (items || []).length + ")</span>" + gbItems(items, isText) + "</div>"; }

  /* ---------- guide-block editors (14.x management surface) ---------- */
  var BLKDEF = {
    dining: { label: "المطاعم", img: true, fields: [["n", "الاسم"], ["area", "الفئة / المنطقة"], ["note", "الوصف"]] },
    shopping: { label: "التسوّق", img: true, fields: [["n", "الاسم"], ["area", "الفئة / المنطقة"], ["note", "الوصف"]] },
    cafes: { label: "المقاهي", img: true, fields: [["n", "الاسم"], ["area", "الفئة / المنطقة"], ["note", "الوصف"]] },
    exchange: { label: "صرافة العملات", img: true, fields: [["n", "الاسم"], ["area", "المنطقة"], ["note", "ملاحظات"]] },
    topRecs: { label: "اخترنا لك (توصيات)", img: true, fields: [["n", "العنوان"], ["note", "وصف مختصر"]] },
    tips: { label: "نصائح السفر", img: false, fields: [["t", "عنوان النصيحة"], ["d", "نص مختصر"], ["cat", "التصنيف"]] }
  };
  function newItem(block) { var d = destById(state.selDest); if (block === "tips") return { t: "", d: "", cat: "عام" }; if (block === "topRecs") return { n: "", note: "", scene: d.scene, hue: d.hue }; return { n: "", area: "", note: "", scene: d.scene, hue: d.hue }; }
  function itemThumb(it, d) { return it.asset ? assetImg(it.asset, 54) : window.ImageResolver.fallbackSVG(it.scene || d.scene, it.hue || d.hue, 54) + '<span class="img-add">صورة</span>'; }
  function blockEditor(block) {
    var def = BLKDEF[block], d = destById(state.selDest), items = d[block] || [];
    var rows = items.map(function (it, i) {
      var img = def.img ? '<button type="button" class="item-img" data-bimg="' + block + ":" + i + '" title="إسناد صورة">' + itemThumb(it, d) + "</button>" : "";
      var fields = def.fields.map(function (f) { return '<input class="f-in item-in" data-bedit="' + block + ":" + i + ":" + f[0] + '" value="' + esc(it[f[0]] || "") + '" placeholder="' + f[1] + '">'; }).join("");
      return '<div class="item-edit">' + img + '<div class="item-fields">' + fields + '</div><button type="button" class="item-x" data-bremove="' + block + ":" + i + '" title="حذف">×</button></div>';
    }).join("");
    return sect(def.label, '<div class="blk-edit">' + (rows || '<p class="d-sub">لا عناصر بعد — اضغط «+ إضافة».</p>') + "</div>", '<button type="button" class="mini-btn" data-badd="' + block + '">+ إضافة</button>');
  }
  function addItem(block) { var d = destById(state.selDest); (d[block] = d[block] || []).push(newItem(block)); persist(); renderMain(); flash("أُضيف عنصر إلى " + BLKDEF[block].label + " — يظهر في معاينة المحرّك."); }
  function removeItem(block, i) { var d = destById(state.selDest); d[block].splice(i, 1); persist(); renderMain(); flash("حُذف عنصر من " + BLKDEF[block].label + "."); }
  function openItemImage(block, i) {
    state.itemCtx = { block: block, idx: i };
    var d = destById(state.selDest), it = d[block][i];
    var pool = MEDIA.filter(function (a) { return a.destination_id === d.id; });
    var grid = pool.map(function (a) { return '<button type="button" class="cp-pick' + (a.asset_id === it.asset ? " cur" : "") + '" data-pickitem="' + a.asset_id + '"><div class="cp-thumb">' + assetImg(a.asset_id, 70) + "</div><span class=\"cp-id\">" + a.asset_id + " · " + ST[a.status][0] + "</span></button>"; }).join("");
    el("modal").innerHTML = '<div class="m-back" data-close="1"></div><div class="m-panel" role="dialog" aria-modal="true"><h3 class="mp-title">إسناد صورة للعنصر</h3><div class="mp-upload"><input type="file" id="itFile" accept="image/*" hidden><button type="button" class="mp-drop" id="itDrop">⬆ اضغط لاختيار صورة من جهازك</button><span class="mp-note">معاينة محلية فقط — لا يُرفع أي ملف على خادم</span></div><p class="d-sub">أو اختر من مكتبة الوسائط لهذه الوجهة:</p><div class="cp-grid">' + (grid || '<p class="d-sub">لا صور مُسندة بعد.</p>') + '</div><div class="mp-acts"><button type="button" class="ghost" data-close="1">إغلاق</button></div></div>';
    el("modal").hidden = false; document.body.classList.add("modal-open");
    var fi = el("itFile"), dr = el("itDrop");
    if (dr) dr.addEventListener("click", function () { fi.click(); });
    if (fi) fi.addEventListener("change", function (e) { handleItemFile(e.target.files[0]); });
  }
  function assetUsedElsewhere(v, curBlock, curIdx) {
    var d = destById(state.selDest), hit = false;
    if (d.cover_asset === v || d.arrival_asset === v) hit = true;
    ["dining", "cafes", "shopping", "exchange", "topRecs"].forEach(function (bl) {
      (d[bl] || []).forEach(function (it, i) { if (it.asset === v && !(bl === curBlock && i === curIdx)) hit = true; });
    });
    return hit;
  }
  function pickItemAsset(assetId) {
    var c = state.itemCtx; if (!c) return;
    var d = destById(state.selDest), it = d[c.block][c.idx], a = asset(assetId), finalId = assetId, cloned = false;
    if (a && assetUsedElsewhere(assetId, c.block, c.idx)) {
      var cl = newAssetId();
      MEDIA.push({ asset_id: cl, category: a.category || "guide", destination_id: a.destination_id || d.id, hotel_id: a.hotel_id || null, cover: false, gallery: false, status: a.status || "approved", label: (a.label || "") + " (نسخة مستقلة)", scene: a.scene, hue: a.hue, src: a.src, filename: a.filename, dimensions: a.dimensions });
      finalId = cl; cloned = true;
    }
    it.asset = finalId; var fa = asset(finalId); if (fa) { it.scene = fa.scene; it.hue = fa.hue; }
    persist(); closeModal(); renderMain();
    flash(cloned ? ("أُنشئت نسخة مستقلة " + finalId + " — تغيير هذا العنصر لن يؤثّر على غيره.") : ("أُسندت الصورة " + finalId + " للعنصر."));
  }
  function handleItemFile(file) {
    if (!file || !/^image\//.test(file.type)) { flash("الرجاء اختيار ملف صورة."); return; }
    var c = state.itemCtx, d = destById(state.selDest), reader = new FileReader();
    reader.onload = function (ev) {
      var src = ev.target.result, img = new Image();
      img.onload = function () {
        var maxd = 1280, w = img.naturalWidth, h = img.naturalHeight, scale = Math.min(1, maxd / Math.max(w, h));
        var cw = Math.max(1, Math.round(w * scale)), ch = Math.max(1, Math.round(h * scale)), small = src;
        try { var cv = document.createElement("canvas"); cv.width = cw; cv.height = ch; cv.getContext("2d").drawImage(img, 0, 0, cw, ch); small = cv.toDataURL("image/jpeg", 0.82); } catch (e) { small = src; }
        var id = newAssetId();
        MEDIA.push({ asset_id: id, category: "guide", destination_id: d.id, hotel_id: null, cover: false, gallery: false, status: "approved", label: d.name + " — صورة عنصر", scene: d.scene, hue: d.hue, src: small, filename: file.name, dimensions: w + "×" + h });
        var it = d[c.block][c.idx]; it.asset = id; it.scene = d.scene; it.hue = d.hue;
        persist(); closeModal(); renderMain(); flash("رُفعت صورة وأُسندت للعنصر (" + file.name + ").");
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
  }
  /* ---------- dedicated Arrival Image ownership ---------------------- */
  function openArrivalImage(oid) {
    state.arrCtx = oid;
    var d = destById(oid);
    var pool = MEDIA.filter(function (a) { return a.destination_id === oid; });
    var grid = pool.map(function (a) { return '<button type="button" class="cp-pick' + (a.asset_id === d.arrival_asset ? " cur" : "") + '" data-pickarrival="' + oid + ":" + a.asset_id + '"><div class="cp-thumb">' + assetImg(a.asset_id, 70) + '</div><span class="cp-id">' + a.asset_id + (a.asset_id === d.arrival_asset ? " · الحالية" : "") + "</span></button>"; }).join("");
    el("modal").innerHTML = '<div class="m-back" data-close="1"></div><div class="m-panel" role="dialog" aria-modal="true"><h3 class="mp-title">صورة الوصول — ' + esc(d.name) + '</h3><p class="d-sub">حقل مخصّص لصفحة الوصول — يستخدمه محرّك القوالب والـPDF حصرياً.</p><div class="mp-upload"><input type="file" id="arrFile" accept="image/*" hidden><button type="button" class="mp-drop" id="arrDrop">⬆ ارفع صورة وصول مخصّصة من جهازك</button><span class="mp-note">معاينة محلية فقط — لا يُرفع أي ملف على خادم</span></div><p class="d-sub">أو اختر من مكتبة الوسائط لهذه الوجهة:</p><div class="cp-grid">' + (grid || '<p class="d-sub">لا صور مُسندة بعد.</p>') + '</div><div class="mp-acts">' + (d.arrival_asset ? '<button type="button" class="ghost" data-arrclear="' + oid + '">إزالة صورة الوصول</button>' : "") + '<button type="button" class="ghost" data-close="1">إغلاق</button></div></div>';
    el("modal").hidden = false; document.body.classList.add("modal-open");
    var fi = el("arrFile"), dr = el("arrDrop");
    if (dr) dr.addEventListener("click", function () { fi.click(); });
    if (fi) fi.addEventListener("change", function (e) { handleArrivalFile(e.target.files[0]); });
  }
  function pickArrivalAsset(oid, assetId) { var d = destById(oid); d.arrival_asset = assetId; persist(); closeModal(); renderMain(); flash("صورة الوصول لـ " + d.name + " ← " + assetId); }
  function clearArrival(oid) { var d = destById(oid); d.arrival_asset = null; persist(); closeModal(); renderMain(); flash("أُزيلت صورة الوصول — ستظهر صورة بديلة."); }
  function handleArrivalFile(file) {
    if (!file || !/^image\//.test(file.type)) { flash("الرجاء اختيار ملف صورة."); return; }
    var oid = state.arrCtx, d = destById(oid), reader = new FileReader();
    reader.onload = function (ev) {
      var src = ev.target.result, img = new Image();
      img.onload = function () {
        var maxd = 1280, w = img.naturalWidth, h = img.naturalHeight, scale = Math.min(1, maxd / Math.max(w, h));
        var cw = Math.max(1, Math.round(w * scale)), ch = Math.max(1, Math.round(h * scale)), small = src;
        try { var cv = document.createElement("canvas"); cv.width = cw; cv.height = ch; cv.getContext("2d").drawImage(img, 0, 0, cw, ch); small = cv.toDataURL("image/jpeg", 0.82); } catch (e) { small = src; }
        var id = newAssetId();
        MEDIA.push({ asset_id: id, category: "arrival", destination_id: d.id, hotel_id: null, cover: false, gallery: false, status: "approved", label: d.name + " — صورة الوصول", scene: d.scene, hue: d.hue, src: small, filename: file.name, dimensions: w + "×" + h });
        d.arrival_asset = id;
        persist(); closeModal(); renderMain(); flash("رُفعت صورة وصول مخصّصة (" + file.name + ").");
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
  }
  /* ---------- visual ownership map (every guide image → its source) -- */
  function imageMap(d) {
    var hotel = HOTELS.filter(function (h) { return h.destination === d.id; })[0] || HOTELS.filter(function (h) { return (d.areas || []).indexOf(h.destination) >= 0; })[0];
    var usage = {};
    function use(label, v) { if (v) { (usage[v] = usage[v] || []).push(label); } }
    use("الغلاف", d.cover_asset); use("الوصول", d.arrival_asset); if (hotel) use("الفندق", hotel.cover_asset);
    [["dining", "مطعم"], ["cafes", "مقهى"], ["shopping", "تسوّق"], ["exchange", "صرافة"]].forEach(function (bl) {
      (d[bl[0]] || []).forEach(function (it, i) { use(bl[1] + "[" + i + "]", it.asset); });
    });
    function sharedBadge(v) { var u = v ? usage[v] : null; if (!u || u.length < 2) return ""; return '<span class="vm-badge vm-shared">⚠ مشتركة مع: ' + esc(u.join("، ")) + "</span>"; }
    function row(label, field, id) { return '<div class="vm-row"><div class="vm-thumb">' + assetImg(id, 54) + '</div><div class="vm-b"><span class="vm-label">' + esc(label) + '</span><span class="vm-field">' + esc(field) + "</span></div>" + realBadge(id) + sharedBadge(id) + "</div>"; }
    var rows = row("صورة الغلاف", "Destination · cover_asset", d.cover_asset) + row("صورة الوصول", "Destination · arrival_asset", d.arrival_asset);
    if (hotel) rows += row("صورة الفندق", "Hotel · cover_asset", hotel.cover_asset);
    [["dining", "مطعم"], ["cafes", "مقهى"], ["shopping", "تسوّق"]].forEach(function (bl) {
      (d[bl[0]] || []).forEach(function (it, i) { rows += row(bl[1] + " — " + (it.n || "#" + (i + 1)), "Destination · " + bl[0] + "[" + i + "].asset", it.asset); });
    });
    return '<div class="vmap">' + rows + '</div><p class="d-sub">لكل صورة في الدليل مصدر صريح أعلاه. شارة «بديل» تعني رسماً بديلاً بلا صورة حقيقية. شارة «مشتركة» تعني أن أكثر من خانة تستخدم الصورة نفسها — تغييرها أو إسناد صورة جديدة يجعلها مستقلة.</p>';
  }

  /* ---------- lists --------------------------------------------------- */
  function destList() { return '<div class="card-grid">' + DEST.map(function (d) { var sc = destScore(d).score; return '<button type="button" class="cs-card" data-dest="' + d.id + '"><div class="cs-thumb">' + assetImg(d.cover_asset, 90) + '<span class="cs-score ' + scoreClass(sc) + '">' + sc + "</span></div><div class=\"cs-cap\"><span class=\"cs-name\">" + esc(d.name) + '</span><span class="cs-meta">' + esc(brandOf(d.brand).name) + " · " + (d.gallery_assets.length + 1) + " صورة</span>" + chip(d.status) + "</div></button>"; }).join("") + "</div>"; }
  function hotelList() { return '<div class="card-grid">' + HOTELS.map(function (h) { var sc = hotelScore(h).score; return '<button type="button" class="cs-card" data-hotel="' + h.id + '"><div class="cs-thumb">' + assetImg(h.cover_asset, 90) + '<span class="cs-score ' + scoreClass(sc) + '">' + sc + "</span></div><div class=\"cs-cap\"><span class=\"cs-name\">" + esc(h.name) + '</span><span class="cs-meta">' + esc((destById(h.destination) || {}).name || "") + "</span>" + chip(h.status) + "</div></button>"; }).join("") + "</div>"; }

  function galleryRow(kind, ownerId, ids) {
    return '<div class="ed-grow">' + ids.map(function (g, i) { return '<div class="ed-gimg">' + assetImg(g, 70) + (i === 0 ? '<span class="primary-tag">رئيسية</span>' : "") + '<button type="button" class="gal-x" title="إزالة" data-galremove="' + kind + ":" + ownerId + ":" + g + '">×</button></div>'; }).join("") + '<button type="button" class="add-img" data-assign="' + kind + ":" + ownerId + '">+ إضافة صورة للمعرض</button></div>';
  }
  function coverActions(kind, ownerId) { return '<button type="button" class="mini-btn" data-cover="' + kind + ":" + ownerId + '">تغيير صورة الغلاف</button>'; }

  /* ---------- destination detail (with management actions) ----------- */
  function destDetail(d) {
    var br = brandOf(d.brand), cov = asset(d.cover_asset), sc = destScore(d);
    var areas = (d.areas || []).map(function (aid) { var a = destById(aid); if (!a) return ""; return '<div class="area-card">' + assetImg(a.cover_asset, 64) + '<div class="area-b"><span class="area-n">' + esc(a.name) + '</span><span class="area-d">' + esc(a.tagline || "") + "</span></div></div>"; }).join("");
    var overview = sect("نظرة عامة", '<div class="ov-grid"><div class="ov-f"><span class="f-k">الوجهة</span><span class="ov-v">' + esc(d.name) + "</span></div><div class=\"ov-f\"><span class=\"f-k\">العلامة</span><span class=\"ov-v\">" + esc(br.name) + "</span></div><div class=\"ov-f\"><span class=\"f-k\">الاعتماد</span>" + chip(d.status) + "</div><div class=\"ov-f\"><span class=\"f-k\">آخر تحديث</span><span class=\"ov-v\">" + esc(d.last_updated) + "</span></div></div>" + scoreBadge(sc));
    var coverSec = sect("صورة الغلاف", '<div class="cover-big">' + assetImg(d.cover_asset, 160) + "</div><div class=\"cover-meta\">" + (cov ? chip(cov.status) : "") + '<span class="cm">الأبعاد: ' + esc(d.dimensions) + '</span><span class="cm">' + (d.cover_asset || "") + "</span></div>" + usage("destCover"), coverActions("dest", d.id));
    var arrivalImgSec = sect("صورة الوصول (حقل مخصّص)", '<div class="cover-big">' + assetImg(d.arrival_asset, 160) + '</div><div class="cover-meta">' + realBadge(d.arrival_asset) + '<span class="cm">' + (d.arrival_asset || "— لم تُسند صورة وصول · سيُستخدم رسم بديل —") + '</span></div><p class="d-sub">يستخدمه محرّك القوالب والـPDF حصرياً لصفحة الوصول.</p>', '<button type="button" class="mini-btn" data-arrival="' + d.id + '">تعيين / رفع صورة الوصول</button>');
    var mapSec = sect("خريطة ملكية الصور", imageMap(d));
    var gallerySec = sect("المعرض", galleryRow("dest", d.id, d.gallery_assets) + '<p class="d-sub">' + d.gallery_assets.length + ' صورة · الأولى = الصورة الرئيسية · «×» للإزالة</p>' + usage("destGallery"));
    var descSec = sect("وصف الوجهة", '<div class="ed-fields one">' + inp("الوصف", "description", d.description, true) + "</div>");
    var arrivalSec = sect("معلومات الوصول", '<div class="ed-fields">' + inp("المطار", "arrival.airport", d.arrival.airport) + inp("ملاحظات الوصول", "arrival.notes", d.arrival.notes) + inp("الجوازات", "arrival.immigration", d.arrival.immigration) + inp("أول الخطوات", "arrival.firstSteps", d.arrival.firstSteps, true) + "</div>" + usage("arrival"));
    var connSec = sect("الاتصال", '<div class="ed-fields">' + inp("الشريحة", "sim", d.sim) + inp("نصائح الإنترنت", "internetTips", d.internetTips) + "</div>" + usage("connectivity"));
    var currSec = sect("العملة", '<div class="ed-fields">' + inp("العملة المحلية", "currency", d.currency) + inp("نصائح الصرف", "exchangeTips", d.exchangeTips) + "</div>" + usage("currency"));
    var emoSec = sect("معلومات الطوارئ", '<div class="ed-fields">' + inp("أرقام الطوارئ", "emergency", d.emergency) + inp("ملاحظات المستشفى", "hospital", d.hospital) + inp("دعم ٢٤/٧", "support247", d.support247) + "</div>" + usage("emergency"));
    var areasSec = sect("المناطق الموصى بها", areas ? '<div class="area-grid">' + areas + "</div>" + usage("areas") : '<p class="d-sub">لا مناطق فرعية بعد.</p>');
    var guideSec = '<div class="d-sec"><div class="d-sechead"><h4 class="d-h">محتوى الدليل (يملكه الاستوديو · يُستهلك في محرّك القوالب)</h4></div><p class="d-sub">أضف/عدّل/احذف العناصر وأسند الصور — كل تغيير يظهر في معاينة المحرّك تلقائياً.</p></div>' + blockEditor("dining") + blockEditor("shopping") + blockEditor("cafes") + blockEditor("exchange") + blockEditor("topRecs") + blockEditor("tips");
    return '<div class="detail"><button type="button" class="back" data-back="1">← الوجهات</button><div class="d-head"><div class="d-cover">' + assetImg(d.cover_asset, 90) + '</div><div class="d-htext"><h3>' + esc(d.name) + '</h3><span class="cs-meta">' + esc(br.name) + " · " + esc(d.tagline || "") + '</span></div><button type="button" class="primary big" data-preview="guide:' + d.id + '">معاينة الدليل ←</button></div>' + overview + mapSec + coverSec + arrivalImgSec + gallerySec + descSec + arrivalSec + connSec + currSec + emoSec + areasSec + guideSec + '<p class="ed-hint">إدارة فعلية (محاكاة): «تغيير صورة الغلاف» · «+ إضافة صورة» · «×» للإزالة · حرّر أي حقل (يُحفظ تلقائياً في الجلسة).</p></div>';
  }

  /* ---------- hotel detail (with management actions) ----------------- */
  function hotelDetail(h) {
    var br = brandOf(h.brand), cov = asset(h.cover_asset), sc = hotelScore(h);
    var overview = sect("نظرة عامة", '<div class="ov-grid"><div class="ov-f"><span class="f-k">الفندق</span><span class="ov-v">' + esc(h.name) + "</span></div><div class=\"ov-f\"><span class=\"f-k\">الوجهة</span><span class=\"ov-v\">" + esc((destById(h.destination) || {}).name || "") + "</span></div><div class=\"ov-f\"><span class=\"f-k\">الاعتماد</span>" + chip(h.status) + "</div><div class=\"ov-f\"><span class=\"f-k\">آخر تحديث</span><span class=\"ov-v\">" + esc(h.last_updated) + "</span></div></div>" + scoreBadge(sc));
    var coverSec = sect("صورة الغلاف", '<div class="cover-big">' + assetImg(h.cover_asset, 160) + '</div><div class="cover-meta">' + (cov ? chip(cov.status) : "") + '<span class="cm">الأبعاد: ' + esc(h.dimensions) + "</span></div>" + usage("hotelCover"), coverActions("hotel", h.id));
    var gallerySec = sect("المعرض", galleryRow("hotel", h.id, h.gallery_assets) + usage("hotelGallery"));
    var descSec = sect("الوصف والتفاصيل", '<div class="ed-fields">' + inp("الوصف", "description", h.description, true) + inp("تسجيل الدخول", "checkIn", h.checkIn) + inp("تسجيل الخروج", "checkOut", h.checkOut) + inp("الموقع", "location", h.location) + "</div>" + usage("hotelDesc"));
    var hlSec = sect("المميزات", '<div class="ed-fields one">' + inp("المميزات (افصل بفاصلة)", "highlightsStr", h.highlights.join("، ")) + "</div><div class=\"pv-tags\">" + h.highlights.map(function (x) { return '<span class="pv-tag">' + esc(x) + "</span>"; }).join("") + "</div>" + usage("hotelHighlights"));
    return '<div class="detail"><button type="button" class="back" data-back="1">← الفنادق</button><div class="d-head"><div class="d-cover">' + assetImg(h.cover_asset, 90) + '</div><div class="d-htext"><h3>' + esc(h.name) + '</h3><span class="cs-meta">' + esc((destById(h.destination) || {}).name || "") + '</span></div><button type="button" class="primary big" data-preview="hotel:' + h.id + '">معاينة الفندق ←</button></div>' + overview + coverSec + gallerySec + descSec + hlSec + '<p class="ed-hint">إدارة فعلية (محاكاة): «تغيير صورة الغلاف» · إدارة المعرض · حرّر الوصف/المميزات/الأوقات.</p></div>';
  }

  /* ---------- brands ------------------------------------------------- */
  function brandsView() { return '<div class="card-grid wide">' + Object.keys(BRANDS).map(function (k) { var b = BRANDS[k]; return '<div class="brand-card"><div class="bc-head" style="background:linear-gradient(120deg,' + b.palette[0] + "," + b.palette[1] + ')">' + logo(b.logoTint) + '<span class="bc-name">' + esc(b.name) + "</span>" + chip(b.status) + "</div><div class=\"bc-body\"><div class=\"bc-pal\">" + b.palette.map(function (c) { return '<span class="sw" style="background:' + c + '" title="' + c + '"></span>'; }).join("") + "</div><div class=\"bc-row\"><span class=\"f-k\">الرأس</span><span>" + esc(b.header) + "</span></div><div class=\"bc-row\"><span class=\"f-k\">التذييل</span><span>" + esc(b.footer) + "</span></div></div></div>"; }).join("") + "</div>"; }

  /* ---------- media library (full lifecycle management) -------------- */
  function lifecycleBtns(a) {
    var b = [];
    if (a.status === "draft") b = [["review", "إرسال للمراجعة", ""], ["replace", "استبدال", "alt"], ["archived", "أرشفة", "alt"]];
    else if (a.status === "review") b = [["approved", "اعتماد", ""], ["rejected", "رفض", "warn"], ["replace", "استبدال", "alt"]];
    else if (a.status === "approved") b = [["archived", "أرشفة", "alt"], ["replace", "استبدال", "alt"]];
    else if (a.status === "rejected") b = [["draft", "إعادة لمسودة", ""], ["archived", "أرشفة", "alt"]];
    else if (a.status === "archived") b = [["draft", "استعادة", ""]];
    return b.map(function (x) { return '<button type="button" class="adv ' + x[2] + '" data-life="' + a.asset_id + ":" + x[0] + '">' + x[1] + "</button>"; }).join("");
  }
  function mediaView() {
    var f = state.mediaFilter, rows = MEDIA.filter(function (a) { return f === "all" || a.status === f; });
    var keys = ["all", "approved", "review", "draft", "rejected", "archived"];
    var filters = keys.map(function (k) { var lbl = k === "all" ? "الكل" : ST[k][0]; return '<button type="button" class="mf' + (f === k ? " on" : "") + '" data-mfilter="' + k + '">' + lbl + " (" + MEDIA.filter(function (a) { return k === "all" || a.status === k; }).length + ")</button>"; }).join("");
    var grid = rows.map(function (a) {
      var owner = a.destination_id ? (destById(a.destination_id) || {}).name : a.hotel_id ? (hotelById(a.hotel_id) || {}).name : "— غير مُسندة —";
      var assignBtn = !a.destination_id && !a.hotel_id ? '<button type="button" class="adv assign" data-assignexisting="' + a.asset_id + '">إسناد</button>' : "";
      return '<div class="m-card"><div class="m-thumb">' + assetImg(a.asset_id, 84) + '</div><div class="m-body"><span class="m-id">' + a.asset_id + " · " + (a.cover ? "غلاف" : "معرض") + '</span><span class="m-owner">' + esc(owner) + "</span>" + chip(a.status) + '<div class="m-acts">' + lifecycleBtns(a) + assignBtn + "</div></div></div>";
    }).join("");
    return '<div class="m-bar"><div class="m-filters">' + filters + '</div><button type="button" class="primary" data-assign="new">+ إضافة وسائط</button></div><p class="d-sub">بيئة المختبر: كل صورة تُرفع أو تُسند تُعتمد تلقائياً وتظهر فوراً في القوالب والـPDF — دون مراجعة أو نشر.</p><div class="m-grid">' + grid + "</div>";
  }

  /* ---------- governance view (ownership · approval · quick help) ---- */
  function governanceView() {
    var apprD = DEST.filter(function (d) { return d.status === "approved"; }).length, apprH = HOTELS.filter(function (h) { return h.status === "approved"; }).length, apprM = MEDIA.filter(function (a) { return a.status === "approved"; }).length;
    var roles = [
      ["مدير المحتوى / الوجهات", "يملك ويحرّر", "محتوى الوجهات + معلومات السفر"],
      ["التسويق / مدير العلامة", "يملك ويحرّر", "مكتبة الوسائط + العلامات"],
      ["منسّق العمليات / الفنادق", "يحرّر", "حقائق الفنادق (دخول/خروج/وصف)"],
      ["المراجع (مدير أول)", "يعتمد / يرفض", "بوابة الاعتماد قبل النشر"],
      ["موظفو الحجز", "مستهلكون فقط", "لا يديرون المحتوى — يستهلكونه في الوثائق"]
    ];
    var rolesTbl = '<div class="gov-tbl"><div class="gov-tr gov-head"><span>الدور</span><span>الصلاحية</span><span>النطاق</span></div>' + roles.map(function (r) { return '<div class="gov-tr"><span class="gov-role">' + esc(r[0]) + '</span><span class="gov-perm">' + esc(r[1]) + "</span><span class=\"gov-scope\">" + esc(r[2]) + "</span></div>"; }).join("") + "</div>";
    var summary = '<div class="gov-cards"><div class="gov-card"><span class="gov-num">' + apprD + "/" + DEST.length + '</span><span class="gov-k">وجهات معتمدة</span></div><div class="gov-card"><span class="gov-num">' + apprH + "/" + HOTELS.length + '</span><span class="gov-k">فنادق معتمدة</span></div><div class="gov-card"><span class="gov-num">' + apprM + "/" + MEDIA.length + '</span><span class="gov-k">وسائط معتمدة</span></div></div>';
    var life = '<div class="gov-life"><span class="lf">مسودة</span><span class="lf-a">→</span><span class="lf">مراجعة</span><span class="lf-a">→</span><span class="lf ok">معتمد</span><span class="lf-a">/</span><span class="lf rej">مرفوض</span><span class="lf-a">→</span><span class="lf arc">مؤرشف</span></div>';
    var help = [
      ["أريد استبدال صورة غلاف بالي غداً — أين أذهب؟", "محتوى الوجهات ← بالي ← قسم «صورة الغلاف» ← زر «تغيير صورة الغلاف»."],
      ["أريد إضافة صور جديدة لأوبود — أين أذهب؟", "محتوى الوجهات ← أوبود ← قسم «المعرض» ← «+ إضافة صورة للمعرض»."],
      ["أريد تحديث معلومات وجهة — أين أذهب؟", "محتوى الوجهات ← الوجهة ← حرّر الحقول (وصول/شريحة/عملة/طوارئ) — تُحفظ تلقائياً."]
    ];
    var helpHtml = '<div class="gov-help">' + help.map(function (q) { return '<div class="gov-q"><span class="gq-q">' + esc(q[0]) + '</span><span class="gq-a">' + esc(q[1]) + "</span></div>"; }).join("") + "</div>";
    return '<div class="gov">' + sect("المحتوى المعتمد حالياً", summary) + sect("الملكية والصلاحيات", rolesTbl) + sect("دورة حياة الأصل", life) + sect("دليل سريع — أين أذهب؟", helpHtml) + "</div>";
  }

  /* ---------- cover picker (replace cover) --------------------------- */
  function openCoverPicker(kind, oid) {
    var owner = ownerOf(kind, oid);
    var pool = MEDIA.filter(function (a) { return kind === "dest" ? a.destination_id === oid : a.hotel_id === oid; });
    var grid = pool.map(function (a) { return '<button type="button" class="cp-pick' + (a.asset_id === owner.cover_asset ? " cur" : "") + '" data-pickcover="' + kind + ":" + oid + ":" + a.asset_id + '"><div class="cp-thumb">' + assetImg(a.asset_id, 70) + "</div><span class=\"cp-id\">" + a.asset_id + " · " + ST[a.status][0] + (a.asset_id === owner.cover_asset ? " · الحالية" : "") + "</span></button>"; }).join("");
    el("modal").innerHTML = '<div class="m-back" data-close="1"></div><div class="m-panel" role="dialog" aria-modal="true"><h3 class="mp-title">تغيير صورة الغلاف — ' + esc(owner.name) + '</h3><p class="d-sub">اختر من الصور المُسندة، أو ارفع صورة جديدة كغلاف.</p><div class="cp-grid">' + (grid || '<p class="d-sub">لا صور مُسندة بعد.</p>') + '</div><div class="mp-acts"><button type="button" class="primary" data-assign="' + kind + ":" + oid + '">رفع صورة جديدة كغلاف</button><button type="button" class="ghost" data-close="1">إغلاق</button></div></div>';
    el("modal").hidden = false; document.body.classList.add("modal-open");
  }
  function pickCover(kind, oid, aid) { var owner = ownerOf(kind, oid); owner.cover_asset = aid; var a = asset(aid); if (a) { a.cover = true; } persist(); closeModal(); renderAll(); flash("تم تعيين " + aid + " كصورة غلاف لـ " + owner.name + "."); }
  function removeGallery(kind, oid, aid) { var owner = ownerOf(kind, oid); owner.gallery_assets = owner.gallery_assets.filter(function (x) { return x !== aid; }); persist(); renderMain(); flash("أُزيلت " + aid + " من معرض " + owner.name + " (محاكاة)."); }

  /* ---------- assignment + media lifecycle --------------------------- */
  function openAssign(target) {
    var destOpts = DEST.map(function (d) { return '<option value="dest:' + d.id + '">وجهة · ' + esc(d.name) + "</option>"; }).join("");
    var hotelOpts = HOTELS.map(function (h) { return '<option value="hotel:' + h.id + '">فندق · ' + esc(h.name) + "</option>"; }).join("");
    var preselect = target && target.indexOf(":") > 0 && target.indexOf("existing") < 0 ? target : "";
    el("modal").innerHTML = '<div class="m-back" data-close="1"></div><div class="m-panel" role="dialog" aria-modal="true"><h3 class="mp-title">رفع وإسناد صورة</h3><div class="mp-upload"><input type="file" id="asFile" accept="image/*" hidden><button type="button" class="mp-drop" id="asDrop">⬆ اضغط لاختيار صورة من جهازك أو اسحبها هنا</button><div class="mp-preview" id="asPreview" hidden></div><span class="mp-note">معاينة محلية فقط — لا يُحفظ ولا يُرفع أي ملف</span></div><label class="f-row"><span class="f-k">الإسناد إلى</span><select class="f-in" id="asTarget"><optgroup label="الوجهات">' + destOpts + '</optgroup><optgroup label="الفنادق">' + hotelOpts + '</optgroup></select></label><label class="f-row"><span class="f-k">النوع</span><select class="f-in" id="asKind"><option value="cover">صورة غلاف</option><option value="gallery">صورة معرض</option></select></label><div class="mp-autonote">تُعتمد الصورة تلقائياً وتصبح فعّالة فوراً في القوالب والـPDF — لا مراجعة ولا نشر.</div><div class="mp-acts"><button type="button" class="primary" id="asSave">حفظ الإسناد</button><button type="button" class="ghost" data-close="1">إلغاء</button></div></div>';
    if (preselect) el("asTarget").value = preselect;
    el("modal").hidden = false; document.body.classList.add("modal-open");
    pendingUpload = null;
    var existing = target && target.indexOf("existing:") === 0 ? target.split(":")[1] : null;
    el("asSave").addEventListener("click", function () { saveAssign(existing); });
    var fileInp = el("asFile"), drop = el("asDrop");
    if (drop) drop.addEventListener("click", function () { fileInp.click(); });
    if (fileInp) fileInp.addEventListener("change", function (e) { handleAssignFile(e.target.files[0]); });
    if (drop) {
      drop.addEventListener("dragover", function (e) { e.preventDefault(); drop.classList.add("over"); });
      drop.addEventListener("dragleave", function () { drop.classList.remove("over"); });
      drop.addEventListener("drop", function (e) { e.preventDefault(); drop.classList.remove("over"); handleAssignFile(e.dataTransfer.files[0]); });
    }
  }
  function handleAssignFile(file) {
    if (!file || !/^image\//.test(file.type)) { flash("الرجاء اختيار ملف صورة."); return; }
    var reader = new FileReader();
    reader.onload = function (ev) {
      var src = ev.target.result, img = new Image();
      img.onload = function () {
        // downscale to a shareable variant (keeps the cross-page store small)
        var maxd = 1280, w = img.naturalWidth, h = img.naturalHeight, scale = Math.min(1, maxd / Math.max(w, h));
        var cw = Math.max(1, Math.round(w * scale)), ch = Math.max(1, Math.round(h * scale));
        var small = src;
        try { var cv = document.createElement("canvas"); cv.width = cw; cv.height = ch; cv.getContext("2d").drawImage(img, 0, 0, cw, ch); small = cv.toDataURL("image/jpeg", 0.82); } catch (e) { small = src; }
        pendingUpload = { src: small, filename: file.name, dimensions: w + "×" + h, sizeKB: Math.max(1, Math.round((small.length * 0.75) / 1024)) };
        var pv = el("asPreview");
        if (pv) { pv.hidden = false; pv.innerHTML = '<img class="up-img" src="' + small + '" alt=""><div class="up-meta"><span class="up-name">' + esc(file.name) + '</span><span class="up-dim"><span dir="ltr">' + pendingUpload.dimensions + '</span> بكسل · ' + pendingUpload.sizeKB + " كيلوبايت</span><span class=\"up-note\">معاينة محلية — لن تُحفظ على خادم</span></div>"; }
        var drop = el("asDrop"); if (drop) drop.textContent = "✓ تم اختيار صورة — اضغط لتغييرها";
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
  }
  function saveAssign(existingId) {
    var tgt = el("asTarget").value, kind = el("asKind").value;
    var parts = tgt.split(":"), isDest = parts[0] === "dest", oid = parts[1], owner = isDest ? destById(oid) : hotelById(oid), a;
    if (existingId) { a = asset(existingId); a.destination_id = isDest ? oid : null; a.hotel_id = isDest ? null : oid; a.cover = kind === "cover"; a.gallery = kind === "gallery"; a.category = kind; a.scene = owner.scene; a.hue = owner.hue; a.status = "approved"; }
    else { var id = newAssetId(); a = { asset_id: id, category: kind, destination_id: isDest ? oid : null, hotel_id: isDest ? null : oid, cover: kind === "cover", gallery: kind === "gallery", status: "approved", label: (owner.name || "") + " — مُسندة", scene: owner.scene, hue: owner.hue }; MEDIA.push(a); }
    if (pendingUpload) { a.src = pendingUpload.src; a.filename = pendingUpload.filename; a.dimensions = pendingUpload.dimensions; if (kind === "cover") owner.dimensions = pendingUpload.dimensions; }
    if (kind === "cover") owner.cover_asset = a.asset_id; else if (owner.gallery_assets.indexOf(a.asset_id) < 0) owner.gallery_assets.push(a.asset_id);
    var fname = pendingUpload ? " (" + pendingUpload.filename + ")" : "";
    pendingUpload = null;
    persist(); closeModal(); renderAll(); flash("تم إسناد " + a.asset_id + fname + " إلى " + (owner.name || "") + " — تظهر في المعاينة فوراً.");
  }
  function life(id, to) {
    var a = asset(id); if (!a) return;
    if (to === "replace") { a.hue = (a.hue + 24) % 360; a.status = "approved"; flash(a.asset_id + " — استُبدلت الصورة (محاكاة) — معتمدة فوراً"); }
    else { a.status = to; flash(a.asset_id + " → " + ST[to][0]); }
    persist(); renderAll();
  }

  /* ---------- export the Content Studio snapshot (for Chromium PDF) --- */
  function exportSnapshot() {
    var KEY = "season_lab_content_v1", raw = null;
    try { raw = window.localStorage.getItem(KEY); } catch (e) {}
    if (!raw) { try { if (window.ContentStore) window.ContentStore.save(window.CS_DATA); raw = window.localStorage.getItem(KEY); } catch (e) {} }
    if (!raw) { try { var d = window.CS_DATA || {}; raw = JSON.stringify({ destinations: d.destinations, hotels: d.hotels, media: d.media, brands: d.brands, ts: Date.now() }); } catch (e) {} }
    if (!raw) { flash("لا توجد بيانات لتصديرها."); return; }
    try {
      var url = URL.createObjectURL(new Blob([raw], { type: "application/json" }));
      var a = document.createElement("a");
      var stamp = new Date().toISOString().slice(0, 16).replace(/[-:T]/g, "");
      a.href = url; a.download = KEY + "-" + stamp + ".json";
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(function () { URL.revokeObjectURL(url); }, 4000);
      flash("نُزّلت لقطة المحتوى — أرسلها للتوليد عبر Chromium.");
    } catch (e) { flash("تعذّر التصدير: " + (e && e.message || e)); }
  }

  /* ---------- previews ----------------------------------------------- */
  function field(k, v) { return '<div class="pv-f"><span class="pv-k">' + k + '</span><span class="pv-v">' + v + "</span></div>"; }
  function openGuidePreview(id) {
    var d = destById(id); if (!d) return; var br = brandOf(d.brand), cov = asset(d.cover_asset), notApproved = cov && cov.status !== "approved";
    var gal = d.gallery_assets.map(function (g) { return '<div class="pv-gimg">' + assetImg(g, 64) + "</div>"; }).join("");
    var areas = (d.areas || []).map(function (aid) { var a = destById(aid); if (!a) return ""; return '<div class="pv-area">' + assetImg(a.cover_asset, 70) + '<div class="pv-area-b"><b>' + esc(a.name) + "</b><span>" + esc(a.tagline || "") + "</span></div></div>"; }).join("");
    el("modal").innerHTML = '<div class="m-back" data-close="1"></div><div class="pv-frame" role="dialog" aria-modal="true"><div class="pv-bar"><span>معاينة الدليل — يُولّد من محتوى الاستوديو</span><button type="button" class="pv-x" data-close="1">✕</button></div><div class="pv-scroll" style="--bp:' + br.palette[1] + ";--ba:" + br.palette[2] + '"><div class="pv-hero">' + assetImg(d.cover_asset, 200) + '<div class="pv-hov">' + logo(br.logoTint) + '<span class="pv-brand">' + esc(br.name) + '</span><h2>' + esc(d.name) + "</h2></div></div>" + (notApproved ? '<div class="pv-warn">صورة الغلاف ' + ST[cov.status][0] + " — لن تُستخدم في وثيقة فعلية حتى الاعتماد.</div>" : "") + (d.description ? '<div class="pv-sec"><p class="pv-desc">' + esc(d.description) + "</p></div>" : "") + '<div class="pv-sec"><h4>معلومات الوصول</h4>' + field("المطار", esc(d.arrival.airport)) + (d.arrival.notes ? field("ملاحظات", esc(d.arrival.notes)) : "") + field("الجوازات", esc(d.arrival.immigration)) + field("أول الخطوات", esc(d.arrival.firstSteps)) + "</div><div class=\"pv-sec\"><h4>الاتصال والعملة</h4>" + field("الشريحة", esc(d.sim)) + field("الإنترنت", esc(d.internetTips)) + field("العملة", esc(d.currency)) + field("الصرف", esc(d.exchangeTips)) + "</div><div class=\"pv-sec\"><h4>التنقّل</h4>" + field("الوسائل", esc(d.transport)) + "</div><div class=\"pv-emo\">طوارئ · " + esc(d.emergency) + (d.hospital ? " · " + esc(d.hospital) : "") + "</div><div class=\"pv-sec\"><h4>معرض</h4><div class=\"pv-gal\">" + gal + "</div></div>" + (areas ? '<div class="pv-sec"><h4>مناطق موصى بها</h4><div class="pv-areas">' + areas + "</div></div>" : "") + '<p class="pv-foot">كل ما سبق مصدره استوديو المحتوى — لا محتوى ثابت.</p></div></div>';
    el("modal").hidden = false; document.body.classList.add("modal-open");
  }
  function openHotelPreview(id) {
    var h = hotelById(id); if (!h) return; var br = brandOf(h.brand);
    var gal = h.gallery_assets.map(function (g) { return '<div class="pv-gimg">' + assetImg(g, 64) + "</div>"; }).join("");
    el("modal").innerHTML = '<div class="m-back" data-close="1"></div><div class="pv-frame" role="dialog" aria-modal="true"><div class="pv-bar"><span>معاينة الفندق — يُولّد من محتوى الاستوديو</span><button type="button" class="pv-x" data-close="1">✕</button></div><div class="pv-scroll" style="--bp:' + br.palette[1] + ";--ba:" + br.palette[2] + '"><div class="pv-hero">' + assetImg(h.cover_asset, 200) + '<div class="pv-hov">' + logo(br.logoTint) + '<h2>' + esc(h.name) + "</h2></div></div><div class=\"pv-sec\"><div class=\"pv-gal\">" + gal + "</div></div><div class=\"pv-sec\"><p class=\"pv-desc\">" + esc(h.description) + "</p>" + field("تسجيل الدخول", esc(h.checkIn)) + field("تسجيل الخروج", esc(h.checkOut)) + field("الموقع", esc(h.location)) + "</div><div class=\"pv-sec\"><h4>المميزات</h4><div class=\"pv-tags\">" + h.highlights.map(function (x) { return '<span class="pv-tag">' + esc(x) + "</span>"; }).join("") + "</div></div><p class=\"pv-foot\">المحتوى مصدره الاستوديو.</p></div></div>";
    el("modal").hidden = false; document.body.classList.add("modal-open");
  }
  function closeModal() { var m = el("modal"); if (m) { m.hidden = true; m.innerHTML = ""; } document.body.classList.remove("modal-open"); pendingUpload = null; }
  function flash(msg) { var f = el("flash"); f.textContent = msg; f.classList.remove("err"); f.onclick = null; f.classList.add("show"); clearTimeout(flash._t); flash._t = setTimeout(function () { f.classList.remove("show"); }, 2600); }
  function flashError(msg) { var f = el("flash"); f.textContent = msg; clearTimeout(flash._t); f.classList.add("show", "err"); f.onclick = function () { f.classList.remove("show", "err"); f.onclick = null; }; }
  var _pt; function persistSoon() { clearTimeout(_pt); _pt = setTimeout(persist, 300); }
  function persist() {
    if (!window.ContentStore) return true;
    var ok = window.ContentStore.save(window.CS_DATA);
    if (ok === false) { flashError("⚠ لم تُحفَظ التغييرات — مساحة التخزين على الجهاز ممتلئة. آخر صورة/غلاف لم يُحفَظ، ولن يظهر في المحرّك أو الـPDF. احذف صوراً قديمة أو استخدم صوراً أصغر ثم أعد المحاولة. (اضغط للإغلاق)"); return false; }
    return true;
  }

  /* ---------- render + wire ------------------------------------------ */
  function setByPath(obj, path, val) { var p = path.split("."); var o = obj; for (var i = 0; i < p.length - 1; i++) o = o[p[i]]; o[p[p.length - 1]] = val; }
  function renderMain() {
    var s = state.section, h = "";
    if (s === "destinations") h = state.selDest ? destDetail(destById(state.selDest)) : destList();
    else if (s === "hotels") h = state.selHotel ? hotelDetail(hotelById(state.selHotel)) : hotelList();
    else if (s === "brands") h = brandsView();
    else if (s === "governance") h = governanceView();
    else h = mediaView();
    el("main").innerHTML = h;
  }
  function renderTabs() { Array.prototype.forEach.call(document.querySelectorAll("[data-section]"), function (b) { b.classList.toggle("on", b.getAttribute("data-section") === state.section); }); }
  function renderAll() { renderTabs(); renderMain(); }

  function wire() {
    el("now").textContent = (D.meta && D.meta.now) || "";
    var ex = el("exportSnapBtn"); if (ex) ex.addEventListener("click", exportSnapshot);
    document.addEventListener("click", function (e) {
      var sec = e.target.closest("[data-section]"); if (sec) { state.section = sec.getAttribute("data-section"); state.selDest = null; state.selHotel = null; renderAll(); return; }
      if (e.target.closest("[data-close]")) { closeModal(); return; }
      if (e.target.closest("[data-back]")) { state.selDest = null; state.selHotel = null; renderMain(); return; }
      var dc = e.target.closest("[data-dest]"); if (dc) { state.selDest = dc.getAttribute("data-dest"); renderMain(); return; }
      var hc = e.target.closest("[data-hotel]"); if (hc) { state.selHotel = hc.getAttribute("data-hotel"); renderMain(); return; }
      var mf = e.target.closest("[data-mfilter]"); if (mf) { state.mediaFilter = mf.getAttribute("data-mfilter"); renderMain(); return; }
      var pv = e.target.closest("[data-preview]"); if (pv) { var v = pv.getAttribute("data-preview").split(":"); v[0] === "guide" ? openGuidePreview(v[1]) : openHotelPreview(v[1]); return; }
      var cov = e.target.closest("[data-cover]"); if (cov) { var c = cov.getAttribute("data-cover").split(":"); openCoverPicker(c[0], c[1]); return; }
      var arr = e.target.closest("[data-arrival]"); if (arr) { openArrivalImage(arr.getAttribute("data-arrival")); return; }
      var par = e.target.closest("[data-pickarrival]"); if (par) { var pa = par.getAttribute("data-pickarrival").split(":"); pickArrivalAsset(pa[0], pa[1]); return; }
      var ac = e.target.closest("[data-arrclear]"); if (ac) { clearArrival(ac.getAttribute("data-arrclear")); return; }
      var pc = e.target.closest("[data-pickcover]"); if (pc) { var q = pc.getAttribute("data-pickcover").split(":"); pickCover(q[0], q[1], q[2]); return; }
      var gr = e.target.closest("[data-galremove]"); if (gr) { var g = gr.getAttribute("data-galremove").split(":"); removeGallery(g[0], g[1], g[2]); return; }
      var asn = e.target.closest("[data-assign]"); if (asn) { openAssign(asn.getAttribute("data-assign")); return; }
      var ae = e.target.closest("[data-assignexisting]"); if (ae) { openAssign("existing:" + ae.getAttribute("data-assignexisting")); return; }
      var lf = e.target.closest("[data-life]"); if (lf) { var p = lf.getAttribute("data-life").split(":"); life(p[0], p[1]); return; }
      var ba = e.target.closest("[data-badd]"); if (ba) { addItem(ba.getAttribute("data-badd")); return; }
      var brm = e.target.closest("[data-bremove]"); if (brm) { var x = brm.getAttribute("data-bremove").split(":"); removeItem(x[0], +x[1]); return; }
      var bi = e.target.closest("[data-bimg]"); if (bi) { var y = bi.getAttribute("data-bimg").split(":"); openItemImage(y[0], +y[1]); return; }
      var pit = e.target.closest("[data-pickitem]"); if (pit) { pickItemAsset(pit.getAttribute("data-pickitem")); return; }
    });
    document.addEventListener("input", function (e) {
      var be = e.target.closest("[data-bedit]"); if (be) { var q = be.getAttribute("data-bedit").split(":"), d = destById(state.selDest); if (d && d[q[0]] && d[q[0]][+q[1]]) { d[q[0]][+q[1]][q[2]] = be.value; persistSoon(); } return; }
      var f = e.target.closest("[data-path]"); if (!f) return; var path = f.getAttribute("data-path");
      if (state.section === "destinations" && state.selDest) setByPath(destById(state.selDest), path, f.value);
      else if (state.section === "hotels" && state.selHotel) { var h = hotelById(state.selHotel); if (path === "highlightsStr") h.highlights = f.value.split(/،|,/).map(function (x) { return x.trim(); }).filter(Boolean); else setByPath(h, path, f.value); }
      persistSoon();
    });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeModal(); });
  }
  document.addEventListener("DOMContentLoaded", function () { try { wire(); renderAll(); } catch (err) { console.error(err); document.body.insertAdjacentHTML("beforeend", '<pre style="color:#d9645a;padding:16px">خطأ: ' + esc(err.message) + "</pre>"); } });
})();
