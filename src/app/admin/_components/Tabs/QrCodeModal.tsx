"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { HiOutlineDownload, HiOutlineX } from "react-icons/hi";

// Color constants matching the admin panel
const C = {
  bg: "#0B0F1A",
  gold: "#C9A84C",
  text: "#F0EDE8",
  muted: "rgba(240,237,232,0.45)",
  border: "rgba(255,255,255,0.08)",
  card: "rgba(255,255,255,0.04)",
  success: "#86efac",
  error: "#E8A0A0",
};

interface QrCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedEditSlug: string;
  pageSetting?: any;
}

export default function QrCodeModal({
  isOpen,
  onClose,
  selectedEditSlug,
  pageSetting,
}: QrCodeModalProps) {
  const [selectedStyle, setSelectedStyle] = useState<number>(0);
  const [qrMatrix, setQrMatrix] = useState<any>(null);
  const [dotShape, setDotShape] = useState<"square" | "circle">("square"); // default square for optimal metal scan
  const [errorCorrection, setErrorCorrection] = useState<"L" | "M" | "Q" | "H">("M"); // default Medium for laser balance

  // Generate QR Code Matrix using the qrcode library
  useEffect(() => {
    if (!isOpen || !selectedEditSlug) return;

    try {
      // Build the target URL
      const targetUrl = `https://birlikteydik.com/${selectedEditSlug.toLowerCase().trim()}`;
      
      // Create QR code with dynamic error correction
      const qr = QRCode.create(targetUrl, { errorCorrectionLevel: errorCorrection });
      setQrMatrix(qr);
    } catch (err) {
      console.error("Failed to generate QR code matrix:", err);
    }
  }, [isOpen, selectedEditSlug, errorCorrection]);

  if (!isOpen) return null;

  // Prepare couple name text for textpath style
  const getCoupleNameLabel = () => {
    if (pageSetting?.config?.coupleNames) {
      return pageSetting.config.coupleNames.replace(/\s+/g, " ").trim().toUpperCase();
    }
    return selectedEditSlug.toUpperCase();
  };

  const coupleNamesText = getCoupleNameLabel();

  // SVG dimensions
  const size = 300;
  const center = size / 2;
  const qrWidth = 156; // Increased width for maximum physical scan size on a 2cm necklace

  let gridPoints: React.ReactNode[] = [];
  let finders: React.ReactNode[] = [];

  if (qrMatrix && qrMatrix.modules) {
    const N = qrMatrix.modules.size;
    const S = qrWidth / N; // Cell size
    const startX = center - qrWidth / 2;
    const startY = center - qrWidth / 2;

    const isFinderPattern = (x: number, y: number) => {
      if (x >= 0 && x <= 6 && y >= 0 && y <= 6) return true; // Top-Left
      if (x >= N - 7 && x < N && y >= 0 && y <= 6) return true; // Top-Right
      if (x >= 0 && x <= 6 && y >= N - 7 && y < N) return true; // Bottom-Left
      return false;
    };

    // Draw standard QR dots (skipping finders)
    for (let y = 0; y < N; y++) {
      for (let x = 0; x < N; x++) {
        if (qrMatrix.modules.get(x, y)) {
          if (!isFinderPattern(x, y)) {
            const cx = startX + (x + 0.5) * S;
            const cy = startY + (y + 0.5) * S;
            if (dotShape === "circle") {
              gridPoints.push(
                <circle
                  key={`dot-${x}-${y}`}
                  cx={cx}
                  cy={cy}
                  r={S * 0.48} // Slightly touching circles
                  fill="black"
                />
              );
            } else {
              gridPoints.push(
                <rect
                  key={`dot-${x}-${y}`}
                  x={startX + x * S}
                  y={startY + y * S}
                  width={S + 0.05}
                  height={S + 0.05}
                  fill="black"
                />
              );
            }
          }
        }
      }
    }

    // Draw the 3 custom finder patterns (eyes)
    // IMPORTANT: Ratios MUST strictly follow the 1:1:3:1:1 standard for QR reader algorithms to scan instantly.
    const finderCoords = [
      { cx: startX + 3.5 * S, cy: startY + 3.5 * S }, // Top-Left
      { cx: startX + (N - 3.5) * S, cy: startY + 3.5 * S }, // Top-Right
      { cx: startX + 3.5 * S, cy: startY + (N - 3.5) * S }, // Bottom-Left
    ];

    finderCoords.forEach((coord, idx) => {
      if (dotShape === "square") {
        finders.push(
          <g key={`finder-${idx}`}>
            {/* Outer black square (7x7 modules) */}
            <rect
              x={coord.cx - S * 3.5}
              y={coord.cy - S * 3.5}
              width={S * 7}
              height={S * 7}
              fill="black"
            />
            {/* Middle white cutout (5x5 modules) */}
            <rect
              x={coord.cx - S * 2.5}
              y={coord.cy - S * 2.5}
              width={S * 5}
              height={S * 5}
              fill="white"
            />
            {/* Inner solid black square (3x3 modules) */}
            <rect
              x={coord.cx - S * 1.5}
              y={coord.cy - S * 1.5}
              width={S * 3}
              height={S * 3}
              fill="black"
            />
          </g>
        );
      } else {
        finders.push(
          <g key={`finder-${idx}`}>
            {/* Outer ring: center radius at 3.0 * S with strokeWidth S spans from 2.5 * S to 3.5 * S */}
            <circle
              cx={coord.cx}
              cy={coord.cy}
              r={S * 3.0}
              stroke="black"
              strokeWidth={S}
              fill="none"
            />
            {/* Inner solid circle: radius 1.5 * S (diameter 3.0 * S) */}
            <circle
              cx={coord.cx}
              cy={coord.cy}
              r={S * 1.5}
              fill="black"
            />
          </g>
        );
      }
    });
  }


  // Helper: Generate Laurel Leaf Wreath nodes
  const renderLaurelLeaves = () => {
    const leaves: React.ReactNode[] = [];
    const r = 120;
    const step = 15;
    
    const drawLeafWreath = (startAngle: number, endAngle: number, directionMultiplier: number) => {
      for (let angle = startAngle; angle <= endAngle; angle += step) {
        const rad = (angle * Math.PI) / 180;
        const x = center + r * Math.cos(rad);
        const y = center + r * Math.sin(rad);
        const leafAngle = angle + 90 * directionMultiplier;

        leaves.push(
          <path
            key={`leaf-${angle}-${directionMultiplier}`}
            d="M 0,0 C -3,-6 0,-9 6,-6 C 9,0 6,3 0,0 Z"
            fill="black"
            transform={`translate(${x}, ${y}) rotate(${leafAngle}) scale(0.75)`}
          />
        );
      }
    };

    drawLeafWreath(40, 140, 1);     // Left branch
    drawLeafWreath(220, 320, -1);   // Right branch
    return leaves;
  };

  // Helper: Generate Sunburst Ticks
  const renderSunRays = () => {
    const rays: React.ReactNode[] = [];
    const numRays = 40;
    const rOuter = 124;
    const rInner = 118;

    for (let i = 0; i < numRays; i++) {
      const angle = (i * 360) / numRays;
      const rad = (angle * Math.PI) / 180;
      
      const x1 = center + rInner * Math.cos(rad);
      const y1 = center + rInner * Math.sin(rad);
      const x2 = center + rOuter * Math.cos(rad);
      const y2 = center + rOuter * Math.sin(rad);

      rays.push(
        <line
          key={`ray-${i}`}
          x1={x1}
          y1={y1}
          x2={x2}
          y2={y2}
          stroke="black"
          strokeWidth="1.2"
        />
      );
    }
    return rays;
  };

  // Helper: Draw Daisy flower pattern
  const drawDaisy = (cx: number, cy: number, keyPrefix: string, scale = 1.0) => {
    const petals = [];
    const distance = 5.5 * scale;
    const petalRadius = 2.4 * scale;
    const centerRadius = 2.8 * scale;

    for (let i = 0; i < 8; i++) {
      const angle = (i * 45 * Math.PI) / 180;
      petals.push(
        <circle
          key={`petal-${keyPrefix}-${i}`}
          cx={cx + distance * Math.cos(angle)}
          cy={cy + distance * Math.sin(angle)}
          r={petalRadius}
          fill="black"
        />
      );
    }
    return (
      <g key={`daisy-${keyPrefix}`}>
        {petals}
        <circle cx={cx} cy={cy} r={centerRadius} fill="black" />
      </g>
    );
  };

  // Helper: Draw Sunflower pattern
  const drawSunflower = (cx: number, cy: number, keyPrefix: string, scale = 1.0) => {
    const petals = [];
    const numPetals = 12;
    const distance = 7.0 * scale;

    for (let i = 0; i < numPetals; i++) {
      const angle = (i * 30 * Math.PI) / 180;
      const px = cx + distance * Math.cos(angle);
      const py = cy + distance * Math.sin(angle);
      const rot = i * 30 + 90;

      petals.push(
        <path
          key={`sf-petal-${keyPrefix}-${i}`}
          d="M 0,-2.5 C -2,0 -2,2.5 0,4 C 2,2.5 2,0 0,-2.5 Z"
          fill="black"
          transform={`translate(${px}, ${py}) rotate(${rot}) scale(${scale})`}
        />
      );
    }
    return (
      <g key={`sunflower-${keyPrefix}`}>
        {petals}
        <circle cx={cx} cy={cy} r={4.0 * scale} fill="black" />
      </g>
    );
  };

  // Render decorative frame based on selected style index (Total: 15 styles)
  const renderFrame = () => {
    switch (selectedStyle) {
      case 0:
        // Design 1: Minimalist Heart Ring
        return (
          <g>
            <circle cx={center} cy={center} r={118} stroke="black" strokeWidth="2.5" fill="none" />
            <circle cx={center} cy={center} r={114} stroke="black" strokeWidth="1" fill="none" />
            <path
              d="M 0,0 C -1.5,-1.5 -4,-1.5 -5,0 C -6,1.5 -6,3.5 -4.5,5 L 0,9 L 4.5,5 C 6,3.5 6,1.5 5,0 C 4,-1.5 1.5,-1.5 0,0 Z"
              fill="black"
              transform={`translate(${center}, 18) scale(1.6)`}
            />
            <path
              d="M 0,0 C -1.5,-1.5 -4,-1.5 -5,0 C -6,1.5 -6,3.5 -4.5,5 L 0,9 L 4.5,5 C 6,3.5 6,1.5 5,0 C 4,-1.5 1.5,-1.5 0,0 Z"
              fill="black"
              transform={`translate(${center}, 282) scale(1.6) rotate(180)`}
            />
          </g>
        );

      case 1:
        // Design 2: Laurel Leaf Wreath
        return (
          <g>
            <circle cx={center} cy={center} r={122} stroke="black" strokeWidth="1.5" strokeDasharray="3 3" fill="none" />
            {renderLaurelLeaves()}
            <circle cx={center} cy={270} r="3" fill="black" />
          </g>
        );

      case 2:
        // Design 3: Starry Night
        return (
          <g>
            <circle cx={center} cy={center} r={118} stroke="black" strokeWidth="2.5" fill="none" />
            <path
              d="M 0,0 A 9,9 0 1,0 9,13 A 7.5,7.5 0 1,1 0,0"
              fill="black"
              transform={`translate(225, 45) rotate(-35) scale(1.4)`}
            />
            <path
              d="M 0,-5 L 1,-1 L 5,0 L 1,1 L 0,5 L -1,1 L -5,0 L -1,-1 Z"
              fill="black"
              transform={`translate(68, 68) scale(1.3)`}
            />
            <path
              d="M 0,-5 L 1,-1 L 5,0 L 1,1 L 0,5 L -1,1 L -5,0 L -1,-1 Z"
              fill="black"
              transform={`translate(230, 230) scale(1.1)`}
            />
            <path
              d="M 0,-5 L 1,-1 L 5,0 L 1,1 L 0,5 L -1,1 L -5,0 L -1,-1 Z"
              fill="black"
              transform={`translate(68, 230) scale(1.1)`}
            />
            <circle cx="218" cy="210" r="1.5" fill="black" />
            <circle cx="80" cy="180" r="1.5" fill="black" />
            <circle cx="220" cy="85" r="1" fill="black" />
          </g>
        );

      case 3:
        // Design 4: Celestial Sunburst
        return (
          <g>
            <circle cx={center} cy={center} r={123} stroke="black" strokeWidth="1.5" fill="none" />
            <circle cx={center} cy={center} r={114} stroke="black" strokeWidth="1" fill="none" />
            {renderSunRays()}
          </g>
        );

      case 4:
        // Design 5: Personalized Name Arc (Custom TextPath)
        return (
          <g>
            <defs>
              <path id="qr-text-path-bottom" d="M 40,150 A 110,110 0 0,0 260,150" fill="none" />
              <path id="qr-text-path-top" d="M 260,150 A 110,110 0 0,0 40,150" fill="none" />
            </defs>
            <circle cx={center} cy={center} r={124} stroke="black" strokeWidth="2.5" fill="none" />
            <circle cx={center} cy={center} r={98} stroke="black" strokeWidth="1" fill="none" />
            <text fill="black" fontSize="8.5" letterSpacing="2.5" fontFamily="var(--font-inter), sans-serif" fontWeight="bold">
              <textPath href="#qr-text-path-top" startOffset="50%" textAnchor="middle">
                B I R L I K T E Y D I K . C O M
              </textPath>
            </text>
            <text fill="black" fontSize="9" letterSpacing="2" fontFamily="var(--font-inter), sans-serif" fontWeight="bold">
              <textPath href="#qr-text-path-bottom" startOffset="50%" textAnchor="middle">
                {coupleNamesText}
              </textPath>
            </text>
            <circle cx="40" cy="150" r="1.5" fill="black" />
            <circle cx="260" cy="150" r="1.5" fill="black" />
          </g>
        );

      case 5:
        // Design 6: Zarif Papatya (Daisy Flower Wreath)
        return (
          <g>
            <circle cx={center} cy={center} r={118} stroke="black" strokeWidth="1.5" fill="none" />
            {/* Top, bottom, left, right daisy ornaments */}
            {drawDaisy(center, 25, "top", 1.1)}
            {drawDaisy(center, 275, "bottom", 1.1)}
            {drawDaisy(25, center, "left", 0.95)}
            {drawDaisy(275, center, "right", 0.95)}
          </g>
        );

      case 6:
        // Design 7: Sarmaşık Gül (Wild Rose Wreath)
        return (
          <g>
            {/* Thin outline */}
            <circle cx={center} cy={center} r={118} stroke="black" strokeWidth="1.2" fill="none" />
            
            {/* Elegant rosebud at top */}
            <path
              d="M 0,-8 C -3,-8 -6,-5 -4,-1 C -2,2 0,6 0,6 C 0,6 2,2 4,-1 C 6,-5 3,-8 0,-8 Z M -1.5,-3 C -0.8,-4 0,-4 0.8,-3 C 1.5,-2 0.8,0 0,0 C -0.8,0 -1.5,-2 -1.5,-3 Z"
              fill="black"
              transform={`translate(${center}, 23) scale(1.6)`}
            />

            {/* Matching rosebud at bottom */}
            <path
              d="M 0,-8 C -3,-8 -6,-5 -4,-1 C -2,2 0,6 0,6 C 0,6 2,2 4,-1 C 6,-5 3,-8 0,-8 Z M -1.5,-3 C -0.8,-4 0,-4 0.8,-3 C 1.5,-2 0.8,0 0,0 C -0.8,0 -1.5,-2 -1.5,-3 Z"
              fill="black"
              transform={`translate(${center}, 277) scale(1.6) rotate(180)`}
            />

            {/* Crawling leaves along the frame */}
            <path d="M 0,0 C -2,-4 -1,-7 3,-5 C 5,0 4,2 0,0 Z" fill="black" transform={`translate(60, 100) rotate(-40) scale(1.4)`} />
            <path d="M 0,0 C -2,-4 -1,-7 3,-5 C 5,0 4,2 0,0 Z" fill="black" transform={`translate(240, 100) rotate(40) scale(1.4)`} />
            <path d="M 0,0 C -2,-4 -1,-7 3,-5 C 5,0 4,2 0,0 Z" fill="black" transform={`translate(55, 200) rotate(-130) scale(1.4)`} />
            <path d="M 0,0 C -2,-4 -1,-7 3,-5 C 5,0 4,2 0,0 Z" fill="black" transform={`translate(245, 200) rotate(130) scale(1.4)`} />
          </g>
        );

      case 7:
        // Design 8: Kelebek Esintisi (Butterfly Flight)
        return (
          <g>
            <circle cx={center} cy={center} r={118} stroke="black" strokeWidth="1.2" fill="none" />
            
            {/* Flying butterflies */}
            {/* Top butterfly */}
            <path
              d="M 0,0 C -2,-4 -7,-4 -7,-1 C -7,2 -2,1 0,4 C 2,1 7,2 7,-1 C 7,-4 2,-4 0,0 Z M 0,0 C -1.5,2 -5,1 -5,3 C -5,5 -1.5,4 0,1 C 1.5,4 5,5 5,3 C 5,1 1.5,2 0,0 Z"
              fill="black"
              transform="translate(150, 24) scale(1.6) rotate(12)"
            />
            {/* Left flying butterfly */}
            <path
              d="M 0,0 C -2,-4 -7,-4 -7,-1 C -7,2 -2,1 0,4 C 2,1 7,2 7,-1 C 7,-4 2,-4 0,0 Z M 0,0 C -1.5,2 -5,1 -5,3 C -5,5 -1.5,4 0,1 C 1.5,4 5,5 5,3 C 5,1 1.5,2 0,0 Z"
              fill="black"
              transform="translate(70, 75) scale(1.3) rotate(-45)"
            />
            {/* Bottom-right butterfly */}
            <path
              d="M 0,0 C -2,-4 -7,-4 -7,-1 C -7,2 -2,1 0,4 C 2,1 7,2 7,-1 C 7,-4 2,-4 0,0 Z M 0,0 C -1.5,2 -5,1 -5,3 C -5,5 -1.5,4 0,1 C 1.5,4 5,5 5,3 C 5,1 1.5,2 0,0 Z"
              fill="black"
              transform="translate(230, 225) scale(1.3) rotate(135)"
            />
          </g>
        );

      case 8:
        // Design 9: Sonsuzluk Bağı (Infinity Love)
        return (
          <g>
            <circle cx={center} cy={center} r={118} stroke="black" strokeWidth="2.2" fill="none" />
            <circle cx={center} cy={center} r={114} stroke="black" strokeWidth="0.8" fill="none" />
            
            {/* Infinity loops at top and bottom */}
            <path
              d="M -9,0 C -9,-4.5 -3,-4.5 0,0 C 3,4.5 9,4.5 9,0 C 9,-4.5 3,-4.5 0,0 C -3,4.5 -9,4.5 -9,0 Z"
              stroke="black"
              strokeWidth="2.0"
              fill="none"
              transform={`translate(${center}, 23) scale(1.3)`}
            />
            <path
              d="M -9,0 C -9,-4.5 -3,-4.5 0,0 C 3,4.5 9,4.5 9,0 C 9,-4.5 3,-4.5 0,0 C -3,4.5 -9,4.5 -9,0 Z"
              stroke="black"
              strokeWidth="2.0"
              fill="none"
              transform={`translate(${center}, 277) scale(1.3) rotate(90)`}
            />
          </g>
        );

      case 9:
        // Design 10: Hayat Ağacı (Tree of Life)
        return (
          <g>
            <circle cx={center} cy={center} r={118} stroke="black" strokeWidth="2.0" fill="none" />
            
            {/* Symmetrical tree roots & branches wrapping the bottom segment */}
            <path
              d="M 148,285 L 148,272 C 145,270 142,267 140,262 C 137,258 132,256 128,258 L 126,260 C 131,254 137,253 142,257 C 145,260 147,264 148,266 C 148,262 145,258 141,255 C 138,252 138,247 140,243 C 142,248 143,251 146,252 C 149,253 150,256 150,259 C 150,256 151,253 154,252 C 157,251 158,248 160,243 C 162,247 162,252 159,255 C 155,258 152,262 152,266 C 153,264 155,260 158,257 C 163,253 169,254 174,260 L 172,258 C 168,256 163,258 160,262 C 158,267 155,270 152,272 L 152,285 Z"
              fill="black"
            />
            {/* Matching branch segment at top center */}
            <path
              d="M 148,15 L 148,28 C 145,30 142,33 140,38 C 137,42 132,44 128,42 L 126,40 C 131,46 137,47 142,43 C 145,40 147,36 148,34 C 148,38 145,42 141,45 C 138,48 138,53 140,57 C 142,52 143,49 146,48 C 149,47 150,44 150,41 C 150,44 151,47 154,48 C 157,49 158,52 160,57 C 162,53 162,48 159,45 C 155,42 152,38 152,34 C 153,36 155,40 158,43 C 163,47 169,46 174,40 L 172,42 C 168,44 163,42 160,38 C 158,33 155,30 152,28 L 152,15 Z"
              fill="black"
            />
          </g>
        );

      case 10:
        // Design 11: Kalp Ritmi (Heartbeat EKG Line)
        return (
          <g>
            <circle cx={center} cy={center} r={118} stroke="black" strokeWidth="1.2" fill="none" />
            
            {/* Heartbeat EKG path at the bottom */}
            <path
              d="M 62,260 L 110,260 L 115,250 L 120,270 L 126,240 L 132,275 L 138,260 L 144,260 L 156,260 L 162,260 L 168,275 L 174,240 L 180,270 L 185,250 L 190,260 L 238,260"
              stroke="black"
              strokeWidth="2.2"
              strokeLinejoin="miter"
              strokeLinecap="round"
              fill="none"
            />
            {/* Solid heartbeat-heart in the middle of the EKG line */}
            <path
              d="M 0,0 C -1.5,-1.5 -4,-1.5 -5,0 C -6,1.5 -6,3.5 -4.5,5 L 0,9 L 4.5,5 C 6,3.5 6,1.5 5,0 C 4,-1.5 1.5,-1.5 0,0 Z"
              fill="black"
              transform={`translate(${center}, 255) scale(1.4)`}
            />
          </g>
        );

      case 11:
        // Design 12: Minimal Ayçiçeği (Sunflower Medallion)
        return (
          <g>
            <circle cx={center} cy={center} r={118} stroke="black" strokeWidth="1.5" fill="none" />
            {drawSunflower(center, 25, "top", 1.05)}
            {drawSunflower(center, 275, "bottom", 1.05)}
          </g>
        );

      case 12:
        // Design 13: Geometrik Lotus (Lotus Flower)
        return (
          <g>
            <circle cx={center} cy={center} r={118} stroke="black" strokeWidth="1.5" fill="none" />
            
            {/* Symmetrical Geometric Lotus Flower at bottom center */}
            <path
              d="M 0,-8 C -4,-18 -16,-18 -12,2 C -8,10 0,14 0,14 C 0,14 8,10 12,2 C 16,-18 4,-18 0,-8 Z M -2,2 C -5,-4 -9,-8 -8,-2 C -7,3 0,8 0,8 C 0,8 7,3 8,-2 C 9,-8 5,-4 2,2 Z"
              fill="black"
              transform={`translate(${center}, 260) scale(1.35)`}
            />

            {/* Small Lotus bud at top center */}
            <path
              d="M 0,-8 C -4,-18 -16,-18 -12,2 C -8,10 0,14 0,14 C 0,14 8,10 12,2 C 16,-18 4,-18 0,-8 Z"
              fill="black"
              transform={`translate(${center}, 38) scale(0.8) rotate(180)`}
            />
          </g>
        );

      case 13:
        // Design 14: Çift Kalp (Double Interlocked Hearts)
        return (
          <g>
            <circle cx={center} cy={center} r={118} stroke="black" strokeWidth="2.0" fill="none" />
            
            {/* Interlocking Hearts at top center */}
            <g transform="translate(0, 5)">
              <path
                d="M 0,0 C -1.5,-1.5 -4,-1.5 -5,0 C -6,1.5 -6,3.5 -4.5,5 L 0,9 L 4.5,5 C 6,3.5 6,1.5 5,0 C 4,-1.5 1.5,-1.5 0,0 Z"
                fill="black"
                transform={`translate(141, 16) rotate(-15) scale(1.7)`}
              />
              {/* White masking border for the overlapping heart to ensure vector separation */}
              <path
                d="M 0,0 C -1.5,-1.5 -4,-1.5 -5,0 C -6,1.5 -6,3.5 -4.5,5 L 0,9 L 4.5,5 C 6,3.5 6,1.5 5,0 C 4,-1.5 1.5,-1.5 0,0 Z"
                fill="none"
                stroke="white"
                strokeWidth="2.8"
                transform={`translate(155, 20) rotate(15) scale(1.7)`}
              />
              <path
                d="M 0,0 C -1.5,-1.5 -4,-1.5 -5,0 C -6,1.5 -6,3.5 -4.5,5 L 0,9 L 4.5,5 C 6,3.5 6,1.5 5,0 C 4,-1.5 1.5,-1.5 0,0 Z"
                fill="black"
                transform={`translate(155, 20) rotate(15) scale(1.7)`}
              />
            </g>

            {/* Interlocking Hearts at bottom center */}
            <g transform="translate(0, -5)">
              <path
                d="M 0,0 C -1.5,-1.5 -4,-1.5 -5,0 C -6,1.5 -6,3.5 -4.5,5 L 0,9 L 4.5,5 C 6,3.5 6,1.5 5,0 C 4,-1.5 1.5,-1.5 0,0 Z"
                fill="black"
                transform={`translate(141, 276) rotate(-15) scale(1.7)`}
              />
              <path
                d="M 0,0 C -1.5,-1.5 -4,-1.5 -5,0 C -6,1.5 -6,3.5 -4.5,5 L 0,9 L 4.5,5 C 6,3.5 6,1.5 5,0 C 4,-1.5 1.5,-1.5 0,0 Z"
                fill="none"
                stroke="white"
                strokeWidth="2.8"
                transform={`translate(155, 280) rotate(15) scale(1.7)`}
              />
              <path
                d="M 0,0 C -1.5,-1.5 -4,-1.5 -5,0 C -6,1.5 -6,3.5 -4.5,5 L 0,9 L 4.5,5 C 6,3.5 6,1.5 5,0 C 4,-1.5 1.5,-1.5 0,0 Z"
                fill="black"
                transform={`translate(155, 280) rotate(15) scale(1.7)`}
              />
            </g>
          </g>
        );

      case 14:
        // Design 15: Deniz Dalgası & İstiridye (Ocean Wave & Shell)
        return (
          <g>
            <circle cx={center} cy={center} r={118} stroke="black" strokeWidth="1.8" fill="none" />
            
            {/* Waves at top center */}
            <path
              d="M -20,3 C -10,3 -7,-3 -2,-3 C 3,-3 5,3 15,3 C 25,3 27,-3 32,-3"
              stroke="black"
              strokeWidth="2.2"
              fill="none"
              strokeLinecap="round"
              transform={`translate(${center}, 23)`}
            />
            {/* Little sun dot above waves */}
            <circle cx={center} cy="14" r="2" fill="black" />

            {/* Waves at bottom center */}
            <path
              d="M -20,3 C -10,3 -7,-3 -2,-3 C 3,-3 5,3 15,3 C 25,3 27,-3 32,-3"
              stroke="black"
              strokeWidth="2.2"
              fill="none"
              strokeLinecap="round"
              transform={`translate(${center}, 277) rotate(180)`}
            />
            <circle cx={center} cy="286" r="2" fill="black" />
          </g>
        );

      default:
        return null;
    }
  };

  // Download the clean vector SVG
  const downloadSvg = () => {
    const svgElement = document.getElementById("qr-svg-necklace");
    if (!svgElement) return;
    const serializer = new XMLSerializer();
    let source = serializer.serializeToString(svgElement);
    
    // Add missing xml namespaces
    if (!source.match(/^<svg[^>]+xmlns="http:\/\/www\.w3\.org\/2000\/svg"/)) {
      source = source.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
    }
    if (!source.match(/^<svg[^>]+xmlns:xlink="http:\/\/www\.w3\.org\/1999\/xlink"/)) {
      source = source.replace(/^<svg/, '<svg xmlns:xlink="http://www.w3.org/1999/xlink"');
    }
    
    const preface = '<?xml version="1.0" standalone="no"?>\r\n';
    const svgBlob = new Blob([preface + source], { type: "image/svg+xml;charset=utf-8" });
    const svgUrl = URL.createObjectURL(svgBlob);
    
    const downloadLink = document.createElement("a");
    downloadLink.href = svgUrl;
    downloadLink.download = `qr-kolye-${selectedEditSlug.toLowerCase()}-${selectedStyle + 1}.svg`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  // Convert the SVG elements to standard CAD DXF format (using LINES and CIRCLES)
  const downloadDxf = () => {
    const svgElement = document.getElementById("qr-svg-necklace");
    if (!svgElement) return;

    let dxfContent = [
      "  0", "SECTION",
      "  2", "HEADER",
      "  9", "$ACADVER",
      "  1", "AC1015",
      "  0", "ENDSEC",
      "  0", "SECTION",
      "  2", "ENTITIES"
    ];

    // Helper to add a circle to DXF content
    const addDxfCircle = (cx: number, cy: number, r: number) => {
      // Invert Y axis for CAD standard orientation (origin at bottom-left of 300x300 canvas)
      const cadX = cx;
      const cadY = 300 - cy;
      
      dxfContent.push(
        "  0", "CIRCLE",
        "  8", "0",
        " 10", cadX.toFixed(4),
        " 20", cadY.toFixed(4),
        " 30", "0.0",
        " 40", r.toFixed(4)
      );
    };

    // Helper to add a line to DXF content
    const addDxfLine = (x1: number, y1: number, x2: number, y2: number) => {
      const cadX1 = x1;
      const cadY1 = 300 - y1;
      const cadX2 = x2;
      const cadY2 = 300 - y2;

      dxfContent.push(
        "  0", "LINE",
        "  8", "0",
        " 10", cadX1.toFixed(4),
        " 20", cadY1.toFixed(4),
        " 30", "0.0",
        " 11", cadX2.toFixed(4),
        " 21", cadY2.toFixed(4),
        " 31", "0.0"
      );
    };

    // Recursively traverse DOM nodes to generate DXF vectors
    const traverse = (node: Element) => {
      if (node.tagName === "circle") {
        const cx = parseFloat(node.getAttribute("cx") || "0");
        const cy = parseFloat(node.getAttribute("cy") || "0");
        const r = parseFloat(node.getAttribute("r") || "0");
        const strokeWidthAttr = node.getAttribute("stroke-width");
        const strokeWidth = strokeWidthAttr ? parseFloat(strokeWidthAttr) : 0;

        if (strokeWidth > 0) {
          // Stroked circle: draw inner and outer borders for CAD vector definition
          addDxfCircle(cx, cy, r - strokeWidth / 2);
          addDxfCircle(cx, cy, r + strokeWidth / 2);
        } else {
          // Regular filled/solid circle
          addDxfCircle(cx, cy, r);
        }
      } else if (node.tagName === "rect") {
        const x = parseFloat(node.getAttribute("x") || "0");
        const y = parseFloat(node.getAttribute("y") || "0");
        const w = parseFloat(node.getAttribute("width") || "0");
        const h = parseFloat(node.getAttribute("height") || "0");

        // Represent square modules and finders as 4 CAD lines
        addDxfLine(x, y, x + w, y);
        addDxfLine(x + w, y, x + w, y + h);
        addDxfLine(x + w, y + h, x, y + h);
        addDxfLine(x, y + h, x, y);
      } else if (node.tagName === "path") {
        const d = node.getAttribute("d") || "";
        const transform = node.getAttribute("transform") || "";
        
        // Parse transformations: translate, scale, scaleX, scaleY, rotate
        let tx = 0, ty = 0, scaleX = 1, scaleY = 1, rotDeg = 0;
        
        const translateMatch = transform.match(/translate\(([^,)]+),?\s*([^)]*)\)/);
        if (translateMatch) {
          tx = parseFloat(translateMatch[1]);
          ty = translateMatch[2] ? parseFloat(translateMatch[2]) : 0;
        }
        
        const scaleMatch = transform.match(/scale\(([^,)]+),?\s*([^)]*)\)/);
        if (scaleMatch) {
          const sx = parseFloat(scaleMatch[1]);
          const sy = scaleMatch[2] ? parseFloat(scaleMatch[2]) : sx;
          scaleX = sx;
          scaleY = sy;
        }

        const scaleXMatch = transform.match(/scaleX\(([^)]+)\)/);
        if (scaleXMatch) {
          scaleX *= parseFloat(scaleXMatch[1]);
        }

        const scaleYMatch = transform.match(/scaleY\(([^)]+)\)/);
        if (scaleYMatch) {
          scaleY *= parseFloat(scaleYMatch[1]);
        }
        
        const rotateMatch = transform.match(/rotate\(([^)]+)\)/);
        if (rotateMatch) {
          rotDeg = parseFloat(rotateMatch[1]);
        }

        const rotRad = (rotDeg * Math.PI) / 180;

        const applyTransform = (px: number, py: number) => {
          // 1. Scale
          let sx = px * scaleX;
          let sy = py * scaleY;
          // 2. Rotate
          let rx = sx * Math.cos(rotRad) - sy * Math.sin(rotRad);
          let ry = sx * Math.sin(rotRad) + sy * Math.cos(rotRad);
          // 3. Translate
          return { x: rx + tx, y: ry + ty };
        };

        // Parse SVG path commands
        const commands = d.match(/[a-df-z][^a-df-z]*/ig) || [];
        let startPoint = { x: 0, y: 0 };
        let currentPoint = { x: 0, y: 0 };

        commands.forEach(cmdStr => {
          const type = cmdStr[0];
          const args = (cmdStr.substring(1).trim().split(/[\s,]+/) || []).map(parseFloat).filter(v => !isNaN(v));

          if (type.toUpperCase() === "M" && args.length >= 2) {
            const pt = applyTransform(args[0], args[1]);
            startPoint = pt;
            currentPoint = pt;
          } else if (type.toUpperCase() === "L" && args.length >= 2) {
            for (let i = 0; i < args.length; i += 2) {
              const nextPoint = applyTransform(args[i], args[i+1]);
              addDxfLine(currentPoint.x, currentPoint.y, nextPoint.x, nextPoint.y);
              currentPoint = nextPoint;
            }
          } else if (type.toUpperCase() === "C" && args.length >= 6) {
            // Cubic bezier curve approximation: divide into 8 linear segments
            for (let k = 0; k < args.length; k += 6) {
              const cp1 = applyTransform(args[k], args[k+1]);
              const cp2 = applyTransform(args[k+2], args[k+3]);
              const end = applyTransform(args[k+4], args[k+5]);
              
              const start = { ...currentPoint };
              const steps = 8;
              for (let i = 1; i <= steps; i++) {
                const t = i / steps;
                const mt = 1 - t;
                const x = mt * mt * mt * start.x + 3 * mt * mt * t * cp1.x + 3 * mt * t * t * cp2.x + t * t * t * end.x;
                const y = mt * mt * mt * start.y + 3 * mt * mt * t * cp1.y + 3 * mt * t * t * cp2.y + t * t * t * end.y;
                addDxfLine(currentPoint.x, currentPoint.y, x, y);
                currentPoint = { x, y };
              }
            }
          } else if (type.toUpperCase() === "Z") {
            addDxfLine(currentPoint.x, currentPoint.y, startPoint.x, startPoint.y);
            currentPoint = startPoint;
          }
        });
      }
      
      // Traverse children nodes
      Array.from(node.children).forEach(child => traverse(child));
    };

    traverse(svgElement);

    dxfContent.push("  0", "ENDSEC", "  0", "EOF");

    const dxfBlob = new Blob([dxfContent.join("\r\n")], { type: "application/dxf;charset=utf-8" });
    const dxfUrl = URL.createObjectURL(dxfBlob);
    
    const downloadLink = document.createElement("a");
    downloadLink.href = dxfUrl;
    downloadLink.download = `qr-kolye-${selectedEditSlug.toLowerCase()}-${selectedStyle + 1}.dxf`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  // Convert SVG to high-res PNG and download
  const downloadPng = () => {
    const svgElement = document.getElementById("qr-svg-necklace");
    if (!svgElement) return;
    const serializer = new XMLSerializer();
    const source = serializer.serializeToString(svgElement);
    
    const img = new Image();
    const svgBlob = new Blob([source], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(svgBlob);
    
    img.onload = () => {
      const canvas = document.createElement("canvas");
      // 1200x1200px for crisp high-res printing / previewing
      canvas.width = 1200;
      canvas.height = 1200;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        // High quality scale-up rendering
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, 1200, 1200);
        ctx.drawImage(img, 0, 0, 1200, 1200);
        
        const pngUrl = canvas.toDataURL("image/png");
        const downloadLink = document.createElement("a");
        downloadLink.href = pngUrl;
        downloadLink.download = `qr-kolye-${selectedEditSlug.toLowerCase()}-${selectedStyle + 1}.png`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
      }
      URL.revokeObjectURL(url);
    };
    img.src = url;
  };

  // Styling names in Turkish (Total: 15 styles)
  const designNames = [
    "Minimal Kalp",
    "Defne Çelengi",
    "Yıldızlı Gökyüzü",
    "Güneş Medalyonu",
    "İsim Çemberi",
    "Zarif Papatya",
    "Sarmaşık Gül",
    "Kelebek Esintisi",
    "Sonsuzluk Bağı",
    "Hayat Ağacı",
    "Kalp Ritmi",
    "Minimal Ayçiçeği",
    "Geometrik Lotus",
    "Çift Kalp",
    "Deniz Dalgası",
  ];

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9999,
      background: "rgba(11,15,26,0.85)", backdropFilter: "blur(16px)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: "20px"
    }}>
      <div style={{
        background: "#160408", border: `1px solid ${C.border}`,
        borderRadius: "28px", padding: "32px", width: "100%", maxWidth: "780px",
        boxShadow: "0 28px 72px rgba(0,0,0,0.9)",
        fontFamily: "var(--font-inter), sans-serif",
        display: "flex", flexDirection: "column", gap: "24px"
      }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h3 style={{ fontFamily: "var(--font-cormorant), serif", fontSize: "28px", color: C.text, fontWeight: 600 }}>
              Kolye İçin QR Kod Oluşturucu
            </h3>
            <span style={{ fontSize: "12px", color: C.muted }}>
              Lazer baskı için optimize edilmiş vektörel (SVG) yuvarlak kolye tasarımları
            </span>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "rgba(255,255,255,0.05)", border: "none", borderRadius: "50%",
              width: "36px", height: "36px", display: "flex", alignItems: "center", justifyContent: "center",
              color: C.text, cursor: "pointer", transition: "background 0.2s"
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.1)"}
            onMouseLeave={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}
          >
            <HiOutlineX size={18} />
          </button>
        </div>

        {/* Content Layout */}
        <div style={{ display: "flex", gap: "32px", flexWrap: "wrap" }}>
          
          {/* Left: SVG Live Preview */}
          <div style={{
            flex: "1 1 300px", display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center", background: "#FFFFFF",
            borderRadius: "20px", padding: "24px", position: "relative",
            boxShadow: "inset 0 2px 8px rgba(0,0,0,0.15)",
            border: `1px solid ${C.border}`
          }}>
            {/* The circular representation of a 2cm metal disk */}
            <div style={{
              width: "280px", height: "280px", borderRadius: "50%",
              border: "1px dashed rgba(11,15,26,0.12)", position: "relative",
              overflow: "hidden"
            }}>
              {qrMatrix ? (
                <svg
                  id="qr-svg-necklace"
                  viewBox={`0 0 ${size} ${size}`}
                  style={{ width: "100%", height: "100%", background: "#FFFFFF" }}
                >
                  {/* Decorative Frame based on selection */}
                  {renderFrame()}

                  {/* QR Grid modules */}
                  {gridPoints}

                  {/* Concentric Circle Finders */}
                  {finders}
                </svg>
              ) : (
                <div style={{ display: "flex", height: "100%", alignItems: "center", justifyContent: "center", color: "#111111", fontSize: "13px" }}>
                  QR Kod Üretiliyor...
                </div>
              )}
            </div>
            
            {/* Mini metal chain graphic to make it look like a necklace */}
            <div style={{
              position: "absolute", top: "10px", width: "16px", height: "16px",
              borderRadius: "50%", border: "3px solid #E5C2BA", background: "transparent",
              zIndex: 1, pointerEvents: "none"
            }} />
          </div>

          {/* Right: Controls & Options */}
          <div style={{ flex: "1.2 1 320px", display: "flex", flexDirection: "column", gap: "20px" }}>
            
            {/* Style Selector with custom scroll bar for 15 options */}
            <div>
              <span style={{ fontSize: "11px", letterSpacing: "0.12em", textTransform: "uppercase", color: C.muted, fontWeight: 600, display: "block", marginBottom: "10px" }}>
                Tasarım Seçenekleri
              </span>
              <div style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "8px",
                maxHeight: "185px",
                overflowY: "auto",
                paddingRight: "6px"
              }}>
                {designNames.map((name, idx) => {
                  const isSelected = selectedStyle === idx;
                  return (
                    <button
                      key={`style-btn-${idx}`}
                      onClick={() => setSelectedStyle(idx)}
                      style={{
                        padding: "12px 14px", borderRadius: "12px", textAlign: "left",
                        background: isSelected ? "rgba(201,168,76,0.08)" : "rgba(255,255,255,0.02)",
                        border: `1px solid ${isSelected ? C.gold : "rgba(255,255,255,0.05)"}`,
                        color: isSelected ? C.gold : C.text, fontSize: "13px", fontWeight: isSelected ? 600 : 500,
                        cursor: "pointer", transition: "all 0.2s"
                      }}
                    >
                      {idx + 1}. {name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Lazer Optimizasyon Seçenekleri */}
            <div style={{ display: "flex", gap: "12px" }}>
              <div style={{ flex: 1 }}>
                <span style={{ fontSize: "11px", letterSpacing: "0.12em", textTransform: "uppercase", color: C.muted, fontWeight: 600, display: "block", marginBottom: "8px" }}>
                  Nokta Tipi
                </span>
                <select
                  value={dotShape}
                  onChange={(e) => setDotShape(e.target.value as any)}
                  style={{
                    width: "100%", padding: "10px 12px", borderRadius: "12px",
                    background: "rgba(255,255,255,0.03)", border: `1px solid ${C.border}`,
                    color: C.text, fontSize: "13px", outline: "none", cursor: "pointer",
                    fontFamily: "var(--font-inter), sans-serif"
                  }}
                >
                  <option value="square">Kare (Önerilen)</option>
                  <option value="circle">Yuvarlak</option>
                </select>
              </div>

              <div style={{ flex: 1 }}>
                <span style={{ fontSize: "11px", letterSpacing: "0.12em", textTransform: "uppercase", color: C.muted, fontWeight: 600, display: "block", marginBottom: "8px" }}>
                  Hata Toleransı
                </span>
                <select
                  value={errorCorrection}
                  onChange={(e) => setErrorCorrection(e.target.value as any)}
                  style={{
                    width: "100%", padding: "10px 12px", borderRadius: "12px",
                    background: "rgba(255,255,255,0.03)", border: `1px solid ${C.border}`,
                    color: C.text, fontSize: "13px", outline: "none", cursor: "pointer",
                    fontFamily: "var(--font-inter), sans-serif"
                  }}
                >
                  <option value="M">Medium (%15 - Önerilen)</option>
                  <option value="Q">Quartile (%25 - Yüksek)</option>
                  <option value="H">High (%30 - Maksimum)</option>
                  <option value="L">Low (%7 - Büyük Noktalar)</option>
                </select>
              </div>
            </div>

            {/* Target URL Info */}
            <div style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${C.border}`, borderRadius: "16px", padding: "16px" }}>
              <div style={{ fontSize: "11px", color: C.muted, marginBottom: "4px" }}>Bağlantı Adresi:</div>
              <div style={{ fontSize: "14px", color: C.text, fontFamily: "monospace", overflowWrap: "anywhere", fontWeight: 600 }}>
                birlikteydik.com/{selectedEditSlug}
              </div>
            </div>

            {/* Lazer Engraving Information */}
            <div style={{ background: "rgba(201,168,76,0.04)", border: "1px solid rgba(201,168,76,0.15)", borderRadius: "16px", padding: "16px", fontSize: "12px", color: "#E5C2BA", lineHeight: "1.6" }}>
              <strong>⚠️ Parlak Metal ve Lazer Baskı Ayarı:</strong>
              <div style={{ marginTop: "6px" }}>
                Kolyeniz aynalı/parlak metal ise yansımaları önlemek için <strong>Kare Nokta Tipi</strong>'ni seçin. Kare seçiminde pikseller birleşerek boşluksuz, pürüzsüz bloklar oluşturur ve telefon kamerası yansımalardan etkilenmeden kodu kolayca okur. Ayrıca hata toleransını <strong>Medium (%15) veya daha yüksek</strong> tutarak taranabilirliği garantileyebilirsiniz.
              </div>
            </div>

            {/* Download Actions */}
            <div style={{ display: "flex", gap: "10px", marginTop: "auto" }}>
              <button
                onClick={downloadPng}
                style={{
                  flex: 1, padding: "14px", borderRadius: "30px", border: "1px solid rgba(255,255,255,0.1)",
                  background: "transparent", color: C.text, fontSize: "13px", fontWeight: 600,
                  cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                  transition: "background 0.2s"
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.04)"}
                onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
              >
                PNG İndir (Önizleme)
              </button>
              <button
                onClick={downloadSvg}
                style={{
                  flex: 1, padding: "14px", borderRadius: "30px", border: "1px solid rgba(255,255,255,0.1)",
                  background: "rgba(255,255,255,0.05)", color: C.text, fontSize: "13px", fontWeight: 600,
                  cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                  transition: "background 0.2s"
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.1)"}
                onMouseLeave={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}
              >
                <HiOutlineDownload size={16} />
                SVG İndir
              </button>
              <button
                onClick={downloadDxf}
                style={{
                  flex: 1.2, padding: "14px", borderRadius: "30px", border: "none",
                  background: C.gold, color: "#0B0F1A", fontSize: "13px", fontWeight: 700,
                  cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                  boxShadow: "0 4px 14px rgba(201,168,76,0.3)"
                }}
              >
                <HiOutlineDownload size={16} />
                DXF İndir (AutoCAD)
              </button>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
