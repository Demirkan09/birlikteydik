"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Memory {
  id: number;
  image: string;       // /uploads/...
  title: string;
  description: string;
  date: string;
}

interface PortalData {
  valid: boolean;
  status: string;
  pageSlug: string;
  templateId: string;
  config: Record<string, any>;
  expiresAt: string;
  existing: {
    coupleNames: string | null;
    specialDate: string | null;
    tagline: string | null;
    musicUrl: string | null;
    memories: Memory[];
  };
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const C = {
  bg: "#0B0F1A",
  card: "rgba(255,255,255,0.04)",
  border: "rgba(255,255,255,0.08)",
  gold: "#C9A84C",
  text: "#F0EDE8",
  muted: "rgba(240,237,232,0.45)",
  subtle: "rgba(240,237,232,0.18)",
  error: "#EF4444",
  success: "#34D399",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function inputStyle(focused?: boolean): React.CSSProperties {
  return {
    width: "100%",
    padding: "12px 16px",
    background: "rgba(255,255,255,0.04)",
    border: `1px solid ${focused ? C.gold : C.border}`,
    borderRadius: "12px",
    color: C.text,
    fontSize: "14px",
    outline: "none",
    transition: "border-color 0.2s",
    boxSizing: "border-box",
    fontFamily: "Inter, sans-serif",
  };
}

function labelStyle(): React.CSSProperties {
  return {
    display: "block",
    fontSize: "11px",
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    color: C.muted,
    marginBottom: "8px",
    fontWeight: 500,
  };
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function GoldDot() {
  return <span style={{ display: "inline-block", width: 4, height: 4, borderRadius: "50%", background: C.gold, margin: "0 6px 2px", verticalAlign: "middle" }} />;
}

function StatusScreen({ icon, title, subtitle }: { icon: string; title: string; subtitle: string }) {
  return (
    <div style={{ minHeight: "100vh", background: C.bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 24px", textAlign: "center" }}>
      <div style={{ fontSize: "56px", marginBottom: "24px" }}>{icon}</div>
      <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "28px", fontWeight: 400, color: C.text, margin: "0 0 12px" }}>{title}</p>
      <p style={{ fontSize: "14px", color: C.muted, maxWidth: "380px", lineHeight: 1.7 }}>{subtitle}</p>
    </div>
  );
}

// ─── Photo Card ───────────────────────────────────────────────────────────────
function PhotoCard({
  memory,
  index,
  total,
  onUpdate,
  onRemove,
  onMoveUp,
  onMoveDown,
  uploading,
}: {
  memory: Memory;
  index: number;
  total: number;
  onUpdate: (id: number, field: keyof Memory, value: string) => void;
  onRemove: (id: number) => void;
  onMoveUp: (index: number) => void;
  onMoveDown: (index: number) => void;
  uploading: boolean;
}) {
  const [titleFocused, setTitleFocused] = useState(false);
  const [descFocused, setDescFocused] = useState(false);
  const [dateFocused, setDateFocused] = useState(false);

  return (
    <div style={{
      background: "rgba(255,255,255,0.03)",
      border: `1px solid ${C.border}`,
      borderRadius: "16px",
      overflow: "hidden",
      transition: "border-color 0.2s",
    }}>
      {/* Image preview */}
      <div style={{ position: "relative", aspectRatio: "4/3", background: "rgba(255,255,255,0.02)", overflow: "hidden" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={memory.image}
          alt={`Fotoğraf ${index + 1}`}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
        {/* Order controls */}
        <div style={{ position: "absolute", top: "10px", left: "10px", display: "flex", gap: "4px" }}>
          {index > 0 && (
            <button
              onClick={() => onMoveUp(index)}
              style={{ width: "28px", height: "28px", background: "rgba(0,0,0,0.6)", border: `1px solid rgba(255,255,255,0.15)`, borderRadius: "8px", color: C.text, cursor: "pointer", fontSize: "13px", display: "flex", alignItems: "center", justifyContent: "center" }}
              title="Yukarı taşı"
            >↑</button>
          )}
          {index < total - 1 && (
            <button
              onClick={() => onMoveDown(index)}
              style={{ width: "28px", height: "28px", background: "rgba(0,0,0,0.6)", border: `1px solid rgba(255,255,255,0.15)`, borderRadius: "8px", color: C.text, cursor: "pointer", fontSize: "13px", display: "flex", alignItems: "center", justifyContent: "center" }}
              title="Aşağı taşı"
            >↓</button>
          )}
        </div>
        {/* Remove button */}
        <button
          onClick={() => onRemove(memory.id)}
          style={{ position: "absolute", top: "10px", right: "10px", width: "28px", height: "28px", background: "rgba(239,68,68,0.7)", border: "none", borderRadius: "8px", color: "#fff", cursor: "pointer", fontSize: "15px", display: "flex", alignItems: "center", justifyContent: "center" }}
          title="Fotoğrafı kaldır"
        >×</button>
        {/* Index badge */}
        <div style={{ position: "absolute", bottom: "10px", left: "10px", background: "rgba(0,0,0,0.55)", border: `1px solid ${C.gold}55`, borderRadius: "8px", padding: "3px 10px", fontSize: "11px", color: C.gold, letterSpacing: "0.08em" }}>
          {index + 1} / {total}
        </div>
      </div>

      {/* Fields */}
      <div style={{ padding: "16px" }}>
        <div style={{ marginBottom: "12px" }}>
          <label style={labelStyle()}>Başlık <span style={{ color: C.subtle }}>(opsiyonel)</span></label>
          <input
            type="text"
            value={memory.title}
            onChange={e => onUpdate(memory.id, "title", e.target.value)}
            onFocus={() => setTitleFocused(true)}
            onBlur={() => setTitleFocused(false)}
            placeholder="Ör: İlk Buluşmamız"
            style={inputStyle(titleFocused)}
          />
        </div>
        <div style={{ marginBottom: "12px" }}>
          <label style={labelStyle()}>Açıklama <span style={{ color: C.subtle }}>(opsiyonel)</span></label>
          <textarea
            value={memory.description}
            onChange={e => onUpdate(memory.id, "description", e.target.value)}
            onFocus={() => setDescFocused(true)}
            onBlur={() => setDescFocused(false)}
            placeholder="Bu fotoğraf hakkında kısa bir şeyler yazın..."
            rows={2}
            style={{ ...inputStyle(descFocused), resize: "vertical" }}
          />
        </div>
        <div>
          <label style={labelStyle()}>Tarih <span style={{ color: C.subtle }}>(opsiyonel)</span></label>
          <input
            type="text"
            value={memory.date}
            onChange={e => onUpdate(memory.id, "date", e.target.value)}
            onFocus={() => setDateFocused(true)}
            onBlur={() => setDateFocused(false)}
            placeholder="Ör: 14 Şubat 2024"
            style={inputStyle(dateFocused)}
          />
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function PortalPage({ params }: { params: Promise<{ token: string }> }) {
  const [token, setToken] = useState<string>("");
  const [portalData, setPortalData] = useState<PortalData | null>(null);
  const [loadState, setLoadState] = useState<"loading" | "valid" | "expired" | "invalid" | "success">("loading");

  // Form state
  const [coupleNames, setCoupleNames] = useState("");
  const [specialDate, setSpecialDate] = useState("");
  const [tagline, setTagline] = useState("");
  const [musicUrl, setMusicUrl] = useState("");
  const [memories, setMemories] = useState<Memory[]>([]);

  // Upload state
  const [uploadingIds, setUploadingIds] = useState<Set<number>>(new Set());
  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const dropRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Submit state
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  // Input focus states
  const [coupleNamesFocused, setCoupleNamesFocused] = useState(false);
  const [specialDateFocused, setSpecialDateFocused] = useState(false);
  const [taglineFocused, setTaglineFocused] = useState(false);
  const [musicUrlFocused, setMusicUrlFocused] = useState(false);

  // Load token from params
  useEffect(() => {
    params.then(p => setToken(p.token));
  }, [params]);

  // Fetch portal data
  useEffect(() => {
    if (!token) return;
    fetch(`/api/portal/${token}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          setLoadState(data.error.includes("süresi") ? "expired" : "invalid");
          return;
        }
        setPortalData(data);
        // Pre-fill existing data
        const ex = data.existing;
        if (ex.coupleNames) setCoupleNames(ex.coupleNames);
        if (ex.specialDate) setSpecialDate(ex.specialDate);
        if (ex.tagline) setTagline(ex.tagline);
        if (ex.musicUrl) setMusicUrl(ex.musicUrl);
        if (ex.memories && ex.memories.length > 0) setMemories(ex.memories);
        setLoadState("valid");
      })
      .catch(() => setLoadState("invalid"));
  }, [token]);

  // Upload files
  const uploadFiles = useCallback(async (files: FileList | File[]) => {
    if (!token) return;
    setUploadError("");
    const fileArray = Array.from(files);
    const maxPhotos = 10;
    const remaining = maxPhotos - memories.length;

    if (remaining <= 0) {
      setUploadError("En fazla 10 fotoğraf yükleyebilirsiniz.");
      return;
    }

    const toUpload = fileArray.slice(0, remaining);
    if (fileArray.length > remaining) {
      setUploadError(`${fileArray.length} fotoğraf seçtiniz ama sadece ${remaining} tane daha ekleyebilirsiniz.`);
    }

    for (const file of toUpload) {
      const tempId = Date.now() + Math.random();
      const tempMemory: Memory = {
        id: tempId,
        image: URL.createObjectURL(file),
        title: "",
        description: "",
        date: "",
      };

      setMemories(prev => [...prev, tempMemory]);
      setUploadingIds(prev => new Set(prev).add(tempId));

      try {
        const formData = new FormData();
        formData.append("token", token);
        formData.append("file", file);

        const res = await fetch("/api/portal/upload", { method: "POST", body: formData });
        const data = await res.json();

        if (!res.ok) {
          setMemories(prev => prev.filter(m => m.id !== tempId));
          setUploadError(data.error || "Fotoğraf yüklenemedi.");
        } else {
          setMemories(prev =>
            prev.map(m =>
              m.id === tempId ? { ...m, image: data.url } : m
            )
          );
        }
      } catch {
        setMemories(prev => prev.filter(m => m.id !== tempId));
        setUploadError("Fotoğraf yüklenirken bir hata oluştu.");
      } finally {
        setUploadingIds(prev => { const s = new Set(prev); s.delete(tempId); return s; });
      }
    }
  }, [token, memories.length]);

  // Drag & drop handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => setIsDragging(false), []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files.length > 0) uploadFiles(e.dataTransfer.files);
  }, [uploadFiles]);

  // Memory operations
  const updateMemory = useCallback((id: number, field: keyof Memory, value: string) => {
    setMemories(prev => prev.map(m => m.id === id ? { ...m, [field]: value } : m));
  }, []);

  const removeMemory = useCallback((id: number) => {
    setMemories(prev => prev.filter(m => m.id !== id));
  }, []);

  const moveUp = useCallback((index: number) => {
    if (index === 0) return;
    setMemories(prev => {
      const arr = [...prev];
      [arr[index - 1], arr[index]] = [arr[index], arr[index - 1]];
      return arr;
    });
  }, []);

  const moveDown = useCallback((index: number) => {
    setMemories(prev => {
      if (index >= prev.length - 1) return prev;
      const arr = [...prev];
      [arr[index], arr[index + 1]] = [arr[index + 1], arr[index]];
      return arr;
    });
  }, []);

  // Submit
  const handleSubmit = async () => {
    if (!token) return;
    if (memories.length === 0) {
      setSubmitError("En az bir fotoğraf yüklemelisiniz.");
      return;
    }
    if (uploadingIds.size > 0) {
      setSubmitError("Lütfen tüm fotoğrafların yüklenmesini bekleyin.");
      return;
    }

    setSubmitting(true);
    setSubmitError("");

    try {
      const res = await fetch(`/api/portal/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          coupleNames: coupleNames.trim() || null,
          specialDate: specialDate.trim() || null,
          tagline: tagline.trim() || null,
          musicUrl: musicUrl.trim() || null,
          memories: memories.map((m, i) => ({ ...m, id: i + 1 })),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setSubmitError(data.error || "Gönderim sırasında bir hata oluştu.");
        return;
      }
      setLoadState("success");
    } catch {
      setSubmitError("Sunucuya bağlanılamadı. Lütfen tekrar deneyin.");
    } finally {
      setSubmitting(false);
    }
  };

  // ─── Screens ────────────────────────────────────────────────────────────────
  if (loadState === "loading") {
    return (
      <div style={{ minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: "36px", height: "36px", border: `2px solid ${C.border}`, borderTopColor: C.gold, borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (loadState === "expired") {
    return <StatusScreen icon="⌛" title="Bu link süresi dolmuş." subtitle="Lütfen birlikteydik.com ile iletişime geçerek yeni bir link isteyin." />;
  }

  if (loadState === "invalid") {
    return <StatusScreen icon="🔒" title="Geçersiz link." subtitle="Bu bağlantı geçersiz görünüyor. Doğru linki kullandığınızdan emin olun." />;
  }

  if (loadState === "success") {
    return (
      <div style={{ minHeight: "100vh", background: C.bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 24px", textAlign: "center" }}>
        <div style={{ fontSize: "64px", marginBottom: "24px", animation: "pop 0.4s ease" }}>💌</div>
        <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "32px", fontWeight: 400, color: C.text, margin: "0 0 12px" }}>
          Anılarınız <em style={{ color: C.gold }}>Teslim Edildi!</em>
        </p>
        <p style={{ fontSize: "14px", color: C.muted, maxWidth: "420px", lineHeight: 1.8, margin: "0 0 24px" }}>
          Fotoğraflarınız ve bilgileriniz başarıyla gönderildi. En kısa sürede siteniz hazırlanacak. 🎉
        </p>
        <p style={{ fontSize: "12px", color: C.subtle }}>Daha önce gönderdiğiniz içeriklerle değişiklik yapmak isterseniz bu sayfaya tekrar gelebilirsiniz.</p>
        <style>{`@keyframes pop { from { transform: scale(0.5); opacity: 0; } to { transform: scale(1); opacity: 1; } }`}</style>
      </div>
    );
  }

  // ─── Main Form ───────────────────────────────────────────────────────────────
  const isUploading = uploadingIds.size > 0;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Inter:wght@300;400;500;600&display=swap');
        * { box-sizing: border-box; }
        body { margin: 0; background: ${C.bg}; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        input::placeholder, textarea::placeholder { color: rgba(240,237,232,0.25); }
        input, textarea, select { -webkit-appearance: none; }
        ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-track { background: transparent; } ::-webkit-scrollbar-thumb { background: rgba(201,168,76,0.3); border-radius: 2px; }
      `}</style>

      <div style={{ minHeight: "100vh", background: `radial-gradient(ellipse 80% 50% at 20% 0%, rgba(201,168,76,0.06) 0%, transparent 60%), ${C.bg}`, fontFamily: "Inter, sans-serif" }}>
        {/* Header */}
        <header style={{ borderBottom: `1px solid ${C.border}`, padding: "20px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", maxWidth: "760px", margin: "0 auto" }}>
          <div>
            <p style={{ margin: 0, fontSize: "11px", letterSpacing: "0.4em", textTransform: "uppercase", color: C.gold, fontWeight: 500 }}>birlikteydik.com</p>
            <p style={{ margin: "4px 0 0", fontSize: "9px", letterSpacing: "0.2em", color: C.muted, textTransform: "uppercase" }}>Müşteri İçerik Formu</p>
          </div>
          {portalData && (
            <div style={{ textAlign: "right" }}>
              <p style={{ margin: 0, fontSize: "11px", color: C.muted }}>
                Sayfa: <span style={{ color: C.gold }}>/{portalData.pageSlug}</span>
              </p>
            </div>
          )}
        </header>

        <main style={{ maxWidth: "760px", margin: "0 auto", padding: "32px 24px 80px", animation: "fadeUp 0.4s ease" }}>
          {/* Hero */}
          <div style={{ textAlign: "center", marginBottom: "48px" }}>
            <p style={{ margin: "0 0 12px", fontSize: "11px", letterSpacing: "0.2em", textTransform: "uppercase", color: C.gold }}>
              Adım 1 <GoldDot /> Genel Bilgiler <GoldDot /> Adım 2 <GoldDot /> Fotoğraflar <GoldDot /> Adım 3 <GoldDot /> Gönder
            </p>
            <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(28px,5vw,42px)", fontWeight: 400, color: C.text, margin: "0 0 12px", lineHeight: 1.2 }}>
              Anılarınızı <em style={{ color: C.gold }}>Paylaşın</em>
            </h1>
            <p style={{ fontSize: "14px", color: C.muted, maxWidth: "480px", margin: "0 auto", lineHeight: 1.8 }}>
              Aşağıdaki formu doldurun. Bilgiler ve fotoğraflar sitenize aktarılacak.
              Tüm alanlar isteğe bağlıdır — yalnızca fotoğraf zorunludur.
            </p>
          </div>

          {/* ── Section 1: Genel Bilgiler ──────────────────────────────────── */}
          <section style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: "20px", padding: "28px", marginBottom: "24px" }}>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "20px", fontWeight: 400, color: C.text, margin: "0 0 24px" }}>
              💑 Genel Bilgiler <span style={{ fontSize: "13px", color: C.muted, fontFamily: "Inter, sans-serif" }}>(opsiyonel)</span>
            </h2>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "16px", marginBottom: "16px" }}>
              <div>
                <label style={labelStyle()}>Çift İsimleri</label>
                <input
                  type="text"
                  value={coupleNames}
                  onChange={e => setCoupleNames(e.target.value)}
                  onFocus={() => setCoupleNamesFocused(true)}
                  onBlur={() => setCoupleNamesFocused(false)}
                  placeholder="Ör: Ayşe & Mehmet"
                  style={inputStyle(coupleNamesFocused)}
                />
              </div>
              <div>
                <label style={labelStyle()}>Özel Tarih</label>
                <input
                  type="text"
                  value={specialDate}
                  onChange={e => setSpecialDate(e.target.value)}
                  onFocus={() => setSpecialDateFocused(true)}
                  onBlur={() => setSpecialDateFocused(false)}
                  placeholder="Ör: 14 Şubat 2024"
                  style={inputStyle(specialDateFocused)}
                />
              </div>
            </div>

            <div style={{ marginBottom: "16px" }}>
              <label style={labelStyle()}>Kısa Not / Tagline</label>
              <textarea
                value={tagline}
                onChange={e => setTagline(e.target.value)}
                onFocus={() => setTaglineFocused(true)}
                onBlur={() => setTaglineFocused(false)}
                placeholder="Sayfanızda görünecek kısa bir not veya alıntı..."
                rows={2}
                style={{ ...inputStyle(taglineFocused), resize: "vertical" }}
              />
            </div>

            <div>
              <label style={labelStyle()}>Müzik Linki <span style={{ color: C.subtle }}>(Spotify veya YouTube)</span></label>
              <input
                type="url"
                value={musicUrl}
                onChange={e => setMusicUrl(e.target.value)}
                onFocus={() => setMusicUrlFocused(true)}
                onBlur={() => setMusicUrlFocused(false)}
                placeholder="https://open.spotify.com/track/... veya https://youtube.com/watch?v=..."
                style={inputStyle(musicUrlFocused)}
              />
              <p style={{ margin: "6px 0 0", fontSize: "11px", color: C.subtle }}>
                Spotify veya YouTube şarkı/parça linki yapıştırın.
              </p>
            </div>
          </section>

          {/* ── Section 2: Fotoğraflar ──────────────────────────────────────── */}
          <section style={{ marginBottom: "24px" }}>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "20px", fontWeight: 400, color: C.text, margin: "0 0 16px" }}>
              📸 Fotoğraflarınız <span style={{ fontSize: "13px", color: `${C.error}CC`, fontFamily: "Inter, sans-serif" }}>(en az 1 zorunlu)</span>
            </h2>

            {/* Dropzone */}
            <div
              ref={dropRef}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              style={{
                border: `2px dashed ${isDragging ? C.gold : C.border}`,
                borderRadius: "16px",
                padding: "40px 24px",
                textAlign: "center",
                cursor: memories.length >= 10 ? "not-allowed" : "pointer",
                transition: "all 0.2s",
                background: isDragging ? "rgba(201,168,76,0.04)" : "rgba(255,255,255,0.02)",
                marginBottom: "20px",
              }}
            >
              <div style={{ fontSize: "36px", marginBottom: "12px" }}>📷</div>
              <p style={{ margin: "0 0 6px", color: C.text, fontSize: "15px", fontWeight: 500 }}>
                {memories.length >= 10 ? "Maksimum 10 fotoğrafa ulaştınız" : "Fotoğraf seçin veya buraya sürükleyin"}
              </p>
              <p style={{ margin: 0, fontSize: "12px", color: C.muted }}>
                JPG, PNG veya WEBP — Maks. 10MB — En fazla {10 - memories.length} fotoğraf daha
              </p>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              multiple
              style={{ display: "none" }}
              onChange={e => { if (e.target.files) uploadFiles(e.target.files); e.target.value = ""; }}
            />

            {uploadError && (
              <div style={{ padding: "12px 16px", background: `${C.error}18`, border: `1px solid ${C.error}44`, borderRadius: "10px", color: C.error, fontSize: "13px", marginBottom: "16px" }}>
                {uploadError}
              </div>
            )}

            {isUploading && (
              <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "12px 16px", background: "rgba(201,168,76,0.06)", border: `1px solid rgba(201,168,76,0.15)`, borderRadius: "10px", marginBottom: "16px" }}>
                <div style={{ width: "16px", height: "16px", border: `2px solid rgba(201,168,76,0.3)`, borderTopColor: C.gold, borderRadius: "50%", animation: "spin 0.7s linear infinite", flexShrink: 0 }} />
                <span style={{ fontSize: "13px", color: C.muted }}>Fotoğraflar yükleniyor...</span>
              </div>
            )}

            {/* Photo Grid */}
            {memories.length > 0 && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px" }}>
                {memories.map((mem, idx) => (
                  <PhotoCard
                    key={mem.id}
                    memory={mem}
                    index={idx}
                    total={memories.length}
                    onUpdate={updateMemory}
                    onRemove={removeMemory}
                    onMoveUp={moveUp}
                    onMoveDown={moveDown}
                    uploading={uploadingIds.has(mem.id)}
                  />
                ))}
              </div>
            )}
          </section>

          {/* ── Submit ─────────────────────────────────────────────────────── */}
          <section style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: "20px", padding: "28px", textAlign: "center" }}>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "22px", fontWeight: 400, color: C.text, margin: "0 0 8px" }}>
              Hazır mısınız?
            </h2>
            <p style={{ fontSize: "13px", color: C.muted, margin: "0 0 24px", lineHeight: 1.7 }}>
              Gönderdiğinizde içerikleriniz incelemeye alınacak. Siteniz hazırlandıktan sonra bilgilendirileceksiniz.<br />
              <span style={{ color: C.subtle }}>Gönderim yaptıktan sonra tekrar bu sayfaya gelerek değişiklik yapabilirsiniz.</span>
            </p>

            {submitError && (
              <div style={{ padding: "12px 16px", background: `${C.error}18`, border: `1px solid ${C.error}44`, borderRadius: "10px", color: C.error, fontSize: "13px", marginBottom: "20px" }}>
                {submitError}
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={submitting || isUploading}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "10px",
                padding: "16px 48px",
                background: submitting || isUploading ? "rgba(201,168,76,0.3)" : "linear-gradient(135deg, #C9A84C, #e0c068)",
                color: "#0B0F1A",
                border: "none",
                borderRadius: "30px",
                fontSize: "14px",
                fontWeight: 700,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                cursor: submitting || isUploading ? "not-allowed" : "pointer",
                boxShadow: submitting || isUploading ? "none" : "0 4px 24px rgba(201,168,76,0.25)",
                transition: "all 0.2s",
                fontFamily: "Inter, sans-serif",
              }}
            >
              {submitting ? (
                <>
                  <div style={{ width: "16px", height: "16px", border: "2px solid rgba(11,15,26,0.3)", borderTopColor: "#0B0F1A", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
                  Gönderiliyor...
                </>
              ) : (
                <>💌 Anılarımı Gönder</>
              )}
            </button>

            <p style={{ margin: "16px 0 0", fontSize: "11px", color: C.subtle }}>
              {memories.length} fotoğraf seçildi
              {memories.length > 0 && " · Hazır gözüküyor!"}
            </p>
          </section>
        </main>
      </div>
    </>
  );
}
