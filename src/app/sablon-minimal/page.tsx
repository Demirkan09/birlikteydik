"use client";

import { useState, useEffect, useRef } from "react";
import { motion, Variants, useScroll, useTransform } from "framer-motion";
import { ChevronRight, Volume2, VolumeX, Heart } from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// 🤍 MÜŞTERİ VERİLERİ (Kolayca Düzenlenebilir)
// ─────────────────────────────────────────────────────────────────────────────
const config = {
  coupleNames: "Sen & Ben",
  tagline: "Gürültüden uzak, en saf halimizle. Sadece sen ve ben.",
  accentColor: "#8C7E6C",
  specialDate: "26.10.2024",
  musicUrl: "/music/minimal.mp3",
};

const memories = [
  {
    id: 1,
    image: "/moment.jpg",
    title: "Sessiz Bir Gün",
    description: "Dünyanın tüm kalabalığını arkamızda bırakıp sadece gözlerimizle konuştuğumuz o sade an.",
    date: "Ekim 2024",
  },
  {
    id: 2,
    image: "/moment2.jpg",
    title: "Ortak Bir Ritim",
    description: "Aynı anda susup, aynı gökyüzüne bakıp, içimizden geçenleri tek bir tebessümle paylaşmamız.",
    date: "Aralık 2024",
  },
  {
    id: 3,
    image: "/moment3.jpg",
    title: "Yol Arkadaşım",
    description: "Nereye gittiğimizin önemi yoktu, yanımda yürüdüğün sürece her yol en güzel adresti.",
    date: "Şubat 2025",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// ANİMASYON VARİANTLARI
// ─────────────────────────────────────────────────────────────────────────────
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 1.0, ease: [0.16, 1, 0.3, 1] } },
};

const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 1.2 } },
};

const stagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.2 } },
};

