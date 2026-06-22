/* =====================================================================
   company-profile-source.js   (Travel Book — Company Branding)
   The SINGLE seam that exposes the EXISTING company profile to the Travel
   Book as a branding object. The Travel Book only CONSUMES this object — it
   does not store company records, and there is no identity manager here.

       Confirmed Booking (company_id / company_name)
         → CompanyProfileSource.getBranding()
           → branding object
             → adapter → buildBookData() → Travel Book DATA (snapshot)

   Branding object shape (the only contract the Travel Book consumes):
     { company_id, agency_en, agency_ar, logo_url, logo_alt,
       primary_color, secondary_color, phone, email, website }

   ▼ LAB: `_profiles` below is SAMPLE data that simulates Bandar's source so
     the flow is demonstrable offline. Keyed by company_name (bookings carry
     company_name today) and/or company_id when present.

   ▼ PRODUCTION (Bandar): replace ONLY `lookup()` so it reads the real company
     table/profile (by company_id, falling back to company_name) and maps the
     existing columns onto the branding object above. Callers use getBranding()
     only — no table details leak out of this file. Do NOT duplicate company
     records inside the Travel Book.
   ===================================================================== */
(function () {
  "use strict";

  // small inline-SVG marks so the lab shows a real, distinct per-company logo
  // (white/secondary marks on the company's primary-coloured circle). No network.
  function svgUrl(svg) { return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg); }
  var MARK = {
    horizon: "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><circle cx='50' cy='40' r='15' fill='#f1c75e'/><path d='M16 64h68M24 74h52' stroke='#fff' stroke-width='5' stroke-linecap='round'/></svg>",
    spire: "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><path d='M50 16l9 16H41zM34 36h32l6 40H28z' fill='#fff'/><path d='M50 26v54' stroke='#f4a259' stroke-width='4'/></svg>",
    compass: "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><circle cx='50' cy='50' r='30' fill='none' stroke='#fff' stroke-width='4'/><path d='M50 24l8 26-8 8-8-8z' fill='#f1c75e'/><path d='M50 76l-8-26 8-8 8 8z' fill='#fff'/></svg>",
    palm: "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><path d='M50 80V44' stroke='#fff' stroke-width='5'/><path d='M50 44c-12-10-26-8-30 0 10-2 18 2 30 6 12-4 20-8 30-6-4-8-18-10-30 0z' fill='#7fd1b0'/></svg>"
  };

  // SAMPLE profiles — keyed by company_name (and id where known). Bandar swaps.
  var _profiles = {
    "شركة الأفق للسياحة": {
      company_id: "C-IDN-ALUFUQ", agency_en: "AL UFUQ TRAVEL", agency_ar: "الأفق للسياحة",
      logo_svg: MARK.horizon, primary_color: "#0f6e63", secondary_color: "#f1c75e",
      phone: "+966 11 482 7700", email: "ops@alufuq.example", website: "www.alufuq.example"
    },
    "أجنحة بانكوك للسياحة": {
      company_id: "C-THA-BKKSUITES", agency_en: "BANGKOK SUITES", agency_ar: "أجنحة بانكوك",
      logo_svg: MARK.spire, primary_color: "#3b3b8f", secondary_color: "#f4a259",
      phone: "+966 11 233 4455", email: "care@bkksuites.example", website: "www.bkksuites.example"
    },
    "رحلات النخبة": {
      company_id: "C-ELITE", agency_en: "ELITE JOURNEYS", agency_ar: "رحلات النخبة",
      logo_svg: MARK.palm, primary_color: "#1d6f5c", secondary_color: "#d8a64a",
      phone: "+966 11 900 1212", email: "hello@elite.example", website: "www.elite.example"
    }
  };

  // DEFAULT branding for any company without a profile yet (never Travel Stars).
  var _default = {
    company_id: "", agency_en: "SEASON TRAVEL", agency_ar: "سيزون ترافل",
    logo_svg: MARK.compass, primary_color: "#163a5d", secondary_color: "#c8a85a",
    phone: "", email: "", website: "season.example"
  };

  function toBranding(p) {
    return {
      company_id: p.company_id || "",
      agency_en: p.agency_en || "", agency_ar: p.agency_ar || "",
      logo_url: p.logo_url || (p.logo_svg ? svgUrl(p.logo_svg) : ""),
      logo_alt: p.logo_alt || p.agency_en || p.agency_ar || "",
      primary_color: p.primary_color || "", secondary_color: p.secondary_color || "",
      phone: p.phone || "", email: p.email || "", website: p.website || ""
    };
  }

  // PRODUCTION SWAP POINT — replace body to read the real company table/profile.
  function lookup(company_id, company_name) {
    if (company_id) {
      for (var k in _profiles) { if (_profiles.hasOwnProperty(k) && _profiles[k].company_id === company_id) return _profiles[k]; }
    }
    if (company_name && _profiles.hasOwnProperty(company_name)) return _profiles[company_name];
    return null;
  }

  /* getBranding(opts) — opts may be { company_id, company_name } or a booking
     object carrying those fields. Always returns a full branding object
     (DEFAULT when no profile exists), so a Travel Book never falls back to a
     hardcoded brand. */
  function getBranding(opts) {
    opts = opts || {};
    var id = opts.company_id || "", name = opts.company_name || "";
    return toBranding(lookup(id, name) || _default);
  }

  window.CompanyProfileSource = { getBranding: getBranding, _default: function () { return toBranding(_default); } };
})();
