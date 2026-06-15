"use client";

import { useState, useEffect, useRef } from "react";
import { motion, Variants, useScroll, useTransform } from "framer-motion";
import {
  ChevronDown,
  Sparkles,
  Infinity as InfinityIcon,
  Volume2,
  VolumeX,
  Heart,
} from "lucide-react";

// ─────────────────────────────────────────────
//  💾  MÜŞTERİ VERİLERİ
// ─────────────────────────────────────────────
const config = {
  coupleNames: "Melis & Demirkan",
  tagline: "Zamanın durduğu o anlara...",
  accentColor: "#d4af37",
  specialDate: "1 Haziran 2025",
  musicUrl: "/music/sarki.mp3",
};

const memories = [
  {
    id: 1,
    image: "/bocek1.jpeg",
    title: "Böcek Gözler",
    description:
      "Kırmızı ışıklar seni öpmek içinse, her yeri kırmızıya boyarım.",
    date: "26 Ekim 2025",
    number: "01",
  },
  {
    id: 2,
    image: "/araba.jpeg",
    title: "Çok Eğlendik",
    description:
      "Çok eğlendiğimiz günlerdendi buraya eklemek istedim. Seninle hangi aktivite eğlendirmez ki..",
    date: "11 Kasım 2025",
    number: "02",
  },
  {
    id: 3,
    image: "/mokka1.jpeg",
    title: "Hep Üstesinden Geldik",
    description:
      "Bu fotoğrafa bakınca sanki birlikte sorunların üstesinden gelmeye çalışma çabamızı görüyorum.",
    date: "17 Aralık 2025",
    number: "03",
  },
  {
    id: 4,
    image: "/yilbasi.jpeg",
    title: "Yılbaşı 🎉",
    description:
      "Her yeni gün, yeni yıl bu hikayenin daha da derinleştiği yeni bir sayfa.",
    date: "31 Aralık 2025",
    number: "04",
  },
  {
    id: 5,
    image: "/dogumgunu.jpeg",
    title: "Doğum Günü 🩷",
    description:
      "Bir takım doğum günü kutlaması operasyonları. Tekrardan iyi ki varsın!",
    date: "11 Şubat 2026",
    number: "05",
  },
  {
    id: 6,
    image: "/gezmeye.jpeg",
    title: "Motor Gezisi",
    description: "Motorla ilk gezmeye çıkışımızdı, yine eğlenceli bir gün.",
    date: "24 Nisan 2026",
    number: "06",
  },
];

// ── ANİMASYON VARİANTLARI ─────────────────────
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 48, filter: "blur(8px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 1.1, ease: [0.16, 1, 0.3, 1] },
  },
};

const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 1.4 } },
};

const stagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.22 } },
};

const scaleReveal: Variants = {
  hidden: { opacity: 0, scale: 0.88 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 1.3, ease: [0.16, 1, 0.3, 1] },
  },
};

// ── PARÇACIK ARKAPLAN ─────────────────────────
function GoldParticles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: 18 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: Math.random() * 3 + 1,
            height: Math.random() * 3 + 1,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            backgroundColor: config.accentColor,
            opacity: 0,
          }}
          animate={{
            opacity: [0, 0.6, 0],
            y: [0, -(Math.random() * 120 + 60)],
            x: [0, (Math.random() - 0.5) * 40],
          }}
          transition={{
            duration: Math.random() * 6 + 5,
            repeat: Infinity,
            delay: Math.random() * 8,
            ease: "easeOut",
          }}
        />
      ))}
    </div>
  );
}

