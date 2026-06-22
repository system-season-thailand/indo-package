# DS4 — Travel Book Automation Layer · status

## Done this pass (built + tested) — Features 1, 3, 4, 5
All four are **editor + data-layer only**. `book.js`, `book.css`, the fixed A4
pagination, and the Chromium export are **unchanged** (per DS4 rules).

**F1 — Auto-pull hotels / one guest name**
- “⤓ تحميل الفنادق من العرض” (Load Hotels From Quotation) re-pulls hotel fields
  (hotel, address, room/meal/bed, check-in/out, nights) from the program.
- Guest Name is entered **once** (header field “اسم العميل”) and auto-fills **all**
  hotel vouchers. Verified: all 4 hotels carry the single name.
- Confirmation Number stays a **manual per-hotel** field; the button never pulls or
  overwrites it.

**F3 — Auto-pull itinerary**
- “⤓ تحميل خط السير من العرض” (Load Itinerary From Quotation) re-pulls Day/Date/
  City/Program text. Text stays fully editable; re-pull works any time.

**F4 — Dynamic City Selection**
- New “المدن المُضمَّنة · Included Cities” section with a checkbox per registered city.
- Unchecking a city removes it **entirely** from the PDF (cover + all sections).
  Verified end-to-end: unchecking Jakarta + checking Bandung changed the render from
  **21 → 19 pages**, Jakarta’s cover and every Jakarta section gone, Bandung added.

**F5 — Future City Expansion**
- Cities are **registry-driven** from `destination-library.json` (city = cover photo
  + `sections[]`; a section’s `kind` can be restaurants / cafes / recommendations /
  apps / custom — the renderer draws any kind generically, so no code change is
  needed to add one).
- Demonstrated: **Bandung** was added to the library only (name AR/EN, cover image,
  two sections) and now appears automatically in Included Cities and renders when
  checked — zero code changes. This is the seam Content Studio / admin writes to.

## Done — Feature 2 (Airline Ticket Upload)
Built + tested. Touches the export only where ticket integration requires it; the
existing booklet pages and pagination are unchanged (image tickets are added as
*new* appendix pages; PDF tickets are merged after Chromium).
- Editor: “تذاكر الطيران · Flight Tickets” — per-ticket **title** (outbound / return /
  domestic) + **Upload (PDF / JPG / PNG)**, replace/remove, **unlimited** count, with a
  live type indicator (image → page in guide; PDF → merged into file).
- Image tickets (JPG/PNG) → clean fixed A4 appendix pages: navy/gold header with the
  ticket title, image **fit-to-page, no crop** (`object-fit:contain`), consistent with
  the Travel Book styling (new `.tk-*` classes only).
- PDF tickets → their pages are **merged** into the final file: qpdf in the self-host
  server (tested), pdf-lib in the Netlify function (`pdf-lib` added to package.json).
- Proven end-to-end: 3 tickets (JPG landscape + PNG portrait + a 2-page PDF) →
  final = 21 booklet + 2 image pages + 2 merged PDF pages = **25 pages**,
  `application/pdf`, booklet pages 1–21 unchanged.


## Honest limits
- No live deployment URL from here (no Netlify access in this environment). Deploy =
  a Netlify **build** deploy as documented in `TRAVEL-BOOK-INTEGRATION.md`.
- Everything above is proven locally with the real Chromium engine + screenshots.

## Files changed this pass
- Modified: `program-source.js` (one guest name on all hotels; detected/included/all
  city sets; `cityObjects` export), `editor.html` (single guest name + propagation;
  Load Hotels button; Load Itinerary button; Included Cities checkboxes; meta
  backfill), `destination-library.json` (registered BANDUNG; city_order).
- Added: `img/city-bandung.jpg`.
- Untouched: `book.js`, `book.css` (design + pagination), the Netlify function, the
  portal shell, and all other screens.
