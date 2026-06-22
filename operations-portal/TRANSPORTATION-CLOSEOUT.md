# Transportation File — Closeout

**Status:** Approved · Phase 1 + Phase 2.1 complete. No further transportation phase started.

---

## 1. What was built

**Phase 1 — Auto Transportation File**
A per-booking transportation file auto-generated from the confirmed program. Staff never re-enter movements. Opened from a button inside Confirmed Bookings, it shows customer info, hotels, the movement list (airport arrival, daily tours, intercity, internal-flight, airport departure — each with date, city, and the program note), missing items (shown, never blocking), VIP flag, reminder indicators (display-only), and Save / Ready-to-Send. One file per `booking_id`.

**Phase 2.1 — Assign by Region**
A simple Driver Registry plus a region-based assignment layer. The employee picks one driver per region and the system fans that driver out to every movement in the region. Per-movement override is available on demand but is not the default. Drivers can be added on the spot (data-only) and appear immediately in every selector.

---

## 2. Files added / modified

**Added**
- `transportation-source.js` — builds the file from the confirmed program (reuses the existing adapter + program assembly; movement generator).
- `transportation-file-store.js` — persistence seam, one file per `booking_id` (localStorage → Supabase later).
- `driver-registry.js` — driver master list (`add` / `update` / `setActive`, persisted).
- `transportation-file.html` / `transportation-file.js` / `transportation-file.css` — the module + assignment layer UI.

**Modified**
- `confirmed-bookings-manager.js` / `.css` — added the "إنشاء ملف المواصلات" entry button + its postMessage sender (additive; booking/analytics logic unchanged).
- `operations-portal.js` — open-transport-file bridge + menu-hidden filter.
- `operations-portal-sample-data.js` — registered the transport module as a bridge-only (hidden) item; menu stays at 10.

---

## 3. Protected files — untouched

- Confirmed Booking logic (operational control + analytics)
- Program Source logic
- Transportation Movement Generator (`deriveMovements`) — unchanged in Phase 2.1
- Travel Book (read-only reuse only; zero files added to or changed in `travel-book/`)
- PDF Export

Verified: none of these files contain any driver-assignment or region code.

---

## 4. Current workflow

Confirmed Booking → Transportation File (auto-generated) → Assign by Region → Ready to Send → *(Send to drivers = future)*

---

## 5. Driver assignment rule

The employee selects **one driver per region**; the system assigns all movements in that region automatically.

- **Indonesia Main** — Jakarta / Puncak / Bandung
- **Bali** — Bali driver
- **Thailand** — Thailand driver

Each movement displays the resolved driver **name + phone** (not a group name). Override on a single movement is allowed when needed and is preserved when the region's driver is changed.

---

## 6. Ready-to-Send gate

A file **cannot** be marked Ready to Send while any movement lacks a driver. The button is disabled with a clear "movements without driver (n)" warning. Once every movement has a driver, Ready-to-Send is enabled. The gate state and assignments persist per booking.

---

## 7. Intentionally NOT built

- WhatsApp sending (the "Send to drivers" step is future; Bandar will connect ready files to driver groups)
- PDF export of the transportation file
- Accounting
- Payroll
- GPS / live tracking
- Complex driver profiles (driver object is only `driver_id`, `driver_name`, `country`, `phone`, `active`)

Reminders remain display-only indicators; no automation, email, or message parsing.
