"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Volume2, VolumeX, Heart, Play } from "lucide-react";

// Config Data
const config = {
  coupleNames: "Melis & Demirkan",
  tagline: "Bir sevgi belgeseli, başrollerde sadece bizim olduğumuz...",
  accentColor: "#B8A9D4",
  specialDate: "2024 - 2025",
  musicUrl: "/music/cinematic.mp3",
};

const memories = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&q=80&w=800",
    title: "SAHNE I: BEKLENMEDİK KARŞILAŞMA",
    description: "Kaderin kamerası kayda girdiğinde, gözlerimizin buluştuğu o ilk saniye. Hayatımızın dönüm noktası.",
    date: "Ekim 2024",
    number: "01",
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&q=80&w=800",
    title: "SAHNE II: İLK KAHKAHALAR",
    description: "Senaryosuz, tamamen doğaçlama akan, içten gelen en saf mutluluğumuz.",
    date: "Aralık 2024",
    number: "02",
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1494972308805-463bc619d34e?auto=format&fit=crop&q=80&w=800",
    title: "SAHNE III: YOL HİKAYESİ",
    description: "Sonsuz ufuklara doğru sürdüğümüz, arkamızda güzel melodiler bıraktığımız unutulmaz an.",
    date: "Nisan 2025",
    number: "03",
  },
];

