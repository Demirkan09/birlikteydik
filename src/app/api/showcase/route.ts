import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET() {
  try {
    const res = await pool.query(
      `SELECT page_slug, template_id, config, memories, is_published 
       FROM page_settings 
       WHERE is_showcase = true 
       ORDER BY page_slug ASC`
    );

    const showcasePages = res.rows.map((row) => {
      const config = row.config || {};
      const coupleNames = config.coupleNames ? config.coupleNames.replace(/\n&\n/g, " & ").replace(/\\n&\\n/g, " & ") : row.page_slug;

      const features = [];
      if (config.musicUrl) features.push("Özel Arka Plan Müziği");
      if (config.particlesEnabled && config.particlesType !== "none") {
        features.push(`Canlı Arka Plan Efekti (${config.particlesType === "hearts" ? "Kalpler" : config.particlesType === "stars" ? "Yıldızlar" : "Gül Yaprakları"})`);
      } else {
        features.push("Akıcı Sayfa Geçiş Efektleri");
      }
      features.push("Tam Mobil Uyumlu Tasarım");
      features.push("Fotoğraf ve Anı Albümü");

      return {
        id: row.page_slug,
        title: coupleNames,
        subtitle: config.specialDate || "Özel Tasarım",
        accentColor: config.accentColor || "#C9A84C",
        tag: "VİTRİN",
        description: config.tagline || "Bu sayfa admin tarafından hazırlanan özel bir şablondur.",
        demoUrl: `/${row.page_slug}`,
        features,
        isDbPage: true
      };
    });

    return NextResponse.json({ showcasePages });
  } catch (err) {
    console.error("[GET /api/showcase] Hata:", err);
    return NextResponse.json({ error: "Sunucu hatası." }, { status: 500 });
  }
}
