"use client";

import { useState, useEffect, useRef } from "react";
import { motion, Variants, useScroll, useTransform } from "framer-motion";
import { ChevronDown, Volume2, VolumeX, Heart, Gem } from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// 💎 MÜŞTERİ VERİLERİ (Kolayca Düzenlenebilir)
// ─────────────────────────────────────────────────────────────────────────────
const config = {
  coupleNames: "Sen & Ben",
  tagline: "Karanlık yeşillikler arasında parlayan, en kıymetli altın değerindeki birlikteydik...",
  accentColor: "#D4AF37",
  specialDate: "2024",
  musicUrl: "/music/emerald.mp3",
};

const memories = [
  {
    id: 1,
    image: "/moment.jpg",
    title: "Nadir Bir Hazine",
    description: "Tıpkı derin ormanların en kuytusunda saklanan değerli bir zümrüt gibi, hayatıma kattığın en özel değer.",
    date: "Güz 2024",
    angle: -3,
  },
  {
    id: 2,
    image: "/moment2.jpg",
    title: "Altın Işıltılı Anlar",
    description: "Güneşin batarken gökyüzünü altın sarısına boyadığı, elini ilk kez sımsıkı tuttuğum o muazzam gün.",
    date: "Kış 2024",
    angle: 2,
  },
  {
    id: 3,
    image: "/moment3.jpg",
    title: "Sonsuz Yankı",
    description: "Kelimelerin yetersiz kaldığı, sadece nefeslerimizin ve gözlerimizin konuştuğu o lüks ve derin sessizlik.",
    date: "Bahar 2025",
    angle: -2,
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// ANİMASYON VARİANTLARI
// ─────────────────────────────────────────────────────────────────────────────
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 40, filter: "blur(5px)" },
  visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 1.2, ease: [0.16, 1, 0.3, 1] } },
};

const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 1.5 } },
};

const stagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.22 } },
};

