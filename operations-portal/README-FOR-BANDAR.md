# Travel Book — Handoff for Bandar (Closeout)

**Status: functionally complete.** Travel Book is connected to Confirmed Bookings,
persists as a mutable operational record (one per booking), and renders A4 PDFs
via the existing server-side Chromium function. This document is the production
handoff. The only thing that changes for production is **the storage backend**.

---

## 1. What it does

```
Confirmed Bookings  ──"Create Travel Book"──►  Dashboard opens Travel Book editor
        │                                                │
        │  (booking handed over by id via postMessage)   │
        ▼                                                ▼
  confirmed-booking-adapter.js  ──►  program-source.buildBookData()  ──►  editor
   (booking → program shape)          (UNCHANGED renderer input)          │
                                                                          ▼
                                                            travel-book-store.js
                                                          (save / load the record)
                                                                          │
                                                                          ▼
                                                  /.netlify/functions/travel-book-pdf
                                                        (Chromium → A4 PDF)
```

- **Open**: if a saved Travel Book exists for the booking, the editor opens **that
  record** (all manual work intact). Otherwise it builds a fresh one from the
  booking and saves it (first creation).
- **One record per booking**, keyed by `booking_id`. Re-clicking "Create Travel
  Book" reopens the same record — never a duplicate.
- **Reload From Confirmed Booking** refreshes *source-owned* fields only
  (hotels, dates, cities, itinerary) and **preserves** manual/operational fields
  (confirmation numbers, tickets, vouchers, uploaded images, notes, manual edits).
- **Save** is explicit (button) plus debounced autosave, with a flush on
  hide/unload (covers reopen and iOS Safari hidden-iframe suspension).

---

## 2. The ONE swap for production: `travel-book/travel-book-store.js`

**This is the only file where storage lives.** No other file reads or writes
storage. Swap its backend from `localStorage` to Supabase here and Travel Book is
production-ready.

Public API (do not change the signatures — the editor depends on them):

```js
TravelBookStore.save(bookingId, data)   // upsert → returns { booking_id, saved_at, data }
TravelBookStore.load(bookingId)         // → data (the saved Travel Book) | null
TravelBookStore.exists(bookingId)       // → boolean
TravelBookStore.savedAt(bookingId)      // → ISO timestamp | null
TravelBookStore.remove(bookingId)       // → void
```

Inside the file, **only two private functions touch the backend** — replace these:

```js
function persist(bid, json) { ...localStorage.setItem... }   // → Supabase upsert
function read(bid)          { ...localStorage.getItem... }   // → Supabase select
```

Supabase sketch (keep the same `{ booking_id, saved_at, data }` record shape):

```js
// persist → upsert one row per booking
await supabase.from('travel_books').upsert({
  booking_id: bid,
  data: JSON.parse(json).data,         // jsonb
  saved_at: new Date().toISOString(),
  updated_by: currentUserId
}, { onConflict: 'booking_id' });

// read → select the row
const { data: row } = await supabase
  .from('travel_books')
  .select('booking_id, data, saved_at')
  .eq('booking_id', bid)
  .maybeSingle();
return row ? { booking_id: row.booking_id, saved_at: row.saved_at, data: row.data } : null;
```

### Async note (the one thing to wire)

The lab store is **synchronous** (localStorage). Supabase is **async**. The editor
reads the record synchronously at open time (`exists()` / `load()` inside its open
path). To keep the **editor untouched**, prefetch the record into the store before
the editor opens — the dashboard shell already hands the booking over by id, so add
the prefetch right there:

1. In `travel-book-store.js`, add an async `prime(bookingId)` that fetches the row
   from Supabase into an in-memory cache, and have `exists/load/savedAt` read that
   cache. `save` writes through to both cache and Supabase.
2. In `operations-portal.js`, in the `open-travel-book` handler, `await
   TravelBookStore.prime(bookingId)` **before** pointing the editor iframe at the
   booking.

That keeps all storage logic in `travel-book-store.js` and adds a single `await`
in the shell's open handler. The editor, renderer, adapter, and PDF path stay
exactly as shipped. (Alternatively, make `load/exists` return Promises and add one
`await` in the editor's open path — but the prefetch keeps the editor unchanged.)

---

## 3. Production table

```sql
create table travel_books (
  id          uuid primary key default gen_random_uuid(),
  booking_id  text unique not null,        -- one Travel Book per booking
  data        jsonb not null,              -- the full editable record (DATA)
  saved_at    timestamptz not null default now(),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  created_by  uuid,
  updated_by  uuid
);
create unique index on travel_books (booking_id);
```

`data` is the editor's working object (guest, hotels incl. confirmation numbers,
itinerary, cities + uploaded images, tickets, vouchers, notes, meta). It is a
**mutable operational record** — overwrite on save (not an immutable snapshot).

---

## 4. The data seam (separate, pre-existing)

