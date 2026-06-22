/* pdf-export-client.js — direct Chromium PDF download. No browser print. No Safari.
 *
 * Public API is unchanged:  window.exportSeasonPDF(dest, style)
 * The existing "توليد PDF (خادم)" button calls it exactly as before.
 *
 * It sends the current Content Studio snapshot to the server-side Chromium
 * service, which renders pdf-render.html (the EXACT magazine Template Engine
 * pages) and returns a finished PDF — Safari never renders or prints anything.
 *
 * PATCH (export-only): the client now (1) validates the response is really a
 * PDF before downloading, so a misconfigured deploy can never download an error
 * page saved as ".pdf"; and (2) surfaces a clear, actionable Arabic message
 * (the button's handler shows it via alert) — especially the common case where
 * the service isn't deployed (static drag-and-drop deploys cannot run Chromium).
 *
 * Point it at your deployed service if not same-site:
 *   window.PDF_SERVICE_URL = "https://pdf.yourhost.com";   // before this script
 */
(function () {
  "use strict";
  var STORE_KEY = "season_lab_content_v1";                 // same key the app uses

  // Default: same-site Netlify Function. Override window.PDF_SERVICE_URL to use
  // a dedicated Chromium server (its endpoint is <url>/export, e.g. pdf-server.js).
  function serviceUrl() {
    if (window.PDF_SERVICE_URL) return window.PDF_SERVICE_URL.replace(/\/+$/, "") + "/export";
    return "/.netlify/functions/generate-pdf";
  }

  function readSnapshot() {
    try { var raw = window.localStorage.getItem(STORE_KEY); return raw ? JSON.parse(raw) : null; }
    catch (e) { return null; }
  }

  function friendly(status, bodyText) {
    if (status === 404)
      return "خدمة توليد PDF غير منشورة. تتطلّب نشر دالة Netlify (عبر Git أو `netlify deploy`) " +
             "أو تشغيل pdf-server.js — لا تعمل مع النشر الثابت بالسحب والإفلات (Chromium يحتاج بيئة تشغيل).";
    var extra = bodyText ? (" — " + String(bodyText).replace(/\s+/g, " ").slice(0, 180)) : "";
    return "فشل توليد PDF (" + status + ")" + extra;
  }

  function exportSeasonPDF(dest, style) {
    dest = dest || "bali"; style = style || "magazine";
    var got = false;
    return fetch(serviceUrl(), {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ dest: dest, style: style, snapshot: readSnapshot() })
    }).then(function (res) {
      got = true;
      var ct = (res.headers.get("content-type") || "").toLowerCase();
      if (!res.ok || ct.indexOf("application/pdf") === -1) {
        // Never download a non-PDF as a PDF; read the body for a useful message.
        return res.text().then(function (txt) { throw new Error(friendly(res.status, txt)); });
      }
      return res.blob();
    }).then(function (blob) {
      if (!(blob instanceof Blob) || blob.size < 1000) throw new Error("الملف الناتج غير صالح (فارغ).");
      var url = URL.createObjectURL(blob);                 // direct download
      var a = document.createElement("a");
      a.href = url; a.download = "season-" + dest + ".pdf";
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(function () { URL.revokeObjectURL(url); }, 4000);
    }).catch(function (e) {
      // fetch() itself rejected (network / CORS / service unreachable)
      if (!got) throw new Error("تعذّر الوصول إلى خدمة التوليد (الشبكة أو CORS أو الخدمة غير منشورة).");
      throw e;
    });
  }

  window.exportSeasonPDF = exportSeasonPDF;
})();
