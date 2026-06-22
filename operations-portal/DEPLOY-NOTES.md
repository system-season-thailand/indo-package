# DEPLOY NOTES — Season B2B Lab (Transportation Operations, Phase 3)

Full deployable static project. Entry: `index.html` → `operations-portal.html`. `_redirects` + `netlify.toml` route `/` → `/operations-portal.html`. No build step — upload the folder as-is to Netlify.

## Phase 3 — files added
- `transportation-dashboard.html` / `.js` / `.css` — **Operations Dashboard** module: KPI panel, Arrivals, Departures, Future Arrival Lookup. Read-only over confirmed bookings + transportation files.

## Phase 3 — files modified
- `transportation-file.js` — added the 4-state status model (**Draft / Ready / Completed / Cancelled**), Completed + Cancel + Reopen actions, **Print** and **Export PDF** (A4 print view), and worklist **status + date filters** (Today / Tomorrow / This Week / This Month / Custom range). Driver-assignment and movement-generation logic untouched.
- `transportation-file.css` — styles for the new statuses, worklist filters, and badges.
- `operations-portal-sample-data.js` — registered the **عمليات المواصلات** (Transportation Operations) sidebar item, after **ملف المواصلات**.
- `operations-portal.js` — a plain sidebar selection now resets a previously deep-linked module to its base view, so clicking **ملف المواصلات** always shows the worklist (never a stale file). Only affects modules that were deep-linked.

## Earlier transportation files (still included)
- `transportation-file.html` — module shell.
- `transportation-file-store.js` — `TransportationFileStore` (localStorage seam → Supabase `transportation_files`). Permanent archive: files persist.
- `transportation-source.js` — movement generator + file builder (PROTECTED logic; unchanged).
- `driver-registry.js` — `DriverRegistry` (localStorage seam → Supabase `drivers`; unchanged).

## Behavior shipped (Phase 3)
- **Archive + statuses**: every saved file persists; worklist shows Draft / Ready / Completed / Cancelled, filterable by status and by date (today / tomorrow / week / month / custom).
- **Completed status**: from a Ready file, **إكمال الرحلة** marks it Completed; reopen returns it to Draft. Reports count completed files.
- **Print / PDF**: from any file, **Print** and **Export PDF** open an A4 print view (browser Save-as-PDF). Shows customer info, movements, driver names, and hotels. No WhatsApp.
- **Operations Dashboard**: KPI cards (Total / Draft / Ready / Completed / Cancelled, date-range aware); Arrivals & Departures for Today / Tomorrow / Next 7 Days grouped by Indonesia / Thailand / Maldives with customers / bookings / passengers; Future Arrival Lookup by any date.
- **Transport-only bookings** are first-class: they appear in the worklist and statistics, and Ready is gated only on transport fields (never on "no program").

## Protected files — untouched (verified)
- `travel-book/*` (Travel Book, Program Source, PDF render/templates), `confirmed-bookings-manager.*` (Confirmed Booking), Pricing, Companies, Quotations.
- Driver-assignment logic in `transportation-file.js` (`applyRegions`, `regionOf`) and `driver-registry.js`.
- Movement generator `transportation-source.js`.
(grep for `FILE.status` / `setFileStatus` in those files = 0.)

## What to test after deploy
1. Login (management) → sidebar shows **ملف المواصلات** and **عمليات المواصلات**.
2. Open `BK-IDN-0001` → 16 movements auto-load; assign both region drivers → **Ready**; **إكمال الرحلة** → **Completed**; reopen works.
3. **Print** / **Export PDF** → A4 view opens with customer, movements (driver names), and hotels. Save as PDF from the browser dialog.
4. Open any inline booking (e.g. `BK-50009`) → **Transport Only** builder; **إلغاء الملف** → Cancelled.
5. **ملف المواصلات** sidebar → worklist; filter by status (Draft/Ready/Completed/Cancelled) and by date (Today/Tomorrow/Week/Month/Custom).
6. **عمليات المواصلات** → KPI cards change with the range chips; Arrivals/Departures tables per country; pick a future date → per-country arrival counts.
7. Confirm Travel Book + PDF export + Confirmed Bookings still work unchanged.

