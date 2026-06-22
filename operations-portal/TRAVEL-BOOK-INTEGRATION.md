# Travel Book — integrated into the Operations Portal

> ⚠️ **Deploy the repo ROOT, not the `travel-book/` subfolder.** Publishing the
> subfolder makes the Travel Book editor the homepage and bypasses the dashboard.
> See **`DEPLOY-DASHBOARD.md`** for the authoritative deploy settings.

The new **Travel Book** is now the official guide module inside the existing
dashboard (`operations-portal.html`). It **replaces** the old magazine/template
guide in the active navigation. Static JSON simulation; no Supabase yet.

## Where the module lives
- All Travel Book code is under **`travel-book/`** (self-contained).
  Entry point for the workflow: **`travel-book/editor.html`**.
- It is loaded by the portal as the **“دليل الرحلة”** sidebar item, embedded as
  an iframe (same mechanism every other module uses).

## How it replaces the old guide
- `operations-portal-sample-data.js`: the old nav item
  `template-lab → premium-template-lab.html` was **replaced** by
  `travel-book → travel-book/editor.html` (id `travel-book`, label `دليل الرحلة`).
- The old `premium-template-lab.html` / `.js` files are **left untouched on disk**
  but are **no longer linked** from the navigation → hidden from the workflow.
- `content-studio-lab.html` (Content Studio) is **unchanged** and still available.

## User flow (works today, static)
Dashboard → **دليل الرحلة** → enter Program ID → **تحميل البرنامج** →
auto-fills customer / hotels / flights / transportation / itinerary / cities
(auto-detected) + destination content → edit anything → upload images / tickets /
vouchers → **معاينة** (preview) → **تصدير PDF** (server-side Chromium).

## Data seam — connecting Supabase later (Bandar)
Only two files change when real data arrives; the editor, renderer, and PDF stay
the same:
- `travel-book/program-source.js` — replace the bodies of `load(programNo)` and
  `library()` with Supabase queries that return the same program / library shapes
  (see the sample `programs/*.json` and `destination-library.json`).
  `detectCities()` and `buildBookData()` stay as-is.
- `travel-book/image-store.js` — replace `putImage()/putFile()` to upload to
  Supabase Storage and return a URL (same string-ref contract). Editor/renderer/PDF
  unchanged.
No business logic lives in the UI; it renders whatever the seam returns.

## PDF export — Netlify (build deploy required)
- Function (root): **`netlify/functions/travel-book-pdf.js`** — server-side
  Chromium (`playwright-core` + `@sparticuz/chromium`, the SAME proven stack as
  `generate-pdf.js`). It renders **`<site>/travel-book/book.html`** with the posted
  data injected via `addInitScript` (no race), `window.__pdfReady`, then
  `page.pdf({format:'A4', printBackground:true, margin:0})`.
- Reachable at **`/.netlify/functions/travel-book-pdf`** (set in
  `travel-book/config.js`).
- Config is at the **project root**: `netlify.toml` (functions dir, esbuild,
  `@sparticuz/chromium` external) and `package.json` (deps already present).
- **Must be a BUILD deploy** (Git-connected or `netlify deploy --build`), NOT
  drag-and-drop — drag-drop doesn’t run `npm install`, so the function won’t bundle
  (that was the earlier 404). Verify: open the function URL → **405 “POST only”** =
  live. `process.env.URL` is auto-injected by Netlify; override `BOOK_PATH` only if
  `book.html` isn’t at `/travel-book/book.html`.
- Caveat: Netlify’s ~10s sync timeout can be tight for a 21-page cold render. If you
  hit timeouts, raise the plan timeout or run `travel-book/server/pdf-server.js` on a
  Node host and point `config.js` at it (same output, no limit).

## Drag-and-drop vs build
Drag-and-drop is fine for **UI preview** (static pages render). It **cannot** run
the Chromium PDF function — that needs a build deploy. Use a build deploy for any
real PDF testing.
