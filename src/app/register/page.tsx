"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { HiOutlineMail, HiOutlineLockClosed, HiOutlineEye, HiOutlineEyeOff, HiOutlineUser } from "react-icons/hi";
import { FaHeart, FaCheck } from "react-icons/fa";
import MarketingConsentModal from "@/components/marketing-consent-modal";

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

// ─── Hearts Canvas ───────────────────────────────────────────────────────────
type Particle = { x: number; y: number; size: number; speed: number; opacity: number; drift: number; phase: number };

function HeartsCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const rafRef = useRef<number>(0);
  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext("2d"); if (!ctx) return;
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize(); window.addEventListener("resize", resize);
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
    const colors = ["#C9A84C", "#E8A0A0", "#B8A9D4"]; let t = 0;
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

// ─── Input ───────────────────────────────────────────────────────────────────
function Input({
  label, type = "text", value, onChange, placeholder, icon, error, rightElement, hint,
}: {
  label: string; type?: string; value: string; onChange: (v: string) => void;
  placeholder?: string; icon: React.ReactNode; error?: string; rightElement?: React.ReactNode; hint?: string;
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
        {rightElement && <span style={{ position: "absolute", right: "14px", display: "flex" }}>{rightElement}</span>}
      </div>
      {error && <p style={{ fontFamily: "var(--font-inter), sans-serif", fontSize: "12px", color: C.error, fontWeight: 300 }}>{error}</p>}
      {hint && !error && <p style={{ fontFamily: "var(--font-inter), sans-serif", fontSize: "12px", color: "rgba(240,237,232,0.25)", fontWeight: 300 }}>{hint}</p>}
    </div>
  );
}

// ─── Şifre güç göstergesi (sadece uzunluk kontrolü) ─────────────────────────
function PasswordStrength({ password, isEn }: { password: string; isEn: boolean }) {
  if (!password) return null;

  const isOk = password.length >= 8;
  const barColor = password.length === 0
    ? ""
    : password.length < 8
    ? "#E8A0A0"
    : password.length < 12
    ? C.gold
    : C.success;
  const label = password.length === 0
    ? ""
    : password.length < 8
    ? (isEn ? "Too short" : "Çok kısa")
    : password.length < 12
    ? (isEn ? "Medium" : "Yeterli")
    : (isEn ? "Strong" : "Güçlü");

  return (
    <div style={{ marginTop: "4px" }}>
      <div style={{ height: "3px", borderRadius: "4px", background: "rgba(255,255,255,0.07)", overflow: "hidden", marginBottom: "8px" }}>
        <div style={{
          height: "100%",
          borderRadius: "4px",
          background: barColor,
          width: `${Math.min((password.length / 16) * 100, 100)}%`,
          transition: "width 0.3s, background 0.3s",
        }} />
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
        <FaCheck size={8} color={isOk ? C.success : "rgba(240,237,232,0.15)"} />
        <span style={{ fontFamily: "var(--font-inter), sans-serif", fontSize: "11px", color: isOk ? C.success : barColor || "rgba(240,237,232,0.25)", fontWeight: 300 }}>
          {isEn ? "At least 8 characters" : "En az 8 karakter"}{isOk ? " ✓" : ` (${password.length}/8)`}
        </span>
        {label && <span style={{ marginLeft: "auto", fontFamily: "var(--font-inter), sans-serif", fontSize: "11px", color: barColor, fontWeight: 400 }}>{label}</span>}
      </div>
    </div>
  );
}

