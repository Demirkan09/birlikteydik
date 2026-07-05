"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { FaWhatsapp, FaInstagram } from "react-icons/fa";
import { HiOutlineEye } from "react-icons/hi";

const WHATSAPP_NUMBER  = "905349829940";
const WHATSAPP_MESSAGE = "Merhaba! birlikteydik.com'dan sipariş vermek istiyorum.";
const INSTAGRAM_URL    = "https://instagram.com/birlikteydikcom";

const templates = [
  {
    id: "romantik-kirmizi",
    title: "Romantik Kırmızı",
    subtitle: "Aşkın ve Tutkunun Rengi",
    accentColor: "#E63946",
    tag: "En Çok Satan",
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
    id: "modern-minimal",
    title: "Modern Beyaz",
    subtitle: "Sade, Şık ve Estetik",
    accentColor: "#d8d8d8",
    tag: null,
    description: "Gürültüden uzak, en saf halimizle. Sadece sen ve ben. Sadelikten yana olanlar için modern yazı tipleri, geniş boştımaklar ve pürüzsüz geçişlerle tasarlanmış minimalist bir aşk hikayesi.",
    demoUrl: "/sablonlar/sablon-minimal",
    features: [
      "Modern ve Temiz Arayüz Tasarımı",
      "Geniş Boşluklu Minimalist Müzik Çalar",
      "Zarif ve Net Tipografi Düzeni",
      "Sade ve Akıcı Sayfa Geçişleri",
    ],
    },
    {
    id: "premium-black",
    title: "Asil Siyah",
    subtitle: "Asil ve Lüks",
    accentColor: "#bdbdbd",
    tag: null,
    description: "Karanlığın en kusursuz siyahında saklı, sessiz ve derin bir bağlılık... Mat gece siyahı, loş ışıkta süzülen gölgeler, gizemli ve son derece romantik bir anı.",
    demoUrl: "/sablonlar/sablon-siyah",
    features: [
      "Koyu Lüks Polaroid Çerçeveleri",
      "Süzülen Canlı Gül Yaprakları",
      "Premium Koyu Kadife Plak Çalar",
      "Zarif El Yazısı ve Serif Tipografisi",
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
    id: "klasik-retro",
    title: "Koyu Gül Kurusu",
    subtitle: "Zarif Kadife ve Gül Yaprakları",
    accentColor: "#C9897A",
    tag: null,
    description: "Karanlığın en zarif tonunda, aşkımızın en derin izleri... Koyu kadife gül kurusu rengi, yavaşça süzülen gül yaprakları ve karanlık lüks polaroid çerçeveleriyle hazırlanan derin ve son derece romantik bir hikaye.",
    demoUrl: "/sablonlar/sablon-retro",
    features: [
      "Koyu Lüks Polaroid Çerçeveleri",
      "Süzülen Canlı Gül Yaprakları",
      "Premium Koyu Kadife Plak Çalar",
      "Zarif El Yazısı ve Serif Tipografisi",
    ],
  },
  {
    id: "sinematik-ask",
    title: "Sinematik Aşk",
    subtitle: "Kendi Filminizin Başrolü",
    accentColor: "#B8A9D4",
    tag: null,
    description: "Bir sevgi belgeseli, başrollerde sadece bizim olduğumuz... Girişte video/fotoğraf perdesi, arkada çalan duygusal piyano melodisi ve adeta film jeneriği gibi akan büyüleyici anılarınız.",
    demoUrl: "/sablonlar/sablon-sinematik",
    features: [
      "Büyüleyici Giriş Perdesi & Karşılama Ekranı",
      "Film Jeneriği Temalı Akış Tasarımı",
      "Özel Video ve Sinematik Müzik Desteği",
      "Loş ve Duygusal Işık Efektleri",
    ],
  },
  {
    id: "sablon-oyun",
    title: "Oyuncu Şablonu",
    subtitle: "Gamer Çiftler İçin Tasarım",
    accentColor: "#CBFF3E",
    tag: null,
    description: "Seninle en iyi maceralara! Retro oyun konsolu tasarımlı müzik kontrolü, neon yeşili çizgiler, Space Grotesk yazı tipi ve piksel sanat detaylarıyla oyun sever çiftlerin dijital macerası.",
    demoUrl: "/sablonlar/sablon-oyun",
    features: [
      "Retro Oyun Konsolu Müzik Oynatıcısı",
      "Neon Lime & Pixel-Art Detaylar",
      "Eğlenceli Retro Arcade Animasyonları",
      "Gamer Çiftlere Özel Eğlenceli Vibe",
    ],
  },
  {
    id: "sablon-lavanta",
    title: "Lavanta Rüyası",
    subtitle: "Düşsel ve Romantik",
    accentColor: "#D8B4FE",
    tag: null,
    description: "Lavanta kokulu rüzgarların arasında, seninle geçen her saniye ömre bedel... Düşsel mor radial arka plan ışıltıları, zarif kalpler ve akıcı yumuşak geçişlerle tasarlanmış büyüleyici bir aşk albümü.",
    demoUrl: "/sablonlar/sablon-lavanta",
    features: [
      "Yumuşak Lavanta Parçacıkları",
      "Zarif Müzik Oynatıcı",
      "Modern Düşsel Tipografi",
      "Düşsel Mor Radial Işıltılar",
    ]
  },
  {
    id: "sablon-amber",
    title: "Günbatımı Amberi",
    subtitle: "Sıcak ve Samimi",
    accentColor: "#F59E0B",
    tag: null,
    description: "Güneşin en sıcak battığı yerde, senin gözlerindeki o ılık ışıkla aydınlanıyorum... Sıcak amber tonlarında radial ışıltılar, altın esintili çerçeveler ve samimi anılarınızı en iyi yansıtan dikey albüm tasarımı.",
    demoUrl: "/sablonlar/sablon-amber",
    features: [
      "Uçuşan Sıcak Amber Ateşböcekleri",
      "Gelişmiş Estetik Müzik Çalar",
      "Dikey Romantik Albüm Akışı",
      "Sıcak Amber Radial Işıltılar",
    ]
  },
  {
    id: "sablon-rose",
    title: "Gül Kurusu",
    subtitle: "Zarif ve Derin Aşk",
    accentColor: "#FCA5A5",
    tag: null,
    description: "Güllerin pembe yapraklarında yazılı olan en zarif aşk şiirim sensin... Rose gold renk tonlarının eşsiz zarafeti, loş arka plan aydınlatması ve fotoğraflarınızı öne çıkaran pürüzsüz kart tasarımı.",
    demoUrl: "/sablonlar/sablon-rose",
    features: [
      "Rose Gold Parıltılar",
      "Zarif Gül Kurusu Renk Teması",
      "Cormorant Garamond Başlık Şıklığı",
      "Estetik ve Yumuşak Fotoğraf Kartları",
    ]
  }
];

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

        <div style={{
          padding: "16px 8px 8px",
          display: "flex",
          flexDirection: "column",
          gap: "8px",
          height: "100%",
          justifyContent: "space-between",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "6px", color: "rgba(255,255,255,0.3)", letterSpacing: "0.05em" }}>birlikteydik.com</span>
            <span style={{ fontSize: "6px", color: accentColor }}>❤️</span>
          </div>

          <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            gap: "4px",
            marginTop: "8px",
          }}>
            <h5 style={{
              fontFamily: "var(--font-cormorant), serif",
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
              fontFamily: "var(--font-inter), sans-serif",
              fontSize: "4.5px",
              color: "rgba(255,255,255,0.4)",
              lineHeight: 1.2,
            }}>
              Bizim şarkımız çalıyor...
            </p>
          </div>

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

    const drawHeart = (cx: number, cy: number, size: number, opacity: number, color: string) => {
      ctx.save();
      ctx.globalAlpha = opacity;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(cx, cy + size * 0.3);
      ctx.bezierCurveTo(cx, cy, cx - size * 0.7, cy, cx - size * 0.7, cy - size * 0.4);
      ctx.bezierCurveTo(cx - size * 0.7, cy - size * 1.0, cx, cy - size * 0.9, cx, cy - size * 0.5);
      ctx.bezierCurveTo(cx, cy - size * 0.9, cx + size * 0.7, cy - size * 1.0, cx + size * 0.7, cy - size * 0.4);
      ctx.bezierCurveTo(cx + size * 0.7, cy, cx, cy, cx, cy + size * 0.3);
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

  return <canvas ref={canvasRef} style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }} />;
}

