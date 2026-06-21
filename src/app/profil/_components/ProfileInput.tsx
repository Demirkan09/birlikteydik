"use client";

import { useState } from "react";
import { C } from "../_utils/constants";

export function ProfileInput({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  icon,
  error,
  rightElement,
  disabled = false,
}: {
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  icon: React.ReactNode;
  error?: string;
  rightElement?: React.ReactNode;
  disabled?: boolean;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px", width: "100%" }}>
      <label style={{ fontFamily: "var(--font-inter), sans-serif", fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase", color: focused ? C.gold : C.muted, fontWeight: 500, transition: "color 0.2s" }}>{label}</label>
      <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
        <span style={{ position: "absolute", left: "16px", color: focused ? C.gold : "rgba(240,237,232,0.25)", transition: "color 0.2s", pointerEvents: "none", display: "flex" }}>{icon}</span>
        <input
          type={type} value={value} placeholder={placeholder} disabled={disabled}
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          onChange={(e) => onChange(e.target.value)}
          style={{
            width: "100%", padding: "12px 16px 12px 42px", paddingRight: rightElement ? "44px" : "16px",
            borderRadius: "10px", background: focused ? "rgba(201,168,76,0.04)" : C.card,
            border: `1px solid ${error ? C.error + "88" : focused ? C.gold + "44" : C.border}`,
            color: disabled ? "rgba(240,237,232,0.4)" : C.text, fontFamily: "var(--font-inter), sans-serif", fontSize: "13.5px", fontWeight: 300,
            outline: "none", transition: "all 0.25s", backdropFilter: "blur(4px)",
            cursor: disabled ? "not-allowed" : "text",
          }}
        />
        {rightElement && <span style={{ position: "absolute", right: "14px", display: "flex", cursor: "pointer", color: "rgba(240,237,232,0.3)" }}>{rightElement}</span>}
      </div>
      {error && <p style={{ fontFamily: "var(--font-inter), sans-serif", fontSize: "11.5px", color: C.error, fontWeight: 300, marginTop: "2px" }}>{error}</p>}
    </div>
  );
}
