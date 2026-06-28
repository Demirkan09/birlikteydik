"use client";

import { useState, useEffect, useRef, createContext, useContext } from "react";
import { motion, Variants } from "framer-motion";
import { ChevronDown, Volume2, VolumeX, Heart } from "lucide-react";
import VideoPlayerPro from "@/components/ui/video-player-pro";

// ─────────────────────────────────────────────────────────────────────────────
// ⚙️  ŞABLON AYARLARI
//     Yeni bir şablon oluştururken sadece bu bloğu kopyala ve düzenle.
//     Renk, isim, tarih, müzik, tagline buradan yönetilir.
// ─────────────────────────────────────────────────────────────────────────────
const defaultConfig = {
  coupleNames: "Sen\n&\nBen",          // "\n" satır sonu yapar, "&" küçük gösterilir
  tagline: "Birlikte geçen her anın değerini ve sonsuzluğa uzanan hikayemizi kutluyoruz...",
  accentColor: "#C9A84C",              // Tema aksan rengi — tüm bileşenler buradan alır
  specialDate: "26 Ekim 2024",
  musicUrl: "/music/siyah.mp3",     // /public/music/ klasörüne koy
  finalHeading: "Sonsuza Dek Birlikte",
};

// ─────────────────────────────────────────────────────────────────────────────
// 📸  ANLAR (Müşteri Fotoğrafları / Videoları)
//     - image: "/moment.jpg" gibi /public/ içindeki yol
//     - video: opsiyonel, varsa fotoğraf yerine video oynatıcı gösterilir
//     - id: benzersiz anahtar (1, 2, 3 ...)
// ─────────────────────────────────────────────────────────────────────────────
const defaultMemories = [
  {
    id: 1,
    image: "/moment.jpg",
    // video: "/videos/moment1.mp4",   // Video göstermek istersen bu satırın yorumunu kaldır
    title: "İlk Bakış",
    description: "Gözlerin ilk kez benimkilerle buluştuğunda, tüm evren bir an için sessizleşti.",
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
    description: "Şehrin tüm gürültüsünden uzakta, gökyüzünü izlerken dilek tuttuğumuz o gece. İçimden hep aynı şeyi diledim: Sonsuzluk.",
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
    description: "Başardığımız, büyüdüğümüz ve geleceğe doğru ilk büyük adımı attığımız o gün; yanımda sen varsan her zorluğun üstesinden gelebileceğimi anladım.",
    date: "12 Haziran 2025",
  },
  {
    id: 7,
    image: "/moment6.jpg",
    title: "Beyazlar İçinde Bir Ömür",
    description: "Ellerinin arasında tuttuğun o güller, senin zarafetinin yanında sadece ufak birer ayrıntıydı. Hayatımın en berrak 'Evet'ini fısıldarken kalbimi sonsuza dek sana emanet ettim.",
    date: "18 Eylül 2025",
  },
  {
    id: 8,
    image: "/moment8.jpg",
    title: "Sonsuzluğun Kıyısında",
    description: "Şehrin, insanların ve zamanın fersah fersah uzağında... Sadece iki siluet olarak gökyüzünün ve denizin sonsuzluğuna karıştığımız o an.",
    date: "02 Mayıs 2026",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// 🎨  ANIMASYON VARIANTS
//     Tüm bileşenler bu shared variant'ları kullanır; tutarsızlık olmaz.
// ─────────────────────────────────────────────────────────────────────────────
const getDynamicFontSize = (names: string, baseMin: number, baseMax: number, baseVw = 8) => {
  if (!names) return `clamp(${baseMin}rem, ${baseVw}vw, ${baseMax}rem)`;
  const lines = names.split("\n");
  const nameLines = lines.map((l) => l.trim()).filter((l) => l !== "&" && l !== "");
  if (nameLines.length === 0) return `clamp(${baseMin}rem, ${baseVw}vw, ${baseMax}rem)`;
  const longest = Math.max(...nameLines.map((l) => l.length));
  if (longest > 6) {
    const factor = Math.max(6 / longest, 0.5);
    return `clamp(${baseMin * factor}rem, ${baseVw * factor}vw, ${baseMax * factor}rem)`;
  }
  return `clamp(${baseMin}rem, ${baseVw}vw, ${baseMax}rem)`;
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30, filter: "blur(4px)" },
  visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] } },
};

const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 1.2 } },
};

const stagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } },
};

