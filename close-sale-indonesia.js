/* -----------------------
   Close-sell - Rewritten
   Option A: Jan after Dec = next year
   ----------------------- */

const monthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const arabicMonths = {
  "يناير": 0, "فبراير": 1, "مارس": 2, "أبريل": 3,
  "مايو": 4, "يونيو": 5, "يوليو": 6, "أغسطس": 7,
  "سبتمبر": 8, "أكتوبر": 9, "نوفمبر": 10, "ديسمبر": 11
};

// In-memory cache: tableNameNormalized -> [{ roomType, availabilityPairs: [{m,d},...] }, ...]
const closeSellHotelDataCache = new Map();
let hasFetchedCloseSellData = false;

/* -----------------------
   Helpers
   ----------------------- */
const normalizeName = s => (s || "").toString().trim().replace(/\s+/g, " ").normalize("NFKC").toLowerCase();

const utcMidnight = d => Date.UTC(d.getFullYear(), d.getMonth(), d.getDate());
const msPerDay = 24 * 60 * 60 * 1000;

function safeGetValue(id) {
  return (document.getElementById(id)?.value || "").trim();
}

/* Format consecutive Date[] into human ranges like "22-26 Dec 2026, 2 Jan 2027" */
function formatDateRanges(dates) {
  if (!Array.isArray(dates) || dates.length === 0) return "";

  const sorted = dates.map(d => new Date(d)).sort((a, b) => a - b);

  const ranges = [];
  let start = sorted[0];
  let end = sorted[0];

  for (let i = 1; i < sorted.length; i++) {
    const cur = sorted[i];
    const prev = sorted[i - 1];

    if (utcMidnight(cur) - utcMidnight(prev) === msPerDay) {
      end = cur;
    } else {
      ranges.push([start, end]);
      start = cur;
      end = cur;
    }
  }
  ranges.push([start, end]);

  return ranges.map(([s, e]) => {
    const Sd = s.getDate(), Sm = s.getMonth(), Sy = s.getFullYear();
    const Ed = e.getDate(), Em = e.getMonth(), Ey = e.getFullYear();
    const ms = monthNames[Sm].slice(0, 3), me = monthNames[Em].slice(0, 3);

    if (Sy === Ey) {
      if (Sm === Em) {
        return Sd === Ed ? `${Sd} ${ms} ${Sy}` : `${Sd}-${Ed} ${ms} ${Sy}`;
      } else {
        return `${Sd} ${ms} - ${Ed} ${me} ${Sy}`;
      }
    } else {
      return `${Sd} ${ms} ${Sy} - ${Ed} ${me} ${Ey}`;
    }
  }).join(", ");
}

/* -----------------------
   Parsers
   ----------------------- */

/*
 parseArabicDateUniversal:
 - Accepts "25 ديسمبر" or "3 يناير 2026"
 - If year included, uses it.
 - If year not included and referenceDate provided, use referenceDate to decide year rollover:
     if parsedMonth < referenceDate.month -> year = referenceDate.year + 1
     else year = referenceDate.year
 - If year not included and no referenceDate -> use current year
 Returns Date object or null if invalid
*/
function parseArabicDateUniversal(inputStr, referenceDate = null) {
  if (!inputStr || typeof inputStr !== "string") return null;
  const parts = inputStr.trim().split(/\s+/);
  if (parts.length < 2) return null;

  const day = parseInt(parts[0], 10);
  if (!Number.isInteger(day)) return null;

  // month could be multiple words but in Arabic months are single-word; safe to use parts[1]
  const monthToken = parts[1];
  const monthIndex = arabicMonths[monthToken];
  if (monthIndex === undefined) return null;

  let year;
  if (parts.length >= 3) {
    // third token should be year (e.g., 2026)
    year = parseInt(parts[2], 10);
    if (!Number.isInteger(year)) return null;
  } else if (referenceDate instanceof Date) {
    year = referenceDate.getFullYear();
    if (monthIndex < referenceDate.getMonth()) year += 1; // Option A
  } else {
    year = new Date().getFullYear();
  }

  const res = new Date(year, monthIndex, day);
  if (isNaN(res.getTime())) return null;
  return res;
}

