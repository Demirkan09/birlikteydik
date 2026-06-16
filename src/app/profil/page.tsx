"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  HiOutlineUser,
  HiOutlineMail,
  HiOutlineLockClosed,
  HiOutlineShieldCheck,
  HiOutlineTrash,
  HiOutlineLogout,
  HiOutlineCalendar,
  HiOutlineEye,
  HiOutlineEyeOff,
  HiOutlineCheckCircle,
  HiOutlineChevronRight,
  HiHeart
} from "react-icons/hi";

const C = {
  bg: "#0B0F1A",
  gold: "#C9A84C",
  text: "#F0EDE8",
  muted: "rgba(240,237,232,0.45)",
  border: "rgba(255,255,255,0.08)",
  card: "rgba(255,255,255,0.04)",
  error: "#E8A0A0",
  success: "#86efac",
  purple: "#B8A9D4",
};

// ─── Floating Hearts Canvas ──────────────────────────────────────────────
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
    particlesRef.current = Array.from({ length: 15 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      size: Math.random() * 6 + 3,
      speed: Math.random() * 0.25 + 0.08,
      opacity: Math.random() * 0.08 + 0.02,
      drift: (Math.random() - 0.5) * 0.3,
      phase: Math.random() * Math.PI * 2,
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

// ─── Input Component ───────────────────────────────────────────────────────
function ProfileInput({
  label, type = "text", value, onChange, placeholder, icon, error, rightElement, disabled = false
}: {
  label: string; type?: string; value: string; onChange: (v: string) => void;
  placeholder?: string; icon: React.ReactNode; error?: string; rightElement?: React.ReactNode; disabled?: boolean;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px", width: "100%" }}>
      <label style={{ fontFamily: "'Inter', sans-serif", fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase", color: focused ? C.gold : C.muted, fontWeight: 500, transition: "color 0.2s" }}>{label}</label>
      <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
        <span style={{ position: "absolute", left: "16px", color: focused ? C.gold : "rgba(240,237,232,0.25)", transition: "color 0.2s", pointerEvents: "none", display: "flex" }}>{icon}</span>
        <input
          type={type} value={value} placeholder={placeholder} disabled={disabled}
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          onChange={(e) => onChange(e.target.value)}
          style={{
            width: "100%", padding: "12px 16px 12px 42px", paddingRight: rightElement ? "44px" : "16px",
            borderRadius: "10px", background: focused ? "rgba(201,168,76,0.04)" : C.card,
            border: `1px solid ${error ? C.error + "88" : focused ? C.gold + "44" : C.border}`,
            color: disabled ? "rgba(240,237,232,0.4)" : C.text, fontFamily: "'Inter', sans-serif", fontSize: "13.5px", fontWeight: 300,
            outline: "none", transition: "all 0.25s", backdropFilter: "blur(4px)",
            cursor: disabled ? "not-allowed" : "text",
          }}
        />
        {rightElement && <span style={{ position: "absolute", right: "14px", display: "flex", cursor: "pointer", color: "rgba(240,237,232,0.3)" }}>{rightElement}</span>}
      </div>
      {error && <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "11.5px", color: C.error, fontWeight: 300, marginTop: "2px" }}>{error}</p>}
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────
export default function ProfilePage() {
  const router = useRouter();
  
  // Auth states
  const [user, setUser] = useState<{ id?: string; name: string; email: string; marketingConsent?: boolean } | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Tab state: "info" | "notifications" | "details" | "danger"
  const [activeTab, setActiveTab] = useState<"info" | "notifications" | "details" | "danger">("info");

  // Form states - Kişisel Bilgiler
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordConfirm, setNewPasswordConfirm] = useState("");
  const [showPass1, setShowPass1] = useState(false);
  const [showPass2, setShowPass2] = useState(false);
  const [showPass3, setShowPass3] = useState(false);

  // State - Onaylar
  const [marketingConsent, setMarketingConsent] = useState(false);

  // Stats / Meta details
  const [createdAt, setCreatedAt] = useState<string>("");
  
  // Danger Zone states
  const [deletePassword, setDeletePassword] = useState("");
  const [showDeletePass, setShowDeletePass] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  // Status feedback states
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  // 1. Session check on mount & fetch fresh database details
  useEffect(() => {
    const checkSession = async () => {
      try {
        const stored = localStorage.getItem("anilarimiz_user");
        if (!stored) {
          router.push("/login");
          return;
        }
        const parsed = JSON.parse(stored);
        setUser(parsed);
        setName(parsed.name || "");
        setEmail(parsed.email || "");

        // Fetch fresh details from DB
        const res = await fetch(`/api/profile?email=${encodeURIComponent(parsed.email)}`);
        if (res.ok) {
          const data = await res.json();
          if (data.user) {
            setUser({
              id: data.user.id,
              name: data.user.name,
              email: data.user.email,
              marketingConsent: data.user.marketingConsent,
            });
            setName(data.user.name);
            setEmail(data.user.email);
            setMarketingConsent(!!data.user.marketingConsent);
            
            // Format creation date
            if (data.user.createdAt) {
              const dateObj = new Date(data.user.createdAt);
              setCreatedAt(dateObj.toLocaleDateString("tr-TR", { year: "numeric", month: "long", day: "numeric" }));
            }
          }
        }
      } catch (err) {
        console.error("Failed to load user details", err);
      } finally {
        setAuthLoading(false);
      }
    };
    checkSession();
  }, [router]);

  // Handle Logout
  const handleLogout = () => {
    localStorage.removeItem("anilarimiz_user");
    window.dispatchEvent(new Event("auth-change"));
    router.push("/");
  };

  // 2. Submit Info & Password Change
  const handleUpdateProfile = async () => {
    if (!user) return;
    setLoading(true);
    setSuccessMsg("");
    setErrors({});

    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = "İsim alanı boş bırakılamaz.";
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) errs.email = "Geçerli bir e-posta girin.";
    
    if (newPassword) {
      if (!currentPassword) {
        errs.currentPassword = "Şifrenizi değiştirmek için mevcut şifrenizi girmeniz gerekir.";
      }
      if (newPassword.length < 8) {
        errs.newPassword = "Yeni şifre en az 8 karakter olmalıdır.";
      }
      if (newPassword !== newPasswordConfirm) {
        errs.newPasswordConfirm = "Şifreler eşleşmiyor.";
      }
    }

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentEmail: user.email,
          name: name.trim(),
          email: email.toLowerCase().trim(),
          currentPassword,
          newPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrors({ general: data.error ?? "Güncelleme sırasında bir hata oluştu." });
        setLoading(false);
        return;
      }

      // Update local storage
      const updatedUser = {
        ...user,
        name: data.user.name,
        email: data.user.email,
      };
      localStorage.setItem("anilarimiz_user", JSON.stringify(updatedUser));
      setUser(updatedUser);
      window.dispatchEvent(new Event("auth-change"));

      // Reset password fields
      setCurrentPassword("");
      setNewPassword("");
      setNewPasswordConfirm("");
      
      setSuccessMsg("Kişisel bilgileriniz başarıyla güncellendi.");
      setTimeout(() => setSuccessMsg(""), 5000);
    } catch {
      setErrors({ general: "Bağlantı hatası. Lütfen daha sonra tekrar deneyin." });
    } finally {
      setLoading(false);
    }
  };

  // 3. Toggle Marketing Consent
  const handleToggleConsent = async (checked: boolean) => {
    if (!user) return;
    setLoading(true);
    setSuccessMsg("");
    setErrors({});
    
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: user.email,
          marketingConsent: checked,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrors({ consent: data.error ?? "Onay güncellenemedi." });
        setLoading(false);
        return;
      }

      setMarketingConsent(checked);
      const updatedUser = { ...user, marketingConsent: checked };
      localStorage.setItem("anilarimiz_user", JSON.stringify(updatedUser));
      setUser(updatedUser);

      setSuccessMsg(checked ? "Kampanya ve iletişim onayı verildi." : "Kampanya ve iletişim onayı kaldırıldı.");
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch {
      setErrors({ consent: "Onay güncellenirken bir hata oluştu." });
    } finally {
      setLoading(false);
    }
  };

  // 4. Secure Account Deletion
  const handleDeleteAccount = async () => {
    if (!user) return;
    setErrors({});
    
    if (!deletePassword) {
      setErrors({ deletePassword: "Şifrenizi girmelisiniz." });
      return;
    }
    if (deleteConfirmText.toLowerCase() !== "sil") {
      setErrors({ deleteConfirmText: "Hesap silme işlemini onaylamak için kutuya 'sil' yazmalısınız." });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/profile", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: user.email,
          password: deletePassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrors({ delete: data.error ?? "Silme işlemi sırasında hata oluştu." });
        setLoading(false);
        return;
      }

      // Clear local storage and redirect
      localStorage.removeItem("anilarimiz_user");
      window.dispatchEvent(new Event("auth-change"));
      router.push("/");
    } catch {
      setErrors({ delete: "Bağlantı hatası oluştu." });
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: C.bg, color: C.text }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
          <span style={{ width: "28px", height: "28px", border: "2.5px solid rgba(201,168,76,0.2)", borderTopColor: C.gold, borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "13px", color: C.muted, letterSpacing: "0.05em" }}>Profil yükleniyor…</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!user) return null;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,600&family=Inter:wght@300;400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: ${C.bg}; color: ${C.text}; overflow-x: hidden; }
        ::selection { background: rgba(201,168,76,0.22); color: ${C.text}; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      {/* Background Gradients & Canvas */}
      <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none", background: "radial-gradient(ellipse 65% 55% at 20% 15%, rgba(201,168,76,0.05) 0%, transparent 60%), radial-gradient(ellipse 60% 50% at 85% 80%, rgba(184,169,212,0.04) 0%, transparent 55%), linear-gradient(160deg, #0B0F1A 0%, #0c101c 65%, #080b14 100%)" }} />
      <HeartsCanvas />

      <main style={{ position: "relative", zIndex: 1, minHeight: "100vh", padding: "100px 24px 60px" }}>
        <div style={{ maxWidth: "1024px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "32px" }}>
          
          {/* Header Panel */}
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "24px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "20px", padding: "28px clamp(20px, 4vw, 36px)", backdropFilter: "blur(12px)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
              {/* User Avatar with gradient border */}
              <div style={{ position: "relative", width: "64px", height: "64px", borderRadius: "50%", background: "linear-gradient(135deg, #C9A84C, #B8A9D4)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 8px 24px rgba(0,0,0,0.3)" }}>
                <span style={{ fontSize: "22px", color: "#0B0F1A", fontWeight: 700 }}>{user.name?.[0]?.toUpperCase()}</span>
                <div style={{ position: "absolute", bottom: 0, right: 0, width: "16px", height: "16px", borderRadius: "50%", background: C.success, border: `2px solid ${C.bg}`, display: "flex", alignItems: "center", justifyContent: "center" }} title="Aktif Oturum" />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(1.5rem, 4vw, 2.1rem)", fontWeight: 600, color: C.text, lineHeight: 1.1 }}>
                  Merhaba, <em style={{ color: C.gold, fontStyle: "italic" }}>{user.name}</em>
                </h1>
                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "13px", color: C.muted, fontWeight: 300 }}>{user.email}</p>
              </div>
            </div>

            {/* Logout button */}
            <button
              onClick={handleLogout}
              style={{
                display: "flex", alignItems: "center", gap: "8px", padding: "11px 22px",
                borderRadius: "30px", border: "1px solid rgba(232,160,160,0.2)",
                background: "rgba(232,160,160,0.04)", color: "#E8A0A0",
                fontFamily: "'Inter', sans-serif", fontSize: "12px", letterSpacing: "0.08em",
                textTransform: "uppercase", fontWeight: 500, cursor: "pointer",
                transition: "all 0.2s"
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(232,160,160,0.08)"; e.currentTarget.style.borderColor = "rgba(232,160,160,0.35)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(232,160,160,0.04)"; e.currentTarget.style.borderColor = "rgba(232,160,160,0.2)"; }}
            >
              <HiOutlineLogout size={15} />
              <span>Güvenli Çıkış Yap</span>
            </button>
          </div>

          {/* Feedback alerts container */}
          <AnimatePresence>
            {successMsg && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                style={{ padding: "14px 20px", borderRadius: "10px", background: "rgba(134,239,172,0.06)", border: `1px solid ${C.success}33`, display: "flex", alignItems: "center", gap: "10px", color: C.success, fontFamily: "'Inter', sans-serif", fontSize: "13.5px", fontWeight: 300 }}>
                <HiOutlineCheckCircle size={18} />
                <span>{successMsg}</span>
              </motion.div>
            )}
            {errors.general && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                style={{ padding: "14px 20px", borderRadius: "10px", background: "rgba(232,160,160,0.06)", border: `1px solid ${C.error}33`, display: "flex", alignItems: "center", gap: "10px", color: C.error, fontFamily: "'Inter', sans-serif", fontSize: "13.5px", fontWeight: 300 }}>
                <span style={{ fontSize: "18px", display: "flex" }}>⚠</span>
                <span>{errors.general}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Double Column Panel (Tabs & Content) */}
          <div style={{ display: "grid", gridTemplateColumns: "clamp(200px, 30%, 280px) 1fr", gap: "28px", alignItems: "start" }} className="profile-grid">
            <style>{`
              @media (max-width: 768px) {
                .profile-grid { grid-template-columns: 1fr !important; }
              }
            `}</style>

            {/* Sidebar navigation */}
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", background: "rgba(255,255,255,0.015)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "20px", padding: "16px" }}>
              {[
                { id: "info", label: "Kişisel Bilgiler", icon: <HiOutlineUser size={16} /> },
                { id: "notifications", label: "İletişim & Onaylar", icon: <HiOutlineShieldCheck size={16} /> },
                { id: "details", label: "Hesap Bilgileri", icon: <HiOutlineCalendar size={16} /> },
                { id: "danger", label: "Hesabı Kalıcı Olarak Sil", icon: <HiOutlineTrash size={16} />, color: "#E8A0A0" },
              ].map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => { setActiveTab(tab.id as any); setErrors({}); setSuccessMsg(""); }}
                    style={{
                      display: "flex", alignItems: "center", gap: "10px", padding: "12px 16px",
                      borderRadius: "10px", border: "none",
                      background: isActive ? "rgba(255,255,255,0.035)" : "transparent",
                      color: isActive ? (tab.color || C.gold) : "rgba(240,237,232,0.5)",
                      fontFamily: "'Inter', sans-serif", fontSize: "13px", fontWeight: isActive ? 500 : 300,
                      cursor: "pointer", textAlign: "left", transition: "all 0.2s"
                    }}
                    onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.color = tab.color || C.text; }}
                    onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.color = "rgba(240,237,232,0.5)"; }}
                  >
                    {tab.icon}
                    <span style={{ marginRight: "auto" }}>{tab.label}</span>
                    <HiOutlineChevronRight size={12} style={{ opacity: isActive ? 0.7 : 0, transition: "opacity 0.2s" }} />
                  </button>
                );
              })}
            </div>

            {/* Content card */}
            <div style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "20px", padding: "clamp(24px, 5vw, 36px)", backdropFilter: "blur(12px)", minHeight: "360px" }}>
              
              {/* Tab 1: Kişisel Bilgiler */}
              {activeTab === "info" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
                  <div>
                    <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.6rem", fontWeight: 500, color: C.text, marginBottom: "8px" }}>
                      Kişisel <em style={{ color: C.gold, fontStyle: "italic" }}>Bilgiler</em>
                    </h2>
                    <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "12.5px", color: C.muted, fontWeight: 300 }}>
                      Hesap bilgilerinizi güncelleyebilir ve şifrenizi değiştirebilirsiniz.
                    </p>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }} className="form-row">
                      <style>{`@media (max-width: 600px) { .form-row { grid-template-columns: 1fr !important; } }`}</style>
                      <ProfileInput label="Adınız Soyadınız" value={name} onChange={setName} icon={<HiOutlineUser size={15} />} error={errors.name} />
                      <ProfileInput label="E-posta Adresiniz" type="email" value={email} onChange={setEmail} icon={<HiOutlineMail size={15} />} error={errors.email} />
                    </div>

                    <div style={{ height: "1px", background: "rgba(255,255,255,0.06)", margin: "8px 0" }} />

                    <div>
                      <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.25rem", color: C.gold, fontWeight: 500, marginBottom: "14px" }}>
                        Şifre Güncelleme <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "10.5px", color: "rgba(240,237,232,0.22)", fontWeight: 300, marginLeft: "4px" }}>(İsteğe Bağlı)</span>
                      </h3>
                      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                        <ProfileInput
                          label="Mevcut Şifreniz" type={showPass1 ? "text" : "password"} value={currentPassword} onChange={setCurrentPassword}
                          icon={<HiOutlineLockClosed size={15} />} placeholder="••••••••" error={errors.currentPassword}
                          rightElement={<span onClick={() => setShowPass1(!showPass1)}>{showPass1 ? <HiOutlineEyeOff size={15} /> : <HiOutlineEye size={15} />}</span>}
                        />
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }} className="form-row">
                          <ProfileInput
                            label="Yeni Şifre" type={showPass2 ? "text" : "password"} value={newPassword} onChange={setNewPassword}
                            icon={<HiOutlineLockClosed size={15} />} placeholder="En az 8 karakter" error={errors.newPassword}
                            rightElement={<span onClick={() => setShowPass2(!showPass2)}>{showPass2 ? <HiOutlineEyeOff size={15} /> : <HiOutlineEye size={15} />}</span>}
                          />
                          <ProfileInput
                            label="Yeni Şifre Tekrarı" type={showPass3 ? "text" : "password"} value={newPasswordConfirm} onChange={setNewPasswordConfirm}
                            icon={<HiOutlineLockClosed size={15} />} placeholder="••••••••" error={errors.newPasswordConfirm}
                            rightElement={<span onClick={() => setShowPass3(!showPass3)}>{showPass3 ? <HiOutlineEyeOff size={15} /> : <HiOutlineEye size={15} />}</span>}
                          />
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={handleUpdateProfile} disabled={loading}
                      style={{
                        padding: "13px 28px", borderRadius: "30px", border: "none",
                        background: loading ? "rgba(201,168,76,0.5)" : C.gold, color: "#0B0F1A",
                        fontFamily: "'Inter', sans-serif", fontSize: "12.5px", letterSpacing: "0.1em",
                        textTransform: "uppercase", fontWeight: 600, cursor: loading ? "not-allowed" : "pointer",
                        transition: "all 0.2s", alignSelf: "flex-start", marginTop: "10px",
                        display: "flex", alignItems: "center", gap: "8px",
                      }}
                      onMouseEnter={(e) => { if (!loading) e.currentTarget.style.opacity = "0.85"; }}
                      onMouseLeave={(e) => { if (!loading) e.currentTarget.style.opacity = "1"; }}
                    >
                      {loading ? <span style={{ width: "14px", height: "14px", border: "2px solid #0B0F1A44", borderTopColor: "#0B0F1A", borderRadius: "50%", animation: "spin 0.7s linear infinite", display: "inline-block" }} /> : null}
                      <span>{loading ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Tab 2: İletişim & Onaylar */}
              {activeTab === "notifications" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
                  <div>
                    <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.6rem", fontWeight: 500, color: C.text, marginBottom: "8px" }}>
                      İletişim ve <em style={{ color: C.purple, fontStyle: "italic" }}>Yasal Onaylar</em>
                    </h2>
                    <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "12.5px", color: C.muted, fontWeight: 300 }}>
                      birlikteydik.com bültenleri, yeni tasarımları ve size özel fırsatlar hakkında almak istediğiniz iletileri yönetin.
                    </p>
                  </div>

                  {errors.consent && (
                    <div style={{ padding: "10px 14px", borderRadius: "8px", background: "rgba(232,160,160,0.08)", border: `1px solid ${C.error}22`, color: C.error, fontSize: "12.5px" }}>
                      {errors.consent}
                    </div>
                  )}

                  {/* Consent card containing the toggle */}
                  <div style={{ background: "rgba(255,255,255,0.015)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "16px", padding: "24px", display: "flex", flexDirection: "column", gap: "20px" }}>
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "20px" }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <h4 style={{ fontFamily: "'Inter', sans-serif", fontSize: "13.5px", color: C.text, fontWeight: 500 }}>
                            Ticari Elektronik İleti Onayı
                          </h4>
                          {marketingConsent ? (
                            <span style={{ fontSize: "10px", color: C.success, background: "rgba(134,239,172,0.06)", border: `1px solid ${C.success}33`, padding: "2px 6px", borderRadius: "4px", fontWeight: 500 }}>Aktif</span>
                          ) : (
                            <span style={{ fontSize: "10px", color: C.muted, background: "rgba(255,255,255,0.04)", border: `1px solid rgba(255,255,255,0.1)`, padding: "2px 6px", borderRadius: "4px", fontWeight: 400 }}>Pasif</span>
                          )}
                        </div>
                        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "12.5px", color: C.muted, fontWeight: 300, lineHeight: 1.6, maxWidth: "480px" }}>
                          birlikteydik.com tarafından yeni şablonlar, kampanyalar ve indirim kuponları gibi özel fırsatları içeren bilgilendirme e-postaları almak istiyorum.
                        </p>
                      </div>

                      {/* Custom Switch Toggle */}
                      <button
                        onClick={() => handleToggleConsent(!marketingConsent)}
                        disabled={loading}
                        style={{
                          width: "48px", height: "26px", borderRadius: "13px",
                          border: "none", cursor: loading ? "not-allowed" : "pointer",
                          background: marketingConsent ? C.purple : "rgba(255,255,255,0.12)",
                          position: "relative", display: "flex", alignItems: "center",
                          padding: "3px", transition: "background 0.25s", flexShrink: 0
                        }}
                      >
                        <div style={{
                          width: "20px", height: "20px", borderRadius: "50%",
                          background: "#0B0F1A", transition: "transform 0.25s",
                          transform: marketingConsent ? "translateX(22px)" : "translateX(0px)"
                        }} />
                      </button>
                    </div>

                    <div style={{ height: "1px", background: "rgba(255,255,255,0.04)" }} />

                    <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                      <span style={{ color: C.purple, fontSize: "13px", marginTop: "1px" }}>ℹ</span>
                      <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "11.5px", color: "rgba(240,237,232,0.22)", fontWeight: 300, lineHeight: 1.5 }}>
                        Onayı dilediğiniz zaman buradan kapatıp açabilirsiniz. Tercihleriniz anında güncellenir ve onay durumunuza uygun İYS bildirimleri otomatik güncellenir. Ayrıntılı yasal metne <a href="/kvkk-metni" target="_blank" style={{ color: C.purple, textDecoration: "underline", textDecorationColor: "rgba(184,169,212,0.3)" }}>Ticari Elektronik İleti Metni</a> sayfamızdan ulaşabilirsiniz.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 3: Hesap Bilgileri & Preview */}
              {activeTab === "details" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
                  <div>
                    <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.6rem", fontWeight: 500, color: C.text, marginBottom: "8px" }}>
                      Hesap <em style={{ color: C.gold, fontStyle: "italic" }}>Detayları</em>
                    </h2>
                    <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "12.5px", color: C.muted, fontWeight: 300 }}>
                      Üyelik bilgilerinizi ve profilinizin genel özetini inceleyin.
                    </p>
                  </div>

                  {/* Details stats */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }} className="form-row">
                    <div style={{ background: "rgba(255,255,255,0.012)", border: "1px solid rgba(255,255,255,0.04)", borderRadius: "14px", padding: "18px 20px" }}>
                      <span style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.1em", color: C.muted, display: "block", marginBottom: "4px" }}>Üyelik Tarihi</span>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <HiOutlineCalendar size={16} color={C.gold} />
                        <span style={{ fontSize: "14px", fontWeight: 400, color: C.text }}>{createdAt || "Bilinmiyor"}</span>
                      </div>
                    </div>

                    <div style={{ background: "rgba(255,255,255,0.012)", border: "1px solid rgba(255,255,255,0.04)", borderRadius: "14px", padding: "18px 20px" }}>
                      <span style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.1em", color: C.muted, display: "block", marginBottom: "4px" }}>Hesap Rolü</span>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <HiOutlineShieldCheck size={16} color={C.gold} />
                        <span style={{ fontSize: "14px", fontWeight: 400, color: C.text }}>Standart Üye</span>
                      </div>
                    </div>
                  </div>

                  {/* Premium Section Promo card */}
                  <div style={{
                    background: "radial-gradient(ellipse at 80% 0%, rgba(201,168,76,0.12) 0%, transparent 60%), rgba(255,255,255,0.02)",
                    border: `1px solid rgba(201,168,76,0.2)`,
                    borderRadius: "16px", padding: "24px", display: "flex", flexDirection: "column", gap: "14px"
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <HiHeart size={18} color={C.gold} />
                      <h4 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.25rem", fontWeight: 600, color: C.text }}>
                        Sana Özel Anı Sayfanı Oluşturdun Mu?
                      </h4>
                    </div>
                    <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "12.5px", color: C.muted, fontWeight: 300, lineHeight: 1.6 }}>
                      birlikteydik.com ile sevgiliniz, eşiniz veya sevdiklerinizle paylaştığınız en güzel anıları ölümsüzleştiren retro ve sinematik tasarımlı web sayfaları kurabilirsiniz.
                    </p>
                    <a href="/#nasil-calisir"
                      style={{
                        padding: "8px 18px", borderRadius: "20px", background: C.gold, color: "#0B0F1A",
                        fontSize: "11.5px", fontWeight: 600, textDecoration: "none", alignSelf: "flex-start",
                        letterSpacing: "0.06em", textTransform: "uppercase", transition: "opacity 0.2s"
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.85"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
                    >
                      Tasarımları Keşfet
                    </a>
                  </div>
                </div>
              )}

              {/* Tab 4: Danger Zone (Hesabı Sil) */}
              {activeTab === "danger" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
                  <div>
                    <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.6rem", fontWeight: 500, color: "#E8A0A0", marginBottom: "8px" }}>
                      Tehlikeli Bölge
                    </h2>
                    <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "12.5px", color: C.muted, fontWeight: 300 }}>
                      Bu alandaki işlemler geri alınamaz. Lütfen dikkatli ilerleyin.
                    </p>
                  </div>

                  <div style={{ background: "rgba(232,160,160,0.03)", border: "1px solid rgba(232,160,160,0.25)", borderRadius: "16px", padding: "24px", display: "flex", flexDirection: "column", gap: "20px" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <h4 style={{ fontFamily: "'Inter', sans-serif", fontSize: "13.5px", color: "#E8A0A0", fontWeight: 500 }}>
                        Hesabı Kalıcı Olarak Sil
                      </h4>
                      <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "12.5px", color: "rgba(240,237,232,0.4)", fontWeight: 300, lineHeight: 1.6 }}>
                        Hesabınızı sildiğinizde, birlikteydik.com üzerinde oluşturduğunuz tüm anılar, kişisel veriler ve ayarlar geri döndürülemez biçimde tamamen silinir.
                      </p>
                    </div>

                    <div style={{ height: "1px", background: "rgba(232,160,160,0.15)" }} />

                    {/* Delete verification fields */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                      {errors.delete && (
                        <div style={{ padding: "10px 14px", borderRadius: "8px", background: "rgba(232,160,160,0.08)", border: `1px solid ${C.error}22`, color: C.error, fontSize: "12.5px" }}>
                          {errors.delete}
                        </div>
                      )}

                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }} className="form-row">
                        <ProfileInput
                          label="Onaylama Kelimesi" value={deleteConfirmText} onChange={setDeleteConfirmText}
                          placeholder="Devam etmek için 'sil' yazın" icon={<HiOutlineTrash size={15} />} error={errors.deleteConfirmText}
                        />
                        <ProfileInput
                          label="Şifreniz" type={showDeletePass ? "text" : "password"} value={deletePassword} onChange={setDeletePassword}
                          placeholder="Mevcut şifreniz" icon={<HiOutlineLockClosed size={15} />} error={errors.deletePassword}
                          rightElement={<span onClick={() => setShowDeletePass(!showDeletePass)}>{showDeletePass ? <HiOutlineEyeOff size={15} /> : <HiOutlineEye size={15} />}</span>}
                        />
                      </div>

                      <button
                        onClick={handleDeleteAccount} disabled={loading}
                        style={{
                          padding: "13px 24px", borderRadius: "30px", border: "none",
                          background: loading ? "rgba(232,160,160,0.4)" : "#E8A0A0", color: "#0B0F1A",
                          fontFamily: "'Inter', sans-serif", fontSize: "12.5px", letterSpacing: "0.08em",
                          textTransform: "uppercase", fontWeight: 600, cursor: loading ? "not-allowed" : "pointer",
                          transition: "all 0.2s", alignSelf: "flex-start", marginTop: "8px",
                          display: "flex", alignItems: "center", gap: "8px",
                        }}
                        onMouseEnter={(e) => { if (!loading) e.currentTarget.style.opacity = "0.85"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
                      >
                        <HiOutlineTrash size={15} />
                        <span>{loading ? "Hesap Siliniyor..." : "Hesabımı Kalıcı Olarak Sil"}</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>

        </div>
      </main>
    </>
  );
}
