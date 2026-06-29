import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HiOutlineExternalLink, HiOutlineCheck, HiOutlineTrash, HiOutlineUpload, HiOutlineLink, HiOutlineRefresh, HiOutlineMail, HiOutlineClipboardCopy, HiOutlineChevronDown, HiOutlineSearch } from "react-icons/hi";
import { C } from "../../_utils/constants";
import { formatActiveDuration } from "../../_utils/dateUtils";
import { TEMPLATE_SCHEMAS } from "../../../../lib/templateSchemas";

interface PagesTabProps {
  adminEmail: string;
  setPrefilledSlug?: (slug: string) => void;
  setActiveTab?: (tab: "create_page" | "codes" | "users" | "marketing" | "settings") => void;
}

export function PagesTab({ adminEmail, setPrefilledSlug, setActiveTab }: PagesTabProps) {
  // Tab 0 — Sayfa Oluştur & Düzenle
  const [allPages, setAllPages] = useState<{ pageSlug: string; templateId: string; isPublished: boolean; activatedAt?: string; remainingTime?: string }[]>([]);
  const [pagesTab, setPagesTab] = useState<"published" | "drafts">("published");
  const [pagesLoading, setPagesLoading] = useState(false);
  const [selectedEditSlug, setSelectedEditSlug] = useState("");
  
  // Editor state
  const [editTemplateId, setEditTemplateId] = useState("klasik-retro");
  const [editConfig, setEditConfig] = useState<any>(null);
  const [editMemories, setEditMemories] = useState<any[]>([]);
  const [editIsPublished, setEditIsPublished] = useState(false);
  const [editorLoading, setEditorLoading] = useState(false);
  const [editorSaving, setEditorSaving] = useState(false);
  const [editorError, setEditorError] = useState("");
  const [editorSuccess, setEditorSuccess] = useState("");

  // Create Page sub-states
  const [newSlug, setNewSlug] = useState("");
  const [newTemplateId, setNewTemplateId] = useState("klasik-retro");
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState("");

  // Custom (özel) şablonlar
  const [customTemplates, setCustomTemplates] = useState<{ id: string; name: string; preview_color: string }[]>([]);
  const fetchCustomTemplates = useCallback(async () => {
    if (!adminEmail) return;
    try {
      const res = await fetch(`/api/admin/custom-templates?adminEmail=${encodeURIComponent(adminEmail)}`);
      const data = await res.json();
      if (res.ok && data.templates) setCustomTemplates(data.templates);
    } catch { /* ignore */ }
  }, [adminEmail]);

  // Sayfaları Yükle
  const fetchAllPages = useCallback(async () => {
    if (!adminEmail) return;
    setPagesLoading(true);
    try {
      const res = await fetch(`/api/admin/page-settings?adminEmail=${encodeURIComponent(adminEmail)}`);
      const data = await res.json();
      if (res.ok && data.pages) {
        setAllPages(data.pages);
      }
    } catch (err) {
      console.error("Pages load error:", err);
    } finally {
      setPagesLoading(false);
    }
  }, [adminEmail]);

  useEffect(() => {
    fetchAllPages();
    fetchCustomTemplates();
  }, [fetchAllPages, fetchCustomTemplates]);
  // Sayfa Ayarlarını Yükle
  const loadPageSettings = async (slug: string) => {
    if (!adminEmail || !slug) return;
    setEditorLoading(true);
    setEditorError("");
    setEditorSuccess("");
    try {
      const res = await fetch(`/api/admin/page-settings?adminEmail=${encodeURIComponent(adminEmail)}&pageSlug=${encodeURIComponent(slug)}`);
      const data = await res.json();
      if (res.ok && data.pageSettings) {
        const ps = data.pageSettings;
        setSelectedEditSlug(ps.pageSlug);
        setEditTemplateId(ps.templateId);
        setEditConfig(ps.config || {});
        setEditMemories(ps.memories || []);
        setEditIsPublished(ps.isPublished);
      } else {
        setEditorError(data.error ?? "Sayfa ayarları yüklenemedi.");
      }
    } catch {
      setEditorError("Sunucuya bağlanılamadı.");
    } finally {
      setEditorLoading(false);
    }
  };

  // Yeni Sayfa Oluştur
  const handleCreatePage = async () => {
    const slug = newSlug.trim().toLowerCase().replace(/\s+/g, "");
    if (!slug) { setCreateError("Sayfa adresi gerekli."); return; }
    if (!/^[a-z0-9-]+$/.test(slug)) { setCreateError("Sadece küçük harf, rakam ve tire kullanabilirsin."); return; }
    setCreateError("");
    setCreateLoading(true);
    try {
      const res = await fetch("/api/admin/page-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          adminEmail,
          action: "create",
          pageSlug: slug,
          templateId: newTemplateId,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setCreateError(data.error ?? "Sayfa oluşturulamadı.");
        return;
      }
      await fetchAllPages();
      await loadPageSettings(slug);
      setNewSlug("");
    } catch {
      setCreateError("Sunucuya bağlanılamadı.");
    } finally {
      setCreateLoading(false);
    }
  };

  // Sayfa Ayarlarını Güncelle (Taslak / Yayına Al)
  const handleSavePageSettings = async (isPub: boolean) => {
    if (!selectedEditSlug || !editConfig || !editMemories) return;
    setEditorSaving(true);
    setEditorError("");
    setEditorSuccess("");
    try {
      const res = await fetch("/api/admin/page-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          adminEmail,
          action: "update",
          pageSlug: selectedEditSlug,
          templateId: editTemplateId,
          config: editConfig,
          memories: editMemories,
          isPublished: isPub,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setEditorError(data.error ?? "Sayfa kaydedilemedi.");
        return;
      }
      setEditIsPublished(isPub);
      setEditorSuccess(isPub ? "Sayfa başarıyla yayına alındı! 🎉" : "Düzenlemeler kaydedildi (Taslak).");
      await fetchAllPages();
    } catch {
      setEditorError("Sunucuya bağlanılamadı.");
    } finally {
      setEditorSaving(false);
    }
  };

  // Sayfayı Sil
  const handleDeletePage = async () => {
    if (!selectedEditSlug) return;
    const confirmText = prompt(
      `SAYFAYI SİLMEK ÜZERESİNİZ!\n` +
      `Bu işlem geri alınamaz. Bu sayfayı, sayfa ayarlarını, sahiplik ilişkilerini ve yüklenen görselleri/müzikleri kalıcı olarak siler.\n\n` +
      `Lütfen onaylamak için tam olarak şu ifadeyi yazın:\n` +
      `SAYFAYI SİL`
    );
    if (confirmText === null) return; // User cancelled prompt
    if (confirmText !== "SAYFAYI SİL") {
      alert("Hatalı onay ifadesi girildi. Silme işlemi iptal edildi.");
      return;
    }

    setEditorSaving(true);
    setEditorError("");
    setEditorSuccess("");
    try {
      const res = await fetch(`/api/admin/page-settings?adminEmail=${encodeURIComponent(adminEmail)}&pageSlug=${encodeURIComponent(selectedEditSlug)}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) {
        setEditorError(data.error ?? "Sayfa silinemedi.");
        return;
      }
      setEditorSuccess("Sayfa başarıyla silindi. 🗑️");
      setSelectedEditSlug("");
      await fetchAllPages();
    } catch {
      setEditorError("Sunucuya bağlanılamadı.");
    } finally {
      setEditorSaving(false);
    }
  };

  const handleFileUpload = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("adminEmail", adminEmail);
    formData.append("file", file);

    const res = await fetch("/api/admin/upload", {
      method: "POST",
      body: formData,
    });

    const contentType = res.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? "Dosya yüklenemedi.");
      }
      return data.url;
    } else {
      const text = await res.text();
      if (res.status === 413) {
        throw new Error("Yüklenen dosya boyutu çok büyük (Sunucu sınırı aşıldı).");
      }
      throw new Error(`Sunucu Hatası (${res.status}): ${text.substring(0, 80)}`);
    }
  };

  const cardStyle: React.CSSProperties = {
    background: "rgba(255,255,255,0.035)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "20px",
    backdropFilter: "blur(16px)",
    WebkitBackdropFilter: "blur(16px)",
  };

  return (
              <motion.div
                key="create_page"
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.35 }}
                style={{ fontFamily: "Inter, 'Inter Fallback', sans-serif" }}
              >
                {!selectedEditSlug ? (
                  /* ─── ALT-TAB 1: SAYFA OLUŞTUR / LİSTELE ─── */
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: "28px" }}>
                    
                    {/* Sol: Yeni Sayfa Oluştur */}
                    <div style={{ ...cardStyle, padding: "28px" }}>
                      <h2 style={{ fontFamily: "'Cormorant Garamond', 'Cormorant Garamond Fallback', serif", fontSize: "22px", fontWeight: 600, color: C.text, marginBottom: "24px" }}>
                        Yeni Müşteri Sayfası <em style={{ color: C.gold, fontStyle: "italic" }}>Oluştur</em>
                      </h2>

                      {createError && (
                        <div style={{ padding: "12px 16px", borderRadius: "12px", background: C.error + "12", border: `1px solid ${C.error}44`, fontSize: "13px", color: C.error, marginBottom: "20px" }}>
                          {createError}
                        </div>
                      )}

                      {/* Şablon Seç */}
                      <p style={{ fontSize: "11px", letterSpacing: "0.12em", textTransform: "uppercase", color: C.muted, marginBottom: "12px", fontWeight: 500 }}>Şablon Seç</p>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "20px", maxHeight: "280px", overflowY: "auto", paddingRight: "4px" }}>
                        {[
                          { id: "klasik-retro", title: "Koyu Gül Kurusu", color: "#C9897A" },
                          { id: "romantik-kirmizi", title: "Romantik Kırmızı", color: "#E63946" },
                          { id: "modern-minimal", title: "Modern Minimal", color: "#8C7E6C" },
                          { id: "sinematik-ask", title: "Sinematik Aşk", color: "#B8A9D4" },
                          { id: "premium-emerald", title: "Zümrüt Yeşili", color: "#D4AF37" },
                          { id: "sablon-oyun", title: "Oyuncu Şablonu", color: "#CBFF3E" },
                          { id: "sablon-lavanta", title: "Lavanta Rüyası", color: "#D8B4FE" },
                          { id: "sablon-amber", title: "Günbatımı Amberi", color: "#F59E0B" },
                          { id: "sablon-rose", title: "Gül Kurusu", color: "#FCA5A5" },
                          { id: "sablon-indigo", title: "Gece Yarısı İndigo", color: "#818CF8" },
                          { id: "sablon-siyah", title: "Karanlık Gece (Siyah)", color: "#1A1A1A" },
                        ].map((tpl) => (
                          <button
                            key={tpl.id}
                            type="button"
                            onClick={() => setNewTemplateId(tpl.id)}
                            style={{
                              padding: "12px", borderRadius: "12px",
                              border: `1px solid ${newTemplateId === tpl.id ? tpl.color : "rgba(255,255,255,0.06)"}`,
                              background: newTemplateId === tpl.id ? `${tpl.color}15` : "rgba(255,255,255,0.03)",
                              color: newTemplateId === tpl.id ? tpl.color : C.text,
                              cursor: "pointer", transition: "all 0.2s", textAlign: "left",
                              fontFamily: "var(--font-inter), sans-serif", fontSize: "12px", fontWeight: newTemplateId === tpl.id ? 600 : 400,
                              display: "flex", flexDirection: "column", gap: "6px",
                            }}
                          >
                            <span style={{ display: "inline-block", width: "12px", height: "12px", borderRadius: "50%", background: tpl.color }} />
                            {tpl.title}
                          </button>
                        ))}
                      </div>

                      {/* Özel Şablonlar */}
                      {customTemplates.length > 0 && (
                        <>
                          <p style={{ fontSize: "11px", letterSpacing: "0.12em", textTransform: "uppercase", color: C.muted, marginBottom: "8px", marginTop: "16px", fontWeight: 500 }}>
                            🎨 Özel Şablonlarım
                          </p>
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "20px", maxHeight: "200px", overflowY: "auto", paddingRight: "4px" }}>
                            {customTemplates.map((tpl) => {
                              const tplId = `custom-${tpl.id}`;
                              return (
                                <button
                                  key={tpl.id}
                                  type="button"
                                  onClick={() => setNewTemplateId(tplId)}
                                  style={{
                                    padding: "12px", borderRadius: "12px",
                                    border: `1px solid ${newTemplateId === tplId ? tpl.preview_color : "rgba(255,255,255,0.06)"}`,
                                    background: newTemplateId === tplId ? `${tpl.preview_color}15` : "rgba(255,255,255,0.03)",
                                    color: newTemplateId === tplId ? tpl.preview_color : C.text,
                                    cursor: "pointer", transition: "all 0.2s", textAlign: "left",
                                    fontFamily: "var(--font-inter), sans-serif", fontSize: "12px", fontWeight: newTemplateId === tplId ? 600 : 400,
                                    display: "flex", flexDirection: "column", gap: "6px",
                                  }}
                                >
                                  <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                                    <span style={{ width: "12px", height: "12px", borderRadius: "50%", background: tpl.preview_color, display: "inline-block" }} />
                                    <span style={{ fontSize: "9px", opacity: 0.5, letterSpacing: "0.12em" }}>ÖZEL</span>
                                  </span>
                                  {tpl.name}
                                </button>
                              );
                            })}
                          </div>
                        </>
                      )}

                      {/* Sayfa Slug */}
                      <p style={{ fontSize: "11px", letterSpacing: "0.12em", textTransform: "uppercase", color: C.muted, marginBottom: "10px", fontWeight: 500 }}>Sayfa Adresi</p>
                      <div style={{ position: "relative", marginBottom: "24px" }}>
                        <div style={{
                          display: "flex", alignItems: "center",
                          borderRadius: "12px", border: `1px solid ${C.border}`,
                          background: C.card, overflow: "hidden",
                        }}>
                          <span style={{ padding: "14px 0 14px 16px", fontSize: "13px", color: "rgba(240,237,232,0.3)", whiteSpace: "nowrap", flexShrink: 0 }}>birlikteydik.com/</span>
                          <input
                            value={newSlug}
                            onChange={(e) => { setNewSlug(e.target.value.toLowerCase()); setCreateError(""); }}
                            placeholder="musteri-linki"
                            style={{ flex: 1, padding: "14px 16px 14px 0", background: "transparent", border: "none", color: C.text, fontFamily: "var(--font-inter), sans-serif", fontSize: "14px", outline: "none" }}
                          />
                        </div>
                      </div>

                      <button
                        onClick={handleCreatePage} disabled={createLoading}
                        style={{
                          width: "100%", padding: "14px", borderRadius: "30px", border: "none",
                          background: createLoading ? "rgba(201,168,76,0.5)" : C.gold, color: "#0B0F1A",
                          fontFamily: "var(--font-inter), sans-serif", fontSize: "13px", letterSpacing: "0.12em",
                          textTransform: "uppercase", fontWeight: 600, cursor: createLoading ? "not-allowed" : "pointer",
                          transition: "opacity 0.2s", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                        }}
                      >
                        {createLoading ? "Oluşturuluyor..." : "Oluştur ve Düzenle"}
                      </button>
                    </div>

                    {/* Sağ: Mevcut Sayfalar */}
                    <div style={{ ...cardStyle, padding: "28px", fontFamily: "Inter, 'Inter Fallback', sans-serif" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px", flexWrap: "wrap", gap: "10px" }}>
                        <h2 style={{ fontFamily: "'Cormorant Garamond', 'Cormorant Garamond Fallback', serif", fontSize: "22px", fontWeight: 600, color: C.text }}>
                          Mevcut Sayfalar
                        </h2>
                        {/* Tab switcher */}
                        <div style={{ display: "flex", gap: "6px", background: "rgba(255,255,255,0.03)", padding: "4px", borderRadius: "10px", border: `1px solid ${C.border}` }}>
                          <button
                            type="button"
                            onClick={() => setPagesTab("published")}
                            style={{
                              padding: "6px 12px", borderRadius: "8px", border: "none",
                              background: pagesTab === "published" ? C.gold : "transparent",
                              color: pagesTab === "published" ? "#0B0F1A" : C.muted,
                              fontSize: "11px", fontWeight: 600, cursor: "pointer", transition: "all 0.2s"
                            }}
                          >
                            Yayında ({allPages.filter(p => p.isPublished).length})
                          </button>
                          <button
                            type="button"
                            onClick={() => setPagesTab("drafts")}
                            style={{
                              padding: "6px 12px", borderRadius: "8px", border: "none",
                              background: pagesTab === "drafts" ? C.gold : "transparent",
                              color: pagesTab === "drafts" ? "#0B0F1A" : C.muted,
                              fontSize: "11px", fontWeight: 600, cursor: "pointer", transition: "all 0.2s"
                            }}
                          >
                            Taslaklar ({allPages.filter(p => !p.isPublished).length})
                          </button>
                        </div>
                      </div>

                      {pagesLoading ? (
                        <div style={{ color: C.muted, fontSize: "13px", padding: "24px 0", textAlign: "center" }}>Yükleniyor...</div>
                      ) : allPages.filter(p => pagesTab === "published" ? p.isPublished : !p.isPublished).length === 0 ? (
                        <div style={{ color: C.muted, fontSize: "13px", fontStyle: "italic", padding: "24px 0", textAlign: "center" }}>
                          {pagesTab === "published" ? "Yayında olan sayfa yok." : "Taslak sayfa yok."}
                        </div>
                      ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: "10px", maxHeight: "450px", overflowY: "auto", paddingRight: "6px" }}>
                          {allPages.filter(p => pagesTab === "published" ? p.isPublished : !p.isPublished).map((page) => (
                            <div
                              key={page.pageSlug}
                              style={{
                                display: "flex", alignItems: "center", justifyContent: "space-between",
                                padding: "14px 16px", borderRadius: "12px", background: "rgba(255,255,255,0.02)",
                                border: "1px solid rgba(255,255,255,0.05)",
                              }}
                            >
                              <div>
                                <span style={{ fontSize: "14px", fontWeight: 500, color: C.text }}>/{page.pageSlug}</span>
                                <div style={{ display: "flex", gap: "10px", alignItems: "center", marginTop: "2px", flexWrap: "wrap" }}>
                                  <span style={{ fontSize: "11px", color: C.muted }}>Şablon: {page.templateId}</span>
                                  {page.activatedAt && (
                                    <>
                                      <span style={{ color: "rgba(255,255,255,0.15)", fontSize: "11px" }}>•</span>
                                      <span style={{ fontSize: "11px", color: page.remainingTime === "Süresi Doldu" ? "#E8A0A0" : C.success + "cc" }}>{page.remainingTime || `Aktif: ${formatActiveDuration(page.activatedAt)}`}</span>
                                    </>
                                  )}
                                </div>
                              </div>
                              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                <span style={{
                                  fontSize: "10px", padding: "2px 8px", borderRadius: "20px", fontWeight: 600,
                                  background: page.isPublished ? "rgba(134,239,172,0.12)" : "rgba(201,168,76,0.12)",
                                  color: page.isPublished ? C.success : C.gold,
                                  border: `1px solid ${page.isPublished ? C.success + "33" : C.gold + "33"}`,
                                }}>
                                  {page.isPublished ? "YAYINDA" : "TASLAK"}
                                </span>
                                <button
                                  onClick={() => loadPageSettings(page.pageSlug)}
                                  style={{
                                    padding: "6px 12px", borderRadius: "8px", border: `1px solid ${C.border}`,
                                    background: "rgba(255,255,255,0.05)", color: C.text, fontSize: "12px", cursor: "pointer",
                                    transition: "all 0.2s"
                                  }}
                                  onMouseEnter={(e) => e.currentTarget.style.borderColor = C.gold}
                                  onMouseLeave={(e) => e.currentTarget.style.borderColor = C.border}
                                >
                                  Düzenle
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  /* ─── ALT-TAB 2: GÖRSEL SAYFA EDİTÖRÜ ─── */
                  <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                    
                    {/* Üst Bar / Kontroller */}
                    <div style={{ ...cardStyle, padding: "20px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                        <button
                          onClick={() => setSelectedEditSlug("")}
                          style={{
                            padding: "8px 16px", borderRadius: "10px", border: `1px solid ${C.border}`,
                            background: "rgba(255,255,255,0.04)", color: C.muted, fontSize: "13px", cursor: "pointer",
                            transition: "all 0.2s"
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.color = C.text}
                          onMouseLeave={(e) => e.currentTarget.style.color = C.muted}
                        >
                          ← Geri Dön
                        </button>
                        <div>
                          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <h2 style={{ fontSize: "18px", fontWeight: 600, color: C.text }}>/{selectedEditSlug}</h2>
                            <span style={{
                              fontSize: "10px", padding: "2px 8px", borderRadius: "20px", fontWeight: 600,
                              background: editIsPublished ? "rgba(134,239,172,0.12)" : "rgba(201,168,76,0.12)",
                              color: editIsPublished ? C.success : C.gold,
                              border: `1px solid ${editIsPublished ? C.success + "33" : C.gold + "33"}`,
                            }}>
                              {editIsPublished ? "YAYINDA" : "TASLAK"}
                            </span>
                          </div>
                          <p style={{ fontSize: "11px", color: C.muted, marginTop: "2px" }}>Seçili Şablon: {editTemplateId}</p>
                        </div>
                      </div>

                      <div style={{ display: "flex", gap: "10px" }}>
                        <a
                          href={`/${selectedEditSlug}`}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            padding: "8px 16px", borderRadius: "10px", border: `1px solid rgba(201,168,76,0.3)`,
                            background: "rgba(201,168,76,0.06)", color: C.gold, fontSize: "13px", textDecoration: "none",
                            display: "flex", alignItems: "center", gap: "6px"
                          }}
                        >
                          Önizle <HiOutlineExternalLink size={14} />
                        </a>
                        
                        {/* Kod Üret Kısayolu */}
                        <button
                          onClick={() => {
                            if (setPrefilledSlug) setPrefilledSlug(selectedEditSlug);
                            if (setActiveTab) setActiveTab("codes");
                          }}
                          style={{
                            padding: "8px 16px", borderRadius: "10px", border: `1px solid rgba(184,169,212,0.3)`,
                            background: "rgba(184,169,212,0.06)", color: C.purple, fontSize: "13px", cursor: "pointer"
                          }}
                        >
                          Bu Sayfa İçin Kod Üret
                        </button>
                      </div>
                    </div>

                    {editorError && (
                      <div style={{ padding: "14px 18px", borderRadius: "12px", background: C.error + "12", border: `1px solid ${C.error}44`, fontSize: "13px", color: C.error }}>
                        {editorError}
                      </div>
                    )}

                    {editorSuccess && (
                      <div style={{ padding: "14px 18px", borderRadius: "12px", background: "rgba(134,239,172,0.08)", border: `1px solid ${C.success}33`, fontSize: "13px", color: C.success }}>
                        {editorSuccess}
                      </div>
                    )}

                    {editorLoading || !editConfig ? (
                      <div style={{ ...cardStyle, padding: "64px", textAlign: "center", color: C.muted }}>
                        <div style={{ width: "32px", height: "32px", border: `2px solid ${C.border}`, borderTopColor: C.gold, borderRadius: "50%", animation: "spin 0.7s linear infinite", margin: "0 auto 16px" }} />
                        Yükleniyor...
                      </div>
                    ) : (
                      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "28px" }}>
                        
                        {/* 1. Kısım: Genel Sayfa Ayarları */}
                        <div style={{ ...cardStyle, padding: "28px" }}>
                          <h3 style={{ fontSize: "16px", fontWeight: 600, color: C.text, marginBottom: "20px", borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: "10px" }}>
                            Genel Bilgiler & Tasarım
                          </h3>
                          
                          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "20px" }}>
                            
                            {/* Şablon Değiştir */}
                            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                              <label style={{ fontSize: "11px", letterSpacing: "0.12em", textTransform: "uppercase", color: C.muted, fontWeight: 500 }}>Şablon</label>
                              <select
                                value={editTemplateId}
                                onChange={(e) => setEditTemplateId(e.target.value)}
                                style={{
                                  padding: "12px", borderRadius: "10px", background: "rgba(255,255,255,0.03)",
                                  border: `1px solid ${C.border}`, color: C.text, outline: "none", fontSize: "13px"
                                }}
                              >
                                <option value="klasik-retro">Koyu Gül Kurusu</option>
                                <option value="romantik-kirmizi">Romantik Kırmızı</option>
                                <option value="modern-minimal">Modern Minimal</option>
                                <option value="sinematik-ask">Sinematik Aşk</option>
                                <option value="premium-emerald">Zümrüt Yeşili</option>
                                <option value="sablon-oyun">Oyuncu Şablonu</option>
                                <option value="sablon-lavanta">Lavanta Rüyası</option>
                                <option value="sablon-amber">Günbatımı Amberi</option>
                                <option value="sablon-rose">Gül Kurusu</option>
                                <option value="sablon-indigo">Gece Yarısı İndigo</option>
                                <option value="sablon-siyah">Karanlık Gece (Siyah)</option>
                              </select>
                            </div>

                            {/* Çift İsimleri */}
                            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                              <label style={{ fontSize: "11px", letterSpacing: "0.12em", textTransform: "uppercase", color: C.muted, fontWeight: 500 }}>İsimler</label>
                              <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", alignItems: "center", gap: "10px" }}>
                                <input
                                  value={(() => {
                                    const fullName = editConfig.coupleNames || "";
                                    if (fullName.includes("\n&\n")) return fullName.split("\n&\n")[0] || "";
                                    if (fullName.includes("\n")) return fullName.split("\n").filter((p: string) => p.trim() !== "&")[0] || "";
                                    if (fullName.includes("&")) return fullName.split("&")[0]?.trim() || "";
                                    return fullName;
                                  })()}
                                  onChange={(e) => {
                                    const name1 = e.target.value;
                                    const fullName = editConfig.coupleNames || "";
                                    let name2 = "";
                                    if (fullName.includes("\n&\n")) name2 = fullName.split("\n&\n")[1] || "";
                                    else if (fullName.includes("\n")) name2 = fullName.split("\n").filter((p: string) => p.trim() !== "&")[1] || "";
                                    else if (fullName.includes("&")) name2 = fullName.split("&")[1]?.trim() || "";
                                    setEditConfig({ ...editConfig, coupleNames: `${name1}\n&\n${name2}` });
                                  }}
                                  placeholder="1. İsim"
                                  style={{
                                    padding: "12px", borderRadius: "10px", background: "rgba(255,255,255,0.03)",
                                    border: `1px solid ${C.border}`, color: C.text, outline: "none", fontSize: "13px", width: "100%"
                                  }}
                                />
                                <span style={{ color: C.gold, fontSize: "16px", fontWeight: "bold" }}>&</span>
                                <input
                                  value={(() => {
                                    const fullName = editConfig.coupleNames || "";
                                    if (fullName.includes("\n&\n")) return fullName.split("\n&\n")[1] || "";
                                    if (fullName.includes("\n")) return fullName.split("\n").filter((p: string) => p.trim() !== "&")[1] || "";
                                    if (fullName.includes("&")) return fullName.split("&")[1]?.trim() || "";
                                    return "";
                                  })()}
                                  onChange={(e) => {
                                    const name2 = e.target.value;
                                    const fullName = editConfig.coupleNames || "";
                                    let name1 = "";
                                    if (fullName.includes("\n&\n")) name1 = fullName.split("\n&\n")[0] || "";
                                    else if (fullName.includes("\n")) name1 = fullName.split("\n").filter((p: string) => p.trim() !== "&")[0] || "";
                                    else if (fullName.includes("&")) name1 = fullName.split("&")[0]?.trim() || "";
                                    else name1 = fullName;
                                    setEditConfig({ ...editConfig, coupleNames: `${name1}\n&\n${name2}` });
                                  }}
                                  placeholder="2. İsim"
                                  style={{
                                    padding: "12px", borderRadius: "10px", background: "rgba(255,255,255,0.03)",
                                    border: `1px solid ${C.border}`, color: C.text, outline: "none", fontSize: "13px", width: "100%"
                                  }}
                                />
                              </div>
                            </div>

                            {/* Özel Gün Tarihi */}
                            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                              <label style={{ fontSize: "11px", letterSpacing: "0.12em", textTransform: "uppercase", color: C.muted, fontWeight: 500 }}>Yıldönümü / Özel Gün</label>
                              <input
                                value={editConfig.specialDate || ""}
                                onChange={(e) => setEditConfig({ ...editConfig, specialDate: e.target.value })}
                                placeholder="Örn: 14 Şubat 2025"
                                style={{
                                  padding: "12px", borderRadius: "10px", background: "rgba(255,255,255,0.03)",
                                  border: `1px solid ${C.border}`, color: C.text, outline: "none", fontSize: "13px"
                                }}
                              />
                            </div>
                          </div>

                          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "20px", marginTop: "20px" }}>
                            {/* Giriş Yazısı / Tagline */}
                            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                              <label style={{ fontSize: "11px", letterSpacing: "0.12em", textTransform: "uppercase", color: C.muted, fontWeight: 500 }}>Sayfa Giriş Cümlesi (Tagline)</label>
                              <input
                                value={editConfig.tagline || ""}
                                onChange={(e) => setEditConfig({ ...editConfig, tagline: e.target.value })}
                                placeholder="Örn: Eski bir sinema makinesinin cızırtısında, en güzel hikayemiz..."
                                style={{
                                  padding: "12px", borderRadius: "10px", background: "rgba(255,255,255,0.03)",
                                  border: `1px solid ${C.border}`, color: C.text, outline: "none", fontSize: "13px"
                                }}
                              />
                            </div>
                          </div>

                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginTop: "20px", alignItems: "end" }}>
                            {/* Müzik Seçimi */}
                            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                              <label style={{ fontSize: "11px", letterSpacing: "0.12em", textTransform: "uppercase", color: C.muted, fontWeight: 500 }}>Müzik Dosyası (URL)</label>
                              <input
                                value={editConfig.musicUrl || ""}
                                onChange={(e) => setEditConfig({ ...editConfig, musicUrl: e.target.value })}
                                placeholder="/music/retro.mp3 veya harici url"
                                style={{
                                  padding: "12px", borderRadius: "10px", background: "rgba(255,255,255,0.03)",
                                  border: `1px solid ${C.border}`, color: C.text, outline: "none", fontSize: "13px"
                                }}
                              />
                            </div>
                            
                            {/* Müzik Upload */}
                            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                              <label style={{ fontSize: "11px", letterSpacing: "0.12em", textTransform: "uppercase", color: C.muted, fontWeight: 500 }}>Yeni Müzik Yükle (.mp3)</label>
                              <input
                                type="file"
                                accept="audio/mpeg"
                                onChange={async (e) => {
                                  const file = e.target.files?.[0];
                                  if (!file) return;
                                  try {
                                    setEditorSaving(true);
                                    const url = await handleFileUpload(file);
                                    setEditConfig({ ...editConfig, musicUrl: url });
                                    setEditorSuccess("Müzik başarıyla yüklendi!");
                                  } catch (err: any) {
                                    setEditorError(err.message || "Yükleme hatası.");
                                  } finally {
                                    setEditorSaving(false);
                                  }
                                }}
                              />
                            </div>
                          </div>


                        </div>

                        {/* 2. Kısım: Hikayeler / Anılar Listesi */}
                        <div style={{ ...cardStyle, padding: "28px" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: "10px" }}>
                            <h3 style={{ fontSize: "16px", fontWeight: 600, color: C.text }}>
                              Hikayelerimiz & Anılar
                            </h3>
                            <button
                              type="button"
                              onClick={() => {
                                const newId = editMemories.length > 0 ? Math.max(...editMemories.map((m) => m.id || 0)) + 1 : 1;
                                setEditMemories([...editMemories, { id: newId, image: "/moment.jpg", title: "Yeni Anı Başlığı", description: "Bu anıya dair açıklama...", date: "Tarih Girin" }]);
                              }}
                              style={{
                                padding: "6px 14px", borderRadius: "8px", border: "none",
                                background: C.gold, color: "#0B0F1A", fontSize: "12px", fontWeight: 600, cursor: "pointer",
                                transition: "opacity 0.2s"
                              }}
                              onMouseEnter={(e) => e.currentTarget.style.opacity = "0.85"}
                              onMouseLeave={(e) => e.currentTarget.style.opacity = "1"}
                            >
                              + Yeni Anı Ekle
                            </button>
                          </div>

                          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                            {editMemories.map((memory, index) => (
                              <div
                                key={memory.id}
                                style={{
                                  display: "grid", gridTemplateColumns: "100px 1fr", gap: "20px",
                                  padding: "20px", borderRadius: "16px", background: "rgba(255,255,255,0.015)",
                                  border: "1px solid rgba(255,255,255,0.04)"
                                }}
                              >
                                {/* Sol: Anı Görseli Önizleme & Yükleme */}
                                 <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
                                   <img
                                     src={memory.image}
                                     alt={memory.title}
                                     style={{ width: "80px", height: "80px", objectFit: "cover", borderRadius: "8px", border: `1px solid ${C.border}` }}
                                   />
                                   <label
                                     htmlFor={`image-upload-${memory.id}`}
                                     style={{
                                       fontSize: "10px", padding: "4px 8px", borderRadius: "6px",
                                       border: `1px solid ${C.border}`, background: "rgba(255,255,255,0.04)",
                                       color: C.muted, cursor: "pointer", textAlign: "center", display: "block", width: "100%", boxSizing: "border-box"
                                     }}
                                   >
                                     {memory._imageUploading ? "Yükleniyor..." : "Yükle"}
                                   </label>
                                   <input
                                     id={`image-upload-${memory.id}`}
                                     type="file"
                                     accept="image/*"
                                     onChange={async (e) => {
                                       const file = e.target.files?.[0];
                                       if (!file) return;
                                       try {
                                         setEditMemories((prev) => {
                                           const updated = [...prev];
                                           updated[index] = { ...updated[index], _imageUploading: true, _uploadError: null };
                                           return updated;
                                         });
                                         const url = await handleFileUpload(file);
                                         setEditMemories((prev) => {
                                           const updated = [...prev];
                                           updated[index] = { ...updated[index], image: url, _imageUploading: false };
                                           return updated;
                                         });
                                         setEditorSuccess("Resim başarıyla yüklendi!");
                                       } catch (err: any) {
                                         setEditMemories((prev) => {
                                           const updated = [...prev];
                                           updated[index] = { ...updated[index], _imageUploading: false, _uploadError: err.message || "Yükleme hatası." };
                                           return updated;
                                         });
                                         setEditorError(err.message || "Yükleme hatası.");
                                       }
                                     }}
                                     style={{ display: "none" }}
                                   />
                                   {memory._uploadError && (
                                     <span style={{ fontSize: "9px", color: C.error, marginTop: "4px", textAlign: "center" }}>
                                       {memory._uploadError}
                                     </span>
                                   )}
                                 </div>

                                {/* Sağ: Anı Bilgileri */}
                                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                                    {(!TEMPLATE_SCHEMAS[editTemplateId] || TEMPLATE_SCHEMAS[editTemplateId]?.memoryFields.includes("title")) && (
                                      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                                        <label style={{ fontSize: "10px", textTransform: "uppercase", color: C.muted }}>Anı Başlığı</label>
                                        <input
                                          value={memory.title || ""}
                                          onChange={(e) => {
                                            const val = e.target.value;
                                            setEditMemories((prev) => {
                                              const updated = [...prev];
                                              updated[index] = { ...updated[index], title: val };
                                              return updated;
                                            });
                                          }}
                                          style={{
                                            padding: "8px 12px", borderRadius: "8px", background: "rgba(255,255,255,0.03)",
                                            border: `1px solid ${C.border}`, color: C.text, outline: "none", fontSize: "13px"
                                          }}
                                        />
                                      </div>
                                    )}
                                    {(!TEMPLATE_SCHEMAS[editTemplateId] || TEMPLATE_SCHEMAS[editTemplateId]?.memoryFields.includes("date")) && (
                                      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                                        <label style={{ fontSize: "10px", textTransform: "uppercase", color: C.muted }}>Tarih</label>
                                        <input
                                          value={memory.date || ""}
                                          onChange={(e) => {
                                            const val = e.target.value;
                                            setEditMemories((prev) => {
                                              const updated = [...prev];
                                              updated[index] = { ...updated[index], date: val };
                                              return updated;
                                            });
                                          }}
                                          style={{
                                            padding: "8px 12px", borderRadius: "8px", background: "rgba(255,255,255,0.03)",
                                            border: `1px solid ${C.border}`, color: C.text, outline: "none", fontSize: "13px"
                                          }}
                                        />
                                      </div>
                                    )}
                                    {TEMPLATE_SCHEMAS[editTemplateId]?.memoryFields.includes("caption") && (
                                      <div style={{ display: "flex", flexDirection: "column", gap: "4px", gridColumn: "1 / -1" }}>
                                        <label style={{ fontSize: "10px", textTransform: "uppercase", color: C.muted }}>Alt Yazı (Caption)</label>
                                        <input
                                          value={memory.caption || ""}
                                          onChange={(e) => {
                                            const val = e.target.value;
                                            setEditMemories((prev) => {
                                              const updated = [...prev];
                                              updated[index] = { ...updated[index], caption: val };
                                              return updated;
                                            });
                                          }}
                                          style={{
                                            padding: "8px 12px", borderRadius: "8px", background: "rgba(255,255,255,0.03)",
                                            border: `1px solid ${C.border}`, color: C.text, outline: "none", fontSize: "13px"
                                          }}
                                        />
                                      </div>
                                    )}
                                    {TEMPLATE_SCHEMAS[editTemplateId]?.memoryFields.includes("note") && (
                                      <div style={{ display: "flex", flexDirection: "column", gap: "4px", gridColumn: "1 / -1" }}>
                                        <label style={{ fontSize: "10px", textTransform: "uppercase", color: C.muted }}>Kısa Not (Note)</label>
                                        <input
                                          value={memory.note || ""}
                                          onChange={(e) => {
                                            const val = e.target.value;
                                            setEditMemories((prev) => {
                                              const updated = [...prev];
                                              updated[index] = { ...updated[index], note: val };
                                              return updated;
                                            });
                                          }}
                                          style={{
                                            padding: "8px 12px", borderRadius: "8px", background: "rgba(255,255,255,0.03)",
                                            border: `1px solid ${C.border}`, color: C.text, outline: "none", fontSize: "13px"
                                          }}
                                        />
                                      </div>
                                    )}
                                    {TEMPLATE_SCHEMAS[editTemplateId]?.memoryFields.includes("angle") && (
                                      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                                        <label style={{ fontSize: "10px", textTransform: "uppercase", color: C.muted }}>Açı (Angle) Örn: -4</label>
                                        <input
                                          value={memory.angle || ""}
                                          onChange={(e) => {
                                            const val = e.target.value;
                                            setEditMemories((prev) => {
                                              const updated = [...prev];
                                              updated[index] = { ...updated[index], angle: val };
                                              return updated;
                                            });
                                          }}
                                          style={{
                                            padding: "8px 12px", borderRadius: "8px", background: "rgba(255,255,255,0.03)",
                                            border: `1px solid ${C.border}`, color: C.text, outline: "none", fontSize: "13px"
                                          }}
                                        />
                                      </div>
                                    )}
                                    {TEMPLATE_SCHEMAS[editTemplateId]?.memoryFields.includes("rotate") && (
                                      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                                        <label style={{ fontSize: "10px", textTransform: "uppercase", color: C.muted }}>Dönme (Rotate) Örn: -2.5</label>
                                        <input
                                          value={memory.rotate || ""}
                                          onChange={(e) => {
                                            const val = e.target.value;
                                            setEditMemories((prev) => {
                                              const updated = [...prev];
                                              updated[index] = { ...updated[index], rotate: val };
                                              return updated;
                                            });
                                          }}
                                          style={{
                                            padding: "8px 12px", borderRadius: "8px", background: "rgba(255,255,255,0.03)",
                                            border: `1px solid ${C.border}`, color: C.text, outline: "none", fontSize: "13px"
                                          }}
                                        />
                                      </div>
                                    )}
                                    {TEMPLATE_SCHEMAS[editTemplateId]?.memoryFields.includes("frame") && (
                                      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                                        <label style={{ fontSize: "10px", textTransform: "uppercase", color: C.muted }}>Çerçeve (Frame) Örn: 01</label>
                                        <input
                                          value={memory.frame || ""}
                                          onChange={(e) => {
                                            const val = e.target.value;
                                            setEditMemories((prev) => {
                                              const updated = [...prev];
                                              updated[index] = { ...updated[index], frame: val };
                                              return updated;
                                            });
                                          }}
                                          style={{
                                            padding: "8px 12px", borderRadius: "8px", background: "rgba(255,255,255,0.03)",
                                            border: `1px solid ${C.border}`, color: C.text, outline: "none", fontSize: "13px"
                                          }}
                                        />
                                      </div>
                                    )}
                                  </div>

                                  {(!TEMPLATE_SCHEMAS[editTemplateId] || TEMPLATE_SCHEMAS[editTemplateId]?.memoryFields.includes("description")) && (
                                    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                                      <label style={{ fontSize: "10px", textTransform: "uppercase", color: C.muted }}>Açıklama (Description)</label>
                                      <textarea
                                        value={memory.description || ""}
                                        onChange={(e) => {
                                          const val = e.target.value;
                                          setEditMemories((prev) => {
                                            const updated = [...prev];
                                            updated[index] = { ...updated[index], description: val };
                                            return updated;
                                          });
                                        }}
                                        style={{
                                          padding: "8px 12px", borderRadius: "8px", background: "rgba(255,255,255,0.03)",
                                          border: `1px solid ${C.border}`, color: C.text, outline: "none", fontSize: "13px",
                                          resize: "vertical", height: "60px"
                                        }}
                                      />
                                    </div>
                                  )}

                                  {/* Video (Opsiyonel) */}
                                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                                    <label style={{ fontSize: "10px", textTransform: "uppercase", color: C.muted }}>Video (Opsiyonel)</label>
                                    <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                                      {memory.video ? (
                                        <>
                                          <span style={{ fontSize: "11px", color: C.text, wordBreak: "break-all" }}>
                                            {memory.video}
                                          </span>
                                          <button
                                            type="button"
                                            onClick={() => {
                                              setEditMemories((prev) => {
                                                const updated = [...prev];
                                                const updatedItem = { ...updated[index] };
                                                delete updatedItem.video;
                                                updated[index] = updatedItem;
                                                return updated;
                                              });
                                            }}
                                            style={{
                                              padding: "4px 8px", borderRadius: "6px", border: "1px solid rgba(232, 160, 160, 0.2)",
                                              background: "rgba(232, 160, 160, 0.05)", color: C.error, fontSize: "11px", cursor: "pointer"
                                            }}
                                          >
                                            Kaldır
                                          </button>
                                        </>
                                      ) : (
                                        <>
                                          <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.2)" }}>
                                            {memory._videoUploading ? "Video yükleniyor..." : "Video yok (görsel gösterilecek)"}
                                          </span>
                                          {!memory._videoUploading && (
                                            <>
                                              <label
                                                htmlFor={`video-upload-${memory.id}`}
                                                style={{
                                                  fontSize: "11px", padding: "4px 10px", borderRadius: "6px",
                                                  border: `1px solid ${C.border}`, background: "rgba(255,255,255,0.04)",
                                                  color: C.muted, cursor: "pointer", textAlign: "center"
                                                }}
                                              >
                                                Video Yükle
                                              </label>
                                              <input
                                                id={`video-upload-${memory.id}`}
                                                type="file"
                                                accept="video/*"
                                                onChange={async (e) => {
                                                  const file = e.target.files?.[0];
                                                  if (!file) return;
                                                  try {
                                                    setEditMemories((prev) => {
                                                      const updated = [...prev];
                                                      updated[index] = { ...updated[index], _videoUploading: true, _videoError: null };
                                                      return updated;
                                                    });
                                                    const url = await handleFileUpload(file);
                                                    setEditMemories((prev) => {
                                                      const updated = [...prev];
                                                      updated[index] = { ...updated[index], video: url, _videoUploading: false };
                                                      return updated;
                                                    });
                                                    setEditorSuccess("Video başarıyla yüklendi!");
                                                  } catch (err: any) {
                                                    setEditMemories((prev) => {
                                                      const updated = [...prev];
                                                      updated[index] = { ...updated[index], _videoUploading: false, _videoError: err.message || "Yükleme hatası." };
                                                      return updated;
                                                    });
                                                    setEditorError(err.message || "Yükleme hatası.");
                                                  }
                                                }}
                                                style={{ display: "none" }}
                                              />
                                            </>
                                          )}
                                        </>
                                      )}
                                    </div>
                                    {memory._videoError && (
                                      <span style={{ fontSize: "10px", color: C.error, marginTop: "2px" }}>
                                        {memory._videoError}
                                      </span>
                                    )}
                                  </div>

                                  {/* Sıralama & Sil Butonları */}
                                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "4px" }}>
                                    {/* Image path display */}
                                    <span style={{ fontSize: "11px", color: "rgba(240,237,232,0.2)" }}>Görsel: {memory.image}</span>

                                    <div style={{ display: "flex", gap: "8px" }}>
                                      {/* Yukarı Taşı */}
                                      <button
                                        type="button"
                                        disabled={index === 0}
                                        onClick={() => {
                                          if (index === 0) return;
                                          setEditMemories((prev) => {
                                            const updated = [...prev];
                                            const temp = updated[index];
                                            updated[index] = updated[index - 1];
                                            updated[index - 1] = temp;
                                            return updated;
                                          });
                                        }}
                                        style={{
                                          padding: "4px 8px", borderRadius: "6px", border: `1px solid ${C.border}`,
                                          background: "rgba(255,255,255,0.03)", color: index === 0 ? "rgba(255,255,255,0.1)" : C.muted,
                                          fontSize: "11px", cursor: index === 0 ? "not-allowed" : "pointer"
                                        }}
                                      >
                                        ↑ Yukarı
                                      </button>
                                      {/* Aşağı Taşı */}
                                      <button
                                        type="button"
                                        disabled={index === editMemories.length - 1}
                                        onClick={() => {
                                          if (index === editMemories.length - 1) return;
                                          setEditMemories((prev) => {
                                            const updated = [...prev];
                                            const temp = updated[index];
                                            updated[index] = updated[index + 1];
                                            updated[index + 1] = temp;
                                            return updated;
                                          });
                                        }}
                                        style={{
                                          padding: "4px 8px", borderRadius: "6px", border: `1px solid ${C.border}`,
                                          background: "rgba(255,255,255,0.03)", color: index === editMemories.length - 1 ? "rgba(255,255,255,0.1)" : C.muted,
                                          fontSize: "11px", cursor: index === editMemories.length - 1 ? "not-allowed" : "pointer"
                                        }}
                                      >
                                        ↓ Aşağı
                                      </button>
                                      {/* Sil */}
                                      <button
                                        type="button"
                                        onClick={() => {
                                          if (confirm("Bu anıyı silmek istediğinize emin misiniz?")) {
                                            setEditMemories(editMemories.filter((_, idx) => idx !== index));
                                          }
                                        }}
                                        style={{
                                          padding: "4px 10px", borderRadius: "6px", border: "1px solid rgba(232, 160, 160, 0.2)",
                                          background: "rgba(232, 160, 160, 0.05)", color: C.error,
                                          fontSize: "11px", cursor: "pointer"
                                        }}
                                      >
                                        Sil
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Alt Butonlar - Kaydet / Tamamlandı */}
                        <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "10px" }}>
                          <button
                            type="button"
                            disabled={editorSaving}
                            onClick={handleDeletePage}
                            style={{
                              padding: "14px 28px", borderRadius: "30px", border: "1px solid rgba(232, 160, 160, 0.4)",
                              background: "rgba(232, 160, 160, 0.05)", color: C.error, fontFamily: "var(--font-inter), sans-serif",
                              fontSize: "13px", fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", cursor: "pointer",
                              transition: "all 0.2s", marginRight: "auto"
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = "rgba(232, 160, 160, 0.15)";
                              e.currentTarget.style.borderColor = "rgba(232, 160, 160, 0.8)";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = "rgba(232, 160, 160, 0.05)";
                              e.currentTarget.style.borderColor = "rgba(232, 160, 160, 0.4)";
                            }}
                          >
                            Sayfayı Sil
                          </button>

                          <button
                            type="button"
                            disabled={editorSaving}
                            onClick={() => handleSavePageSettings(false)}
                            style={{
                              padding: "14px 28px", borderRadius: "30px", border: `1px solid ${C.border}`,
                              background: "rgba(255,255,255,0.04)", color: C.text, fontFamily: "var(--font-inter), sans-serif",
                              fontSize: "13px", fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", cursor: "pointer",
                              transition: "opacity 0.2s"
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.07)"}
                            onMouseLeave={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.04)"}
                          >
                            Taslağı Güncelle
                          </button>
                          
                          <button
                            type="button"
                            disabled={editorSaving}
                            onClick={() => handleSavePageSettings(true)}
                            style={{
                              padding: "14px 28px", borderRadius: "30px", border: "none",
                              background: C.gold, color: "#0B0F1A", fontFamily: "var(--font-inter), sans-serif",
                              fontSize: "13px", fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", cursor: "pointer",
                              transition: "opacity 0.2s"
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.opacity = "0.85"}
                            onMouseLeave={(e) => e.currentTarget.style.opacity = "1"}
                          >
                            {editorSaving ? "Yayınlanıyor..." : "Değişiklikleri Yayına Al"}
                          </button>
                        </div>

                      </div>
                    )}
                  </div>
                )}
              </motion.div>
  );
}
