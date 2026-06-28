"use client";

import {  useState, useEffect, useRef , createContext, useContext } from "react";
import { motion, Variants } from "framer-motion";
import { ChevronDown, Volume2, VolumeX, Heart, Sparkles } from "lucide-react";
import VideoPlayerPro from "@/components/ui/video-player-pro";

// ─────────────────────────────────────────────────────────────────────────────
// ⚙️ ŞABLON AYARLARI (Kolayca Düzenlenebilir)
// ─────────────────────────────────────────────────────────────────────────────
const defaultConfig = {
  coupleNames: "Elif\n&\nCan",
  tagline: "Lavanta kokulu rüzgarların arasında, seninle geçen her saniye ömre bedel...",
  accentColor: "#D8B4FE", // Varsayılan: Altın Sarısı (#C9A84C)
  specialDate: "26 Ekim 2024",
  musicUrl: "/music/emerald.mp3", // Müzik dosyası yolu
  videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-romantic-couple-enjoying-a-sunset-together-42417-large.mp4",
};

const defaultMemories = [
  {
    id: 1,
    image: "/moment.jpg",
    title: "Aşkın Rengi",
    description: "İlk kez bana sımsıcak gülümsediğinde, içimdeki tüm kışların eriyip sıcacık bir bahara dönüştüğü o eşsiz gün.",
    date: "14 Şubat 2025",
  },
  {
    id: 2,
    image: "/moment2.jpg",
    title: "Kalp Atışlarımız",
    description: "Sadece elini tutmak bile kalbimin ritmini hızlandırıp, tüm dünyadaki en mutlu ezgiyi çalıyormuş gibi hissettiriyor.",
    date: "12 Mart 2025",
  },
  {
    id: 3,
    image: "/moment7.jpg",
    title: "Sonsuz Bağımız",
    description: "Her saniye, her nefeste sana olan sevgimin daha da alevlendiğini, bizi ayıramayacak güçlü bir bağa dönüştüğünü biliyorum.",
    date: "25 Nisan 2025",
  },
  {
    id: 4,
    image: "/moment3.jpg",
    title: "Yıldızların Altında",
    description: "Şehrin tüm gürültüsünden uzakta, tepede uzanıp gökyüzünü izlerken dilek tuttuğumuz o gece. Ben sadece senin gözlerine baktım ve içimden hep aynı şeyi diledim: Sonsuzluk.",
    date: "18 Ocak 2025",
  },
  {
    id: 5,
    image: "/moment4.jpg",
    title: "Maviye Açılan Sonsuzluk",
    description: "Benim için dünyanın en huzurlu limanı burasıydı sevgilim, çünkü yanımda sen varsın.",
    date: "22 Nisan 2025",
  },
  {
    id: 6,
    image: "/moment5.jpg",
    title: "Birlikte Yeni Bir Başlangıç",
    description: "Başardığımız, büyüdüğümüz ve geleceğe doğru ilk büyük adımı attığımız o gün; yanımda sen varsan her zorluğun üstesinden gelebileceğimi bir kez daha anladım.",
    date: "12 Haziran 2025",
  },
  {
    id: 7,
    image: "/moment6.jpg", // moment6.jpg (Gelinlik ve buket)
    title: "Beyazlar İçinde Bir Ömür",
    description: "Ellerinin arasında tuttuğun o güller, senin zarafetinin yanında sadece ufak birer ayrıntıydı. Hayatımın en güzel, en berrak 'Evet'ini fısıldarken; kalbimi sonsuza dek sana emanet etmenin gururunu yaşıyordum.",
    date: "18 Eylül 2025",
  },
  {
    id: 8,
    image: "/moment8.jpg", // moment8.jpg (Denizin içindeki çift)
    title: "Sonsuzluğun Kıyısında",
    description: "Şehrin, insanların ve zamanın fersah fersah uzağında... Sadece iki siluet olarak gökyüzünün ve denizin sonsuzluğuna karıştığımız o an. Biz artık iki ayrı insan değil, aynı denizde eriyen tek bir hikayeyiz.",
    date: "02 Mayıs 2026",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// ANİMASYON VARİANTLARI
// ─────────────────────────────────────────────────────────────────────────────
const getDynamicFontSize = (names: string, baseMin: number, baseMax: number, baseVw: number = 8) => {
  if (!names) return `clamp(${baseMin}rem, ${baseVw}vw, ${baseMax}rem)`;
  const lines = names.split('\n');
  const nameLines = lines.map(l => l.trim()).filter(l => l !== "&" && l !== "");
  if (nameLines.length === 0) return `clamp(${baseMin}rem, ${baseVw}vw, ${baseMax}rem)`;
  const longest = Math.max(...nameLines.map(l => l.length));
  if (longest > 6) {
    const factor = Math.max(6 / longest, 0.5);
    return `clamp(${baseMin * factor}rem, ${baseVw * factor}vw, ${baseMax * factor}rem)`;
  }
  return `clamp(${baseMin}rem, ${baseVw}vw, ${baseMax}rem)`;
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
};

const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 1 } },
};

const stagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } },
};

// ─────────────────────────────────────────────────────────────────────────────
// ❤️ YÜZER KALP PARÇACIKLARI CANVAS
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
  const { config, memories } = useContext(TemplateContext) || {};
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

    particlesRef.current = Array.from({ length: 20 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      size: Math.random() * 6 + 3,
      speed: Math.random() * 0.25 + 0.08,
      opacity: Math.random() * 0.12 + 0.03,
      drift: (Math.random() - 0.5) * 0.3,
      phase: Math.random() * Math.PI * 2,
    }));

    const drawHeart = (cx: number, cy: number, size: number, opacity: number) => {
      ctx.save();
      ctx.globalAlpha = opacity;
      ctx.fillStyle = config.accentColor;
      ctx.beginPath();
      ctx.moveTo(cx, cy + size * 0.3);
      ctx.bezierCurveTo(cx, cy, cx - size * 0.7, cy, cx - size * 0.7, cy - size * 0.4);
      ctx.bezierCurveTo(cx - size * 0.7, cy - size * 1.0, cx, cy - size * 0.9, cx, cy - size * 0.5);
      ctx.bezierCurveTo(cx, cy - size * 0.9, cx + size * 0.7, cy - size * 1.0, cx + size * 0.7, cy - size * 0.4);
      ctx.bezierCurveTo(cx + size * 0.7, cy, cx, cy, cx, cy + size * 0.3);
      ctx.fill();
      ctx.restore();
    };

    let t = 0;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      t += 0.006;
      particlesRef.current.forEach((p) => {
        p.y -= p.speed;
        p.x += Math.sin(t + p.phase) * p.drift;
        if (p.y < -20) {
          p.y = canvas.height + 10;
          p.x = Math.random() * canvas.width;
        }
        drawHeart(p.x, p.y, p.size, p.opacity);
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

// ─────────────────────────────────────────────────────────────────────────────
// 🎵 PREMIUM PLAK MÜZİK WİDGET'I
// ─────────────────────────────────────────────────────────────────────────────
function MusicVinylWidget({ isPlaying, toggleMusic }: { isPlaying: boolean; toggleMusic: () => void }) {
  const { config, memories } = useContext(TemplateContext) || {};
  return (
    <div
      className="flex items-center gap-4 rounded-xl p-3 cursor-pointer transition-transform hover:scale-[1.02] backdrop-blur-xl"
      style={{
        background: "linear-gradient(135deg, #0A0314 0%, #130921 60%, #0A0314 100%)",
        border: "1px solid rgba(216,180,254,0.15)",
        boxShadow: "0 12px 40px rgba(0,0,0,0.85)",
      }}
      onClick={toggleMusic}
    >
      {/* Plak Döner Disk */}
      <div className="relative flex-shrink-0" style={{ width: 44, height: 44 }}>
        <motion.div
          animate={isPlaying ? { rotate: 360 } : { rotate: 0 }}
          transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
          style={{
            width: "100%",
            height: "100%",
            borderRadius: "50%",
            background: "repeating-radial-gradient(circle, #27272A, #09090B 1px, #18181B 5px)",
            border: "2px solid #3F3F46",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 4px 10px rgba(0,0,0,0.6)",
          }}
        >
          {/* Ortadaki Göbek */}
          <div
            style={{
              width: "14px",
              height: "14px",
              borderRadius: "50%",
              background: config.accentColor,
              border: "1px solid rgba(255,255,255,0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div style={{ width: "3px", height: "3px", borderRadius: "50%", background: "#0A0314" }} />
          </div>
        </motion.div>
      </div>

      {/* Metin Detayları */}
      <div className="flex flex-col">
        <span
          style={{
            fontFamily: "var(--font-cormorant), serif",
            fontSize: "13px",
            fontStyle: "italic",
            color: isPlaying ? config.accentColor : "rgba(255,255,255,0.75)",
            letterSpacing: "0.04em",
          }}
        >
          {isPlaying ? "Melodi Çalıyor..." : "Arka Plan Melodisi"}
        </span>
        <span
          style={{
            fontFamily: "var(--font-inter), sans-serif",
            fontSize: "9px",
            color: "rgba(255,255,255,0.4)",
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            marginTop: "2px",
          }}
        >
          {isPlaying ? "Tıkla & Durdur" : "Tıkla & Dinle"}
        </span>
      </div>

      {/* Ses İkonu */}
      <div className="ml-auto pr-1">
        {isPlaying ? (
          <Volume2 size={14} style={{ color: config.accentColor, opacity: 0.9 }} className="animate-pulse" />
        ) : (
          <VolumeX size={14} style={{ color: "rgba(255,255,255,0.4)" }} />
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 📸 FOTOĞRAF KART KOMPONENTI (Tamamen Uyumlu ve Hizalı)
// ─────────────────────────────────────────────────────────────────────────────
function MemoryCard({ memory, index }: { memory: (any)[0]; index: number }) {
  const { config, memories } = useContext(TemplateContext) || {};
  const isEven = index % 2 === 0;

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      variants={stagger}
      className="flex flex-col items-center gap-8"
      style={{ position: "relative" }}
    >


      {/* Fotoğraf Çerçevesi (Yatay & Dikey Tüm Resimleri Çözünürlük Fark Etmeksizin Tam Gösterir) */}
      <motion.div
        variants={fadeUp}
        className="relative flex-shrink-0 w-full"
        style={{ zIndex: 1 }}
      >
        <div
          className="relative overflow-hidden"
          style={{
            background: "#130921",
            padding: "2px",
            border: "1px solid rgba(216,180,254,0.15)",
            boxShadow: "0 16px 48px rgba(0,0,0,0.7)",
          }}
        >
          {memory.video ? (
            <VideoPlayerPro src={memory.video} />
          ) : (
            <img
              src={memory.image}
              alt={memory.title}
              className="w-full h-auto block"
              draggable={false}
              style={{ pointerEvents: "none", userSelect: "none", WebkitUserSelect: "none" }}
            />
          )}
        </div>
      </motion.div>

      {/* Metin İçeriği */}
      <div className="flex flex-col items-center justify-center text-center max-w-sm gap-4 relative z-10">
        <motion.div variants={fadeIn} className="flex items-center justify-center gap-3">
          <div className="w-8 h-px" style={{ background: config.accentColor, opacity: 0.4 }} />
          <span
            style={{
              fontFamily: "var(--font-inter), sans-serif",
              fontSize: "9px",
              color: "rgba(255,255,255,0.5)",
              letterSpacing: "0.28em",
              textTransform: "uppercase",
            }}
          >
            {memory.date}
          </span>
          <div className="w-8 h-px" style={{ background: config.accentColor, opacity: 0.4 }} />
        </motion.div>

        <motion.h3
          variants={fadeUp}
          style={{
            fontFamily: "var(--font-cormorant), serif",
            fontSize: "clamp(1.6rem, 3vw, 2.2rem)",
            fontWeight: 400,
            color: "#FFFFFF",
            lineHeight: 1.2,
            textAlign: "center",
          }}
        >
          {memory.title}
        </motion.h3>

        <motion.p
          variants={fadeUp}
          style={{
            fontFamily: "var(--font-inter), sans-serif",
            fontSize: "0.875rem",
            color: "rgba(255,255,255,0.55)",
            lineHeight: 1.8,
            fontWeight: 300,
            textAlign: "center",
          }}
        >
          {memory.description}
        </motion.p>
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 👑 ANA SAYFA COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

const TemplateContext = createContext<any>(null);
export default function LavantaTemplate({ config: propConfig, memories: propMemories }: { config?: any, memories?: any[] } = {}) {
  const config = propConfig ?? defaultConfig;
  const memories = propMemories ?? defaultMemories;
  const [isPlaying, setIsPlaying] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

      useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    if (config.musicUrl) {
      audioRef.current = new Audio(config.musicUrl);
      audioRef.current.loop = true;

      const playAudio = () => {
        if (audioRef.current) {
          audioRef.current.play()
            .then(() => {
              setIsPlaying(true);
              removeListeners();
            })
            .catch(() => {});
        }
      };

      const removeListeners = () => {
        window.removeEventListener("click", playAudio);
        window.removeEventListener("touchstart", playAudio);
        window.removeEventListener("scroll", playAudio);
      };

      // Try playing immediately
      playAudio();

      // Add listeners for interaction fallback
      window.addEventListener("click", playAudio);
      window.addEventListener("touchstart", playAudio);
      window.addEventListener("scroll", playAudio);

      return () => {
        removeListeners();
        audioRef.current?.pause();
      };
    }
  }, [config.musicUrl]);

  

  const toggleMusic = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => {});
    }
  };

  return (
    <TemplateContext.Provider value={{ config, memories }}>
    <main
      className="min-h-screen overflow-x-hidden selection:bg-white/10"
      style={{ background: "#0A0314", color: "#FFFFFF" }}
    >
      {/* PARÇACIK EFEKTİ */}
      <HeartsCanvas />

      {/* Mobil Uyumlu Merkez Çerçeve Wrapper */}
      <div
        className="relative w-full max-w-[480px] mx-auto min-h-screen bg-[#0A0314]/85 shadow-[0_0_80px_rgba(0,0,0,0.85)] z-10 flex flex-col"
        style={{
          borderLeft: "1px solid rgba(216,180,254,0.08)",
          borderRight: "1px solid rgba(216,180,254,0.08)"
        }}
      >
        {/* Müzik Widget'ı */}
        <div className="fixed lg:absolute bottom-6 left-6 z-40">
          <MusicVinylWidget isPlaying={isPlaying} toggleMusic={toggleMusic} />
        </div>

        {/* ── KAHRAMAN BÖLÜMÜ (HERO) ── */}
        <section className="relative flex flex-col items-center justify-center overflow-hidden w-full h-[100svh]">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={stagger}
            className="relative z-20 flex flex-col items-center px-6 text-center"
          >
            <motion.div variants={fadeIn} className="flex items-center gap-4 mb-8">
              <div className="w-8 h-px" style={{ background: config.accentColor }} />
              <Sparkles size={12} style={{ color: config.accentColor }} className="animate-pulse" />
              <span
                style={{
                  fontFamily: "var(--font-inter), sans-serif",
                  fontSize: "9px",
                  color: config.accentColor,
                  letterSpacing: "0.4em",
                  textTransform: "uppercase",
                }}
              >
                Biz Birlikteyken
              </span>
            </motion.div>

            <motion.h1
              variants={fadeUp}
              style={{
                fontFamily: "var(--font-cormorant), serif",
                fontSize: getDynamicFontSize(config.coupleNames, 2.5, 4.5, 7),
                fontWeight: 300,
                lineHeight: 1.2,
                paddingBottom: "0.1em",
                color: "#FFFFFF",
                marginBottom: "1.5rem",
                whiteSpace: "pre-line",
              }}
            >
              {config.coupleNames}
            </motion.h1>

            <motion.p
              variants={fadeUp}
              style={{
                fontFamily: "var(--font-inter), sans-serif",
                fontSize: "12px",
                color: "rgba(255,255,255,0.5)",
                maxWidth: "280px",
                lineHeight: 1.7,
                marginBottom: "2rem",
              }}
            >
              {config.tagline}
            </motion.p>

            

            <motion.div
              variants={fadeIn}
              style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", opacity: 0.5 }}
            >
              <div style={{ width: "1px", height: "32px", background: `linear-gradient(to bottom, transparent, ${config.accentColor})` }} />
              <motion.div
                animate={{ y: [0, 6, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                style={{ width: "6px", height: "6px", borderRadius: "50%", background: config.accentColor }}
              />
              <span
                style={{
                  fontFamily: "var(--font-inter), sans-serif",
                  fontSize: "8px",
                  letterSpacing: "0.3em",
                  textTransform: "uppercase",
                  color: "rgba(255,255,255,0.7)",
                  marginTop: "4px",
                }}
              >
                Kaydırın
              </span>
            </motion.div>
          </motion.div>
        </section>

        {/* ── FOTOĞRAF KARTLARI (BELLEKLER BÖLÜMÜ) ── */}
        <div className="relative z-10 py-16 px-6 max-w-4xl mx-auto">
          <div className="flex flex-col gap-32">
            {memories.map((m: any, i: number) => (
              <MemoryCard key={m.id} memory={m} index={i} />
            ))}
          </div>
        </div>



        {/* ── BİTİŞ EPİLOG BÖLÜMÜ ── */}
        <section
          className="relative flex flex-col items-center justify-center overflow-hidden py-36 z-10"
          style={{ background: "#0A0314", borderTop: "1px solid rgba(255,255,255,0.05)" }}
        >
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: `radial-gradient(circle at 50% 50%, ${config.accentColor}11 0%, transparent 70%)` }}
          />

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={stagger}
            className="relative z-10 flex flex-col items-center px-6 text-center"
          >
            <motion.div variants={fadeUp} className="mb-8">
              <Heart
                size={28}
                fill={config.accentColor}
                stroke="none"
                className="animate-pulse"
                style={{ filter: `drop-shadow(0 0 12px ${config.accentColor}aa)` }}
              />
            </motion.div>
            <motion.h2
              variants={fadeUp}
              style={{
                fontFamily: "var(--font-cormorant), serif",
                fontSize: "clamp(1.8rem, 4vw, 3.5rem)",
                fontWeight: 400,
                color: "#FFFFFF",
                letterSpacing: "0.04em",
                marginBottom: "1.5rem",
                lineHeight: 1.2,
              }}
            >
              Sonsuza Dek Birlikte
            </motion.h2>

            <motion.div
              variants={fadeUp}
              style={{
                fontFamily: "var(--font-inter), sans-serif",
                fontSize: "11px",
                letterSpacing: "0.42em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.6)",
                display: "block",
                whiteSpace: "pre-line",
                lineHeight: 1.4,
                paddingBottom: "4px"
              }}
            >
              {config.coupleNames}
            </motion.div>
            <motion.span
              variants={fadeIn}
              style={{
                fontFamily: "monospace",
                fontSize: "9px",
                color: "rgba(255,255,255,0.3)",
                letterSpacing: "0.3em",
                textTransform: "uppercase",
                marginTop: "0.75rem",
              }}
            >
              {config.specialDate}
            </motion.span>
          </motion.div>
        </section>

        {/* ── FOOTER ── */}
        <footer
          className="py-12 text-center relative z-10"
          style={{
            fontFamily: "var(--font-inter), sans-serif",
            fontSize: "9px",
            letterSpacing: "0.45em",
            textTransform: "uppercase",
            color: "#ffffff4d",
          }}
        >
          birlikteydik.com — Hazır Şablon
        </footer>
      </div>

      <style>{`
        
      `}</style>
    </main>
  
    </TemplateContext.Provider>
  );
}
