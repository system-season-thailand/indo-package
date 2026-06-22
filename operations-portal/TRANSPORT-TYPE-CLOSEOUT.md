# Transportation File — Transport Type Layer (Closeout)

A logic correction, not a new module. Adds `transport_type` so a file can be either a **Full Program** (auto-pulled from a confirmed program) or **Transport Only** (manual, no program required).

## What was built
- **`transport_type` on every file:** `full_program` | `transport_only`. Default = `full_program` when linked program movements exist, else `transport_only`. Staff can flip it manually with a top toggle.
- **Full Program mode (unchanged behavior):** auto movements + assign-by-region. Ready now requires program linked + customer name + movements exist + all region drivers assigned.
- **Transport Only mode (new):** editable customer form (name, phone, destination, pax, arrival date, flight no) + a simple manual movement builder (Add / delete rows). Each movement: type, date, time, city/region, from, to, flight, notes, driver. No program, itinerary, or hotels required.
- **Type-aware Ready gate:** transport_only blocks only on missing transport fields — customer name, ≥1 movement, and per movement: point types (airport pickup/drop-off/point-to-point) need from + to + (time or flight) + driver; car-with-driver/custom need city + driver. Never blocked for "no program." Blockers surface as Missing Items.

## Acceptance tests — all PASS
- **T1** Full program (BK-IDN-0001): `full_program`, 16 movements auto-loaded, Ready disabled until drivers assigned. ✅
- **T2** Inline booking (BK-50009): `transport_only`, manual builder + editable customer shown. ✅
- **T3** Transport-only, no customer name: Ready blocked, "Customer name" shown in Missing Items. ✅
- **T4** Airport movement with name + from + to + flight + driver: Ready allowed (and persisted). ✅
- **T5** Manually added car-with-driver (city + driver): Ready allowed. ✅
- **T6** Full Program rules intact: BK-IDN-0001 still assigns by region and goes Ready. ✅
- **T7** No protected file modified. ✅

## Files changed (only these two)
- `transportation-file.js` — transport_type model + default detection, type toggle, editable customer form, manual movement builder, type-aware Ready gate, surgical `refreshGate()`.
- `transportation-file.css` — styles for the toggle, customer form, and movement rows.

One bug found and fixed during testing: typing in a text field then clicking "Add movement" could swallow the click, because the field's blur triggered a full re-render that detached the button. Text edits now update the model and refresh only the gate in place, so inputs and the Add button stay stable.

## Protected — confirmed untouched (grep = 0)
Travel Book (`book.js`, `book.css`, `editor.html`), `program-source.js`, `confirmed-booking-adapter.js`, `confirmed-bookings-manager.js`, and the movement generator `transportation-source.js`. None contain `transport_type`/`transport_only`.

## Stopped here
No WhatsApp, PDF, billing, reminders, or accounting started.