export default function TemplatesPage() {
  const [dbShowcases, setDbShowcases] = useState<any[]>([]);
  const [siteSettings, setSiteSettings] = useState<any>({
    maintenance_mode: false,
    whatsapp_number: "905349829940"
  });

  useEffect(() => {
    fetch("/api/showcase")
      .then(res => res.json())
      .then(data => {
        if (data.showcasePages) {
          setDbShowcases(data.showcasePages);
        }
      })
      .catch(err => console.error("Showcase fetch error:", err));

    fetch("/api/site-settings")
      .then(res => res.json())
      .then(data => {
        if (data.settings) {
          setSiteSettings(data.settings);
        }
      })
      .catch(err => console.error("Load settings error:", err));
  }, []);

  const dbIds = new Set(dbShowcases.map(t => t.id));
  const fallbackTemplates = templates.filter(t => {
    const slug = t.demoUrl.replace("/sablonlar/", "");
    return !dbIds.has(slug);
  });

  const mergedTemplates = [...dbShowcases, ...fallbackTemplates];

  if (siteSettings.maintenance_mode) {
    let formattedTime = "";
    if (siteSettings.maintenance_start_time) {
      try {
        const date = new Date(siteSettings.maintenance_start_time);
        formattedTime = date.toLocaleString("tr-TR", {
          day: "numeric",
          month: "long",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit"
        });
      } catch { /* ignore */ }
    }

    return (
      <div style={{ minHeight: "100vh", background: "#0B0F1A", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px", textAlign: "center", fontFamily: "'Inter', sans-serif", color: "#F0EDE8" }}>
        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "3.5rem", color: "#C9A84C", marginBottom: "16px" }}>Bakım Modundayız</h1>
        <p style={{ maxWidth: "460px", color: "rgba(240,237,232,0.6)", fontSize: "14px", lineHeight: 1.6, marginBottom: "32px" }}>
          Sitemiz üzerinde güncellemeler yapıyoruz. En kısa sürede tekrar hizmetinizde olacağız.
          {formattedTime && (
            <span style={{ display: "block", marginTop: "12px", fontSize: "12px", color: "rgba(240,237,232,0.45)" }}>
              Bakım Başlangıcı: {formattedTime}
            </span>
          )}
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

      {/* Background gradients */}
      <div style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        background: `
          radial-gradient(ellipse 70% 55% at 50% 10%, rgba(201,168,76,0.06) 0%, transparent 60%),
          radial-gradient(ellipse 60% 45% at 15% 85%, rgba(232,160,160,0.05) 0%, transparent 55%),
          linear-gradient(160deg, #0B0F1A 0%, #0d1220 50%, #0a0d18 100%)
        `,
        pointerEvents: "none",
      }} />

      <HeartsCanvas />

      {/* Floating social links */}
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

      <main style={{ position: "relative", zIndex: 1, minHeight: "100vh", padding: "120px 24px 80px", maxWidth: "1100px", margin: "0 auto" }}>
        <header style={{ textAlign: "center", marginBottom: "64px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "16px", justifyContent: "center" }}>
            <div style={{ height: "1px", width: "32px", background: "#C9A84C88" }} />
            <span style={{ fontFamily: "var(--font-inter), sans-serif", fontSize: "10px", letterSpacing: "0.38em", textTransform: "uppercase", color: "#C9A84C", fontWeight: 500 }}>
              Koleksiyonumuz
            </span>
            <div style={{ height: "1px", width: "32px", background: "#C9A84C88" }} />
          </div>
          <h1 style={{
            fontFamily: "var(--font-cormorant), serif",
            fontSize: "clamp(2.5rem, 5.5vw, 4rem)",
            fontWeight: 600,
            color: "#F0EDE8",
            lineHeight: 1.15,
            letterSpacing: "-0.015em",
            marginBottom: "16px",
          }}>
            Tüm Tasarımlarımız
          </h1>
          <p style={{
            fontFamily: "var(--font-inter), sans-serif",
            fontSize: "14px",
            color: "rgba(240,237,232,0.45)",
            lineHeight: 1.8,
            maxWidth: "50ch",
            margin: "0 auto",
            fontWeight: 300,
          }}>
            Aşkınızı ve anılarınızı en iyi yansıtan temayı seçin. İstediğiniz gibi özelleştirelim.
          </p>
        </header>

        {/* Templates Grid */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 340px), 1fr))",
          gap: "32px 24px",
          marginBottom: "80px",
        }}>
          {mergedTemplates.map((tpl, i) => {
            const orderMessage = `Merhaba! "${tpl.title}" isimli şablonu seçtim. Sipariş vermek veya detaylı bilgi almak istiyorum.`;
            const tplWhatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(orderMessage)}`;

            return (
              <motion.article
                key={tpl.id}
                initial={{ opacity: 0, y: 32 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
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
                    fontFamily: "var(--font-inter), sans-serif",
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
                      fontFamily: "var(--font-cormorant), serif",
                      fontSize: "1.65rem",
                      fontWeight: 600,
                      color: "#F0EDE8",
                    }}>
                      {tpl.title}
                    </h3>
                    <p style={{
                      fontFamily: "var(--font-inter), sans-serif",
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
                    fontFamily: "var(--font-inter), sans-serif",
                    fontSize: "13px",
                    lineHeight: 1.8,
                    color: "rgba(240,237,232,0.5)",
                    fontWeight: 300,
                    marginBottom: "24px",
                  }}>
                    {tpl.description}
                  </p>

                  <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "10px", marginBottom: "32px", marginTop: "auto" }}>
                    {tpl.features.map((feat: string, idx: number) => (
                      <li key={idx} style={{ display: "flex", alignItems: "flex-start", gap: "8px", fontFamily: "var(--font-inter), sans-serif", fontSize: "12px", color: "rgba(240,237,232,0.65)", fontWeight: 300 }}>
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
                      fontFamily: "var(--font-inter), sans-serif",
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
                      fontFamily: "var(--font-inter), sans-serif",
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

        <div style={{ textAlign: "center", marginTop: "40px" }}>
          <Link href="/" style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "14px 32px",
            borderRadius: "30px",
            border: "1px solid rgba(255,255,255,0.15)",
            color: "rgba(240,237,232,0.75)",
            textDecoration: "none",
            fontFamily: "var(--font-inter), sans-serif",
            fontSize: "12px",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            transition: "all 0.2s",
          }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.3)"; e.currentTarget.style.color = "#FFFFFF"; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)"; e.currentTarget.style.color = "rgba(240,237,232,0.75)"; }}
          >
            ← Ana Sayfaya Dön
          </Link>
        </div>
      </main>

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
        <span style={{ fontFamily: "var(--font-cormorant), serif", fontSize: "1.1rem", color: "rgba(240,237,232,0.5)" }}>
          birlikteydik<span style={{ color: "#C9A84C" }}>.com</span>
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: "24px", flexWrap: "wrap" }}>
          <a href="mailto:info@birlikteydik.com" style={{ fontFamily: "var(--font-inter), sans-serif", fontSize: "11px", color: "rgba(240,237,232,0.4)", textDecoration: "none", letterSpacing: "0.06em", transition: "color 0.2s" }}
            onMouseEnter={e => e.currentTarget.style.color = "rgba(240,237,232,0.8)"}
            onMouseLeave={e => e.currentTarget.style.color = "rgba(240,237,232,0.4)"}
          >info@birlikteydik.com</a>
          <p style={{ fontFamily: "var(--font-inter), sans-serif", fontSize: "11px", color: "rgba(240,237,232,0.2)", letterSpacing: "0.08em", margin: 0 }}>
            © {new Date().getFullYear()} — Sevgiyle yapıldı
          </p>
        </div>
      </footer>
    </>
  );
}
