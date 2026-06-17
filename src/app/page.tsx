"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { FaWhatsapp, FaInstagram, FaHeart } from "react-icons/fa";
import { HiOutlineShoppingCart } from "react-icons/hi";

// ─────────────────────────────────────────────────────────────────────────────
// Sosyal medya sabitleri (yüzer butonlar için)
// ─────────────────────────────────────────────────────────────────────────────
const WHATSAPP_NUMBER  = "905349829940";
const WHATSAPP_MESSAGE = "Merhaba! birlikteydik.com'dan sipariş vermek istiyorum.";
const INSTAGRAM_URL    = "https://instagram.com/birlikteydik";

// VERİ — Yeni bir özel gün eklemek için sadece bu diziye bir obje ekle.
// Kart otomatik olarak grid'e eklenir, başka bir şey yapman gerekmez.
// ─────────────────────────────────────────────────────────────────────────────
const occasions = [
  {
    id: 1,
    emoji: "🎂",
    title: "Doğum Günü",
    subtitle: "Özel Anın Hikayesi",
    description:
      "Sevgilinin doğum gününü unutulmaz kıl. Birlikte geçirdiğiniz en güzel anları sinematik bir film gibi anlatan kişisel sayfan hazır.",
    accentColor: "#C9A84C",
    tag: "En Popüler",
    href: "/dogumgunu-sablonlari",   // ← bunu ekle
  },
  {
    id: 2,
    emoji: "💍",
    title: "Yıldönümü",
    subtitle: "Birlikte Geçen Yıllar",
    description:
      "Kaç yıl, kaç anı, kaç kahkaha? Yıldönümünüzü birlikte büyüyen bir hikaye albümüyle kutla.",
    accentColor: "#E8A0A0",
    tag: null,
    href: "/yildonumu-sablonlari",   // ← bunu ekle
  },
  {
    id: 3,
    emoji: "❤️",
    title: "Sevgililer Günü",
    subtitle: "14 Şubat Sürprizi",
    description:
      "Yılın en romantik gününde sıradan olmayan bir sürpriz. Sayfana özel müzik ve kişisel mesajını ekle.",
    accentColor: "#C9A84C",
    tag: "Çok Beğenildi",
    href: "/sevgililergunu-sablonlari",   // ← bunu ekle
  },
  {
    id: 4,
    emoji: "✨",
    title: "İlk Tanışma",
    subtitle: "Her Şeyin Başladığı Gün",
    description:
      "İlk bakış, ilk gülümseme… O günü anlatan özel bir sayfa onun için en güzel hediye olabilir.",
    accentColor: "#B8A9D4",
    tag: null,
    href: "/ilktanisma-sablonlari",   // ← bunu ekle
  },
  {
    id: 5,
    emoji: "🌸",
    title: "Sadece Öyle",
    subtitle: "Sebepsiz Sevgi",
    description:
      "Bazen en anlamlı jest, hiçbir özel gün olmaksızın yapılandır. 'Seni düşündüm' demek için yeterli.",
    accentColor: "#E8A0A0",
    tag: null,
    href: "/sebepsizsevgi-sablonlari",   // ← bunu ekle
  },
  {
    id: 6,
    emoji: "🌙",
    title: "İyi Geceler",
    subtitle: "Uykudan Önce Sürpriz",
    description:
      "Gece yatmadan önce telefonunu açtığında onu bekleyen, senin ellerin tarafından hazırlanmış bir anı sayfası.",
    accentColor: "#8AA8C8",
    tag: null,
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// CANVAS — Yüzer kalp parçacıkları (CSS/JS, GPU yok)
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

    // Parçacık başlangıç değerleri
    particlesRef.current = Array.from({ length: 38 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      size: Math.random() * 10 + 5,
      speed: Math.random() * 0.4 + 0.15,
      opacity: Math.random() * 0.18 + 0.04,
      drift: (Math.random() - 0.5) * 0.5,
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
// OCCASION CARD
// ─────────────────────────────────────────────────────────────────────────────
function OccasionCard({
  occasion,
  index,
}: {
  occasion: (typeof occasions)[0];
  index: number;
}) {
  const [hovered, setHovered] = useState(false);

  return (
<Link 
  href={occasion.href ?? "/"} 
  style={{ textDecoration: "none", display: "block" }}
>
      <motion.article
        initial={{ opacity: 0, y: 32 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ delay: index * 0.08, duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          position: "relative",
          borderRadius: "18px",
          padding: "32px 28px",
          cursor: "pointer",
          overflow: "hidden",
          background: "rgba(255,255,255,0.035)",
          border: `1px solid ${hovered ? occasion.accentColor + "66" : "rgba(255,255,255,0.07)"}`,
          backdropFilter: "blur(18px)",
          WebkitBackdropFilter: "blur(18px)",
          boxShadow: hovered
            ? `0 24px 64px rgba(0, 0, 0, 0.5), 0 0 0 1px ${occasion.accentColor}33`
            : "0 4px 32px rgba(0,0,0,0.35)",
          transition: "border-color 0.35s ease, box-shadow 0.35s ease, transform 0.3s ease",
          transform: hovered ? "translateY(-5px)" : "translateY(0)",
        }}
      >
        {/* Accent overlay */}
        <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse at top left, ${occasion.accentColor}18 0%, transparent 65%)`, opacity: hovered ? 1 : 0.5, transition: "opacity 0.35s ease", pointerEvents: "none", borderRadius: "18px" }} />

        {/* Tag */}
        {occasion.tag && (
          <span style={{ position: "absolute", top: "18px", right: "18px", fontSize: "10px", letterSpacing: "0.12em", textTransform: "uppercase", fontFamily: "'Inter', sans-serif", fontWeight: 500, color: occasion.accentColor, background: occasion.accentColor + "18", border: `1px solid ${occasion.accentColor}44`, borderRadius: "20px", padding: "3px 10px" }}>
            {occasion.tag}
          </span>
        )}

        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ fontSize: "2.6rem", lineHeight: 1, marginBottom: "18px" }}>{occasion.emoji}</div>
          <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(1.35rem, 2.5vw, 1.7rem)", fontWeight: 600, color: "#F0EDE8", marginBottom: "4px", lineHeight: 1.15, letterSpacing: "-0.01em" }}>{occasion.title}</h3>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "10px", letterSpacing: "0.22em", textTransform: "uppercase", color: occasion.accentColor + "bb", marginBottom: "16px", fontWeight: 400 }}>{occasion.subtitle}</p>
          <div style={{ width: "36px", height: "1px", background: `linear-gradient(90deg, ${occasion.accentColor}, transparent)`, marginBottom: "16px" }} />
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "13px", lineHeight: 1.8, color: "rgba(240,237,232,0.5)", fontWeight: 300 }}>{occasion.description}</p>

          {/* CTA — sepet ikonu eklendi */}
          <div style={{ marginTop: "22px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", transform: hovered ? "translateX(5px)" : "translateX(0)", transition: "transform 0.3s ease" }}>
              <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "11px", letterSpacing: "0.18em", textTransform: "uppercase", color: occasion.accentColor, fontWeight: 500 }}>Şablonları Gör</span>
              <span style={{ color: occasion.accentColor, fontSize: "14px" }}>→</span>
            </div>
            {/* Sepet ikonu */}
            <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: occasion.accentColor + "18", border: `1px solid ${occasion.accentColor}44`, display: "flex", alignItems: "center", justifyContent: "center", transition: "background 0.2s", ...(hovered ? { background: occasion.accentColor + "33" } : {}) }}>
              <HiOutlineShoppingCart size={15} color={occasion.accentColor} />
            </div>
          </div>
        </div>
      </motion.article>
    </Link>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// HOW IT WORKS — 3 adım
// ─────────────────────────────────────────────────────────────────────────────
const steps = [
  {
    num: "01",
    title: "Fotoğraflarını Gönder",
    body: "Birlikte çektiğin en güzel kareleri bize ilet. Seçim yapmana bile gerek yok, hepsini gönder.",
  },
  {
    num: "02",
    title: "Kişiselleştir",
    body: "Özel mesajını, müziğini ve özel gün detaylarını paylaş. Her şeyi sizin için hazırlıyoruz.",
  },
  {
    num: "03",
    title: "Linki Paylaş",
    body: "24 saat içinde özel linkin hazır. Tek tıkla ona gönder, o açsın ve şaşırsın.",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// TESTIMONIALS
// ─────────────────────────────────────────────────────────────────────────────
const testimonials = [
  {
    quote: "Melis linke tıkladığında ağladı. Hayatımda verdiğim en iyi hediye buydu.",
    name: "Demirkan D.",
    occasion: "Sebepsiz Sevgi",
  },
  {
    quote: "3 yıllık birlikteydikı böyle güzel bir sayfada görmek inanılmazdı.",
    name: "Selin T.",
    occasion: "Yıldönümü",
  },
  {
    quote: "14 Şubat'ta sıradan çiçek almak yerine bunu yaptım. Farkı muazzamdı.",
    name: "Kerem Y.",
    occasion: "Sevgililer Günü",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// FAQ
// ─────────────────────────────────────────────────────────────────────────────
const faqs = [
  {
    q: "Sayfa ne kadar sürede hazır olur?",
    a: "Siparişin onaylandıktan itibaren 24 saat içinde özel linkin e-posta ile sana iletilir.",
  },
  {
    q: "Kaç fotoğraf gönderebilirim?",
    a: "İstediğin kadar fotoğraf gönderebilirsin. Paketine göre sayfanda 10'dan 50'ye kadar fotoğraf gösterilir.",
  },
  {
    q: "Link ne kadar süre aktif kalır?",
    a: "Temel pakette 1 yıl, premium pakette sonsuza kadar aktif kalır.",
  },
  {
    q: "Müzik ekleyebilir miyim?",
    a: "Evet! Spotify veya YouTube linki paylaşman yeterli, sayfa açıldığında müzik otomatik başlar.",
  },
  {
    q: "Sayfa tasarımını sonradan değiştirebilir miyim?",
    a: "Premium pakette sınırsız revizyon hakkın var. Temel pakette yayına alındıktan sonra 1 revizyon yapılabilir.",
  },
];

function FaqItem({ faq }: { faq: (typeof faqs)[0] }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      style={{
        borderBottom: "1px solid rgba(255, 255, 255, 0.07)",
        padding: "20px 0",
      }}
    >
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: "100%",
          background: "none",
          border: "none",
          cursor: "pointer",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "16px",
          textAlign: "left",
          padding: 0,
        }}
      >
        <span
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: "clamp(1rem, 2vw, 1.2rem)",
            fontWeight: 500,
            color: "#F0EDE8",
            lineHeight: 1.4,
          }}
        >
          {faq.q}
        </span>
        <span
          style={{
            color: "#C9A84C",
            fontSize: "20px",
            flexShrink: 0,
            transition: "transform 0.3s ease",
            display: "inline-block",
            transform: open ? "rotate(45deg)" : "rotate(0deg)",
          }}
        >
          +
        </span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            style={{ overflow: "hidden" }}
          >
            <p
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: "14px",
                lineHeight: 1.85,
                color: "rgba(240,237,232,0.5)",
                fontWeight: 300,
                marginTop: "12px",
                paddingRight: "32px",
              }}
            >
              {faq.a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PRICING
// ─────────────────────────────────────────────────────────────────────────────
const plans = [
  {
    name: "Temel",
    price: "₺499",
    features: [
      "12 fotoğrafa kadar",
      "Özel mesaj & isim",
      "6 ay aktif link",
      "3 şablon seçeneği",
    ],
    highlighted: false,
    cta: "Sipariş Ver",
  },
  {
    name: "Premium",
    price: "₺1499",
    features: [
      "50 fotoğrafa kadar",
      "Özel müzik ekleme",
      "1 yıl aktif link",
      "20+ şablon seçeneği",
      "Öncelikli hazırlama (12 saat)",
    ],
    highlighted: true,
    cta: "En Çok Tercih Edilen",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// SECTION WRAPPER (tekrar eden layout)
// ─────────────────────────────────────────────────────────────────────────────
function Section({
  children,
  id,
  style,
}: {
  children: React.ReactNode;
  id?: string;
  style?: React.CSSProperties;
}) {
  return (
    <section
      id={id}
      style={{
        position: "relative",
        zIndex: 1,
        maxWidth: "1100px",
        margin: "0 auto",
        padding: "100px 24px",
        ...style,
      }}
    >
      {children}
    </section>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "14px",
        marginBottom: "16px",
        justifyContent: "center",
      }}
    >
      <div style={{ height: "1px", width: "32px", background: "#C9A84C88" }} />
      <span
        style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: "10px",
          letterSpacing: "0.38em",
          textTransform: "uppercase",
          color: "#C9A84C",
          fontWeight: 500,
        }}
      >
        {children}
      </span>
      <div style={{ height: "1px", width: "32px", background: "#C9A84C88" }} />
    </div>
  );
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2
      style={{
        fontFamily: "'Cormorant Garamond', serif",
        fontSize: "clamp(2rem, 4.5vw, 3.2rem)",
        fontWeight: 600,
        color: "#F0EDE8",
        textAlign: "center",
        lineHeight: 1.15,
        letterSpacing: "-0.015em",
        marginBottom: "52px",
      }}
    >
      {children}
    </h2>
  );
}


// ─────────────────────────────────────────────────────────────────────────────
// HERO
// ─────────────────────────────────────────────────────────────────────────────
function Hero() {
  return (
    <div
      style={{
        position: "relative",
        zIndex: 1,
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "100px 24px 80px",
      }}
    >
      {/* Eyebrow */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.9 }}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "14px",
          marginBottom: "28px",
        }}
      >
        <div style={{ height: "1px", width: "40px", background: "#C9A84C88" }} />
        <span
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: "10px",
            letterSpacing: "0.42em",
            textTransform: "uppercase",
            color: "#C9A84C",
            fontWeight: 500,
          }}
        >
          Sevdiklerine Özel Bir Sürpriz
        </span>
        <div style={{ height: "1px", width: "40px", background: "#C9A84C88" }} />
      </motion.div>

      {/* Main heading */}
      <motion.h1
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
        style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: "clamp(3rem, 8vw, 6.5rem)",
          fontWeight: 600,
          lineHeight: 1.05,
          letterSpacing: "-0.02em",
          color: "#F0EDE8",
          maxWidth: "14ch",
          marginBottom: "16px",
        }}
      >
        Anılarınız
        <br />
        <em style={{ color: "#C9A84C", fontStyle: "italic" }}>
          Bir Linke
        </em>
        <br />
        Sığıyor
      </motion.h1>

      {/* Sub */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9, duration: 1 }}
        style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: "clamp(0.9rem, 2vw, 1.05rem)",
          color: "rgba(240,237,232,0.45)",
          lineHeight: 1.85,
          maxWidth: "44ch",
          fontWeight: 300,
          marginBottom: "44px",
          letterSpacing: "0.02em",
        }}
      >
        Fotoğraflarınızı, müziğinizi ve mesajınızı bir araya getiriyoruz.
        Sevgilinize özel bir link gönder — açsın ve şaşırsın.
      </motion.p>

      {/* CTAs */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.1, duration: 0.8 }}
        style={{ display: "flex", gap: "14px", flexWrap: "wrap", justifyContent: "center" }}
      >
        <a
          href="#ozel-gunler"
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: "13px",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            fontWeight: 500,
            color: "#0B0F1A",
            background: "#C9A84C",
            padding: "14px 32px",
            borderRadius: "40px",
            textDecoration: "none",
            transition: "opacity 0.2s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
        >
          Hemen Sipariş Ver
        </a>
        <a
          href="#nasil-calisir"
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: "13px",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            fontWeight: 400,
            color: "rgba(240,237,232,0.65)",
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.1)",
            padding: "14px 32px",
            borderRadius: "40px",
            textDecoration: "none",
            backdropFilter: "blur(8px)",
            transition: "border-color 0.2s, color 0.2s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "rgba(255,255,255,0.25)";
            e.currentTarget.style.color = "#F0EDE8";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
            e.currentTarget.style.color = "rgba(240,237,232,0.65)";
          }}
        >
          Nasıl Çalışır?
        </a>
      </motion.div>

      {/* Sample link preview — açıklama etiketi */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4, duration: 0.8 }}
        style={{ marginTop: "56px", display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div style={{ height: "1px", width: "20px", background: "rgba(201,168,76,0.3)" }} />
          <span style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: "10px",
            letterSpacing: "0.3em",
            textTransform: "uppercase",
            color: "rgba(201,168,76,0.6)",
            fontWeight: 500,
          }}>
            Müşteriye verilen link böyle görünür
          </span>
          <div style={{ height: "1px", width: "20px", background: "rgba(201,168,76,0.3)" }} />
        </div>

      {/* Sample link preview */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
        style={{
          padding: "14px 28px",
          borderRadius: "14px",
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.08)",
          backdropFilter: "blur(12px)",
          display: "flex",
          alignItems: "center",
          gap: "12px",
        }}
      >
        <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#4ade80", flexShrink: 0, boxShadow: "0 0 8px #4ade8088" }} />
        <span
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: "13px",
            color: "rgba(240,237,232,0.5)",
            fontWeight: 300,
            letterSpacing: "0.03em",
          }}
        >
          birlikteydik.com/
          <span style={{ color: "#C9A84C" }}>senintasarimin</span>
        </span>
      </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1 }}
        style={{
          position: "absolute",
          bottom: "36px",
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "8px",
        }}
      >
        <span
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: "9px",
            letterSpacing: "0.38em",
            textTransform: "uppercase",
            color: "rgba(240,237,232,0.2)",
          }}
        >
          Keşfet
        </span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ opacity: 0.25 }}>
            <path d="M12 5v14M5 12l7 7 7-7" stroke="#F0EDE8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </motion.div>
      </motion.div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ANA SAYFA
// ─────────────────────────────────────────────────────────────────────────────
export default function LandingPage() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,600&family=Inter:wght@300;400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body { background: #0B0F1A; overflow-x: hidden; color: #F0EDE8; }
        ::selection { background: rgba(201,168,76,0.28); color: #F0EDE8; }
        @media (min-width: 640px) { .nav-link { display: inline !important; } }
        .nb-desktop { display: flex !important; }
        .nb-mobile  { display: none !important; }
          @media (max-width: 900px) {
        .nb-desktop { display: none !important; }
        .nb-mobile  { display: flex !important; }
      `}</style>

      {/* Arka plan gradient katmanları */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 0,
          background: `
            radial-gradient(ellipse 70% 55% at 15% 20%, rgba(201,168,76,0.07) 0%, transparent 60%),
            radial-gradient(ellipse 60% 45% at 85% 75%, rgba(232,160,160,0.06) 0%, transparent 55%),
            radial-gradient(ellipse 80% 60% at 50% 100%, rgba(11,30,60,0.6) 0%, transparent 60%),
            linear-gradient(160deg, #0B0F1A 0%, #0d1220 50%, #0a0d18 100%)
          `,
          pointerEvents: "none",
        }}
      />

      {/* Yüzer kalpler */}
      <HeartsCanvas />
{/* Sabit sağ alt köşe butonları */}
<div style={{ position: "fixed", bottom: "24px", right: "24px", zIndex: 40, display: "flex", flexDirection: "column", gap: "10px" }}>
  <a href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`} target="_blank" rel="noopener noreferrer" title="WhatsApp"
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
      <main>
        {/* HERO */}
        <Hero />

        {/* NASIL ÇALIŞIR */}
        <Section id="nasil-calisir">
          <SectionLabel>Süreç</SectionLabel>
          <SectionHeading>
            Sadece <em style={{ color: "#C9A84C", fontStyle: "italic" }}>3 Adım</em>
          </SectionHeading>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: "2px",
            }}
          >
            {steps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ delay: i * 0.12, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                style={{
                  padding: "40px 32px",
                  position: "relative",
                  borderLeft: i > 0 ? "1px solid rgba(255,255,255,0.05)" : "none",
                }}
              >
                <div
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: "4.5rem",
                    fontWeight: 700,
                    color: "rgba(201,168,76,0.12)",
                    lineHeight: 1,
                    marginBottom: "20px",
                    letterSpacing: "-0.03em",
                  }}
                >
                  {step.num}
                </div>
                <h3
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: "1.45rem",
                    fontWeight: 600,
                    color: "#F0EDE8",
                    marginBottom: "12px",
                    lineHeight: 1.2,
                  }}
                >
                  {step.title}
                </h3>
                <p
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: "14px",
                    lineHeight: 1.85,
                    color: "rgba(240,237,232,0.45)",
                    fontWeight: 300,
                  }}
                >
                  {step.body}
                </p>
              </motion.div>
            ))}
          </div>
        </Section>

        {/* SEPARATOR */}
        <div
          style={{
            maxWidth: "1100px",
            margin: "0 auto",
            padding: "0 24px",
            borderTop: "1px solid rgba(255,255,255,0.05)",
          }}
        />

        {/* ÖZEL GÜNLER */}
        <Section id="ozel-gunler">
          <SectionLabel>Özel Günler</SectionLabel>
          <SectionHeading>
            Hangi An İçin <em style={{ color: "#C9A84C", fontStyle: "italic" }}>Hazırlıyoruz?</em>
          </SectionHeading>

          {/*
            ─── BURAYA YENİ KART EKLEMEK İÇİN ───
            Yukarıdaki `occasions` dizisine yeni bir obje ekle.
            Şablon:
            {
              id: 7,
              emoji: "🎉",
              title: "Başlık",
              subtitle: "Alt Başlık",
              description: "Kısa açıklama metni.",
              accentColor: "#C9A84C",   ← istediğin rengi yaz
              tag: null,                ← "En Popüler" veya null
            },
            Grid otomatik olarak yeni kartı ekler, başka bir şey yapman gerekmez.
          */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 300px), 1fr))",
              gap: "16px",
            }}
          >
            {occasions.map((o, i) => (
              <OccasionCard key={o.id} occasion={o} index={i} />
            ))}
          </div>
        </Section>

        {/* SEPARATOR */}
        <div
          style={{
            maxWidth: "1100px",
            margin: "0 auto",
            padding: "0 24px",
            borderTop: "1px solid rgba(255,255,255,0.05)",
          }}
        />

        {/* TESTİMONİALS */}
        <Section>
          <SectionLabel>Yorumlar</SectionLabel>
          <SectionHeading>
            Onlar <em style={{ color: "#C9A84C", fontStyle: "italic" }}>Denedi</em>
          </SectionHeading>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: "16px",
            }}
          >
            {testimonials.map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ delay: i * 0.1, duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
                style={{
                  padding: "32px 28px",
                  borderRadius: "16px",
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.07)",
                  backdropFilter: "blur(12px)",
                }}
              >
                {/* Stars */}
                <div style={{ marginBottom: "16px", display: "flex", gap: "3px" }}>
                  {[...Array(5)].map((_, si) => (
                    <span key={si} style={{ color: "#C9A84C", fontSize: "12px" }}>★</span>
                  ))}
                </div>
                <p
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: "1.1rem",
                    fontStyle: "italic",
                    color: "rgba(240,237,232,0.75)",
                    lineHeight: 1.7,
                    marginBottom: "20px",
                  }}
                >
                  "{t.quote}"
                </p>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div
                    style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "50%",
                      background: "linear-gradient(135deg, #C9A84C44, #E8A0A044)",
                      border: "1px solid rgba(201,168,76,0.3)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "12px",
                      color: "#C9A84C",
                      fontFamily: "'Inter', sans-serif",
                      fontWeight: 500,
                    }}
                  >
                    {t.name[0]}
                  </div>
                  <div>
                    <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "12px", color: "#F0EDE8", fontWeight: 500 }}>{t.name}</p>
                    <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "10px", color: "#C9A84C", letterSpacing: "0.1em" }}>{t.occasion}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </Section>

        {/* SEPARATOR */}
        <div
          style={{
            maxWidth: "1100px",
            margin: "0 auto",
            padding: "0 24px",
            borderTop: "1px solid rgba(255,255,255,0.05)",
          }}
        />

        {/* FİYATLAR */}
        <Section id="fiyatlar">
          <SectionLabel>Fiyatlar</SectionLabel>
          <SectionHeading>
            Basit & <em style={{ color: "#C9A84C", fontStyle: "italic" }}>Şeffaf</em>
          </SectionHeading>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: "16px",
              maxWidth: "700px",
              margin: "0 auto",
            }}
          >
            {plans.map((plan, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ delay: i * 0.12, duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
                style={{
                  padding: "36px 30px",
                  borderRadius: "20px",
                  background: plan.highlighted ? "rgba(201,168,76,0.08)" : "rgba(255,255,255,0.03)",
                  border: plan.highlighted ? "1px solid rgba(201,168,76,0.35)" : "1px solid rgba(255,255,255,0.07)",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                {plan.highlighted && (
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      height: "2px",
                      background: "linear-gradient(90deg, transparent, #C9A84C, transparent)",
                    }}
                  />
                )}
                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "10px", letterSpacing: "0.25em", textTransform: "uppercase", color: plan.highlighted ? "#C9A84C" : "rgba(240,237,232,0.4)", marginBottom: "8px", fontWeight: 500 }}>
                  {plan.name}
                </p>
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "3rem", fontWeight: 700, color: "#F0EDE8", lineHeight: 1, marginBottom: "28px", letterSpacing: "-0.02em" }}>
                  {plan.price}
                </div>
                <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "12px", marginBottom: "32px" }}>
                  {plan.features.map((f, fi) => (
                    <li key={fi} style={{ display: "flex", alignItems: "flex-start", gap: "10px", fontFamily: "'Inter', sans-serif", fontSize: "13px", color: "rgba(240,237,232,0.6)", lineHeight: 1.5, fontWeight: 300 }}>
                      <span style={{ color: "#C9A84C", flexShrink: 0, marginTop: "1px" }}>✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <button
                  style={{
                    width: "100%",
                    padding: "13px",
                    borderRadius: "30px",
                    border: plan.highlighted ? "none" : "1px solid rgba(255,255,255,0.12)",
                    background: plan.highlighted ? "#C9A84C" : "transparent",
                    color: plan.highlighted ? "#0B0F1A" : "rgba(240,237,232,0.7)",
                    fontFamily: "'Inter', sans-serif",
                    fontSize: "12px",
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    fontWeight: 500,
                    cursor: "pointer",
                    transition: "opacity 0.2s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.8")}
                  onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
                >
                  {plan.cta}
                </button>
              </motion.div>
            ))}
          </div>
        </Section>

        {/* SEPARATOR */}
        <div
          style={{
            maxWidth: "1100px",
            margin: "0 auto",
            padding: "0 24px",
            borderTop: "1px solid rgba(255,255,255,0.05)",
          }}
        />

        {/* SSS */}
        <Section id="sss">
          <SectionLabel>Sıkça Sorulan</SectionLabel>
          <SectionHeading>
            Aklında <em style={{ color: "#C9A84C", fontStyle: "italic" }}>Soru mu Var?</em>
          </SectionHeading>

          <div style={{ maxWidth: "680px", margin: "0 auto" }}>
            {faqs.map((faq, i) => (
              <FaqItem key={i} faq={faq} />
            ))}
          </div>
        </Section>

        {/* CTA BANNER */}
        <section
          style={{
            position: "relative",
            zIndex: 1,
            margin: "0 24px 100px",
            maxWidth: "1100px",
            marginLeft: "auto",
            marginRight: "auto",
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            style={{
              borderRadius: "24px",
              padding: "72px 40px",
              textAlign: "center",
              background: "rgba(201,168,76,0.06)",
              border: "1px solid rgba(201,168,76,0.2)",
              backdropFilter: "blur(20px)",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "radial-gradient(ellipse 70% 60% at 50% 50%, rgba(201,168,76,0.08) 0%, transparent 70%)",
                pointerEvents: "none",
              }}
            />
            <div style={{ position: "relative", zIndex: 1 }}>
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "10px", letterSpacing: "0.38em", textTransform: "uppercase", color: "#C9A84C", marginBottom: "16px" }}>
                Bugün Başla
              </p>
              <h2
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: "clamp(2rem, 5vw, 3.5rem)",
                  fontWeight: 600,
                  color: "#F0EDE8",
                  lineHeight: 1.15,
                  marginBottom: "16px",
                  letterSpacing: "-0.015em",
                }}
              >
                Ona Unutamayacağı
                <br />
                <em style={{ color: "#C9A84C", fontStyle: "italic" }}>Bir Sürpriz</em> Yap
              </h2>
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "14px", color: "rgba(240,237,232,0.45)", lineHeight: 1.85, maxWidth: "42ch", margin: "0 auto 36px", fontWeight: 300 }}>
                Siparişini ver, fotoğraflarını gönder. 24 saat içinde özel linkin hazır.
              </p>
              <a
                href="#ozel-gunler"
                style={{
                  display: "inline-block",
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "13px",
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  fontWeight: 500,
                  color: "#0B0F1A",
                  background: "#C9A84C",
                  padding: "15px 40px",
                  borderRadius: "40px",
                  textDecoration: "none",
                  transition: "opacity 0.2s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
              >
                Hemen Sipariş Ver
              </a>
            </div>
          </motion.div>
        </section>
      </main>

      {/* FOOTER */}
      <footer
        style={{
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
        }}
      >
        <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.1rem", color: "rgba(240,237,232,0.5)" }}>
          birlikteydik<span style={{ color: "#C9A84C" }}>.com</span>
        </span>
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "11px", color: "rgba(240,237,232,0.2)", letterSpacing: "0.08em" }}>
          © {new Date().getFullYear()} — Sevgiyle yapıldı
        </p>
      </footer>
    </>
  );
}