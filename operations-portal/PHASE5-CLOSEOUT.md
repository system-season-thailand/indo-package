# Phase 5 — Transportation Invoice Generator (Closeout)

The operational transportation invoice is generated directly from the Transportation File. The employee never re-enters booking, customer, movement, or driver data.

## Two honest design notes
- **Costs are the one genuine input.** Booking/customer/movements/drivers/regions all auto-pull from the file. Per-movement transportation **cost** and **additional services** do not exist anywhere else in the system, so those are the only fields the employee enters. The Pricing Engine (customer sales pricing) was not touched — this is a separate operational/driver-cost invoice.
- **The file stays the source of truth.** The invoice store holds only the invoice's own data (costs, services, status, agent, finalized snapshot) — it does **not** duplicate movements as a second source. Header and movement rows are always generated from the file.

## Flow (1 click each)
Open File → Assign Drivers → Ready → **🧾 توليد فاتورة المواصلات** → enter costs / add services → **Generate** → **Finalize** → **Print / PDF**.

## What it does
- **Header** auto-pulled: booking no, program no, customer, agent (optional, the only header field not in the file), pax, international + domestic flight, travel dates, assigned drivers, VIP.
- **Movements table** auto-generated: Date · Description · Driver · Region · Cost · Notes.
- **Regional totals** (by city, only regions used), **Driver totals** (per driver for accounting), **Additional services** (quick-add: SIM/E-SIM/Flower/Cake/Oud/VIP Airport/Fast Track/Romantic Dinner + custom), and a **Grand Total** = regional + services — all auto-computed live.
- **Statuses** Draft → Generated → Finalized. Finalized snapshots the invoice (immutable); re-open / re-print / re-export without regenerating.
- **Auto-sync:** if the file changes (driver/hotel/movement), the invoice shows "Transportation File updated — invoice requires refresh." Finalized invoices are never silently overwritten.
- **PDF + Print:** one click, professional A4 with company header, full invoice, regional + driver totals, services, grand total.
- **Daily Boards counters:** Invoices Generated / Missing / Pending.

## Acceptance — all PASS
Generate button on Ready ✅ · header auto-pulled ✅ · 16 movement rows with cost fields ✅ · totals auto-compute (Grand = Rp 8,875,000 on test costs) ✅ · service added to total ✅ · Draft→Generated→Finalized + snapshot + read-only ✅ · invoice stores costs/status only (no movement duplication) ✅ · PDF with logo/booking/regional/services/grand ✅ · re-open without regenerating ✅ · auto-sync banner on file change ✅ · boards counters (3) ✅ · protected modules untouched ✅.

## Files added
- `transportation-invoice.html` / `.js` / `.css` — the generator.
- `transportation-invoice-store.js` — `TransportationInvoiceStore` (localStorage seam → Supabase `transportation_invoices`).

## Files modified (additive only)
- `transportation-file.js` — «توليد فاتورة المواصلات» button (ready/completed) that deep-links the invoice.
- `operations-portal.js` — bridge handles `open-transport-invoice`.
- `operations-portal-sample-data.js` — registered the invoice module (hidden; opened from the file).
- `transportation-boards.js` / `.css` / `.html` — three invoice counters (additive; existing board logic untouched).

## Protected — untouched (verified)
Travel Book, Program Source, Pricing Engine, Quotation system, Confirmed Booking logic, Driver-Assignment logic (`applyRegions`/`regionOf` + `driver-registry.js`), and existing Daily Boards logic.

## Success criteria
A complete transportation invoice is prepared in well under 60 seconds from data already in the file — only costs and any extra services are entered.
