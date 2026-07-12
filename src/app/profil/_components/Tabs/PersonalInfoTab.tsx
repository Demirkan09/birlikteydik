"use client";

import { useEffect, useState } from "react";
import { HiOutlineUser, HiOutlineMail, HiOutlineLockClosed, HiOutlineEye, HiOutlineEyeOff } from "react-icons/hi";
import { C } from "../../_utils/constants";
import { ProfileInput } from "../ProfileInput";
import { User } from "../../types";

function useWindowWidth() {
  const [width, setWidth] = useState<number>(typeof window !== "undefined" ? window.innerWidth : 1024);
  useEffect(() => {
    const handler = () => setWidth(window.innerWidth);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);
  return width;
}

export function PersonalInfoTab({
  user,
  name,
  setName,
  email,
  setEmail,
  currentPassword,
  setCurrentPassword,
  newPassword,
  setNewPassword,
  newPasswordConfirm,
  setNewPasswordConfirm,
  handleUpdateProfile,
  loading,
  errors,
  handleSendVerification,
  verificationLoading,
  verificationSuccess,
}: {
  user: User;
  name: string;
  setName: (v: string) => void;
  email: string;
  setEmail: (v: string) => void;
  currentPassword: string;
  setCurrentPassword: (v: string) => void;
  newPassword: string;
  setNewPassword: (v: string) => void;
  newPasswordConfirm: string;
  setNewPasswordConfirm: (v: string) => void;
  handleUpdateProfile: () => void;
  loading: boolean;
  errors: Record<string, string>;
  handleSendVerification: () => void;
  verificationLoading: boolean;
  verificationSuccess: string;
}) {
  const isMobile = useWindowWidth() < 768;
  const [showPass1, setShowPass1] = useState(false);
  const [showPass2, setShowPass2] = useState(false);
  const [showPass3, setShowPass3] = useState(false);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
      <div>
        <h2 style={{ fontFamily: "'Cormorant Garamond', 'Cormorant Garamond Fallback', serif", fontSize: "1.6rem", fontWeight: 500, color: C.text, marginBottom: "8px" }}>
          Kişisel <em style={{ color: C.gold, fontStyle: "italic" }}>Bilgiler</em>
        </h2>
        <p style={{ fontFamily: "var(--font-inter), sans-serif", fontSize: "12.5px", color: C.muted, fontWeight: 300 }}>
          Hesap bilgilerinizi güncelleyebilir ve şifrenizi değiştirebilirsiniz.
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "16px" }}>
          <ProfileInput label="Adınız Soyadınız" value={name} onChange={setName} icon={<HiOutlineUser size={15} />} error={errors.name} />
          <div style={{ display: "flex", flexDirection: "column" }}>
            <ProfileInput label="E-posta Adresiniz" type="email" value={email} onChange={setEmail} icon={<HiOutlineMail size={15} />} error={errors.email} />
            
            {/* E-posta Doğrulama Durumu */}
            {!user.isVerified && (
              <div style={{
                marginTop: "8px",
                padding: "10px 14px",
                background: "rgba(232,160,160,0.06)",
                border: "1px solid rgba(232,160,160,0.18)",
                borderRadius: "10px",
                display: "flex",
                flexDirection: "column",
                gap: "8px",
              }}>
                <span style={{ fontSize: "12px", color: "#E8A0A0", display: "flex", alignItems: "center", gap: "6px", fontFamily: "var(--font-inter), sans-serif", fontWeight: 400 }}>
                  ⚠ E-posta adresiniz doğrulanmadı.
                </span>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    handleSendVerification();
                  }}
                  disabled={verificationLoading}
                  style={{
                    alignSelf: "flex-start",
                    padding: "6px 14px",
                    borderRadius: "20px",
                    border: "1px solid #C9A84C",
                    background: "transparent",
                    color: "#C9A84C",
                    fontSize: "11px",
                    cursor: verificationLoading ? "not-allowed" : "pointer",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    fontFamily: "var(--font-inter), sans-serif",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => { if (!verificationLoading) e.currentTarget.style.background = "rgba(201,168,76,0.1)"; }}
                  onMouseLeave={(e) => { if (!verificationLoading) e.currentTarget.style.background = "transparent"; }}
                >
                  {verificationLoading ? "Gönderiliyor..." : "Doğrulama Kodu Gönder"}
                </button>
                {verificationSuccess && (
                  <span style={{ fontSize: "12px", color: C.success, fontFamily: "var(--font-inter), sans-serif", fontWeight: 300, marginTop: "2px" }}>
                    {verificationSuccess}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        <div style={{ height: "1px", background: "rgba(255,255,255,0.06)", margin: "8px 0" }} />

        <div>
          <h3 style={{ fontFamily: "'Cormorant Garamond', 'Cormorant Garamond Fallback', serif", fontSize: "1.25rem", color: C.gold, fontWeight: 500, marginBottom: "14px" }}>
            Şifre Güncelleme <span style={{ fontFamily: "var(--font-inter), sans-serif", fontSize: "10.5px", color: "rgba(240,237,232,0.22)", fontWeight: 300, marginLeft: "4px" }}>(İsteğe Bağlı)</span>
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <ProfileInput
              label="Mevcut Şifreniz" type={showPass1 ? "text" : "password"} value={currentPassword} onChange={setCurrentPassword}
              icon={<HiOutlineLockClosed size={15} />} placeholder="••••••••" error={errors.currentPassword}
              rightElement={<span onClick={() => setShowPass1(!showPass1)}>{showPass1 ? <HiOutlineEyeOff size={15} /> : <HiOutlineEye size={15} />}</span>}
            />
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "16px" }}>
              <ProfileInput
                label="Yeni Şifre" type={showPass2 ? "text" : "password"} value={newPassword} onChange={setNewPassword}
                icon={<HiOutlineLockClosed size={15} />} placeholder="En az 8 karakter" error={errors.newPassword}
                rightElement={<span onClick={() => setShowPass2(!showPass2)}>{showPass2 ? <HiOutlineEyeOff size={15} /> : <HiOutlineEye size={15} />}</span>}
              />
              <ProfileInput
                label="Yeni Şifre Tekrarı" type={showPass3 ? "text" : "password"} value={newPasswordConfirm} onChange={setNewPasswordConfirm}
                icon={<HiOutlineLockClosed size={15} />} placeholder="••••••••" error={errors.newPasswordConfirm}
                rightElement={<span onClick={() => setShowPass3(!showPass3)}>{showPass3 ? <HiOutlineEyeOff size={15} /> : <HiOutlineEye size={15} />}</span>}
              />
            </div>
          </div>
        </div>

        <button
          onClick={handleUpdateProfile} disabled={loading}
          style={{
            padding: "13px 28px", borderRadius: "30px", border: "none",
            background: loading ? "rgba(201,168,76,0.5)" : C.gold, color: "#0B0F1A",
            fontFamily: "var(--font-inter), sans-serif", fontSize: "12.5px", letterSpacing: "0.1em",
            textTransform: "uppercase", fontWeight: 600, cursor: loading ? "not-allowed" : "pointer",
            transition: "all 0.2s", alignSelf: isMobile ? "stretch" : "flex-start", marginTop: "10px",
            display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
          }}
          onMouseEnter={(e) => { if (!loading) e.currentTarget.style.opacity = "0.85"; }}
          onMouseLeave={(e) => { if (!loading) e.currentTarget.style.opacity = "1"; }}
        >
          {loading ? <span style={{ width: "14px", height: "14px", border: "2px solid #0B0F1A44", borderTopColor: "#0B0F1A", borderRadius: "50%", animation: "spin 0.7s linear infinite", display: "inline-block" }} /> : null}
          <span>{loading ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}</span>
        </button>
      </div>
    </div>
  );
}
