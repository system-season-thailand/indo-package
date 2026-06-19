/* =====================================================================
   management-dashboard-sample-data.js
   ---------------------------------------------------------------------
   PROTOTYPE SAMPLE DATA ONLY — NOT REAL DATA, NOT CONNECTED TO SUPABASE.
   Exposes a single global: window.MGMT_DATA

   Multi-destination dataset for a B2B travel quotation system.
   Destinations included: Indonesia + Thailand.
   Architecture is destination-driven: add a future destination
   (Maldives, Malaysia, UAE, Turkey ...) by adding it to DESTINATIONS,
   adding its hotels (with `country`), flagging the companies active in
   it, and calling generateQuotes() for it — nothing else changes.
   A seeded generator keeps numbers stable across loads.
   ===================================================================== */
(function () {
  "use strict";

  // --- Reference "today" for the prototype -----------------------------
  const AS_OF = new Date("2026-06-18T00:00:00");
  const START = new Date("2025-12-15T00:00:00");
  const THAI_START = new Date("2026-02-01T00:00:00"); // Thailand is a newer destination

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
  const pick = (arr) => arr[Math.floor(rand() * arr.length)];
  const dayKey = (d) => d.toISOString().slice(0, 10);
  const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
  const daysBetween = (a, b) => Math.round((b - a) / 86400000);
  const D = (s) => new Date(s + "T00:00:00");

  // --- Destination registry (add future destinations here) -------------
  const DESTINATIONS = [
    { id: "indonesia", name: "إندونيسيا" },
    { id: "thailand",  name: "تايلاند" }
    // Future: { id: "maldives", name: "المالديف" }, { id: "malaysia", name: "ماليزيا" },
    //         { id: "uae", name: "الإمارات" }, { id: "turkey", name: "تركيا" }
  ];

  // --- Staff (shared across destinations) ------------------------------
  // role: future RBAC field only (admin | manager | sales).
  const staff = [
    { id: "S1", name: "أحمد العتيبي",  skill: 1.15, approve: 0.66, role: "sales" },
    { id: "S2", name: "سارة المنصور",  skill: 1.30, approve: 0.71, role: "manager" },
    { id: "S3", name: "خالد الدوسري",  skill: 0.95, approve: 0.58, role: "sales" },
    { id: "S4", name: "نورة القحطاني", skill: 1.05, approve: 0.63, role: "sales" },
    { id: "S5", name: "فهد الشمري",    skill: 0.80, approve: 0.55, role: "sales" },
    { id: "S6", name: "ريم العنزي",    skill: 0.90, approve: 0.69, role: "sales" }
  ];

  // --- Hotels: Indonesia -----------------------------------------------
  const hotelsIndo = [
    { id: "H01", name: "ذا موليا",            city: "بالي",       area: "نوسا دوا",  grade: 1.35, country: "indonesia" },
    { id: "H02", name: "آيانا ريزورت",        city: "بالي",       area: "جيمباران",  grade: 1.25, country: "indonesia" },
    { id: "H03", name: "فور سيزونز سايان",    city: "بالي",       area: "أوبود",     grade: 1.45, country: "indonesia" },
    { id: "H04", name: "ذا كايون جنغل",       city: "بالي",       area: "أوبود",     grade: 1.10, country: "indonesia" },
    { id: "H05", name: "دبليو بالي",          city: "بالي",       area: "سيمينياك",  grade: 1.20, country: "indonesia" },
    { id: "H06", name: "بادما ريزورت ليجيان", city: "بالي",       area: "ليجيان",    grade: 1.00, country: "indonesia" },
    { id: "H07", name: "ذا ريتز كارلتون",     city: "بالي",       area: "نوسا دوا",  grade: 1.40, country: "indonesia" },
    { id: "H08", name: "جراند حياة",          city: "جاكرتا",     area: "وسط المدينة", grade: 1.05, country: "indonesia" },
    { id: "H09", name: "كمبينسكي",            city: "جاكرتا",     area: "ثامرين",    grade: 1.15, country: "indonesia" },
    { id: "H10", name: "حياة ريجنسي",         city: "يوجياكارتا", area: "وسط المدينة", grade: 0.90, country: "indonesia" },
    { id: "H11", name: "بلاتاران بوروبودور",  city: "يوجياكارتا", area: "بوروبودور", grade: 1.10, country: "indonesia" },
    { id: "H12", name: "ذا أوبروي",           city: "لومبوك",     area: "مدارا",     grade: 1.20, country: "indonesia" },
    { id: "H13", name: "بادما باندونغ",       city: "باندونغ",    area: "وسط المدينة", grade: 0.85, country: "indonesia" },
    { id: "H14", name: "بانيان تري",          city: "بينتان",     area: "لاغوي",     grade: 1.30, country: "indonesia" }
  ];
  const hotelWeightsIndo = {
    H01: 16, H02: 11, H03: 9, H04: 7, H05: 14, H06: 8, H07: 13,
    H08: 6, H09: 5, H10: 4, H11: 5, H12: 6, H13: 3, H14: 7
  };

  // --- Hotels: Thailand ------------------------------------------------
  const hotelsThai = [
    { id: "T01", name: "ماندارين أورينتال",     city: "بانكوك",   area: "ضفة النهر",  grade: 1.40, country: "thailand" },
    { id: "T02", name: "فور سيزونز بانكوك",     city: "بانكوك",   area: "تشاو فرايا", grade: 1.35, country: "thailand" },
    { id: "T03", name: "ذا سيام",               city: "بانكوك",   area: "دوسيت",      grade: 1.30, country: "thailand" },
    { id: "T04", name: "أمانبوري",              city: "بوكيت",    area: "سورين",      grade: 1.45, country: "thailand" },
    { id: "T05", name: "ذا سورين",              city: "بوكيت",    area: "سورين",      grade: 1.15, country: "thailand" },
    { id: "T06", name: "رايافادي",              city: "كرابي",    area: "رايلاي",     grade: 1.25, country: "thailand" },
    { id: "T07", name: "فور سيزونز كوه ساموي",  city: "كوه ساموي", area: "تالينج نام", grade: 1.30, country: "thailand" },
    { id: "T08", name: "فور سيزونز شيانغ ماي",  city: "شيانغ ماي", area: "ماي ريم",    grade: 1.10, country: "thailand" }
  ];
  const hotelWeightsThai = {
    T01: 14, T02: 12, T03: 8, T04: 9, T05: 7, T06: 6, T07: 6, T08: 4
  };

  function buildPool(weights) {
    const pool = [];
    Object.keys(weights).forEach((id) => { for (let i = 0; i < weights[id]; i++) pool.push(id); });
    return pool;
  }
  const hotelPoolIndo = buildPool(hotelWeightsIndo);
  const hotelPoolThai = buildPool(hotelWeightsThai);
  const allHotels = hotelsIndo.concat(hotelsThai);

  // --- Time-of-day distribution (powers "requests by hour") ------------
  // Separate PRNG so adding this does NOT shift the existing seeded counts.
  const HOUR_WEIGHTS = { 7: 1, 8: 3, 9: 6, 10: 9, 11: 10, 12: 7, 13: 5, 14: 8, 15: 9, 16: 7, 17: 5, 18: 3, 19: 2, 20: 2, 21: 1, 22: 1 };
  const hourPool = [];
  Object.keys(HOUR_WEIGHTS).forEach((h) => { for (let i = 0; i < HOUR_WEIGHTS[h]; i++) hourPool.push(+h); });
  const rngHour = mulberry32(99100);
  const pickHour = () => hourPool[Math.floor(rngHour() * hourPool.length)];

  // --- Companies (B2B clients) -----------------------------------------
  // `windows`  → Indonesia activity windows (existing behaviour, unchanged).
  // `thai`     → Thailand participation { rate } (active THAI_START → AS_OF).
  // `thaiOnly` → company exists only in Thailand (skipped by Indonesia gen).
  const companies = [
    // Champions — strong, consistent (most also sell Thailand)
    { id: "C01", name: "شركة الأفق للسياحة",     created: D("2023-04-02"), tier: 1.25, type: "champion",
      windows: [{ from: START, to: AS_OF, rate: 1.20 }], thai: { rate: 1.10 } },
    { id: "C02", name: "مسارات الخليج للسفر",    created: D("2022-11-19"), tier: 1.30, type: "champion",
      owner: "S5", ownerBias: 0.80,
      windows: [{ from: START, to: AS_OF, rate: 1.05 }], thai: { rate: 0.85 } },
    { id: "C03", name: "رحلات النخبة",           created: D("2023-08-26"), tier: 1.40, type: "champion",
      windows: [{ from: START, to: AS_OF, rate: 0.95 }], thai: { rate: 0.80 } },
    { id: "C04", name: "بوابة آسيا للسفر",       created: D("2024-01-14"), tier: 1.15, type: "champion",
      windows: [{ from: START, to: AS_OF, rate: 0.90 }], thai: { rate: 0.65 } },
    // Steady — moderate
    { id: "C05", name: "ديار السفر",             created: D("2023-02-08"), tier: 1.00, type: "steady",
      windows: [{ from: START, to: AS_OF, rate: 0.50 }] },
    { id: "C06", name: "واحة الرحلات",           created: D("2024-05-30"), tier: 0.95, type: "steady",
      windows: [{ from: START, to: AS_OF, rate: 0.45 }], thai: { rate: 0.35 } },
    { id: "C07", name: "نجمة الشرق للسياحة",     created: D("2022-07-21"), tier: 1.10, type: "steady",
      windows: [{ from: START, to: AS_OF, rate: 0.55 }], thai: { rate: 0.45 } },
    { id: "C08", name: "ركن المسافر",            created: D("2023-10-03"), tier: 0.90, type: "steady",
      windows: [{ from: START, to: AS_OF, rate: 0.40 }] },
    { id: "C09", name: "درب الرحالة",            created: D("2024-03-17"), tier: 1.05, type: "steady",
      shopper: true,
      windows: [{ from: START, to: AS_OF, rate: 0.42 }] },
    // Declining — strong early, faded recently
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
      windows: [{ from: D("2026-05-23"), to: AS_OF, rate: 0.95 }], thai: { rate: 0.75 } },
    { id: "C17", name: "وجهات راقية للسفر",      created: D("2026-06-01"), tier: 1.30, type: "new",
      windows: [{ from: D("2026-06-02"), to: AS_OF, rate: 1.00 }] },
    // Occasional — sporadic, low value
    { id: "C18", name: "ليالي السفر",            created: D("2024-08-11"), tier: 0.85, type: "occasional",
      windows: [{ from: START, to: AS_OF, rate: 0.18 }] },
    // Thailand-only clients
    { id: "C19", name: "أجنحة بانكوك للسياحة",   created: D("2026-01-20"), tier: 1.15, type: "champion",
      thaiOnly: true, thai: { rate: 0.80 } },
    { id: "C20", name: "رحلات الفيل الذهبي",     created: D("2026-02-10"), tier: 1.05, type: "steady",
      thaiOnly: true, thai: { rate: 0.55 } },
    { id: "C21", name: "شواطئ بوكيت للسفر",      created: D("2026-02-25"), tier: 1.25, type: "champion",
      thaiOnly: true, thai: { rate: 0.60 } },
    { id: "C22", name: "بوابة سيام",             created: D("2026-03-15"), tier: 0.95, type: "occasional",
      thaiOnly: true, thai: { rate: 0.32 } }
  ];

  // --- Quotation generation --------------------------------------------
  const STATUSES = [
    { key: "approved", label: "مقبول",   w: 56 },
    { key: "sent",     label: "مُرسل",    w: 24 },
    { key: "draft",    label: "مسودة",   w: 12 },
    { key: "rejected", label: "مرفوض",   w: 8 }
  ];
  function rollStatus(staffApprove, shopper) {
    if (shopper) {
      const w = [["approved", 16], ["sent", 52], ["draft", 14], ["rejected", 18]];
      let r = rand() * 100;
      for (const [k, wt] of w) { if ((r -= wt) <= 0) return k; }
      return "sent";
    }
    if (rand() < staffApprove * 0.62) return "approved";
    const total = STATUSES.reduce((s, x) => s + x.w, 0);
    let r = rand() * total;
    for (const s of STATUSES) { if ((r -= s.w) <= 0) return s.key; }
    return "sent";
  }

  const staffPool = [];
  const POOL_WEIGHT = { S5: 2 }; // S5 mostly carries one big account (a risk the dashboard surfaces)
  staff.forEach((s) => {
    const n = POOL_WEIGHT[s.id] != null ? POOL_WEIGHT[s.id] : Math.round(s.skill * 10);
    for (let i = 0; i < n; i++) staffPool.push(s.id);
  });

  const quotations = [];
  let seq = 1000;
  const totalDays = daysBetween(START, AS_OF);

  // Generic, destination-driven generator (reused for every destination).
  function generateQuotes(destId, companyList, windowsFn, hotelPoolArr, hotelArr) {
    companyList.forEach((co) => {
      const windows = windowsFn(co);
      if (!windows) return;
      for (let i = 0; i <= totalDays; i++) {
        const day = addDays(START, i);
        const dow = day.getDay(); // 5 = Fri, 6 = Sat (Gulf weekend → quieter)
        let rate = 0;
        for (const w of windows) { if (day >= w.from && day <= w.to) { rate = w.rate; break; } }
        if (rate <= 0) continue;
        if (dow === 5) rate *= 0.25;
        if (dow === 6) rate *= 0.55;

        let count = Math.floor(rate);
        if (rand() < rate - count) count += 1;

        for (let q = 0; q < count; q++) {
          const staffId = (co.owner && rand() < (co.ownerBias || 0)) ? co.owner : pick(staffPool);
          const st = staff.find((s) => s.id === staffId);
          const hotelId = pick(hotelPoolArr);
          const hotel = hotelArr.find((h) => h.id === hotelId);
          const pax = pick([2, 2, 4, 4, 6, 8, 10, 12, 15, 20]);
          const nights = pick([4, 5, 6, 7, 7, 8, 10]);
          const perPaxNight = 950 + rand() * 1400;
          const base = perPaxNight * pax * nights * hotel.grade * co.tier;
          const value = Math.round((base * (0.9 + rand() * 0.2)) / 50) * 50;
          const status = rollStatus(st.approve, co.shopper);
          seq += 1;
          quotations.push({
            id: "Q-" + seq,
            date: dayKey(day),
            hour: pickHour(),
            destination: destId,
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
  }

  // Indonesia FIRST (keeps the original dataset identical), then Thailand.
  generateQuotes("indonesia",
    companies.filter((c) => !c.thaiOnly),
    (co) => co.windows,
    hotelPoolIndo, hotelsIndo);

  generateQuotes("thailand",
    companies.filter((c) => c.thai),
    (co) => co.thai ? [{ from: THAI_START, to: AS_OF, rate: co.thai.rate }] : null,
    hotelPoolThai, hotelsThai);

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
      access: { roles: ["admin", "manager", "sales"], dashboardRoles: ["admin", "manager"] }
    },
    destinations: DESTINATIONS,
    companies: companies.map((c) => ({
      id: c.id, name: c.name, created: dayKey(c.created), tier: c.tier
    })),
    staff: staff.map((s) => ({ id: s.id, name: s.name, role: s.role })),
    hotels: allHotels.map((h) => ({ id: h.id, name: h.name, city: h.city, area: h.area, country: h.country })),
    quotations: quotations
  };
})();
