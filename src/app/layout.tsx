import type { Metadata } from "next";
import { Cormorant_Garamond, Lato, Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/navbar";
import CookieBanner from "@/components/cookies";

// Fontları Next.js'in optimize sistemiyle yüklüyoruz (Sıfır gecikme, sıfır uyarı)
const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-cormorant",
});

const lato = Lato({
  subsets: ["latin"],
  weight: ["300", "400", "700"],
  variable: "--font-lato",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "birlikteydik.com | Sevdiklerinize Özel Sürpriz Web Sitesi",
  description:
    "Fotoğraflarınızı, müziğinizi ve mesajınızı bir araya getirerek sevgilinize özel bir sürpriz link hazırlıyoruz. Doğum günü, yıldönümü ve tüm özel günler için.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className="scroll-smooth">
      <body className={`${cormorant.variable} ${lato.variable} ${inter.variable} antialiased`}>
        {/* Navbar — hangi sayfalarda göstereceği navbar.tsx içindeki PAGES dizisinden kontrol edilir */}
        <Navbar />
        {children}
        {/* Çerez Onayı — tüm sayfalarda çalışır, 1.5sn sonra sağ altta belirir */}
        <CookieBanner />
      </body>
    </html>
  );
}