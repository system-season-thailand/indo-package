/* netlify/functions/travel-book-pdf.js
 * Server-side Chromium PDF for the NEW Travel Book module.
 *
 * Same proven stack as generate-pdf.js (playwright-core + @sparticuz/chromium,
 * pinned compatible in package.json). The site POSTs the booklet data here;
 * this injects it as window.__TB_DATA BEFORE scripts run, loads the deployed
 * travel-book/book.html, waits for window.__pdfReady, and returns the PDF.
 * Fixed A4 pages, no Safari, no browser auto-pagination.
 *
 * Reachable at:  /.netlify/functions/travel-book-pdf
 * Renders:       <site>/travel-book/book.html   (override with BOOK_PATH env)
 * Requires (package.json):  @sparticuz/chromium + playwright-core  (already present)
 * Requires netlify.toml functions config (repo root) + a BUILD deploy.
 */
const chromium = require("@sparticuz/chromium");
const playwright = require("playwright-core");

const CORS = {
  "access-control-allow-origin": "*",
  "access-control-allow-headers": "Content-Type",
  "access-control-allow-methods": "POST, OPTIONS"
};
const jsonHeaders = Object.assign({ "content-type": "application/json" }, CORS);

function isPdfTicket(t){
  var m=(t&&t.mime)||"", u=(t&&(t.url||t.ref))||"";
  return !!u && (m==="application/pdf" || u.indexOf("data:application/pdf")===0 || /\.pdf$/i.test((t&&t.filename)||""));
}
function dataUrlToBuf(u){ var i=String(u).indexOf(","); return Buffer.from(String(u).slice(i+1), "base64"); }

exports.handler = async function (event) {
  if (event.httpMethod === "OPTIONS") return { statusCode: 204, headers: CORS, body: "" };
  if (event.httpMethod !== "POST")
    return { statusCode: 405, headers: jsonHeaders, body: JSON.stringify({ error: "POST only" }) };

  let data;
  try { data = JSON.parse(event.body || "{}"); }
  catch (e) { return { statusCode: 400, headers: jsonHeaders, body: JSON.stringify({ error: "bad json body" }) }; }

  // Netlify injects the deployed site origin as process.env.URL.
  const site = (process.env.SITE_URL || process.env.URL || "").replace(/\/+$/, "");
  if (!site) return { statusCode: 500, headers: jsonHeaders, body: JSON.stringify({ error: "SITE_URL/URL not set" }) };
  const bookUrl = site + (process.env.BOOK_PATH || "/travel-book/book.html");

  let browser;
  try {
    browser = await playwright.chromium.launch({
      args: chromium.args, executablePath: await chromium.executablePath(), headless: true
    });
    const page = await browser.newPage({ viewport: { width: 794, height: 1123 } });
    // inject the booklet data BEFORE book.js runs -> no render race, no sample flash
    await page.addInitScript(function (d) { window.__TB_DATA = d; }, data);
    await page.goto(bookUrl, { waitUntil: "networkidle", timeout: 30000 });
    await page.waitForFunction("window.__pdfReady === true", { timeout: 25000 }).catch(function () {});
    const pdf = await page.pdf({
      format: "A4", printBackground: true, preferCSSPageSize: true,
      margin: { top: "0", right: "0", bottom: "0", left: "0" }
    });

    // Feature 2: append uploaded PDF tickets (image tickets already rendered by book.js)
    let finalBytes = pdf;
    try {
      const tks = (((data.meta || {}).flights || {}).tickets || []).filter(isPdfTicket);
      if (tks.length) {
        const { PDFDocument } = require("pdf-lib");
        const merged = await PDFDocument.load(pdf);
        for (const t of tks) {
          const src = await PDFDocument.load(dataUrlToBuf(t.url || t.ref));
          const pages = await merged.copyPages(src, src.getPageIndices());
          pages.forEach(function (p) { merged.addPage(p); });
        }
        finalBytes = await merged.save();
      }
    } catch (mErr) { finalBytes = pdf; }   // never fail the booklet over a bad ticket file

    return {
      statusCode: 200,
      headers: Object.assign({
        "content-type": "application/pdf",
        "content-disposition": 'attachment; filename="travel-book.pdf"',
        "cache-control": "no-store"
      }, CORS),
      body: Buffer.from(finalBytes).toString("base64"),
      isBase64Encoded: true
    };
  } catch (err) {
    return { statusCode: 500, headers: jsonHeaders,
             body: JSON.stringify({ error: "PDF generation failed: " + (err && err.message || String(err)) }) };
  } finally {
    if (browser) { try { await browser.close(); } catch (e) {} }
  }
};
