/* =====================================================================
   pdf-server.js — server-side Chromium render for the Travel Book.
   ONE engine, ONE output: the same book.html + book.css + book.js that the
   editor previews is rendered by headless Chromium to a fixed-page A4 PDF.
   iPhone and desktop both POST the same data and get the same bytes. No
   Safari print, no browser auto-pagination.

   This variant is dependency-free and uses a system Chromium binary — ideal
   for a VPS / container / local run. (For Netlify serverless, use
   netlify/functions/travel-book-pdf.js, which uses @sparticuz/chromium.)

   Run:   CHROME_BIN=/path/to/chrome  node server/pdf-server.js
   API:   POST /pdf   body = the booklet data (book-shape JSON)  -> application/pdf
          GET  /*     serves the travel-book static files (book.html, etc.)
   ===================================================================== */
"use strict";
const http = require("http"), fs = require("fs"), path = require("path"),
      os = require("os"), crypto = require("crypto"), { spawn } = require("child_process");

const ROOT = path.resolve(__dirname, "..");                 // the travel-book dir
const PORT = process.env.PORT || 8090;
const CHROME = process.env.CHROME_BIN ||
  ["/opt/google/chrome/chrome", "/usr/bin/google-chrome", "/usr/bin/chromium", "/usr/bin/chromium-browser"]
    .find(p => { try { return fs.existsSync(p); } catch (e) { return false; } }) || "google-chrome";

const MIME = { ".html":"text/html; charset=utf-8", ".js":"text/javascript", ".css":"text/css",
  ".json":"application/json", ".jpg":"image/jpeg", ".jpeg":"image/jpeg", ".png":"image/png", ".svg":"image/svg+xml" };

function serveStatic(req, res) {
  let p = decodeURIComponent((req.url || "/").split("?")[0].split("#")[0]);
  if (p === "/" || p === "") p = "/book.html";
  const fp = path.join(ROOT, p);
  if (!fp.startsWith(ROOT) || !fs.existsSync(fp) || fs.statSync(fp).isDirectory()) { res.writeHead(404); return res.end("404"); }
  res.writeHead(200, { "Content-Type": MIME[path.extname(fp).toLowerCase()] || "application/octet-stream" });
  fs.createReadStream(fp).pipe(res);
}

/* render booklet data -> A4 fixed-page PDF buffer (deterministic).
   Async (spawn, not spawnSync) so this same server can serve book.html/css/js
   and the temp data file to the Chromium it launches. */
function renderPDF(data) {
  return new Promise(function (resolve, reject) {
    const id = crypto.randomBytes(6).toString("hex");
    const tmpData = path.join(ROOT, "__render_" + id + ".json");   // served, then deleted
    const outPdf = path.join(os.tmpdir(), "tb_" + id + ".pdf");
    try { fs.writeFileSync(tmpData, JSON.stringify(data)); } catch (e) { return reject(e); }
    const cleanup = function () { try { fs.unlinkSync(tmpData); } catch (e) {} try { fs.unlinkSync(outPdf); } catch (e) {} };
    // book.js reads ?data=<url>; no URL-length limit (just a filename), so base64 images are fine
    const url = "http://127.0.0.1:" + PORT + "/book.html?data=__render_" + id + ".json";
    const child = spawn(CHROME, [
      "--headless=new", "--no-sandbox", "--disable-gpu", "--no-pdf-header-footer",
      "--virtual-time-budget=20000", "--run-all-compositor-stages-before-draw",
      "--print-to-pdf=" + outPdf, url
    ], { stdio: ["ignore", "ignore", "pipe"] });
    let err = "";
    child.stderr.on("data", function (d) { err += d.toString(); });
    const killer = setTimeout(function () { try { child.kill("SIGKILL"); } catch (e) {} }, 70000);
    child.on("close", function () {
      clearTimeout(killer);
      let buf = null; try { if (fs.existsSync(outPdf)) buf = fs.readFileSync(outPdf); } catch (e) {}
      cleanup();
      if (buf && buf.length) resolve(buf);
      else reject(new Error("Chromium render produced no PDF. " + err.slice(0, 300)));
    });
    child.on("error", function (e) { clearTimeout(killer); cleanup(); reject(e); });
  });
}

