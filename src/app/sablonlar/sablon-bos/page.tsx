"use client";

import { useState, useEffect, useRef, createContext, useContext } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import EntranceScreen, { EntranceType } from "@/components/EntranceScreen";
import { ChevronDown, Volume2, VolumeX, Heart } from "lucide-react";
import VideoPlayerPro from "@/components/ui/video-player-pro";
import { Backlight } from "@/components/magicui/backlight";

// ─────────────────────────────────────────────────────────────────────────────
// ⚙️  ŞABLON AYARLARI (statik varsayılanlar — admin panelinden override edilir)
// ─────────────────────────────────────────────────────────────────────────────
export const defaultConfig = {
  coupleNames: "Sen\n&\nBen",
  tagline: "Birlikte geçen her anın değerini ve sonsuzluğa uzanan hikayemizi kutluyoruz...",
  storyTitlePrefix: "Birlikte Yazdığımız",
  storyTitleSuffix: "Hikayemiz",
  accentColor: "#C9A84C",
  bgColor: "#09090b",
  specialDate: "26 Ekim 2026",
  musicUrl: "/music/default.mp3",
  finalHeading: "Sonsuza Dek Birlikte",
  finalEnabled: true,
  lang: "tr" as string,
  // Partiküller
  particlesEnabled: true,
  particlesType: "hearts" as "hearts" | "rose-petals" | "stars" | "none",
  particlesDensity: 20,
  particlesColor: "" as string, // boşsa accentColor kullanılır
  // Müzik Widget
  musicWidgetEnabled: true,
  musicWidgetType: "vinyl" as "vinyl" | "minimal" | "hidden",
  musicWidgetPosition: "bottom-left" as "bottom-left" | "bottom-right" | "top-left" | "top-right",
  // Kart Stili
  memoryCardStyle: "plain" as "plain" | "polaroid" | "cinematic",
  memoryCardLayout: "vertical" as "vertical" | "grid",
  polaroidTilt: true,
  roundCornersEnabled: false,
  photoBorderRadius: 12,
  photoBorderEnabled: true,
  photoBorderColor: "" as string,
  // Tipografi
  headingFont: "cormorant" as "cormorant" | "playfair" | "cinzel" | "pinyon" | "vt323" | "press-start",
  bodyFont: "inter" as "inter" | "lato" | "dm-sans" | "vt323" | "press-start",
  // Renk Özelleştirmeleri
  taglineColor: "" as string,
  specialDateColor: "" as string,
  nameGradientStart: "" as string,
  nameGradientEnd: "" as string,
  finalHeadingColor: "" as string,
  textColor: "" as string,
  scrollTextColor: "" as string,
  headingEyebrowColor: "" as string,
  headingTitleColor: "" as string,
  // Giriş Animasyonu
  entranceEnabled: false,
  entranceType: "curtain" as EntranceType,
};

export type TemplateConfig = typeof defaultConfig;

// ─────────────────────────────────────────────────────────────────────────────
// 📸  ANLAR
// ─────────────────────────────────────────────────────────────────────────────
export const defaultMemories = [
  { id: 1, image: "/moment.jpg", title: "İlk Bakış", description: "Gözlerin ilk kez benimkilerle buluştuğunda, tüm evren bir an için sessizleşti.", caption: "gözlerine ilk baktığım an...", date: "14 Şubat 2025", rotate: -2.5 },
  { id: 2, image: "/moment2.jpg", title: "Kalp Atışlarımız", description: "Sadece elini tutmak bile kalbimin ritmini hızlandırıp en mutlu ezgiyi çalıyormuş gibi hissettiriyor.", caption: "ellerin elimde...", date: "12 Mart 2025", rotate: 1.8 },
  { id: 3, image: "/moment7.jpg", title: "Sonsuz Bağımız", description: "Her saniye, her nefeste sana olan sevgimin daha da alevlendiğini biliyorum.", caption: "sonsuz biz...", date: "25 Nisan 2025", rotate: -1.2 },
  { id: 4, image: "/moment3.jpg", title: "Yıldızların Altında", description: "Şehrin tüm gürültüsünden uzakta, gökyüzünü izlerken dilek tuttuğumuz o gece.", caption: "yıldızlar altında...", date: "18 Ocak 2025", rotate: 2.3 },
];

// ─────────────────────────────────────────────────────────────────────────────
// 🎨  FONT MAP
// ─────────────────────────────────────────────────────────────────────────────
const HEADING_FONT: Record<string, string> = {
  cormorant: "var(--font-cormorant), 'Cormorant Garamond', serif",
  playfair: "'Playfair Display', Georgia, serif",
  cinzel: "'Cinzel', 'Times New Roman', serif",
  pinyon: "'Pinyon Script', cursive",
  vt323: "'VT323', monospace",
  "press-start": "'Press Start 2P', monospace",
};
const BODY_FONT: Record<string, string> = {
  inter: "var(--font-inter), 'Inter', sans-serif",
  lato: "var(--font-lato), 'Lato', sans-serif",
  "dm-sans": "'DM Sans', sans-serif",
  vt323: "'VT323', monospace",
  "press-start": "'Press Start 2P', monospace",
};

function hexToRgb(hex: string) {
  let cleanHex = (hex || "#C9A84C").replace("#", "");
  if (cleanHex.length === 3) {
    cleanHex = cleanHex.split("").map((c) => c + c).join("");
  }
  const num = parseInt(cleanHex, 16) || 0;
  return `${(num >> 16) & 255}, ${(num >> 8) & 255}, ${num & 255}`;
}


// ─────────────────────────────────────────────────────────────────────────────
// 🔢  YARDIMCI
// ─────────────────────────────────────────────────────────────────────────────
const getDynamicFontSize = (names: string, baseMin: number, baseMax: number, baseVw = 8) => {
  if (!names) return `clamp(${baseMin}rem, ${baseVw}vw, ${baseMax}rem)`;
  const lines = names.split("\n");
  const nameLines = lines.map((l) => l.trim()).filter((l) => l !== "&" && l !== "");
  if (nameLines.length === 0) return `clamp(${baseMin}rem, ${baseVw}vw, ${baseMax}rem)`;
  const longest = Math.max(...nameLines.map((l) => l.length));
  if (longest > 6) {
    const factor = Math.max(6 / longest, 0.5);
    return `clamp(${baseMin * factor}rem, ${baseVw * factor}vw, ${baseMax * factor}rem)`;
  }
  return `clamp(${baseMin}rem, ${baseVw}vw, ${baseMax}rem)`;
};

// ─────────────────────────────────────────────────────────────────────────────
// 🎞  ANİMASYON VARIANTS
// ─────────────────────────────────────────────────────────────────────────────
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30, filter: "blur(4px)" },
  visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] } },
};
const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 1.2 } },
};
const stagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } },
};

// ─────────────────────────────────────────────────────────────────────────────
// 🫀  HEARTS PARTİKÜLLERİ
// ─────────────────────────────────────────────────────────────────────────────
type Particle = { x: number; y: number; size: number; speed: number; opacity: number; drift: number; phase: number; rotation?: number; rotSpeed?: number };

