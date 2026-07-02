"use client";

import BosTemplate from "../sablon-bos/page";

export const defaultConfig = {
  coupleNames: "Kaan\n&\nYağmur",
  tagline: "Bir sevgi belgeseli, başrollerde sadece bizim olduğumuz...",
  accentColor: "#B8A9D4",
  bgColor: "#0C0C0E",
  specialDate: "2024 - 2025",
  musicUrl: "/music/kirmizi.mp3",
  particlesEnabled: true,
  particlesType: "stars" as const,
  memoryCardStyle: "cinematic" as const,
  headingFont: "cormorant" as const,
  bodyFont: "inter" as const,
};

export const defaultMemories = [
  {
    id: 1,
    image: "/moment.jpg",
    title: "İlk Bakış, İlk Gülüş",
    description: "Seni gördüğüm o an, zamanın tüm hızını unutup durduğu saniyeydi. O gün anladım kaderimin seninle yazıldığını.",
    date: "26 Ekim 2024",
  },
  {
    id: 2,
    image: "/moment2.jpg",
    title: "Sıkıca, Hiç Bırakmamacasına",
    description: "Bileğimizdeki ipler, boncuklar ve kalbimizi birbirine bağlayan o görünmez düğüm...",
    date: "12 Kasım 2024",
  },
  {
    id: 3,
    image: "/moment7.jpg",
    title: "Eski Bir Şarkının İzinde",
    description: "Tozlu rafların arasında, eski plakların cızırtısında kaybolduğumuz o pazar günü.",
    date: "14 Aralık 2024",
  },
  {
    id: 4,
    image: "/moment3.jpg",
    title: "Yıldızların Altında",
    description: "Şehrin tüm gürültüsünden uzakta, tepede uzanıp gökyüzünü izlerken dilek tuttuğumuz o gece. Ben sadece senin gözlerine baktım ve içimden hep aynı şeyi diledim: Sonsuzluk.",
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
    description: "Başardığımız, büyüdüğümüz ve geleceğe doğru ilk büyük adımı attığımız o gün; yanımda sen varsan her zorluğun üstesinden gelebileceğimi bir kez daha anladım.",
    date: "12 Haziran 2025",
  },
  {
    id: 7,
    image: "/moment6.jpg",
    title: "Beyazlar İçinde Bir Ömür",
    description: "Ellerinin arasında tuttuğun o güller, senin zarafetinin yanında sadece ufak birer ayrıntıydı. Hayatımın en güzel, en berrak 'Evet'ini fısıldarken; kalbimi sonsuza dek sana emanet etmenin gururunu yaşıyordum.",
    date: "18 Eylül 2025",
  },
  {
    id: 8,
    image: "/moment8.jpg",
    title: "Sonsuzluğun Kıyısında",
    description: "Şehrin, insanların ve zamanın fersah fersah uzağında... Sadece iki siluet olarak gökyüzünün ve denizin sonsuzluğuna karıştığımız o an. Biz artık iki ayrı insan değil, aynı denizde eriyen tek bir hikayeyiz.",
    date: "02 Mayıs 2026",
  },
];

export default function CinematicTemplate({ config, memories, pageSlug }: any) {
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
