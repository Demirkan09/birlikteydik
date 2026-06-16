"use client";

import { useState, useEffect, useRef } from "react";
import { motion, Variants, useScroll, useTransform } from "framer-motion";
import { ChevronDown, Volume2, VolumeX, Heart } from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// ❤️ MÜŞTERİ VERİLERİ (Kolayca Düzenlenebilir)
// ─────────────────────────────────────────────────────────────────────────────
const config = {
  coupleNames: "Sen & Ben",
  tagline: "Aşkın en sıcak tonunda, kalbimin her atışında saklanan en derin hislerim...",
  accentColor: "#E63946",
  specialDate: "14 Şubat 2025",
  musicUrl: "/music/romantic.mp3",
};

const memories = [
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
    image: "/moment3.jpg",
    title: "Sonsuz Bağımız",
    description: "Her saniye, her nefeste sana olan sevgimin daha da alevlendiğini, bizi ayıramayacak güçlü bir bağa dönüştüğünü biliyorum.",
    date: "25 Nisan 2025",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// ANİMASYON VARİANTLARI
// ─────────────────────────────────────────────────────────────────────────────
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 45, filter: "blur(6px)" },
  visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 1.1, ease: [0.16, 1, 0.3, 1] } },
};

const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 1.5 } },
};

const stagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.2 } },
};

// ─────────────────────────────────────────────────────────────────────────────
// CANVAS KALP PARTİKÜLLERİ
// ─────────────────────────────────────────────────────────────────────────────
type HeartParticle = { x: number; y: number; size: number; speed: number; opacity: number; drift: number; phase: number };

function FloatingRedHearts() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<HeartParticle[]>([]);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener("resize", resize);

    particlesRef.current = Array.from({ length: 22 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      size: Math.random() * 8 + 3,
      speed: Math.random() * 0.3 + 0.12,
      opacity: Math.random() * 0.18 + 0.04,
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

    const colors = ["#E63946", "#D62828", "#9B2226", "#F25C54", "#FAF0CA"];
    let t = 0;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      t += 0.005;
      particlesRef.current.forEach((p, i) => {
        p.y -= p.speed;
        p.x += Math.sin(t + p.phase) * p.drift;
        if (p.y < -20) { p.y = canvas.height + 10; p.x = Math.random() * canvas.width; }
        drawHeart(p.x, p.y, p.size, p.opacity, colors[i % colors.length]);
      });
      rafRef.current = requestAnimationFrame(animate);
    };
    animate();

    return () => { window.removeEventListener("resize", resize); cancelAnimationFrame(rafRef.current); };
  }, []);

  return <canvas ref={canvasRef} style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }} />;
}

