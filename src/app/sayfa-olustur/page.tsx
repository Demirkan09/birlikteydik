"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { HiOutlineCheck, HiOutlineMusicNote, HiOutlinePhotograph, HiOutlineSparkles, HiOutlineColorSwatch, HiX, HiPlus, HiTrash } from "react-icons/hi";
import { C, PACKAGES } from "../admin/_utils/constants";
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

// Impeccable Design Standards
const uiCard = {
  background: "rgba(255,255,255,0.02)",
  border: "1px solid rgba(255,255,255,0.06)",
  borderRadius: "16px",
  padding: "24px",
};

const inputStyle = {
  width: "100%",
  padding: "14px 16px",
  borderRadius: "10px",
  background: "rgba(255,255,255,0.03)",
  border: "1px solid rgba(255,255,255,0.08)",
  color: "#F0EDE8",
  outline: "none",
  fontFamily: "'Inter', sans-serif",
  fontSize: "14px",
  transition: "border-color 0.2s",
};

export default function SayfaOlusturPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  // Editor States
  const [templateId, setTemplateId] = useState("klasik-retro");
  const [config, setConfig] = useState<any>({
    coupleNames: "İsim 1\n&\nİsim 2",
    specialDate: "14 Şubat 2025",
    bgColor: "#09090b",
    accentColor: "#C9A84C",
    textColor: "#ffffff",
    particlesEnabled: true,
    particlesType: "hearts",
    musicWidgetEnabled: false,
    musicWidgetPosition: "top-left",
    musicWidgetType: "vinyl",
    ...(TEMPLATE_DEFAULTS["klasik-retro"] || {})
  });
  const [memories, setMemories] = useState<any[]>([]);
  const [existingSlug, setExistingSlug] = useState("");

  const [saving, setSaving] = useState(false);
  const [showPackageModal, setShowPackageModal] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<string>("Standart Paket");

  useEffect(() => {
    // Check Auth
    const stored = localStorage.getItem("birlikteydik_user");
    if (!stored) {
      router.push("/giris-yap?returnUrl=/sayfa-olustur");
      return;
    }
    try {
      const parsed = JSON.parse(stored);
      setUser(parsed);
    } catch {
      router.push("/giris-yap?returnUrl=/sayfa-olustur");
      return;
    }
    setLoadingAuth(false);
  }, [router]);

  // Debounced auto-save
  useEffect(() => {
    if (!user || loadingAuth) return;
    const timer = setTimeout(() => {
      saveDraft();
    }, 3000);
    return () => clearTimeout(timer);
  }, [config, memories, templateId, user]);

  const saveDraft = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const res = await fetch("/api/customer/save-page", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          templateId,
          config,
          memories,
          existingSlug
        })
      });
      const data = await res.json();
      if (res.ok && data.pageSlug) {
        setExistingSlug(data.pageSlug);
      }
    } catch (err) {
      console.error("Taslak kaydedilemedi:", err);
    } finally {
      setSaving(false);
    }
  };

  const TEMPLATE_ROUTE_MAP: Record<string, string> = {
    "klasik-retro": "sablon-retro",
    "modern-minimal": "sablon-minimal",
    "sinematik-ask": "sablon-sinematik",
    "premium-emerald": "sablon-emerald",
    "romantik-kirmizi": "sablon-kirmizi",
    "sablon-oyun": "sablon-oyun",
    "sablon-lavanta": "sablon-lavanta",
    "sablon-amber": "sablon-amber",
    "sablon-rose": "sablon-rose",
    "sablon-indigo": "sablon-indigo",
    "sablon-siyah": "sablon-siyah"
  };

  const getPreviewUrl = () => {
    const route = TEMPLATE_ROUTE_MAP[templateId] || "sablon-bos";
    try {
      const encodedConfig = encodeURIComponent(JSON.stringify(config || {}));
      const encodedMemories = encodeURIComponent(JSON.stringify(memories || []));
      return `/sablonlar/${route}?preview=true&config=${encodedConfig}&memories=${encodedMemories}`;
    } catch {
      return `/sablonlar/${route}?preview=true`;
    }
  };

  const handleCoupleNamesChange = (idx: number, val: string) => {
    const parts = (config.coupleNames || "İsim 1\n&\nİsim 2").split("\n&\n");
    if (idx === 0) parts[0] = val;
    else parts[1] = val;
    setConfig({ ...config, coupleNames: parts.join("\n&\n") });
  };

  const handleAddMemory = () => {
    setMemories([...memories, {
      id: "mem_" + Date.now(),
      title: "Yeni Anı",
      description: "Anınızın hikayesini buraya yazın...",
      date: "2024",
      photo: ""
    }]);
  };

  const handleFileUpload = async (idx: number, file: File) => {
    if (!user) return;
    const formData = new FormData();
    formData.append("userId", user.id);
    formData.append("file", file);
    if (memories[idx].photo) {
      formData.append("oldUrl", memories[idx].photo);
    }
    try {
      const res = await fetch("/api/customer/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (res.ok && data.url) {
        const nm = [...memories];
        nm[idx].photo = data.url;
        setMemories(nm);
      } else {
        alert(data.error || "Yükleme hatası");
      }
    } catch (err) {
      alert("Yükleme sırasında hata oluştu.");
    }
  };

  if (loadingAuth) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0B0F1A", color: "#C9A84C" }}>
        Yükleniyor...
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#05070A", display: "flex", flexDirection: "column", fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        select option {
          background-color: #09090b;
          color: #F0EDE8;
        }
      `}</style>
      
      {/* Top Header */}
      <header style={{ padding: "16px 32px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(11, 15, 26, 0.8)", backdropFilter: "blur(12px)", position: "sticky", top: 0, zIndex: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "24px", fontWeight: 600, color: "#C9A84C", margin: 0 }}>Birlikteydik <span style={{ color: "#F0EDE8", fontSize: "16px", opacity: 0.7, fontFamily: "'Inter', sans-serif", fontWeight: 400 }}>/ Sayfa Oluşturucu</span></h1>
          {saving && <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)" }}>Kaydediliyor...</span>}
        </div>
        <button 
          onClick={() => setShowPackageModal(true)}
          style={{ background: "#C9A84C", color: "#0B0F1A", border: "none", padding: "10px 24px", borderRadius: "30px", fontWeight: 600, fontSize: "14px", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", transition: "opacity 0.2s" }}
          onMouseEnter={e => e.currentTarget.style.opacity = "0.9"}
          onMouseLeave={e => e.currentTarget.style.opacity = "1"}
        >
          Satın Al ve Hayata Geçir
        </button>
      </header>

      {/* Main Split Layout */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        
        {/* LEFT PANE: Editor */}
        <div style={{ width: "450px", minWidth: "450px", overflowY: "auto", borderRight: "1px solid rgba(255,255,255,0.06)", padding: "32px", display: "flex", flexDirection: "column", gap: "32px", background: "#0B0F1A" }}>
          
          <div style={uiCard}>
            <h3 style={{ fontSize: "15px", fontWeight: 600, color: "#F0EDE8", marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px" }}><HiOutlineColorSwatch /> Şablon & Genel</h3>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)", marginBottom: "6px", display: "block" }}>Tasarım Şablonu</label>
                <select 
                  value={templateId} 
                  onChange={(e) => {
                    setTemplateId(e.target.value);
                    setConfig({ ...config, ...(TEMPLATE_DEFAULTS[e.target.value] || {}) });
                  }} 
                  style={{...inputStyle, WebkitAppearance: "none"}}
                >
                  <option value="klasik-retro">Koyu Gül Kurusu</option>
                  <option value="romantik-kirmizi">Romantik Kırmızı</option>
                  <option value="modern-minimal">Modern Minimal</option>
                  <option value="sinematik-ask">Sinematik Aşk</option>
                  <option value="premium-emerald">Zümrüt Yeşili</option>
                </select>
              </div>
              
              <div style={{ display: "flex", gap: "12px" }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)", marginBottom: "6px", display: "block" }}>1. Kişi</label>
                  <input value={(config.coupleNames || "").split("\n&\n")[0] || ""} onChange={e => handleCoupleNamesChange(0, e.target.value)} style={inputStyle} placeholder="Romeo" />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)", marginBottom: "6px", display: "block" }}>2. Kişi</label>
                  <input value={(config.coupleNames || "").split("\n&\n")[1] || ""} onChange={e => handleCoupleNamesChange(1, e.target.value)} style={inputStyle} placeholder="Juliet" />
                </div>
              </div>

              <div style={{ marginTop: "12px" }}>
                <label style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)", marginBottom: "6px", display: "block" }}>Özel Gün (Tarih)</label>
                <input value={config.specialDate || ""} onChange={e => setConfig({...config, specialDate: e.target.value})} style={inputStyle} placeholder="Örn: 14 Şubat 2025" />
              </div>
            </div>
          </div>

          <div style={uiCard}>
            <h3 style={{ fontSize: "15px", fontWeight: 600, color: "#F0EDE8", marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px" }}><HiOutlineColorSwatch /> Renkler</h3>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", flex: "1 1 45%" }}>
                <input type="color" value={config.bgColor || "#09090b"} onChange={e => setConfig({...config, bgColor: e.target.value})} style={{ width: "40px", height: "40px", borderRadius: "8px", border: "none", padding: 0, background: "transparent", cursor: "pointer" }} />
                <span style={{ fontSize: "13px", color: "#F0EDE8" }}>Arka Plan</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", flex: "1 1 45%" }}>
                <input type="color" value={config.accentColor || "#C9A84C"} onChange={e => setConfig({...config, accentColor: e.target.value})} style={{ width: "40px", height: "40px", borderRadius: "8px", border: "none", padding: 0, background: "transparent", cursor: "pointer" }} />
                <span style={{ fontSize: "13px", color: "#F0EDE8" }}>Aksan</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", flex: "1 1 45%" }}>
                <input type="color" value={config.textColor || "#ffffff"} onChange={e => setConfig({...config, textColor: e.target.value})} style={{ width: "40px", height: "40px", borderRadius: "8px", border: "none", padding: 0, background: "transparent", cursor: "pointer" }} />
                <span style={{ fontSize: "13px", color: "#F0EDE8" }}>Metin Rengi</span>
              </div>
            </div>
          </div>

          <div style={uiCard}>
            <h3 style={{ fontSize: "15px", fontWeight: 600, color: "#F0EDE8", marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px" }}><HiOutlineMusicNote /> Müzik & Ses</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "12px", cursor: "pointer" }}>
                <input type="checkbox" checked={config.musicWidgetEnabled !== false} onChange={e => setConfig({...config, musicWidgetEnabled: e.target.checked})} style={{ width: "18px", height: "18px", accentColor: "#C9A84C" }} />
                <span style={{ fontSize: "14px", color: "#F0EDE8" }}>Arka Plan Müziği Açık</span>
              </label>
              {config.musicWidgetEnabled !== false && (
                <>
                  <input value={config.musicUrl || ""} onChange={e => setConfig({...config, musicUrl: e.target.value})} placeholder="Müzik Linki (Örn: mp3 URL'si)" style={inputStyle} />
                  <div style={{ display: "flex", gap: "12px" }}>
                    <select value={config.musicWidgetPosition || "bottom-left"} onChange={e => setConfig({...config, musicWidgetPosition: e.target.value})} style={{...inputStyle, flex: 1}}>
                      <option value="bottom-left">Sol Alt</option>
                      <option value="bottom-right">Sağ Alt</option>
                      <option value="top-left">Sol Üst</option>
                      <option value="top-right">Sağ Üst</option>
                    </select>
                    <select value={config.musicWidgetType || "vinyl"} onChange={e => setConfig({...config, musicWidgetType: e.target.value})} style={{...inputStyle, flex: 1}}>
                      <option value="vinyl">Plak (Dönen)</option>
                      <option value="minimal">Minimal İkon</option>
                    </select>
                  </div>
                </>
              )}
            </div>
          </div>

          <div style={uiCard}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
              <h3 style={{ fontSize: "15px", fontWeight: 600, color: "#F0EDE8", display: "flex", alignItems: "center", gap: "8px" }}><HiOutlinePhotograph /> Anılarımız</h3>
              <button onClick={handleAddMemory} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "20px", padding: "6px 12px", color: "#F0EDE8", fontSize: "12px", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px" }}><HiPlus /> Ekle</button>
            </div>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              {memories.map((m, idx) => (
                <div key={m.id} style={{ background: "rgba(0,0,0,0.2)", borderRadius: "12px", padding: "16px", border: "1px solid rgba(255,255,255,0.04)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
                    <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)" }}>Anı {idx + 1}</span>
                    <button onClick={() => setMemories(memories.filter(x => x.id !== m.id))} style={{ background: "none", border: "none", color: "#E8A0A0", cursor: "pointer" }}><HiTrash /></button>
                  </div>
                  <input value={m.title || ""} onChange={e => { const nm = [...memories]; nm[idx].title = e.target.value; setMemories(nm); }} placeholder="Başlık" style={{...inputStyle, marginBottom: "8px", padding: "10px 14px"}} />
                  <input value={m.date || ""} onChange={e => { const nm = [...memories]; nm[idx].date = e.target.value; setMemories(nm); }} placeholder="Tarih" style={{...inputStyle, marginBottom: "8px", padding: "10px 14px"}} />
                  <textarea value={m.description || ""} onChange={e => { const nm = [...memories]; nm[idx].description = e.target.value; setMemories(nm); }} placeholder="Açıklama" rows={2} style={{...inputStyle, resize: "none", padding: "10px 14px", marginBottom: "8px"}} />
                  <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                    <input value={m.photo || ""} onChange={e => { const nm = [...memories]; nm[idx].photo = e.target.value; setMemories(nm); }} placeholder="Fotoğraf Linki (URL)" style={{...inputStyle, padding: "10px 14px", flex: 1}} />
                    <label style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", padding: "10px 14px", cursor: "pointer", display: "flex", alignItems: "center", color: "#F0EDE8", fontSize: "12px", whiteSpace: "nowrap" }}>
                      <HiOutlinePhotograph size={16} style={{ marginRight: "6px" }} /> Yükle
                      <input type="file" accept="image/*" style={{ display: "none" }} onChange={e => { if (e.target.files && e.target.files[0]) handleFileUpload(idx, e.target.files[0]); }} />
                    </label>
                  </div>
                </div>
              ))}
              {memories.length === 0 && <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.3)", textAlign: "center", padding: "20px 0" }}>Henüz anı eklemediniz.</p>}
            </div>
          </div>

          <div style={uiCard}>
             <h3 style={{ fontSize: "15px", fontWeight: 600, color: "#F0EDE8", marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px" }}><HiOutlineSparkles /> Efektler</h3>
             <label style={{ display: "flex", alignItems: "center", gap: "12px", cursor: "pointer", marginBottom: "16px" }}>
                <input type="checkbox" checked={config.particlesEnabled !== false} onChange={e => setConfig({...config, particlesEnabled: e.target.checked})} style={{ width: "18px", height: "18px", accentColor: "#C9A84C" }} />
                <span style={{ fontSize: "14px", color: "#F0EDE8" }}>Arka Plan Partikülleri</span>
             </label>
             {config.particlesEnabled !== false && (
                <div style={{ display: "flex", gap: "12px" }}>
                  <select value={config.particlesType || "hearts"} onChange={e => setConfig({...config, particlesType: e.target.value})} style={{...inputStyle, flex: 1}}>
                    <option value="hearts" style={{ background: "#09090b", color: "#F0EDE8" }}>Kalpler</option>
                    <option value="stars" style={{ background: "#09090b", color: "#F0EDE8" }}>Yıldızlar</option>
                    <option value="snow" style={{ background: "#09090b", color: "#F0EDE8" }}>Kar Tanesi</option>
                    <option value="bubbles" style={{ background: "#09090b", color: "#F0EDE8" }}>Baloncuklar</option>
                    <option value="fireflies" style={{ background: "#09090b", color: "#F0EDE8" }}>Ateş Böcekleri</option>
                  </select>
                  <input type="number" min={5} max={50} value={config.particlesDensity || 20} onChange={e => setConfig({...config, particlesDensity: Number(e.target.value)})} style={{...inputStyle, width: "80px"}} title="Yoğunluk" />
                </div>
             )}
          </div>

        </div>

        {/* RIGHT PANE: Live Preview */}
        <div style={{ flex: 1, background: "#000", position: "relative" }}>
          <iframe
            src={getPreviewUrl()}
            style={{ width: "100%", height: "100%", border: "none" }}
            title="Şablon Önizleme"
          />
        </div>
      </div>

      {/* MODAL: Satın Alma & Paket Seçimi */}
      <AnimatePresence>
        {showPackageModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: "fixed", inset: 0, zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.8)", backdropFilter: "blur(8px)", padding: "24px" }}
            onClick={(e) => { if (e.target === e.currentTarget) setShowPackageModal(false); }}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
              style={{ background: "#0B0F1A", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "24px", width: "100%", maxWidth: "500px", overflow: "hidden", position: "relative" }}
            >
              <button onClick={() => setShowPackageModal(false)} style={{ position: "absolute", top: "20px", right: "20px", background: "none", border: "none", color: "rgba(255,255,255,0.5)", cursor: "pointer" }}><HiX size={24} /></button>
              
              <div style={{ padding: "40px 32px 32px" }}>
                <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "28px", color: "#C9A84C", marginBottom: "12px", textAlign: "center" }}>Hemen Hayata Geçir</h2>
                <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "14px", textAlign: "center", marginBottom: "32px", lineHeight: 1.6 }}>Sayfanız hazır! Paketinizi seçip ödeme adımına geçerek sayfanızı tüm sevdiklerinizle paylaşabilirsiniz.</p>
                
                <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "32px" }}>
                  {PACKAGES.map((pkg) => (
                    <button
                      key={pkg.name}
                      onClick={() => setSelectedPackage(pkg.name)}
                      style={{
                        padding: "20px", borderRadius: "16px", border: "1px solid",
                        borderColor: selectedPackage === pkg.name ? "#C9A84C" : "rgba(255,255,255,0.08)",
                        background: selectedPackage === pkg.name ? "rgba(201,168,76,0.05)" : "rgba(255,255,255,0.02)",
                        color: "#F0EDE8", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between",
                        transition: "all 0.2s", textAlign: "left"
                      }}
                    >
                      <div>
                        <div style={{ fontSize: "16px", fontWeight: selectedPackage === pkg.name ? 600 : 500, color: selectedPackage === pkg.name ? "#C9A84C" : "#F0EDE8", marginBottom: "4px" }}>{pkg.name}</div>
                        <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.4)" }}>{pkg.desc}</div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <span style={{ fontSize: "11px", padding: "4px 10px", borderRadius: "20px", background: selectedPackage === pkg.name ? "rgba(201,168,76,0.15)" : "rgba(255,255,255,0.05)", color: selectedPackage === pkg.name ? "#C9A84C" : "rgba(255,255,255,0.5)", fontWeight: 600, letterSpacing: "0.05em" }}>{pkg.badge}</span>
                        <div style={{ width: "24px", height: "24px", borderRadius: "50%", border: `2px solid ${selectedPackage === pkg.name ? "#C9A84C" : "rgba(255,255,255,0.2)"}`, display: "flex", alignItems: "center", justifyContent: "center", background: selectedPackage === pkg.name ? "#C9A84C" : "transparent" }}>
                          {selectedPackage === pkg.name && <HiOutlineCheck size={14} color="#0B0F1A" style={{ strokeWidth: 3 }} />}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => window.open(`https://ig.me/m/birlikteydikcom`, "_blank")}
                  style={{ width: "100%", padding: "16px", background: "#C9A84C", color: "#0B0F1A", border: "none", borderRadius: "12px", fontSize: "15px", fontWeight: 600, cursor: "pointer", transition: "opacity 0.2s" }}
                  onMouseEnter={e => e.currentTarget.style.opacity = "0.9"}
                  onMouseLeave={e => e.currentTarget.style.opacity = "1"}
                >
                  Ödemeye Yönlendir (Instagram)
                </button>
                <p style={{ textAlign: "center", fontSize: "12px", color: "rgba(255,255,255,0.3)", marginTop: "16px" }}>
                  Butona tıkladığınızda sipariş kaydınız oluşacak ve ödeme için Instagram DM hesabımıza yönlendirileceksiniz.
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
