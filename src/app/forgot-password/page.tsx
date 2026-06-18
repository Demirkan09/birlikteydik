"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  HiOutlineMail,
  HiOutlineCheckCircle,
  HiOutlineGlobe,
  HiOutlineUser,
} from "react-icons/hi";
import { FaHeart } from "react-icons/fa";

// ─── Design tokens ───────────────────────────────────────────────────────────
const C = {
  bg: "#0B0F1A",
  gold: "#C9A84C",
  text: "#F0EDE8",
  muted: "rgba(240,237,232,0.45)",
  border: "rgba(255,255,255,0.08)",
  card: "rgba(255,255,255,0.04)",
  error: "#E8A0A0",
  success: "#86efac",
};

// ─── Floating Hearts Canvas ──────────────────────────────────────────────────
type Particle = { x: number; y: number; size: number; speed: number; opacity: number; drift: number; phase: number };

function HeartsCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener("resize", resize);
    particlesRef.current = Array.from({ length: 20 }, () => ({
      x: Math.random() * window.innerWidth, y: Math.random() * window.innerHeight,
      size: Math.random() * 8 + 4, speed: Math.random() * 0.35 + 0.1,
      opacity: Math.random() * 0.12 + 0.03, drift: (Math.random() - 0.5) * 0.4, phase: Math.random() * Math.PI * 2,
    }));
    const drawHeart = (cx: number, cy: number, size: number, opacity: number, color: string) => {
      ctx.save(); ctx.globalAlpha = opacity; ctx.fillStyle = color; ctx.beginPath();
      ctx.moveTo(cx, cy + size * 0.3);
      ctx.bezierCurveTo(cx, cy, cx - size * 0.7, cy, cx - size * 0.7, cy - size * 0.4);
      ctx.bezierCurveTo(cx - size * 0.7, cy - size * 1.0, cx, cy - size * 0.9, cx, cy - size * 0.5);
      ctx.bezierCurveTo(cx, cy - size * 0.9, cx + size * 0.7, cy - size * 1.0, cx + size * 0.7, cy - size * 0.4);
      ctx.bezierCurveTo(cx + size * 0.7, cy, cx, cy, cx, cy + size * 0.3);
      ctx.fill(); ctx.restore();
    };
    const colors = ["#C9A84C", "#E8A0A0", "#B8A9D4"];
    let t = 0;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height); t += 0.008;
      particlesRef.current.forEach((p, i) => {
        p.y -= p.speed; p.x += Math.sin(t + p.phase) * p.drift;
        if (p.y < -20) { p.y = canvas.height + 10; p.x = Math.random() * canvas.width; }
        drawHeart(p.x, p.y, p.size, p.opacity, colors[i % colors.length]);
      });
      rafRef.current = requestAnimationFrame(animate);
    };
    animate();
    return () => { window.removeEventListener("resize", resize); cancelAnimationFrame(rafRef.current); };
  }, []);

  return <canvas ref={canvasRef} style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }} />;
}

// ─── Input bileşeni ──────────────────────────────────────────────────────────
function Input({
  label, type = "text", value, onChange, placeholder, icon, error, prefix,
}: {
  label: string; type?: string; value: string; onChange: (v: string) => void;
  placeholder?: string; icon: React.ReactNode; error?: string; prefix?: string;
}) {
  const [focused, setFocused] = useState(false);
  const prefixWidth = prefix ? prefix.length * 7.8 + 8 : 0;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
      <label style={{ fontFamily: "'Inter', sans-serif", fontSize: "11px", letterSpacing: "0.12em", textTransform: "uppercase", color: focused ? C.gold : C.muted, fontWeight: 500, transition: "color 0.2s" }}>{label}</label>
      <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
        <span style={{ position: "absolute", left: "16px", color: focused ? C.gold : "rgba(240,237,232,0.3)", transition: "color 0.2s", pointerEvents: "none", display: "flex", zIndex: 1 }}>{icon}</span>
        {prefix && (
          <span style={{
            position: "absolute", left: "44px", fontFamily: "'Inter', sans-serif", fontSize: "13px",
            color: "rgba(240,237,232,0.3)", pointerEvents: "none", whiteSpace: "nowrap", zIndex: 1,
          }}>{prefix}</span>
        )}
        <input
          type={type} value={value} placeholder={placeholder}
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          onChange={(e) => onChange(e.target.value)}
          style={{
            width: "100%",
            padding: `14px 16px 14px ${prefix ? `${44 + prefixWidth}px` : "44px"}`,
            borderRadius: "12px", background: focused ? "rgba(201,168,76,0.05)" : C.card,
            border: `1px solid ${error ? C.error + "88" : focused ? C.gold + "55" : C.border}`,
            color: C.text, fontFamily: "'Inter', sans-serif", fontSize: "14px", fontWeight: 300,
            outline: "none", transition: "all 0.25s", backdropFilter: "blur(8px)",
          }}
        />
      </div>
      {error && <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "12px", color: C.error, fontWeight: 300 }}>{error}</p>}
    </div>
  );
}