// ─────────────────────────────────────────────────────────────────────────────
// 🫀  YÜZER KALP PARTİKÜLLERİ
//     - accentColor: config'den alınır, her şablonda farklı renk olabilir
//     - prefers-reduced-motion: açıksa canvas çalışmaz
//     - zIndex: -1 → içeriğin ARKASINDA kalır (z-10 içerik önünde)
// ─────────────────────────────────────────────────────────────────────────────
type Particle = { x: number; y: number; size: number; speed: number; opacity: number; drift: number; phase: number };

function HeartsCanvas({ accentColor }: { accentColor: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    // Kullanıcı "animasyonları azalt" diyorsa canvas'ı başlatma
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

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
      size: Math.random() * 7 + 3,
      speed: Math.random() * 0.25 + 0.1,
      opacity: Math.random() * 0.14 + 0.03,
      drift: (Math.random() - 0.5) * 0.35,
      phase: Math.random() * Math.PI * 2,
    }));

    const drawHeart = (cx: number, cy: number, size: number, opacity: number) => {
      ctx.save();
      ctx.globalAlpha = opacity;
      ctx.fillStyle = accentColor;
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
  }, [accentColor]); // accentColor değişirse canvas yeniden başlar

  return (
    <canvas
      ref={canvasRef}
      style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: -1 }}
    />
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 🎵  MÜZİK WİDGET'I (Plak / Vinyl)
//     accentColor prop olarak alınır — context yok, bağımsız bileşen
// ─────────────────────────────────────────────────────────────────────────────
function MusicWidget({
  isPlaying,
  toggleMusic,
  accentColor,
}: {
  isPlaying: boolean;
  toggleMusic: () => void;
  accentColor: string;
}) {
  return (
    <div
      onClick={toggleMusic}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "12px",
        background: "linear-gradient(135deg, #0a0a0c 0%, #18181b 60%, #0a0a0c 100%)",
        border: `1px solid ${accentColor}33`,
        borderRadius: "12px",
        padding: "10px 14px",
        cursor: "pointer",
        backdropFilter: "blur(20px)",
        boxShadow: `0 8px 32px rgba(0,0,0,0.7), 0 0 20px ${accentColor}0a`,
        transition: "transform 0.2s ease",
        userSelect: "none",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.02)")}
      onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
    >
      {/* Dönen Plak */}
      <motion.div
        animate={isPlaying ? { rotate: 360 } : { rotate: 0 }}
        transition={isPlaying ? { duration: 5, repeat: Infinity, ease: "linear" } : { duration: 0.3 }}
        style={{
          width: 44,
          height: 44,
          borderRadius: "50%",
          flexShrink: 0,
          background: "repeating-radial-gradient(circle, #27272a, #09090b 1px, #18181b 5px)",
          border: `2px solid ${accentColor}44`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: isPlaying ? `0 0 12px ${accentColor}55` : "none",
        }}
      >
        {/* Göbek */}
        <div
          style={{
            width: "13px",
            height: "13px",
            borderRadius: "50%",
            background: accentColor,
            border: "1px solid rgba(255,255,255,0.25)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div style={{ width: "3px", height: "3px", borderRadius: "50%", background: "#09090b" }} />
        </div>
      </motion.div>

      {/* Metin */}
      <div style={{ display: "flex", flexDirection: "column" }}>
        <span
          style={{
            fontFamily: "var(--font-cormorant), serif",
            fontSize: "13px",
            fontStyle: "italic",
            color: isPlaying ? accentColor : "rgba(255,255,255,0.75)",
            letterSpacing: "0.04em",
          }}
        >
          {isPlaying ? "Melodi Çalıyor..." : "Arka Plan Melodisi"}
        </span>
        <span
          style={{
            fontFamily: "var(--font-inter), sans-serif",
            fontSize: "9px",
            color: "rgba(255,255,255,0.35)",
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            marginTop: "2px",
          }}
        >
          {isPlaying ? "Tıkla & Durdur" : "Tıkla & Dinle"}
        </span>
      </div>

      {/* Ses İkonu */}
      <div style={{ marginLeft: "auto" }}>
        {isPlaying ? (
          <Volume2 size={14} style={{ color: accentColor, opacity: 0.9 }} className="animate-pulse" />
        ) : (
          <VolumeX size={14} style={{ color: "rgba(255,255,255,0.35)" }} />
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 📸  FOTOĞRAF / VİDEO KART
//     - memory.video varsa VideoPlayerPro kullanır, yoksa <img>
//     - accentColor'ı context'ten alır
// ─────────────────────────────────────────────────────────────────────────────
const TemplateContext = createContext<{ config: typeof defaultConfig; memories: typeof defaultMemories } | null>(null);

function MemoryCard({ memory, index }: { memory: (typeof defaultMemories)[0] & { video?: string }; index: number }) {
  const ctx = useContext(TemplateContext);
  const accentColor = ctx?.config.accentColor ?? "#C9A84C";

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      variants={stagger}
      style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "28px" }}
    >
      {/* Görsel Çerçeve */}
      <motion.div variants={fadeUp} style={{ width: "100%", position: "relative" }}>
        {/* Hafif ambient glow */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "2px",
            background: accentColor,
            filter: "blur(24px)",
            opacity: 0.06,
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "relative",
            overflow: "hidden",
            background: "#111113",
            border: `1px solid ${accentColor}22`,
          }}
        >
          {(memory as any).video ? (
            <VideoPlayerPro src={(memory as any).video} />
          ) : (
            <>
              <img
                src={memory.image}
                alt={memory.title}
                draggable={false}
                className="w-full h-auto block"
                style={{ pointerEvents: "none", userSelect: "none", WebkitUserSelect: "none" }}
              />
              {/* Alt gradient overlay */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "linear-gradient(to bottom, transparent 55%, rgba(10,10,12,0.35) 100%)",
                  pointerEvents: "none",
                }}
              />
            </>
          )}
        </div>
      </motion.div>

      {/* Metin */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          maxWidth: "320px",
          gap: "12px",
        }}
      >
        {/* Tarih satırı */}
        <motion.div variants={fadeIn} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ width: "28px", height: "1px", background: `${accentColor}55` }} />
          <span
            style={{
              fontFamily: "var(--font-inter), sans-serif",
              fontSize: "9px",
              color: `${accentColor}99`,
              letterSpacing: "0.3em",
              textTransform: "uppercase",
            }}
          >
            {memory.date}
          </span>
          <div style={{ width: "28px", height: "1px", background: `${accentColor}55` }} />
        </motion.div>

        {/* Başlık */}
        <motion.h3
          variants={fadeUp}
          style={{
            fontFamily: "var(--font-cormorant), serif",
            fontSize: "clamp(1.55rem, 3vw, 2.1rem)",
            fontWeight: 400,
            color: "#FFFFFF",
            lineHeight: 1.2,
            letterSpacing: "0.02em",
          }}
        >
          {memory.title}
        </motion.h3>

        {/* Açıklama */}
        <motion.p
          variants={fadeUp}
          style={{
            fontFamily: "var(--font-inter), sans-serif",
            fontSize: "0.875rem",
            color: "rgba(255,255,255,0.55)",
            lineHeight: 1.85,
            fontWeight: 300,
          }}
        >
          {memory.description}
        </motion.p>

        {/* Alt dekoratif çizgi */}
        <motion.div variants={fadeIn} style={{ width: "20px", height: "1px", background: `${accentColor}44` }} />
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 👑  ANA COMPONENT
//     Props olarak config ve memories alabilir (admin panelden yüklenecek veri),
//     yoksa defaultConfig / defaultMemories kullanır.
// ─────────────────────────────────────────────────────────────────────────────
export default function BosTemplate({
  config: propConfig,
  memories: propMemories,
}: {
  config?: Partial<typeof defaultConfig>;
  memories?: Array<(typeof defaultMemories)[0] & { video?: string }>;
} = {}) {
  const config = { ...defaultConfig, ...(propConfig ?? {}) };
  const memories = propMemories ?? defaultMemories;

  const [isPlaying, setIsPlaying] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Müzik URL değişince yeni Audio oluştur
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

  // Geri sayım: 4 saniye sonra otomatik başlat
  

  const toggleMusic = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  const ac = config.accentColor; // kısayol

  return (
    <TemplateContext.Provider value={{ config, memories }}>
      <main
        className="min-h-screen overflow-x-hidden"
        style={{
          background: "#09090b",
          color: "#FFFFFF",
          fontFamily: "var(--font-inter), sans-serif",
          position: "relative",
        }}
      >
        {/* ── ARKA PLAN: Ambient gradient ────────────────────────────────── */}
        <div
          style={{
            position: "fixed",
            inset: 0,
            pointerEvents: "none",
            zIndex: 0,
            background: `
              radial-gradient(ellipse 80% 55% at 50% -5%, ${ac}22 0%, transparent 60%),
              radial-gradient(ellipse 60% 45% at 85% 80%, ${ac}0d 0%, transparent 60%),
              linear-gradient(to bottom, #09090b, #0d0d10)
            `,
          }}
        />

        {/* ── YÜZER KALPLER (içeriğin arkasında) ────────────────────────── */}
        <HeartsCanvas accentColor={ac} />

        {/* ── MOBİL MERKEZ ÇERÇEVE ──────────────────────────────────────── */}
        {/*    max-w-[480px]: Masaüstünde dar mobil görünüm verir            */}
        {/*    zIndex: 10 → canvas (zIndex -1) üzerinde kalır                */}
        <div
          className="relative w-full max-w-[480px] mx-auto min-h-screen flex flex-col"
          style={{
            zIndex: 10,
            borderLeft: `1px solid ${ac}12`,
            borderRight: `1px solid ${ac}12`,
          }}
        >
          {/* ── MÜZİK WİDGET'I (sol alt sabit) ──────────────────────────── */}
          <div className="fixed lg:absolute bottom-6 left-6 z-40">
            <MusicWidget isPlaying={isPlaying} toggleMusic={toggleMusic} accentColor={ac} />
          </div>

          {/* ────────────────────────────────────────────────────────────── */}
          {/* HERO                                                           */}
          {/* ────────────────────────────────────────────────────────────── */}
          <section
            className="relative flex flex-col items-center justify-center overflow-hidden w-full h-[100svh]"
          >
            <motion.div
              initial="hidden"
              animate="visible"
              variants={stagger}
              className="relative z-20 flex flex-col items-center px-6 text-center"
            >
              {/* Eyebrow: Özel Tarih */}
              <motion.div variants={fadeIn} style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "28px" }}>
                <div style={{ width: "28px", height: "1px", background: `${ac}55` }} />
                <Heart size={9} fill={ac} stroke="none" className="animate-pulse" style={{ opacity: 0.75 }} />
                <span
                  style={{
                    fontFamily: "var(--font-inter), sans-serif",
                    fontSize: "9px",
                    letterSpacing: "0.48em",
                    textTransform: "uppercase",
                    color: `${ac}bb`,
                  }}
                >
                  {config.specialDate}
                </span>
                <Heart size={9} fill={ac} stroke="none" className="animate-pulse" style={{ opacity: 0.75 }} />
                <div style={{ width: "28px", height: "1px", background: `${ac}55` }} />
              </motion.div>

              {/* İsimler */}
              <motion.h1
                variants={fadeUp}
                style={{
                  fontFamily: "var(--font-cormorant), serif",
                  fontSize: getDynamicFontSize(config.coupleNames, 2.5, 4.8, 7),
                  fontWeight: 400,
                  lineHeight: 1.2,
                  paddingBottom: "0.1em",
                  letterSpacing: "0.04em",
                  background: `linear-gradient(160deg, rgba(255,255,255,0.96) 0%, ${ac}cc 55%, ${ac}88 100%)`,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  whiteSpace: "pre-line",
                }}
              >
                {config.coupleNames}
              </motion.h1>

              {/* Dekoratif kalp çizgisi */}
              <motion.div variants={fadeIn} style={{ display: "flex", alignItems: "center", gap: "10px", margin: "20px 0" }}>
                <Heart size={6} fill={ac} stroke="none" style={{ opacity: 0.35 }} />
                <Heart size={14} fill={ac} stroke="none" className="animate-pulse" style={{ opacity: 0.9, filter: `drop-shadow(0 0 8px ${ac}bb)` }} />
                <Heart size={6} fill={ac} stroke="none" style={{ opacity: 0.35 }} />
              </motion.div>

              {/* Tagline */}
              <motion.p
                variants={fadeUp}
                style={{
                  fontFamily: "var(--font-inter), sans-serif",
                  fontSize: "0.78rem",
                  color: "rgba(255,255,255,0.5)",
                  letterSpacing: "0.06em",
                  lineHeight: 1.95,
                  maxWidth: "26rem",
                  marginTop: "8px",
                  marginBottom: "40px",
                }}
              >
                {config.tagline}
              </motion.p>

              {/* Müzik Butonu */}
              
            </motion.div>

            {/* Scroll göstergesi */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.45 }}
              transition={{ delay: 2.2, duration: 1.5 }}
              style={{
                position: "absolute",
                bottom: "32px",
                left: "50%",
                transform: "translateX(-50%)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}>
                <ChevronDown size={18} style={{ color: ac }} />
              </motion.div>
              <span
                style={{
                  fontFamily: "var(--font-inter), sans-serif",
                  fontSize: "8px",
                  letterSpacing: "0.38em",
                  textTransform: "uppercase",
                  color: `${ac}99`,
                }}
              >
                Kaydır
              </span>
            </motion.div>
          </section>

          {/* ────────────────────────────────────────────────────────────── */}
          {/* BÖLÜM BAŞLIĞI                                                  */}
          {/* ────────────────────────────────────────────────────────────── */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={stagger}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              padding: "80px 24px 56px",
              textAlign: "center",
              borderTop: `1px solid ${ac}18`,
              background: "linear-gradient(to bottom, #09090b, #0d0d12)",
            }}
          >
            <motion.span
              variants={fadeIn}
              style={{
                fontFamily: "var(--font-inter), sans-serif",
                fontSize: "9px",
                letterSpacing: "0.45em",
                textTransform: "uppercase",
                color: `${ac}99`,
                marginBottom: "12px",
              }}
            >
              {/* ← Bu bölüm etiketini şablona göre değiştir */}
              Birlikte Yazdığımız
            </motion.span>
            <motion.h2
              variants={fadeUp}
              style={{
                fontFamily: "var(--font-cormorant), serif",
                fontSize: "clamp(1.8rem, 5vw, 3rem)",
                fontWeight: 400,
                color: "#FFFFFF",
                letterSpacing: "0.04em",
                lineHeight: 1.2,
              }}
            >
              {/* ← Bölüm başlığı */}
              Hikayemiz
            </motion.h2>
            <motion.div variants={fadeIn} style={{ width: "28px", height: "1px", marginTop: "20px", background: `${ac}55` }} />
          </motion.div>

          {/* ────────────────────────────────────────────────────────────── */}
          {/* FOTOĞRAF KARTLARI                                              */}
          {/* ────────────────────────────────────────────────────────────── */}
          <div style={{ padding: "16px 20px 64px", display: "flex", flexDirection: "column", gap: "80px" }}>
            {memories.map((m, i) => (
              <MemoryCard key={m.id} memory={m as any} index={i} />
            ))}
          </div>

          {/* ────────────────────────────────────────────────────────────── */}
          {/* FİNAL / EPİLOG                                                 */}
          {/* ────────────────────────────────────────────────────────────── */}
          <section
            style={{
              position: "relative",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "96px 24px",
              borderTop: `1px solid ${ac}18`,
              background: "#060608",
              overflow: "hidden",
            }}
          >
            {/* Ambient radial glow */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                pointerEvents: "none",
                background: `radial-gradient(circle at 50% 50%, ${ac}14 0%, transparent 70%)`,
              }}
            />

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              variants={stagger}
              style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: "20px" }}
            >
              <motion.div variants={fadeUp}>
                <Heart
                  size={28}
                  fill={ac}
                  stroke="none"
                  className="animate-pulse"
                  style={{ filter: `drop-shadow(0 0 12px ${ac}99)` }}
                />
              </motion.div>

              <motion.h2
                variants={fadeUp}
                style={{
                  fontFamily: "var(--font-cormorant), serif",
                  fontSize: "clamp(1.8rem, 5vw, 3.5rem)",
                  fontWeight: 400,
                  color: "#FFFFFF",
                  letterSpacing: "0.04em",
                  lineHeight: 1.2,
                }}
              >
                {config.finalHeading}
              </motion.h2>

              <motion.div
                variants={fadeIn}
                style={{ display: "flex", alignItems: "center", gap: "10px" }}
              >
                <Heart size={6} fill={ac} stroke="none" style={{ opacity: 0.35 }} />
                <Heart size={12} fill={ac} stroke="none" style={{ opacity: 0.85, filter: `drop-shadow(0 0 8px ${ac}cc)` }} />
                <Heart size={6} fill={ac} stroke="none" style={{ opacity: 0.35 }} />
              </motion.div>

              {/* Çift İsimleri */}
              <motion.div
                variants={fadeUp}
                style={{
                  fontFamily: "var(--font-inter), sans-serif",
                  fontSize: "11px",
                  letterSpacing: "0.42em",
                  textTransform: "uppercase",
                  color: "rgba(255,255,255,0.6)",
                  whiteSpace: "pre-line",
                  lineHeight: 1.5,
                }}
              >
                {config.coupleNames}
              </motion.div>

              {/* Özel Tarih */}
              <motion.span
                variants={fadeIn}
                style={{
                  fontFamily: "monospace",
                  fontSize: "9px",
                  color: "rgba(255,255,255,0.25)",
                  letterSpacing: "0.3em",
                  textTransform: "uppercase",
                }}
              >
                {config.specialDate}
              </motion.span>
            </motion.div>
          </section>

          {/* ── FOOTER ─────────────────────────────────────────────────── */}
          <footer
            style={{
              padding: "40px 24px",
              textAlign: "center",
              fontFamily: "var(--font-inter), sans-serif",
              fontSize: "9px",
              letterSpacing: "0.45em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.18)",
              borderTop: `1px solid ${ac}0d`,
            }}
          >
            birlikteydik.com
          </footer>
        </div>
      </main>
    </TemplateContext.Provider>
  );
}
