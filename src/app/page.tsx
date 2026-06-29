"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { FaWhatsapp, FaInstagram } from "react-icons/fa";
import { HiOutlineEye } from "react-icons/hi";

// ─────────────────────────────────────────────────────────────────────────────
// Sosyal medya sabitleri (yüzer butonlar için)
// ─────────────────────────────────────────────────────────────────────────────
const WHATSAPP_NUMBER  = "905349829940";
const WHATSAPP_MESSAGE = "Merhaba! birlikteydik.com'dan sipariş vermek istiyorum.";
const INSTAGRAM_URL    = "https://instagram.com/birlikteydikcom";

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
    // Reduced-motion: kullanıcı animasyonları azalt diyorsa canvas'ı durdur
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;

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
    <motion.article
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ delay: index * 0.08, duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: "relative",
        borderRadius: "14px",
        padding: "32px 28px",
        overflow: "hidden",
        background: "rgba(255,255,255,0.035)",
        border: `1px solid ${hovered ? occasion.accentColor + "55" : "rgba(255,255,255,0.07)"}`,
        backdropFilter: "blur(18px)",
        WebkitBackdropFilter: "blur(18px)",
        boxShadow: hovered ? `0 0 0 1px ${occasion.accentColor}33` : "none",
        transition: "border-color 0.3s ease, box-shadow 0.3s ease, transform 0.3s ease",
        transform: hovered ? "translateY(-3px)" : "translateY(0)",
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
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "13px", lineHeight: 1.8, color: "rgba(240,237,232,0.65)", fontWeight: 300 }}>{occasion.description}</p>
      </div>
    </motion.article>
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
    featured: true,
  },
  {
    quote: "3 yıllık birlikteliğimizi böyle güzel bir sayfada görmek inanılmazdı.",
    name: "Selin T.",
    occasion: "Yıldönümü",
    featured: false,
  },
  {
    quote: "14 Şubat'ta sıradan çiçek almak yerine bunu yaptım. Farkı muazzamdı.",
    name: "Kerem Y.",
    occasion: "Sevgililer Günü",
    featured: false,
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// FAQ
// ─────────────────────────────────────────────────────────────────────────────
const faqs = [
  {
    q: "Sayfa ne kadar sürede hazır olur?",
    a: "Temel pakette siparişin onaylandıktan itibaren 24 saat içinde özel linkin e-posta ile sana iletilir.",
  },
  {
    q: "Kaç fotoğraf gönderebilirim?",
    a: "İstediğin kadar fotoğraf gönderebilirsin. Paketine göre sayfanda 16'dan 64'e kadar fotoğraf gösterilir.",
  },
  {
    q: "Link ne kadar süre aktif kalır?",
    a: "Temel pakette 6 ay, premium pakette 18 ay aktif kalır.",
  },
  {
    q: "Müzik ekleyebilir miyim?",
    a: "Evet! Spotify veya YouTube linki paylaşman yeterli, sayfa açıldığında müzik otomatik başlar.",
  },
  {
    q: "Sayfa tasarımını sonradan değiştirebilir miyim?",
    a: "Temel pakette yayına alındıktan sonra 1 revizyon yapılabilir. Premium ve Premium+ pakette 3 revizyon hakkın var. ",
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
        aria-expanded={open}
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
          aria-hidden="true"
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
                color: "rgba(240,237,232,0.65)",
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
    name: "Açılışa Özel!",
    price: "₺199",
    features: [
      "10 fotoğrafa kadar",
      "Özel mesaj & isim",
      "Özel müzik ekleme",
      "6 ay aktif link",
      "Şifreyle koruma",
    ],
    highlighted: true,
    cta: "Sipariş Ver",
  },
  {
    name: "Premium",
    price: "₺1299",
    features: [
      "32 fotoğrafa kadar",
      "Özel mesaj & isim",
      "Özel müzik ekleme",
      "18 ay aktif link",
      "Öncelikli hazırlama (12 saat)",
      "Şifreyle koruma",
    ],
    highlighted: false,
    cta: "En Çok Tercih Edilen",
  },
  {
    name: "Premium+",
    price: "₺2499",
    features: [
      "64 fotoğrafa kadar",
      "Özel mesaj & isim",
      "Özel müzik ekleme",
      "2 yıl aktif link",
      "Öncelikli hazırlama (12 saat)",
      "Şifreyle koruma",
    ],
    highlighted: false,
    cta: "Sipariş Ver",
  },
  {
    name: "Özel",
    price: "Size Özel Tasarım Mı?",
    features: [
      "İstediğiniz kadar fotoğraf",
      "Özel mesaj & isim",
      "Özel müzik ekleme",
      "Sınırsız aktif link",
      "Öncelikli hazırlama (12 saat)",
      "Şifreyle koruma",
    ],
    highlighted: false,
    cta: "İletişime Geç",
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
function Hero({ settings }: { settings: any }) {
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
        <span dangerouslySetInnerHTML={{ __html: settings?.hero_texts?.title || `Anılarınız<br /><em style="color: #C9A84C; font-style: italic">Bir Linke</em><br />Sığıyor` }} />
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
        {settings?.hero_texts?.subtitle || "Fotoğraflarınızı, müziğinizi ve mesajınızı bir araya getiriyoruz. Sevgilinize özel bir link gönder — açsın ve şaşırsın."}
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

function SmartphoneMockup({ accentColor, title }: { accentColor: string; title: string }) {
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
            <span style={{ fontSize: "6px", color: "rgba(255,255,255,0.3)", letterSpacing: "0.05em" }}>birlikteydik.com</span>
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
            <h5 style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "9px",
              color: "#F0EDE8",
              fontWeight: 600,
              lineHeight: 1,
            }}>
              Mutluluk Dolu Anlar
            </h5>
            <div style={{
              width: "20px",
              height: "20px",
              borderRadius: "50%",
              border: `1px solid ${accentColor}44`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "6px",
              color: accentColor,
            }}>
              💿
            </div>
            <p style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "4.5px",
              color: "rgba(255,255,255,0.4)",
              lineHeight: 1.2,
            }}>
              Bizim şarkımız çalıyor...
            </p>
          </div>

          {/* Footer mockup controls */}
          <div style={{ display: "flex", justifyContent: "center", gap: "6px", alignItems: "center" }}>
            <div style={{ width: "8px", height: "8px", borderRadius: "50%", border: "1px solid rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "3px" }}>⏮️</div>
            <div style={{ width: "12px", height: "12px", borderRadius: "50%", background: accentColor, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "4px", color: "#0B0F1A" }}>▶️</div>
            <div style={{ width: "8px", height: "8px", borderRadius: "50%", border: "1px solid rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "3px" }}>⏭️</div>
          </div>
        </div>
      </div>
    </div>
  );
}

const featuredTemplates = [
  {
    id: "romantik-kirmizi",
    title: "Romantik Kırmızı",
    subtitle: "Aşkın ve Tutkunun Rengi",
    accentColor: "#E63946",
    tag: "Popüler",
    description: "Aşkın en sıcak tonunda, kalbimin her atışında saklanan en derin hislerim... Aşkın kırmızısı ve şehvetli derin gölgelerin birleştiği, romantik ışık patlamaları ve kalplerle bezeli tutkulu bir hikaye.",
    demoUrl: "/sablonlar/sablon-kirmizi",
    features: [
      "Parıldayan Kalp Parçacıkları",
      "Sıcak Kırmızı Geçiş Efektleri",
      "Duygusal ve Romantik Arayüz",
      "Aşkın Kırmızısı Loş Arka Işıklar",
    ],
  },
  {
    id: "premium-emerald",
    title: "Zümrüt Yeşili",
    subtitle: "Lüks ve Derin Detaylar",
    accentColor: "#50c878",
    tag: "Özel Tasarım",
    description: "Karanlık yeşillikler arasında parlayan, en kıymetli altın değerindeki aşk hikayeniz... Derin orman yeşili arka plan, asil altın süslemeler ve pürüzsüz geçişlerle hazırlanan premium ve prestijli bir şablon.",
    demoUrl: "/sablonlar/sablon-emerald",
    features: [
      "Derin Orman Yeşili ve Altın Teması",
      "Lüks Zümrüt Efektli Geçişler",
      "Altın Işıltılı Arka Plan Efektleri",
      "Asil ve Şık Görsel Çerçeveler",
    ],
  },
  {
    id: "sablon-indigo",
    title: "Gece Yarısı İndigo",
    subtitle: "Gizemli ve Büyüleyici",
    accentColor: "#818CF8",
    tag: null,
    description: "Sonsuz gece gökyüzünün altında, seninle parıldayan iki yıldız gibi... Derin gece mavisi arka plan üzerinde parıldayan indigo tonları, mistik dikey akış ve modern estetiğin sınırlarını zorlayan tasarım.",
    demoUrl: "/sablonlar/sablon-indigo",
    features: [
      "Gece Mavisi Kalp Parçacıkları",
      "Yıldızlı Gökyüzü Işıltısı",
      "Minimalist Gece Yarısı Tasarım Dili",
      "Pürüzsüz Dikey Akış Efektleri",
    ]
  },
  {
    id: "sablon-amber",
    title: "Günbatımı Amberi",
    subtitle: "Sıcak ve Samimi",
    accentColor: "#F59E0B",
    tag: "Yeni",
    description: "Güneşin en sıcak battığı yerde, senin gözlerindeki o ılık ışıkla aydınlanıyorum... Sıcak amber tonlarında radial ışıltılar, altın esintili çerçeveler ve samimi anılarınızı en iyi yansıtan dikey albüm tasarımı.",
    demoUrl: "/sablonlar/sablon-amber",
    features: [
      "Uçuşan Sıcak Amber Ateşböcekleri",
      "Gelişmiş Estetik Müzik Çalar",
      "Dikey Romantik Albüm Akışı",
      "Sıcak Amber Radial Işıltılar",
    ],
  }
];

// ─────────────────────────────────────────────────────────────────────────────
// ANA SAYFA
// ─────────────────────────────────────────────────────────────────────────────
export default function LandingPage() {
  const [siteSettings, setSiteSettings] = useState<any>({
    faqs: faqs,
    faq_texts: {
      label: "Sıkça Sorulan",
      heading: `Aklında <em style="color: #C9A84C; font-style: italic">Soru mu Var?</em>`
    },
    hero_texts: {
      title: `Anılarınız<br /><em style="color: #C9A84C; font-style: italic">Bir Linke</em><br />Sığıyor`,
      subtitle: "Birlikte geçirdiğiniz anıları ölümsüzleştiren, sadece size özel tasarlanmış bir web sitesi hediye et."
    },
    whatsapp_number: "905349829940",
    announcement_banner: {
      active: false,
      text: ""
    },
    maintenance_mode: false
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
            faq_texts: data.settings.faq_texts || prev.faq_texts,
            hero_texts: data.settings.hero_texts || prev.hero_texts,
            faqs: data.settings.faqs || prev.faqs,
            whatsapp_number: data.settings.whatsapp_number || prev.whatsapp_number,
            announcement_banner: data.settings.announcement_banner || prev.announcement_banner,
            maintenance_mode: data.settings.maintenance_mode !== undefined ? data.settings.maintenance_mode : prev.maintenance_mode,
          }));
        }
      } catch (err) {
        console.error("Load settings error:", err);
      }
    }
    loadSettings();
  }, []);

  if (siteSettings.maintenance_mode) {
    return (
      <div style={{ minHeight: "100vh", background: "#0B0F1A", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px", textAlign: "center", fontFamily: "'Inter', sans-serif", color: "#F0EDE8" }}>
        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "3.5rem", color: "#C9A84C", marginBottom: "16px" }}>Bakım Modundayız</h1>
        <p style={{ maxWidth: "460px", color: "rgba(240,237,232,0.6)", fontSize: "14px", lineHeight: 1.6, marginBottom: "32px" }}>
          Sitemiz üzerinde güncellemeler yapıyoruz. En kısa sürede tekrar hizmetinizde olacağız.
        </p>
        <a href={`https://wa.me/${siteSettings.whatsapp_number || "905349829940"}`}
           style={{ padding: "12px 28px", borderRadius: "30px", background: "#C9A84C", color: "#0B0F1A", textDecoration: "none", fontSize: "13px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase" }}>
          WhatsApp ile İletişim
        </a>
      </div>
    );
  }

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
  <a href={`https://wa.me/${siteSettings.whatsapp_number || WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`} target="_blank" rel="noopener noreferrer" title="WhatsApp"
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
        <Hero settings={siteSettings} />

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

        <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 24px", borderTop: "1px solid rgba(255,255,255,0.05)" }} />

        <Section id="ozel-gunler">
          <SectionLabel>Özel Günler</SectionLabel>
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
                <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "12px", marginBottom: "0" }}>
                  {plan.features.map((f, fi) => (
                    <li key={fi} style={{ display: "flex", alignItems: "flex-start", gap: "10px", fontFamily: "'Inter', sans-serif", fontSize: "13px", color: "rgba(240,237,232,0.6)", lineHeight: 1.5, fontWeight: 300 }}>
                      <span style={{ color: "#C9A84C", flexShrink: 0, marginTop: "1px" }}>✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
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

        {/* ŞABLONLARIMIZ */}
        <Section id="sablonlar">
          <SectionLabel>Tasarımlar</SectionLabel>
          <SectionHeading>
            Şablonlarımızı <em style={{ color: "#C9A84C", fontStyle: "italic" }}>Keşfedin</em>
          </SectionHeading>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 340px), 1fr))",
            gap: "24px",
          }}>
            {featuredTemplates.map((tpl, i) => {
              const orderMessage = `Merhaba! "${tpl.title}" isimli şablonu seçtim. Sipariş vermek veya detaylı bilgi almak istiyorum.`;
              const tplWhatsappUrl = `https://wa.me/${siteSettings.whatsapp_number || WHATSAPP_NUMBER}?text=${encodeURIComponent(orderMessage)}`;

              return (
                <motion.article
                  key={tpl.id}
                  initial={{ opacity: 0, y: 32 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ delay: i * 0.08, duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
                  style={{
                    position: "relative",
                    borderRadius: "16px",
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.06)",
                    backdropFilter: "blur(18px)",
                    WebkitBackdropFilter: "blur(18px)",
                    overflow: "hidden",
                    display: "flex",
                    flexDirection: "column",
                    transition: "border-color 0.3s ease, box-shadow 0.3s ease, transform 0.3s ease",
                  }}
                  whileHover={{
                    borderColor: `${tpl.accentColor}55`,
                    boxShadow: `0 0 0 1px ${tpl.accentColor}33`,
                    y: -4,
                  }}
                >
                  <div style={{
                    position: "absolute",
                    inset: 0,
                    background: `radial-gradient(ellipse at top left, ${tpl.accentColor}10 0%, transparent 60%)`,
                    pointerEvents: "none",
                  }} />

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

                  <SmartphoneMockup accentColor={tpl.accentColor} title={tpl.title} />

                  <div style={{ padding: "28px", display: "flex", flexDirection: "column", flex: 1 }}>
                    <div style={{ marginBottom: "16px" }}>
                      <h3 style={{
                        fontFamily: "'Cormorant Garamond', serif",
                        fontSize: "1.65rem",
                        fontWeight: 600,
                        color: "#F0EDE8",
                      }}>
                        {tpl.title}
                      </h3>
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

                    <div style={{ width: "40px", height: "1px", background: `linear-gradient(90deg, ${tpl.accentColor}, transparent)`, marginBottom: "16px" }} />

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

                    <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "10px", marginBottom: "32px", marginTop: "auto" }}>
                      {tpl.features.map((feat, idx) => (
                        <li key={idx} style={{ display: "flex", alignItems: "flex-start", gap: "8px", fontFamily: "'Inter', sans-serif", fontSize: "12px", color: "rgba(240,237,232,0.65)", fontWeight: 300 }}>
                          <span style={{ color: tpl.accentColor, fontWeight: "bold" }}>✓</span>
                          {feat}
                        </li>
                      ))}
                    </ul>

                    <div style={{ display: "flex", gap: "10px", marginTop: "auto" }}>
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
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                        fontWeight: 600,
                        transition: "all 0.2s",
                      }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.filter = "brightness(1.1)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.filter = "none";
                        }}
                      >
                        <FaWhatsapp size={14} />
                        <span>Sipariş Ver</span>
                      </a>
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </div>

          <div style={{ display: "flex", justifyContent: "center", marginTop: "48px" }}>
            <Link href="/sablonlar" style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "16px 36px",
              borderRadius: "40px",
              background: "linear-gradient(135deg, rgba(201,168,76,0.15), rgba(201,168,76,0.05))",
              border: "1px solid rgba(201,168,76,0.3)",
              color: "#F0EDE8",
              textDecoration: "none",
              fontFamily: "'Inter', sans-serif",
              fontSize: "12px",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              fontWeight: 600,
              transition: "all 0.3s ease",
              boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
            }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#C9A84C";
                e.currentTarget.style.color = "#0B0F1A";
                e.currentTarget.style.borderColor = "#C9A84C";
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 8px 30px rgba(201,168,76,0.3)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "linear-gradient(135deg, rgba(201,168,76,0.15), rgba(201,168,76,0.05))";
                e.currentTarget.style.color = "#F0EDE8";
                e.currentTarget.style.borderColor = "rgba(201,168,76,0.3)";
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.2)";
              }}
            >
              Tüm Şablonları Gör
            </Link>
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

        {/* TESTİMONİALS — Quote-first büyük format: featured quote öne çıkar, diğerleri yan yana */}
        <Section>
          <SectionHeading>
            Onlar <em style={{ color: "#C9A84C", fontStyle: "italic" }}>Anlattı</em>
          </SectionHeading>

          {/* Öne çıkan büyük alıntı */}
          {testimonials.filter(t => t.featured).map((t, i) => (
            <motion.div
              key={"feat-" + i}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              style={{
                textAlign: "center",
                padding: "0 0 52px",
                borderBottom: "1px solid rgba(255,255,255,0.06)",
                marginBottom: "40px",
              }}
            >
              <div style={{ display: "flex", justifyContent: "center", gap: "3px", marginBottom: "20px" }}>
                {[...Array(5)].map((_, si) => (
                  <span key={si} style={{ color: "#C9A84C", fontSize: "14px" }}>★</span>
                ))}
              </div>
              <p
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: "clamp(1.4rem, 3vw, 2rem)",
                  fontStyle: "italic",
                  color: "rgba(240,237,232,0.88)",
                  lineHeight: 1.55,
                  maxWidth: "600px",
                  margin: "0 auto 24px",
                }}
              >
                &ldquo;{t.quote}&rdquo;
              </p>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}>
                <div style={{
                  width: "36px", height: "36px", borderRadius: "50%",
                  background: "linear-gradient(135deg, #C9A84C44, #E8A0A044)",
                  border: "1px solid rgba(201,168,76,0.3)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "14px", color: "#C9A84C",
                  fontFamily: "'Inter', sans-serif", fontWeight: 600,
                }}>{t.name[0]}</div>
                <div style={{ textAlign: "left" }}>
                  <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "13px", color: "#F0EDE8", fontWeight: 500 }}>{t.name}</p>
                  <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "10px", color: "rgba(201,168,76,0.8)", letterSpacing: "0.12em", textTransform: "uppercase" }}>{t.occasion}</p>
                </div>
              </div>
            </motion.div>
          ))}

          {/* Diğer yorumlar — daha küçük yan yana */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "16px" }}>
            {testimonials.filter(t => !t.featured).map((t, i) => (
              <motion.div
                key={"side-" + i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ delay: i * 0.12, duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
                style={{
                  padding: "28px 24px",
                  borderRadius: "14px",
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.07)",
                }}
              >
                <div style={{ display: "flex", gap: "2px", marginBottom: "14px" }}>
                  {[...Array(5)].map((_, si) => (
                    <span key={si} style={{ color: "#C9A84C", fontSize: "11px" }}>★</span>
                  ))}
                </div>
                <p style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: "1.05rem",
                  fontStyle: "italic",
                  color: "rgba(240,237,232,0.75)",
                  lineHeight: 1.65,
                  marginBottom: "18px",
                }}>
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div style={{
                    width: "30px", height: "30px", borderRadius: "50%",
                    background: "linear-gradient(135deg, #C9A84C33, #E8A0A033)",
                    border: "1px solid rgba(201,168,76,0.25)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "12px", color: "#C9A84C",
                    fontFamily: "'Inter', sans-serif", fontWeight: 500,
                  }}>{t.name[0]}</div>
                  <div>
                    <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "12px", color: "#F0EDE8", fontWeight: 500 }}>{t.name}</p>
                    <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "10px", color: "rgba(201,168,76,0.75)", letterSpacing: "0.1em", textTransform: "uppercase" }}>{t.occasion}</p>
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

        {/* SSS */}
        <Section id="sss">
          <SectionLabel>{siteSettings.faq_texts?.label || "Sıkça Sorulan"}</SectionLabel>
          <SectionHeading>
            <span dangerouslySetInnerHTML={{ __html: siteSettings.faq_texts?.heading || `Aklında <em style="color: #C9A84C; font-style: italic">Soru mu Var?</em>` }} />
          </SectionHeading>

          <div style={{ maxWidth: "680px", margin: "0 auto" }}>
            {(siteSettings.faqs || faqs).map((faq: any, i: number) => (
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
                href={`https://wa.me/${siteSettings.whatsapp_number || WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`} target="_blank" rel="noopener noreferrer"
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
          padding: "48px 24px",
          maxWidth: "1100px",
          margin: "0 auto",
        }}
      >
        <div style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "24px",
          marginBottom: "28px",
        }}>
          <div>
            <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.2rem", color: "rgba(240,237,232,0.6)" }}>
              birlikteydik<span style={{ color: "#C9A84C" }}>.com</span>
            </span>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "12px", color: "rgba(240,237,232,0.35)", marginTop: "6px", maxWidth: "280px", lineHeight: 1.6 }}>
              Sevdiklerinize özel, unutulmaz bir dijital sürpriz.
            </p>
          </div>
          <div style={{ display: "flex", gap: "24px", flexWrap: "wrap" }}>
            <Link href="/kvkk-metni" style={{ fontFamily: "'Inter', sans-serif", fontSize: "11px", color: "rgba(240,237,232,0.4)", textDecoration: "none", letterSpacing: "0.06em", transition: "color 0.2s" }}
              onMouseEnter={e => e.currentTarget.style.color = "rgba(240,237,232,0.8)"}
              onMouseLeave={e => e.currentTarget.style.color = "rgba(240,237,232,0.4)"}
            >KVKK Aydınlatma Metni</Link>
            <a href={`https://wa.me/${"905349829940"}`} target="_blank" rel="noopener noreferrer" style={{ fontFamily: "'Inter', sans-serif", fontSize: "11px", color: "rgba(240,237,232,0.4)", textDecoration: "none", letterSpacing: "0.06em", transition: "color 0.2s" }}
              onMouseEnter={e => e.currentTarget.style.color = "rgba(240,237,232,0.8)"}
              onMouseLeave={e => e.currentTarget.style.color = "rgba(240,237,232,0.4)"}
            >İletişim</a>
            <a href="mailto:info@birlikteydik.com" style={{ fontFamily: "'Inter', sans-serif", fontSize: "11px", color: "rgba(240,237,232,0.4)", textDecoration: "none", letterSpacing: "0.06em", transition: "color 0.2s" }}
              onMouseEnter={e => e.currentTarget.style.color = "rgba(240,237,232,0.8)"}
              onMouseLeave={e => e.currentTarget.style.color = "rgba(240,237,232,0.4)"}
            >info@birlikteydik.com</a>
          </div>
        </div>
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.04)", paddingTop: "20px" }}>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "11px", color: "rgba(240,237,232,0.2)", letterSpacing: "0.08em" }}>
            © {new Date().getFullYear()} birlikteydik.com — Tüm Hakları Saklıdır
          </p>
        </div>
      </footer>
    </>
  );
}