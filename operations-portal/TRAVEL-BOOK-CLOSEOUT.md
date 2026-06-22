# Travel Book / Destination Guide — FINAL CLOSEOUT & HANDOFF

**Status: CLOSED — working baseline. Do not rebuild, redesign, or re-version.**
This is the single authoritative handoff. The implementation is frozen as the
accepted baseline; the only remaining work is Bandar connecting the data seam to
Supabase (two files, described below). Everything else stays as-is.

---

## 1. What this is

The Travel Book is the destination-guide module **inside** the Season Operations
dashboard. It loads a confirmed program, auto-fills a fixed Travel Stars–style A4
booklet, lets staff edit any field/image, and exports a PDF via server-side
Chromium. It runs on static JSON today; Bandar swaps the data seam for Supabase
later **without touching** the editor, renderer, or PDF pipeline.

Supported destinations: **Indonesia** and **Thailand** — both in the same module.

---

## 2. Locked entry flow (this is the required state)

```
Season Operations Dashboard  (operations-portal.html  ← site homepage)
  → Sidebar → «دليل الرحلة» (Travel Book / Destination Guide)
    → Destination dropdown: Indonesia | Thailand
      → Enter / load confirmed program number
        → Load program data (auto-fill)
          → Edit if needed
            → Export PDF
```

Same dashboard · same sidebar · same navigation · same codebase · same
deployment · same module. Travel Book is **never** a standalone page in
production — it is embedded in the dashboard via an iframe, the same mechanism
every other module uses.

---

## 3. Deployment (the one thing that must be set correctly)

**Publish the repository ROOT — never the `travel-book/` subfolder.**
Publishing the subfolder makes the editor the homepage and bypasses the
dashboard (and breaks PDF export, since the render function lives at the root).

Netlify settings (the root `netlify.toml` already encodes this):
- Base directory: repo root (empty / `/`)
- **Publish directory: `.`** (repo root) — do NOT set to `travel-book`
- Functions directory: `netlify/functions`
- Must be a **build deploy** (Git-connected or `netlify deploy --build`), not
  drag-and-drop, so the function's node deps bundle.

Full detail in **`DEPLOY-DASHBOARD.md`**.

---

## 4. The Supabase seam — the ONLY files Bandar changes

Replace the **bodies** of these functions; keep their signatures and return
shapes identical. The editor, `detectCities()`, `buildBookData()`, the renderer
(`book.js`), and the PDF function stay untouched.

### 4a. `travel-book/program-source.js`
- `load(programNo)` → returns the **program object** (today: fetches
  `programs/{programNo}.json`). Swap for a Supabase query returning the same shape.
- `library()` → returns the **library object** (today: fetches
  `destination-library.json`). Swap for Supabase returning the same shape.
- Leave as-is: `detectCities(program, library)`, `buildBookData(program, library)`,
  `loadBook(programNo)`.

### 4b. `travel-book/image-store.js`
- `putImage(file, opts)` → returns an image **ref string** (today: a base64 data
  URL). Swap for a Supabase Storage upload returning the public URL.
- `putFile(file)` → returns `{ filename, ref, mime, size }` (today base64).
  Swap `ref` for the uploaded URL. Same object contract.

No business logic lives in the UI; it renders whatever the seam returns.

---

## 5. Data shapes the seam must return

### Program object (one confirmed quotation)
Top-level keys:
`schema, program_no, country, customer, dates, hotels, flights, transportation,
tours, itinerary, cities, vouchers`.
- `country` is `"Indonesia"` or `"Thailand"` — this is what routes the booklet's
  country-level content and scopes the cities.
- Reference samples: `programs/IDN-Q-2026-00001.json`, `programs/THA-Q-2026-00001.json`.

### Library object (shared content store)
Top-level keys: `schema, agency, city_order, country, cities`.
- `country{}` keyed by name (`Indonesia`, `Thailand`); each holds `country_en/ar`,
  a **`cities` list** (the city universe for that country), `delivery_apps`,
  `embassy_*`, `thanks`, notes.
