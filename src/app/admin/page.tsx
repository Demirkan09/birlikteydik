"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  HiOutlineClipboardList,
  HiOutlineUsers,
  HiOutlineClipboardCopy,
  HiOutlineCheck,
  HiOutlineChevronDown,
  HiOutlineChevronUp,
  HiOutlineSearch,
  HiOutlineMail,
  HiOutlineRefresh,
  HiOutlineExternalLink,
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
  cardHover: "rgba(255,255,255,0.07)",
  error: "#E8A0A0",
  success: "#86efac",
  purple: "#B8A9D4",
};

// ─── Types ────────────────────────────────────────────────────────────────────
type Package = "Temel Paket" | "Standart Paket" | "Premium Paket";

interface UserPage {
  slug: string;
  packageName: string;
  createdAt: string;
}

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  pages: UserPage[];
}

interface GeneratedCode {
  code: string;
  pageSlug: string;
  packageName: string;
  generatedAt: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function timeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  if (diffMins < 1) return "az önce";
  if (diffMins < 60) return `${diffMins} dakika önce`;
  if (diffHours < 24) return `${diffHours} saat önce`;
  if (diffDays < 30) return `${diffDays} gün önce`;
  return new Date(dateStr).toLocaleDateString("tr-TR");
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("tr-TR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

// ─── Package Card bileşeni ───────────────────────────────────────────────────
const PACKAGES: { name: Package; desc: string; badge: string }[] = [
  { name: "Temel Paket", desc: "Temel özellikler, 1 sayfa", badge: "Ücretsiz" },
  { name: "Standart Paket", desc: "Gelişmiş özellikler, müzik & galeri", badge: "Popüler" },
  { name: "Premium Paket", desc: "Tüm özellikler + özel domain", badge: "En İyi" },
];

// ─── Admin Panel ─────────────────────────────────────────────────────────────
export default function AdminPage() {
  const router = useRouter();
  const [adminEmail, setAdminEmail] = useState("");
  const [authorized, setAuthorized] = useState(false);
  const [activeTab, setActiveTab] = useState<"codes" | "users">("codes");

  // Tab 1 — Kod Üret
  const [selectedPackage, setSelectedPackage] = useState<Package>("Standart Paket");
  const [pageSlug, setPageSlug] = useState("");
  const [slugError, setSlugError] = useState("");
  const [generating, setGenerating] = useState(false);
  const [generatedCode, setGeneratedCode] = useState<GeneratedCode | null>(null);
  const [copied, setCopied] = useState(false);
  const [recentCodes, setRecentCodes] = useState<GeneratedCode[]>([]);

  // Tab 2 — Kullanıcı Yönetimi
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Auth check
  useEffect(() => {
    try {
      const raw = localStorage.getItem("birlikteydik_user");
      if (!raw) { router.replace("/profil"); return; }
      const user = JSON.parse(raw);
      if (user.role !== "admin") { router.replace("/profil"); return; }
      setAdminEmail(user.email);
      setAuthorized(true);
    } catch {
      router.replace("/profil");
    }
  }, [router]);

  // Kullanıcıları yükle
  const fetchUsers = useCallback(async () => {
    if (!adminEmail) return;
    setUsersLoading(true);
    setUsersError("");
    try {
      const res = await fetch(`/api/admin/users?adminEmail=${encodeURIComponent(adminEmail)}`);
      const data = await res.json();
      if (!res.ok) { setUsersError(data.error ?? "Kullanıcılar yüklenemedi."); return; }
      setUsers(data.users ?? []);
    } catch {
      setUsersError("Sunucuya bağlanılamadı.");
    } finally {
      setUsersLoading(false);
    }
  }, [adminEmail]);

  useEffect(() => {
    if (authorized && activeTab === "users") fetchUsers();
  }, [authorized, activeTab, fetchUsers]);

  // Kod üret
  const handleGenerate = async () => {
    const slug = pageSlug.trim().toLowerCase().replace(/\s+/g, "");
    if (!slug) { setSlugError("Sayfa adresi gerekli"); return; }
    if (!/^[a-z0-9-]+$/.test(slug)) { setSlugError("Sadece küçük harf, rakam ve tire kullanabilirsin"); return; }
    setSlugError("");
    setGenerating(true);
    try {
      const res = await fetch("/api/admin/generate-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminEmail, pageSlug: slug, packageName: selectedPackage }),
      });
      const data = await res.json();
      if (!res.ok) { setSlugError(data.error ?? "Kod üretilemedi."); return; }
      const newCode: GeneratedCode = {
        code: data.code,
        pageSlug: slug,
        packageName: selectedPackage,
        generatedAt: new Date().toISOString(),
      };
      setGeneratedCode(newCode);
      setRecentCodes((prev) => [newCode, ...prev].slice(0, 10));
      setPageSlug("");
    } catch {
      setSlugError("Sunucuya bağlanılamadı.");
    } finally {
      setGenerating(false);
    }
  };

  const handleCopy = () => {
    if (!generatedCode) return;
    navigator.clipboard.writeText(generatedCode.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendResetEmail = async (targetUserId: string, resetType: "account" | "page", pageSlugTarget?: string) => {
    const key = `${targetUserId}-${resetType}-${pageSlugTarget ?? ""}`;
    setActionLoading(key);
    setActionSuccess(null);
    try {
      const body: Record<string, string> = { adminEmail, targetUserId, resetType };
      if (pageSlugTarget) body.pageSlug = pageSlugTarget;
      const res = await fetch("/api/admin/send-reset-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) { const d = await res.json(); alert(d.error ?? "Hata oluştu."); return; }
      setActionSuccess(key);
      setTimeout(() => setActionSuccess(null), 3000);
    } catch {
      alert("Sunucuya bağlanılamadı.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleResetPagePassword = async (pageSlugTarget: string) => {
    const key = `reset-page-${pageSlugTarget}`;
    setActionLoading(key);
    try {
      const res = await fetch("/api/admin/reset-page-password", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminEmail, pageSlug: pageSlugTarget }),
      });
      if (!res.ok) { const d = await res.json(); alert(d.error ?? "Hata oluştu."); return; }
      setActionSuccess(key);
      setTimeout(() => setActionSuccess(null), 3000);
    } catch {
      alert("Sunucuya bağlanılamadı.");
    } finally {
      setActionLoading(null);
    }
  };

  const filteredUsers = users.filter((u) => {
    const q = searchQuery.toLowerCase();
    return !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
  });

  if (!authorized) {
    return (
      <div style={{ minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: "32px", height: "32px", border: `2px solid ${C.border}`, borderTopColor: C.gold, borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const cardStyle: React.CSSProperties = {
    background: "rgba(255,255,255,0.035)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "20px",
    backdropFilter: "blur(16px)",
    WebkitBackdropFilter: "blur(16px)",
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,600&family=Inter:wght@300;400;500;600\u0026display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body { background: ${C.bg}; overflow-x: hidden; color: ${C.text}; font-family: 'Inter', sans-serif; }
        ::selection { background: rgba(201,168,76,0.28); color: ${C.text}; }
        input::placeholder, textarea::placeholder { color: rgba(240,237,232,0.2); }
        input:-webkit-autofill { -webkit-box-shadow: 0 0 0 100px #0d1220 inset !important; -webkit-text-fill-color: #F0EDE8 !important; }
        @keyframes spin { to { transform: rotate(360deg); } }
        ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-track { background: transparent; } ::-webkit-scrollbar-thumb { background: rgba(201,168,76,0.2); border-radius: 4px; }
        select { -webkit-appearance: none; appearance: none; }
        select option { background: #0d1220; color: #F0EDE8; }
      `}</style>

      {/* Arka plan */}
      <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none", background: "radial-gradient(ellipse 70% 50% at 15% 15%, rgba(201,168,76,0.05) 0%, transparent 55%), radial-gradient(ellipse 50% 40% at 85% 85%, rgba(184,169,212,0.04) 0%, transparent 50%), linear-gradient(150deg, #0B0F1A 0%, #0d1220 50%, #0a0d18 100%)" }} />

      <div style={{ position: "relative", zIndex: 1, minHeight: "100vh" }}>
        {/* Header */}
        <header style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "0 24px", height: "64px", display: "flex", alignItems: "center", justifyContent: "space-between", backdropFilter: "blur(16px)", position: "sticky", top: 0, zIndex: 100, background: "rgba(11,15,26,0.85)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <FaHeart size={14} color={C.gold} />
              <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "18px", fontWeight: 600, color: C.text, letterSpacing: "-0.01em" }}>birlikteydik</span>
            </div>
            <div style={{ height: "16px", width: "1px", background: C.border }} />
            <span style={{ fontSize: "11px", letterSpacing: "0.2em", textTransform: "uppercase", color: C.gold, fontWeight: 500 }}>Admin Panel</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: C.success }} />
            <span style={{ fontSize: "12px", color: C.muted }}>{adminEmail}</span>
          </div>
        </header>

        {/* Sayfa içeriği */}
        <main style={{ maxWidth: "1200px", margin: "0 auto", padding: "32px 24px 64px" }}>
          {/* Tab navigation */}
          <div style={{ display: "flex", gap: "8px", marginBottom: "32px", flexWrap: "wrap" }}>
            {[
              { key: "codes", icon: "📋", label: "Kod Üret" },
              { key: "users", icon: "👥", label: "Kullanıcılar" },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as "codes" | "users")}
                style={{
                  padding: "10px 20px", borderRadius: "12px",
                  background: activeTab === tab.key ? C.gold : "rgba(255,255,255,0.05)",
                  color: activeTab === tab.key ? "#0B0F1A" : C.muted,
                  fontFamily: "'Inter', sans-serif", fontSize: "13px", fontWeight: activeTab === tab.key ? 600 : 400,
                  letterSpacing: "0.04em", cursor: "pointer", transition: "all 0.2s",
                  display: "flex", alignItems: "center", gap: "8px",
                  border: activeTab === tab.key ? "none" : "1px solid rgba(255,255,255,0.08)",
                }}
              >
                <span>{tab.icon}</span> {tab.label}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {/* ═══════════════════════════════════════════════════════ */}
            {/* TAB 1 — KOD ÜRET                                       */}
            {/* ═══════════════════════════════════════════════════════ */}
            {activeTab === "codes" && (
              <motion.div
                key="codes"
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.35 }}
                style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "24px" }}
              >
                {/* Sol: Form */}
                <div style={{ ...cardStyle, padding: "28px" }}>
                  <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "22px", fontWeight: 600, color: C.text, marginBottom: "24px" }}>
                    Aktivasyon Kodu <em style={{ color: C.gold, fontStyle: "italic" }}>Üret</em>
                  </h2>

                  {/* Paket seçici */}
                  <p style={{ fontSize: "11px", letterSpacing: "0.12em", textTransform: "uppercase", color: C.muted, marginBottom: "12px", fontWeight: 500 }}>Paket Seç</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "24px" }}>
                    {PACKAGES.map((pkg) => (
                      <button
                        key={pkg.name}
                        onClick={() => setSelectedPackage(pkg.name)}
                        style={{
                          padding: "14px 16px", borderRadius: "12px", border: "none",
                          background: selectedPackage === pkg.name ? "rgba(201,168,76,0.1)" : "rgba(255,255,255,0.03)",
                          borderWidth: "1px", borderStyle: "solid",
                          borderColor: selectedPackage === pkg.name ? C.gold + "55" : C.border,
                          color: C.text, fontFamily: "'Inter', sans-serif", cursor: "pointer",
                          display: "flex", alignItems: "center", justifyContent: "space-between",
                          transition: "all 0.2s", textAlign: "left",
                        }}
                      >
                        <div>
                          <div style={{ fontSize: "14px", fontWeight: selectedPackage === pkg.name ? 500 : 400, color: selectedPackage === pkg.name ? C.gold : C.text }}>{pkg.name}</div>
                          <div style={{ fontSize: "12px", color: C.muted, marginTop: "2px", fontWeight: 300 }}>{pkg.desc}</div>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <span style={{ fontSize: "10px", padding: "2px 8px", borderRadius: "20px", background: selectedPackage === pkg.name ? C.gold + "22" : "rgba(255,255,255,0.05)", color: selectedPackage === pkg.name ? C.gold : C.muted, fontWeight: 500, letterSpacing: "0.06em" }}>{pkg.badge}</span>
                          {selectedPackage === pkg.name && (
                            <div style={{ width: "18px", height: "18px", borderRadius: "50%", background: C.gold, display: "flex", alignItems: "center", justifyContent: "center" }}>
                              <HiOutlineCheck size={11} color="#0B0F1A" />
                            </div>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>

                  {/* Sayfa slug input */}
                  <p style={{ fontSize: "11px", letterSpacing: "0.12em", textTransform: "uppercase", color: C.muted, marginBottom: "10px", fontWeight: 500 }}>Sayfa Adresi</p>
                  <div style={{ position: "relative", marginBottom: "20px" }}>
                    <div style={{
                      display: "flex", alignItems: "center",
                      borderRadius: "12px", border: `1px solid ${slugError ? C.error + "88" : C.border}`,
                      background: C.card, overflow: "hidden",
                    }}>
                      <span style={{ padding: "14px 0 14px 16px", fontSize: "13px", color: "rgba(240,237,232,0.3)", whiteSpace: "nowrap", flexShrink: 0 }}>birlikteydik.com/</span>
                      <input
                        value={pageSlug}
                        onChange={(e) => { setPageSlug(e.target.value.toLowerCase()); setSlugError(""); }}
                        placeholder="demirkanmelis"
                        onKeyDown={(e) => { if (e.key === "Enter") handleGenerate(); }}
                        style={{ flex: 1, padding: "14px 16px 14px 0", background: "transparent", border: "none", color: C.text, fontFamily: "'Inter', sans-serif", fontSize: "14px", outline: "none" }}
                      />
                    </div>
                    {slugError && <p style={{ fontSize: "12px", color: C.error, marginTop: "6px", fontWeight: 300 }}>{slugError}</p>}
                  </div>

                  <button
                    onClick={handleGenerate} disabled={generating}
                    style={{
                      width: "100%", padding: "14px", borderRadius: "30px", border: "none",
                      background: generating ? "rgba(201,168,76,0.5)" : C.gold, color: "#0B0F1A",
                      fontFamily: "'Inter', sans-serif", fontSize: "13px", letterSpacing: "0.12em",
                      textTransform: "uppercase", fontWeight: 600, cursor: generating ? "not-allowed" : "pointer",
                      transition: "opacity 0.2s", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                    }}
                    onMouseEnter={(e) => { if (!generating) e.currentTarget.style.opacity = "0.85"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
                  >
                    {generating ? (
                      <><span style={{ width: "16px", height: "16px", border: "2px solid #0B0F1A44", borderTopColor: "#0B0F1A", borderRadius: "50%", animation: "spin 0.7s linear infinite", display: "inline-block" }} />Üretiliyor…</>
                    ) : "Kod Üret"}
                  </button>
                </div>

                {/* Sağ: Sonuç + Son Kodlar */}
                <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                  {/* Üretilen kod */}
                  <AnimatePresence>
                    {generatedCode && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.96 }} transition={{ duration: 0.35 }}
                        style={{ ...cardStyle, padding: "28px" }}
                      >
                        <p style={{ fontSize: "11px", letterSpacing: "0.14em", textTransform: "uppercase", color: C.gold, marginBottom: "16px", fontWeight: 500 }}>Üretilen Kod</p>
                        <div style={{
                          background: "rgba(201,168,76,0.06)", border: "1px solid rgba(201,168,76,0.2)",
                          borderRadius: "12px", padding: "20px 24px", marginBottom: "16px", textAlign: "center",
                        }}>
                          <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(28px, 5vw, 38px)", fontWeight: 600, color: C.gold, letterSpacing: "0.25em" }}>
                            {generatedCode.code}
                          </p>
                        </div>
                        <div style={{ display: "flex", gap: "8px", marginBottom: "16px", fontSize: "12px", color: C.muted, flexWrap: "wrap" }}>
                          <span style={{ padding: "3px 10px", borderRadius: "20px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>{generatedCode.packageName}</span>
                          <span style={{ padding: "3px 10px", borderRadius: "20px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>/{generatedCode.pageSlug}</span>
                        </div>
                        <button
                          onClick={handleCopy}
                          style={{
                            width: "100%", padding: "12px", borderRadius: "12px", border: `1px solid ${copied ? C.success + "55" : C.border}`,
                            background: copied ? "rgba(134,239,172,0.08)" : "rgba(255,255,255,0.04)", color: copied ? C.success : C.text,
                            fontFamily: "'Inter', sans-serif", fontSize: "13px", fontWeight: 500,
                            cursor: "pointer", transition: "all 0.25s",
                            display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                          }}
                        >
                          {copied ? <><HiOutlineCheck size={16} />Kopyalandı!</> : <><HiOutlineClipboardCopy size={16} />Kodu Kopyala</>}
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Son Kodlar */}
                  {recentCodes.length > 0 && (
                    <div style={{ ...cardStyle, padding: "24px" }}>
                      <p style={{ fontSize: "11px", letterSpacing: "0.14em", textTransform: "uppercase", color: C.muted, marginBottom: "14px", fontWeight: 500 }}>Son Üretilen Kodlar</p>
                      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        {recentCodes.map((rc, i) => (
                          <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", borderRadius: "10px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
                            <div>
                              <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "16px", fontWeight: 600, color: C.gold, letterSpacing: "0.15em" }}>{rc.code}</span>
                              <p style={{ fontSize: "11px", color: C.muted, marginTop: "2px" }}>/{rc.pageSlug} · {rc.packageName}</p>
                            </div>
                            <span style={{ fontSize: "11px", color: "rgba(240,237,232,0.2)" }}>{timeAgo(rc.generatedAt)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* ═══════════════════════════════════════════════════════ */}
            {/* TAB 2 — KULLANICI YÖNETİMİ                             */}
            {/* ═══════════════════════════════════════════════════════ */}
            {activeTab === "users" && (
              <motion.div
                key="users"
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.35 }}
              >
                {/* Üst araç çubuğu */}
                <div style={{ display: "flex", gap: "12px", marginBottom: "20px", flexWrap: "wrap", alignItems: "center" }}>
                  {/* Arama */}
                  <div style={{ flex: 1, minWidth: "200px", position: "relative" }}>
                    <span style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "rgba(240,237,232,0.3)", display: "flex" }}>
                      <HiOutlineSearch size={16} />
                    </span>
                    <input
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="İsim veya e-posta ara…"
                      style={{
                        width: "100%", padding: "11px 14px 11px 40px", borderRadius: "12px",
                        background: C.card, border: `1px solid ${C.border}`,
                        color: C.text, fontFamily: "'Inter', sans-serif", fontSize: "13px", outline: "none",
                      }}
                    />
                  </div>
                  {/* Yenile butonu */}
                  <button
                    onClick={fetchUsers} disabled={usersLoading}
                    style={{
                      padding: "11px 18px", borderRadius: "12px", border: `1px solid ${C.border}`,
                      background: C.card, color: C.muted, cursor: "pointer",
                      display: "flex", alignItems: "center", gap: "6px", fontSize: "13px",
                      opacity: usersLoading ? 0.5 : 1,
                    }}
                  >
                    <HiOutlineRefresh size={15} style={{ animation: usersLoading ? "spin 0.7s linear infinite" : undefined }} />
                    Yenile
                  </button>
                  {/* Sayı */}
                  <div style={{ padding: "11px 16px", borderRadius: "12px", background: "rgba(201,168,76,0.08)", border: "1px solid rgba(201,168,76,0.2)", fontSize: "13px", color: C.gold, fontWeight: 500 }}>
                    {filteredUsers.length} kullanıcı
                  </div>
                </div>

                {/* Hata */}
                {usersError && (
                  <div style={{ padding: "14px 18px", borderRadius: "12px", background: C.error + "12", border: `1px solid ${C.error}44`, fontSize: "13px", color: C.error, marginBottom: "16px" }}>
                    {usersError}
                  </div>
                )}

                {/* Yükleniyor */}
                {usersLoading && (
                  <div style={{ textAlign: "center", padding: "48px", color: C.muted, fontSize: "13px" }}>
                    <div style={{ width: "24px", height: "24px", border: `2px solid ${C.border}`, borderTopColor: C.gold, borderRadius: "50%", animation: "spin 0.7s linear infinite", margin: "0 auto 12px" }} />
                    Kullanıcılar yükleniyor…
                  </div>
                )}

                {/* Kullanıcı listesi */}
                {!usersLoading && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    {filteredUsers.length === 0 && !usersError && (
                      <div style={{ textAlign: "center", padding: "48px", color: C.muted, fontSize: "13px" }}>
                        Kullanıcı bulunamadı.
                      </div>
                    )}
                    {filteredUsers.map((user) => {
                      const isExpanded = expandedUserId === user.id;
                      return (
                        <div key={user.id} style={{ ...cardStyle, overflow: "hidden", transition: "box-shadow 0.2s" }}>
                          {/* Kullanıcı satırı */}
                          <div
                            onClick={() => setExpandedUserId(isExpanded ? null : user.id)}
                            style={{
                              padding: "18px 22px", display: "flex", alignItems: "center",
                              gap: "16px", cursor: "pointer", transition: "background 0.2s",
                            }}
                            onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = C.cardHover; }}
                            onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = "transparent"; }}
                          >
                            {/* Avatar */}
                            <div style={{
                              width: "40px", height: "40px", borderRadius: "50%", flexShrink: 0,
                              background: `rgba(201,168,76,0.1)`, border: "1px solid rgba(201,168,76,0.25)",
                              display: "flex", alignItems: "center", justifyContent: "center",
                              fontFamily: "'Cormorant Garamond', serif", fontSize: "18px", color: C.gold, fontWeight: 600,
                            }}>
                              {user.name.charAt(0).toUpperCase()}
                            </div>

                            {/* Bilgiler */}
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                                <span style={{ fontSize: "14px", fontWeight: 500, color: C.text, whiteSpace: "nowrap" }}>{user.name}</span>
                                {/* Rol badge */}
                                <span style={{
                                  fontSize: "10px", padding: "2px 8px", borderRadius: "20px", fontWeight: 600, letterSpacing: "0.08em",
                                  background: user.role === "admin" ? "rgba(201,168,76,0.15)" : "rgba(184,169,212,0.1)",
                                  color: user.role === "admin" ? C.gold : C.purple,
                                  border: `1px solid ${user.role === "admin" ? C.gold + "33" : C.purple + "33"}`,
                                }}>
                                  {user.role === "admin" ? "ADMİN" : "KULLANICI"}
                                </span>
                              </div>
                              <p style={{ fontSize: "12px", color: C.muted, marginTop: "2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.email}</p>
                            </div>

                            {/* Sağ bilgiler */}
                            <div style={{ display: "flex", alignItems: "center", gap: "16px", flexShrink: 0 }}>
                              <div style={{ textAlign: "right" }}>
                                <p style={{ fontSize: "12px", color: C.muted }}>Kayıt: {formatDate(user.createdAt)}</p>
                                <p style={{ fontSize: "12px", color: "rgba(240,237,232,0.25)", marginTop: "2px" }}>
                                  {user.pages?.length ?? 0} sayfa
                                </p>
                              </div>
                              <div style={{ color: C.muted, transition: "transform 0.2s", transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)" }}>
                                <HiOutlineChevronDown size={18} />
                              </div>
                            </div>
                          </div>

                          {/* Genişletilmiş detay */}
                          <AnimatePresence>
                            {isExpanded && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }}
                                style={{ overflow: "hidden" }}
                              >
                                <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", padding: "20px 22px" }}>
                                  {/* Hesap sıfırlama butonu */}
                                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px", flexWrap: "wrap", gap: "10px" }}>
                                    <p style={{ fontSize: "12px", color: C.muted, fontWeight: 300 }}>
                                      Hesap işlemleri
                                    </p>
                                    <ActionButton
                                      label="Şifre Sıfırlama Maili Gönder"
                                      icon={<HiOutlineMail size={14} />}
                                      loading={actionLoading === `${user.id}-account-`}
                                      success={actionSuccess === `${user.id}-account-`}
                                      onClick={() => handleSendResetEmail(user.id, "account")}
                                    />
                                  </div>

                                  {/* Sayfalar */}
                                  {user.pages && user.pages.length > 0 ? (
                                    <div>
                                      <p style={{ fontSize: "11px", letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(240,237,232,0.25)", marginBottom: "10px", fontWeight: 500 }}>Sayfalar</p>
                                      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                                        {user.pages.map((page) => (
                                          <div key={page.slug} style={{ padding: "14px 16px", borderRadius: "12px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", flexWrap: "wrap" }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: "12px", flex: 1, minWidth: 0 }}>
                                              <a href={`/${page.slug}`} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: "6px", color: C.gold, fontSize: "13px", fontWeight: 500, textDecoration: "none" }}>
                                                /{page.slug} <HiOutlineExternalLink size={12} />
                                              </a>
                                              <span style={{ fontSize: "11px", padding: "2px 8px", borderRadius: "20px", background: "rgba(255,255,255,0.05)", color: C.muted }}>{page.packageName}</span>
                                              <span style={{ fontSize: "11px", color: "rgba(240,237,232,0.25)" }}>{timeAgo(page.createdAt)}</span>
                                            </div>
                                            <div style={{ display: "flex", gap: "8px", flexShrink: 0, flexWrap: "wrap" }}>
                                              <ActionButton
                                                label="Sayfa Şifresini Sıfırla"
                                                icon={<HiOutlineRefresh size={13} />}
                                                loading={actionLoading === `reset-page-${page.slug}`}
                                                success={actionSuccess === `reset-page-${page.slug}`}
                                                onClick={() => handleResetPagePassword(page.slug)}
                                                small
                                              />
                                              <ActionButton
                                                label="Sayfa Şifre Maili"
                                                icon={<HiOutlineMail size={13} />}
                                                loading={actionLoading === `${user.id}-page-${page.slug}`}
                                                success={actionSuccess === `${user.id}-page-${page.slug}`}
                                                onClick={() => handleSendResetEmail(user.id, "page", page.slug)}
                                                small
                                              />
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  ) : (
                                    <p style={{ fontSize: "13px", color: "rgba(240,237,232,0.2)", fontStyle: "italic" }}>Bu kullanıcının henüz sayfası yok.</p>
                                  )}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </>
  );
}

// ─── ActionButton bileşeni ────────────────────────────────────────────────────
function ActionButton({ label, icon, loading, success, onClick, small }: {
  label: string; icon: React.ReactNode; loading: boolean; success: boolean;
  onClick: () => void; small?: boolean;
}) {
  return (
    <button
      onClick={onClick} disabled={loading}
      style={{
        padding: small ? "7px 12px" : "9px 16px",
        borderRadius: "8px", border: `1px solid ${success ? C.success + "44" : C.border}`,
        background: success ? "rgba(134,239,172,0.08)" : "rgba(255,255,255,0.04)",
        color: success ? C.success : C.muted,
        fontFamily: "'Inter', sans-serif", fontSize: small ? "11px" : "12px",
        cursor: loading ? "not-allowed" : "pointer", transition: "all 0.2s",
        display: "flex", alignItems: "center", gap: "5px", fontWeight: 400,
        opacity: loading ? 0.6 : 1, whiteSpace: "nowrap",
      }}
      onMouseEnter={(e) => { if (!loading && !success) { (e.currentTarget as HTMLButtonElement).style.borderColor = C.gold + "44"; (e.currentTarget as HTMLButtonElement).style.color = C.text; } }}
      onMouseLeave={(e) => { if (!success) { (e.currentTarget as HTMLButtonElement).style.borderColor = C.border; (e.currentTarget as HTMLButtonElement).style.color = C.muted; } }}
    >
      {loading ? (
        <span style={{ width: "12px", height: "12px", border: `1.5px solid ${C.border}`, borderTopColor: C.gold, borderRadius: "50%", animation: "spin 0.7s linear infinite", display: "inline-block" }} />
      ) : success ? (
        <HiOutlineCheck size={13} />
      ) : icon}
      {success ? "Gönderildi!" : label}
    </button>
  );
}
