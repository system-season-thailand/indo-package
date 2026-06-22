/* =====================================================================
   content-store.js — shared client-side content store (Lab only)
   Bridges Content Studio ↔ Template Engine so both consume ONE source.
   When the Studio edits content, it persists a snapshot here; the Template
   Engine hydrates from it on load (and live, if both are open).
   No backend · no Supabase · session/local only · graceful if unavailable.
   ===================================================================== */
(function () {
  "use strict";
  var KEY = "season_lab_content_v1";
  var CH = (typeof BroadcastChannel !== "undefined") ? new BroadcastChannel("season_lab_content") : null;
  function rawGet() { try { return window.localStorage.getItem(KEY); } catch (e) { return null; } }
  function rawSet(s) { try { window.localStorage.setItem(KEY, s); return true; } catch (e) { return false; } }

  function replaceArr(target, src) { if (!Array.isArray(target) || !Array.isArray(src)) return; target.length = 0; src.forEach(function (x) { target.push(x); }); }

  /* Stale-snapshot / collision repair (safe + idempotent).
     A recommendation/arrival item that literally holds its destination's
     cover_asset id is a known collision artifact from pre-fix snapshots
     (count-based ids used to collide onto the cover). A genuine uploaded or
     assigned image ALWAYS has a unique id (never the cover id), so nulling
     these never touches real images — the slot then falls back to its own
     scene/hue via the shared resolver, and the user can re-assign. */
  function repairAssets(base) {
    if (!base || !base.destinations) return 0;
    var fixed = 0;
    base.destinations.forEach(function (d) {
      if (!d) return;
      var cover = d.cover_asset;
      if (!cover) return;
      function clean(it) { if (it && it.asset && it.asset === cover) { it.asset = null; fixed++; } }
      ["dining", "cafes", "shopping", "exchange", "topRecs"].forEach(function (k) {
        if (Array.isArray(d[k])) d[k].forEach(clean);
      });
      if (d.arrival_asset && d.arrival_asset === cover) { d.arrival_asset = null; fixed++; }
    });
    return fixed;
  }

  window.ContentStore = {
    available: (function () { try { var k = "__t"; window.localStorage.setItem(k, "1"); window.localStorage.removeItem(k); return true; } catch (e) { return false; } })(),
    /* overlay any saved snapshot onto the base CS_DATA, in place (keeps refs) */
    hydrate: function (base) {
      if (!base) return false;
      var applied = false;
      var raw = rawGet();
      if (raw) {
        try {
          var saved = JSON.parse(raw);
          if (saved && saved.destinations) {
            replaceArr(base.destinations, saved.destinations);
            replaceArr(base.hotels, saved.hotels);
            replaceArr(base.media, saved.media);
            if (saved.brands) base.brands = saved.brands;
            applied = true;
          }
        } catch (e) {}
      }
      repairAssets(base); // safe collision repair on every hydrate (initial + live)
      return applied;
    },
    /* expose the repair for callers/tests; returns number of slots cleaned */
    repair: function (base) { return repairAssets(base); },
    /* persist a snapshot of the live content (called by the Studio on edits) */
    save: function (data) {
      if (!data) return false;
      var ok = false;
      try { ok = rawSet(JSON.stringify({ destinations: data.destinations, hotels: data.hotels, media: data.media, brands: data.brands, ts: Date.now() })); } catch (e) { ok = false; }
      if (CH) { try { CH.postMessage("changed"); } catch (e) {} }
      return ok;
    },
    /* notify on changes from OTHER documents (cross-iframe / cross-tab) */
    onChange: function (cb) {
      try { window.addEventListener("storage", function (e) { if (e.key === KEY) cb(); }); } catch (e) {}
      if (CH) CH.onmessage = function () { cb(); };
    },
    /* read snapshot metadata (timestamp + existence) without hydrating */
    meta: function () { var raw = rawGet(); if (!raw) return { ts: 0, exists: false }; try { var s = JSON.parse(raw); return { ts: s.ts || 0, exists: true }; } catch (e) { return { ts: 0, exists: false }; } }
  };
})();
