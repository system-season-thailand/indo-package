# DS4 — Reports Center · Planning Deliverable (READ ONLY)

Status: **PLAN ONLY — no code until you approve.** This covers Architecture Review, UI Screens, Database Impact, Security Review, and the Implementation Plan, with the real data gaps flagged honestly so you decide before any build.

---

## 1 · Architecture Review

A new **read-only** sidebar module (`reports-center.html/.js/.css`) that *only reads* existing data and renders six report views with Excel/PDF export. It writes nothing and changes no existing module.

**Data it reads (all existing):**
- `CB_DATA.bookings` (86 bookings) — the analytical base. Each booking has: `company_name`, `sales_employee` / `sales_employee_id`, `booking_officer`, `destination`, `hotel_name` / `hotel_id`, `check_in` / `check_out`, `pax`, `booking_value`, `created_at`.
- `InvoiceStore` (sales / operations / hotel) + `TransportationInvoiceStore` — invoice existence + status.
- `TransportationFileStore` — file existence/status (for completeness context only).
- `travel-book/programs/*.json` — per-hotel `total_nights` / `total_room` for the 4 multi-hotel anchor programs (thin bookings derive nights from `check_out − check_in`).

**Shape:** one module, six tabs (Company · Employee · Destination · Hotel · Invoice · Executive), a shared filter bar per module, a shared aggregation core, and a shared export layer. No backend calls in the lab (same localStorage/JSON seam as everything else); in production these become read-only Supabase views/queries.

---

## 2 · UI Screens

Same warm-ivory / navy / gold RTL styling as the rest of the portal.

- **Module 1 — Company Reports:** table, one row per company → Total Bookings · Passengers · Nights · Sales Value · Hotel Cost · Avg Booking Value · Last Booking Date · Main Destination. Filters: date range · destination · company · employee. Export: Excel · PDF.
- **Module 2 — Employee Reports:** one row per employee → Bookings · Sales · Passengers · Active Companies · Avg Booking Value · Ranking. Filters: date range · destination · employee. Sorted by sales (ranking).
- **Module 3 — Destination Reports:** one row per destination → Bookings · Passengers · Nights · Revenue. (Indonesia · Thailand · Maldives + any future destination appears automatically.)
- **Module 4 — Hotel Reports:** one row per hotel → Bookings · Nights · Revenue · Avg Selling Price · Top Companies. Filters: hotel · destination · date range.
- **Module 5 — Invoice Reports:** Sales / Operations / Hotel Supplier (+ Transportation) → Generated · Pending · Missing, with export.
- **Module 6 — Executive Dashboard:** KPI cards → Today's Bookings · This Month Bookings · Today's Passengers · This Month Passengers · Monthly Sales · Top Company · Top Employee · Top Destination.

---

## 3 · Database Impact Report

**Lab:** zero impact — pure client-side reads of in-memory `CB_DATA`, the invoice stores, and static program JSON. No writes, no new keys, no schema.

**Production (Supabase), for Bandar:** Reports Center maps to **read-only** `SELECT` / aggregate queries (or a few reporting **views** / `SECURITY DEFINER` read RPCs) over the existing `bookings` and `invoices` tables. **No new tables, no column changes, no migrations, no writes.** Recommended: add reporting **views** (e.g. `v_company_report`, `v_employee_report`) so logic lives in one place; these are additive and don't touch existing objects.

---

## 4 · Security Review

- **Read-only:** the module has no save/edit/delete paths; it cannot mutate bookings, invoices, prices, or workflows.
- **Permissions unchanged:** Reports Center is gated by the **existing** role system. Proposal: visible to **management** only (financial/performance data), reusing the current `roles` mechanism — **no new permission types, no changes to existing permissions.**
- **No data exposure beyond what the role already sees** in the portal. Export (Excel/PDF) contains only data the user can already view on screen.
- **No external calls** — export is generated client-side.

---

## 5 · Final Implementation Plan

**Files (new, additive):** `reports-center.html`, `reports-center.js`, `reports-center.css`; one sidebar nav entry (`reports`, role `management`). Nothing else is modified.

**Build order:** aggregation core → Company → Employee → Destination → Hotel → Invoice → Executive → export layer → Playwright acceptance + protected-grep=0.

**Export:** PDF via the existing print-window pattern. For "Excel," I propose **CSV** (dependency-free, opens directly in Excel) for the static lab, with a note that true `.xlsx` can be added later via a bundled SheetJS. — *decision needed (see below).*

### Honest data gaps / decisions needed before building
1. **Hotel Cost (Module 1) & Hotel Supplier figures:** only exist where a **Hotel Supplier invoice** has prices entered (mostly absent today, by design — Pricing Engine is protected). Reports will show hotel cost **only from entered hotel invoices**, else "—". Not a defect; reflects data entry. → OK to show partial + "—"?
2. **Hotel Revenue & Avg Selling Price (Module 4):** `booking_value` is the **whole booking's** sales, not per-hotel. For single-hotel (thin) bookings I can attribute the full value to that hotel; for **multi-hotel programs** there's no per-hotel revenue split in the data. → Choose an allocation rule: **(a)** attribute full value to the primary hotel, or **(b)** split by nights across the program's hotels. I recommend (b) by nights, flagged as "allocated."
3. **Multi-currency:** sales are per destination (Indonesia Rp · Thailand ฿ · Maldives $). A single cross-destination "Total Sales" would **mix currencies**. → I propose totals shown **per destination/currency** (and Executive "Monthly Sales" shown per currency), rather than one misleading number.
4. **Nights:** per-booking nights = `check_out − check_in`; multi-hotel programs use the program's per-hotel `total_nights`. Consistent and available.
5. **Excel format:** CSV (now) vs bundled `.xlsx` (adds one library file). → Your call.

### Protected — will not be touched (verified target)
Booking Engine, Invoice Center, Sales/Operations/Hotel Supplier invoices, Invoice Completeness, Cross Check, Pricing Engine, Permissions, existing workflows. Reports Center is a pure additive read layer.

---

**Awaiting your approval + the 5 decisions above before any coding.**
