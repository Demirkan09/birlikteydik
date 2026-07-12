"use client";

import { useEffect, useState, useRef } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────
export type EntranceType = "curtain" | "envelope" | "light-gate";

interface EntranceScreenProps {
  type: EntranceType;
  accentColor?: string;
  coupleNames?: string;
  onEnter: () => void;
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
function CurtainEntrance({ accentColor, onEnter, reduced }: { accentColor: string; onEnter: () => void; reduced: boolean }) {
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
            Seni Bekliyordum
          </span>
          <span style={{
            fontFamily: "var(--font-inter), 'Inter', sans-serif",
            fontSize: "11px",
            letterSpacing: "0.3em",
            textTransform: "uppercase",
            color: `${acc}99`,
            fontWeight: 400,
          }}>
            Dokunmak İçin Tıkla
          </span>
        </div>

        {/* Animated chevrons */}
        <div style={{ display: "flex", gap: "6px", marginTop: "4px" }}>
          {[0, 1, 2].map((i) => (
            <div key={i} style={{
              width: "6px", height: "6px", borderRight: `1.5px solid ${acc}`,
              borderBottom: `1.5px solid ${acc}`, transform: "rotate(45deg)",
              animation: `curtainChevron 1.6s ease-in-out ${i * 0.2}s infinite`,
              opacity: 0.7,
            }} />
          ))}
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
function EnvelopeEntrance({ accentColor, coupleNames, onEnter, reduced }: { accentColor: string; coupleNames?: string; onEnter: () => void; reduced: boolean }) {
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
  const names = coupleNames?.replace(/\n/g, " · ").replace(/&/g, "♥") || "Sana Özel";

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

          {/* Envelope interior */}
          <div style={{
            padding: "clamp(50px, 14vw, 65px) clamp(20px, 6vw, 32px) clamp(24px, 6vw, 32px)",
            minHeight: "clamp(160px, 42vw, 200px)",
            display: "flex", flexDirection: "column", alignItems: "center",
            justifyContent: "flex-end", gap: "12px",
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

            <div style={{ position: "relative", zIndex: 2 }}>
              <div style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "clamp(1rem, 4vw, 1.3rem)",
                color: "#2D1F0A",
                fontWeight: 500,
                letterSpacing: "0.06em",
                fontStyle: "italic",
                marginBottom: "4px",
              }}>
                {names}
              </div>
              <div style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: "9px",
                letterSpacing: "0.28em",
                textTransform: "uppercase",
                color: "#8B7355",
              }}>
                Sana Özel · Aç Beni
              </div>
            </div>
          </div>
        </div>

