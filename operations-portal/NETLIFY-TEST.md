# Netlify deploy + test — توليد PDF تجريبي (Chromium)

Patched restored lab. Only `pdf-export-client.js` changed. The «توليد PDF (خادم)» action
renders the EXISTING magazine Template Engine output via server-side Chromium.

## Important: which deploy makes the button work
The button uses a **Netlify Function** that runs Chromium. So deploy with the **CLI or Git**
(which installs the function's deps), NOT plain drag-and-drop.
- ✅ Netlify CLI / Git build → function runs → button returns a real PDF.
- ⚠️ Drag-and-drop static → lab + on-screen preview work, but «توليد PDF (خادم)» has no function;
  the patched client now shows a clear message saying exactly that.

## Deploy (CLI — recommended)
```
cd season-b2b-lab
npm install                       # installs @sparticuz/chromium + playwright-core for the function
npx netlify deploy --build --prod # or connect the folder as a Git repo in Netlify
```
(Git: push the folder to a repo, "Add new site" → import; Netlify reads netlify.toml and builds
the function automatically.)

## Test (step by step)
1. **Upload/deploy** to Netlify as above. Open the site URL (it opens the operations portal;
   open the Template Engine: `…/premium-template-lab.html`).
2. Pick a destination, then click **«توليد PDF تجريبي»** → the preview overlay opens.
3. Click **«توليد PDF (خادم)»**.
4. The Netlify Function launches Chromium, renders `/pdf-render.html?dest=…&style=magazine`
   (the same `buildPDF` pages as the preview), and the browser **downloads `season-<dest>.pdf`**.
5. Open the PDF and verify:
   - **8 A4 pages**
   - **0 blank pages**
   - matches the on-screen magazine preview.

If you instead see an alert, it now states the cause (e.g. "خدمة توليد PDF غير منشورة…" =
deploy the function, don't drag-and-drop).

## Same result without Netlify (local equivalence proof)
The function and these commands all render the identical `pdf-render.html` via Chromium:
```
npm i playwright && npx playwright install chromium
node generate-pdf.js bali magazine          # -> season-guide-bali.pdf (8 pages, 0 blanks)
# or a host service:
CHROME_PATH=/path/to/chrome node pdf-server.js   # POST /export {dest,style,snapshot}
```
`season-magazine-sample.pdf` in this package was produced this exact way: 8 pages, 0 blanks.