function HeartsCanvas({ accentColor, density }: { accentColor: string; density: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener("resize", resize);
    particlesRef.current = Array.from({ length: density }, () => ({
      x: Math.random() * window.innerWidth, y: Math.random() * window.innerHeight,
      size: Math.random() * 7 + 3, speed: Math.random() * 0.25 + 0.1,
      opacity: Math.random() * 0.4 + 0.15, drift: (Math.random() - 0.5) * 0.35,
      phase: Math.random() * Math.PI * 2,
    }));
    const drawHeart = (cx: number, cy: number, size: number, opacity: number) => {
      ctx.save(); ctx.globalAlpha = opacity; ctx.fillStyle = accentColor;
      ctx.beginPath();
      ctx.moveTo(cx, cy + size * 0.3);
      ctx.bezierCurveTo(cx, cy, cx - size * 0.7, cy, cx - size * 0.7, cy - size * 0.4);
      ctx.bezierCurveTo(cx - size * 0.7, cy - size * 1.0, cx, cy - size * 0.9, cx, cy - size * 0.5);
      ctx.bezierCurveTo(cx, cy - size * 0.9, cx + size * 0.7, cy - size * 1.0, cx + size * 0.7, cy - size * 0.4);
      ctx.bezierCurveTo(cx + size * 0.7, cy, cx, cy, cx, cy + size * 0.3);
      ctx.fill(); ctx.restore();
    };
    let t = 0;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height); t += 0.006;
      particlesRef.current.forEach((p) => {
        p.y -= p.speed; p.x += Math.sin(t + p.phase) * p.drift;
        if (p.y < -20) { p.y = canvas.height + 10; p.x = Math.random() * canvas.width; }
        drawHeart(p.x, p.y, p.size, p.opacity);
      });
      rafRef.current = requestAnimationFrame(animate);
    };
    animate();
    return () => { window.removeEventListener("resize", resize); cancelAnimationFrame(rafRef.current); };
  }, [accentColor, density]);
  return <canvas ref={canvasRef} style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 1 }} />;
}

// ─────────────────────────────────────────────────────────────────────────────
// 🌹  GÜL YAPRAĞI PARTİKÜLLERİ
// ─────────────────────────────────────────────────────────────────────────────
function RosePetalsCanvas({ accentColor, density }: { accentColor: string; density: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize(); window.addEventListener("resize", resize);
    const petals = Array.from({ length: density }, () => ({
      x: Math.random() * window.innerWidth, y: Math.random() * window.innerHeight,
      size: Math.random() * 7 + 3, speedY: Math.random() * 0.45 + 0.15,
      speedX: (Math.random() - 0.5) * 0.3, rotation: Math.random() * 360,
      rotSpeed: (Math.random() - 0.5) * 1.5, opacity: Math.random() * 0.22 + 0.06,
    }));
    let raf: number;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      petals.forEach((p) => {
        p.y += p.speedY; p.x += p.speedX; p.rotation += p.rotSpeed;
        if (p.y > canvas.height + 10) { p.y = -10; p.x = Math.random() * canvas.width; }
        ctx.save(); ctx.globalAlpha = p.opacity;
        ctx.translate(p.x, p.y); ctx.rotate((p.rotation * Math.PI) / 180);
        // Rengi accent color'dan türet
        const grad = ctx.createLinearGradient(-p.size, 0, p.size, 0);
        grad.addColorStop(0, accentColor + "cc");
        grad.addColorStop(0.5, accentColor);
        grad.addColorStop(1, accentColor + "88");
        ctx.fillStyle = grad;
        ctx.beginPath(); ctx.ellipse(0, 0, p.size, p.size * 0.65, 0, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
      });
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { window.removeEventListener("resize", resize); cancelAnimationFrame(raf); };
  }, [accentColor, density]);
  return <canvas ref={canvasRef} style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 1 }} />;
}

