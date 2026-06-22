# DS5-B — Accounting Operations Layer · Closeout

Operational accounting tools built on top of DS5-A, all inside the (isolated) Finance Center. Built, tested (8 modules + exports + DS5-A regression all pass), no protected module touched.

## Modules built (8)
1. **Company Statement** — pick any company → invoice-level statement: Invoice Date · Booking · Customer · Arrival · Amount · Paid · Outstanding · Status + **Running Balance** (per currency). Filters: date range · destination · company. Export PDF + Excel.
2. **Unpaid Companies** — Company · Total Outstanding · #Unpaid Invoices · Nearest Arrival · Oldest Debt, sorted **highest outstanding first**, quick filter arrival within 7 / 30 / all.
3. **AR Dashboard** — Total Receivable + aging (Current · 0–30 · 31–60 · 61–90 · 90+), **by currency separately**, plus a per-company aging table.
4. **Supplier Ledger** (tracking only) — Hotels (from Hotel Supplier invoices), Transportation (from transport invoices); Tours & Flights show a "no cost data yet" note. Supplier · Amount · Booking · Customer · Destination · Status (manual Not Paid/Partial/Paid). No reconciliation.
5. **Bank Register** — per bank: Date · Description · Amount · Currency · Type (Incoming/Outgoing) with **running balance**; bank balance = opening + in − out.
6. **Follow-Up Queue** — the accountant's daily screen: companies with outstanding **and arrival within 30 days**, nearest first (≤7 days highlighted).
7. **Finance Executive Dashboard** (read-only) — Outstanding Receivables · Companies With Debt · Upcoming Arrivals Not Paid · Aging Summary · Bank Balances · Top Debtor Companies.
8. **Exports** — every report exports to **PDF + Excel (CSV)**.

(DS5-A modules retained: Accountant Dashboard, Open Invoices, Payment Registry/Allocation/Void. Total 10 tabs.)

## Test results — all PASS
10 tabs ✅ · M1 statement (9 cols + running balance + export) ✅ · M2 unpaid (sorted desc, 7/30/all chips) ✅ · M3 AR (6 currency cards + aging table) ✅ · M4 supplier (hotels + transport lines, manual status, tours/flights note) ✅ · M5 bank register (movement added, running balance) ✅ · M6 follow-up (30-day queue, 7-day highlight, export) ✅ · M7 executive (all six panels) ✅ · M8 CSV export ✅ · DS5-A regression (payments/partial still correct) ✅ · protected untouched ✅.

## Currency rule honored
All totals are shown **per currency** (Rp · THB · USD) and never combined — e.g. Outstanding *Rp 115,000 · THB 64,000*.

## New files
- *(none — DS5-B extends the existing Finance Center module.)*

## Modified files
- `finance-center.js` — added the 8 DS5-B modules + export layer (extends DS5-A; DS5-A behavior preserved).
- `finance-center.css` — DS5-B styles (chips, AR cards, export bar, supplier status, bank drill-in).
- `finance-store.js` — added bank movements + supplier-status tracking (additive; payments/banks unchanged).
- `finance-center.html` — added `transportation-invoice-store.js` include (read-only, for the supplier transport ledger).

## Protected — untouched (verified, grep = 0)
Booking Engine, Invoice Center, Daily Boards, Transportation (file/boards), Reports Center, Travel Book, Pricing. Finance Center stays isolated — reads Sales Invoices (+ Hotel/Transport invoices for supplier tracking) and writes only its own store; **source invoices are never changed**.

## Known limitations
- **Supplier Ledger** is tracking only — Tours/Flights have no cost source in the system yet (shown with a note); status is a manual flag (no amounts/reconciliation). Supplier payments are DS5-C.
- **Bank Register** is a manual movement log (no reconciliation); balance = opening + in − out.
- **Aging** uses arrival date; future arrivals are "Current."
- Multi-currency totals are never summed across currencies.
- Attachments (DS5-A) remain localStorage data-URLs (~3 MB) → Supabase Storage in production.

## Deployment notes (for Bandar)
- Lab storage `seasonfin:` adds `bmv:*` (bank movements) and `supstat` (supplier status map) alongside DS5-A payments/banks. Production: additive tables `bank_movements`, `supplier_status` + read-only derived views for statements/aging/follow-up. No schema changes to bookings/invoices; no writes back to invoices; no permission changes (management-only).

**Stopping after DS5-B.** Not started: Profit Analysis, Commission, Bank Reconciliation, Supplier Payments, General Ledger, Journal Entries, P&L, Balance Sheet (DS5-C and later).
