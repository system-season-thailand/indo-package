# DS6 — Operations Command Center · Closeout (READ-ONLY)

One executive screen aggregating existing system data — no new business logic, statuses, invoice types, finance logic, or workflow. Built, tested (12/12), no locked module touched.

## The seven sections
1. **Arrivals Next 48 Hours** — Arrival · Booking · Company · Client · Destination · Driver · Transport File Status · Invoice Status, with a 🟢/🟡/🔴 readiness indicator (transport file + driver + sales + ops).
2. **Departures Next 48 Hours** — Departure · Booking · Client · Company · Hotel · Driver · Status.
3. **Critical Operational Alerts** — auto-generated for upcoming bookings missing a transport file, driver, sales/operations/hotel invoice, or file approval. Severity (🔴 critical / 🟠 high / 🟡 medium), Booking, Issue, Days Remaining — sorted red first, then by days.
4. **Companies Requiring Follow-Up** — from Finance data: outstanding balance AND arrival within 7 days (Company · Outstanding · Next Arrival · Days Until).
5. **Missing Assignment Monitor** — bookings with no driver / incomplete transport file / missing operational owner (Booking · Client · Company · Missing Item).
6. **Executive Summary Cards** — Arrivals Today · Departures Today · Critical Alerts · Companies With Debt · Bookings At Risk · Incomplete Files.
7. **Quick Actions** — read-only navigation buttons (Bookings · Transport File · Company Ledger/Finance · Invoice Center).

Layout priority follows the brief: cards → critical alerts → risk tables. Executive style, one screen, color indicators rather than dense tables.

## Filters & exports
Date range · destination · company · readiness status. PDF + Excel (combined executive snapshot of all sections). All read-only.

## Test results — all PASS (12/12)
nav activated ✅ · 6 cards ✅ · all sections present ✅ · **Q1 who's arriving** (booking shown with driver/file/invoice + indicator) ✅ · **Q2 who's departing** ✅ · **Q3 bookings at risk** (alerts present, severity-sorted) ✅ · **Q4 collection follow-up** (company with outstanding + arrival ≤7d) ✅ · **Q5 incomplete files** ✅ · **Q6 needs attention today** (quick actions) ✅ · **Q7 read-only navigation** (opens Transport File) ✅ · exports ✅ · locked modules untouched ✅.

## Success criteria — a manager opens ONE screen and sees
1. Who is arriving tomorrow → Arrivals 48h ✅
2. Who is departing tomorrow → Departures 48h ✅
3. Which bookings are at risk → Critical Alerts ✅
4. Which companies need collection → Follow-Up ✅
5. Which files are incomplete → Missing Assignment Monitor + Incomplete Files card ✅
6. What needs attention today → cards + critical alerts ✅

## New files
`operations-command.html` / `operations-command.js` / `operations-command.css`.

## Modified files (shell only — no business module)
- `operations-portal-sample-data.js` — added the `ops-command` nav entry (management-only).
- `operations-portal.js` — added a `command` icon and a read-only `nav-to` message handler that powers the Quick Actions (navigation only).

## Locked / protected — untouched (verified, grep = 0)
Booking architecture, Invoice architecture/Center, Finance architecture/Center, Cross Check, Invoice Completeness, generation logic, Daily Boards, Transportation files, Reports Center, Travel Book, Pricing. This module only reads them.

## Forbidden items — none created
No new statuses, no new invoice types, no new finance logic, no new booking workflow, no accounting entries. Pure visibility.

## Known limitations
- "Next 48 hours" defaults to today + tomorrow; the date-range filter overrides it for any window.
- Alerts cover upcoming arrivals (today onward); past arrivals are excluded as operationally done. The alert/missing tables cap on-screen rows at 40 for readability — full set is in the export.
- Driver/transport-file readiness is read from the Transportation File; bookings with no file show "لا ملف".
- Outstanding/follow-up reuses the same read-only derivation as Finance (generated Sales Invoices − payments), per currency, never combined.

## Deployment notes (for Bandar)
- Pure read/aggregate over `bookings`, transport files, invoice stores, and finance payments. Production: a set of read-only views/queries feeding one dashboard endpoint. No writes, no schema changes, no permission changes (management-only). The `nav-to` bridge is a shell-level navigation hook, not business logic.
