"use client";

import { useState, useEffect, useRef } from "react";
import { motion, Variants, useScroll, useTransform } from "framer-motion";
import { Volume2, VolumeX, Heart } from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// 🎮 MÜŞTERİ VERİLERİ (Kolayca Düzenlenebilir)
// ─────────────────────────────────────────────────────────────────────────────
const config = {
  coupleNames: "SEN\n&\nBen",
  tagline: "SENİNLE EN İYİ MACERALARA",
  accentColor: "#cbff3e",
  specialDate: "26.10.2024",
  musicUrl: "/music/pixel.mp3",
};

const memories = [
  {
    id: 1,
    image: "/moment.jpg",
    title: "İlk Bakış, İlk Gülüş",
    description: "Seni gördüğüm o an, zamanın tüm hızını unutup durduğu saniyeydi. O gün anladım kaderimin seninle yazıldığını.",
    date: "26 Ekim 2024",
    angle: -4,
    note: "Güneşin yüzünde bıraktığı gölgeler bile sana hayrandı.",
  },
  {
    id: 2,
    image: "/moment2.jpg",
    title: "Sıkıca, Hiç Bırakmamacasına",
    description: "Bileğimizdeki ipler, boncuklar ve kalbimizi birbirine bağlayan o görünmez düğüm...",
    date: "12 Kasım 2024",
    angle: 3,
    note: "Sırılsıklam ıslansak bile yanındayken üşümüyordum.",
  },
  {
    id: 3,
    image: "/moment7.jpg",
    title: "Eski Bir Şarkının İzinde",
    description: "Tozlu rafların arasında, eski plakların cızırtısında kaybolduğumuz o pazar günü.",
    date: "14 Aralık 2024",
    angle: -2,
    note: "Dünyanın en huzurlu yeri senin omuzların, en güzel sesi senin sesin...",
  },
  {
    id: 4,
    image: "/moment3.jpg",
    title: "Yıldızların Altında",
    description: "Şehrin tüm gürültüsünden uzakta, tepede uzanıp gökyüzünü izlerken dilek tuttuğumuz o gece. Ben sadece senin gözlerine baktım ve içimden hep aynı şeyi diledim: Sonsuzluk.",
    date: "18 Ocak 2025",
    angle: 5,
    note: "En soğuk günlerde bile beni ısıtan tek şey senin gülüşündü.",
  },
  {
    id: 5,
    image: "/moment4.jpg",
    title: "Maviye Açılan Sonsuzluk",
    description: "Benim için dünyanın en huzurlu limanı burasıydı sevgilim, çünkü yanımda sen varsın.",
    date: "22 Nisan 2025",
    angle: -4,
    note: "Sadece seninle yan yana uzanıp hiçbir şey düşünmemek...",
  },
  {
    id: 6,
    image: "/moment5.jpg",
    title: "Birlikte Yeni Bir Başlangıç",
    description: "Başardığımız, büyüdüğümüz ve geleceğe doğru ilk büyük adımı attığımız o gün; yanımda sen varsan her zorluğun üstesinden gelebileceğimi bir kez daha anladım.",
    date: "12 Haziran 2025",
    angle: 3,
    note: "Geleceğe seninle attığım bir adım daha",
  },
{
    id: 7,
    image: "/moment6.jpg", // moment6.jpg (Gelinlik ve buket)
    title: "Beyazlar İçinde Bir Ömür",
    description: "Ellerinin arasında tuttuğun o güller, senin zarafetinin yanında sadece ufak birer ayrıntıydı. Hayatımın en güzel, en berrak 'Evet'ini fısıldarken; kalbimi sonsuza dek sana emanet etmenin gururunu yaşıyordum.",
    date: "18 Eylül 2025",
    angle: -2,
    note: "Dünyanın en güzel gelini, kalbimin ebedi sahibi...",
  },
{
    id: 8,
    image: "/moment8.jpg", // moment8.jpg (Denizin içindeki çift)
    title: "Sonsuzluğun Kıyısında",
    description: "Şehrin, insanların ve zamanın fersah fersah uzağında... Sadece iki siluet olarak gökyüzünün ve denizin sonsuzluğuna karıştığımız o an. Biz artık iki ayrı insan değil, aynı denizde eriyen tek bir hikayeyiz.",
    date: "02 Mayıs 2026",
    angle: 4,
    note: "Dünya dönmeyi bıraksa bile, biz bu denizde sonsuza dek kalacağız.",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// ANİMASYON VARİANTLARI
// ─────────────────────────────────────────────────────────────────────────────
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const stagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } },
};

