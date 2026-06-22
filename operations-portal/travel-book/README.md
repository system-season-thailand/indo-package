# Travel Book — fixed destination-guide module (Travel Stars style)

A clean, **fixed** booklet module that lives **inside the existing project**
(`season-b2b-lab/travel-book/`). It is the intended future replacement for the
old Destination Guide. **Nothing else in the project was changed or deleted** —
the old Content Studio, the old guide, and all existing screens stay untouched.

This phase: **static JSON only. No Supabase, no workers, no queues, no media
resolver, no page builder, no snapshot system.** Images are direct URLs.

## What it is
- A **fixed page sequence** in a **fixed order**, reproducing the Travel Stars
  booklet (21 pages for the Bali/Jakarta/Puncak sample).
- Header pages (cover, hotels, internal-flight note, itinerary, delivery apps),
  then **one bundle per city** (divider photo + its fixed sections), then footer
  pages (Saudi embassy, thank-you).
- A **city bundle repeats per city** — adding a city does not change any layout;
  it reuses the same fixed section templates. City count varies; templates do not.

## Files in this module (added files only)
```
travel-book/
├── index.html        module launcher (Editor · Booklet)
├── book.html         the booklet (screen + Chromium PDF target)
├── book.css          the one fixed stylesheet (screen + A4 print)
├── book.js           the filler: data -> fixed templates (no resolver/builder)
├── editor.html       content-only editor (text + image URLs, add/remove rows)
├── trip-data.json    the Bali/Jakarta/Puncak sample (field names = future DB columns)
├── travel-book-sample.pdf   rendered proof (21 A4 pages, 0 blanks)
└── img/              city photos + neutral slot placeholders (replace with real URLs)
```

## Fixed slots (approved caps)
Restaurants 4 · Cafes 3 · Malls 4 · Markets 3 · Shopping/Bali 5 · Money 3 ·
City photo 1 · Hotels repeat as needed.
**Note / flag:** the Travel Stars reference shows **5 cafés on the Bali page**,
which exceeds the approved Cafes=3 cap. To keep the sample faithful, the editor
cap for cafés is set to **5**. Tell me if you want it forced back to 3.

## How images work (no resolver)
Each slot is one field holding one image URL. `book.js` outputs `<img src="…">`
directly. Empty or broken URL → a neutral placeholder circle (never a broken
icon, never a fake photo). That is the entire image rule.

## PDF / Safari
`book.html` is the print target: fixed A4, `@page{margin:0}`, one page per block.
«حفظ كـ PDF» uses the browser's Chromium print. The layout is print-clean, so it
does not depend on Safari's print behaviour. For automated server-side PDF later,
point a headless-Chromium step at `book.html` — no new worker is required now.

## For Bandar — connecting Supabase later
The JSON field names are chosen to map 1:1 to tables/columns. Suggested mapping:
- `trips`: agency_en, agency_ar, country_en, country_ar, traveler_name,
  delivery_title, embassy_title, embassy_subtitle, embassy_org, embassy_website,
  embassy_handle, thanks_message; arrays hotels_note / flights_note /
  itinerary_note / delivery_apps as text[] (or a notes child table).
- `hotel_bookings` (FK trip): guest_name, confirmation_number, property_name,
  address, total_room, room_type, bed_type, check_in, check_out, total_nights,
  meal_plan.
- `itinerary_days` (FK trip): date, city, program.
- `cities` (FK trip): name_ar, name_en, photo.
- `city_sections` (FK city): kind, title, halal.
- `section_items` (FK section): name, image.
- `embassy_contacts` (FK trip): label, value.
Bandar's only job for real images: put an **absolute Storage URL** in each
`*.image` / `cities[].photo` field. No renderer change needed.

## Run locally (static)
```
cd travel-book
python3 -m http.server 8000   # then open http://localhost:8000/
```
Drag-and-drop the folder onto any static host also works for viewing/printing.

## Optional navigation link (existing screens unchanged)
To add an entry point from an existing screen, add one link only — no other edit:
```html
<a href="travel-book/index.html">دليل الرحلة (جديد)</a>
```
</MD>
echo "index.html + README.md written"; ls -1
---

## Phase 2 — Load Program → auto-fill (static; Bandar connects DB later)

The Travel Book is now **generated from a program/quotation**, not built by hand.
This phase is **static** (no Supabase). The editor loads a local
`programs/<no>.json` and the shared `destination-library.json`; Bandar later
swaps only the two loader bodies for real queries — nothing else changes.

