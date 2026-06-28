# Design

## Theme

Dark · Cinematic · Romantic

Koyu arka plan üzerinde altın ve pembe aksanlarla sıcaklık yaratan, sinematik bir estetik. Serif tipografi güçlü bir duygusal başlık sesine sahipken, Inter sans-serif okunabilirlik için kullanılıyor. Framer Motion animasyonları her şeyin yavaş ve bilinçli hissettirmesini sağlıyor.

## Colors

```
--bg-base:        #0B0F1A   /* Ana sayfa arkaplanı — derin lacivert-siyah */
--bg-surface:     #160408   /* Kart / şablon yüzeyleri */
--ink-primary:    #F0EDE8   /* Ana metin — sıcak kırık beyaz */
--ink-muted:      rgba(240,237,232,0.45)  /* Yardımcı metin */
--accent-gold:    #C9A84C   /* Birincil aksan — antik altın */
--accent-rose:    #E8A0A0   /* İkincil aksan — yumuşak gül */
--accent-green:   #25D366   /* WhatsApp CTA */
--selection-bg:   rgba(201,168,76,0.28)
```

Renk stratejisi: **Drenched** — arka plan rengin kendisi. Sıcaklık body bg'den değil, aksan renkten ve tipografiden geliyor. Cream/sand yok.

## Typography

```
--font-display:   'Cormorant Garamond', serif   /* Başlıklar, logo, duygusal vurgu */
--font-body:      'Inter', sans-serif            /* Body, UI öğeleri, form, navigasyon */
--font-lato:      'Lato', sans-serif             /* Şablon alt başlıkları */
```

Ölçek:
- Hero H1: `clamp(3rem, 8vw, 6.5rem)` · weight 600 · letter-spacing -0.02em
- Bölüm başlıkları: `clamp(2.2rem, 5vw, 3.5rem)` · weight 400 · Cormorant
- Etiket / eyebrow: 9-11px · letter-spacing 0.28-0.48em · uppercase · Inter
- Body: 0.875–1.05rem · weight 300-400 · line-height 1.8 · Inter
- CTA buton: 11-13px · letter-spacing 0.08-0.1em · weight 500-600

## Spacing

Ritim: 8px taban, büyük bölümler arası 80-120px padding. İçerik max-width: 1100px. Mobil konteyner maks genişlik: 480px (şablonlar için). Büyük boşluklar sinematik dinginlik hissi yaratıyor.

## Components

### Navbar
Fixed, transparan başlar → scroll'da `rgba(11,15,26,0.95)` + `backdrop-filter: blur(20px)`. Logo Cormorant Garamond, menü linkleri 11px uppercase Inter. Sağda WhatsApp CTA (yeşil), sosyal ikonlar, auth butonlar.

### Section Wrapper
`<Section>` bileşeni: `padding: clamp(80px, 10vw, 140px) 24px`. Alt bölümler için ayırıcı borderTop + Section label (küçük uppercase Cormorant) + büyük SectionHeading (Cormorant italic + gold em).

### Cards (Fiyatlandırma)
`border: 1px solid rgba(255,255,255,0.08)`, `background: rgba(255,255,255,0.03)`, `border-radius: 16px`. Highlighted kart: gold border + subtle gold glow. Kartlarda **sipariş butonu yok** (WhatsApp CTA tercih ediliyor).

### FAQ Accordion
`border-bottom: 1px solid rgba(255,255,255,0.07)` ayırıcı, AnimatePresence ile smooth open/close. Soru Cormorant, cevap Inter.

### Floating Hearts Canvas
`<canvas>` fixed arka plan katmanı, `zIndex: -1`, pointerEvents none. Kırmızı şablonda kırmızı kalpler, landing page'de altın/gül tonlarda.

### Template Cards
480px maks genişlik, mobil odaklı dikey scroll deneyimi. Fotoğraf parallax efekti. Framer Motion fadeUp + stagger animasyonları.

## Motion

- Tüm animasyonlar `Framer Motion` ile yönetiliyor
- Giriş: `opacity: 0 → 1`, `y: 28 → 0`, `filter: blur(6px) → blur(0)`
- Easing: `[0.16, 1, 0.3, 1]` (ease-out-expo)
- Stagger: bölüm içi öğeler 0.2s aralıkla
- Scroll bazlı: `useScroll` + `useTransform` ile parallax
- `@media (prefers-reduced-motion: reduce)`: animasyonlar devre dışı bırakılmalı (mevcut projede eksik — bakım noktası)
- Hero başlık: delay 0.5s, duration 1.1s
- Body copy: delay 0.9s, duration 1.0s

## Layout Patterns

- **Landing page**: tek sütun dikey scroll, bölümler arası büyük whitespace
- **Şablon sayfaları**: merkezi 480px konteyner, mobil-birinci tasarım
- **Admin panel**: sol sidebar + ana içerik alanı, dark theme
- **Fiyatlandırma**: 3 sütun kart grid (`repeat(auto-fit, minmax(260px, 1fr))`)
- **SSS**: tek sütun accordion listesi, max-width 680px
- Responsive: 900px breakpoint'inde desktop ↔ mobile navbar geçişi