// ─────────────────────────────────────────────────────────────────────────────
// ❤️ KIRMIZI AŞILAMIŞ KİTAP WİDGET'I (Müzik Kontrolü)
// Retro kaset yerine aşk defteri / yürek dolu kitap konsepti
// ─────────────────────────────────────────────────────────────────────────────
function LoveBookWidget({ isPlaying, toggleMusic }: { isPlaying: boolean; toggleMusic: () => void }) {
  return (
    <div
      className="flex items-center gap-4 rounded-xl p-4 cursor-pointer transition-transform hover:scale-[1.02] backdrop-blur-xl"
      style={{
        background: "linear-gradient(135deg, #110205 0%, #1C0408 60%, #160306 100%)",
        border: "1px solid rgba(230,57,70,0.25)",
        boxShadow: "0 12px 40px rgba(0,0,0,0.8), 0 0 30px rgba(230,57,70,0.05)",
      }}
      onClick={toggleMusic}
    >
      {/* Kitap Görünümü */}
      <div className="relative flex-shrink-0" style={{ width: 48, height: 56 }}>
        {/* Kitap gövdesi */}
        <div
          className="absolute inset-0 rounded-sm"
          style={{
            background: "linear-gradient(180deg, #8B0000 0%, #C0392B 40%, #8B0000 100%)",
            boxShadow: "inset -3px 0 8px rgba(0,0,0,0.6), inset 2px 0 4px rgba(255,255,255,0.05), 0 4px 12px rgba(0,0,0,0.5)",
            border: "1px solid rgba(230,57,70,0.3)",
          }}
        />
        {/* Kitap sırtı */}
        <div
          className="absolute left-0 top-0 bottom-0"
          style={{
            width: "8px",
            background: "linear-gradient(180deg, #5C0000 0%, #8B0000 50%, #5C0000 100%)",
            borderRight: "1px solid rgba(255,255,255,0.05)",
          }}
        />
        {/* Altın yatay çizgiler (kitap sayfaları temsili) */}
        {[30, 44, 58, 72].map((top, i) => (
          <div
            key={i}
            className="absolute"
            style={{
              top: `${top}%`,
              left: "18%",
              right: "12%",
              height: "1px",
              background: `rgba(255,200,200,${0.07 + i * 0.02})`,
            }}
          />
        ))}
        {/* Kalp ikonu ortada */}
        <div className="absolute inset-0 flex items-center justify-center" style={{ paddingLeft: "4px" }}>
          <motion.div
            animate={isPlaying ? { scale: [1, 1.2, 1], opacity: [0.85, 1, 0.85] } : { scale: 1, opacity: 0.65 }}
            transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
          >
            <Heart
              size={18}
              fill="#FFB3B8"
              stroke="none"
              style={{ filter: isPlaying ? "drop-shadow(0 0 8px rgba(255,100,110,0.8))" : "none" }}
            />
          </motion.div>
        </div>
      </div>

      {/* Metin */}
      <div className="flex flex-col">
        <span
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: "13px",
            fontStyle: "italic",
            color: isPlaying ? "#FFB3B8" : "rgba(255,180,185,0.75)",
            letterSpacing: "0.04em",
          }}
        >
          {isPlaying ? "Çalıyor..." : "Müzik"}
        </span>
        <span
          style={{
            fontFamily: "'Lato', sans-serif",
            fontSize: "9px",
            color: "rgba(230,57,70,0.5)",
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            marginTop: "2px",
          }}
        >
          {isPlaying ? "Tıkla & Durdur" : "Tıkla & Dinle"}
        </span>
      </div>

      {/* Ses ikonu */}
      <div className="ml-auto">
        {isPlaying ? (
          <Volume2 size={14} style={{ color: "#E63946", opacity: 0.9 }} className="animate-pulse" />
        ) : (
          <VolumeX size={14} style={{ color: "#E63946", opacity: 0.4 }} />
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// FOTOĞRAF KART KOMPONENTI
// ─────────────────────────────────────────────────────────────────────────────
function MemoryCard({ memory, index }: { memory: (typeof memories)[0]; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const imageY = useTransform(scrollYProgress, [0, 1], [30, -30]);
  const isEven = index % 2 === 0;

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      variants={stagger}
      className={`flex flex-col md:flex-row items-center gap-10 md:gap-16 ${isEven ? "" : "md:flex-row-reverse"}`}
    >
      {/* Fotoğraf */}
      <motion.div variants={fadeUp} className="relative flex-shrink-0" style={{ width: "100%", maxWidth: "330px" }}>
        {/* Glow arka planı */}
        <div
          className="absolute inset-0 rounded-lg pointer-events-none"
          style={{ background: "#E63946", filter: "blur(18px)", opacity: 0.08 }}
        />
        {/* Kart */}
        <div
          className="relative overflow-hidden rounded-lg"
          style={{
            background: "#160408",
            padding: "8px",
            border: "1px solid rgba(230,57,70,0.18)",
            boxShadow: "0 16px 48px rgba(0,0,0,0.65)",
          }}
        >
          <div className="relative aspect-[3/4] overflow-hidden rounded-sm">
            <motion.img
              src={memory.image}
              alt={memory.title}
              className="absolute inset-x-0 w-full h-[120%] object-cover"
              style={{ y: imageY, top: "-10%" }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#160408]/30 via-transparent to-transparent pointer-events-none" />
          </div>
        </div>
      </motion.div>

      {/* Metin */}
      <div className="flex flex-col max-w-sm gap-4">
        <motion.div variants={fadeIn} className="flex items-center gap-3">
          <div className="w-8 h-px" style={{ background: "rgba(230,57,70,0.35)" }} />
          <span
            style={{
              fontFamily: "'Lato', sans-serif",
              fontSize: "9px",
              color: "rgba(230,57,70,0.6)",
              letterSpacing: "0.28em",
              textTransform: "uppercase",
            }}
          >
            {memory.date}
          </span>
        </motion.div>

        <motion.h3
          variants={fadeUp}
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: "clamp(1.6rem, 3vw, 2.2rem)",
            fontWeight: 400,
            color: "#FFE8EA",
            lineHeight: 1.2,
            letterSpacing: "0.02em",
          }}
        >
          {memory.title}
        </motion.h3>

        <motion.p
          variants={fadeUp}
          style={{
            fontFamily: "'Lato', sans-serif",
            fontSize: "0.875rem",
            color: "rgba(249,236,239,0.55)",
            lineHeight: 1.8,
            fontWeight: 300,
          }}
        >
          {memory.description}
        </motion.p>
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ANA COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export default function RomanticRedTemplate() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [countdown, setCountdown] = useState(4);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress: heroScroll } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(heroScroll, [0, 1], [0, 110]);
  const heroOpacity = useTransform(heroScroll, [0, 0.75], [1, 0]);

  useEffect(() => {
    audioRef.current = new Audio(config.musicUrl);
    audioRef.current.loop = true;
    return () => { audioRef.current?.pause(); };
  }, []);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      if (audioRef.current) {
        audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
      }
    }
  }, [countdown]);

  const toggleMusic = () => {
    if (!audioRef.current) return;
    if (isPlaying) { audioRef.current.pause(); setIsPlaying(false); }
    else { audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {}); }
  };

  return (
    <main
      className="min-h-screen overflow-x-hidden selection:bg-[#E63946]/30"
      style={{ background: "#0B0204", color: "#F9ECEF", fontFamily: "'Lato', sans-serif" }}
    >
      {/* AMBIENT LIGHTS */}
      <div className="fixed inset-0 pointer-events-none z-0" style={{
        background: `
          radial-gradient(ellipse 80% 50% at 50% -10%, rgba(230,57,70,0.16) 0%, transparent 60%),
          radial-gradient(ellipse 70% 60% at 85% 75%, rgba(155,34,38,0.09) 0%, transparent 65%),
          linear-gradient(to bottom, #0B0204 0%, #160408 100%)
        `
      }} />

      {/* FLOATING HEARTS CANVAS */}
      <FloatingRedHearts />

      {/* Centered mobile-framed container for content */}
      <div className="relative w-full max-w-[480px] mx-auto min-h-screen bg-[#0B0204] shadow-[0_0_80px_rgba(0,0,0,0.85)] border-x border-white/5 z-10 flex flex-col">
        {/* LOVE BOOK WIDGET */}
        <div className="fixed lg:absolute bottom-6 left-6 z-40">
          <LoveBookWidget isPlaying={isPlaying} toggleMusic={toggleMusic} />
        </div>

      {/* ── HERO ── */}
      <section
        ref={heroRef}
        className="relative flex flex-col items-center justify-center overflow-hidden w-full h-[100svh]"
      >
        <motion.div
          style={{ y: heroY, opacity: heroOpacity }}
          className="relative z-20 flex flex-col items-center px-6 text-center"
        >
          <motion.div variants={stagger} initial="hidden" animate="visible" className="flex flex-col items-center">
            <motion.div variants={fadeIn} className="flex items-center gap-4 mb-8">
              <div className="w-8 h-px" style={{ background: "rgba(230,57,70,0.35)" }} />
              <Heart size={10} fill="#E63946" stroke="none" className="animate-pulse" style={{ opacity: 0.7 }} />
              <span
                style={{
                  fontFamily: "'Lato', sans-serif",
                  fontSize: "9px",
                  letterSpacing: "0.48em",
                  textTransform: "uppercase",
                  color: "rgba(230,57,70,0.7)",
                }}
              >
                {config.specialDate}
              </span>
              <Heart size={10} fill="#E63946" stroke="none" className="animate-pulse" style={{ opacity: 0.7 }} />
              <div className="w-8 h-px" style={{ background: "rgba(230,57,70,0.35)" }} />
            </motion.div>

            <motion.h1
              variants={fadeUp}
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "clamp(3rem, 13vw, 8.5rem)",
                fontWeight: 400,
                lineHeight: 1,
                letterSpacing: "0.04em",
                background: "linear-gradient(160deg, rgba(255,255,255,0.96) 0%, rgba(230,57,70,0.65) 55%, rgba(255,200,200,0.55) 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              {config.coupleNames}
            </motion.h1>

            <motion.div variants={fadeIn} className="flex items-center gap-3 my-6">
              <Heart size={7} fill="#E63946" stroke="none" style={{ opacity: 0.4 }} />
              <Heart size={14} fill="#E63946" stroke="none" className="animate-pulse" style={{ opacity: 0.9, filter: "drop-shadow(0 0 8px rgba(230,57,70,0.8))" }} />
              <Heart size={7} fill="#E63946" stroke="none" style={{ opacity: 0.4 }} />
            </motion.div>

            <motion.p
              variants={fadeUp}
              style={{
                fontFamily: "'Lato', sans-serif",
                fontSize: "0.75rem",
                color: "rgba(249,200,207,0.6)",
                letterSpacing: "0.15em",
                lineHeight: 1.9,
                maxWidth: "26rem",
                marginTop: "1rem",
              }}
            >
              {config.tagline}
            </motion.p>

            {/* Müzik butonu */}
            <motion.div variants={fadeUp} className="mt-10 flex flex-col items-center gap-3">
              <button
                onClick={toggleMusic}
                className="relative overflow-hidden group transition-all duration-700"
                style={{
                  fontFamily: "'Lato', sans-serif",
                  fontSize: "10px",
                  letterSpacing: "0.38em",
                  textTransform: "uppercase",
                  padding: "14px 36px",
                  border: `1px solid rgba(230,57,70,0.4)`,
                  color: isPlaying ? "rgba(255,255,255,0.6)" : "rgba(249,200,207,0.85)",
                  background: isPlaying ? "rgba(255,255,255,0.02)" : "rgba(230,57,70,0.06)",
                  borderRadius: "2px",
                }}
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                  style={{ background: "linear-gradient(90deg, transparent, rgba(230,57,70,0.08), transparent)" }} />
                <span className="relative z-10">
                  {isPlaying ? "Müziği Durdur" : "Hikayeyi Sesli Dinle"}
                </span>
              </button>
              <motion.span
                animate={{ opacity: isPlaying ? 0 : 1, y: isPlaying ? -4 : 0 }}
                transition={{ duration: 0.6 }}
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: "11px",
                  fontStyle: "italic",
                  color: "rgba(255,255,255,0.22)",
                }}
              >
                ✨ bence tıklamalısın, böylesi çok daha güzel
              </motion.span>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <div style={{ position: "absolute", bottom: "32px", left: "50%", transform: "translateX(-50%)", zIndex: 20 }}>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2, duration: 1.5 }}
            className="flex flex-col items-center gap-3"
            style={{ opacity: 0.5 }}
          >
            <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}>
              <ChevronDown size={18} style={{ color: "#E63946" }} />
            </motion.div>
            <span
              style={{
                fontFamily: "'Lato', sans-serif",
                fontSize: "8px",
                letterSpacing: "0.38em",
                textTransform: "uppercase",
                color: "#E63946",
              }}
            >
              Aşağı Kaydır
            </span>
          </motion.div>
        </div>
      </section>

      {/* ── BÖLÜM BAŞLIĞI ── */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={stagger}
        className="flex flex-col items-center py-24 px-6 text-center relative z-10"
        style={{ background: "linear-gradient(to bottom, #0B0204, #160408)", borderTop: "1px solid rgba(230,57,70,0.1)" }}
      >
        <motion.span
          variants={fadeIn}
          style={{
            fontFamily: "'Lato', sans-serif",
            fontSize: "9px",
            letterSpacing: "0.45em",
            textTransform: "uppercase",
            color: "rgba(230,57,70,0.7)",
            marginBottom: "1rem",
          }}
        >
          ROMANTİK TEMA
        </motion.span>
        <motion.h2
          variants={fadeUp}
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: "clamp(1.8rem, 4vw, 3rem)",
            fontWeight: 400,
            color: "#F9ECEF",
            letterSpacing: "0.04em",
          }}
        >
          Aşk Dolu Adımlar
        </motion.h2>
        <motion.div variants={fadeIn} className="w-8 h-px mt-5" style={{ background: "rgba(230,57,70,0.4)" }} />
      </motion.div>

      {/* ── FOTOĞRAF KARTLARI ── */}
      <div className="relative z-10 py-16 px-6 max-w-4xl mx-auto">
        <div className="flex flex-col gap-32">
          {memories.map((m, i) => (
            <MemoryCard key={m.id} memory={m} index={i} />
          ))}
        </div>
      </div>

      {/* ── FİNAL ── */}
      <section
        className="relative flex flex-col items-center justify-center overflow-hidden py-36 z-10"
        style={{ background: "#060102", borderTop: "1px solid rgba(230,57,70,0.1)" }}
      >
        <FloatingRedHearts />
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(circle at 50% 50%, rgba(230,57,70,0.07) 0%, transparent 70%)" }} />

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
              fill="#E63946"
              stroke="none"
              className="animate-pulse"
              style={{ filter: "drop-shadow(0 0 12px rgba(230,57,70,0.6))" }}
            />
          </motion.div>
          <motion.h2
            variants={fadeUp}
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "clamp(1.8rem, 4vw, 3.5rem)",
              fontWeight: 400,
              color: "#FFE8EA",
              letterSpacing: "0.04em",
              marginBottom: "1.5rem",
              lineHeight: 1.2,
            }}
          >
            Sonsuz Bir Tutkuyla
          </motion.h2>

          <motion.div variants={fadeIn} className="flex items-center gap-3 mb-10">
            <Heart size={6} fill="#E63946" stroke="none" style={{ opacity: 0.4 }} />
            <Heart size={12} fill="#E63946" stroke="none" style={{ opacity: 0.85, filter: "drop-shadow(0 0 8px rgba(230,57,70,0.8))" }} />
            <Heart size={6} fill="#E63946" stroke="none" style={{ opacity: 0.4 }} />
          </motion.div>

          <motion.span
            variants={fadeUp}
            style={{
              fontFamily: "'Lato', sans-serif",
              fontSize: "11px",
              letterSpacing: "0.42em",
              textTransform: "uppercase",
              color: "rgba(230,57,70,0.6)",
            }}
          >
            {config.coupleNames}
          </motion.span>
          <motion.span
            variants={fadeIn}
            style={{
              fontFamily: "monospace",
              fontSize: "9px",
              color: "rgba(105,41,49,0.8)",
              letterSpacing: "0.3em",
              textTransform: "uppercase",
              marginTop: "0.75rem",
            }}
          >
            {config.specialDate}
          </motion.span>
        </motion.div>
      </section>

      {/* FOOTER */}
      <footer
        className="py-12 text-center relative z-10"
        style={{
          fontFamily: "'Lato', sans-serif",
          fontSize: "9px",
          letterSpacing: "0.45em",
          textTransform: "uppercase",
          color: "rgba(105,41,49,0.7)",
        }}
      >
        ROMANTİK RED TEMA — ANILARIMIZ.COM
      </footer>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,400;1,500&family=Lato:wght@300;400;700&display=swap');
      `}</style>
    </main>
  );
}