        {/* Call-to-action below */}
        <div style={{
          marginTop: "32px", textAlign: "center",
          opacity: phase === "idle" ? 1 : 0,
          transition: "opacity 0.3s",
        }}>
          <div style={{
            fontFamily: "var(--font-inter), 'Inter', sans-serif",
            fontSize: "11px", letterSpacing: "0.3em", textTransform: "uppercase",
            color: `${acc}88`,
          }}>
            Zarfı Aç
          </div>
          <div style={{
            display: "flex", justifyContent: "center", gap: "6px", marginTop: "10px",
          }}>
            {[0, 1, 2].map((i) => (
              <div key={i} style={{
                width: "5px", height: "5px",
                borderRight: `1.5px solid ${acc}`, borderBottom: `1.5px solid ${acc}`,
                transform: "rotate(45deg)",
                animation: `curtainChevron 1.6s ease-in-out ${i * 0.22}s infinite`,
                opacity: 0.6,
              }} />
            ))}
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

// ─── LIGHT GATE — Işık Kapısı ─────────────────────────────────────────────────
function LightGateEntrance({ accentColor, onEnter, reduced }: { accentColor: string; onEnter: () => void; reduced: boolean }) {
  const [opening, setOpening] = useState(false);
  const [done, setDone] = useState(false);
  const [flicker, setFlicker] = useState(false);

  useEffect(() => {
    if (reduced) return;
    // Subtle ambient flicker on the glow
    const id = setInterval(() => {
      setFlicker((v) => !v);
    }, 1800 + Math.random() * 1200);
    return () => clearInterval(id);
  }, [reduced]);

  const handleClick = () => {
    if (opening) return;
    setOpening(true);
    if (reduced) {
      setTimeout(() => { setDone(true); onEnter(); }, 400);
    } else {
      setTimeout(() => { setDone(true); onEnter(); }, 1300);
    }
  };

  if (done) return null;

  const acc = accentColor || "#C9A84C";

  return (
    <div
      onClick={handleClick}
      style={{
        position: "fixed", inset: 0, zIndex: 9999, cursor: "pointer",
        display: "flex", alignItems: "center", justifyContent: "center",
        overflow: "hidden", userSelect: "none",
        background: "#020408",
      }}
    >
      {/* Left panel */}
      <div style={{
        position: "absolute", top: 0, left: 0, width: "50%", height: "100%",
        background: "linear-gradient(to right, #020408 0%, #0D1120 85%, #141928 100%)",
        transformOrigin: "left center",
        transform: opening && !reduced ? "translateX(-100%)" : "translateX(0)",
        transition: opening ? "transform 1.0s cubic-bezier(0.6, 0, 0.4, 1)" : "none",
        zIndex: 2,
        boxShadow: opening ? "none" : `inset -1px 0 0 ${acc}22, inset -20px 0 60px rgba(0,0,0,0.4)`,
      }}>
        {/* Door detail — vertical panel line */}
        <div style={{
          position: "absolute", top: "10%", bottom: "10%", right: "15%",
          width: "1px",
          background: `linear-gradient(to bottom, transparent, ${acc}33, ${acc}55, ${acc}33, transparent)`,
        }} />
        <div style={{
          position: "absolute", top: "35%", bottom: "35%", right: "18%",
          width: "1px",
          background: `linear-gradient(to bottom, transparent, ${acc}22, transparent)`,
        }} />
        {/* Door handle */}
        <div style={{
          position: "absolute", top: "50%", right: "8%",
          transform: "translateY(-50%)",
          width: "8px", height: "28px", borderRadius: "4px",
          background: `linear-gradient(to bottom, ${acc}44, ${acc}88, ${acc}44)`,
          boxShadow: `0 0 12px ${acc}33`,
        }} />
      </div>

      {/* Right panel */}
      <div style={{
        position: "absolute", top: 0, right: 0, width: "50%", height: "100%",
        background: "linear-gradient(to left, #020408 0%, #0D1120 85%, #141928 100%)",
        transformOrigin: "right center",
        transform: opening && !reduced ? "translateX(100%)" : "translateX(0)",
        transition: opening ? "transform 1.0s cubic-bezier(0.6, 0, 0.4, 1)" : "none",
        zIndex: 2,
        boxShadow: opening ? "none" : `inset 1px 0 0 ${acc}22, inset 20px 0 60px rgba(0,0,0,0.4)`,
      }}>
        <div style={{
          position: "absolute", top: "10%", bottom: "10%", left: "15%",
          width: "1px",
          background: `linear-gradient(to bottom, transparent, ${acc}33, ${acc}55, ${acc}33, transparent)`,
        }} />
        <div style={{
          position: "absolute", top: "35%", bottom: "35%", left: "18%",
          width: "1px",
          background: `linear-gradient(to bottom, transparent, ${acc}22, transparent)`,
        }} />
        <div style={{
          position: "absolute", top: "50%", left: "8%",
          transform: "translateY(-50%)",
          width: "8px", height: "28px", borderRadius: "4px",
          background: `linear-gradient(to bottom, ${acc}44, ${acc}88, ${acc}44)`,
          boxShadow: `0 0 12px ${acc}33`,
        }} />
      </div>

      {/* Center seam glow */}
      {!opening && (
        <div style={{
          position: "absolute", top: 0, bottom: 0, left: "50%",
          transform: "translateX(-50%)",
          width: "2px", zIndex: 3, pointerEvents: "none",
          background: `linear-gradient(to bottom, transparent 5%, ${acc}${flicker ? "66" : "88"} 20%, ${acc}${flicker ? "44" : "66"} 80%, transparent 95%)`,
          boxShadow: `0 0 20px 4px ${acc}${flicker ? "22" : "33"}`,
          transition: "all 0.8s ease",
        }} />
      )}

      {/* Center label */}
      <div style={{
        position: "relative", zIndex: 4,
        display: "flex", flexDirection: "column", alignItems: "center", gap: "16px",
        opacity: opening ? 0 : 1,
        transition: "opacity 0.35s ease",
        textAlign: "center", padding: "0 24px",
      }}>
        <div style={{
          width: "56px", height: "56px", borderRadius: "50%",
          border: `1px solid ${acc}44`,
          display: "flex", alignItems: "center", justifyContent: "center",
          background: `radial-gradient(circle, ${acc}11 0%, transparent 70%)`,
          boxShadow: `0 0 40px ${acc}22`,
          animation: "gatePulse 2.8s ease-in-out infinite",
        }}>
          <SparkleIcon color={acc} size={22} />
        </div>
        <div>
          <div style={{
            fontFamily: "'Cormorant Garamond', 'Cormorant Garamond Fallback', serif",
            fontSize: "clamp(1.8rem, 5.5vw, 2.8rem)",
            fontWeight: 400, color: "#F0EDE8",
            letterSpacing: "0.04em", lineHeight: 1.15,
            marginBottom: "10px",
          }}>
            Kapıyı Aç
          </div>
          <div style={{
            fontFamily: "var(--font-inter), 'Inter', sans-serif",
            fontSize: "10px", letterSpacing: "0.32em", textTransform: "uppercase",
            color: `${acc}88`,
          }}>
            Tıkla &amp; Keşfet
          </div>
        </div>
        <div style={{ display: "flex", gap: "6px", marginTop: "4px" }}>
          {[0, 1, 2].map((i) => (
            <div key={i} style={{
              width: "5px", height: "5px",
              borderRight: `1.5px solid ${acc}`, borderBottom: `1.5px solid ${acc}`,
              transform: "rotate(45deg)",
              animation: `curtainChevron 1.6s ease-in-out ${i * 0.22}s infinite`,
              opacity: 0.65,
            }} />
          ))}
        </div>
      </div>

      <style>{`
        @keyframes gatePulse {
          0%, 100% { box-shadow: 0 0 40px ${acc}22; transform: scale(1); }
          50% { box-shadow: 0 0 60px ${acc}44; transform: scale(1.06); }
        }
        @keyframes curtainChevron {
          0%, 100% { opacity: 0.3; transform: rotate(45deg) translateY(0px); }
          50% { opacity: 0.9; transform: rotate(45deg) translateY(4px); }
        }
        @media (prefers-reduced-motion: reduce) {
          @keyframes gatePulse { 0%,100%{ opacity:1; } }
          @keyframes curtainChevron { 0%,100%{ opacity:0.6; } }
        }
      `}</style>
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────
export default function EntranceScreen({ type, accentColor, coupleNames, onEnter }: EntranceScreenProps) {
  const reduced = useReducedMotion();
  const acc = accentColor || "#C9A84C";

  if (type === "curtain") {
    return <CurtainEntrance accentColor={acc} onEnter={onEnter} reduced={reduced} />;
  }
  if (type === "envelope") {
    return <EnvelopeEntrance accentColor={acc} coupleNames={coupleNames} onEnter={onEnter} reduced={reduced} />;
  }
  if (type === "light-gate") {
    return <LightGateEntrance accentColor={acc} onEnter={onEnter} reduced={reduced} />;
  }
  return null;
}
