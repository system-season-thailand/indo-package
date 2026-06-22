# DS5-A — Finance Center Foundation · Closeout

A controlled finance layer over Sales Invoices. Built, tested (all 10 acceptance tests + nav pass), no protected module touched.

## Approved decisions — all applied
1. **Receivable trigger:** a receivable exists only when a **Sales Invoice is generated** (status generated/sent). Confirmed bookings alone create nothing.
2. **Multi-currency:** Rp (IDR) · THB · USD, **never combined** — every total shows per currency (e.g. *Rp 177,000 · THB 64,000*).
3. **Aging basis:** **arrival date** (future/recent arrivals fall in 0–30).
4. **Permissions:** **management only** (no accountant role).
5. **Attachments:** payment receipt upload supported (image/PDF), stored with the payment.
6. **Adjustments:** not built (deferred).
7. **Void rule:** payments are **never deleted** — only voided, requiring **reason + timestamp + actor**; voiding reverses balances.
8. **Banking dashboard:** manual bank records (name, currency, balance, total in/out, last updated) — balance view only, no reconciliation.
9. **Critical KPI:** Arrivals Within 7 Days With Outstanding (company, customer, arrival, outstanding, days-until, status, nearest first).

## Modules built (8)
Accountant Dashboard · Company Ledger (list + per-company chronological ledger with running balance per currency) · Open Invoices (Unpaid/Partial/Paid) · Payment Registry · Payment Allocation (full / partial / multi-invoice, with guards) · Aging Report (0–30/31–60/61–90/90+) · Arrivals With Outstanding · Banking Dashboard.

## Test results — all PASS
- **T1** Sales Invoice → receivable appears ✅
- **T2** Partial payment → status Partial, company balance updates, ledger shows debit + credit ✅
- **T3** Full payment → Paid, remaining 0 ✅
- **T4** One payment to multiple invoices → all update ✅
- **T5** Void → marked void, balances reverse, reason required ✅
- **T6** Aging groups outstanding by arrival date ✅
- **T7** Arrivals within 7 days with outstanding shows correct companies ✅
- **T8** Banking shows balances by bank + currency ✅
- **T9** Currencies not mixed (Rp · THB shown separately) ✅
- **T10** No changes to Invoice Center / Booking / Transportation / Reports / Travel Book ✅

## Files added
- `finance-center.html` / `finance-center.js` / `finance-center.css` — the module.
- `finance-store.js` — `FinanceStore` (payments + embedded allocations + manual banks). The only finance writes.

## Files modified
- `operations-portal-sample-data.js` — `finance` nav switched placeholder→module (management-only). *(shell nav only)*
- `operations-portal.js` — added one `wallet` icon to the icon map. *(additive, no behavior change)*

## Protected — untouched (verified, grep = 0)
Booking Engine, Confirmed Booking, Invoice generation, Invoice Center structure, Reports Center, Transportation File, Daily Boards, Travel Book, Pricing Engine. Finance reads Sales Invoices and writes only its own store; **the source invoice is never changed by payment allocation**.

## Known limitations
- **Attachments** are stored as data-URLs in localStorage (lab), capped ~3 MB. Production needs Supabase Storage for real files.
- **Banks** are manual records — no reconciliation (by design for this phase).
- **Aging** uses arrival date; future/recent arrivals are "current" (0–30). No due-date/payment-terms concept yet.
- **Receivable amount** = the booking's `booking_value` (the Sales Invoice total). If a future Sales Invoice ever diverges from `booking_value`, finance follows `booking_value`.
- **Multi-currency** balances are never summed across currencies — totals are always per currency.
- Sample data has no Maldives bookings, but **USD is fully supported** (banks + currency paths).

## Deployment notes (for Bandar)
- Lab uses localStorage (`seasonfin:`). Production: swap `FinanceStore` to **new additive tables** — `payments`, `payment_allocations`, `banks` — plus read-only derived views (`v_invoice_balance`, `v_company_ar`, `v_aging`). No schema changes to bookings/invoices; no writes back to invoices; no permission changes.
- Receivables read from the Sales Invoice store/table (status generated/sent).

**Stopping after DS5-A.** Supplier Ledger, Profit, Commission, and Bank Reconciliation are later phases — not started.
