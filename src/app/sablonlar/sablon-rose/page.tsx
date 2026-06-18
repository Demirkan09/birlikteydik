"use client";

import { useState, useEffect, useRef } from "react";
import { motion, Variants, useScroll, useTransform } from "framer-motion";
import { Music, VolumeX, VolumeOff } from "lucide-react";

// ─── MÜŞTERİ VERİLERİ ───────────────────────────────────────────────────────
const config = {
  coupleNames: "Sen & Ben",
  tagline: "Eski bir fotoğraf gibi sararmış zamanlarda bile, seninle geçen her anı hâlâ canlı hissediyorum.",
  specialDate: "14 Şubat 2025",
  musicUrl: "/music/romantic.mp3",
};

const memories = [
  { id: 1, image: "/moment.jpg", title: "İlk Gün", caption: "ne güzel bir başlangıçtı...", date: "Şub '25", rotate: -2.5 },
  { id: 2, image: "/moment2.jpg", title: "El Ele", caption: "ellerini hiç bırakmak istemiyorum", date: "Mar '25", rotate: 1.8 },
  { id: 3, image: "/moment7.jpg", title: "Sonsuzluk", caption: "sanki zaman durdu o anda", date: "Nis '25", rotate: -1.2 },
  { id: 4, image: "/moment3.jpg", title: "Gece Yarısı", caption: "yıldızlar bile bize baktı", date: "Oca '25", rotate: 2.3 },
  { id: 5, image: "/moment4.jpg", title: "Deniz Kıyısı", caption: "sonsuzluğu senle hissettim", date: "Nis '25", rotate: -1.8 },
  { id: 6, image: "/moment5.jpg", title: "Başarı", caption: "hep birlikte, hep ileri", date: "Haz '25", rotate: 1.5 },
  { id: 7, image: "/moment6.jpg", title: "Ebediyet", caption: "evet, sonsuzluk için evet", date: "Eyl '25", rotate: -2.1 },
  { id: 8, image: "/moment8.jpg", title: "Ufuk", caption: "seninle her ufuk daha güzel", date: "May '26", rotate: 1.9 },
];

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 1, ease: [0.16, 1, 0.3, 1] } },
};
const stagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

// ─── PETAL PARTİKÜLLERİ ──────────────────────────────────────────────────────
function FallingPetals() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener("resize", resize);
    const petals = Array.from({ length: 18 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      size: Math.random() * 6 + 3,
      speedY: Math.random() * 0.4 + 0.15,
      speedX: (Math.random() - 0.5) * 0.3,
      rotation: Math.random() * 360,
      rotSpeed: (Math.random() - 0.5) * 1.2,
      opacity: Math.random() * 0.15 + 0.04,
    }));
    let raf: number;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      petals.forEach(p => {
        p.y += p.speedY;
        p.x += p.speedX;
        p.rotation += p.rotSpeed;
        if (p.y > canvas.height + 10) { p.y = -10; p.x = Math.random() * canvas.width; }
        ctx.save();
        ctx.globalAlpha = p.opacity;
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = "#C9897A";
        ctx.beginPath();
        ctx.ellipse(0, 0, p.size, p.size * 0.6, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { window.removeEventListener("resize", resize); cancelAnimationFrame(raf); };
  }, []);
  return <canvas ref={canvasRef} style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }} />;
}

// ─── MÜZİK BUTONU ────────────────────────────────────────────────────────────
function RecordWidget({ isPlaying, toggle }: { isPlaying: boolean; toggle: () => void }) {
  return (
    <div
      onClick={toggle}
      style={{
        display: "flex", alignItems: "center", gap: "10px", cursor: "pointer",
        background: "#F5EDE8",
        border: "1px solid rgba(180,130,115,0.3)",
        borderRadius: "8px",
        padding: "10px 14px",
        boxShadow: "0 4px 20px rgba(150,100,85,0.15), inset 0 1px 0 rgba(255,255,255,0.5)",
      }}
    >
      <div style={{ position: "relative", width: "32px", height: "32px" }}>
        <motion.div
          animate={isPlaying ? { rotate: 360 } : { rotate: 0 }}
          transition={isPlaying ? { duration: 2.5, repeat: Infinity, ease: "linear" } : {}}
          style={{
            width: "32px", height: "32px", borderRadius: "50%",
            background: "conic-gradient(from 0deg, #3d2218, #7a3d2b, #3d2218, #5c2e1f, #3d2218)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
          }}
        >
          <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#F5EDE8" }} />
        </motion.div>
      </div>
      <div>
        <div style={{ fontFamily: "'Dancing Script', cursive", fontSize: "14px", color: "#7a3d2b", lineHeight: 1 }}>
          {isPlaying ? "çalıyor..." : "müzik"}
        </div>
        <div style={{ fontFamily: "'Lato', sans-serif", fontSize: "8px", color: "rgba(122,61,43,0.5)", letterSpacing: "0.2em", textTransform: "uppercase" }}>
          {isPlaying ? "durdur" : "dinle"}
        </div>
      </div>
      {isPlaying ? <Music size={12} color="rgba(122,61,43,0.7)" className="animate-pulse" /> : <VolumeOff size={12} color="rgba(180,130,115,0.4)" />}
    </div>
  );
}

