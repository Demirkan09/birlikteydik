"use client";

import { use, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  HiOutlineLockClosed,
  HiOutlineEye,
  HiOutlineEyeOff,
  HiOutlineCheckCircle,
  HiOutlineExclamationCircle,
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

// ─── Password Input bileşeni ─────────────────────────────────────────────────
function PasswordInput({
  label, value, onChange, placeholder, error, show, onToggleShow,
}: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; error?: string; show: boolean; onToggleShow: () => void;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
      <label style={{ fontFamily: "var(--font-inter), sans-serif", fontSize: "11px", letterSpacing: "0.12em", textTransform: "uppercase", color: focused ? C.gold : C.muted, fontWeight: 500, transition: "color 0.2s" }}>{label}</label>
      <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
        <span style={{ position: "absolute", left: "16px", color: focused ? C.gold : "rgba(240,237,232,0.3)", transition: "color 0.2s", pointerEvents: "none", display: "flex" }}>
          <HiOutlineLockClosed size={17} />
        </span>
        <input
          type={show ? "text" : "password"} value={value} placeholder={placeholder}
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          onChange={(e) => onChange(e.target.value)}
          style={{
            width: "100%", padding: "14px 48px 14px 44px",
            borderRadius: "12px", background: focused ? "rgba(201,168,76,0.05)" : C.card,
            border: `1px solid ${error ? C.error + "88" : focused ? C.gold + "55" : C.border}`,
            color: C.text, fontFamily: "var(--font-inter), sans-serif", fontSize: "14px", fontWeight: 300,
            outline: "none", transition: "all 0.25s", backdropFilter: "blur(8px)",
          }}
        />
        <span
          onClick={onToggleShow}
          style={{ position: "absolute", right: "14px", display: "flex", cursor: "pointer", color: "rgba(240,237,232,0.35)" }}
        >
          {show ? <HiOutlineEyeOff size={17} /> : <HiOutlineEye size={17} />}
        </span>
      </div>
      {error && <p style={{ fontFamily: "var(--font-inter), sans-serif", fontSize: "12px", color: C.error, fontWeight: 300 }}>{error}</p>}
    </div>
  );
}

