import Link from "next/link";
import { C } from "../_utils/constants";

interface HeaderProps {
  adminEmail: string;
}

export function Header({ adminEmail }: HeaderProps) {
  return (
    <header style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "0 24px", height: "64px", display: "flex", alignItems: "center", justifyContent: "space-between", backdropFilter: "blur(16px)", position: "sticky", top: 0, zIndex: 100, background: "rgba(11,15,26,0.85)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: "6px", textDecoration: "none" }}>
          <span style={{ fontFamily: "var(--font-cormorant), serif", fontSize: "18px", fontWeight: 600, color: C.text, letterSpacing: "-0.01em", transition: "color 0.2s" }} onMouseEnter={(e) => e.currentTarget.style.color = C.gold} onMouseLeave={(e) => e.currentTarget.style.color = C.text}>birlikteydik.com</span>
        </Link>
        <div style={{ height: "16px", width: "1px", background: C.border }} />
        <span style={{ fontFamily: "Inter, 'Inter Fallback', sans-serif", fontSize: "11px", letterSpacing: "0.2em", textTransform: "uppercase", color: C.gold, fontWeight: 500 }}>Admin Panel</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: C.success }} />
        <span style={{ fontSize: "12px", color: C.muted }}>{adminEmail}</span>
      </div>
    </header>
  );
}
