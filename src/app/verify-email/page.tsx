"use client";

import { useEffect, useRef, useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { HiOutlineShieldCheck, HiOutlineCheckCircle, HiOutlineMail } from "react-icons/hi";
import { FaHeart } from "react-icons/fa";

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
    const frame = requestAnimationFrame(animate);
    return () => { window.removeEventListener("resize", resize); cancelAnimationFrame(frame); };
  }, []);

  return <canvas ref={canvasRef} style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }} />;
}

function VerifyEmailForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailParam = searchParams.get("email") ?? "";

  const [code, setCode] = useState<string[]>(Array(6).fill(""));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [resendCooldown, setResendCooldown] = useState(60);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState("");

  // Cooldown timer
  useEffect(() => {
    if (resendCooldown === 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const handleChange = (index: number, val: string) => {
    // Sadece rakamlara izin ver
    const numericVal = val.replace(/[^0-9]/g, "");
    if (!numericVal) {
      const newCode = [...code];
      newCode[index] = "";
      setCode(newCode);
      return;
    }

    const newCode = [...code];
    // Yapıştırma kontrolü (paste 6 digits)
    if (numericVal.length > 1) {
      const pastedDigits = numericVal.slice(0, 6).split("");
      pastedDigits.forEach((digit, i) => {
        if (i < 6) newCode[i] = digit;
      });
      setCode(newCode);
      const targetIdx = Math.min(pastedDigits.length, 5);
      inputRefs.current[targetIdx]?.focus();
      return;
    }

    newCode[index] = numericVal;
    setCode(newCode);

    // Sonraki inputa geçiş
    if (index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const verificationCode = code.join("");
    if (verificationCode.length !== 6) {
      setError("Lütfen 6 haneli kodun tamamını girin.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailParam.toLowerCase().trim(), code: verificationCode }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Doğrulama kodu hatalı.");
        setLoading(false);
        return;
      }
      
      setSuccess(true);
      // Başarılı doğrulama — Kullanıcı bilgisini localStorage'a yaz
      localStorage.setItem("birlikteydik_user", JSON.stringify({
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        role: data.user.role,
      }));
      window.dispatchEvent(new Event("auth-change"));

      setTimeout(() => {
        router.push("/");
      }, 2000);
    } catch {
      setError("Sunucuya bağlanırken bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0 || resendLoading) return;
    setResendLoading(true);
    setResendMessage("");
    setError("");
    try {
      const res = await fetch("/api/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailParam.toLowerCase().trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Kod tekrar gönderilemedi.");
        return;
      }
      setResendMessage("Yeni onay kodu e-posta adresinize gönderildi.");
      setResendCooldown(60);
    } catch {
      setError("Bağlantı hatası oluştu.");
    } finally {
      setResendLoading(false);
    }
  };

  return (
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
                  background: "rgba(134,239,172,0.12)", border: "1px solid rgba(134,239,172,0.35)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}
              >
                <HiOutlineCheckCircle size={36} color={C.success} />
              </motion.div>
            </div>
            <h2 style={{ fontFamily: "var(--font-cormorant), serif", fontSize: "clamp(1.6rem, 4vw, 2.1rem)", fontWeight: 600, color: C.text, marginBottom: "12px" }}>
              E-posta <em style={{ color: C.gold, fontStyle: "italic" }}>Doğrulandı!</em>
            </h2>
            <p style={{ fontFamily: "var(--font-inter), sans-serif", fontSize: "14px", color: C.muted, fontWeight: 300, lineHeight: 1.7 }}>
              Hesabınız başarıyla aktifleştirildi. Yönlendiriliyorsunuz...
            </p>
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
                <span style={{ fontFamily: "var(--font-inter), sans-serif", fontSize: "10px", letterSpacing: "0.38em", textTransform: "uppercase", color: C.gold, fontWeight: 500 }}>Güvenlik Adımı</span>
                <div style={{ height: "1px", width: "28px", background: C.gold + "66" }} />
              </div>
              <h1 style={{ fontFamily: "var(--font-cormorant), serif", fontSize: "clamp(1.7rem, 5vw, 2.2rem)", fontWeight: 600, color: C.text, lineHeight: 1.15 }}>
                E-posta <em style={{ color: C.gold, fontStyle: "italic" }}>Doğrulama</em>
              </h1>
              <p style={{ fontFamily: "var(--font-inter), sans-serif", fontSize: "13.5px", color: C.muted, fontWeight: 300, marginTop: "8px", lineHeight: 1.6 }}>
                Hesabınızı aktifleştirmek için <strong style={{ color: C.text }}>{emailParam}</strong> adresine gönderdiğimiz 6 haneli onay kodunu girin.
              </p>
            </div>

            {/* Bildirim Mesajları */}
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "20px" }}>
              {error && (
                <div style={{ padding: "12px 16px", borderRadius: "10px", background: C.error + "12", border: `1px solid ${C.error}44`, fontFamily: "var(--font-inter), sans-serif", fontSize: "13px", color: C.error, fontWeight: 300 }}>
                  {error}
                </div>
              )}
              {resendMessage && (
                <div style={{ padding: "12px 16px", borderRadius: "10px", background: "rgba(134,239,172,0.08)", border: `1px solid ${C.success}33`, fontFamily: "var(--font-inter), sans-serif", fontSize: "13px", color: C.success, fontWeight: 300 }}>
                  {resendMessage}
                </div>
              )}
            </div>

            {/* 6 Haneli Kod Kutuları */}
            <div style={{ display: "flex", justifyContent: "space-between", gap: "8px", marginBottom: "28px" }}>
              {code.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => { inputRefs.current[index] = el; }}
                  type="text"
                  maxLength={6}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  style={{
                    width: "48px",
                    height: "56px",
                    borderRadius: "12px",
                    background: C.card,
                    border: `1px solid ${error ? C.error + "55" : C.border}`,
                    color: C.text,
                    fontFamily: "'Courier New', Courier, monospace",
                    fontSize: "24px",
                    fontWeight: "bold",
                    textAlign: "center",
                    outline: "none",
                    transition: "all 0.2s",
                  }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = C.gold; e.currentTarget.style.background = "rgba(201,168,76,0.05)"; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.background = C.card; }}
                />
              ))}
            </div>

            {/* Doğrula butonu */}
            <button
              onClick={handleVerify} disabled={loading}
              style={{
                width: "100%", padding: "15px", borderRadius: "30px", border: "none",
                background: loading ? "rgba(201,168,76,0.5)" : C.gold, color: "#0B0F1A",
                fontFamily: "var(--font-inter), sans-serif", fontSize: "13px", letterSpacing: "0.12em",
                textTransform: "uppercase", fontWeight: 600, cursor: loading ? "not-allowed" : "pointer",
                transition: "opacity 0.2s, background 0.2s", marginBottom: "20px",
                display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
              }}
              onMouseEnter={(e) => { if (!loading) e.currentTarget.style.opacity = "0.85"; }}
              onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
            >
              {loading ? (
                <><span style={{ width: "16px", height: "16px", border: "2px solid #0B0F1A44", borderTopColor: "#0B0F1A", borderRadius: "50%", animation: "spin 0.7s linear infinite", display: "inline-block" }} />Doğrulanıyor…</>
              ) : "Hesabı Doğrula"}
            </button>

            {/* Yeniden gönder cooldown linki */}
            <div style={{ textAlign: "center", fontFamily: "var(--font-inter), sans-serif", fontSize: "13px" }}>
              <span style={{ color: C.muted }}>Kodu almadın mı? </span>
              {resendCooldown > 0 ? (
                <span style={{ color: C.gold, fontWeight: 500 }}>
                  ({resendCooldown}s) sonra tekrar gönder
                </span>
              ) : (
                <button
                  onClick={handleResend}
                  disabled={resendLoading}
                  style={{
                    background: "none", border: "none", color: C.gold, fontWeight: 500,
                    cursor: "pointer", textDecoration: "underline", padding: 0,
                    fontFamily: "var(--font-inter), sans-serif", fontSize: "13px",
                  }}
                >
                  {resendLoading ? "Gönderiliyor..." : "Yeni Kod Gönder"}
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <>

      {/* Arka plan */}
      <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none", background: "radial-gradient(ellipse 80% 60% at 30% 20%, rgba(201,168,76,0.07) 0%, transparent 60%), radial-gradient(ellipse 60% 50% at 80% 80%, rgba(232,160,160,0.05) 0%, transparent 55%), linear-gradient(160deg, #0B0F1A 0%, #0d1220 60%, #0a0d18 100%)" }} />
      <HeartsCanvas />

      {/* Ana içerik */}
      <main style={{ position: "relative", zIndex: 1, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "80px 24px 40px" }}>
        <motion.div
          initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          style={{ width: "100%", maxWidth: "460px" }}
        >
          <Suspense fallback={
            <div style={{ background: "rgba(255,255,255,0.035)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "24px", padding: "44px", backdropFilter: "blur(24px)", display: "flex", justifyContent: "center" }}>
              <div style={{ width: "24px", height: "24px", border: `2px solid ${C.border}`, borderTopColor: C.gold, borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
            </div>
          }>
            <VerifyEmailForm />
          </Suspense>

          {/* Alt bilgi */}
          <p style={{ textAlign: "center", marginTop: "24px", fontFamily: "var(--font-inter), sans-serif", fontSize: "11px", color: "rgba(240,237,232,0.18)", letterSpacing: "0.06em" }}>
            Doğrulama ile ilgili bir sorun mu yaşıyorsunuz?{" "}
            <a href="mailto:destek@birlikteydik.com" style={{ color: C.gold + "66", textDecoration: "none" }}>Bize ulaşın</a>
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
