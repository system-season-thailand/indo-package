# DS4 — Reports Center · Closeout (READ ONLY)

A new read-only management reporting layer over existing data. Built, tested (11/11), no protected module touched.

## Modules (six tabs)
1. **Company Reports** — per company: Bookings · Passengers · Nights · Sales · Hotel Cost · Avg Booking Value · Last Booking · Main Destination. Filters: date · destination · company · employee. Export: Excel (CSV) · PDF.
2. **Employee Reports** — per employee (5 found): Bookings · Sales · Passengers · Active Companies · Avg Booking Value · Ranking. Filters: date · destination · employee.
3. **Destination Reports** — per destination: Bookings · Passengers · Nights · Revenue (Indonesia · Thailand; future destinations appear automatically).
4. **Hotel Reports** — per hotel: Bookings · Nights · Revenue (allocated) · Avg Selling Price/night · Top Companies. Filters: hotel · destination · date.
5. **Invoice Reports** — Sales · Operations · Hotel Supplier · Transportation → Generated · Pending · Missing, with export.
6. **Executive Dashboard** — KPI cards: Today's & This-Month Bookings/Passengers · Monthly Sales · Top Company · Top Employee · Top Destination.

## Decisions applied (from the plan)
1. **Hotel Cost** shows only where a Hotel Supplier invoice has prices; otherwise "—" (not a defect).
2. **Hotel revenue** is allocated across a program's hotels **by nights** (booking value is whole-booking, not per-hotel); avg selling price = revenue ÷ nights.
3. **Multi-currency** is never mixed — sales show per currency (Rp · ฿ · $); destination rows are single-currency.
4. **Nights** = check-out − check-in (multi-hotel programs use per-hotel nights from the program file).
5. **Excel = CSV** (UTF-8 BOM, opens directly in Excel, dependency-free); PDF via print window. True `.xlsx` can be added later with a bundled library.

## Export
Every report exports to **CSV** (Excel) and **PDF** (A4 landscape, Season header). Output reflects exactly what's on screen, filtered.

## Acceptance — all PASS (11/11)
Nav activated ✅ · six tabs ✅ · Company (12 rows, 9 cols, multi-currency, hotel-cost col) ✅ · Employee (5, ranked) ✅ · Destination (Indonesia + Thailand, ฿) ✅ · Hotel (17 rows, avg price, top companies) ✅ · Invoice (4 types, Generated/Pending/Missing react to data) ✅ · Executive (8 KPI cards, month = 27) ✅ · filters narrow data (86 → 42 Thailand) ✅ · CSV export ✅ · protected modules untouched ✅.

## Files (new, additive)
`reports-center.html` / `reports-center.js` / `reports-center.css`; the `reports` sidebar entry switched from placeholder to module (management-only). Nothing else modified.

## Production note (Supabase, for Bandar)
Maps to read-only `SELECT`/aggregate queries or additive reporting views over the existing `bookings` + `invoices` tables — no schema changes, no writes, no permission changes.

## Read-only / protected — untouched (verified)
Booking Engine, Invoice Center, Sales/Operations/Hotel Supplier invoices, Invoice Completeness, Cross Check, Pricing Engine, Permissions, existing workflows.

## Notes on the data
- Hotel Cost is "—" across the board until Hotel Supplier invoices are priced — by design.
- "Today's" KPIs use real today; sample bookings were created Apr–Jun 2026, so "This Month" = 27 and "Today" may be 0 — expected, not a defect.
- Missing invoice counts include historical bookings that never had invoices — not defects.
