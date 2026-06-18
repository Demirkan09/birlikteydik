"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HiOutlineLockClosed, HiOutlineEye, HiOutlineEyeOff } from "react-icons/hi";

const C = {
  bg: "#0B0F1A",
  gold: "#C9A84C",
  text: "#F0EDE8",
  muted: "rgba(240,237,232,0.45)",
  border: "rgba(255,255,255,0.08)",
  card: "rgba(255,255,255,0.04)",
  error: "#E8A0A0",
  success: "#86efac",
};

interface PasswordGateProps {
  slug: string;
  children: React.ReactNode;
}

export default function PasswordGate({ slug, children }: PasswordGateProps) {
  const [isChecking, setIsChecking] = useState(true);
  const [isProtected, setIsProtected] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function checkProtection() {
      try {
        // Check session storage first
        if (typeof window !== "undefined") {
          const sessionUnlocked = sessionStorage.getItem(`page_unlocked_${slug}`);
          if (sessionUnlocked === "true") {
            setIsUnlocked(true);
            setIsChecking(false);
            return;
          }
        }

        const res = await fetch(`/api/page-password?slug=${slug}`);
        if (!res.ok) {
          // If page not found or another error, we don't block
          setIsChecking(false);
          return;
        }

        const data = (await res.json()) as { protected: boolean };
        setIsProtected(data.protected);
      } catch (err) {
        console.error("Checking page protection failed:", err);
      } finally {
        setIsChecking(false);
      }
    }

    checkProtection();
  }, [slug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      setError("Lütfen şifrenizi girin.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/page-password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pageSlug: slug, password }),
      });

      const data = (await res.json()) as { verified: boolean; error?: string };

      if (res.ok && data.verified) {
        if (typeof window !== "undefined") {
          sessionStorage.setItem(`page_unlocked_${slug}`, "true");
        }
        setIsUnlocked(true);
      } else {
        setError(data.error || "Şifre hatalı. Lütfen tekrar deneyin.");
      }
    } catch (err) {
      console.error("Password verification error:", err);
      setError("Bağlantı hatası oluştu. Lütfen tekrar deneyin.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // If we are currently loading/checking protection status
  if (isChecking) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          background: C.bg,
          color: C.text,
        }}
      >
        <motion.div
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: "24px",
            color: C.gold,
            letterSpacing: "0.05em",
          }}
        >
          birlikteydik.com
        </motion.div>
      </div>
    );
  }

  // If the page is not protected or has already been unlocked, render children
  if (!isProtected || isUnlocked) {
    return <>{children}</>;
  }

  // Otherwise, show the password gate screen
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: C.bg,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        overflowY: "auto",
      }}
    >
      {/* Decorative subtle background lights */}
      <div
        style={{
          position: "absolute",
          top: "10%",
          left: "20%",
          width: "300px",
          height: "300px",
          borderRadius: "50%",
          background: `radial-gradient(circle, rgba(201, 168, 76, 0.05) 0%, rgba(0,0,0,0) 70%)`,
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "15%",
          right: "15%",
          width: "400px",
          height: "400px",
          borderRadius: "50%",
          background: `radial-gradient(circle, rgba(184, 169, 212, 0.03) 0%, rgba(0,0,0,0) 70%)`,
          pointerEvents: "none",
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        style={{
          width: "100%",
          maxWidth: "440px",
          background: C.card,
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: `1px solid ${C.border}`,
          borderRadius: "24px",
          padding: "40px 32px",
          boxShadow: "0 24px 60px rgba(0, 0, 0, 0.4)",
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "24px",
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Gold Lock Icon inside animated ring */}
        <div
          style={{
            position: "relative",
            width: "80px",
            height: "80px",
            borderRadius: "50%",
            background: "rgba(201, 168, 76, 0.05)",
            border: `1px solid rgba(201, 168, 76, 0.15)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "8px",
          }}
        >
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, ease: "backOut" }}
          >
            <HiOutlineLockClosed size={36} color={C.gold} />
          </motion.div>
        </div>

        {/* Title & Description */}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <h2
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "32px",
              fontWeight: 500,
              color: C.text,
              margin: 0,
              letterSpacing: "0.02em",
            }}
          >
            Bu Sayfa Korumalı
          </h2>
          <p
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "14px",
              color: C.muted,
              lineHeight: "1.6",
              margin: 0,
              padding: "0 10px",
            }}
          >
            Paylaşılan özel anıları ve fotoğraf galerisini görüntülemek için sayfa şifresini girmeniz gerekmektedir.
          </p>
        </div>

        {/* Error Message */}
        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              style={{
                background: "rgba(232, 160, 160, 0.08)",
                border: "1px solid rgba(232, 160, 160, 0.2)",
                borderRadius: "12px",
                padding: "12px 16px",
                color: C.error,
                fontFamily: "'Inter', sans-serif",
                fontSize: "13px",
                width: "100%",
                boxSizing: "border-box",
                textAlign: "left",
              }}
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ width: "100%", display: "flex", flexDirection: "column", gap: "20px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px", textAlign: "left" }}>
            <label
              htmlFor="page-password"
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: "11px",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: C.muted,
                fontWeight: 500,
              }}
            >
              Sayfa Şifresi
            </label>
            <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
              <input
                id="page-password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Şifreyi buraya girin..."
                style={{
                  width: "100%",
                  padding: "14px 48px 14px 16px",
                  background: "rgba(255, 255, 255, 0.03)",
                  border: `1px solid ${C.border}`,
                  borderRadius: "12px",
                  color: C.text,
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "14px",
                  outline: "none",
                  transition: "all 0.2s",
                  boxSizing: "border-box",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = C.gold;
                  e.target.style.background = "rgba(255, 255, 255, 0.05)";
                  e.target.style.boxShadow = "0 0 0 3px rgba(201, 168, 76, 0.1)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = C.border;
                  e.target.style.background = "rgba(255, 255, 255, 0.03)";
                  e.target.style.boxShadow = "none";
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: "absolute",
                  right: "16px",
                  background: "none",
                  border: "none",
                  color: C.muted,
                  cursor: "pointer",
                  display: "flex",
                  padding: 0,
                  transition: "color 0.2s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = C.text)}
                onMouseLeave={(e) => (e.currentTarget.style.color = C.muted)}
              >
                {showPassword ? <HiOutlineEyeOff size={20} /> : <HiOutlineEye size={20} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              width: "100%",
              padding: "15px",
              background: C.gold,
              border: "none",
              borderRadius: "12px",
              color: "#0B0F1A",
              fontFamily: "'Inter', sans-serif",
              fontWeight: 600,
              fontSize: "14px",
              letterSpacing: "0.04em",
              cursor: isSubmitting ? "not-allowed" : "pointer",
              transition: "all 0.3s ease",
              boxShadow: "0 4px 16px rgba(201, 168, 76, 0.15)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            onMouseEnter={(e) => {
              if (!isSubmitting) {
                e.currentTarget.style.filter = "brightness(1.15)";
                e.currentTarget.style.boxShadow = "0 6px 20px rgba(201, 168, 76, 0.25)";
              }
            }}
            onMouseLeave={(e) => {
              if (!isSubmitting) {
                e.currentTarget.style.filter = "none";
                e.currentTarget.style.boxShadow = "0 4px 16px rgba(201, 168, 76, 0.15)";
              }
            }}
          >
            {isSubmitting ? "Doğrulanıyor..." : "Giriş Yap"}
          </button>
        </form>
      </motion.div>

      {/* Footer Logo */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.6 }}
        style={{
          marginTop: "32px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "4px",
          position: "relative",
          zIndex: 1,
        }}
      >
        <span
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: "18px",
            letterSpacing: "0.08em",
            color: "rgba(240, 237, 232, 0.4)",
          }}
        >
          birlikteydik.com
        </span>
        <span
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: "10px",
            letterSpacing: "0.04em",
            color: "rgba(240, 237, 232, 0.2)",
          }}
        >
          Tüm Hakları Saklıdır © {new Date().getFullYear()}
        </span>
      </motion.div>
    </div>
  );
}