// ─── POLAROİD KART ────────────────────────────────────────────────────────────
function PolaroidCard({ memory, index }: { memory: typeof memories[0]; index: number }) {
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
          background: "#FEFAF7",
          padding: "10px 10px 40px 10px",
          boxShadow: "0 8px 32px rgba(120,70,55,0.2), 0 2px 8px rgba(0,0,0,0.08)",
          width: "100%",
          maxWidth: "290px",
          position: "relative",
        }}
      >
        {/* Foto */}
        <div style={{ overflow: "hidden", position: "relative" }}>
          <img src={memory.image} alt={memory.title} style={{ width: "100%", display: "block", filter: "sepia(15%) brightness(0.97) contrast(1.02)" }} />
          {/* Vintage overlay */}
          <div style={{
            position: "absolute", inset: 0,
            background: "radial-gradient(ellipse at center, transparent 50%, rgba(150,100,80,0.15) 100%)",
            pointerEvents: "none",
          }} />
        </div>
        {/* Caption alanı */}
        <div style={{ paddingTop: "12px", paddingLeft: "4px" }}>
          <div style={{ fontFamily: "'Dancing Script', cursive", fontSize: "16px", color: "#5c3325", lineHeight: 1.2 }}>
            {memory.caption}
          </div>
          <div style={{ fontFamily: "'Lato', sans-serif", fontSize: "8px", color: "rgba(150,100,80,0.5)", letterSpacing: "0.2em", marginTop: "4px", textTransform: "uppercase" }}>
            {memory.date}
          </div>
        </div>
        {/* Bant dekorasyonu */}
        <div style={{
          position: "absolute", top: "-8px", left: "50%", transform: "translateX(-50%)",
          width: "40px", height: "16px",
          background: "rgba(210,180,160,0.5)",
          borderRadius: "2px",
        }} />
      </motion.div>

      {/* Metin */}
      <motion.div variants={stagger} style={{ textAlign: "center", display: "flex", flexDirection: "column", gap: "10px", maxWidth: "280px" }}>
        <motion.h3 variants={fadeUp} style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: "clamp(1.5rem, 5vw, 2rem)",
          fontWeight: 400,
          color: "#4a2518",
          letterSpacing: "0.02em",
          lineHeight: 1.2,
        }}>
          {memory.title}
        </motion.h3>
        <motion.div variants={fadeUp} style={{ width: "32px", height: "1px", background: "rgba(180,130,100,0.35)", margin: "0 auto" }} />
      </motion.div>
    </motion.div>
  );
}

