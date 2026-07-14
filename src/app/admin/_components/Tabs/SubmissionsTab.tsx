import React, { useState, useEffect, useCallback } from "react";
import { C } from "../../_utils/constants";

interface Submission {
  id: number;
  token: string;
  page_slug: string;
  status: "pending" | "submitted" | "imported";
  expires_at: string;
  couple_names: string | null;
  special_date: string | null;
  tagline: string | null;
  music_url: string | null;
  memories: Array<{
    id: number;
    image: string;
    title: string;
    description: string;
    date: string;
  }>;
  submitted_at: string | null;
  created_at: string;
  user_name: string | null;
  user_email: string | null;
}

const STATUS_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  pending:   { label: "Bekliyor",  color: "#F59E0B", bg: "rgba(245,158,11,0.1)" },
  submitted: { label: "Gönderildi", color: "#34D399", bg: "rgba(52,211,153,0.1)" },
  imported:  { label: "Aktarıldı",  color: "#818CF8", bg: "rgba(129,140,248,0.1)" },
};

function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(iso));
}

function isExpired(expiresAt: string) {
  return new Date(expiresAt) < new Date();
}

interface Props {
  adminEmail: string;
}

export function SubmissionsTab({ adminEmail }: Props) {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ success?: string; error?: string } | null>(null);
  const [filterStatus, setFilterStatus] = useState<"all" | "pending" | "submitted" | "imported">("all");

  const fetchSubmissions = useCallback(async () => {
    if (!adminEmail) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/portal/submissions?adminEmail=${encodeURIComponent(adminEmail)}`);
      const data = await res.json();
      if (res.ok && data.submissions) setSubmissions(data.submissions);

      // Trigger automatic background cleanup of old unsaved portal uploads
      fetch("/api/portal/cleanup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminEmail })
      }).catch(err => console.error("Auto cleanup background error:", err));
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, [adminEmail]);

  useEffect(() => { fetchSubmissions(); }, [fetchSubmissions]);

  const selected = submissions.find(s => s.id === selectedId) || null;

  const filtered = submissions.filter(s => filterStatus === "all" || s.status === filterStatus);

  const handleImport = async () => {
    if (!selected || !adminEmail) return;
    setImporting(true);
    setImportResult(null);
    try {
      const res = await fetch("/api/portal/submissions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminEmail, submissionId: selected.id }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setImportResult({ success: `✅ Başarıyla aktarıldı! /${data.pageSlug} sayfası güncellendi.` });
        await fetchSubmissions();
      } else {
        setImportResult({ error: data.error || "Aktarım sırasında bir hata oluştu." });
      }
    } catch {
      setImportResult({ error: "Sunucuya bağlanılamadı." });
    } finally {
      setImporting(false);
    }
  };

  const cardStyle: React.CSSProperties = {
    background: "rgba(255,255,255,0.035)",
    border: `1px solid ${C.border}`,
    borderRadius: "16px",
    padding: "20px",
    cursor: "pointer",
    transition: "border-color 0.2s, background 0.2s",
  };

  const selectedCardStyle: React.CSSProperties = {
    ...cardStyle,
    border: `1px solid ${C.gold}55`,
    background: "rgba(201,168,76,0.04)",
  };

  return (
    <div style={{ fontFamily: "Inter, 'Inter Fallback', sans-serif" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h2 style={{ fontFamily: "'Cormorant Garamond', 'Cormorant Garamond Fallback', serif", fontSize: "24px", fontWeight: 600, color: C.text, margin: "0 0 4px" }}>
            Müşteri <em style={{ color: C.gold }}>Gönderimleri</em>
          </h2>
          <p style={{ margin: 0, fontSize: "13px", color: C.muted }}>
            Müşterilerin yüklediği fotoğraf ve içerikleri buradan inceleyip sayfaya aktarın.
          </p>
        </div>
        <button
          onClick={fetchSubmissions}
          disabled={loading}
          style={{ padding: "10px 20px", borderRadius: "12px", background: "rgba(255,255,255,0.06)", border: `1px solid ${C.border}`, color: C.muted, cursor: "pointer", fontSize: "13px" }}
        >
          {loading ? "Yükleniyor..." : "🔄 Yenile"}
        </button>
      </div>

      {/* Filter tabs */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "24px", flexWrap: "wrap" }}>
        {(["all", "pending", "submitted", "imported"] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilterStatus(f)}
            style={{
              padding: "8px 18px",
              borderRadius: "20px",
              border: `1px solid ${filterStatus === f ? C.gold : C.border}`,
              background: filterStatus === f ? `rgba(201,168,76,0.12)` : "rgba(255,255,255,0.03)",
              color: filterStatus === f ? C.gold : C.muted,
              cursor: "pointer",
              fontSize: "12px",
              fontWeight: filterStatus === f ? 600 : 400,
              letterSpacing: "0.05em",
              transition: "all 0.2s",
            }}
          >
            {f === "all" ? `Tümü (${submissions.length})` :
             f === "pending" ? `Bekliyor (${submissions.filter(s => s.status === "pending").length})` :
             f === "submitted" ? `Gönderildi (${submissions.filter(s => s.status === "submitted").length})` :
             `Aktarıldı (${submissions.filter(s => s.status === "imported").length})`}
          </button>
        ))}
      </div>

      {loading && submissions.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 24px", color: C.muted }}>
          <div style={{ width: "32px", height: "32px", border: `2px solid ${C.border}`, borderTopColor: C.gold, borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 16px" }} />
          <p style={{ margin: 0 }}>Gönderimleri getiriliyor...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 24px", background: "rgba(255,255,255,0.02)", border: `1px solid ${C.border}`, borderRadius: "16px" }}>
          <div style={{ fontSize: "40px", marginBottom: "12px" }}>📭</div>
          <p style={{ color: C.muted, margin: 0, fontSize: "14px" }}>
            {filterStatus === "all" ? "Henüz hiç gönderim yok." : `"${STATUS_LABELS[filterStatus].label}" durumunda gönderim yok.`}
          </p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: selected ? "1fr 1.6fr" : "1fr", gap: "20px", alignItems: "start" }}>
          {/* Left: List */}
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {filtered.map(sub => {
              const st = STATUS_LABELS[sub.status] || STATUS_LABELS.pending;
              const expired = isExpired(sub.expires_at);
              const isSelected = selectedId === sub.id;
              return (
                <div
                  key={sub.id}
                  onClick={() => { setSelectedId(isSelected ? null : sub.id); setImportResult(null); }}
                  style={isSelected ? selectedCardStyle : cardStyle}
                >
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "8px" }}>
                    <div>
                      <p style={{ margin: "0 0 2px", fontSize: "14px", fontWeight: 600, color: C.text }}>
                        /{sub.page_slug}
                      </p>
                      <p style={{ margin: 0, fontSize: "12px", color: C.muted }}>
                        {sub.user_name || "İsimsiz"} — {sub.user_email || "E-posta yok"}
                      </p>
                    </div>
                    <span style={{ padding: "4px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: 600, color: st.color, background: st.bg, whiteSpace: "nowrap" }}>
                      {st.label}
                    </span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
                    <span style={{ fontSize: "12px", color: C.muted }}>
                      📸 {sub.memories?.length || 0} fotoğraf
                    </span>
                    {sub.submitted_at && (
                      <span style={{ fontSize: "12px", color: C.muted }}>
                        📅 {formatDate(sub.submitted_at)}
                      </span>
                    )}
                    {expired && sub.status === "pending" && (
                      <span style={{ fontSize: "11px", color: "#EF4444" }}>⏱ Süresi Doldu</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right: Detail panel */}
          {selected && (
            <div style={{ background: "rgba(255,255,255,0.035)", border: `1px solid ${C.gold}33`, borderRadius: "20px", padding: "24px", position: "sticky", top: "20px" }}>
              {/* Detail Header */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
                <div>
                  <p style={{ margin: "0 0 4px", fontFamily: "'Cormorant Garamond', serif", fontSize: "18px", color: C.text }}>
                    /{selected.page_slug}
                  </p>
                  <p style={{ margin: 0, fontSize: "12px", color: C.muted }}>
                    {selected.user_name} · {selected.user_email}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedId(null)}
                  style={{ width: "28px", height: "28px", background: "rgba(255,255,255,0.06)", border: `1px solid ${C.border}`, borderRadius: "8px", color: C.muted, cursor: "pointer", fontSize: "15px" }}
                >×</button>
              </div>

              {/* Info rows */}
              {(selected.couple_names || selected.special_date || selected.tagline || selected.music_url) && (
                <div style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${C.border}`, borderRadius: "12px", padding: "14px", marginBottom: "16px" }}>
                  {selected.couple_names && (
                    <p style={{ margin: "0 0 6px", fontSize: "13px", color: C.text }}>
                      <span style={{ color: C.gold }}>💑</span> {selected.couple_names}
                    </p>
                  )}
                  {selected.special_date && (
                    <p style={{ margin: "0 0 6px", fontSize: "13px", color: C.text }}>
                      <span style={{ color: C.gold }}>📅</span> {selected.special_date}
                    </p>
                  )}
                  {selected.tagline && (
                    <p style={{ margin: "0 0 6px", fontSize: "13px", color: C.muted, fontStyle: "italic" }}>
                      "{selected.tagline}"
                    </p>
                  )}
                  {selected.music_url && (
                    <p style={{ margin: 0, fontSize: "12px" }}>
                      <span style={{ color: C.gold }}>🎵</span>{" "}
                      <a href={selected.music_url} target="_blank" rel="noopener noreferrer" style={{ color: "rgba(201,168,76,0.7)", wordBreak: "break-all" }}>
                        {selected.music_url}
                      </a>
                    </p>
                  )}
                </div>
              )}

              {/* Photos grid */}
              {selected.memories && selected.memories.length > 0 ? (
                <div style={{ marginBottom: "20px" }}>
                  <p style={{ margin: "0 0 10px", fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase", color: C.muted }}>
                    Fotoğraflar ({selected.memories.length})
                  </p>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "6px" }}>
                    {selected.memories.map((mem, i) => (
                      <div key={i} style={{ position: "relative", aspectRatio: "1", borderRadius: "8px", overflow: "hidden", background: "rgba(255,255,255,0.03)" }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={mem.image} alt={mem.title || `Fotoğraf ${i+1}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "4px 6px", background: "linear-gradient(transparent, rgba(0,0,0,0.7))" }}>
                          <p style={{ margin: 0, fontSize: "9px", color: "rgba(255,255,255,0.8)", overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>
                            {mem.title || `#${i+1}`}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div style={{ padding: "20px", textAlign: "center", background: "rgba(255,255,255,0.02)", borderRadius: "10px", marginBottom: "20px" }}>
                  <p style={{ margin: 0, color: C.muted, fontSize: "13px" }}>Henüz fotoğraf yüklenmemiş.</p>
                </div>
              )}

              {/* Import result message */}
              {importResult?.success && (
                <div style={{ padding: "12px 14px", background: "rgba(52,211,153,0.1)", border: "1px solid rgba(52,211,153,0.25)", borderRadius: "10px", fontSize: "13px", color: "#34D399", marginBottom: "14px" }}>
                  {importResult.success}
                </div>
              )}
              {importResult?.error && (
                <div style={{ padding: "12px 14px", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)", borderRadius: "10px", fontSize: "13px", color: "#EF4444", marginBottom: "14px" }}>
                  {importResult.error}
                </div>
              )}

              {/* Import button */}
              {selected.status !== "imported" && (selected.memories?.length || 0) > 0 && (
                <button
                  onClick={handleImport}
                  disabled={importing}
                  style={{
                    width: "100%",
                    padding: "14px",
                    background: importing ? "rgba(201,168,76,0.3)" : "linear-gradient(135deg, #C9A84C, #e0c068)",
                    color: "#0B0F1A",
                    border: "none",
                    borderRadius: "12px",
                    fontSize: "13px",
                    fontWeight: 700,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    cursor: importing ? "not-allowed" : "pointer",
                    transition: "all 0.2s",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                  }}
                >
                  {importing ? (
                    <>
                      <div style={{ width: "14px", height: "14px", border: "2px solid rgba(11,15,26,0.3)", borderTopColor: "#0B0F1A", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
                      Aktarılıyor...
                    </>
                  ) : (
                    <>⚡ Sayfaya Aktar</>
                  )}
                </button>
              )}

              {selected.status === "imported" && (
                <div style={{ padding: "12px 14px", background: "rgba(129,140,248,0.1)", border: "1px solid rgba(129,140,248,0.2)", borderRadius: "10px", textAlign: "center", fontSize: "13px", color: "#818CF8" }}>
                  ✅ Bu gönderim zaten sayfaya aktarıldı.
                </div>
              )}

              <p style={{ margin: "12px 0 0", fontSize: "11px", color: C.muted, textAlign: "center" }}>
                Gönderim tarihi: {formatDate(selected.submitted_at)} · Portal: {isExpired(selected.expires_at) ? "Süresi doldu" : "Aktif"}
              </p>
            </div>
          )}
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
