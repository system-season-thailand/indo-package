# Guide Render Worker

`guide-worker.js` turns queued render jobs into PDFs:

```
guide_render_claim → guide_render_payload → Chromium PDF → upload to private guide-pdfs → guide_render_complete / guide_render_fail
```

Zero npm dependencies. Needs **Node 18+** (global `fetch`) and a **Chrome/Chromium** binary.
It reuses `guide-render.html` **unchanged** (injects only the live payload) and renders all
sections in content order (general, then each city's containers) — no fixed page count.

## Files
- `guide-worker.js` — the worker (this is what you run)
- `guide-render.html` — the validated render template (do not modify)

## Environment
| Var | Required | Default |
|---|---|---|
| `SUPABASE_URL` | yes | — |
| `SUPABASE_SERVICE_ROLE_KEY` | yes | — (server-side only; never expose to a browser) |
| `CHROME_PATH` | no | `/opt/google/chrome/chrome` |
| `GUIDE_TEMPLATE` | no | `./guide-render.html` |
| `GUIDE_BUCKET` | no | `guide-pdfs` |
| `POLL_MS` | no | `5000` |
| `WORKER_ID` | no | `worker-<host>-<pid>` |

## Run
```bash
export SUPABASE_URL="https://zoxcuzyfmfulkyqidhmw.supabase.co"
export SUPABASE_SERVICE_ROLE_KEY="…"     # service_role
node guide-worker.js            # long-running poller
node guide-worker.js --once     # claim+process one job, then exit (cron/testing)
```
Run it as an always-on service (systemd / Render / Railway / Fly.io / Cloud Run worker).
For throughput, run multiple instances — `guide_render_claim` uses `FOR UPDATE SKIP LOCKED`,
so concurrent workers never grab the same job. ~500/month (~17/day) is comfortable for one.

## Enqueue a job (upstream, staff/app)
The worker only *claims*. Jobs are created by `guide_render_enqueue` (idempotent), e.g. from a
"Generate guide" action or on quote approval:
```bash
curl -s -X POST "$SUPABASE_URL/rest/v1/rpc/guide_render_enqueue" \
  -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" -H "authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
  -H "content-type: application/json" \
  -d '{"p_quotation":"<quotation-uuid>","p_lang":"ar"}'
```

## Download the finished PDF (private bucket → signed URL)
`guide-pdfs` is private. The job's `storage_key` points at the object; mint a signed URL:
```bash
curl -s -X POST "$SUPABASE_URL/storage/v1/object/sign/<storage_key>" \
  -H "authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
  -H "content-type: application/json" -d '{"expiresIn":3600}'
```

## What is validated vs. deploy-only
**Validated here:**
- Worker DB contract — rollback-safe sim of `claim → payload(season.guide/v1, pages=4) → complete(files row, done)` + fail-path, against the live DB.
- Render core — Chromium renders the real payload (payload-only injection, the worker's exact production HTML) to **4 pages, 0 blanks**; `pageCount()` agrees (4).
- Image sourcing — production `<img src>` resolves to the real `travel-media` Storage URL.
- `guide-worker.js` passes `node --check`.

**Runs only on the deploy host (needs network + service key):**
- The live `fetch` calls to Supabase REST/Storage, the actual Chromium fetch of remote
  Storage image URLs, and the PDF upload. These can't run in the offline build sandbox.
  Use `--once` on the host for the first end-to-end smoke test (enqueue one job, run the
  worker, confirm a PDF lands in `guide-pdfs` and the job flips to `done`).
