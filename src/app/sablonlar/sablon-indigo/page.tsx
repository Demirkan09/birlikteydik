"use client";

import BosTemplate from "../sablon-bos/page";

export const defaultConfig = {
  coupleNames: "Melek\n&\nÖmer",
  tagline: "Gecenin en derin mavisinde, yıldızlar bile bizim hikayemizi fısıldıyor.",
  accentColor: "#6366F1",
  bgColor: "#04091a",
  specialDate: "14 Şubat 2025",
  musicUrl: "/music/indigo.mp3",
  particlesEnabled: true,
  particlesType: "stars" as const,
  memoryCardStyle: "plain" as const,
  headingFont: "cinzel" as const,
  bodyFont: "lato" as const,
};

export const defaultMemories = [
  { id: 1, image: "/moment.jpg", title: "İlk Bakış", description: "Gözlerin ilk kez benimkilerle buluştuğunda, tüm evren bir an için sessizleşti.", date: "14 Şubat 2025" },
  { id: 2, image: "/moment2.jpg", title: "Gece Yürüyüşü", description: "Sokak lambalarının altında, ellerimiz birbirine kenetlenmiş, dünya sadece bizden ibaretti.", date: "12 Mart 2025" },
  { id: 3, image: "/moment7.jpg", title: "Sonsuz An", description: "Zamanın durduğu o saniyelerde, seni ne kadar sevdiğimi kelimeler anlatamaz.", date: "25 Nisan 2025" },
  { id: 4, image: "/moment3.jpg", title: "Yıldızlar Altında", description: "Gökyüzüne baktık ama ben sadece seni gördüm. Sen benim en parlak yıldızımsın.", date: "18 Ocak 2025" },
  { id: 5, image: "/moment4.jpg", title: "Huzur", description: "Yanında olmak; dalgaların sakin olduğu, rüzgarın dindiği, kalbimin huzur bulduğu tek yer.", date: "22 Nisan 2025" },
  { id: 6, image: "/moment5.jpg", title: "Yeni Ufuklar", description: "Seninle her yeni başlangıç, daha güzel bir geleceğe açılan bir kapı.", date: "12 Haziran 2025" },
  { id: 7, image: "/moment6.jpg", title: "Ebediyet", description: "Sonsuzluğa verdiğim söz, senin ellerinde güvende.", date: "18 Eylül 2025" },
  { id: 8, image: "/moment8.jpg", title: "Ufuk", description: "Horizon'un ötesinde ne olursa olsun, seninle yürümek istiyorum.", date: "02 Mayıs 2026" },
];

export default function MidnightVelvetTemplate({ config, memories, pageSlug }: any) {
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