// ─────────────────────────────────────────────────────────────────────────────
// 🕹️ OYUN KONTROL KOLU WİDGET'I
// ─────────────────────────────────────────────────────────────────────────────
function GamepadWidget({ isPlaying, toggleMusic }: { isPlaying: boolean; toggleMusic: () => void }) {
  return (
    <div
      className="cursor-pointer transition-transform hover:scale-[1.03]"
      style={{
        background: "#111",
        border: `2px solid ${isPlaying ? "#CBFF3E" : "rgba(203,255,62,0.3)"}`,
        padding: "12px 16px",
        display: "flex",
        alignItems: "center",
        gap: "14px",
        boxShadow: isPlaying ? "0 0 20px rgba(203,255,62,0.3), 0 8px 32px rgba(0,0,0,0.8)" : "0 8px 32px rgba(0,0,0,0.8)",
        imageRendering: "pixelated",
      }}
      onClick={toggleMusic}
    >
      {/* Kontrol kolu gövdesi */}
      <div style={{ position: "relative", width: 64, height: 40, flexShrink: 0 }}>
        {/* Gövde */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "#222",
            border: "2px solid #333",
            imageRendering: "pixelated",
          }}
        />
        {/* Sol D-Pad */}
        <div style={{ position: "absolute", left: 6, top: "50%", transform: "translateY(-50%)" }}>
          {/* Yukarı */}
          <div style={{ width: 6, height: 6, background: "rgba(203,255,62,0.5)", margin: "0 auto 2px" }} />
          {/* Sol-Merkez-Sağ */}
          <div style={{ display: "flex", gap: 2 }}>
            <div style={{ width: 6, height: 6, background: "rgba(203,255,62,0.5)" }} />
            <motion.div
              style={{ width: 6, height: 6 }}
              animate={{ background: isPlaying ? "#CBFF3E" : "rgba(203,255,62,0.7)" }}
              transition={{ duration: 0.5 }}
            />
            <div style={{ width: 6, height: 6, background: "rgba(203,255,62,0.5)" }} />
          </div>
          {/* Aşağı */}
          <div style={{ width: 6, height: 6, background: "rgba(203,255,62,0.5)", margin: "2px auto 0" }} />
        </div>
        {/* Orta LED */}
        <motion.div
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            transform: "translate(-50%,-50%)",
            width: 6,
            height: 6,
          }}
          animate={{
            background: isPlaying ? ["#CBFF3E", "#fff", "#CBFF3E"] : "rgba(203,255,62,0.3)",
            boxShadow: isPlaying ? ["0 0 6px #CBFF3E", "0 0 10px #fff", "0 0 6px #CBFF3E"] : "none",
          }}
          transition={{ duration: 0.8, repeat: Infinity }}
        />
        {/* Sağ butonlar */}
        <div style={{ position: "absolute", right: 6, top: "50%", transform: "translateY(-50%)" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 3 }}>
            {[0, 1, 2, 3].map((i) => (
              <motion.div
                key={i}
                style={{ width: 7, height: 7, borderRadius: "50%" }}
                animate={{
                  background: isPlaying
                    ? i === Math.floor((Date.now() / 400) % 4) ? "#CBFF3E" : "rgba(203,255,62,0.3)"
                    : "rgba(203,255,62,0.25)",
                }}
                transition={{ duration: 0.4, repeat: Infinity, delay: i * 0.1 }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Metin */}
      <div style={{ display: "flex", flexDirection: "column" }}>
        <span
          style={{
            fontFamily: "'Press Start 2P', monospace",
            fontSize: "8px",
            color: "#CBFF3E",
            lineHeight: 1.4,
          }}
        >
          {isPlaying ? "PLAYING" : "MUZIK"}
        </span>
        <span
          style={{
            fontFamily: "'VT323', monospace",
            fontSize: "14px",
            color: "rgba(203,255,62,0.55)",
            marginTop: "2px",
          }}
        >
          {isPlaying ? "TIKLA > DURDUR" : "TIKLA > DINLE"}
        </span>
      </div>

      {/* Ses ikonu */}
      <div style={{ marginLeft: "auto" }}>
        {isPlaying ? (
          <Volume2 size={13} style={{ color: "#CBFF3E" }} className="animate-pulse" />
        ) : (
          <VolumeX size={13} style={{ color: "rgba(203,255,62,0.4)" }} />
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MEMORY CARD - PIXEL STYLE
// ─────────────────────────────────────────────────────────────────────────────
function MemoryCard({ memory, index }: { memory: (typeof memories)[0]; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const imageY = useTransform(scrollYProgress, [0, 1], [15, -15]);

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      variants={stagger}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "24px",
        padding: "32px",
        border: "2px solid rgba(203,255,62,0.2)",
        background: "rgba(203,255,62,0.02)",
        position: "relative",
      }}
    >
      {/* Köşe piksel süsü */}
      {["top-0 left-0", "top-0 right-0", "bottom-0 left-0", "bottom-0 right-0"].map((pos, i) => (
        <div
          key={i}
          className={`absolute ${pos} w-3 h-3`}
          style={{ background: "#CBFF3E" }}
        />
      ))}

      {/* Stage başlık */}
      <motion.div variants={fadeUp} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "8px" }}>
        <span
          style={{
            fontFamily: "'Press Start 2P', monospace",
            fontSize: "10px",
            color: "#CBFF3E",
            letterSpacing: "0.05em",
          }}
        >
          {memory.title}
        </span>
      </motion.div>

      {/* Fotoğraf + Scanlines */}
      <motion.div
        variants={fadeUp}
        style={{ position: "relative", overflow: "hidden" }}
      >
        <img
          src={memory.image}
          alt={memory.title}
          style={{
            width: "100%",
            height: "auto",
            display: "block",
            filter: "saturate(1.1) contrast(1.05)",
          }}
        />
        {/* Scanlines */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: "repeating-linear-gradient(0deg, rgba(0,0,0,0.18) 0px, rgba(0,0,0,0.18) 1px, transparent 1px, transparent 3px)",
            pointerEvents: "none",
            zIndex: 2,
          }}
        />
        {/* Pixel border overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            border: "2px solid rgba(203,255,62,0.15)",
            pointerEvents: "none",
            zIndex: 3,
          }}
        />
      </motion.div>

      {/* Açıklama */}
      <motion.div variants={fadeUp} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        <p
          style={{
            fontFamily: "'VT323', monospace",
            fontSize: "20px",
            color: "rgba(255,255,255,0.75)",
            lineHeight: 1.4,
          }}
        >
          {memory.description}
        </p>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ width: "6px", height: "6px", background: "#CBFF3E" }} />
          <span
            style={{
              fontFamily: "'Press Start 2P', monospace",
              fontSize: "8px",
              color: "rgba(203,255,62,0.5)",
            }}
          >
            {memory.date}
          </span>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ANA COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export default function GameTemplate() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [blink, setBlink] = useState(true);
  const [countdown, setCountdown] = useState(4);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress: heroScroll } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(heroScroll, [0, 1], [0, 80]);
  const heroOpacity = useTransform(heroScroll, [0, 0.75], [1, 0]);

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

  useEffect(() => {
    const interval = setInterval(() => setBlink(b => !b), 600);
    return () => clearInterval(interval);
  }, []);

  const toggleMusic = () => {
    if (!audioRef.current) return;
    if (isPlaying) { audioRef.current.pause(); setIsPlaying(false); }
    else { audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {}); }
  };

  return (
    <main
      className="min-h-screen overflow-x-hidden"
      style={{ background: "#111111", color: "#CBFF3E", fontFamily: "'VT323', monospace" }}
    >
      {/* Scanlines fixed overlay */}
      <div
        className="fixed inset-0 pointer-events-none z-30"
        style={{
          backgroundImage: "repeating-linear-gradient(0deg, rgba(0,0,0,0.12) 0px, rgba(0,0,0,0.12) 1px, transparent 1px, transparent 3px)",
          animation: "scanMove 8s linear infinite",
        }}
      />

      {/* Centered mobile-framed container for content */}
      <div className="relative w-full max-w-[480px] mx-auto min-h-screen bg-[#111111] shadow-[0_0_80px_rgba(203,255,62,0.12)] border-x border-[#CBFF3E]/20 z-10 flex flex-col">
        {/* Gamepad Widget */}
        <div className="fixed lg:absolute bottom-6 left-6 z-40">
          <GamepadWidget isPlaying={isPlaying} toggleMusic={toggleMusic} />
        </div>

      {/* ── HERO ── */}
      <section
        ref={heroRef}
        className="relative flex flex-col items-center justify-center overflow-hidden w-full h-[100svh]"
        style={{ background: "#111" }}
      >
        {/* Pixel grid bg */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: "linear-gradient(rgba(203,255,62,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(203,255,62,0.04) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />

        <motion.div
          style={{ y: heroY, opacity: heroOpacity }}
          className="relative z-20 flex flex-col items-center px-6 text-center"
        >
          <motion.div variants={stagger} initial="hidden" animate="visible" className="flex flex-col items-center">
            {/* HUD - Oyun bilgisi */}
            <motion.div
              variants={fadeUp}
              style={{
                display: "flex",
                gap: "24px",
                marginBottom: "2rem",
                flexWrap: "wrap",
                justifyContent: "center",
              }}
            >
              {[
                { label: "PLAYER", value: "2P" },
                { label: "DATE", value: config.specialDate },
                { label: "LEVEL", value: "MAX" },
              ].map(({ label, value }) => (
                <div key={label} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "2px" }}>
                  <span
                    style={{
                      fontFamily: "'Press Start 2P', monospace",
                      fontSize: "7px",
                      color: "rgba(203,255,62,0.5)",
                      letterSpacing: "0.08em",
                    }}
                  >
                    {label}
                  </span>
                  <span
                    style={{
                      fontFamily: "'Press Start 2P', monospace",
                      fontSize: "10px",
                      color: "#CBFF3E",
                    }}
                  >
                    {value}
                  </span>
                </div>
              ))}
            </motion.div>

            {/* Ana başlık */}
            <motion.h1
              variants={fadeUp}
              style={{
                fontFamily: "'Press Start 2P', monospace",
                fontSize: "clamp(1.4rem, 6vw, 4rem)",
                fontWeight: 400,
                letterSpacing: "0.04em",
                lineHeight: 1.3,
                color: "#CBFF3E",
                textShadow: "4px 4px 0 rgba(0,0,0,0.8), 0 0 30px rgba(203,255,62,0.4)",
                marginBottom: "0.5rem",
                whiteSpace: "pre-line",
              }}
            >
              {config.coupleNames}
            </motion.h1>

            {/* Küçük tagline */}
            <motion.p
              variants={fadeUp}
              style={{
                fontFamily: "'VT323', monospace",
                fontSize: "clamp(1.1rem, 3vw, 1.6rem)",
                color: "rgba(255,255,255,0.55)",
                letterSpacing: "0.1em",
                marginBottom: "2rem",
              }}
            >
              {config.tagline}
            </motion.p>

            {/* HP Barı (kalp) */}
            <motion.div variants={fadeUp} style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "1.5rem" }}>
              <span
                style={{
                  fontFamily: "'Press Start 2P', monospace",
                  fontSize: "8px",
                  color: "rgba(203,255,62,0.6)",
                  marginRight: "6px",
                }}
              >
                HP
              </span>
              {Array.from({ length: 8 }).map((_, i) => (
                <Heart key={i} size={12} fill="#CBFF3E" stroke="none" style={{ opacity: 1 }} />
              ))}
            </motion.div>

            {/* Müzik butonu - pixel stil */}
            <motion.div variants={fadeUp} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
              <button
                onClick={toggleMusic}
                style={{
                  fontFamily: "'Press Start 2P', monospace",
                  fontSize: "9px",
                  letterSpacing: "0.08em",
                  padding: "12px 28px",
                  background: "transparent",
                  border: `2px solid ${isPlaying ? "rgba(203,255,62,0.5)" : "#CBFF3E"}`,
                  color: isPlaying ? "rgba(203,255,62,0.6)" : "#111",
                  cursor: "pointer",
                  position: "relative",
                  backgroundColor: isPlaying ? "transparent" : "#CBFF3E",
                  textShadow: isPlaying ? "none" : "none",
                  boxShadow: isPlaying ? "none" : "4px 4px 0 rgba(203,255,62,0.3)",
                  transition: "all 0.2s steps(1)",
                }}
              >
                {isPlaying ? "[ DURDUR ]" : "[ SESLI DINLE ]"}
              </button>
              <span
                style={{
                  fontFamily: "'VT323', monospace",
                  fontSize: "18px",
                  color: "rgba(255,255,255,0.3)",
                  opacity: blink ? 1 : 0,
                  transition: "opacity 0.1s steps(1)",
                }}
              >
                ✨ bence tıklamalısın, böylesi çok daha güzel
              </span>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Scroll indicator - pixel ok */}
        <div style={{ position: "absolute", bottom: "32px", left: "50%", transform: "translateX(-50%)", zIndex: 20 }}>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: blink ? 1 : 0.3 }}
            transition={{ duration: 0.3 }}
            style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}
          >
            <span
              style={{
                fontFamily: "'Press Start 2P', monospace",
                fontSize: "7px",
                color: "rgba(203,255,62,0.6)",
                letterSpacing: "0.08em",
              }}
            >
              ASAGI KAYDIR
            </span>
            <div
              style={{
                width: 0,
                height: 0,
                borderLeft: "8px solid transparent",
                borderRight: "8px solid transparent",
                borderTop: "10px solid rgba(203,255,62,0.6)",
              }}
            />
          </motion.div>
        </div>
      </section>

      {/* ── BÖLÜM BAŞLIĞI ── */}
      <div
        style={{
          padding: "48px 24px 32px",
          borderTop: "2px solid rgba(203,255,62,0.2)",
          borderBottom: "2px solid rgba(203,255,62,0.2)",
          textAlign: "center",
          background: "rgba(203,255,62,0.02)",
        }}
      >
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={stagger}
        >
          <motion.p
            variants={fadeUp}
            style={{
              fontFamily: "'Press Start 2P', monospace",
              fontSize: "8px",
              color: "rgba(203,255,62,0.5)",
              letterSpacing: "0.12em",
              marginBottom: "8px",
            }}
          >
            SELECT STAGE
          </motion.p>
          <motion.h2
            variants={fadeUp}
            style={{
              fontFamily: "'Press Start 2P', monospace",
              fontSize: "clamp(0.8rem, 2.5vw, 1.3rem)",
              color: "#CBFF3E",
              letterSpacing: "0.05em",
            }}
          >
            BIZIM HIKAYEMIZ
          </motion.h2>
        </motion.div>
      </div>

      {/* ── STAGE KARTLARI ── */}
      <div
        style={{
          maxWidth: "860px",
          margin: "0 auto",
          padding: "48px 24px",
          display: "flex",
          flexDirection: "column",
          gap: "40px",
        }}
      >
        {memories.map((m, i) => (
          <MemoryCard key={m.id} memory={m} index={i} />
        ))}
      </div>

      {/* ── GAME COMPLETE ── */}
      <section
        style={{
          padding: "80px 24px",
          textAlign: "center",
          borderTop: "2px solid rgba(203,255,62,0.2)",
          background: "#0A0A0A",
          position: "relative",
        }}
      >
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={stagger}
          style={{ maxWidth: "600px", margin: "0 auto" }}
        >
          <motion.p
            variants={fadeUp}
            style={{
              fontFamily: "'Press Start 2P', monospace",
              fontSize: "8px",
              color: "rgba(203,255,62,0.5)",
              letterSpacing: "0.12em",
              marginBottom: "16px",
            }}
          >
            *** GAME COMPLETE ***
          </motion.p>
          <motion.h2
            variants={fadeUp}
            style={{
              fontFamily: "'Press Start 2P', monospace",
              fontSize: "clamp(1rem, 4vw, 2rem)",
              color: "#CBFF3E",
              textShadow: "4px 4px 0 rgba(0,0,0,0.6), 0 0 40px rgba(203,255,62,0.5)",
              lineHeight: 1.5,
              marginBottom: "32px",
            }}
          >
            BIRLIKTE<br />SONSUZLUK
          </motion.h2>

          <motion.div variants={fadeUp} style={{ display: "flex", justifyContent: "center", gap: "8px", marginBottom: "24px" }}>
            {[1, 2, 3].map((i) => (
              <motion.div
                key={i}
                style={{ width: 12, height: 12 }}
                animate={{ background: ["#CBFF3E", "#fff", "#CBFF3E"] }}
                transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.2 }}
              />
            ))}
          </motion.div>

          <motion.p
            variants={fadeUp}
            style={{
              fontFamily: "'VT323', monospace",
              fontSize: "22px",
              color: "rgba(255,255,255,0.45)",
              letterSpacing: "0.1em",
            }}
          >
            SENINLE OLDUGUM HER ZAMAN <br></br>EN YUKSEK SKORUN SAHIBI BENIM <br></br> {config.specialDate}
          </motion.p>
        </motion.div>
      </section>

      {/* FOOTER */}
      <footer
        style={{
          padding: "32px 24px",
          textAlign: "center",
          fontFamily: "'Press Start 2P', monospace",
          fontSize: "7px",
          letterSpacing: "0.1em",
          color: "rgba(203,255,62,0.3)",
          borderTop: "2px solid rgba(203,255,62,0.1)",
        }}
      >
        PIXEL TEMA — birlikteydik.com
      </footer>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&family=VT323&display=swap');

        @keyframes scanMove {
          0% { background-position: 0 0; }
          100% { background-position: 0 32px; }
        }
      `}</style>
    </main>
  );
}
