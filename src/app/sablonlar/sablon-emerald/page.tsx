"use client";

import BosTemplate from "../sablon-bos/page";

export const defaultConfig = {
  coupleNames: "Yasin\n&\nArzu",
  tagline: "Karanlık yeşillikler arasında parlayan, en kıymetli altın değerindeki birlikteydik...",
  accentColor: "#D4AF37",
  bgColor: "#022C22",
  specialDate: "17.03.2026",
  musicUrl: "/music/emerald.mp3",
  particlesEnabled: true,
  particlesType: "stars" as const,
  memoryCardStyle: "plain" as const,
  headingFont: "cormorant" as const,
  bodyFont: "inter" as const,
};

export const defaultMemories = [
  {
    id: 1,
    image: "/moment.jpg",
    title: "Nadir Bir Hazine",
    description: "Tıpkı derin ormanların en kuytusunda saklanan değerli bir zümrüt gibi, hayatıma kattığın en özel değer.",
    date: "Güz 2024",
  },
  {
    id: 2,
    image: "/moment2.jpg",
    title: "Altın Işıltılı Anlar",
    description: "Güneşin batarken gökyüzünü altın sarısına boyadığı, elini ilk kez sımsıkı tuttuğum o muazzam gün.",
    date: "Kış 2024",
  },
  {
    id: 3,
    image: "/moment3.jpg",
    title: "Sonsuz Yankı",
    description: "Kelimelerin yetersiz kaldığı, sadece nefeslerimizin ve gözlerimizin konuştuğu o lüks ve derin sessizlik.",
    date: "Bahar 2025",
  },
];

export default function EmeraldTemplate({ config, memories, pageSlug }: any) {
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
