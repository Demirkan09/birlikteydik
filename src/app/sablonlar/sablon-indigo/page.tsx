"use client";

import {  useState, useEffect, useRef , createContext, useContext } from "react";
import { motion, Variants, useScroll, useTransform } from "framer-motion";
import { Play, Pause, Star } from "lucide-react";
import VideoPlayerPro from "@/components/ui/video-player-pro";

// ─── MÜŞTERİ VERİLERİ ───────────────────────────────────────────────────────
const defaultConfig = {
  coupleNames: "Melek\n&\nÖmer",
  partnerName: "Sana",
  tagline: "Gecenin en derin mavisinde, yıldızlar bile bizim hikayemizi fısıldıyor.",
  specialDate: "14 Şubat 2025",
  musicUrl: "/music/indigo.mp3",
  videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-romantic-couple-enjoying-a-sunset-together-42417-large.mp4",
};

const defaultMemories = [
  { id: 1, image: "/moment.jpg", title: "İlk Bakış", description: "Gözlerin ilk kez benimkilerle buluştuğunda, tüm evren bir an için sessizleşti.", date: "14 Şubat 2025", frame: "01" },
  { id: 2, image: "/moment2.jpg", title: "Gece Yürüyüşü", description: "Sokak lambalarının altında, ellerimiz birbirine kenetlenmiş, dünya sadece bizden ibaretti.", date: "12 Mart 2025", frame: "02" },
  { id: 3, image: "/moment7.jpg", title: "Sonsuz An", description: "Zamanın durduğu o saniyelerde, seni ne kadar sevdiğimi kelimeler anlatamaz.", date: "25 Nisan 2025", frame: "03" },
  { id: 4, image: "/moment3.jpg", title: "Yıldızlar Altında", description: "Gökyüzüne baktık ama ben sadece seni gördüm. Sen benim en parlak yıldızımsın.", date: "18 Ocak 2025", frame: "04" },
  { id: 5, image: "/moment4.jpg", title: "Huzur", description: "Yanında olmak; dalgaların sakin olduğu, rüzgarın dindiği, kalbimin huzur bulduğu tek yer.", date: "22 Nisan 2025", frame: "05" },
  { id: 6, image: "/moment5.jpg", title: "Yeni Ufuklar", description: "Seninle her yeni başlangıç, daha güzel bir geleceğe açılan bir kapı.", date: "12 Haziran 2025", frame: "06" },
  { id: 7, image: "/moment6.jpg", title: "Ebediyet", description: "Sonsuzluğa verdiğim söz, senin ellerinde güvende.", date: "18 Eylül 2025", frame: "07" },
  { id: 8, image: "/moment8.jpg", title: "Ufuk", description: "Horizon'un ötesinde ne olursa olsun, seninle yürümek istiyorum.", date: "02 Mayıs 2026", frame: "08" },
];

// ─── ANİMASYON ────────────────────────────────────────────────────────────────
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 50, filter: "blur(8px)" },
  visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 1.2, ease: [0.16, 1, 0.3, 1] } },
};
const stagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } },
};

