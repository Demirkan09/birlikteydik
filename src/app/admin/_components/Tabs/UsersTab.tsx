import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HiOutlineSearch, HiOutlineRefresh, HiOutlineChevronDown, HiOutlineMail, HiOutlineTrash, HiOutlineExternalLink } from "react-icons/hi";
import { C } from "../../_utils/constants";
import { AdminUser } from "../../types";
import { formatDate, formatActiveDuration } from "../../_utils/dateUtils";
import { ActionButton } from "../ActionButton";

interface UsersTabProps {
  adminEmail: string;
  adminRole: string;
}

export function UsersTab({ adminEmail, adminRole }: UsersTabProps) {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  
  const [activeMailUser, setActiveMailUser] = useState<AdminUser | null>(null);
  const [individualMailSubject, setIndividualMailSubject] = useState("");
  const [individualMailBody, setIndividualMailBody] = useState("");
  const [individualMailSending, setIndividualMailSending] = useState(false);

  const [activeAssignUser, setActiveAssignUser] = useState<AdminUser | null>(null);
  const [assignPageSlug, setAssignPageSlug] = useState("");
  const [assignPackageName, setAssignPackageName] = useState("premium");
  const [assignLoading, setAssignLoading] = useState(false);

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
    fetchUsers();
  }, [fetchUsers]);

  const handleAssignPage = async (targetUserId: string) => {
    if (!assignPageSlug.trim()) { alert("Lütfen bir sayfa adresi (slug) girin."); return; }
    setAssignLoading(true);
    try {
      const res = await fetch("/api/admin/users/assign-page", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          adminEmail,
          userId: targetUserId,
          pageSlug: assignPageSlug.trim().toLowerCase(),
          packageName: assignPackageName
        }),
      });
      const data = await res.json();
      if (!res.ok) { alert(data.error ?? "Sayfa atanamadı."); return; }
      alert("Sayfa başarıyla tanımlandı!");
      setActiveAssignUser(null);
      setAssignPageSlug("");
      fetchUsers();
    } catch {
      alert("Sunucuya bağlanılamadı.");
    } finally {
      setAssignLoading(false);
    }
  };

  const handleSendIndividualMail = async (targetUserId: string, targetUserEmail: string) => {
    if (!individualMailSubject.trim()) { alert("Konu boş bırakılamaz."); return; }
    if (!individualMailBody.trim()) { alert("İçerik boş bırakılamaz."); return; }
    
    setIndividualMailSending(true);
    try {
      const res = await fetch("/api/admin/send-user-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          adminEmail,
          targetUserId,
          email: targetUserEmail,
          subject: individualMailSubject,
          body: individualMailBody
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error ?? "E-posta gönderilemedi.");
        return;
      }
      alert("E-posta başarıyla gönderildi!");
      setActiveMailUser(null);
      setIndividualMailSubject("");
      setIndividualMailBody("");
    } catch {
      alert("Bağlantı hatası oluştu.");
    } finally {
      setIndividualMailSending(false);
    }
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

  const handleDeleteUser = async (targetUserId: string, targetUserName: string) => {
    if (!confirm(`"${targetUserName}" isimli kullanıcıyı silmek istediğinize emin misiniz? Bu işlem geri alınamaz!`)) {
      return;
    }
    const key = `delete-user-${targetUserId}`;
    setActionLoading(key);
    try {
      const res = await fetch(`/api/admin/users?adminEmail=${encodeURIComponent(adminEmail)}&userId=${encodeURIComponent(targetUserId)}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const d = await res.json();
        alert(d.error ?? "Kullanıcı silinemedi.");
        return;
      }
      setActionSuccess(key);
      setTimeout(() => setActionSuccess(null), 3000);
      await fetchUsers();
    } catch {
      alert("Sunucuya bağlanılamadı.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDetachPage = async (targetUserId: string, pageSlugTarget: string) => {
    if (!confirm(`/${pageSlugTarget} sayfasını bu kullanıcının hesabından kaldırmak istediğinize emin misiniz?`)) {
      return;
    }
    const key = `detach-page-${pageSlugTarget}`;
    setActionLoading(key);
    try {
      const res = await fetch(`/api/admin/users?adminEmail=${encodeURIComponent(adminEmail)}&userId=${encodeURIComponent(targetUserId)}&pageSlug=${encodeURIComponent(pageSlugTarget)}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const d = await res.json();
        alert(d.error ?? "Sayfa hesaptan kaldırılamadı.");
        return;
      }
      setActionSuccess(key);
      setTimeout(() => setActionSuccess(null), 3000);
      await fetchUsers();
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

  const cardStyle: React.CSSProperties = {
    background: "rgba(255,255,255,0.035)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "20px",
    backdropFilter: "blur(16px)",
    WebkitBackdropFilter: "blur(16px)",
  };

  return (
    <motion.div
      key="users"
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.35 }}
      style={{ fontFamily: "Inter, 'Inter Fallback', sans-serif" }}
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
              color: C.text, fontFamily: "Inter, 'Inter Fallback', sans-serif", fontSize: "13px", outline: "none",
            }}
          />
        </div>
        {/* Yenile butonu */}
        <button
          onClick={fetchUsers} disabled={usersLoading}
          style={{
            padding: "11px 18px", borderRadius: "12px", border: `1px solid ${C.border}`,
            background: C.card, color: C.muted, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", fontSize: "13px",
            opacity: usersLoading ? 0.5 : 1,
            fontFamily: "Inter, 'Inter Fallback', sans-serif",
            outline: "none",
          }}
        >
          <HiOutlineRefresh size={15} style={{ flexShrink: 0, animation: usersLoading ? "spin 0.7s linear infinite" : undefined }} />
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
                    fontFamily: "Inter, 'Inter Fallback', sans-serif", fontSize: "18px", color: C.gold, fontWeight: 600,
                  }}>
                    {user.name.charAt(0).toUpperCase()}
                  </div>

                  {/* Bilgiler */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                      <span style={{ fontFamily: "Inter, 'Inter Fallback', sans-serif", fontSize: "14px", fontWeight: 500, color: C.text, whiteSpace: "nowrap" }}>{user.name}</span>
                      {/* Rol badge / dropdown */}
                      {adminRole === "admin" ? (
                        <select
                          value={user.role}
                          onClick={(e) => e.stopPropagation()}
                          onChange={async (e) => {
                            const newRole = e.target.value;
                            if (!confirm(`${user.name} kullanıcısının rolünü ${newRole} yapmak istediğinize emin misiniz?`)) return;
                            try {
                              const res = await fetch(`/api/admin/users/role`, {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ adminEmail, userId: user.id, newRole })
                              });
                              if (!res.ok) throw new Error();
                              fetchUsers();
                            } catch {
                              alert("Rol değiştirilemedi.");
                            }
                          }}
                          style={{
                            fontSize: "10px", padding: "2px 8px", borderRadius: "20px", fontWeight: 600, letterSpacing: "0.08em",
                            background: user.role === "admin" ? "rgba(201,168,76,0.15)" : user.role === "staff" ? "rgba(134,239,172,0.15)" : "rgba(184,169,212,0.1)",
                            color: user.role === "admin" ? C.gold : user.role === "staff" ? C.success : C.purple,
                            border: `1px solid ${user.role === "admin" ? C.gold + "33" : user.role === "staff" ? C.success + "33" : C.purple + "33"}`,
                            outline: "none", cursor: "pointer", textTransform: "uppercase"
                          }}
                        >
                          <option value="user" style={{ color: "black" }}>KULLANICI</option>
                          <option value="staff" style={{ color: "black" }}>STAFF</option>
                          <option value="admin" style={{ color: "black" }}>ADMİN</option>
                        </select>
                      ) : (
                        <span style={{
                          fontSize: "10px", padding: "2px 8px", borderRadius: "20px", fontWeight: 600, letterSpacing: "0.08em",
                          background: user.role === "admin" ? "rgba(201,168,76,0.15)" : user.role === "staff" ? "rgba(134,239,172,0.15)" : "rgba(184,169,212,0.1)",
                          color: user.role === "admin" ? C.gold : user.role === "staff" ? C.success : C.purple,
                          border: `1px solid ${user.role === "admin" ? C.gold + "33" : user.role === "staff" ? C.success + "33" : C.purple + "33"}`,
                        }}>
                          {user.role.toUpperCase()}
                        </span>
                      )}
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
                          <div style={{ display: "flex", gap: "8px" }}>
                            {adminRole === "admin" && (
                              <ActionButton
                                label="Mail Gönder"
                                icon={<HiOutlineMail size={14} />}
                                loading={false}
                                success={false}
                                onClick={() => {
                                  setActiveMailUser(activeMailUser?.id === user.id ? null : user);
                                }}
                              />
                            )}
                            <ActionButton
                              label="Şifre Sıfırlama Maili Gönder"
                              icon={<HiOutlineMail size={14} />}
                              loading={actionLoading === `${user.id}-account-`}
                              success={actionSuccess === `${user.id}-account-`}
                              onClick={() => handleSendResetEmail(user.id, "account")}
                            />
                            {adminRole === "admin" && (
                              <ActionButton
                                label="Kullanıcıyı Sil"
                                icon={<HiOutlineTrash size={14} />}
                                loading={actionLoading === `delete-user-${user.id}`}
                                success={actionSuccess === `delete-user-${user.id}`}
                                onClick={() => handleDeleteUser(user.id, user.name)}
                                danger
                              />
                            )}
                          </div>
                        </div>

                        {/* Bireysel Mail Gönderme Alanı */}
                        {activeMailUser?.id === user.id && (
                          <div style={{
                            marginTop: "20px", marginBottom: "20px", padding: "18px", borderRadius: "12px",
                            background: "rgba(255,255,255,0.02)", border: `1px solid ${C.border}`,
                            display: "flex", flexDirection: "column", gap: "14px"
                          }}>
                            <h4 style={{ fontSize: "13px", fontWeight: 600, color: C.gold, display: "flex", alignItems: "center", gap: "6px" }}>
                              <HiOutlineMail size={16} /> {user.name} kullanıcısına e-posta gönder
                            </h4>
                            
                            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                              <label style={{ fontSize: "11px", color: C.muted, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.08em" }}>Konu (Subject)</label>
                              <input
                                value={individualMailSubject}
                                onChange={(e) => setIndividualMailSubject(e.target.value)}
                                placeholder="E-posta konusunu girin..."
                                style={{
                                  padding: "10px 12px", borderRadius: "8px", background: "rgba(255,255,255,0.03)",
                                  border: `1px solid ${C.border}`, color: C.text, outline: "none", fontSize: "13px"
                                }}
                              />
                            </div>

                            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                              <label style={{ fontSize: "11px", color: C.muted, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.08em" }}>İçerik (HTML formatında yazabilirsiniz, satır başları br'ye dönüşür)</label>
                              <textarea
                                value={individualMailBody}
                                onChange={(e) => setIndividualMailBody(e.target.value)}
                                placeholder="Merhaba {name},&#10;&#10;Mesajınızı buraya yazın..."
                                rows={5}
                                style={{
                                  padding: "10px 12px", borderRadius: "8px", background: "rgba(255,255,255,0.03)",
                                  border: `1px solid ${C.border}`, color: C.text, outline: "none", fontSize: "13px", resize: "vertical", fontFamily: "inherit"
                                }}
                              />
                            </div>

                            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                              <button
                                type="button"
                                onClick={() => setActiveMailUser(null)}
                                style={{
                                  padding: "8px 16px", borderRadius: "8px", border: `1px solid ${C.border}`,
                                  background: "transparent", color: C.muted, fontSize: "12px", cursor: "pointer"
                                }}
                              >
                                İptal
                              </button>
                              <button
                                type="button"
                                disabled={individualMailSending}
                                onClick={() => handleSendIndividualMail(user.id, user.email)}
                                style={{
                                  padding: "8px 20px", borderRadius: "8px", border: "none",
                                  background: C.gold, color: "#0B0F1A", fontSize: "12px", fontWeight: 600,
                                  cursor: individualMailSending ? "not-allowed" : "pointer", opacity: individualMailSending ? 0.6 : 1
                                }}
                              >
                                {individualMailSending ? "Gönderiliyor..." : "E-postayı Gönder"}
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Sayfalar */}
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                          <p style={{ fontSize: "11px", letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(240,237,232,0.25)", fontWeight: 500 }}>Sayfalar</p>
                          <button
                            type="button"
                            onClick={() => setActiveAssignUser(activeAssignUser?.id === user.id ? null : user)}
                            style={{
                              padding: "4px 10px", borderRadius: "6px", border: `1px solid ${C.border}`,
                              background: "transparent", color: C.text, fontSize: "11px", cursor: "pointer"
                            }}
                          >
                            Sayfa Tanımla
                          </button>
                        </div>

                        {/* Sayfa Tanımla Formu */}
                        {activeAssignUser?.id === user.id && (
                          <div style={{
                            marginBottom: "16px", padding: "16px", borderRadius: "12px",
                            background: "rgba(255,255,255,0.02)", border: `1px solid ${C.border}`,
                            display: "flex", flexDirection: "column", gap: "12px"
                          }}>
                            <h4 style={{ fontSize: "12px", fontWeight: 600, color: C.gold }}>Sayfa Tanımla</h4>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                                <label style={{ fontSize: "10px", color: C.muted, textTransform: "uppercase" }}>Sayfa Adresi (Slug)</label>
                                <input
                                  value={assignPageSlug}
                                  onChange={(e) => setAssignPageSlug(e.target.value)}
                                  placeholder="örn: ahmet-ayse"
                                  style={{
                                    padding: "8px 10px", borderRadius: "8px", background: "rgba(255,255,255,0.03)",
                                    border: `1px solid ${C.border}`, color: C.text, outline: "none", fontSize: "12px"
                                  }}
                                />
                              </div>
                              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                                <label style={{ fontSize: "10px", color: C.muted, textTransform: "uppercase" }}>Paket</label>
                                <select
                                  value={assignPackageName}
                                  onChange={(e) => setAssignPackageName(e.target.value)}
                                  style={{
                                    padding: "8px 10px", borderRadius: "8px", background: "rgba(255,255,255,0.03)",
                                    border: `1px solid ${C.border}`, color: "white", outline: "none", fontSize: "12px"
                                  }}
                                >
                                  <option value="premium" style={{ color: "black" }}>Premium Paket</option>
                                  <option value="standart" style={{ color: "black" }}>Standart Paket</option>
                                </select>
                              </div>
                            </div>
                            <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
                              <button
                                type="button"
                                onClick={() => setActiveAssignUser(null)}
                                style={{ padding: "6px 12px", borderRadius: "6px", border: `1px solid ${C.border}`, background: "transparent", color: C.muted, fontSize: "11px", cursor: "pointer" }}
                              >
                                İptal
                              </button>
                              <button
                                type="button"
                                disabled={assignLoading}
                                onClick={() => handleAssignPage(user.id)}
                                style={{ padding: "6px 12px", borderRadius: "6px", border: "none", background: C.gold, color: "#0B0F1A", fontSize: "11px", fontWeight: 600, cursor: assignLoading ? "not-allowed" : "pointer", opacity: assignLoading ? 0.6 : 1 }}
                              >
                                {assignLoading ? "Tanımlanıyor..." : "Tanımla"}
                              </button>
                            </div>
                          </div>
                        )}

                        {user.pages && user.pages.length > 0 ? (
                          <div>
                            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                              {user.pages.map((page) => (
                                <div key={page.pageSlug} style={{ padding: "14px 16px", borderRadius: "12px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", flexWrap: "wrap" }}>
                                  <div style={{ display: "flex", alignItems: "center", gap: "12px", flex: 1, minWidth: 0, flexWrap: "wrap" }}>
                                    <a href={`/${page.pageSlug}`} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: "6px", color: C.gold, fontSize: "13px", fontWeight: 500, textDecoration: "none" }}>
                                      /{page.pageSlug} <HiOutlineExternalLink size={12} />
                                    </a>
                                    <span style={{ fontSize: "11px", padding: "2px 8px", borderRadius: "20px", background: "rgba(255,255,255,0.05)", color: C.muted }}>{page.packageName}</span>
                                    {page.createdAt && (
                                      <span style={{ fontSize: "11px", color: page.remainingTime === "Süresi Doldu" ? "#E8A0A0" : C.success + "b3" }}>{page.remainingTime || `Aktif: ${formatActiveDuration(page.createdAt)}`}</span>
                                    )}
                                  </div>
                                  <div style={{ display: "flex", gap: "8px", flexShrink: 0, flexWrap: "wrap" }}>
                                    {adminRole === "admin" && (
                                      <>
                                        <ActionButton
                                          label="Kaldır"
                                          icon={<HiOutlineTrash size={13} />}
                                          loading={actionLoading === `detach-page-${page.pageSlug}`}
                                          success={actionSuccess === `detach-page-${page.pageSlug}`}
                                          onClick={async () => handleDetachPage(user.id, page.pageSlug)}
                                          small
                                          danger
                                        />
                                        <ActionButton
                                          label="Sayfa Şifresini Sıfırla"
                                          icon={<HiOutlineRefresh size={13} />}
                                          loading={actionLoading === `reset-page-${page.pageSlug}`}
                                          success={actionSuccess === `reset-page-${page.pageSlug}`}
                                          onClick={() => handleResetPagePassword(page.pageSlug)}
                                          small
                                        />
                                      </>
                                    )}
                                    <ActionButton
                                      label="Sayfa Şifre Maili"
                                      icon={<HiOutlineMail size={13} />}
                                      loading={actionLoading === `${user.id}-page-${page.pageSlug}`}
                                      success={actionSuccess === `${user.id}-page-${page.pageSlug}`}
                                      onClick={() => handleSendResetEmail(user.id, "page", page.pageSlug)}
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
  );
}
