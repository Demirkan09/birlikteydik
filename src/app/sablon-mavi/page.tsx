"use client";

import { useState, useEffect, useRef } from "react";
import { motion, Variants, useScroll, useTransform } from "framer-motion";
import { ChevronDown, Volume2, VolumeX, Heart, ArrowRight } from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// 🌊 MÜŞTERİ VERİLERİ (Kolayca Düzenlenebilir)
// ─────────────────────────────────────────────────────────────────────────────
const config = {
  coupleNames: "Sen & Ben",
  tagline: "İki hayatın kesiştiği noktada başlayan, sonsuzluğa uzanan bu hikaye...",
  accentColor: "#3EA094",
  specialDate: "2024",
  musicUrl: "/music/mavi.mp3",
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
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 1.1, ease: [0.16, 1, 0.3, 1] } },
};

const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 1.3 } },
};

const stagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.2 } },
};

// ─────────────────────────────────────────────────────────────────────────────
// 🧭 PUSULA WİDGET'I (Müzik Kontrolü)
// ─────────────────────────────────────────────────────────────────────────────
function CompassWidget({ isPlaying, toggleMusic }: { isPlaying: boolean; toggleMusic: () => void }) {
  return (
    <div
      className="flex items-center gap-4 cursor-pointer transition-transform hover:scale-[1.02] backdrop-blur-xl"
      style={{
        background: "linear-gradient(135deg, #071122 0%, #0A1628 60%, #0C1E35 100%)",
        border: `1px solid ${isPlaying ? "rgba(62,160,148,0.45)" : "rgba(62,160,148,0.2)"}`,
        padding: "14px 18px",
        borderRadius: "4px",
        boxShadow: isPlaying
          ? "0 12px 40px rgba(0,0,0,0.7), 0 0 20px rgba(62,160,148,0.12)"
          : "0 12px 40px rgba(0,0,0,0.7)",
      }}
      onClick={toggleMusic}
    >
      {/* Pusula */}
      <div style={{ position: "relative", width: 50, height: 50, flexShrink: 0 }}>
        {/* Dış halka */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "50%",
            border: "1.5px solid rgba(62,160,148,0.35)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/* N/S/E/W etiketleri */}
          {[
            { label: "N", top: "2px", left: "50%", transform: "translateX(-50%)" },
            { label: "S", bottom: "2px", left: "50%", transform: "translateX(-50%)" },
            { label: "E", right: "2px", top: "50%", transform: "translateY(-50%)" },
            { label: "W", left: "2px", top: "50%", transform: "translateY(-50%)" },
          ].map(({ label, ...style }) => (
            <span
              key={label}
              style={{
                position: "absolute",
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: "6px",
                fontWeight: 600,
                color: label === "N" ? "#3EA094" : "rgba(232,244,242,0.3)",
                letterSpacing: "0.05em",
                ...style,
              }}
            >
              {label}
            </span>
          ))}
        </div>

        {/* Pusula iğnesi */}
        <motion.div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          animate={{ rotate: isPlaying ? 360 : 0 }}
          transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
        >
          {/* Kuzey (teal) */}
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              width: "2px",
              height: "14px",
              background: "linear-gradient(to top, #3EA094, rgba(62,160,148,0.2))",
              transformOrigin: "bottom center",
              transform: "translateX(-50%) translateY(-100%)",
              borderRadius: "1px 1px 0 0",
            }}
          />
          {/* Güney (beyaz) */}
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              width: "2px",
              height: "10px",
              background: "linear-gradient(to bottom, rgba(232,244,242,0.4), transparent)",
              transformOrigin: "top center",
              transform: "translateX(-50%)",
              borderRadius: "0 0 1px 1px",
            }}
          />
          {/* Merkez */}
          <div
            style={{
              position: "absolute",
              width: "6px",
              height: "6px",
              borderRadius: "50%",
              background: "#3EA094",
              boxShadow: isPlaying ? "0 0 8px rgba(62,160,148,0.8)" : "none",
            }}
          />
        </motion.div>
      </div>

      {/* Metin */}
      <div style={{ display: "flex", flexDirection: "column" }}>
        <span
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: "12px",
            fontWeight: 500,
            color: isPlaying ? "#3EA094" : "rgba(232,244,242,0.7)",
            letterSpacing: "0.04em",
          }}
        >
          {isPlaying ? "Çalıyor..." : "Müzik"}
        </span>
        <span
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: "9px",
            fontWeight: 400,
            color: "rgba(62,160,148,0.5)",
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            marginTop: "2px",
          }}
        >
          {isPlaying ? "Tıkla & Durdur" : "Tıkla & Dinle"}
        </span>
      </div>

      {/* Ses */}
      <div style={{ marginLeft: "auto" }}>
        {isPlaying ? (
          <Volume2 size={13} style={{ color: "#3EA094", opacity: 0.9 }} className="animate-pulse" />
        ) : (
          <VolumeX size={13} style={{ color: "#3EA094", opacity: 0.4 }} />
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MARQUEE COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
function Marquee() {
  const text = "SEN & BEN ★ birlikteydik ★ SEN & BEN ★ birlikteydik ★ SEN & BEN ★ birlikteydik ★ ";
  return (
    <div
      style={{
        overflow: "hidden",
        background: "#3EA094",
        padding: "14px 0",
        whiteSpace: "nowrap",
        borderTop: "1px solid rgba(62,160,148,0.3)",
        borderBottom: "1px solid rgba(62,160,148,0.3)",
      }}
    >
      <motion.div
        style={{ display: "inline-block" }}
        animate={{ x: [0, "-50%"] }}
        transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
      >
        {[text, text].map((t, i) => (
          <span
            key={i}
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: "11px",
              fontWeight: 600,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "#0A1628",
              paddingRight: "0",
            }}
          >
            {t}
          </span>
        ))}
      </motion.div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MEMORY CARD - EDITORIAL MAGAZINE LAYOUT
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
      style={{ position: "relative" }}
    >
      {/* Fon büyük numara */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          fontFamily: "'Space Grotesk', sans-serif",
          fontSize: "clamp(6rem, 15vw, 12rem)",
          fontWeight: 700,
          color: "rgba(62,160,148,0.04)",
          lineHeight: 1,
          pointerEvents: "none",
          whiteSpace: "nowrap",
          zIndex: 0,
        }}
      >
        {String(index + 1).padStart(2, "0")}
      </div>

      {/* Fotoğraf */}
      <motion.div
        variants={fadeIn}
        className="relative flex-shrink-0 w-full max-w-[330px]"
        style={{ position: "relative", overflow: "hidden", zIndex: 1 }}
      >
        <img
          src={memory.image}
          alt={memory.title}
          style={{
            width: "100%",
            height: "auto",
            display: "block",
            filter: "saturate(0.9) contrast(1.05)",
          }}
        />
        {/* Teal overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(135deg, rgba(62,160,148,0.12) 0%, transparent 60%)",
            pointerEvents: "none",
          }}
        />
      </motion.div>

      {/* Metin */}
      <motion.div
        variants={stagger}
        className="flex flex-col max-w-sm gap-4"
        style={{
          direction: "ltr",
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Teal horizontal line */}
        <motion.div
          variants={fadeIn}
          style={{
            width: "40px",
            height: "2px",
            background: "#3EA094",
            marginBottom: "12px",
          }}
        />
        <motion.h3
          variants={fadeUp}
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: "clamp(1.6rem, 3vw, 2.2rem)",
            fontWeight: 600,
            color: "#E8F4F2",
            lineHeight: 1.2,
          }}
        >
          {memory.title}
        </motion.h3>

        <motion.p
          variants={fadeUp}
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: "0.875rem",
            fontWeight: 300,
            color: "rgba(232,244,242,0.55)",
            lineHeight: 1.8,
          }}
        >
          {memory.description}
        </motion.p>

        <motion.div variants={fadeIn} style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "8px" }}>
          <div style={{ width: "24px", height: "1px", background: "rgba(62,160,148,0.4)" }} />
          <span
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: "10px",
              fontWeight: 500,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "rgba(62,160,148,0.55)",
            }}
          >
            {memory.date}
          </span>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ANA COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export default function MaviTemplate() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [countdown, setCountdown] = useState(4);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress: heroScroll } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(heroScroll, [0, 1], [0, 120]);
  const heroOpacity = useTransform(heroScroll, [0, 0.8], [1, 0]);
  const photoY = useTransform(heroScroll, [0, 1], [0, 60]);

  useEffect(() => {
    audioRef.current = new Audio(config.musicUrl);
    audioRef.current.loop = true;
    return () => { audioRef.current?.pause(); };
  }, []);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
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
      className="min-h-screen overflow-x-hidden selection:bg-[#3EA094]/20"
      style={{ background: "#0A1628", color: "#E8F4F2", fontFamily: "'Space Grotesk', sans-serif" }}
    >
      {/* AMBIENT */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          background: `
            radial-gradient(ellipse 70% 50% at 70% 20%, rgba(62,160,148,0.08) 0%, transparent 60%),
            radial-gradient(ellipse 60% 40% at 10% 80%, rgba(62,160,148,0.05) 0%, transparent 60%),
            linear-gradient(to bottom, #0A1628 0%, #071020 100%)
          `,
        }}
      />

      {/* Centered mobile-framed container for content */}
      <div className="relative w-full max-w-[480px] mx-auto min-h-screen bg-[#0A1628] shadow-[0_0_80px_rgba(0,0,0,0.85)] border-x border-white/5 z-10 flex flex-col">
        {/* PUSULA WİDGET */}
        <div className="fixed lg:absolute bottom-6 left-6 z-40">
          <CompassWidget isPlaying={isPlaying} toggleMusic={toggleMusic} />
        </div>

      {/* ── HERO (SPLIT LAYOUT) ── */}
      <section
        ref={heroRef}
        className="relative w-full h-[100svh] overflow-hidden"
      >
        <div className="w-full h-full flex flex-col lg:flex-row">
          {/* SOL - Metin */}
          <motion.div
            style={{ y: heroY, opacity: heroOpacity }}
            className="flex-1 relative z-20 flex flex-col justify-center px-8 md:px-16 lg:px-20 py-16"
          >
            <motion.div variants={stagger} initial="hidden" animate="visible" className="max-w-xl">
              {/* Yıl - dekoratif büyük numara */}
              <div
                style={{
                  position: "absolute",
                  top: "-20px",
                  left: "50px",
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: "clamp(8rem, 18vw, 18rem)",
                  fontWeight: 700,
                  color: "rgba(62,160,148,0.04)",
                  lineHeight: 1,
                  pointerEvents: "none",
                  userSelect: "none",
                }}
              >
                {config.specialDate}
              </div>

              <motion.div variants={fadeIn} style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
                <div style={{ width: "32px", height: "2px", background: "#3EA094" }} />
                <span
                  style={{
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontSize: "10px",
                    fontWeight: 500,
                    letterSpacing: "0.4em",
                    textTransform: "uppercase",
                    color: "#3EA094",
                  }}
                >
                  {config.specialDate}
                </span>
              </motion.div>

              <motion.h1
                variants={fadeUp}
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: "clamp(3rem, 8vw, 7rem)",
                  fontWeight: 700,
                  lineHeight: 0.95,
                  letterSpacing: "-0.02em",
                  color: "#E8F4F2",
                  marginBottom: "24px",
                  position: "relative",
                  zIndex: 1,
                }}
              >
                {config.coupleNames}
              </motion.h1>

              <motion.p
                variants={fadeUp}
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: "0.9rem",
                  fontWeight: 300,
                  color: "rgba(232,244,242,0.5)",
                  letterSpacing: "0.04em",
                  lineHeight: 1.85,
                  maxWidth: "28rem",
                  marginBottom: "36px",
                }}
              >
                {config.tagline}
              </motion.p>

              {/* Müzik butonu */}
              <motion.div variants={fadeUp} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <button
                  onClick={toggleMusic}
                  className="group"
                  style={{
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontSize: "11px",
                    fontWeight: 500,
                    letterSpacing: "0.2em",
                    textTransform: "uppercase",
                    padding: "14px 32px",
                    background: "transparent",
                    border: "1px solid rgba(62,160,148,0.45)",
                    color: isPlaying ? "rgba(232,244,242,0.5)" : "#3EA094",
                    cursor: "pointer",
                    borderRadius: "2px",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    width: "fit-content",
                    transition: "all 0.4s ease",
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  <span style={{ position: "relative", zIndex: 1 }}>
                    {isPlaying ? "Müziği Durdur" : "Hikayeyi Sesli Dinle"}
                  </span>
                  <ArrowRight size={14} style={{ position: "relative", zIndex: 1, opacity: 0.7 }} />
                </button>
                <motion.span
                  animate={{ opacity: isPlaying ? 0 : 1 }}
                  transition={{ duration: 0.5 }}
                  style={{
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontSize: "11px",
                    fontStyle: "italic",
                    color: "rgba(232,244,242,0.2)",
                  }}
                >
                  ✨ bence tıklamalısın, böylesi çok daha güzel
                </motion.span>
              </motion.div>
            </motion.div>
          </motion.div>

          {/* SAĞ - Fotoğraf */}
          <motion.div
            style={{ y: photoY }}
            className="hidden lg:block flex-1 relative overflow-hidden"
          >
            {/* Eğik fotoğraf */}
            <motion.div
              initial={{ opacity: 0, x: 60 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5, duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
              style={{
                position: "absolute",
                inset: "10% 5% 10% 5%",
                overflow: "hidden",
                transform: "rotate(2deg)",
                border: "1px solid rgba(62,160,148,0.2)",
                boxShadow: "0 30px 80px rgba(0,0,0,0.6), 0 0 40px rgba(62,160,148,0.06)",
              }}
            >
              <img
                src="/moment.jpg"
                alt="Hero"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  filter: "saturate(0.85) contrast(1.05)",
                }}
              />
              {/* Teal overlay */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "linear-gradient(225deg, rgba(62,160,148,0.15) 0%, transparent 50%)",
                  pointerEvents: "none",
                }}
              />
            </motion.div>

            {/* Geometric accent */}
            <div
              style={{
                position: "absolute",
                bottom: "12%",
                right: "4%",
                width: "80px",
                height: "80px",
                border: "2px solid rgba(62,160,148,0.25)",
                transform: "rotate(15deg)",
                pointerEvents: "none",
              }}
            />
            <div
              style={{
                position: "absolute",
                top: "8%",
                right: "8%",
                width: "40px",
                height: "40px",
                border: "1px solid rgba(62,160,148,0.2)",
                transform: "rotate(-10deg)",
                pointerEvents: "none",
              }}
            />
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <div style={{ position: "absolute", bottom: "32px", left: "50%", transform: "translateX(-50%)", zIndex: 20 }}>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2, duration: 1.5 }}
            style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", opacity: 0.5 }}
          >
            {/* Dikey çizgi */}
            <div style={{ width: "1px", height: "32px", background: "linear-gradient(to bottom, transparent, #3EA094)" }} />
            <motion.div
              animate={{ y: [0, 6, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#3EA094" }}
            />
            <span
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: "8px",
                fontWeight: 500,
                letterSpacing: "0.3em",
                textTransform: "uppercase",
                color: "rgba(62,160,148,0.7)",
                marginTop: "4px",
              }}
            >
              Kaydır
            </span>
          </motion.div>
        </div>
      </section>

      {/* MARQUEE */}
      <Marquee />

      {/* ── ANLAR ── */}
      <div className="relative z-10 py-16 px-6 max-w-4xl mx-auto">
        <div className="flex flex-col gap-32">
          {memories.map((m, i) => (
            <MemoryCard key={m.id} memory={m} index={i} />
          ))}
        </div>
      </div>

      {/* ── FİNAL ── */}
      <section
        className="relative py-36 flex flex-col items-center justify-center text-center px-8 overflow-hidden z-10"
        style={{ background: "#071020", borderTop: "1px solid rgba(62,160,148,0.15)" }}
      >
        {/* Teal geometric shape */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "320px",
            height: "320px",
            border: "1px solid rgba(62,160,148,0.08)",
            borderRadius: "50%",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "200px",
            height: "200px",
            border: "1px solid rgba(62,160,148,0.06)",
            borderRadius: "50%",
            pointerEvents: "none",
          }}
        />

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={stagger}
          className="relative z-10 flex flex-col items-center max-w-lg"
        >
          <motion.div variants={fadeIn} style={{ marginBottom: "24px" }}>
            <Heart size={22} style={{ color: "#3EA094", opacity: 0.8 }} />
          </motion.div>

          <motion.h2
            variants={fadeUp}
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: "clamp(2rem, 5vw, 4rem)",
              fontWeight: 700,
              color: "#E8F4F2",
              letterSpacing: "-0.02em",
              lineHeight: 1.1,
              marginBottom: "24px",
            }}
          >
            Birlikte<br />
            <span style={{ color: "#3EA094" }}>Sonsuzluk.</span>
          </motion.h2>

          <motion.div variants={fadeIn} style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
            <div style={{ width: "32px", height: "1px", background: "rgba(62,160,148,0.4)" }} />
            <span
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: "11px",
                fontWeight: 500,
                letterSpacing: "0.35em",
                textTransform: "uppercase",
                color: "rgba(62,160,148,0.6)",
              }}
            >
              {config.coupleNames}
            </span>
            <div style={{ width: "32px", height: "1px", background: "rgba(62,160,148,0.4)" }} />
          </motion.div>

          <motion.span
            variants={fadeIn}
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: "10px",
              fontWeight: 400,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "rgba(62,160,148,0.4)",
            }}
          >
            {config.specialDate}
          </motion.span>
        </motion.div>
      </section>

      {/* FOOTER */}
      <footer
        style={{
          padding: "40px 24px",
          textAlign: "center",
          fontFamily: "'Space Grotesk', sans-serif",
          fontSize: "9px",
          fontWeight: 500,
          letterSpacing: "0.4em",
          textTransform: "uppercase",
          color: "rgba(62,160,148,0.35)",
          borderTop: "1px solid rgba(62,160,148,0.1)",
        }}
      >
        MAVİ TEMA — birlikteydik.com
      </footer>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap');

        @media (max-width: 1024px) {
          .flex-col.lg\\:grid {
            display: flex !important;
            flex-direction: column !important;
          }
        }
      `}</style>
    </main>
  );
}