/* parseArabicDayMonth: returns { day, monthIndex } or null.
   Used when we want day+month without assigning year yet. */
function parseArabicDayMonth(inputStr) {
  if (!inputStr || typeof inputStr !== "string") return null;
  const parts = inputStr.trim().split(/\s+/);
  if (parts.length < 2) return null;
  const day = parseInt(parts[0], 10);
  const monthToken = parts[1];
  const monthIndex = arabicMonths[monthToken];
  if (!Number.isInteger(day) || monthIndex === undefined) return null;
  return { day, monthIndex };
}

/* -----------------------
   Availability parsing
   -----------------------
   parseHotelAvailabilityToPairs(rangeString, monthName)
   returns array of { monthIndex, day } pairs with no year
*/
function parseHotelAvailabilityToPairs(rangeString, monthName) {
  const out = [];
  if (!rangeString || typeof rangeString !== "string") return out;
  const monthIndex = monthNames.indexOf(monthName);
  if (monthIndex === -1) return out;

  const parts = rangeString.split(",");
  for (let p of parts) {
    p = p.trim();
    if (!p) continue;
    if (p.includes("-")) {
      const [sStr, eStr] = p.split("-").map(x => x.trim());
      const s = parseInt(sStr, 10);
      const e = parseInt(eStr, 10);
      if (!Number.isInteger(s) || !Number.isInteger(e) || s > e) continue;
      for (let d = s; d <= e; d++) out.push({ monthIndex, day: d });
    } else {
      const d = parseInt(p, 10);
      if (!Number.isInteger(d)) continue;
      out.push({ monthIndex, day: d });
    }
  }
  return out;
}

/* -----------------------
   Ensure cache from Supabase RPC
   - Stores month/day pairs; no year
   ----------------------- */
async function ensureCloseSellCache() {
  if (hasFetchedCloseSellData) return;

  try {
    const { data, error } = await supabase.rpc("get_all_public_tables_data");
    if (error) {
      console.error("Supabase RPC error:", error);
      return;
    }

    for (const [tableName, rows] of Object.entries(data || {})) {
      if (!Array.isArray(rows)) continue;
      const structured = [];

      rows.forEach(row => {
        const roomType = row["Room Type"] || row.roomType || "Room";
        const pairs = [];

        monthNames.forEach(month => {
          const rangeStr = row[month];
          if (rangeStr && typeof rangeStr === "string" && rangeStr.trim() !== "") {
            pairs.push(...parseHotelAvailabilityToPairs(rangeStr, month));
          }
        });

        structured.push({ roomType, availabilityPairs: pairs });
      });

      closeSellHotelDataCache.set(normalizeName(tableName), structured);
    }

    hasFetchedCloseSellData = true;
  } catch (err) {
    console.error("RPC fetch failed:", err);
  }
}

/* -----------------------
   Map availability pair to Date relative to a referenceStartDate
   Option A: if availMonth < referenceStart.month -> year = referenceStart.year + 1
            else year = referenceStart.year
   Returns Date
*/
function mapPairToDate(pair, referenceStartDate) {
  const yearBase = referenceStartDate.getFullYear();
  const startMonth = referenceStartDate.getMonth();
  const year = (pair.monthIndex < startMonth) ? yearBase + 1 : yearBase;
  return new Date(year, pair.monthIndex, pair.day);
}

/* -----------------------
   Main rewritten function
   - fetch, highlight, attach handlers
   ----------------------- */