/* Feature 2: append uploaded PDF tickets to the booklet (image tickets already
   rendered by book.js). Uses qpdf, which is dependency-free and robust. */
function isPdfTicket(t){
  var m=(t&&t.mime)||"", u=(t&&(t.url||t.ref))||"";
  return !!u && (m==="application/pdf" || u.indexOf("data:application/pdf")===0 || /\.pdf$/i.test((t&&t.filename)||""));
}
function dataUrlToBuf(u){ var i=String(u).indexOf(","); return Buffer.from(String(u).slice(i+1), "base64"); }
function mergeTickets(bookletBuf, data){
  return new Promise(function(resolve, reject){
    var tks=(((data.meta||{}).flights||{}).tickets||[]).filter(isPdfTicket);
    if(!tks.length) return resolve(bookletBuf);              // nothing to merge
    var id=crypto.randomBytes(6).toString("hex"), dir=os.tmpdir();
    var bookletPath=path.join(dir,"tbm_book_"+id+".pdf"), outPath=path.join(dir,"tbm_out_"+id+".pdf");
    var files=[bookletPath], all=[bookletPath,outPath];
    try{
      fs.writeFileSync(bookletPath, bookletBuf);
      tks.forEach(function(t,k){ var fp=path.join(dir,"tbm_tk_"+id+"_"+k+".pdf"); fs.writeFileSync(fp, dataUrlToBuf(t.url||t.ref)); files.push(fp); all.push(fp); });
    }catch(e){ return reject(e); }
    var clean=function(){ all.forEach(function(f){ try{fs.unlinkSync(f);}catch(e){} }); };
    // qpdf --empty --pages booklet t1 t2 ... -- out.pdf   (concatenate all pages, in order)
    var args=["--empty","--pages"].concat(files).concat(["--", outPath]);
    var ch=spawn("qpdf", args, { stdio:["ignore","ignore","pipe"] });
    var err=""; ch.stderr.on("data",function(d){ err+=d.toString(); });
    ch.on("close", function(code){
      var buf=null; try{ if(fs.existsSync(outPath)) buf=fs.readFileSync(outPath); }catch(e){}
      clean();
      if(buf&&buf.length) resolve(buf);
      else reject(new Error("ticket merge failed (qpdf "+code+"): "+err.slice(0,200)));
    });
    ch.on("error", function(e){ clean(); reject(e); });
  });
}

http.createServer((req, res) => {
  // CORS so the editor/book.html can call from anywhere during dev
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
  if (req.method === "OPTIONS") { res.writeHead(204); return res.end(); }

  if (req.method === "POST" && req.url.split("?")[0] === "/pdf") {
    let body = ""; req.on("data", c => { body += c; if (body.length > 60e6) req.destroy(); });
    req.on("end", () => {
      let data; try { data = JSON.parse(body || "{}"); }
      catch (e) { res.writeHead(400, { "Content-Type": "application/json" }); return res.end(JSON.stringify({ error: "bad json" })); }
      renderPDF(data).then(function (pdf) {
        return mergeTickets(pdf, data);              // Feature 2: append PDF tickets
      }).then(function (pdf) {
        res.writeHead(200, { "Content-Type": "application/pdf",
          "Content-Disposition": 'attachment; filename="travel-book.pdf"', "Content-Length": pdf.length });
        res.end(pdf);
      }).catch(function (e) {
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: String(e && e.message || e) }));
      });
    });
    return;
  }
  serveStatic(req, res);
}).listen(PORT, () => console.log("Travel Book PDF server → http://127.0.0.1:" + PORT + "  (Chrome: " + CHROME + ")"));
