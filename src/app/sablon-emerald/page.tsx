"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { ChevronDown, Volume2, VolumeX, Heart, Sparkles } from "lucide-react";

// Config Data
const config = {
  coupleNames: "Melis & Demirkan",
  tagline: "Karanlık yeşillikler arasında parlayan, en kıymetli altın değerindeki anılarımız...",
  accentColor: "#D4AF37", // Luxury Gold
  specialDate: "2024",
  musicUrl: "/music/emerald.mp3",
};

const memories = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&q=80&w=800",
    title: "Nadir Bir Hazine",
    description: "Tıpkı derin ormanların en kuytusunda saklanan değerli bir zümrüt gibi, hayatıma kattığın en özel değer.",
    date: "Güz 2024",
    number: "I",
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=800",
    title: "Altın Işıltılı Anlar",
    description: "Güneşin batarken gökyüzünü altın sarısına boyadığı, elini ilk kez sımsıkı tuttuğum o muazzam gün.",
    date: "Kış 2024",
    number: "II",
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1469371670807-013ccf25f16a?auto=format&fit=crop&q=80&w=800",
    title: "Sonsuz Yankı",
    description: "Kelimelerin yetersiz kaldığı, sadece nefeslerimizin ve gözlerimizin konuştuğu o lüks ve derin sessizlik.",
    date: "Bahar 2025",
    number: "III",
  },
];