### Workflow
`Program ID → تحميل البرنامج → auto-detect cities → auto-fill (traveler, hotels,
flights note, transportation, itinerary, cities + destination content) → edit
anything → تصدير PDF`. URL convenience: `editor.html?program=IDN-Q-2026-00001`.

### Added files (this phase)
- `program-source.js` — the **single seam**. `ProgramSource.load(no)` and
  `.library()` fetch local JSON now; **Bandar replaces these two function
  bodies with Supabase queries**. `detectCities()` and `buildBookData()` (the
  fixed program→booklet mapper) stay unchanged.
- `destination-library.json` — destination content **stored once** per city
  (`cities.JAKARTA/PUNCAK/BALI`), plus country-level shared content
  (`country.Indonesia`: delivery, embassy, boilerplate notes, thanks) and the
  company brand (`agency`). `city_order` sets the canonical booklet order.
- `programs/IDN-Q-2026-00001.json` — Jakarta+Puncak+Bali sample (→ 21-page PDF).
- `programs/IDN-Q-2026-00002.json` — Bali-only sample (→ 11-page PDF). Proves
  cities-follow-the-trip.
- `editor.html` — extended (only this file changed): program bar + load +
  auto-fill + new editable **Transportation** and **Tours** groups + **reserved**
  Flight-tickets and Vouchers groups.

### Cities follow the trip (mandatory)
`detectCities(program, library)` derives the city set from the itinerary city
tokens + hotel addresses + any explicit `program.cities`, then returns them in
`library.city_order`. Only trip cities appear; no manual selection. Bali-only
program → only the Bali block renders.

### Reserved data model (exists now, merged into the PDF in a later phase)
Carried on `data.meta` and preserved through export/import:
- `meta.transportation[]` `{label, note}` — editable now.
- `meta.tours[]` — editable now (daily tours also live in itinerary text).
- `meta.flights.tickets[]` `{filename, url}` — RESERVED: upload + merge later.
- `meta.vouchers.{hotel,service,flight}[]` `{label, url, include}` — RESERVED:
  select + merge later.
The fixed renderer ignores `meta`, so the current PDF is unaffected.

### Supabase mapping for Bandar (when DB is connected)
Replace the bodies of `ProgramSource.load(no)` / `.library()` only:
- `load(no)` → quotation header + `customer`, `hotel_bookings`, `flights`(+`flight_tickets`),
  `transfers`(→transportation), `tours`, `itinerary_days`, `vouchers`, trip `dates`,
  and the trip's `cities`. Return the **program shape** (see the two sample JSONs).
- `library()` → `destination_cities` (+ `city_sections`, `section_items`),
  `country_content`, `agency`. Return the **library shape** (see destination-library.json).
Keep `detectCities` / `buildBookData` as-is. The editor + booklet + PDF are untouched.

---

## Phase 3 — Image upload (base64 now, behind a storage adapter)

Every image slot now supports **upload from device → instant preview → replace →
remove**, with the URL field kept underneath for advanced users. Uploaded images
are **downscaled (max 1600px, JPEG ~0.82) and embedded as base64 data: URLs**, so
they render identically in the editor preview, the booklet, and the PDF with no
renderer change (a slot value is still just a string — `data:` or `http`).

### Added file
- `image-store.js` — the **storage adapter** and the ONLY swap point:
  - `ImageStore.putImage(file) -> Promise<string ref>` (downscaled base64 now).
  - `ImageStore.putFile(file) -> Promise<{filename,ref,mime,size}>` (tickets/vouchers).
  - `ImageStore.approxKB(ref)`, `ImageStore.kind` (`"base64"` now).

### Where it applies
All image slots: **city covers + restaurants + cafés + shopping/malls/markets +
money items** (Upload/Replace/Remove + preview + URL). **Flight tickets** and
**vouchers** use the file uploader (PDF or image), stored the same way and still
reserved for the PDF-merge phase.

### Bandar — swap base64 → Supabase Storage later
Replace ONLY the bodies of `putImage()` / `putFile()` in `image-store.js` with a
Storage upload that returns the public URL (keep the same return types). Set
`ImageStore.kind = "storage"`. **No change** to the editor, the guide renderer,
the PDF generator, or the user workflow — the slot value is still a URL string.
Example body: upload `file` to `travel-book/trips/<id>/<uuid>-<name>`, then return
`getPublicUrl(...)`. (The downscale step can stay client-side or move server-side.)

### Note on size
Base64 images live inside the trip JSON. The downscale keeps each image small
(a ~120 KB photo stores at ~15 KB), but many photos still grow the JSON — the
durable fix is the Storage swap above (short URLs), which is Bandar's step.

