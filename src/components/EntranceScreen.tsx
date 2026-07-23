"use client";

import { useEffect, useState, useRef } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────
export type EntranceType = "curtain" | "envelope" | "light-gate" | "frosted-glass";

interface EntranceScreenProps {
  type: EntranceType;
  accentColor?: string;
  coupleNames?: string;
  onEnter: () => void;
  lang?: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const handler = () => setReduced(mq.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return reduced;
}

// Sparkle SVG icon
function SparkleIcon({ color, size = 20 }: { color: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M12 2 L13.5 10.5 L22 12 L13.5 13.5 L12 22 L10.5 13.5 L2 12 L10.5 10.5 Z" fill={color} opacity="0.9" />
    </svg>
  );
}

// Heart icon
function HeartIcon({ color, size = 22 }: { color: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

// ─── CURTAIN — Tiyatro Perdesi ────────────────────────────────────────────────
function CurtainEntrance({ accentColor, coupleNames, onEnter, reduced, isEn }: { accentColor: string; coupleNames?: string; onEnter: () => void; reduced: boolean; isEn: boolean }) {
  const [opening, setOpening] = useState(false);
  const [done, setDone] = useState(false);

  const handleClick = () => {
    if (opening) return;
    setOpening(true);
    if (reduced) {
      setTimeout(() => { setDone(true); onEnter(); }, 300);
    } else {
      setTimeout(() => { setDone(true); onEnter(); }, 1400);
    }
  };

  if (done) return null;

  const acc = accentColor || "#C9A84C";

  return (
    <div
      onClick={handleClick}
      style={{
        position: "fixed", inset: 0, zIndex: 9999, cursor: "pointer",
        overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center",
        userSelect: "none",
      }}
    >
      {/* Left drape */}
      <div style={{
        position: "absolute", top: 0, left: 0, width: "50%", height: "100%",
        background: `linear-gradient(to right, #1a0808 0%, #2d0f0f 40%, #3d1515 70%, #4a1a1a 100%)`,
        transformOrigin: "left center",
        transform: opening && !reduced ? "translateX(-100%)" : "translateX(0%)",
        transition: opening ? "transform 1.1s cubic-bezier(0.7, 0, 0.3, 1)" : "none",
        boxShadow: "inset -20px 0 60px rgba(0,0,0,0.5), inset -4px 0 12px rgba(201,168,76,0.15)",
      }}>
        {/* Fabric fold lines */}
        {[20, 40, 60, 80].map((pct) => (
          <div key={pct} style={{
            position: "absolute", top: 0, bottom: 0,
            left: `${pct}%`, width: "1px",
            background: "linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.25) 20%, rgba(0,0,0,0.35) 50%, rgba(0,0,0,0.25) 80%, transparent 100%)",
          }} />
        ))}
      </div>

      {/* Right drape */}
      <div style={{
        position: "absolute", top: 0, right: 0, width: "50%", height: "100%",
        background: `linear-gradient(to left, #1a0808 0%, #2d0f0f 40%, #3d1515 70%, #4a1a1a 100%)`,
        transformOrigin: "right center",
        transform: opening && !reduced ? "translateX(100%)" : "translateX(0%)",
        transition: opening ? "transform 1.1s cubic-bezier(0.7, 0, 0.3, 1)" : "none",
        boxShadow: "inset 20px 0 60px rgba(0,0,0,0.5), inset 4px 0 12px rgba(201,168,76,0.15)",
      }}>
        {[20, 40, 60, 80].map((pct) => (
          <div key={pct} style={{
            position: "absolute", top: 0, bottom: 0,
            right: `${pct}%`, width: "1px",
            background: "linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.25) 20%, rgba(0,0,0,0.35) 50%, rgba(0,0,0,0.25) 80%, transparent 100%)",
          }} />
        ))}
      </div>

      {/* Top pelmet (gold trim bar) */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: "clamp(50px, 8vw, 80px)",
        background: `linear-gradient(to bottom, #3d1515, #2d0f0f)`,
        zIndex: 2,
        borderBottom: `2px solid ${acc}55`,
        boxShadow: `0 4px 24px rgba(0,0,0,0.6), 0 2px 0 ${acc}33`,
      }}>
        {/* Gold tassel dots */}
        {[...Array(11)].map((_, i) => (
          <div key={i} style={{
            position: "absolute", bottom: "-10px", left: `${(i + 0.5) * 100 / 11}%`,
            transform: "translateX(-50%)",
            width: "8px", height: "20px",
            background: `linear-gradient(to bottom, ${acc}, ${acc}88)`,
            borderRadius: "0 0 4px 4px",
            boxShadow: `0 2px 8px ${acc}44`,
          }} />
        ))}
      </div>

      {/* Center call-to-action */}
      <div style={{
        position: "relative", zIndex: 3, display: "flex", flexDirection: "column",
        alignItems: "center", gap: "20px", textAlign: "center",
        opacity: opening ? 0 : 1,
        transition: "opacity 0.4s ease",
      }}>
        {/* Glow ring */}
        <div style={{
          width: "80px", height: "80px", borderRadius: "50%",
          border: `1.5px solid ${acc}55`,
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: `0 0 32px ${acc}22, inset 0 0 20px ${acc}11`,
          animation: opening ? "none" : "curtainPulse 2.5s ease-in-out infinite",
        }}>
          <HeartIcon color={acc} size={28} />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <span style={{
            fontFamily: "'Cormorant Garamond', 'Cormorant Garamond Fallback', serif",
            fontSize: "clamp(2rem, 6vw, 3rem)",
            fontWeight: 400,
            color: "#F0EDE8",
            letterSpacing: "0.04em",
            lineHeight: 1.1,
          }}>
            {isEn ? "Scene Ready" : "Sahne Hazır"}
          </span>
          <span style={{
            fontFamily: "var(--font-inter), 'Inter', sans-serif",
            fontSize: "11px",
            letterSpacing: "0.3em",
            textTransform: "uppercase",
            color: `${acc}99`,
            fontWeight: 400,
          }}>
            {isEn ? "Tap to Open" : "Açmak İçin Dokun"}
          </span>
        </div>

      </div>

      <style>{`
        @keyframes curtainPulse {
          0%, 100% { box-shadow: 0 0 32px ${acc}22, inset 0 0 20px ${acc}11; transform: scale(1); }
          50% { box-shadow: 0 0 48px ${acc}44, inset 0 0 28px ${acc}22; transform: scale(1.04); }
        }
        @keyframes curtainChevron {
          0%, 100% { opacity: 0.3; transform: rotate(45deg) translateY(0px); }
          50% { opacity: 0.9; transform: rotate(45deg) translateY(4px); }
        }
        @media (prefers-reduced-motion: reduce) {
          @keyframes curtainPulse { 0%, 100% { opacity: 1; } }
          @keyframes curtainChevron { 0%, 100% { opacity: 0.7; } }
        }
      `}</style>
    </div>
  );
}

// ─── ENVELOPE — Mektup Zarfı ──────────────────────────────────────────────────
function EnvelopeEntrance({ accentColor, coupleNames, onEnter, reduced, isEn }: { accentColor: string; coupleNames?: string; onEnter: () => void; reduced: boolean; isEn: boolean }) {
  const [phase, setPhase] = useState<"idle" | "flap" | "reveal" | "done">("idle");

  const handleClick = () => {
    if (phase !== "idle") return;
    setPhase("flap");
    if (reduced) {
      setTimeout(() => { setPhase("done"); onEnter(); }, 400);
      return;
    }
    setTimeout(() => setPhase("reveal"), 600);
    setTimeout(() => { setPhase("done"); onEnter(); }, 1600);
  };

  if (phase === "done") return null;

  const acc = accentColor || "#C9A84C";
  const names = coupleNames?.replace(/\n/g, " · ").replace(/&/g, "♥") || (isEn ? "Special for You" : "Sana Özel");

  return (
    <div
      onClick={handleClick}
      style={{
        position: "fixed", inset: 0, zIndex: 9999, cursor: "pointer",
        display: "flex", alignItems: "center", justifyContent: "center",
        userSelect: "none",
        background: "linear-gradient(135deg, #0B0F1A 0%, #160408 50%, #0B0F1A 100%)",
        overflow: "hidden",
      }}
    >
      {/* Soft background glow */}
      <div style={{
        position: "absolute", width: "600px", height: "600px", borderRadius: "50%",
        background: `radial-gradient(circle, ${acc}0d 0%, transparent 70%)`,
        pointerEvents: "none",
      }} />

      {/* Decorative sparkles */}
      {[
        { top: "15%", left: "12%", size: 14, delay: "0s" },
        { top: "20%", right: "15%", size: 10, delay: "0.8s" },
        { bottom: "25%", left: "18%", size: 12, delay: "0.4s" },
        { bottom: "20%", right: "12%", size: 16, delay: "1.2s" },
        { top: "40%", left: "6%", size: 8, delay: "0.6s" },
        { top: "35%", right: "7%", size: 9, delay: "1s" },
      ].map((s, i) => (
        <div key={i} style={{
          position: "absolute", ...s as any,
          animation: `envSparkle 3s ease-in-out ${s.delay} infinite`,
          opacity: phase === "idle" ? 1 : 0,
          transition: "opacity 0.3s",
        }}>
          <SparkleIcon color={acc} size={s.size} />
        </div>
      ))}

      {/* The envelope */}
      <div style={{
        position: "relative",
        transform: phase === "reveal" ? "translateY(-120vh)" : "translateY(0)",
        transition: phase === "reveal" ? "transform 0.9s cubic-bezier(0.4, 0, 0.2, 1)" : "none",
      }}>
        {/* Envelope body */}
        <div style={{
          width: "clamp(280px, 80vw, 360px)",
          background: "#F5F0E8",
          borderRadius: "4px 4px 8px 8px",
          boxShadow: "0 20px 80px rgba(0,0,0,0.6), 0 4px 20px rgba(0,0,0,0.4)",
          position: "relative",
          overflow: "visible",
        }}>
          {/* Flap (top triangle) */}
          <div style={{
            position: "absolute", top: 0, left: 0, right: 0,
            height: "clamp(80px, 22vw, 100px)",
            overflow: "hidden",
            zIndex: 5,
          }}>
            <div style={{
              width: "100%", height: "200%",
              transformOrigin: "top center",
              transform: phase === "flap" || phase === "reveal"
                ? (reduced ? "none" : "perspective(800px) rotateX(-180deg)")
                : "perspective(800px) rotateX(0deg)",
              transition: phase === "flap" ? "transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)" : "none",
            }}>
              {/* Flap shape via clip-path */}
              <div style={{
                position: "absolute", top: 0, left: 0, right: 0,
                height: "50%",
                background: `linear-gradient(135deg, #E8E0D0 0%, #D4C9B0 100%)`,
                clipPath: "polygon(0 0, 100% 0, 50% 100%)",
              }}>
                {/* Gold wax seal */}
                <div style={{
                  position: "absolute", bottom: "8px", left: "50%",
                  transform: "translateX(-50%) translateY(50%)",
                  width: "36px", height: "36px", borderRadius: "50%",
                  background: `radial-gradient(circle at 35% 35%, ${acc}, ${acc}99)`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: `0 2px 12px ${acc}66`,
                  zIndex: 10,
                }}>
                  <HeartIcon color="#0B0F1A" size={14} />
                </div>
              </div>
            </div>
          </div>

          {/* Envelope interior — sadece klasik V katlama çizgisi */}
          <div style={{
            padding: "clamp(50px, 14vw, 65px) clamp(20px, 6vw, 32px) clamp(24px, 6vw, 32px)",
            minHeight: "clamp(160px, 42vw, 200px)",
            display: "flex", flexDirection: "column", alignItems: "center",
            justifyContent: "flex-end",
            textAlign: "center",
            background: "linear-gradient(to bottom, #EDE5D8, #F5F0E8)",
            borderRadius: "0 0 8px 8px",
          }}>
            {/* Side V-folds */}
            <div style={{
              position: "absolute", bottom: 0, left: 0, right: 0, top: "40%",
              overflow: "hidden", pointerEvents: "none",
            }}>
              <div style={{
                position: "absolute", bottom: 0, left: 0, right: 0,
                height: "60%",
                background: "#E8DCC8",
                clipPath: "polygon(0 100%, 50% 0, 100% 100%)",
              }} />
            </div>
          </div>
        </div>

        {/* Call-to-action below — isimler + zarfı aç */}
        <div style={{
          marginTop: "28px", textAlign: "center",
          opacity: phase === "idle" ? 1 : 0,
          transition: "opacity 0.3s",
          display: "flex", flexDirection: "column", alignItems: "center", gap: "8px",
        }}>
          <div style={{
            fontFamily: "'Cormorant Garamond', 'Cormorant Garamond Fallback', serif",
            fontSize: "clamp(1.1rem, 4vw, 1.5rem)",
            color: "#F0EDE8",
            fontWeight: 400,
            letterSpacing: "0.04em",
            fontStyle: "italic",
          }}>
            {names}
          </div>
          <div style={{
            fontFamily: "var(--font-inter), 'Inter', sans-serif",
            fontSize: "10px", letterSpacing: "0.3em", textTransform: "uppercase",
            color: `${acc}77`,
          }}>
            {isEn ? "Open Envelope" : "Zarfı Aç"}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes envSparkle {
          0%, 100% { opacity: 0.3; transform: scale(1) rotate(0deg); }
          50% { opacity: 0.9; transform: scale(1.2) rotate(20deg); }
        }
        @keyframes curtainChevron {
          0%, 100% { opacity: 0.3; transform: rotate(45deg) translateY(0px); }
          50% { opacity: 0.9; transform: rotate(45deg) translateY(4px); }
        }
        @media (prefers-reduced-motion: reduce) {
          @keyframes envSparkle { 0%,100%{ opacity:0.6; } }
          @keyframes curtainChevron { 0%,100%{ opacity:0.6; } }
        }
      `}</style>
    </div>
  );
}

// ─── POLAROID FLASH — Vintage Kamera Çizimi ─────────────────────────────────
// Karakalem çizimi tarzı vintage kamera; deklanşöre basınca flaş patlar ve sayfa açılır
function PolaroidFlashEntrance({ accentColor, coupleNames, onEnter, reduced, isEn }: { accentColor: string; coupleNames?: string; onEnter: () => void; reduced: boolean; isEn: boolean }) {
  const [phase, setPhase] = useState<"idle" | "rising" | "done">("idle");

  if (phase === "done") return null;
  const acc = accentColor || "#C9A84C";
  const names = coupleNames ? coupleNames.replace(/\n\s*&\s*\n/g, " ♥ ").replace(/\n/g, " · ").replace(/&/g, "♥") : "";

  const handleClick = () => {
    if (phase !== "idle") return;
    setPhase("rising");
    playCameraSound();
    if (reduced) {
      setTimeout(() => { setPhase("done"); onEnter(); }, 300);
    } else {
      // Flash visible for ~400ms, then page fades in over 900ms
      setTimeout(() => { setPhase("done"); onEnter(); }, 1500);
    }
  };

  // Camera shutter + flash sound synthesizer
  const playCameraSound = () => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();

      // High-pitched shutter blade click
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(1800, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(90, ctx.currentTime + 0.055);
      oscGain.gain.setValueAtTime(0.4, ctx.currentTime);
      oscGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);
      osc.connect(oscGain);
      oscGain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.07);

      // Mechanical body noise
      const bufferSize = ctx.sampleRate * 0.14;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      const filter = ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.value = 1200;
      filter.Q.value = 2.5;
      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.28, ctx.currentTime);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
      noise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(ctx.destination);
      noise.start(ctx.currentTime + 0.015);
      noise.stop(ctx.currentTime + 0.13);
    } catch (e) {
      console.error("Camera audio synthesis failed", e);
    }
  };


  return (
    <div
      onClick={handleClick}
      style={{
        position: "fixed", inset: 0, zIndex: 9999, cursor: "pointer",
        overflow: "hidden", userSelect: "none",
        background: "#070A10",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        gap: "0px",
      }}
    >
      {/* Vignette overlay */}
      <div style={{
        position: "absolute", inset: 0,
        background: "radial-gradient(ellipse at center, transparent 38%, rgba(0,0,0,0.75) 100%)",
        pointerEvents: "none", zIndex: 1,
      }} />

      {/* ── Main content ── */}
      <div style={{
        position: "relative", zIndex: 5,
        display: "flex", flexDirection: "column", alignItems: "center", gap: "20px",
        textAlign: "center",
        opacity: phase === "idle" ? 1 : 0,
        transition: "opacity 0.15s ease",
      }}>

        {/* Top label */}
        <div style={{
          fontFamily: "var(--font-inter), 'Inter', sans-serif",
          fontSize: "9px", letterSpacing: "0.38em", textTransform: "uppercase",
          color: "rgba(240, 237, 232, 0.5)", fontWeight: 400,
        }}>
          {isEn ? "— vintage moment —" : "— nostaljik an —"}
        </div>

        {/* ── Vintage Camera SVG (karakalem çizimi tarzı) ── */}
        <div style={{
          position: "relative",
          animation: "cameraFloat 5s ease-in-out infinite",
        }}>
          <svg
            viewBox="0 0 380 280"
            width="clamp(270px, 52vw, 400px)"
            height="auto"
            style={{ display: "block", overflow: "visible", filter: "drop-shadow(0 24px 70px rgba(0,0,0,0.9))" }}
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              {/* Very subtle pencil sketch displacement */}
              <filter id="pencilSketch" x="-5%" y="-5%" width="110%" height="110%">
                <feTurbulence type="fractalNoise" baseFrequency="0.065 0.065" numOctaves="3" seed="7" result="noise" />
                <feDisplacementMap in="SourceGraphic" in2="noise" scale="1.8" xChannelSelector="R" yChannelSelector="G" />
              </filter>
              {/* Lens glass gradient */}
              <radialGradient id="lensGlass" cx="40%" cy="35%" r="65%">
                <stop offset="0%" stopColor="rgba(200,210,230,0.12)" />
                <stop offset="40%" stopColor="rgba(10,14,22,0.92)" />
                <stop offset="100%" stopColor="rgba(2,4,10,0.98)" />
              </radialGradient>
              <radialGradient id="lensGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor={acc} stopOpacity="0.22" />
                <stop offset="100%" stopColor={acc} stopOpacity="0" />
              </radialGradient>
            </defs>

            {/* ── Hands holding camera (lower edge suggestion) ── */}
            <path
              d="M 40 265 Q 50 255 65 258 Q 80 262 85 252 Q 92 240 80 235 Q 66 230 55 242 Q 42 250 38 260 Z"
              fill="none" stroke="rgba(240,237,232,0.28)" strokeWidth="2"
              filter="url(#pencilSketch)"
            />
            <path
              d="M 42 270 Q 55 268 68 265 Q 80 263 88 255"
              fill="none" stroke="rgba(240,237,232,0.18)" strokeWidth="1.4"
              strokeLinecap="round" filter="url(#pencilSketch)"
            />
            <path
              d="M 340 265 Q 330 255 315 258 Q 300 262 295 252 Q 288 240 300 235 Q 314 230 325 242 Q 338 250 342 260 Z"
              fill="none" stroke="rgba(240,237,232,0.28)" strokeWidth="2"
              filter="url(#pencilSketch)"
            />
            <path
              d="M 338 270 Q 325 268 312 265 Q 300 263 292 255"
              fill="none" stroke="rgba(240,237,232,0.18)" strokeWidth="1.4"
              strokeLinecap="round" filter="url(#pencilSketch)"
            />

            {/* ── Camera body ── */}
            <rect
              x="44" y="72" width="292" height="176" rx="16"
              fill="rgba(8,11,18,0.7)"
              stroke="rgba(240,237,232,0.80)"
              strokeWidth="2.6"
              strokeLinejoin="round"
              filter="url(#pencilSketch)"
            />
            {/* Subtle body shading */}
            <line x1="56" y1="80" x2="56" y2="240" stroke="rgba(240,237,232,0.05)" strokeWidth="0.8" />
            <line x1="68" y1="80" x2="68" y2="240" stroke="rgba(240,237,232,0.04)" strokeWidth="0.8" />
            <line x1="320" y1="80" x2="320" y2="240" stroke="rgba(240,237,232,0.05)" strokeWidth="0.8" />

            {/* ── Top ridge / pentaprism hump ── */}
            <path
              d="M 120 72 L 108 48 L 272 48 L 260 72"
              fill="rgba(8,11,18,0.6)"
              stroke="rgba(240,237,232,0.70)"
              strokeWidth="2.2"
              strokeLinejoin="round"
              filter="url(#pencilSketch)"
            />

            {/* ── Flash unit ── */}
            <rect
              x="228" y="34" width="58" height="18" rx="5"
              fill="none"
              stroke={`${acc}bb`}
              strokeWidth="2"
              filter="url(#pencilSketch)"
            />
            {/* Flash zigzag icon */}
            <path
              d="M 243 34 L 238 43 L 248 43 L 243 52"
              fill="none" stroke={acc} strokeWidth="2"
              strokeLinecap="round" strokeLinejoin="round"
            />
            {/* Flash glow pulse */}
            <ellipse cx="257" cy="43" rx="14" ry="9"
              fill={`${acc}18`}
              style={{ animation: "flashPulse 2.4s ease-in-out infinite" }}
            />

            {/* ── Shutter button (top of camera) ── */}
            <ellipse
              cx="136" cy="49" rx="13" ry="9"
              fill="rgba(240,237,232,0.10)"
              stroke="rgba(240,237,232,0.55)"
              strokeWidth="1.8"
              filter="url(#pencilSketch)"
            />
            <ellipse cx="136" cy="47" rx="7" ry="5"
              fill="rgba(240,237,232,0.18)"
              stroke="rgba(240,237,232,0.4)"
              strokeWidth="1.2"
            />

            {/* ── Viewfinder ── */}
            <rect
              x="60" y="86" width="40" height="30" rx="5"
              fill="rgba(0,0,0,0.55)"
              stroke="rgba(240,237,232,0.45)"
              strokeWidth="1.6"
              filter="url(#pencilSketch)"
            />
            <line x1="70" y1="101" x2="90" y2="101" stroke="rgba(240,237,232,0.22)" strokeWidth="0.8" />
            <line x1="80" y1="90" x2="80" y2="112" stroke="rgba(240,237,232,0.22)" strokeWidth="0.8" />

            {/* ── Main lens assembly ── */}
            {/* Outer mount ring */}
            <circle cx="190" cy="168" r="76"
              fill="rgba(4,6,12,0.85)"
              stroke="rgba(240,237,232,0.76)"
              strokeWidth="3"
              filter="url(#pencilSketch)"
            />
            {/* Aperture ring tick marks */}
            {[0,30,60,90,120,150,180,210,240,270,300,330].map((deg, i) => {
              const rad = (deg * Math.PI) / 180;
              const r1 = 64, r2 = i % 3 === 0 ? 58 : 61;
              return (
                <line
                  key={deg}
                  x1={190 + r1 * Math.cos(rad)} y1={168 + r1 * Math.sin(rad)}
                  x2={190 + r2 * Math.cos(rad)} y2={168 + r2 * Math.sin(rad)}
                  stroke="rgba(240,237,232,0.28)" strokeWidth={i % 3 === 0 ? 1.4 : 0.8}
                />
              );
            })}
            {/* Focus ring */}
            <circle cx="190" cy="168" r="58"
              fill="none"
              stroke="rgba(240,237,232,0.40)"
              strokeWidth="1.4"
              filter="url(#pencilSketch)"
            />
            {/* Inner lens barrel */}
            <circle cx="190" cy="168" r="44"
              fill="url(#lensGlass)"
              stroke="rgba(240,237,232,0.25)"
              strokeWidth="1.2"
              filter="url(#pencilSketch)"
            />
            {/* Lens inner glass */}
            <circle cx="190" cy="168" r="30"
              fill="rgba(2,4,10,0.95)"
              stroke="rgba(240,237,232,0.14)"
              strokeWidth="1"
            />
            {/* Lens glow accent */}
            <circle cx="190" cy="168" r="30"
              fill="url(#lensGlow)"
              style={{ animation: "lensBreath 3.5s ease-in-out infinite" }}
            />
            {/* Lens reflection highlights */}
            <ellipse cx="178" cy="157" rx="9" ry="5.5"
              fill="rgba(240,237,232,0.10)"
              transform="rotate(-25, 178, 157)"
            />
            <ellipse cx="200" cy="178" rx="4" ry="2.5"
              fill="rgba(240,237,232,0.05)"
              transform="rotate(-25, 200, 178)"
            />

            {/* ── Film advance knob ── */}
            <rect x="288" y="76" width="22" height="38" rx="6"
              fill="rgba(4,6,12,0.6)"
              stroke="rgba(240,237,232,0.42)" strokeWidth="1.6"
              filter="url(#pencilSketch)"
            />
            {[82,88,94,100,106].map((y) => (
              <line key={y} x1="291" y1={y} x2="307" y2={y}
                stroke="rgba(240,237,232,0.22)" strokeWidth="0.8"
              />
            ))}

            {/* ── Strap lugs ── */}
            <rect x="44" y="84" width="12" height="22" rx="4"
              fill="none" stroke="rgba(240,237,232,0.38)" strokeWidth="1.4"
              filter="url(#pencilSketch)"
            />
            <rect x="324" y="84" width="12" height="22" rx="4"
              fill="none" stroke="rgba(240,237,232,0.38)" strokeWidth="1.4"
              filter="url(#pencilSketch)"
            />

            {/* ── Bottom plate detail ── */}
            <line x1="74" y1="238" x2="306" y2="238"
              stroke="rgba(240,237,232,0.15)" strokeWidth="1"
              strokeDasharray="5 6"
            />
            <text
              x="190" y="256"
              textAnchor="middle"
              fontFamily="'Courier New', Courier, monospace"
              fontSize="7.5"
              fill="rgba(240,237,232,0.28)"
              letterSpacing="0.26em"
            >
              BİRLİKTEYDİK · 35MM · NO.001
            </text>
          </svg>

          {/* ── Full-camera tap target (transparent overlay) ── */}
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); handleClick(); }}
            aria-label={isEn ? "Press shutter to enter" : "Deklanşöre bas ve gir"}
            style={{
              position: "absolute", inset: 0,
              background: "transparent", border: "none", cursor: "pointer",
              outline: "none", borderRadius: "16px",
            }}
          />
        </div>

        {/* Bottom text block: Couple names & prompt */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
          {names && (
            <div style={{
              fontFamily: "'Cormorant Garamond', 'Cormorant Garamond Fallback', serif",
              fontSize: "clamp(1.2rem, 4.5vw, 1.8rem)",
              fontWeight: 400,
              color: "#F0EDE8",
              letterSpacing: "0.04em",
              fontStyle: "italic",
              textShadow: `0 2px 14px rgba(0,0,0,0.8), 0 0 20px ${acc}22`,
            }}>
              {names}
            </div>
          )}
          <div style={{
            fontFamily: "var(--font-inter), 'Inter', sans-serif",
            fontSize: "10px",
            letterSpacing: "0.3em",
            textTransform: "uppercase",
            color: "rgba(240, 237, 232, 0.75)",
            fontWeight: 400,
          }}>
            {isEn ? "tap to capture the moment" : "Anıları Görüntülemek İçin Dokun"}
          </div>
        </div>
      </div>

      {/* ── Radial white flash burst ── */}
      {phase === "rising" && (
        <div
          style={{
            position: "fixed", inset: 0, zIndex: 10000,
            pointerEvents: "none",
            animation: "cameraFlashBurst 1.5s cubic-bezier(0.08, 0.8, 0.18, 1) forwards",
            background: "radial-gradient(circle at 50% 50%, #ffffff 0%, #fffef8 25%, #fff9e8 55%, rgba(255,253,235,0) 100%)",
          }}
        />
      )}

      <style>{`
        @keyframes cameraFloat {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          30% { transform: translateY(-7px) rotate(0.4deg); }
          70% { transform: translateY(-4px) rotate(-0.3deg); }
        }
        @keyframes flashPulse {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.25); }
        }
        @keyframes lensBreath {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
        @keyframes cameraFlashBurst {
          0% { opacity: 0; transform: scale(0.15); }
          6% { opacity: 1; transform: scale(1); }
          22% { opacity: 1; transform: scale(1); }
          100% { opacity: 0; transform: scale(1); }
        }
        @media (prefers-reduced-motion: reduce) {
          @keyframes cameraFloat { 0%, 100% { transform: none; } }
          @keyframes flashPulse { 0%, 100% { opacity: 0.5; } }
          @keyframes lensBreath { 0%, 100% { opacity: 0.7; } }
          @keyframes cameraFlashBurst { 0% { opacity: 0; } 10% { opacity: 1; } 100% { opacity: 0; } }
        }
      `}</style>
    </div>
  );
}



// ─── FROSTED GLASS — Buzlu Cam ────────────────────────────────────────────────
// Arka planı tamamen bulanıklaştırır ve tıklandığında/dokunulduğunda buğu eriyormuş gibi netleştirir.
function FrostedGlassEntrance({ accentColor, coupleNames, onEnter, reduced, isEn }: { accentColor: string; coupleNames?: string; onEnter: () => void; reduced: boolean; isEn: boolean }) {
  const [phase, setPhase] = useState<"idle" | "melting" | "done">("idle");

  const handleClick = () => {
    if (phase !== "idle") return;
    setPhase("melting");
    if (reduced) {
      setTimeout(() => { setPhase("done"); onEnter(); }, 300);
    } else {
      // 1.8 seconds melting animation
      setTimeout(() => { setPhase("done"); onEnter(); }, 1800);
    }
  };

  if (phase === "done") return null;

  const acc = accentColor || "#C9A84C";

  return (
    <div
      onClick={handleClick}
      style={{
        position: "fixed", inset: 0, zIndex: 9999, cursor: "pointer",
        overflow: "hidden", userSelect: "none",
        display: "flex", alignItems: "center", justifyContent: "center",
        // Transition for frosted glass melting effect
        backdropFilter: phase === "melting" ? "blur(0px)" : "blur(40px)",
        background: phase === "melting" ? "rgba(9, 9, 11, 0)" : "rgba(9, 9, 11, 0.65)",
        transition: phase === "melting" ? "backdrop-filter 1.6s cubic-bezier(0.25, 1, 0.5, 1), background 1.6s cubic-bezier(0.25, 1, 0.5, 1)" : "none",
      }}
    >
      {/* Center glowing button */}
      <div style={{
        display: "flex", flexDirection: "column", alignItems: "center", gap: "22px",
        textAlign: "center",
        opacity: phase === "melting" ? 0 : 1,
        transform: phase === "melting" ? "scale(0.9)" : "scale(1)",
        transition: "opacity 0.5s ease, transform 0.5s ease",
      }}>
        {/* Highly glowing heart button */}
        <div style={{
          width: "84px", height: "84px", borderRadius: "50%",
          background: `rgba(9, 9, 11, 0.6)`,
          border: `1.5px solid ${acc}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: `0 0 35px 5px ${acc}55, inset 0 0 15px ${acc}22`,
          animation: "glassPulse 2.8s ease-in-out infinite",
        }}>
          <HeartIcon color={acc} size={30} />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <div style={{
            fontFamily: "'Cormorant Garamond', 'Cormorant Garamond Fallback', serif",
            fontSize: "clamp(2rem, 6vw, 3rem)",
            fontWeight: 400, color: "#F0EDE8",
            letterSpacing: "0.04em",
          }}>
            {isEn ? "Our World" : "Bizim Dünyamız"}
          </div>
          <div style={{
            fontFamily: "var(--font-inter), 'Inter', sans-serif",
            fontSize: "10px", letterSpacing: "0.3em", textTransform: "uppercase",
            color: `${acc}99`,
            fontWeight: 400,
          }}>
            {isEn ? "Touch the Heart" : "Kalbe Dokun"}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes glassPulse {
          0%, 100% { box-shadow: 0 0 35px 5px ${acc}33, inset 0 0 15px ${acc}11; transform: scale(1); }
          50% { box-shadow: 0 0 55px 12px ${acc}77, inset 0 0 25px ${acc}33; transform: scale(1.05); }
        }
        @media (prefers-reduced-motion: reduce) {
          @keyframes glassPulse { 0%, 100% { opacity: 1; } }
        }
      `}</style>
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────
export default function EntranceScreen({ type, accentColor, coupleNames, onEnter, lang }: EntranceScreenProps) {
  const reduced = useReducedMotion();
  const acc = accentColor || "#C9A84C";
  const isEn = lang === "en";

  if (type === "curtain") {
    return <CurtainEntrance accentColor={acc} coupleNames={coupleNames} onEnter={onEnter} reduced={reduced} isEn={isEn} />;
  }
  if (type === "envelope") {
    return <EnvelopeEntrance accentColor={acc} coupleNames={coupleNames} onEnter={onEnter} reduced={reduced} isEn={isEn} />;
  }
  if (type === "light-gate") {
    return <PolaroidFlashEntrance accentColor={acc} coupleNames={coupleNames} onEnter={onEnter} reduced={reduced} isEn={isEn} />;
  }
  if (type === "frosted-glass") {
    return <FrostedGlassEntrance accentColor={acc} coupleNames={coupleNames} onEnter={onEnter} reduced={reduced} isEn={isEn} />;
  }
  return null;
}
