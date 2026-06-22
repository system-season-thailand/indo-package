/* =====================================================================
   operations-portal-sample-data.js
   Configuration / sample data for the Season B2B Operations Portal SHELL.
   No backend. Defines roles, the navigation map, and which modules are
   live vs. placeholders. Existing modules are loaded as-is (not merged).
   Exposes a single global: window.PORTAL_DATA.
   ===================================================================== */

/* =====================================================================
   ▼▼▼  SAMPLE DATA SOURCE / PORTAL CONFIG  (LAB MODE)  ▼▼▼
   ---------------------------------------------------------------------
   This file is the portal's navigation + role configuration. It holds
   NO business data. FUTURE: keep this as the unified shell config; the
   `nav[].url` values can point to the same modules once they read real
   Supabase data internally. Roles/navigation structure stay unchanged.
   ===================================================================== */
(function () {
  "use strict";

  window.PORTAL_DATA = {
    meta: {
      product: "بوابة عمليات سيزون B2B",
      short: "سيزون · العمليات",
      tagline: "مركز التحكّم الموحّد لعمليات B2B",
      note: "جارٍ الاتصال بقاعدة البيانات…"
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
        url: "management-dashboard.html", roles: ["management"],
        desc: "النظرة التنفيذية والتحليلات الإدارية." },

      { id: "quotation-status", label: "حالات العروض", icon: "check", type: "module",
        url: "quotation-status-manager.html", roles: ["management", "booking", "sales"],
        roleNote: { sales: "عرض فقط" },
        desc: "تحويل العروض إلى حجوزات (تأكيد · مفقود · ملغى)." },

      { id: "operations-workspace", label: "مساحة العمليات", icon: "flow", type: "module",
        url: "operations-workspace.html", roles: ["management", "booking", "sales"], passRole: true,
        roleNote: { management: "عرض فقط", sales: "سجلاتك فقط" },
        desc: "الكوكبيت التشغيلي الموحّد — البيت المستقبلي للعمليات." },

      { id: "my-quotations", label: "عروضي", icon: "file", type: "placeholder", roles: ["sales"],
        desc: "العروض التي أنشأها موظف المبيعات الحالي." },

      { id: "bookings", label: "الحجوزات المؤكّدة", icon: "calendar", type: "module",
        url: "confirmed-bookings-manager.html", roles: ["management", "booking"],
        desc: "إدارة ومتابعة الحجوزات المؤكّدة وعملياتها." },

      { id: "booking-pipeline", label: "مسار الحجوزات", icon: "flow", type: "module",
        url: "booking-pipeline.html", roles: ["management", "booking"],
        desc: "دورة حياة الحجز التشغيلية من العرض إلى الإغلاق." },

      { id: "companies", label: "الشركات", icon: "building", type: "module",
        url: "companies-management.html", roles: ["management", "sales"], passRole: true,
        roleNote: { sales: "عرض فقط" },
        desc: "مركز إدارة علاقات شركات الـB2B (CRM)." },

      { id: "voucher-lab", label: "مختبر المستندات", icon: "file", type: "module",
        url: "voucher-experience-lab.html", roles: ["management", "booking"],
        desc: "معاينة بصرية لتجربة المستندات الخمسة (نموذج)." },

      /* DEACTIVATED 2026-06 — Content Studio hidden from the menu. Travel Book
         replaced its operational need; keeping both confused users. The module
         code (content-studio-lab.html/.js/.css/-sample-data.js) and its data/
         assets remain in the repo, untouched, for future use. To re-enable,
         uncomment this entry:
      { id: "content-studio", label: "استوديو المحتوى", icon: "file", type: "module",
        url: "content-studio-lab.html", roles: ["management"],
        desc: "مصدر الحقيقة للمحتوى — وجهات وفنادق وعلامات ومكتبة وسائط (نموذج)." },
      */

      { id: "travel-book", label: "دليل الرحلة", icon: "file", type: "module",
        url: "travel-book/editor.html", roles: ["management"],
        desc: "محرّك دليل الرحلة (Travel Book) — حمّل برنامجاً، تعبئة تلقائية، تحرير، وتصدير PDF (نموذج)." },

      /* Sidebar opens a worklist; the Confirmed-Bookings button deep-links a specific file. */
      { id: "transport-file", label: "ملف المواصلات", icon: "flow", type: "module",
        url: "transportation-file.html", roles: ["management", "booking"],
        desc: "ملف المواصلات التلقائي من حركات البرنامج المؤكّد." },

      { id: "transport-ops", label: "عمليات المواصلات", icon: "chart", type: "module",
        url: "transportation-dashboard.html", roles: ["management", "booking"],
        desc: "لوحة عمليات المواصلات — الوصول والمغادرة وحالة الملفات (KPI)." },

      { id: "transport-boards", label: "اللوحات اليومية", icon: "calendar", type: "module",
        url: "transportation-boards.html", roles: ["management", "booking"],
        desc: "اللوحات اليومية — الوصولات والمغادرات والنواقص التشغيلية في شاشة واحدة." },

      /* Opened from the Transportation File via «توليد فاتورة المواصلات»; not a sidebar entry. */
      { id: "transport-invoice", label: "فاتورة المواصلات", icon: "file", type: "module",
        url: "transportation-invoice.html", roles: ["management", "booking"], hidden: true,
        desc: "فاتورة المواصلات التشغيلية — تُولّد من ملف المواصلات." },

      { id: "invoice-center", label: "مركز الفواتير", icon: "file", type: "module",
        url: "invoice-center.html", roles: ["management", "booking"],
        desc: "مركز الفواتير — فاتورة المبيعات والعمليات والمواصلات، تُولّد تلقائياً من الحجز." },

      { id: "ops-command", label: "مركز العمليات التنفيذي", icon: "command", type: "module",
        url: "operations-command.html", roles: ["management"],
        desc: "مركز العمليات التنفيذي — شاشة إدارية واحدة: الوصول والمغادرة والمخاطر والمتابعات. قراءة فقط." },

      { id: "reports", label: "التقارير", icon: "chart", type: "module",
        url: "reports-center.html", roles: ["management"],
        desc: "مركز التقارير — الشركات والموظفون والوجهات والفنادق والفواتير ولوحة تنفيذية. قراءة فقط." },

      { id: "finance", label: "المالية", icon: "wallet", type: "module",
        url: "finance-center.html", roles: ["management"],
        desc: "مركز المالية — دفتر الشركات، الفواتير المفتوحة، المدفوعات، أعمار الديون، البنوك. يقرأ فواتير المبيعات." },

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
