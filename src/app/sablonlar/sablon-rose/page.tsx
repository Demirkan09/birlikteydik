"use client";

import BosTemplate from "../sablon-bos/page";

export const defaultConfig = {
  coupleNames: "Mehmet\n&\nEmine",
  tagline: "Eski bir fotoğraf gibi sararmış zamanlarda bile, seninle geçen her anı hâlâ canlı hissediyorum.",
  accentColor: "#E8A0A0",
  bgColor: "#F8F0EA",
  specialDate: "14 Şubat 2025",
  musicUrl: "/music/beyaz.mp3",
  particlesEnabled: true,
  particlesType: "rose-petals" as const,
  memoryCardStyle: "polaroid" as const,
  headingFont: "cormorant" as const,
  bodyFont: "lato" as const,
  polaroidTilt: true,
};

export const defaultMemories = [
  { id: 1, image: "/moment.jpg", title: "İlk Gün", caption: "ne güzel bir başlangıçtı...", date: "Şub '25", rotate: -2.5 },
  { id: 2, image: "/moment2.jpg", title: "El Ele", caption: "ellerini hiç bırakmak istemiyorum", date: "Mar '25", rotate: 1.8 },
  { id: 3, image: "/moment7.jpg", title: "Sonsuzluk", caption: "sanki zaman durdu o anda", date: "Nis '25", rotate: -1.2 },
  { id: 4, image: "/moment3.jpg", title: "Gece Yarısı", caption: "yıldızlar bile bize baktı", date: "Oca '25", rotate: 2.3 },
  { id: 5, image: "/moment4.jpg", title: "Deniz Kıyısı", caption: "sonsuzluğu senle hissettim", date: "Nis '25", rotate: -1.8 },
  { id: 6, image: "/moment5.jpg", title: "Başarı", caption: "hep birlikte, hep ileri", date: "Haz '25", rotate: 1.5 },
  { id: 7, image: "/moment6.jpg", title: "Ebediyet", caption: "evet, sonsuzluk için evet", date: "Eyl '25", rotate: -2.1 },
  { id: 8, image: "/moment8.jpg", title: "Ufuk", caption: "seninle her ufuk daha güzel", date: "May '26", rotate: 1.9 },
];

export default function DustyRoseTemplate({ config, memories, pageSlug }: any) {
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