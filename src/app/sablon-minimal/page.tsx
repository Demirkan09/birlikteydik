"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { ChevronDown, Volume2, VolumeX, Heart } from "lucide-react";

// Config Data
const config = {
  coupleNames: "Melis & Demirkan",
  tagline: "Gürültüden uzak, en saf halimizle. Sadece sen ve ben.",
  accentColor: "#8C7E6C",
  specialDate: "26.10.2024",
  musicUrl: "/music/minimal.mp3",
};

const memories = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1464746133101-a2c3f88e0dd9?auto=format&fit=crop&q=80&w=800",
    title: "Sessiz Bir Gün",
    description: "Dünyanın tüm kalabalığını arkamızda bırakıp sadece gözlerimizle konuştuğumuz o sade an.",
    date: "Ekim 2024",
    number: "01",
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&q=80&w=800",
    title: "Ortak Bir Ritim",
    description: "Aynı anda susup, aynı gökyüzüne bakıp, içimizden geçenleri tek bir tebessümle paylaşmamız.",
    date: "Aralık 2024",
    number: "02",
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=800",
    title: "Yol Arkadaşım",
    description: "Nereye gittiğimizin önemi yoktu, yanımda yürüdüğün sürece her yol en güzel adresti.",
    date: "Şubat 2025",
    number: "03",
  },
];

export default function MinimalTemplate() {
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
    <main className="bg-[#F6F3F0] text-[#2C2927] min-h-screen overflow-x-hidden font-sans selection:bg-[#E4DDD3]">
      
      {/* Audio Button */}
      <div className="fixed top-5 right-5 z-50">
        <button
          onClick={toggleMusic}
          className="w-11 h-11 flex items-center justify-center rounded-full bg-[#FAF8F5]/90 border border-[#2C2927]/10 text-[#8C7E6C] hover:scale-103 transition-all shadow-sm"
        >
          {isPlaying ? <Volume2 size={15} /> : <VolumeX size={15} className="opacity-60" />}
        </button>
      </div>

      {/* HERO SECTION */}
      <section className="relative min-h-screen flex flex-col justify-center px-8 md:px-24 z-10">
        <div className="max-w-3xl">
          {/* Eyebrow */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="flex items-center gap-4 mb-8 text-[#8C7E6C]"
          >
            <span className="text-[10px] tracking-[0.45em] uppercase font-medium">{config.specialDate}</span>
            <div className="w-8 h-px bg-[#8C7E6C]/30" />
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="text-4xl md:text-7xl font-light leading-none tracking-tight text-[#1C1A19] font-serif mb-8"
          >
            {config.coupleNames}
          </motion.h1>

          {/* Tagline */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 1 }}
            className="text-xs md:text-sm text-[#736E6A] font-light tracking-wide leading-relaxed max-w-sm"
          >
            {config.tagline}
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 1 }}
            className="mt-12"
          >
            <button
              onClick={toggleMusic}
              className="text-[10px] tracking-[0.3em] uppercase border-b border-[#2C2927] pb-1 font-medium text-[#1C1A19] hover:opacity-75 transition-all bg-transparent"
            >
              {isPlaying ? "Sesi Durdur" : "Hikayeyi Dinle"}
            </button>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-10 left-8 md:left-24 flex items-center gap-3 opacity-60">
          <span className="text-[8px] tracking-[0.35em] uppercase text-[#736E6A]">Aşağı Kaydır</span>
          <div className="w-6 h-px bg-[#736E6A]" />
        </div>
      </section>

      {/* MEMORIES - ASYMMETRICAL MINIMALIST LAYOUT */}
      <section className="py-32 px-8 md:px-24 max-w-5xl mx-auto z-10">
        <div className="flex flex-col gap-40">
          {memories.map((m, i) => {
            const isEven = i % 2 === 0;
            return (
              <div
                key={m.id}
                className={`flex flex-col lg:flex-row gap-12 lg:gap-24 items-stretch ${isEven ? "" : "lg:flex-row-reverse"}`}
              >
                {/* Image Container with elegant borders and white margins */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-120px" }}
                  transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                  className="flex-1 bg-[#FAF8F5] p-3 border border-[#E9E4DF] shadow-[0_5px_15px_rgba(0,0,0,0.02)]"
                >
                  <div className="overflow-hidden aspect-[3/4] bg-stone-100">
                    <img 
                      src={m.image} 
                      alt={m.title} 
                      className="w-full h-full object-cover transition-transform duration-1000 hover:scale-102"
                    />
                  </div>
                </motion.div>

                {/* Text Block */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-120px" }}
                  transition={{ delay: 0.15, duration: 1 }}
                  className="flex-1 flex flex-col justify-center gap-6 max-w-md"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-[9px] text-[#8C7E6C] font-semibold tracking-widest">{m.number}</span>
                    <div className="w-6 h-px bg-[#8C7E6C]/30" />
                    <span className="text-[9px] text-[#736E6A] tracking-wider">{m.date}</span>
                  </div>

                  <h3 className="text-3xl font-serif text-[#1C1A19] font-light leading-tight">
                    {m.title}
                  </h3>

                  <p className="text-sm text-[#736E6A] font-light leading-relaxed">
                    {m.description}
                  </p>
                </motion.div>
              </div>
            );
          })}
        </div>
      </section>

      {/* FINAL SECTION */}
      <section className="py-44 flex flex-col items-center justify-center text-center px-8 z-10 bg-[#FAF8F5] border-t border-[#EAE3DC]">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className="flex flex-col items-center"
        >
          <div className="w-1 h-1 bg-[#8C7E6C] rounded-full mb-8" />
          <h2 className="text-3xl md:text-5xl font-serif text-[#1C1A19] font-light tracking-wide mb-8">
            Bizim Hikayemiz, En Yalın Haliyle.
          </h2>
          <Heart size={14} className="text-[#8C7E6C] mb-8 opacity-70" />
          <span className="text-[11px] tracking-[0.4em] uppercase text-[#736E6A]">{config.coupleNames}</span>
          <span className="text-[9px] text-[#8C7E6C]/60 tracking-widest mt-2 uppercase">{config.specialDate}</span>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="py-12 text-center text-[9px] tracking-[0.4em] text-[#A59F99]">
        MINIMALIST TEMA — ANILARIMIZ.COM
      </footer>
    </main>
  );
}