// ─────────────────────────────────────────────────────────────────────────────
// ⭐  YILDIZ PARTİKÜLLERİ
// ─────────────────────────────────────────────────────────────────────────────
function StarsCanvas({ accentColor, density }: { accentColor: string; density: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const count = density || 28;
    const cols = Math.ceil(Math.sqrt(count * 0.55));
    const rows = Math.ceil(count / cols);
    const stars: any[] = [];

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (stars.length >= count) break;
        const pctX = (c + 0.15 + Math.random() * 0.7) / cols;
        const pctY = (r + 0.15 + Math.random() * 0.7) / rows;
        stars.push({
          pctX,
          pctY,
          size: Math.random() * 2.2 + 1.3, // 1.3px to 3.5px
          maxOpacity: Math.random() * 0.5 + 0.4, // 0.4 to 0.9 opacity
          twinkleSpeed: Math.random() * 0.02 + 0.01,
          phase: Math.random() * Math.PI * 2,
        });
      }
    }

    let t = 0;
    let raf: number;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      t += 0.5;

      stars.forEach((s) => {
        // Twinkle (sine wave)
        const alpha = s.maxOpacity * (0.3 + 0.7 * Math.sin(t * s.twinkleSpeed + s.phase));

        ctx.save();
        ctx.globalAlpha = alpha;
        
        // Glow effect
        ctx.shadowBlur = 8;
        ctx.shadowColor = accentColor;
        ctx.fillStyle = accentColor;

        ctx.beginPath();
        ctx.arc(s.pctX * canvas.width, s.pctY * canvas.height, s.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      raf = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(raf);
    };
  }, [accentColor, density]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        inset: 0,
        pointerEvents: "none",
        zIndex: 1,
        width: "100%",
        height: "100%",
      }}
    />
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 🎵  MÜZİK WİDGET'I — Vinyl (Plak) tipi
// ─────────────────────────────────────────────────────────────────────────────
function MusicWidgetVinyl({ isPlaying, toggleMusic, accentColor, isEn }: { isPlaying: boolean; toggleMusic: () => void; accentColor: string; isEn: boolean }) {
  return (
    <div
      onClick={toggleMusic}
      style={{
        display: "flex", alignItems: "center", gap: "12px",
        background: "linear-gradient(135deg, #0a0a0c 0%, #18181b 60%, #0a0a0c 100%)",
        border: `1px solid ${accentColor}33`, borderRadius: "12px", padding: "10px 14px",
        cursor: "pointer", backdropFilter: "blur(20px)",
        boxShadow: `0 8px 32px rgba(0,0,0,0.7), 0 0 20px ${accentColor}0a`,
        transition: "transform 0.2s ease", userSelect: "none",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.02)")}
      onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
    >
      <motion.div
        animate={isPlaying ? { rotate: 360 } : { rotate: 0 }}
        transition={isPlaying ? { duration: 5, repeat: Infinity, ease: "linear" } : { duration: 0.3 }}
        style={{
          width: 44, height: 44, borderRadius: "50%", flexShrink: 0,
          background: "repeating-radial-gradient(circle, #27272a, #09090b 1px, #18181b 5px)",
          border: `2px solid ${accentColor}44`, display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: isPlaying ? `0 0 12px ${accentColor}55` : "none",
        }}
      >
        <div style={{ width: "13px", height: "13px", borderRadius: "50%", background: accentColor, border: "1px solid rgba(255,255,255,0.25)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ width: "3px", height: "3px", borderRadius: "50%", background: "#09090b" }} />
        </div>
      </motion.div>
      <div style={{ display: "flex", flexDirection: "column" }}>
        <span style={{ fontFamily: HEADING_FONT.cormorant, fontSize: "13px", fontStyle: "italic", color: isPlaying ? accentColor : "rgba(255,255,255,0.75)", letterSpacing: "0.04em" }}>
          {isPlaying ? (isEn ? "Melody Playing..." : "Melodi Çalıyor...") : (isEn ? "Background Melody" : "Arka Plan Melodisi")}
        </span>
        <span style={{ fontFamily: "var(--font-inter), sans-serif", fontSize: "9px", color: "rgba(255,255,255,0.35)", letterSpacing: "0.18em", textTransform: "uppercase", marginTop: "2px" }}>
          {isPlaying ? (isEn ? "Click to Pause" : "Tıkla & Durdur") : (isEn ? "Click to Play" : "Tıkla & Dinle")}
        </span>
      </div>
      <div style={{ marginLeft: "auto" }}>
        {isPlaying ? <Volume2 size={14} style={{ color: accentColor, opacity: 0.9 }} className="animate-pulse" /> : <VolumeX size={14} style={{ color: "rgba(255,255,255,0.35)" }} />}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 🎵  MÜZİK WİDGET'I — Minimal Bar tipi
// ─────────────────────────────────────────────────────────────────────────────
function MusicWidgetMinimal({ isPlaying, toggleMusic, accentColor, isEn }: { isPlaying: boolean; toggleMusic: () => void; accentColor: string; isEn: boolean }) {
  return (
    <div
      onClick={toggleMusic}
      style={{
        display: "flex", alignItems: "center", gap: "10px",
        background: `${accentColor}18`, border: `1px solid ${accentColor}44`,
        borderRadius: "100px", padding: "8px 16px", cursor: "pointer",
        backdropFilter: "blur(12px)", transition: "all 0.2s", userSelect: "none",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = `${accentColor}28`)}
      onMouseLeave={(e) => (e.currentTarget.style.background = `${accentColor}18`)}
    >
      {/* Animasyonlu barlar */}
      <div style={{ display: "flex", alignItems: "center", gap: "2px", height: "16px" }}>
        {[1, 0.6, 0.9, 0.4, 0.75].map((h, i) => (
          <motion.div
            key={i}
            animate={isPlaying ? { scaleY: [h, 1, h * 0.4, 0.9, h] } : { scaleY: 0.15 }}
            transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.1, ease: "easeInOut" }}
            style={{ width: "3px", height: "16px", background: accentColor, borderRadius: "2px", transformOrigin: "bottom", opacity: 0.85 }}
          />
        ))}
      </div>
      <span style={{ fontFamily: "var(--font-inter), sans-serif", fontSize: "11px", color: isPlaying ? accentColor : "rgba(255,255,255,0.6)", letterSpacing: "0.1em" }}>
        {isPlaying ? (isEn ? "Playing" : "Çalıyor") : (isEn ? "Music" : "Müzik")}
      </span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 🎵  Widget Wrapper — pozisyon + tip seçimi
// ─────────────────────────────────────────────────────────────────────────────
const WIDGET_POSITION_STYLE: Record<string, React.CSSProperties> = {
  "bottom-left":  { position: "fixed", bottom: "24px", left: "max(24px, calc(50% - 216px))", zIndex: 40 },
  "bottom-right": { position: "fixed", bottom: "24px", right: "max(24px, calc(50% - 216px))", zIndex: 40 },
  "top-left":     { position: "fixed", top: "24px",    left: "max(24px, calc(50% - 216px))",  zIndex: 40 },
  "top-right":    { position: "fixed", top: "24px",    right: "max(24px, calc(50% - 216px))", zIndex: 40 },
};

function MusicWidget({ isPlaying, toggleMusic, accentColor, type, position, isEn }: { isPlaying: boolean; toggleMusic: () => void; accentColor: string; type: string; position: string; isEn: boolean }) {
  const posStyle = WIDGET_POSITION_STYLE[position] ?? WIDGET_POSITION_STYLE["bottom-left"];
  if (type === "hidden") return null;
  return (
    <div className="lg:absolute" style={posStyle}>
      {type === "minimal"
        ? <MusicWidgetMinimal isPlaying={isPlaying} toggleMusic={toggleMusic} accentColor={accentColor} isEn={isEn} />
        : <MusicWidgetVinyl isPlaying={isPlaying} toggleMusic={toggleMusic} accentColor={accentColor} isEn={isEn} />
      }
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ⏱  ZAMAN SAYACI BİLEŞENİ
// ─────────────────────────────────────────────────────────────────────────────
function CountdownBlock({ memory, accentColor, bodyFont, headingFont, textColor }: { memory: any; accentColor: string; bodyFont: string; headingFont: string; textColor?: string }) {
  const [elapsed, setElapsed] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const start = memory.startDate ? new Date(memory.startDate).getTime() : Date.now();
    const tick = () => {
      const diff = Math.max(0, Date.now() - start);
      const totalSecs = Math.floor(diff / 1000);
      setElapsed({
        days:    Math.floor(totalSecs / 86400),
        hours:   Math.floor((totalSecs % 86400) / 3600),
        minutes: Math.floor((totalSecs % 3600) / 60),
        seconds: totalSecs % 60,
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [memory.startDate]);

  const pad = (n: number) => String(n).padStart(2, "0");

  const context = useContext(TemplateContext);
  const isInstagram = context?.isInstagram ?? false;

  return (
    <motion.div
      initial={isInstagram ? "visible" : "hidden"} whileInView="visible" viewport={{ once: true, margin: "-20px" }}
      variants={fadeUp}
      style={{
        display: "flex", flexDirection: "column", alignItems: "center", gap: "20px",
        padding: "36px 24px", border: `1px solid ${accentColor}22`,
        background: "rgba(255,255,255,0.02)", borderRadius: "4px", textAlign: "center",
      }}
    >
      {memory.label && (
        <div style={{ fontFamily: bodyFont, fontSize: "10px", letterSpacing: "0.4em", textTransform: "uppercase", color: `${accentColor}99` }}>
          {memory.label}
        </div>
      )}
      {/* Sayı bloğu */}
      <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
        {[
          { val: elapsed.days,    unit: "Gün" },
          { val: elapsed.hours,   unit: "Saat" },
          { val: elapsed.minutes, unit: "Dakika" },
          { val: elapsed.seconds, unit: "Saniye" },
        ].map(({ val, unit }, i) => (
          <div key={unit} style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", minWidth: "48px" }}>
              <motion.span
                key={val}
                initial={{ opacity: 0.5, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                style={{ fontFamily: headingFont, fontSize: "clamp(2rem, 6vw, 3.2rem)", fontWeight: 400, color: accentColor, lineHeight: 1 }}
              >
                {pad(val)}
              </motion.span>
              <span style={{ fontFamily: bodyFont, fontSize: "9px", letterSpacing: "0.3em", textTransform: "uppercase", color: textColor || "rgba(255,255,255,0.35)", marginTop: "6px" }}>{unit}</span>
            </div>
            {i < 3 && <span style={{ color: `${accentColor}55`, fontSize: "1.5rem", fontFamily: headingFont, marginTop: "-12px" }}>·</span>}
          </div>
        ))}
      </div>
      {memory.description && (
        <p style={{ fontFamily: bodyFont, fontSize: "0.8rem", color: textColor || "rgba(255,255,255,0.45)", lineHeight: 1.8, maxWidth: "280px" }}>{memory.description}</p>
      )}
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ❓  ANKET / OYUN BİLEŞENİ
// ─────────────────────────────────────────────────────────────────────────────
function QuizBlock({ memory, accentColor, bodyFont, headingFont, pageSlug, textColor }: { memory: any; accentColor: string; bodyFont: string; headingFont: string; pageSlug?: string; textColor?: string }) {
  const [selected, setSelected] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handleSelect = async (option: string) => {
    if (selected === option) return;
    setSelected(option);
    setSaving(true);
    try {
      await fetch("/api/quiz-answers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pageSlug: pageSlug ?? window.location.pathname.replace("/", ""),
          componentId: memory.id,
          question: memory.question,
          selectedOption: option,
        }),
      });
    } catch { /* noop */ } finally {
      setSaving(false);
    }
  };

  const options: string[] = Array.isArray(memory.options) ? memory.options : [];

  const context = useContext(TemplateContext);
  const isInstagram = context?.isInstagram ?? false;

  return (
    <motion.div
      initial={isInstagram ? "visible" : "hidden"} whileInView="visible" viewport={{ once: true, margin: "-20px" }}
      variants={stagger}
      style={{ display: "flex", flexDirection: "column", gap: "20px", padding: "32px 24px", border: `1px solid ${accentColor}22`, background: "rgba(255,255,255,0.02)", borderRadius: "4px" }}
    >
      {/* Soru */}
      <motion.div variants={fadeUp} style={{ display: "flex", flexDirection: "column", gap: "8px", textAlign: "center" }}>
        <span style={{ fontFamily: bodyFont, fontSize: "9px", letterSpacing: "0.4em", textTransform: "uppercase", color: `${accentColor}77` }}>
          Bana Sor
        </span>
        <h3 style={{ fontFamily: headingFont, fontSize: "clamp(1.3rem, 4vw, 1.9rem)", fontWeight: 400, color: textColor || "#fff", lineHeight: 1.3, letterSpacing: "0.01em" }}>
          {memory.question || "Soru henüz eklenmedi"}
        </h3>
      </motion.div>

      {/* Seçenekler */}
      <motion.div variants={stagger} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {options.map((opt, i) => {
          const isSelected = selected === opt;
          return (
            <motion.button
              key={i}
              variants={fadeUp}
              type="button"
              onClick={() => handleSelect(opt)}
              disabled={saving}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              style={{
                padding: "14px 20px", border: `1px solid ${isSelected ? accentColor : `${accentColor}33`}`,
                borderRadius: "4px", background: isSelected ? `${accentColor}18` : "transparent",
                color: isSelected ? accentColor : (textColor || "rgba(255,255,255,0.65)"),
                fontFamily: bodyFont, fontSize: "0.9rem", textAlign: "left",
                cursor: saving ? "default" : "pointer",
                transition: "all 0.2s ease",
                display: "flex", alignItems: "center", gap: "12px",
              }}
            >
              <span style={{
                width: "22px", height: "22px", borderRadius: "50%", flexShrink: 0,
                border: `1px solid ${isSelected ? accentColor : `${accentColor}44`}`,
                background: isSelected ? accentColor : "transparent",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "11px", color: isSelected ? "#000" : `${accentColor}88`,
                transition: "all 0.2s",
              }}>
                {isSelected ? "✓" : String.fromCharCode(65 + i)}
              </span>
              {opt}
            </motion.button>
          );
        })}
      </motion.div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ✉  MEKTUP (ZARF) BİLEŞENİ
// ─────────────────────────────────────────────────────────────────────────────
function LetterBlock({ memory, accentColor, bodyFont, headingFont }: { memory: any; accentColor: string; bodyFont: string; headingFont: string }) {
  const [isOpen, setIsOpen] = useState(false);

  const context = useContext(TemplateContext);
  const isInstagram = context?.isInstagram ?? false;

  return (
    <motion.div
      initial={isInstagram ? "visible" : "hidden"} whileInView="visible" viewport={{ once: true, margin: "-20px" }}
      variants={fadeUp}
      style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0px" }}
    >
      {/* Zarf */}
      <div
        style={{ position: "relative", width: "260px", cursor: "pointer", userSelect: "none" }}
        onClick={() => setIsOpen((o) => !o)}
      >
        {/* Zarf gövdesi */}
        <div style={{
          width: "100%", paddingBottom: "65%", position: "relative",
          background: `linear-gradient(160deg, ${accentColor}18 0%, rgba(255,255,255,0.04) 100%)`,
          border: `1px solid ${accentColor}44`, borderRadius: "4px 4px 0 0",
          boxShadow: `0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px ${accentColor}11`,
          overflow: "hidden",
        }}>
          {/* Zarf ortası mühür */}
          <div style={{
            position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <motion.div
              animate={isOpen ? { scale: 0.8, opacity: 0 } : { scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
              style={{
                width: "40px", height: "40px", borderRadius: "50%",
                border: `1px solid ${accentColor}66`, display: "flex", alignItems: "center", justifyContent: "center",
                background: `${accentColor}12`,
              }}
            >
              <Heart size={16} fill={accentColor} stroke="none" />
            </motion.div>
          </div>
          {/* Zarf kapak üçgeni */}
          <motion.div
            animate={isOpen ? { rotateX: 180, zIndex: 2 } : { rotateX: 0, zIndex: 0 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            style={{
              position: "absolute", top: 0, left: 0, right: 0,
              height: "50%", transformOrigin: "top center", perspective: 400,
              background: `linear-gradient(to bottom, ${accentColor}22 0%, ${accentColor}08 100%)`,
              borderBottom: `1px solid ${accentColor}33`,
              clipPath: "polygon(0 0, 100% 0, 50% 100%)",
            }}
          />
        </div>

        {/* Zarf alt kısım */}
        <div style={{
          background: `linear-gradient(to bottom, ${accentColor}11, rgba(255,255,255,0.02))`,
          border: `1px solid ${accentColor}44`, borderTop: "none", borderRadius: "0 0 4px 4px",
          padding: "10px 16px", display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <span style={{ fontFamily: bodyFont, fontSize: "9px", letterSpacing: "0.3em", textTransform: "uppercase", color: `${accentColor}88` }}>
            {memory.senderName || "Senden"}
          </span>
          <motion.span
            animate={isOpen ? { rotate: 180 } : { rotate: 0 }}
            transition={{ duration: 0.3 }}
            style={{ color: `${accentColor}88`, fontSize: "12px" }}
          >
            ▾
          </motion.span>
        </div>
      </div>

      {/* Mektup içeriği */}
      <motion.div
        initial={false}
        animate={isOpen ? { height: "auto", opacity: 1, y: 0 } : { height: 0, opacity: 0, y: -8 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        style={{ width: "260px", overflow: "hidden" }}
      >
        <div style={{
          background: "#f5f0e8", padding: "28px 24px 32px",
          borderRadius: "0 0 4px 4px", border: `1px solid ${accentColor}22`, borderTop: "none",
        }}>
          {/* Çizgili kağıt efekti */}
          <div style={{
            backgroundImage: "repeating-linear-gradient(transparent, transparent 23px, rgba(0,0,0,0.08) 24px)",
            padding: "4px 0",
          }}>
            {memory.title && (
              <div style={{ fontFamily: headingFont, fontSize: "1.2rem", color: "#2a1a0f", marginBottom: "12px", fontStyle: "italic" }}>
                {memory.title}
              </div>
            )}
            <p style={{ fontFamily: "'Lato', sans-serif", fontSize: "0.85rem", color: "#3a2a1f", lineHeight: "24px", whiteSpace: "pre-wrap" }}>
              {memory.content || memory.description || "..."}
            </p>
            {memory.senderName && (
              <div style={{ fontFamily: headingFont, fontSize: "1rem", color: "#5a3a2f", marginTop: "20px", textAlign: "right", fontStyle: "italic" }}>
                — {memory.senderName}
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Tıkla butonu ipucu */}
      {!isOpen && (
        <motion.p
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
          style={{ fontFamily: bodyFont, fontSize: "9px", letterSpacing: "0.3em", textTransform: "uppercase", color: `${accentColor}55`, marginTop: "12px" }}
        >
          Zarfı Aç ↑
        </motion.p>
      )}
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 📸  CONTEXT
// ─────────────────────────────────────────────────────────────────────────────
const TemplateContext = createContext<{ config: TemplateConfig; memories: typeof defaultMemories; isInstagram: boolean } | null>(null);

// ─────────────────────────────────────────────────────────────────────────────
// 📸  PLAIN KART (sablon-bos orijinal stili)
// ─────────────────────────────────────────────────────────────────────────────
function PlainMemoryCard({ memory, accentColor, headingFont, bodyFont, textColor }: { memory: any; accentColor: string; headingFont: string; bodyFont: string; textColor: string }) {
  const context = useContext(TemplateContext);
  const config = context?.config;
  const borderRadiusStyle = config?.roundCornersEnabled ? `${config.photoBorderRadius ?? 12}px` : "0px";

  const dColor = memory.dateColor || textColor || accentColor;
  const tColor = memory.titleColor || textColor || accentColor;
  const descColor = memory.descriptionColor || textColor || accentColor;

  const borderStyle = config?.photoBorderEnabled !== false
    ? `1px solid ${config?.photoBorderColor || `${accentColor}22`}`
    : "none";

  const videoBorderStyle = config?.photoBorderEnabled !== false
    ? `1px solid ${config?.photoBorderColor || "rgba(255,255,255,0.05)"}`
    : "none";

  const mediaContent = (
    <div style={{ position: "relative", overflow: "hidden", borderRadius: borderRadiusStyle, background: "#111113", border: borderStyle, width: "100%" }}>
      {memory.video ? (
        <VideoPlayerPro src={memory.video} style={{ border: videoBorderStyle }} />
      ) : (
        <>
          <img src={memory.image} alt={memory.title} loading="lazy" draggable={false} className="w-full h-auto block" style={{ borderRadius: borderRadiusStyle, pointerEvents: "none", userSelect: "none", WebkitUserSelect: "none" }} />
          <div style={{ position: "absolute", inset: 0, borderRadius: borderRadiusStyle, background: "linear-gradient(to bottom, transparent 55%, rgba(10,10,12,0.35) 100%)", pointerEvents: "none" }} />
        </>
      )}
    </div>
  );

  const isInstagram = context?.isInstagram ?? false;

  return (
    <motion.div initial={isInstagram ? "visible" : "hidden"} whileInView="visible" viewport={{ once: true, margin: "-20px" }} variants={stagger} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "28px" }}>
      <motion.div variants={fadeUp} style={{ width: "100%", position: "relative" }}>
        <div style={{ position: "absolute", inset: 0, borderRadius: "2px", background: accentColor, filter: "blur(24px)", opacity: 0.06, pointerEvents: "none" }} />
        {memory.backlightEnabled ? (
          <Backlight blur={memory.backlightBlur ?? 35} className="w-full" imageUrl={memory.image} style={{ "--backlight-color": `${accentColor}a0` } as any}>
            {mediaContent}
          </Backlight>
        ) : (
          mediaContent
        )}
      </motion.div>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", maxWidth: "320px", gap: "12px" }}>
        <motion.div variants={fadeIn} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ width: "28px", height: "1px", background: `${accentColor}55` }} />
          <span style={{ fontFamily: bodyFont, fontSize: "9px", color: dColor, letterSpacing: "0.3em", textTransform: "uppercase" }}>{memory.date}</span>
          <div style={{ width: "28px", height: "1px", background: `${accentColor}55` }} />
        </motion.div>
        <motion.h3 variants={fadeUp} style={{ fontFamily: headingFont, fontSize: "clamp(1.55rem, 3vw, 2.1rem)", fontWeight: 400, color: tColor, lineHeight: 1.2, letterSpacing: "0.02em" }}>{memory.title}</motion.h3>
        <motion.p variants={fadeUp} style={{ fontFamily: bodyFont, fontSize: "0.875rem", color: descColor, opacity: 0.85, lineHeight: 1.85, fontWeight: 300 }}>{memory.description}</motion.p>
        <motion.div variants={fadeIn} style={{ width: "20px", height: "1px", background: `${accentColor}44` }} />
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 📸  POLAROİD KART
// ─────────────────────────────────────────────────────────────────────────────
function PolaroidMemoryCard({ memory, accentColor, headingFont, bodyFont, tiltEnabled, textColor }: { memory: any; accentColor: string; headingFont: string; bodyFont: string; tiltEnabled: boolean; textColor: string }) {
  const context = useContext(TemplateContext);
  const config = context?.config;
  const borderRadiusStyle = config?.roundCornersEnabled ? `${config.photoBorderRadius ?? 12}px` : "0px";

  const rotateDeg = tiltEnabled ? (memory.rotate ?? 0) : 0;
  const dColor = memory.dateColor || textColor || accentColor;
  const tColor = memory.titleColor || textColor || accentColor;
  const descColor = memory.descriptionColor || textColor || accentColor;

  const polaroidCardBorder = config?.photoBorderEnabled !== false
    ? `1px solid ${config?.photoBorderColor || `${accentColor}33`}`
    : "none";

  const videoBorderStyle = config?.photoBorderEnabled !== false
    ? `1px solid ${config?.photoBorderColor || "rgba(255,255,255,0.05)"}`
    : "none";

  const mediaContent = (
    <div style={{ overflow: "hidden", position: "relative", borderRadius: borderRadiusStyle, width: "100%" }}>
      {memory.video ? (
        <VideoPlayerPro src={memory.video} style={{ border: videoBorderStyle }} />
      ) : (
        <>
          <img src={memory.image} alt={memory.title} loading="lazy" draggable={false} style={{ width: "100%", display: "block", borderRadius: borderRadiusStyle, filter: "brightness(0.92) contrast(1.02) saturate(0.95)", pointerEvents: "none", userSelect: "none", WebkitUserSelect: "none" }} />
          <div style={{ position: "absolute", inset: 0, borderRadius: borderRadiusStyle, background: "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.25) 100%)", pointerEvents: "none" }} />
        </>
      )}
    </div>
  );

  const isInstagram = context?.isInstagram ?? false;

  return (
    <motion.div initial={isInstagram ? "visible" : "hidden"} whileInView="visible" viewport={{ once: true, margin: "-20px" }} variants={stagger} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "20px" }}>
      <motion.div
        variants={fadeUp}
        whileHover={{ scale: 1.02 }}
        style={{
          transform: `rotate(${rotateDeg}deg)`,
          background: "#ffffff", padding: "10px 10px 44px 10px",
          border: polaroidCardBorder,
          boxShadow: "0 16px 40px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.02)",
          width: "100%", maxWidth: "290px", position: "relative", borderRadius: "2px",
          transition: "transform 0.3s ease",
        }}
      >
              {/* Bant dekal */}
              <div style={{ position: "absolute", top: "-8px", left: "50%", transform: "translateX(-50%) rotate(2deg)", width: "44px", height: "18px", background: `${accentColor}33`, border: `1px solid ${accentColor}22`, boxShadow: "0 2px 8px rgba(0,0,0,0.3)", backdropFilter: "blur(1px)", borderRadius: "1px" }} />
              {memory.backlightEnabled ? (
                <Backlight blur={memory.backlightBlur ?? 30} className="w-full" imageUrl={memory.image} style={{ "--backlight-color": `${accentColor}a0` } as any}>
                  {mediaContent}
                </Backlight>
              ) : (
                mediaContent
              )}
        <div style={{ paddingTop: "14px", paddingLeft: "6px" }}>
          <div style={{ fontFamily: headingFont, fontSize: "22px", color: tColor, lineHeight: 1.2 }}>
            {memory.caption || memory.title}
          </div>
          <div style={{ fontFamily: bodyFont, fontSize: "8px", color: dColor, opacity: 0.8, letterSpacing: "0.2em", marginTop: "5px", textTransform: "uppercase" }}>{memory.date}</div>
        </div>
      </motion.div>
      {memory.description && (
        <motion.div variants={stagger} style={{ textAlign: "center", display: "flex", flexDirection: "column", gap: "8px", maxWidth: "280px" }}>
          <motion.p variants={fadeUp} style={{ fontFamily: bodyFont, fontSize: "0.85rem", color: descColor, opacity: 0.85, lineHeight: 1.8 }}>{memory.description}</motion.p>
        </motion.div>
      )}
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 🎬  SİNEMATİK KART
// ─────────────────────────────────────────────────────────────────────────────
function CinematicMemoryCard({ memory, accentColor, headingFont, bodyFont, textColor }: { memory: any; accentColor: string; headingFont: string; bodyFont: string; textColor: string }) {
  const context = useContext(TemplateContext);
  const config = context?.config;
  const borderRadiusStyle = config?.roundCornersEnabled ? `${config.photoBorderRadius ?? 12}px` : "4px"; // defaults to 4px in cinematic

  const dColor = memory.dateColor || textColor || accentColor;
  const tColor = memory.titleColor || textColor || accentColor;
  const descColor = memory.descriptionColor || textColor || accentColor;
  const videoBorderStyle = config?.photoBorderEnabled !== false
    ? `1px solid ${config?.photoBorderColor || "rgba(255,255,255,0.05)"}`
    : "none";

  const mediaContent = (
    <div style={{ position: "relative", overflow: "hidden", borderRadius: borderRadiusStyle }}>
      {memory.video ? (
        <VideoPlayerPro src={memory.video} style={{ border: videoBorderStyle }} />
      ) : (
        <>
          <img src={memory.image} alt={memory.title} loading="lazy" draggable={false} style={{ width: "100%", display: "block", borderRadius: borderRadiusStyle, filter: "contrast(1.08) saturate(0.85)", pointerEvents: "none", userSelect: "none", WebkitUserSelect: "none" }} />
          <div style={{ position: "absolute", inset: 0, borderRadius: borderRadiusStyle, background: `linear-gradient(to bottom, transparent 40%, ${accentColor}22 70%, rgba(0,0,0,0.75) 100%)`, pointerEvents: "none" }} />
          {/* Sinema şeridi */}
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "6px", background: "repeating-linear-gradient(90deg, transparent, transparent 8px, rgba(0,0,0,0.7) 8px, rgba(0,0,0,0.7) 10px)" }} />
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "6px", background: "repeating-linear-gradient(90deg, transparent, transparent 8px, rgba(0,0,0,0.7) 8px, rgba(0,0,0,0.7) 10px)" }} />
          <div style={{ position: "absolute", bottom: "14px", left: "14px", right: "14px" }}>
            <div style={{ fontFamily: bodyFont, fontSize: "8px", color: dColor, letterSpacing: "0.3em", textTransform: "uppercase", marginBottom: "4px" }}>{memory.date}</div>
            <div style={{ fontFamily: headingFont, fontSize: "1.4rem", color: tColor, lineHeight: 1.2 }}>{memory.title}</div>
          </div>
        </>
      )}
    </div>
  );

  const isInstagram = context?.isInstagram ?? false;

  return (
    <motion.div initial={isInstagram ? "visible" : "hidden"} whileInView="visible" viewport={{ once: true, margin: "-20px" }} variants={stagger} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <motion.div variants={fadeUp} style={{ position: "relative" }}>
        {memory.backlightEnabled ? (
          <Backlight blur={memory.backlightBlur ?? 35} className="w-full" imageUrl={memory.image} style={{ "--backlight-color": `${accentColor}a0` } as any}>
            {mediaContent}
          </Backlight>
        ) : (
          mediaContent
        )}
      </motion.div>
      {memory.description && (
        <motion.p variants={fadeUp} style={{ fontFamily: bodyFont, fontSize: "0.85rem", color: descColor, opacity: 0.85, lineHeight: 1.8, paddingLeft: "4px", borderLeft: `2px solid ${accentColor}55` }}>
          {memory.description}
        </motion.p>
      )}
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 👑  ANA COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export default function BosTemplate({
  config: propConfig,
  memories: propMemories,
  pageSlug,
}: {
  config?: Partial<TemplateConfig>;
  memories?: Array<typeof defaultMemories[0] & { video?: string; caption?: string }>;
  pageSlug?: string;
} = {}) {
  const [config, setConfig] = useState<TemplateConfig>({ ...defaultConfig, ...(propConfig ?? {}) });
  const [memories, setMemories] = useState(propMemories ?? defaultMemories);
  const [isInstagram, setIsInstagram] = useState(false);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    if (typeof navigator !== "undefined") {
      const isInsta = /instagram/i.test(navigator.userAgent);
      setIsInstagram(isInsta);
      const dismissed = sessionStorage.getItem("insta_banner_dismissed");
      if (isInsta && dismissed !== "true") {
        setShowBanner(true);
      }
    }
    if (typeof window !== "undefined") {
      const search = new URLSearchParams(window.location.search);
      
      // Inject Eruda mobile console dynamically if ?debug=true is present
      if (search.get("debug") === "true") {
        const script = document.createElement("script");
        script.src = "https://cdn.jsdelivr.net/npm/eruda";
        script.onload = () => {
          (window as any).eruda.init();
        };
        document.body.appendChild(script);
      }

      if (search.get("preview") === "true") {
        const c = search.get("config");
        const m = search.get("memories");
        if (c) {
          try { setConfig(prev => ({ ...prev, ...JSON.parse(decodeURIComponent(c)) })); } catch {}
        }
        if (m) {
          try { setMemories(JSON.parse(decodeURIComponent(m))); } catch {}
        }
      }
    }
  }, []);

  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  // Giriş ekranı — entrance animasyonu aktifse başta göster
  const [entranceVisible, setEntranceVisible] = useState(() => {
    if (typeof window === "undefined") return false;
    const search = new URLSearchParams(window.location.search);
    if (search.get("preview") === "true") return false; // önizlemede entrance yok
    const isEnabled = propConfig?.entranceEnabled ?? defaultConfig.entranceEnabled;
    return Boolean(isEnabled);
  });

  // Entrance özelliği config'den okunuyor; config değiştiğinde senkronize et
  useEffect(() => {
    if (typeof window !== "undefined") {
      const search = new URLSearchParams(window.location.search);
      if (search.get("preview") === "true") {
        setEntranceVisible(false);
        return;
      }
    }
    setEntranceVisible(Boolean(config.entranceEnabled));
  }, [config.entranceEnabled]);

  const handleEnter = () => {
    setEntranceVisible(false);
    // Müziği entrance tıklamasında başlat (autoplay politikası gereği)
    if (audioRef.current && config.musicWidgetEnabled) {
      audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  useEffect(() => {
    if (audioRef.current) audioRef.current.pause();
    if (config.musicUrl && config.musicWidgetEnabled) {
      audioRef.current = new Audio(config.musicUrl);
      audioRef.current.loop = true;
      // Entrance aktifse müzik otomatik başlamasın — handleEnter beklesin
      if (!config.entranceEnabled) {
        const playAudio = () => {
          if (audioRef.current) {
            audioRef.current.play().then(() => { setIsPlaying(true); removeListeners(); }).catch(() => {});
          }
        };
        const removeListeners = () => {
          window.removeEventListener("click", playAudio);
          window.removeEventListener("touchstart", playAudio);
          window.removeEventListener("scroll", playAudio);
        };
        playAudio();
        window.addEventListener("click", playAudio);
        window.addEventListener("touchstart", playAudio);
        window.addEventListener("scroll", playAudio);
        return () => { removeListeners(); audioRef.current?.pause(); };
      } else {
        // Entrance aktif — müzik handleEnter'da başlayacak
        return () => { audioRef.current?.pause(); };
      }
    }
  }, [config.musicUrl, config.musicWidgetEnabled, config.entranceEnabled]);

  const toggleMusic = () => {
    if (!audioRef.current) return;
    if (isPlaying) { audioRef.current.pause(); setIsPlaying(false); }
    else { audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {}); }
  };

  const ac = config.accentColor;
  const pc = (config.particlesColor && config.particlesColor.length > 2) ? config.particlesColor : ac; // partikül rengi
  const hFont = HEADING_FONT[config.headingFont] ?? HEADING_FONT.cormorant;
  const bFont = BODY_FONT[config.bodyFont] ?? BODY_FONT.inter;

  const renderParticles = () => {
    if (!config.particlesEnabled || config.particlesType === "none") return null;
    const density = config.particlesDensity ?? 20;
    if (config.particlesType === "rose-petals") return <RosePetalsCanvas accentColor={pc} density={density} />;
    if (config.particlesType === "stars") return <StarsCanvas accentColor={pc} density={density} />;
    return <HeartsCanvas accentColor={pc} density={density} />;
  };

  const renderMemoryCard = (memory: any, i: number) => {
    const type: string = memory.type ?? "photo";
    const txtColor = config.textColor || "";

    // Yeni bileşen tipleri
    if (type === "countdown") {
      return <CountdownBlock key={memory.id ?? i} memory={memory} accentColor={ac} headingFont={hFont} bodyFont={bFont} textColor={txtColor} />;
    }
    if (type === "quiz") {
      return <QuizBlock key={memory.id ?? i} memory={memory} accentColor={ac} headingFont={hFont} bodyFont={bFont} pageSlug={pageSlug} textColor={txtColor} />;
    }
    if (type === "letter") {
      return <LetterBlock key={memory.id ?? i} memory={memory} accentColor={ac} headingFont={hFont} bodyFont={bFont} />;
    }

    // Klasik fotoğraf/video kartları
    if (config.memoryCardStyle === "polaroid") {
      return <PolaroidMemoryCard key={memory.id} memory={memory} accentColor={ac} headingFont={hFont} bodyFont={bFont} tiltEnabled={config.polaroidTilt} textColor={txtColor} />;
    }
    if (config.memoryCardStyle === "cinematic") {
      return <CinematicMemoryCard key={memory.id} memory={memory} accentColor={ac} headingFont={hFont} bodyFont={bFont} textColor={txtColor} />;
    }
    return <PlainMemoryCard key={memory.id} memory={memory} accentColor={ac} headingFont={hFont} bodyFont={bFont} textColor={txtColor} />;
  };

  const isArcade = hFont.includes("Press Start") || hFont.includes("VT323") || bFont.includes("Press Start") || bFont.includes("VT323");

  return (
    <TemplateContext.Provider value={{ config, memories, isInstagram }}>
      {/* ── GİRİŞ ANİMASYONU ─────────────────────────────────────────────── */}
      <AnimatePresence>
        {entranceVisible && (
          <motion.div
            key="entrance"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
            style={{ position: "fixed", inset: 0, zIndex: 9999 }}
          >
            <EntranceScreen
              type={config.entranceType ?? "curtain"}
              accentColor={config.accentColor}
              coupleNames={config.coupleNames}
              onEnter={handleEnter}
              lang={config.lang}
            />
          </motion.div>
        )}
      </AnimatePresence>
      {/* Google Fonts Import for retro arcade */}
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&family=VT323&display=swap');
        @keyframes scanMove {
          0% { background-position: 0 0; }
          100% { background-position: 0 32px; }
        }
      ` }} />

      <main className="min-h-screen overflow-x-hidden" style={{ background: config.bgColor ?? "#09090b", color: isArcade ? ac : "#FFFFFF", fontFamily: bFont, position: "relative" }}>
        {/* Banner */}
        <AnimatePresence>
          {showBanner && (
            <motion.div
              initial={{ y: -100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -100, opacity: 0 }}
              transition={{ type: "spring", stiffness: 120, damping: 20 }}
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                zIndex: 100,
                background: "rgba(201, 168, 76, 0.12)",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
                borderBottom: "1px solid rgba(201, 168, 76, 0.3)",
                boxShadow: "0 10px 30px rgba(0, 0, 0, 0.5), 0 0 15px rgba(201, 168, 76, 0.05)",
                padding: "14px 20px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "16px",
              }}
            >
              <div style={{ display: "flex", alignItems: "flex-start", gap: "12px", flex: 1 }}>
                <span style={{ fontSize: "18px", lineHeight: "1.2", flexShrink: 0 }}>⚠️</span>
                <p style={{
                  fontFamily: "var(--font-inter), sans-serif",
                  fontSize: "12px",
                  color: "#F0EDE8",
                  lineHeight: "1.5",
                  margin: 0,
                  fontWeight: 450,
                  textAlign: "left"
                }}>
                  <strong style={{ color: "#C9A84C", fontWeight: 600 }}>
                    {config.lang === "en" ? "Instagram May Break the Page!" : "Instagram Görsellerin Yüklenmemesine Sebep Olabilir!"}
                  </strong>{" "}
                  {config.lang === "en"
                    ? "To view templates in full screen and without issues, click the three dots (⋮) in the top right and select 'Open in Browser'."
                    : "Şablonları tam ekran ve sorunsuz incelemek için sağ üstteki üç noktaya (⋮) tıklayıp Tarayıcıda Aç seçeneğini kullanın."}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowBanner(false);
                  sessionStorage.setItem("insta_banner_dismissed", "true");
                }}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "rgba(240, 237, 232, 0.6)",
                  cursor: "pointer",
                  fontSize: "18px",
                  padding: "4px 8px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "color 0.2s",
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = "#C9A84C"}
                onMouseLeave={(e) => e.currentTarget.style.color = "rgba(240, 237, 232, 0.6)"}
              >
                ✕
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Arcade Scanlines */}
        {isArcade && (
          <div className="fixed inset-0 pointer-events-none z-30" style={{ backgroundImage: "repeating-linear-gradient(0deg, rgba(0,0,0,0.12) 0px, rgba(0,0,0,0.12) 1px, transparent 1px, transparent 3px)", animation: "scanMove 8s linear infinite" }} />
        )}

        {/* Arka plan gradient — zIndex 0, partiküller 1'de bunun üzerinde görünür */}
        <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, background: isArcade ? (config.bgColor ?? "#111111") : `radial-gradient(ellipse 80% 55% at 50% -5%, ${ac}22 0%, transparent 60%), radial-gradient(ellipse 60% 45% at 85% 80%, ${ac}0d 0%, transparent 60%), linear-gradient(to bottom, ${config.bgColor ?? "#09090b"}, ${config.bgColor ?? "#09090b"})` }} />


        {/* Partiküller */}
        {renderParticles()}

        {/* Mobil merkez çerçeve */}
        <div className="relative w-full max-w-[480px] mx-auto min-h-screen flex flex-col" style={{ zIndex: 10, borderLeft: `1px solid ${ac}12`, borderRight: `1px solid ${ac}12` }}>
          {isArcade && (
            <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: `linear-gradient(rgba(${hexToRgb(ac)},0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(${hexToRgb(ac)},0.03) 1px, transparent 1px)`, backgroundSize: "32px 32px", zIndex: 0 }} />
          )}

          {/* Müzik Widget */}
          {config.musicWidgetEnabled && config.musicWidgetType !== "hidden" && (
            <MusicWidget isPlaying={isPlaying} toggleMusic={toggleMusic} accentColor={ac} type={config.musicWidgetType} position={config.musicWidgetPosition} isEn={config.lang === "en"} />
          )}

          {/* ── HERO ──────────────────────────────────────────────────────── */}
          <section className="relative flex flex-col items-center justify-center overflow-hidden w-full h-[100svh]">
            <motion.div initial={isInstagram ? "visible" : "hidden"} animate="visible" variants={stagger} className="relative z-20 flex flex-col items-center px-6 text-center">
              {/* Eyebrow: Özel Tarih */}
              <motion.div variants={fadeIn} style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "28px" }}>
                <div style={{ width: "28px", height: "1px", background: `${ac}55` }} />
                <Heart size={9} fill={ac} stroke="none" className="animate-pulse" style={{ opacity: 0.75 }} />
                <span style={{ fontFamily: bFont, fontSize: "9px", letterSpacing: "0.48em", textTransform: "uppercase", color: config.specialDateColor || `${ac}bb` }}>{config.specialDate}</span>
                <Heart size={9} fill={ac} stroke="none" className="animate-pulse" style={{ opacity: 0.75 }} />
                <div style={{ width: "28px", height: "1px", background: `${ac}55` }} />
              </motion.div>

              {/* İsimler */}
              <motion.h1 variants={fadeUp} style={{
                fontFamily: hFont,
                fontSize: getDynamicFontSize(config.coupleNames, 2.5, 4.8, 7),
                fontWeight: 400, lineHeight: 1.2, paddingBottom: "0.1em", letterSpacing: "0.04em",
                backgroundImage: `linear-gradient(160deg, ${config.nameGradientStart || "rgba(255,255,255,0.96)"} 0%, ${config.nameGradientEnd || `${ac}cc`} 100%)`,
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
                whiteSpace: "pre-line",
              }}>
                {config.coupleNames}
              </motion.h1>

              {/* Dekoratif kalp çizgisi */}
              <motion.div variants={fadeIn} style={{ display: "flex", alignItems: "center", gap: "10px", margin: "20px 0" }}>
                <Heart size={6} fill={ac} stroke="none" style={{ opacity: 0.35 }} />
                <Heart size={14} fill={ac} stroke="none" className="animate-pulse" style={{ opacity: 0.9, filter: `drop-shadow(0 0 8px ${ac}bb)` }} />
                <Heart size={6} fill={ac} stroke="none" style={{ opacity: 0.35 }} />
              </motion.div>

              {/* Tagline */}
              <motion.p variants={fadeUp} style={{ fontFamily: bFont, fontSize: "0.78rem", color: config.taglineColor || "rgba(255,255,255,0.5)", letterSpacing: "0.06em", lineHeight: 1.95, maxWidth: "26rem", marginTop: "8px", marginBottom: "40px" }}>
                {config.tagline}
              </motion.p>
            </motion.div>

            {/* Scroll göstergesi */}
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 0.45 }} transition={{ delay: 2.2, duration: 1.5 }}
              style={{ position: "absolute", bottom: "32px", left: "50%", transform: "translateX(-50%)", display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}
            >
              <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}>
                <ChevronDown size={18} style={{ color: config.scrollTextColor || ac }} />
              </motion.div>
              <span style={{ fontFamily: bFont, fontSize: "8px", letterSpacing: "0.38em", textTransform: "uppercase", color: config.scrollTextColor || ac }}>Kaydır</span>
            </motion.div>
          </section>

          {/* ── BÖLÜM BAŞLIĞI ─────────────────────────────────────────────── */}
          {(config.storyTitlePrefix || config.storyTitleSuffix) && (
            <motion.div
              initial={isInstagram ? "visible" : "hidden"} whileInView="visible" viewport={{ once: true, margin: "-20px" }} variants={stagger}
              style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "80px 24px 56px", textAlign: "center", borderTop: `1px solid ${ac}18`, background: config.bgColor ?? "#09090b" }}
            >
              {config.storyTitlePrefix && (
                <motion.span variants={fadeIn} style={{ fontFamily: bFont, fontSize: "9px", letterSpacing: "0.45em", textTransform: "uppercase", color: config.headingEyebrowColor || config.textColor || `${ac}99`, marginBottom: "12px" }}>
                  {config.storyTitlePrefix}
                </motion.span>
              )}
              {config.storyTitleSuffix && (
                <motion.h2 variants={fadeUp} style={{ fontFamily: hFont, fontSize: "clamp(1.8rem, 5vw, 3rem)", fontWeight: 400, color: config.headingTitleColor || config.textColor || ac, letterSpacing: "0.04em", lineHeight: 1.2 }}>
                  {config.storyTitleSuffix}
                </motion.h2>
              )}
              <motion.div variants={fadeIn} style={{ width: "28px", height: "1px", marginTop: "20px", background: `${ac}55` }} />
            </motion.div>
          )}

          {/* ── FOTOĞRAF KARTLARI ──────────────────────────────────────────── */}
          <div style={{
            padding: "16px 20px 64px",
            display: config.memoryCardLayout === "grid" ? "grid" : "flex",
            gridTemplateColumns: config.memoryCardLayout === "grid" ? "1fr 1fr" : undefined,
            flexDirection: config.memoryCardLayout === "grid" ? undefined : "column",
            gap: config.memoryCardLayout === "grid" ? "24px" : "80px",
          }}>
            {memories.map((m, i) => renderMemoryCard(m, i))}
          </div>

          {/* ── FİNAL / EPİLOG ────────────────────────────────────────────── */}
          {config.finalEnabled !== false && (
            <section style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "96px 24px", borderTop: `1px solid ${ac}18`, background: config.bgColor ?? "#09090b", overflow: "hidden" }}>
              <div style={{ position: "absolute", inset: 0, pointerEvents: "none", background: `radial-gradient(circle at 50% 50%, ${ac}14 0%, transparent 70%)` }} />
              <motion.div
                initial={isInstagram ? "visible" : "hidden"} whileInView="visible" viewport={{ once: true, margin: "-20px" }} variants={stagger}
                style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: "20px" }}
              >
                <motion.div variants={fadeUp}>
                  <Heart size={28} fill={ac} stroke="none" className="animate-pulse" style={{ filter: `drop-shadow(0 0 12px ${ac}99)` }} />
                </motion.div>
                <motion.h2 variants={fadeUp} style={{ fontFamily: hFont, fontSize: "clamp(1.8rem, 5vw, 3.5rem)", fontWeight: 400, color: config.finalHeadingColor || config.textColor || "#FFFFFF", letterSpacing: "0.04em", lineHeight: 1.2 }}>
                  {config.finalHeading}
                </motion.h2>
                <motion.div variants={fadeIn} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <Heart size={6} fill={ac} stroke="none" style={{ opacity: 0.35 }} />
                  <Heart size={12} fill={ac} stroke="none" style={{ opacity: 0.85, filter: `drop-shadow(0 0 8px ${ac}cc)` }} />
                  <Heart size={6} fill={ac} stroke="none" style={{ opacity: 0.35 }} />
                </motion.div>
                 <motion.div variants={fadeUp} style={{ fontFamily: bFont, fontSize: "11px", letterSpacing: "0.42em", textTransform: "uppercase", color: config.taglineColor || "rgba(255,255,255,0.6)", whiteSpace: "pre-line", lineHeight: 1.5 }}>
                  {config.coupleNames}
                </motion.div>
                <motion.span variants={fadeIn} style={{ fontFamily: "monospace", fontSize: "9px", color: config.specialDateColor || "rgba(255,255,255,0.25)", letterSpacing: "0.3em", textTransform: "uppercase" }}>
                  {config.specialDate}
                </motion.span>
              </motion.div>
            </section>
          )}

          {/* ── FOOTER ──────────────────────────────────────────────────────── */}
          <footer style={{ padding: "40px 24px", textAlign: "center", fontFamily: bFont, fontSize: "9px", letterSpacing: "0.45em", textTransform: "uppercase", color: "rgba(255,255,255,0.18)", borderTop: `1px solid ${ac}0d` }}>
            birlikteydik.com
          </footer>
        </div>
      </main>
    </TemplateContext.Provider>
  );
}
