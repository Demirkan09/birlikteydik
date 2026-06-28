"use client";

import { useState, useEffect, useRef, createContext, useContext } from "react";
import { motion, Variants, useScroll, useTransform } from "framer-motion";
import { Music, VolumeOff } from "lucide-react";
import VideoPlayerPro from "@/components/ui/video-player-pro";

// ─── MÜŞTERİ VERİLERİ (Koyu Gül Kurusu Konsepti) ──────────────────────────────
const defaultConfig = {
  coupleNames: "Serkan\n&\nKübra",
  tagline: "Karanlığın en zarif tonunda, aşkımızın en derin izleri... Koyu kadife gül kurusu ve gül yapraklarının süzüldüğü sonsuz bir rüya.",
  specialDate: "14 Şubat 2025",
  musicUrl: "/music/retro.mp3",
  videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-romantic-couple-enjoying-a-sunset-together-42417-large.mp4",
};

const defaultMemories = [
  { id: 1, image: "/moment.jpg", title: "İlk Günümüz", caption: "gözlerinde kaybolduğum o ilk an...", date: "Şubat '25", rotate: -2.5 },
  { id: 2, image: "/moment2.jpg", title: "Sıkıca El Ele", caption: "ellerin ellerime en güzel emanet", date: "Mart '25", rotate: 1.8 },
  { id: 3, image: "/moment7.jpg", title: "Sonsuz Zaman", caption: "zaman durdu, dünya sadece ikimizden ibaret", date: "Nisan '25", rotate: -1.2 },
  { id: 4, image: "/moment3.jpg", title: "Gece Yarısı Esintisi", caption: "yıldızlar altında sessizce dinledik geceyi", date: "Ocak '25", rotate: 2.3 },
  { id: 5, image: "/moment4.jpg", title: "Deniz ve Huzur", caption: "seninle her liman sakin, her yolculuk güzel", date: "Nisan '25", rotate: -1.8 },
  { id: 6, image: "/moment5.jpg", title: "Küçük Başarılar", caption: "omuz omuza verdikten sonra her şey kolay", date: "Haziran '25", rotate: 1.5 },
  { id: 7, image: "/moment6.jpg", title: "En Güzel Evet", caption: "bir ömre seninle yürümek için kocaman evet", date: "Eylül '25", rotate: -2.1 },
  { id: 8, image: "/moment8.jpg", title: "Sonsuz Ufuklar", caption: "seninle başlayan hikayemizin sonsuz ufkundayız", date: "Mayıs '26", rotate: 1.9 },
];

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 1, ease: [0.16, 1, 0.3, 1] } },
};
const stagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

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

// ─── GÜL YAPRAKLARI PARTİKÜLLERİ ─────────────────────────────────────────────
function FallingRosePetals() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
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
    const petals = Array.from({ length: 22 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      size: Math.random() * 7 + 3,
      speedY: Math.random() * 0.45 + 0.15,
      speedX: (Math.random() - 0.5) * 0.3,
      rotation: Math.random() * 360,
      rotSpeed: (Math.random() - 0.5) * 1.5,
      opacity: Math.random() * 0.22 + 0.06,
    }));
    let raf: number;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      petals.forEach((p) => {
        p.y += p.speedY;
        p.x += p.speedX;
        p.rotation += p.rotSpeed;
        if (p.y > canvas.height + 10) {
          p.y = -10;
          p.x = Math.random() * canvas.width;
        }
        ctx.save();
        ctx.globalAlpha = p.opacity;
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        
        // Koyu gül kurusu tonlarında yaprak gradyanı
        const grad = ctx.createLinearGradient(-p.size, 0, p.size, 0);
        grad.addColorStop(0, "#8C4E43");
        grad.addColorStop(0.5, "#B87569");
        grad.addColorStop(1, "#542D26");
        ctx.fillStyle = grad;
        
        ctx.beginPath();
        ctx.ellipse(0, 0, p.size, p.size * 0.65, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(raf);
    };
  }, []);
  return <canvas ref={canvasRef} style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }} />;
}

