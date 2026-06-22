/* =====================================================================
   config.js — set the PDF render endpoint in ONE place. Loaded before
   pdf-export.js by both book.html and editor.html.

   Integrated build: the Travel Book lives at <site>/travel-book/ inside the
   operations portal, and the render function is deployed at the site root:
     /.netlify/functions/travel-book-pdf      (Netlify build deploy)

   Self-host alternative (no Netlify limits): run server/pdf-server.js and set
     window.TB_PDF_ENDPOINT = "https://your-host/pdf";
   ===================================================================== */
window.TB_PDF_ENDPOINT = "/.netlify/functions/travel-book-pdf";