// ─────────────────────────────────────────────────────────────────────────────
// ALTIN TOZ PARTİKÜLLERİ
// ─────────────────────────────────────────────────────────────────────────────
function GoldStardust() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {Array.from({ length: 28 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: Math.random() * 3 + 1,
            height: Math.random() * 3 + 1,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            backgroundColor: "#D4AF37",
            boxShadow: "0 0 10px #D4AF37, 0 0 4px #D4AF37",
            opacity: 0,
          }}
          animate={{
            opacity: [0, 0.55, 0],
            scale: [0.8, 1.4, 0.8],
            y: [0, -(Math.random() * 90 + 40)],
          }}
          transition={{
            duration: Math.random() * 6 + 6,
            repeat: Infinity,
            delay: Math.random() * 8,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 💎 EMERALD MÜCEVHER WİDGET'I (Kaset yerine özgün tasarım)
// ─────────────────────────────────────────────────────────────────────────────
function EmeraldJewelWidget({ isPlaying, toggleMusic }: { isPlaying: boolean; toggleMusic: () => void }) {
  return (
    <div
      className="flex items-center gap-4 backdrop-blur-xl rounded-2xl p-4 shadow-[0_12px_48px_rgba(0,0,0,0.7)] transition-transform hover:scale-[1.02] cursor-pointer"
      style={{
        background: "linear-gradient(135deg, #051712 0%, #082218 60%, #0A2B1F 100%)",
        border: "1px solid rgba(212,175,55,0.25)",
      }}
      onClick={toggleMusic}
    >
      {/* Mücevher Animasyonu */}
      <div
        className="relative flex-shrink-0"
        style={{ width: 52, height: 52, display: "flex", alignItems: "center", justifyContent: "center" }}
      >
        {/* Dış Halka - Dönen Bant */}
        <motion.div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "50%",
            border: "1.5px dashed rgba(212,175,55,0.4)",
          }}
          animate={{ rotate: isPlaying ? 360 : 0 }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        />
        {/* İç Halka */}
        <motion.div
          style={{
            position: "absolute",
            inset: "8px",
            borderRadius: "50%",
            border: "1px solid rgba(212,175,55,0.25)",
            background: "radial-gradient(circle, rgba(212,175,55,0.08) 0%, transparent 70%)",
          }}
          animate={{ rotate: isPlaying ? -360 : 0 }}
          transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
        />
        {/* Ortadaki Mücevher İkonu - tam merkez */}
        <motion.div
          style={{ position: "relative", zIndex: 2, display: "flex", alignItems: "center", justifyContent: "center" }}
          animate={isPlaying ? { scale: [1, 1.15, 1], opacity: [0.8, 1, 0.8] } : { scale: 1, opacity: 0.6 }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        >
          <Gem
            size={20}
            style={{ color: "#D4AF37", filter: isPlaying ? "drop-shadow(0 0 8px rgba(212,175,55,0.8))" : "none", display: "block" }}
          />
        </motion.div>
      </div>

      {/* Metin */}
      <div className="flex flex-col">
        <span
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "12px",
            color: "#D4AF37",
            letterSpacing: "0.06em",
            fontStyle: "italic",
          }}
        >
          {isPlaying ? "Çalıyor..." : "Müzik"}
        </span>
        <span
          style={{
            fontFamily: "var(--font-geist-sans), sans-serif",
            fontSize: "9px",
            color: "rgba(212,175,55,0.45)",
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
          <Volume2 size={14} style={{ color: "#D4AF37", opacity: 0.9 }} className="animate-pulse" />
        ) : (
          <VolumeX size={14} style={{ color: "#D4AF37", opacity: 0.4 }} />
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// FOTOĞRAF KART KOMPONENTI (Polaroid efekti YOK - premium çerçeve)
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
      className={`flex flex-col lg:flex-row items-center gap-12 lg:gap-24 ${isEven ? "" : "lg:flex-row-reverse"}`}
    >
      {/* Fotoğraf - Premium altın çerçeve */}
      <motion.div variants={fadeUp} className="relative flex-shrink-0" style={{ width: "100%", maxWidth: "360px" }}>
        {/* Arka dekoratif çerçeve */}
        <div
          className="absolute pointer-events-none"
          style={{
            inset: 0,
            border: "1px solid rgba(212,175,55,0.2)",
            transform: "translate(12px, 12px)",
            borderRadius: "2px",
          }}
        />
        {/* Fotoğraf konteyneri */}
        <div
          className="relative overflow-hidden"
          style={{
            background: "#061C16",
            padding: "8px",
            border: "1px solid rgba(212,175,55,0.22)",
            boxShadow: "0 20px 60px rgba(0,0,0,0.7), inset 0 1px 0 rgba(212,175,55,0.1)",
            borderRadius: "2px",
          }}
        >
          <div className="relative overflow-hidden">
            <img
              src={memory.image}
              alt={memory.title}
              className="w-full h-auto block"
              style={{ filter: "contrast(1.05) saturate(0.9)" }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#061C16]/30 via-transparent to-transparent pointer-events-none" />
          </div>
          {/* Altın köşe süslemeleri */}
          {["top-0 left-0", "top-0 right-0", "bottom-0 left-0", "bottom-0 right-0"].map((pos, i) => (
            <div
              key={i}
              className={`absolute ${pos} w-4 h-4 pointer-events-none`}
              style={{
                borderTop: i < 2 ? "1px solid rgba(212,175,55,0.6)" : "none",
                borderBottom: i >= 2 ? "1px solid rgba(212,175,55,0.6)" : "none",
                borderLeft: i % 2 === 0 ? "1px solid rgba(212,175,55,0.6)" : "none",
                borderRight: i % 2 !== 0 ? "1px solid rgba(212,175,55,0.6)" : "none",
              }}
            />
          ))}
        </div>
      </motion.div>

      {/* Metin */}
      <div className="flex flex-col max-w-md gap-5 px-4">
        <motion.div variants={fadeIn} className="flex items-center gap-3">
          <div className="w-10 h-px" style={{ background: "rgba(212,175,55,0.35)" }} />
          <span
            style={{
              fontFamily: "var(--font-geist-sans), sans-serif",
              fontSize: "9px",
              color: "rgba(212,175,55,0.6)",
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
            fontFamily: "'Playfair Display', serif",
            fontSize: "clamp(1.6rem, 3vw, 2.4rem)",
            fontWeight: 400,
            color: "#FAF5E6",
            letterSpacing: "0.02em",
            lineHeight: 1.2,
          }}
        >
          {memory.title}
        </motion.h3>

        <motion.p
          variants={fadeUp}
          style={{
            fontFamily: "'Didact Gothic', sans-serif",
            fontSize: "0.875rem",
            color: "#A8BDB4",
            lineHeight: 1.8,
            fontWeight: 400,
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
export default function EmeraldTemplate() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [countdown, setCountdown] = useState(4);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress: heroScroll } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(heroScroll, [0, 1], [0, 100]);
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
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  return (
    <main
      className="min-h-screen overflow-x-hidden selection:bg-[#D4AF37]/20"
      style={{
        background: "#03120E",
        color: "#E5EAE7",
        fontFamily: "'Didact Gothic', sans-serif",
      }}
    >
      {/* AMBIENT LIGHTS */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          background: `
            radial-gradient(ellipse 80% 50% at 50% -5%, rgba(212,175,55,0.10) 0%, transparent 60%),
            radial-gradient(ellipse 60% 55% at 85% 80%, rgba(212,175,55,0.06) 0%, transparent 65%),
            radial-gradient(ellipse 40% 40% at 15% 60%, rgba(3,50,30,0.4) 0%, transparent 60%),
            linear-gradient(to bottom, #03120E 0%, #061914 100%)
          `,
        }}
      />

      {/* Centered mobile-framed container for content */}
      <div className="relative w-full max-w-[480px] mx-auto min-h-screen bg-[#03120E] shadow-[0_0_80px_rgba(0,0,0,0.85)] border-x border-white/5 z-10 flex flex-col">
        {/* FLOATING JEWEL WIDGET */}
        <div className="fixed lg:absolute bottom-6 left-6 z-40">
          <EmeraldJewelWidget isPlaying={isPlaying} toggleMusic={toggleMusic} />
        </div>

      {/* ── HERO ── */}
      <section
        ref={heroRef}
        className="relative flex flex-col items-center justify-center overflow-hidden w-full h-[100svh]"
      >
        <GoldStardust />

        {/* Dekoratif grid çizgileri */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(rgba(212,175,55,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(212,175,55,0.03) 1px, transparent 1px)`,
            backgroundSize: "80px 80px",
          }}
        />

        <motion.div
          style={{ y: heroY, opacity: heroOpacity }}
          className="relative z-20 flex flex-col items-center px-6 text-center"
        >
          <motion.div variants={stagger} initial="hidden" animate="visible" className="flex flex-col items-center">
            <motion.div variants={fadeIn} className="flex items-center gap-4 mb-8">
              <div className="w-10 h-px" style={{ background: "rgba(212,175,55,0.35)" }} />
              <Gem size={14} style={{ color: "#D4AF37", opacity: 0.8 }} />
              <span
                style={{
                  fontFamily: "'Didact Gothic', sans-serif",
                  fontSize: "9px",
                  letterSpacing: "0.5em",
                  textTransform: "uppercase",
                  color: "rgba(212,175,55,0.65)",
                }}
              >
                {config.specialDate}
              </span>
              <Gem size={14} style={{ color: "#D4AF37", opacity: 0.8 }} />
              <div className="w-10 h-px" style={{ background: "rgba(212,175,55,0.35)" }} />
            </motion.div>

            <motion.h1
              variants={fadeUp}
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "clamp(3rem, 13vw, 8.5rem)",
                fontWeight: 400,
                lineHeight: 1,
                letterSpacing: "0.04em",
                background: "linear-gradient(160deg, rgba(255,255,255,0.96) 0%, rgba(212,175,55,0.65) 55%, rgba(180,230,200,0.5) 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              {config.coupleNames}
            </motion.h1>

            <motion.div variants={fadeIn} className="flex items-center gap-4 my-6">
              <div className="w-16 h-px" style={{ background: "linear-gradient(to right, transparent, rgba(212,175,55,0.5))" }} />
              <Heart size={10} fill="#D4AF37" stroke="none" style={{ opacity: 0.8, filter: "drop-shadow(0 0 6px rgba(212,175,55,0.7))" }} />
              <div className="w-16 h-px" style={{ background: "linear-gradient(to left, transparent, rgba(212,175,55,0.5))" }} />
            </motion.div>

            <motion.p
              variants={fadeUp}
              style={{
                fontFamily: "'Didact Gothic', sans-serif",
                fontSize: "0.75rem",
                color: "rgba(168,189,180,0.8)",
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
                  fontFamily: "'Didact Gothic', sans-serif",
                  fontSize: "10px",
                  letterSpacing: "0.38em",
                  textTransform: "uppercase",
                  padding: "14px 36px",
                  border: `1px solid rgba(212,175,55,0.4)`,
                  color: isPlaying ? "rgba(255,255,255,0.6)" : "#D4AF37",
                  background: isPlaying ? "rgba(255,255,255,0.02)" : "rgba(212,175,55,0.05)",
                  borderRadius: "1px",
                }}
              >
                {/* Hover shimmer efekti */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                  style={{ background: "linear-gradient(90deg, transparent, rgba(212,175,55,0.08), transparent)" }}
                />
                <span className="relative z-10">
                  {isPlaying ? "Müziği Durdur" : "Hikayeyi Sesli Dinle"}
                </span>
              </button>
              <motion.span
                animate={{ opacity: isPlaying ? 0 : 1, y: isPlaying ? -4 : 0 }}
                transition={{ duration: 0.6 }}
                style={{
                  fontFamily: "'Playfair Display', serif",
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
              <ChevronDown size={18} style={{ color: "#D4AF37" }} />
            </motion.div>
            <span
              style={{
                fontFamily: "'Didact Gothic', sans-serif",
                fontSize: "8px",
                letterSpacing: "0.38em",
                textTransform: "uppercase",
                color: "#D4AF37",
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
        style={{ background: "linear-gradient(to bottom, #03120E, #061914)", borderTop: "1px solid rgba(212,175,55,0.1)" }}
      >
        <motion.span
          variants={fadeIn}
          style={{
            fontFamily: "'Didact Gothic', sans-serif",
            fontSize: "9px",
            letterSpacing: "0.45em",
            textTransform: "uppercase",
            color: "rgba(212,175,55,0.7)",
            marginBottom: "1rem",
          }}
        >
          ZÜMRÜT SERİSİ
        </motion.span>
        <motion.h2
          variants={fadeUp}
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "clamp(1.8rem, 4vw, 3rem)",
            fontWeight: 400,
            color: "#FAF5E6",
            letterSpacing: "0.05em",
          }}
        >
          Kıymetli Hâtıralar
        </motion.h2>
        <motion.div variants={fadeIn} className="w-8 h-px mt-5" style={{ background: "rgba(212,175,55,0.4)" }} />
      </motion.div>

      {/* ── FOTOĞRAF KARTLARI ── */}
      <div className="relative z-10 py-16 px-6 max-w-5xl mx-auto">
        <div className="flex flex-col gap-36">
          {memories.map((m, i) => (
            <MemoryCard key={m.id} memory={m} index={i} />
          ))}
        </div>
      </div>

      {/* ── FİNAL ── */}
      <section
        className="relative flex flex-col items-center justify-center overflow-hidden py-36 z-10"
        style={{ background: "#020D0A", borderTop: "1px solid rgba(212,175,55,0.12)" }}
      >
        <GoldStardust />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(circle at 50% 50%, rgba(212,175,55,0.07) 0%, transparent 70%)" }}
        />

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={stagger}
          className="relative z-10 flex flex-col items-center px-6 text-center"
        >
          <motion.div variants={fadeUp} className="mb-8">
            <Gem size={28} style={{ color: "#D4AF37", opacity: 0.8, filter: "drop-shadow(0 0 12px rgba(212,175,55,0.5))" }} />
          </motion.div>
          <motion.h2
            variants={fadeUp}
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "clamp(1.8rem, 4vw, 3.5rem)",
              fontWeight: 400,
              color: "#FAF5E6",
              letterSpacing: "0.05em",
              marginBottom: "1.5rem",
              lineHeight: 1.2,
            }}
          >
            Sonsuz Zarafetimizle
          </motion.h2>

          <motion.div variants={fadeIn} className="flex items-center gap-3 mb-10">
            <Heart size={6} fill="#D4AF37" stroke="none" style={{ opacity: 0.5 }} />
            <Heart size={12} fill="#D4AF37" stroke="none" style={{ opacity: 0.85, filter: "drop-shadow(0 0 8px rgba(212,175,55,0.8))" }} />
            <Heart size={6} fill="#D4AF37" stroke="none" style={{ opacity: 0.5 }} />
          </motion.div>

          <motion.span
            variants={fadeUp}
            style={{
              fontFamily: "'Didact Gothic', sans-serif",
              fontSize: "11px",
              letterSpacing: "0.4em",
              textTransform: "uppercase",
              color: "rgba(212,175,55,0.6)",
            }}
          >
            {config.coupleNames}
          </motion.span>
          <motion.span
            variants={fadeIn}
            style={{
              fontFamily: "monospace",
              fontSize: "9px",
              color: "rgba(85,105,96,0.7)",
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
          fontFamily: "'Didact Gothic', sans-serif",
          fontSize: "9px",
          letterSpacing: "0.45em",
          textTransform: "uppercase",
          color: "rgba(85,105,96,0.6)",
        }}
      >
        PREMIUM EMERALD TEMA — birlikteydik.com
      </footer>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=Didact+Gothic&display=swap');
      `}</style>
    </main>
  );
}
