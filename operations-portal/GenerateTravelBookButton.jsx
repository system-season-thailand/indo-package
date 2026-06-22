/* GenerateTravelBookButton.jsx
 *
 * Drop-in manual entry point for the quotation page.
 * Flow: enqueue -> poll status -> when done, fetch a signed download URL.
 *
 * It uses your existing authenticated Supabase client (passed in) so it runs as the
 * logged-in staff user — the backend RPCs/function enforce is_employee. The
 * service_role key NEVER touches the browser (the signed URL is minted by the
 * guide-download Edge Function server-side).
 *
 * Backend it calls (all already deployed, additive):
 *   - rpc  guide_render_enqueue(p_quotation, p_lang)
 *   - rpc  guide_render_status(p_quotation)
 *   - fn   guide-download  (Edge Function -> { url, expires_in, file_name })
 *
 * Props:
 *   supabase    : your @supabase/supabase-js client (with the user session)   [required]
 *   quotationId : uuid of the quotation                                       [required]
 *   authorized  : boolean — render nothing unless true (gate to staff)        [default false]
 *   lang        : 'ar' | 'en'                                                  [default 'ar']
 *   className   : optional class for the button (use your existing styles)
 *
 * No redesign: styling is minimal/neutral and overridable via className.
 */
import { useEffect, useRef, useState } from "react";

const LABELS = {
  idle: "توليد دليل السفر (PDF)",
  enqueuing: "...جارٍ الإرسال",
  queued: "في الانتظار",
  rendering: "جارٍ التوليد",
  done: "جاهز",
  failed: "فشل التوليد",
};

export default function GenerateTravelBookButton({ supabase, quotationId, authorized = false, lang = "ar", className }) {
  const [phase, setPhase] = useState("idle");   // idle | enqueuing | queued | rendering | done | failed
  const [error, setError] = useState(null);
  const [downloadUrl, setDownloadUrl] = useState(null);
  const [busyDownload, setBusyDownload] = useState(false);
  const poll = useRef(null);

  useEffect(() => () => clearInterval(poll.current), []);
  if (!authorized) return null;

  function stopPolling() { clearInterval(poll.current); poll.current = null; }

  async function checkStatus() {
    const { data, error: e } = await supabase.rpc("guide_render_status", { p_quotation: quotationId });
    if (e) { setError(e.message); setPhase("failed"); stopPolling(); return; }
    const st = data && data.status;
    if (st === "rendering" || st === "queued") setPhase(st);
    else if (st === "done") { setPhase("done"); stopPolling(); }
    else if (st === "failed") { setError((data && data.error) || "render failed"); setPhase("failed"); stopPolling(); }
  }

  async function onGenerate() {
    setError(null); setDownloadUrl(null); setPhase("enqueuing");
    const { error: e } = await supabase.rpc("guide_render_enqueue", { p_quotation: quotationId, p_lang: lang });
    if (e) { setError(e.message); setPhase("failed"); return; }
    setPhase("queued");
    stopPolling();
    poll.current = setInterval(checkStatus, 3000);
    checkStatus();
  }

  async function onDownload() {
    setBusyDownload(true); setError(null);
    const { data, error: e } = await supabase.functions.invoke("guide-download", { body: { quotation_id: quotationId } });
    setBusyDownload(false);
    if (e || !data || !data.url) { setError((e && e.message) || (data && data.error) || "download failed"); return; }
    setDownloadUrl(data.url);
    window.open(data.url, "_blank", "noopener");
  }

  const generating = phase === "enqueuing" || phase === "queued" || phase === "rendering";

  return (
    <div dir="rtl" style={{ display: "inline-flex", flexDirection: "column", gap: 8, alignItems: "flex-start" }}>
      <button
        type="button"
        className={className}
        onClick={onGenerate}
        disabled={generating}
        style={className ? undefined : btnStyle(generating)}
      >
        {generating ? LABELS[phase] || "..." : (phase === "failed" ? "إعادة المحاولة" : LABELS.idle)}
      </button>

      {generating && (
        <span style={{ fontSize: 13, color: "#5c5547" }}>
          الحالة: {LABELS[phase] || phase}
          <span style={{ display: "inline-block", marginInlineStart: 6, animation: "none" }}>⏳</span>
        </span>
      )}

      {phase === "done" && (
        <button type="button" onClick={onDownload} disabled={busyDownload}
                className={className} style={className ? undefined : btnStyle(false, true)}>
          {busyDownload ? "...جارٍ التحضير" : "تنزيل الدليل (PDF)"}
        </button>
      )}

      {phase === "done" && downloadUrl && (
        <span style={{ fontSize: 12, color: "#5c5547" }}>الرابط صالح لمدة ساعة واحدة.</span>
      )}

      {error && <span style={{ fontSize: 13, color: "#b3261e" }}>خطأ: {error}</span>}
    </div>
  );
}

function btnStyle(disabled, accent) {
  return {
    fontFamily: "inherit", fontSize: 14, fontWeight: 700, cursor: disabled ? "default" : "pointer",
    color: accent ? "#0a1411" : "#fff",
    background: disabled ? "#9b9488" : (accent ? "#c9a24b" : "#2563EB"),
    border: 0, borderRadius: 8, padding: "10px 16px", opacity: disabled ? 0.7 : 1,
  };
}
