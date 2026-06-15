"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Volume2, VolumeX, Heart, Sparkles } from "lucide-react";

// Config Data
const config = {
  coupleNames: "Melis & Demirkan",
  tagline: "Aşkın en sıcak tonunda, kalbimin her atışında saklanan en derin hislerim...",
  accentColor: "#E63946", // Passionate Red
  specialDate: "14 Şubat 2025",
  musicUrl: "/music/romantic.mp3",
};

const memories = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&q=80&w=800",
    title: "Aşkın Rengi ❤️",
    description: "İlk kez bana sımsıcak gülümsediğinde, içimdeki tüm kışların eriyip sıcacık bir bahara dönüştüğü o eşsiz gün.",
    date: "14 Şubat 2025",
    number: "01",
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1494972308805-463bc619d34e?auto=format&fit=crop&q=80&w=800",
    title: "Kalp Atışlarımız",
    description: "Sadece elini tutmak bile kalbimin ritmini hızlandırıp, tüm dünyadaki en mutlu ezgiyi çalıyormuş gibi hissettiriyor.",
    date: "12 Mart 2025",
    number: "02",
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&q=80&w=800",
    title: "Sonsuz Bağımız",
    description: "Her saniye, her nefeste sana olan sevgimin daha da alevlendiğini, bizi ayıramayacak güçlü bir bağa dönüştüğünü biliyorum.",
    date: "25 Nisan 2025",
    number: "03",
  },
];

// Floating Red Heart Particles (HTML Canvas)
type HeartParticle = {
  x: number;
  y: number;
  size: number;
  speed: number;
  opacity: number;
  drift: number;
  phase: number;
};

function FloatingRedHearts() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<HeartParticle[]>([]);
  const rafRef = useRef<number>(0);

  useEffect(() => {
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

    particlesRef.current = Array.from({ length: 25 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      size: Math.random() * 9 + 4,
      speed: Math.random() * 0.35 + 0.15,
      opacity: Math.random() * 0.22 + 0.05,
      drift: (Math.random() - 0.5) * 0.4,
      phase: Math.random() * Math.PI * 2,
    }));

    const drawHeart = (
      cx: number,
      cy: number,
      size: number,
      opacity: number,
      color: string
    ) => {
      ctx.save();
      ctx.globalAlpha = opacity;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(cx, cy + size * 0.3);
      ctx.bezierCurveTo(
        cx, cy, cx - size * 0.7, cy, cx - size * 0.7, cy - size * 0.4
      );
      ctx.bezierCurveTo(
        cx - size * 0.7, cy - size * 1.0, cx, cy - size * 0.9, cx, cy - size * 0.5
      );
      ctx.bezierCurveTo(
        cx, cy - size * 0.9, cx + size * 0.7, cy - size * 1.0, cx + size * 0.7, cy - size * 0.4
      );
      ctx.bezierCurveTo(
        cx + size * 0.7, cy, cx, cy, cx, cy + size * 0.3
      );
      ctx.fill();
      ctx.restore();
    };

    const colors = ["#E63946", "#D62828", "#9B2226", "#F25C54", "#FAF0CA"];
    let t = 0;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      t += 0.006;
      particlesRef.current.forEach((p, i) => {
        p.y -= p.speed;
        p.x += Math.sin(t + p.phase) * p.drift;
        if (p.y < -20) {
          p.y = canvas.height + 10;
          p.x = Math.random() * canvas.width;
        }
        drawHeart(p.x, p.y, p.size, p.opacity, colors[i % colors.length]);
      });
      rafRef.current = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        inset: 0,
        pointerEvents: "none",
        zIndex: 0,
      }}
    />
  );
}