// ── MOBİL KART ────────────────────────────────
function MobileCard({ memory }: { memory: (typeof memories)[0] }) {
  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      className="relative min-h-screen flex flex-col overflow-hidden"
      style={{ backgroundColor: "#070707" }}
    >
      {/* Blur arka plan */}
      <div className="absolute inset-0 opacity-15 pointer-events-none">
        <img
          src={memory.image}
          alt=""
          className="w-full h-full object-cover"
          style={{ filter: "blur(60px) brightness(0.5)" }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, #070707 0%, transparent 30%, transparent 70%, #070707 100%)",
          }}
        />
      </div>

      {/* Numara */}
      <motion.div
        variants={fadeIn}
        className="relative z-10 flex items-center gap-3 px-6 pt-16 pb-0"
      >
        <span
          className="text-xs font-light tracking-[0.4em] uppercase"
          style={{
            fontFamily: "var(--font-lato), sans-serif",
            color: config.accentColor,
            opacity: 0.7,
          }}
        >
          {memory.number}
        </span>
        <div className="flex-1 h-px" style={{ backgroundColor: "rgba(212,175,55,0.2)" }} />
        <span
          className="text-xs tracking-widest uppercase"
          style={{
            fontFamily: "var(--font-lato), sans-serif",
            color: "rgba(255,255,255,0.35)",
          }}
        >
          {memory.date}
        </span>
      </motion.div>

      {/* Fotoğraf */}
      <motion.div
        variants={scaleReveal}
        className="relative z-10 mx-5 mt-6 overflow-hidden"
        style={{ borderRadius: "2px", aspectRatio: "3/4" }}
      >
        <div
          className="absolute inset-0 z-10 pointer-events-none"
          style={{
            border: "1px solid rgba(212,175,55,0.15)",
            borderRadius: "2px",
          }}
        />
        <div
          className="absolute bottom-0 left-0 right-0 h-1/3 z-10"
          style={{
            background: "linear-gradient(to top, #070707, transparent)",
          }}
        />
        <motion.img
          src={memory.image}
          alt={memory.title}
          className="w-full h-full object-cover"
          style={{ filter: "contrast(1.1) saturate(0.85)" }}
          whileHover={{ scale: 1.03 }}
          transition={{ duration: 1.8, ease: "easeOut" }}
        />
      </motion.div>

      {/* Metin */}
      <div className="relative z-10 px-6 pt-8 pb-20 flex flex-col gap-4">
        <motion.h2
          variants={fadeUp}
          className="text-3xl font-light tracking-wide"
          style={{
            fontFamily: "var(--font-cormorant), serif",
            color: "rgba(255,255,255,0.92)",
            lineHeight: 1.15,
          }}
        >
          {memory.title}
        </motion.h2>
        <motion.p
          variants={fadeUp}
          className="text-sm leading-relaxed font-light"
          style={{
            fontFamily: "var(--font-lato), sans-serif",
            color: "rgba(255,255,255,0.5)",
            maxWidth: "28ch",
          }}
        >
          {memory.description}
        </motion.p>
        <motion.div variants={fadeUp} className="flex items-center gap-2 mt-2">
          <Heart
            size={10}
            fill={config.accentColor}
            stroke="none"
            style={{ opacity: 0.7 }}
          />
          <Heart
            size={6}
            fill={config.accentColor}
            stroke="none"
            style={{ opacity: 0.4 }}
          />
          <Heart
            size={8}
            fill={config.accentColor}
            stroke="none"
            style={{ opacity: 0.55 }}
          />
        </motion.div>
      </div>
    </motion.div>
  );
}

