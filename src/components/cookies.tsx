"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

const STORAGE_KEY = "birlikteydik_cookie_consent";

// Çerez onay balonunun görüneceği sayfalar
const PAGES = [
  "/",
  "/login",
  "/register",
  "/profil",
  "/kvkk-metni",
  "/dogumgunu-sablonlari",
  "/yildonumu-sablonlari",
  "/sevgililergunu-sablonlari",
  "/ilktanisma-sablonlari",
];

export default function CookieBanner() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Daha önce kabul ettiyse gösterme
    if (localStorage.getItem(STORAGE_KEY)) return;

    // 1.5 saniye sonra göster
    const timer = setTimeout(() => setVisible(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  const handleAccept = () => {
    localStorage.setItem(STORAGE_KEY, "accepted");
    setVisible(false);
  };

  // Sadece PAGES listesindeki sayfalarda göster
  if (!PAGES.includes(pathname)) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.97 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          style={{
            position: "fixed",
            bottom: "24px",
            right: "24px",
            zIndex: 999,
            maxWidth: "380px",
            width: "calc(100vw - 48px)",
            background: "rgba(13,18,32,0.97)",
            border: "1px solid rgba(201,168,76,0.2)",
            borderRadius: "18px",
            padding: "20px 22px",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            boxShadow: "0 24px 64px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04) inset",
            fontFamily: "'Inter', sans-serif",
          }}
        >
          {/* Üst ikon + başlık */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
            <div style={{
              width: "32px", height: "32px", borderRadius: "8px",
              background: "rgba(201,168,76,0.12)",
              border: "1px solid rgba(201,168,76,0.25)",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
            }}>
              {/* Cookie icon */}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C9A84C" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2z" />
                <circle cx="8.5" cy="8.5" r="1.5" fill="#C9A84C" stroke="none" />
                <circle cx="15" cy="9" r="1" fill="#C9A84C" stroke="none" />
                <circle cx="9" cy="15" r="1" fill="#C9A84C" stroke="none" />
                <circle cx="14" cy="14.5" r="1.5" fill="#C9A84C" stroke="none" />
              </svg>
            </div>
            <span style={{ fontSize: "13px", fontWeight: 600, color: "#F0EDE8", letterSpacing: "0.02em" }}>
              Çerez Politikası
            </span>
          </div>

          {/* Metin */}
          <p style={{
            fontSize: "12px",
            color: "rgba(240,237,232,0.55)",
            lineHeight: 1.65,
            fontWeight: 300,
            marginBottom: "16px",
          }}>
            Birlikteydik.com olarak, yasal düzenlemelere uygun çerezler (cookies) kullanıyoruz.
            Detaylı yasal bilgilendirmeye{" "}
            <Link
              href="/kvkk-metni"
              style={{ color: "#C9A84C", textDecoration: "underline", textDecorationColor: "rgba(201,168,76,0.35)", textUnderlineOffset: "2px" }}
            >
              Gizlilik, Kullanım Şartları ve Çerez Politikası
            </Link>{" "}
            metnimizden ulaşabilirsiniz.
          </p>

          {/* Kabul butonu */}
          <button
            onClick={handleAccept}
            style={{
              width: "100%",
              padding: "11px 20px",
              borderRadius: "30px",
              border: "none",
              background: "linear-gradient(135deg, #C9A84C, #b8933e)",
              color: "#0B0F1A",
              fontSize: "12px",
              fontWeight: 700,
              letterSpacing: "0.08em",
              cursor: "pointer",
              transition: "opacity 0.2s, transform 0.15s",
              fontFamily: "'Inter', sans-serif",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.88"; e.currentTarget.style.transform = "translateY(-1px)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.transform = "translateY(0)"; }}
          >
            Anladım, Kabul Ediyorum
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
