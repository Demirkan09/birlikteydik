"use client";

import { HiOutlineTicket, HiOutlineExternalLink, HiOutlineLockClosed, HiOutlineEye, HiOutlineEyeOff, HiOutlineKey, HiOutlineTrash, HiOutlineCheckCircle } from "react-icons/hi";
import { C } from "../../_utils/constants";
import { ProfileInput } from "../ProfileInput";
import { UserPage } from "../../types";

export function MyPagesTab({
  userPages,
  activationCode,
  setActivationCode,
  activationError,
  setActivationError,
  activationLoading,
  handleActivate,
  activationMsg,
  timeAgo,
  pagePasswords,
  setPagePasswords,
  pagePassErrors,
  setPagePassErrors,
  showPagePass,
  setShowPagePass,
  handleSetPagePassword,
  pagePassLoading,
  handleRemovePagePassword,
  pagePassSuccess,
}: {
  userPages: UserPage[];
  activationCode: string;
  setActivationCode: (v: string) => void;
  activationError: string;
  setActivationError: (v: string) => void;
  activationLoading: boolean;
  handleActivate: () => void;
  activationMsg: string;
  timeAgo: (dateStr: string) => string;
  pagePasswords: Record<string, string>;
  setPagePasswords: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  pagePassErrors: Record<string, string>;
  setPagePassErrors: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  showPagePass: Record<string, boolean>;
  setShowPagePass: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  handleSetPagePassword: (slug: string) => void;
  pagePassLoading: Record<string, boolean>;
  handleRemovePagePassword: (slug: string) => void;
  pagePassSuccess: Record<string, string>;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
      <div>
        <h2 style={{ fontFamily: "'Cormorant Garamond', 'Cormorant Garamond Fallback', serif", fontSize: "1.6rem", fontWeight: 500, color: C.text, marginBottom: "8px" }}>
          Sayfalarım <em style={{ color: C.gold, fontStyle: "italic" }}>& Siparişlerim</em>
        </h2>
        <p style={{ fontFamily: "var(--font-inter), sans-serif", fontSize: "12.5px", color: C.muted, fontWeight: 300 }}>
          Siparişinizle birlikte gelen aktivasyon kodunu girerek sayfanızı yönetin.
        </p>
      </div>

      {/* Aktivasyon Kodu Girişi */}
      <div style={{ background: "rgba(201,168,76,0.04)", border: "1px solid rgba(201,168,76,0.15)", borderRadius: "16px", padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
        <h3 style={{ fontFamily: "'Cormorant Garamond', 'Cormorant Garamond Fallback', serif", fontSize: "1.2rem", color: C.gold, fontWeight: 500, display: "flex", alignItems: "center", gap: "8px" }}>
          <HiOutlineTicket size={18} /> Aktivasyon Kodu Gir
        </h3>
        <p style={{ fontFamily: "var(--font-inter), sans-serif", fontSize: "12px", color: C.muted, fontWeight: 300, lineHeight: 1.6 }}>
          Sipariş sonrası size iletilen kodu aşağıya girin (örn: <strong style={{ color: "rgba(240,237,232,0.6)", letterSpacing: "0.05em" }}>XK-T7M2-9P</strong>).
        </p>
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: "200px" }}>
            <ProfileInput
              label="Aktivasyon Kodu" value={activationCode}
              onChange={(v) => { setActivationCode(v.toUpperCase()); setActivationError(""); }}
              placeholder="XX-XXXX-XX" icon={<HiOutlineKey size={15} />}
              error={activationError}
            />
          </div>
          <button
            onClick={handleActivate} disabled={activationLoading}
            style={{
              padding: "12px 24px", borderRadius: "30px", border: "none", alignSelf: "flex-end", marginBottom: activationError ? "22px" : "0",
              background: activationLoading ? "rgba(201,168,76,0.5)" : C.gold, color: "#0B0F1A",
              fontFamily: "var(--font-inter), sans-serif", fontSize: "12px", letterSpacing: "0.1em",
              textTransform: "uppercase", fontWeight: 600, cursor: activationLoading ? "not-allowed" : "pointer",
              transition: "all 0.2s", display: "flex", alignItems: "center", gap: "6px", whiteSpace: "nowrap",
            }}
          >
            {activationLoading ? <span style={{ width: "13px", height: "13px", border: "2px solid #0B0F1A44", borderTopColor: "#0B0F1A", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} /> : <HiOutlineTicket size={14} />}
            <span>Aktive Et</span>
          </button>
        </div>
        {activationMsg && (
          <div style={{ padding: "10px 14px", borderRadius: "8px", background: "rgba(134,239,172,0.08)", border: "1px solid rgba(134,239,172,0.2)", color: C.success, fontSize: "13px", display: "flex", alignItems: "center", gap: "8px" }}>
            <HiOutlineCheckCircle size={16} />{activationMsg}
          </div>
        )}
      </div>

      {/* Sayfa Listesi */}
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {userPages.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 20px", border: "1px dashed rgba(255,255,255,0.08)", borderRadius: "16px" }}>
            <p style={{ fontFamily: "'Cormorant Garamond', 'Cormorant Garamond Fallback', serif", fontSize: "1.4rem", color: C.muted, fontWeight: 400 }}>Henüz bir sayfanız yok.</p>
            <p style={{ fontFamily: "var(--font-inter), sans-serif", fontSize: "12px", color: "rgba(240,237,232,0.25)", marginTop: "6px" }}>Sipariş verip aktivasyon kodunuzu girerek sayfanızı oluşturabilirsiniz.</p>
          </div>
        ) : userPages.map((page) => (
          <div key={page.id} style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "16px", padding: "20px 24px", display: "flex", flexDirection: "column", gap: "16px" }}>
            {/* Page header */}
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "10px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontFamily: "var(--font-inter), sans-serif", fontSize: "13.5px", color: C.gold, fontWeight: 600, letterSpacing: "0.04em" }}>
                    birlikteydik.com/{page.pageSlug}
                  </span>
                  <a href={`/${page.pageSlug}`} target="_blank" rel="noreferrer" style={{ color: C.muted, display: "flex" }}>
                    <HiOutlineExternalLink size={13} />
                  </a>
                </div>
                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
                  <span style={{ fontFamily: "var(--font-inter), sans-serif", fontSize: "11px", color: "rgba(240,237,232,0.35)", background: "rgba(255,255,255,0.04)", padding: "2px 8px", borderRadius: "20px", border: "1px solid rgba(255,255,255,0.08)", textTransform: "capitalize" }}>
                    {page.packageName}
                  </span>
                  {page.remainingTime && (
                    <span style={{ fontFamily: "var(--font-inter), sans-serif", fontSize: "11px", color: page.remainingTime === "Süresi Doldu" ? "#E8A0A0" : C.gold, background: page.remainingTime === "Süresi Doldu" ? "rgba(232,160,160,0.05)" : "rgba(201,168,76,0.05)", padding: "2px 8px", borderRadius: "20px", border: `1px solid ${page.remainingTime === "Süresi Doldu" ? "rgba(232,160,160,0.15)" : "rgba(201,168,76,0.15)"}` }}>
                      {page.remainingTime}
                    </span>
                  )}
                  <span style={{ fontFamily: "var(--font-inter), sans-serif", fontSize: "11px", color: "rgba(240,237,232,0.3)" }}>
                    {new Date(page.createdAt).toLocaleDateString("tr-TR", { year: "numeric", month: "long", day: "numeric" })} · {timeAgo(page.createdAt)}
                  </span>
                </div>
              </div>
            </div>

            {/* Password management */}
            <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
              <h4 style={{ fontFamily: "var(--font-inter), sans-serif", fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase", color: C.muted, fontWeight: 500, display: "flex", alignItems: "center", gap: "6px" }}>
                <HiOutlineLockClosed size={13} /> Sayfa Şifresi
              </h4>
              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                <div style={{ flex: 1, minWidth: "180px" }}>
                  <ProfileInput
                    label="Yeni Şifre Belirle" type={showPagePass[page.pageSlug] ? "text" : "password"}
                    value={pagePasswords[page.pageSlug] || ""}
                    onChange={(v) => { setPagePasswords((p) => ({ ...p, [page.pageSlug]: v })); setPagePassErrors((p) => ({ ...p, [page.pageSlug]: "" })); }}
                    placeholder="Min. 4 karakter" icon={<HiOutlineLockClosed size={14} />}
                    error={pagePassErrors[page.pageSlug]}
                    rightElement={<span onClick={() => setShowPagePass((p) => ({ ...p, [page.pageSlug]: !p[page.pageSlug] }))} style={{ cursor: "pointer", display: "flex" }}>{showPagePass[page.pageSlug] ? <HiOutlineEyeOff size={14} /> : <HiOutlineEye size={14} />}</span>}
                  />
                </div>
                <div style={{ display: "flex", gap: "8px", alignSelf: "flex-end", marginBottom: pagePassErrors[page.pageSlug] ? "22px" : "0", flexWrap: "wrap" }}>
                  <button
                    onClick={() => handleSetPagePassword(page.pageSlug)}
                    disabled={pagePassLoading[page.pageSlug]}
                    style={{ padding: "11px 16px", borderRadius: "30px", border: "none", background: C.gold, color: "#0B0F1A", fontFamily: "var(--font-inter), sans-serif", fontSize: "11.5px", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", cursor: "pointer", whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: "5px" }}
                  >
                    <HiOutlineKey size={13} /> Şifreyi Kaydet
                  </button>
                  <button
                    onClick={() => handleRemovePagePassword(page.pageSlug)}
                    disabled={pagePassLoading[page.pageSlug]}
                    style={{ padding: "11px 16px", borderRadius: "30px", border: "1px solid rgba(232,160,160,0.25)", background: "rgba(232,160,160,0.05)", color: "#E8A0A0", fontFamily: "var(--font-inter), sans-serif", fontSize: "11.5px", fontWeight: 500, cursor: "pointer", whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: "5px" }}
                  >
                    <HiOutlineTrash size={13} /> Şifreyi Kaldır
                  </button>
                </div>
              </div>
              {pagePassSuccess[page.pageSlug] && <div style={{ fontSize: "12px", color: C.success, fontFamily: "var(--font-inter), sans-serif" }}>✓ {pagePassSuccess[page.pageSlug]}</div>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
