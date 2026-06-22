# Phase 6 — Invoice Center (Closeout)

A new **مركز الفواتير · Invoice Center** in the sidebar. Three invoice types, all auto-generated from the Confirmed Booking (+ program) and the Transportation File. Employees never create an invoice by hand: open the booking → Generate.

## Two honest flags (carried from the data, not hidden)
- **Operations Detail prices:** the program data has hotels, room types, room counts, and nights — but **no prices anywhere** (pricing lives in the protected Pricing Engine, untouched). So hotel/flight price cells are **operations-editable** and clearly flagged on screen, rather than fabricated.
- **"Matches the sent Excel model":** I don't have your Excel template, so the Operations layout is a reasonable order (hotels → flights → transport → services) marked **provisional until you attach the Excel** so I can align it exactly.

## 1 · Invoice Center (sidebar hub)
Per-booking rows with a status chip + Generate/Open button for each of the three invoice types, plus a simple search.

## 2 · Sales Invoice (company-facing)
Auto from the Confirmed Booking + program: booking no, company, customer, destination, **hotels + nights**, domestic flights, **transportation (program-level — no driver names)**, additional services, and the booking total. **Driver names and operational costs are never shown.** Print + PDF.

## 3 · Operations Detail Invoice (internal)
Auto structure from Confirmed Booking + Transportation File: hotels · rooms · nights · meal plan · **price (operations-editable)**, domestic flights (editable price), transportation + services **pulled from the existing Transportation Invoice**, and an auto Grand Total. Print + PDF.

## 4 · Transportation Invoice
The existing Phase-5 invoice, unchanged — opened directly from the Invoice Center (and still from the file). Requires a transportation file first.

## 5–6 · PDF / Print / Storage
Every invoice has Print + Export PDF (no manual editing). Saved with statuses **Draft / Generated / Sent / Cancelled** and a **creation date**; re-open / re-print / re-export anytime.

## 7 · Daily Boards integration
The three invoice counters now aggregate **all** invoice types (sales + operations + transportation): Invoices Generated / Pending / Missing.

## 8 · Forecast
The Forecast tab now also computes **customers** per date (distinct) alongside passengers and bookings, per destination.

## 9 · Employee experience
One screen, one click per invoice. No manual creation, no duplicate entry.

## Acceptance — all PASS
Invoice Center in sidebar ✅ · hub shows 3 types per booking ✅ · Sales auto-pulled, no driver names, total from booking ✅ · Sales statuses Draft→Generated→Sent + created date ✅ · Sales PDF (logo, booking, total, driver-free) ✅ · Operations structure + editable prices + grand total ✅ · Operations flagged ✅ · Transportation link opens existing module ✅ · boards counters count all types ✅ · forecast customers ✅ · protected modules untouched ✅.

## Files added
- `invoice-center.html` / `.js` / `.css` — hub + Sales + Operations invoices.
- `invoice-store.js` — `InvoiceStore` for sales + operations (statuses + created date).

## Files modified (additive only)
- `operations-portal-sample-data.js` — Invoice Center sidebar item.
- `transportation-boards.js` / `.html` — invoice counters across all types; **Forecast customers count**.

## Protected — untouched (verified)
Travel Book, Transportation Generator, Driver Assignment, Confirmed Booking logic, Pricing Engine, Program Source.

## Next input needed from you
1. The **Excel template** for the Operations Detail Invoice (to match column order exactly).
2. The **pricing source** for hotel/flight prices (or confirm operations enters them).
