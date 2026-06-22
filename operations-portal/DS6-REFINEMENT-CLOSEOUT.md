# DS6 — Operations Command Center Refinement · Closeout

Final refinement, all changes confined to the Operations Command Center UI + aggregation layer. Built, tested (8/8), no protected module touched.

## What changed
1. **Operational Window filter** (top): 7 / 30 / 90 / All — **default 30 days**. Every card, alert, and table follows it, so the screen shows only actionable risk, not old noise.
2. **Needs Action Today** — a prominent (red) banner counting only urgent items: arrival ≤48h with incomplete file, departure ≤48h with no driver, company arrival ≤7d with outstanding balance, and missing transport file for a near arrival.
3. **Missing-items badges** — long text replaced with small colored badges: 🔴 ملف نقل / فاتورة مبيعات / سائق, 🟠 فاتورة عمليات / اعتماد الملف / مسؤول, 🟡 فاتورة فندق. Readable in ~2 seconds.
4. **4-level priority sorting** — Critical (≤48h incomplete, departure ≤48h no driver, missing transport file for near arrival) → High (missing ops invoice, outstanding + arrival ≤7d, missing file/driver) → Medium (missing sales/hotel invoice) → Low (far future incomplete). Red → orange → yellow → low.
5. **Cleaner executive layout** — order: executive cards → Needs Action Today → Critical Alerts → Upcoming Arrivals/Departures → Follow-up → (detailed monitor lower). No dense raw tables up top.
6. **Quick Actions** — navigation only: Open Booking · Open Transport File · Open Invoice Center · Open Company Ledger. No editing.

## Test results — all PASS (8/8)
- **T1** Default window is 30 days ✅
- **T2** Switching to 7 days updates all cards/alerts/tables (alerts 26 → 10) ✅
- **T3** Switching to 90 days updates all (alerts → 36) ✅
- **T4** Missing items show as badges, not long text (130 badges) ✅
- **T5** Critical 48-hour issues sort above future low-priority (severity-ordered, critical first) ✅
- **T6** Needs Action Today counts only urgent actionable items (11) ✅
- **T7** Quick action buttons open the correct modules (Bookings/Transport File/Invoice Center/Finance) ✅
- **T8** No protected modules changed ✅

## Files modified
- `operations-command.js` — window filter, Needs-Action-Today, badges, 4-level priority, reordered layout, quick-action labels.
- `operations-command.css` — window chips, Needs-Action banner, badge styles.

## Files added
- *(none)*

## Protected — untouched (verified, grep = 0)
Booking logic, Invoice logic, Finance Center, Daily Boards, Transportation generation, Driver assignment, Reports Center, Travel Book, Pricing, and the portal shell. The module only reads existing data.

## Forbidden items — none added
No profit, banking, aging, ledger details, supplier accounting, or new invoice/booking statuses. Operations-only; finance detail stays in Finance Center. The follow-up section shows outstanding + arrival only (operational collection priority), no aging buckets or ledgers.

## Known limitations
- "Needs Action Today" and Follow-Up use a fixed urgency horizon (≤48h / ≤7d) regardless of the chosen window, by design — these are "act now" signals.
- Alert/monitor tables cap on-screen rows at 50 for readability; the full windowed set is in the PDF/Excel export.
- Outstanding/remaining reuses the same read-only derivation as Finance (generated Sales Invoices − payments), per currency, never combined.

**Stopping after DS6 refinement.** No new phase started.
