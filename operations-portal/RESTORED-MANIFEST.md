# Season B2B Lab — Restored (full, intact)

This is the **original lab, exactly as it was** — every screen, design language, card, editorial
layout, Content Studio, and the magazine Template Engine. **The only change from the original is
that the broken Safari/iPhone PDF export was replaced with the Chromium server-side export.**
Nothing was rebuilt, simplified, or removed.

Open `index.html` (it forwards to `operations-portal.html`, the lab portal). For Netlify, drag the
whole folder in — `_redirects` and `index.html` route `/` to the portal.

## Entry / portal
- `index.html`, `operations-portal.html` (+ `.css/.js/-sample-data.js/-architecture-notes.md`)
- `_redirects`, `netlify.toml`, `package.json`, `README-LAB.md`

## Flagship visual work (unchanged)
- **Content Studio** — `content-studio-lab.html / .css / .js` + `content-studio-lab-sample-data.js`
  (154 KB of editorial sample content) + `content-studio-lab-integration-notes.md` + `content-store.js`
- **Magazine Template Engine** — `premium-template-lab.html / .css / .js` +
  `premium-template-lab-sample-data.js` + `premium-template-lab-integration-notes.md` + `image-resolver.js`

## All lab screens (unchanged — each has .html/.css/.js/-sample-data.js/-integration-notes.md)
- `management-dashboard`
- `companies-management`
- `booking-pipeline`
- `confirmed-bookings-manager`
- `operations-workspace`
- `quotation-status-manager`
- `voucher-experience-lab`

## The ONLY change: Chromium PDF export (added on top of the original)
Replaces the old Safari/iPhone "Share → Print → PDF" path (which produced blank/duplicated pages):
- `pdf-export-client.js` — client hook behind the existing "توليد PDF تجريبي" button; posts the
  current Content Studio snapshot to the render service and downloads the PDF directly (Safari never
  prints).
- `netlify/functions/generate-pdf.js` — same-site serverless endpoint for the export.
- `pdf-server.js` — standalone Chromium render host (alternative to the Netlify function).
- `pdf-render.html`, `generate-pdf.js`, `pdf-render-README.md` — the render template + helpers.
- `guide-render.html`, `guide-worker.js`, `guide-worker-README.md`, `guide-payload.json`,
  `GenerateTravelBookButton.jsx`, `manual-button-wiring.md`, `DEPLOY-pdf-pipeline.md` — the
  quotation-based guide render pipeline (queue worker + button) built on the same Chromium approach.

## Scratch artifacts (from the render proof; harmless, can ignore/delete)
- `__render_prod.html`, `__render_visual.html`, `media_5fe43091_standin.jpg`

## What did NOT change
No UI, sections, design languages, cards, editorial layouts, or preview tools were removed or
simplified. The simplified `demo-static` package was a **separate** folder and is **not** part of
this lab — it never modified anything here.