async function fetchAllCloseSellDataFunction_Supabase() {
  await ensureCloseSellCache();

  const hotelElements = document.querySelectorAll(".all_hotels_names_div_class h3");
  // reset and remove handlers safely
  hotelElements.forEach(el => {
    el.style.opacity = "0";
    el.style.pointerEvents = "none";
    el.style.backgroundColor = "white";
    el.style.color = "black";
    if (el._closeSellHandler) {
      el.removeEventListener("click", el._closeSellHandler);
      delete el._closeSellHandler;
    }
  });

  const checkInRaw = safeGetValue("hotel_check_in_input_id");
  const checkOutRaw = safeGetValue("hotel_check_out_input_id");

  if (!checkInRaw || !checkOutRaw) {
    hotelElements.forEach(el => { el.style.opacity = "1"; el.style.pointerEvents = "auto"; });
    return;
  }

  // parse day+month for check-in/out (no forced year initially)
  const checkInDM = parseArabicDayMonth(checkInRaw);
  const checkOutDM = parseArabicDayMonth(checkOutRaw);
  if (!checkInDM || !checkOutDM) {
    console.warn("Invalid check-in/out format - expected 'DD MONTH' or 'DD MONTH YYYY'.");
    hotelElements.forEach(el => { el.style.opacity = "1"; el.style.pointerEvents = "auto"; });
    return;
  }

  // build actual checkInDate/checkOutDate using Option A relative-year rule
  const nowYear = new Date().getFullYear();
  const checkInDate = new Date(nowYear, checkInDM.monthIndex, checkInDM.day);
  let checkOutYear = nowYear;
  if (checkOutDM.monthIndex < checkInDM.monthIndex) checkOutYear = nowYear + 1;
  const checkOutDate = new Date(checkOutYear, checkOutDM.monthIndex, checkOutDM.day);

  // For each hotel element, check availability mapped against checkInDate..checkOutDate
  hotelElements.forEach(h3 => {
    const rawName = h3.innerText?.trim().split(" - ")[0] || "";
    const hotelKey = normalizeName(rawName);
    const hotelData = closeSellHotelDataCache.get(hotelKey) || [];

    const matchesThisHotel = [];

    hotelData.forEach(({ roomType, availabilityPairs }) => {
      // Map pairs to actual Date[] relative to checkInDate
      const mapped = availabilityPairs.map(p => mapPairToDate(p, checkInDate));
      const filtered = mapped.filter(d => d >= checkInDate && d <= checkOutDate).sort((a, b) => a - b);
      if (filtered.length > 0) matchesThisHotel.push({ roomType, dates: filtered, pairs: availabilityPairs });
    });

    if (matchesThisHotel.length > 0) {
      // highlight & attach handler
      h3.style.backgroundColor = "rgb(180,0,0)";
      h3.style.color = "white";
      h3.style.opacity = "1";

      const handler = () => {
        // read package start/end (they may include years)
        const pkgStartRaw = safeGetValue("whole_package_start_date_input_id");
        const pkgEndRaw = safeGetValue("whole_package_end_date_input_id");

        if (!pkgStartRaw || !pkgEndRaw) {
          showCloseSellModal("Please select package start and end dates.");
          return;
        }

        // parse package start: supports "DD MONTH" or "DD MONTH YYYY"
        const pkgStartDate = parseArabicDateUniversal(pkgStartRaw);
        // parse package end with reference to pkgStartDate so Dec->Jan becomes next year if needed
        const pkgEndDate = parseArabicDateUniversal(pkgEndRaw, pkgStartDate);

        if (!pkgStartDate || !pkgEndDate) {
          showCloseSellModal("Invalid package start/end format.");
          return;
        }

        // show room types list (optional UI)
        const roomTypesElement = document.getElementById("all_close_sell_room_type_found_p_id");
        if (roomTypesElement) {
          roomTypesElement.innerText = matchesThisHotel.map((m, i) => `${i + 1}- ${m.roomType}`).join("\n");
        }

        // For each matched room, remap original pairs relative to pkgStartDate (Option A)
        const messageParts = [];

        matchesThisHotel.forEach(({ roomType, pairs }) => {
          // find original pairs from hotelData (we included pairs in matchesThisHotel above)
          const mappedForPkg = pairs.map(p => mapPairToDate(p, pkgStartDate)).sort((a, b) => a - b);
          const filteredForPkg = mappedForPkg.filter(d => d >= pkgStartDate && d <= pkgEndDate);

          if (filteredForPkg.length > 0) {
            const formatted = formatDateRanges(filteredForPkg);
            messageParts.push(`${roomType}: ${formatted}`);
          } else {
          }
        });

        const finalMessage = messageParts.length ? messageParts.join("\n") : "No room availability inside selected package range.";
        showCloseSellModal(finalMessage);
      };

      h3._closeSellHandler = handler;
      h3.addEventListener("click", handler);
    } else {
      // default appearance
      h3.style.backgroundColor = "white";
      h3.style.color = "black";
      h3.style.opacity = "0.6";
    }
  });

  // restore pointer events
  hotelElements.forEach(el => { el.style.pointerEvents = "auto"; el.style.opacity = "1"; });
}

