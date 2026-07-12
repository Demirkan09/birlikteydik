"use client";

import { HiOutlineTrash, HiOutlineLockClosed, HiOutlineEye, HiOutlineEyeOff } from "react-icons/hi";
import { useEffect, useState } from "react";
import { C } from "../../_utils/constants";
import { ProfileInput } from "../ProfileInput";

function useWindowWidth() {
  const [width, setWidth] = useState<number>(typeof window !== "undefined" ? window.innerWidth : 1024);
  useEffect(() => {
    const handler = () => setWidth(window.innerWidth);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);
  return width;
}

export function DangerZoneTab({
  deleteConfirmText,
  setDeleteConfirmText,
  deletePassword,
  setDeletePassword,
  handleDeleteAccount,
  loading,
  errors,
}: {
  deleteConfirmText: string;
  setDeleteConfirmText: (v: string) => void;
  deletePassword: string;
  setDeletePassword: (v: string) => void;
  handleDeleteAccount: () => void;
  loading: boolean;
  errors: Record<string, string>;
}) {
  const isMobile = useWindowWidth() < 768;
  const [showDeletePass, setShowDeletePass] = useState(false);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
      <div>
        <h2 style={{ fontFamily: "'Cormorant Garamond', 'Cormorant Garamond Fallback', serif", fontSize: "1.6rem", fontWeight: 500, color: "#E8A0A0", marginBottom: "8px" }}>
          Tehlikeli Bölge
        </h2>
        <p style={{ fontFamily: "var(--font-inter), sans-serif", fontSize: "12.5px", color: C.muted, fontWeight: 300 }}>
          Bu alandaki işlemler geri alınamaz. Lütfen dikkatli ilerleyin.
        </p>
      </div>

      <div style={{ background: "rgba(232,160,160,0.03)", border: "1px solid rgba(232,160,160,0.25)", borderRadius: "16px", padding: "24px", display: "flex", flexDirection: "column", gap: "20px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <h4 style={{ fontFamily: "var(--font-inter), sans-serif", fontSize: "13.5px", color: "#E8A0A0", fontWeight: 500 }}>
            Hesabı Kalıcı Olarak Sil
          </h4>
          <p style={{ fontFamily: "var(--font-inter), sans-serif", fontSize: "12.5px", color: "rgba(240,237,232,0.4)", fontWeight: 300, lineHeight: 1.6 }}>
            Hesabınızı sildiğinizde, birlikteydik.com üzerinde oluşturduğunuz tüm anılar, kişisel veriler ve ayarlar geri döndürülemez biçimde tamamen silinir.
          </p>
        </div>

        <div style={{ height: "1px", background: "rgba(232,160,160,0.15)" }} />

        {/* Delete verification fields */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {errors.delete && (
            <div style={{ padding: "10px 14px", borderRadius: "8px", background: "rgba(232,160,160,0.08)", border: `1px solid ${C.error}22`, color: C.error, fontSize: "12.5px" }}>
              {errors.delete}
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "16px" }}>
            <ProfileInput
              label="Onaylama Kelimesi" value={deleteConfirmText} onChange={setDeleteConfirmText}
              placeholder="Devam etmek için 'sil' yazın" icon={<HiOutlineTrash size={15} />} error={errors.deleteConfirmText}
            />
            <ProfileInput
              label="Şifreniz" type={showDeletePass ? "text" : "password"} value={deletePassword} onChange={setDeletePassword}
              placeholder="Mevcut şifreniz" icon={<HiOutlineLockClosed size={15} />} error={errors.deletePassword}
              rightElement={<span onClick={() => setShowDeletePass(!showDeletePass)} style={{ cursor: "pointer", display: "flex" }}>{showDeletePass ? <HiOutlineEyeOff size={15} /> : <HiOutlineEye size={15} />}</span>}
            />
          </div>

          <button
            onClick={handleDeleteAccount} disabled={loading}
            style={{
              padding: "13px 24px", borderRadius: "30px", border: "none",
              background: loading ? "rgba(232,160,160,0.4)" : "#E8A0A0", color: "#0B0F1A",
              fontFamily: "var(--font-inter), sans-serif", fontSize: "12.5px", letterSpacing: "0.08em",
              textTransform: "uppercase", fontWeight: 600, cursor: loading ? "not-allowed" : "pointer",
              transition: "all 0.2s", alignSelf: isMobile ? "stretch" : "flex-start", marginTop: "8px",
              display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
            }}
            onMouseEnter={(e) => { if (!loading) e.currentTarget.style.opacity = "0.85"; }}
            onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
          >
            <HiOutlineTrash size={15} />
            <span>{loading ? "Hesap Siliniyor..." : "Hesabımı Kalıcı Olarak Sil"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
