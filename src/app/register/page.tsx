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
      <label style={{ fontFamily: "'Inter', sans-serif", fontSize: "11px", letterSpacing: "0.12em", textTransform: "uppercase", color: focused ? C.gold : C.muted, fontWeight: 500, transition: "color 0.2s" }}>{label}</label>
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
            color: C.text, fontFamily: "'Inter', sans-serif", fontSize: "14px", fontWeight: 300,
            outline: "none", transition: "all 0.25s", backdropFilter: "blur(8px)",
          }}
        />
        {rightElement && <span style={{ position: "absolute", right: "14px", display: "flex" }}>{rightElement}</span>}
      </div>
      {error && <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "12px", color: C.error, fontWeight: 300 }}>{error}</p>}
      {hint && !error && <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "12px", color: "rgba(240,237,232,0.25)", fontWeight: 300 }}>{hint}</p>}
    </div>
  );
}

// ─── Şifre güç göstergesi (sadece uzunluk kontrolü) ─────────────────────────
function PasswordStrength({ password }: { password: string }) {
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
    ? "Çok kısa"
    : password.length < 12
    ? "Yeterli"
    : "Güçlü";

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
        <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "11px", color: isOk ? C.success : barColor || "rgba(240,237,232,0.25)", fontWeight: 300 }}>
          En az 8 karakter{isOk ? " ✓" : ` (${password.length}/8)`}
        </span>
        {label && <span style={{ marginLeft: "auto", fontFamily: "'Inter', sans-serif", fontSize: "11px", color: barColor, fontWeight: 400 }}>{label}</span>}
      </div>
    </div>
  );
}

