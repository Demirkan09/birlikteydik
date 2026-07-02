"use client";

import BosTemplate from "../sablon-bos/page";

export const defaultConfig = {
  coupleNames: "Berke\n&\nSelin",
  tagline: "Birlikte geçen her anın değerini ve sonsuzluğa uzanan hikayemizi kutluyoruz...",
  accentColor: "#C9A84C",
  bgColor: "#09090b",
  specialDate: "26 Ekim 2024",
  musicUrl: "/music/siyah.mp3",
  particlesEnabled: true,
  particlesType: "hearts" as const,
  memoryCardStyle: "plain" as const,
  headingFont: "cormorant" as const,
  bodyFont: "inter" as const,
};

export const defaultMemories = [
  {
    id: 1,
    image: "/moment.jpg",
    title: "İlk Bakış",
    description: "Gözlerin ilk kez benimkilerle buluştuğunda, tüm evren bir an için sessizleşti.",
    date: "14 Şubat 2025",
  },
  {
    id: 2,
    image: "/moment2.jpg",
    title: "Kalp Atışlarımız",
    description: "Sadece elini tutmak bile kalbimin ritmini hızlandırıp, tüm dünyadaki en mutlu ezgiyi çalıyormuş gibi hissettiriyor.",
    date: "12 Mart 2025",
  },
  {
    id: 3,
    image: "/moment7.jpg",
    title: "Sonsuz Bağımız",
    description: "Her saniye, her nefeste sana olan sevgimin daha da alevlendiğini, bizi ayıramayacak güçlü bir bağa dönüştüğünü biliyorum.",
    date: "25 Nisan 2025",
  },
  {
    id: 4,
    image: "/moment3.jpg",
    title: "Yıldızların Altında",
    description: "Şehrin tüm gürültüsünden uzakta, gökyüzünü izlerken dilek tuttuğumuz o gece. İçimden hep aynı şeyi diledim: Sonsuzluk.",
    date: "18 Ocak 2025",
  },
  {
    id: 5,
    image: "/moment4.jpg",
    title: "Maviye Açılan Sonsuzluk",
    description: "Benim için dünyanın en huzurlu limanı burasıydı sevgilim, çünkü yanımda sen varsın.",
    date: "22 Nisan 2025",
  },
  {
    id: 6,
    image: "/moment5.jpg",
    title: "Birlikte Yeni Bir Başlangıç",
    description: "Başardığımız, büyüdüğümüz ve geleceğe doğru ilk büyük adımı attığımız o gün; yanımda sen varsan her zorluğun üstesinden gelebileceğimi anladım.",
    date: "12 Haziran 2025",
  },
  {
    id: 7,
    image: "/moment6.jpg",
    title: "Beyazlar İçinde Bir Ömür",
    description: "Ellerinin arasında tuttuğun o güller, senin zarafetinin yanında sadece ufak birer ayrıntıydı. Hayatımın en berrak 'Evet'ini fısıldarken kalbimi sonsuza dek sana emanet ettim.",
    date: "18 Eylül 2025",
  },
  {
    id: 8,
    image: "/moment8.jpg",
    title: "Sonsuzluğun Kıyısında",
    description: "Şehrin, insanların ve zamanın fersah fersah uzağında... Sadece iki siluet olarak gökyüzünün ve denizin sonsuzluğuna karıştığımız o an.",
    date: "02 Mayıs 2026",
  },
];

export default function BlackNightTemplate({ config, memories, pageSlug }: any) {
  const mergedConfig = {
    ...defaultConfig,
    ...(config ?? {}),
  };
  const mergedMemories = memories ?? defaultMemories;
  return (
    <BosTemplate
      config={mergedConfig}
      memories={mergedMemories}
      pageSlug={pageSlug}
    />
  );
}
