import { type ReactNode, useState, useEffect, useRef } from "react"

type BacklightProps = {
  children?: ReactNode;
  className?: string;
  blur?: number;
  imageUrl?: string;
  style?: React.CSSProperties;
}

export function Backlight({ blur = 32, children, className, imageUrl, style }: BacklightProps) {
  const [isInView, setIsInView] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = elementRef.current;
    if (!el || !imageUrl) return;

    // Use IntersectionObserver to lazy load the backlight image
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.unobserve(el);
        }
      },
      { rootMargin: "200px" } // Load slightly before it enters the viewport
    );

    observer.observe(el);
    return () => {
      observer.disconnect();
    };
  }, [imageUrl]);

  return (
    <div ref={elementRef} className={className} style={{ position: "relative", isolation: "isolate", ...style }}>
      {/* Silky-smooth GPU-accelerated Ambilight or solid fallback with Safari fixes */}
      {imageUrl && isInView ? (
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
            transform: "translate3d(0, 0, -1px) scale(1.02)",
            WebkitTransform: "translate3d(0, 0, -1px) scale(1.02)",
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            pointerEvents: "none",
            zIndex: -1,
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
            transform: "translate3d(0, 0, -1px) scale(1.02)",
            WebkitTransform: "translate3d(0, 0, -1px) scale(1.02)",
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            pointerEvents: "none",
            zIndex: -1,
            opacity: 0.9,
          }}
        />
      )}
      {children}
    </div>
  )
}

