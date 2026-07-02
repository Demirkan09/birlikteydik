"use client";

import BosTemplate from "../sablon-bos/page";

export const defaultConfig = {
  coupleNames: "Serkan\n&\nKübra",
  tagline: "Karanlığın en zarif tonunda, aşkımızın en derin izleri... Koyu kadife gül kurusu ve gül yapraklarının süzüldüğü sonsuz bir rüya.",
  accentColor: "#e5c2ba",
  bgColor: "#160C0E",
  specialDate: "14 Şubat 2025",
  musicUrl: "/music/retro.mp3",
  particlesEnabled: true,
  particlesType: "rose-petals" as const,
  memoryCardStyle: "polaroid" as const,
  headingFont: "cormorant" as const,
  bodyFont: "lato" as const,
  polaroidTilt: true,
};

export const defaultMemories = [
  { id: 1, image: "/moment.jpg", title: "İlk Günümüz", caption: "gözlerinde kaybolduğum o ilk an...", date: "Şubat '25", rotate: -2.5 },
  { id: 2, image: "/moment2.jpg", title: "Sıkıca El Ele", caption: "ellerin ellerime en güzel emanet", date: "Mart '25", rotate: 1.8 },
  { id: 3, image: "/moment7.jpg", title: "Sonsuz Zaman", caption: "zaman durdu, dünya sadece ikimizden ibaret", date: "Nisan '25", rotate: -1.2 },
  { id: 4, image: "/moment3.jpg", title: "Gece Yarısı Esintisi", caption: "yıldızlar altında sessizce dinledik geceyi", date: "Ocak '25", rotate: 2.3 },
  { id: 5, image: "/moment4.jpg", title: "Deniz ve Huzur", caption: "seninle her liman sakin, her yolculuk güzel", date: "Nisan '25", rotate: -1.8 },
  { id: 6, image: "/moment5.jpg", title: "Küçük Başarılar", caption: "omuz omuza verdikten sonra her şey kolay", date: "Haziran '25", rotate: 1.5 },
  { id: 7, image: "/moment6.jpg", title: "En Güzel Evet", caption: "bir ömre seninle yürümek için kocaman evet", date: "Eylül '25", rotate: -2.1 },
  { id: 8, image: "/moment8.jpg", title: "Sonsuz Ufuklar", caption: "seninle başlayan hikayemizin sonsuz ufkundayız", date: "Mayıs '26", rotate: 1.9 },
];

export default function DarkRoseTemplate({ config, memories, pageSlug }: any) {
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