import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HiOutlineExternalLink, HiOutlineCheck, HiOutlineTrash, HiOutlineUpload, HiOutlineLink, HiOutlineRefresh, HiOutlineMail, HiOutlineClipboardCopy, HiOutlineChevronDown, HiOutlineSearch } from "react-icons/hi";
import { C } from "../../_utils/constants";
import { formatActiveDuration } from "../../_utils/dateUtils";
import { TEMPLATE_SCHEMAS } from "../../../../lib/templateSchemas";

const SHOWCASE_SLUGS = [
  "sablon-retro", "sablon-minimal", "sablon-sinematik", "sablon-emerald", 
  "sablon-kirmizi", "sablon-oyun", "sablon-lavanta", "sablon-amber", 
  "sablon-rose", "sablon-indigo", "sablon-siyah"
];

const SHOWCASE_SLUGS_WITH_NAMES = [
  { slug: "sablon-retro", title: "Koyu Gül Kurusu (Retro)" },
  { slug: "sablon-kirmizi", title: "Romantik Kırmızı" },
  { slug: "sablon-minimal", title: "Modern Minimal" },
  { slug: "sablon-sinematik", title: "Sinematik Aşk" },
  { slug: "sablon-emerald", title: "Zümrüt Yeşili" },
  { slug: "sablon-oyun", title: "Oyuncu Şablonu" },
  { slug: "sablon-lavanta", title: "Lavanta Rüyası" },
  { slug: "sablon-amber", title: "Günbatımı Amberi" },
  { slug: "sablon-rose", title: "Gül Kurusu" },
  { slug: "sablon-indigo", title: "Gece Yarısı İndigo" },
  { slug: "sablon-siyah", title: "Karanlık Gece (Siyah)" },
];

const TEMPLATE_SHOWCASE_SLUGS: Record<string, string> = {
  "klasik-retro": "sablon-retro",
  "romantik-kirmizi": "sablon-kirmizi",
  "modern-minimal": "sablon-minimal",
  "sinematik-ask": "sablon-sinematik",
  "premium-emerald": "sablon-emerald",
  "sablon-oyun": "sablon-oyun",
  "sablon-lavanta": "sablon-lavanta",
  "sablon-amber": "sablon-amber",
  "sablon-rose": "sablon-rose",
  "sablon-indigo": "sablon-indigo",
  "sablon-siyah": "sablon-siyah"
};

const DEFAULT_TEMPLATES = [
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
];

interface PagesTabProps {
  adminEmail: string;
  setPrefilledSlug?: (slug: string) => void;
  setActiveTab?: (tab: "create_page" | "template_builder" | "codes" | "users" | "marketing" | "settings") => void;
}