- `cities{}` keyed by KEY: `JAKARTA, PUNCAK, BALI, BANDUNG, BANGKOK, PATTAYA,
  PHUKET, KRABI`.

### How both destinations stay separated
Each country object carries its own `cities` list. `buildBookData()` filters the
flat `city_order` down to the program country's cities (and falls back to the full
order if a country has no list — identical to pre-Thailand behaviour). So an
Indonesia quotation only ever pulls Indonesian cities, a Thailand quotation only
Thai cities — no cross-bleed. A Thailand quotation simply returns
`country:"Thailand"` plus Thai city keys, and the same `buildBookData()` maps it.

---

## 6. Verified behaviour (accepted baseline)

End-to-end in a real browser, entering through the dashboard:
- Entry = the dashboard (not Travel Book). Sidebar shows Dashboard, Quotation
  Status, Operations Workspace, Confirmed Bookings, Booking Pipeline, Companies,
  Reports, Settings + Travel Book.
- Travel Book opens **embedded** in the dashboard.
- **Indonesia**: 21-page program (IDN-Q-2026-00001) and 11-page (…-00002); cities
  Jakarta/Puncak/Bandung/Bali. Unchanged from the original baseline.
- **Thailand**: 18-page program (THA-Q-2026-00001) and 13-page (…-00002); cities
  Bangkok/Pattaya/Phuket/Krabi; Thai delivery apps; Riyadh embassy in Bangkok.
- Switching destinations both ways is clean — no city bleed in either direction.
- THA-Q-2026-00001 rendered through the same Chromium export to a correct 18-page
  A4 PDF.

---

## 7. Open items (editable content, not bugs)

These are intentional seed/placeholder values, editable in the editor — flagged so
they're filled before client-facing use, not left as surprises:
1. **Embassy X/Twitter handle (Bangkok)** is left blank — it was not verifiable, so
   it was not invented. Fill it in the library when known.
2. **Thai venue lists** (malls, restaurants, exchanges) and the **four Thai city
   cover images** are real but generic seed content / branded placeholders. Refine
   text and swap covers via the existing upload slots.

---

## 8. Do NOT touch (frozen baseline)

`operations-portal.*` (the dashboard shell + nav), `book.js` (renderer),
`book.css` (layout/pagination), `editor.html` (editor UI + destination dropdown),
`netlify/functions/travel-book-pdf.js`, `config.js`, and the page/section template
structure. The integration and both destinations are already wired and verified.
The only forward work is the Supabase swap in §4.

---

## 9. File map (where things live)

- `operations-portal.html` / `.js` / `.css` / `-sample-data.js` — dashboard shell;
  Travel Book registered as nav id `travel-book` → `travel-book/editor.html`.
- `travel-book/` — the self-contained module:
  - `editor.html` — editor + destination dropdown (production entry inside the dash)
  - `book.html` / `book.js` / `book.css` — fixed A4 renderer + pagination
  - `program-source.js` — **DB seam** (§4a)
  - `image-store.js` — **image seam** (§4b)
  - `destination-library.json` — content store (countries + cities)
  - `programs/IDN-Q-2026-0000{1,2}.json`, `programs/THA-Q-2026-0000{1,2}.json`
  - `config.js` — PDF endpoint (`/.netlify/functions/travel-book-pdf`)
  - `img/` — city covers + placeholder slots
  - `index.html` — standalone dev launcher only (not the production entry)
- `netlify/functions/travel-book-pdf.js` — server-side Chromium PDF (root)
- `netlify.toml` / `package.json` — build + deps (root)
- `DEPLOY-DASHBOARD.md` — authoritative deploy settings
- `TRAVEL-BOOK-INTEGRATION.md` — integration + seam notes
- `DS5-STATUS.md` — Thailand addition detail
- `TRAVEL-BOOK-CLOSEOUT.md` — this document
