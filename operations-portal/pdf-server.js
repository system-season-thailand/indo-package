/* pdf-server.js — Season PDF export service.
 *
 * The SYSTEM generates the PDF itself and returns it as a direct download.
 * No browser print. No Share -> PDF. No Safari. Rendering is done by Chromium
 * (the same engine Playwright drives) against /pdf-render.html.
 *
 * Zero npm dependencies — it drives the system Chromium binary directly, so it
 * runs anywhere a Chrome/Chromium is installed. (To use Playwright instead, see
 * generate-pdf.js; it produces the identical result.)
 *
 * Run:
 *   CHROME_PATH=/opt/google/chrome/chrome PORT=8787 node pdf-server.js
 *
 * Endpoints:
 *   POST /export   body: { dest, style, snapshot }   -> downloads season-<dest>.pdf
 *   GET  /export?dest=bali&style=magazine            -> demo (built-in seed data)
 */

const http = require("http");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { execFile } = require("child_process");

const ROOT = __dirname;
const PORT = process.env.PORT || 8787;
const CHROME = process.env.CHROME_PATH || firstExisting([
  "/opt/google/chrome/chrome",
  "/usr/bin/chromium", "/usr/bin/chromium-browser", "/usr/bin/google-chrome",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
]);
const MIME = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".svg": "image/svg+xml" };

function firstExisting(list) { for (const p of list) { try { if (fs.existsSync(p)) return p; } catch (e) {} } return "chromium"; }

/* Build a one-off copy of pdf-render.html with the snapshot inlined (so relative
 * scripts still resolve), have Chromium print it to PDF, return the bytes. */
function renderPDF(dest, style, snapshot, cb) {
  let base;
  try { base = fs.readFileSync(path.join(ROOT, "pdf-render.html"), "utf8"); }
  catch (e) { return cb(new Error("pdf-render.html not found")); }
  const inject = snapshot ? "<script>window.__CS_SNAPSHOT=" + JSON.stringify(snapshot) + ";</script>" : "";
  const html = base.replace("</head>", inject + "</head>");
  const token = Date.now() + "-" + Math.random().toString(36).slice(2);
  const tmpHtml = path.join(ROOT, "__render_" + token + ".html");
  const tmpPdf = path.join(os.tmpdir(), "season_" + token + ".pdf");
  fs.writeFileSync(tmpHtml, html);
  const url = "file://" + tmpHtml + "?dest=" + encodeURIComponent(dest) + "&style=" + encodeURIComponent(style);
  const args = [
    "--headless=new", "--no-sandbox", "--disable-gpu",
    "--virtual-time-budget=12000", "--run-all-compositor-stages-before-draw",
    "--no-pdf-header-footer", "--print-to-pdf=" + tmpPdf, url
  ];
  execFile(CHROME, args, { timeout: 60000 }, (err) => {
    fs.unlink(tmpHtml, () => {});
    if (err && !fs.existsSync(tmpPdf)) return cb(err);
    fs.readFile(tmpPdf, (e, buf) => { fs.unlink(tmpPdf, () => {}); e ? cb(e) : cb(null, buf); });
  });
}

function sendPDF(res, dest, buf) {
  res.writeHead(200, {
    "content-type": "application/pdf",
    "content-disposition": 'attachment; filename="season-' + dest + '.pdf"',
    "access-control-allow-origin": "*"
  });
  res.end(buf);
}

const server = http.createServer((req, res) => {
  const u = new URL(req.url, "http://x");
  if (u.pathname === "/export") {
    if (req.method === "OPTIONS") {
      res.writeHead(204, { "access-control-allow-origin": "*", "access-control-allow-headers": "content-type", "access-control-allow-methods": "POST,GET,OPTIONS" });
      return res.end();
    }
    if (req.method === "POST") {
      let body = ""; req.on("data", (c) => { body += c; if (body.length > 60e6) req.destroy(); });
      req.on("end", () => {
        let p = {}; try { p = JSON.parse(body || "{}"); } catch (e) {}
        const dest = p.dest || "bali", style = p.style || "magazine";
        renderPDF(dest, style, p.snapshot || null, (err, buf) => {
          if (err) { res.writeHead(500, { "content-type": "text/plain", "access-control-allow-origin": "*" }); return res.end("PDF error: " + err.message); }
          sendPDF(res, dest, buf);
        });
      });
      return;
    }
    if (req.method === "GET") {
      const dest = u.searchParams.get("dest") || "bali", style = u.searchParams.get("style") || "magazine";
      return renderPDF(dest, style, null, (err, buf) => {
        if (err) { res.writeHead(500); return res.end("PDF error: " + err.message); }
        sendPDF(res, dest, buf);
      });
    }
  }
  // Optional static hosting of the app + render page from the same origin.
  let fp = u.pathname === "/" ? path.join(ROOT, "premium-template-lab.html") : path.join(ROOT, decodeURIComponent(u.pathname));
  if (!fp.startsWith(ROOT) || !fs.existsSync(fp) || fs.statSync(fp).isDirectory()) { res.writeHead(404); return res.end("not found"); }
  res.writeHead(200, { "content-type": MIME[path.extname(fp)] || "application/octet-stream" });
  fs.createReadStream(fp).pipe(res);
});

server.listen(PORT, () => {
  console.log("Season PDF service  ->  http://localhost:" + PORT);
  console.log("  chrome: " + CHROME);
  console.log("  POST /export {dest,style,snapshot}  downloads season-<dest>.pdf");
});