`travel-book/program-source.js` is the seam for **program/library data** (the
booking's source program + the destination library). It currently fetches static
JSON (`programs/*.json`, `destination-library.json`). If/when you want Travel Book
to read source data from Supabase quotations instead of static JSON, swap the
bodies of `load(programNo)` and `library()` there. This is independent of
persistence and is **not** required to ship — the adapter and editor consume it
unchanged either way.

---

## 5. File list

**Added**
- `travel-book/travel-book-store.js` — persistence seam (localStorage now, Supabase later).
- `travel-book/confirmed-booking-adapter.js` — booking → program-shape mapping (the only mapping layer).
- `README-FOR-BANDAR.md` — this document.

**Modified**
- `travel-book/editor.html` — open-from-booking, source banner, Reload, Save + autosave, record load/save.
- `operations-portal.js` — cross-module bridge (`open-travel-book` / `request-booking`).
- `confirmed-bookings-manager.js` — "Create Travel Book" button (row + detail modal) and handler.
- `confirmed-bookings-manager.css` — button styles.
- `confirmed-bookings-manager-sample-data.js` — two anchor bookings linked to the sample programs.
- `operations-portal-sample-data.js` — Content Studio hidden from the menu (earlier cleanup; code retained on disk).

**Untouched (the contract — do not modify)**
- `travel-book/book.js` — PDF renderer
- `travel-book/book.css` — pagination
- `travel-book/book.html` — render harness
- `travel-book/program-source.js` — program/library data seam
- `travel-book/destination-library.json` — destination library
- `travel-book/image-store.js`, `travel-book/config.js`, `travel-book/pdf-export.js`
- `netlify/functions/travel-book-pdf.js` — Chromium export
- `travel-book/programs/*.json` and voucher templates

---

## 6. Do NOT modify

Editor field logic, renderer (`book.js`), PDF export / Chromium function,
pagination (`book.css`), destination library, voucher templates, and the booking
adapter (`confirmed-booking-adapter.js`). Production work = swap the store backend
(section 2) and, optionally, the program data seam (section 4).

---

## 7. Deploy

Netlify build: **publish the repository ROOT** (the dashboard `index.html` →
`_redirects` → `operations-portal.html`). Never publish `travel-book/` as the site
root — it is a sub-module loaded in an iframe. The PDF function lives at
`netlify/functions/travel-book-pdf.js` (endpoint `/.netlify/functions/travel-book-pdf`).

---

## 8. Acceptance (verified)

- Create Travel Book from a confirmed booking → editor opens, program auto-loads.
- Saved record reopens with all manual work intact (no duplicate, no data loss).
- Reload refreshes hotels/dates/cities/itinerary while preserving confirmation
  numbers, tickets, vouchers, uploaded images, and notes.
- Indonesia (IDN-Q-2026-00001 → 21 pages) and Thailand (THA-Q-2026-00001 → 18
  pages) export correctly from a confirmed booking. See the included test PDFs.

---

## 9. Future Extensions

These are the sanctioned places to add features. Each one **extends** the existing
system — it does not rebuild it, fork it, or duplicate the module. Build every
future feature on top of the same record, adapter, store, and renderer.

### 1. Airline ticket upload
- Upload tickets as PDF / JPG / PNG and insert them cleanly into the final
  Travel Book PDF.
- Use the existing record structure: tickets already live on the record at
  `meta.flights.tickets[]` as `{ title, filename, url, mime }`. Add files there —
  no new structure.
- Image tickets render as pages; PDF tickets merge into the final file. Do **not**
  change pagination or the renderer unless absolutely required; prefer merging at
  the existing Chromium/PDF step.

### 2. Additional destinations (e.g. Malaysia, Maldives)
- Add new destinations through the **same `destination-library.json` structure**
  (country block + `cities` list + per-city content), and add the matching
  `programs/*.json` source.
- One Travel Book module serves all destinations. **Do not** create a separate
  Travel Book app per destination.

### 3. Custom voucher types (hotel / service / transport / activity / restaurant)
- All voucher types attach to the **same Travel Book record**. Vouchers already
  live at `meta.vouchers` grouped by kind (`hotel`, `service`, `flight`); add new
  kinds (e.g. `transport`, `activity`, `restaurant`) as additional groups on that
  same object.
- Keep the upload/attach shape identical (`{ label, url, filename, mime, include }`)
  so the editor and PDF merge handle them with no contract change.

### 4. Multi-language support
- Reuse the **same data contract and renderer**. Add language as a field/variant
  on the record and resolve labels at render time.
- **Do not** duplicate the Travel Book module per language.

### 5. Additional PDF sections (weather, travel tips, emergency contacts, maps,
SIM/internet guide, payment & currency notes)
- Add each as a **reusable section block** that the renderer already knows how to
  lay out (same page/section model the city blocks use). Drive content from the
  record / destination library — not from bespoke one-off pages.

### Important rule

All future extensions must use the existing Travel Book architecture. **Do NOT
modify:**

- `book.js` (renderer)
- `book.css` (pagination)
- Chromium export (`netlify/functions/travel-book-pdf.js`)
- `confirmed-booking-adapter.js` (booking contract)
- `travel-book-store.js` public API (`save` / `load` / `exists` / `savedAt` / `remove`)
- the `destination-library.json` structure

Any future change must **extend** the system, not rebuild it. If a change seems to
require touching the renderer or pagination, treat that as a signal to reshape the
data/section block instead — escalate before modifying the stable core.
