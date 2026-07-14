"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { HiOutlineMail, HiOutlineLockClosed, HiOutlineEye, HiOutlineEyeOff } from "react-icons/hi";
import { FaWhatsapp, FaInstagram, FaHeart } from "react-icons/fa";

// ─── Ortak stil değişkenleri (ana sayfayla aynı palet) ──────────────────────
const C = {
  bg: "#0B0F1A",
  gold: "#C9A84C",
  text: "#F0EDE8",
  muted: "rgba(240,237,232,0.45)",
  border: "rgba(255,255,255,0.08)",
  card: "rgba(255,255,255,0.04)",
  error: "#E8A0A0",
};

// ─── Floating hearts (aynı canvas componenti) ───────────────────────────────
import { useEffect, useRef } from "react";

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
  label, type = "text", value, onChange, placeholder, icon, error, rightElement,
}: {
  label: string; type?: string; value: string; onChange: (v: string) => void;
  placeholder?: string; icon: React.ReactNode; error?: string; rightElement?: React.ReactNode;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
      <label style={{ fontFamily: "var(--font-inter), sans-serif", fontSize: "11px", letterSpacing: "0.12em", textTransform: "uppercase", color: focused ? C.gold : C.muted, fontWeight: 500, transition: "color 0.2s" }}>{label}</label>
      <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
        <span style={{ position: "absolute", left: "16px", color: focused ? C.gold : "rgba(240,237,232,0.3)", transition: "color 0.2s", pointerEvents: "none", display: "flex" }}>{icon}</span>
        <input
          type={type} value={value} placeholder={placeholder}
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          onChange={(e) => onChange(e.target.value)}
          style={{
            width: "100%", padding: "14px 16px 14px 44px", paddingRight: rightElement ? "48px" : "16px",
            borderRadius: "12px", background: focused ? "rgba(201,168,76,0.05)" : C.card,
            border: `1px solid ${error ? C.error + "88" : focused ? C.gold + "55" : C.border}`,
            color: C.text, fontFamily: "var(--font-inter), sans-serif", fontSize: "14px", fontWeight: 300,
            outline: "none", transition: "all 0.25s", backdropFilter: "blur(8px)",
          }}
        />
        {rightElement && <span style={{ position: "absolute", right: "14px", display: "flex", cursor: "pointer", color: "rgba(240,237,232,0.35)" }}>{rightElement}</span>}
      </div>
      {error && <p style={{ fontFamily: "var(--font-inter), sans-serif", fontSize: "12px", color: C.error, fontWeight: 300 }}>{error}</p>}
    </div>
  );
}

// ─── Login Sayfası ───────────────────────────────────────────────────────────
// Beni Hatırla timeout süresi: 1 saat (milisaniye cinsinden)
const REMEMBER_ME_TTL = 60 * 60 * 1000;

