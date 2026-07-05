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

export async function GET() {
  try {
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
      
      // Showcase Title Fallback:
      const coupleNames = config.coupleNames ? config.coupleNames.replace(/\n&\n/g, " & ").replace(/\\n&\\n/g, " & ") : "";
      const defaultTitle = TEMPLATE_NAMES[row.template_id] || row.custom_template_name || coupleNames || row.page_slug;
      const title = config.showcaseTitle || defaultTitle;

      // Showcase Subtitle Fallback:
      const subtitle = config.showcaseSubtitle || config.specialDate || "Özel Tasarım";

      // Showcase Accent Color Fallback:
      const accentColor = config.showcaseAccentColor || config.accentColor || "#C9A84C";

      // Showcase Description Fallback:
      const description = config.showcaseDescription || "Bu sayfa admin tarafından hazırlanan özel bir şablondur.";

      // Showcase Tag:
      // 1. If showcaseTag is explicitly defined: empty string means hide (null), otherwise use value
      // 2. If showcaseTag is undefined: default to "VİTRİN"
      const tag = config.showcaseTag !== undefined ? (config.showcaseTag.trim() === "" ? null : config.showcaseTag.trim()) : "VİTRİN";

      // Showcase Features Fallback:
      let features = config.showcaseFeatures;
      if (!Array.isArray(features) || features.length === 0) {
        features = [];
        if (config.musicUrl) features.push("Özel Arka Plan Müziği");
        if (config.particlesEnabled && config.particlesType !== "none") {
          features.push(`Canlı Arka Plan Efekti (${config.particlesType === "hearts" ? "Kalpler" : config.particlesType === "stars" ? "Yıldızlar" : "Gül Yaprakları"})`);
        } else {
          features.push("Akıcı Sayfa Geçiş Efektleri");
        }
        features.push("Tam Mobil Uyumlu Tasarım");
        features.push("Fotoğraf ve Anı Albümü");
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
