# Cross Check Refinement + Operations Priority (Closeout)

Dashboard / monitoring only — all changes are inside Daily Boards + the Cross Check tab. Nothing in Confirmed Booking, Pricing, Transportation Generation/Assignment, Driver Registry, Invoice logic, PDF templates, Travel Book, or Program Source was touched.

## 1 · Cross Check date filter
Filter bar at the top: **Today · 7 days · 30 days · 90 days · All Active**, default **90 days**. Finished trips (check-out in the past) are always excluded, so the numbers are real — on the sample data **Missing TF went from 83 → 49** (90-day window), and 17 for Today. No misleading old bookings.

## 2–3 · Arrival / Departure Without Driver
Two prominent red KPI cards: **Arrivals Without Driver** and **Departures Without Driver** — any arrival/departure today or tomorrow whose file has no driver on that movement.

## 4 · Tomorrow Operations board
New tab **عمليات الغد · Tomorrow** — tomorrow's arrivals (Customer · Destination · City · Arrival Time · Driver · File Status) and departures. Open it in the morning to see everything happening tomorrow.

## 5 · 7-Day Forecast
The Forecast tab is now a real operational forecast from **confirmed bookings**: for each of the next 7 days, per country — customers · PAX · bookings.

## 6 · Cross Check priority order
Problems are no longer equal. Overall status follows severity:
**Level 1 (Critical):** Arrival/Departure Without Driver → **Level 2:** Missing Transportation File → **Level 3:** Missing Operations Invoice → **Level 4:** Missing Sales Invoice. Rows sort criticals to the top; the KPI order now puts Missing Ops before Missing Sales.

## 7 · Click to open
Any row (or any cell) is clickable and opens the relevant item directly — Transportation File, Operations Invoice, or Sales Invoice — based on the highest-priority gap.

## Acceptance — all PASS
Date filter (5 chips, default 90) ✅ · finished bookings excluded, Missing TF 83→49 ✅ · filter narrows (Today 17 / 90 = 50) ✅ · Arrivals & Departures Without Driver KPIs ✅ · Tomorrow Operations board ✅ · 7-day forecast (PAX · country · customers · bookings) ✅ · critical sorts to top ✅ · Missing Ops before Missing Sales ✅ · row click opens the item ✅ · **read-only — no data created or changed** ✅ · protected modules untouched ✅.

## Files modified (Daily Boards only, additive)
- `transportation-boards.js` / `.css` — date filter, Without-Driver KPIs, Tomorrow Operations tab, 7-day booking-based forecast, severity priority, row click.

## Protected — untouched (verified)
Confirmed Booking, Pricing Engine, Transportation Generation, Transportation Assignment, Driver Registry, Invoice logic, PDF templates, Travel Book, Program Source. This phase is monitoring only.

## Manager's 30-second answer
Who arrives/departs today, who arrives tomorrow, who has no driver, next-week PAX per country, and which files/invoices are actually missing — with no misleading numbers or old bookings.
