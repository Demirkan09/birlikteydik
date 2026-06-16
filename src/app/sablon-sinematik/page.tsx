"use client";

import { useState, useEffect, useRef } from "react";
import { motion, Variants, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { ChevronDown, Volume2, VolumeX, Heart, Play } from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// 🎬 MÜŞTERİ VERİLERİ (Kolayca Düzenlenebilir)
// ─────────────────────────────────────────────────────────────────────────────
const config = {
  coupleNames: "Sen & Ben",
  tagline: "Bir sevgi belgeseli, başrollerde sadece bizim olduğumuz...",
  accentColor: "#B8A9D4",
  specialDate: "2024 - 2025",
  musicUrl: "/music/cinematic.mp3",
};

const memories = [
  {
    id: 1,
    image: "/moment.jpg",
    title: "SAHNE I: BEKLENMEDİK KARŞILAŞMA",
    description: "Kaderin kamerası kayda girdiğinde, gözlerimizin buluştuğu o ilk saniye. Hayatımızın dönüm noktası.",
    date: "Ekim 2024",
  },
  {
    id: 2,
    image: "/moment2.jpg",
    title: "SAHNE II: İLK KAHKAHALAR",
    description: "Senaryosuz, tamamen doğaçlama akan, içten gelen en saf mutluluğumuz.",
    date: "Aralık 2024",
  },
  {
    id: 3,
    image: "/moment3.jpg",
    title: "SAHNE III: YOL HİKAYESİ",
    description: "Sonsuz ufuklara doğru sürdüğümüz, arkamızda güzel melodiler bıraktığımız unutulmaz an.",
    date: "Nisan 2025",
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
// 🎥 PROJEKSİYON KAMERASI WİDGET'I
// ─────────────────────────────────────────────────────────────────────────────
function ProjectorWidget({ isPlaying, toggleMusic }: { isPlaying: boolean; toggleMusic: () => void }) {
  return (
    <div
      className="flex items-center gap-4 cursor-pointer transition-transform hover:scale-[1.02] backdrop-blur-xl"
      style={{
        background: "linear-gradient(135deg, #0A0A0F 0%, #12101A 60%, #0E0C14 100%)",
        border: "1px solid rgba(184,169,212,0.2)",
        padding: "14px 16px",
        borderRadius: "12px",
        boxShadow: "0 12px 40px rgba(0,0,0,0.8), 0 0 20px rgba(184,169,212,0.04)",
      }}
      onClick={toggleMusic}
    >
      {/* Projektör Gövdesi */}
      <div className="relative flex-shrink-0" style={{ width: 54, height: 40 }}>
        {/* Projektör kasa */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(180deg, #1C1A28 0%, #141220 100%)",
            borderRadius: "6px",
            border: "1px solid rgba(184,169,212,0.15)",
            boxShadow: "inset 0 2px 4px rgba(0,0,0,0.5)",
          }}
        />
        {/* Lens dairesi */}
        <div
          style={{
            position: "absolute",
            left: "6px",
            top: "50%",
            transform: "translateY(-50%)",
            width: "28px",
            height: "28px",
            borderRadius: "50%",
            background: "radial-gradient(circle at 35% 35%, rgba(184,169,212,0.15) 0%, #0A0808 60%, #050305 100%)",
            border: "2px solid rgba(184,169,212,0.25)",
            boxShadow: isPlaying ? "0 0 16px rgba(184,169,212,0.5), inset 0 0 8px rgba(184,169,212,0.2)" : "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/* İç lens halkası */}
          <div
            style={{
              width: "16px",
              height: "16px",
              borderRadius: "50%",
              background: isPlaying
                ? "radial-gradient(circle, rgba(184,169,212,0.6) 0%, rgba(100,80,180,0.3) 50%, transparent 70%)"
                : "radial-gradient(circle, rgba(50,40,80,0.8) 0%, transparent 70%)",
              transition: "all 0.5s ease",
            }}
          />
        </div>
        {/* Sağ taraf - dönen filmler */}
        <div style={{ position: "absolute", right: "4px", top: "4px" }}>
          <motion.div
            style={{
              width: "12px",
              height: "12px",
              borderRadius: "50%",
              border: "1.5px dashed rgba(184,169,212,0.4)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            animate={{ rotate: isPlaying ? 360 : 0 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <div style={{ width: "3px", height: "3px", borderRadius: "50%", background: "rgba(184,169,212,0.6)" }} />
          </motion.div>
        </div>
        <div style={{ position: "absolute", right: "4px", bottom: "4px" }}>
          <motion.div
            style={{
              width: "12px",
              height: "12px",
              borderRadius: "50%",
              border: "1.5px dashed rgba(184,169,212,0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            animate={{ rotate: isPlaying ? -360 : 0 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          >
            <div style={{ width: "3px", height: "3px", borderRadius: "50%", background: "rgba(184,169,212,0.5)" }} />
          </motion.div>
        </div>
        {/* Film şeridi */}
        <div
          style={{
            position: "absolute",
            right: 0,
            top: "50%",
            transform: "translateY(-50%)",
            width: "3px",
            height: "30px",
            background: "repeating-linear-gradient(to bottom, rgba(184,169,212,0.3) 0px, rgba(184,169,212,0.3) 3px, transparent 3px, transparent 6px)",
          }}
        />
      </div>

      {/* Metin */}
      <div className="flex flex-col">
        <span
          style={{
            fontFamily: "'Cinzel', serif",
            fontSize: "11px",
            color: "rgba(184,169,212,0.85)",
            letterSpacing: "0.08em",
          }}
        >
          {isPlaying ? "Oynatılıyor" : "Müzik"}
        </span>
        <span
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: "9px",
            color: "rgba(184,169,212,0.4)",
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            marginTop: "2px",
          }}
        >
          {isPlaying ? "Tıkla & Durdur" : "Tıkla & Dinle"}
        </span>
      </div>

      {/* Ses */}
      <div className="ml-auto">
        {isPlaying ? (
          <Volume2 size={13} style={{ color: "#B8A9D4", opacity: 0.9 }} className="animate-pulse" />
        ) : (
          <VolumeX size={13} style={{ color: "#B8A9D4", opacity: 0.4 }} />
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// FOTOĞRAF KART - SİNEMATİK LETTERBOX
// ─────────────────────────────────────────────────────────────────────────────
function MemoryCard({ memory, index }: { memory: (typeof memories)[0]; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const imageY = useTransform(scrollYProgress, [0, 1], [20, -20]);

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      variants={stagger}
      className="flex flex-col gap-5"
    >
      {/* Widescreen letterbox çerçeve */}
      <motion.div
        variants={fadeUp}
        className="relative overflow-hidden"
        style={{
          background: "#000",
          padding: "2px",
          border: "1px solid rgba(184,169,212,0.12)",
          boxShadow: "0 25px 60px rgba(0,0,0,0.85)",
          borderRadius: "2px",
          aspectRatio: "21/9",
        }}
      >
        {/* REC göstergesi */}
        <div
          style={{
            position: "absolute",
            top: "10px",
            left: "14px",
            zIndex: 20,
            display: "flex",
            alignItems: "center",
            gap: "5px",
            fontFamily: "'DM Mono', monospace",
            fontSize: "9px",
            color: "rgba(184,169,212,0.6)",
            letterSpacing: "0.2em",
          }}
        >
          <motion.div
            style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#E63946" }}
            animate={index === 0 ? { opacity: [1, 0, 1] } : { opacity: 1 }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
          REC
        </div>
        {/* Sahne numarası */}
        <div
          style={{
            position: "absolute",
            top: "10px",
            right: "14px",
            zIndex: 20,
            fontFamily: "'DM Mono', monospace",
            fontSize: "9px",
            color: "rgba(184,169,212,0.4)",
            letterSpacing: "0.2em",
          }}
        >
          SCENE #{String(index + 1).padStart(2, "0")}
        </div>

        {/* Fotoğraf */}
        <motion.img
          src={memory.image}
          alt={memory.title}
          className="w-full h-full object-cover"
          style={{ y: imageY, opacity: 0.88, filter: "contrast(1.05) saturate(0.85)" }}
        />

        {/* Film grain overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.08'/%3E%3C/svg%3E")`,
            pointerEvents: "none",
            opacity: 0.4,
          }}
        />

        {/* Üst ve alt letterbox bantları */}
        <div style={{ position: "absolute", inset: "0 0 auto 0", height: "12px", background: "rgba(0,0,0,0.5)", zIndex: 10 }} />
        <div style={{ position: "absolute", inset: "auto 0 0 0", height: "12px", background: "rgba(0,0,0,0.5)", zIndex: 10 }} />

        {/* Vinyete */}
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.6) 100%)", pointerEvents: "none" }} />
      </motion.div>

      {/* Film altyazı stili açıklama */}
      <motion.div
        variants={fadeIn}
        className="flex flex-col md:flex-row justify-between items-start gap-4 px-2"
      >
        <div className="flex flex-col gap-2 max-w-xl">
          <h3
            style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: "10px",
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "#B8A9D4",
            }}
          >
            {memory.title}
          </h3>
          <p
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "0.875rem",
              color: "rgba(236,233,230,0.55)",
              fontStyle: "italic",
              lineHeight: 1.7,
              fontWeight: 300,
            }}
          >
            &ldquo;{memory.description}&rdquo;
          </p>
        </div>
        <span
          style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: "10px",
            color: "rgba(120,110,140,0.7)",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            whiteSpace: "nowrap",
            alignSelf: "flex-end",
          }}
        >
          {memory.date}
        </span>
      </motion.div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ANA COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export default function CinematicTemplate() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showCurtain, setShowCurtain] = useState(true);
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

  // Perde kapandıktan sonra geri sayım başlar
  useEffect(() => {
    if (!showCurtain && countdown > 0) {
      const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
      return () => clearTimeout(timer);
    } else if (!showCurtain && countdown === 0) {
      if (audioRef.current) {
        audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
      }
    }
  }, [showCurtain, countdown]);

  const handleStartMovie = () => {
    setShowCurtain(false);
  };

  const toggleMusic = () => {
    if (!audioRef.current) return;
    if (isPlaying) { audioRef.current.pause(); setIsPlaying(false); }
    else { audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {}); }
  };

  return (
    <main
      className="min-h-screen overflow-x-hidden selection:bg-[#B8A9D4]/20"
      style={{ background: "#050505", color: "#ECE9E6" }}
    >
      {/* Film grain fixed overlay */}
      <div
        className="fixed pointer-events-none z-30 opacity-[0.045]"
        style={{
          width: "200%", height: "200%", top: "-50%", left: "-50%",
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          animation: "filmNoise 0.18s infinite steps(5)",
        }}
      />

      {/* Centered mobile-framed container for content */}
      <div className="relative w-full max-w-[480px] mx-auto min-h-screen bg-[#050505] shadow-[0_0_80px_rgba(0,0,0,0.85)] border-x border-white/5 z-10 flex flex-col">
        {/* PROJEKTÖR WİDGET */}
        <div className="fixed lg:absolute bottom-6 left-6 z-40">
          <ProjectorWidget isPlaying={isPlaying} toggleMusic={toggleMusic} />
        </div>

      {/* ── HERO ── */}
      <section
        ref={heroRef}
        className="relative flex flex-col items-center justify-center overflow-hidden w-full h-[100svh]"
      >
        {/* Arka plan fotoğraf */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("/moment.jpg")`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            filter: "blur(5px) brightness(0.35) saturate(0.7)",
            transform: "scale(1.05)",
          }}
        />
        {/* Gradient overlay */}
        <div
          className="absolute inset-0"
          style={{
            background: "radial-gradient(ellipse at center, rgba(20,15,35,0.4) 0%, rgba(5,5,5,0.85) 70%), linear-gradient(to bottom, transparent 60%, #050505 100%)",
          }}
        />

        <motion.div
          style={{ y: heroY, opacity: heroOpacity }}
          className="relative z-20 flex flex-col items-center px-6 text-center"
        >
          <motion.div variants={stagger} initial="hidden" animate="visible" className="flex flex-col items-center">
            <motion.span
              variants={fadeIn}
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: "9px",
                letterSpacing: "0.5em",
                textTransform: "uppercase",
                color: "rgba(184,169,212,0.65)",
                marginBottom: "1.5rem",
              }}
            >
              A LOVE FILM BY US
            </motion.span>

            <motion.h1
              variants={fadeUp}
              style={{
                fontFamily: "'Cinzel', serif",
                fontSize: "clamp(3rem, 13vw, 9rem)",
                fontWeight: 400,
                letterSpacing: "0.1em",
                lineHeight: 1,
                background: "linear-gradient(160deg, rgba(255,255,255,0.95) 0%, rgba(184,169,212,0.7) 55%, rgba(255,255,255,0.45) 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              {config.coupleNames}
            </motion.h1>

            <motion.div variants={fadeIn} className="flex items-center gap-4 my-6">
              <div className="w-16 h-px" style={{ background: "linear-gradient(to right, transparent, rgba(184,169,212,0.5))" }} />
              <Heart size={10} fill="#B8A9D4" stroke="none" style={{ opacity: 0.8 }} />
              <div className="w-16 h-px" style={{ background: "linear-gradient(to left, transparent, rgba(184,169,212,0.5))" }} />
            </motion.div>

            <motion.p
              variants={fadeUp}
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: "0.75rem",
                color: "rgba(184,169,212,0.55)",
                letterSpacing: "0.12em",
                lineHeight: 1.9,
                maxWidth: "26rem",
                marginTop: "0.5rem",
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
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: "10px",
                  letterSpacing: "0.38em",
                  textTransform: "uppercase",
                  padding: "14px 36px",
                  border: "1px solid rgba(184,169,212,0.35)",
                  color: isPlaying ? "rgba(255,255,255,0.55)" : "rgba(184,169,212,0.85)",
                  background: isPlaying ? "rgba(255,255,255,0.02)" : "rgba(184,169,212,0.05)",
                  borderRadius: "1px",
                }}
              >
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                  style={{ background: "linear-gradient(90deg, transparent, rgba(184,169,212,0.07), transparent)" }}
                />
                <span className="relative z-10">
                  {isPlaying ? "Müziği Durdur" : "Hikayeyi Sesli Dinle"}
                </span>
              </button>
              <motion.span
                animate={{ opacity: isPlaying ? 0 : 1, y: isPlaying ? -4 : 0 }}
                transition={{ duration: 0.6 }}
                style={{
                  fontFamily: "'Cinzel', serif",
                  fontSize: "10px",
                  fontStyle: "italic",
                  color: "rgba(255,255,255,0.2)",
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
            style={{ opacity: 0.45 }}
          >
            <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}>
              <ChevronDown size={18} style={{ color: "#B8A9D4" }} />
            </motion.div>
            <span
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: "8px",
                letterSpacing: "0.3em",
                textTransform: "uppercase",
                color: "rgba(120,110,140,0.8)",
              }}
            >
              AŞAĞI KAYDIR
            </span>
          </motion.div>
        </div>
      </section>

      {/* ── FOTOĞRAF SAHNELERİ ── */}
      <section className="relative py-24 px-6 max-w-5xl mx-auto z-10">
        <div className="flex flex-col gap-28">
          {memories.map((m, i) => (
            <MemoryCard key={m.id} memory={m} index={i} />
          ))}
        </div>
      </section>

      {/* ── FİLM JENERİĞİ (CREDITS) ── */}
      <section
        className="relative py-36 flex flex-col items-center text-center px-6 z-10"
        style={{ background: "#020202", borderTop: "1px solid rgba(184,169,212,0.08)" }}
      >
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse at 50% 50%, rgba(184,169,212,0.04) 0%, transparent 70%)" }} />

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={stagger}
          className="relative z-10 flex flex-col items-center max-w-md w-full"
        >
          <motion.h4
            variants={fadeIn}
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "10px",
              letterSpacing: "0.45em",
              color: "rgba(184,169,212,0.55)",
              textTransform: "uppercase",
              marginBottom: "2.5rem",
            }}
          >
            CAST &amp; CREW
          </motion.h4>

          <div className="flex flex-col gap-7 w-full">
            {[
              { role: "BAŞROLLERDE", value: config.coupleNames },
              { role: "SENARYO & YÖNETMEN", value: "Gerçek Aşk" },
              { role: "MÜZİK", value: "Ruhumuzun Ortak Melodisi" },
              { role: "YAYIN TARİHİ", value: config.specialDate },
            ].map(({ role, value }) => (
              <motion.div
                key={role}
                variants={fadeUp}
                className="flex flex-col gap-1"
              >
                <p
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: "9px",
                    color: "rgba(120,110,140,0.7)",
                    letterSpacing: "0.2em",
                    textTransform: "uppercase",
                  }}
                >
                  {role}
                </p>
                <p
                  style={{
                    fontFamily: "'Cinzel', serif",
                    fontSize: "0.95rem",
                    color: "#F0EDE8",
                    letterSpacing: "0.06em",
                  }}
                >
                  {value}
                </p>
              </motion.div>
            ))}
          </div>

          <motion.div variants={fadeIn} className="mt-14">
            <Heart size={14} style={{ color: "#B8A9D4", opacity: 0.7 }} className="animate-pulse" />
          </motion.div>
        </motion.div>
      </section>

      {/* FOOTER */}
      <footer
        className="py-12 text-center relative z-10"
        style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: "9px",
          letterSpacing: "0.4em",
          textTransform: "uppercase",
          color: "rgba(80,70,100,0.7)",
        }}
      >
        SİNEMATİK TEMA — ANILARIMIZ.COM
      </footer>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;700&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,300;1,400&family=DM+Mono:wght@400;500&display=swap');

        @keyframes filmNoise {
          0%, 100% { transform: translate(0, 0); }
          10% { transform: translate(-1%, -1.5%); }
          20% { transform: translate(-2%, 1%); }
          30% { transform: translate(1%, -2%); }
          40% { transform: translate(-1.5%, 2%); }
          50% { transform: translate(-2%, 1.5%); }
          60% { transform: translate(2%, 0%); }
          70% { transform: translate(0%, 2.5%); }
          80% { transform: translate(1.5%, 2%); }
          90% { transform: translate(-1%, 1.5%); }
        }
      `}</style>
    </main>
  );
}