// ─── Şifre Sıfırla Sayfası ───────────────────────────────────────────────────
export default function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const router = useRouter();
  const params = use(searchParams);
  const token = typeof params.token === "string" ? params.token : "";
  const type = typeof params.type === "string" ? params.type : "account";
  const slug = typeof params.slug === "string" ? params.slug : "";

  const isPageReset = type === "page";
  const title = isPageReset ? "Sayfa Şifreni Sıfırla" : "Hesap Şifreni Sıfırla";

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [state, setState] = useState<"idle" | "success" | "error">("idle");
  const [errors, setErrors] = useState<{ newPassword?: string; confirmPassword?: string; general?: string }>({});

  // Token yoksa hata göster
  useEffect(() => {
    if (!token) {
      setState("error");
      setErrors({ general: "Geçersiz veya eksik sıfırlama bağlantısı." });
    }
  }, [token]);

  const validate = () => {
    const e: typeof errors = {};
    if (!newPassword) e.newPassword = "Yeni şifre gerekli";
    else if (newPassword.length < 8) e.newPassword = "Şifre en az 8 karakter olmalı";
    if (!confirmPassword) e.confirmPassword = "Şifre tekrarı gerekli";
    else if (newPassword !== confirmPassword) e.confirmPassword = "Şifreler eşleşmiyor";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    setErrors({});
    try {
      const body: Record<string, string> = { token, newPassword, type };
      if (isPageReset && slug) body.slug = slug;
      const res = await fetch("/api/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.error?.toLowerCase().includes("expired") || data.error?.toLowerCase().includes("geçersiz")) {
          setState("error");
          setErrors({ general: data.error ?? "Bağlantı süresi dolmuş veya geçersiz." });
        } else {
          setErrors({ general: data.error ?? "Şifre sıfırlanırken bir hata oluştu." });
        }
        setLoading(false);
        return;
      }
      setState("success");
    } catch {
      setErrors({ general: "Sunucuya bağlanılamadı. İnternet bağlantını kontrol et." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>

      {/* Arka plan */}
      <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none", background: "radial-gradient(ellipse 80% 60% at 70% 20%, rgba(201,168,76,0.06) 0%, transparent 60%), radial-gradient(ellipse 60% 50% at 20% 80%, rgba(184,169,212,0.05) 0%, transparent 55%), linear-gradient(160deg, #0B0F1A 0%, #0d1220 60%, #0a0d18 100%)" }} />
      <HeartsCanvas />

      <main style={{ position: "relative", zIndex: 1, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "80px 24px 40px" }}>
        <motion.div
          initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          style={{ width: "100%", maxWidth: "460px" }}
        >
          {/* Kart */}
          <div style={{ background: "rgba(255,255,255,0.035)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "24px", padding: "clamp(28px, 5vw, 44px)", backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)", boxShadow: "0 32px 80px rgba(0,0,0,0.4)" }}>

            <AnimatePresence mode="wait">
              {/* ── Başarı ── */}
              {state === "success" && (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }} transition={{ duration: 0.45 }}
                  style={{ textAlign: "center", padding: "12px 0" }}
                >
                  <div style={{ display: "flex", justifyContent: "center", marginBottom: "20px" }}>
                    <motion.div
                      initial={{ scale: 0 }} animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.1 }}
                      style={{ width: "72px", height: "72px", borderRadius: "50%", background: "rgba(134,239,172,0.1)", border: "1px solid rgba(134,239,172,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}
                    >
                      <HiOutlineCheckCircle size={36} color={C.success} />
                    </motion.div>
                  </div>
                  <h2 style={{ fontFamily: "'Cormorant Garamond', 'Cormorant Garamond Fallback', serif", fontSize: "clamp(1.6rem, 4vw, 2.1rem)", fontWeight: 600, color: C.text, marginBottom: "12px" }}>
                    Şifren <em style={{ color: C.gold, fontStyle: "italic" }}>Güncellendi!</em>
                  </h2>
                  <p style={{ fontFamily: "var(--font-inter), sans-serif", fontSize: "14px", color: C.muted, fontWeight: 300, lineHeight: 1.7, marginBottom: "28px" }}>
                    {isPageReset
                      ? "Sayfa şifresi başarıyla sıfırlandı. Artık yeni şifrenle sayfaya erişebilirsin."
                      : "Hesap şifresi başarıyla güncellendi. Şimdi giriş yapabilirsin."}
                  </p>
                  <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
                    <Link
                      href="/login"
                      style={{ display: "inline-block", padding: "13px 28px", borderRadius: "30px", background: C.gold, color: "#0B0F1A", fontFamily: "var(--font-inter), sans-serif", fontSize: "13px", letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 600, textDecoration: "none" }}
                    >
                      Giriş Yap
                    </Link>
                    {isPageReset && slug && (
                      <button
                        onClick={() => router.push(`/${slug}`)}
                        style={{ padding: "13px 28px", borderRadius: "30px", border: `1px solid ${C.border}`, background: "transparent", color: C.text, fontFamily: "var(--font-inter), sans-serif", fontSize: "13px", letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 500, cursor: "pointer" }}
                      >
                        Sayfaya Git
                      </button>
                    )}
                    {!isPageReset && (
                      <button
                        onClick={() => router.push("/profil")}
                        style={{ padding: "13px 28px", borderRadius: "30px", border: `1px solid ${C.border}`, background: "transparent", color: C.text, fontFamily: "var(--font-inter), sans-serif", fontSize: "13px", letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 500, cursor: "pointer" }}
                      >
                        Profilim
                      </button>
                    )}
                  </div>
                </motion.div>
              )}

              {/* ── Hata (token süresi dolmuş) ── */}
              {state === "error" && (
                <motion.div
                  key="error-state"
                  initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }} transition={{ duration: 0.45 }}
                  style={{ textAlign: "center", padding: "12px 0" }}
                >
                  <div style={{ display: "flex", justifyContent: "center", marginBottom: "20px" }}>
                    <motion.div
                      initial={{ scale: 0 }} animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.1 }}
                      style={{ width: "72px", height: "72px", borderRadius: "50%", background: "rgba(232,160,160,0.1)", border: "1px solid rgba(232,160,160,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}
                    >
                      <HiOutlineExclamationCircle size={36} color={C.error} />
                    </motion.div>
                  </div>
                  <h2 style={{ fontFamily: "'Cormorant Garamond', 'Cormorant Garamond Fallback', serif", fontSize: "clamp(1.5rem, 4vw, 2rem)", fontWeight: 600, color: C.text, marginBottom: "12px" }}>
                    Bağlantı <em style={{ color: C.error, fontStyle: "italic" }}>Geçersiz</em>
                  </h2>
                  <p style={{ fontFamily: "var(--font-inter), sans-serif", fontSize: "14px", color: C.muted, fontWeight: 300, lineHeight: 1.7, marginBottom: "28px" }}>
                    {errors.general ?? "Bu şifre sıfırlama bağlantısı süresi dolmuş veya zaten kullanılmış. Lütfen yeni bir bağlantı talep et."}
                  </p>
                  <Link
                    href="/forgot-password"
                    style={{ display: "inline-block", padding: "13px 32px", borderRadius: "30px", background: C.gold, color: "#0B0F1A", fontFamily: "var(--font-inter), sans-serif", fontSize: "13px", letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 600, textDecoration: "none" }}
                  >
                    Yeni Bağlantı İste
                  </Link>
                </motion.div>
              )}

              {/* ── Form ── */}
              {state === "idle" && (
                <motion.div
                  key="form"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Başlık */}
                  <div style={{ textAlign: "center", marginBottom: "32px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", justifyContent: "center", marginBottom: "16px" }}>
                      <div style={{ height: "1px", width: "28px", background: C.gold + "66" }} />
                      <span style={{ fontFamily: "var(--font-inter), sans-serif", fontSize: "10px", letterSpacing: "0.38em", textTransform: "uppercase", color: C.gold, fontWeight: 500 }}>
                        {isPageReset ? "Sayfa Şifresi" : "Hesap Şifresi"}
                      </span>
                      <div style={{ height: "1px", width: "28px", background: C.gold + "66" }} />
                    </div>
                    <h1 style={{ fontFamily: "'Cormorant Garamond', 'Cormorant Garamond Fallback', serif", fontSize: "clamp(1.6rem, 5vw, 2.2rem)", fontWeight: 600, color: C.text, lineHeight: 1.15 }}>
                      {isPageReset
                        ? <><em style={{ color: C.gold, fontStyle: "italic" }}>Sayfa</em> Şifreni Sıfırla</>
                        : <><em style={{ color: C.gold, fontStyle: "italic" }}>Hesap</em> Şifreni Sıfırla</>}
                    </h1>
                    <p style={{ fontFamily: "var(--font-inter), sans-serif", fontSize: "13px", color: C.muted, fontWeight: 300, marginTop: "8px", lineHeight: 1.6 }}>
                      Yeni şifreni belirle.
                    </p>
                  </div>

                  {/* Form */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
                    {errors.general && (
                      <div style={{ padding: "12px 16px", borderRadius: "10px", background: C.error + "12", border: `1px solid ${C.error}44`, fontFamily: "var(--font-inter), sans-serif", fontSize: "13px", color: C.error, fontWeight: 300 }}>
                        {errors.general}
                      </div>
                    )}

                    <PasswordInput
                      label="Yeni Şifre" value={newPassword} onChange={setNewPassword}
                      placeholder="En az 8 karakter" error={errors.newPassword}
                      show={showNew} onToggleShow={() => setShowNew(!showNew)}
                    />

                    {/* Şifre güç çubuğu */}
                    {newPassword && (
                      <div style={{ marginTop: "-8px" }}>
                        <div style={{ height: "3px", borderRadius: "4px", background: "rgba(255,255,255,0.07)", overflow: "hidden", marginBottom: "6px" }}>
                          <div style={{
                            height: "100%", borderRadius: "4px", transition: "width 0.3s, background 0.3s",
                            width: `${Math.min((newPassword.length / 16) * 100, 100)}%`,
                            background: newPassword.length < 8 ? C.error : newPassword.length < 12 ? C.gold : C.success,
                          }} />
                        </div>
                        <span style={{ fontFamily: "var(--font-inter), sans-serif", fontSize: "11px", fontWeight: 300, color: newPassword.length < 8 ? C.error : newPassword.length < 12 ? C.gold : C.success }}>
                          {newPassword.length < 8 ? `Çok kısa (${newPassword.length}/8)` : newPassword.length < 12 ? "Yeterli" : "Güçlü ✓"}
                        </span>
                      </div>
                    )}

                    <PasswordInput
                      label="Şifre Tekrar" value={confirmPassword} onChange={setConfirmPassword}
                      placeholder="Şifreni tekrar gir" error={errors.confirmPassword}
                      show={showConfirm} onToggleShow={() => setShowConfirm(!showConfirm)}
                    />

                    <button
                      onClick={handleSubmit} disabled={loading}
                      style={{
                        width: "100%", padding: "15px", borderRadius: "30px", border: "none",
                        background: loading ? "rgba(201,168,76,0.5)" : C.gold, color: "#0B0F1A",
                        fontFamily: "var(--font-inter), sans-serif", fontSize: "13px", letterSpacing: "0.12em",
                        textTransform: "uppercase", fontWeight: 600, cursor: loading ? "not-allowed" : "pointer",
                        transition: "opacity 0.2s, background 0.2s", marginTop: "4px",
                        display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                      }}
                      onMouseEnter={(e) => { if (!loading) e.currentTarget.style.opacity = "0.85"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
                    >
                      {loading ? (
                        <><span style={{ width: "16px", height: "16px", border: "2px solid #0B0F1A44", borderTopColor: "#0B0F1A", borderRadius: "50%", animation: "spin 0.7s linear infinite", display: "inline-block" }} />Güncelleniyor…</>
                      ) : "Şifremi Güncelle"}
                    </button>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "14px", margin: "24px 0 16px" }}>
                    <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.06)" }} />
                    <span style={{ fontFamily: "var(--font-inter), sans-serif", fontSize: "11px", color: "rgba(240,237,232,0.2)", letterSpacing: "0.06em" }}>veya</span>
                    <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.06)" }} />
                  </div>
                  <p style={{ textAlign: "center", fontFamily: "var(--font-inter), sans-serif", fontSize: "13px", color: C.muted, fontWeight: 300 }}>
                    <Link href="/forgot-password" style={{ color: C.gold, textDecoration: "none", fontWeight: 500 }}>Yeni sıfırlama bağlantısı iste</Link>
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <p style={{ textAlign: "center", marginTop: "24px", fontFamily: "var(--font-inter), sans-serif", fontSize: "11px", color: "rgba(240,237,232,0.18)", letterSpacing: "0.06em" }}>
            {title}
          </p>
        </motion.div>
      </main>

      {/* Footer */}
      <footer style={{ position: "relative", zIndex: 1, borderTop: "1px solid rgba(255,255,255,0.05)", padding: "20px 24px", display: "flex", alignItems: "center", justifyContent: "center", gap: "16px" }}>
        <FaHeart size={10} color="rgba(232,160,160,0.25)" />
        <p style={{ fontFamily: "var(--font-inter), sans-serif", fontSize: "11px", color: "rgba(240,237,232,0.18)", letterSpacing: "0.08em" }}>© {new Date().getFullYear()} birlikteydik.com</p>
      </footer>
    </>
  );
}
