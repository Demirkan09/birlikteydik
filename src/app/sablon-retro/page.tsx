"use client";

import { useState, useEffect, useRef } from "react";
import { motion, Variants, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { ChevronDown, Volume2, VolumeX, Heart, Sparkles } from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// 💾 MÜŞTERİ VERİLERİ (Kolayca Düzenlenebilir)
// ─────────────────────────────────────────────────────────────────────────────
const config = {
  coupleNames: "Sen & Ben",
  tagline: "Eski bir sinema makinesinin cızırtısında, sararmış sayfalar arasında saklanan en güzel hikayemiz...",
  accentColor: "#C9A84C", // Retro Gold
  specialDate: "26 Ekim 2024",
  musicUrl: "/music/retro.mp3",
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
  hidden: { opacity: 0, y: 50, filter: "blur(6px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 1.2, ease: [0.16, 1, 0.3, 1] },
  },
};

const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 1.5 } },
};

const stagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.25 } },
};

// ─────────────────────────────────────────────────────────────────────────────
// LOŞ IŞIK VE TOZ PARÇACIKLARI
// ─────────────────────────────────────────────────────────────────────────────
function RetroDust() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      <div className="absolute w-[600px] h-[600px] rounded-full bg-[#C9A84C]/5 filter blur-[100px] -top-40 -left-40 animate-pulse" style={{ animationDuration: "10s" }} />
      <div className="absolute w-[500px] h-[500px] rounded-full bg-[#D98324]/3 filter blur-[120px] bottom-20 right-10 animate-pulse" style={{ animationDuration: "8s" }} />
      {Array.from({ length: 22 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-[#C9A84C]"
          style={{
            width: Math.random() * 3 + 1.5,
            height: Math.random() * 3 + 1.5,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            boxShadow: "0 0 6px rgba(201,168,76,0.5)",
            opacity: 0,
          }}
          animate={{
            opacity: [0, 0.35, 0],
            y: [0, -(Math.random() * 120 + 60)],
            x: [0, (Math.random() - 0.5) * 40],
          }}
          transition={{
            duration: Math.random() * 6 + 6,
            repeat: Infinity,
            delay: Math.random() * 8,
            ease: "easeOut",
          }}
        />
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MOBİL İÇİN TEKLİ KART GÖRÜNÜMÜ
// ─────────────────────────────────────────────────────────────────────────────
function MobilePolaroidCard({ memory }: { memory: (typeof memories)[0] }) {
  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-60px" }}
      className="relative min-h-[90svh] flex flex-col justify-center items-center py-10 px-4 border-b border-stone-900/40"
      style={{ background: "#0D0C0B" }}
    >
      <div className="absolute w-64 h-64 rounded-full bg-[#C9A84C]/5 filter blur-3xl pointer-events-none" />

      <motion.div
        variants={fadeUp}
        className="bg-[#EAE6DE] p-4 pb-12 shadow-[0_15px_40px_rgba(0,0,0,0.6)] border border-stone-200/10 flex flex-col relative w-full max-w-[310px]"
        style={{ transform: `rotate(${memory.angle}deg)` }}
      >
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-24 h-6 bg-[#D8D2C4]/60 border-y border-stone-300/10 shadow-sm backdrop-blur-[2px] rotate-[-1deg] z-10 mix-blend-multiply" />
        <div className="relative aspect-[4/3] bg-stone-900 overflow-hidden shadow-inner border border-stone-300/20">
          <img
            src={memory.image}
            alt={memory.title}
            className="w-full h-full object-cover grayscale-[20%] sepia-[30%] brightness-[92%] contrast-[1.05]"
          />
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent pointer-events-none" />
        </div>
        <div className="mt-5 text-center px-1">
          <p className="text-[14px] tracking-wide font-normal italic" style={{ fontFamily: "'Dancing Script', 'Cursive', serif", lineHeight: 1.3, color: "#1c1a18" }}>
            {memory.note}
          </p>
        </div>
      </motion.div>

      <div className="mt-8 text-center px-6 max-w-sm flex flex-col gap-3 z-10 relative">
        <h3 className="text-xl font-normal text-amber-100/90 tracking-wide font-serif leading-tight">
          {memory.title}
        </h3>
        <p className="text-xs text-stone-400 font-sans tracking-wide leading-relaxed font-light mt-1">
          {memory.description}
        </p>
        <span className="text-[9px] tracking-[0.25em] text-stone-600 font-mono mt-2">
          {memory.date}
        </span>
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MASAÜSTÜ PARALLAX KART GÖRÜNÜMÜ
// ─────────────────────────────────────────────────────────────────────────────
function DesktopPolaroidCard({ memory, index }: { memory: (typeof memories)[0]; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const imageY = useTransform(scrollYProgress, [0, 1], [40, -40]);
  const isEven = index % 2 === 0;

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-120px" }}
      variants={stagger}
      className={`relative flex items-center justify-center min-h-[90vh] px-16 xl:px-32 gap-16 xl:gap-28`}
      style={{ flexDirection: isEven ? "row" : "row-reverse" }}
    >

      <motion.div variants={fadeUp} className="relative flex-shrink-0" style={{ transform: `rotate(${memory.angle * 0.8}deg)` }}>
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-32 h-8 bg-[#D8D2C4]/60 border-y border-stone-300/10 shadow-sm backdrop-blur-[2px] rotate-[-2deg] z-20 mix-blend-multiply" />
        <div className="bg-[#EAE6DE] p-6 pb-16 shadow-[0_20px_50px_rgba(0,0,0,0.65)] border border-stone-200/10 rounded-sm" style={{ width: "350px" }}>
          <div className="relative aspect-[4/3] bg-stone-950 overflow-hidden shadow-inner border border-stone-300/20">
            <motion.img
              src={memory.image}
              alt={memory.title}
              className="absolute inset-x-0 w-full h-[120%] object-cover grayscale-[18%] sepia-[28%] brightness-[92%] contrast-[1.05]"
              style={{ y: imageY, top: "-10%" }}
            />
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent pointer-events-none" />
          </div>
          <div className="mt-6 text-center px-2">
            <p className="text-[17px] tracking-wide font-normal italic" style={{ fontFamily: "'Dancing Script', 'Cursive', serif", lineHeight: 1.3, color: "#1c1a18" }}>
              {memory.note}
            </p>
          </div>
        </div>
      </motion.div>

      <div className="flex flex-col gap-5 max-w-md z-10 relative">
        <motion.div variants={fadeIn} className="flex items-center gap-4">
          <div className="w-10 h-px bg-[#C9A84C]/30" />
          <span className="text-[10px] tracking-[0.25em] text-stone-500 font-mono uppercase">{memory.date}</span>
        </motion.div>
        <motion.h3 variants={fadeUp} className="text-3xl xl:text-4xl font-normal text-amber-100/90 tracking-wide font-serif leading-tight">
          {memory.title}
        </motion.h3>
        <motion.p variants={fadeUp} className="text-stone-400 font-sans text-sm font-light leading-relaxed tracking-wide">
          {memory.description}
        </motion.p>
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// YENİLENMİŞ RETRO KESET (Ses Butonu İçinde)
// ─────────────────────────────────────────────────────────────────────────────
function CassetteWidget({ isPlaying, toggleMusic }: { isPlaying: boolean; toggleMusic: () => void }) {
  return (
    <div className="flex items-center gap-4 bg-[#121110]/95 border border-[#C9A84C]/20 rounded-xl p-3 shadow-[0_12px_40px_rgba(0,0,0,0.8)] backdrop-blur-xl transition-transform hover:scale-[1.02]">
      
      {/* Kasetin Kendisi Tıklanabilir */}
      <div 
        onClick={toggleMusic}
        className="group"
        style={{
          width: "82px",
          height: "52px",
          backgroundColor: "#1D1B1A",
          borderRadius: "6px",
          border: "2px solid #332F2A",
          position: "relative",
          boxShadow: "0 6px 16px rgba(0,0,0,0.5), inset 0 0 8px rgba(0,0,0,0.8)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          cursor: "pointer",
          flexShrink: 0
        }}
      >
        {/* Kaset Üst Etiketi ve Ses İkonu (Sarı Alan) */}
        <div style={{
          width: "72px",
          height: "12px",
          backgroundColor: "#C9A84C",
          position: "absolute",
          top: "4px",
          borderRadius: "2px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 5px",
          color: "#1C1B1A",
          transition: "background-color 0.3s ease"
        }}
        className="group-hover:bg-[#d4b55e]"
        >
          <span style={{ fontSize: "5px", fontWeight: "bold", fontFamily: "monospace", letterSpacing: "0.5px" }}>
            A-90
          </span>
          {/* YENİ: Ses İkonu sarı etiketin içinde */}
          <div>
            {isPlaying ? <Volume2 size={8} className="animate-pulse" /> : <VolumeX size={8} className="opacity-80" />}
          </div>
        </div>
        
        {/* Kaset Orta Camı */}
        <div style={{
          width: "48px",
          height: "22px",
          backgroundColor: "#0D0C0B",
          border: "1px solid #332F2A",
          borderRadius: "4px",
          position: "absolute",
          bottom: "8px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "0 5px",
          boxShadow: "inset 0 2px 4px rgba(0,0,0,0.9)"
        }}>
          {/* Sol Çark */}
          <div style={{
            width: "13px", height: "13px", borderRadius: "50%", border: "1.5px dashed #C9A84C",
            display: "flex", alignItems: "center", justifyContent: "center",
            animation: isPlaying ? "spin 3.5s infinite linear" : "none"
          }}>
            <div style={{ width: "3px", height: "3px", borderRadius: "50%", backgroundColor: "#C9A84C" }} />
          </div>
          
          <div style={{ width: "8px", height: "4px", backgroundColor: "#C9A84C", opacity: 0.25, borderRadius: "1px" }} />

          {/* Sağ Çark */}
          <div style={{
            width: "13px", height: "13px", borderRadius: "50%", border: "1.5px dashed #C9A84C",
            display: "flex", alignItems: "center", justifyContent: "center",
            animation: isPlaying ? "spin 3.5s infinite linear" : "none"
          }}>
            <div style={{ width: "3px", height: "3px", borderRadius: "50%", backgroundColor: "#C9A84C" }} />
          </div>
        </div>
        
        {/* Alt yamuk taban */}
        <div style={{
          width: "38px", height: "6px", backgroundColor: "#151413",
          position: "absolute", bottom: 0, borderTop: "1px solid #2B2824", borderRadius: "2px 2px 0 0"
        }} />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ANA COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export default function RetroPremiumPage() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [countdown, setCountdown] = useState(4);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress: heroScroll } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(heroScroll, [0, 1], [0, 120]);
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
    <main className="bg-[#0B0A09] text-[#F0EDE8] min-h-screen overflow-x-hidden font-serif selection:bg-amber-950/40">

      {/* GLOBAL FILM EFFECTS */}
      <div 
        className="fixed pointer-events-none z-40 opacity-[0.055]"
        style={{
          width: "200%", height: "200%", top: "-50%", left: "-50%",
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%2523noiseFilter)'/%3E%3C/svg%3E")`,
          animation: "noise 0.22s infinite steps(4)"
        }}
      />
      <div className="fixed inset-0 pointer-events-none z-30 opacity-10 mix-blend-color-burn">
        <div className="absolute w-[1.5px] h-full bg-stone-400" style={{ animation: "scratch-1 4.5s infinite linear" }} />
        <div className="absolute w-[1px] h-full bg-stone-500" style={{ animation: "scratch-2 6s infinite linear" }} />
      </div>
      <div className="fixed inset-0 pointer-events-none z-30 shadow-[inset_0_0_90px_rgba(0,0,0,0.9)]" />

      {/* Centered mobile-framed container for content */}
      <div className="relative w-full max-w-[480px] mx-auto min-h-screen bg-[#0B0A09] shadow-[0_0_80px_rgba(0,0,0,0.85)] border-x border-white/5 z-10 flex flex-col">
        {/* FLOATING WIDGET */}
        <div className="fixed lg:absolute bottom-6 left-6 z-40">
          <CassetteWidget isPlaying={isPlaying} toggleMusic={toggleMusic} />
        </div>

      {/* ── HERO SECTION ── */}
      <section
        ref={heroRef}
        className="relative flex flex-col items-center justify-center overflow-hidden w-full h-[100svh]"
      >
        <RetroDust />

        {/* FİXED: Kamera Çerçevesi - Artık düzgün ölçülerle ekran kenarlarını sarıyor */}
        <div className="absolute w-[calc(100%-2rem)] md:w-[calc(100%-4rem)] h-[calc(100%-2rem)] md:h-[calc(100%-4rem)] top-4 md:top-8 left-4 md:left-8 border border-[#C9A84C]/20 pointer-events-none z-10 flex flex-col justify-between p-4 md:p-6 opacity-70">
          <div className="flex justify-between text-[10px] tracking-widest text-[#C9A84C]/40 font-mono">
            <span className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-red-600/80 animate-pulse" /> REC
            </span>
            <span>BATTERY 88%</span>
          </div>
          <div className="flex justify-between text-[10px] tracking-widest text-[#C9A84C]/40 font-mono">
            <span>ISO 400</span>
            <span>24FPS</span>
          </div>
        </div>

        <motion.div style={{ y: heroY, opacity: heroOpacity }} className="relative z-20 flex flex-col items-center px-6 text-center">
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="visible"
            className="flex flex-col items-center"
          >
            <motion.div variants={fadeUp} className="mb-6">
              <Sparkles size={22} strokeWidth={1} className="text-[#C9A84C]/80 animate-pulse" />
            </motion.div>

            <motion.p variants={fadeUp} className="tracking-[0.5em] uppercase mb-6 text-[#C9A84C]/70 font-sans font-light" style={{ fontSize: "10px" }}>
              {config.specialDate}
            </motion.p>

            <motion.h1
              variants={fadeUp}
              className="leading-none tracking-wider"
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "clamp(3.2rem, 14vw, 9rem)",
                fontWeight: 300,
                background:
                  "linear-gradient(160deg, rgba(255,255,255,0.96) 0%, rgba(201,168,76,0.55) 60%, rgba(255,255,255,0.4) 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              {config.coupleNames}
            </motion.h1>

            <motion.div variants={fadeIn} className="flex items-center gap-4 my-4">
              <div className="w-16 h-px bg-gradient-to-r from-transparent to-[#C9A84C]/50" />
              <Heart size={10} fill="#C9A84C" stroke="none" className="opacity-80 drop-shadow-[0_0_8px_rgba(201,168,76,0.8)]" />
              <div className="w-16 h-px bg-gradient-to-l from-transparent to-[#C9A84C]/50" />
            </motion.div>

            <motion.p variants={fadeUp} className="text-[#8E877E] font-sans text-xs md:text-sm tracking-widest leading-relaxed max-w-md mt-6">
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
                    : `rgba(201,168,76,0.06)`,
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

        {/* Centered Scroll indicator wrapper (positioned relative to section base) */}
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
            transition={{ delay: 2, duration: 1.5 }}
            className="flex flex-col items-center gap-3 opacity-50 font-sans"
          >
            <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}>
              <ChevronDown size={18} className="text-[#C9A84C]" />
            </motion.div>
            <span className="text-[8px] tracking-[0.38em] uppercase text-[#C9A84C]">Aşağı Kaydır</span>
          </motion.div>
        </div>
      </section>

      {/* ── BÖLÜM ARA BAŞLIĞI ── */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={stagger}
        className="flex flex-col items-center py-24 px-6 text-center border-t border-[#C9A84C]/10 relative z-10"
        style={{ background: "linear-gradient(to bottom, #0B0A09, #0D0C0B)" }}
      >
        
        <motion.h2 variants={fadeUp} className="text-3xl md:text-4xl text-stone-300 font-serif font-light tracking-wide">
          Fotoğraf Albümümüz
        </motion.h2>
      </motion.div>

      {/* ── FOTOĞRAF KARTLARI ── */}
      <div className="relative z-10" style={{ background: "#0A0908" }}>
        {memories.map((m) => <MobilePolaroidCard key={m.id} memory={m} />)}
      </div>

      {/* ── FİNAL EPİLOG ── */}
      <section className="relative flex flex-col items-center justify-center overflow-hidden py-36 border-t border-[#C9A84C]/10 z-10" style={{ background: "#070605" }}>
        <RetroDust />
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(circle at 50% 50%, rgba(201,168,76,0.06) 0%, transparent 70%)" }} />

        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={stagger} className="relative z-10 flex flex-col items-center px-6 text-center">
          <motion.div variants={fadeUp} className="mb-8 text-[#C9A84C]/80">
            <Sparkles size={28} className="animate-pulse" />
          </motion.div>
          <motion.h2 variants={fadeUp} className="font-serif text-3xl md:text-5xl font-light text-[#FAF5E6] tracking-wide mb-6 leading-tight drop-shadow-lg">
            Sonsuza Dek Sevgiyle
          </motion.h2>

          <motion.div variants={fadeIn} className="flex items-center gap-3 mb-10">
            <Heart size={6} fill="#C9A84C" stroke="none" className="opacity-50" />
            <Heart size={12} fill="#C9A84C" stroke="none" className="opacity-80 drop-shadow-[0_0_8px_rgba(201,168,76,0.8)]" />
            <Heart size={6} fill="#C9A84C" stroke="none" className="opacity-50" />
          </motion.div>

          <motion.span variants={fadeUp} className="text-[#C9A84C]/70 font-sans tracking-[0.4em] uppercase text-xs font-light">
            {config.coupleNames}
          </motion.span>
          <motion.span variants={fadeIn} className="text-[9px] text-stone-600 tracking-widest font-mono mt-3 uppercase">
            {config.specialDate}
          </motion.span>
        </motion.div>
      </section>
      </div>

      {/* ── STYLES ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Abril+Fatface&family=Dancing+Script:wght@500;600&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400;1,600&family=Inter:wght@300;400;500&display=swap');
        
        @keyframes noise {
          0%, 100% { transform:translate(0, 0); }
          10% { transform:translate(-1%, -1.5%); }
          20% { transform:translate(-2.5%, 1%); }
          30% { transform:translate(1%, -2.5%); }
          40% { transform:translate(-1.5%, 2%); }
          50% { transform:translate(-2%, 1.5%); }
          60% { transform:translate(2%, 0%); }
          70% { transform:translate(0%, 2.5%); }
          80% { transform:translate(1.5%, 3%); }
          90% { transform:translate(-1%, 1.5%); }
        }

        @keyframes scratch-1 {
          0%, 100% { left: 18%; opacity: 0; }
          4% { left: 18%; opacity: 0.14; }
          8% { left: 42%; opacity: 0.06; }
          12% { left: 42%; opacity: 0; }
          50% { left: 81%; opacity: 0; }
          54% { left: 81%; opacity: 0.12; }
          58% { left: 24%; opacity: 0.08; }
          62% { left: 24%; opacity: 0; }
        }

        @keyframes scratch-2 {
          0%, 100% { left: 74%; opacity: 0; }
          15% { left: 74%; opacity: 0.1; }
          20% { left: 32%; opacity: 0.14; }
          25% { left: 32%; opacity: 0; }
          70% { left: 88%; opacity: 0; }
          75% { left: 88%; opacity: 0.11; }
          80% { left: 48%; opacity: 0.08; }
          85% { left: 48%; opacity: 0; }
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
      `}</style>
    </main>
  );
}