# DS5-B.1 — Payment History · Closeout (Finance Center FROZEN)

Final additive enhancement to the **Company Statement** only. Built, tested (8/8 pass), no other finance module and no protected module touched.

## What was added (Company Statement detail)
1. **Balance Flow** — chronological debit/credit ledger with running balance:
   - *Invoice Created* → debit **+amount** (e.g. +Rp 86,000)
   - *Payment Received* → credit **−amount** (e.g. −Rp 43,000)
   - **Running Balance** after each line (e.g. Rp 43,000), per currency.
2. **Payment History** — Payment Date · Company · Invoice Number · Amount Paid · Currency · Reference Number · Notes · **Receipt**, in chronological order (one row per allocated invoice).
3. **Payment Receipt Attachment** — the receipt uploaded in the Payment Registry (PDF/image) is surfaced here as a read-only 📎 download link.
4. **Exports** — the statement PDF/Excel now export the **Balance Flow**, i.e. invoices (+), payments (−), and the running balance together.

The original invoice table (Invoice Date · Booking · Customer · Arrival · Amount · Paid · Outstanding · Status · Running Balance) is retained above the new sections.

## Test results — all PASS
- Balance Flow shows Invoice Created **+Rp 86,000** ✅
- Balance Flow shows Payment Received **−Rp 43,000** ✅
- Running balance resolves to **Rp 43,000** ✅
- Payment History has all 8 columns + invoice number + reference + notes ✅
- Receipt attachment appears as a read-only link ✅
- Export (CSV/PDF) includes invoices + payments + running balance ✅
- No other finance changes (Payments, Open Invoices, etc. unchanged) ✅
- Protected modules untouched ✅

## Files modified
- `finance-center.js` — Company Statement detail only (added Balance Flow + Payment History + flow-based export).
- `finance-center.css` — debit (green) / credit (red) emphasis.

## Files added
- *(none)*

## Protected & other finance modules — untouched (verified)
Booking, Invoice Center, Daily Boards, Transportation, Reports, Travel Book, Pricing — and `finance-store.js` and every other Finance tab — unchanged.

## Known limitations
- Receipt files remain localStorage data-URLs (~3 MB) in the lab → Supabase Storage in production.
- Balance Flow running balance is computed per currency (currencies never combined).

## Deployment notes (for Bandar)
- Pure read/derive enhancement over existing payments + receivables. Production: the statement maps to a derived view joining sales-invoice receivables and `payment_allocations` (debit/credit), ordered by date with a windowed running balance per currency. No schema or store changes.

---

# 🔒 FINANCE CENTER — FROZEN
DS5-A + DS5-B + DS5-B.1 are complete and accepted. The Finance Center is now frozen. Any future accounting work (Profit Analysis, Commission, Bank Reconciliation, Supplier Payments, General Ledger, Journal Entries, P&L, Balance Sheet) moves to **DS5-C** and is not started.
