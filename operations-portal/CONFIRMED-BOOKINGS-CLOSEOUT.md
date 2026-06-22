# Confirmed Bookings — Closeout Note (Phases 0–2)

Turning Confirmed Bookings into an operational control center, built additively on
top of the existing module. The booking record stayed read-only throughout; all
operational state lives in one new seam.

---

## 1. Phase 0 — Foundation (`BookingOpsStore`)

- Added **`booking-ops-store.js`**: a persistence seam for per-booking operational
  state, keyed by `booking_id`.
- Operational state is stored **separately** from the booking record — the seam
  never writes into the booking record and never changes `booking_status`.
- API: `save(bookingId, ops)` → `{ booking_id, updated_at, ops }`, `load`, `exists`,
  `updatedAt`, `remove`, `defaults(booking)`. localStorage namespace `seasonbops:`.
- **Supabase replacement:** swap only the two private functions `persist` / `read`
  inside the file for upsert/select on a `booking_ops` table. Callers use the
  public API only — no storage details leak out.

## 2. Phase 1 — Read-only visibility

- Derived operational status from `BookingOpsStore` + `TravelBookStore` (read-only).
- **List pills** (new "الحالة التشغيلية" column): Hotel, Tickets ("—" when no
  flights), Vouchers, Travel Book (None ✕ / Draft ◐ / Ready ✓), and a Ready to
  Send vs Missing Items pill.
- **Missing-items filters:** Ready to send · Missing hotel confirmations · Missing
  tickets · Missing vouchers · Missing Travel Book.
- **Detail checklist** (read-only): hotels, tickets, vouchers, Travel Book status,
  missing-items summary, current owner. Travel Book status read from
  `TravelBookStore`; live refresh via the `storage` event.

## 3. Phase 2 — Editable control center

- Detail modal "مركز التحكم التشغيلي · Operational Control", all writes to
  `BookingOpsStore` only:
  - **Hotel confirmations** — confirmation number + confirmed toggle, per hotel
    (`ops.hotel_confirmations[]`, multi-hotel ready).
  - **Tickets** — has-flights toggle + add/remove rows (label + uploaded toggle)
    (`ops.tickets[]`).
  - **Vouchers** — add/remove rows (type + attached toggle)
    (`ops.required_vouchers[]`).
  - **Current owner** — reassignable dropdown, defaults to `booking_officer`
    (`ops.current_owner`). `booking_officer` is never modified.
  - **Notes** — multi-line (`ops.notes`).
  - **Ready to Send** — derived only, never editable; recomputes live (confirmed +
    all hotels confirmed + Travel Book exists + required vouchers attached +
    tickets uploaded when flights).
  - **Save** — explicit button + debounced autosave + flush on close/pagehide.

## 4. Protected contracts (never modified)

- `booking_status` — never changed.
- Booking records — never written; remain read-only/synced. No ops fields injected.
- Travel Book / `TravelBookStore` — read-only use of the public API; no files changed.
- PDF export / Chromium / pagination — untouched.
- Analytics (summary, officers, destinations, workload), Reports, Dashboard KPIs,
  and existing filters — untouched.

## 5. Production handoff

- `BookingOpsStore` maps later to a Supabase **`booking_ops`** table keyed by
  `booking_id` (swap only `persist` / `read`):

```sql
create table booking_ops (
  id          uuid primary key default gen_random_uuid(),
  booking_id  text unique not null,
  ops         jsonb not null,
  updated_at  timestamptz not null default now(),
  created_at  timestamptz not null default now(),
  updated_by  uuid
);
```

- Async note: the lab store is synchronous; Supabase is async. Prefetch the row
  before the module reads (so the synchronous `load`/`exists` stay valid), same
  pattern as Travel Book's store.
- Existing booking records stay **read-only / synced** from quotations. Operational
  state stays **separate** in `booking_ops`. The two never merge.

## 6. Acceptance status

- **Phase 0 — PASS** (save/load by `booking_id`, persists across reload, booking
  record untouched).
- **Phase 1 — PASS** (pills, filters, checklist; Travel Book status from
  `TravelBookStore`; `booking_status` unchanged).
- **Phase 2 — PASS** (all 8 tests: confirmations, hotels, tickets, vouchers, owner
  persist across reload; Ready-to-Send auto-derives; `booking_status` and Travel
  Book untouched).

---

**Status:** Phases 0–2 complete and approved. Phase 3 not started.
