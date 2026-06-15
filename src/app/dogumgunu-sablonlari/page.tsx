"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { FaWhatsapp, FaInstagram, FaHeart } from "react-icons/fa";
import { HiOutlineUser, HiOutlineUserAdd, HiMenuAlt3, HiX, HiOutlineShoppingCart, HiOutlineEye } from "react-icons/hi";

// ─────────────────────────────────────────────────────────────────────────────
// ŞABLON VERİLERİ — Yeni bir şablon eklemek için bu diziye obje ekleyin.
// ─────────────────────────────────────────────────────────────────────────────
const templates = [
  {
    id: "klasik-retro",
    title: "Klasik Retro",
    subtitle: "Zamanı Durduran Nostalji",
    emoji: "🎞️",
    accentColor: "#C9A84C",
    tag: "En Çok Satan",
    description: "Polaroid çerçeveleri, nostaljik renk filtreleri ve loş mum ışığı geçişleriyle anılarınızı sıcak bir sinema şeridine dönüştürün.",
    demoUrl: "/sablon-retro",
    features: [
      "12-24 Fotoğraf Kapasitesi",
      "Kişisel Müzik / Spotify Desteği",
      "Nostaljik Polaroid Kart Tasarımı",
      "Sonsuza Kadar Aktif Link",
    ],
  },
  {
    id: "modern-minimal",
    title: "Modern Minimal",
    subtitle: "Sade, Şık ve Estetik",
    emoji: "🖤",
    accentColor: "#8c7e6c",
    tag: "Yeni",
    description: "Sadelikten yana olanlar için modern yazı tipleri, geniş boşluklar ve pürüzsüz geçişlerle tasarlanmış minimalist bir aşk hikayesi.",
    demoUrl: "/sablon-minimal",
    features: [
      "15-30 Fotoğraf Kapasitesi",
      "Özel Müzik Oynatıcı Paneli",
      "Gelişmiş Tipografi Efektleri",
      "Hızlı Yüklenen Hafif Altyapı",
    ],
  },
  {
    id: "sinematik-ask",
    title: "Sinematik Aşk",
    subtitle: "Kendi Filminizin Başrolü",
    emoji: "🎬",
    accentColor: "#B8A9D4",
    tag: "Premium",
    description: "Girişte video/fotoğraf perdesi, arkada çalan duygusal piyano melodisi ve adeta film jeneriği gibi akan büyüleyici anılarınız.",
    demoUrl: "/sablon-sinematik",
    features: [
      "50 Fotoğrafa Kadar Yükleme",
      "Giriş Videosu Desteği",
      "Dinamik Arka Plan Parçacıkları",
      "Öncelikli Hazırlama (12 Saat)",
    ],
  },
  {
    id: "premium-emerald",
    title: "Zümrüt Yeşili",
    subtitle: "Lüks ve Derin Detaylar",
    emoji: "🌲",
    accentColor: "#D4AF37",
    tag: "Özel Tasarım",
    description: "Derin orman yeşili arka plan, asil altın süslemeler ve pürüzsüz geçişlerle hazırlanan premium ve prestijli bir şablon.",
    demoUrl: "/sablon-emerald",
    features: [
      "Özel Altın Çerçeve Tasarımı",
      "Premium Arka Plan Melodisi",
      "Altın Işıltılı Efektler",
      "Sonsuza Kadar Aktif Link",
    ],
  },
  {
    id: "romantik-kirmizi",
    title: "Romantik Kırmızı",
    subtitle: "Aşkın ve Tutkunun Rengi",
    emoji: "❤️",
    accentColor: "#E63946",
    tag: "Popüler",
    description: "Aşkın kırmızısı ve şehvetli derin gölgelerin birleştiği, romantik ışık patlamaları ve kalplerle bezeli tutkulu bir hikaye.",
    demoUrl: "/sablon-kirmizi",
    features: [
      "Parıldayan Kalp Parçacıkları",
      "Sıcak Kırmızı Geçiş Efektleri",
      "Fotoğraf Filtre Desteği",
      "Hızlı ve Kolay Özelleştirme",
    ],
  },
  {
    id: "sablon-mavi",
    title: "Premium Mavi",
    subtitle: "Denizlerin ve Balık Burçlarının Rengi",
    emoji: "💙",
    accentColor: "#4a5bfa",
    tag: "Yeni",
    description: "Aşkın kırmızısı ve şehvetli derin gölgelerin birleştiği, romantik ışık patlamaları ve kalplerle bezeli tutkulu bir hikaye.",
    demoUrl: "/sablon-mavi",
    features: [
      "Parıldayan Kalp Parçacıkları",
      "Sıcak Kırmızı Geçiş Efektleri",
      "Fotoğraf Filtre Desteği",
      "Hızlı ve Kolay Özelleştirme",
    ],
  },
  {
    id: "sablon-mavi",
    title: "Premium Mavi",
    subtitle: "Denizlerin ve Balık Burçlarının Rengi",
    emoji: "💙",
    accentColor: "#4a5bfa",
    tag: "Yeni",
    description: "Aşkın kırmızısı ve şehvetli derin gölgelerin birleştiği, romantik ışık patlamaları ve kalplerle bezeli tutkulu bir hikaye.",
    demoUrl: "/sablon-oyun",
    features: [
      "Parıldayan Kalp Parçacıkları",
      "Sıcak Kırmızı Geçiş Efektleri",
      "Fotoğraf Filtre Desteği",
      "Hızlı ve Kolay Özelleştirme",
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// CANVAS — Yüzer kalp parçacıkları (Landing Page ile aynı)
// ─────────────────────────────────────────────────────────────────────────────
type Particle = {
  x: number;
  y: number;
  size: number;
  speed: number;
  opacity: number;
  drift: number;
  phase: number;
};

function HeartsCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    particlesRef.current = Array.from({ length: 30 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      size: Math.random() * 8 + 4,
      speed: Math.random() * 0.3 + 0.1,
      opacity: Math.random() * 0.15 + 0.03,
      drift: (Math.random() - 0.5) * 0.4,
      phase: Math.random() * Math.PI * 2,
    }));

    const drawHeart = (
      cx: number,
      cy: number,
      size: number,
      opacity: number,
      color: string
    ) => {
      ctx.save();
      ctx.globalAlpha = opacity;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(cx, cy + size * 0.3);
      ctx.bezierCurveTo(
        cx, cy, cx - size * 0.7, cy, cx - size * 0.7, cy - size * 0.4
      );
      ctx.bezierCurveTo(
        cx - size * 0.7, cy - size * 1.0, cx, cy - size * 0.9, cx, cy - size * 0.5
      );
      ctx.bezierCurveTo(
        cx, cy - size * 0.9, cx + size * 0.7, cy - size * 1.0, cx + size * 0.7, cy - size * 0.4
      );
      ctx.bezierCurveTo(
        cx + size * 0.7, cy, cx, cy, cx, cy + size * 0.3
      );
      ctx.fill();
      ctx.restore();
    };

    const colors = ["#C9A84C", "#E8A0A0", "#B8A9D4", "#8AA8C8", "#F0EDE8"];
    let t = 0;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      t += 0.008;
      particlesRef.current.forEach((p, i) => {
        p.y -= p.speed;
        p.x += Math.sin(t + p.phase) * p.drift;
        if (p.y < -20) {
          p.y = canvas.height + 10;
          p.x = Math.random() * canvas.width;
        }
        drawHeart(p.x, p.y, p.size, p.opacity, colors[i % colors.length]);
      });
      rafRef.current = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        inset: 0,
        pointerEvents: "none",
        zIndex: 0,
      }}
    />
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTIONS & LAYOUT BUTTONS
// ─────────────────────────────────────────────────────────────────────────────
const WHATSAPP_NUMBER = "905349829940";
const INSTAGRAM_URL = "https://instagram.com/anilarimiz";