export default function LoginPage({ lang }: { lang?: string }) {
  const isEn = lang === "en" || (typeof window !== "undefined" && window.location.pathname.startsWith("/en/"));

  const t = {
    eyebrow: isEn ? "Welcome Back" : "Hoş Geldin",
    heading: isEn ? "Sign In to Your Account" : "Hesabına Giriş Yap",
    emailLabel: isEn ? "Email Address" : "E-posta",
    emailPlaceholder: isEn ? "example@mail.com" : "ornek@mail.com",
    passLabel: isEn ? "Password" : "Şifre",
    rememberMe: isEn ? "Remember Me" : "Beni Hatırla",
    forgotPass: isEn ? "Forgot Password?" : "Şifremi Unuttum",
    loginBtn: isEn ? "Sign In" : "Giriş Yap",
    loginBtnLoading: isEn ? "Signing In..." : "Giriş Yapılıyor…",
    or: isEn ? "or" : "veya",
    noAccount: isEn ? "Don't have an account?" : "Hesabın yok mu?",
    registerLink: isEn ? "Register" : "Kayıt Ol",
    termsConsent: isEn 
      ? "By signing in, you accept our Terms & Conditions." 
      : "Giriş yaparak Kullanım Koşulları'nı kabul etmiş olursun.",
    termsLink: isEn ? "Terms & Conditions" : "Kullanım Koşulları",
    errEmailReq: isEn ? "Email address is required." : "E-posta adresi gerekli",
    errEmailValid: isEn ? "Please enter a valid email." : "Geçerli bir e-posta gir",
    errPassReq: isEn ? "Password is required." : "Şifre gerekli",
    errPassLen: isEn ? "Password must be at least 6 characters." : "Şifre en az 6 karakter olmalı",
    errGeneral: isEn ? "Incorrect email or password." : "E-posta veya şifre hatalı.",
    errServer: isEn ? "A server error occurred. Please try again." : "Giriş yapılırken sunucu hatası oluştu. Lütfen tekrar dene.",
  };

  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});

  // Sayfa açılışında kayıtlı oturumu kontrol et
  useEffect(() => {
    try {
      const saved = localStorage.getItem("birlikteydik_remember");
      if (saved) {
        const { email: savedEmail, expiresAt } = JSON.parse(saved);
        if (Date.now() < expiresAt) {
          // Süresi dolmamış — e-postayı doldur, checkbox'ı işaretle
          setEmail(savedEmail);
          setRememberMe(true);
        } else {
          // Süresi dolmuş — temizle
          localStorage.removeItem("birlikteydik_remember");
        }
      }
    } catch { /* ignore */ }
  }, []);

  const validate = () => {
    const e: typeof errors = {};
    if (!email) e.email = t.errEmailReq;
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = t.errEmailValid;
    if (!password) e.password = t.errPassReq;
    else if (password.length < 6) e.password = t.errPassLen;
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    setErrors({});
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.toLowerCase().trim(), password }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.unverified) {
          router.push((isEn ? "/en/verify-email" : "/verify-email") + `?email=${encodeURIComponent(email.toLowerCase().trim())}`);
          return;
        }
        setErrors({ general: data.error || t.errGeneral });
        setLoading(false);
        return;
      }

      localStorage.setItem("birlikteydik_user", JSON.stringify({
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        marketingConsent: data.user.marketingConsent,
      }));
      window.dispatchEvent(new Event("auth-change"));

      // Beni Hatırla
      if (rememberMe) {
        localStorage.setItem(
          "birlikteydik_remember",
          JSON.stringify({ email, expiresAt: Date.now() + REMEMBER_ME_TTL })
        );
      } else {
        localStorage.removeItem("birlikteydik_remember");
      }

      setLoading(false);
      router.push(isEn ? "/en/profil" : "/profil");
    } catch {
      setErrors({ general: t.errServer });
      setLoading(false);
    }
  };

  return (
    <>
      {/* Arka plan */}
      <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none", background: "radial-gradient(ellipse 80% 60% at 30% 20%, rgba(201,168,76,0.07) 0%, transparent 60%), radial-gradient(ellipse 60% 50% at 80% 80%, rgba(232,160,160,0.05) 0%, transparent 55%), linear-gradient(160deg, #0B0F1A 0%, #0d1220 60%, #0a0d18 100%)" }} />
      <HeartsCanvas />


      {/* Ana içerik */}
      <main style={{ position: "relative", zIndex: 1, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "80px 24px 40px" }}>
        <motion.div
          initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          style={{ width: "100%", maxWidth: "440px" }}
        >
          {/* Kart */}
          <div style={{ background: "rgba(255,255,255,0.035)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "24px", padding: "clamp(28px, 5vw, 44px)", backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)", boxShadow: "0 32px 80px rgba(0,0,0,0.4)" }}>

            {/* Başlık */}
            <div style={{ textAlign: "center", marginBottom: "36px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", justifyContent: "center", marginBottom: "16px" }}>
                <div style={{ height: "1px", width: "28px", background: C.gold + "66" }} />
                <span style={{ fontFamily: "var(--font-inter), sans-serif", fontSize: "10px", letterSpacing: "0.38em", textTransform: "uppercase", color: C.gold, fontWeight: 500 }}>{t.eyebrow}</span>
                <div style={{ height: "1px", width: "28px", background: C.gold + "66" }} />
              </div>
              <h1 style={{ fontFamily: "'Cormorant Garamond', 'Cormorant Garamond Fallback', serif", fontSize: "clamp(1.8rem, 5vw, 2.4rem)", fontWeight: 600, color: C.text, lineHeight: 1.15, letterSpacing: "-0.01em" }}>
                {isEn ? <>Sign In to <em style={{ color: C.gold, fontStyle: "italic" }}>Your Account</em></> : <>Hesabına <em style={{ color: C.gold, fontStyle: "italic" }}>Giriş Yap</em></>}
              </h1>
            </div>

            {/* Form */}
            <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
              {errors.general && (
                <div style={{ padding: "12px 16px", borderRadius: "10px", background: C.error + "12", border: `1px solid ${C.error}44`, fontFamily: "var(--font-inter), sans-serif", fontSize: "13px", color: C.error, fontWeight: 300 }}>
                  {errors.general}
                </div>
              )}

              <Input
                label={t.emailLabel} type="email" value={email} onChange={setEmail}
                placeholder={t.emailPlaceholder} icon={<HiOutlineMail size={17} />} error={errors.email}
              />
              <Input
                label={t.passLabel} type={showPass ? "text" : "password"} value={password} onChange={setPassword}
                placeholder="••••••••" icon={<HiOutlineLockClosed size={17} />} error={errors.password}
                rightElement={
                  <span onClick={() => setShowPass(!showPass)} style={{ color: "rgba(240,237,232,0.35)", display: "flex", cursor: "pointer" }}>
                    {showPass ? <HiOutlineEyeOff size={17} /> : <HiOutlineEye size={17} />}
                  </span>
                }
              />

              {/* Beni Hatırla + Şifremi Unuttum satırı */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <label
                  onClick={() => setRememberMe(!rememberMe)}
                  style={{ display: "flex", alignItems: "center", gap: "9px", cursor: "pointer", userSelect: "none" }}
                >
                  <div
                    style={{
                      width: "17px", height: "17px", borderRadius: "4px", flexShrink: 0,
                      border: `1px solid ${rememberMe ? C.gold + "88" : "rgba(255,255,255,0.18)"}`,
                      background: rememberMe ? C.gold + "22" : "transparent",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      transition: "all 0.2s", cursor: "pointer",
                    }}
                  >
                    {rememberMe && (
                      <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
                        <path d="M1 3.5L3.5 6L8 1" stroke="#C9A84C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>
                  <span style={{ fontFamily: "var(--font-inter), sans-serif", fontSize: "12px", color: rememberMe ? "rgba(240,237,232,0.7)" : "rgba(240,237,232,0.38)", fontWeight: 300, transition: "color 0.2s" }}>
                    {t.rememberMe}
                  </span>
                </label>
                <Link href={isEn ? "/en/forgot-password" : "/forgot-password"} style={{ fontFamily: "var(--font-inter), sans-serif", fontSize: "12px", color: C.gold + "bb", textDecoration: "none", fontWeight: 400, letterSpacing: "0.04em" }}>{t.forgotPass}</Link>
              </div>

              {/* Submit */}
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
                  <><span style={{ width: "16px", height: "16px", border: "2px solid #0B0F1A44", borderTopColor: "#0B0F1A", borderRadius: "50%", animation: "spin 0.7s linear infinite", display: "inline-block" }} />{t.loginBtnLoading}</>
                ) : t.loginBtn}
              </button>
            </div>

            {/* Divider */}
            <div style={{ display: "flex", alignItems: "center", gap: "14px", margin: "24px 0" }}>
              <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.06)" }} />
              <span style={{ fontFamily: "var(--font-inter), sans-serif", fontSize: "11px", color: "rgba(240,237,232,0.2)", letterSpacing: "0.06em" }}>{t.or}</span>
              <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.06)" }} />
            </div>

            {/* Register link */}
            <p style={{ textAlign: "center", fontFamily: "var(--font-inter), sans-serif", fontSize: "13px", color: C.muted, fontWeight: 300 }}>
              {t.noAccount}{" "}
              <Link href={isEn ? "/en/register" : "/register"} style={{ color: C.gold, textDecoration: "none", fontWeight: 500 }}>{t.registerLink}</Link>
            </p>
          </div>

          {/* Alt bilgi */}
          <p style={{ textAlign: "center", marginTop: "24px", fontFamily: "var(--font-inter), sans-serif", fontSize: "11px", color: "rgba(240,237,232,0.18)", letterSpacing: "0.06em" }}>
            {isEn ? (
              <>By signing in, you accept our <Link href="/en/kvkk-metni" style={{ color: C.gold + "66", textDecoration: "none" }}>Terms &amp; Conditions</Link>.</>
            ) : (
              <>Giriş yaparak <Link href="/kvkk-metni" style={{ color: C.gold + "66", textDecoration: "none" }}>Kullanım Koşulları</Link>'nı kabul etmiş olursun.</>
            )}
          </p>
        </motion.div>
      </main>

      {/* FOOTER */}
      <footer
        style={{
          position: "relative",
          zIndex: 1,
          borderTop: "1px solid rgba(255,255,255,0.05)",
          padding: "48px 24px",
          maxWidth: "1100px",
          margin: "0 auto",
        }}
      >
        <div style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "24px",
          marginBottom: "28px",
        }}>
          <div>
            <span style={{ fontFamily: "var(--font-cormorant), serif", fontSize: "1.2rem", color: "rgba(240,237,232,0.6)" }}>
              birlikteydik<span style={{ color: "#C9A84C" }}>.com</span>
            </span>
            <p style={{ fontFamily: "var(--font-inter), sans-serif", fontSize: "12px", color: "rgba(240,237,232,0.35)", marginTop: "6px", maxWidth: "280px", lineHeight: 1.6 }}>
              {isEn ? "A unique, unforgettable digital surprise for your loved ones." : "Sevdiklerinize özel, unutulmaz bir dijital sürpriz."}
            </p>
          </div>
          <div style={{ display: "flex", gap: "24px", flexWrap: "wrap" }}>
            <Link href={isEn ? "/en/kvkk-metni" : "/kvkk-metni"} style={{ fontFamily: "var(--font-inter), sans-serif", fontSize: "11px", color: "rgba(240,237,232,0.4)", textDecoration: "none", letterSpacing: "0.06em", transition: "color 0.2s" }}
              onMouseEnter={e => e.currentTarget.style.color = "rgba(240,237,232,0.8)"}
              onMouseLeave={e => e.currentTarget.style.color = "rgba(240,237,232,0.4)"}
            >{isEn ? "Privacy Policy" : "KVKK Aydınlatma Metni"}</Link>
            <a href={`https://wa.me/${"905349829940"}`} target="_blank" rel="noopener noreferrer" style={{ fontFamily: "var(--font-inter), sans-serif", fontSize: "11px", color: "rgba(240,237,232,0.4)", textDecoration: "none", letterSpacing: "0.06em", transition: "color 0.2s" }}
              onMouseEnter={e => e.currentTarget.style.color = "rgba(240,237,232,0.8)"}
              onMouseLeave={e => e.currentTarget.style.color = "rgba(240,237,232,0.4)"}
            >{isEn ? "Contact" : "İletişim"}</a>
            <a href="mailto:info@birlikteydik.com" style={{ fontFamily: "var(--font-inter), sans-serif", fontSize: "11px", color: "rgba(240,237,232,0.4)", textDecoration: "none", letterSpacing: "0.06em", transition: "color 0.2s" }}
              onMouseEnter={e => e.currentTarget.style.color = "rgba(240,237,232,0.8)"}
              onMouseLeave={e => e.currentTarget.style.color = "rgba(240,237,232,0.4)"}
            >info@birlikteydik.com</a>
          </div>
        </div>
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.04)", paddingTop: "20px" }}>
          <p style={{ fontFamily: "var(--font-inter), sans-serif", fontSize: "11px", color: "rgba(240,237,232,0.2)", letterSpacing: "0.08em" }}>
            © {new Date().getFullYear()} birlikteydik.com — {isEn ? "All Rights Reserved" : "Tüm Hakları Saklıdır"}
          </p>
        </div>
      </footer>
    </>
  );
}