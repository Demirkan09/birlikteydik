import React, { useState } from "react";
import { motion } from "framer-motion";
import { C } from "../../_utils/constants";

interface MarketingTabProps {
  adminEmail: string;
}

export function MarketingTab({ adminEmail }: MarketingTabProps) {
  const [mSubject, setMSubject] = useState("");
  const [mBody, setMBody] = useState("");
  const [mLoading, setMLoading] = useState(false);
  const [mError, setMError] = useState("");
  const [mSuccess, setMSuccess] = useState("");
  const [mRecipientCount, setMRecipientCount] = useState(0);

  const handleSendMarketing = async () => {
    if (!mSubject.trim()) { setMError("E-posta konusu gerekli"); return; }
    if (!mBody.trim()) { setMError("E-posta içeriği gerekli"); return; }
    setMError("");
    setMSuccess("");
    setMLoading(true);
    try {
      const res = await fetch("/api/admin/send-marketing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminEmail, subject: mSubject, body: mBody }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMError(data.error ?? "Gönderim başlatılamadı.");
        return;
      }
      setMSuccess(data.message);
      setMRecipientCount(data.recipientCount);
      setMSubject("");
      setMBody("");
    } catch {
      setMError("Sunucuya bağlanılamadı.");
    } finally {
      setMLoading(false);
    }
  };

  const cardStyle: React.CSSProperties = {
    background: "rgba(255,255,255,0.035)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "20px",
    backdropFilter: "blur(16px)",
    WebkitBackdropFilter: "blur(16px)",
  };

  return (
    <motion.div
      key="marketing"
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.35 }}
      style={{ maxWidth: "680px", margin: "0 auto", fontFamily: "Inter, 'Inter Fallback', sans-serif" }}
    >
      <div style={{ ...cardStyle, padding: "32px" }}>
        <h2 style={{ fontFamily: "'Cormorant Garamond', 'Cormorant Garamond Fallback', serif", fontSize: "24px", fontWeight: 600, color: C.text, marginBottom: "8px" }}>
          Toplu Pazarlama <em style={{ color: C.gold, fontStyle: "italic" }}>E-postası</em>
        </h2>
        <p style={{ fontSize: "13px", color: C.muted, marginBottom: "28px", fontWeight: 300, lineHeight: 1.6 }}>
          Pazarlama izni (marketing consent) aktif olan tüm kayıtlı üyelere toplu bülten veya kampanya e-postası gönderin.
        </p>

        {mError && (
          <div style={{ padding: "14px 18px", borderRadius: "12px", background: C.error + "12", border: `1px solid ${C.error}44`, fontSize: "13px", color: C.error, marginBottom: "20px" }}>
            {mError}
          </div>
        )}

        {mSuccess && (
          <div style={{ padding: "14px 18px", borderRadius: "12px", background: "rgba(134,239,172,0.08)", border: `1px solid ${C.success}33`, fontSize: "13px", color: C.success, marginBottom: "20px" }}>
            {mSuccess}
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* E-posta Konusu */}
          <div style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
            <label style={{ fontSize: "11px", letterSpacing: "0.12em", textTransform: "uppercase", color: C.muted, fontWeight: 500 }}>E-posta Konusu (Subject)</label>
            <input
              value={mSubject}
              onChange={(e) => setMSubject(e.target.value)}
              placeholder="Örn: Yeni Yıl Kampanyası Başladı! 🎄"
              style={{
                width: "100%", padding: "14px 16px", borderRadius: "12px",
                background: C.card, border: `1px solid ${C.border}`,
                color: C.text, fontFamily: "var(--font-inter), sans-serif", fontSize: "14px", outline: "none",
              }}
            />
          </div>

          {/* HTML İçerik */}
          <div style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <label style={{ fontSize: "11px", letterSpacing: "0.12em", textTransform: "uppercase", color: C.muted, fontWeight: 500 }}>E-posta İçeriği (HTML Body)</label>
              <span style={{ fontSize: "11px", color: C.gold, opacity: 0.8 }}>Dinamik yer tutucu: <strong>{`{name}`}</strong></span>
            </div>
            <textarea
              value={mBody}
              onChange={(e) => setMBody(e.target.value)}
              placeholder="<h1>Merhaba {name},</h1><p>Sadece size özel hazırladığımız fırsatları kaçırmayın...</p>"
              style={{
                width: "100%", height: "260px", padding: "16px", borderRadius: "12px",
                background: C.card, border: `1px solid ${C.border}`,
                color: C.text, fontFamily: "monospace", fontSize: "13px", outline: "none",
                resize: "vertical", lineHeight: 1.6,
              }}
            />
          </div>

          <button
            onClick={handleSendMarketing} disabled={mLoading}
            style={{
              width: "100%", padding: "15px", borderRadius: "30px", border: "none",
              background: mLoading ? "rgba(201,168,76,0.5)" : C.gold, color: "#0B0F1A",
              fontFamily: "var(--font-inter), sans-serif", fontSize: "13px", letterSpacing: "0.12em",
              textTransform: "uppercase", fontWeight: 600, cursor: mLoading ? "not-allowed" : "pointer",
              transition: "opacity 0.2s", marginTop: "8px",
              display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
            }}
            onMouseEnter={(e) => { if (!mLoading) e.currentTarget.style.opacity = "0.85"; }}
            onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
          >
            {mLoading ? (
              <><span style={{ width: "16px", height: "16px", border: "2px solid #0B0F1A44", borderTopColor: "#0B0F1A", borderRadius: "50%", animation: "spin 0.7s linear infinite", display: "inline-block" }} />Gönderim Başlatılıyor…</>
            ) : "Toplu Gönderimi Başlat"}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
