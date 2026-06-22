# DS5-A — Finance Center Foundation · Design Deliverable

Status: **ARCHITECTURE & DESIGN ONLY — no code until you approve.** Covers all six required deliverables, plus the decisions I need from you before any build.

**The one principle that shapes everything:** Finance **reads** invoices/bookings as the source of truth and **never writes to them**. Payments and allocations live in a **new, separate finance store**. An invoice's paid/partial/unpaid state is **derived** (computed from allocations), not stamped back onto the invoice — so Invoice Center, generation logic, and bookings stay untouched, exactly as the rules require.

---

## 1 · Architecture Design

A new module `finance-center.html/.js/.css` (sidebar entry, role-gated) with six tabs: **Ledger · Open Invoices · Payments · Aging · Arrivals-Unpaid · Accountant Dashboard**. It reads `CB_DATA.bookings` + Sales Invoices (`InvoiceStore` type `sales`) and reads/writes a new `FinanceStore`.

**What is a "receivable"?** The **Sales Invoice** is the company-facing invoice; its amount = the booking's sales total (`booking_value`). Operations and Hotel-Supplier invoices are *internal cost* documents and are **excluded** from receivables. So: receivable = a booking's `booking_value`, in that destination's currency.

**Derived, never stored on the invoice:**
- `paid(booking)` = Σ allocations to that booking across all payments.
- `remaining` = `booking_value − paid`.
- `status` = Paid (remaining ≤ 0) · Partial (0 < paid < amount) · Unpaid (paid = 0).
- Company balance, aging, and all KPIs roll up from these per booking — **per currency**.

**New storage (the only writes):** `FinanceStore` (lab namespace `seasonfin:`) holding **payments**, their **allocations**, and optional **adjustments / opening balances**. This is purely additive — it does not modify any existing store.

---

## 2 · Database Impact Review

**Existing (read-only):** `bookings` (company, `booking_value`, `check_in`, `created_at`, destination), Sales Invoices in `InvoiceStore`. **No changes** to these — no new columns, no writes, no paid-flag stamped on invoices.

**New, additive (lab → localStorage; production → new Supabase tables):**
- `payments` — id, date, company, amount, currency, bank, reference, notes, attachment_ref, created_at, created_by.
- `payment_allocations` — payment_id, booking_id (invoice), amount. (A payment can allocate across several invoices.)
- `finance_adjustments` *(optional)* — date, company, booking_id?, amount (+/−), description — backs the ledger's "Adjustment" line.
- `opening_balances` *(optional, migration)* — company/booking, opening outstanding, as-of date — seeds historical balances from the current Excel.

**Production note for Bandar:** these are **new tables only** — no migration of existing tables, no schema changes to bookings/invoices. Derived balances are computed in read queries/views (e.g. `v_invoice_balance`, `v_company_ar`, `v_aging`), never written back.

---

## 3 · Security Review

