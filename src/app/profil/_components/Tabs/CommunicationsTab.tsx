"use client";

import { C } from "../../_utils/constants";

export function CommunicationsTab({
  marketingConsent,
  handleToggleConsent,
  loading,
  errors,
  isEn = false,
}: {
  marketingConsent: boolean;
  handleToggleConsent: (checked: boolean) => void;
  loading: boolean;
  errors: Record<string, string>;
  isEn?: boolean;
}) {
  const t = {
    title: isEn ? "Communications & " : "İletişim ve ",
    titleEm: isEn ? "Consents" : "Yasal Onaylar",
    sub: isEn 
      ? "Manage the messages you want to receive about newsletters, new designs, and special offers from birlikteydik.com."
      : "birlikteydik.com bültenleri, yeni tasarımları ve size özel fırsatlar hakkında almak istediğiniz iletileri yönetin.",
    header: isEn ? "Commercial Electronic Message Consent" : "Ticari Elektronik İleti Onayı",
    active: isEn ? "Active" : "Aktif",
    passive: isEn ? "Inactive" : "Pasif",
    desc: isEn 
      ? "I want to receive information emails containing special opportunities such as new templates, campaigns, and discount coupons by birlikteydik.com."
      : "birlikteydik.com tarafından yeni şablonlar, kampanyalar ve indirim kuponları gibi özel fırsatları içeren bilgilendirme e-postaları almak istiyorum.",
    info: isEn 
      ? "You can toggle this consent at any time. Your preferences are updated immediately. You can access the detailed legal text on our "
      : "Onayı dilediğiniz zaman buradan kapatıp açabilirsiniz. Tercihleriniz anında güncellenir ve onay durumunuza uygun İYS bildirimleri otomatik güncellenir. Ayrıntılı yasal metne ",
    infoSuffix: isEn ? " page." : " sayfamızdan ulaşabilirsiniz.",
    legalLinkText: isEn ? "Commercial Electronic Message Text" : "Ticari Elektronik İleti Metni",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
      <div>
        <h2 style={{ fontFamily: "'Cormorant Garamond', 'Cormorant Garamond Fallback', serif", fontSize: "1.6rem", fontWeight: 500, color: C.text, marginBottom: "8px" }}>
          {t.title}<em style={{ color: C.purple, fontStyle: "italic" }}>{t.titleEm}</em>
        </h2>
        <p style={{ fontFamily: "var(--font-inter), sans-serif", fontSize: "12.5px", color: C.muted, fontWeight: 300 }}>
          {t.sub}
        </p>
      </div>

      {errors.consent && (
        <div style={{ padding: "10px 14px", borderRadius: "8px", background: "rgba(232,160,160,0.08)", border: `1px solid ${C.error}22`, color: C.error, fontSize: "12.5px" }}>
          {errors.consent}
        </div>
      )}

      {/* Consent card containing the toggle */}
      <div style={{ background: "rgba(255,255,255,0.015)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "16px", padding: "24px", display: "flex", flexDirection: "column", gap: "20px" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "20px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <h4 style={{ fontFamily: "var(--font-inter), sans-serif", fontSize: "13.5px", color: C.text, fontWeight: 500 }}>
                {t.header}
              </h4>
              {marketingConsent ? (
                <span style={{ fontSize: "10px", color: C.success, background: "rgba(134,239,172,0.06)", border: `1px solid ${C.success}33`, padding: "2px 6px", borderRadius: "4px", fontWeight: 500 }}>{t.active}</span>
              ) : (
                <span style={{ fontSize: "10px", color: C.muted, background: "rgba(255,255,255,0.04)", border: `1px solid rgba(255,255,255,0.1)`, padding: "2px 6px", borderRadius: "4px", fontWeight: 400 }}>{t.passive}</span>
              )}
            </div>
            <p style={{ fontFamily: "var(--font-inter), sans-serif", fontSize: "12.5px", color: C.muted, fontWeight: 300, lineHeight: 1.6, maxWidth: "480px" }}>
              {t.desc}
            </p>
          </div>

          {/* Custom Switch Toggle */}
          <button
            onClick={() => handleToggleConsent(!marketingConsent)}
            disabled={loading}
            style={{
              width: "48px", height: "26px", borderRadius: "13px",
              border: "none", cursor: loading ? "not-allowed" : "pointer",
              background: marketingConsent ? C.purple : "rgba(255,255,255,0.12)",
              position: "relative", display: "flex", alignItems: "center",
              padding: "3px", transition: "background 0.25s", flexShrink: 0
            }}
          >
            <div style={{
              width: "20px", height: "20px", borderRadius: "50%",
              background: "#0B0F1A", transition: "transform 0.25s",
              transform: marketingConsent ? "translateX(22px)" : "translateX(0px)"
            }} />
          </button>
        </div>

        <div style={{ height: "1px", background: "rgba(255,255,255,0.04)" }} />

        <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
          <span style={{ color: C.purple, fontSize: "13px", marginTop: "1px" }}>ℹ</span>
          <p style={{ fontFamily: "var(--font-inter), sans-serif", fontSize: "11.5px", color: "rgba(240,237,232,0.22)", fontWeight: 300, lineHeight: 1.5 }}>
            {t.info}
            <a href={isEn ? "/en/kvkk-metni" : "/kvkk-metni"} target="_blank" style={{ color: C.purple, textDecoration: "underline", textDecorationColor: "rgba(184,169,212,0.3)" }}>{t.legalLinkText}</a>
            {t.infoSuffix}
          </p>
        </div>
      </div>
    </div>
  );
}
