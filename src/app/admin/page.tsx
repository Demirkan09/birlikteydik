"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence } from "framer-motion";
import { C } from "./_utils/constants";
import { Header } from "./_components/Header";
import { PagesTab } from "./_components/Tabs/PagesTab";
import { CodesTab } from "./_components/Tabs/CodesTab";
import { UsersTab } from "./_components/Tabs/UsersTab";
import { MarketingTab } from "./_components/Tabs/MarketingTab";
import { SettingsTab } from "./_components/Tabs/SettingsTab";
import { TemplateBuilderTab } from "./_components/Tabs/TemplateBuilderTab";

export default function AdminPage() {
  const router = useRouter();
  const [adminEmail, setAdminEmail] = useState("");
  const [adminRole, setAdminRole] = useState("admin");
  const [authorized, setAuthorized] = useState(false);
  const [activeTab, setActiveTab] = useState<"create_page" | "template_builder" | "codes" | "users" | "marketing" | "settings">("create_page");
  const [prefilledSlug, setPrefilledSlug] = useState("");

  useEffect(() => {
    try {
      const raw = localStorage.getItem("birlikteydik_user");
      if (!raw) { router.replace("/profil"); return; }
      const user = JSON.parse(raw);
      if (user.role !== "admin" && user.role !== "staff") { router.replace("/profil"); return; }
      setAdminEmail(user.email);
      setAdminRole(user.role);
      setAuthorized(true);
    } catch {
      router.replace("/profil");
    }
  }, [router]);

  if (!authorized) {
    return (
      <div style={{ minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: "32px", height: "32px", border: `2px solid ${C.border}`, borderTopColor: C.gold, borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />

      </div>
    );
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        select option {
          background-color: #0b0f1a !important;
          color: #ffffff !important;
        }
      ` }} />

      {/* Arka plan */}
      <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none", background: "radial-gradient(ellipse 70% 50% at 15% 15%, rgba(201,168,76,0.05) 0%, transparent 55%), radial-gradient(ellipse 50% 40% at 85% 85%, rgba(184,169,212,0.04) 0%, transparent 50%), linear-gradient(150deg, #0B0F1A 0%, #0d1220 50%, #0a0d18 100%)" }} />

      <div style={{ position: "relative", zIndex: 1, minHeight: "100vh" }}>
        <Header adminEmail={adminEmail} />

        <main style={{ maxWidth: "1200px", margin: "0 auto", padding: "32px 24px 64px" }}>
          {/* Tab navigation */}
          <div style={{ display: "flex", gap: "8px", marginBottom: "32px", flexWrap: "wrap" }}>
            {[
              { key: "create_page", icon: "🎨", label: "Sayfa Oluştur" },
              { key: "template_builder", icon: "📐", label: "Şablon Tasarla" },
              { key: "codes", icon: "📋", label: "Kod Üret" },
              { key: "users", icon: "👥", label: "Kullanıcılar" },
              ...(adminRole === "admin" ? [
                { key: "marketing", icon: "📢", label: "Pazarlama" },
                { key: "settings", icon: "⚙️", label: "Site Ayarları" }
              ] : [])
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                style={{
                  padding: "10px 20px", borderRadius: "12px",
                  background: activeTab === tab.key ? C.gold : "rgba(255,255,255,0.05)",
                  color: activeTab === tab.key ? "#0B0F1A" : C.muted,
                  fontFamily: "var(--font-inter), sans-serif", fontSize: "13px", fontWeight: activeTab === tab.key ? 600 : 400,
                  letterSpacing: "0.04em", cursor: "pointer", transition: "all 0.2s",
                  display: "flex", alignItems: "center", gap: "8px",
                  border: activeTab === tab.key ? "none" : "1px solid rgba(255,255,255,0.08)",
                }}
              >
                <span>{tab.icon}</span> {tab.label}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {activeTab === "create_page" && <PagesTab adminEmail={adminEmail} setPrefilledSlug={setPrefilledSlug} setActiveTab={setActiveTab} />}
            {activeTab === "template_builder" && <TemplateBuilderTab adminEmail={adminEmail} />}
            {activeTab === "codes" && <CodesTab adminEmail={adminEmail} prefilledSlug={prefilledSlug} setPrefilledSlug={setPrefilledSlug} />}
            {activeTab === "users" && <UsersTab adminEmail={adminEmail} adminRole={adminRole} />}
            {activeTab === "marketing" && adminRole === "admin" && <MarketingTab adminEmail={adminEmail} />}
            {activeTab === "settings" && adminRole === "admin" && <SettingsTab adminEmail={adminEmail} />}
          </AnimatePresence>
        </main>
      </div>
    </>
  );
}
