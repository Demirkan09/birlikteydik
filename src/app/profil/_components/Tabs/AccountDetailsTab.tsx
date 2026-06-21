"use client";

import { HiOutlineCalendar, HiOutlineShieldCheck, HiHeart } from "react-icons/hi";
import { C } from "../../_utils/constants";

export function AccountDetailsTab({ createdAt }: { createdAt: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
      <div>
        <h2 style={{ fontFamily: "'Cormorant Garamond', 'Cormorant Garamond Fallback', serif", fontSize: "1.6rem", fontWeight: 500, color: C.text, marginBottom: "8px" }}>
          Hesap <em style={{ color: C.gold, fontStyle: "italic" }}>Detayları</em>
        </h2>
        <p style={{ fontFamily: "var(--font-inter), sans-serif", fontSize: "12.5px", color: C.muted, fontWeight: 300 }}>
          Üyelik bilgilerinizi ve profilinizin genel özetini inceleyin.
        </p>
      </div>

      {/* Details stats */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", fontFamily: "var(--font-inter), sans-serif" }} className="form-row">
        <div style={{ background: "rgba(255,255,255,0.012)", border: "1px solid rgba(255,255,255,0.04)", borderRadius: "14px", padding: "18px 20px" }}>
          <span style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.1em", color: C.muted, display: "block", marginBottom: "4px" }}>Üyelik Tarihi</span>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <HiOutlineCalendar size={16} color={C.gold} />
            <span style={{ fontSize: "14px", fontWeight: 400, color: C.text }}>{createdAt || "Bilinmiyor"}</span>
          </div>
        </div>

        <div style={{ background: "rgba(255,255,255,0.012)", border: "1px solid rgba(255,255,255,0.04)", borderRadius: "14px", padding: "18px 20px" }}>
          <span style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.1em", color: C.muted, display: "block", marginBottom: "4px" }}>Hesap Rolü</span>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <HiOutlineShieldCheck size={16} color={C.gold} />
            <span style={{ fontSize: "14px", fontWeight: 400, color: C.text }}>Standart Üye</span>
          </div>
        </div>
      </div>

      {/* Premium Section Promo card */}
      <div style={{
        background: "radial-gradient(ellipse at 80% 0%, rgba(201,168,76,0.12) 0%, transparent 60%), rgba(255,255,255,0.02)",
        border: `1px solid rgba(201,168,76,0.2)`,
        borderRadius: "16px", padding: "24px", display: "flex", flexDirection: "column", gap: "14px"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <HiHeart size={18} color={C.gold} />
          <h4 style={{ fontFamily: "'Cormorant Garamond', 'Cormorant Garamond Fallback', serif", fontSize: "1.25rem", fontWeight: 600, color: C.text }}>
            Sana Özel Anı Sayfanı Oluşturdun Mu?
          </h4>
        </div>
        <p style={{ fontFamily: "var(--font-inter), sans-serif", fontSize: "12.5px", color: C.muted, fontWeight: 300, lineHeight: 1.6 }}>
          birlikteydik.com ile sevgiliniz, eşiniz veya sevdiklerinizle paylaştığınız en güzel anıları ölümsüzleştiren retro ve sinematik tasarımlı web sayfaları kurabilirsiniz.
        </p>
        <a href="/#nasil-calisir"
          style={{
            padding: "8px 18px", borderRadius: "20px", background: C.gold, color: "#0B0F1A",
            fontSize: "11.5px", fontWeight: 600, textDecoration: "none", alignSelf: "flex-start",
            letterSpacing: "0.06em", textTransform: "uppercase", transition: "opacity 0.2s"
          }}
          onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.85"; }}
          onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
        >
          Tasarımları Keşfet
        </a>
      </div>
    </div>
  );
}
