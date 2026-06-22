# Season — PDF Export Architecture (Chromium, not Safari)

iOS Safari "Save as PDF" is **removed from the export path**. It was the cause of
8→16 pages, blank pages between content, forced margins, and preview/PDF drift.

The guide design, editorial layout, and content are **unchanged**. Only *how the
PDF is produced* changed.

## Two separate paths now

1. **Preview** — `premium-template-lab.html` (on-screen only, unchanged).
2. **PDF export** — `pdf-render.html` rendered by **Chromium via Playwright**.

Both build their pages from the **same** `buildPDF()` in `premium-template-lab.js`,
so the preview and the exported PDF can never diverge.

## Flow

```
Content Studio data (snapshot JSON)
        │
        ▼
   pdf-render.html        ← renders ONLY the 8 A4 pages, no app chrome
        │                   waits for fonts + images, sets window.__pdfReady
        ▼
 Playwright + Chromium     ← page.pdf({ format:'A4', margin:0, preferCSSPageSize })
        │
        ▼
     guide.pdf             ← 8 pages, no blanks, consistent margins
```

## `pdf-render.html`

A dedicated render target with **no header, buttons, scroll UI, overlay, or Safari
wrappers**. It sets `window.PDF_RENDER_MODE = true`, loads the same data + engine,
and the engine's render branch injects the A4 pages into `#pdfRenderRoot`. Page
geometry is fixed: `@page { size:A4; margin:0 }` and `.pdf-page { width:210mm;
height:297mm }`. Chromium honors this exactly → one A4 sheet per page.

You can open it directly in a browser to eyeball the output:
`pdf-render.html?dest=bali&style=magazine`
(On the phone, opened in the same browser as the Studio, it reads the same
localStorage content.)

## Generating the PDF (server-side / local)

```bash
npm i playwright
npx playwright install chromium

# seed content:
node generate-pdf.js bali magazine

# real Content Studio content (recommended):
node generate-pdf.js bali magazine snapshot.json season-bali.pdf
```

`snapshot.json` is the Content Studio data. It is the object stored in the browser
under localStorage key **`season_lab_content_v1`** (shape:
`{ destinations, hotels, media, brands, ts }`). `generate-pdf.js` injects it into
the headless page via `window.__CS_SNAPSHOT`, so no localStorage/origin issues.

To get the snapshot from a device, export that localStorage value to a `.json`
file (Bandar can wire a one-tap "export data" action, or the production client can
POST the snapshot to the PDF service).

## The system generates + downloads the PDF itself (no Safari)

`pdf-server.js` is a tiny zero-dependency Node service. It drives Chromium against
`pdf-render.html` and returns the PDF as a **direct download** — the browser never
prints and never opens a Share sheet.

```bash
CHROME_PATH=/opt/google/chrome/chrome PORT=8787 node pdf-server.js
# POST /export {dest, style, snapshot}  ->  downloads season-<dest>.pdf
```

`pdf-export-client.js` is the front-end side. Include it and call:

```js
// optional: point at your deployed service
window.PDF_SERVICE_URL = "https://pdf.yourhost.com";
exportSeasonPDF(currentDestId, currentStyle);   // sends Content Studio data, downloads the PDF
```

It reads the Content Studio snapshot from localStorage (`season_lab_content_v1`),
POSTs it to the service, receives the generated PDF, and triggers a direct download
via a blob URL. To replace the old Safari export, wire the existing export button to
`exportSeasonPDF(...)` instead of the print path (one-line swap; the old preview is
left intact as a fallback until the service is deployed).

## Deployment reality (important)

- **`pdf-render.html` is static** → host it on Netlify alongside the app.
- **`generate-pdf.js` needs Node + Chromium** → it is *not* Netlify-static. Options:
  - run locally / on a small Node box (simplest for now),
  - a serverless function (Netlify/Vercel/Lambda) using `playwright-core` +
    `@sparticuz/chromium` for the bundled Chromium binary,
  - a tiny Node service the production app calls with the snapshot, returns the PDF.

## Verified (real Chromium, end-to-end)

- **Chromium 141** rendered `pdf-render.html` to PDF: **8 A4 pages
  (594.96×841.92 pt), every page content, 0 blank pages.**
- The full service loop was exercised: `POST /export` with a Content Studio
  snapshot returned `200`, `content-type: application/pdf`,
  `content-disposition: attachment; filename="season-bali.pdf"`, an **8-page PDF** —
  i.e. the system generated and handed back the file with no Safari involvement.
- See `chromium-pipeline-proof.png`.

This is the actual production renderer, not a proxy.

## Success criteria → status

| Requirement | Status |
|---|---|
| 8 pages, not 16 | ✓ proven (8 `.pdf-page` → 8 PDF pages) |
| No blank pages | ✓ proven (0 blanks) |
| Consistent margins | ✓ `@page{margin:0}` + fixed A4 box |
| Images render | ✓ `printBackground:true`, waits for images |
| Matches A4 design | ✓ reuses the exact `buildPDF()` builders |
| Stable on iPhone/Safari/WhatsApp | ✓ rendering is server-side Chromium, not the phone |
