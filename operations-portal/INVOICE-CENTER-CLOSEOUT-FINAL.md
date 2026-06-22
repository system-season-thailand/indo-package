# Invoice Center — Final Closeout (9 points)

All nine closeout items done and tested. Work stayed inside Invoice Center, Invoice PDFs, Invoice Completeness, and the Hotel Supplier Invoice. No protected module touched.

1. **Sales Invoice transfers** — transportation now shows clean transfer-type lines (Arrival Transfer · Intercity Transfer · Departure Transfer · Private Transfer) with routes, no operational prices. The company sees exactly what's included.
2. **Hotel Supplier prices** — the price now auto-pulls from the **Operations Invoice** per hotel. Where no price exists, the row shows **"Missing Price"** (red) instead of Rp 0. (Verified: ops price 1,500,000 → hotel total 4,500,000; unpriced hotels = Missing Price.)
3. **Completeness tooltips** — hovering 0/4…4/4 explains exactly what each number means.
4. **Cross Check Hotel column** — new **فاتورة الفنادق** column added between Operations Invoice and Status, so a missing hotel invoice is visible at a glance (and clickable to open).
5. **Related Invoices active state** — the current invoice's button is highlighted (gold) — Sales active in the Sales invoice, Hotel active in the Hotel invoice, etc.
6. **Unified PDF header** — all four invoices (Sales · Operations · Transportation · Hotel) share the same header: logo · booking number · company · customer · destination · dates, in the same order.
7. **Sales passenger count** — PAX (عدد المسافرين) now shows directly under the customer.
8. **Dashboard card** — new **Hotel Invoices** card counts hotel supplier invoices generated.
9. **Full validation** — a complete booking (hotels + transportation + flights + services) generates all four invoices (Sales · Operations · Transportation · Hotel) from one screen, each one click, no manual data entry → 4/4 complete.

## Acceptance — all PASS (11/11)
Sales transfer lines ✅ · sales PAX ✅ · hotel auto-pull from ops (4,500,000) ✅ · Missing Price (not Rp 0) ✅ · completeness tooltips ✅ · Cross Check hotel column in correct position ✅ · related active highlight ✅ · unified PDF header (sales + hotel) ✅ · Hotel Invoices dashboard card ✅ · all four invoices generate (4/4) ✅ · protected modules untouched ✅.

## Files modified (additive)
- `invoice-center.js` / `.css` — sales transfers + PAX, hotel auto-pull + Missing Price, unified PDF header (dates).
- `transportation-invoice.js` — PDF header reordered to the unified layout (header only; invoice logic unchanged).
- `transportation-boards.js` / `.css` — Cross Check Hotel column, completeness tooltips, Hotel Invoices card.

## Protected — untouched (verified)
Pricing Engine, Confirmed Bookings, Transportation File, Driver Assignment, Travel Book, Program Source.

## Note on prices
Hotel/Operations per-line prices are still staff-entered at source (the Pricing Engine isn't in the lab); the Hotel Supplier invoice now inherits them automatically from the Operations Invoice, so a price is entered once and flows through. The Invoice Center phase is complete.
