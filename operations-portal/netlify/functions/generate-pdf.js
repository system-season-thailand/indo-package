/* netlify/functions/generate-pdf.js
 * Server-side Chromium PDF generation for the Season guide.
 *
 * Flow: the site POSTs { dest, style, snapshot } here. This function launches
 * a real headless Chromium (via @sparticuz/chromium), loads the deployed
 * pdf-render.html with the snapshot injected, waits for window.__pdfReady,
 * and returns the finished PDF as a direct download. No Safari, no print.
 *
 * Reachable at:  /.netlify/functions/generate-pdf
 *
 * Requires (package.json):  @sparticuz/chromium  +  playwright-core
 * Requires netlify.toml functions config (see file in repo root).
 * The static pdf-render.html and its 5 scripts must be deployed on the SAME site.
 */
const chromium = require("@sparticuz/chromium");
const playwright = require("playwright-core");

exports.handler = async function (event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Use POST" };
  }

  var body = {};
  try { body = JSON.parse(event.body || "{}"); } catch (e) {}
  var dest = body.dest || "bali";
  var style = body.style || "magazine";
  var snapshot = body.snapshot || null;

  // Netlify injects the deployed site URL as process.env.URL.
  var site = (process.env.SITE_URL || process.env.URL || "").replace(/\/+$/, "");
  if (!site) return { statusCode: 500, body: "SITE_URL/URL not set" };
  var renderUrl = site + "/pdf-render.html?dest=" +
    encodeURIComponent(dest) + "&style=" + encodeURIComponent(style);

  var browser;
  try {
    browser = await playwright.chromium.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath(),
      headless: true
    });
    var page = await browser.newPage();

    // Inject the saved Content Studio snapshot BEFORE any script runs, so
    // pdf-render.html's bootRender() picks up window.__CS_SNAPSHOT.
    if (snapshot) {
      await page.addInitScript(function (snap) { window.__CS_SNAPSHOT = snap; }, snapshot);
    }

    await page.goto(renderUrl, { waitUntil: "networkidle", timeout: 25000 });
    // Render target sets window.__pdfReady=true after fonts + all images load.
    await page.waitForFunction("window.__pdfReady === true", { timeout: 20000 }).catch(function () {});

    var pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      preferCSSPageSize: true,
      margin: { top: "0", right: "0", bottom: "0", left: "0" }
    });

    return {
      statusCode: 200,
      headers: {
        "content-type": "application/pdf",
        "content-disposition": 'attachment; filename="season-' + dest + '.pdf"',
        "cache-control": "no-store"
      },
      body: Buffer.from(pdf).toString("base64"),
      isBase64Encoded: true
    };
  } catch (err) {
    return { statusCode: 500, body: "PDF generation failed: " + (err && err.message || String(err)) };
  } finally {
    if (browser) { try { await browser.close(); } catch (e) {} }
  }
};
