import React from "react";
import { HiOutlineCheck } from "react-icons/hi";
import { C } from "../_utils/constants";

interface ActionButtonProps {
  label: string;
  icon?: React.ReactNode;
  loading?: boolean;
  success?: boolean;
  onClick: () => void;
  small?: boolean;
  danger?: boolean;
}

export function ActionButton({ label, icon, loading, success, onClick, small, danger }: ActionButtonProps) {
  const borderCol = success ? C.success + "44" : danger ? "rgba(232, 160, 160, 0.4)" : C.border;
  const bgCol = success ? "rgba(134,239,172,0.08)" : danger ? "rgba(232, 160, 160, 0.05)" : "rgba(255,255,255,0.04)";
  const txtCol = success ? C.success : danger ? C.error : C.muted;

  return (
    <button
      onClick={onClick} disabled={loading}
      style={{
        padding: small ? "7px 12px" : "9px 16px",
        borderRadius: "8px", border: `1px solid ${borderCol}`,
        background: bgCol,
        color: txtCol,
        fontFamily: "var(--font-inter), sans-serif", fontSize: small ? "11px" : "12px",
        cursor: loading ? "not-allowed" : "pointer", transition: "all 0.2s",
        display: "flex", alignItems: "center", gap: "5px", fontWeight: 400,
        opacity: loading ? 0.6 : 1, whiteSpace: "nowrap",
      }}
      onMouseEnter={(e) => {
        if (!loading && !success) {
          (e.currentTarget as HTMLButtonElement).style.borderColor = danger ? "rgba(232, 160, 160, 0.8)" : C.gold + "44";
          (e.currentTarget as HTMLButtonElement).style.background = danger ? "rgba(232, 160, 160, 0.15)" : "rgba(255,255,255,0.07)";
          (e.currentTarget as HTMLButtonElement).style.color = danger ? C.error : C.text;
        }
      }}
      onMouseLeave={(e) => {
        if (!success) {
          (e.currentTarget as HTMLButtonElement).style.borderColor = borderCol;
          (e.currentTarget as HTMLButtonElement).style.background = bgCol;
          (e.currentTarget as HTMLButtonElement).style.color = txtCol;
        }
      }}
    >
      {loading ? (
        <span style={{ width: "12px", height: "12px", border: `1.5px solid ${C.border}`, borderTopColor: C.gold, borderRadius: "50%", animation: "spin 0.7s linear infinite", display: "inline-block" }} />
      ) : success ? (
        <HiOutlineCheck size={13} />
      ) : icon}
      {success ? "Gönderildi!" : label}
    </button>
  );
}
