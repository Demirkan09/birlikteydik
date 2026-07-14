"use client";

import { HiOutlineCalendar, HiOutlineShieldCheck, HiHeart } from "react-icons/hi";
import { C } from "../../_utils/constants";

export function AccountDetailsTab({ createdAt, isEn = false }: { createdAt: string; isEn?: boolean }) {
  const t = {
    title: isEn ? "Account " : "Hesap ",
    titleEm: isEn ? "Details" : "Detayları",
    subtitle: isEn 
      ? "Review your membership details and overall profile summary."
      : "Üyelik bilgilerinizi ve profilinizin genel özetini inceleyin.",
    membershipDate: isEn ? "Membership Date" : "Üyelik Tarihi",
    unknown: isEn ? "Unknown" : "Bilinmiyor",
    accountRole: isEn ? "Account Role" : "Hesap Rolü",
    memberRole: isEn ? "Standard Member" : "Standart Üye",
    promoTitle: isEn ? "Have You Created Your Memory Page?" : "Sana Özel Anı Sayfanı Oluşturdun Mu?",
    promoDesc: isEn 
      ? "With birlikteydik.com, you can build retro and cinematic web pages that immortalize the best memories you share with your partner, spouse, or loved ones."
      : "birlikteydik.com ile sevgiliniz, eşiniz veya sevdiklerinizle paylaştığınız en güzel anıları ölümsüzleştiren retro ve sinematik tasarımlı web sayfaları kurabilirsiniz.",
    promoLink: isEn ? "Explore Templates" : "Tasarımları Keşfet",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
      <div>
        <h2 style={{ fontFamily: "'Cormorant Garamond', 'Cormorant Garamond Fallback', serif", fontSize: "1.6rem", fontWeight: 500, color: C.text, marginBottom: "8px" }}>
          {t.title}<em style={{ color: C.gold, fontStyle: "italic" }}>{t.titleEm}</em>
        </h2>
        <p style={{ fontFamily: "var(--font-inter), sans-serif", fontSize: "12.5px", color: C.muted, fontWeight: 300 }}>
          {t.subtitle}
        </p>
      </div>

      {/* Details stats */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", fontFamily: "var(--font-inter), sans-serif" }} className="form-row">
        <div style={{ background: "rgba(255,255,255,0.012)", border: "1px solid rgba(255,255,255,0.04)", borderRadius: "14px", padding: "18px 20px" }}>
          <span style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.1em", color: C.muted, display: "block", marginBottom: "4px" }}>{t.membershipDate}</span>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <HiOutlineCalendar size={16} color={C.gold} />
            <span style={{ fontSize: "14px", fontWeight: 400, color: C.text }}>{createdAt || t.unknown}</span>
          </div>
        </div>

        <div style={{ background: "rgba(255,255,255,0.012)", border: "1px solid rgba(255,255,255,0.04)", borderRadius: "14px", padding: "18px 20px" }}>
          <span style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.1em", color: C.muted, display: "block", marginBottom: "4px" }}>{t.accountRole}</span>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <HiOutlineShieldCheck size={16} color={C.gold} />
            <span style={{ fontSize: "14px", fontWeight: 400, color: C.text }}>{t.memberRole}</span>
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
            {t.promoTitle}
          </h4>
        </div>
        <p style={{ fontFamily: "var(--font-inter), sans-serif", fontSize: "12.5px", color: C.muted, fontWeight: 300, lineHeight: 1.6 }}>
          {t.promoDesc}
        </p>
        <a href={isEn ? "/en/#nasil-calisir" : "/#nasil-calisir"}
          style={{
            padding: "8px 18px", borderRadius: "20px", background: C.gold, color: "#0B0F1A",
            fontSize: "11.5px", fontWeight: 600, textDecoration: "none", alignSelf: "flex-start",
            letterSpacing: "0.06em", textTransform: "uppercase", transition: "opacity 0.2s"
          }}
          onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.85"; }}
          onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
        >
          {t.promoLink}
        </a>
      </div>
    </div>
  );
}
