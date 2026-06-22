/* =====================================================================
   image-store.js — the ONE storage adapter for uploaded files.

   This phase: images are downscaled and embedded as base64 data: URLs;
   other files (PDF tickets/vouchers) are embedded as base64 too. The slot
   value stays a plain string (data:... or http...), so the booklet
   renderer, the PDF, and the editor workflow do NOT care where bytes live.

   LATER (Bandar): replace ONLY the bodies of putImage()/putFile() with a
   Supabase Storage upload that returns the public URL. Keep the same return
   type (a string ref for images; {filename,ref,mime,size} for files). Nothing
   else changes — editor, guide renderer, PDF generator, and the user
   experience stay identical. Flip ImageStore.kind to "storage" for labels.

   To swap later, the body becomes roughly:
     const path = `trips/${tripId}/${crypto.randomUUID()}-${file.name}`;
     const { data, error } = await supabase.storage.from('travel-book').upload(path, file);
     const { data:{ publicUrl } } = supabase.storage.from('travel-book').getPublicUrl(path);
     return publicUrl;                       // <- same string-ref contract
   ===================================================================== */
(function (root) {
  "use strict";

  var DEFAULTS = { max: 1600, quality: 0.82 };   // downscale ceiling + JPEG quality

  /* read a File into a base64 data: URL */
  function readDataURL(file) {
    return new Promise(function (res, rej) {
      if (!file) return rej(new Error("لا يوجد ملف"));
      var r = new FileReader();
      r.onload = function () { res(r.result); };
      r.onerror = function () { rej(new Error("تعذّرت قراءة الملف")); };
      r.readAsDataURL(file);
    });
  }

  /* downscale an image data URL via canvas; returns a JPEG data URL.
     If the source isn't a decodable image (e.g. a PDF), returns it unchanged. */
  function downscale(dataUrl, opts) {
    opts = opts || {};
    var max = opts.max || DEFAULTS.max, q = opts.quality || DEFAULTS.quality;
    return new Promise(function (res) {
      var img = new Image();
      img.onload = function () {
        var w = img.naturalWidth, h = img.naturalHeight;
        if (!w || !h) return res(dataUrl);
        var scale = Math.min(1, max / Math.max(w, h));
        var cw = Math.max(1, Math.round(w * scale)), ch = Math.max(1, Math.round(h * scale));
        try {
          var c = document.createElement("canvas"); c.width = cw; c.height = ch;
          c.getContext("2d").drawImage(img, 0, 0, cw, ch);
          res(c.toDataURL("image/jpeg", q));
        } catch (e) { res(dataUrl); }   // tainted/large canvas -> keep original
      };
      img.onerror = function () { res(dataUrl); };  // not an image -> unchanged
      img.src = dataUrl;
    });
  }

  /* PUBLIC: store an image slot. Returns a STRING ref (data: now, https later). */
  function putImage(file, opts) {
    return readDataURL(file).then(function (d) { return downscale(d, opts); });
  }

  /* PUBLIC: store an arbitrary file (ticket/voucher PDF or image).
     Returns { filename, ref, mime, size }. ref is the string stored in the model. */
  function putFile(file) {
    return readDataURL(file).then(function (d) {
      return { filename: file.name, ref: d, mime: file.type || "", size: file.size || 0 };
    });
  }

  /* approximate stored size (KB) of a data: URL — for UI labels/guards */
  function approxKB(ref) {
    if (!ref || ref.indexOf("data:") !== 0) return 0;
    var i = ref.indexOf(","); var b = ref.length - (i + 1);
    return Math.max(1, Math.round(b * 0.73 / 1024));
  }

  var API = { kind: "base64", putImage: putImage, putFile: putFile, approxKB: approxKB, DEFAULTS: DEFAULTS };
  if (typeof module !== "undefined" && module.exports) module.exports = API;
  if (typeof window !== "undefined") window.ImageStore = API;
})(this);
