import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { C } from "../../_utils/constants";
import { faqs as defaultFaqs } from "@/app/_utils/landingConstants";

interface SettingsTabProps {
  adminEmail: string;
}

export function SettingsTab({ adminEmail }: SettingsTabProps) {
  const [siteSettings, setSiteSettings] = useState<any>({
    package_durations: {
      "temel": { old: null, new: 6 },
      "premium": { old: null, new: 18 },
      "premium+": { old: null, new: 24 }
    },
    maintenance_mode: false,
    announcement_banner: { active: false, text: "" },
    hero_texts: {
      title: "Unutamayacağı<br /><em style=\"color: #C9A84C; font-style: italic\">Bir Sürpriz</em> Yap",
      subtitle: "Birlikte geçirdiğiniz anıları ölümsüzleştiren, sadece size özel tasarlanmış bir web sitesi hediye et."
    },
    faq_texts: {
      label: "Sıkça Sorulan",
      heading: "Aklında <em style=\"color: #C9A84C; font-style: italic\">Soru mu Var?</em>"
    },
    faqs: defaultFaqs,
    whatsapp_number: "905555555555"
  });
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [settingsSaving, setSettingsSaving] = useState(false);

  const fetchSiteSettings = useCallback(async () => {
    if (!adminEmail) return;
    setSettingsLoading(true);
    try {
      const res = await fetch(`/api/admin/site-settings?adminEmail=${encodeURIComponent(adminEmail)}`);
      const data = await res.json();
      if (res.ok && data.settings) {
        setSiteSettings((prev: any) => ({
          ...prev,
          ...data.settings,
          faq_texts: data.settings.faq_texts || prev.faq_texts,
          faqs: data.settings.faqs || prev.faqs
        }));
      }
    } catch (err) {
      console.error("Settings load error:", err);
    } finally {
      setSettingsLoading(false);
    }
  }, [adminEmail]);

  useEffect(() => {
    fetchSiteSettings();
  }, [fetchSiteSettings]);

  const handleSave = async () => {
    setSettingsSaving(true);
    try {
      const res = await fetch("/api/admin/site-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminEmail, settings: siteSettings })
      });
      if (!res.ok) throw new Error();
      alert("Ayarlar başarıyla kaydedildi.");
    } catch {
      alert("Ayarlar kaydedilirken hata oluştu.");
    } finally {
      setSettingsSaving(false);
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
      key="settings"
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.35 }}
      style={{ maxWidth: "680px", margin: "0 auto", fontFamily: "Inter, 'Inter Fallback', sans-serif" }}
    >
      <div style={{ ...cardStyle, padding: "32px" }}>
        <h2 style={{ fontFamily: "'Cormorant Garamond', 'Cormorant Garamond Fallback', serif", fontSize: "24px", fontWeight: 600, color: C.text, marginBottom: "8px" }}>
          Site <em style={{ color: C.gold, fontStyle: "italic" }}>Ayarları</em>
        </h2>
        <p style={{ fontSize: "13px", color: C.muted, marginBottom: "28px", fontWeight: 300, lineHeight: 1.6 }}>
          Sitenin temel ayarlarını ve paket aktiflik sürelerini buradan güncelleyebilirsiniz.
        </p>

        {settingsLoading ? (
          <div style={{ textAlign: "center", padding: "48px", color: C.muted, fontSize: "13px" }}>
            <div style={{ width: "24px", height: "24px", border: `2px solid ${C.border}`, borderTopColor: C.gold, borderRadius: "50%", animation: "spin 0.7s linear infinite", margin: "0 auto 12px" }} />
            Ayarlar yükleniyor…
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {/* Package Durations */}
            <div style={{ padding: "20px", borderRadius: "12px", background: "rgba(255,255,255,0.02)", border: `1px solid ${C.border}` }}>
              <h4 style={{ fontSize: "14px", color: C.gold, marginBottom: "16px", fontWeight: 600 }}>Paket Aktiflik Süreleri (Ay)</h4>
              
              {["temel", "premium", "premium+"].map((pkgName) => {
                const vals = siteSettings?.package_durations?.[pkgName] || { old: null, new: 12 };
                return (
                  <div key={pkgName} style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
                    <div style={{ width: "100px", fontSize: "13px", color: C.text, textTransform: "capitalize" }}>{pkgName}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <label style={{ fontSize: "10px", color: C.muted }}>Eski (Opsiyonel)</label>
                      <input
                        type="number"
                        value={vals.old || ""}
                        onChange={(e) => {
                          const val = e.target.value === "" ? null : Number(e.target.value);
                          setSiteSettings((prev: any) => ({
                            ...prev,
                            package_durations: {
                              ...prev.package_durations,
                              [pkgName]: { ...prev.package_durations?.[pkgName], old: val }
                            }
                          }));
                        }}
                        style={{ width: "60px", padding: "6px", borderRadius: "6px", background: C.bg, border: `1px solid ${C.border}`, color: C.text, fontSize: "12px" }}
                      />
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <label style={{ fontSize: "10px", color: C.muted }}>Yeni</label>
                      <input
                        type="number"
                        value={vals.new || ""}
                        onChange={(e) => {
                          const val = e.target.value === "" ? 0 : Number(e.target.value);
                          setSiteSettings((prev: any) => ({
                            ...prev,
                            package_durations: {
                              ...prev.package_durations,
                              [pkgName]: { ...prev.package_durations?.[pkgName], new: val }
                            }
                          }));
                        }}
                        style={{ width: "60px", padding: "6px", borderRadius: "6px", background: C.bg, border: `1px solid ${C.border}`, color: C.text, fontSize: "12px" }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Maintenance Mode & WhatsApp */}
            <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
              <div style={{ flex: 1, padding: "20px", borderRadius: "12px", background: "rgba(255,255,255,0.02)", border: `1px solid ${C.border}` }}>
                <h4 style={{ fontSize: "14px", color: C.gold, marginBottom: "16px", fontWeight: 600 }}>Bakım Modu</h4>
                <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={siteSettings?.maintenance_mode || false}
                    onChange={(e) => setSiteSettings((prev: any) => ({ ...prev, maintenance_mode: e.target.checked }))}
                    style={{ accentColor: C.gold, width: "16px", height: "16px" }}
                  />
                  <span style={{ fontSize: "13px", color: C.text }}>Siteyi Bakım Moduna Al</span>
                </label>
              </div>

              <div style={{ flex: 1, padding: "20px", borderRadius: "12px", background: "rgba(255,255,255,0.02)", border: `1px solid ${C.border}` }}>
                <h4 style={{ fontSize: "14px", color: C.gold, marginBottom: "16px", fontWeight: 600 }}>WhatsApp Numarası</h4>
                <input
                  type="text"
                  value={siteSettings?.whatsapp_number || ""}
                  onChange={(e) => setSiteSettings((prev: any) => ({ ...prev, whatsapp_number: e.target.value }))}
                  placeholder="905555555555"
                  style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", background: C.bg, border: `1px solid ${C.border}`, color: C.text, fontSize: "13px" }}
                />
              </div>
            </div>

            {/* Announcement Banner */}
            <div style={{ padding: "20px", borderRadius: "12px", background: "rgba(255,255,255,0.02)", border: `1px solid ${C.border}` }}>
              <h4 style={{ fontSize: "14px", color: C.gold, marginBottom: "16px", fontWeight: 600 }}>Duyuru Banner'ı</h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={siteSettings?.announcement_banner?.active || false}
                    onChange={(e) => setSiteSettings((prev: any) => ({
                      ...prev,
                      announcement_banner: { ...prev.announcement_banner, active: e.target.checked }
                    }))}
                    style={{ accentColor: C.gold, width: "16px", height: "16px" }}
                  />
                  <span style={{ fontSize: "13px", color: C.text }}>Banner'ı Aktif Et</span>
                </label>
                <input
                  type="text"
                  value={siteSettings?.announcement_banner?.text || ""}
                  onChange={(e) => setSiteSettings((prev: any) => ({
                    ...prev,
                    announcement_banner: { ...prev.announcement_banner, text: e.target.value }
                  }))}
                  placeholder="Örn: Sevgililer Gününe Özel %20 İndirim!"
                  style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", background: C.bg, border: `1px solid ${C.border}`, color: C.text, fontSize: "13px" }}
                />
              </div>
            </div>

            {/* Hero Texts */}
            <div style={{ padding: "20px", borderRadius: "12px", background: "rgba(255,255,255,0.02)", border: `1px solid ${C.border}` }}>
              <h4 style={{ fontSize: "14px", color: C.gold, marginBottom: "16px", fontWeight: 600 }}>Ana Sayfa (Hero) Metinleri</h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={{ fontSize: "11px", color: C.muted, textTransform: "uppercase" }}>Ana Başlık (HTML Kullanılabilir)</label>
                  <textarea
                    value={siteSettings?.hero_texts?.title || ""}
                    onChange={(e) => setSiteSettings((prev: any) => ({
                      ...prev,
                      hero_texts: { ...prev.hero_texts, title: e.target.value }
                    }))}
                    rows={3}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", background: C.bg, border: `1px solid ${C.border}`, color: C.text, fontSize: "13px", fontFamily: "monospace", resize: "vertical" }}
                  />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={{ fontSize: "11px", color: C.muted, textTransform: "uppercase" }}>Alt Metin</label>
                  <textarea
                    value={siteSettings?.hero_texts?.subtitle || ""}
                    onChange={(e) => setSiteSettings((prev: any) => ({
                      ...prev,
                      hero_texts: { ...prev.hero_texts, subtitle: e.target.value }
                    }))}
                    rows={2}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", background: C.bg, border: `1px solid ${C.border}`, color: C.text, fontSize: "13px", resize: "vertical" }}
                  />
                </div>
              </div>
            </div>

            {/* FAQ Texts */}
            <div style={{ padding: "20px", borderRadius: "12px", background: "rgba(255,255,255,0.02)", border: `1px solid ${C.border}` }}>
              <h4 style={{ fontSize: "14px", color: C.gold, marginBottom: "16px", fontWeight: 600 }}>Sıkça Sorulan Sorular Metinleri</h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={{ fontSize: "11px", color: C.muted, textTransform: "uppercase" }}>Küçük Başlık (Label)</label>
                  <input
                    type="text"
                    value={siteSettings?.faq_texts?.label || ""}
                    onChange={(e) => setSiteSettings((prev: any) => ({
                      ...prev,
                      faq_texts: { ...(prev.faq_texts || {}), label: e.target.value }
                    }))}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", background: C.bg, border: `1px solid ${C.border}`, color: C.text, fontSize: "13px" }}
                  />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={{ fontSize: "11px", color: C.muted, textTransform: "uppercase" }}>Ana Başlık (HTML Kullanılabilir)</label>
                  <textarea
                    value={siteSettings?.faq_texts?.heading || ""}
                    onChange={(e) => setSiteSettings((prev: any) => ({
                      ...prev,
                      faq_texts: { ...(prev.faq_texts || {}), heading: e.target.value }
                    }))}
                    rows={2}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", background: C.bg, border: `1px solid ${C.border}`, color: C.text, fontSize: "13px", fontFamily: "monospace", resize: "vertical" }}
                  />
                </div>
              </div>
            </div>

            {/* FAQ List Editor */}
            <div style={{ padding: "20px", borderRadius: "12px", background: "rgba(255,255,255,0.02)", border: `1px solid ${C.border}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <h4 style={{ fontSize: "14px", color: C.gold, fontWeight: 600 }}>Sıkça Sorulan Sorular Listesi</h4>
                <button
                  type="button"
                  onClick={() => {
                    const newFaq = { q: "Yeni Soru?", a: "Cevap..." };
                    setSiteSettings((prev: any) => ({
                      ...prev,
                      faqs: [...(prev.faqs || []), newFaq]
                    }));
                  }}
                  style={{
                    background: "rgba(201,168,76,0.15)",
                    border: `1px solid ${C.gold}`,
                    color: C.gold,
                    fontSize: "11px",
                    padding: "6px 12px",
                    borderRadius: "15px",
                    cursor: "pointer",
                    fontFamily: "var(--font-inter), sans-serif",
                    fontWeight: 500,
                    transition: "opacity 0.2s"
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.opacity = "0.8"}
                  onMouseLeave={(e) => e.currentTarget.style.opacity = "1"}
                >
                  + Yeni Soru Ekle
                </button>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {(siteSettings?.faqs || []).map((faq: any, index: number) => (
                  <div
                    key={index}
                    style={{
                      padding: "16px",
                      borderRadius: "8px",
                      background: "rgba(255,255,255,0.01)",
                      border: "1px solid rgba(255,255,255,0.05)",
                      position: "relative"
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                      <span style={{ fontSize: "11px", color: C.gold, fontWeight: 500 }}>Soru #{index + 1}</span>
                      <div style={{ display: "flex", gap: "8px" }}>
                        {/* Move Up */}
                        <button
                          type="button"
                          disabled={index === 0}
                          onClick={() => {
                            if (index === 0) return;
                            const newList = [...(siteSettings.faqs || [])];
                            const temp = newList[index];
                            newList[index] = newList[index - 1];
                            newList[index - 1] = temp;
                            setSiteSettings((prev: any) => ({ ...prev, faqs: newList }));
                          }}
                          style={{
                            background: "transparent",
                            border: "none",
                            color: index === 0 ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.4)",
                            fontSize: "11px",
                            cursor: index === 0 ? "not-allowed" : "pointer"
                          }}
                        >
                          ▲
                        </button>
                        {/* Move Down */}
                        <button
                          type="button"
                          disabled={index === (siteSettings.faqs || []).length - 1}
                          onClick={() => {
                            if (index === (siteSettings.faqs || []).length - 1) return;
                            const newList = [...(siteSettings.faqs || [])];
                            const temp = newList[index];
                            newList[index] = newList[index + 1];
                            newList[index + 1] = temp;
                            setSiteSettings((prev: any) => ({ ...prev, faqs: newList }));
                          }}
                          style={{
                            background: "transparent",
                            border: "none",
                            color: index === (siteSettings.faqs || []).length - 1 ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.4)",
                            fontSize: "11px",
                            cursor: index === (siteSettings.faqs || []).length - 1 ? "not-allowed" : "pointer"
                          }}
                        >
                          ▼
                        </button>
                        {/* Delete */}
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm("Bu soruyu silmek istediğinize emin misiniz?")) {
                              const newList = (siteSettings.faqs || []).filter((_: any, idx: number) => idx !== index);
                              setSiteSettings((prev: any) => ({ ...prev, faqs: newList }));
                            }
                          }}
                          style={{
                            background: "transparent",
                            border: "none",
                            color: "#E8A0A0",
                            fontSize: "11px",
                            cursor: "pointer",
                            fontWeight: 500
                          }}
                        >
                          Sil
                        </button>
                      </div>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                        <label style={{ fontSize: "10px", color: C.muted, textTransform: "uppercase" }}>Soru</label>
                        <input
                          type="text"
                          value={faq.q || ""}
                          onChange={(e) => {
                            const newList = [...(siteSettings.faqs || [])];
                            newList[index] = { ...newList[index], q: e.target.value };
                            setSiteSettings((prev: any) => ({ ...prev, faqs: newList }));
                          }}
                          style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", background: C.bg, border: `1px solid ${C.border}`, color: C.text, fontSize: "12px" }}
                        />
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                        <label style={{ fontSize: "10px", color: C.muted, textTransform: "uppercase" }}>Cevap</label>
                        <textarea
                          value={faq.a || ""}
                          onChange={(e) => {
                            const newList = [...(siteSettings.faqs || [])];
                            newList[index] = { ...newList[index], a: e.target.value };
                            setSiteSettings((prev: any) => ({ ...prev, faqs: newList }));
                          }}
                          rows={2}
                          style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", background: C.bg, border: `1px solid ${C.border}`, color: C.text, fontSize: "12px", resize: "vertical" }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={handleSave}
              disabled={settingsSaving}
              style={{
                width: "100%", padding: "15px", borderRadius: "30px", border: "none",
                background: settingsSaving ? "rgba(201,168,76,0.5)" : C.gold, color: "#0B0F1A",
                fontFamily: "var(--font-inter), sans-serif", fontSize: "13px", letterSpacing: "0.12em",
                textTransform: "uppercase", fontWeight: 600, cursor: settingsSaving ? "not-allowed" : "pointer",
                transition: "opacity 0.2s", marginTop: "8px",
              }}
            >
              {settingsSaving ? "Kaydediliyor..." : "Ayarları Kaydet"}
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}
