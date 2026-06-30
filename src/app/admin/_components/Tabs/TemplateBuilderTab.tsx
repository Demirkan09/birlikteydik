"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { C } from "../../_utils/constants";

// ─── Tipler ───────────────────────────────────────────────────────────────────
interface TemplateConfig {
  bgColor: string;
  accentColor: string;
  particlesEnabled: boolean;
  particlesType: "hearts" | "rose-petals" | "stars" | "none";
  particlesDensity: number;
  particlesColor: string;
  musicWidgetEnabled: boolean;
  musicWidgetType: "vinyl" | "minimal" | "hidden";
  musicWidgetPosition: "bottom-left" | "bottom-right" | "top-left" | "top-right";
  memoryCardStyle: "plain" | "polaroid" | "cinematic";
  memoryCardLayout: "vertical" | "grid";
  polaroidTilt: boolean;
  headingFont: "cormorant" | "playfair" | "cinzel" | "pinyon";
  bodyFont: "inter" | "lato" | "dm-sans";
  finalEnabled: boolean;
  finalHeading: string;
  nameGradientStart: string;
  nameGradientEnd: string;
}

interface CustomTemplate {
  id: string;
  name: string;
  preview_color: string;
  template_config: TemplateConfig;
  created_at: string;
}

const DEFAULT_CONFIG: TemplateConfig = {
  bgColor: "#09090b",
  accentColor: "#C9A84C",
  particlesEnabled: true,
  particlesType: "hearts",
  particlesDensity: 20,
  particlesColor: "",  // boşsa aksan rengi kullanılır
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
  nameGradientStart: "",
  nameGradientEnd: "",
};

// ─── Yardımcı bileşenler ──────────────────────────────────────────────────────
const inputStyle: React.CSSProperties = {
  width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: "10px", padding: "10px 14px", color: C.text, fontFamily: "var(--font-inter), sans-serif",
  fontSize: "13px", outline: "none", boxSizing: "border-box",
};

const labelStyle: React.CSSProperties = {
  fontSize: "11px", letterSpacing: "0.12em", textTransform: "uppercase" as const,
  color: C.muted, marginBottom: "8px", fontWeight: 500, display: "block",
};

const sectionStyle: React.CSSProperties = {
  background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)",
  borderRadius: "16px", padding: "20px", marginBottom: "16px",
};

const sectionTitleStyle: React.CSSProperties = {
  fontSize: "12px", fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase" as const,
  color: C.gold, marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px",
};

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
      <span style={{ fontFamily: "var(--font-inter), sans-serif", fontSize: "13px", color: C.text }}>{label}</span>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        style={{
          width: "44px", height: "24px", borderRadius: "12px", border: "none", cursor: "pointer",
          background: checked ? C.gold : "rgba(255,255,255,0.12)", position: "relative", transition: "background 0.2s",
        }}
      >
        <div style={{
          position: "absolute", top: "3px", width: "18px", height: "18px", borderRadius: "50%",
          background: "#fff", transition: "left 0.2s", left: checked ? "23px" : "3px", boxShadow: "0 1px 4px rgba(0,0,0,0.4)",
        }} />
      </button>
    </div>
  );
}

