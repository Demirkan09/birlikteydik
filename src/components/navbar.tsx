"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { FaWhatsapp, FaInstagram } from "react-icons/fa";
import { HiOutlineUser, HiOutlineUserAdd, HiMenuAlt3, HiX, HiOutlineLogout, HiOutlineCog } from "react-icons/hi";

// ╔══════════════════════════════════════════════════════════════════╗
// ║  AYARLAR — Buradan kolayca düzenleyebilirsin                    ║
// ╠══════════════════════════════════════════════════════════════════╣
// ║                                                                  ║
// ║  PAGES: Navbar'ın görüneceği sayfalar (tam pathname eşleşmesi)  ║
// ║  Yeni bir sayfa eklemek için diziye "/" ile başlayan yol ekle.  ║
// ║                                                                  ║
const PAGES: string[] = [
  "/",
  "/login",
  "/register",
  "/profil",
  "/sablonlar",
  "/en",
  "/en/login",
  "/en/register",
  "/en/profil",
  "/en/sablonlar",
];
// ║                                                                  ║
// ║  İletişim & sosyal medya bilgileri                              ║
// ║                                                                  ║
// export const WHATSAPP_NUMBER  = "905349829940";
export const WHATSAPP_NUMBER  = "905349829940";
export const WHATSAPP_MESSAGE = "Merhaba! birlikteydik.com'dan sipariş vermek istiyorum.";
export const WHATSAPP_MESSAGE_EN = "Hello! I would like to order from birlikteydik.com.";
export const INSTAGRAM_URL    = "https://instagram.com/birlikteydikcom";
// ║                                                                  ║
// ║  Menü linkleri (desktop + mobile'da gösterilir)                 ║
// ║  "href" ana sayfada anchor (#), diğer sayfalardan ise tam yol  ║
// ║  olarak otomatik ayarlanır — sadece label ve anchor'ı gir.      ║
// ║                                                                  ║
const NAV_LINKS = [
  { label: "Ana Sayfa",     anchor: "#anasayfa"      },
  { label: "Nasıl Çalışır", anchor: "#nasil-calisir" },
  { label: "Özel Günler",   anchor: "#ozel-gunler"   },
  { label: "Fiyatlar",      anchor: "#fiyatlar"      },
  { label: "Şablonlar",     anchor: "/sablonlar", isPage: true },
  { label: "SSS",           anchor: "#sss"           },
];

const NAV_LINKS_EN = [
  { label: "Home",          anchor: "#anasayfa"      },
  { label: "How It Works",  anchor: "#nasil-calisir" },
  { label: "Special Days",  anchor: "#ozel-gunler"   },
  { label: "Pricing",       anchor: "#fiyatlar"      },
  { label: "Templates",     anchor: "/en/sablonlar", isPage: true },
  { label: "FAQ",           anchor: "#sss"           },
];
// ║                                                                  ║
// ╚══════════════════════════════════════════════════════════════════╝

// ─── Auth state (localStorage tabanlı) ────────────────────────────────────────
function useAuthState(isEn: boolean) {
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);

  const checkUser = () => {
    try {
      const stored = localStorage.getItem("birlikteydik_user");
      if (stored) {
        setUser(JSON.parse(stored));
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    }
  };

  useEffect(() => {
    checkUser();
    window.addEventListener("auth-change", checkUser);
    return () => {
      window.removeEventListener("auth-change", checkUser);
    };
  }, []);

  const logout = () => {
    localStorage.removeItem("birlikteydik_user");
    setUser(null);
    window.dispatchEvent(new Event("auth-change"));
    window.location.href = isEn ? "/en" : "/";
  };

  return { user, logout };
}

