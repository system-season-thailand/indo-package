#!/usr/bin/env node
/* guide-worker.js — Season Destination Guide render worker.
 *
 * Loop:  guide_render_claim -> guide_render_payload -> Chromium PDF
 *        -> upload to private guide-pdfs bucket -> guide_render_complete / guide_render_fail
 *
 * Zero npm dependencies. Requires Node 18+ (global fetch) and a Chrome/Chromium binary.
 * Reuses guide-render.html UNCHANGED (template is not modified by the worker).
 *
 * Env:
 *   SUPABASE_URL                 e.g. https://zoxcuzyfmfulkyqidhmw.supabase.co
 *   SUPABASE_SERVICE_ROLE_KEY    service_role key (server-side only; never ship to a browser)
 *   CHROME_PATH                  default /opt/google/chrome/chrome
 *   GUIDE_TEMPLATE               default ./guide-render.html
 *   GUIDE_BUCKET                 default guide-pdfs
 *   POLL_MS                      default 5000
 *   WORKER_ID                    default worker-<host>-<pid>
 * Flags: --once  (claim+process a single job then exit; for testing/cron)
 */
"use strict";
const { execFile } = require("child_process");
const { promisify } = require("util");
const execFileP = promisify(execFile);
const fs = require("fs/promises");
const os = require("os");
const path = require("path");
const crypto = require("crypto");

const SUPABASE_URL = need("SUPABASE_URL");
const SERVICE_KEY  = need("SUPABASE_SERVICE_ROLE_KEY");
const CHROME_PATH  = process.env.CHROME_PATH   || "/opt/google/chrome/chrome";
const TEMPLATE     = process.env.GUIDE_TEMPLATE|| path.join(__dirname, "guide-render.html");
const BUCKET       = process.env.GUIDE_BUCKET  || "guide-pdfs";
const WORKER_ID    = process.env.WORKER_ID     || ("worker-" + os.hostname() + "-" + process.pid);
const POLL_MS      = parseInt(process.env.POLL_MS || "5000", 10);
const ONCE         = process.argv.includes("--once");

function need(k){ const v = process.env[k]; if (!v){ console.error("Missing env "+k); process.exit(1); } return v; }
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function rpc(fn, body){
  const r = await fetch(SUPABASE_URL + "/rest/v1/rpc/" + fn, {
    method: "POST",
    headers: { apikey: SERVICE_KEY, authorization: "Bearer " + SERVICE_KEY, "content-type": "application/json" },
    body: JSON.stringify(body || {})
  });
  const t = await r.text();
  if (!r.ok) throw new Error("rpc " + fn + " " + r.status + ": " + t);
  return t ? JSON.parse(t) : null;
}

async function uploadPdf(key, buf){
  const r = await fetch(SUPABASE_URL + "/storage/v1/object/" + BUCKET + "/" + key, {
    method: "POST",
    headers: { authorization: "Bearer " + SERVICE_KEY, "content-type": "application/pdf", "x-upsert": "true" },
    body: buf
  });
  if (!r.ok) throw new Error("upload " + r.status + ": " + (await r.text()));
}

// content-driven page count: one page per section, in order (general, then each city's containers)
function pageCount(payload){
  const tb = payload.travel_book || {};
  let n = (tb.general || []).length;
  (tb.cities || []).forEach(c => { n += (c.containers || []).length; });
  return n;
}

async function renderPdf(payload){
  const tmpl = await fs.readFile(TEMPLATE, "utf8");
  // inject ONLY the live payload — same as the validated proof; no template changes
  const html = tmpl.replace("</head>", "<script>window.__GUIDE_PAYLOAD=" + JSON.stringify(payload) + ";</script></head>");
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), "guide-"));
  const htmlPath = path.join(dir, "job.html");
  const pdfPath  = path.join(dir, "job.pdf");
  try {
    await fs.writeFile(htmlPath, html, "utf8");
    await execFileP(CHROME_PATH, [
      "--headless=new", "--no-sandbox", "--disable-gpu",
      "--virtual-time-budget=15000", "--run-all-compositor-stages-before-draw",
      "--no-pdf-header-footer", "--print-to-pdf=" + pdfPath, "file://" + htmlPath
    ], { timeout: 60000 });
    return await fs.readFile(pdfPath);
  } finally {
    fs.rm(dir, { recursive: true, force: true }).catch(() => {});
  }
}

async function processJob(job){
  const lang = job.lang || "ar";
  const payload = await rpc("guide_render_payload", { p_quotation: job.quotation_id, p_lang: lang });
  if (!payload || payload.error) throw new Error("payload: " + JSON.stringify(payload && payload.error));

  const pdf   = await renderPdf(payload);
  const pages = pageCount(payload);
  const dest  = (payload.destination && payload.destination.code) || "NA";
  const ref   = (payload.quotation && payload.quotation.reference) || job.quotation_id;
  const key   = dest + "/" + ref + "/" + job.id + ".pdf";          // path inside the bucket
  const hash  = crypto.createHash("md5").update(JSON.stringify(payload)).digest("hex");

  await uploadPdf(key, pdf);                                        // -> private guide-pdfs bucket
  await rpc("guide_render_complete", {
    p_job: job.id, p_storage_key: BUCKET + "/" + key,
    p_file_name: ref + "-guide.pdf", p_page_count: pages, p_config_hash: hash
  });
  console.log("DONE  job=" + job.id + " ref=" + ref + " pages=" + pages + " key=" + BUCKET + "/" + key);
}

async function loop(){
  console.log("guide-worker up: " + WORKER_ID + " -> " + SUPABASE_URL + " (bucket " + BUCKET + ")");
  for (;;){
    let job = null;
    try { job = await rpc("guide_render_claim", { p_worker: WORKER_ID }); }
    catch (e){ console.error("claim error: " + e.message); if (ONCE) return; await sleep(POLL_MS); continue; }

    if (!job){ if (ONCE){ console.log("no queued jobs"); return; } await sleep(POLL_MS); continue; }

    console.log("CLAIM job=" + job.id + " quotation=" + job.quotation_id + " attempt=" + job.attempts);
    try {
      await processJob(job);
    } catch (e){
      console.error("FAIL  job=" + job.id + ": " + e.message);
      try { await rpc("guide_render_fail", { p_job: job.id, p_error: String(e.message).slice(0, 500) }); }
      catch (e2){ console.error("fail-report error: " + e2.message); }
    }
    if (ONCE) return;
  }
}

loop().catch(e => { console.error("fatal:", e); process.exit(1); });
