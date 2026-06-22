/* =====================================================================
   image-resolver.js — ONE shared image resolver for ALL visual slots.
   Loaded by BOTH the Content Studio and the Template Engine so that any
   image the user adds/assigns/uploads anywhere in the Studio renders
   identically in the Studio preview, the Template Engine preview, and
   the PDF output. No layout/typography/PDF-design change — this only
   decides WHICH source a slot shows, using one rule everywhere.

   resolveImage rule (single source of truth):
     1. assetId is a direct image source (data: | blob: | http(s): | path
        | /path)                                  -> render it directly.
     2. assetId is a media asset id WITH src       -> render media.src.
     3. assetId is a media asset id WITHOUT src    -> SVG from asset.scene/hue.
     4. anything else (missing / dangling id)      -> SVG from fallback scene/hue.

   The page passes its own svg(scene,hue,h) renderer so the fallback
   artwork is byte-for-byte the same as before (no visual change).
   ===================================================================== */
(function () {
  "use strict";

  /* A value is a directly-renderable image source if it is an inline/remote
     image or any path. Media asset ids ("IMG-001") never contain "/" and
     never start with these schemes, so they are never misclassified. */
  function isDirect(s) {
    if (typeof s !== "string" || !s) return false;
    return /^(data:|blob:|https?:)/.test(s) || s.charAt(0) === "/" || s.indexOf("/") >= 0;
  }

  function findAsset(media, id) {
    if (!media || !id) return null;
    for (var i = 0; i < media.length; i++) {
      if (media[i] && media[i].asset_id === id) return media[i];
    }
    return null;
  }

  /* Decide the source for any slot. Returns one of:
       { type: "img", src: "<direct or media.src>" }
       { type: "svg", scene: <s>, hue: <h> }
     Never throws; always returns a usable descriptor. */
  function classify(assetId, media, fallbackScene, fallbackHue) {
    if (isDirect(assetId)) return { type: "img", src: assetId };       // (1)
    var a = findAsset(media, assetId);
    if (a) {
      if (a.src) return { type: "img", src: a.src };                   // (2)
      return { type: "svg", scene: a.scene, hue: a.hue };              // (3)
    }
    return { type: "svg", scene: fallbackScene, hue: fallbackHue };    // (4)
  }

  /* ---- intentional, controlled fallback artwork (never an empty block) ----
     Reproduces the existing gradient + scenery base verbatim (so small slots
     are unchanged and nothing is redesigned), but for the fallback case it
     (a) mutes the slab toward a refined dark neutral so it never reads as a
     vivid green block, and (b) for hero-scale areas adds a centered icon-only
     placeholder emblem so the empty state looks deliberate, not broken.
     No text is used (typography untouched). */
  var _seq = 0;
  function _scenery(scene, h) {
    var sun = '<circle cx="312" cy="42" r="22" fill="rgba(255,242,205,0.5)"/><circle cx="312" cy="42" r="12" fill="rgba(255,247,228,0.9)"/>';
    if (scene === "temple") return sun + '<path d="M0 ' + (h - 24) + ' H400 V' + h + ' H0Z" fill="rgba(0,0,0,0.22)"/><path d="M150 ' + (h - 24) + ' l32 -80 32 80z" fill="rgba(0,0,0,0.4)"/><path d="M70 ' + (h - 24) + ' l22 -54 22 54z" fill="rgba(0,0,0,0.3)"/><path d="M250 ' + (h - 24) + ' l24 -60 24 60z" fill="rgba(0,0,0,0.28)"/>';
    if (scene === "island") return sun + '<path d="M0 ' + (h - 22) + ' Q120 ' + (h - 44) + ' 240 ' + (h - 26) + ' T400 ' + (h - 30) + ' V' + h + ' H0Z" fill="rgba(0,0,0,0.22)"/><path d="M-10 ' + (h - 30) + ' Q70 ' + (h - 86) + ' 150 ' + (h - 30) + 'Z" fill="rgba(0,0,0,0.38)"/><path d="M150 ' + (h - 30) + ' Q250 ' + (h - 104) + ' 350 ' + (h - 30) + 'Z" fill="rgba(0,0,0,0.3)"/>';
    if (scene === "city") return sun + '<g fill="rgba(0,0,0,0.34)"><rect x="40" y="' + (h - 78) + '" width="40" height="78"/><rect x="92" y="' + (h - 56) + '" width="34" height="56"/><rect x="140" y="' + (h - 96) + '" width="30" height="96"/><rect x="182" y="' + (h - 64) + '" width="40" height="64"/><rect x="236" y="' + (h - 84) + '" width="32" height="84"/><rect x="280" y="' + (h - 50) + '" width="44" height="50"/></g>';
    if (scene === "resort") return sun + '<path d="M0 ' + (h - 24) + ' H400 V' + h + ' H0Z" fill="rgba(0,0,0,0.22)"/><rect x="70" y="' + (h - 70) + '" width="110" height="46" rx="4" fill="rgba(0,0,0,0.32)"/><rect x="206" y="' + (h - 56) + '" width="84" height="32" rx="4" fill="rgba(0,0,0,0.26)"/>';
    return sun + '<path d="M0 ' + (h - 24) + ' Q100 ' + (h - 40) + ' 200 ' + (h - 26) + ' T400 ' + (h - 30) + ' V' + h + ' H0Z" fill="rgba(0,0,0,0.2)"/><path d="M64 ' + (h - 24) + ' v-44 M64 ' + (h - 68) + ' q-18 -6 -28 6 M64 ' + (h - 68) + ' q18 -6 28 6" stroke="rgba(0,0,0,0.4)" stroke-width="3" fill="none"/>';
  }
  /* centered icon-only "photo placeholder" emblem (framed mountain + sun) */
  function _emblem(h) {
    var cy = h / 2, fw = 116, fh = 82, x = 200 - fw / 2, y = cy - fh / 2;
    var lw = "rgba(240,235,224,0.55)";
    return '<g opacity="0.9">' +
      '<rect x="' + x + '" y="' + y + '" width="' + fw + '" height="' + fh + '" rx="12" fill="rgba(8,14,12,0.28)" stroke="' + lw + '" stroke-width="2.2"/>' +
      '<circle cx="' + (x + fw - 30) + '" cy="' + (y + 26) + '" r="9" fill="none" stroke="' + lw + '" stroke-width="2.2"/>' +
      '<path d="M' + (x + 14) + ' ' + (y + fh - 16) + ' l26 -30 18 20 14 -16 18 26z" fill="none" stroke="' + lw + '" stroke-width="2.2" stroke-linejoin="round"/>' +
      '</g>';
  }
  /* Build a fallback SVG. For h < 220 it is byte-identical to the legacy
     gradient+scenery (small slots unchanged); for hero-scale h it mutes the
     palette and adds the centered emblem so it reads as an intentional state. */
  function fallbackSVG(scene, hue, h) {
    scene = scene || "city"; hue = (hue == null) ? 200 : hue;
    var hero = h >= 220;
    var c1 = hero ? "hsl(" + hue + ",24%,15%)" : "hsl(" + hue + ",46%,18%)";
    var c2 = hero ? "hsl(" + hue + ",20%,28%)" : "hsl(" + hue + ",42%,37%)";
    var gid = "fg" + (++_seq);
    var s = '<svg class="img-svg" viewBox="0 0 400 ' + h + '" preserveAspectRatio="xMidYMid slice" aria-hidden="true">' +
      '<defs><linearGradient id="' + gid + '" x1="0" y1="0" x2="0" y2="1">' +
      '<stop offset="0" stop-color="' + c1 + '"/><stop offset="0.6" stop-color="' + c2 + '"/><stop offset="1" stop-color="' + c1 + '"/></linearGradient>' +
      (hero ? '<radialGradient id="' + gid + 'v" cx="50%" cy="42%" r="70%"><stop offset="0" stop-color="rgba(255,255,255,0.05)"/><stop offset="1" stop-color="rgba(0,0,0,0.28)"/></radialGradient>' : "") +
      '</defs>' +
      '<rect width="400" height="' + h + '" fill="url(#' + gid + ')"/>' + _scenery(scene, h) +
      (hero ? '<rect width="400" height="' + h + '" fill="url(#' + gid + 'v)"/>' + _emblem(h) : "") +
      "</svg>";
    return s;
  }

  /* Render a slot to HTML. ctx = { media } (svg accepted but no longer needed). */
  function render(assetId, fallbackScene, fallbackHue, h, ctx) {
    ctx = ctx || {};
    var media = ctx.media || (window.CS_DATA && window.CS_DATA.media) || [];
    var r = classify(assetId, media, fallbackScene, fallbackHue);
    if (r.type === "img") return '<img class="img-real" src="' + r.src + '" alt="">';
    return fallbackSVG(r.scene, r.hue, h); // intentional, controlled — never an empty block
  }

  /* True when the slot will show a real uploaded/assigned image (cases 1-2). */
  function isReal(assetId, media) {
    return classify(assetId, media, null, null).type === "img";
  }

  window.ImageResolver = {
    isDirect: isDirect,
    findAsset: findAsset,
    classify: classify,
    render: render,
    fallbackSVG: fallbackSVG,
    isReal: isReal
  };
})();