// ─────────────────────────────────────────────────────────────────────────────
// 🌿 MİNİMAL NOTA / PLAK WİDGET'I (Müzik Kontrolü)
// Retro kaset değil — sade, kağıt nota konsepti
// ─────────────────────────────────────────────────────────────────────────────
function MinimalNoteWidget({ isPlaying, toggleMusic }: { isPlaying: boolean; toggleMusic: () => void }) {
  return (
    <div
      className="flex items-center gap-4 cursor-pointer transition-all duration-500 hover:shadow-[0_6px_24px_rgba(140,126,108,0.15)]"
      style={{
        background: "#FAF8F5",
        border: "1px solid #E9E4DF",
        padding: "14px 18px",
        borderRadius: "2px",
        boxShadow: "0 4px 16px rgba(0,0,0,0.05)",
      }}
      onClick={toggleMusic}
    >
      {/* Sade Plak / Daire Görseli */}
      <div className="relative flex-shrink-0" style={{ width: 44, height: 44 }}>
        {/* Dış disk */}
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            background: "linear-gradient(135deg, #2C2927 0%, #4A4340 50%, #2C2927 100%)",
            boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
          }}
          animate={{ rotate: isPlaying ? 360 : 0 }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
        />
        {/* İç halka */}
        <div
          className="absolute rounded-full"
          style={{
            inset: "10px",
            background: "#F5F2EE",
            boxShadow: "0 1px 4px rgba(0,0,0,0.2) inset",
          }}
        />
        {/* Merkez nokta */}
        <div
          className="absolute rounded-full"
          style={{
            inset: "18px",
            background: "#2C2927",
          }}
        />
        {/* Oyuk çizgiler (plak izi) */}
        {[6, 9, 12].map((insetVal) => (
          <div
            key={insetVal}
            className="absolute rounded-full"
            style={{
              inset: `${insetVal}px`,
              border: "0.5px solid rgba(255,255,255,0.06)",
            }}
          />
        ))}
      </div>

      {/* Metin */}
      <div className="flex flex-col">
        <span
          style={{
            fontFamily: "'EB Garamond', serif",
            fontSize: "13px",
            fontStyle: "italic",
            color: isPlaying ? "#2C2927" : "#736E6A",
            letterSpacing: "0.02em",
            lineHeight: 1.2,
          }}
        >
          {isPlaying ? "Çalıyor..." : "Müzik"}
        </span>
        <span
          style={{
            fontFamily: "'Source Sans 3', sans-serif",
            fontSize: "8px",
            color: "#A59F99",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            marginTop: "3px",
          }}
        >
          {isPlaying ? "Durdur" : "Dinle"}
        </span>
      </div>

      {/* Ses ikonu */}
      <div className="ml-auto pl-3" style={{ borderLeft: "1px solid #EAE3DC" }}>
        {isPlaying ? (
          <Volume2 size={13} style={{ color: "#8C7E6C", opacity: 0.85 }} className="animate-pulse" />
        ) : (
          <VolumeX size={13} style={{ color: "#A59F99", opacity: 0.6 }} />
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// FOTOĞRAF KART KOMPONENTI (Asimetrik, minimalist)
// ─────────────────────────────────────────────────────────────────────────────
function MemoryCard({ memory, index }: { memory: (typeof memories)[0]; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const imageY = useTransform(scrollYProgress, [0, 1], [25, -25]);
  const isEven = index % 2 === 0;

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      variants={stagger}
      className={`flex flex-col lg:flex-row items-stretch gap-12 lg:gap-24 ${isEven ? "" : "lg:flex-row-reverse"}`}
    >
      {/* Fotoğraf */}
      <motion.div
        variants={fadeUp}
        className="flex-1"
        style={{ maxWidth: "380px" }}
      >
        <div
          className="overflow-hidden"
          style={{
            background: "#FAF8F5",
            padding: "10px",
            border: "1px solid #E9E4DF",
            boxShadow: "0 5px 20px rgba(0,0,0,0.04)",
          }}
        >
          <div className="relative aspect-[3/4] overflow-hidden" style={{ background: "#F0ECE8" }}>
            <motion.img
              src={memory.image}
              alt={memory.title}
              className="absolute inset-x-0 w-full h-[120%] object-cover"
              style={{ y: imageY, top: "-10%", filter: "saturate(0.88) contrast(1.02)" }}
            />
          </div>
        </div>
      </motion.div>

      {/* Metin */}
      <motion.div
        variants={fadeUp}
        className="flex-1 flex flex-col justify-center gap-6 max-w-md"
      >
        <div className="flex items-center gap-3">
          <div className="w-5 h-px" style={{ background: "#8C7E6C", opacity: 0.4 }} />
          <span
            style={{
              fontFamily: "'Source Sans 3', sans-serif",
              fontSize: "9px",
              color: "#8C7E6C",
              letterSpacing: "0.28em",
              textTransform: "uppercase",
            }}
          >
            {memory.date}
          </span>
        </div>

        <h3
          style={{
            fontFamily: "'EB Garamond', serif",
            fontSize: "clamp(1.7rem, 3vw, 2.5rem)",
            fontWeight: 400,
            color: "#1C1A19",
            lineHeight: 1.2,
            letterSpacing: "0.01em",
          }}
        >
          {memory.title}
        </h3>

        <p
          style={{
            fontFamily: "'Source Sans 3', sans-serif",
            fontSize: "0.875rem",
            color: "#736E6A",
            lineHeight: 1.85,
            fontWeight: 300,
          }}
        >
          {memory.description}
        </p>
      </motion.div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ANA COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export default function MinimalTemplate() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [countdown, setCountdown] = useState(4);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress: heroScroll } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(heroScroll, [0, 1], [0, 80]);
  const heroOpacity = useTransform(heroScroll, [0, 0.8], [1, 0]);

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
      className="min-h-screen overflow-x-hidden selection:bg-[#E4DDD3]"
      style={{ background: "#F6F3F0", color: "#2C2927", fontFamily: "'Source Sans 3', sans-serif" }}
    >
      {/* Çok hafif doku — tek katmanlı arka plan */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          backgroundImage: `
            radial-gradient(ellipse 60% 40% at 100% 0%, rgba(140,126,108,0.06) 0%, transparent 60%),
            radial-gradient(ellipse 60% 40% at 0% 100%, rgba(140,126,108,0.04) 0%, transparent 60%)
          `,
        }}
      />

      {/* Centered mobile-framed container for content */}
      <div className="relative w-full max-w-[480px] mx-auto min-h-screen bg-[#F6F3F0] shadow-[0_0_80px_rgba(0,0,0,0.08)] border-x border-[#EAE3DC] z-10 flex flex-col">
        {/* MINIMAL NOTE WIDGET */}
        <div className="fixed lg:absolute bottom-6 left-6 z-40">
          <MinimalNoteWidget isPlaying={isPlaying} toggleMusic={toggleMusic} />
        </div>

      {/* ── HERO ── */}
      <section
        ref={heroRef}
        className="relative flex flex-col justify-center overflow-hidden w-full h-[100svh] px-8 md:px-24"
      >
        <motion.div
          style={{ y: heroY, opacity: heroOpacity }}
          className="relative z-10 max-w-3xl"
        >
          <motion.div variants={stagger} initial="hidden" animate="visible">
            {/* Tarih */}
            <motion.div variants={fadeIn} className="flex items-center gap-4 mb-10">
              <span
                style={{
                  fontFamily: "'Source Sans 3', sans-serif",
                  fontSize: "10px",
                  letterSpacing: "0.48em",
                  textTransform: "uppercase",
                  color: "#8C7E6C",
                }}
              >
                {config.specialDate}
              </span>
              <div className="w-8 h-px" style={{ background: "rgba(140,126,108,0.35)" }} />
            </motion.div>

            {/* İsim */}
            <motion.h1
              variants={fadeUp}
              style={{
                fontFamily: "'EB Garamond', serif",
                fontSize: "clamp(3.2rem, 12vw, 8rem)",
                fontWeight: 400,
                lineHeight: 0.95,
                letterSpacing: "-0.01em",
                color: "#1C1A19",
              }}
            >
              {config.coupleNames}
            </motion.h1>

            {/* Tagline */}
            <motion.p
              variants={fadeUp}
              style={{
                fontFamily: "'Source Sans 3', sans-serif",
                fontSize: "0.8rem",
                color: "#736E6A",
                letterSpacing: "0.06em",
                lineHeight: 1.85,
                maxWidth: "24rem",
                marginTop: "1.5rem",
                fontWeight: 300,
              }}
            >
              {config.tagline}
            </motion.p>

            {/* Müzik butonu */}
            <motion.div variants={fadeUp} className="mt-12 flex flex-col gap-3">
              <div className="flex items-center gap-4">
                <button
                  onClick={toggleMusic}
                  className="group flex items-center gap-3 transition-all duration-400"
                  style={{
                    fontFamily: "'Source Sans 3', sans-serif",
                    fontSize: "10px",
                    letterSpacing: "0.32em",
                    textTransform: "uppercase",
                    color: isPlaying ? "#736E6A" : "#1C1A19",
                    background: "transparent",
                    border: "none",
                    padding: 0,
                    cursor: "pointer",
                  }}
                >
                  <span style={{ borderBottom: `1px solid ${isPlaying ? "rgba(115,110,106,0.4)" : "rgba(28,26,25,0.7)"}`, paddingBottom: "2px" }}>
                    {isPlaying ? "Sesi Durdur" : "Hikayeyi Dinle"}
                  </span>
                  <ChevronRight size={12} className="opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                </button>
              </div>
              <motion.span
                animate={{ opacity: isPlaying ? 0 : 0.5, y: isPlaying ? -4 : 0 }}
                transition={{ duration: 0.6 }}
                style={{
                  fontFamily: "'EB Garamond', serif",
                  fontSize: "11px",
                  fontStyle: "italic",
                  color: "#8C7E6C",
                }}
              >
                ✨ bence tıklamalısın, böylesi çok daha güzel
              </motion.span>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Scroll indicator — minimal (sol alt, yatay) */}
        <div
          className="absolute flex items-center gap-3"
          style={{ bottom: "40px", left: "50%", transform: "translateX(-50%)", opacity: 0.55, zIndex: 10 }}
        >
          <span
            style={{
              fontFamily: "'Source Sans 3', sans-serif",
              fontSize: "8px",
              letterSpacing: "0.38em",
              textTransform: "uppercase",
              color: "#736E6A",
            }}
          >
            Aşağı Kaydır
          </span>
          <motion.div
            animate={{ x: [0, 6, 0] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
          >
            <ChevronRight size={12} style={{ color: "#8C7E6C" }} />
          </motion.div>
        </div>
      </section>

      {/* ── BÖLÜM ── */}
      <div
        className="py-8 px-8 md:px-24 relative z-10"
        style={{ borderTop: "1px solid #EAE3DC" }}
      >
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={stagger}
          className="flex flex-col gap-2 mb-16"
        >
          <motion.span
            variants={fadeIn}
            style={{
              fontFamily: "'Source Sans 3', sans-serif",
              fontSize: "9px",
              letterSpacing: "0.42em",
              textTransform: "uppercase",
              color: "#8C7E6C",
            }}
          >
            Anılar
          </motion.span>
          <motion.div variants={fadeIn} className="w-6 h-px" style={{ background: "rgba(140,126,108,0.4)" }} />
        </motion.div>
      </div>

      {/* ── FOTOĞRAF KARTLARI ── */}
      <div className="relative z-10 py-8 px-8 md:px-24 max-w-5xl mx-auto">
        <div className="flex flex-col gap-36">
          {memories.map((m, i) => (
            <MemoryCard key={m.id} memory={m} index={i} />
          ))}
        </div>
      </div>

      {/* ── FİNAL ── */}
      <section
        className="py-44 flex flex-col items-center justify-center text-center px-8 relative z-10"
        style={{ background: "#FAF8F5", borderTop: "1px solid #EAE3DC" }}
      >
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={stagger}
          className="flex flex-col items-center"
        >
          <motion.div variants={fadeIn} className="w-1 h-1 rounded-full mb-10" style={{ background: "#8C7E6C" }} />
          <motion.h2
            variants={fadeUp}
            style={{
              fontFamily: "'EB Garamond', serif",
              fontSize: "clamp(1.8rem, 4vw, 3.5rem)",
              fontWeight: 400,
              color: "#1C1A19",
              letterSpacing: "0.02em",
              lineHeight: 1.2,
              marginBottom: "2rem",
            }}
          >
            Bizim Hikayemiz,<br />En Yalın Haliyle.
          </motion.h2>
          <motion.div variants={fadeIn}>
            <Heart size={12} style={{ color: "#8C7E6C", opacity: 0.65 }} />
          </motion.div>
          <motion.div variants={fadeIn} className="mt-10 flex flex-col items-center gap-2">
            <span
              style={{
                fontFamily: "'Source Sans 3', sans-serif",
                fontSize: "10px",
                letterSpacing: "0.42em",
                textTransform: "uppercase",
                color: "#736E6A",
              }}
            >
              {config.coupleNames}
            </span>
            <span
              style={{
                fontFamily: "'Source Sans 3', sans-serif",
                fontSize: "9px",
                color: "rgba(140,126,108,0.55)",
                letterSpacing: "0.3em",
                textTransform: "uppercase",
              }}
            >
              {config.specialDate}
            </span>
          </motion.div>
        </motion.div>
      </section>

      {/* FOOTER */}
      <footer
        className="py-10 text-center relative z-10"
        style={{
          fontFamily: "'Source Sans 3', sans-serif",
          fontSize: "9px",
          letterSpacing: "0.4em",
          textTransform: "uppercase",
          color: "#A59F99",
          borderTop: "1px solid #EAE3DC",
        }}
      >
        MİNİMALİST TEMA — ANILARIMIZ.COM
      </footer>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,500;1,400;1,500&family=Source+Sans+3:wght@300;400;600&display=swap');
      `}</style>
    </main>
  );
}
