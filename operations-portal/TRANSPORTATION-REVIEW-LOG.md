# Transportation File — Operational Review Log

**Scope:** Review only. No new features, no PDF, no WhatsApp, no automation.
**Method:** Ran the Transportation File against 18 real bookings — the 2 program-linked anchors + 16 generated Indonesia/Thailand bookings.

---

## 1. Run summary (18 bookings, 0 errors)

- **Program-linked (rich) — 2:** `BK-IDN-0001` → 16 movements, auto-split into **Indonesia-Main + Bali**; `BK-THA-0001` → ~13 movements, **Thailand** region. Full auto-pull, 0 missing items, whole trip assigned in 2 region clicks.
- **Booking-summary (thin) — 16:** each produced 2 movements (airport arrival + departure), 1 hotel, region detected correctly (a Bali-hotel booking landed in the Bali region), driver pool present. Assignable in 1 click.
- No crashes, no empty driver pools (all bookings were Indonesia/Thailand), region detection behaved.

---

## 2. Annoying steps for the employee

1. **No transportation worklist.** Files are opened one booking at a time from the bookings list; there's no "needs transportation / not-yet-ready" filter. Repetitive for 10–20/day.
2. **Save and Mark-Ready are separate clicks**, and assignments live in memory until Save — with no "unsaved changes" warning. Navigating away loses the work silently.
3. **Thin files still render full scaffolding** (hotels, missing items, reminders) that is mostly empty — visually noisy for a 2-line file.
4. **Added drivers don't require a phone** — a driver can be saved with no contact number, so the movement shows a name but no number.

---

## 3. Missing information (surfaced)

1. **Customer name missing on all 16 inline bookings** — the file shows "Missing". Significant for a driver handoff.
2. **Program movements missing on inline bookings** → only arrival + departure, and movement notes are empty ("—"). No daily tours / intercity for those bookings.
3. **No pickup time** on any movement (date + city only). Real dispatch usually needs a time.
4. **No flight number / ETA** on airport pickups; the arrival note is generic or empty.
5. **Pax count** exists on the booking but is not surfaced in the transportation file.

---

## 4. Exceptional cases

1. **Ready-to-Send allowed on an incomplete file (confirmed).** A thin file with no customer name and "program movements" missing can still be marked Ready once its one region has a driver — the gate checks **drivers only**, not data completeness. So an almost-empty file can be sent.
2. **Out-of-scope destination (Maldives — a stated market).** No drivers and no region defined. Under current rules it would (a) mislabel as "Indonesia Main" and (b) have an empty driver pool → never reach Ready. No Maldives bookings in the sample, but it is a live market.
3. **Coarse region taxonomy.** Only Bali is separated from "Indonesia Main (Jakarta / Puncak / Bandung)". Any other Indonesian area (e.g., Yogyakarta, Lombok) folds into Indonesia-Main, which may be geographically wrong for dispatch.
4. **Non-standard program numbers** (e.g., `Q-3208`) are correctly treated as no-program (inline). Expected; noted.

---

## 5. Input for the next-phase decision (nothing built — for your call)

In rough order of operational value:
- **Data dependency:** most real value assumes confirmed bookings carry a linked program (rich movements + customer name). Worth confirming with Bandar that production bookings resolve a program — the lab's thin bookings are seed artifacts, not a product defect.
- **Ready gate scope:** decide whether missing customer name / program movements should *block* Ready or only warn.
- **Region taxonomy:** keep the coarse 3-region model, or add more Indonesian regions + a Maldives region & drivers.
- **Dispatch fields:** decide if drivers need pickup time, flight no/ETA, and pax before "Send".
- **Small UX:** a transportation worklist filter + an unsaved-changes guard.

No feature, PDF, WhatsApp, or automation was added. Awaiting your decision on the next phase.
