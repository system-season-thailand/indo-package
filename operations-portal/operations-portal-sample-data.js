/* =====================================================================
   operations-portal-sample-data.js
   Configuration / sample data for the Season B2B Operations Portal SHELL.
   No backend. Defines roles, the navigation map, and which modules are
   live vs. placeholders. Existing modules are loaded as-is (not merged).
   Exposes a single global: window.PORTAL_DATA.
   ===================================================================== */
(function () {
  "use strict";

  window.PORTAL_DATA = {
    meta: {
      product: "بوابة عمليات سيزون B2B",
      short: "سيزون · العمليات",
      tagline: "مركز التحكّم الموحّد لعمليات B2B",
      note: "نموذج أولي (Shell) — لا يتصل بأي قاعدة بيانات ولا يعدّل الوحدات القائمة"
    },

    // Prototype identities (no authentication — role switch only)
    roles: [
      { id: "management", label: "الإدارة", desc: "وصول كامل لكل الوحدات" },
      { id: "booking", label: "فريق الحجوزات", desc: "حالات العروض والحجوزات" },
      { id: "sales", label: "فريق المبيعات", desc: "عروضي وحالات العروض (عرض فقط)" }
    ],

    /* Master navigation. Each item declares which roles may access it.
       type:"module"      → loads an existing standalone module (by url, in an iframe)
       type:"placeholder" → reserved area, not built yet
       The sidebar is generated per-role by filtering on `roles`. */
    nav: [
      { id: "dashboard", label: "لوحة الإدارة", icon: "grid", type: "module",
        url: "../management-dashboard/management-dashboard.html", roles: ["management"],
        desc: "النظرة التنفيذية والتحليلات الإدارية." },

      { id: "quotation-status", label: "حالات العروض", icon: "check", type: "module",
        url: "../quotation-status-manager/quotation-status-manager.html", roles: ["management", "booking", "sales"],
        roleNote: { sales: "عرض فقط" },
        desc: "تحويل العروض إلى حجوزات (تأكيد · مفقود · ملغى)." },

      { id: "my-quotations", label: "عروضي", icon: "file", type: "placeholder", roles: ["sales"],
        desc: "العروض التي أنشأها موظف المبيعات الحالي." },

      { id: "bookings", label: "الحجوزات المؤكّدة", icon: "calendar", type: "placeholder", roles: ["management", "booking"],
        desc: "إدارة ومتابعة الحجوزات المؤكّدة وعملياتها." },

      { id: "companies", label: "الشركات", icon: "building", type: "placeholder", roles: ["management"],
        desc: "سجلّ شركات الـB2B وملفّاتها وتعاملاتها." },

      { id: "reports", label: "التقارير", icon: "chart", type: "placeholder", roles: ["management"],
        desc: "تقارير الأداء والتحويل والإيرادات." },

      { id: "settings", label: "الإعدادات", icon: "gear", type: "placeholder", roles: ["management"],
        desc: "إعدادات المنشأة والمستخدمين والصلاحيات." }
    ],

    // Long-term home for these modules (shown on placeholder/roadmap)
    future: [
      "لوحة الإدارة", "حالات العروض", "الحجوزات المؤكّدة", "أدلة الوجهات",
      "فواتير النقل", "فواتير الشركات", "التقارير", "تحليلات الموظفين"
    ]
  };
})();