Data is browser-local (localStorage) in this lab. Bandar swaps `TransportationFileStore` + `DriverRegistry` to Supabase for production; the dashboard then reads the same tables.

---

## Pre-production add-on (Daily Boards + Change Log + VIP PDF)
**Added:** `transportation-boards.html/.js/.css`, `transportation-log-store.js`.
**Modified:** `transportation-file.js` (VIP in PDF, `open_items` on save, change logging + log card, role capture), `transportation-file.html` (include log store), `operations-portal.js` (role in bridge), `operations-portal-sample-data.js` (**اللوحات اليومية** nav item).
**Test:** sidebar **اللوحات اليومية** → Arrivals / Departures / Missing tabs; open a file, change a driver/status → **سجل التغييرات** card records it; Export PDF shows VIP. Protected files untouched.

---

## Phase 4 — Operations Dashboard (file-based)
**Key change:** Daily Boards + Operations Dashboard now read ONLY from saved Transportation Files (no sample data). Added `TransportationFileStore.list()`.
**Daily Boards** now has summary cards (Arrivals Today / Departures Today / Ready / Missing) + tabs: Arrivals · Departures · **Forecast** · **Driver Workload** · Missing (tiered 🔴≤48h / 🟠≤7d / 🟡>7d).
**Modified:** `transportation-boards.js/.css/.html`, `transportation-dashboard.js/.html`, `transportation-file-store.js`.
**Test:** open **اللوحات اليومية** → summary cards + 5 tabs; numbers populate from created files. PDF includes driver phones + VIP + status.

---

## Phase 5 — Transportation Invoice Generator
**Added:** `transportation-invoice.html/.js/.css`, `transportation-invoice-store.js`.
**Modified:** `transportation-file.js` (🧾 Generate Invoice button on ready/completed), `operations-portal.js` (`open-transport-invoice` bridge), `operations-portal-sample-data.js` (hidden invoice module), `transportation-boards.js/.css/.html` (Invoices Generated/Missing/Pending counters).
**Flow:** open a Ready file → 🧾 توليد فاتورة المواصلات → header + movements auto-pull → enter costs / add services → Generate → Finalize → Print/PDF. Invoice stores only costs/services/status (file stays source of truth). Auto-sync banner when the file changes; finalized invoices never silently overwritten.

---

## Phase 6 — Invoice Center
**Added:** `invoice-center.html/.js/.css`, `invoice-store.js`.
**Modified:** `operations-portal-sample-data.js` (مركز الفواتير sidebar item), `transportation-boards.js/.html` (invoice counters across all types + Forecast customers count).
**Use:** sidebar **مركز الفواتير** → open a booking row → Generate **Sales** (company-facing, no drivers/costs), **Operations** (hotels/rooms/nights + editable prices, transport/services from the transport invoice), or **Transportation** (existing module). Statuses Draft/Generated/Sent/Cancelled + created date; Print/PDF each.
**Flagged:** Operations prices are operations-editable (no price data in lab; Pricing Engine is protected) and the Operations layout is provisional pending the real Excel template.

---

## Cross Check Layer (read-only)
**Modified:** `transportation-boards.js/.css/.html` (Cross Check tab + 6 KPIs + navigation; re-added Confirmed Bookings for this tab only), `operations-portal.js` (`open-invoice-center` bridge), `invoice-center.js` (`?bookingId&type` deep-link).
**Use:** Daily Boards → **التحقق الشامل · Cross Check**. Each confirmed booking is checked against its Transportation File + Sales Invoice + Operations Invoice (existence + status). Green=Complete, Yellow=Pending (Not Ready / Not Sent), Red=Missing. Click any red/yellow cell to open that item directly. Read-only — creates and modifies nothing.

---