// ─── Register Sayfası ────────────────────────────────────────────────────────
export default function RegisterPage({ lang }: { lang?: string }) {
  const isEn = lang === "en" || (typeof window !== "undefined" && window.location.pathname.startsWith("/en/"));

  const t = {
    eyebrow: isEn ? "Get Started" : "Başlangıç",
    heading: isEn ? "Create Account" : "Hesap Oluştur",
    sub: isEn 
      ? "Start preparing special memory pages for your loved ones."
      : "Sevdiklerin için özel anı sayfaları hazırlamaya başla.",
    nameLabel: isEn ? "Your Name" : "Adın",
    namePlaceholder: isEn ? "Your Name Surname" : "Adın Soyadın",
    emailLabel: isEn ? "Email Address" : "E-posta",
    emailPlaceholder: isEn ? "example@mail.com" : "ornek@mail.com",
    passLabel: isEn ? "Password" : "Şifre",
    passPlaceholder: isEn ? "At least 8 characters" : "En az 8 karakter",
    passConfirmLabel: isEn ? "Confirm Password" : "Şifre Tekrar",
    passConfirmPlaceholder: isEn ? "Confirm your password" : "Şifreni tekrar gir",
    termsConsent1: isEn ? "I accept the " : "",
    termsConsent2: isEn ? "Terms of Use" : "Kullanım Koşulları",
    termsConsent3: isEn ? " and " : "'nı ve ",
    termsConsent4: isEn ? "Privacy Policy" : "Gizlilik Politikası",
    termsConsent5: isEn ? "." : "'nı kabul ediyorum.",
    optional: isEn ? "Optional" : "Opsiyonel",
    marketingConsent: isEn 
      ? "I want to be informed about campaigns and new templates."
      : "Kampanya ve yeni şablonlardan haberdar olmak istiyorum.",
    readMore: isEn ? "Read consent text" : "Aydınlatma metnini oku",
    registerBtn: isEn ? "Register Free" : "Ücretsiz Kayıt Ol",
    registerBtnLoading: isEn ? "Creating Account..." : "Hesap Oluşturuluyor…",
    or: isEn ? "or" : "veya",
    hasAccount: isEn ? "Already have an account?" : "Zaten hesabın var mı?",
    loginLink: isEn ? "Sign In" : "Giriş Yap",
    dataSafety: isEn 
      ? "We keep your data secure. We never share it with 3rd parties."
      : "Verilerini güvende tutuyoruz. Hiçbir zaman 3. taraflarla paylaşmıyoruz.",
    errName: isEn ? "Name is required" : "İsim gerekli",
    errEmail: isEn ? "Email is required" : "E-posta gerekli",
    errEmailValid: isEn ? "Please enter a valid email" : "Geçerli bir e-posta gir",
    errPass: isEn ? "Password is required" : "Şifre gerekli",
    errPassLen: isEn ? "Password must be at least 8 characters" : "Şifre en az 8 karakter olmalı",
    errPassConfirm: isEn ? "Passwords do not match" : "Şifreler eşleşmiyor",
    errAgree: isEn ? "You must accept the terms to continue." : "Devam etmek için koşulları kabul etmeniz gerekmektedir.",
    errGeneral: isEn ? "An error occurred. Please try again." : "Bir hata oluştu. Tekrar dene.",
    errServer: isEn ? "Could not connect to server. Check your internet connection." : "Sunucuya bağlanılamadı. İnternet bağlantını kontrol et.",
  };

  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [showPassC, setShowPassC] = useState(false);
  const [agree, setAgree] = useState(false);
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [marketingModalOpen, setMarketingModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = t.errName;
    if (!email) e.email = t.errEmail;
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = t.errEmailValid;
    if (!password) e.password = t.errPass;
    else if (password.length < 8) e.password = t.errPassLen;
    if (password !== passwordConfirm) e.passwordConfirm = t.errPassConfirm;
    if (!agree) e.agree = t.errAgree;
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    setErrors({});
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), email: email.toLowerCase().trim(), password, marketingConsent }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrors({ general: data.error || t.errGeneral });
        setLoading(false);
        return;
      }
      // Başarılı kayıt — otomatik giriş yap ve profil sayfasına yönlendir
      localStorage.setItem("birlikteydik_user", JSON.stringify({
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        marketingConsent: data.user.marketingConsent,
        isVerified: data.user.isVerified,
      }));
      window.dispatchEvent(new Event("auth-change"));

      router.push(isEn ? "/en/profil" : "/profil");
    } catch {
      setErrors({ general: t.errServer });
      setLoading(false);
    }
  };

  return (
    <>
      <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none", background: "radial-gradient(ellipse 80% 60% at 70% 20%, rgba(201,168,76,0.06) 0%, transparent 60%), radial-gradient(ellipse 60% 50% at 20% 80%, rgba(184,169,212,0.05) 0%, transparent 55%), linear-gradient(160deg, #0B0F1A 0%, #0d1220 60%, #0a0d18 100%)" }} />
      <HeartsCanvas />

      <main style={{ position: "relative", zIndex: 1, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "88px 24px 48px" }}>
        <motion.div initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }} style={{ width: "100%", maxWidth: "480px" }}>

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
                {isEn ? <>Create <em style={{ color: C.gold, fontStyle: "italic" }}>Account</em></> : <>Hesap <em style={{ color: C.gold, fontStyle: "italic" }}>Oluştur</em></>}
              </h1>
              <p style={{ fontFamily: "var(--font-inter), sans-serif", fontSize: "13px", color: C.muted, fontWeight: 300, marginTop: "8px", lineHeight: 1.6 }}>
                {t.sub}
              </p>
            </div>

            {/* Form */}
            <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
              {errors.general && (
                <div style={{ padding: "12px 16px", borderRadius: "10px", background: C.error + "12", border: `1px solid ${C.error}44`, fontFamily: "var(--font-inter), sans-serif", fontSize: "13px", color: C.error, fontWeight: 300 }}>
                  {errors.general}
                </div>
              )}
              <Input label={t.nameLabel} value={name} onChange={setName} placeholder={t.namePlaceholder} icon={<HiOutlineUser size={17} />} error={errors.name} />
              <Input label={t.emailLabel} type="email" value={email} onChange={setEmail} placeholder={t.emailPlaceholder} icon={<HiOutlineMail size={17} />} error={errors.email} />
              <div style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
                <Input
                  label={t.passLabel} type={showPass ? "text" : "password"} value={password} onChange={setPassword}
                  placeholder={t.passPlaceholder} icon={<HiOutlineLockClosed size={17} />} error={errors.password}
                  rightElement={
                    <span onClick={() => setShowPass(!showPass)} style={{ color: "rgba(240,237,232,0.35)", display: "flex", cursor: "pointer" }}>
                      {showPass ? <HiOutlineEyeOff size={17} /> : <HiOutlineEye size={17} />}
                    </span>
                  }
                />
                <PasswordStrength password={password} isEn={isEn} />
              </div>
              <Input
                label={t.passConfirmLabel} type={showPassC ? "text" : "password"} value={passwordConfirm} onChange={setPasswordConfirm}
                placeholder={t.passConfirmPlaceholder} icon={<HiOutlineLockClosed size={17} />} error={errors.passwordConfirm}
                rightElement={
                  <span onClick={() => setShowPassC(!showPassC)} style={{ color: "rgba(240,237,232,0.35)", display: "flex", cursor: "pointer" }}>
                    {showPassC ? <HiOutlineEyeOff size={17} /> : <HiOutlineEye size={17} />}
                  </span>
                }
              />

              {/* Zorunlu: KVK & Kullanım Koşulları */}
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ display: "flex", alignItems: "flex-start", gap: "12px", cursor: "pointer" }}>
                  <div
                    onClick={() => setAgree(!agree)}
                    style={{ width: "18px", height: "18px", borderRadius: "5px", border: `1px solid ${agree ? C.gold + "88" : "rgba(255,255,255,0.15)"}`, background: agree ? C.gold + "22" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: "1px", transition: "all 0.2s", cursor: "pointer" }}
                  >
                    {agree && <FaCheck size={9} color={C.gold} />}
                  </div>
                  <span style={{ fontFamily: "var(--font-inter), sans-serif", fontSize: "13px", color: C.muted, fontWeight: 300, lineHeight: 1.55 }}>
                    {t.termsConsent1}
                    <Link href={isEn ? "/en/kvkk-metni" : "/kvkk-metni"} target="_blank" style={{ color: C.gold, textDecoration: "none" }}>{t.termsConsent2}</Link>
                    {t.termsConsent3}
                    <Link href={isEn ? "/en/kvkk-metni" : "/kvkk-metni"} target="_blank" style={{ color: C.gold, textDecoration: "none" }}>{t.termsConsent4}</Link>
                    {t.termsConsent5}
                  </span>
                </label>
                {errors.agree && <p style={{ fontFamily: "var(--font-inter), sans-serif", fontSize: "12px", color: C.error, fontWeight: 300, marginLeft: "30px" }}>{errors.agree}</p>}
              </div>

              {/* İsteğe bağlı: Ticari Elektronik İleti Onayı */}
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                  <div
                    onClick={() => setMarketingConsent(!marketingConsent)}
                    style={{ width: "18px", height: "18px", borderRadius: "5px", border: `1px solid ${marketingConsent ? "rgba(184,169,212,0.6)" : "rgba(255,255,255,0.12)"}`, background: marketingConsent ? "rgba(184,169,212,0.12)" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: "2px", transition: "all 0.2s", cursor: "pointer" }}
                  >
                    {marketingConsent && <FaCheck size={9} color="#B8A9D4" />}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "7px", flexWrap: "wrap" }}>
                      <span style={{ fontSize: "10px", color: "rgba(184,169,212,0.5)", fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase", border: "1px solid rgba(184,169,212,0.2)", padding: "1px 6px", borderRadius: "3px", fontFamily: "var(--font-inter), sans-serif" }}>{t.optional}</span>
                      <span style={{ fontFamily: "var(--font-inter), sans-serif", fontSize: "12.5px", color: "rgba(240,237,232,0.45)", fontWeight: 300 }}>
                        {t.marketingConsent}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setMarketingModalOpen(true)}
                      style={{ background: "none", border: "none", padding: 0, cursor: "pointer", textAlign: "left", fontFamily: "var(--font-inter), sans-serif", fontSize: "11px", color: "rgba(184,169,212,0.55)", textDecoration: "underline", textDecorationColor: "rgba(184,169,212,0.25)", textUnderlineOffset: "2px" }}
                    >
                      {t.readMore}
                    </button>
                  </div>
                </div>
              </div>

              {/* Submit */}
              <button
                onClick={handleSubmit} disabled={loading}
                style={{ width: "100%", padding: "15px", borderRadius: "30px", border: "none", background: loading ? "rgba(201,168,76,0.5)" : C.gold, color: "#0B0F1A", fontFamily: "var(--font-inter), sans-serif", fontSize: "13px", letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 600, cursor: loading ? "not-allowed" : "pointer", transition: "opacity 0.2s", marginTop: "4px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
                onMouseEnter={(e) => { if (!loading) e.currentTarget.style.opacity = "0.85"; }}
                onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
              >
                {loading ? (
                  <><span style={{ width: "16px", height: "16px", border: "2px solid #0B0F1A44", borderTopColor: "#0B0F1A", borderRadius: "50%", animation: "spin 0.7s linear infinite", display: "inline-block" }} />{t.registerBtnLoading}</>
                ) : t.registerBtn}
              </button>
            </div>

            {/* Divider */}
            <div style={{ display: "flex", alignItems: "center", gap: "14px", margin: "24px 0" }}>
              <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.06)" }} />
              <span style={{ fontFamily: "var(--font-inter), sans-serif", fontSize: "11px", color: "rgba(240,237,232,0.2)" }}>{t.or}</span>
              <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.06)" }} />
            </div>

            <p style={{ textAlign: "center", fontFamily: "var(--font-inter), sans-serif", fontSize: "13px", color: C.muted, fontWeight: 300 }}>
              {t.hasAccount}{" "}
              <Link href={isEn ? "/en/login" : "/login"} style={{ color: C.gold, textDecoration: "none", fontWeight: 500 }}>{t.loginLink}</Link>
            </p>
          </div>

          <p style={{ textAlign: "center", marginTop: "24px", fontFamily: "var(--font-inter), sans-serif", fontSize: "11px", color: "rgba(240,237,232,0.18)", letterSpacing: "0.06em" }}>
            {t.dataSafety}
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

      {/* Ticari İleti Aydınlatma Modalı */}
      <MarketingConsentModal
        open={marketingModalOpen}
        onClose={() => setMarketingModalOpen(false)}
        onAccept={() => setMarketingConsent(true)}
      />
    </>
  );
}