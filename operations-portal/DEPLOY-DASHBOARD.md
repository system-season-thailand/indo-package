# Deploy — the entry point MUST be the dashboard (read this first)

## What went wrong before
The site was deployed with the **`travel-book/` subfolder as the publish root**.
That makes `travel-book/index.html` (the module's own standalone launcher) become
the site homepage, so the URL opened the **Travel Book editor directly** and
skipped the whole Operations dashboard. It also breaks the PDF export, because the
render function lives at the **repo root** (`/.netlify/functions/travel-book-pdf`),
not inside `travel-book/`.

## The rule
**Publish the repository ROOT — never the `travel-book/` subfolder.**

- Entry point (homepage): `operations-portal.html` (the dashboard shell).
  `index.html` and `_redirects` already redirect `/` → `operations-portal.html`.
- Travel Book is a **module inside** that dashboard. It is already registered in
  the sidebar (`operations-portal-sample-data.js` → id `travel-book`, label
  «دليل الرحلة») and loads `travel-book/editor.html` in an iframe — the same
  mechanism every other module uses.
- The PDF function stays at the root: `netlify/functions/travel-book-pdf.js`,
  reachable at `/.netlify/functions/travel-book-pdf` (set in `travel-book/config.js`).

## Correct Netlify settings
`netlify.toml` (already at the root) is correct as-is:

    [build]
      publish = "."                      # repo ROOT, not travel-book/
      functions = "netlify/functions"

- **Base directory:** repo root (leave empty / `/`).
- **Publish directory:** `.` (repo root). **Do NOT set this to `travel-book`.**
- **Functions directory:** `netlify/functions`.
- Must be a **build deploy** (Git-connected or `netlify deploy --build`), not
  drag-and-drop, so the function's node deps bundle. See `TRAVEL-BOOK-INTEGRATION.md`.

## How to verify after deploy
1. Open the site URL → you should land on the **dashboard** (sidebar with لوحة الإدارة،
   حالات العروض، مساحة العمليات، الحجوزات المؤكّدة، مسار الحجوزات، الشركات، التقارير،
   الإعدادات + دليل الرحلة).
2. Click **دليل الرحلة** → the Travel Book editor opens **inside** the dashboard.
3. Destination dropdown → **إندونيسيا** (21-page program) and **تايلاند**
   (18-page program) both load. Export PDF works (function returns 405 on a plain
   GET = it is live).

The `travel-book/` folder is still self-contained and can be opened on its own for
development (`travel-book/index.html`), but that standalone launcher is **not** the
production entry point — the dashboard is.
