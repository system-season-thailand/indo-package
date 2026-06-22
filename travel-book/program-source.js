/* =====================================================================
   program-source.js — the ONE seam between a quotation/program and the
   fixed Travel Book. Static phase: load() fetches a local programs/<no>.json
   and the shared destination-library.json. Bandar later swaps ONLY the body
   of load()/library() for real Supabase queries — detectCities() and
   buildBookData() (the mapper) stay identical, so nothing downstream changes.

   No database, no resolver, no page builder. buildBookData is a fixed
   field-mapper from the program shape to the fixed booklet shape.
   ===================================================================== */
(function (root) {
  "use strict";

  /* canonical city keys + their AR/EN aliases (used to auto-detect which
     cities the trip includes, from the itinerary + hotel addresses). */
  var CITY_ALIASES = {
    JAKARTA: ["جاكرتا", "jakarta"],
    PUNCAK:  ["بونشاك", "puncak"],
    BALI:    ["بالي", "bali"],
    /* DS5 — Thailand destination */
    BANGKOK: ["بانكوك", "bangkok"],
    PATTAYA: ["باتايا", "pattaya"],
    PHUKET:  ["بوكيت", "phuket"],
    KRABI:   ["كرابي", "krabi"]
  };

  function hay(s) { return String(s == null ? "" : s).toLowerCase(); }

  function markPresent(text, present) {
    var h = hay(text);
    Object.keys(CITY_ALIASES).forEach(function (k) {
      CITY_ALIASES[k].forEach(function (al) {
        if (h.indexOf(al.toLowerCase()) >= 0) present[k] = true;
      });
    });
  }

  /* Detect cities included in the trip — from itinerary city tokens, hotel
     addresses, and any explicit program.cities — then return them in the
     library's canonical booklet order. Only trip cities; no manual picking. */
  function detectCities(program, library) {
    program = program || {}; library = library || {};
    var present = {};
    (program.itinerary || []).forEach(function (day) { markPresent(day.city, present); });
    (program.hotels || []).forEach(function (h) { markPresent((h.address || "") + " " + (h.property_name || ""), present); });
    (program.cities || []).forEach(function (c) {
      var u = String(c).toUpperCase();
      if (CITY_ALIASES[u]) present[u] = true; else markPresent(c, present);
    });
    var order = library.city_order || Object.keys(library.cities || {});
    return order.filter(function (k) { return present[k]; });
  }

  /* Fixed mapper: program (+ shared library) -> fixed booklet data shape that
     book.js already renders. Also carries a `meta` block with structured +
     reserved fields (transportation, tours, flight tickets, vouchers) so the
     data model exists now and is preserved on export — no redesign later. */
  /* build deep-copied city objects for the given keys (used by the mapper and by
     the editor's Included-Cities toggle to add/remove whole cities) */
  function cityObjects(keys, library) {
    library = library || {};
    return (keys || []).map(function (k) {
      var lib = (library.cities && library.cities[k]) || { name_en: k, name_ar: k, photo: "", sections: [] };
      return JSON.parse(JSON.stringify({
        key: k, name_ar: lib.name_ar, name_en: lib.name_en, photo: lib.photo, sections: lib.sections || []
      }));
    });
  }

  function buildBookData(program, library) {
    program = program || {}; library = library || {};
    var agency = library.agency || {};
    /* Company branding: consume program.branding (from the company profile via
       the adapter) when present; otherwise fall back to the library agency.
       This object is snapshotted into DATA. */
    var brand = (function () {
      var b = program.branding || null;
      return {
        company_id: (b && b.company_id) || "",
        agency_en: (b && b.agency_en) || agency.agency_en || "",
        agency_ar: (b && b.agency_ar) || agency.agency_ar || "",
        logo_url: (b && b.logo_url) || "",
        logo_alt: (b && b.logo_alt) || (b && b.agency_en) || agency.agency_en || "",
        primary_color: (b && b.primary_color) || "",
        secondary_color: (b && b.secondary_color) || "",
        phone: (b && b.phone) || "", email: (b && b.email) || "", website: (b && b.website) || ""
      };
    })();
    var country = (library.country && library.country[program.country]) || {};
    var guest = (program.customer && program.customer.traveler_name) || "";   // Feature 1: one guest name

    var fullOrder = library.city_order || Object.keys(library.cities || {});
    /* DS5 — scope the destination's city universe to the program's country.
       If the country declares a `cities` list, only those cities are eligible
       (so Indonesia and Thailand never bleed into each other). Countries with
       no list fall back to the full order = identical to pre-DS5 behaviour. */
    var countryCities = (country.cities && country.cities.length) ? country.cities : null;
    var allKeys = countryCities
      ? fullOrder.filter(function (k) { return countryCities.indexOf(k) >= 0; })
      : fullOrder;
    var detected = detectCities(program, library).filter(function (k) { return allKeys.indexOf(k) >= 0; });
    var included = (program.included_cities && program.included_cities.length)
      ? program.included_cities.filter(function (k) { return allKeys.indexOf(k) >= 0; })
      : detected;                                       // default selection = the trip's cities
    var cities = cityObjects(included, library);

    var flights = program.flights || {};
    return {
      schema: "travelbook.fixed.v1",
      agency_en: brand.agency_en, agency_ar: brand.agency_ar, branding: brand,
      country_en: country.country_en || "", country_ar: country.country_ar || "",
      traveler_name: (program.customer && program.customer.traveler_name) || "",
      hotels_note: country.hotels_note || [],
      hotels: (program.hotels || []).map(function (h) {
        var c = JSON.parse(JSON.stringify(h)); c.guest_name = guest; return c;   // F1: one name → all vouchers
      }),
      flights_note: (flights.note && flights.note.length) ? flights.note : (country.flights_note || []),
      itinerary_note: country.itinerary_note || [],
      itinerary: program.itinerary || [],
      delivery_title: country.delivery_title || "", delivery_apps: country.delivery_apps || [],
      cities: cities,
      embassy_title: country.embassy_title || "", embassy_subtitle: country.embassy_subtitle || "",
      embassy_org: country.embassy_org || "", embassy_contacts: country.embassy_contacts || [],
      embassy_website: country.embassy_website || "", embassy_handle: country.embassy_handle || "",
      thanks_message: brand.agency_en ? ("نشكركم على ثقتكم لشركة " + brand.agency_en + " ونتمنى لكم رحلة ممتعة وتجربة لا تنسى") : (country.thanks_message || ""),
      /* ---- structured + reserved (editable now; rendered/merged in later phases) ---- */
      meta: {
        program_no: program.program_no || "",
        country: program.country || "",
        dates: program.dates || { start: "", end: "" },
        customer: program.customer || { traveler_name: "", phone: "", email: "" },
        transportation: program.transportation || [],          // editable now
        tours: program.tours || [],                            // editable now
        flights: { tickets: (flights.tickets || []) },          // RESERVED: upload+merge later
        vouchers: program.vouchers || { hotel: [], service: [], flight: [] }, // RESERVED: select+merge later
        detected_cities: detected,
        included_cities: included,
        all_cities: allKeys
      }
    };
  }

  /* ---- static data source (browser). Bandar replaces these two bodies. ---- */
  function load(programNo) {
    return fetch("programs/" + programNo + ".json").then(function (r) {
      if (!r.ok) throw new Error("البرنامج غير موجود: " + programNo + " (" + r.status + ")");
      return r.json();
    });
  }
  var _lib = null;
  function library() {
    if (_lib) return Promise.resolve(_lib);
    return fetch("destination-library.json").then(function (r) {
      if (!r.ok) throw new Error("destination-library.json " + r.status);
      return r.json();
    }).then(function (j) { _lib = j; return j; });
  }
  /* load a program AND build booklet data in one call (browser convenience) */
  function loadBook(programNo) {
    return Promise.all([load(programNo), library()]).then(function (a) {
      return buildBookData(a[0], a[1]);
    });
  }

  var API = {
    CITY_ALIASES: CITY_ALIASES,
    detectCities: detectCities,
    buildBookData: buildBookData, cityObjects: cityObjects,
    load: load, library: library, loadBook: loadBook
  };
  if (typeof module !== "undefined" && module.exports) module.exports = API;  // node (tests / Bandar)
  if (typeof window !== "undefined") window.ProgramSource = API;              // browser (editor)
})(this);
