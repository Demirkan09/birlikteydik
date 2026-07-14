"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

function useWindowWidth() {
  const [width, setWidth] = useState<number>(typeof window !== "undefined" ? window.innerWidth : 1024);
  useEffect(() => {
    const handler = () => setWidth(window.innerWidth);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);
  return width;
}
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

export default function ProfilePage({ lang }: { lang?: string }) {
  const isEn = lang === "en" || (typeof window !== "undefined" && window.location.pathname.startsWith("/en/"));

  const t = {
    loading: isEn ? "Profile loading..." : "Profil yükleniyor…",
    hello: isEn ? "Hello, " : "Merhaba, ",
    activeSession: isEn ? "Active Session" : "Aktif Oturum",
    logout: isEn ? "Log Out" : "Güvenli Çıkış Yap",
    logoutShort: isEn ? "Exit" : "Çıkış",
    errNameReq: isEn ? "Name field cannot be left blank." : "İsim alanı boş bırakılamaz.",
    errEmailVal: isEn ? "Please enter a valid email." : "Geçerli bir e-posta girin.",
    errCurPassword: isEn ? "To change your password, you must enter your current password." : "Şifrenizi değiştirmek için mevcut şifrenizi girmeniz gerekir.",
    errNewPasswordLen: isEn ? "New password must be at least 8 characters." : "Yeni şifre en az 8 karakter olmalıdır.",
    errNewPasswordMatch: isEn ? "Passwords do not match." : "Şifreler eşleşmiyor.",
    errGeneralUpdate: isEn ? "An error occurred during update." : "Güncelleme sırasında bir hata oluştu.",
    successUpdate: isEn ? "Your personal information has been successfully updated." : "Kişisel bilgileriniz başarıyla güncellendi.",
    errConnection: isEn ? "Connection error. Please try again later." : "Bağlantı hatası. Lütfen daha sonra tekrar deneyin.",
    errConsentUpdate: isEn ? "Consent could not be updated." : "Onay güncellenemedi.",
    successConsentOn: isEn ? "Campaign and communication consent granted." : "Kampanya ve iletişim onayı verildi.",
    successConsentOff: isEn ? "Campaign and communication consent removed." : "Kampanya ve iletişim onayı kaldırıldı.",
    errConsentGeneral: isEn ? "An error occurred while updating consent." : "Onay güncellenirken bir hata oluştu.",
    errDeletePasswordReq: isEn ? "You must enter your password." : "Şifrenizi girmelisiniz.",
    errDeleteConfirmWord: isEn ? "You must type 'delete' to confirm account deletion." : "Hesap silme işlemini onaylamak için kutuya 'sil' yazmalısınız.",
    errDeleteGeneral: isEn ? "An error occurred during deletion." : "Silme işlemi sırasında hata oluştu.",
    errDeleteConnection: isEn ? "A connection error occurred." : "Bağlantı hatası oluştu.",
    errVerifySendFail: isEn ? "Verification code could not be sent." : "Doğrulama kodu gönderilemedi.",
    successVerifySend: isEn ? "Verification code sent to your email! Redirecting..." : "Doğrulama kodu e-postanıza gönderildi! Yönlendiriliyorsunuz...",
    errActivateReq: isEn ? "Please enter an activation code." : "Lütfen bir aktivasyon kodu girin.",
    errActivateInvalid: isEn ? "Code is invalid." : "Kod geçersiz.",
    successActivate: isEn ? "Page activated successfully! 🎉" : "Sayfa başarıyla aktive edildi! 🎉",
    errActivateConn: isEn ? "A connection error occurred." : "Bağlantı hatası oluştu.",
    errPagePasswordLen: isEn ? "Password must be at least 4 characters." : "Şifre en az 4 karakter olmalıdır.",
    errPagePasswordGeneral: isEn ? "An error occurred." : "Hata oluştu.",
    successPagePasswordSaved: isEn ? "Password saved." : "Şifre kaydedildi.",
    errPagePasswordConn: isEn ? "Connection error." : "Bağlantı hatası.",
    successPagePasswordRemoved: isEn ? "Password removed." : "Şifre kaldırıldı.",
    tabInfo: isEn ? "Personal Info" : "Kişisel Bilgiler",
    tabInfoMobile: isEn ? "Info" : "Bilgiler",
    tabConsent: isEn ? "Consent & Options" : "İletişim & Onaylar",
    tabConsentMobile: isEn ? "Contact" : "İletişim",
    tabAccount: isEn ? "Account Details" : "Hesap Bilgileri",
    tabAccountMobile: isEn ? "Account" : "Hesap",
    tabPages: isEn ? "My Pages" : "Sayfalarım",
    tabDanger: isEn ? "Permanently Delete Account" : "Hesabı Kalıcı Olarak Sil",
    tabDangerMobile: isEn ? "Delete" : "Sil",
  };

  const isMobile = useWindowWidth() < 768;
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
          router.push(isEn ? "/en/login" : "/login");
          return;
        }
        const parsed = JSON.parse(stored);
        setUser(parsed);
        setName(parsed.name || "");
        setEmail(parsed.email || "");

        // Fetch fresh details from DB
        const res = await fetch(`/api/profile?email=${encodeURIComponent(parsed.email)}&lang=${isEn ? "en" : "tr"}`);
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
              setCreatedAt(dateObj.toLocaleDateString(isEn ? "en-US" : "tr-TR", { year: "numeric", month: "long", day: "numeric" }));
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
  }, [router, isEn]);

  // Handle Logout
  const handleLogout = () => {
    localStorage.removeItem("birlikteydik_user");
    window.dispatchEvent(new Event("auth-change"));
    router.push(isEn ? "/en/" : "/");
  };

  // 2. Submit Info & Password Change
  const handleUpdateProfile = async () => {
    if (!user) return;
    setLoading(true);
    setSuccessMsg("");
    setErrors({});

    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = t.errNameReq;
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) errs.email = t.errEmailVal;

    if (newPassword) {
      if (!currentPassword) {
        errs.currentPassword = t.errCurPassword;
      }
      if (newPassword.length < 8) {
        errs.newPassword = t.errNewPasswordLen;
      }
      if (newPassword !== newPasswordConfirm) {
        errs.newPasswordConfirm = t.errNewPasswordMatch;
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
        setErrors({ general: data.error || t.errGeneralUpdate });
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

      setSuccessMsg(t.successUpdate);
      setTimeout(() => setSuccessMsg(""), 5000);
    } catch {
      setErrors({ general: t.errConnection });
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
        setErrors({ consent: data.error || t.errConsentUpdate });
        setLoading(false);
        return;
      }

      setMarketingConsent(checked);
      const updatedUser = { ...user, marketingConsent: checked };
      localStorage.setItem("birlikteydik_user", JSON.stringify(updatedUser));
      setUser(updatedUser);

      setSuccessMsg(checked ? t.successConsentOn : t.successConsentOff);
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch {
      setErrors({ consent: t.errConsentGeneral });
    } finally {
      setLoading(false);
    }
  };

  // 4. Secure Account Deletion
  const handleDeleteAccount = async () => {
    if (!user) return;
    setErrors({});

    if (!deletePassword) {
      setErrors({ deletePassword: t.errDeletePasswordReq });
      return;
    }
    if (deleteConfirmText.toLowerCase() !== (isEn ? "delete" : "sil")) {
      setErrors({ deleteConfirmText: t.errDeleteConfirmWord });
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
        setErrors({ delete: data.error || t.errDeleteGeneral });
        setLoading(false);
        return;
      }

      // Clear local storage and redirect
      localStorage.removeItem("birlikteydik_user");
      window.dispatchEvent(new Event("auth-change"));
      router.push(isEn ? "/en/" : "/");
    } catch {
      setErrors({ delete: t.errDeleteConnection });
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
        setErrors({ general: data.error || t.errVerifySendFail });
        return;
      }
      setVerificationSuccess(t.successVerifySend);
      setTimeout(() => {
        router.push((isEn ? "/en/verify-email" : "/verify-email") + `?email=${encodeURIComponent(user.email)}`);
      }, 2000);
    } catch {
      setErrors({ general: t.errDeleteConnection });
    } finally {
      setVerificationLoading(false);
    }
  };

  // ─── Aktivasyon Kodu Gönder ────────────────────────────────────────────────
  const handleActivate = async () => {
    if (!user?.id) return;
    const code = activationCode.trim().toUpperCase();
    if (!code) { setActivationError(t.errActivateReq); return; }
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
      if (!res.ok) { setActivationError(data.error || t.errActivateInvalid); return; }
      setActivationMsg(t.successActivate);
      setActivationCode("");
      if (data.page) setUserPages((prev) => [data.page, ...prev]);
    } catch { setActivationError(t.errActivateConn); }
    finally { setActivationLoading(false); }
  };

  // ─── Sayfa Şifresi Ayarla ─────────────────────────────────────────────────
  const handleSetPagePassword = async (pageSlug: string) => {
    if (!user?.id) return;
    const pwd = pagePasswords[pageSlug] || "";
    if (pwd.length < 4) { setPagePassErrors((p) => ({ ...p, [pageSlug]: t.errPagePasswordLen })); return; }
    setPagePassLoading((p) => ({ ...p, [pageSlug]: true }));
    setPagePassErrors((p) => ({ ...p, [pageSlug]: "" }));
    try {
      const res = await fetch("/api/page-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, pageSlug, newPassword: pwd }),
      });
      const data = await res.json();
      if (!res.ok) { setPagePassErrors((p) => ({ ...p, [pageSlug]: data.error || t.errPagePasswordGeneral })); return; }
      setPagePassSuccess((p) => ({ ...p, [pageSlug]: t.successPagePasswordSaved }));
      setPagePasswords((p) => ({ ...p, [pageSlug]: "" }));
      setTimeout(() => setPagePassSuccess((p) => ({ ...p, [pageSlug]: "" })), 3000);
    } catch { setPagePassErrors((p) => ({ ...p, [pageSlug]: t.errPagePasswordConn })); }
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
      if (!res.ok) { setPagePassErrors((p) => ({ ...p, [pageSlug]: data.error || t.errPagePasswordGeneral })); return; }
      setPagePassSuccess((p) => ({ ...p, [pageSlug]: t.successPagePasswordRemoved }));
      setTimeout(() => setPagePassSuccess((p) => ({ ...p, [pageSlug]: "" })), 3000);
    } catch { setPagePassErrors((p) => ({ ...p, [pageSlug]: t.errPagePasswordConn })); }
    finally { setPagePassLoading((p) => ({ ...p, [pageSlug]: false })); }
  };

  // ─── Zaman Geçti Hesaplayıcı ──────────────────────────────────────────────
  const timeAgo = (dateStr: string): string => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins} ${isEn ? "minutes ago" : "dakika önce"}`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs} ${isEn ? "hours ago" : "saat önce"}`;
    const days = Math.floor(hrs / 24);
    if (days < 30) return `${days} ${isEn ? "days ago" : "gün önce"}`;
    const months = Math.floor(days / 30);
    return `${months} ${isEn ? "months ago" : "ay önce"}`;
  };

  if (authLoading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: C.bg, color: C.text }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
          <span style={{ width: "28px", height: "28px", border: "2.5px solid rgba(201,168,76,0.2)", borderTopColor: C.gold, borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
          <p style={{ fontFamily: "var(--font-inter), sans-serif", fontSize: "13px", color: C.muted, letterSpacing: "0.05em" }}>{t.loading}</p>
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

      <main style={{ position: "relative", zIndex: 1, minHeight: "100vh", padding: isMobile ? "80px 16px 40px" : "100px 24px 60px" }}>
        <div style={{ maxWidth: "1024px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "32px" }}>

          {/* Header Panel */}
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: isMobile ? "16px" : "24px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "20px", padding: isMobile ? "20px" : "28px clamp(20px, 4vw, 36px)", backdropFilter: "blur(12px)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: isMobile ? "14px" : "20px" }}>
              {/* User Avatar with gradient border */}
              <div style={{ position: "relative", width: isMobile ? "50px" : "64px", height: isMobile ? "50px" : "64px", borderRadius: "50%", background: "linear-gradient(135deg, #C9A84C, #B8A9D4)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 8px 24px rgba(0,0,0,0.3)", flexShrink: 0 }}>
                <span style={{ fontSize: isMobile ? "18px" : "22px", color: "#0B0F1A", fontWeight: 700 }}>{user.name?.[0]?.toUpperCase()}</span>
                <div style={{ position: "absolute", bottom: 0, right: 0, width: "14px", height: "14px", borderRadius: "50%", background: C.success, border: `2px solid ${C.bg}`, display: "flex", alignItems: "center", justifyContent: "center" }} title={t.activeSession} />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "3px", minWidth: 0 }}>
                <h1 style={{ fontFamily: "'Cormorant Garamond', 'Cormorant Garamond Fallback', serif", fontSize: isMobile ? "1.5rem" : "clamp(1.5rem, 4vw, 2.1rem)", fontWeight: 600, color: C.text, lineHeight: 1.1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {t.hello}<em style={{ color: C.gold, fontStyle: "italic" }}>{user.name}</em>
                </h1>
                <p style={{ fontFamily: "var(--font-inter), sans-serif", fontSize: isMobile ? "11px" : "13px", color: C.muted, fontWeight: 300, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.email}</p>
              </div>
            </div>

            {/* Logout button */}
            <button
              onClick={handleLogout}
              style={{
                display: "flex", alignItems: "center", gap: "6px", padding: isMobile ? "8px 16px" : "11px 22px",
                borderRadius: "30px", border: "1px solid rgba(232,160,160,0.2)",
                background: "rgba(232,160,160,0.04)", color: "#E8A0A0",
                fontFamily: "var(--font-inter), sans-serif", fontSize: isMobile ? "11px" : "12px", letterSpacing: "0.08em",
                textTransform: "uppercase", fontWeight: 500, cursor: "pointer",
                transition: "all 0.2s", flexShrink: 0
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(232,160,160,0.08)"; e.currentTarget.style.borderColor = "rgba(232,160,160,0.35)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(232,160,160,0.04)"; e.currentTarget.style.borderColor = "rgba(232,160,160,0.2)"; }}
            >
              <HiOutlineLogout size={13} />
              {!isMobile && <span>{t.logout}</span>}
              {isMobile && <span>{t.logoutShort}</span>}
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

          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "clamp(200px, 30%, 280px) 1fr", gap: isMobile ? "12px" : "28px", alignItems: "start" }} className="profile-grid">

            {/* Sidebar / Tab navigation */}
            {isMobile ? (
              /* Mobile: horizontal scrollable tab bar */
              <div style={{ display: "flex", gap: "8px", overflowX: "auto", paddingBottom: "4px", scrollbarWidth: "none", background: "rgba(255,255,255,0.015)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "16px", padding: "10px" }}>
                {[
                  { id: "info", label: t.tabInfoMobile, icon: <HiOutlineUser size={15} /> },
                  { id: "notifications", label: t.tabConsentMobile, icon: <HiOutlineShieldCheck size={15} /> },
                  { id: "details", label: t.tabAccountMobile, icon: <HiOutlineCalendar size={15} /> },
                  { id: "pages", label: t.tabPages, icon: <HiOutlineCollection size={15} /> },
                  { id: "danger", label: t.tabDangerMobile, icon: <HiOutlineTrash size={15} />, color: "#E8A0A0" },
                ].map((tab) => {
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => { setActiveTab(tab.id as any); setErrors({}); setSuccessMsg(""); }}
                      style={{
                        display: "flex", flexDirection: "column", alignItems: "center", gap: "4px",
                        padding: "8px 12px", borderRadius: "10px", border: "none", flexShrink: 0,
                        background: isActive ? "rgba(255,255,255,0.07)" : "transparent",
                        color: isActive ? (tab.color || C.gold) : "rgba(240,237,232,0.45)",
                        fontFamily: "var(--font-inter), sans-serif", fontSize: "10px", fontWeight: isActive ? 500 : 400,
                        cursor: "pointer", transition: "all 0.2s",
                        borderBottom: isActive ? `2px solid ${tab.color || C.gold}` : "2px solid transparent"
                      }}
                    >
                      {tab.icon}
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            ) : (
              /* Desktop: vertical sidebar */
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", background: "rgba(255,255,255,0.015)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "20px", padding: "16px" }}>
                {[
                  { id: "info", label: t.tabInfo, icon: <HiOutlineUser size={16} /> },
                  { id: "notifications", label: t.tabConsent, icon: <HiOutlineShieldCheck size={16} /> },
                  { id: "details", label: t.tabAccount, icon: <HiOutlineCalendar size={16} /> },
                  { id: "pages", label: t.tabPages, icon: <HiOutlineCollection size={16} /> },
                  { id: "danger", label: t.tabDanger, icon: <HiOutlineTrash size={16} />, color: "#E8A0A0" },
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
            )}

            {/* Content card */}
            <div style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "20px", padding: isMobile ? "20px 16px" : "clamp(24px, 5vw, 36px)", backdropFilter: "blur(12px)", minHeight: isMobile ? "auto" : "360px" }}>

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
                  isEn={isEn}
                />
              )}

              {/* Tab 2: İletişim & Onaylar */}
              {activeTab === "notifications" && (
                <CommunicationsTab
                  marketingConsent={marketingConsent}
                  handleToggleConsent={handleToggleConsent}
                  loading={loading}
                  errors={errors}
                  isEn={isEn}
                />
              )}

              {/* Tab 3: Hesap Bilgileri */}
              {activeTab === "details" && (
                <AccountDetailsTab createdAt={createdAt} isEn={isEn} />
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
                  isEn={isEn}
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
                  isEn={isEn}
                />
              )}

            </div>
          </div>

        </div>
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