export default function CinematicTemplate() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showCurtain, setShowCurtain] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audioRef.current = new Audio(config.musicUrl);
    audioRef.current.loop = true;
    return () => {
      audioRef.current?.pause();
    };
  }, []);

  const handleStartMovie = () => {
    setShowCurtain(false);
    if (audioRef.current) {
      audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

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
    <main className="bg-[#050505] text-[#ECE9E6] min-h-screen overflow-x-hidden font-sans selection:bg-[#B8A9D4]/20">
      
      {/* Dynamic Movie Theater Curtain Intro Screen */}
      <AnimatePresence>
        {showCurtain && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ y: "-100%", opacity: 0 }}
            transition={{ duration: 1.2, ease: [0.77, 0, 0.175, 1] }}
            className="fixed inset-0 z-50 bg-[#000000] flex flex-col items-center justify-center text-center px-6"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="flex flex-col items-center gap-6"
            >
              <span className="text-[10px] tracking-[0.55em] text-[#B8A9D4] uppercase font-light">ANILARIMIZ GURURLA SUNAR</span>
              <h2 className="text-4xl md:text-6xl font-serif text-[#F0EDE8] font-light leading-none tracking-widest uppercase">
                {config.coupleNames}
              </h2>
              <div className="w-16 h-px bg-stone-800 my-2" />
              <p className="text-[11px] tracking-widest text-stone-500 max-w-sm uppercase leading-relaxed">
                Bir Sevgi Belgeseli
              </p>
              
              <button
                onClick={handleStartMovie}
                className="mt-8 w-14 h-14 flex items-center justify-center rounded-full border border-stone-800 bg-[#080808] text-[#B8A9D4] hover:scale-105 hover:bg-stone-900 transition-all shadow-md group"
              >
                <Play size={18} fill="currentColor" className="ml-1 group-hover:scale-110 transition-transform" />
              </button>
              <span className="text-[9px] tracking-widest text-stone-600 uppercase">FİLME GİRİŞ YAPIN</span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Audio Trigger */}
      <div className="fixed top-5 right-5 z-40">
        <button
          onClick={toggleMusic}
          className="w-11 h-11 flex items-center justify-center rounded-full bg-black/75 border border-[#B8A9D4]/20 text-[#B8A9D4] hover:scale-105 transition-all shadow-[0_4px_24px_rgba(0,0,0,0.5)]"
          style={{ boxShadow: isPlaying ? "0 0 15px rgba(184,169,212,0.2)" : "none" }}
        >
          {isPlaying ? <Volume2 size={16} className="animate-pulse" /> : <VolumeX size={16} className="opacity-60" />}
        </button>
      </div>

      {/* HERO SECTION */}
      <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 z-10">
        <div className="absolute inset-0 pointer-events-none opacity-20 bg-cover bg-center mix-blend-overlay" style={{
          backgroundImage: `url("https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&q=80&w=1200")`,
          filter: "blur(4px) brightness(0.4)"
        }} />

        {/* Ambient glow */}
        <div className="absolute inset-0 pointer-events-none" style={{
          background: `
            radial-gradient(circle 80% 50% at 50% 50%, rgba(184,169,212,0.08) 0%, transparent 60%),
            linear-gradient(to bottom, transparent 60%, #050505 100%)
          `
        }} />

        <div className="relative z-10 max-w-4xl flex flex-col items-center">
          <span className="text-[10px] tracking-[0.5em] text-[#B8A9D4] uppercase font-light mb-6">A LOVE FILM BY US</span>
          <h1 className="text-5xl md:text-8xl font-serif font-light text-[#F5F5F3] leading-none tracking-widest mb-6">
            {config.coupleNames}
          </h1>
          <div className="w-16 h-px bg-[#B8A9D4]/40 my-6" />
          <p className="text-xs md:text-sm tracking-[0.2em] text-stone-400 font-light max-w-md uppercase leading-relaxed">
            {config.tagline}
          </p>
        </div>

        {/* Scroll Ok */}
        <div className="absolute bottom-8 flex flex-col items-center gap-2 opacity-45">
          <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 2.2, repeat: Infinity }}>
            <ChevronDown size={18} className="text-[#B8A9D4]" />
          </motion.div>
          <span className="text-[8px] tracking-[0.3em] uppercase text-stone-500">AŞAĞI KAYDIR</span>
        </div>
      </section>

      {/* FILM SCENE SECTION */}
      <section className="relative py-24 px-6 max-w-5xl mx-auto z-10">
        <div className="flex flex-col gap-32">
          {memories.map((m, i) => {
            const isEven = i % 2 === 0;
            return (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 35 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                className="flex flex-col gap-6"
              >
                {/* Widescreen Theater aspect image frame with black margins */}
                <div className="bg-[#000] p-2 border border-stone-900 shadow-[0_25px_60px_rgba(0,0,0,0.8)] overflow-hidden rounded-sm relative aspect-[21/9]">
                  <div className="absolute top-2 left-4 text-[9px] tracking-widest text-[#B8A9D4]/50 z-20 font-mono">SCENE #{m.number}</div>
                  <div className="absolute top-2 right-4 text-[9px] tracking-widest text-stone-600 z-20 font-mono">REC ●</div>
                  <img 
                    src={m.image} 
                    alt={m.title} 
                    className="w-full h-full object-cover opacity-90 transition-transform duration-1000 hover:scale-102"
                  />
                  {/* Subtle widescreen bars overlay */}
                  <div className="absolute inset-x-0 top-0 h-4 bg-black/60 z-10" />
                  <div className="absolute inset-x-0 bottom-0 h-4 bg-black/60 z-10" />
                </div>

                {/* Film captions / subtitles layout style */}
                <div className="flex flex-col md:flex-row justify-between items-start gap-4 mt-2 px-2">
                  <div className="flex flex-col gap-1 max-w-lg">
                    <h3 className="text-xs font-mono tracking-widest text-[#B8A9D4] uppercase">{m.title}</h3>
                    <p className="text-sm text-stone-400 font-light leading-relaxed mt-2 italic">"{m.description}"</p>
                  </div>
                  <div className="text-[10px] tracking-widest text-stone-500 uppercase font-mono self-end">{m.date}</div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* CREDITS SECTION - ROLLING TEXT AESTHETIC */}
      <section className="py-32 bg-[#020202] text-center border-t border-stone-900/60 z-10 relative">
        <div className="max-w-md mx-auto flex flex-col gap-8">
          <h4 className="text-[11px] tracking-[0.45em] text-[#B8A9D4] uppercase font-light">CAST & CREW</h4>
          
          <div className="flex flex-col gap-4 text-xs font-mono tracking-widest text-stone-400 uppercase">
            <div>
              <p className="text-[9px] text-stone-600 mb-1">BAŞROLLERDE</p>
              <p className="text-[#F0EDE8]">{config.coupleNames}</p>
            </div>
            <div>
              <p className="text-[9px] text-stone-600 mb-1">SENARYO & YÖNETMEN</p>
              <p>Gerçek Aşk</p>
            </div>
            <div>
              <p className="text-[9px] text-stone-600 mb-1">MÜZİK</p>
              <p>Ruhumuzun Ortak Melodisi</p>
            </div>
            <div>
              <p className="text-[9px] text-stone-600 mb-1">YAYIN TARİHİ</p>
              <p>{config.specialDate}</p>
            </div>
          </div>

          <div className="flex justify-center mt-6">
            <Heart size={14} className="text-[#B8A9D4] animate-pulse" />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 text-center text-[9px] tracking-[0.4em] text-stone-700 uppercase">
        SİNEMATİK TEMA — ANILARIMIZ.COM
      </footer>
    </main>
  );
}
