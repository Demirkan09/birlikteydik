"use client";

import BosTemplate from "../sablon-bos/page";

export const defaultConfig = {
  coupleNames: "Ahmet\n&\nMerve",
  tagline: "Aşkın en sıcak tonunda, kalbimin her atışında saklanan en derin hislerim...",
  accentColor: "#E63946",
  bgColor: "#160408",
  specialDate: "14 Şubat 2025",
  musicUrl: "/music/kirmizi.mp3",
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
    title: "Aşkın Rengi",
    description: "İlk kez bana sımsıcak gülümsediğinde, içimdeki tüm kışların eriyip sıcacık bir bahara dönüştüğü o eşsiz gün.",
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

export default function RomanticRedTemplate({ config, memories, pageSlug }: any) {
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
