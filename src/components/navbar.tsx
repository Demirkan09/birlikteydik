"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { FaWhatsapp, FaInstagram } from "react-icons/fa";
import { HiOutlineUser, HiOutlineUserAdd, HiMenuAlt3, HiX, HiOutlineLogout, HiOutlineCog } from "react-icons/hi";

// ─── CONFIG — kendi bilgilerini buraya gir ───────────────────────────────────
export const WHATSAPP_NUMBER = "905349829940";
export const WHATSAPP_MESSAGE = "Merhaba! Anılarımız.com'dan sipariş vermek istiyorum.";
export const INSTAGRAM_URL = "https://instagram.com/anilarimiz";
// ────────────────────────────────────────────────────────────────────────────

// Basit auth state — gerçek projede bunu next-auth / supabase vs. ile değiştir
// Şimdilik localStorage'dan okuyoruz
function useAuthState() {
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("anilarimiz_user");
      if (stored) setUser(JSON.parse(stored));
    } catch {}
  }, []);

  const logout = () => {
    localStorage.removeItem("anilarimiz_user");
    setUser(null);
    window.location.href = "/";
  };

  return { user, logout };
}

export default function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const { user, logout } = useAuthState();

  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  // Sayfa değişince mobile menüyü kapat
  useEffect(() => {
    setMobileOpen(false);
    setProfileOpen(false);
  }, [pathname]);

  // Dışarı tıklanınca dropdown kapat
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest("#profile-dropdown")) setProfileOpen(false);
    };
    if (profileOpen) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [profileOpen]);

  const isHome = pathname === "/";

  const navLinks = [
    { label: "Nasıl Çalışır", href: isHome ? "#nasil-calisir" : "/#nasil-calisir" },
    { label: "Özel Günler", href: isHome ? "#ozel-gunler" : "/#ozel-gunler" },
    { label: "Fiyatlar", href: isHome ? "#fiyatlar" : "/#fiyatlar" },
    { label: "SSS", href: isHome ? "#sss" : "/#sss" },
  ];

  const navBg = scrolled || mobileOpen;

  const styles = {
    nav: {
      position: "fixed" as const,
      top: 0, left: 0, right: 0, zIndex: 50,
      padding: "0 24px", height: "64px",
      display: "flex", alignItems: "center", justifyContent: "space-between",
      background: navBg ? "rgba(11,15,26,0.95)" : "transparent",
      backdropFilter: navBg ? "blur(20px)" : "none",
      WebkitBackdropFilter: navBg ? "blur(20px)" : "none",
      borderBottom: navBg ? "1px solid rgba(255,255,255,0.06)" : "none",
      transition: "background 0.4s ease, border-color 0.4s ease",
      fontFamily: "'Inter', sans-serif",
    },
  };

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

      <nav style={styles.nav}>
        {/* Logo */}
        <Link href="/" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.25rem", fontWeight: 600, color: "#F0EDE8", letterSpacing: "0.04em", textDecoration: "none" }}>
          birlikteydik<span style={{ color: "#c9a84c" }}>.com</span>
        </Link>

        {/* Desktop nav links */}
        <div className="nb-desktop" style={{ alignItems: "center", gap: "24px" }}>
          {navLinks.map((l) => (
            <a key={l.href} href={l.href}
              style={{ fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(240,237,232,0.5)", textDecoration: "none", fontWeight: 400, transition: "color 0.2s" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#F0EDE8")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(240,237,232,0.5)")}
            >{l.label}</a>
          ))}
        </div>

        {/* Desktop right actions */}
        <div className="nb-desktop" style={{ alignItems: "center", gap: "10px" }}>
          {/* Instagram */}
          <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" title="Instagram"
            style={{ width: "36px", height: "36px", borderRadius: "50%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(240,237,232,0.6)", textDecoration: "none", transition: "all 0.2s" }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(201,168,76,0.15)"; e.currentTarget.style.borderColor = "#C9A84C66"; e.currentTarget.style.color = "#C9A84C"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; e.currentTarget.style.color = "rgba(240,237,232,0.6)"; }}
          ><FaInstagram size={15} /></a>

          {/* WhatsApp */}
          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer"
            style={{ display: "flex", alignItems: "center", gap: "7px", padding: "8px 16px", borderRadius: "30px", background: "rgba(37,211,102,0.1)", border: "1px solid rgba(37,211,102,0.25)", color: "#25D366", textDecoration: "none", fontSize: "11px", letterSpacing: "0.08em", fontWeight: 500, transition: "background 0.2s" }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(37,211,102,0.2)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(37,211,102,0.1)"; }}
          ><FaWhatsapp size={14} /><span>Sipariş Ver</span></a>

          {/* Auth: giriş yapıldıysa avatar dropdown, yoksa login/register */}
          {user ? (
            <div id="profile-dropdown" style={{ position: "relative" }}>
              <button onClick={() => setProfileOpen(!profileOpen)}
                style={{ display: "flex", alignItems: "center", gap: "8px", padding: "6px 12px 6px 6px", borderRadius: "30px", background: "rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.25)", cursor: "pointer", transition: "background 0.2s" }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(201,168,76,0.18)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(201,168,76,0.1)"; }}
              >
                <div style={{ width: "26px", height: "26px", borderRadius: "50%", background: "linear-gradient(135deg, #C9A84C, #E8A0A0)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", color: "#0B0F1A", fontWeight: 700 }}>
                  {user.name?.[0]?.toUpperCase() ?? "U"}
                </div>
                <span style={{ fontSize: "12px", color: "#F0EDE8", fontWeight: 500 }}>{user.name}</span>
              </button>

              <AnimatePresence>
                {profileOpen && (
                  <motion.div initial={{ opacity: 0, y: -8, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -8, scale: 0.95 }} transition={{ duration: 0.18 }}
                    style={{ position: "absolute", top: "calc(100% + 10px)", right: 0, minWidth: "180px", background: "rgba(13,18,32,0.98)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "14px", padding: "8px", backdropFilter: "blur(20px)", boxShadow: "0 16px 48px rgba(0,0,0,0.5)" }}>
                    <Link href="/profil" style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 14px", borderRadius: "8px", color: "rgba(240,237,232,0.75)", textDecoration: "none", fontSize: "13px", transition: "background 0.15s" }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                    ><HiOutlineCog size={15} />Profilim</Link>
                    <button onClick={logout}
                      style={{ display: "flex", alignItems: "center", gap: "10px", width: "100%", padding: "10px 14px", borderRadius: "8px", color: "rgba(232,160,160,0.8)", background: "none", border: "none", fontSize: "13px", cursor: "pointer", transition: "background 0.15s", textAlign: "left" }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(232,160,160,0.08)"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                    ><HiOutlineLogout size={15} />Çıkış Yap</button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <>
              <Link href="/login"
                style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 14px", borderRadius: "30px", background: "transparent", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(240,237,232,0.65)", textDecoration: "none", fontSize: "11px", letterSpacing: "0.08em", fontWeight: 400, transition: "all 0.2s" }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.25)"; e.currentTarget.style.color = "#F0EDE8"; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; e.currentTarget.style.color = "rgba(240,237,232,0.65)"; }}
              ><HiOutlineUser size={14} /><span>Giriş</span></Link>

              <Link href="/register"
                style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 16px", borderRadius: "30px", background: "#C9A84C", color: "#0B0F1A", textDecoration: "none", fontSize: "11px", letterSpacing: "0.1em", fontWeight: 600, transition: "opacity 0.2s" }}
                onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.85"; }}
                onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
              ><HiOutlineUserAdd size={14} /><span>Kayıt Ol</span></Link>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button className="nb-mobile-btn" onClick={() => setMobileOpen(!mobileOpen)}
          style={{ background: "none", border: "none", color: "#F0EDE8", cursor: "pointer", padding: "4px", alignItems: "center" }}>
          {mobileOpen ? <HiX size={24} /> : <HiMenuAlt3 size={24} />}
        </button>
      </nav>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.25 }}
            style={{ position: "fixed", top: "64px", left: 0, right: 0, zIndex: 49, background: "rgba(11,15,26,0.98)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "20px 24px 32px", display: "flex", flexDirection: "column", gap: "4px", fontFamily: "'Inter', sans-serif" }}>

            {/* Nav links */}
            {navLinks.map((l) => (
              <a key={l.href} href={l.href} onClick={() => setMobileOpen(false)}
                style={{ fontSize: "13px", letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(240,237,232,0.6)", textDecoration: "none", padding: "13px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}
              >{l.label}</a>
            ))}

            <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "20px" }}>
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer"
                style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "9px", padding: "14px", borderRadius: "30px", background: "rgba(37,211,102,0.1)", border: "1px solid rgba(37,211,102,0.25)", color: "#25D366", textDecoration: "none", fontSize: "13px", fontWeight: 500 }}
              ><FaWhatsapp size={17} />WhatsApp ile Sipariş Ver</a>

              <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer"
                style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "9px", padding: "14px", borderRadius: "30px", background: "rgba(201,168,76,0.08)", border: "1px solid rgba(201,168,76,0.2)", color: "#C9A84C", textDecoration: "none", fontSize: "13px", fontWeight: 500 }}
              ><FaInstagram size={17} />Instagram'ı Takip Et</a>

              {user ? (
                <>
                  <Link href="/profil" onClick={() => setMobileOpen(false)}
                    style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "9px", padding: "14px", borderRadius: "30px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#F0EDE8", textDecoration: "none", fontSize: "13px" }}
                  ><HiOutlineCog size={17} />Profilim</Link>
                  <button onClick={logout}
                    style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "9px", padding: "14px", borderRadius: "30px", background: "rgba(232,160,160,0.08)", border: "1px solid rgba(232,160,160,0.2)", color: "#E8A0A0", fontSize: "13px", cursor: "pointer" }}
                  ><HiOutlineLogout size={17} />Çıkış Yap</button>
                </>
              ) : (
                <div style={{ display: "flex", gap: "10px" }}>
                  <Link href="/login" onClick={() => setMobileOpen(false)}
                    style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "7px", padding: "14px", borderRadius: "30px", background: "transparent", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(240,237,232,0.7)", textDecoration: "none", fontSize: "13px" }}
                  ><HiOutlineUser size={16} />Giriş</Link>
                  <Link href="/register" onClick={() => setMobileOpen(false)}
                    style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "7px", padding: "14px", borderRadius: "30px", background: "#C9A84C", color: "#0B0F1A", textDecoration: "none", fontSize: "13px", fontWeight: 600 }}
                  ><HiOutlineUserAdd size={16} />Kayıt Ol</Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}