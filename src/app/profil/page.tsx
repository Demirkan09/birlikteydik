"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  HiOutlineUser,
  HiOutlineShieldCheck,
  HiOutlineTrash,
  HiOutlineLogout,
  HiOutlineCalendar,
  HiOutlineCheckCircle,
  HiOutlineChevronRight,
  HiOutlineCollection,
} from "react-icons/hi";

import { HeartsCanvas } from "../_components/HeartsCanvas";
import { C } from "./_utils/constants";
import { User, UserPage } from "./types";

// Tabs
import { PersonalInfoTab } from "./_components/Tabs/PersonalInfoTab";
import { CommunicationsTab } from "./_components/Tabs/CommunicationsTab";
import { AccountDetailsTab } from "./_components/Tabs/AccountDetailsTab";
import { MyPagesTab } from "./_components/Tabs/MyPagesTab";
import { DangerZoneTab } from "./_components/Tabs/DangerZoneTab";

export default function ProfilePage() {
  const router = useRouter();

  // Auth states
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Tab state
  const [activeTab, setActiveTab] = useState<"info" | "notifications" | "details" | "pages" | "danger">("info");

  // Sayfalarım states
  const [userPages, setUserPages] = useState<UserPage[]>([]);
  const [activationCode, setActivationCode] = useState("");
  const [activationLoading, setActivationLoading] = useState(false);
  const [activationMsg, setActivationMsg] = useState("");
  const [activationError, setActivationError] = useState("");

  // Per-page password states
  const [pagePasswords, setPagePasswords] = useState<Record<string, string>>({});
  const [pagePassErrors, setPagePassErrors] = useState<Record<string, string>>({});
  const [pagePassSuccess, setPagePassSuccess] = useState<Record<string, string>>({});
  const [pagePassLoading, setPagePassLoading] = useState<Record<string, boolean>>({});
  const [showPagePass, setShowPagePass] = useState<Record<string, boolean>>({});

  // Form states - Kişisel Bilgiler
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordConfirm, setNewPasswordConfirm] = useState("");

  // State - Onaylar
  const [marketingConsent, setMarketingConsent] = useState(false);

  // Stats / Meta details
  const [createdAt, setCreatedAt] = useState<string>("");

  // Danger Zone states
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  // Status feedback states
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  // E-posta doğrulama states
  const [verificationLoading, setVerificationLoading] = useState(false);
  const [verificationSuccess, setVerificationSuccess] = useState("");

  // 1. Session check on mount & fetch fresh database details
  useEffect(() => {
    const checkSession = async () => {
      try {
        const stored = localStorage.getItem("birlikteydik_user");
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
            const freshUser = {
              id: data.user.id,
              name: data.user.name,
              email: data.user.email,
              role: data.user.role,
              marketingConsent: data.user.marketingConsent,
              isVerified: data.user.isVerified,
            };
            setUser(freshUser);
            // Sync role to localStorage
            localStorage.setItem("birlikteydik_user", JSON.stringify(freshUser));
            setName(data.user.name);
            setEmail(data.user.email);
            setMarketingConsent(!!data.user.marketingConsent);

            // Format creation date
            if (data.user.createdAt) {
              const dateObj = new Date(data.user.createdAt);
              setCreatedAt(dateObj.toLocaleDateString("tr-TR", { year: "numeric", month: "long", day: "numeric" }));
            }

            // Load user pages
            if (data.user.pages) {
              setUserPages(data.user.pages);
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
    localStorage.removeItem("birlikteydik_user");
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
        isVerified: data.user.isVerified,
      };
      localStorage.setItem("birlikteydik_user", JSON.stringify(updatedUser));
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
      localStorage.setItem("birlikteydik_user", JSON.stringify(updatedUser));
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
      localStorage.removeItem("birlikteydik_user");
      window.dispatchEvent(new Event("auth-change"));
      router.push("/");
    } catch {
      setErrors({ delete: "Bağlantı hatası oluştu." });
      setLoading(false);
    }
  };

  // ─── E-posta Doğrulama Kodu Gönder ──────────────────────────────────────────
  const handleSendVerification = async () => {
    if (!user?.email) return;
    setVerificationLoading(true);
    setVerificationSuccess("");
    setErrors({});
    try {
      const res = await fetch("/api/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrors({ general: data.error ?? "Doğrulama kodu gönderilemedi." });
        return;
      }
      setVerificationSuccess("Doğrulama kodu e-postanıza gönderildi! Yönlendiriliyorsunuz...");
      setTimeout(() => {
        router.push(`/verify-email?email=${encodeURIComponent(user.email)}`);
      }, 2000);
    } catch {
      setErrors({ general: "Bağlantı hatası oluştu." });
    } finally {
      setVerificationLoading(false);
    }
  };

  // ─── Aktivasyon Kodu Gönder ────────────────────────────────────────────────
  const handleActivate = async () => {
    if (!user?.id) return;
    const code = activationCode.trim().toUpperCase();
    if (!code) { setActivationError("Lütfen bir aktivasyon kodu girin."); return; }
    setActivationLoading(true);
    setActivationError("");
    setActivationMsg("");
    try {
      const res = await fetch("/api/activate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, code }),
      });
      const data = await res.json();
      if (!res.ok) { setActivationError(data.error ?? "Kod geçersiz."); return; }
      setActivationMsg("Sayfa başarıyla aktive edildi! 🎉");
      setActivationCode("");
      if (data.page) setUserPages((prev) => [data.page, ...prev]);
    } catch { setActivationError("Bağlantı hatası oluştu."); }
    finally { setActivationLoading(false); }
  };

  // ─── Sayfa Şifresi Ayarla ─────────────────────────────────────────────────
  const handleSetPagePassword = async (pageSlug: string) => {
    if (!user?.id) return;
    const pwd = pagePasswords[pageSlug] || "";
    if (pwd.length < 4) { setPagePassErrors((p) => ({ ...p, [pageSlug]: "Şifre en az 4 karakter olmalıdır." })); return; }
    setPagePassLoading((p) => ({ ...p, [pageSlug]: true }));
    setPagePassErrors((p) => ({ ...p, [pageSlug]: "" }));
    try {
      const res = await fetch("/api/page-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, pageSlug, newPassword: pwd }),
      });
      const data = await res.json();
      if (!res.ok) { setPagePassErrors((p) => ({ ...p, [pageSlug]: data.error ?? "Hata oluştu." })); return; }
      setPagePassSuccess((p) => ({ ...p, [pageSlug]: "Şifre kaydedildi." }));
      setPagePasswords((p) => ({ ...p, [pageSlug]: "" }));
      setTimeout(() => setPagePassSuccess((p) => ({ ...p, [pageSlug]: "" })), 3000);
    } catch { setPagePassErrors((p) => ({ ...p, [pageSlug]: "Bağlantı hatası." })); }
    finally { setPagePassLoading((p) => ({ ...p, [pageSlug]: false })); }
  };

  // ─── Sayfa Şifresini Kaldır ───────────────────────────────────────────────
  const handleRemovePagePassword = async (pageSlug: string) => {
    if (!user?.id) return;
    setPagePassLoading((p) => ({ ...p, [pageSlug]: true }));
    try {
      const res = await fetch("/api/page-password", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, pageSlug }),
      });
      const data = await res.json();
      if (!res.ok) { setPagePassErrors((p) => ({ ...p, [pageSlug]: data.error ?? "Hata oluştu." })); return; }
      setPagePassSuccess((p) => ({ ...p, [pageSlug]: "Şifre kaldırıldı." }));
      setTimeout(() => setPagePassSuccess((p) => ({ ...p, [pageSlug]: "" })), 3000);
    } catch { setPagePassErrors((p) => ({ ...p, [pageSlug]: "Bağlantı hatası." })); }
    finally { setPagePassLoading((p) => ({ ...p, [pageSlug]: false })); }
  };

  // ─── Zaman Geçti Hesaplayıcı ──────────────────────────────────────────────
  const timeAgo = (dateStr: string): string => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins} dakika önce`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs} saat önce`;
    const days = Math.floor(hrs / 24);
    if (days < 30) return `${days} gün önce`;
    const months = Math.floor(days / 30);
    return `${months} ay önce`;
  };

  if (authLoading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: C.bg, color: C.text }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
          <span style={{ width: "28px", height: "28px", border: "2.5px solid rgba(201,168,76,0.2)", borderTopColor: C.gold, borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
          <p style={{ fontFamily: "var(--font-inter), sans-serif", fontSize: "13px", color: C.muted, letterSpacing: "0.05em" }}>Profil yükleniyor…</p>
        </div>

      </div>
    );
  }

  if (!user) return null;

  return (
    <>

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
                <h1 style={{ fontFamily: "'Cormorant Garamond', 'Cormorant Garamond Fallback', serif", fontSize: "clamp(1.5rem, 4vw, 2.1rem)", fontWeight: 600, color: C.text, lineHeight: 1.1 }}>
                  Merhaba, <em style={{ color: C.gold, fontStyle: "italic" }}>{user.name}</em>
                </h1>
                <p style={{ fontFamily: "var(--font-inter), sans-serif", fontSize: "13px", color: C.muted, fontWeight: 300 }}>{user.email}</p>
              </div>
            </div>

            {/* Logout button */}
            <button
              onClick={handleLogout}
              style={{
                display: "flex", alignItems: "center", gap: "8px", padding: "11px 22px",
                borderRadius: "30px", border: "1px solid rgba(232,160,160,0.2)",
                background: "rgba(232,160,160,0.04)", color: "#E8A0A0",
                fontFamily: "var(--font-inter), sans-serif", fontSize: "12px", letterSpacing: "0.08em",
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
                style={{ padding: "14px 20px", borderRadius: "10px", background: "rgba(134,239,172,0.06)", border: `1px solid ${C.success}33`, display: "flex", alignItems: "center", gap: "10px", color: C.success, fontFamily: "var(--font-inter), sans-serif", fontSize: "13.5px", fontWeight: 300 }}>
                <HiOutlineCheckCircle size={18} />
                <span>{successMsg}</span>
              </motion.div>
            )}
            {errors.general && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                style={{ padding: "14px 20px", borderRadius: "10px", background: "rgba(232,160,160,0.06)", border: `1px solid ${C.error}33`, display: "flex", alignItems: "center", gap: "10px", color: C.error, fontFamily: "var(--font-inter), sans-serif", fontSize: "13.5px", fontWeight: 300 }}>
                <span style={{ fontSize: "18px", display: "flex" }}>⚠</span>
                <span>{errors.general}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <div style={{ display: "grid", gridTemplateColumns: "clamp(200px, 30%, 280px) 1fr", gap: "28px", alignItems: "start" }} className="profile-grid">

            {/* Sidebar navigation */}
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", background: "rgba(255,255,255,0.015)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "20px", padding: "16px" }}>
              {[
                { id: "info", label: "Kişisel Bilgiler", icon: <HiOutlineUser size={16} /> },
                { id: "notifications", label: "İletişim & Onaylar", icon: <HiOutlineShieldCheck size={16} /> },
                { id: "details", label: "Hesap Bilgileri", icon: <HiOutlineCalendar size={16} /> },
                { id: "pages", label: "Sayfalarım", icon: <HiOutlineCollection size={16} /> },
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
                      fontFamily: "var(--font-inter), sans-serif", fontSize: "13px", fontWeight: isActive ? 500 : 300,
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
                <PersonalInfoTab
                  user={user}
                  name={name}
                  setName={setName}
                  email={email}
                  setEmail={setEmail}
                  currentPassword={currentPassword}
                  setCurrentPassword={setCurrentPassword}
                  newPassword={newPassword}
                  setNewPassword={setNewPassword}
                  newPasswordConfirm={newPasswordConfirm}
                  setNewPasswordConfirm={setNewPasswordConfirm}
                  handleUpdateProfile={handleUpdateProfile}
                  loading={loading}
                  errors={errors}
                  handleSendVerification={handleSendVerification}
                  verificationLoading={verificationLoading}
                  verificationSuccess={verificationSuccess}
                />
              )}

              {/* Tab 2: İletişim & Onaylar */}
              {activeTab === "notifications" && (
                <CommunicationsTab
                  marketingConsent={marketingConsent}
                  handleToggleConsent={handleToggleConsent}
                  loading={loading}
                  errors={errors}
                />
              )}

              {/* Tab 3: Hesap Bilgileri */}
              {activeTab === "details" && (
                <AccountDetailsTab createdAt={createdAt} />
              )}

              {/* Tab 4: Sayfalarım */}
              {activeTab === "pages" && (
                <MyPagesTab
                  userPages={userPages}
                  activationCode={activationCode}
                  setActivationCode={setActivationCode}
                  activationError={activationError}
                  setActivationError={setActivationError}
                  activationLoading={activationLoading}
                  handleActivate={handleActivate}
                  activationMsg={activationMsg}
                  timeAgo={timeAgo}
                  pagePasswords={pagePasswords}
                  setPagePasswords={setPagePasswords}
                  pagePassErrors={pagePassErrors}
                  setPagePassErrors={setPagePassErrors}
                  showPagePass={showPagePass}
                  setShowPagePass={setShowPagePass}
                  handleSetPagePassword={handleSetPagePassword}
                  pagePassLoading={pagePassLoading}
                  handleRemovePagePassword={handleRemovePagePassword}
                  pagePassSuccess={pagePassSuccess}
                />
              )}

              {/* Tab 5: Danger Zone (Hesabı Sil) */}
              {activeTab === "danger" && (
                <DangerZoneTab
                  deleteConfirmText={deleteConfirmText}
                  setDeleteConfirmText={setDeleteConfirmText}
                  deletePassword={deletePassword}
                  setDeletePassword={setDeletePassword}
                  handleDeleteAccount={handleDeleteAccount}
                  loading={loading}
                  errors={errors}
                />
              )}

            </div>
          </div>

        </div>
      </main>
    </>
  );
}
