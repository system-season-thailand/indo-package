/* =====================================================================
   premium-template-lab-sample-data.js
   PRESENTATION CONFIG ONLY for the Premium Travel Pack Template Engine.
   This file owns NO content — it only declares the three design-language
   concepts and the order in which reusable blocks are composed.
   All destination content (intro, dining, shopping, cafes, exchange,
   topRecs, tips, arrival, sim, currency, transport, emergency, areas,
   cover/gallery) is OWNED by the Content Studio (window.CS_DATA) and
   consumed here via the shared content store. Exposes window.TPL_DATA.
   ===================================================================== */
(function () {
  "use strict";
  window.TPL_DATA = {
    meta: { product: "سيزون ترافل — محرّك قوالب حقيبة السفر", now: "2026-06-18", note: "إعداد عرض فقط — كل المحتوى مصدره استوديو المحتوى" },
    // SAMPLE PREVIEW ONLY — the traveler/booking layer (NOT destination content).
    // In production this comes from the booking system, never from the PDF.
    previewTrip: { traveler: "ضيف سيزون الكريم", dates: "١٢–١٨ سبتمبر ٢٠٢٦", room: "جناح فاخر بإطلالة", confirmation: "SZN-2026-0917", mapHint: "خريطة الموقع · رابط في النسخة الرقمية" },
    concepts: [
      { id: "magazine", name: "مجلة فاخرة", blocks: ["hero", "intro", "areas", "restaurants", "shopping", "cafes", "exchange", "emergency"] },
      { id: "mobile", name: "الجوال أولاً", blocks: ["hero", "arrival", "sim", "currency", "transport", "restaurants", "shopping", "emergency"] },
      { id: "concierge", name: "كونسيرج فاخر", blocks: ["hero", "welcome", "topRecs", "restaurants", "shopping", "tips", "emergency"] }
    ]
  };
})();
