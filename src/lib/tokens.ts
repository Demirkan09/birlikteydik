import crypto from "crypto";

/** Kriptografik olarak güvenli rastgele token üretir (hex formatında) */
export function generateSecureToken(bytes = 32): string {
  return crypto.randomBytes(bytes).toString("hex");
}

/** Aktivasyon kodu üretir — büyük harf + rakam, XX-XXXX-XX formatında */
export function generateActivationCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // belirsiz karakterler çıkarıldı (O,0,I,1)
  const pick = () => chars[Math.floor(Math.random() * chars.length)];
  const seg = (n: number) => Array.from({ length: n }, pick).join("");
  return `${seg(2)}-${seg(4)}-${seg(2)}`; // örn: XK-T7M2-9P
}

/** Token süresi dolmuş mu kontrol eder */
export function isTokenExpired(expiresAt: Date | string): boolean {
  return new Date(expiresAt) < new Date();
}