export default function RomanticRedTemplate() {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audioRef.current = new Audio(config.musicUrl);
    audioRef.current.loop = true;
    return () => {
      audioRef.current?.pause();
    };
  }, []);

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
    <main className="bg-[#0B0204] text-[#F9ECEF] min-h-screen overflow-x-hidden font-serif selection:bg-[#E63946]/30">
      
      {/* Red Passionate Ambient lights */}
      <div className="fixed inset-0 pointer-events-none z-0" style={{
        background: `
          radial-gradient(circle 80% 50% at 50% -10%, rgba(230,57,70,0.14) 0%, transparent 60%),
          radial-gradient(circle 70% 60% at 85% 75%, rgba(155,34,38,0.08) 0%, transparent 65%),
          linear-gradient(to bottom, #0B0204 0%, #160408 100%)
        `
      }} />

      {/* Floating red hearts canvas */}
      <FloatingRedHearts />

      {/* Audio toggle button */}
      <div className="fixed top-5 right-5 z-50">
        <button
          onClick={toggleMusic}
          className="w-11 h-11 flex items-center justify-center rounded-full bg-stone-950/80 border border-[#E63946]/30 text-[#E63946] hover:scale-105 transition-all shadow-[0_4px_24px_rgba(0,0,0,0.5)]"
          style={{ boxShadow: isPlaying ? "0 0 15px rgba(230,57,70,0.25)" : "none" }}
        >
          {isPlaying ? <Volume2 size={16} className="animate-pulse" /> : <VolumeX size={16} className="opacity-60" />}
        </button>
      </div>

      {/* HERO SECTION */}
      <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 z-10">
        
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col items-center max-w-3xl"
        >
          <div className="flex items-center gap-4 mb-6 text-[#E63946]">
            <div className="w-8 h-px bg-[#E63946]/30" />
            <Sparkles size={14} className="animate-pulse" />
            <span className="text-[10px] tracking-[0.45em] uppercase font-sans font-medium">{config.specialDate}</span>
            <Sparkles size={14} className="animate-pulse" />
            <div className="w-8 h-px bg-[#E63946]/30" />
          </div>

          <h1 className="text-5xl md:text-8xl font-normal leading-tight tracking-wider text-pink-50 mb-6 font-serif">
            {config.coupleNames}
          </h1>

          <div className="flex items-center gap-3 my-6">
            <Heart size={8} fill="#E63946" stroke="none" className="opacity-40" />
            <Heart size={14} fill="#E63946" stroke="none" className="opacity-90 animate-pulse" />
            <Heart size={8} fill="#E63946" stroke="none" className="opacity-40" />
          </div>

          <p className="text-xs md:text-sm text-pink-200/50 font-sans tracking-widest leading-relaxed max-w-sm">
            {config.tagline}
          </p>

          <button
            onClick={toggleMusic}
            className="mt-12 px-8 py-3 text-[10px] tracking-[0.35em] uppercase border border-[#E63946]/45 text-pink-100 hover:bg-[#E63946]/10 transition-all font-sans bg-transparent"
          >
            {isPlaying ? "MÜZİĞİ KAPAT" : "HİKAYEYİ OYNAT"}
          </button>
        </motion.div>

        {/* Scroll arrow indicator */}
        <div className="absolute bottom-10 flex flex-col items-center gap-3 opacity-60">
          <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 2.2, repeat: Infinity }}>
            <ChevronDown size={18} className="text-[#E63946]" />
          </motion.div>
          <span className="text-[8px] tracking-[0.45em] uppercase text-pink-300/30 font-sans">KAYDIRIN</span>
        </div>
      </section>

      {/* MEMORIES - PASSIONATE ROMANTIC GLOW CARDS */}
      <section className="relative py-28 px-6 max-w-4xl mx-auto z-10">
        <div className="flex flex-col items-center mb-20 text-center">
          <span className="text-[9px] tracking-[0.4em] text-[#E63946] font-semibold uppercase font-sans mb-3">ROMANTİK TEMA</span>
          <h2 className="text-3xl font-light text-[#F9ECEF] tracking-wide font-serif">Aşk Dolu Adımlar</h2>
          <div className="w-10 h-px bg-[#E63946]/30 mt-4" />
        </div>

        <div className="flex flex-col gap-32">
          {memories.map((m, i) => {
            const isEven = i % 2 === 0;
            return (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 35 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
                className={`flex flex-col md:flex-row items-center gap-10 md:gap-16 ${isEven ? "" : "md:flex-row-reverse"}`}
              >
                {/* Widescreen image card with soft red shadow glowing */}
                <div className="relative flex-shrink-0" style={{ width: "100%", maxWidth: "330px" }}>
                  <div className="absolute inset-0 bg-[#E63946] filter blur-[15px] opacity-10 rounded-lg pointer-events-none" />
                  <div className="relative bg-[#160408] p-2 border border-[#E63946]/20 shadow-[0_12px_36px_rgba(0,0,0,0.6)] rounded-lg aspect-[3/4] overflow-hidden">
                    <img 
                      src={m.image} 
                      alt={m.title} 
                      className="w-full h-full object-cover transition-transform duration-1000 hover:scale-103"
                    />
                  </div>
                </div>

                {/* Text Block */}
                <div className="flex flex-col max-w-sm gap-4">
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-[#E63946] tracking-widest font-sans font-medium uppercase">ANILMA {m.number}</span>
                    <div className="w-6 h-px bg-[#E63946]/30" />
                    <span className="text-xs text-pink-300/40 tracking-wider font-sans font-light uppercase">{m.date}</span>
                  </div>

                  <h3 className="text-2xl text-pink-50 font-serif font-light">{m.title}</h3>
                  <p className="text-pink-100/60 font-sans text-sm font-light leading-relaxed">{m.description}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* FINAL GLOW SECTION */}
      <section className="relative py-36 flex flex-col items-center justify-center text-center px-6 z-10 bg-[#060102] border-t border-[#E63946]/10">
        <FloatingRedHearts />
        
        <div className="absolute inset-0 pointer-events-none" style={{
          background: "radial-gradient(circle at 50% 50%, rgba(230,57,70,0.06) 0%, transparent 70%)"
        }} />

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.2 }}
          className="flex flex-col items-center"
        >
          <Heart size={28} fill="#E63946" stroke="none" className="mb-8 animate-pulse text-[#E63946]" />
          <h2 className="text-3xl md:text-5xl text-pink-50 font-serif font-light tracking-wide mb-8">Sonsuz Bir Tutkuyla</h2>
          <div className="flex items-center gap-2 mb-8">
            <Heart size={6} fill="#E63946" stroke="none" className="opacity-40" />
            <Heart size={10} fill="#E63946" stroke="none" className="opacity-80" />
            <Heart size={6} fill="#E63946" stroke="none" className="opacity-40" />
          </div>
          <span className="text-pink-300/50 font-sans tracking-[0.45em] uppercase text-xs">{config.coupleNames}</span>
        </motion.div>
      </section>

      {/* Passionate Red Footer */}
      <footer className="py-12 text-center text-[9px] tracking-[0.45em] text-[#692931] uppercase z-10 relative">
        ROMANTİK RED TEMA — ANILARIMIZ.COM
      </footer>
    </main>
  );
}