export function PagesTab({ adminEmail, setPrefilledSlug, setActiveTab }: PagesTabProps) {
  // Tab 0 — Sayfa Oluştur & Düzenle
  const [allPages, setAllPages] = useState<{ pageSlug: string; templateId: string; isPublished: boolean; isShowcase?: boolean; activatedAt?: string; remainingTime?: string; config?: any }[]>([]);
  const [pagesTab, setPagesTab] = useState<"published" | "drafts">("published");
  const [pagesLoading, setPagesLoading] = useState(false);
  const [templateList, setTemplateList] = useState(DEFAULT_TEMPLATES);

  // Load showcase order
  useEffect(() => {
    const loadShowcaseOrder = async () => {
      if (!adminEmail) return;
      try {
        const res = await fetch(`/api/admin/site-settings?adminEmail=${encodeURIComponent(adminEmail)}`);
        const data = await res.json();
        if (res.ok && data.settings && data.settings.showcase_order) {
          const order: string[] = data.settings.showcase_order;
          setTemplateList((prev) => {
            const sorted = [...prev].sort((a, b) => {
              const slugA = TEMPLATE_SHOWCASE_SLUGS[a.id];
              const slugB = TEMPLATE_SHOWCASE_SLUGS[b.id];
              const idxA = order.indexOf(slugA);
              const idxB = order.indexOf(slugB);
              if (idxA !== -1 && idxB !== -1) return idxA - idxB;
              if (idxA !== -1) return -1;
              if (idxB !== -1) return 1;
              return 0;
            });
            return sorted;
          });
        }
      } catch (err) {
        console.error("Load showcase order error:", err);
      }
    };
    loadShowcaseOrder();
  }, [adminEmail]);

  const handleMoveTemplate = async (index: number, direction: "up" | "down") => {
    const updated = [...templateList];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= updated.length) return;
    
    [updated[index], updated[targetIndex]] = [updated[targetIndex], updated[index]];
    setTemplateList(updated);

    try {
      const showcaseOrder = updated.map(t => TEMPLATE_SHOWCASE_SLUGS[t.id]);
      await fetch("/api/admin/site-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          adminEmail,
          settings: {
            showcase_order: showcaseOrder
          }
        })
      });
    } catch (err) {
      console.error("Save showcase order error:", err);
    }
  };
  const [selectedEditSlug, setSelectedEditSlug] = useState("");
  const [editPageSlug, setEditPageSlug] = useState("");
  
  // Editor state
  const [editTemplateId, setEditTemplateId] = useState("klasik-retro");
  const [editConfig, setEditConfig] = useState<any>(null);
  const [editMemories, setEditMemories] = useState<any[]>([]);
  const [editIsPublished, setEditIsPublished] = useState(false);
  const [editIsShowcase, setEditIsShowcase] = useState(false);
  
  // Custom template save states
  const [saveTemplateName, setSaveTemplateName] = useState("");
  const [templateSaving, setTemplateSaving] = useState(false);
  const [templateSaveSuccess, setTemplateSaveSuccess] = useState("");
  const [templateSaveError, setTemplateSaveError] = useState("");

  const [editorLoading, setEditorLoading] = useState(false);
  const [editorSaving, setEditorSaving] = useState(false);
  const [editorError, setEditorError] = useState("");
  const [editorSuccess, setEditorSuccess] = useState("");
  const [showComponentPicker, setShowComponentPicker] = useState(false);

  // Create Page sub-states
  const [newSlug, setNewSlug] = useState("");
  const [newTemplateId, setNewTemplateId] = useState("klasik-retro");
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState("");

  // Integrate memories states
  const [showIntegrateModal, setShowIntegrateModal] = useState(false);
  const [selectedIntegrateSlugs, setSelectedIntegrateSlugs] = useState<string[]>([]);
  const [integrateLoading, setIntegrateLoading] = useState(false);
  const [integrateSuccess, setIntegrateSuccess] = useState("");
  const [integrateError, setIntegrateError] = useState("");

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
    fetch("/api/admin/setup-db").catch(() => {});
    fetchAllPages();
    fetchCustomTemplates();
  }, [fetchAllPages, fetchCustomTemplates]);
  const TEMPLATE_DEFAULTS: Record<string, any> = {
    "klasik-retro": { bgColor: "#160C0E", accentColor: "#e5c2ba", particlesEnabled: true, particlesType: "rose-petals", memoryCardStyle: "polaroid", headingFont: "cormorant", bodyFont: "lato", polaroidTilt: true },
    "romantik-kirmizi": { bgColor: "#160408", accentColor: "#e63946", particlesEnabled: true, particlesType: "hearts", memoryCardStyle: "plain", headingFont: "cormorant", bodyFont: "inter" },
    "modern-minimal": { bgColor: "#F6F3F0", accentColor: "#8C7E6C", particlesEnabled: false, particlesType: "none", memoryCardStyle: "plain", headingFont: "cormorant", bodyFont: "inter" },
    "sinematik-ask": { bgColor: "#0C0C0E", accentColor: "#B8A9D4", particlesEnabled: true, particlesType: "stars", memoryCardStyle: "cinematic", headingFont: "cormorant", bodyFont: "inter" },
    "premium-emerald": { bgColor: "#022C22", accentColor: "#D4AF37", particlesEnabled: true, particlesType: "stars", memoryCardStyle: "plain", headingFont: "cormorant", bodyFont: "inter" },
    "sablon-oyun": { bgColor: "#111111", accentColor: "#cbff3e", particlesEnabled: false, particlesType: "none", memoryCardStyle: "plain", headingFont: "press-start", bodyFont: "vt323" },
    "sablon-lavanta": { bgColor: "#1E1B4B", accentColor: "#D8B4FE", particlesEnabled: true, particlesType: "stars", memoryCardStyle: "plain", headingFont: "cormorant", bodyFont: "inter" },
    "sablon-amber": { bgColor: "#090300", accentColor: "#F59E0B", particlesEnabled: true, particlesType: "stars", memoryCardStyle: "plain", headingFont: "cormorant", bodyFont: "inter" },
    "sablon-rose": { bgColor: "#F8F0EA", accentColor: "#E8A0A0", particlesEnabled: true, particlesType: "rose-petals", memoryCardStyle: "polaroid", headingFont: "cormorant", bodyFont: "lato", polaroidTilt: true },
    "sablon-indigo": { bgColor: "#04091a", accentColor: "#6366F1", particlesEnabled: true, particlesType: "stars", memoryCardStyle: "plain", headingFont: "cinzel", bodyFont: "lato" },
    "sablon-siyah": { bgColor: "#09090b", accentColor: "#C9A84C", particlesEnabled: true, particlesType: "hearts", memoryCardStyle: "plain", headingFont: "cormorant", bodyFont: "inter" }
  };

  const handleSaveCustomTemplate = async () => {
    if (!saveTemplateName.trim()) {
      setTemplateSaveError("Şablon adı giriniz.");
      return;
    }
    setTemplateSaving(true);
    setTemplateSaveError("");
    setTemplateSaveSuccess("");
    try {
      const res = await fetch("/api/admin/custom-templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          adminEmail,
          action: "create",
          name: saveTemplateName.trim(),
          previewColor: editConfig.accentColor || "#C9A84C",
          templateConfig: editConfig,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setTemplateSaveError(data.error ?? "Şablon kaydedilemedi.");
        return;
      }
      setTemplateSaveSuccess("Şablon başarıyla özel şablonlara kaydedildi!");
      setSaveTemplateName("");
      await fetchCustomTemplates();
    } catch {
      setTemplateSaveError("Sunucuya bağlanılamadı.");
    } finally {
      setTemplateSaving(false);
    }
  };

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
        setEditPageSlug(ps.pageSlug);
        setEditTemplateId(ps.templateId);
        
        let baseConfig = {};
        if (ps.templateId && ps.templateId.startsWith("custom-")) {
          const match = customTemplates.find(t => `custom-${t.id}` === ps.templateId);
          if (match && (match as any).template_config) {
            baseConfig = (match as any).template_config;
          }
        } else {
          baseConfig = TEMPLATE_DEFAULTS[ps.templateId] || {};
        }

        setEditConfig({
          bgColor: "#09090b",
          accentColor: "#C9A84C",
          particlesEnabled: true,
          particlesType: "hearts",
          particlesDensity: 20,
          particlesColor: "",
          musicWidgetEnabled: true,
          musicWidgetType: "vinyl",
          musicWidgetPosition: "bottom-left",
          memoryCardStyle: "plain",
          memoryCardLayout: "vertical",
          polaroidTilt: true,
          headingFont: "cormorant",
          bodyFont: "inter",
          finalEnabled: true,
          finalHeading: "Sonsuza Dek Birlikte",
          ...baseConfig,
          ...(ps.config || {})
        });
        setEditMemories(ps.memories || []);
        setEditIsPublished(ps.isPublished);
        setEditIsShowcase(ps.isShowcase || false);
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
          newPageSlug: editPageSlug,
          templateId: editTemplateId,
          config: editConfig,
          memories: editMemories,
          isPublished: isPub,
          isShowcase: editIsShowcase,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setEditorError(data.error ?? "Sayfa kaydedilemedi.");
        return;
      }
      setEditIsPublished(isPub);
      setEditorSuccess(isPub ? "Sayfa başarıyla yayına alındı! 🎉" : "Düzenlemeler kaydedildi (Taslak).");
      if (data.pageSlug) {
        setSelectedEditSlug(data.pageSlug);
        setEditPageSlug(data.pageSlug);
      }
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

  const handleIntegrateMemories = async () => {
    if (selectedIntegrateSlugs.length === 0) return;
    setIntegrateLoading(true);
    setIntegrateSuccess("");
    setIntegrateError("");
    try {
      const res = await fetch("/api/admin/integrate-memories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          adminEmail,
          sourceSlug: selectedEditSlug,
          targetSlugs: selectedIntegrateSlugs
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setIntegrateSuccess("Anılar seçilen şablonlara başarıyla kopyalandı!");
        setTimeout(() => {
          setShowIntegrateModal(false);
          setIntegrateSuccess("");
          setSelectedIntegrateSlugs([]);
        }, 1500);
      } else {
        setIntegrateError(data.error || "Entegrasyon sırasında bir hata oluştu.");
      }
    } catch (err) {
      console.error(err);
      setIntegrateError("Sunucu bağlantı hatası.");
    } finally {
      setIntegrateLoading(false);
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

  const displayPages = allPages.filter(p => !SHOWCASE_SLUGS.includes(p.pageSlug));

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
                      <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "20px", maxHeight: "280px", overflowY: "auto", paddingRight: "4px" }}>
                        {templateList.map((tpl, index) => {
                          const showcasePage = allPages.find(p => p.pageSlug === TEMPLATE_SHOWCASE_SLUGS[tpl.id]);
                          const displayColor = showcasePage?.config?.showcaseAccentColor || showcasePage?.config?.accentColor || tpl.color;
                          return (
                            <div key={tpl.id} style={{ display: "flex", gap: "8px", alignItems: "stretch" }}>
                              <button
                                type="button"
                                onClick={() => setNewTemplateId(tpl.id)}
                                style={{
                                  flex: 1,
                                  padding: "10px 14px", borderRadius: "12px",
                                  border: `1px solid ${newTemplateId === tpl.id ? displayColor : "rgba(255,255,255,0.06)"}`,
                                  background: newTemplateId === tpl.id ? `${displayColor}15` : "rgba(255,255,255,0.03)",
                                  color: newTemplateId === tpl.id ? displayColor : C.text,
                                  cursor: "pointer", transition: "all 0.2s", textAlign: "left",
                                  fontFamily: "var(--font-inter), sans-serif", fontSize: "12px", fontWeight: newTemplateId === tpl.id ? 600 : 400,
                                  display: "flex", alignItems: "center", gap: "10px",
                                }}
                              >
                                <span style={{ display: "inline-block", width: "10px", height: "10px", borderRadius: "50%", background: displayColor, flexShrink: 0 }} />
                                {tpl.title}
                              </button>

                              {/* Sıralama Kontrolleri */}
                              <div style={{ display: "flex", gap: "2px" }}>
                                <button
                                  type="button"
                                  disabled={index === 0}
                                  onClick={() => handleMoveTemplate(index, "up")}
                                  style={{
                                    padding: "0 8px", borderRadius: "8px",
                                    border: "1px solid rgba(255,255,255,0.06)",
                                    background: "rgba(255,255,255,0.02)",
                                    color: index === 0 ? "rgba(255,255,255,0.08)" : C.muted,
                                    cursor: index === 0 ? "not-allowed" : "pointer",
                                    fontSize: "11px", display: "flex", alignItems: "center", justifyContent: "center"
                                  }}
                                  title="Yukarı Taşı"
                                >
                                  ▲
                                </button>
                                <button
                                  type="button"
                                  disabled={index === templateList.length - 1}
                                  onClick={() => handleMoveTemplate(index, "down")}
                                  style={{
                                    padding: "0 8px", borderRadius: "8px",
                                    border: "1px solid rgba(255,255,255,0.06)",
                                    background: "rgba(255,255,255,0.02)",
                                    color: index === templateList.length - 1 ? "rgba(255,255,255,0.08)" : C.muted,
                                    cursor: index === templateList.length - 1 ? "not-allowed" : "pointer",
                                    fontSize: "11px", display: "flex", alignItems: "center", justifyContent: "center"
                                  }}
                                  title="Aşağı Taşı"
                                >
                                  ▼
                                </button>
                              </div>

                              <button
                                type="button"
                                onClick={() => loadPageSettings(TEMPLATE_SHOWCASE_SLUGS[tpl.id])}
                                style={{
                                  padding: "0 14px", borderRadius: "12px",
                                  border: "1px solid rgba(255,255,255,0.08)",
                                  background: "rgba(255,255,255,0.03)",
                                  color: C.muted,
                                  cursor: "pointer", transition: "all 0.2s",
                                  display: "flex", alignItems: "center", justifyContent: "center",
                                  fontSize: "11px", fontFamily: "var(--font-inter), sans-serif", fontWeight: 500,
                                }}
                                onMouseEnter={(e) => { e.currentTarget.style.borderColor = C.gold; e.currentTarget.style.color = C.gold; }}
                                onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; e.currentTarget.style.color = C.muted; }}
                                title="Şablonu Düzenle"
                              >
                                Düzenle
                              </button>
                            </div>
                          );
                        })}
                      </div>

                      {/* Özel Şablonlar */}
                      {customTemplates.length > 0 && (
                        <>
                          <p style={{ fontSize: "11px", letterSpacing: "0.12em", textTransform: "uppercase", color: C.muted, marginBottom: "8px", marginTop: "16px", fontWeight: 500 }}>
                            🎨 Özel Şablonlarım
                          </p>
                          <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "20px", maxHeight: "200px", overflowY: "auto", paddingRight: "4px" }}>
                            {customTemplates.map((tpl) => {
                              const tplId = `custom-${tpl.id}`;
                              return (
                                <div key={tpl.id} style={{ display: "flex", gap: "8px", alignItems: "stretch" }}>
                                  <button
                                    key={tpl.id}
                                    type="button"
                                    onClick={() => setNewTemplateId(tplId)}
                                    style={{
                                      flex: 1,
                                      padding: "10px 14px", borderRadius: "12px",
                                      border: `1px solid ${newTemplateId === tplId ? tpl.preview_color : "rgba(255,255,255,0.06)"}`,
                                      background: newTemplateId === tplId ? `${tpl.preview_color}15` : "rgba(255,255,255,0.03)",
                                      color: newTemplateId === tplId ? tpl.preview_color : C.text,
                                      cursor: "pointer", transition: "all 0.2s", textAlign: "left",
                                      fontFamily: "var(--font-inter), sans-serif", fontSize: "12px", fontWeight: newTemplateId === tplId ? 600 : 400,
                                      display: "flex", alignItems: "center", gap: "10px",
                                    }}
                                  >
                                    <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", flexShrink: 0 }}>
                                      <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: tpl.preview_color, display: "inline-block" }} />
                                      <span style={{ fontSize: "8px", opacity: 0.5, letterSpacing: "0.1em" }}>ÖZEL</span>
                                    </span>
                                    {tpl.name}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      localStorage.setItem("edit_custom_template_id", tpl.id);
                                      if (setActiveTab) setActiveTab("template_builder");
                                    }}
                                    style={{
                                      padding: "0 14px", borderRadius: "12px",
                                      border: "1px solid rgba(255,255,255,0.08)",
                                      background: "rgba(255,255,255,0.03)",
                                      color: C.muted,
                                      cursor: "pointer", transition: "all 0.2s",
                                      display: "flex", alignItems: "center", justifyContent: "center",
                                      fontSize: "11px", fontFamily: "var(--font-inter), sans-serif", fontWeight: 500,
                                    }}
                                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = C.gold; e.currentTarget.style.color = C.gold; }}
                                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; e.currentTarget.style.color = C.muted; }}
                                    title="Şablonu Düzenle"
                                  >
                                    Düzenle
                                  </button>
                                </div>
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
                            Yayında ({displayPages.filter(p => p.isPublished).length})
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
                            Taslaklar ({displayPages.filter(p => !p.isPublished).length})
                          </button>
                        </div>
                      </div>

                      {pagesLoading ? (
                        <div style={{ color: C.muted, fontSize: "13px", padding: "24px 0", textAlign: "center" }}>Yükleniyor...</div>
                      ) : displayPages.filter(p => pagesTab === "published" ? p.isPublished : !p.isPublished).length === 0 ? (
                        <div style={{ color: C.muted, fontSize: "13px", fontStyle: "italic", padding: "24px 0", textAlign: "center" }}>
                          {pagesTab === "published" ? "Yayında olan sayfa yok." : "Taslak sayfa yok."}
                        </div>
                      ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: "10px", maxHeight: "450px", overflowY: "auto", paddingRight: "6px" }}>
                          {displayPages.filter(p => pagesTab === "published" ? p.isPublished : !p.isPublished).map((page) => (
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
                                {page.isShowcase && (
                                  <span style={{
                                    fontSize: "10px", padding: "2px 8px", borderRadius: "20px", fontWeight: 600,
                                    background: "rgba(168,85,247,0.12)",
                                    color: "#A855F7",
                                    border: "1px solid rgba(168,85,247,0.33)",
                                    marginLeft: "8px"
                                  }}>
                                    VİTRİN
                                  </span>
                                )}
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
                            
                            {/* Sayfa Adresi (Slug) */}
                            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                              <label style={{ fontSize: "11px", letterSpacing: "0.12em", textTransform: "uppercase", color: C.muted, fontWeight: 500 }}>Sayfa Adresi (Link)</label>
                              <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                                <span style={{ fontSize: "13px", color: C.muted }}>birlikteydik.com/</span>
                                <input
                                  value={editPageSlug}
                                  disabled={editIsPublished}
                                  onChange={(e) => setEditPageSlug(e.target.value.toLowerCase().replace(/\s+/g, ""))}
                                  placeholder="musteri-linki"
                                  style={{
                                    flex: 1,
                                    padding: "12px",
                                    borderRadius: "10px",
                                    background: editIsPublished ? "rgba(255,255,255,0.01)" : "rgba(255,255,255,0.03)",
                                    border: `1px solid ${C.border}`,
                                    color: editIsPublished ? C.muted : C.text,
                                    outline: "none",
                                    fontSize: "13px",
                                    cursor: editIsPublished ? "not-allowed" : "text"
                                  }}
                                />
                              </div>
                              {editIsPublished && (
                                <span style={{ fontSize: "10px", color: C.muted, marginTop: "2px" }}>
                                  ℹ Sayfa adresini değiştirmek için önce sayfayı taslağa almalısınız.
                                </span>
                              )}
                            </div>

                            {/* Şablon Değiştir */}
                            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                              <label style={{ fontSize: "11px", letterSpacing: "0.12em", textTransform: "uppercase", color: C.muted, fontWeight: 500 }}>Şablon</label>
                              <select
                                value={editTemplateId}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setEditTemplateId(val);
                                  
                                  let baseConfig = {};
                                  if (val.startsWith("custom-")) {
                                    const match = customTemplates.find(t => `custom-${t.id}` === val);
                                    if (match && (match as any).template_config) {
                                      baseConfig = (match as any).template_config;
                                    }
                                  } else {
                                    baseConfig = TEMPLATE_DEFAULTS[val] || {};
                                  }
                                  setEditConfig((prev: any) => ({
                                    ...prev,
                                    ...baseConfig
                                  }));
                                }}
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
                                {customTemplates.map((tpl) => (
                                  <option key={tpl.id} value={`custom-${tpl.id}`}>
                                    🎨 [Özel] {tpl.name}
                                  </option>
                                ))}
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

                            {/* Özel Gün Tarihi Rengi */}
                            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                              <label style={{ fontSize: "11px", letterSpacing: "0.12em", textTransform: "uppercase", color: C.muted, fontWeight: 500 }}>Özel Gün Rengi</label>
                              <div style={{ display: "flex", gap: "10px" }}>
                                <input
                                  type="color"
                                  value={editConfig.specialDateColor || "#C9A84C"}
                                  onChange={(e) => setEditConfig({ ...editConfig, specialDateColor: e.target.value })}
                                  style={{ width: "42px", height: "42px", padding: 0, border: "none", borderRadius: "8px", background: "transparent", cursor: "pointer" }}
                                />
                                <input
                                  value={editConfig.specialDateColor || ""}
                                  onChange={(e) => setEditConfig({ ...editConfig, specialDateColor: e.target.value })}
                                  placeholder="Varsayılan"
                                  style={{ flex: 1, padding: "12px", borderRadius: "10px", background: "rgba(255,255,255,0.03)", border: `1px solid ${C.border}`, color: C.text, outline: "none", fontSize: "13px" }}
                                />
                              </div>
                            </div>
                          </div>

                          <div style={{ display: "grid", gridTemplateColumns: "1fr 240px", gap: "20px", marginTop: "20px" }}>
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

                            {/* Tagline Rengi */}
                            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                              <label style={{ fontSize: "11px", letterSpacing: "0.12em", textTransform: "uppercase", color: C.muted, fontWeight: 500 }}>Giriş Cümlesi Rengi</label>
                              <div style={{ display: "flex", gap: "10px" }}>
                                <input
                                  type="color"
                                  value={editConfig.taglineColor || "#888888"}
                                  onChange={(e) => setEditConfig({ ...editConfig, taglineColor: e.target.value })}
                                  style={{ width: "42px", height: "42px", padding: 0, border: "none", borderRadius: "8px", background: "transparent", cursor: "pointer" }}
                                />
                                <input
                                  value={editConfig.taglineColor || ""}
                                  onChange={(e) => setEditConfig({ ...editConfig, taglineColor: e.target.value })}
                                  placeholder="Varsayılan"
                                  style={{ flex: 1, padding: "12px", borderRadius: "10px", background: "rgba(255,255,255,0.03)", border: `1px solid ${C.border}`, color: C.text, outline: "none", fontSize: "13px" }}
                                />
                              </div>
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

                        {/* Yeni Kısım: Tasarım Özelleştirme */}
                        <div style={{ ...cardStyle, padding: "28px" }}>
                          <h3 style={{ fontSize: "16px", fontWeight: 600, color: C.text, marginBottom: "20px", borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: "10px", fontFamily: "'Cormorant Garamond', 'Cormorant Garamond Fallback', serif" }}>
                            🎨 Tasarım Özelleştirme (Şablon Detayları)
                          </h3>

                          {/* Renk Ayarları */}
                          <div style={{ marginBottom: "24px" }}>
                            <h4 style={{ fontSize: "13px", fontWeight: 600, color: C.gold, marginBottom: "14px" }}>Renkler</h4>
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "20px" }}>
                              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                                <label style={{ fontSize: "11px", letterSpacing: "0.12em", textTransform: "uppercase", color: C.muted, fontWeight: 500 }}>Arkaplan Rengi</label>
                                <div style={{ display: "flex", gap: "10px" }}>
                                  <input type="color" value={editConfig.bgColor || "#09090b"} onChange={(e) => setEditConfig({ ...editConfig, bgColor: e.target.value })} style={{ width: "42px", height: "42px", padding: 0, border: "none", borderRadius: "8px", background: "transparent", cursor: "pointer" }} />
                                  <input value={editConfig.bgColor || ""} onChange={(e) => setEditConfig({ ...editConfig, bgColor: e.target.value })} placeholder="#09090b" style={{ flex: 1, padding: "12px", borderRadius: "10px", background: "rgba(255,255,255,0.03)", border: `1px solid ${C.border}`, color: C.text, outline: "none", fontSize: "13px" }} />
                                </div>
                              </div>
                              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                                <label style={{ fontSize: "11px", letterSpacing: "0.12em", textTransform: "uppercase", color: C.muted, fontWeight: 500 }}>Aksan Rengi</label>
                                <div style={{ display: "flex", gap: "10px" }}>
                                  <input type="color" value={editConfig.accentColor || "#C9A84C"} onChange={(e) => setEditConfig({ ...editConfig, accentColor: e.target.value })} style={{ width: "42px", height: "42px", padding: 0, border: "none", borderRadius: "8px", background: "transparent", cursor: "pointer" }} />
                                  <input value={editConfig.accentColor || ""} onChange={(e) => setEditConfig({ ...editConfig, accentColor: e.target.value })} placeholder="#C9A84C" style={{ flex: 1, padding: "12px", borderRadius: "10px", background: "rgba(255,255,255,0.03)", border: `1px solid ${C.border}`, color: C.text, outline: "none", fontSize: "13px" }} />
                                </div>
                              </div>
                              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                                <label style={{ fontSize: "11px", letterSpacing: "0.12em", textTransform: "uppercase", color: C.muted, fontWeight: 500 }}>Metin Rengi</label>
                                <div style={{ display: "flex", gap: "10px" }}>
                                  <input type="color" value={editConfig.textColor || "#ffffff"} onChange={(e) => setEditConfig({ ...editConfig, textColor: e.target.value })} style={{ width: "42px", height: "42px", padding: 0, border: "none", borderRadius: "8px", background: "transparent", cursor: "pointer" }} />
                                  <input value={editConfig.textColor || ""} onChange={(e) => setEditConfig({ ...editConfig, textColor: e.target.value })} placeholder="#ffffff" style={{ flex: 1, padding: "12px", borderRadius: "10px", background: "rgba(255,255,255,0.03)", border: `1px solid ${C.border}`, color: C.text, outline: "none", fontSize: "13px" }} />
                                </div>
                              </div>
                              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                                <label style={{ fontSize: "11px", letterSpacing: "0.12em", textTransform: "uppercase", color: C.muted, fontWeight: 500 }}>İsim Degrade Başlangıç</label>
                                <div style={{ display: "flex", gap: "10px" }}>
                                  <input type="color" value={editConfig.nameGradientStart || "#ffffff"} onChange={(e) => setEditConfig({ ...editConfig, nameGradientStart: e.target.value })} style={{ width: "42px", height: "42px", padding: 0, border: "none", borderRadius: "8px", background: "transparent", cursor: "pointer" }} />
                                  <input value={editConfig.nameGradientStart || ""} onChange={(e) => setEditConfig({ ...editConfig, nameGradientStart: e.target.value })} placeholder="#ffffff" style={{ flex: 1, padding: "12px", borderRadius: "10px", background: "rgba(255,255,255,0.03)", border: `1px solid ${C.border}`, color: C.text, outline: "none", fontSize: "13px" }} />
                                </div>
                              </div>
                              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                                <label style={{ fontSize: "11px", letterSpacing: "0.12em", textTransform: "uppercase", color: C.muted, fontWeight: 500 }}>İsim Degrade Bitiş</label>
                                <div style={{ display: "flex", gap: "10px" }}>
                                  <input type="color" value={editConfig.nameGradientEnd || editConfig.accentColor || "#C9A84C"} onChange={(e) => setEditConfig({ ...editConfig, nameGradientEnd: e.target.value })} style={{ width: "42px", height: "42px", padding: 0, border: "none", borderRadius: "8px", background: "transparent", cursor: "pointer" }} />
                                  <input value={editConfig.nameGradientEnd || ""} onChange={(e) => setEditConfig({ ...editConfig, nameGradientEnd: e.target.value })} placeholder="Aksan Rengi" style={{ flex: 1, padding: "12px", borderRadius: "10px", background: "rgba(255,255,255,0.03)", border: `1px solid ${C.border}`, color: C.text, outline: "none", fontSize: "13px" }} />
                                </div>
                              </div>
                              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                                <label style={{ fontSize: "11px", letterSpacing: "0.12em", textTransform: "uppercase", color: C.muted, fontWeight: 500 }}>Kaydır Yazısı Rengi</label>
                                <div style={{ display: "flex", gap: "10px" }}>
                                  <input type="color" value={editConfig.scrollTextColor || editConfig.accentColor || "#C9A84C"} onChange={(e) => setEditConfig({ ...editConfig, scrollTextColor: e.target.value })} style={{ width: "42px", height: "42px", padding: 0, border: "none", borderRadius: "8px", background: "transparent", cursor: "pointer" }} />
                                  <input value={editConfig.scrollTextColor || ""} onChange={(e) => setEditConfig({ ...editConfig, scrollTextColor: e.target.value })} placeholder="Aksan Rengi" style={{ flex: 1, padding: "12px", borderRadius: "10px", background: "rgba(255,255,255,0.03)", border: `1px solid ${C.border}`, color: C.text, outline: "none", fontSize: "13px" }} />
                                </div>
                              </div>
                              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                                <label style={{ fontSize: "11px", letterSpacing: "0.12em", textTransform: "uppercase", color: C.muted, fontWeight: 500 }}>'Birlikte Yazdığımız' Rengi</label>
                                <div style={{ display: "flex", gap: "10px" }}>
                                  <input type="color" value={editConfig.headingEyebrowColor || editConfig.textColor || "#ffffff"} onChange={(e) => setEditConfig({ ...editConfig, headingEyebrowColor: e.target.value })} style={{ width: "42px", height: "42px", padding: 0, border: "none", borderRadius: "8px", background: "transparent", cursor: "pointer" }} />
                                  <input value={editConfig.headingEyebrowColor || ""} onChange={(e) => setEditConfig({ ...editConfig, headingEyebrowColor: e.target.value })} placeholder="Metin Rengi" style={{ flex: 1, padding: "12px", borderRadius: "10px", background: "rgba(255,255,255,0.03)", border: `1px solid ${C.border}`, color: C.text, outline: "none", fontSize: "13px" }} />
                                </div>
                              </div>
                              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                                <label style={{ fontSize: "11px", letterSpacing: "0.12em", textTransform: "uppercase", color: C.muted, fontWeight: 500 }}>'Hikayemiz' Rengi</label>
                                <div style={{ display: "flex", gap: "10px" }}>
                                  <input type="color" value={editConfig.headingTitleColor || editConfig.textColor || "#ffffff"} onChange={(e) => setEditConfig({ ...editConfig, headingTitleColor: e.target.value })} style={{ width: "42px", height: "42px", padding: 0, border: "none", borderRadius: "8px", background: "transparent", cursor: "pointer" }} />
                                  <input value={editConfig.headingTitleColor || ""} onChange={(e) => setEditConfig({ ...editConfig, headingTitleColor: e.target.value })} placeholder="Metin Rengi" style={{ flex: 1, padding: "12px", borderRadius: "10px", background: "rgba(255,255,255,0.03)", border: `1px solid ${C.border}`, color: C.text, outline: "none", fontSize: "13px" }} />
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Arka Plan Partikülleri */}
                          <div style={{ marginBottom: "24px", borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "20px" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                              <h4 style={{ fontSize: "13px", fontWeight: 600, color: C.gold, margin: 0 }}>Arka Plan Partikülleri</h4>
                              <button type="button" onClick={() => setEditConfig({ ...editConfig, particlesEnabled: !editConfig.particlesEnabled })} style={{ padding: "6px 14px", borderRadius: "8px", border: "none", background: editConfig.particlesEnabled ? C.gold : "rgba(255,255,255,0.1)", color: editConfig.particlesEnabled ? "#0B0F1A" : C.text, fontSize: "11px", fontWeight: 600, cursor: "pointer" }}>
                                {editConfig.particlesEnabled ? "Aktif" : "Kapalı"}
                              </button>
                            </div>
                            {editConfig.particlesEnabled && (
                              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "20px" }}>
                                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                                  <label style={{ fontSize: "11px", letterSpacing: "0.12em", textTransform: "uppercase", color: C.muted, fontWeight: 500 }}>Partikül Tipi</label>
                                  <select value={editConfig.particlesType || "hearts"} onChange={(e) => setEditConfig({ ...editConfig, particlesType: e.target.value })} style={{ padding: "12px", borderRadius: "10px", background: "rgba(255,255,255,0.03)", border: `1px solid ${C.border}`, color: C.text, outline: "none", fontSize: "13px" }}>
                                    <option value="hearts">💙 Yüzen Kalpler</option>
                                    <option value="rose-petals">🌹 Gül Yaprakları</option>
                                    <option value="stars">⭐ Titreyen Yıldızlar</option>
                                    <option value="none">— Hiçbiri</option>
                                  </select>
                                </div>
                                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                                  <label style={{ fontSize: "11px", letterSpacing: "0.12em", textTransform: "uppercase", color: C.muted, fontWeight: 500 }}>Yoğunluk: {editConfig.particlesDensity || 20}</label>
                                  <input type="range" min={5} max={50} value={editConfig.particlesDensity || 20} onChange={(e) => setEditConfig({ ...editConfig, particlesDensity: Number(e.target.value) })} style={{ width: "100%", height: "40px", accentColor: C.gold }} />
                                </div>
                                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                                  <label style={{ fontSize: "11px", letterSpacing: "0.12em", textTransform: "uppercase", color: C.muted, fontWeight: 500 }}>Partikül Rengi</label>
                                  <div style={{ display: "flex", gap: "10px" }}>
                                    <input type="color" value={editConfig.particlesColor || editConfig.accentColor || "#C9A84C"} onChange={(e) => setEditConfig({ ...editConfig, particlesColor: e.target.value })} style={{ width: "42px", height: "42px", padding: 0, border: "none", borderRadius: "8px", background: "transparent", cursor: "pointer" }} />
                                    <input value={editConfig.particlesColor || ""} onChange={(e) => setEditConfig({ ...editConfig, particlesColor: e.target.value })} placeholder="Boş = Aksan Rengi" style={{ flex: 1, padding: "12px", borderRadius: "10px", background: "rgba(255,255,255,0.03)", border: `1px solid ${C.border}`, color: C.text, outline: "none", fontSize: "13px" }} />
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Müzik Widget */}
                          <div style={{ marginBottom: "24px", borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "20px" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                              <h4 style={{ fontSize: "13px", fontWeight: 600, color: C.gold, margin: 0 }}>Müzik Widget'ı</h4>
                              <button type="button" onClick={() => setEditConfig({ ...editConfig, musicWidgetEnabled: !editConfig.musicWidgetEnabled })} style={{ padding: "6px 14px", borderRadius: "8px", border: "none", background: editConfig.musicWidgetEnabled ? C.gold : "rgba(255,255,255,0.1)", color: editConfig.musicWidgetEnabled ? "#0B0F1A" : C.text, fontSize: "11px", fontWeight: 600, cursor: "pointer" }}>
                                {editConfig.musicWidgetEnabled ? "Aktif" : "Kapalı"}
                              </button>
                            </div>
                            {editConfig.musicWidgetEnabled && (
                              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "20px" }}>
                                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                                  <label style={{ fontSize: "11px", letterSpacing: "0.12em", textTransform: "uppercase", color: C.muted, fontWeight: 500 }}>Widget Tipi</label>
                                  <select value={editConfig.musicWidgetType || "vinyl"} onChange={(e) => setEditConfig({ ...editConfig, musicWidgetType: e.target.value })} style={{ padding: "12px", borderRadius: "10px", background: "rgba(255,255,255,0.03)", border: `1px solid ${C.border}`, color: C.text, outline: "none", fontSize: "13px" }}>
                                    <option value="vinyl">🎵 Plak (Vinyl)</option>
                                    <option value="minimal">📊 Minimal Bar</option>
                                    <option value="hidden">🔇 Gizli (sadece ses)</option>
                                  </select>
                                </div>
                                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                                  <label style={{ fontSize: "11px", letterSpacing: "0.12em", textTransform: "uppercase", color: C.muted, fontWeight: 500 }}>Widget Pozisyonu</label>
                                  <select value={editConfig.musicWidgetPosition || "bottom-left"} onChange={(e) => setEditConfig({ ...editConfig, musicWidgetPosition: e.target.value })} style={{ padding: "12px", borderRadius: "10px", background: "rgba(255,255,255,0.03)", border: `1px solid ${C.border}`, color: C.text, outline: "none", fontSize: "13px" }}>
                                    <option value="bottom-left">↙ Sol Alt</option>
                                    <option value="bottom-right">↘ Sağ Alt</option>
                                    <option value="top-left">↖ Sol Üst</option>
                                    <option value="top-right">↗ Sağ Üst</option>
                                  </select>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Fotoğraf Kartları */}
                          <div style={{ marginBottom: "24px", borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "20px" }}>
                            <h4 style={{ fontSize: "13px", fontWeight: 600, color: C.gold, marginBottom: "14px" }}>Fotoğraf Kartları</h4>
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "20px" }}>
                              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                                <label style={{ fontSize: "11px", letterSpacing: "0.12em", textTransform: "uppercase", color: C.muted, fontWeight: 500 }}>Kart Stili</label>
                                <select value={editConfig.memoryCardStyle || "plain"} onChange={(e) => setEditConfig({ ...editConfig, memoryCardStyle: e.target.value })} style={{ padding: "12px", borderRadius: "10px", background: "rgba(255,255,255,0.03)", border: `1px solid ${C.border}`, color: C.text, outline: "none", fontSize: "13px" }}>
                                  <option value="plain">⬜ Düz / Minimal</option>
                                  <option value="polaroid">📷 Polaroid</option>
                                  <option value="cinematic">🎬 Sinematik</option>
                                </select>
                              </div>
                              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                                <label style={{ fontSize: "11px", letterSpacing: "0.12em", textTransform: "uppercase", color: C.muted, fontWeight: 500 }}>Listeleme Düzeni</label>
                                <select value={editConfig.memoryCardLayout || "vertical"} onChange={(e) => setEditConfig({ ...editConfig, memoryCardLayout: e.target.value })} style={{ padding: "12px", borderRadius: "10px", background: "rgba(255,255,255,0.03)", border: `1px solid ${C.border}`, color: C.text, outline: "none", fontSize: "13px" }}>
                                  <option value="vertical">☰ Dikey (tek sütun)</option>
                                  <option value="grid">⊞ Grid (2 sütun)</option>
                                </select>
                              </div>
                              {editConfig.memoryCardStyle === "polaroid" && (
                                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                                  <label style={{ fontSize: "11px", letterSpacing: "0.12em", textTransform: "uppercase", color: C.muted, fontWeight: 500 }}>Polaroid Eğim Efekti</label>
                                  <button type="button" onClick={() => setEditConfig({ ...editConfig, polaroidTilt: !editConfig.polaroidTilt })} style={{ padding: "12px", borderRadius: "10px", border: "none", background: editConfig.polaroidTilt !== false ? C.gold : "rgba(255,255,255,0.1)", color: editConfig.polaroidTilt !== false ? "#0B0F1A" : C.text, fontSize: "13px", fontWeight: 600, cursor: "pointer" }}>
                                    {editConfig.polaroidTilt !== false ? "Eğik Polaroid Aktif" : "Düz Polaroid"}
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Tipografi */}
                          <div style={{ marginBottom: "24px", borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "20px" }}>
                            <h4 style={{ fontSize: "13px", fontWeight: 600, color: C.gold, marginBottom: "14px" }}>Tipografi</h4>
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "20px" }}>
                              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                                <label style={{ fontSize: "11px", letterSpacing: "0.12em", textTransform: "uppercase", color: C.muted, fontWeight: 500 }}>Başlık Fontu</label>
                                <select value={editConfig.headingFont || "cormorant"} onChange={(e) => setEditConfig({ ...editConfig, headingFont: e.target.value })} style={{ padding: "12px", borderRadius: "10px", background: "rgba(255,255,255,0.03)", border: `1px solid ${C.border}`, color: C.text, outline: "none", fontSize: "13px" }}>
                                  <option value="cormorant">Cormorant Garamond (Zarif Serif)</option>
                                  <option value="playfair">Playfair Display (Klasik)</option>
                                  <option value="cinzel">Cinzel (Antik / Roma)</option>
                                  <option value="pinyon">Pinyon Script (El Yazısı)</option>
                                  <option value="vt323">VT323 (Piksel Arcade)</option>
                                  <option value="press-start">Press Start 2P (Retro Retro)</option>
                                </select>
                              </div>
                              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                                <label style={{ fontSize: "11px", letterSpacing: "0.12em", textTransform: "uppercase", color: C.muted, fontWeight: 500 }}>Metin Fontu</label>
                                <select value={editConfig.bodyFont || "inter"} onChange={(e) => setEditConfig({ ...editConfig, bodyFont: e.target.value })} style={{ padding: "12px", borderRadius: "10px", background: "rgba(255,255,255,0.03)", border: `1px solid ${C.border}`, color: C.text, outline: "none", fontSize: "13px" }}>
                                  <option value="inter">Inter (Modern Sans-Serif)</option>
                                  <option value="lato">Lato (Dengeli)</option>
                                  <option value="dm-sans">DM Sans (Sade)</option>
                                  <option value="vt323">VT323 (Piksel Arcade)</option>
                                  <option value="press-start">Press Start 2P (Retro Retro)</option>
                                </select>
                              </div>
                            </div>
                          </div>

                          {/* Final Bölümü */}
                          <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "20px" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                              <h4 style={{ fontSize: "13px", fontWeight: 600, color: C.gold, margin: 0 }}>Final Bölümü</h4>
                              <button type="button" onClick={() => setEditConfig({ ...editConfig, finalEnabled: !editConfig.finalEnabled })} style={{ padding: "6px 14px", borderRadius: "8px", border: "none", background: editConfig.finalEnabled !== false ? C.gold : "rgba(255,255,255,0.1)", color: editConfig.finalEnabled !== false ? "#0B0F1A" : C.text, fontSize: "11px", fontWeight: 600, cursor: "pointer" }}>
                                {editConfig.finalEnabled !== false ? "Gösteriliyor" : "Gizli"}
                              </button>
                            </div>
                            {editConfig.finalEnabled !== false && (
                              <div style={{ display: "grid", gridTemplateColumns: "1fr 240px", gap: "20px", marginTop: "12px" }}>
                                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                                  <label style={{ fontSize: "11px", letterSpacing: "0.12em", textTransform: "uppercase", color: C.muted, fontWeight: 500 }}>Final Başlığı</label>
                                  <input value={editConfig.finalHeading || ""} onChange={(e) => setEditConfig({ ...editConfig, finalHeading: e.target.value })} placeholder="Sonsuza Dek Birlikte" style={{ padding: "12px", borderRadius: "10px", background: "rgba(255,255,255,0.03)", border: `1px solid ${C.border}`, color: C.text, outline: "none", fontSize: "13px" }} />
                                </div>
                                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                                  <label style={{ fontSize: "11px", letterSpacing: "0.12em", textTransform: "uppercase", color: C.muted, fontWeight: 500 }}>Final Başlığı Rengi</label>
                                  <div style={{ display: "flex", gap: "10px" }}>
                                    <input type="color" value={editConfig.finalHeadingColor || "#FFFFFF"} onChange={(e) => setEditConfig({ ...editConfig, finalHeadingColor: e.target.value })} style={{ width: "42px", height: "42px", padding: 0, border: "none", borderRadius: "8px", background: "transparent", cursor: "pointer" }} />
                                    <input value={editConfig.finalHeadingColor || ""} onChange={(e) => setEditConfig({ ...editConfig, finalHeadingColor: e.target.value })} placeholder="Varsayılan (Beyaz)" style={{ flex: 1, padding: "12px", borderRadius: "10px", background: "rgba(255,255,255,0.03)", border: `1px solid ${C.border}`, color: C.text, outline: "none", fontSize: "13px" }} />
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Şablon Kartı Ayarları (Sadece Şablonlar ve Özel Şablonlar için) */}
                        {(SHOWCASE_SLUGS.includes(selectedEditSlug) || (editTemplateId && editTemplateId.startsWith("custom-"))) && (
                          <div style={{ ...cardStyle, padding: "28px", display: "flex", flexDirection: "column", gap: "20px", marginBottom: "20px" }}>
                            <h3 style={{ fontSize: "16px", fontWeight: 600, color: C.gold, borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: "10px", margin: 0 }}>
                              🎴 Şablon Vitrin Kartı Ayarları
                            </h3>
                            <p style={{ fontSize: "12px", color: C.muted, margin: 0, lineHeight: 1.5 }}>
                              Bu bölümdeki ayarlar sadece <code>/sablonlar</code> vitrin sayfasındaki kartta görünecek başlık, açıklama ve özellikleri belirler. Sayfanın kendi içeriğini etkilemez.
                            </p>

                            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                              <label style={{ fontSize: "11px", letterSpacing: "0.12em", textTransform: "uppercase", color: C.muted, fontWeight: 500 }}>Kart Başlığı (Şablon Adı)</label>
                              <input
                                value={editConfig.showcaseTitle || ""}
                                onChange={(e) => setEditConfig({ ...editConfig, showcaseTitle: e.target.value })}
                                placeholder="Boş bırakılırsa varsayılan şablon adı gösterilir"
                                style={{ padding: "12px", borderRadius: "10px", background: "rgba(255,255,255,0.03)", border: `1px solid ${C.border}`, color: C.text, outline: "none", fontSize: "13px" }}
                              />
                            </div>

                            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                              <label style={{ fontSize: "11px", letterSpacing: "0.12em", textTransform: "uppercase", color: C.muted, fontWeight: 500 }}>Kart Alt Başlığı (Özel Tarih / Etiket)</label>
                              <input
                                value={editConfig.showcaseSubtitle || ""}
                                onChange={(e) => setEditConfig({ ...editConfig, showcaseSubtitle: e.target.value })}
                                placeholder="Örn: 14 ŞUBAT 2025 veya Özel Tasarım (Boşsa Yıldönümü Tarihinden alır)"
                                style={{ padding: "12px", borderRadius: "10px", background: "rgba(255,255,255,0.03)", border: `1px solid ${C.border}`, color: C.text, outline: "none", fontSize: "13px" }}
                              />
                            </div>

                            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                              <label style={{ fontSize: "11px", letterSpacing: "0.12em", textTransform: "uppercase", color: C.muted, fontWeight: 500 }}>Kart Etiketi (Sol Üst Köşe)</label>
                              <input
                                value={editConfig.showcaseTag === undefined ? "" : editConfig.showcaseTag}
                                onChange={(e) => setEditConfig({ ...editConfig, showcaseTag: e.target.value })}
                                placeholder="Boş bırakılırsa 'VİTRİN' gösterilir (Gizlemek için tek boşluk bırakabilirsiniz)"
                                style={{ padding: "12px", borderRadius: "10px", background: "rgba(255,255,255,0.03)", border: `1px solid ${C.border}`, color: C.text, outline: "none", fontSize: "13px" }}
                              />
                            </div>

                            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                              <label style={{ fontSize: "11px", letterSpacing: "0.12em", textTransform: "uppercase", color: C.muted, fontWeight: 500 }}>Kart Renk Teması (Vurgu Rengi)</label>
                              <div style={{ display: "flex", gap: "10px" }}>
                                <input
                                  type="color"
                                  value={editConfig.showcaseAccentColor || "#C9A84C"}
                                  onChange={(e) => setEditConfig({ ...editConfig, showcaseAccentColor: e.target.value })}
                                  style={{ width: "42px", height: "42px", padding: 0, border: "none", borderRadius: "8px", background: "transparent", cursor: "pointer" }}
                                />
                                <input
                                  value={editConfig.showcaseAccentColor || ""}
                                  onChange={(e) => setEditConfig({ ...editConfig, showcaseAccentColor: e.target.value })}
                                  placeholder="Varsayılan: Altın Sarısı (#C9A84C) veya Şablon Rengi"
                                  style={{ flex: 1, padding: "12px", borderRadius: "10px", background: "rgba(255,255,255,0.03)", border: `1px solid ${C.border}`, color: C.text, outline: "none", fontSize: "13px" }}
                                />
                              </div>
                            </div>

                            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                              <label style={{ fontSize: "11px", letterSpacing: "0.12em", textTransform: "uppercase", color: C.muted, fontWeight: 500 }}>Kart Açıklaması</label>
                              <textarea
                                value={editConfig.showcaseDescription || ""}
                                onChange={(e) => setEditConfig({ ...editConfig, showcaseDescription: e.target.value })}
                                placeholder="Kart üzerinde görünecek kısa açıklama metni"
                                rows={2}
                                style={{ padding: "12px", borderRadius: "10px", background: "rgba(255,255,255,0.03)", border: `1px solid ${C.border}`, color: C.text, outline: "none", fontSize: "13px", resize: "vertical" }}
                              />
                            </div>

                            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                              <label style={{ fontSize: "11px", letterSpacing: "0.12em", textTransform: "uppercase", color: C.muted, fontWeight: 500 }}>Kart Özellik Maddeleri (Tikler)</label>
                              
                              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                                {(editConfig.showcaseFeatures || []).map((feat: string, fIdx: number) => (
                                  <div key={fIdx} style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                                    <span style={{ color: C.gold, fontSize: "12px", fontWeight: "bold" }}>✓</span>
                                    <input
                                      value={feat}
                                      onChange={(e) => {
                                        const updatedFeats = [...(editConfig.showcaseFeatures || [])];
                                        updatedFeats[fIdx] = e.target.value;
                                        setEditConfig({ ...editConfig, showcaseFeatures: updatedFeats });
                                      }}
                                      placeholder="Özellik maddesi girin"
                                      style={{ flex: 1, padding: "8px 12px", borderRadius: "8px", background: "rgba(255,255,255,0.02)", border: `1px solid ${C.border}`, color: C.text, outline: "none", fontSize: "13px" }}
                                    />
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const updatedFeats = (editConfig.showcaseFeatures || []).filter((_: any, idx: number) => idx !== fIdx);
                                        setEditConfig({ ...editConfig, showcaseFeatures: updatedFeats });
                                      }}
                                      style={{ padding: "8px 12px", borderRadius: "8px", border: "1px solid rgba(232,160,160,0.15)", background: "rgba(232,160,160,0.05)", color: C.error, cursor: "pointer", fontSize: "12px" }}
                                    >
                                      Sil
                                    </button>
                                  </div>
                                ))}

                                <button
                                  type="button"
                                  onClick={() => {
                                    const currentFeats = editConfig.showcaseFeatures || [];
                                    setEditConfig({ ...editConfig, showcaseFeatures: [...currentFeats, ""] });
                                  }}
                                  style={{
                                    alignSelf: "flex-start", padding: "6px 12px", borderRadius: "8px",
                                    border: `1px solid ${C.gold}44`, background: "rgba(201,168,76,0.05)",
                                    color: C.gold, fontSize: "12px", fontWeight: 500, cursor: "pointer",
                                    transition: "all 0.2s"
                                  }}
                                  onMouseEnter={(e) => e.currentTarget.style.background = "rgba(201,168,76,0.12)"}
                                  onMouseLeave={(e) => e.currentTarget.style.background = "rgba(201,168,76,0.05)"}
                                >
                                  + Yeni Madde Ekle
                                </button>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* 2. Kısım: Hikayeler / Anılar Listesi */}
                        <div style={{ ...cardStyle, padding: "28px" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: "10px" }}>
                            <h3 style={{ fontSize: "16px", fontWeight: 600, color: C.text }}>
                              Hikayelerimiz & Anılar
                            </h3>
                            <div style={{ display: "flex", gap: "8px", alignItems: "center", position: "relative" }}>
                              {SHOWCASE_SLUGS.includes(selectedEditSlug) && (
                                <button
                                  type="button"
                                  onClick={() => setShowIntegrateModal(true)}
                                  style={{
                                    padding: "6px 14px", borderRadius: "8px",
                                    border: `1px solid rgba(255,255,255,0.15)`, background: "rgba(255,255,255,0.04)",
                                    color: C.text, fontSize: "12px", fontWeight: 500, cursor: "pointer",
                                    transition: "all 0.2s", marginRight: "4px"
                                  }}
                                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = C.gold; e.currentTarget.style.color = C.gold; }}
                                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)"; e.currentTarget.style.color = C.text; }}
                                >
                                  🔗 Diğer Şablonlara Entegre Et
                                </button>
                              )}
                              {/* + Yeni Bileşen Ekle */}
                              <button
                                type="button"
                                onClick={() => setShowComponentPicker((v) => !v)}
                                style={{
                                  padding: "6px 14px", borderRadius: "8px",
                                  border: `1px solid ${C.gold}55`, background: "rgba(201,168,76,0.08)",
                                  color: C.gold, fontSize: "12px", fontWeight: 600, cursor: "pointer",
                                  transition: "all 0.2s",
                                }}
                                onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(201,168,76,0.16)"; }}
                                onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(201,168,76,0.08)"; }}
                              >
                                + Yeni Bileşen Ekle
                              </button>

                              {/* Component Picker Dropdown */}
                              {showComponentPicker && (
                                <div
                                  style={{
                                    position: "absolute", top: "calc(100% + 8px)", right: 0, zIndex: 50,
                                    background: "#160408", border: `1px solid ${C.border}`,
                                    borderRadius: "12px", padding: "12px", width: "260px",
                                    boxShadow: "0 16px 48px rgba(0,0,0,0.7)",
                                    display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px",
                                  }}
                                >
                                  {[
                                    { type: "countdown", icon: "⏱", label: "Zaman Sayıcı", desc: "Gün • Saat • Dakika" },
                                    { type: "quiz",      icon: "❓", label: "Anket / Oyun",  desc: "Soru & Cevaplar" },
                                    { type: "letter",   icon: "✉️", label: "Mektup Efekti", desc: "Dijital Zarf" },
                                  ].map(({ type, icon, label, desc }) => (
                                    <button
                                      key={type}
                                      type="button"
                                      onClick={() => {
                                        const newId = editMemories.length > 0 ? Math.max(...editMemories.map((m) => m.id || 0)) + 1 : 1;
                                        const defaults: Record<string, any> = {
                                          countdown: { type: "countdown", id: newId, label: "Tanıştığımızdan Beri", startDate: "", description: "" },
                                          quiz:      { type: "quiz",      id: newId, question: "Benimle ilgili en sevdiğin şey ne?", options: ["Gülüşüm", "Sabırsızlığım", "Sarılmalarım"] },
                                          letter:    { type: "letter",   id: newId, title: "Sevgilime", senderName: "Senden", content: "Seni çok seviyorum..." },
                                        };
                                        setEditMemories([...editMemories, defaults[type]]);
                                        setShowComponentPicker(false);
                                      }}
                                      style={{
                                        padding: "12px 10px", borderRadius: "8px",
                                        border: `1px solid ${C.border}`, background: "rgba(255,255,255,0.03)",
                                        color: C.text, cursor: "pointer", textAlign: "center",
                                        transition: "all 0.15s", display: "flex", flexDirection: "column", gap: "4px",
                                      }}
                                      onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(201,168,76,0.08)"; e.currentTarget.style.borderColor = `${C.gold}44`; }}
                                      onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.03)"; e.currentTarget.style.borderColor = C.border; }}
                                    >
                                      <span style={{ fontSize: "20px" }}>{icon}</span>
                                      <span style={{ fontSize: "11px", fontWeight: 600, color: C.text }}>{label}</span>
                                      <span style={{ fontSize: "10px", color: C.muted }}>{desc}</span>
                                    </button>
                                  ))}
                                </div>
                              )}

                              {/* + Yeni Anı Ekle */}
                              <button
                                type="button"
                                onClick={() => {
                                  const newId = editMemories.length > 0 ? Math.max(...editMemories.map((m) => m.id || 0)) + 1 : 1;
                                  setEditMemories([...editMemories, { type: "photo", id: newId, image: "/moment.jpg", title: "Yeni Anı Başlığı", description: "Bu anıya dair açıklama...", date: "Tarih Girin", titleColor: "", descriptionColor: "", dateColor: "" }]);
                                  setShowComponentPicker(false);
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
                          </div>

                          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                            {editMemories.map((memory, index) => {
                              const memType: string = memory.type ?? "photo";
                              const isFirst = index === 0;
                              const isLast  = index === editMemories.length - 1;

                              // Shared up/down/delete footer
                              const MoveDeleteControls = (
                                <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "12px" }}>
                                  <button type="button" disabled={isFirst}
                                    onClick={() => setEditMemories((prev) => { const u = [...prev]; const item = u.splice(index, 1)[0]; u.unshift(item); return u; })}
                                    style={{ padding: "4px 8px", borderRadius: "6px", border: `1px solid ${C.border}`, background: "rgba(255,255,255,0.03)", color: isFirst ? "rgba(255,255,255,0.1)" : C.muted, fontSize: "11px", cursor: isFirst ? "not-allowed" : "pointer" }}
                                    title="En Üste Taşı"
                                  >⇈ En Üste</button>
                                  <button type="button" disabled={isFirst}
                                    onClick={() => setEditMemories((prev) => { const u = [...prev]; [u[index], u[index-1]] = [u[index-1], u[index]]; return u; })}
                                    style={{ padding: "4px 8px", borderRadius: "6px", border: `1px solid ${C.border}`, background: "rgba(255,255,255,0.03)", color: isFirst ? "rgba(255,255,255,0.1)" : C.muted, fontSize: "11px", cursor: isFirst ? "not-allowed" : "pointer" }}
                                  >↑ Yukarı</button>
                                  <button type="button" disabled={isLast}
                                    onClick={() => setEditMemories((prev) => { const u = [...prev]; [u[index], u[index+1]] = [u[index+1], u[index]]; return u; })}
                                    style={{ padding: "4px 8px", borderRadius: "6px", border: `1px solid ${C.border}`, background: "rgba(255,255,255,0.03)", color: isLast ? "rgba(255,255,255,0.1)" : C.muted, fontSize: "11px", cursor: isLast ? "not-allowed" : "pointer" }}
                                  >↓ Aşağı</button>
                                  <button type="button" disabled={isLast}
                                    onClick={() => setEditMemories((prev) => { const u = [...prev]; const item = u.splice(index, 1)[0]; u.push(item); return u; })}
                                    style={{ padding: "4px 8px", borderRadius: "6px", border: `1px solid ${C.border}`, background: "rgba(255,255,255,0.03)", color: isLast ? "rgba(255,255,255,0.1)" : C.muted, fontSize: "11px", cursor: isLast ? "not-allowed" : "pointer" }}
                                    title="En Alta Taşı"
                                  >⇊ En Alta</button>
                                  <button type="button"
                                    onClick={() => { if (confirm("Bu öğeyi silmek istediğinize emin misiniz?")) setEditMemories(editMemories.filter((_, idx) => idx !== index)); }}
                                    style={{ padding: "4px 10px", borderRadius: "6px", border: "1px solid rgba(232,160,160,0.2)", background: "rgba(232,160,160,0.05)", color: C.error, fontSize: "11px", cursor: "pointer" }}
                                  >Sil</button>
                                </div>
                              );

                              // ── COUNTDOWN editörü ──
                              if (memType === "countdown") return (
                                <div key={memory.id} style={{ padding: "20px", borderRadius: "12px", background: "rgba(255,255,255,0.015)", border: "1px solid rgba(255,255,255,0.04)" }}>
                                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px" }}>
                                    <span style={{ fontSize: "16px" }}>⏱</span>
                                    <span style={{ fontSize: "13px", fontWeight: 600, color: C.text }}>Zaman Sayıcı</span>
                                  </div>
                                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                                    <div>
                                      <label style={{ fontSize: "11px", color: C.muted, display: "block", marginBottom: "4px" }}>Etiket ("Tanıştığımızdan Beri" gibi)</label>
                                      <input
                                        type="text"
                                        value={memory.label ?? ""}
                                        onChange={(e) => setEditMemories((prev) => { const u = [...prev]; u[index] = { ...u[index], label: e.target.value }; return u; })}
                                        style={{ width: "100%", padding: "8px 12px", background: "rgba(255,255,255,0.04)", border: `1px solid ${C.border}`, borderRadius: "8px", color: C.text, fontSize: "13px", outline: "none", boxSizing: "border-box" }}
                                        placeholder="Tanıştığımızdan Beri"
                                      />
                                    </div>
                                    <div>
                                      <label style={{ fontSize: "11px", color: C.muted, display: "block", marginBottom: "4px" }}>Başlangıç Tarihi & Saati</label>
                                      <input
                                        type="datetime-local"
                                        value={memory.startDate ?? ""}
                                        onChange={(e) => setEditMemories((prev) => { const u = [...prev]; u[index] = { ...u[index], startDate: e.target.value }; return u; })}
                                        style={{ width: "100%", padding: "8px 12px", background: "rgba(255,255,255,0.04)", border: `1px solid ${C.border}`, borderRadius: "8px", color: C.text, fontSize: "13px", outline: "none", colorScheme: "dark", boxSizing: "border-box" }}
                                      />
                                    </div>
                                    <div>
                                      <label style={{ fontSize: "11px", color: C.muted, display: "block", marginBottom: "4px" }}>Alt Açıklama (isteğe bağlı)</label>
                                      <input
                                        type="text"
                                        value={memory.description ?? ""}
                                        onChange={(e) => setEditMemories((prev) => { const u = [...prev]; u[index] = { ...u[index], description: e.target.value }; return u; })}
                                        style={{ width: "100%", padding: "8px 12px", background: "rgba(255,255,255,0.04)", border: `1px solid ${C.border}`, borderRadius: "8px", color: C.text, fontSize: "13px", outline: "none", boxSizing: "border-box" }}
                                        placeholder="Günden bu yana birlikte..."
                                      />
                                    </div>
                                  </div>
                                  {MoveDeleteControls}
                                </div>
                              );

                              // ── QUIZ editörü ──
                              if (memType === "quiz") return (
                                <div key={memory.id} style={{ padding: "20px", borderRadius: "12px", background: "rgba(255,255,255,0.015)", border: "1px solid rgba(255,255,255,0.04)" }}>
                                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px" }}>
                                    <span style={{ fontSize: "16px" }}>❓</span>
                                    <span style={{ fontSize: "13px", fontWeight: 600, color: C.text }}>Anket / Oyun</span>
                                  </div>
                                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                                    <div>
                                      <label style={{ fontSize: "11px", color: C.muted, display: "block", marginBottom: "4px" }}>Soru</label>
                                      <input
                                        type="text"
                                        value={memory.question ?? ""}
                                        onChange={(e) => setEditMemories((prev) => { const u = [...prev]; u[index] = { ...u[index], question: e.target.value }; return u; })}
                                        style={{ width: "100%", padding: "8px 12px", background: "rgba(255,255,255,0.04)", border: `1px solid ${C.border}`, borderRadius: "8px", color: C.text, fontSize: "13px", outline: "none", boxSizing: "border-box" }}
                                        placeholder="Benimle ilgili en sevdiğin şey ne?"
                                      />
                                    </div>
                                    <div>
                                      <label style={{ fontSize: "11px", color: C.muted, display: "block", marginBottom: "4px" }}>
                                        Seçenekler
                                        <button type="button"
                                          onClick={() => setEditMemories((prev) => { const u = [...prev]; u[index] = { ...u[index], options: [...(u[index].options ?? []), ""] }; return u; })}
                                          style={{ marginLeft: "8px", fontSize: "10px", padding: "2px 8px", borderRadius: "4px", border: `1px solid ${C.border}`, background: "rgba(255,255,255,0.04)", color: C.gold, cursor: "pointer" }}
                                        >+ Ekle</button>
                                      </label>
                                      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                                        {(memory.options ?? []).map((opt: string, oi: number) => (
                                          <div key={oi} style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                                            <span style={{ fontSize: "11px", color: C.muted, minWidth: "18px" }}>{String.fromCharCode(65 + oi)}.</span>
                                            <input
                                              type="text"
                                              value={opt}
                                              onChange={(e) => setEditMemories((prev) => {
                                                const u = [...prev]; const opts = [...(u[index].options ?? [])]; opts[oi] = e.target.value;
                                                u[index] = { ...u[index], options: opts }; return u;
                                              })}
                                              style={{ flex: 1, padding: "6px 10px", background: "rgba(255,255,255,0.04)", border: `1px solid ${C.border}`, borderRadius: "6px", color: C.text, fontSize: "12px", outline: "none" }}
                                              placeholder={`Seçenek ${String.fromCharCode(65 + oi)}`}
                                            />
                                            <button type="button"
                                              onClick={() => setEditMemories((prev) => {
                                                const u = [...prev]; const opts = (u[index].options ?? []).filter((_: string, i2: number) => i2 !== oi);
                                                u[index] = { ...u[index], options: opts }; return u;
                                              })}
                                              style={{ padding: "4px 8px", borderRadius: "4px", border: "1px solid rgba(232,160,160,0.2)", background: "none", color: C.error, cursor: "pointer", fontSize: "11px" }}
                                            >×</button>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                  {MoveDeleteControls}
                                </div>
                              );

                              // ── LETTER editörü ──
                              if (memType === "letter") return (
                                <div key={memory.id} style={{ padding: "20px", borderRadius: "12px", background: "rgba(255,255,255,0.015)", border: "1px solid rgba(255,255,255,0.04)" }}>
                                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px" }}>
                                    <span style={{ fontSize: "16px" }}>✉️</span>
                                    <span style={{ fontSize: "13px", fontWeight: 600, color: C.text }}>Mektup Efekti</span>
                                  </div>
                                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                                    <div>
                                      <label style={{ fontSize: "11px", color: C.muted, display: "block", marginBottom: "4px" }}>Mektup Başlığı</label>
                                      <input
                                        type="text"
                                        value={memory.title ?? ""}
                                        onChange={(e) => setEditMemories((prev) => { const u = [...prev]; u[index] = { ...u[index], title: e.target.value }; return u; })}
                                        style={{ width: "100%", padding: "8px 12px", background: "rgba(255,255,255,0.04)", border: `1px solid ${C.border}`, borderRadius: "8px", color: C.text, fontSize: "13px", outline: "none", boxSizing: "border-box" }}
                                        placeholder="Sevgilime"
                                      />
                                    </div>
                                    <div>
                                      <label style={{ fontSize: "11px", color: C.muted, display: "block", marginBottom: "4px" }}>Gönderen Adı</label>
                                      <input
                                        type="text"
                                        value={memory.senderName ?? ""}
                                        onChange={(e) => setEditMemories((prev) => { const u = [...prev]; u[index] = { ...u[index], senderName: e.target.value }; return u; })}
                                        style={{ width: "100%", padding: "8px 12px", background: "rgba(255,255,255,0.04)", border: `1px solid ${C.border}`, borderRadius: "8px", color: C.text, fontSize: "13px", outline: "none", boxSizing: "border-box" }}
                                        placeholder="Ayşe'den"
                                      />
                                    </div>
                                    <div>
                                      <label style={{ fontSize: "11px", color: C.muted, display: "block", marginBottom: "4px" }}>Mektup İçeriği</label>
                                      <textarea
                                        value={memory.content ?? ""}
                                        onChange={(e) => setEditMemories((prev) => { const u = [...prev]; u[index] = { ...u[index], content: e.target.value }; return u; })}
                                        rows={5}
                                        style={{ width: "100%", padding: "8px 12px", background: "rgba(255,255,255,0.04)", border: `1px solid ${C.border}`, borderRadius: "8px", color: C.text, fontSize: "13px", outline: "none", resize: "vertical", boxSizing: "border-box", lineHeight: 1.6 }}
                                        placeholder="Seni çok seviyorum..."
                                      />
                                    </div>
                                  </div>
                                  {MoveDeleteControls}
                                </div>
                              );

                              // ── PHOTO editörü (varsayılan) ──
                              return (
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

                                  {/* Anı Renk Özelleştirmeleri */}
                                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: "10px", marginTop: "8px", borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "12px", paddingBottom: "4px" }}>
                                    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                                      <label style={{ fontSize: "9px", textTransform: "uppercase", color: C.muted }}>Başlık Rengi</label>
                                      <div style={{ display: "flex", gap: "6px" }}>
                                        <input type="color" value={memory.titleColor || editConfig.textColor || "#ffffff"} onChange={(e) => {
                                          const val = e.target.value;
                                          setEditMemories((prev) => { const u = [...prev]; u[index] = { ...u[index], titleColor: val }; return u; });
                                        }} style={{ width: "28px", height: "28px", padding: 0, border: "none", borderRadius: "4px", background: "transparent", cursor: "pointer" }} />
                                        <input value={memory.titleColor || ""} onChange={(e) => {
                                          const val = e.target.value;
                                          setEditMemories((prev) => { const u = [...prev]; u[index] = { ...u[index], titleColor: val }; return u; });
                                        }} placeholder="Metin Rengi" style={{ flex: 1, padding: "4px 8px", borderRadius: "6px", background: "rgba(255,255,255,0.03)", border: `1px solid ${C.border}`, color: C.text, fontSize: "11px", outline: "none" }} />
                                      </div>
                                    </div>
                                    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                                      <label style={{ fontSize: "9px", textTransform: "uppercase", color: C.muted }}>Açıklama Rengi</label>
                                      <div style={{ display: "flex", gap: "6px" }}>
                                        <input type="color" value={memory.descriptionColor || editConfig.textColor || "#ffffff"} onChange={(e) => {
                                          const val = e.target.value;
                                          setEditMemories((prev) => { const u = [...prev]; u[index] = { ...u[index], descriptionColor: val }; return u; });
                                        }} style={{ width: "28px", height: "28px", padding: 0, border: "none", borderRadius: "4px", background: "transparent", cursor: "pointer" }} />
                                        <input value={memory.descriptionColor || ""} onChange={(e) => {
                                          const val = e.target.value;
                                          setEditMemories((prev) => { const u = [...prev]; u[index] = { ...u[index], descriptionColor: val }; return u; });
                                        }} placeholder="Metin Rengi" style={{ flex: 1, padding: "4px 8px", borderRadius: "6px", background: "rgba(255,255,255,0.03)", border: `1px solid ${C.border}`, color: C.text, fontSize: "11px", outline: "none" }} />
                                      </div>
                                    </div>
                                    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                                      <label style={{ fontSize: "9px", textTransform: "uppercase", color: C.muted }}>Tarih Rengi</label>
                                      <div style={{ display: "flex", gap: "6px" }}>
                                        <input type="color" value={memory.dateColor || editConfig.textColor || "#ffffff"} onChange={(e) => {
                                          const val = e.target.value;
                                          setEditMemories((prev) => { const u = [...prev]; u[index] = { ...u[index], dateColor: val }; return u; });
                                        }} style={{ width: "28px", height: "28px", padding: 0, border: "none", borderRadius: "4px", background: "transparent", cursor: "pointer" }} />
                                        <input value={memory.dateColor || ""} onChange={(e) => {
                                          const val = e.target.value;
                                          setEditMemories((prev) => { const u = [...prev]; u[index] = { ...u[index], dateColor: val }; return u; });
                                        }} placeholder="Metin Rengi" style={{ flex: 1, padding: "4px 8px", borderRadius: "6px", background: "rgba(255,255,255,0.03)", border: `1px solid ${C.border}`, color: C.text, fontSize: "11px", outline: "none" }} />
                                      </div>
                                    </div>
                                  </div>

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
                                      {/* En Üste Taşı */}
                                      <button
                                        type="button"
                                        disabled={index === 0}
                                        onClick={() => {
                                          if (index === 0) return;
                                          setEditMemories((prev) => {
                                            const updated = [...prev];
                                            const item = updated.splice(index, 1)[0];
                                            updated.unshift(item);
                                            return updated;
                                          });
                                        }}
                                        style={{
                                          padding: "4px 8px", borderRadius: "6px", border: `1px solid ${C.border}`,
                                          background: "rgba(255,255,255,0.03)", color: index === 0 ? "rgba(255,255,255,0.1)" : C.muted,
                                          fontSize: "11px", cursor: index === 0 ? "not-allowed" : "pointer"
                                        }}
                                        title="En Üste Taşı"
                                      >
                                        ⇈ En Üste
                                      </button>
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
                                      {/* En Alta Taşı */}
                                      <button
                                        type="button"
                                        disabled={index === editMemories.length - 1}
                                        onClick={() => {
                                          if (index === editMemories.length - 1) return;
                                          setEditMemories((prev) => {
                                            const updated = [...prev];
                                            const item = updated.splice(index, 1)[0];
                                            updated.push(item);
                                            return updated;
                                          });
                                        }}
                                        style={{
                                          padding: "4px 8px", borderRadius: "6px", border: `1px solid ${C.border}`,
                                          background: "rgba(255,255,255,0.03)", color: index === editMemories.length - 1 ? "rgba(255,255,255,0.1)" : C.muted,
                                          fontSize: "11px", cursor: index === editMemories.length - 1 ? "not-allowed" : "pointer"
                                        }}
                                        title="En Alta Taşı"
                                      >
                                        ⇊ En Alta
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
                                        }}
                                      >
                                        Sil
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              );})}

                          </div>
                        </div>

                        {/* 3. Kısım: Şablon Olarak Kaydet */}
                        <div style={{ ...cardStyle, padding: "28px" }}>
                          <h3 style={{ fontSize: "16px", fontWeight: 600, color: C.text, marginBottom: "12px", borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: "10px", fontFamily: "'Cormorant Garamond', 'Cormorant Garamond Fallback', serif" }}>
                            💾 Bu Sayfanın Tasarımını Şablon Olarak Kaydet
                          </h3>
                          <p style={{ fontSize: "13px", color: C.muted, marginBottom: "20px" }}>
                            Bu sayfa için yaptığınız tasarım ayarlarını (renkler, fontlar, partiküller vb.) yeni bir şablon olarak kaydederek diğer müşterilerinizde de kullanabilirsiniz.
                          </p>

                          <div style={{ display: "flex", gap: "12px", alignItems: "flex-end", flexWrap: "wrap" }}>
                            <div style={{ flex: 1, minWidth: "240px", display: "flex", flexDirection: "column", gap: "6px" }}>
                              <label style={{ fontSize: "11px", letterSpacing: "0.12em", textTransform: "uppercase", color: C.muted, fontWeight: 500 }}>Şablon Adı</label>
                              <input
                                value={saveTemplateName}
                                onChange={(e) => setSaveTemplateName(e.target.value)}
                                placeholder="Örn: Benim Özel Pembem, Gece Yıldızları..."
                                style={{
                                  padding: "12px", borderRadius: "10px", background: "rgba(255,255,255,0.03)",
                                  border: `1px solid ${C.border}`, color: C.text, outline: "none", fontSize: "13px"
                                }}
                              />
                            </div>
                            <button
                              type="button"
                              disabled={templateSaving}
                              onClick={handleSaveCustomTemplate}
                              style={{
                                padding: "14px 28px", borderRadius: "10px", border: "none",
                                background: templateSaving ? "rgba(255,255,255,0.1)" : C.gold,
                                color: templateSaving ? C.muted : "#0B0F1A", fontFamily: "var(--font-inter), sans-serif",
                                fontSize: "13px", fontWeight: 600, cursor: "pointer", transition: "opacity 0.2s"
                              }}
                              onMouseEnter={(e) => e.currentTarget.style.opacity = "0.85"}
                              onMouseLeave={(e) => e.currentTarget.style.opacity = "1"}
                            >
                              {templateSaving ? "Kaydediliyor..." : "Tasarımı Şablon Olarak Kaydet"}
                            </button>
                          </div>

                          {templateSaveSuccess && (
                            <div style={{ marginTop: "12px", padding: "10px 14px", borderRadius: "8px", background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)" }}>
                              <span style={{ fontSize: "12px", color: "#22c55e" }}>✓ {templateSaveSuccess}</span>
                            </div>
                          )}
                          {templateSaveError && (
                            <div style={{ marginTop: "12px", padding: "10px 14px", borderRadius: "8px", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)" }}>
                              <span style={{ fontSize: "12px", color: "#ef4444" }}>⚠ {templateSaveError}</span>
                            </div>
                          )}
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
                             onClick={async () => {
                               const newShowcaseState = !editIsShowcase;
                               setEditIsShowcase(newShowcaseState);
                               setEditorSaving(true);
                               try {
                                 const res = await fetch("/api/admin/page-settings", {
                                   method: "POST",
                                   headers: { "Content-Type": "application/json" },
                                   body: JSON.stringify({
                                     adminEmail,
                                     action: "update",
                                     pageSlug: selectedEditSlug,
                                     newPageSlug: editPageSlug,
                                     templateId: editTemplateId,
                                     config: editConfig,
                                     memories: editMemories,
                                     isPublished: editIsPublished,
                                     isShowcase: newShowcaseState,
                                   }),
                                 });
                                 const data = await res.json();
                                 if (res.ok) {
                                   setEditorSuccess(newShowcaseState ? "Sayfa başarıyla vitrine eklendi! 🌟" : "Sayfa vitrinden kaldırıldı.");
                                   await fetchAllPages();
                                 } else {
                                   setEditorError(data.error || "Vitrin durumu güncellenemedi.");
                                 }
                               } catch {
                                 setEditorError("Sunucu bağlantı hatası.");
                               } finally {
                                 setEditorSaving(false);
                               }
                             }}
                             style={{
                               padding: "14px 28px", borderRadius: "30px",
                               border: `1px solid ${editIsShowcase ? "rgba(134,239,172,0.4)" : "rgba(255,255,255,0.15)"}`,
                               background: editIsShowcase ? "rgba(134,239,172,0.08)" : "rgba(255,255,255,0.03)",
                               color: editIsShowcase ? C.success : C.text,
                               fontFamily: "var(--font-inter), sans-serif",
                               fontSize: "13px", fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", cursor: "pointer",
                               transition: "all 0.2s", marginRight: "12px"
                             }}
                           >
                             {editIsShowcase ? "Vitrinden Kaldır" : "Vitrinde Sergile"}
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
                            {editIsPublished ? (editorSaving ? "Taslağa Alınıyor..." : "Sayfayı Taslağa Al") : (editorSaving ? "Kaydediliyor..." : "Taslağı Güncelle")}
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
                            {editIsPublished ? (editorSaving ? "Güncelleniyor..." : "Güncelle") : (editorSaving ? "Yayına Alınıyor..." : "Yayına Al")}
                          </button>
                        </div>

                      </div>
                    )}
                  </div>
                )}

                {showIntegrateModal && (
                  <div style={{
                    position: "fixed", inset: 0, zIndex: 9999,
                    background: "rgba(11,15,26,0.8)", backdropFilter: "blur(12px)",
                    display: "flex", alignItems: "center", justifyContent: "center", padding: "20px"
                  }}>
                    <div style={{
                      background: "#160408", border: `1px solid ${C.border}`,
                      borderRadius: "24px", padding: "32px", width: "100%", maxWidth: "500px",
                      boxShadow: "0 24px 64px rgba(0,0,0,0.8)",
                      fontFamily: "var(--font-inter), sans-serif",
                    }}>
                      <h3 style={{ fontFamily: "var(--font-cormorant), serif", fontSize: "24px", color: C.text, marginBottom: "12px", fontWeight: 600 }}>
                        Anıları Şablonlara Entegre Et
                      </h3>
                      <p style={{ fontSize: "13px", color: C.muted, lineHeight: 1.6, marginBottom: "20px" }}>
                        Şu an düzenlemekte olduğunuz <strong>/{selectedEditSlug}</strong> sayfasındaki tüm anıları ve bileşenleri seçtiğiniz diğer vitrin şablonlarına da kopyalayabilirsiniz. Mevcut tasarımları etkilenmeyecektir.
                      </p>

                      {integrateError && (
                        <div style={{ padding: "12px 16px", borderRadius: "12px", background: `${C.error}12`, border: `1px solid ${C.error}44`, color: C.error, fontSize: "13px", marginBottom: "16px" }}>
                          {integrateError}
                        </div>
                      )}
                      {integrateSuccess && (
                        <div style={{ padding: "12px 16px", borderRadius: "12px", background: `${C.success}12`, border: `1px solid ${C.success}44`, color: C.success, fontSize: "13px", marginBottom: "16px" }}>
                          {integrateSuccess}
                        </div>
                      )}

                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                        <span style={{ fontSize: "11px", letterSpacing: "0.12em", textTransform: "uppercase", color: C.muted, fontWeight: 600 }}>Şablon Seçin</span>
                        <button
                          type="button"
                          onClick={() => {
                            const targetSlugs = SHOWCASE_SLUGS.filter(s => s !== selectedEditSlug);
                            setSelectedIntegrateSlugs(
                              selectedIntegrateSlugs.length === targetSlugs.length ? [] : targetSlugs
                            );
                          }}
                          style={{ background: "transparent", border: "none", color: C.gold, fontSize: "12px", fontWeight: 500, cursor: "pointer" }}
                        >
                          {selectedIntegrateSlugs.length === SHOWCASE_SLUGS.filter(s => s !== selectedEditSlug).length ? "Tümünü Kaldır" : "Tümünü Seç"}
                        </button>
                      </div>

                      <div style={{ maxHeight: "220px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "8px", paddingRight: "4px", marginBottom: "24px" }}>
                        {SHOWCASE_SLUGS_WITH_NAMES
                          .filter(item => item.slug !== selectedEditSlug)
                          .map(item => {
                            const isChecked = selectedIntegrateSlugs.includes(item.slug);
                            return (
                              <label
                                key={item.slug}
                                style={{
                                  display: "flex", alignItems: "center", gap: "10px", padding: "12px",
                                  borderRadius: "10px", background: isChecked ? "rgba(201,168,76,0.06)" : "rgba(255,255,255,0.02)",
                                  border: `1px solid ${isChecked ? C.gold + "55" : "rgba(255,255,255,0.05)"}`,
                                  cursor: "pointer", transition: "all 0.2s"
                                }}
                              >
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => {
                                    setSelectedIntegrateSlugs(prev =>
                                      prev.includes(item.slug) ? prev.filter(s => s !== item.slug) : [...prev, item.slug]
                                    );
                                  }}
                                  style={{ accentColor: C.gold }}
                                />
                                <div style={{ display: "flex", flexDirection: "column" }}>
                                  <span style={{ fontSize: "13px", color: C.text, fontWeight: 500 }}>{item.title}</span>
                                  <span style={{ fontSize: "11px", color: C.muted }}>/{item.slug}</span>
                                </div>
                              </label>
                            );
                          })}
                      </div>

                      <div style={{ display: "flex", gap: "10px" }}>
                        <button
                          type="button"
                          onClick={() => {
                            if (integrateLoading) return;
                            setShowIntegrateModal(false);
                            setIntegrateSuccess("");
                            setIntegrateError("");
                          }}
                          style={{
                            flex: 1, padding: "12px", borderRadius: "30px", border: "1px solid rgba(255,255,255,0.1)",
                            background: "transparent", color: C.text, fontSize: "13px", fontWeight: 500, cursor: "pointer",
                            transition: "all 0.2s"
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.04)"}
                          onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                        >
                          Vazgeç
                        </button>
                        <button
                          type="button"
                          onClick={handleIntegrateMemories}
                          disabled={integrateLoading || selectedIntegrateSlugs.length === 0}
                          style={{
                            flex: 1, padding: "12px", borderRadius: "30px", border: "none",
                            background: (integrateLoading || selectedIntegrateSlugs.length === 0) ? "rgba(201,168,76,0.4)" : C.gold,
                            color: "#0B0F1A", fontSize: "13px", fontWeight: 600,
                            cursor: (integrateLoading || selectedIntegrateSlugs.length === 0) ? "not-allowed" : "pointer",
                            transition: "all 0.2s"
                          }}
                        >
                          {integrateLoading ? "Entegre Ediliyor..." : "Entegre Et"}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
  );
}
