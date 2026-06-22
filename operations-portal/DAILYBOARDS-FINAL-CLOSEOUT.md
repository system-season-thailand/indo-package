# Final Daily Boards Refinement (Closeout)

Dashboard UI only — no logic touched in Transportation Files, Driver Assignment, Invoice Generation, Pricing, or Confirmed Booking. Read-only.

## 1 · Click to open
In Arrivals, Departures, and Tomorrow Operations, the **booking number** and **customer name** are now clickable links that open that booking's **Transportation File** directly.

## 2 · PAX column
A **PAX** column (passenger count, from the actual transportation file) was added to **Arrivals**, **Departures**, and **Tomorrow Operations**.

## 3 · PAX KPI cards
Top-of-page cards, counted from actual transportation files: **PAX Today**, **PAX Tomorrow**, **PAX Next 7 Days**.

## 4 · Tomorrow KPI cards
Top-of-page standalone cards: **Arrivals Tomorrow** and **Departures Tomorrow**.

## 5 · Critical alerts kept
**Arrival Without Driver** and **Departure Without Driver** remain the top operational priority in the Cross Check tab — unchanged.

## 6 · No logic changes
Pure dashboard/monitoring. No data, files, invoices, or assignments are created or modified.

## Acceptance — all PASS
Booking + customer clickable → open file ✅ · PAX column in Arrivals/Departures/Tomorrow ✅ · PAX Today/Tomorrow/Next-7 KPIs (4 / 6 / 10 on test data) ✅ · Arrivals & Departures Tomorrow KPIs ✅ · critical Without-Driver alerts retained ✅ · read-only, no data changed ✅ · protected logic untouched ✅.

## Files modified (Daily Boards UI only)
- `transportation-boards.js` / `.css` — clickable booking/customer links, PAX columns, PAX + Tomorrow KPI cards.

## Protected — untouched (verified)
Transportation Files logic, Driver Assignment, Invoice Generation, Pricing, Confirmed Booking, Program Source, Travel Book, PDF templates.
