# Manual "Generate Travel Book PDF" — wiring guide

A staff-only button on the quotation page that manually generates the travel book PDF and
shows a signed download link when ready. **Manual only** — not wired to quote approval. No
changes to pricing, quotation, approval, snapshots, content sections, or the renderer.

## What's already deployed (backend, additive)
| Piece | Type | Auth | Purpose |
|---|---|---|---|
| `guide_render_enqueue(p_quotation, p_lang)` | RPC | `is_employee` / `service_role` | create/queue a job (idempotent) |
| `guide_render_status(p_quotation)` | RPC | `is_employee` | latest job's status + `storage_key`/`file_name` |
| `guide-download` | Edge Function (`verify_jwt`) | `is_employee` (re-checked) | mint a short-lived **signed** URL with `service_role` |

The Chromium **worker** must be running (see `guide-worker-README.md`) for jobs to move from
`queued` → `done`. Until a worker is up, jobs stay `queued`.

## Front-end: drop in `GenerateTravelBookButton.jsx`
Place it on the quotation page, in your existing actions area. It uses **your** authenticated
Supabase client, so it runs as the logged-in staff user; the `service_role` key never reaches
the browser.

```jsx
import GenerateTravelBookButton from "./GenerateTravelBookButton";

<GenerateTravelBookButton
  supabase={supabase}                 // your @supabase/supabase-js client (user session)
  quotationId={quotation.id}
  authorized={currentUser.isStaff}     // your existing staff/role check — gates visibility
  lang="ar"
  className="your-button-class"        // optional; omit to use the neutral built-in style
/>
```

Behavior:
1. **Generate** → `guide_render_enqueue` → starts polling.
2. Polls `guide_render_status` every 3s → shows **queued / rendering / done / failed**.
3. On **done** → a **Download** button calls the `guide-download` function → opens the signed
   URL (valid 1 hour). On **failed** → shows the error and a **Retry**.
4. Renders nothing unless `authorized` is true (defense-in-depth; the backend enforces
   `is_employee` regardless).

If your app isn't React, replicate the same three calls: `rpc('guide_render_enqueue')`,
`rpc('guide_render_status')`, and `functions.invoke('guide-download', { body:{ quotation_id }})`.

## Status values surfaced
`queued` → `rendering` → `done` (download enabled) — or `failed` (error + retry).
Mapping mirrors `pdf_render_jobs.status` exactly; the download link appears **only** on `done`.

## Validated here
- `guide_render_status` data path — rollback-safe sim: a `done` job returns
  `status=done, page_count=4, storage_key, file_name`.
- `guide-download` deployed **ACTIVE** with `verify_jwt=true`.
- Authorization posture matches your system (`is_employee`, same as `guide_render_enqueue`).

## Runs only in production (host + real staff session)
- The live `supabase.functions.invoke` / signed-URL mint and the end-to-end button flow run
  against your deployed app with a real staff JWT and the worker running.
- **Dependency to flag:** `is_employee` requires an **active `employees` row** for the signed-in
  user. The `employees` table is currently **empty**, so no user passes `is_employee` yet —
  staff must be provisioned for the button (and the rest of the role-gated app) to work. This is
  a pre-existing onboarding step, not part of this feature.

## First production smoke test
1. Provision/confirm a staff `employees` row for your test user.
2. Start the worker (`node guide-worker.js`).
3. On a quotation, click **Generate** → watch `queued` → `rendering` → `done`.
4. Click **Download** → the signed PDF opens. Confirm the job row is `done` with a `storage_key`
   under `guide-pdfs/`.
