# Cross Check Layer (Closeout)

A **read-only** reconciliation layer over the existing systems. It creates nothing and changes nothing — it reads the stores and surfaces what's incomplete, with one-click navigation to the missing item.

## Source of truth
Confirmed Bookings. Every booking is checked against its **Transportation File**, **Sales Invoice**, and **Operations Invoice** (existence + status).

## Per-artifact state (colour-coded)
- **Transportation File:** missing (🔴) · Draft → Not Ready (⚠) · Ready/Completed → OK (✅) · Cancelled → missing.
- **Sales / Operations Invoice:** missing (🔴) · Draft/Generated → Not Sent (⚠) · Sent → OK (✅) · Cancelled → missing.

## Overall status (priority order)
🔴 Missing Transportation File → 🔴 Missing Sales Invoice → 🔴 Missing Operations Invoice → ⚠ Transportation Not Ready → ⚠ Invoice Not Sent → ✅ Complete.

## Daily Boards — Cross Check tab
New tab **التحقق الشامل · Cross Check** with six KPI cards (Complete · Missing TF · Missing Sales · Missing Ops · Pending Files · Pending Invoices) and a detail table: Booking · Company · Customer · Destination · Transportation File · Sales Invoice · Operations Invoice · Overall. Rows sort gaps to the top.

## One-click navigation
Click any cell to open that item directly:
- Transportation File cell → opens the **Transportation File** for that booking.
- Sales / Operations cell → opens the **Invoice Center** deep-linked straight to that booking's Sales / Operations invoice.

## Acceptance — all PASS
Cross Check tab ✅ · 6 KPI cards ✅ · 8-column table over confirmed bookings ✅ · Complete=green / Not-Ready & Not-Sent=yellow / Missing=red ✅ · clicking a missing file cell opens the file ✅ · clicking an invoice cell opens the Invoice Center to that invoice ✅ · **read-only: viewing creates/changes no data** ✅ · protected modules untouched ✅.

## Files added
None (pure layer).

## Files modified (additive only)
- `transportation-boards.js` / `.css` — Cross Check tab, states, KPIs, navigation (read-only).
- `transportation-boards.html` — re-added Confirmed Bookings (source of truth) for this tab; other tabs remain file-based.
- `operations-portal.js` — `open-invoice-center` bridge (deep-link to a booking + invoice type).
- `invoice-center.js` — deep-link entry point (`?bookingId&type`) to open a specific invoice; invoice build/storage logic unchanged.

## Protected — untouched (verified)
Confirmed Booking logic, Transportation Generator, Transportation Assignment, Pricing, Travel Book, Program Source, and invoice build/storage logic.
