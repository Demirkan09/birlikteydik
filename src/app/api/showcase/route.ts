import { NextResponse } from "next/server";
import pool from "@/lib/db";

const TEMPLATE_NAMES: Record<string, string> = {
  "klasik-retro": "Koyu Gül Kurusu",
  "romantik-kirmizi": "Romantik Kırmızı",
  "modern-minimal": "Modern Minimal",
  "sinematik-ask": "Sinematik Aşk",
  "premium-emerald": "Zümrüt Yeşili",
  "sablon-oyun": "Oyuncu Şablonu",
  "sablon-lavanta": "Lavanta Rüyası",
  "sablon-amber": "Günbatımı Amberi",
  "sablon-rose": "Gül Kurusu",
  "sablon-indigo": "Gece Yarısı İndigo",
  "sablon-siyah": "Karanlık Gece (Siyah)"
};

const TEMPLATE_NAMES_EN: Record<string, string> = {
  "klasik-retro": "Dark Rose Wood",
  "romantik-kirmizi": "Romantic Red",
  "modern-minimal": "Modern Minimal",
  "sinematik-ask": "Cinematic Love",
  "premium-emerald": "Emerald Green",
  "sablon-oyun": "Gamer Template",
  "sablon-lavanta": "Lavender Dream",
  "sablon-amber": "Sunset Amber",
  "sablon-rose": "Rose Gold",
  "sablon-indigo": "Midnight Indigo",
  "sablon-siyah": "Noble Black"
};

const TEMPLATE_DESCRIPTIONS_EN: Record<string, string> = {
  "romantik-kirmizi": "The warmest shade of love, hidden in every beat of my heart... A passionate story combining love's red with sensual deep shadows, adorned with romantic light bursts and hearts.",
  "modern-minimal": "Far from the noise, in our purest form. Just you and me. A minimalist love story designed with modern fonts, spacious gaps, and smooth transitions for those who favor simplicity.",
  "sablon-siyah": "A silent and deep devotion hidden in the most perfect black of darkness... Matte night black, shadows floating in dim light, a mysterious and highly romantic memory.",
  "premium-emerald": "Your love story glowing like the most precious gold amidst dark foliage... A premium and prestigious template prepared with deep forest green background, noble gold decorations, and smooth transitions.",
  "sablon-indigo": "Like two stars shining with you under the infinite night sky... Indigo tones glowing on a deep night blue background, mystical vertical flow, and a design pushing the boundaries of modern aesthetics.",
  "klasik-retro": "Our love's deepest traces in the most elegant shade of darkness... A deep and highly romantic story prepared with dark rose color, slowly drifting rose petals, and dark luxury Polaroid frames.",
  "sinematik-ask": "A documentary of love, with only us in the lead roles... A video/photo curtain at the entrance, an emotional piano melody playing in the background, and your fascinating memories flowing like movie credits.",
  "sablon-oyun": "To the best adventures with you! Retro game console music control, neon green lines, Space Grotesk font, and pixel art details make up the digital adventure of gamer couples.",
  "sablon-lavanta": "Amidst lavender-scented winds, every second spent with you is worth a lifetime... A fascinating love album designed with dreamy purple radial background glows, elegant hearts, and smooth soft transitions.",
  "sablon-amber": "Where the sun sets warmest, I am illuminated by that warm light in your eyes... Radial glows in warm amber tones, gold-inspired frames, and a vertical album design that best reflects your cozy memories.",
  "sablon-rose": "You are my most elegant love poem written on the pink petals of roses... The unique elegance of rose gold color tones, dim background lighting, and smooth card design that highlights your photos."
};