// ── MASAÜSTÜ KART ─────────────────────────────
function DesktopCard({ memory, index }: { memory: (typeof memories)[0]; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [60, -60]);
  const isEven = index % 2 === 0;

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-120px" }}
      variants={stagger}
      className="relative flex items-center min-h-screen px-16 xl:px-24 gap-20 xl:gap-32"
      style={{ flexDirection: isEven ? "row" : "row-reverse" }}
    >
      {/* Glow */}
      <div
        className="absolute pointer-events-none"
        style={{
          width: "600px",
          height: "600px",
          borderRadius: "50%",
          background: `radial-gradient(circle, ${config.accentColor}0a 0%, transparent 70%)`,
          left: isEven ? "-100px" : "auto",
          right: isEven ? "auto" : "-100px",
          top: "50%",
          transform: "translateY(-50%)",
        }}
      />

      {/* Fotoğraf tarafı */}
      <motion.div
        variants={scaleReveal}
        className="relative flex-shrink-0 overflow-hidden"
        style={{
          width: "clamp(320px, 36vw, 520px)",
          aspectRatio: "3/4",
          borderRadius: "2px",
        }}
      >
        <div
          className="absolute inset-0 z-10 pointer-events-none"
          style={{ border: "1px solid rgba(212,175,55,0.18)" }}
        />
        <motion.img
          src={memory.image}
          alt={memory.title}
          className="absolute inset-0 w-full h-full object-cover"
          style={{ y, filter: "contrast(1.12) saturate(0.8)" }}
        />
        {/* Köşe süsü */}
        <div
          className="absolute top-4 left-4 z-20"
          style={{
            width: "24px",
            height: "24px",
            borderTop: `1px solid ${config.accentColor}`,
            borderLeft: `1px solid ${config.accentColor}`,
            opacity: 0.5,
          }}
        />
        <div
          className="absolute bottom-4 right-4 z-20"
          style={{
            width: "24px",
            height: "24px",
            borderBottom: `1px solid ${config.accentColor}`,
            borderRight: `1px solid ${config.accentColor}`,
            opacity: 0.5,
          }}
        />
      </motion.div>

      {/* Metin tarafı */}
      <div className="flex flex-col gap-6 max-w-md">
        <motion.div variants={fadeIn} className="flex items-center gap-4">
          <span
            style={{
              fontFamily: "var(--font-lato), sans-serif",
              fontSize: "11px",
              letterSpacing: "0.45em",
              color: config.accentColor,
              opacity: 0.8,
              textTransform: "uppercase",
            }}
          >
            {memory.number}
          </span>
          <div
            className="w-8 h-px"
            style={{ backgroundColor: `${config.accentColor}40` }}
          />
        </motion.div>

        <motion.h2
          variants={fadeUp}
          style={{
            fontFamily: "var(--font-cormorant), serif",
            fontSize: "clamp(2.5rem, 4vw, 4rem)",
            fontWeight: 300,
            lineHeight: 1.1,
            letterSpacing: "0.02em",
            color: "rgba(255,255,255,0.93)",
          }}
        >
          {memory.title}
        </motion.h2>

        <motion.div
          variants={fadeIn}
          className="w-12 h-px"
          style={{ backgroundColor: `${config.accentColor}50` }}
        />

        <motion.p
          variants={fadeUp}
          style={{
            fontFamily: "var(--font-lato), sans-serif",
            fontSize: "0.95rem",
            lineHeight: 1.85,
            color: "rgba(255,255,255,0.5)",
            fontWeight: 300,
          }}
        >
          {memory.description}
        </motion.p>

        <motion.span
          variants={fadeIn}
          style={{
            fontFamily: "var(--font-lato), sans-serif",
            fontSize: "11px",
            letterSpacing: "0.3em",
            color: "rgba(255,255,255,0.25)",
            textTransform: "uppercase",
          }}
        >
          {memory.date}
        </motion.span>
      </div>

      {/* Büyük arka plan numarası */}
      <div
        className="absolute pointer-events-none select-none"
        style={{
          fontFamily: "var(--font-cormorant), serif",
          fontSize: "clamp(10rem, 20vw, 18rem)",
          fontWeight: 700,
          color: "rgba(212,175,55,0.025)",
          lineHeight: 1,
          right: isEven ? "2vw" : "auto",
          left: isEven ? "auto" : "2vw",
          bottom: "-2rem",
        }}
      >
        {memory.number}
      </div>
    </motion.div>
  );
}