## Cross Check Refinement + Operations Priority (monitoring only)
**Modified:** `transportation-boards.js/.css`.
- Cross Check **date filter** (Today/7/30/90/All Active, default 90) — excludes finished trips (real numbers; e.g. Missing TF 83→49).
- **Arrivals/Departures Without Driver** red KPI cards (today/tomorrow movements with no driver).
- New **Tomorrow Operations** tab (tomorrow's arrivals + departures).
- **Forecast** now 7-day, from confirmed bookings: per day per country → customers · PAX · bookings.
- Cross Check **priority order**: ⛔ Without Driver → Missing TF → Missing Ops → Missing Sales; rows sort criticals first; any row/cell click opens the missing item.
Read-only — no data created or changed.

---

## Final Daily Boards Refinement (UI only)
**Modified:** `transportation-boards.js/.css`.
- Booking number + customer name are clickable in Arrivals/Departures/Tomorrow → open the Transportation File.
- **PAX** column added to Arrivals, Departures, Tomorrow Operations.
- New top KPI cards: **PAX Today / PAX Tomorrow / PAX Next 7 Days** (from files) and **Arrivals Tomorrow / Departures Tomorrow**.
- Arrival/Departure Without Driver critical alerts retained. Read-only — no logic/data changes.

---

## Invoice Center + Hotel Supplier Invoice + Linking
**Modified:** `invoice-center.js/.css` (hub: arrival/departure dates + Hotel column + Overall X/4 + clickable ✅/❌ quick-open + destination/status/company filters + 6 summary cards; new **Hotel Supplier Invoice** type `hotel` — price/night editable, total = price×nights×rooms, Save/Print/PDF/Finalize, internal-only; **Related Invoices** bar in every view; deep-link `type=hotel`), `transportation-boards.js/.css` (**Invoice Completeness** 4/4…0/4 card in Cross Check tab, additive).
**Use:** sidebar **مركز الفواتير** → one row per booking with all four invoice states; click any ✅/❌ to open that invoice; filter by destination/status/company. Hotel Supplier invoice is internal (hotel settlements). Each invoice links to the other three.
**Carried gap:** Operations/Hotel prices are staff-entered (Pricing Engine protected); Operations Excel layout still pending your template.

---

## Invoice Center — Final Closeout
**Modified:** `invoice-center.js/.css` (Sales transfer-type lines + PAX; Hotel price auto-pulls from Operations Invoice with **Missing Price** when absent; unified PDF header with dates), `transportation-invoice.js` (PDF header reordered to the shared layout), `transportation-boards.js/.css` (Cross Check **Hotel** column, completeness **tooltips**, **Hotel Invoices** card).
**Validated:** one complete booking → all four invoices (Sales/Operations/Transportation/Hotel) generate from one screen, 4/4. Protected modules untouched. Invoice Center phase complete.

---

## Invoice Center — Official Close
**Modified:** `invoice-center.js/.css` (Hotel **Missing-Price banner** + **Finalize disabled** until all prices filled; live), `transportation-boards.js/.css` (Cross Check **priority tiers**: ⛔Critical / 🔴High ops / 🟠Medium sales / 🔵Low hotel; **completeness cards click to filter** the table; finalized hotel = complete).
**Validated:** complete booking → all 4 invoices auto-generate (4/4) and show across Dashboard, Cross Check, and Completeness; partials land in 3/4…0/4. Protected modules untouched. **Invoice Center phase closed.**

---

## DS4 — Reports Center (READ ONLY)
**Added:** `reports-center.html/.js/.css`; `reports` nav switched placeholder→module (management-only).
**Six modules:** Company · Employee · Destination · Hotel · Invoice · Executive — read-only aggregation over CB_DATA + invoice stores + program JSONs. Multi-currency shown per-currency (Rp/฿/$); hotel revenue allocated by nights; hotel cost only where hotel invoices priced (else "—"). Export: CSV (Excel) + PDF.
**Untouched:** Booking Engine, Invoice Center, all invoices, Completeness, Cross Check, Pricing, Permissions, workflows.
**Production:** read-only SELECT/aggregate or additive reporting views; no schema/permission changes.

---

## DS5-A — Finance Center Foundation
**Added:** `finance-center.html/.js/.css`, `finance-store.js` (`FinanceStore`: payments + allocations + manual banks — the only finance writes).
**Modified (shell only):** `operations-portal-sample-data.js` (finance nav placeholder→module, management-only), `operations-portal.js` (added `wallet` icon).
**Eight modules:** Accountant Dashboard · Company Ledger · Open Invoices · Payment Registry · Allocation · Aging (by arrival) · Arrivals-Outstanding · Banking. Receivables derived from generated Sales Invoices; paid/partial/unpaid derived (invoices never modified). Multi-currency per currency (Rp/THB/USD, never mixed). Payments void-only (reason+timestamp+actor). Receipt attachments (data-URL in lab; Supabase Storage in prod).
**Untouched:** Booking, Confirmed Booking, Invoice generation, Invoice Center, Reports, Transportation File, Daily Boards, Travel Book, Pricing.
**Production:** new additive tables `payments`/`payment_allocations`/`banks` + read-only derived views; no schema/permission changes.

---

## DS5-B — Accounting Operations Layer
**Modified:** `finance-center.js/.css` (8 new modules: Company Statement, Unpaid Companies, AR Dashboard, Supplier Ledger, Bank Register, Follow-Up Queue, Executive Dashboard, Exports — extends DS5-A, 10 tabs total), `finance-store.js` (+bank movements, +supplier status — additive), `finance-center.html` (+transportation-invoice-store include, read-only).
**Every report exports PDF + Excel (CSV).** Currencies always per-currency (Rp/THB/USD), never mixed. Supplier ledger + bank register are tracking only (no reconciliation). Source invoices never changed.
**Untouched:** Booking, Invoice Center, Daily Boards, Transportation, Reports, Travel Book, Pricing.
**Production:** additive `bank_movements`/`supplier_status` tables + derived views; no schema/permission changes.

---

## DS5-B.1 — Payment History (Finance Center FROZEN)
**Modified:** `finance-center.js` (Company Statement detail only: added Balance Flow debit/credit ledger with running balance, Payment History section with receipt link, and flow-based PDF/Excel export), `finance-center.css` (debit/credit colors).
**Added:** none. **Untouched:** finance-store.js, all other finance tabs, and all protected modules.
Balance Flow: Invoice Created (+), Payment Received (−), running balance per currency. Exports include invoices + payments + running balance. Receipt attachment surfaced read-only.
**🔒 Finance Center is now FROZEN. Future accounting → DS5-C (not started).**

---

## DS6 — Operations Command Center (READ-ONLY)
**Added:** `operations-command.html/.js/.css` — one executive screen, 7 sections (Arrivals 48h, Departures 48h, Critical Alerts, Companies Follow-Up, Missing Assignment Monitor, Executive Cards, Quick Actions), filters (date/destination/company/status), PDF+Excel snapshot export.
**Modified (shell only):** `operations-portal-sample-data.js` (ops-command nav entry, management-only), `operations-portal.js` (command icon + read-only `nav-to` bridge for Quick Actions).
**No new logic:** aggregates existing bookings/transport-files/invoices/finance only. No new statuses/invoice-types/finance-logic/workflow/accounting entries.
**Untouched:** Booking, Invoice Center, Finance, Cross Check, Invoice Completeness, generation logic, Daily Boards, Transportation, Reports, Travel Book, Pricing.
**Production:** read-only views feeding one dashboard endpoint; no schema/permission changes.

---

## DS6 — Operations Command Center Refinement
**Modified:** `operations-command.js/.css` only. Added Operational Window filter (7/30/90/All, default 30 — scopes all cards/alerts/tables), prominent Needs-Action-Today card (urgent-only), missing-item badges (red/orange/yellow), 4-level priority sort (critical→high→medium→low), cleaner layout order, and 4 navigation-only quick actions.
**No new logic / forbidden items:** no profit/banking/aging/ledger/supplier/new statuses. Operations-only, read-only.
**Untouched:** Booking, Invoice, Finance, Daily Boards, Transportation generation, Driver assignment, Reports, Travel Book, Pricing, portal shell.

---

## DS6 — Final Refinement (DS6 CLOSED)
**Modified:** `operations-command.js/.css` only. Needs Action Today is now a headline + dynamic bullet summary (counts sum to the headline); executive cards deduplicated to 5 distinct metrics (removed "Bookings At Risk"); badges use distinct colors (🔴 transport file · 🔵 sales · 🟠 operations · 🟡 hotel · ⚫ driver).
**No architecture/scope change.** No new reports/modules/statuses/finance/booking logic. Read-only. All locked modules untouched.
**DS6 CLOSED.**