const TEMPLATE_FEATURES_EN: Record<string, string[]> = {
  "romantik-kirmizi": ["Sparkling Heart Particles", "Warm Red Transition Effects", "Emotional & Romantic Interface", "Aura of Love Dim Backlights"],
  "modern-minimal": ["Modern & Clean UI Design", "Spacious Minimalist Music Player", "Elegant & Clear Typography Layout", "Simple & Fluid Page Transitions"],
  "sablon-siyah": ["Dark Luxury Polaroid Frames", "Drifting Live Rose Petals", "Premium Dark Velvet Vinyl Player", "Elegant Handwriting & Serif Typography"],
  "premium-emerald": ["Deep Forest Green & Gold Theme", "Luxury Emerald Effect Transitions", "Gold Shimmering Background Effects", "Noble & Stylish Visual Frames"],
  "sablon-indigo": ["Night Blue Heart Particles", "Starry Sky Shimmer", "Midnight Minimalist Design Language", "Smooth Vertical Flow Effects"],
  "klasik-retro": ["Dark Luxury Polaroid Frames", "Drifting Live Rose Petals", "Premium Dark Velvet Vinyl Player", "Elegant Handwriting & Serif Typography"],
  "sinematik-ask": ["Enchanting Intro Curtain & Welcome Screen", "Movie Credits Themed Flow Design", "Special Video & Cinematic Music Support", "Dim & Emotional Light Effects"],
  "sablon-oyun": ["Retro Game Console Music Player", "Neon Lime & Pixel-Art Details", "Fun Retro Arcade Animations", "Gamer Couples Special Fun Vibe"],
  "sablon-lavanta": ["Soft Lavender Particles", "Elegant Music Player", "Dreamy Modern Typography", "Dreamy Purple Radial Glows"],
  "sablon-amber": ["Floating Warm Amber Fireflies", "Advanced Aesthetic Music Player", "Vertical Romantic Album Flow", "Warm Amber Radial Glows"],
  "sablon-rose": ["Rose Gold Sparkles", "Elegant Rose Theme Color", "Cormorant Garamond Title Elegance", "Aesthetic & Soft Photo Cards"]
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const lang = searchParams.get("lang") || "tr";
    const isEn = lang === "en";

    const res = await pool.query(
      `SELECT ps.page_slug, ps.template_id, ps.config, ps.memories, ps.is_published, ct.name as custom_template_name
       FROM page_settings ps
       LEFT JOIN custom_templates ct ON ps.template_id = 'custom-' || ct.id::text
       WHERE ps.is_showcase = true`
    );

    const orderRes = await pool.query("SELECT value FROM site_settings WHERE key = 'showcase_order'");
    const showcaseOrder: string[] = (orderRes.rowCount && orderRes.rowCount > 0) ? orderRes.rows[0].value : [];

    const showcasePages = res.rows.map((row) => {
      const config = row.config || {};
      const tplId = row.template_id;
      
      // Showcase Title Fallback:
      const coupleNames = config.coupleNames ? config.coupleNames.replace(/\n&\n/g, " & ").replace(/\\n&\\n/g, " & ") : "";
      const defaultTitle = (isEn ? TEMPLATE_NAMES_EN[tplId] : TEMPLATE_NAMES[tplId]) || row.custom_template_name || coupleNames || row.page_slug;
      const title = (isEn ? config.showcaseTitleEn : config.showcaseTitle) || config.showcaseTitle || defaultTitle;

      // Showcase Subtitle Fallback:
      const defaultSubtitle = isEn ? "Custom Design" : "Özel Tasarım";
      const subtitle = (isEn ? config.showcaseSubtitleEn : config.showcaseSubtitle) || config.showcaseSubtitle || config.specialDate || defaultSubtitle;

      // Showcase Accent Color Fallback:
      const accentColor = config.showcaseAccentColor || config.accentColor || "#C9A84C";

      // Showcase Description Fallback:
      const defaultDesc = isEn ? "This page is a custom template prepared by the administrator." : "Bu sayfa admin tarafından hazırlanan özel bir şablondur.";
      const description = (isEn ? (config.showcaseDescriptionEn || TEMPLATE_DESCRIPTIONS_EN[tplId]) : config.showcaseDescription) || config.showcaseDescription || defaultDesc;

      // Showcase Tag:
      const tagVal = isEn ? (config.showcaseTagEn || config.showcaseTag) : config.showcaseTag;
      const tag = tagVal !== undefined ? (tagVal.trim() === "" ? null : tagVal.trim()) : (isEn ? "SHOWCASE" : "VİTRİN");

      // Showcase Features Fallback:
      let features = isEn ? config.showcaseFeaturesEn : config.showcaseFeatures;
      if (!features || !Array.isArray(features) || features.length === 0) {
        features = config.showcaseFeatures; // Fallback to TR if EN not defined
      }
      if (!Array.isArray(features) || features.length === 0) {
        if (isEn && TEMPLATE_FEATURES_EN[tplId]) {
          features = TEMPLATE_FEATURES_EN[tplId];
        } else {
          features = [];
          if (config.musicUrl) {
            features.push(isEn ? "Custom Background Music" : "Özel Arka Plan Müziği");
          }
          if (config.particlesEnabled && config.particlesType !== "none") {
            if (isEn) {
              const typeStr = config.particlesType === "hearts" ? "Hearts" : config.particlesType === "stars" ? "Stars" : "Rose Petals";
              features.push(`Live Background Effect (${typeStr})`);
            } else {
              features.push(`Canlı Arka Plan Efekti (${config.particlesType === "hearts" ? "Kalpler" : config.particlesType === "stars" ? "Yıldızlar" : "Gül Yaprakları"})`);
            }
          } else {
            features.push(isEn ? "Smooth Page Transition Effects" : "Akıcı Sayfa Geçiş Efektleri");
          }
          features.push(isEn ? "Fully Mobile Responsive Design" : "Tam Mobil Uyumlu Tasarım");
          features.push(isEn ? "Photo & Memory Album" : "Fotoğraf ve Anı Albümü");
        }
      }

      return {
        id: row.page_slug,
        title,
        subtitle,
        accentColor,
        tag,
        description,
        demoUrl: `/${row.page_slug}`,
        features,
        isDbPage: true
      };
    });

    // Sort showcasePages according to showcaseOrder array
    showcasePages.sort((a, b) => {
      const idxA = showcaseOrder.indexOf(a.id);
      const idxB = showcaseOrder.indexOf(b.id);
      
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;
      return a.id.localeCompare(b.id);
    });

    return NextResponse.json({ showcasePages });
  } catch (err) {
    console.error("[GET /api/showcase] Hata:", err);
    return NextResponse.json({ error: "Sunucu hatası." }, { status: 500 });
  }
}