// ── ANA COMPONENT ─────────────────────────────
export default function PremiumDarkPage() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress: heroScroll } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroY = useTransform(heroScroll, [0, 1], [0, 120]);
  const heroOpacity = useTransform(heroScroll, [0, 0.7], [1, 0]);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    audioRef.current = new Audio(config.musicUrl);
    audioRef.current.loop = true;
    const p = audioRef.current.play();
    if (p) p.then(() => setIsPlaying(true)).catch(() => {});
    return () => { audioRef.current?.pause(); };
  }, []);

  const toggleMusic = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  return (
    <main
      className="bg-[#070707] min-h-screen text-white overflow-x-hidden"
      style={{ ["--accent" as string]: config.accentColor }}
    >
      {/* ── MÜZİK BUTONU ─── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5, duration: 0.8 }}
        className="fixed top-5 right-5 z-50"
      >
        <button
          onClick={toggleMusic}
          className="relative flex items-center justify-center rounded-full transition-all duration-500"
          style={{
            width: "44px",
            height: "44px",
            background: "rgba(10,10,10,0.7)",
            backdropFilter: "blur(12px)",
            border: `1px solid ${isPlaying ? "rgba(212,175,55,0.35)" : "rgba(255,255,255,0.1)"}`,
            boxShadow: isPlaying ? `0 0 24px ${config.accentColor}22` : "none",
          }}
        >
          {isPlaying ? (
            <Volume2 size={16} style={{ color: config.accentColor }} className="animate-pulse" />
          ) : (
            <VolumeX size={16} style={{ color: "rgba(255,255,255,0.5)" }} />
          )}
        </button>
      </motion.div>

      {/* ── HERO ─── */}
      <section
        ref={heroRef}
        className="relative flex flex-col items-center justify-center overflow-hidden"
        style={{ minHeight: "100svh" }}
      >
        <GoldParticles />

        {/* İnce yatay çizgiler — dekoratif grid */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.03]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg, #ffffff 0px, #ffffff 1px, transparent 1px, transparent 80px)",
          }}
        />

        <motion.div style={{ y: heroY, opacity: heroOpacity }} className="relative z-10 flex flex-col items-center px-6 text-center">
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="visible"
            className="flex flex-col items-center"
          >
            {/* İkon */}
            <motion.div variants={fadeUp} className="mb-7">
              <Sparkles
                size={22}
                strokeWidth={1.2}
                style={{ color: config.accentColor, opacity: 0.85 }}
              />
            </motion.div>

            {/* Tarih */}
            <motion.p
              variants={fadeUp}
              className="tracking-[0.55em] uppercase mb-7"
              style={{
                fontFamily: "var(--font-lato), sans-serif",
                fontSize: "10px",
                color: "rgba(255,255,255,0.4)",
              }}
            >
              {config.specialDate}
            </motion.p>

            {/* İsimler */}
            <motion.h1
              variants={fadeUp}
              className="leading-none tracking-wider"
              style={{
                fontFamily: "var(--font-cormorant), serif",
                fontSize: "clamp(3.2rem, 14vw, 9rem)",
                fontWeight: 300,
                background:
                  "linear-gradient(160deg, rgba(255,255,255,0.96) 0%, rgba(212,175,55,0.55) 60%, rgba(255,255,255,0.4) 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              {config.coupleNames}
            </motion.h1>

            {/* İnce ayırıcı */}
            <motion.div
              variants={fadeIn}
              className="flex items-center gap-4 my-8"
            >
              <div className="w-16 h-px" style={{ background: `linear-gradient(to right, transparent, ${config.accentColor}60)` }} />
              <Heart size={10} fill={config.accentColor} stroke="none" style={{ opacity: 0.7 }} />
              <div className="w-16 h-px" style={{ background: `linear-gradient(to left, transparent, ${config.accentColor}60)` }} />
            </motion.div>

            {/* Tagline */}
            <motion.p
              variants={fadeUp}
              style={{
                fontFamily: "var(--font-lato), sans-serif",
                fontSize: "clamp(0.78rem, 2.2vw, 0.95rem)",
                color: "rgba(255,255,255,0.42)",
                letterSpacing: "0.12em",
                fontWeight: 300,
                maxWidth: "30ch",
                lineHeight: 1.8,
              }}
            >
              {config.tagline}
            </motion.p>

            {/* Müzik butonu */}
            <motion.div variants={fadeUp} className="mt-10 flex flex-col items-center gap-3">
              <button
                onClick={toggleMusic}
                className="relative px-8 py-3 tracking-widest uppercase transition-all duration-700 overflow-hidden group"
                style={{
                  fontFamily: "var(--font-lato), sans-serif",
                  fontSize: "10px",
                  letterSpacing: "0.4em",
                  borderRadius: "1px",
                  border: `1px solid ${config.accentColor}55`,
                  color: isPlaying ? "rgba(255,255,255,0.7)" : config.accentColor,
                  background: isPlaying
                    ? "rgba(255,255,255,0.03)"
                    : `rgba(212,175,55,0.06)`,
                }}
              >
                <span className="relative z-10">
                  {isPlaying ? "Müziği Durdur" : "Hikayeyi Sesli Dinle"}
                </span>
              </button>
              <motion.span
                animate={{ opacity: isPlaying ? 0 : 1, y: isPlaying ? -4 : 0 }}
                transition={{ duration: 0.6 }}
                style={{
                  fontFamily: "var(--font-lato), sans-serif",
                  fontSize: "11px",
                  fontStyle: "italic",
                  color: "rgba(255,255,255,0.25)",
                }}
              >
                ✨ bence tıklamalısın, böylesi çok daha güzel
              </motion.span>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Scroll oku (Hizalama ve üst üste binme düzeltildi) */}
        <div 
          style={{
            position: "absolute",
            bottom: "32px",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 20
          }}
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2.2, duration: 1.5 }}
            className="flex flex-col items-center gap-3"
          >
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
            >
              <ChevronDown
                size={18}
                strokeWidth={1}
                style={{ color: "rgba(255,255,255,0.25)" }}
              />
            </motion.div>
            <span
              className="tracking-[0.4em] uppercase"
              style={{
                fontFamily: "var(--font-lato), sans-serif",
                fontSize: "9px",
                color: "rgba(255,255,255,0.2)",
              }}
            >
              Kaydır
            </span>
          </motion.div>
        </div>
      </section>

      {/* ── BÖLÜM BAŞLIĞI ─── */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        variants={stagger}
        className="flex flex-col items-center py-20 px-6 text-center"
        style={{ background: "linear-gradient(to bottom, #070707, #0a0a0a)" }}
      >
        <motion.div variants={fadeIn} className="flex items-center gap-5 mb-6">
          <div className="w-10 h-px" style={{ background: `${config.accentColor}40` }} />
          <span
            className="tracking-[0.5em] uppercase"
            style={{
              fontFamily: "var(--font-lato), sans-serif",
              fontSize: "10px",
              color: `${config.accentColor}90`,
            }}
          >
            Anılarımız
          </span>
          <div className="w-10 h-px" style={{ background: `${config.accentColor}40` }} />
        </motion.div>
        <motion.h2
          variants={fadeUp}
          style={{
            fontFamily: "var(--font-cormorant), serif",
            fontSize: "clamp(2rem, 6vw, 3.5rem)",
            fontWeight: 300,
            color: "rgba(255,255,255,0.88)",
            letterSpacing: "0.04em",
          }}
        >
          Birlikte Yazılan Sayfalar
        </motion.h2>
      </motion.div>

      {/* ── KARTLAR ─── */}
      <div
        className="relative"
        style={{ background: "#080808" }}
      >
        {isMobile
          ? memories.map((m) => <MobileCard key={m.id} memory={m} />)
          : memories.map((m, i) => <DesktopCard key={m.id} memory={m} index={i} />)}
      </div>

      {/* ── FİNAL ─── */}
      <section
        className="relative flex flex-col items-center justify-center overflow-hidden"
        style={{ minHeight: "90vh", background: "#050505" }}
      >
        <GoldParticles />

        {/* Ambient ışık */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse 70% 50% at 50% 60%, ${config.accentColor}08, transparent)`,
          }}
        />

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={stagger}
          className="relative z-10 flex flex-col items-center px-6 text-center"
        >
          <motion.div variants={fadeUp} className="mb-8">
            <InfinityIcon
              size={40}
              strokeWidth={0.6}
              style={{ color: config.accentColor, opacity: 0.8 }}
            />
          </motion.div>

          <motion.h2
            variants={fadeUp}
            className="tracking-[0.25em] uppercase mb-6"
            style={{
              fontFamily: "var(--font-cormorant), serif",
              fontSize: "clamp(2.4rem, 8vw, 5rem)",
              fontWeight: 300,
              color: "rgba(255,255,255,0.9)",
            }}
          >
            Sonsuza Dek.
          </motion.h2>

          <motion.div
            variants={fadeIn}
            className="flex items-center gap-3 mb-8"
          >
            <Heart size={8} fill={config.accentColor} stroke="none" style={{ opacity: 0.4 }} />
            <Heart size={12} fill={config.accentColor} stroke="none" style={{ opacity: 0.7 }} />
            <Heart size={8} fill={config.accentColor} stroke="none" style={{ opacity: 0.4 }} />
          </motion.div>

          <motion.p
            variants={fadeUp}
            className="tracking-[0.35em] uppercase"
            style={{
              fontFamily: "var(--font-lato), sans-serif",
              fontSize: "10px",
              color: "rgba(255,255,255,0.3)",
            }}
          >
            Hikaye devam ediyor...
          </motion.p>

          {/* Alt imza */}
          <motion.div
            variants={fadeIn}
            className="mt-16 flex items-center gap-3"
          >
            <div className="w-8 h-px" style={{ background: "rgba(255,255,255,0.1)" }} />
            <span
              style={{
                fontFamily: "var(--font-cormorant), serif",
                fontSize: "1.1rem",
                color: "rgba(255,255,255,0.2)",
                fontStyle: "italic",
                letterSpacing: "0.1em",
              }}
            >
              {config.coupleNames}
            </span>
            <div className="w-8 h-px" style={{ background: "rgba(255,255,255,0.1)" }} />
          </motion.div>

          <motion.p
            variants={fadeIn}
            style={{
              marginTop: "8px",
              fontFamily: "var(--font-lato), sans-serif",
              fontSize: "10px",
              letterSpacing: "0.35em",
              color: "rgba(255,255,255,0.15)",
              textTransform: "uppercase",
            }}
          >
            {config.specialDate}
          </motion.p>
        </motion.div>
      </section>
    </main>
  );
}