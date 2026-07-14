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
function CurtainEntrance({ accentColor, onEnter, reduced, isEn }: { accentColor: string; onEnter: () => void; reduced: boolean; isEn: boolean }) {
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

// ─── POLAROID FLASH — Polaroid Flaş ─────────────────────────────────────────
// Kamera vizöründen bakar, tıklandığında flaş patlar ve şipşak ses çıkar
function PolaroidFlashEntrance({ accentColor, onEnter, reduced, isEn }: { accentColor: string; onEnter: () => void; reduced: boolean; isEn: boolean }) {
  const [phase, setPhase] = useState<"idle" | "rising" | "done">("idle");

  if (phase === "done") return null;
  const acc = accentColor || "#C9A84C";

  const handleClick = () => {
    if (phase !== "idle") return;
    setPhase("rising");
    playCameraSound();
    if (reduced) {
      setTimeout(() => { setPhase("done"); onEnter(); }, 300);
    } else {
      setTimeout(() => { setPhase("done"); onEnter(); }, 1200);
    }
  };

  // Polaroid Camera Shutter Sound Synthesizer
  const playCameraSound = () => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      
      // High-pitched shutter blade click
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(1500, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + 0.06);
      oscGain.gain.setValueAtTime(0.35, ctx.currentTime);
      oscGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.06);
      
      osc.connect(oscGain);
      oscGain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.07);
      
      // Mechanical shutter body/spring noise
      const bufferSize = ctx.sampleRate * 0.12;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      
      const filter = ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.value = 1100;
      filter.Q.value = 3;
      
      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.25, ctx.currentTime);
      noiseGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
      
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
        background: "#080B11",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}
    >
      {/* ── Viewfinder Lines ── */}
      {/* Top Left Corner */}
      <div style={{ position: "absolute", top: "40px", left: "40px", width: "32px", height: "32px", borderTop: "2px solid rgba(255,255,255,0.18)", borderLeft: "2px solid rgba(255,255,255,0.18)" }} />
      {/* Top Right Corner */}
      <div style={{ position: "absolute", top: "40px", right: "40px", width: "32px", height: "32px", borderTop: "2px solid rgba(255,255,255,0.18)", borderRight: "2px solid rgba(255,255,255,0.18)" }} />
      {/* Bottom Left Corner */}
      <div style={{ position: "absolute", bottom: "40px", left: "40px", width: "32px", height: "32px", borderBottom: "2px solid rgba(255,255,255,0.18)", borderLeft: "2px solid rgba(255,255,255,0.18)" }} />
      {/* Bottom Right Corner */}
      <div style={{ position: "absolute", bottom: "40px", right: "40px", width: "32px", height: "32px", borderBottom: "2px solid rgba(255,255,255,0.18)", borderRight: "2px solid rgba(255,255,255,0.18)" }} />
      
      {/* Center Viewfinder Circle */}
      <div style={{
        position: "absolute", top: "50%", left: "50%",
        transform: "translate(-50%, -50%)",
        width: "140px", height: "140px",
        borderRadius: "50%",
        border: "1.5px dashed rgba(255,255,255,0.08)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        {/* Tiny center dot */}
        <div style={{ width: "4px", height: "4px", borderRadius: "50%", background: "rgba(255,255,255,0.2)" }} />
      </div>

      {/* ── Content ── */}
      <div style={{
        position: "relative", zIndex: 5,
        display: "flex", flexDirection: "column", alignItems: "center", gap: "24px",
        textAlign: "center",
        opacity: phase === "idle" ? 1 : 0,
        transition: "opacity 0.2s ease",
      }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <div style={{
            fontFamily: "'Cormorant Garamond', 'Cormorant Garamond Fallback', serif",
            fontSize: "clamp(2rem, 6vw, 3rem)",
            fontWeight: 400, color: "#F0EDE8",
            letterSpacing: "0.04em",
          }}>
            {isEn ? "Camera Ready" : "Kamera Hazır"}
          </div>
          <div style={{
            fontFamily: "var(--font-inter), 'Inter', sans-serif",
            fontSize: "10px", letterSpacing: "0.25em", textTransform: "uppercase",
            color: `${acc}aa`,
          }}>
            {isEn ? "Focus on Lens" : "Objektife Odaklan"}
          </div>
        </div>

        {/* Shutter Button representation */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleClick();
          }}
          style={{
            width: "80px", height: "80px", borderRadius: "50%",
            background: `radial-gradient(circle, #E03E3E 0%, #B81D1D 100%)`,
            border: "4px solid #ffffff",
            boxShadow: "0 10px 30px rgba(184, 29, 29, 0.4), inset 0 4px 8px rgba(255,255,255,0.3)",
            cursor: "pointer",
            outline: "none",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: "var(--font-inter), sans-serif",
            fontSize: "9px", fontWeight: 700, color: "#ffffff",
            textTransform: "uppercase", letterSpacing: "0.08em",
            transition: "transform 0.1s, box-shadow 0.1s",
          }}
          onMouseDown={(e) => { e.currentTarget.style.transform = "scale(0.92)"; }}
          onMouseUp={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
          onTouchStart={(e) => { e.currentTarget.style.transform = "scale(0.92)"; }}
          onTouchEnd={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
        >
          {isEn ? "START MEMORY" : "ANAYI BAŞLAT"}
        </button>
      </div>

      {/* ── White Flash Overlay ── */}
      {phase === "rising" && (
        <div
          style={{
            position: "fixed", inset: 0,
            background: "#ffffff",
            zIndex: 10000,
            animation: "polaroidFlashAnim 1.3s cubic-bezier(0.1, 0.8, 0.2, 1) forwards",
            pointerEvents: "none",
          }}
        />
      )}

      <style>{`
        @keyframes polaroidFlashAnim {
          0% { opacity: 1; }
          30% { opacity: 1; }
          100% { opacity: 0; }
        }
      `}</style>
    </div>
  );
}

// ─── FROSTED GLASS — Buzlu Cam ────────────────────────────────────────────────
// Arka planı tamamen bulanıklaştırır ve tıklandığında/dokunulduğunda buğu eriyormuş gibi netleştirir.
function FrostedGlassEntrance({ accentColor, onEnter, reduced, isEn }: { accentColor: string; onEnter: () => void; reduced: boolean; isEn: boolean }) {
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
    return <CurtainEntrance accentColor={acc} onEnter={onEnter} reduced={reduced} isEn={isEn} />;
  }
  if (type === "envelope") {
    return <EnvelopeEntrance accentColor={acc} coupleNames={coupleNames} onEnter={onEnter} reduced={reduced} isEn={isEn} />;
  }
  if (type === "light-gate") {
    return <PolaroidFlashEntrance accentColor={acc} onEnter={onEnter} reduced={reduced} isEn={isEn} />;
  }
  if (type === "frosted-glass") {
    return <FrostedGlassEntrance accentColor={acc} onEnter={onEnter} reduced={reduced} isEn={isEn} />;
  }
  return null;
}
