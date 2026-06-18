/* =====================================================================
   management-dashboard-sample-data.js
   ---------------------------------------------------------------------
   PROTOTYPE SAMPLE DATA ONLY — NOT REAL DATA, NOT CONNECTED TO SUPABASE.
   Exposes a single global: window.MGMT_DATA

   This file fabricates a realistic-looking dataset for a B2B travel
   quotation system selling Indonesia packages. All names, values and
   quotations are invented. A seeded generator keeps the numbers stable
   so the dashboard renders identically on every load.
   ===================================================================== */
(function () {
  "use strict";

  // --- Reference "today" for the prototype -----------------------------
  const AS_OF = new Date("2026-06-18T00:00:00");
  const START = new Date("2025-12-15T00:00:00");

  // --- Tiny seeded PRNG (mulberry32) -----------------------------------
  function mulberry32(seed) {
    let a = seed >>> 0;
    return function () {
      a |= 0; a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  const rng = mulberry32(20260618);
  const rand = () => rng();
  const randInt = (min, max) => Math.floor(rand() * (max - min + 1)) + min;
  const pick = (arr) => arr[Math.floor(rand() * arr.length)];
  const dayKey = (d) => d.toISOString().slice(0, 10);
  const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
  const daysBetween = (a, b) => Math.round((b - a) / 86400000);

  // --- Staff (the people creating quotations) --------------------------
  // role: future RBAC field only (admin | manager | sales). Not used by the
  // current prototype — included so the data shape is ready for integration.
  const staff = [
    { id: "S1", name: "أحمد العتيبي",  skill: 1.15, approve: 0.66, role: "sales" },
    { id: "S2", name: "سارة المنصور",  skill: 1.30, approve: 0.71, role: "manager" },
    { id: "S3", name: "خالد الدوسري",  skill: 0.95, approve: 0.58, role: "sales" },
    { id: "S4", name: "نورة القحطاني", skill: 1.05, approve: 0.63, role: "sales" },
    { id: "S5", name: "فهد الشمري",    skill: 0.80, approve: 0.55, role: "sales" },
    { id: "S6", name: "ريم العنزي",    skill: 0.90, approve: 0.69, role: "sales" }
  ];

  // --- Hotels (Indonesia) with region (city) + area --------------------
  const hotels = [
    { id: "H01", name: "ذا موليا",            city: "بالي",       area: "نوسا دوا",  grade: 1.35 },
    { id: "H02", name: "آيانا ريزورت",        city: "بالي",       area: "جيمباران",  grade: 1.25 },
    { id: "H03", name: "فور سيزونز سايان",    city: "بالي",       area: "أوبود",     grade: 1.45 },
    { id: "H04", name: "ذا كايون جنغل",       city: "بالي",       area: "أوبود",     grade: 1.10 },
    { id: "H05", name: "دبليو بالي",          city: "بالي",       area: "سيمينياك",  grade: 1.20 },
    { id: "H06", name: "بادما ريزورت ليجيان", city: "بالي",       area: "ليجيان",    grade: 1.00 },
    { id: "H07", name: "ذا ريتز كارلتون",     city: "بالي",       area: "نوسا دوا",  grade: 1.40 },
    { id: "H08", name: "جراند حياة",          city: "جاكرتا",     area: "وسط المدينة", grade: 1.05 },
    { id: "H09", name: "كمبينسكي",            city: "جاكرتا",     area: "ثامرين",    grade: 1.15 },
    { id: "H10", name: "حياة ريجنسي",         city: "يوجياكارتا", area: "وسط المدينة", grade: 0.90 },
    { id: "H11", name: "بلاتاران بوروبودور",  city: "يوجياكارتا", area: "بوروبودور", grade: 1.10 },
    { id: "H12", name: "ذا أوبروي",           city: "لومبوك",     area: "مدارا",     grade: 1.20 },
    { id: "H13", name: "بادما باندونغ",       city: "باندونغ",    area: "وسط المدينة", grade: 0.85 },
    { id: "H14", name: "بانيان تري",          city: "بينتان",     area: "لاغوي",     grade: 1.30 }
  ];

  // Weighted hotel popularity (some hotels are requested far more)
  const hotelWeights = {
    H01: 16, H02: 11, H03: 9, H04: 7, H05: 14, H06: 8, H07: 13,
    H08: 6, H09: 5, H10: 4, H11: 5, H12: 6, H13: 3, H14: 7
  };
  const hotelPool = [];
  Object.keys(hotelWeights).forEach((id) => {
    for (let i = 0; i < hotelWeights[id]; i++) hotelPool.push(id);
  });

  // --- Companies (B2B clients) with activity windows -------------------
  // tier influences package value; windows describe activity over time.
  // type is used only to shape the sample; the dashboard derives status.
  const D = (s) => new Date(s + "T00:00:00");
  const companies = [
    // Champions — strong, consistent
    { id: "C01", name: "شركة الأفق للسياحة",     created: D("2023-04-02"), tier: 1.25, type: "champion",
      windows: [{ from: START, to: AS_OF, rate: 1.20 }] },
    { id: "C02", name: "مسارات الخليج للسفر",    created: D("2022-11-19"), tier: 1.30, type: "champion",
      owner: "S5", ownerBias: 0.80,
      windows: [{ from: START, to: AS_OF, rate: 1.05 }] },
    { id: "C03", name: "رحلات النخبة",           created: D("2023-08-26"), tier: 1.40, type: "champion",
      windows: [{ from: START, to: AS_OF, rate: 0.95 }] },
    { id: "C04", name: "بوابة آسيا للسفر",       created: D("2024-01-14"), tier: 1.15, type: "champion",
      windows: [{ from: START, to: AS_OF, rate: 0.90 }] },
    // Steady — moderate
    { id: "C05", name: "ديار السفر",             created: D("2023-02-08"), tier: 1.00, type: "steady",
      windows: [{ from: START, to: AS_OF, rate: 0.50 }] },
    { id: "C06", name: "واحة الرحلات",           created: D("2024-05-30"), tier: 0.95, type: "steady",
      windows: [{ from: START, to: AS_OF, rate: 0.45 }] },
    { id: "C07", name: "نجمة الشرق للسياحة",     created: D("2022-07-21"), tier: 1.10, type: "steady",
      windows: [{ from: START, to: AS_OF, rate: 0.55 }] },
    { id: "C08", name: "ركن المسافر",            created: D("2023-10-03"), tier: 0.90, type: "steady",
      windows: [{ from: START, to: AS_OF, rate: 0.40 }] },
    { id: "C09", name: "درب الرحالة",            created: D("2024-03-17"), tier: 1.05, type: "steady",
      shopper: true,
      windows: [{ from: START, to: AS_OF, rate: 0.42 }] },
    // Declining — strong early, faded recently (follow-up alerts)
    { id: "C10", name: "سحاب للسياحة والسفر",    created: D("2022-09-12"), tier: 1.20, type: "declining",
      windows: [{ from: START, to: D("2026-03-31"), rate: 1.05 },
                { from: D("2026-04-01"), to: AS_OF, rate: 0.12 }] },
    { id: "C11", name: "أصداء الرحلات",          created: D("2023-06-05"), tier: 1.00, type: "declining",
      windows: [{ from: START, to: D("2026-03-20"), rate: 0.80 },
                { from: D("2026-03-21"), to: AS_OF, rate: 0.10 }] },
    // Disappeared — active early, then silent (>60 days dormant)
    { id: "C12", name: "آفاق الجزيرة للسفر",     created: D("2023-12-01"), tier: 1.10, type: "disappeared",
      windows: [{ from: START, to: D("2026-04-05"), rate: 0.75 }] },
    { id: "C13", name: "ميقات السفر",            created: D("2024-02-20"), tier: 0.95, type: "disappeared",
      windows: [{ from: START, to: D("2026-03-28"), rate: 0.60 }] },
    { id: "C14", name: "بحر النجوم للسياحة",     created: D("2023-05-15"), tier: 1.05, type: "disappeared",
      windows: [{ from: START, to: D("2026-04-12"), rate: 0.70 }] },
    // New — created recently, active only lately
    { id: "C15", name: "منارة الأسفار",          created: D("2026-05-08"), tier: 1.10, type: "new",
      windows: [{ from: D("2026-05-09"), to: AS_OF, rate: 0.85 }] },
    { id: "C16", name: "رحال الخليج",            created: D("2026-05-22"), tier: 1.20, type: "new",
      windows: [{ from: D("2026-05-23"), to: AS_OF, rate: 0.95 }] },
    { id: "C17", name: "وجهات راقية للسفر",      created: D("2026-06-01"), tier: 1.30, type: "new",
      windows: [{ from: D("2026-06-02"), to: AS_OF, rate: 1.00 }] },
    // Occasional — sporadic, low value
    { id: "C18", name: "ليالي السفر",            created: D("2024-08-11"), tier: 0.85, type: "occasional",
      windows: [{ from: START, to: AS_OF, rate: 0.18 }] }
  ];

  // --- Quotation generation --------------------------------------------
  const STATUSES = [
    { key: "approved", label: "مقبول",   w: 56 },
    { key: "sent",     label: "مُرسل",    w: 24 },
    { key: "draft",    label: "مسودة",   w: 12 },
    { key: "rejected", label: "مرفوض",   w: 8 }
  ];
  function rollStatus(staffApprove, shopper) {
    // A "shopper" client requests many quotes but rarely confirms.
    if (shopper) {
      const w = [["approved", 16], ["sent", 52], ["draft", 14], ["rejected", 18]];
      let r = rand() * 100;
      for (const [k, wt] of w) { if ((r -= wt) <= 0) return k; }
      return "sent";
    }
    // Bias approvals by the staff member's strength, then fall back to weights.
    if (rand() < staffApprove * 0.62) return "approved";
    const total = STATUSES.reduce((s, x) => s + x.w, 0);
    let r = rand() * total;
    for (const s of STATUSES) { if ((r -= s.w) <= 0) return s.key; }
    return "sent";
  }

  const staffPool = [];
  // S5 is deliberately light in the general pool — he mainly carries one large
  // account (see ownerBias below), which the dashboard surfaces as a risk.
  const POOL_WEIGHT = { S5: 2 };
  staff.forEach((s) => {
    const n = POOL_WEIGHT[s.id] != null ? POOL_WEIGHT[s.id] : Math.round(s.skill * 10);
    for (let i = 0; i < n; i++) staffPool.push(s.id);
  });

  const quotations = [];
  let seq = 1000;
  const totalDays = daysBetween(START, AS_OF);

  companies.forEach((co) => {
    for (let i = 0; i <= totalDays; i++) {
      const day = addDays(START, i);
      const dow = day.getDay(); // 5 = Fri, 6 = Sat (Gulf weekend → quieter)
      // find active window for this day
      let rate = 0;
      for (const w of co.windows) { if (day >= w.from && day <= w.to) { rate = w.rate; break; } }
      if (rate <= 0) continue;
      if (dow === 5) rate *= 0.25;
      if (dow === 6) rate *= 0.55;

      // expected quotes today → Bernoulli for the integer part + remainder
      let count = Math.floor(rate);
      if (rand() < rate - count) count += 1;

      for (let q = 0; q < count; q++) {
        const staffId = (co.owner && rand() < (co.ownerBias || 0)) ? co.owner : pick(staffPool);
        const st = staff.find((s) => s.id === staffId);
        const hotelId = pick(hotelPool);
        const hotel = hotels.find((h) => h.id === hotelId);
        const pax = pick([2, 2, 4, 4, 6, 8, 10, 12, 15, 20]);
        const nights = pick([4, 5, 6, 7, 7, 8, 10]);
        const perPaxNight = 950 + rand() * 1400; // SAR per pax per night
        const base = perPaxNight * pax * nights * hotel.grade * co.tier;
        const value = Math.round((base * (0.9 + rand() * 0.2)) / 50) * 50;
        const status = rollStatus(st.approve, co.shopper);
        seq += 1;
        quotations.push({
          id: "Q-" + seq,
          date: dayKey(day),
          companyId: co.id,
          staffId: staffId,
          hotelId: hotelId,
          city: hotel.city,
          region: hotel.area === "وسط المدينة" ? hotel.city : hotel.city + " – " + hotel.area,
          pax: pax,
          nights: nights,
          value: value,
          status: status
        });
      }
    }
  });

  // newest first
  quotations.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));

  // --- Expose -----------------------------------------------------------
  window.MGMT_DATA = {
    meta: {
      product: "سيزون ترافل — لوحة الإدارة",
      currency: "ر.س",
      asOf: dayKey(AS_OF),
      generated: "بيانات تجريبية فقط — غير متصلة بقاعدة بيانات",
      rangeStart: dayKey(START),
      // Future RBAC reference (documentation only — enforced in dashboard.js).
      // Dashboard is Management Only: admin + manager allowed, sales denied.
      access: { roles: ["admin", "manager", "sales"], dashboardRoles: ["admin", "manager"] }
    },
    companies: companies.map((c) => ({
      id: c.id, name: c.name, created: dayKey(c.created), tier: c.tier
    })),
    staff: staff.map((s) => ({ id: s.id, name: s.name, role: s.role })),
    hotels: hotels.map((h) => ({ id: h.id, name: h.name, city: h.city, area: h.area })),
    quotations: quotations
  };
})();