// ─── YILDIZ PARTİKÜLLERİ ─────────────────────────────────────────────────────
function StarField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener("resize", resize);
    const stars = Array.from({ length: 120 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      r: Math.random() * 1.5 + 0.3,
      alpha: Math.random(),
      speed: Math.random() * 0.005 + 0.002,
      phase: Math.random() * Math.PI * 2,
    }));
    let t = 0;
    let raf: number;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      t += 0.01;
      stars.forEach(s => {
        const a = 0.3 + 0.7 * Math.abs(Math.sin(t * s.speed * 20 + s.phase));
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(160,200,255,${a * 0.6})`;
        ctx.fill();
      });
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { window.removeEventListener("resize", resize); cancelAnimationFrame(raf); };
  }, []);
  return <canvas ref={canvasRef} style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }} />;
}

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

// ─── MÜZİK OYNATICI ──────────────────────────────────────────────────────────
function VinylPlayer({ isPlaying, toggle }: { isPlaying: boolean; toggle: () => void }) {
  return (
    <div
      onClick={toggle}
      style={{
        display: "flex", alignItems: "center", gap: "12px",
        background: "rgba(10,20,50,0.85)",
        border: "1px solid rgba(100,160,255,0.2)",
        borderRadius: "12px",
        padding: "12px 16px",
        cursor: "pointer",
        backdropFilter: "blur(20px)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
      }}
    >
      <motion.div
        animate={isPlaying ? { rotate: 360 } : { rotate: 0 }}
        transition={isPlaying ? { duration: 3, repeat: Infinity, ease: "linear" } : { duration: 0.3 }}
        style={{
          width: 40, height: 40, borderRadius: "50%",
          background: "conic-gradient(from 0deg, #0a1432, #1a3a7a, #0a1432, #0d2060, #0a1432)",
          border: "2px solid rgba(100,160,255,0.3)",
          display: "flex", alignItems: "center", justifyContent: "center",
          position: "relative",
        }}
      >
        <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#0a1432", border: "1px solid rgba(100,160,255,0.5)" }} />
        <div style={{
          position: "absolute", inset: 4, borderRadius: "50%",
          border: "1px solid rgba(100,160,255,0.1)",
        }} />
      </motion.div>
      <div style={{ display: "flex", flexDirection: "column" }}>
        <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "11px", color: isPlaying ? "rgba(160,200,255,0.9)" : "rgba(100,140,200,0.7)", letterSpacing: "0.05em" }}>
          {isPlaying ? "Çalıyor..." : "Müzik"}
        </span>
        <span style={{ fontFamily: "monospace", fontSize: "9px", color: "rgba(60,100,180,0.6)", letterSpacing: "0.2em", textTransform: "uppercase" }}>
          {isPlaying ? "Durdur" : "Dinle"}
        </span>
      </div>
      <div style={{ marginLeft: "auto" }}>
        {isPlaying
          ? <Pause size={14} color="rgba(100,160,255,0.8)" />
          : <Play size={14} color="rgba(60,100,180,0.6)" />}
      </div>
    </div>
  );
}

// ─── FİLM ŞERİDİ KART ────────────────────────────────────────────────────────
function FilmCard({ memory, index }: { memory: any[0]; index: number }) {
  const isEven = index % 2 === 0;
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      variants={stagger}
      style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "24px" }}
    >
      {/* Film şeridi çerçeve */}
      <motion.div variants={fadeUp} style={{ width: "100%", position: "relative" }}>
        {/* Fotoğraf */}
        <div style={{
          position: "relative", overflow: "hidden",
          border: "1px solid rgba(30,60,120,0.5)",
          background: "#040d24",
        }}>
          <div style={{ position: "absolute", top: "8px", left: "8px", zIndex: 2, fontFamily: "monospace", fontSize: "9px", color: "rgba(100,160,255,0.5)", letterSpacing: "0.2em" }}>
            {memory.frame}
          </div>
          {memory.video ? (
            <VideoPlayerPro src={memory.video} />
          ) : (
            <img src={memory.image} alt={memory.title} draggable={false} style={{ width: "100%", display: "block", filter: "brightness(0.9) contrast(1.05)", pointerEvents: "none", userSelect: "none", WebkitUserSelect: "none" }} />
          )}
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, transparent 60%, rgba(4,13,36,0.6) 100%)", pointerEvents: "none" }} />
        </div>
      </motion.div>

      {/* Metin */}
      <motion.div variants={stagger} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px", maxWidth: "300px", textAlign: "center" }}>
        <motion.span variants={fadeUp} style={{ fontFamily: "monospace", fontSize: "9px", color: "rgba(60,100,180,0.7)", letterSpacing: "0.35em", textTransform: "uppercase" }}>
          {memory.date}
        </motion.span>
        <motion.h3 variants={fadeUp} style={{
          fontFamily: "'Playfair Display', serif", fontSize: "clamp(1.4rem, 5vw, 2rem)",
          fontWeight: 400, color: "rgba(200,225,255,0.95)", lineHeight: 1.15, letterSpacing: "0.02em",
        }}>
          {memory.title}
        </motion.h3>
        <motion.p variants={fadeUp} style={{
          fontFamily: "'Space Grotesk', sans-serif", fontSize: "0.82rem",
          color: "rgba(130,170,230,0.55)", lineHeight: 1.85, fontWeight: 300,
        }}>
          {memory.description}
        </motion.p>
        <motion.div variants={fadeUp} style={{ width: "24px", height: "1px", background: "rgba(60,100,180,0.4)" }} />
      </motion.div>
    </motion.div>
  );
}

// ─── ANA COMPONENT ────────────────────────────────────────────────────────────

const TemplateContext = createContext<any>(null);
export default function MidnightVelvetTemplate({ config: propConfig, memories: propMemories }: { config?: any, memories?: any[] } = {}) {
  const config = propConfig ?? defaultConfig;
  const memories = propMemories ?? defaultMemories;
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

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
    if (isPlaying) { audioRef.current.pause(); setIsPlaying(false); }
    else { audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {}); }
  };

  return (
    <TemplateContext.Provider value={{ config, memories }}>
    <main style={{ minHeight: "100vh", overflowX: "hidden", background: "#04091a", color: "#c8e1ff", fontFamily: "'Space Grotesk', sans-serif" }}>
      {/* Ambient */}
      <div style={{
        position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0,
        background: `
          radial-gradient(ellipse 90% 60% at 50% -5%, rgba(30,80,200,0.18) 0%, transparent 65%),
          radial-gradient(ellipse 50% 40% at 15% 80%, rgba(10,40,120,0.12) 0%, transparent 60%),
          radial-gradient(ellipse 50% 40% at 85% 30%, rgba(20,60,160,0.1) 0%, transparent 60%)
        `
      }} />
      <StarField />

      {/* Centered container */}
      <div style={{ position: "relative", width: "100%", maxWidth: "480px", margin: "0 auto", minHeight: "100vh", zIndex: 10, borderLeft: "1px solid rgba(30,60,120,0.15)", borderRight: "1px solid rgba(30,60,120,0.15)" }}>
        {/* Music widget */}
        <div className="fixed lg:absolute bottom-6 left-6 z-40">
          <VinylPlayer isPlaying={isPlaying} toggle={toggle} />
        </div>

        {/* HERO */}
        <section ref={heroRef} style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100svh", overflow: "hidden" }}>
          <motion.div style={{ y: heroY, opacity: heroOpacity }} initial="hidden" animate="visible">
            <motion.div variants={stagger} style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", padding: "0 32px" }}>

              {/* Yıldız dekorasyonu */}
              <motion.div variants={fadeUp} style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "32px" }}>
                <Star size={8} fill="rgba(100,160,255,0.4)" stroke="none" />
                <span style={{ fontFamily: "monospace", fontSize: "9px", color: "rgba(60,100,200,0.7)", letterSpacing: "0.5em", textTransform: "uppercase" }}>
                  {config.specialDate}
                </span>
                <Star size={8} fill="rgba(100,160,255,0.4)" stroke="none" />
              </motion.div>

              <motion.h1 variants={fadeUp} style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: getDynamicFontSize(config.coupleNames, 2.5, 4.5, 7),
                fontWeight: 400,
                lineHeight: 1.2,
                paddingBottom: "0.1em",
                letterSpacing: "0.03em",
                background: "linear-gradient(160deg, rgba(255,255,255,0.95) 0%, rgba(100,160,255,0.6) 50%, rgba(50,100,220,0.5) 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                whiteSpace: "pre-line",
              }}>
                {config.coupleNames}
              </motion.h1>

              {/* Yatay çizgi */}
              <motion.div variants={fadeUp} style={{ display: "flex", alignItems: "center", gap: "16px", margin: "28px 0" }}>
                <div style={{ flex: 1, height: "1px", background: "linear-gradient(to right, transparent, rgba(60,100,200,0.4))" }} />
                <Star size={12} fill="rgba(100,160,255,0.7)" stroke="none" style={{ filter: "drop-shadow(0 0 6px rgba(100,160,255,0.8))" }} />
                <div style={{ flex: 1, height: "1px", background: "linear-gradient(to left, transparent, rgba(60,100,200,0.4))" }} />
              </motion.div>

              <motion.p variants={fadeUp} style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: "0.78rem",
                color: "rgba(130,170,230,0.55)",
                letterSpacing: "0.08em",
                lineHeight: 2,
                maxWidth: "22rem",
                marginBottom: "40px",
              }}>
                {config.tagline}
              </motion.p>

              

            </motion.div>
          </motion.div>

          {/* Scroll */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.45 }} transition={{ delay: 2, duration: 1.5 }}
            style={{ position: "absolute", bottom: "32px", left: "50%", transform: "translateX(-50%)", display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
            <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 2.5, repeat: Infinity }}>
              <div style={{ width: "1px", height: "40px", background: "linear-gradient(to bottom, rgba(60,100,200,0.5), transparent)" }} />
            </motion.div>
            <span style={{ fontFamily: "monospace", fontSize: "7px", letterSpacing: "0.4em", color: "rgba(60,100,200,0.6)", textTransform: "uppercase" }}>Kaydır</span>
          </motion.div>
        </section>

        {/* BÖLÜM BAŞLIK */}
        <div style={{ padding: "80px 32px 60px", textAlign: "center", borderTop: "1px solid rgba(30,60,120,0.2)", background: "linear-gradient(to bottom, #04091a, #060d28)" }}>
          <motion.span initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            style={{ fontFamily: "monospace", fontSize: "8px", color: "rgba(60,100,180,0.6)", letterSpacing: "0.5em", textTransform: "uppercase" }}>
            Gece Mavisi Serisi
          </motion.span>
          <motion.h2 initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(1.8rem, 5vw, 3rem)", fontWeight: 400, color: "rgba(200,225,255,0.9)", marginTop: "12px", letterSpacing: "0.03em" }}>
            Birlikte Yazılan Hikaye
          </motion.h2>
        </div>

        {/* KARTLAR */}
        <div style={{ padding: "0 24px 80px", display: "flex", flexDirection: "column", gap: "80px" }}>
          {memories.map((m: any, i: number) => <FilmCard key={m.id} memory={m} index={i} />)}
        </div>



        {/* FİNAL */}
        <section style={{ padding: "80px 32px", textAlign: "center", borderTop: "1px solid rgba(30,60,120,0.2)", background: "#04091a" }}>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "20px" }}>
            <motion.div variants={fadeUp} style={{ display: "flex", gap: "8px" }}>
              <Star size={8} fill="rgba(100,160,255,0.3)" stroke="none" />
              <Star size={14} fill="rgba(100,160,255,0.8)" stroke="none" style={{ filter: "drop-shadow(0 0 8px rgba(100,160,255,0.7))" }} />
              <Star size={8} fill="rgba(100,160,255,0.3)" stroke="none" />
            </motion.div>
            <motion.h2 variants={fadeUp} style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(2rem, 6vw, 3.5rem)", fontWeight: 400, color: "rgba(200,225,255,0.9)", lineHeight: 1.15, letterSpacing: "0.03em" }}>
              Sonsuza Kadar<br />Seninle
            </motion.h2>
            <motion.div
              variants={fadeUp}
              style={{
                fontFamily: "monospace",
                fontSize: "9px",
                color: "rgba(60,100,180,0.6)",
                letterSpacing: "0.45em",
                textTransform: "uppercase",
                display: "block",
                whiteSpace: "pre-line",
                lineHeight: 1.4,
                paddingBottom: "4px"
              }}
            >
              {config.coupleNames}
            </motion.div>
            <motion.span variants={fadeUp} style={{ fontFamily: "monospace", fontSize: "8px", color: "rgba(30,60,120,0.8)", letterSpacing: "0.3em" }}>
              {config.specialDate}
            </motion.span>
          </motion.div>
        </section>

        {/* FOOTER */}
        <footer style={{ padding: "32px", textAlign: "center", fontFamily: "monospace", fontSize: "8px", letterSpacing: "0.45em", textTransform: "uppercase", color: "rgba(30,60,120,0.6)" }}>
          Midnight Velvet — birlikteydik.com
        </footer>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;1,400&family=Space+Grotesk:wght@300;400;500&display=swap');
      `}</style>
    </main>
  
    </TemplateContext.Provider>
  );
}