// ─── KOYU PLAK MÜZİK WİDGET'I ────────────────────────────────────────────────
function RecordWidget({ isPlaying, toggle }: { isPlaying: boolean; toggle: () => void }) {
  return (
    <div
      onClick={toggle}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "12px",
        cursor: "pointer",
        background: "#261619",
        border: "1px solid rgba(229,194,186,0.18)",
        borderRadius: "12px",
        padding: "10px 16px",
        boxShadow: "0 10px 32px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.03)",
        backdropFilter: "blur(12px)",
      }}
    >
      <div style={{ position: "relative", width: "36px", height: "36px" }}>
        <motion.div
          animate={isPlaying ? { rotate: 360 } : { rotate: 0 }}
          transition={isPlaying ? { duration: 3, repeat: Infinity, ease: "linear" } : {}}
          style={{
            width: "36px",
            height: "36px",
            borderRadius: "50%",
            background: "conic-gradient(from 0deg, #1C0A0D, #4F2228, #1C0A0D, #3D1A20, #1C0A0D)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 2px 10px rgba(0,0,0,0.5)",
            border: "1px solid rgba(229,194,186,0.1)",
          }}
        >
          {/* Plak göbeği */}
          <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#E5C2BA", border: "1px solid #1C0A0D" }} />
        </motion.div>
      </div>
      <div>
        <div style={{ fontFamily: "'Pinyon Script', cursive", fontSize: "21px", color: "#E5C2BA", lineHeight: 1 }}>
          {isPlaying ? "melodi çalıyor..." : "Müzik"}
        </div>
        <div style={{ fontFamily: "var(--font-lato), sans-serif", fontSize: "8px", color: "rgba(229,194,186,0.45)", letterSpacing: "0.22em", textTransform: "uppercase", marginTop: "3px" }}>
          {isPlaying ? "durdur" : "dinle"}
        </div>
      </div>
      <div className="ml-auto flex items-center justify-center">
        {isPlaying ? (
          <Music size={13} color="#E5C2BA" className="animate-pulse" />
        ) : (
          <VolumeOff size={13} color="rgba(229,194,186,0.3)" />
        )}
      </div>
    </div>
  );
}

// ─── KOYU LUXURY POLAROİD KART ───────────────────────────────────────────────
function KoyuPolaroidCard({ memory, index }: { memory: any[0]; index: number }) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-60px" }}
      variants={stagger}
      style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "20px" }}
    >
      <motion.div
        variants={fadeUp}
        whileHover={{ rotate: 0, scale: 1.02 }}
        style={{
          rotate: memory.rotate,
          background: "#ffffff",
          padding: "10px 10px 44px 10px",
          border: "1px solid rgba(229,194,186,0.18)",
          boxShadow: "0 16px 40px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.02)",
          width: "100%",
          maxWidth: "290px",
          position: "relative",
          borderRadius: "2px",
        }}
      >
        {/* Fotoğraf alanı */}
        <div style={{ overflow: "hidden", position: "relative" }}>
          {memory.video ? (
            <VideoPlayerPro src={memory.video} />
          ) : (
            <>
              <img
                src={memory.image}
                alt={memory.title}
                draggable={false}
                style={{ width: "100%", display: "block", filter: "brightness(0.9) contrast(1.03) saturate(0.9)", pointerEvents: "none", userSelect: "none", WebkitUserSelect: "none" }}
              />
              {/* Vintage rose filter overlay */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "radial-gradient(ellipse at center, transparent 40%, rgba(38,22,25,0.4) 100%)",
                  pointerEvents: "none",
                }}
              />
            </>
          )}
        </div>
        
        {/* Caption alanı text rengi vs.*/}
        <div style={{ paddingTop: "14px", paddingLeft: "6px" }}>
          <div style={{ fontFamily: "'Pinyon Script', cursive", fontSize: "24px", color: "#000000", lineHeight: 1.2 }}>
            {memory.caption}
          </div>
          <div style={{ fontFamily: "var(--font-lato), sans-serif", fontSize: "8px", color: "#000000", opacity: 0.6, letterSpacing: "0.2em", marginTop: "5px", textTransform: "uppercase" }}>
            {memory.date}
          </div>
        </div>
        
        {/* Rose-gold tape decal */}
        <div
          style={{
            position: "absolute",
            top: "-8px",
            left: "50%",
            transform: "translateX(-50%) rotate(2deg)",
            width: "44px",
            height: "18px",
            background: "rgba(229,194,186,0.22)",
            border: "1px solid rgba(229,194,186,0.1)",
            boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
            backdropFilter: "blur(1px)",
            borderRadius: "1px",
          }}
        />
      </motion.div>

      {/* Metin Detayı */}
      <motion.div variants={stagger} style={{ textAlign: "center", display: "flex", flexDirection: "column", gap: "10px", maxWidth: "280px" }}>
        <motion.h3
          variants={fadeUp}
          style={{
            fontFamily: "var(--font-cormorant), serif",
            fontSize: "clamp(1.5rem, 5vw, 2rem)",
            fontWeight: 400,
            color: "#ffffff",
            letterSpacing: "0.02em",
            lineHeight: 1.25,
          }}
        >
          {memory.title}
        </motion.h3>
        <motion.div variants={fadeUp} style={{ width: "32px", height: "1px", background: "rgba(229,194,186,0.25)", margin: "0 auto" }} />
      </motion.div>
    </motion.div>
  );
}

// ─── ANA COMPONENT ───────────────────────────────────────────────────────────
const TemplateContext = createContext<any>(null);

