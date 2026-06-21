import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HiOutlineCheck, HiOutlineClipboardCopy } from "react-icons/hi";
import { C, PACKAGES } from "../../_utils/constants";
import { Package, GeneratedCode } from "../../types";
import { timeAgo } from "../../_utils/dateUtils";

interface CodesTabProps {
  adminEmail: string;
  prefilledSlug?: string;
  setPrefilledSlug?: (slug: string) => void;
}

export function CodesTab({ adminEmail, prefilledSlug, setPrefilledSlug }: CodesTabProps) {
  const [selectedPackage, setSelectedPackage] = useState<Package>("Standart Paket");
  const [pageSlug, setPageSlug] = useState("");

  useEffect(() => {
    if (prefilledSlug) {
      setPageSlug(prefilledSlug);
      if (setPrefilledSlug) {
        setPrefilledSlug("");
      }
    }
  }, [prefilledSlug, setPrefilledSlug]);
  const [slugError, setSlugError] = useState("");
  const [generating, setGenerating] = useState(false);
  const [generatedCode, setGeneratedCode] = useState<GeneratedCode | null>(null);
  const [copied, setCopied] = useState(false);
  const [recentCodes, setRecentCodes] = useState<GeneratedCode[]>([]);

  const handleGenerate = async () => {
    const slug = pageSlug.trim().toLowerCase().replace(/\s+/g, "");
    if (!slug) { setSlugError("Sayfa adresi gerekli"); return; }
    if (!/^[a-z0-9-]+$/.test(slug)) { setSlugError("Sadece küçük harf, rakam ve tire kullanabilirsin"); return; }
    setSlugError("");
    setGenerating(true);
    try {
      const res = await fetch("/api/admin/generate-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminEmail, packageName: selectedPackage, pageSlug: slug }),
      });
      const data = await res.json();
      if (!res.ok) {
        setSlugError(data.error ?? "Kod üretilemedi");
        return;
      }
      const newCode: GeneratedCode = {
        code: data.code,
        pageSlug: slug,
        packageName: selectedPackage,
        generatedAt: new Date().toISOString(),
      };
      setGeneratedCode(newCode);
      setRecentCodes((prev) => [newCode, ...prev].slice(0, 10));
      setPageSlug("");
      setCopied(false);
    } catch {
      setSlugError("Sunucuya bağlanılamadı");
    } finally {
      setGenerating(false);
    }
  };

  const handleCopy = () => {
    if (!generatedCode) return;
    navigator.clipboard.writeText(generatedCode.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
      key="codes"
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.35 }}
      style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "24px", fontFamily: "Inter, 'Inter Fallback', sans-serif" }}
    >
      {/* Sol: Form */}
      <div style={{ ...cardStyle, padding: "28px" }}>
        <h2 style={{ fontFamily: "'Cormorant Garamond', 'Cormorant Garamond Fallback', serif", fontSize: "22px", fontWeight: 600, color: C.text, marginBottom: "24px" }}>
          Aktivasyon Kodu <em style={{ color: C.gold, fontStyle: "italic" }}>Üret</em>
        </h2>

        {/* Paket seçici */}
        <p style={{ fontSize: "11px", letterSpacing: "0.12em", textTransform: "uppercase", color: C.muted, marginBottom: "12px", fontWeight: 500 }}>Paket Seç</p>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "24px" }}>
          {PACKAGES.map((pkg) => (
            <button
              key={pkg.name}
              onClick={() => setSelectedPackage(pkg.name as Package)}
              style={{
                padding: "14px 16px", borderRadius: "12px", border: "none",
                background: selectedPackage === pkg.name ? "rgba(201,168,76,0.1)" : "rgba(255,255,255,0.03)",
                borderWidth: "1px", borderStyle: "solid",
                borderColor: selectedPackage === pkg.name ? C.gold + "55" : C.border,
                color: C.text, fontFamily: "var(--font-inter), sans-serif", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "space-between",
                transition: "all 0.2s", textAlign: "left",
              }}
            >
              <div>
                <div style={{ fontSize: "14px", fontWeight: selectedPackage === pkg.name ? 500 : 400, color: selectedPackage === pkg.name ? C.gold : C.text }}>{pkg.name}</div>
                <div style={{ fontSize: "12px", color: C.muted, marginTop: "2px", fontWeight: 300 }}>{pkg.desc}</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "10px", padding: "2px 8px", borderRadius: "20px", background: selectedPackage === pkg.name ? C.gold + "22" : "rgba(255,255,255,0.05)", color: selectedPackage === pkg.name ? C.gold : C.muted, fontWeight: 500, letterSpacing: "0.06em" }}>{pkg.badge}</span>
                {selectedPackage === pkg.name && (
                  <div style={{ width: "18px", height: "18px", borderRadius: "50%", background: C.gold, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <HiOutlineCheck size={11} color="#0B0F1A" />
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>

        {/* Sayfa slug input */}
        <p style={{ fontSize: "11px", letterSpacing: "0.12em", textTransform: "uppercase", color: C.muted, marginBottom: "10px", fontWeight: 500 }}>Sayfa Adresi</p>
        <div style={{ position: "relative", marginBottom: "20px" }}>
          <div style={{
            display: "flex", alignItems: "center",
            borderRadius: "12px", border: `1px solid ${slugError ? C.error + "88" : C.border}`,
            background: C.card, overflow: "hidden",
          }}>
            <span style={{ fontFamily: "Inter, 'Inter Fallback', sans-serif", padding: "14px 0 14px 16px", fontSize: "13px", color: "rgba(240,237,232,0.3)", whiteSpace: "nowrap", flexShrink: 0 }}>birlikteydik.com/</span>
            <input
              value={pageSlug}
              onChange={(e) => { setPageSlug(e.target.value.toLowerCase()); setSlugError(""); }}
              placeholder="demirkanmelis"
              onKeyDown={(e) => { if (e.key === "Enter") handleGenerate(); }}
              style={{ flex: 1, padding: "14px 16px 14px 0", background: "transparent", border: "none", color: C.text, fontFamily: "Inter, 'Inter Fallback', sans-serif", fontSize: "14px", outline: "none" }}
            />
          </div>
          {slugError && <p style={{ fontSize: "12px", color: C.error, marginTop: "6px", fontWeight: 300 }}>{slugError}</p>}
        </div>

        <button
          onClick={handleGenerate} disabled={generating}
          style={{
            width: "100%", padding: "14px", borderRadius: "30px", border: "none",
            background: generating ? "rgba(201,168,76,0.5)" : C.gold, color: "#0B0F1A",
            fontFamily: "var(--font-inter), sans-serif", fontSize: "13px", letterSpacing: "0.12em",
            textTransform: "uppercase", fontWeight: 600, cursor: generating ? "not-allowed" : "pointer",
            transition: "opacity 0.2s", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
          }}
          onMouseEnter={(e) => { if (!generating) e.currentTarget.style.opacity = "0.85"; }}
          onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
        >
          {generating ? (
            <><span style={{ width: "16px", height: "16px", border: "2px solid #0B0F1A44", borderTopColor: "#0B0F1A", borderRadius: "50%", animation: "spin 0.7s linear infinite", display: "inline-block" }} />Üretiliyor…</>
          ) : "Kod Üret"}
        </button>
      </div>

      {/* Sağ: Sonuç + Son Kodlar */}
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        {/* Üretilen kod */}
        <AnimatePresence>
          {generatedCode && (
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }} transition={{ duration: 0.35 }}
              style={{ ...cardStyle, padding: "28px" }}
            >
              <p style={{ fontSize: "11px", letterSpacing: "0.14em", textTransform: "uppercase", color: C.gold, marginBottom: "16px", fontWeight: 500 }}>Üretilen Kod</p>
              <div style={{
                background: "rgba(201,168,76,0.06)", border: "1px solid rgba(201,168,76,0.2)",
                borderRadius: "12px", padding: "20px 24px", marginBottom: "16px", textAlign: "center",
              }}>
                <p style={{ fontFamily: "Inter, 'Inter Fallback', sans-serif", fontSize: "clamp(28px, 5vw, 38px)", fontWeight: 600, color: C.gold, letterSpacing: "0.25em" }}>
                  {generatedCode.code}
                </p>
              </div>
              <div style={{ display: "flex", gap: "8px", marginBottom: "16px", fontSize: "12px", color: C.muted, flexWrap: "wrap" }}>
                <span style={{ padding: "3px 10px", borderRadius: "20px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>{generatedCode.packageName}</span>
                <span style={{ padding: "3px 10px", borderRadius: "20px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>/{generatedCode.pageSlug}</span>
              </div>
              <button
                onClick={handleCopy}
                style={{
                  width: "100%", padding: "12px", borderRadius: "12px", border: `1px solid ${copied ? C.success + "55" : C.border}`,
                  background: copied ? "rgba(134,239,172,0.08)" : "rgba(255,255,255,0.04)", color: copied ? C.success : C.text,
                  fontFamily: "var(--font-inter), sans-serif", fontSize: "13px", fontWeight: 500,
                  cursor: "pointer", transition: "all 0.25s",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                }}
              >
                {copied ? <><HiOutlineCheck size={16} />Kopyalandı!</> : <><HiOutlineClipboardCopy size={16} />Kodu Kopyala</>}
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Son Kodlar */}
        {recentCodes.length > 0 && (
          <div style={{ ...cardStyle, padding: "24px" }}>
            <p style={{ fontSize: "11px", letterSpacing: "0.14em", textTransform: "uppercase", color: C.muted, marginBottom: "14px", fontWeight: 500 }}>Son Üretilen Kodlar</p>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {recentCodes.map((rc, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", borderRadius: "10px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
                  <div>
                    <span style={{ fontFamily: "Inter, 'Inter Fallback', sans-serif", fontSize: "16px", fontWeight: 600, color: C.gold, letterSpacing: "0.15em" }}>{rc.code}</span>
                    <p style={{ fontSize: "11px", color: C.muted, marginTop: "2px" }}>/{rc.pageSlug} · {rc.packageName}</p>
                  </div>
                  <span style={{ fontSize: "11px", color: "rgba(240,237,232,0.2)" }}>{timeAgo(rc.generatedAt)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