// Gold floating stars representing premium luxury dust
function GoldStardust() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: 20 }).map((_, i) => (
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
            opacity: [0, 0.6, 0],
            scale: [0.8, 1.2, 0.8],
            y: [0, -(Math.random() * 80 + 40)],
          }}
          transition={{
            duration: Math.random() * 6 + 5,
            repeat: Infinity,
            delay: Math.random() * 7,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

export default function EmeraldTemplate() {
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
    <main className="bg-[#03120E] text-[#E5EAE7] min-h-screen overflow-x-hidden font-serif selection:bg-[#D4AF37]/25">
      
      {/* Ambient Radial Lights overlaying Emerald */}
      <div className="fixed inset-0 pointer-events-none z-0" style={{
        background: `
          radial-gradient(circle 80% 50% at 50% -10%, rgba(212,175,55,0.08) 0%, transparent 60%),
          radial-gradient(circle 60% 55% at 85% 80%, rgba(212,175,55,0.05) 0%, transparent 65%),
          linear-gradient(to bottom, #03120E 0%, #061914 100%)
        `
      }} />

      {/* Audio Control */}
      <div className="fixed top-5 right-5 z-50">
        <button
          onClick={toggleMusic}
          className="w-11 h-11 flex items-center justify-center rounded-full bg-[#051712]/90 border border-[#D4AF37]/35 text-[#D4AF37] hover:scale-105 transition-all shadow-[0_4px_24px_rgba(0,0,0,0.6)]"
          style={{ boxShadow: isPlaying ? "0 0 15px rgba(212,175,55,0.25)" : "none" }}
        >
          {isPlaying ? <Volume2 size={16} className="animate-pulse" /> : <VolumeX size={16} className="opacity-60" />}
        </button>
      </div>

      {/* HERO SECTION */}
      <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 z-10">
        <GoldStardust />
        
        {/* Subtle decorative grid lines */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.02] border-x border-[#D4AF37]/20 max-w-6xl mx-auto" />

        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.3, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col items-center max-w-3xl"
        >
          <div className="flex items-center gap-4 mb-7 text-[#D4AF37]/80">
            <div className="w-8 h-px bg-[#D4AF37]/30" />
            <Sparkles size={14} />
            <span className="text-[9px] tracking-[0.5em] uppercase font-sans font-medium">{config.specialDate}</span>
            <Sparkles size={14} />
            <div className="w-8 h-px bg-[#D4AF37]/30" />
          </div>

          <h1 className="text-4xl md:text-7xl font-light leading-tight tracking-wider text-[#FAF5E6] mb-6">
            {config.coupleNames}
          </h1>

          {/* Thin Gold Separator */}
          <div className="flex items-center gap-4 my-6">
            <div className="w-12 h-px bg-gradient-to-r from-transparent to-[#D4AF37]/50" />
            <Heart size={8} fill="#D4AF37" stroke="none" className="opacity-80" />
            <div className="w-12 h-px bg-gradient-to-l from-transparent to-[#D4AF37]/50" />
          </div>

          <p className="text-xs md:text-sm text-[#A8BDB4] font-sans tracking-widest leading-relaxed max-w-sm">
            {config.tagline}
          </p>

          <button
            onClick={toggleMusic}
            className="mt-12 px-8 py-3 text-[10px] tracking-[0.35em] uppercase border border-[#D4AF37]/40 text-[#FAF5E6] hover:bg-[#D4AF37]/10 transition-all font-sans bg-transparent"
          >
            {isPlaying ? "MÜZİĞİ KAPAT" : "HİKAYEYİ OYNAT"}
          </button>
        </motion.div>

        {/* Scroll indicator */}
        <div className="absolute bottom-10 flex flex-col items-center gap-3 opacity-60">
          <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 2.4, repeat: Infinity }}>
            <ChevronDown size={18} className="text-[#D4AF37]" />
          </motion.div>
          <span className="text-[8px] tracking-[0.45em] uppercase text-[#7D9489] font-sans">KAYDIRIN</span>
        </div>
      </section>

      {/* MEMORIES - DUAL GOLD FRAMES */}
      <section className="relative py-28 px-6 max-w-5xl mx-auto z-10">
        <div className="flex flex-col items-center mb-20 text-center">
          <span className="text-[10px] tracking-[0.38em] text-[#D4AF37] font-semibold uppercase font-sans mb-3">ZÜMRÜT SERİSİ</span>
          <h2 className="text-3xl font-light text-[#FAF5E6] tracking-wide font-serif">Kıymetli Hâtıralar</h2>
          <div className="w-8 h-px bg-[#D4AF37]/40 mt-4" />
        </div>

        <div className="flex flex-col gap-36">
          {memories.map((m, i) => {
            const isEven = i % 2 === 0;
            return (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 35 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
                className={`flex flex-col lg:flex-row items-center gap-12 lg:gap-20 ${isEven ? "" : "lg:flex-row-reverse"}`}
              >
                {/* Image Side with gold border outline */}
                <div className="relative flex-shrink-0" style={{ width: "100%", maxWidth: "340px" }}>
                  {/* Decorative gold back frame */}
                  <div className="absolute inset-0 border border-[#D4AF37]/30 translate-x-4 translate-y-4 rounded-sm pointer-events-none" />
                  
                  {/* Real Image container */}
                  <div className="relative bg-[#061C16] p-2 border border-[#D4AF37]/25 shadow-2xl rounded-sm aspect-[3/4] overflow-hidden">
                    <img 
                      src={m.image} 
                      alt={m.title} 
                      className="w-full h-full object-cover grayscale-[10%] contrast-[1.05]"
                    />
                  </div>
                </div>

                {/* Text Side */}
                <div className="flex flex-col max-w-md gap-4 px-4">
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-[#D4AF37] tracking-widest font-sans font-medium uppercase">KAPTISE {m.number}</span>
                    <div className="w-8 h-px bg-[#D4AF37]/20" />
                    <span className="text-xs text-[#7D9489] tracking-wider font-sans font-light uppercase">{m.date}</span>
                  </div>

                  <h3 className="text-3xl text-[#FAF5E6] font-serif font-light">{m.title}</h3>
                  <p className="text-[#A8BDB4] font-sans text-sm font-light leading-relaxed">{m.description}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* FINAL SECTION */}
      <section className="relative py-36 flex flex-col items-center justify-center text-center px-6 z-10 bg-[#020D0A] border-t border-[#D4AF37]/15">
        <GoldStardust />
        
        <div className="absolute inset-0 pointer-events-none" style={{
          background: "radial-gradient(circle at 50% 50%, rgba(212,175,55,0.06) 0%, transparent 70%)"
        }} />

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1.2 }}
          className="flex flex-col items-center"
        >
          <Sparkles size={24} className="text-[#D4AF37] mb-8 animate-pulse" />
          <h2 className="text-3xl md:text-5xl text-[#FAF5E6] font-serif font-light tracking-wide mb-8">Sonsuz Zarafetimizle</h2>
          <div className="flex items-center gap-2 mb-8">
            <Heart size={6} fill="#D4AF37" stroke="none" className="opacity-50" />
            <Heart size={10} fill="#D4AF37" stroke="none" className="opacity-80" />
            <Heart size={6} fill="#D4AF37" stroke="none" className="opacity-50" />
          </div>
          <span className="text-stone-400 font-sans tracking-[0.45em] uppercase text-xs">{config.coupleNames}</span>
        </motion.div>
      </section>

      {/* Luxury Emerald Footer */}
      <footer className="py-12 text-center text-[9px] tracking-[0.45em] text-[#556960] uppercase z-10 relative">
        PREMIUM EMERALD TEMA — ANILARIMIZ.COM
      </footer>
    </main>
  );
}