// ─── Register Sayfası ────────────────────────────────────────────────────────
export default function RegisterPage() {
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
    if (!name.trim()) e.name = "İsim gerekli";
    if (!email) e.email = "E-posta gerekli";
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = "Geçerli bir e-posta gir";
    if (!password) e.password = "Şifre gerekli";
    else if (password.length < 8) e.password = "Şifre en az 8 karakter olmalı";
    if (password !== passwordConfirm) e.passwordConfirm = "Şifreler eşleşmiyor";
    if (!agree) e.agree = "Devam etmek için koşulları kabul et";
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
        setErrors({ general: data.error ?? "Bir hata oluştu. Tekrar dene." });
        setLoading(false);
        return;
      }
      // Başarılı kayıt — kullanıcı bilgisini localStorage'a yaz
      localStorage.setItem("anilarimiz_user", JSON.stringify({ name: data.user.name, email: data.user.email }));
      window.dispatchEvent(new Event("auth-change"));
      router.push("/");
    } catch {
      setErrors({ general: "Sunucuya bağlanılamadı. İnternet bağlantını kontrol et." });
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
                <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "10px", letterSpacing: "0.38em", textTransform: "uppercase", color: C.gold, fontWeight: 500 }}>Başlangıç</span>
                <div style={{ height: "1px", width: "28px", background: C.gold + "66" }} />
              </div>
              <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(1.8rem, 5vw, 2.4rem)", fontWeight: 600, color: C.text, lineHeight: 1.15, letterSpacing: "-0.01em" }}>
                Hesap <em style={{ color: C.gold, fontStyle: "italic" }}>Oluştur</em>
              </h1>
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "13px", color: C.muted, fontWeight: 300, marginTop: "8px", lineHeight: 1.6 }}>
                Sevdiklerin için özel anı sayfaları hazırlamaya başla.
              </p>
            </div>

            {/* Form */}
            <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
              {(errors as Record<string, string>).general && (
                <div style={{ padding: "12px 16px", borderRadius: "10px", background: C.error + "12", border: `1px solid ${C.error}44`, fontFamily: "'Inter', sans-serif", fontSize: "13px", color: C.error, fontWeight: 300 }}>
                  {(errors as Record<string, string>).general}
                </div>
              )}
              <Input label="Adın" value={name} onChange={setName} placeholder="Adın Soyadın" icon={<HiOutlineUser size={17} />} error={errors.name} />
              <Input label="E-posta" type="email" value={email} onChange={setEmail} placeholder="ornek@mail.com" icon={<HiOutlineMail size={17} />} error={errors.email} />
              <div style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
                <Input
                  label="Şifre" type={showPass ? "text" : "password"} value={password} onChange={setPassword}
                  placeholder="En az 8 karakter" icon={<HiOutlineLockClosed size={17} />} error={errors.password}
                  rightElement={
                    <span onClick={() => setShowPass(!showPass)} style={{ color: "rgba(240,237,232,0.35)", display: "flex", cursor: "pointer" }}>
                      {showPass ? <HiOutlineEyeOff size={17} /> : <HiOutlineEye size={17} />}
                    </span>
                  }
                />
                <PasswordStrength password={password} />
              </div>
              <Input
                label="Şifre Tekrar" type={showPassC ? "text" : "password"} value={passwordConfirm} onChange={setPasswordConfirm}
                placeholder="Şifreni tekrar gir" icon={<HiOutlineLockClosed size={17} />} error={errors.passwordConfirm}
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
                  <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "13px", color: C.muted, fontWeight: 300, lineHeight: 1.55 }}>
                    <a href="/kvkk-metni" target="_blank" style={{ color: C.gold, textDecoration: "none" }}>Kullanım Koşulları</a>'nı ve{" "}
                    <a href="/kvkk-metni" target="_blank" style={{ color: C.gold, textDecoration: "none" }}>Gizlilik Politikası</a>'nı kabul ediyorum.
                  </span>
                </label>
                {errors.agree && <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "12px", color: C.error, fontWeight: 300, marginLeft: "30px" }}>{errors.agree}</p>}
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
                      <span style={{ fontSize: "10px", color: "rgba(184,169,212,0.5)", fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase", border: "1px solid rgba(184,169,212,0.2)", padding: "1px 6px", borderRadius: "3px", fontFamily: "'Inter', sans-serif" }}>Opsiyonel</span>
                      <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "12.5px", color: "rgba(240,237,232,0.45)", fontWeight: 300 }}>
                        Kampanya ve yeni şablonlardan haberdar olmak istiyorum.
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setMarketingModalOpen(true)}
                      style={{ background: "none", border: "none", padding: 0, cursor: "pointer", textAlign: "left", fontFamily: "'Inter', sans-serif", fontSize: "11px", color: "rgba(184,169,212,0.55)", textDecoration: "underline", textDecorationColor: "rgba(184,169,212,0.25)", textUnderlineOffset: "2px" }}
                    >
                      Aydınlatma metnini oku
                    </button>
                  </div>
                </div>
              </div>

              {/* Submit */}
              <button
                onClick={handleSubmit} disabled={loading}
                style={{ width: "100%", padding: "15px", borderRadius: "30px", border: "none", background: loading ? "rgba(201,168,76,0.5)" : C.gold, color: "#0B0F1A", fontFamily: "'Inter', sans-serif", fontSize: "13px", letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 600, cursor: loading ? "not-allowed" : "pointer", transition: "opacity 0.2s", marginTop: "4px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
                onMouseEnter={(e) => { if (!loading) e.currentTarget.style.opacity = "0.85"; }}
                onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
              >
                {loading ? (
                  <><span style={{ width: "16px", height: "16px", border: "2px solid #0B0F1A44", borderTopColor: "#0B0F1A", borderRadius: "50%", animation: "spin 0.7s linear infinite", display: "inline-block" }} />Hesap Oluşturuluyor…</>
                ) : "Ücretsiz Kayıt Ol"}
              </button>
            </div>

            {/* Divider */}
            <div style={{ display: "flex", alignItems: "center", gap: "14px", margin: "24px 0" }}>
              <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.06)" }} />
              <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "11px", color: "rgba(240,237,232,0.2)" }}>veya</span>
              <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.06)" }} />
            </div>

            <p style={{ textAlign: "center", fontFamily: "'Inter', sans-serif", fontSize: "13px", color: C.muted, fontWeight: 300 }}>
              Zaten hesabın var mı?{" "}
              <Link href="/login" style={{ color: C.gold, textDecoration: "none", fontWeight: 500 }}>Giriş Yap</Link>
            </p>
          </div>

          <p style={{ textAlign: "center", marginTop: "24px", fontFamily: "'Inter', sans-serif", fontSize: "11px", color: "rgba(240,237,232,0.18)", letterSpacing: "0.06em" }}>
            Verilerini güvende tutuyoruz. Hiçbir zaman 3. taraflarla paylaşmıyoruz.
          </p>
        </motion.div>
      </main>

      <footer style={{ position: "relative", zIndex: 1, borderTop: "1px solid rgba(255,255,255,0.05)", padding: "20px 24px", display: "flex", alignItems: "center", justifyContent: "center", gap: "16px" }}>
        <FaHeart size={10} color="rgba(232,160,160,0.25)" />
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "11px", color: "rgba(240,237,232,0.18)", letterSpacing: "0.08em" }}>© {new Date().getFullYear()} anılarımız.com</p>
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