// ─── ANA ─────────────────────────────────────────────────────────────────────
export default function DustyRoseTemplate() {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 100]);

  useEffect(() => {
    audioRef.current = new Audio(config.musicUrl);
    audioRef.current.loop = true;
    return () => { audioRef.current?.pause(); };
  }, []);

  const toggle = () => {
    if (!audioRef.current) return;
    if (isPlaying) { audioRef.current.pause(); setIsPlaying(false); }
    else { audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {}); }
  };

  return (
    <main style={{ minHeight: "100vh", overflowX: "hidden", background: "#F8F0EA", color: "#4a2518", fontFamily: "'Lato', sans-serif" }}>
      {/* Vintage grain texture overlay */}
      <div style={{
        position: "fixed", inset: 0, pointerEvents: "none", zIndex: 1,
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E")`,
        opacity: 0.6,
      }} />
      <FallingPetals />

      {/* Music widget */}
      <div style={{ position: "fixed", bottom: "24px", left: "24px", zIndex: 40 }}>
        <RecordWidget isPlaying={isPlaying} toggle={toggle} />
      </div>

      <div style={{ position: "relative", width: "100%", maxWidth: "480px", margin: "0 auto", minHeight: "100vh", zIndex: 10, background: "#F8F0EA", boxShadow: "0 0 60px rgba(120,70,55,0.1)" }}>

        {/* HERO */}
        <section ref={heroRef} style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100svh", textAlign: "center", padding: "0 40px", overflow: "hidden" }}>

          {/* Dekoratif daire */}
          <div style={{
            position: "absolute", width: "320px", height: "320px",
            borderRadius: "50%",
            border: "1px solid rgba(180,130,100,0.15)",
            top: "50%", left: "50%", transform: "translate(-50%, -50%)",
            pointerEvents: "none",
          }} />
          <div style={{
            position: "absolute", width: "420px", height: "420px",
            borderRadius: "50%",
            border: "1px dashed rgba(180,130,100,0.08)",
            top: "50%", left: "50%", transform: "translate(-50%, -50%)",
            pointerEvents: "none",
          }} />

          <motion.div style={{ y: heroY, opacity: heroOpacity }} initial="hidden" animate="visible">
            <motion.div variants={stagger} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "20px" }}>

              <motion.span variants={fadeUp} style={{ fontFamily: "'Lato', sans-serif", fontSize: "9px", letterSpacing: "0.5em", textTransform: "uppercase", color: "rgba(150,100,80,0.6)" }}>
                {config.specialDate}
              </motion.span>

              <motion.h1 variants={fadeUp} style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "clamp(3.5rem, 15vw, 9rem)",
                fontWeight: 400,
                lineHeight: 0.9,
                color: "#4a2518",
                letterSpacing: "0.04em",
              }}>
                {config.coupleNames}
              </motion.h1>

              <motion.div variants={fadeUp} style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                <div style={{ width: "40px", height: "1px", background: "rgba(180,130,100,0.3)" }} />
                <div style={{ width: "4px", height: "4px", borderRadius: "50%", background: "rgba(180,130,100,0.5)" }} />
                <div style={{ width: "40px", height: "1px", background: "rgba(180,130,100,0.3)" }} />
              </motion.div>

              <motion.p variants={fadeUp} style={{
                fontFamily: "'Dancing Script', cursive",
                fontSize: "1.05rem",
                color: "rgba(120,70,50,0.65)",
                lineHeight: 1.8,
                maxWidth: "22rem",
              }}>
                {config.tagline}
              </motion.p>

              <motion.button variants={fadeUp} onClick={toggle} style={{
                marginTop: "12px",
                fontFamily: "'Lato', sans-serif",
                fontSize: "9px",
                letterSpacing: "0.4em",
                textTransform: "uppercase",
                padding: "12px 30px",
                border: "1px solid rgba(180,130,100,0.35)",
                color: "rgba(120,70,50,0.75)",
                background: "rgba(255,255,255,0.5)",
                borderRadius: "2px",
                cursor: "pointer",
                backdropFilter: "blur(8px)",
              }}>
                {isPlaying ? "Müziği Durdur" : "Hikayeyi Sesli Dinle"}
              </motion.button>
            </motion.div>
          </motion.div>

          {/* Scroll indicator */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 2, duration: 1.5 }}
            style={{ position: "absolute", bottom: "40px", left: "50%", transform: "translateX(-50%)", display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
            <motion.div animate={{ y: [0, 6, 0] }} transition={{ duration: 2.5, repeat: Infinity }}>
              <div style={{ width: "1px", height: "32px", background: "linear-gradient(to bottom, rgba(150,100,80,0.5), transparent)" }} />
            </motion.div>
            <span style={{ fontFamily: "'Lato', sans-serif", fontSize: "7px", letterSpacing: "0.4em", color: "rgba(150,100,80,0.5)", textTransform: "uppercase" }}>Kaydır</span>
          </motion.div>
        </section>

        {/* BÖLÜM */}
        <div style={{ padding: "80px 32px 60px", textAlign: "center", borderTop: "1px solid rgba(180,130,100,0.15)" }}>
          <motion.span initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            style={{ fontFamily: "'Dancing Script', cursive", fontSize: "14px", color: "rgba(150,100,80,0.6)" }}>
            birlikte yaşadığımız
          </motion.span>
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}
            style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(1.8rem, 5vw, 3rem)", fontWeight: 400, color: "#4a2518", marginTop: "8px", letterSpacing: "0.03em" }}>
            Anı Albümümüz
          </motion.h2>
        </div>

        {/* KARTLAR */}
        <div style={{ padding: "0 24px 80px", display: "flex", flexDirection: "column", gap: "80px" }}>
          {memories.map((m, i) => <PolaroidCard key={m.id} memory={m} index={i} />)}
        </div>

        {/* FİNAL */}
        <section style={{ padding: "80px 32px 60px", textAlign: "center", borderTop: "1px solid rgba(180,130,100,0.15)", background: "#F4E8E1" }}>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}>
            <motion.div variants={fadeUp} style={{ fontFamily: "'Dancing Script', cursive", fontSize: "2rem", color: "rgba(180,100,80,0.5)" }}>♡</motion.div>
            <motion.h2 variants={fadeUp} style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(1.8rem, 6vw, 3rem)", fontWeight: 400, color: "#4a2518", lineHeight: 1.2 }}>
              Her Anın<br />Tam Ortasında Sen
            </motion.h2>
            <motion.div variants={fadeUp} style={{ width: "32px", height: "1px", background: "rgba(180,130,100,0.4)" }} />
            <motion.span variants={fadeUp} style={{ fontFamily: "'Dancing Script', cursive", fontSize: "1.1rem", color: "rgba(120,70,50,0.6)" }}>
              {config.coupleNames}
            </motion.span>
            <motion.span variants={fadeUp} style={{ fontFamily: "'Lato', sans-serif", fontSize: "8px", letterSpacing: "0.35em", color: "rgba(150,100,80,0.4)", textTransform: "uppercase" }}>
              {config.specialDate}
            </motion.span>
          </motion.div>
        </section>

        <footer style={{ padding: "28px", textAlign: "center", fontFamily: "'Lato', sans-serif", fontSize: "8px", letterSpacing: "0.4em", textTransform: "uppercase", color: "rgba(150,100,80,0.4)" }}>
          Dusty Rose — birlikteydik.com
        </footer>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;1,400&family=Dancing+Script:wght@400;600&family=Lato:wght@300;400&display=swap');
      `}</style>
    </main>
  );
}