### NOT in the current booklet structure
The reference Travel Stars booklet has **no hotel-image or emergency-image
slots** (hotel cards are text vouchers; the embassy page is a contact card). The
upload widget is applied to every slot that exists. If you want hotel and/or
emergency image slots, that means adding new fixed slots to the booklet layout —
say the word and I'll add them as an explicit, separate change.

---

## Phase 4 — Atomic pagination (page-break control)

`book.css` now applies `break-inside: avoid; page-break-inside: avoid;` to every
major block so a component is treated as one unit and is never split across
pages: `.page`, cover/welcome, city divider photo, content pages, section header
(`.c-head`), the circle grid (`.circles`/`.place`), hotel cards (`.hcard`),
itinerary table + rows, delivery apps, flight block, embassy card/rows, band
titles, note lines, and the thank-you box. Verified: the sample still renders
**21 pages, 0 blanks**, and a stressed section (4-line title + 5 items) keeps its
header with its grid on one page.

### Important — how to generate the PDF (so pages don't split)
Each page is a full A4 block. It only paginates correctly when the PDF is
produced with **margins: 0**:
- ✅ Chromium render path (the delivered `travel-book-sample.pdf` uses this) →
  clean, one component per page.
- ⚠️ **Safari / iPhone "Save as PDF" forces print margins** and ignores
  `@page { margin:0 }`, so a 297mm page no longer fits the sheet and every page
  cascades/splits. Do **not** rely on Safari's print button for the final PDF.

### Known limit (fixed-page model)
Pages are fixed 297mm with `overflow:hidden`, so a component whose content is
*physically taller than one sheet* (e.g. a very long hotel note plus two full
cards, or an itinerary beyond ~16 days) is **clipped**, not split. `break-inside`
cannot rescue a block taller than a page. If/when real data hits this, the small
fixes are: chunk hotels **1 card per page** when notes are long, and/or let the
itinerary table continue on a second page — both are minor, opt-in changes.

---

## Phase 5 — One render engine: server-side Chromium PDF (no Safari)

PDF generation no longer uses the browser's print (`window.print()`), which iOS
Safari breaks by re-paginating with forced margins. The booklet is now rendered
by **headless Chromium on the server**, so iPhone and desktop POST the same data
and receive the **same fixed-page A4 PDF, every time**.

### Files (added)
- `server/pdf-server.js` — dependency-free self-host server (uses a system
  Chromium via `CHROME_BIN`). Serves the booklet and exposes `POST /pdf` (body =
  booklet data) → `application/pdf`. Run: `CHROME_BIN=/path/to/chrome node server/pdf-server.js`.
- `netlify/functions/travel-book-pdf.js` — serverless variant (puppeteer-core +
  @sparticuz/chromium) for Netlify. Loads `/travel-book/book.html`, injects the
  data via `page.evaluate`, waits for `window.__pdfReady`, then `page.pdf({format:'A4',
  printBackground:true, margin:0})`.
- `package.json` — deps for the Netlify function.
- `pdf-export.js` — the only client path to a PDF: POSTs the data to the endpoint
  and downloads the file. Endpoint configurable via `window.TB_PDF_ENDPOINT`
  (default `/.netlify/functions/travel-book-pdf`; self-host → `http://host:8090/pdf`).

### Files (changed)
- `book.html` — the "حفظ كـ PDF" (Safari print) button is replaced by
  "تنزيل PDF (صفحات ثابتة)", which calls the server endpoint.
- `editor.html` — "تصدير PDF" now calls the server endpoint (was opening book.html).
- `book.js` — `load()` also accepts `?data=<url>` so the server can inject data
  by filename (no URL-length limit; base64 images are fine). Rendering unchanged.

### Proven (in-sandbox, real HTTP)
`POST /pdf` → program 00001 = **21 pages A4**, program 00002 = **11 pages A4**;
rendering 00001 twice is **pixel-identical** (deterministic). Pages 1–8 are clean:
hotel title with its cards, flight circle intact, no split sections/logos.

### Deterministic & device-independent
Because rendering happens server-side, the caller's browser/OS never paginates.
Same data in → same PDF out, on iPhone or desktop. To change the engine later,
only the render function changes; the booklet, editor, and data layer do not.

### Netlify deploy (for Bandar)
1. Deploy the static `travel-book/` so `book.html` is at `/travel-book/book.html`.
2. Deploy `netlify/functions/travel-book-pdf.js`; add deps from `package.json`.
3. Set env `SITE_URL` to the deployed origin.
4. Leave `window.TB_PDF_ENDPOINT` at the default (or set it to the function URL).
