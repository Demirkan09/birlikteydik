import type { Metadata } from "next";
import { Cormorant_Garamond, Lato } from "next/font/google";
import "./globals.css";

// Fontları Next.js'in optimize sistemiyle yüklüyoruz (Sıfır gecikme, sıfır uyarı)
const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-cormorant",
});

const lato = Lato({
  subsets: ["latin"],
  weight: ["300", "400"],
  variable: "--font-lato",
});

export const metadata: Metadata = {
  title: "Anılarımız",
  description: "Birlikte geçen her güzel anı.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className="scroll-smooth">
      <body className={`${cormorant.variable} ${lato.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}