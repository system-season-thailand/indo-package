# Invoice Center + Hotel Supplier Invoice + Linking (Closeout)

Work confined to the Invoice Center, the new Supplier Invoice, and Invoice Linking — plus one additive Invoice-Completeness card in Daily Boards. No protected module touched.

## Phase 1 · Invoice Center (unified hub)
One screen, all four invoices per booking. Table columns: Booking · Company · Customer · Destination · **Arrival Date · Departure Date** · Sales · Operations · Transportation · **Hotel Supplier** · Overall.
- Each invoice cell shows **✅ موجودة / ❌ غير موجودة** and is **clickable — it opens that invoice directly** (quick open).
- Overall column shows **X/4** (green 4/4 · amber partial · red 0).
- **Filters:** destination (الكل/إندونيسيا/تايلند/المالديف), status (جاهزة = 4/4 · ناقصة), company.
- **Summary cards:** Total Bookings · Sales · Operations · Transportation · Hotel · Missing.

## Phase 2 · Hotel Supplier Invoice (new type, internal)
Auto-built from the booking's hotels. Per hotel: name · room type · nights · rooms · **price/night (editable)** · **total = price × nights × rooms**. Verified on the spec example: GRAND ASTON, Deluxe, 3 nights, 1 room, Rp 1,300,000 → **Rp 3,900,000**. Totals: إجمالي الفنادق + Grand Total. Buttons: **Save · Print · PDF · Finalize** (Finalize locks it; Unlock to edit). Clearly marked **internal — not shown to the customer or company; for hotel accounting/settlements**. (Prices are entered by accounting, since the protected Pricing Engine isn't in the lab.)

## Phase 3 · Invoice Linking
Every booking now has four linked invoices. Inside each invoice there's a **الفواتير المرتبطة · Related Invoices** bar (Sales · Operations · Transportation · Hotel); clicking any one opens it directly.

## Phase 4 · Invoice Completeness (Daily Boards)
Additive card row in the Cross Check tab: how many bookings have **4/4, 3/4, 2/4, 1/4, 0/4** invoices (sales + operations + transportation + hotel). Read-only; no board logic changed.

## Acceptance — all PASS
Hub 11 columns incl. arrival/departure dates + Hotel ✅ · 6 summary cards ✅ · all three filters ✅ · clickable status quick-open ✅ · Hotel invoice auto from hotels, price → total = price×nights×rooms (3,900,000) ✅ · Save/Print/PDF/Finalize, finalize locks ✅ · internal-only note ✅ · Related Invoices bar opens each ✅ · Daily Boards completeness (4/4…0/4) ✅ · protected modules untouched ✅.

## Files
- Added: none new (Hotel invoice lives in the existing Invoice Center module + `InvoiceStore` type `hotel`).
- Modified: `invoice-center.js` / `.css` (hub upgrade, Hotel Supplier invoice, Related bar, deep-link `type=hotel`); `transportation-boards.js` / `.css` (Invoice Completeness card — additive).

## Protected — untouched (verified)
Confirmed Booking, Transportation File, Driver Assignment, Daily Boards logic, Cross Check logic, Travel Book, Program Source, Pricing Engine.

## Carried gap (unchanged)
Operations & Hotel per-line prices are entered by staff — the protected Pricing Engine isn't available in the lab, and the Operations Excel layout still awaits your template.