/* -----------------------
   Modal helpers
   ----------------------- */
function showCloseSellModal(messageText) {
  const modal = document.getElementById("closeSellModal");
  const message = document.getElementById("closeSellMessage");
  if (message) message.innerHTML = (messageText || "").replace(/\n/g, "<br>");
  let overlay = document.getElementById("closeSellOverlay");
  if (!overlay) {
    overlay = document.createElement("div");
    overlay.id = "closeSellOverlay";
    overlay.className = "black_overlay";
    overlay.style.position = "fixed";
    overlay.style.inset = "0";
    overlay.style.backgroundColor = "rgba(0,0,0,0.6)";
    overlay.style.zIndex = "9998";
    overlay.style.transition = "opacity 200ms ease";
    overlay.style.opacity = "0";
    document.body.appendChild(overlay);
    overlay.addEventListener("click", closeCloseSellModal);
  }
  overlay.style.opacity = "1";
  if (modal) {
    modal.style.display = "flex";
    modal.classList.add("show");
    modal.classList.remove("hide");
    modal.style.zIndex = "9999";
  }
}

function closeCloseSellModal() {
  const modal = document.getElementById("closeSellModal");
  const overlay = document.getElementById("closeSellOverlay");
  if (overlay) {
    overlay.style.opacity = "0";
    setTimeout(() => overlay.remove(), 250);
  }
  if (modal) {
    modal.classList.remove("show");
    modal.classList.add("hide");
    setTimeout(() => { modal.style.display = "none"; }, 200);
  }
}

/* -----------------------
   Refresh helper
   ----------------------- */
async function refreshCloseSellCache(force = false) {
  if (force) {
    closeSellHotelDataCache.clear();
    hasFetchedCloseSellData = false;
  }
  await fetchAllCloseSellDataFunction_Supabase();
}

/* -----------------------
   Export / usage notes
   - Call fetchAllCloseSellDataFunction_Supabase() when inputs change or when you want to refresh UI.
   - Click a highlighted hotel <h3> to see package-level details (and console output).
   ----------------------- */


























/* SQL Function To Get All Tables */




/*

CREATE TABLE "public"."YourHotelTable6" (
  "id" SERIAL PRIMARY KEY,
  "Room Type" TEXT,
  "January" TEXT,
  "February" TEXT,
  "March" TEXT,
  "April" TEXT,
  "May" TEXT,
  "June" TEXT,
  "July" TEXT,
  "August" TEXT,
  "September" TEXT,
  "October" TEXT,
  "November" TEXT,
  "December" TEXT
);

INSERT INTO "public"."YourHotelTable6" (
  "Room Type", 
  "January", 
  "February", 
  "March", 
  "April", 
  "May", 
  "June", 
  "July", 
  "August", 
  "September", 
  "October", 
  "November", 
  "December"
)
VALUES 
  ('Deluxe', null, null, null, null, null, null, null, null, null, null, null, null),
  ('Deluxe Sea View', null, null, null, null, null, null, null, null, null, null, null, null);

 */









/*
 
create or replace function get_all_public_tables_data()
returns jsonb
language plpgsql
as $$
declare
  result jsonb := '{}';
  rec record;
  temp jsonb;
begin
  for rec in
    select table_name
    from information_schema.tables
    where table_schema = 'public'
      and table_type = 'BASE TABLE'
      and table_name != 'indo_package_unique_number'
      and table_name != 'all_package_indo'  -- Added exclusion for this table
  loop
    execute format(
      'select jsonb_agg(t) from (select * from %I) t',
      rec.table_name
    )
    into temp;
    
    result := result || jsonb_build_object(rec.table_name, temp);
  end loop;

  return result;
end;
$$;

*/