/* =====================================================================
   pdf-export.js — the ONLY client path to a PDF. POSTs booklet data to the
   server-side Chromium endpoint and downloads the returned file.

   Hardened: it verifies the response is actually a PDF. If the endpoint is
   missing (404 HTML), errors (500 JSON), or returns anything that isn't a
   PDF, it surfaces a SHORT, clear message — it never downloads or shows raw
   HTML as if it were a PDF.

   Endpoint is set in config.js via window.TB_PDF_ENDPOINT.
   ===================================================================== */
(function () {
  "use strict";
  function endpoint() { return window.TB_PDF_ENDPOINT || "/.netlify/functions/travel-book-pdf"; }

  function shortMsg(status, ct, text) {
    if (status === 404)
      return "خدمة توليد PDF غير موجودة (404). الدالة غير منشورة على المسار: " + endpoint();
    if (ct.indexOf("application/json") !== -1) {
      try { var j = JSON.parse(text); if (j && j.error) return "خطأ من الخادم: " + String(j.error); } catch (e) {}
    }
    if (ct.indexOf("text/html") !== -1)
      return "الخادم أعاد صفحة HTML بدل PDF (" + status + "). تحقّق من نشر الدالة ومسارها.";
    return "استجابة غير صالحة (" + status + ") — ليست ملف PDF.";
  }

  function exportViaServer(data, opts) {
    opts = opts || {};
    var onStart = opts.onStart || function () {}, onDone = opts.onDone || function () {},
        onError = opts.onError || function (e) { alert("تعذّر توليد PDF: " + (e && e.message || e)); };
    onStart();
    return fetch(endpoint(), {
      method: "POST", headers: { "Content-Type": "application/json", "Accept": "application/pdf" },
      body: JSON.stringify(data)
    })
    .then(function (r) {
      var ct = (r.headers.get("content-type") || "").toLowerCase();
      if (!r.ok || ct.indexOf("application/pdf") === -1) {
        // read a little text only to extract a clean message; NEVER surface raw HTML
        return r.text().then(function (t) { throw new Error(shortMsg(r.status, ct, t || "")); });
      }
      return r.blob();
    })
    .then(function (blob) {
      if (!blob || (blob.type && blob.type.indexOf("pdf") === -1 && blob.type.indexOf("octet-stream") === -1))
        throw new Error("الملف الناتج ليس PDF.");
      if (blob.size < 1000) throw new Error("الملف الناتج صغير/فارغ — فشل التوليد على الخادم.");
      var a = document.createElement("a");
      a.href = URL.createObjectURL(blob); a.download = opts.filename || "travel-book.pdf";
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(function () { URL.revokeObjectURL(a.href); }, 4000);
      onDone();
    })
    .catch(function (e) {
      if (e && /Failed to fetch|NetworkError|Load failed/i.test(String(e.message)))
        e = new Error("تعذّر الوصول لخدمة الـPDF. تحقّق من الاتصال أو رابط الخدمة: " + endpoint());
      onError(e);
    });
  }

  window.TBExport = { exportViaServer: exportViaServer, endpoint: endpoint };
})();