export default function DarkRoseTemplate({ config: propConfig, memories: propMemories }: { config?: any, memories?: any[] } = {}) {
  const config = propConfig ?? defaultConfig;
  const memories = propMemories ?? defaultMemories;
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 100]);

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

  const toggle = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  return (
    <TemplateContext.Provider value={{ config, memories }}>
      <main style={{ minHeight: "100vh", overflowX: "hidden", background: "#130A0C", color: "#F9F3F1", fontFamily: "var(--font-lato), sans-serif" }}>
        
        {/* Kadife gül kurusu gradient katmanları */}
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 0,
            background: "radial-gradient(circle at 50% 50%, rgba(140,78,67,0.08) 0%, transparent 80%), linear-gradient(180deg, #130A0C 0%, #1A0F11 100%)",
            pointerEvents: "none",
          }}
        />

        {/* Vintage noise grain filter */}
        <div
          style={{
            position: "fixed",
            inset: 0,
            pointerEvents: "none",
            zIndex: 1,
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.95' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E")`,
            opacity: 0.5,
          }}
        />

        {/* Düşen yapraklar */}
        <FallingRosePetals />

        {/* Mobil çerçeve */}
        <div
          style={{
            position: "relative",
            width: "100%",
            maxWidth: "480px",
            margin: "0 auto",
            minHeight: "100vh",
            zIndex: 10,
            background: "rgba(22, 12, 14, 0.85)",
            boxShadow: "0 0 80px rgba(0,0,0,0.8)",
            borderLeft: "1px solid rgba(229,194,186,0.08)",
            borderRight: "1px solid rgba(229,194,186,0.08)",
          }}
        >
          {/* Music vinyl float control */}
          <div className="fixed lg:absolute bottom-6 left-6 z-40">
            <RecordWidget isPlaying={isPlaying} toggle={toggle} />
          </div>

          {/* HERO BAŞLIK */}
          <section
            ref={heroRef}
            style={{
              position: "relative",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              height: "100svh",
              textAlign: "center",
              padding: "0 40px",
              overflow: "hidden",
            }}
          >
            <motion.div style={{ opacity: heroOpacity, y: heroY }} className="flex flex-col items-center">
              <span
                style={{
                  fontFamily: "var(--font-lato), sans-serif",
                  fontSize: "10px",
                  letterSpacing: "0.42em",
                  textTransform: "uppercase",
                  color: "#faf2f0",
                  marginBottom: "20px",
                  fontWeight: 400,
                  opacity: 0.8,
                }}
              >
                Bizim Hikayemiz
              </span>

              <h1
                style={{
                  fontFamily: "var(--font-cormorant), serif",
                  fontSize: getDynamicFontSize(config.coupleNames, 2.5, 4.5, 7),
                  fontWeight: 400,
                  color: "#F9F3F1",
                  lineHeight: 1.2,
                  paddingBottom: "0.1em",
                  letterSpacing: "0.03em",
                  marginBottom: "20px",
                  whiteSpace: "pre-line",
                }}
              >
                {config.coupleNames}
              </h1>

              <div
                style={{
                  width: "24px",
                  height: "1px",
                  background: "rgba(229,194,186,0.3)",
                  marginBottom: "24px",
                }}
              />

              <p
                style={{
                  fontFamily: "var(--font-lato), sans-serif",
                  fontSize: "13px",
                  color: "rgba(249,243,241,0.65)",
                  lineHeight: 1.9,
                  fontWeight: 300,
                  maxWidth: "320px",
                }}
              >
                {config.tagline}
              </p>

              

              <span
                style={{
                  fontFamily: "var(--font-lato), sans-serif",
                  fontSize: "10px",
                  color: "#E5C2BA",
                  opacity: 0.5,
                  letterSpacing: "0.15em",
                  marginTop: "28px",
                  textTransform: "uppercase",
                }}
              >
                {config.specialDate}
              </span>
            </motion.div>
          </section>

          {/* FOTOĞRAFLAR AKIŞI */}
          <section style={{ padding: "80px 24px", display: "flex", flexDirection: "column", gap: "90px" }}>
            {memories.map((m: any, i: number) => (
              <KoyuPolaroidCard key={m.id} memory={m} index={i} />
            ))}
          </section>

          {/* FOOTER */}
          <footer
            style={{
              padding: "60px 24px 100px",
              textAlign: "center",
              fontFamily: "var(--font-lato), sans-serif",
              fontSize: "10px",
              color: "rgba(229,194,186,0.35)",
              letterSpacing: "0.25em",
              textTransform: "uppercase",
              borderTop: "1px solid rgba(229,194,186,0.06)",
            }}
          >
            Sonsuza Dek Beraber — birlikteydik.com
          </footer>
        </div>
      </main>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Pinyon+Script&display=swap');
      `}</style>
    </TemplateContext.Provider>
  );
}