// ─── Ana Navbar bileşeni ──────────────────────────────────────────────────────
export default function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled]       = useState(false);
  const [mobileOpen, setMobileOpen]   = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  
  const isEn = pathname.startsWith("/en") || pathname.includes("/en/");
  const { user, logout } = useAuthState(isEn);

  const [siteSettings, setSiteSettings] = useState<any>({
    whatsapp_number: WHATSAPP_NUMBER,
    announcement_banner: { active: false, text: "" },
  });

  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch("/api/site-settings");
        const data = await res.json();
        if (res.ok && data.settings) {
          setSiteSettings((prev: any) => ({
            ...prev,
            ...data.settings,
            whatsapp_number: data.settings.whatsapp_number || prev.whatsapp_number,
            announcement_banner: isEn 
              ? (data.settings.announcement_banner_en || prev.announcement_banner) 
              : (data.settings.announcement_banner || prev.announcement_banner),
          }));
        }
      } catch (err) {
        console.error("Navbar load settings error:", err);
      }
    }
    loadSettings();
  }, [isEn]);

  const isHome = pathname === "/" || pathname === "/en";
  const whatsappUrl = `https://wa.me/${siteSettings.whatsapp_number || WHATSAPP_NUMBER}?text=${encodeURIComponent(isEn ? WHATSAPP_MESSAGE_EN : WHATSAPP_MESSAGE)}`;

  // Menü linklerini pathname'e göre ayarla
  const activeNavLinks = isEn ? NAV_LINKS_EN : NAV_LINKS;
  const navLinks = activeNavLinks.map((l) => ({
    label: l.label,
    href: l.isPage ? l.anchor : (isHome ? l.anchor : (isEn ? `/en${l.anchor}` : `/${l.anchor}`)),
  }));

  const handleAnchorClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href === "#anasayfa" || href === "/#anasayfa" || href === "/en#anasayfa") {
      if (isHome) {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }
  };

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  // Sayfa değişince menüleri kapat
  useEffect(() => {
    setMobileOpen(false);
    setProfileOpen(false);
  }, [pathname]);

  // Dışarı tıklanınca profil dropdown kapat
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest("#profile-dropdown")) setProfileOpen(false);
    };
    if (profileOpen) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [profileOpen]);

  // Tüm hook'lar çağrıldıktan SONRA sayfa kontrolü (Rules of Hooks ihlali olmaz)
  if (!PAGES.includes(pathname)) return null;

  const navBg = scrolled || mobileOpen;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,600&family=Inter:wght@300;400;500;600&display=swap');
        .nb-desktop { display: flex !important; }
        .nb-mobile-btn { display: none !important; }
        @media (max-width: 900px) {
          .nb-desktop { display: none !important; }
          .nb-mobile-btn { display: flex !important; }
        }
      `}</style>

      <div style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 50 }}>
        {siteSettings.announcement_banner?.active && siteSettings.announcement_banner?.text && (
          <div style={{
            background: "linear-gradient(90deg, #C9A84C, #E8A0A0)",
            color: "#0B0F1A",
            padding: "8px 16px",
            textAlign: "center",
            fontSize: "11px",
            fontWeight: 600,
            letterSpacing: "0.03em",
            fontFamily: "'Inter', sans-serif"
          }}>
            {siteSettings.announcement_banner.text}
          </div>
        )}
        <nav style={{
          position: "relative",
          padding: "0 24px", height: "64px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          background: navBg ? "rgba(11,15,26,0.95)" : "transparent",
          backdropFilter: navBg ? "blur(20px)" : "none",
          WebkitBackdropFilter: navBg ? "blur(20px)" : "none",
          borderBottom: navBg ? "1px solid rgba(255,255,255,0.06)" : "none",
          transition: "background 0.4s ease, border-color 0.4s ease",
          fontFamily: "'Inter', sans-serif",
        }}>

        {/* Logo */}
        <Link
          href={isEn ? "/en" : "/"}
          onClick={(e) => {
            if (isHome) {
              e.preventDefault();
              window.location.href = isEn ? "/en" : "/";
            }
          }}
          style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.25rem", fontWeight: 600, color: "#F0EDE8", letterSpacing: "0.04em", textDecoration: "none" }}
        >
          birlikteydik<span style={{ color: "#C9A84C" }}>.com</span>
        </Link>

        {/* Desktop — menü linkleri */}
        <div className="nb-desktop" style={{ alignItems: "center", gap: "24px" }}>
          {navLinks.map((l) => (
            <a key={l.href} href={l.href}
              onClick={(e) => handleAnchorClick(e, l.href)}
              style={{ fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(240,237,232,0.5)", textDecoration: "none", fontWeight: 400, transition: "color 0.2s" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#F0EDE8")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(240,237,232,0.5)")}
            >{l.label}</a>
          ))}
        </div>

        {/* Desktop — sağ aksiyonlar */}
        <div className="nb-desktop" style={{ alignItems: "center", gap: "10px" }}>

          {/* Instagram */}
          <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" title="Instagram"
            style={{ width: "36px", height: "36px", borderRadius: "50%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(240,237,232,0.6)", textDecoration: "none", transition: "all 0.2s" }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(201,168,76,0.15)"; e.currentTarget.style.borderColor = "#C9A84C66"; e.currentTarget.style.color = "#C9A84C"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; e.currentTarget.style.color = "rgba(240,237,232,0.6)"; }}
          ><FaInstagram size={15} /></a>

          {/* Order Link */}
          <a href={isEn ? "https://birlikteydik.gumroad.com/" : "https://www.shopier.com/birlikteydikcom"} target="_blank" rel="noopener noreferrer"
            style={{ display: "flex", alignItems: "center", gap: "7px", padding: "8px 16px", borderRadius: "30px", background: "#C9A84C", color: "#0B0F1A", textDecoration: "none", fontSize: "11px", letterSpacing: "0.08em", fontWeight: 600, transition: "opacity 0.2s" }}
            onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.85"; }}
            onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
          ><span>{isEn ? "Order Now" : "Sipariş Ver"}</span></a>

          {/* Auth — giriş yapıldıysa /profil sayfasına yönlendiren isim butonu, yoksa login/register */}
          {user ? (
            <Link href={isEn ? "/en/profil" : "/profil"}
              style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px 16px", borderRadius: "30px", background: "rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.25)", textDecoration: "none", color: "#F0EDE8", transition: "all 0.2s" }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(201,168,76,0.18)"; e.currentTarget.style.borderColor = "#C9A84C66"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(201,168,76,0.1)"; e.currentTarget.style.borderColor = "rgba(201,168,76,0.25)"; }}
            >
              <div style={{ width: "22px", height: "22px", borderRadius: "50%", background: "linear-gradient(135deg, #C9A84C, #E8A0A0)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", color: "#0B0F1A", fontWeight: 700 }}>
                {user.name?.[0]?.toUpperCase() ?? "U"}
              </div>
              <span style={{ fontSize: "12px", fontWeight: 500 }}>{user.name}</span>
            </Link>
          ) : (
            <>
              <Link href={isEn ? "/en/login" : "/login"}
                style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 14px", borderRadius: "30px", background: "transparent", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(240,237,232,0.65)", textDecoration: "none", fontSize: "11px", letterSpacing: "0.08em", fontWeight: 400, transition: "all 0.2s" }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.25)"; e.currentTarget.style.color = "#F0EDE8"; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; e.currentTarget.style.color = "rgba(240,237,232,0.65)"; }}
              ><HiOutlineUser size={14} /><span>{isEn ? "Login" : "Giriş"}</span></Link>

              <Link href={isEn ? "/en/register" : "/register"}
                style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 16px", borderRadius: "30px", background: "#C9A84C", color: "#0B0F1A", textDecoration: "none", fontSize: "11px", letterSpacing: "0.1em", fontWeight: 600, transition: "opacity 0.2s" }}
                onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.85"; }}
                onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
              ><HiOutlineUserAdd size={14} /><span>{isEn ? "Register" : "Kayıt Ol"}</span></Link>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button className="nb-mobile-btn" onClick={() => setMobileOpen(!mobileOpen)}
          style={{ background: "none", border: "none", color: "#F0EDE8", cursor: "pointer", padding: "4px", alignItems: "center" }}>
          {mobileOpen ? <HiX size={24} /> : <HiMenuAlt3 size={24} />}
        </button>
      </nav>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.25 }}
            style={{ position: "fixed", top: siteSettings.announcement_banner?.active && siteSettings.announcement_banner?.text ? "96px" : "64px", left: 0, right: 0, zIndex: 49, background: "rgba(11,15,26,0.98)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "20px 24px 32px", display: "flex", flexDirection: "column", gap: "4px", fontFamily: "'Inter', sans-serif" }}>

            {navLinks.map((l) => (
              <a key={l.href} href={l.href} onClick={(e) => {
                setMobileOpen(false);
                handleAnchorClick(e, l.href);
              }}
                style={{ fontSize: "13px", letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(240,237,232,0.6)", textDecoration: "none", padding: "13px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}
              >{l.label}</a>
            ))}

            <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "20px" }}>
              <a href={isEn ? "https://birlikteydik.gumroad.com/" : "https://www.shopier.com/birlikteydikcom"} target="_blank" rel="noopener noreferrer"
                style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "9px", padding: "14px", borderRadius: "30px", background: "#C9A84C", color: "#0B0F1A", textDecoration: "none", fontSize: "13px", fontWeight: 600 }}
              >{isEn ? "Order Now" : "Sipariş Ver"}</a>

              <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer"
                style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "9px", padding: "14px", borderRadius: "30px", background: "rgba(201,168,76,0.08)", border: "1px solid rgba(201,168,76,0.2)", color: "#C9A84C", textDecoration: "none", fontSize: "13px", fontWeight: 500 }}
              ><FaInstagram size={17} />{isEn ? "Follow Instagram" : "Instagram'ı Takip Et"}</a>

              {user ? (
                <>
                  <Link href={isEn ? "/en/profil" : "/profil"} onClick={() => setMobileOpen(false)}
                    style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "9px", padding: "14px", borderRadius: "30px", background: "rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.25)", color: "#F0EDE8", textDecoration: "none", fontSize: "13px", fontWeight: 500 }}
                  >
                    <div style={{ width: "20px", height: "20px", borderRadius: "50%", background: "linear-gradient(135deg, #C9A84C, #E8A0A0)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "9px", color: "#0B0F1A", fontWeight: 700 }}>
                      {user.name?.[0]?.toUpperCase() ?? "U"}
                    </div>
                    <span>{user.name}</span>
                  </Link>
                  <button onClick={logout}
                    style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "9px", padding: "14px", borderRadius: "30px", background: "rgba(232,160,160,0.08)", border: "1px solid rgba(232,160,160,0.2)", color: "#E8A0A0", fontSize: "13px", cursor: "pointer" }}
                  ><HiOutlineLogout size={17} />{isEn ? "Logout" : "Çıkış Yap"}</button>
                </>
              ) : (
                <div style={{ display: "flex", gap: "10px" }}>
                  <Link href={isEn ? "/en/login" : "/login"} onClick={() => setMobileOpen(false)}
                    style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "7px", padding: "14px", borderRadius: "30px", background: "transparent", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(240,237,232,0.7)", textDecoration: "none", fontSize: "13px" }}
                  ><HiOutlineUser size={16} />{isEn ? "Login" : "Giriş"}</Link>
                  <Link href={isEn ? "/en/register" : "/register"} onClick={() => setMobileOpen(false)}
                    style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "7px", padding: "14px", borderRadius: "30px", background: "#C9A84C", color: "#0B0F1A", textDecoration: "none", fontSize: "13px", fontWeight: 600 }}
                  ><HiOutlineUserAdd size={16} />{isEn ? "Register" : "Kayıt Ol"}</Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}