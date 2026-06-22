/* =====================================================================
   confirmed-booking-adapter.js  (DS6)
   The SINGLE mapping layer between a Confirmed Booking and the existing
   Travel Book. It converts a confirmed-booking record into the EXISTING
   program JSON shape (the same shape as programs/*.json) so it flows
   straight through the existing ProgramSource.buildBookData() → editor →
   renderer → PDF. No renderer, pagination, or PDF changes.

       Confirmed Booking
         → confirmedBookingToTravelBook()
           → program-shaped object
             → ProgramSource.buildBookData()  (UNCHANGED)
               → existing editor + existing PDF

   The editor never sees database/table details — only this contract.

   FUTURE (Bandar / Supabase): a real confirmed booking will carry full
   hotels / itinerary / transportation. Keep the SAME field names below and
   this adapter needs no change; map a Supabase row to the `booking` object
   shape it already expects (see fields read in mapInline / mapLinked).
   ===================================================================== */
(function () {
  "use strict";

  // destination id (as stored on a booking) → library country key
  var DEST_TO_COUNTRY = { indonesia: "Indonesia", thailand: "Thailand" };

  function countryOf(booking) {
    return booking.country ||
      DEST_TO_COUNTRY[(booking.destination || "").toLowerCase()] ||
      booking.destination || "";
  }
  function nightsBetween(a, b) {
    var d1 = Date.parse(a), d2 = Date.parse(b);
    if (isNaN(d1) || isNaN(d2)) return "";
    var n = Math.round((d2 - d1) / 86400000);
    return n > 0 ? String(n) : "";
  }

  /* Which Travel Book program (confirmed quotation) a booking links to, if any.
     A confirmed booking IS a confirmed quotation, so its program/quotation
     number is the link. */
  function programNoFor(booking) {
    return booking.program_no || booking.travel_program_no ||
      (/^(IDN|THA)-Q-/.test(booking.quotation_id || "") ? booking.quotation_id : null) || null;
  }

  /* LINKED path — start from the confirmed quotation snapshot (rich program
     loaded via the existing seam), then overlay booking-level confirmed facts
     that the booking is authoritative for (guest, dates) when present. */
  function mapLinked(booking, baseProgram) {
    var p = JSON.parse(JSON.stringify(baseProgram));
    var guest = booking.guest_name || booking.traveler_name || "";
    if (guest) { p.customer = p.customer || {}; p.customer.traveler_name = guest; }
    if (booking.check_in || booking.check_out) {
      p.dates = p.dates || {};
      if (booking.check_in) p.dates.start = p.dates.start || booking.check_in;
      if (booking.check_out) p.dates.end = p.dates.end || booking.check_out;
    }
    if (!p.country) p.country = countryOf(booking);
    return p;
  }

  /* INLINE path — no linked quotation snapshot in lab mode. Build a minimal,
     HONEST program from ONLY the booking's real summary fields. Itinerary is
     left for the user to fill (auto-pull-first, user-edits model). Cities are
     auto-detected downstream from the hotel city by buildBookData/detectCities.
     When a real booking carries full hotels/itinerary/transportation
     (Supabase), map them here 1:1 into the same arrays. */
  function mapInline(booking) {
    var country = countryOf(booking);
    var hotel = {
      guest_name: booking.guest_name || "",
      confirmation_number: "",                 // always manual
      property_name: booking.hotel_name || "",
      address: "",
      total_room: "1 Unit",
      room_type: "",
      bed_type: "",
      meal_plan: "",
      check_in: booking.check_in || "",
      check_out: booking.check_out || "",
      total_nights: nightsBetween(booking.check_in, booking.check_out)
    };
    // city hint for detection (Arabic city name resolves via CITY_ALIASES)
    var cityHint = booking.hotel_city || booking.city || "";
    return {
      schema: "travelbook.fixed.v1",
      program_no: booking.quotation_id || booking.booking_id || "",
      country: country,
      customer: { traveler_name: booking.guest_name || "", phone: "", email: "" },
      dates: { start: booking.check_in || "", end: booking.check_out || "" },
      hotels: booking.hotels && booking.hotels.length ? booking.hotels : [hotel],
      flights: booking.flights || { note: [] },
      transportation: booking.transportation || [],
      tours: booking.tours || [],
      itinerary: booking.itinerary || [],
      cities: booking.cities && booking.cities.length ? booking.cities : (cityHint ? [cityHint] : []),
      vouchers: booking.vouchers || []
    };
  }

  /* THE CONTRACT. booking (+ optional baseProgram loaded by the caller from the
     existing seam) → program-shaped object for buildBookData(). */
  function confirmedBookingToTravelBook(booking, baseProgram /*, library */) {
    if (!booking) return null;
    var p = baseProgram ? mapLinked(booking, baseProgram) : mapInline(booking);
    /* Company-profile-driven branding. The Travel Book only CONSUMES this
       object; it is snapshotted into DATA at creation (buildBookData) so old
       delivered PDFs stay stable if the company profile changes later. */
    if (window.CompanyProfileSource) {
      p.branding = window.CompanyProfileSource.getBranding({ company_id: booking.company_id, company_name: booking.company_name });
    }
    return p;
  }

  /* Compact summary for the editor's "Loaded from confirmed booking" banner.
     Prefers the values actually built into the booklet (built) when available. */
  function sourceSummary(booking, built) {
    var cities = built && built.meta && built.meta.included_cities
      ? built.meta.included_cities
      : (built && built.cities || []).map(function (c) { return c.name_en || c.key || ""; });
    return {
      booking_id: booking.booking_id || "",
      quotation_id: booking.quotation_id || booking.program_no || "",
      guest: (built && built.traveler_name) || booking.guest_name || "",
      country: (built && built.meta && built.meta.country) || countryOf(booking) || "",
      cities: cities
    };
  }

  window.ConfirmedBookingAdapter = {
    DEST_TO_COUNTRY: DEST_TO_COUNTRY,
    programNoFor: programNoFor,
    confirmedBookingToTravelBook: confirmedBookingToTravelBook,
    sourceSummary: sourceSummary
  };
})();
