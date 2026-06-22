# DS5 — Second destination: Thailand (built on the DS4 baseline)

DS5 is **not** a new project. It extends the existing, deployed Travel Book.
The DS4 build is the production baseline; everything below is applied **on top**
of it. The renderer (`book.js`), the stylesheet/pagination (`book.css`), the
Chromium PDF path (`server/pdf-server.js`, `netlify/functions/travel-book-pdf.js`,
`pdf-export.js`), and the data seam contract (`ProgramSource.detectCities` /
`buildBookData` signatures) are **unchanged**. Thailand is added as data + one
backward-compatible scoping line + a sample program + a destination picker.

## Result
One editor, one library shape, one PDF generator, one deployment, one codebase —
now with **two destinations**:
- **Indonesia** (unchanged) — Jakarta · Puncak · Bandung · Bali
- **Thailand** (new) — Bangkok · Pattaya · Phuket · Krabi

## What changed (additions only)
- `destination-library.json`
  - Added `country.Thailand` (AR/EN names, hotel/flight/itinerary notes, delivery
    apps **Grab · LINE MAN · foodpanda**, Saudi-embassy-in-Thailand card, thanks).
  - Added 4 Thai cities under `cities` (Bangkok, Pattaya, Phuket, Krabi) with
    sections (malls / shopping / money / recommendations / Bangkok halal-restaurants).
  - Added Thai city keys to `city_order`.
  - **Per-country scoping:** each country now carries a `cities` list
    (`Indonesia` and `Thailand`) so Included Cities only ever shows that
    destination's cities — Indonesia and Thailand never bleed into each other.
- `program-source.js`
  - Added Thai aliases to `CITY_ALIASES` (auto-detect Bangkok/Pattaya/Phuket/Krabi
    from itinerary + hotel addresses).
  - `buildBookData` now scopes the city universe to `country.cities` when present,
    **falling back to the full order when it isn't** → identical pre-DS5 behaviour
    for any country without a list. `detectCities` itself is untouched.
- `programs/THA-Q-2026-00001.json` — Bangkok+Pattaya+Phuket sample (→ 18-page PDF).
- `programs/THA-Q-2026-00002.json` — Phuket+Krabi sample (→ 13-page PDF), proves
  cities-follow-the-trip for Thailand.
- `editor.html` — added a **Destination** dropdown (إندونيسيا / تايلاند) in the
  program bar. Picking a destination loads its program; the dropdown also
  auto-syncs to whatever program is loaded. No other editor logic changed.
- `img/city-bangkok.jpg · city-pattaya.jpg · city-phuket.jpg · city-krabi.jpg` —
  branded **placeholder** covers (navy/gold, clearly marked "replace with city
  photo"), swapped for real photos via the existing upload slot. Item images
  reuse the existing `ph-*.jpg` placeholders, exactly like the Indonesia seed.

## Verified (real headless-Chromium render, in-sandbox)
- Indonesia unchanged: `IDN-Q-2026-00001` = **21 pages**, `IDN-Q-2026-00002` = **11**.
  Same cities, delivery apps, embassy card, single-guest-name on all vouchers.
- Thailand works: `THA-Q-2026-00001` renders a clean **18-page A4 PDF**
  (cover → hotel vouchers → flight note → itinerary → Bangkok/Pattaya/Phuket
  blocks → embassy → thanks); `THA-Q-2026-00002` = **13 pages** (Phuket+Krabi only).
- Editor: Destination dropdown loads the Thai program, Included Cities shows
  **only** Thai cities, live preview = 18 pages, no JS errors.
- All DS4 features intact: PDF/Chromium export, fixed pagination, Indonesia
  library, Included Cities, hotel vouchers, guest auto-fill, itinerary auto-load,
  JSON import/export.

## Honest limits / flags
- **Saudi embassy in Thailand**: phone `006626392999`, email `THEMB@MOFA.GOV.SA`,
  site `www.mofa.gov.sa` are verified (Royal Saudi Embassy, Bangkok). The embassy
  X/Twitter **handle** is left **blank** on purpose — fill it once confirmed.
- Thai city section contents (restaurants/recommendations) are **editable seed**
  like the Indonesia seed. Malls/exchanges/landmarks are real, stable names;
  per-quotation venue lists are meant to be refined in the editor / Content Studio.
- Thai city covers are placeholders by design — replace via the upload slot, or
  let Bandar point them at Supabase Storage URLs (no renderer change).
- For Bandar: nothing about the DB seam changed. `load()` / `library()` still the
  only swap points; a Thailand quotation simply returns `country: "Thailand"` and
  Thai city keys, and the same `buildBookData` maps it.