// ─── Şifremi Unuttum Sayfası ─────────────────────────────────────────────────
type Mode = "account" | "page";

export default function ForgotPasswordPage() {
  const [mode, setMode] = useState<Mode>("account");
  const [email, setEmail] = useState("");
  const [pageSlug, setPageSlug] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; pageSlug?: string; general?: string }>({});

  const validate = () => {
    const e: typeof errors = {};
    if (!email) e.email = "E-posta adresi gerekli";
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = "Geçerli bir e-posta gir";
    if (mode === "page" && !pageSlug.trim()) e.pageSlug = "Sayfa adresi gerekli";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    setErrors({});
    try {
      const body: Record<string, string> = { email: email.toLowerCase().trim(), type: mode };
      if (mode === "page") body.pageSlug = pageSlug.trim().toLowerCase();
      const res = await fetch("/api/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrors({ general: data.error ?? "Bir hata oluştu. Tekrar dene." });
        setLoading(false);
        return;
      }
      setSuccess(true);
    } catch {
      setErrors({ general: "Sunucuya bağlanılamadı. İnternet bağlantını kontrol et." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,600&family=Inter:wght@300;400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body { background: ${C.bg}; overflow-x: hidden; color: ${C.text}; }
        ::selection { background: rgba(201,168,76,0.28); color: ${C.text}; }
        input::placeholder { color: rgba(240,237,232,0.2); }
        input:-webkit-autofill { -webkit-box-shadow: 0 0 0 100px #0d1220 inset !important; -webkit-text-fill-color: #F0EDE8 !important; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      {/* Arka plan */}
      <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none", background: "radial-gradient(ellipse 80% 60% at 30% 20%, rgba(201,168,76,0.07) 0%, transparent 60%), radial-gradient(ellipse 60% 50% at 80% 80%, rgba(232,160,160,0.05) 0%, transparent 55%), linear-gradient(160deg, #0B0F1A 0%, #0d1220 60%, #0a0d18 100%)" }} />
      <HeartsCanvas />

      {/* Ana içerik */}
      <main style={{ position: "relative", zIndex: 1, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "80px 24px 40px" }}>
        <motion.div
          initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          style={{ width: "100%", maxWidth: "460px" }}
        >
          {/* Kart */}
          <div style={{ background: "rgba(255,255,255,0.035)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "24px", padding: "clamp(28px, 5vw, 44px)", backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)", boxShadow: "0 32px 80px rgba(0,0,0,0.4)" }}>

            <AnimatePresence mode="wait">
              {success ? (
                /* Başarı Durumu */
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.45 }}
                  style={{ textAlign: "center", padding: "12px 0" }}
                >
                  <div style={{ display: "flex", justifyContent: "center", marginBottom: "20px" }}>
                    <motion.div
                      initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.1 }}
                      style={{
                        width: "72px", height: "72px", borderRadius: "50%",
                        background: "rgba(201,168,76,0.12)", border: "1px solid rgba(201,168,76,0.35)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}
                    >
                      <HiOutlineCheckCircle size={36} color={C.gold} />
                    </motion.div>
                  </div>
                  <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(1.6rem, 4vw, 2.1rem)", fontWeight: 600, color: C.text, marginBottom: "12px" }}>
                    E-posta <em style={{ color: C.gold, fontStyle: "italic" }}>Gönderildi!</em>
                  </h2>
                  <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "14px", color: C.muted, fontWeight: 300, lineHeight: 1.7, marginBottom: "28px" }}>
                    Gelen kutunuzu kontrol edin. Şifre sıfırlama bağlantısı birkaç dakika içinde ulaşacak.
                  </p>
                  <Link
                    href="/login"
                    style={{
                      display: "inline-block", padding: "13px 36px", borderRadius: "30px",
                      background: C.gold, color: "#0B0F1A", fontFamily: "'Inter', sans-serif",
                      fontSize: "13px", letterSpacing: "0.12em", textTransform: "uppercase",
                      fontWeight: 600, textDecoration: "none",
                    }}
                  >
                    Giriş Yap
                  </Link>
                </motion.div>
              ) : (
                /* Form Durumu */
                <motion.div
                  key="form"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Başlık */}
                  <div style={{ textAlign: "center", marginBottom: "28px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", justifyContent: "center", marginBottom: "16px" }}>
                      <div style={{ height: "1px", width: "28px", background: C.gold + "66" }} />
                      <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "10px", letterSpacing: "0.38em", textTransform: "uppercase", color: C.gold, fontWeight: 500 }}>Şifre Sıfırlama</span>
                      <div style={{ height: "1px", width: "28px", background: C.gold + "66" }} />
                    </div>
                    <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(1.7rem, 5vw, 2.2rem)", fontWeight: 600, color: C.text, lineHeight: 1.15 }}>
                      Şifremi <em style={{ color: C.gold, fontStyle: "italic" }}>Unuttum</em>
                    </h1>
                    <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "13px", color: C.muted, fontWeight: 300, marginTop: "8px", lineHeight: 1.6 }}>
                      E-postanı gir, sana sıfırlama bağlantısı gönderelim.
                    </p>
                  </div>

                  {/* Tab seçici */}
                  <div style={{
                    display: "flex", gap: "4px", padding: "4px", borderRadius: "14px",
                    background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)",
                    marginBottom: "24px",
                  }}>
                    {(["account", "page"] as Mode[]).map((m) => (
                      <button
                        key={m}
                        onClick={() => { setMode(m); setErrors({}); }}
                        style={{
                          flex: 1, padding: "10px 8px", borderRadius: "10px", border: "none",
                          background: mode === m ? C.gold : "transparent",
                          color: mode === m ? "#0B0F1A" : C.muted,
                          fontFamily: "'Inter', sans-serif", fontSize: "12px",
                          fontWeight: mode === m ? 600 : 400, letterSpacing: "0.06em",
                          cursor: "pointer", transition: "all 0.2s",
                          display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
                        }}
                      >
                        {m === "account" ? <><HiOutlineUser size={14} />Hesap Şifresi</> : <><HiOutlineGlobe size={14} />Sayfa Şifresi</>}
                      </button>
                    ))}
                  </div>

                  {/* Form alanları */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    {errors.general && (
                      <div style={{ padding: "12px 16px", borderRadius: "10px", background: C.error + "12", border: `1px solid ${C.error}44`, fontFamily: "'Inter', sans-serif", fontSize: "13px", color: C.error, fontWeight: 300 }}>
                        {errors.general}
                      </div>
                    )}

                    <Input
                      label="E-posta" type="email" value={email} onChange={setEmail}
                      placeholder="ornek@mail.com" icon={<HiOutlineMail size={17} />} error={errors.email}
                    />

                    <AnimatePresence>
                      {mode === "page" && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.25 }}
                          style={{ overflow: "hidden" }}
                        >
                          <Input
                            label="Sayfa Adresi" value={pageSlug} onChange={setPageSlug}
                            placeholder="demirkanmelis" icon={<HiOutlineGlobe size={17} />}
                            error={errors.pageSlug} prefix="birlikteydik.com/"
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <button
                      onClick={handleSubmit} disabled={loading}
                      style={{
                        width: "100%", padding: "15px", borderRadius: "30px", border: "none",
                        background: loading ? "rgba(201,168,76,0.5)" : C.gold, color: "#0B0F1A",
                        fontFamily: "'Inter', sans-serif", fontSize: "13px", letterSpacing: "0.12em",
                        textTransform: "uppercase", fontWeight: 600, cursor: loading ? "not-allowed" : "pointer",
                        transition: "opacity 0.2s, background 0.2s", marginTop: "4px",
                        display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                      }}
                      onMouseEnter={(e) => { if (!loading) e.currentTarget.style.opacity = "0.85"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
                    >
                      {loading ? (
                        <><span style={{ width: "16px", height: "16px", border: "2px solid #0B0F1A44", borderTopColor: "#0B0F1A", borderRadius: "50%", animation: "spin 0.7s linear infinite", display: "inline-block" }} />Gönderiliyor…</>
                      ) : "Sıfırlama Bağlantısı Gönder"}
                    </button>
                  </div>

                  {/* Divider + Giriş Yap linki */}
                  <div style={{ display: "flex", alignItems: "center", gap: "14px", margin: "24px 0 16px" }}>
                    <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.06)" }} />
                    <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "11px", color: "rgba(240,237,232,0.2)", letterSpacing: "0.06em" }}>veya</span>
                    <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.06)" }} />
                  </div>
                  <p style={{ textAlign: "center", fontFamily: "'Inter', sans-serif", fontSize: "13px", color: C.muted, fontWeight: 300 }}>
                    Şifreni hatırladın mı?{" "}
                    <Link href="/login" style={{ color: C.gold, textDecoration: "none", fontWeight: 500 }}>Giriş Yap</Link>
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Alt bilgi */}
          <p style={{ textAlign: "center", marginTop: "24px", fontFamily: "'Inter', sans-serif", fontSize: "11px", color: "rgba(240,237,232,0.18)", letterSpacing: "0.06em" }}>
            Yardıma mı ihtiyacın var?{" "}
            <a href="mailto:destek@birlikteydik.com" style={{ color: C.gold + "66", textDecoration: "none" }}>İletişime geç</a>
          </p>
        </motion.div>
      </main>

      {/* Footer */}
      <footer style={{ position: "relative", zIndex: 1, borderTop: "1px solid rgba(255,255,255,0.05)", padding: "20px 24px", display: "flex", alignItems: "center", justifyContent: "center", gap: "16px" }}>
        <FaHeart size={10} color="rgba(232,160,160,0.25)" />
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "11px", color: "rgba(240,237,232,0.18)", letterSpacing: "0.08em" }}>© {new Date().getFullYear()} birlikteydik.com</p>
      </footer>
    </>
  );
}