function SelectField({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
  return (
    <div style={{ marginBottom: "14px" }}>
      <label style={labelStyle}>{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{ ...inputStyle, appearance: "none" as const }}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} style={{ background: "#1a1a2e" }}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
}

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div style={{ marginBottom: "14px" }}>
      <label style={labelStyle}>{label}</label>
      <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{ width: "44px", height: "44px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.1)", cursor: "pointer", background: "none", padding: "2px" }}
        />
        <input
          type="text"
          value={value}
          onChange={(e) => { if (/^#[0-9A-Fa-f]{0,6}$/.test(e.target.value)) onChange(e.target.value); }}
          style={{ ...inputStyle, fontFamily: "monospace", width: "120px" }}
          maxLength={7}
        />
      </div>
    </div>
  );
}

function SliderField({ label, value, onChange, min, max }: { label: string; value: number; onChange: (v: number) => void; min: number; max: number }) {
  return (
    <div style={{ marginBottom: "14px" }}>
      <label style={labelStyle}>{label}: <span style={{ color: C.text }}>{value}</span></label>
      <input
        type="range" min={min} max={max} value={value} onChange={(e) => onChange(Number(e.target.value))}
        style={{ width: "100%", accentColor: C.gold }}
      />
    </div>
  );
}

// ─── Renk Önizleme Kartı ─────────────────────────────────────────────────────
function TemplatePreviewCard({ config }: { config: TemplateConfig }) {
  return (
    <div style={{
      borderRadius: "16px", overflow: "hidden", border: `1px solid ${config.accentColor}33`,
      background: config.bgColor, position: "relative", height: "200px",
      boxShadow: `0 8px 32px rgba(0,0,0,0.5), 0 0 20px ${config.accentColor}11`,
    }}>
      {/* Simulated gradient */}
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse 80% 55% at 50% -5%, ${config.accentColor}33 0%, transparent 60%)` }} />
      {/* Fake isim */}
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "12px" }}>
        <div style={{
          fontSize: "28px",
          background: `linear-gradient(160deg, ${config.nameGradientStart || "#ffffff"} 0%, ${config.nameGradientEnd || config.accentColor} 100%)`,
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
          fontFamily: config.headingFont === "pinyon" ? "'Pinyon Script', cursive" : "serif",
          opacity: 0.95
        }}>
          Sen & Ben
        </div>
        <div style={{ width: "40px", height: "1px", background: `${config.accentColor}66` }} />
        <div style={{ fontSize: "9px", letterSpacing: "0.4em", color: `${config.accentColor}88`, textTransform: "uppercase" as const, fontFamily: "sans-serif" }}>
          {config.particlesType !== "none" && config.particlesEnabled ? `✦ ${config.particlesType}` : "—"} · {config.memoryCardStyle}
        </div>
      </div>
      {/* Widget pozisyon göstergesi */}
      {config.musicWidgetEnabled && (
        <div style={{
          position: "absolute",
          bottom: config.musicWidgetPosition.includes("bottom") ? "12px" : "auto",
          top: config.musicWidgetPosition.includes("top") ? "12px" : "auto",
          left: config.musicWidgetPosition.includes("left") ? "12px" : "auto",
          right: config.musicWidgetPosition.includes("right") ? "12px" : "auto",
          background: `${config.accentColor}22`, border: `1px solid ${config.accentColor}44`,
          borderRadius: "8px", padding: "4px 8px", fontSize: "8px", color: config.accentColor,
          fontFamily: "sans-serif", letterSpacing: "0.1em",
        }}>
          ♫ widget
        </div>
      )}
    </div>
  );
}

// ─── Ana Tab Bileşeni ─────────────────────────────────────────────────────────
interface TemplateBuilderTabProps {
  adminEmail: string;
  onTemplateCreated?: () => void;
}

export function TemplateBuilderTab({ adminEmail, onTemplateCreated }: TemplateBuilderTabProps) {
  const [templates, setTemplates] = useState<CustomTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<"list" | "editor">("list");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [templateName, setTemplateName] = useState("");
  const [config, setConfig] = useState<TemplateConfig>({ ...DEFAULT_CONFIG });
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");
  const [saveError, setSaveError] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Yardımcı: tek alan güncelle
  const updateConfig = <K extends keyof TemplateConfig>(key: K, value: TemplateConfig[K]) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  // ─── Listele ───────────────────────────────────────────────────────────────
  const fetchTemplates = useCallback(async () => {
    if (!adminEmail) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/custom-templates?adminEmail=${encodeURIComponent(adminEmail)}`);
      const data = await res.json();
      if (res.ok && data.templates) setTemplates(data.templates);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, [adminEmail]);

  useEffect(() => { fetchTemplates(); }, [fetchTemplates]);

  // ─── Yeni şablon oluştur ─────────────────────────────────────────────────
  const openNew = () => {
    setEditingId(null);
    setTemplateName("");
    setConfig({ ...DEFAULT_CONFIG });
    setSaveMsg(""); setSaveError("");
    setView("editor");
  };

  // ─── Düzenle ─────────────────────────────────────────────────────────────
  const openEdit = (tpl: CustomTemplate) => {
    setEditingId(tpl.id);
    setTemplateName(tpl.name);
    setConfig({ ...DEFAULT_CONFIG, ...tpl.template_config });
    setSaveMsg(""); setSaveError("");
    setView("editor");
  };

  // ─── Kaydet ──────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!templateName.trim()) { setSaveError("Şablon adı zorunlu."); return; }
    setSaving(true); setSaveMsg(""); setSaveError("");
    try {
      const res = await fetch("/api/admin/custom-templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          adminEmail,
          action: editingId ? "update" : "create",
          id: editingId,
          name: templateName.trim(),
          previewColor: config.accentColor,
          templateConfig: config,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setSaveError(data.error ?? "Kaydedilemedi."); return; }
      setSaveMsg("Şablon başarıyla kaydedildi!");
      await fetchTemplates();
      if (onTemplateCreated) onTemplateCreated();
      setTimeout(() => { setView("list"); setSaveMsg(""); }, 1500);
    } catch {
      setSaveError("Sunucuya bağlanılamadı.");
    } finally {
      setSaving(false);
    }
  };

  // ─── Sil ─────────────────────────────────────────────────────────────────
  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/custom-templates?adminEmail=${encodeURIComponent(adminEmail)}&id=${id}`, { method: "DELETE" });
      if (res.ok) { setDeleteConfirm(null); await fetchTemplates(); if (onTemplateCreated) onTemplateCreated(); }
    } catch { /* ignore */ }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER: Liste Görünümü
  // ─────────────────────────────────────────────────────────────────────────
  if (view === "list") {
    return (
      <motion.div key="list" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.3 }}>
        {/* Başlık + Yeni Şablon */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
          <div>
            <h2 style={{ fontFamily: "var(--font-inter), sans-serif", fontSize: "20px", fontWeight: 700, color: C.text, margin: 0 }}>🎨 Özel Şablonlar</h2>
            <p style={{ fontFamily: "var(--font-inter), sans-serif", fontSize: "13px", color: C.muted, marginTop: "4px" }}>
              Oluşturduğunuz şablonlar "Yeni Sayfa Oluştur" listesine otomatik eklenir.
            </p>
          </div>
          <button
            type="button"
            onClick={openNew}
            style={{ padding: "11px 22px", borderRadius: "12px", background: C.gold, color: "#0B0F1A", fontFamily: "var(--font-inter), sans-serif", fontSize: "13px", fontWeight: 700, border: "none", cursor: "pointer", letterSpacing: "0.04em", whiteSpace: "nowrap" }}
          >
            + Yeni Şablon
          </button>
        </div>

        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: "60px 0" }}>
            <div style={{ width: "32px", height: "32px", border: `2px solid ${C.border}`, borderTopColor: C.gold, borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
          </div>
        ) : templates.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 24px", background: "rgba(255,255,255,0.02)", border: "1px dashed rgba(255,255,255,0.1)", borderRadius: "16px" }}>
            <div style={{ fontSize: "40px", marginBottom: "12px" }}>✦</div>
            <p style={{ fontFamily: "var(--font-inter), sans-serif", fontSize: "14px", color: C.muted }}>Henüz özel şablon oluşturulmamış.</p>
            <button type="button" onClick={openNew} style={{ marginTop: "16px", padding: "10px 20px", borderRadius: "10px", background: C.gold, color: "#0B0F1A", fontFamily: "var(--font-inter), sans-serif", fontSize: "13px", fontWeight: 700, border: "none", cursor: "pointer" }}>
              İlk Şablonu Oluştur
            </button>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "16px" }}>
            {templates.map((tpl) => (
              <motion.div key={tpl.id} initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.2 }}
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "16px", overflow: "hidden" }}
              >
                {/* Önizleme */}
                <TemplatePreviewCard config={{ ...DEFAULT_CONFIG, ...tpl.template_config, accentColor: tpl.preview_color }} />

                {/* Bilgi + Butonlar */}
                <div style={{ padding: "16px" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "12px" }}>
                    <div>
                      <p style={{ fontFamily: "var(--font-inter), sans-serif", fontSize: "14px", fontWeight: 600, color: C.text, margin: 0 }}>{tpl.name}</p>
                      <p style={{ fontFamily: "var(--font-inter), sans-serif", fontSize: "11px", color: C.muted, margin: "2px 0 0" }}>
                        ID: custom-{tpl.id.slice(0, 8)}
                      </p>
                    </div>
                    <div style={{ width: "14px", height: "14px", borderRadius: "50%", background: tpl.preview_color, flexShrink: 0, marginTop: "2px" }} />
                  </div>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button type="button" onClick={() => openEdit(tpl)}
                      style={{ flex: 1, padding: "9px", borderRadius: "10px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: C.text, fontFamily: "var(--font-inter), sans-serif", fontSize: "12px", cursor: "pointer" }}
                    >
                      ✏️ Düzenle
                    </button>
                    {deleteConfirm === tpl.id ? (
                      <div style={{ display: "flex", gap: "6px" }}>
                        <button type="button" onClick={() => handleDelete(tpl.id)}
                          style={{ flex: 1, padding: "9px", borderRadius: "10px", background: "#ef444420", border: "1px solid #ef4444", color: "#ef4444", fontFamily: "var(--font-inter), sans-serif", fontSize: "12px", cursor: "pointer" }}
                        >
                          Evet, Sil
                        </button>
                        <button type="button" onClick={() => setDeleteConfirm(null)}
                          style={{ flex: 1, padding: "9px", borderRadius: "10px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: C.muted, fontFamily: "var(--font-inter), sans-serif", fontSize: "12px", cursor: "pointer" }}
                        >
                          İptal
                        </button>
                      </div>
                    ) : (
                      <button type="button" onClick={() => setDeleteConfirm(tpl.id)}
                        style={{ padding: "9px 12px", borderRadius: "10px", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#ef4444", fontFamily: "var(--font-inter), sans-serif", fontSize: "12px", cursor: "pointer" }}
                      >
                        🗑️
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER: Editör
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <motion.div key="editor" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.3 }}>
      {/* Başlık */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
        <button type="button" onClick={() => { setView("list"); setSaveMsg(""); setSaveError(""); }}
          style={{ padding: "8px 14px", borderRadius: "10px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: C.muted, fontFamily: "var(--font-inter), sans-serif", fontSize: "13px", cursor: "pointer" }}
        >
          ← Geri
        </button>
        <h2 style={{ fontFamily: "var(--font-inter), sans-serif", fontSize: "18px", fontWeight: 700, color: C.text, margin: 0 }}>
          {editingId ? "Şablonu Düzenle" : "Yeni Şablon Oluştur"}
        </h2>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: "24px", alignItems: "start" }}>
        {/* Sol: Editör */}
        <div>
          {/* Şablon Adı */}
          <div style={sectionStyle}>
            <p style={sectionTitleStyle}>🏷️ Şablon Bilgileri</p>
            <label style={labelStyle}>Şablon Adı</label>
            <input
              type="text"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              placeholder="Örn: Gece Mavisi, Altın Çağ..."
              style={inputStyle}
            />
          </div>

          {/* Renkler */}
          <div style={sectionStyle}>
            <p style={sectionTitleStyle}>🎨 Renkler</p>
            <ColorField label="Arkaplan Rengi" value={config.bgColor} onChange={(v) => updateConfig("bgColor", v)} />
            <ColorField label="Aksan Rengi" value={config.accentColor} onChange={(v) => updateConfig("accentColor", v)} />
            <div style={{ marginTop: "16px", borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "16px" }}>
              <p style={{ ...sectionTitleStyle, fontSize: "11px", marginBottom: "12px" }}>✍️ İsimlerin Degrade Renkleri</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                <ColorField label="Degrade Başlangıç" value={config.nameGradientStart || "#ffffff"} onChange={(v) => updateConfig("nameGradientStart", v)} />
                <ColorField label="Degrade Bitiş" value={config.nameGradientEnd || config.accentColor} onChange={(v) => updateConfig("nameGradientEnd", v)} />
              </div>
              <p style={{ fontFamily: "var(--font-inter), sans-serif", fontSize: "11px", color: C.muted, marginTop: "4px" }}>
                Çift isimlerinin degrade geçiş renklerini belirler.
              </p>
            </div>
          </div>

          {/* Partiküller */}
          <div style={sectionStyle}>
            <p style={sectionTitleStyle}>✨ Arka Plan Partikülleri</p>
            <Toggle checked={config.particlesEnabled} onChange={(v) => updateConfig("particlesEnabled", v)} label="Partiküller Aktif" />
            {config.particlesEnabled && (
              <>
                <SelectField label="Partikül Tipi" value={config.particlesType} onChange={(v) => updateConfig("particlesType", v as TemplateConfig["particlesType"])}
                  options={[
                    { value: "hearts", label: "💙 Yüzen Kalpler" },
                    { value: "rose-petals", label: "🌹 Gül Yaprakları" },
                    { value: "stars", label: "⭐ Titreyen Yıldızlar" },
                    { value: "none", label: "— Hiçbiri" },
                  ]}
                />
                <SliderField label="Yoğunluk (Partikül Sayısı)" value={config.particlesDensity} onChange={(v) => updateConfig("particlesDensity", v)} min={5} max={50} />
                <div style={{ marginBottom: "14px" }}>
                  <label style={labelStyle}>Partikül Rengi <span style={{ color: C.muted, fontWeight: 400 }}>(boş bırakılırsa aksan rengi kullanılır)</span></label>
                  <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                    <input
                      type="color"
                      value={config.particlesColor || config.accentColor}
                      onChange={(e) => updateConfig("particlesColor", e.target.value)}
                      style={{ width: "44px", height: "44px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.1)", cursor: "pointer", background: "none", padding: "2px" }}
                    />
                    <input
                      type="text"
                      value={config.particlesColor}
                      onChange={(e) => { if (/^#?[0-9A-Fa-f]{0,6}$/.test(e.target.value)) updateConfig("particlesColor", e.target.value.startsWith("#") || e.target.value === "" ? e.target.value : "#" + e.target.value); }}
                      placeholder="Boş = aksan rengi"
                      style={{ ...inputStyle, fontFamily: "monospace", width: "160px" }}
                      maxLength={7}
                    />
                    {config.particlesColor && (
                      <button type="button" onClick={() => updateConfig("particlesColor", "")}
                        style={{ padding: "8px 12px", borderRadius: "8px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: C.muted, fontSize: "11px", cursor: "pointer" }}
                      >Sıfırla</button>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Müzik Widget */}
          <div style={sectionStyle}>
            <p style={sectionTitleStyle}>🎵 Müzik Widget'ı</p>
            <Toggle checked={config.musicWidgetEnabled} onChange={(v) => updateConfig("musicWidgetEnabled", v)} label="Widget Aktif" />
            {config.musicWidgetEnabled && (
              <>
                <SelectField label="Widget Tipi" value={config.musicWidgetType} onChange={(v) => updateConfig("musicWidgetType", v as TemplateConfig["musicWidgetType"])}
                  options={[
                    { value: "vinyl", label: "🎵 Plak (Vinyl)" },
                    { value: "minimal", label: "📊 Minimal Bar" },
                    { value: "hidden", label: "🔇 Gizli (sadece ses)" },
                  ]}
                />
                <SelectField label="Widget Pozisyonu" value={config.musicWidgetPosition} onChange={(v) => updateConfig("musicWidgetPosition", v as TemplateConfig["musicWidgetPosition"])}
                  options={[
                    { value: "bottom-left", label: "↙ Sol Alt" },
                    { value: "bottom-right", label: "↘ Sağ Alt" },
                    { value: "top-left", label: "↖ Sol Üst" },
                    { value: "top-right", label: "↗ Sağ Üst" },
                  ]}
                />
              </>
            )}
          </div>

          {/* Fotoğraf Kartları */}
          <div style={sectionStyle}>
            <p style={sectionTitleStyle}>📸 Fotoğraf Kartları</p>
            <SelectField label="Kart Stili" value={config.memoryCardStyle} onChange={(v) => updateConfig("memoryCardStyle", v as TemplateConfig["memoryCardStyle"])}
              options={[
                { value: "plain", label: "⬜ Düz / Minimal" },
                { value: "polaroid", label: "📷 Polaroid" },
                { value: "cinematic", label: "🎬 Sinematik" },
              ]}
            />
            <SelectField label="Listeleme Düzeni" value={config.memoryCardLayout} onChange={(v) => updateConfig("memoryCardLayout", v as TemplateConfig["memoryCardLayout"])}
              options={[
                { value: "vertical", label: "☰ Dikey (tek sütun)" },
                { value: "grid", label: "⊞ Grid (2 sütun)" },
              ]}
            />
            {config.memoryCardStyle === "polaroid" && (
              <Toggle checked={config.polaroidTilt} onChange={(v) => updateConfig("polaroidTilt", v)} label="Polaroid Eğim Efekti" />
            )}
          </div>

          {/* Tipografi */}
          <div style={sectionStyle}>
            <p style={sectionTitleStyle}>✍️ Tipografi</p>
            <SelectField label="Başlık Fontu" value={config.headingFont} onChange={(v) => updateConfig("headingFont", v as TemplateConfig["headingFont"])}
              options={[
                { value: "cormorant", label: "Cormorant Garamond (Zarif Serif)" },
                { value: "playfair", label: "Playfair Display (Klasik)" },
                { value: "cinzel", label: "Cinzel (Antik / Roma)" },
                { value: "pinyon", label: "Pinyon Script (El Yazısı)" },
              ]}
            />
            <SelectField label="Metin Fontu" value={config.bodyFont} onChange={(v) => updateConfig("bodyFont", v as TemplateConfig["bodyFont"])}
              options={[
                { value: "inter", label: "Inter (Modern Sans-Serif)" },
                { value: "lato", label: "Lato (Dengeli)" },
                { value: "dm-sans", label: "DM Sans (Sade)" },
              ]}
            />
          </div>

          {/* Final Bölümü */}
          <div style={sectionStyle}>
            <p style={sectionTitleStyle}>🌹 Final Bölümü</p>
            <Toggle checked={config.finalEnabled} onChange={(v) => updateConfig("finalEnabled", v)} label="Final Bölümünü Göster" />
            {config.finalEnabled && (
              <>
                <label style={labelStyle}>Final Başlığı</label>
                <input type="text" value={config.finalHeading} onChange={(e) => updateConfig("finalHeading", e.target.value)} style={inputStyle} placeholder="Sonsuza Dek Birlikte" />
              </>
            )}
          </div>
        </div>

        {/* Sağ: Önizleme + Kaydet */}
        <div style={{ position: "sticky", top: "24px" }}>
          <div style={sectionStyle}>
            <p style={{ ...sectionTitleStyle, marginBottom: "12px" }}>👁 Anlık Önizleme</p>
            <TemplatePreviewCard config={config} />
            <p style={{ fontFamily: "var(--font-inter), sans-serif", fontSize: "11px", color: C.muted, marginTop: "10px", textAlign: "center" }}>
              Gerçek şablon sayfayla tam uyumludur
            </p>
          </div>

          {/* Özellikler özeti */}
          <div style={{ ...sectionStyle, marginBottom: "16px" }}>
            <p style={{ ...sectionTitleStyle, marginBottom: "10px" }}>📋 Özet</p>
            {[
              ["🎨 Partiküller", config.particlesEnabled ? `${config.particlesType} (${config.particlesDensity})` : "Kapalı"],
              ["🎵 Widget", config.musicWidgetEnabled ? `${config.musicWidgetType} · ${config.musicWidgetPosition}` : "Kapalı"],
              ["📷 Kart", `${config.memoryCardStyle} · ${config.memoryCardLayout}`],
              ["✍️ Font", `${config.headingFont} / ${config.bodyFont}`],
            ].map(([k, v]) => (
              <div key={k} style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", gap: "8px" }}>
                <span style={{ fontFamily: "var(--font-inter), sans-serif", fontSize: "11px", color: C.muted, whiteSpace: "nowrap" }}>{k}</span>
                <span style={{ fontFamily: "var(--font-inter), sans-serif", fontSize: "11px", color: C.text, textAlign: "right" }}>{v}</span>
              </div>
            ))}
          </div>

          {/* Kaydet Butonu */}
          {saveMsg && (
            <div style={{ padding: "12px 16px", borderRadius: "10px", background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)", marginBottom: "12px" }}>
              <p style={{ fontFamily: "var(--font-inter), sans-serif", fontSize: "13px", color: "#22c55e", margin: 0 }}>✓ {saveMsg}</p>
            </div>
          )}
          {saveError && (
            <div style={{ padding: "12px 16px", borderRadius: "10px", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", marginBottom: "12px" }}>
              <p style={{ fontFamily: "var(--font-inter), sans-serif", fontSize: "13px", color: "#ef4444", margin: 0 }}>⚠ {saveError}</p>
            </div>
          )}
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            style={{
              width: "100%", padding: "14px", borderRadius: "12px",
              background: saving ? "rgba(255,255,255,0.1)" : C.gold,
              color: saving ? C.muted : "#0B0F1A", fontFamily: "var(--font-inter), sans-serif",
              fontSize: "14px", fontWeight: 700, border: "none", cursor: saving ? "default" : "pointer",
              letterSpacing: "0.04em", transition: "all 0.2s",
            }}
          >
            {saving ? "Kaydediliyor..." : editingId ? "✓ Değişiklikleri Kaydet" : "✓ Şablonu Oluştur"}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
