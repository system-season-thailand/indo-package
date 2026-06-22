/* generate-pdf.js — server-side PDF generation (Playwright + Chromium).
 *
 * Replaces iOS Safari "Save as PDF" entirely. Chromium honors @page{margin:0}
 * and CSS page sizing, so /pdf-render.html produces exactly 8 A4 pages with no
 * blank pages and consistent margins — identical on any phone, because the
 * phone is no longer doing the rendering.
 *
 * Flow:
 *   Content Studio snapshot (JSON)  ->  pdf-render.html  ->  Chromium  ->  PDF
 *
 * Usage:
 *   node generate-pdf.js [dest] [style] [snapshot.json] [out.pdf]
 * Examples:
 *   node generate-pdf.js                              # bali / magazine / seed data
 *   node generate-pdf.js bali magazine snapshot.json season-bali.pdf
 *
 * Install once:
 *   npm i playwright
 *   npx playwright install chromium
 */

const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");

(async () => {
  const dest = process.argv[2] || "bali";
  const style = process.argv[3] || "magazine";
  const snapshotPath = process.argv[4] || null;     // optional CS data snapshot
  const out = process.argv[5] || `season-guide-${dest}.pdf`;

  const renderFile = path.resolve(__dirname, "pdf-render.html");
  if (!fs.existsSync(renderFile)) throw new Error("pdf-render.html not found next to this script.");
  const url = "file://" + renderFile + `?dest=${encodeURIComponent(dest)}&style=${encodeURIComponent(style)}`;

  const browser = await chromium.launch();           // headless Chromium
  try {
    const page = await browser.newPage();

    // Pass the Content Studio data to the headless page. The render page reads
    // window.__CS_SNAPSHOT first (works on any origin, no localStorage needed).
    // Omit the snapshot to render the built-in seed content.
    if (snapshotPath) {
      const snap = fs.readFileSync(path.resolve(snapshotPath), "utf8");
      JSON.parse(snap); // validate it is JSON before injecting
      await page.addInitScript(`window.__CS_SNAPSHOT = ${snap};`);
    }

    await page.goto(url, { waitUntil: "load" });

    // The render page sets this true only after fonts AND images have settled.
    await page.waitForFunction("window.__pdfReady === true", { timeout: 20000 });

    const err = await page.getAttribute("html", "data-pdf-error");
    if (err) throw new Error("Render error: " + err);

    await page.pdf({
      path: out,
      format: "A4",
      printBackground: true,
      preferCSSPageSize: true,                        // honor @page{size:A4}
      margin: { top: "0", right: "0", bottom: "0", left: "0" }
    });

    console.log("✓ Wrote", out);
  } finally {
    await browser.close();
  }
})().catch((e) => { console.error("✗", e.message); process.exit(1); });