- **Writes are limited to the finance store** (payments/allocations/adjustments). Invoices, bookings, prices, and workflows remain read-only from Finance.
- **Allocation integrity (must-build guards):** a payment cannot allocate more than an invoice's remaining balance; total allocations ≤ payment amount; allocation currency must match the invoice's currency (no cross-currency settlement).
- **Audit:** every payment/adjustment stamps `created_at` (+ `created_by` role in production). Edits/deletes of posted payments should be restricted (propose: void-with-reason rather than hard delete) — *confirm scope*.
- **Permissions:** the rules say no permission changes without approval. **Decision needed** — gate Finance Center to the existing **management** role for now, or introduce a dedicated **accountant** role (that's a permission change requiring your separate approval).
- **Attachments:** in the static lab there's no file server; attachment = filename/reference text only. Real file storage needs Supabase Storage in production. *Confirm.*

---

## 4 · UI Screens

Same Season styling (warm ivory / navy / gold, RTL).

- **Company Ledger:** company list → Total Invoiced · Total Paid · Outstanding · Open Invoices · Last Payment · Next Arrival. Click a company → chronological **ledger**: Date · Reference · Description · Debit · Credit · Running Balance (invoices = debit, payments = credit, adjustments = either).
- **Open Invoices:** Invoice No · Company · Customer · Arrival Date · Amount · Paid · Remaining · Status (Unpaid/Partial/Paid), filterable.
- **Payment Registry:** form (Date · Company · Amount · Currency · Bank · Reference · Notes · Attachment) + an **Allocation** step that lists the company's open invoices so the accountant ticks one or more and enters amounts (full / partial / multi-invoice). On save, balances + ledger update (derived).
- **Aging Report:** per company → buckets 0–30 / 31–60 / 61–90 / 90+ · Outstanding · #Invoices · Oldest Invoice.
- **Arrivals With Unpaid Balances:** Company · Customer · Arrival Date · Outstanding · Days Until Arrival, sorted nearest-arrival-first (the accounting-critical follow-up list).
- **Accountant Dashboard:** Total Outstanding · Paid This Month · Open Invoices · Companies With Debt · Arrivals Requiring Follow-Up · Oldest Outstanding Invoice.

---

## 5 · Workflow Diagrams

**Payment → allocation → derived balances**
```
Accountant records Payment (company, amount, currency, bank, ref)
        │
        ▼
Allocate to open invoices  ── guard: Σalloc ≤ payment, alloc ≤ remaining, same currency
        │
        ▼
FinanceStore: save payment + allocations   (no write to invoices/bookings)
        │
        ▼
Derived (computed live):  invoice remaining ▸ status (Unpaid/Partial/Paid)
                          company outstanding ▸ ledger running balance
                          aging buckets ▸ dashboard KPIs
```

**Invoice status (derived, read-only over invoices)**
```
paid = 0            → Unpaid
0 < paid < amount   → Partial
paid ≥ amount       → Paid
```

**Excel migration (one-time)**
```
Accountant Excel ─→ CSV (companies, invoices, opening balances, historical payments)
        │
        ▼
Import wizard: map columns ▸ create opening_balances + historical payments+allocations
        │
        ▼
System balances reconcile to Excel as-of date ▸ Excel retired
```

---

## 6 · Migration Plan from Excel

1. **Snapshot** the accountant's current Excel as-of a cutoff date.
2. **Export to CSV** in a defined column layout (company, invoice/booking ref, invoiced amount, currency, amount paid, arrival date, last payment date).
3. **Opening balances:** for invoices already partly/fully paid in Excel, seed `opening_balances` (or historical `payments` + `allocations`) so derived remaining matches Excel exactly at the cutoff.
4. **Reconcile:** compare system Outstanding per company against the Excel totals; investigate any delta before go-live.
5. **Cut over:** from the cutoff date, all new payments are entered in Finance Center; Excel becomes read-only archive.
6. **Parallel run (optional):** run both for one cycle to build the accountant's trust before retiring Excel.

---

## Decisions needed before any coding
1. **Receivable trigger:** is a booking a receivable **(a)** as soon as it's a confirmed booking (`booking_value` owed), or **(b)** only once a **Sales Invoice** is generated in Invoice Center? *(Recommend (b) — the Sales Invoice is the company invoice; matches "invoices as source of truth." But the accountant's Excel may list all confirmed bookings — your call.)*
2. **Multi-currency:** balances/aging/KPIs **per currency** (Rp · ฿ · $), never summed across currencies. *(Recommend yes.)*
3. **Aging basis date:** there's no due-date field. Age by **invoice/booking creation date**, or introduce simple **payment terms** (e.g. net-30 from invoice or from arrival)? *(Recommend creation date now; terms later.)*
4. **Permissions:** management role now, or a dedicated **accountant** role (needs your approval as a permission change)?
5. **Attachments:** filename/reference only in the lab (real files via Supabase Storage in prod)?
6. **Adjustments:** allow manual debit/credit ledger adjustments (with reason), or defer?
7. **Edit/void:** posted payments — void-with-reason vs editable?

---

## Protected — will not be touched (verified target)
Booking Engine, Invoice Center, Invoice generation logic, Reports Center, Pricing Engine, Permissions (pending your decision #4). Finance reads invoices/bookings and writes only its own new store.

## Phase exclusions honored
No profit, commission, supplier/hotel/flight payables, bank reconciliation, general ledger, or journal entries — those are later phases.

---

**Awaiting your approval + answers to the 7 decisions before any coding.**
