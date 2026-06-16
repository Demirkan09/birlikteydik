"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect } from "react";

const C = {
  bg: "#0B0F1A",
  gold: "#C9A84C",
  text: "#F0EDE8",
  muted: "rgba(240,237,232,0.55)",
  border: "rgba(255,255,255,0.07)",
  purple: "#B8A9D4",
};

interface MarketingConsentModalProps {
  open: boolean;
  onClose: () => void;
  onAccept: () => void;
}

export default function MarketingConsentModal({ open, onClose, onAccept }: MarketingConsentModalProps) {
  // ESC tuşuyla kapat
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    if (open) document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  // Modal açıkken scroll kilitle
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
            style={{
              position: "fixed", inset: 0, zIndex: 1000,
              background: "rgba(5,8,18,0.82)",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
            }}
          />

          {/* Modal Wrapper for Centering */}
          <div
            style={{
              position: "fixed",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1001,
              pointerEvents: "none",
            }}
          >
            {/* Modal */}
            <motion.div
              key="modal"
              initial={{ opacity: 0, y: 32, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.97 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              style={{
                pointerEvents: "auto",
                width: "min(680px, calc(100vw - 32px))",
                maxHeight: "min(640px, calc(100vh - 48px))",
                background: "rgba(11,15,26,0.98)",
                border: `1px solid rgba(184,169,212,0.2)`,
                borderRadius: "24px",
                backdropFilter: "blur(32px)",
                WebkitBackdropFilter: "blur(32px)",
                boxShadow: "0 40px 100px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.04) inset",
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
                fontFamily: "'Inter', sans-serif",
              }}
            >
            {/* Başlık */}
            <div style={{
              padding: "24px 28px 20px",
              borderBottom: "1px solid rgba(255,255,255,0.06)",
              display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "16px",
              flexShrink: 0,
            }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                  <span style={{
                    fontSize: "9px", fontWeight: 600, letterSpacing: "0.3em", textTransform: "uppercase",
                    color: C.purple, border: `1px solid rgba(184,169,212,0.3)`, padding: "2px 8px",
                    borderRadius: "4px",
                  }}>Opsiyonel Onay</span>
                </div>
                <h2 style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: "1.25rem", fontWeight: 600, color: C.text,
                  lineHeight: 1.3, letterSpacing: "0.01em",
                }}>
                  Ticari Elektronik İleti<br />
                  <em style={{ color: C.purple, fontStyle: "italic" }}>Aydınlatma ve Açık Rıza Metni</em>
                </h2>
              </div>
              <button
                onClick={onClose}
                style={{
                  width: "32px", height: "32px", borderRadius: "50%", flexShrink: 0,
                  background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
                  color: "rgba(240,237,232,0.5)", cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.1)"; e.currentTarget.style.color = C.text; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.color = "rgba(240,237,232,0.5)"; }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* İçerik — kaydırılabilir */}
            <div style={{ overflowY: "auto", padding: "24px 28px", flex: 1 }}>
              <p style={{ fontSize: "13px", color: C.muted, lineHeight: 1.75, fontWeight: 300, marginBottom: "24px" }}>
                İşbu metin, 6563 sayılı Elektronik Ticaretin Düzenlenmesi Hakkında Kanun, Ticari İletişim ve Ticari Elektronik İletiler Hakkında Yönetmelik ve 6698 sayılı Kişisel Verilerin Korunması Kanunu (&quot;KVKK&quot;) kapsamında, birlikteydik.com tarafından kullanıcılara gönderilecek ticari elektronik iletilere ilişkin aydınlatma ve açık rıza beyanı amacıyla hazırlanmıştır.
              </p>

              {[
                {
                  n: "1", title: "Veri Sorumlusu ve Veri İşleme Amacı",
                  text: "Sitemize kayıt olurken kendi isteğinizle paylaştığınız e-posta adresiniz ve ad-soyad bilgileriniz; birlikteydik.com platformu üzerindeki yeni şablonlar, güncellemeler, üyelere özel kampanyalar, avantajlar, bültenler, reklam ve pazarlama faaliyetleri hakkında bilgilendirilmeniz amacıyla işlenecektir.",
                },
                {
                  n: "2", title: "Ticari İleti Gönderim Onayı ve İYS Bildirimi",
                  text: "Aşağıdaki onay kutusunu işaretleyerek; birlikteydik.com tarafından tarafınıza doğrudan veya entegrasyon servisleri aracılığıyla bilgilendirme, tanıtım, reklam ve kutlama amacıyla ticari elektronik ileti (e-posta) gönderilmesine yasal olarak açık rıza verdiğinizi kabul etmiş sayılırsınız. Mevzuat gereği, verdiğiniz bu onay İleti Yönetim Sistemi (İYS) veritabanına kaydedilecektir.",
                },
                {
                  n: "3", title: "Reddetme (Onayı Geri Alma) Hakkı",
                  text: "Dilediğiniz zaman, hiçbir gerekçe göstermeksizin sitemizden ticari ileti almayı durdurma hakkına sahipsiniz. Tarafınıza gönderilen her e-postanın alt kısmında yer alan \"Üyelikten Ayrıl\" veya \"Bülten Listesinden Çık\" linkine tıklayarak ya da profil ayarlarınız üzerinden ticari ileti onayınızı saniyeler içinde geri çekebilirsiniz. Onayınızı geri aldığınız andan itibaren yasal süre içinde tarafınıza ticari ileti gönderimi tamamen durdurulacaktır.",
                },
                {
                  n: "4", title: "Verilerin Güvenliği",
                  text: "İletişim bilgileriniz, Gizlilik Politikamızda da belirtildiği üzere veritabanımızda güvenle saklanacak olup, izniniz dışında üçüncü şahıslara veya reklam ajanslarına ticari amaçlarla asla satılmayacak ya da aktarılmayacaktır.",
                },
              ].map((s) => (
                <div key={s.n} style={{
                  marginBottom: "16px", padding: "18px 20px",
                  background: "rgba(255,255,255,0.025)", borderRadius: "12px",
                  border: "1px solid rgba(255,255,255,0.05)",
                }}>
                  <div style={{ display: "flex", gap: "10px", alignItems: "baseline", marginBottom: "8px" }}>
                    <span style={{ color: `${C.purple}88`, fontFamily: "'Cormorant Garamond', serif", fontSize: "1rem", fontWeight: 600 }}>{s.n}.</span>
                    <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.05rem", fontWeight: 600, color: C.text }}>{s.title}</h3>
                  </div>
                  <p style={{ fontSize: "13px", color: C.muted, lineHeight: 1.7, fontWeight: 300 }}>{s.text}</p>
                </div>
              ))}
            </div>

            {/* Alt butonlar */}
            <div style={{
              padding: "16px 28px 20px",
              borderTop: "1px solid rgba(255,255,255,0.06)",
              display: "flex", gap: "10px", flexShrink: 0,
            }}>
              <button
                onClick={onClose}
                style={{
                  flex: 1, padding: "12px",
                  borderRadius: "30px", border: "1px solid rgba(255,255,255,0.1)",
                  background: "transparent", color: "rgba(240,237,232,0.5)",
                  fontSize: "12px", letterSpacing: "0.08em", fontWeight: 500,
                  cursor: "pointer", transition: "all 0.2s", fontFamily: "'Inter', sans-serif",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)"; e.currentTarget.style.color = C.text; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; e.currentTarget.style.color = "rgba(240,237,232,0.5)"; }}
              >
                Hayır, İstemiyorum
              </button>
              <button
                onClick={() => { onAccept(); onClose(); }}
                style={{
                  flex: 2, padding: "12px",
                  borderRadius: "30px", border: `1px solid rgba(184,169,212,0.35)`,
                  background: "rgba(184,169,212,0.12)", color: C.purple,
                  fontSize: "12px", letterSpacing: "0.08em", fontWeight: 600,
                  cursor: "pointer", transition: "all 0.2s", fontFamily: "'Inter', sans-serif",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(184,169,212,0.2)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(184,169,212,0.12)"; }}
              >
                Okudum, Onaylıyorum
              </button>
            </div>
          </motion.div>
        </div>
      </>
      )}
    </AnimatePresence>
  );
}