function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const WHATSAPP_MESSAGE = "Merhaba! Anılarımız.com'dan sipariş vermek istiyorum.";
  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const navBg = scrolled || mobileOpen;

  return (
    <>
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
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
        <Link href="/" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.25rem", fontWeight: 600, color: "#F0EDE8", letterSpacing: "0.04em", textDecoration: "none" }}>
          anılarımız<span style={{ color: "#C9A84C" }}>.com</span>
        </Link>

        {/* Desktop Links */}
        <div className="nb-desktop" style={{ display: "flex", alignItems: "center", gap: "22px" }}>
          {[
            { label: "Ana Sayfa", href: "/" },
            { label: "Doğum Günü", href: "/dogumgunu-sablonlari" },
            { label: "Yıldönümü", href: "/yildonumu-sablonlari" },
            { label: "Sevgililer Günü", href: "/sevgililergunu-sablonlari" },
          ].map((l) => (
            <Link key={l.href} href={l.href}
              style={{ fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(240,237,232,0.5)", textDecoration: "none", fontWeight: 400, transition: "color 0.2s" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#F0EDE8")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(240,237,232,0.5)")}
            >{l.label}</Link>
          ))}
        </div>

        {/* Desktop Actions */}
        <div className="nb-desktop" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" title="Instagram"
            style={{ width: "36px", height: "36px", borderRadius: "50%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(240,237,232,0.6)", textDecoration: "none", transition: "all 0.2s" }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(201,168,76,0.15)"; e.currentTarget.style.borderColor = "#C9A84C66"; e.currentTarget.style.color = "#C9A84C"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; e.currentTarget.style.color = "rgba(240,237,232,0.6)"; }}
          ><FaInstagram size={15} /></a>

          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer"
            style={{ display: "flex", alignItems: "center", gap: "7px", padding: "8px 14px", borderRadius: "30px", background: "rgba(37,211,102,0.1)", border: "1px solid rgba(37,211,102,0.25)", color: "#25D366", textDecoration: "none", fontSize: "11px", letterSpacing: "0.08em", fontWeight: 500, transition: "background 0.2s" }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(37,211,102,0.2)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(37,211,102,0.1)"; }}
          ><FaWhatsapp size={14} /><span>Sipariş Ver</span></a>

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
        </div>

        {/* Mobile Hamburger */}
        <button className="nb-mobile" onClick={() => setMobileOpen(!mobileOpen)}
          style={{ background: "none", border: "none", color: "#F0EDE8", cursor: "pointer", padding: "4px", display: "none", alignItems: "center" }}>
          {mobileOpen ? <HiX size={24} /> : <HiMenuAlt3 size={24} />}
        </button>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.22 }}
            style={{ position: "fixed", top: "64px", left: 0, right: 0, zIndex: 49, background: "rgba(11,15,26,0.98)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "20px 24px 28px", display: "flex", flexDirection: "column", gap: "4px", fontFamily: "'Inter', sans-serif" }}>
            {[
              { label: "Ana Sayfa", href: "/" },
              { label: "Doğum Günü", href: "/dogumgunu-sablonlari" },
              { label: "Yıldönümü", href: "/yildonumu-sablonlari" },
              { label: "Sevgililer Günü", href: "/sevgililergunu-sablonlari" },
            ].map((l) => (
              <Link key={l.href} href={l.href} onClick={() => setMobileOpen(false)}
                style={{ fontSize: "13px", letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(240,237,232,0.6)", textDecoration: "none", padding: "12px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}
              >{l.label}</Link>
            ))}
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "16px" }}>
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer"
                style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", padding: "13px", borderRadius: "30px", background: "rgba(37,211,102,0.1)", border: "1px solid rgba(37,211,102,0.25)", color: "#25D366", textDecoration: "none", fontSize: "13px", fontWeight: 500 }}
              ><FaWhatsapp size={16} />WhatsApp ile Sipariş Ver</a>
              <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer"
                style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", padding: "13px", borderRadius: "30px", background: "rgba(201,168,76,0.08)", border: "1px solid rgba(201,168,76,0.2)", color: "#C9A84C", textDecoration: "none", fontSize: "13px", fontWeight: 500 }}
              ><FaInstagram size={16} />Instagram'ı Takip Et</a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SMARTPHONE VIEWPORT MOCKUP (Dinamik CSS Önizleme)
// ─────────────────────────────────────────────────────────────────────────────
function SmartphoneMockup({ accentColor, title, emoji }: { accentColor: string; title: string; emoji: string }) {
  return (
    <div style={{
      width: "100%",
      aspectRatio: "1.6/1",
      background: "#080b13",
      borderBottom: "1px solid rgba(255,255,255,0.06)",
      position: "relative",
      overflow: "hidden",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "24px",
    }}>
      {/* Dynamic blurred background bubble */}
      <div style={{
        position: "absolute",
        width: "140px",
        height: "140px",
        borderRadius: "50%",
        background: `radial-gradient(circle, ${accentColor}25 0%, transparent 70%)`,
        filter: "blur(15px)",
        top: "10%",
        left: "30%",
      }} />

      {/* Mock Phone Container */}
      <div style={{
        width: "140px",
        height: "220px",
        background: "#0d0e12",
        border: "3px solid #1a1c24",
        borderRadius: "20px",
        position: "relative",
        boxShadow: "0 12px 32px rgba(0,0,0,0.6)",
        transform: "rotate(-5deg) translateY(10px)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}>
        {/* Camera Notch */}
        <div style={{
          width: "40px",
          height: "8px",
          background: "#1a1c24",
          borderRadius: "0 0 6px 6px",
          position: "absolute",
          top: 0,
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 5,
        }} />

        {/* Simulated Phone Screen Content */}
        <div style={{
          padding: "16px 8px 8px",
          display: "flex",
          flexDirection: "column",
          gap: "8px",
          height: "100%",
          justifyContent: "space-between",
        }}>
          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "6px", color: "rgba(255,255,255,0.3)", letterSpacing: "0.05em" }}>anılarımız.com</span>
            <span style={{ fontSize: "6px", color: accentColor }}>❤️</span>
          </div>

          {/* Core Content Vibe */}
          <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            gap: "4px",
            marginTop: "8px",
          }}>
            <div style={{ fontSize: "1.2rem" }}>{emoji}</div>
            <h5 style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "9px",
              color: "#F0EDE8",
              fontWeight: 600,
              lineHeight: 1,
            }}>
              İyi ki Doğdun!
            </h5>
            <div style={{
              width: "20px",
              height: "1px",
              background: accentColor,
            }} />
          </div>

          {/* Photo Frame Mockup */}
          <div style={{
            flex: 1,
            background: "rgba(255,255,255,0.02)",
            border: `1px dashed ${accentColor}55`,
            borderRadius: "6px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
            overflow: "hidden",
            margin: "4px 0",
          }}>
            <div style={{ fontSize: "14px", opacity: 0.2 }}>📸</div>
            {/* Overlay sparkle */}
            <div style={{
              position: "absolute",
              top: "4px",
              right: "4px",
              fontSize: "6px",
              color: accentColor,
            }}>✨</div>
          </div>

          {/* Music Controller Mockup */}
          <div style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: "12px",
            padding: "3px 6px",
            display: "flex",
            alignItems: "center",
            gap: "4px",
          }}>
            <div style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              background: accentColor,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "4px",
              color: "#000",
            }}>▶</div>
            <div style={{ flex: 1, height: "2px", background: "rgba(255,255,255,0.1)", borderRadius: "1px", position: "relative" }}>
              <div style={{ position: "absolute", left: 0, top: 0, height: "100%", width: "40%", background: accentColor, borderRadius: "1px" }} />
            </div>
          </div>
        </div>
      </div>

      {/* Floating secondary decorative card */}
      <div style={{
        position: "absolute",
        right: "24px",
        bottom: "28px",
        background: "rgba(255, 255, 255, 0.03)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        border: "1px solid rgba(255, 255, 255, 0.08)",
        borderRadius: "10px",
        padding: "8px 12px",
        boxShadow: "0 8px 20px rgba(0,0,0,0.3)",
        display: "flex",
        flexDirection: "column",
        gap: "4px",
        transform: "rotate(6deg)",
        pointerEvents: "none",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span style={{ fontSize: "10px" }}>🌟</span>
          <span style={{ fontSize: "8px", fontFamily: "'Inter', sans-serif", color: "#F0EDE8", fontWeight: 500 }}>{title}</span>
        </div>
        <span style={{ fontSize: "7px", fontFamily: "'Inter', sans-serif", color: "rgba(240,237,232,0.4)" }}>Sürpriz Hazır</span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN TEMPLATES SHOWCASE
// ─────────────────────────────────────────────────────────────────────────────
export default function TemplatesPage() {
  return (
    <>
      {/* Global Style overrides */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,600&family=Inter:wght@300;400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body { background: #0B0F1A; overflow-x: hidden; color: #F0EDE8; }
        ::selection { background: rgba(201,168,76,0.28); color: #F0EDE8; }
        .nb-desktop { display: flex !important; }
        .nb-mobile  { display: none !important; }
        @media (max-width: 900px) {
          .nb-desktop { display: none !important; }
          .nb-mobile  { display: flex !important; }
        }
      `}</style>

      {/* Arka plan gradient katmanları */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 0,
          background: `
            radial-gradient(ellipse 70% 55% at 15% 20%, rgba(201,168,76,0.06) 0%, transparent 60%),
            radial-gradient(ellipse 60% 45% at 85% 75%, rgba(232,160,160,0.05) 0%, transparent 55%),
            radial-gradient(ellipse 80% 60% at 50% 100%, rgba(11,30,60,0.5) 0%, transparent 60%),
            linear-gradient(160deg, #0B0F1A 0%, #0d1220 50%, #0a0d18 100%)
          `,
          pointerEvents: "none",
        }}
      />

      {/* Yüzer kalpler */}
      <HeartsCanvas />

      {/* WhatsApp & Instagram Floating Buttons */}
      <div style={{ position: "fixed", bottom: "24px", right: "24px", zIndex: 40, display: "flex", flexDirection: "column", gap: "10px" }}>
        <a href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Merhaba! Doğum günü şablonları hakkında bilgi almak istiyorum.")}`} target="_blank" rel="noopener noreferrer" title="WhatsApp"
          style={{ width: "48px", height: "48px", borderRadius: "50%", background: "rgba(11,15,26,0.9)", border: "1px solid rgba(37,211,102,0.35)", backdropFilter: "blur(12px)", display: "flex", alignItems: "center", justifyContent: "center", color: "#25D366", textDecoration: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.4)", transition: "transform 0.2s" }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = "scale(1.1)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
        ><FaWhatsapp size={21} /></a>
        <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" title="Instagram"
          style={{ width: "48px", height: "48px", borderRadius: "50%", background: "rgba(11,15,26,0.9)", border: "1px solid rgba(201,168,76,0.3)", backdropFilter: "blur(12px)", display: "flex", alignItems: "center", justifyContent: "center", color: "#C9A84C", textDecoration: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.4)", transition: "transform 0.2s" }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = "scale(1.1)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
        ><FaInstagram size={19} /></a>
      </div>

      {/* Nav */}
      <Navbar />

      <main style={{ position: "relative", zIndex: 1, minHeight: "100vh", paddingTop: "120px", paddingBottom: "100px" }}>
        
        {/* HERO SECTION */}
        <section style={{ maxWidth: "1100px", margin: "0 auto", padding: "40px 24px 60px", textAlign: "center" }}>
          
          {/* Eyebrow */}
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "20px", justifyContent: "center" }}
          >
            <div style={{ height: "1px", width: "32px", background: "#C9A84C88" }} />
            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "10px", letterSpacing: "0.38em", textTransform: "uppercase", color: "#C9A84C", fontWeight: 500 }}>
              Şablon Vitrini
            </span>
            <div style={{ height: "1px", width: "32px", background: "#C9A84C88" }} />
          </motion.div>

          {/* Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "clamp(2.5rem, 5.5vw, 4.5rem)",
              fontWeight: 600,
              lineHeight: 1.1,
              letterSpacing: "-0.015em",
              color: "#F0EDE8",
              marginBottom: "16px",
            }}
          >
            Doğum Günü
            <br />
            <em style={{ color: "#C9A84C", fontStyle: "italic" }}>Şablonları</em>
          </motion.h1>

          {/* Sub */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.9 }}
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "clamp(0.9rem, 2.2vw, 1.05rem)",
              color: "rgba(240,237,232,0.45)",
              lineHeight: 1.8,
              maxWidth: "50ch",
              margin: "0 auto",
              fontWeight: 300,
              letterSpacing: "0.01em",
            }}
          >
            Sevgilinizin doğum gününü benzersiz bir dijital sürprizle taçlandırın. Beğendiğiniz şablonun önizlemesini inceleyin ve tek tıkla sipariş oluşturun.
          </motion.p>
        </section>

        {/* SHOWCASE GRID */}
        <section style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 24px" }}>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 340px), 1fr))",
            gap: "24px",
          }}>
            {templates.map((tpl, i) => {
              // Prefilled message for this specific template
              const orderMessage = `Merhaba! "${tpl.title}" isimli Doğum Günü şablonunu seçtim. Sipariş vermek veya detaylı bilgi almak istiyorum.`;
              const tplWhatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(orderMessage)}`;
              
              return (
                <motion.article
                  key={tpl.id}
                  initial={{ opacity: 0, y: 32 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1, duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
                  style={{
                    position: "relative",
                    borderRadius: "20px",
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.06)",
                    backdropFilter: "blur(18px)",
                    WebkitBackdropFilter: "blur(18px)",
                    overflow: "hidden",
                    display: "flex",
                    flexDirection: "column",
                    boxShadow: "0 10px 40px rgba(0,0,0,0.35)",
                    transition: "border-color 0.35s ease, box-shadow 0.35s ease, transform 0.3s ease",
                  }}
                  whileHover={{
                    borderColor: `${tpl.accentColor}55`,
                    boxShadow: `0 20px 50px rgba(0,0,0,0.5), 0 0 0 1px ${tpl.accentColor}22`,
                    y: -6,
                  }}
                >
                  {/* Accent lighting cover */}
                  <div style={{
                    position: "absolute",
                    inset: 0,
                    background: `radial-gradient(ellipse at top left, ${tpl.accentColor}10 0%, transparent 60%)`,
                    pointerEvents: "none",
                  }} />

                  {/* Badge Tag */}
                  {tpl.tag && (
                    <span style={{
                      position: "absolute",
                      top: "16px",
                      left: "16px",
                      fontSize: "9px",
                      letterSpacing: "0.12em",
                      textTransform: "uppercase",
                      fontFamily: "'Inter', sans-serif",
                      fontWeight: 600,
                      color: tpl.accentColor,
                      background: `${tpl.accentColor}18`,
                      border: `1px solid ${tpl.accentColor}33`,
                      borderRadius: "20px",
                      padding: "4px 10px",
                      zIndex: 10,
                    }}>
                      {tpl.tag}
                    </span>
                  )}

                  {/* Simulated Mobile Mockup Viewport */}
                  <SmartphoneMockup accentColor={tpl.accentColor} title={tpl.title} emoji={tpl.emoji} />

                  {/* Card Content */}
                  <div style={{ padding: "28px", display: "flex", flexDirection: "column", flex: 1 }}>
                    
                    {/* Header */}
                    <div style={{ marginBottom: "16px" }}>
                      <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
                        <span style={{ fontSize: "1.4rem" }}>{tpl.emoji}</span>
                        <h3 style={{
                          fontFamily: "'Cormorant Garamond', serif",
                          fontSize: "1.65rem",
                          fontWeight: 600,
                          color: "#F0EDE8",
                        }}>
                          {tpl.title}
                        </h3>
                      </div>
                      <p style={{
                        fontFamily: "'Inter', sans-serif",
                        fontSize: "9px",
                        letterSpacing: "0.22em",
                        textTransform: "uppercase",
                        color: `${tpl.accentColor}cc`,
                        marginTop: "2px",
                      }}>
                        {tpl.subtitle}
                      </p>
                    </div>

                    {/* Divider line */}
                    <div style={{ width: "40px", height: "1px", background: `linear-gradient(90deg, ${tpl.accentColor}, transparent)`, marginBottom: "16px" }} />

                    {/* Description */}
                    <p style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: "13px",
                      lineHeight: 1.8,
                      color: "rgba(240,237,232,0.5)",
                      fontWeight: 300,
                      marginBottom: "24px",
                    }}>
                      {tpl.description}
                    </p>

                    {/* Features checklist */}
                    <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "10px", marginBottom: "32px", marginTop: "auto" }}>
                      {tpl.features.map((feat, idx) => (
                        <li key={idx} style={{ display: "flex", alignItems: "flex-start", gap: "8px", fontFamily: "'Inter', sans-serif", fontSize: "12px", color: "rgba(240,237,232,0.65)", fontWeight: 300 }}>
                          <span style={{ color: tpl.accentColor, fontWeight: "bold" }}>✓</span>
                          {feat}
                        </li>
                      ))}
                    </ul>

                    {/* CTAs */}
                    <div style={{ display: "flex", gap: "10px", marginTop: "auto" }}>
                      {/* Live Demo */}
                      <Link href={tpl.demoUrl} style={{
                        flex: 1,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "6px",
                        padding: "12px",
                        borderRadius: "30px",
                        background: "rgba(255,255,255,0.04)",
                        border: "1px solid rgba(255,255,255,0.08)",
                        color: "rgba(240,237,232,0.8)",
                        textDecoration: "none",
                        fontFamily: "'Inter', sans-serif",
                        fontSize: "11px",
                        letterSpacing: "0.1em",
                        textTransform: "uppercase",
                        fontWeight: 500,
                        transition: "all 0.2s",
                      }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = "rgba(255,255,255,0.08)";
                          e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)";
                          e.currentTarget.style.color = "#F0EDE8";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                          e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
                          e.currentTarget.style.color = "rgba(240,237,232,0.8)";
                        }}
                      >
                        <HiOutlineEye size={14} />
                        <span>Canlı Demoyu Aç</span>
                      </Link>

                      {/* WhatsApp Order */}
                      <a href={tplWhatsappUrl} target="_blank" rel="noopener noreferrer" style={{
                        flex: 1.2,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "6px",
                        padding: "12px",
                        borderRadius: "30px",
                        background: tpl.accentColor,
                        color: "#0B0F1A",
                        textDecoration: "none",
                        fontFamily: "'Inter', sans-serif",
                        fontSize: "11px",
                        letterSpacing: "0.1em",
                        textTransform: "uppercase",
                        fontWeight: 600,
                        transition: "opacity 0.2s",
                      }}
                        onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.85"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
                      >
                        <HiOutlineShoppingCart size={13} />
                        <span>Seç ve Sipariş Ver</span>
                      </a>
                    </div>

                  </div>
                </motion.article>
              );
            })}
          </div>
        </section>

        {/* HOW TO CUSTOMIZE INFO */}
        <section style={{ maxWidth: "800px", margin: "100px auto 0", padding: "0 24px" }}>
          <div style={{
            borderRadius: "24px",
            padding: "40px",
            background: "rgba(201,168,76,0.04)",
            border: "1px solid rgba(201,168,76,0.12)",
            textAlign: "center",
          }}>
            <h4 style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "1.75rem",
              color: "#F0EDE8",
              marginBottom: "12px",
              fontWeight: 500,
            }}>
              İstediğiniz Tüm Değişiklikleri Yapıyoruz
            </h4>
            <p style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "13px",
              lineHeight: 1.8,
              color: "rgba(240,237,232,0.45)",
              fontWeight: 300,
              maxWidth: "60ch",
              margin: "0 auto 24px",
            }}>
              Seçtiğiniz şablonun renk paletini, yazı stillerini, müzik parçalarını ve içerik akışını tamamen sevgilinizin hoşuna gidecek şekilde ücretsiz olarak revize ediyoruz. Siz sadece anılarınızı gönderin, gerisini bize bırakın.
            </p>
            <Link href="/" style={{
              display: "inline-block",
              fontFamily: "'Inter', sans-serif",
              fontSize: "11px",
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              color: "#C9A84C",
              textDecoration: "none",
              fontWeight: 500,
              borderBottom: "1px solid #C9A84C88",
              paddingBottom: "2px",
              transition: "border-color 0.2s",
            }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#C9A84C")}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#C9A84C88")}
            >
              ← Ana Sayfaya Geri Dön
            </Link>
          </div>
        </section>

      </main>

      {/* FOOTER */}
      <footer style={{
        position: "relative",
        zIndex: 1,
        borderTop: "1px solid rgba(255,255,255,0.05)",
        padding: "36px 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: "16px",
        maxWidth: "1100px",
        margin: "0 auto",
      }}>
        <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.1rem", color: "rgba(240,237,232,0.5)" }}>
          anılarımız<span style={{ color: "#C9A84C" }}>.com</span>
        </span>
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "11px", color: "rgba(240,237,232,0.2)", letterSpacing: "0.08em" }}>
          © {new Date().getFullYear()} — Sevgiyle yapıldı
        </p>
      </footer>
    </>
  );
}
