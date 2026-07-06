import { type ReactNode } from "react"

type BacklightProps = {
  children?: ReactNode;
  className?: string;
  blur?: number;
  imageUrl?: string;
  style?: React.CSSProperties;
}

export function Backlight({ blur = 32, children, className, imageUrl, style }: BacklightProps) {
  return (
    <div className={className} style={{ position: "relative", ...style }}>
      {/* Silky-smooth GPU-accelerated Ambilight or solid fallback with Safari fixes */}
      {imageUrl ? (
        <div
          style={{
            position: "absolute",
            inset: "-10px",
            borderRadius: "12px",
            backgroundImage: `url(${imageUrl})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            // GPU Promotion and Safari Blur Discard Bug Fixes
            filter: `blur(${blur}px) saturate(2.5) brightness(0.95)`,
            WebkitFilter: `blur(${blur}px) saturate(2.5) brightness(0.95)`,
            transform: "translate3d(0, 0, 0) scale(1.02)",
            WebkitTransform: "translate3d(0, 0, 0) scale(1.02)",
            willChange: "filter, transform",
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            pointerEvents: "none",
            zIndex: 0,
            opacity: 0.85,
          }}
        />
      ) : (
        <div
          style={{
            position: "absolute",
            inset: "-30px",
            borderRadius: "16px",
            background: "radial-gradient(circle at center, var(--backlight-color, rgba(255,255,255,0.15)) 0%, transparent 75%)",
            // GPU Promotion and Safari Blur Discard Bug Fixes
            filter: `blur(${blur}px)`,
            WebkitFilter: `blur(${blur}px)`,
            transform: "translate3d(0, 0, 0) scale(1.02)",
            WebkitTransform: "translate3d(0, 0, 0) scale(1.02)",
            willChange: "filter, transform",
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            pointerEvents: "none",
            zIndex: 0,
            opacity: 0.9,
          }}
        />
      )}
      <div style={{ position: "relative", zIndex: 1 }}>{children}</div>
    </div>
  )
}
