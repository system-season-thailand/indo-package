/* =====================================================================
   voucher-experience-lab-sample-data.js
   SAMPLE data for the Document Experience Lab (visual prototype only).
   Brand resolves per Addendum A:
     booking_id → program_brand_id → brand_profile → logo/colors/template.
   Exposes a single global: window.VLAB_DATA.
   ===================================================================== */

/* =====================================================================
   ▼▼▼  SAMPLE DATA SOURCE  (LAB MODE — no backend)  ▼▼▼
   FUTURE SUPABASE DATA SOURCE: replace with Booking Hub + Content Library
   resolved at compose time. No real generation, PDF, or release here.
   DO NOT WRITE IN LAB MODE.
   ===================================================================== */
(function () {
  "use strict";

  var brands = {
    "season-indonesia": {
      id: "season-indonesia", name: "سيزون إندونيسيا", short: "إندونيسيا",
      brand_profile_id: "BP-IDN-v3", logo_asset_id: "LOGO-IDN-v3", voucher_template_id: "VT-IDN-v2",
      logoTint: "#6fe0c8", primary: "#2e7d70", accent: "#4fb3a0",
      grad: ["#0e2a25", "#2e7d70"], tag: "أرخبيل الجزر الاستوائية"
    },
    "season-thailand": {
      id: "season-thailand", name: "سيزون تايلاند", short: "تايلاند",
      brand_profile_id: "BP-THA-v2", logo_asset_id: "LOGO-THA-v2", voucher_template_id: "VT-THA-v2",
      logoTint: "#f0d289", primary: "#b8862f", accent: "#e2c57e",
      grad: ["#2a1c0c", "#b8862f"], tag: "أرض الابتسامة"
    }
  };

  var destinations = {
    bali: {
      name: "بالي", country: "إندونيسيا", hue: 168, scene: "beach",
      welcome: "أهلاً بك في جزيرة الآلهة — شواطئ بركانية، معابد عريقة، وضيافة لا تُنسى.",
      arrival: { airport: "مطار نغوراه راي الدولي (DPS)", immigration: "تأشيرة عند الوصول للسعوديين · صفّ الأجانب", firstSteps: "استلام الحقائب ← الخروج من الصالة الدولية ← سائقك بانتظارك بلوحة باسمك" },
      currency: "روبية إندونيسية (IDR) · الصرافة في المطار والفنادق", sim: "Telkomsel / Indosat — أكشاك المطار، تفعيل فوري",
      weather: "استوائي · ٢٧–٣٢°م · أمطار متفرقة", transport: "Grab / Gojek للتنقّل · سائق خاص لليوم للجولات",
      emergency: "الطوارئ ١١٢ · الشرطة السياحية · مستشفى BIMC نوسا دوا",
      localRecs: [{ n: "لا لوسيولا", d: "عشاء راقٍ على الشاطئ" }, { n: "أوبود", d: "مصاطب الأرز والمعابد" }, { n: "بحيرة باتور", d: "شروق فوق البركان" }],
      tips: ["احمل نقداً صغيراً للأسواق المحلية", "استأجر سائقاً موثوقاً لليوم بدل سيارات الأجرة", "احترم لباس المعابد (ساراونغ يُوفَّر عادةً)"]
    },
    bangkok: {
      name: "بانكوك", country: "تايلاند", hue: 40, scene: "temple",
      welcome: "أهلاً بك في بانكوك — معابد ذهبية، أسواق نابضة، ومطبخ لا يُضاهى.",
      arrival: { airport: "مطار سوفارنابومي (BKK)", immigration: "إعفاء تأشيرة حتى ٣٠ يوماً · بوابة E", firstSteps: "استلام الحقائب ← بوابة الاستقبال E ← المرشد بانتظارك بلوحة باسمك" },
      currency: "بات تايلندي (THB) · صرافة SuperRich أفضل سعر", sim: "AIS / TrueMove — أكشاك المطار، باقات سياحية",
      weather: "حار رطب · ٢٨–٣٤°م", transport: "BTS سكاي ترين أسرع وسيلة · Grab · القوارب النهرية",
      emergency: "الطوارئ ١٩١ · الشرطة السياحية ١١٥٥ · مستشفى بانكوك",
      localRecs: [{ n: "نهر تشاو فرايا", d: "عشاء على متن قارب" }, { n: "تشاتوتشاك", d: "أكبر سوق في آسيا" }, { n: "وات أرون", d: "معبد الفجر عند الغروب" }],
      tips: ["ساوم بلطف في الأسواق", "استخدم سيارات الأجرة بالعدّاد أو Grab", "احفظ عنوان الفندق بالتايلندية على هاتفك"]
    },
    phuket: {
      name: "بوكيت", country: "تايلاند", hue: 32, scene: "island",
      welcome: "أهلاً بك في بوكيت — خلجان هادئة وجزر زمردية.",
      arrival: { airport: "مطار بوكيت الدولي (HKT)", immigration: "ضمن الإعفاء التايلندي", firstSteps: "استلام الحقائب ← الصالة الرئيسية ← السائق بانتظارك" },
      currency: "بات تايلندي (THB)", sim: "AIS / TrueMove", weather: "استوائي · ٢٨–٣٣°م",
      transport: "سيارة خاصة · قوارب سريعة للجزر", emergency: "الطوارئ ١٩١ · خفر السواحل · مستشفى بوكيت الدولي",
      localRecs: [{ n: "جزر فاي فاي", d: "رحلة بحرية ليوم كامل" }, { n: "خليج بانغا", d: "كهوف وجزر جيرية" }, { n: "بلدة بوكيت القديمة", d: "عمارة صينية برتغالية" }],
      tips: ["احذر التيارات البحرية", "احجز رحلات الجزر صباحاً", "احمل واقي شمس صديقاً للبيئة"]
    }
  };

  var hotels = {
    "mulia-bali": {
      name: "ذا موليا بالي", destination: "bali", hue: 172, scene: "resort", checkIn: "15:00", checkOut: "12:00",
      address: "شاطئ نوسا دوا، بالي، إندونيسيا", contact: "+62 361 301 7777",
      description: "منتجع فاخر على الواجهة البحرية في نوسا دوا، أجنحة واسعة وخدمة استثنائية.",
      highlights: ["إطلالة على المحيط", "سبا حائز على جوائز", "٦ مطاعم فاخرة"],
      notes: "تسجيل الدخول ١٥:٠٠ · يُرجى إبراز هذه القسيمة وجواز السفر عند الاستقبال · الإفطار مشمول."
    },
    "siam-bangkok": {
      name: "ذا سيام بانكوك", destination: "bangkok", hue: 40, scene: "resort", checkIn: "14:00", checkOut: "12:00",
      address: "ضفاف نهر تشاو فرايا، بانكوك، تايلاند", contact: "+66 2 206 6999",
      description: "فندق بوتيكي على ضفاف النهر يمزج الطراز التايلندي الكلاسيكي بالفخامة المعاصرة.",
      highlights: ["أجنحة بمسبح خاص", "قارب خاص للنقل النهري", "سبا تايلندي أصيل"],
      notes: "قارب الفندق الخاص يقلّك من رصيف ساتورن · الإفطار مشمول · تسجيل الدخول ١٤:٠٠."
    },
    "anantara-phuket": {
      name: "أنانتارا لايان بوكيت", destination: "phuket", hue: 30, scene: "resort", checkIn: "15:00", checkOut: "12:00",
      address: "خليج لايان، بوكيت، تايلاند", contact: "+66 76 317 200",
      description: "فيلات شاطئية هادئة على خليج خاص، مثالية للعائلات والاسترخاء.",
      highlights: ["فيلات بمسابح خاصة", "شاطئ خاص", "أنشطة عائلية"],
      notes: "خدمة النقل من مطار بوكيت متاحة · الإفطار مشمول · فيلات عائلية متصلة عند الطلب."
    }
  };

  var bookings = [
    {
      booking_id: "BK-IDN-2026-014", program_brand_id: "season-indonesia", destination_id: "bali",
      brand_profile_id: "BP-IDN-v3", logo_asset_id: "LOGO-IDN-v3", voucher_template_id: "VT-IDN-v2",
      label: "شهر عسل · بالي",
      travelers: [{ name: "عبدالله الراشد", ticket: "618-2241567890" }, { name: "نورة الراشد", ticket: "618-2241567891" }],
      dates: { start: "2026-07-12", end: "2026-07-17" },
      hotels: [{ hotel_id: "mulia-bali", confirmation_number: "MUL-7741289", check_in: "2026-07-12", check_out: "2026-07-17", nights: 5 }],
      flights: [{ type: "دولي", airline: "الخطوط السعودية", flight_no: "SV 822", pnr: "QR7K2M", dep_airport: "جدة (JED)", arr_airport: "دنباسار (DPS)", dep_time: "2026-07-11 23:55", arr_time: "2026-07-12 16:20" }],
      transfers: [{ type: "استقبال المطار", pickup_datetime: "2026-07-12 16:45", pickup_location: "مطار دنباسار (DPS) — صالة الوصول الدولية", dropoff: "ذا موليا بالي", driver_name: "ماده سوريا", driver_contact: "+62 812 3456 7890", emergency_contact: "+62 361 770 9999", vehicle: "تويوتا ألفارد خاصة" }],
      program: [
        { day: "١", title: "الوصول والاستقبال", items: [{ i: "plane", t: "وصول دنباسار ١٦:٢٠" }, { i: "car", t: "استقبال وانتقال خاص" }, { i: "bed", t: "تسجيل الدخول — ذا موليا بالي" }] },
        { day: "٢", title: "سحر أوبود", items: [{ i: "map", t: "غابة القرود ومصاطب الأرز" }, { i: "info", t: "معبد تيرتا إمبول" }, { i: "sun", t: "غداء بإطلالة على الوادي" }] },
        { day: "٣", title: "يوم استرخاء", items: [{ i: "sun", t: "يوم حر على الشاطئ الخاص" }, { i: "info", t: "جلسة سبا للزوجين" }] },
        { day: "٤", title: "جزيرة نوسا بينيدا", items: [{ i: "compass", t: "رحلة بحرية إلى الجزيرة" }, { i: "map", t: "شاطئ كيليينغكينغ" }] },
        { day: "٥", title: "المغادرة", items: [{ i: "car", t: "انتقال إلى المطار" }, { i: "plane", t: "رحلة العودة" }] }
      ]
    },
    {
      booking_id: "BK-THA-2026-031", program_brand_id: "season-thailand", destination_id: "bangkok",
      brand_profile_id: "BP-THA-v2", logo_asset_id: "LOGO-THA-v2", voucher_template_id: "VT-THA-v2",
      label: "عائلي · بانكوك وبوكيت",
      travelers: [{ name: "فهد العنزي", ticket: "217-5567812340" }, { name: "منيرة العنزي", ticket: "217-5567812341" }, { name: "سلمان العنزي", ticket: "217-5567812342" }, { name: "ريم العنزي", ticket: "217-5567812343" }],
      dates: { start: "2026-08-03", end: "2026-08-10" },
      hotels: [
        { hotel_id: "siam-bangkok", confirmation_number: "SIA-3390421", check_in: "2026-08-03", check_out: "2026-08-06", nights: 3 },
        { hotel_id: "anantara-phuket", confirmation_number: "ANP-8852170", check_in: "2026-08-06", check_out: "2026-08-10", nights: 4 }
      ],
      flights: [
        { type: "دولي", airline: "الخطوط التايلندية", flight_no: "TG 508", pnr: "TH9P4L", dep_airport: "الرياض (RUH)", arr_airport: "بانكوك (BKK)", dep_time: "2026-08-02 21:30", arr_time: "2026-08-03 10:15" },
        { type: "داخلي", airline: "بانكوك إيرويز", flight_no: "PG 271", pnr: "TH9P4L", dep_airport: "بانكوك (BKK)", arr_airport: "بوكيت (HKT)", dep_time: "2026-08-06 13:20", arr_time: "2026-08-06 14:45" }
      ],
      transfers: [{ type: "استقبال المطار", pickup_datetime: "2026-08-03 10:45", pickup_location: "مطار سوفارنابومي (BKK) — بوابة E", dropoff: "ذا سيام بانكوك", driver_name: "سومتشاي ب.", driver_contact: "+66 81 234 5678", emergency_contact: "+66 2 134 1155", vehicle: "ميني فان عائلية" }],
      program: [
        { day: "١", title: "الوصول إلى بانكوك", items: [{ i: "plane", t: "وصول سوفارنابومي ١٠:١٥" }, { i: "car", t: "استقبال عائلي خاص" }, { i: "bed", t: "تسجيل الدخول — ذا سيام" }] },
        { day: "٢", title: "المعابد الكبرى", items: [{ i: "info", t: "القصر الكبير ووات فو" }, { i: "compass", t: "جولة نهرية على تشاو فرايا" }, { i: "map", t: "معبد وات أرون" }] },
        { day: "٣", title: "الانتقال إلى بوكيت", items: [{ i: "plane", t: "رحلة داخلية إلى بوكيت ١٣:٢٠" }, { i: "bed", t: "تسجيل الدخول — أنانتارا لايان" }] },
        { day: "٤", title: "جزر فاي فاي", items: [{ i: "compass", t: "رحلة بحرية عائلية" }, { i: "sun", t: "سباحة في الخلجان" }] },
        { day: "٥", title: "المغادرة", items: [{ i: "car", t: "انتقال إلى المطار" }, { i: "plane", t: "رحلة العودة" }] }
      ]
    }
  ];

  window.VLAB_DATA = {
    meta: { product: "سيزون ترافل — مختبر تجربة المستندات", now: "2026-06-18", note: "نموذج بصري — بيانات تجريبية فقط، لا توليد فعلي ولا PDF" },
    brands: brands, destinations: destinations, hotels: hotels, bookings: bookings
  };
})();
