/* =====================================================================
   booking-ops-store.js   (Confirmed Bookings — Phase 0)
   Persistence seam for per-booking OPERATIONAL STATE, keyed by booking_id.

       BookingOpsStore.save(bookingId, ops)   -> { booking_id, updated_at, ops }
       BookingOpsStore.load(bookingId)        -> ops | null
       BookingOpsStore.exists(bookingId)      -> boolean
       BookingOpsStore.updatedAt(bookingId)   -> ISO timestamp | null
       BookingOpsStore.remove(bookingId)      -> void
       BookingOpsStore.defaults(booking)      -> fresh ops skeleton (pure, no storage)

   This is operational state ONLY (hotel confirmations, ticket/voucher
   tracking, ownership, readiness). It is stored SEPARATELY from the
   read-only synced booking record and from `booking_status` — this seam
   NEVER writes into the booking record and NEVER changes booking_status.

   LAB MODE: backed by localStorage (same origin as the dashboard shell, so
   the record survives reloads). A no-storage fallback keeps an in-memory
   copy for the session.

   ▼ FUTURE (Bandar / Supabase): replace ONLY the bodies of `persist` and
     `read` below with Supabase upsert/select on a `booking_ops` table keyed
     by booking_id (returning the same { booking_id, updated_at, ops } shape).
     Callers use save/load/exists/updatedAt only — no storage details leak
     out of this file.

   ALL storage access lives here. No localStorage calls anywhere else.
   ===================================================================== */
(function () {
  "use strict";

  var NS = "seasonbops:";                 // localStorage namespace (distinct from travel book's)
  function key(bid) { return NS + String(bid); }

  var LS_OK = (function () {
    try { var k = NS + "__probe"; localStorage.setItem(k, "1"); localStorage.removeItem(k); return true; }
    catch (e) { return false; }
  })();
  var mem = {};                           // session fallback

  // --- the only two functions Bandar swaps for Supabase ------------------
  function persist(bid, json) {
    if (LS_OK) { try { localStorage.setItem(key(bid), json); return; } catch (e) { /* fall through */ } }
    mem[key(bid)] = json;
  }
  function read(bid) {
    if (!bid) return null;
    var json = null;
    if (LS_OK) { try { json = localStorage.getItem(key(bid)); } catch (e) { json = null; } }
    if (json == null) json = (mem[key(bid)] != null ? mem[key(bid)] : null);
    if (json == null) return null;
    try { return JSON.parse(json); } catch (e) { return null; }
  }
  // -----------------------------------------------------------------------

  /* Fresh operational-state skeleton for a booking. Pure — writes nothing.
     Seeds ownership from booking_officer and a hotel-confirmation row from the
     summary hotel. Forward-compatible fields (owner_history, ready_to_send,
     travel_book mirror) are reserved but NOT computed/populated in Phase 0. */
  function defaults(booking) {
    booking = booking || {};
    return {
      booking_id: booking.booking_id || "",
      // ownership — default owner is the booking officer; reassignable later (+ history reserved)
      current_owner: { id: booking.booking_officer_id || "", name: booking.booking_officer || "" },
      owner_history: [],                                  // reserved (not populated yet)
      // hotel confirmation tracking — array supports multi-hotel; seeded from the summary hotel
      hotel_confirmations: booking.hotel_name
        ? [{ hotel_id: booking.hotel_id || "", hotel_name: booking.hotel_name, confirmation_number: "", confirmed: false }]
        : [],
      // flights / tickets — "tickets required if has_flights"
      has_flights: false,
      tickets: [],                                        // [{ label, uploaded:false }]
      // vouchers
      required_vouchers: [],                              // [{ type, label, attached:false }]
      // Travel Book status mirror (authoritative source is TravelBookStore; filled in Phase 1)
      travel_book: { status: "none" },                    // none | draft | ready
      // operational
      notes: "",
      ready_to_send: false,                               // derived in Phase 3; never changes booking_status
      sent_at: null
    };
  }

  function save(bookingId, ops) {
    if (!bookingId) return null;
    var rec = { booking_id: String(bookingId), updated_at: new Date().toISOString(), ops: ops };
    persist(bookingId, JSON.stringify(rec));
    return rec;
  }
  function load(bookingId) { var rec = read(bookingId); return rec ? rec.ops : null; }
  function updatedAt(bookingId) { var rec = read(bookingId); return rec ? rec.updated_at : null; }
  function exists(bookingId) { return read(bookingId) != null; }
  function remove(bookingId) {
    if (LS_OK) { try { localStorage.removeItem(key(bookingId)); } catch (e) { /* ignore */ } }
    delete mem[key(bookingId)];
  }

  window.BookingOpsStore = {
    save: save, load: load, exists: exists, updatedAt: updatedAt, remove: remove, defaults: defaults,
    _backend: LS_OK ? "localStorage" : "memory"
  };
})();
