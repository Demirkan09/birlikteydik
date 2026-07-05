import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET(request: Request) {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS site_settings (
        key VARCHAR(255) PRIMARY KEY,
        value JSONB NOT NULL
      );
    `);
    
    await pool.query(`
      ALTER TABLE page_settings 
      ADD COLUMN IF NOT EXISTS is_showcase BOOLEAN DEFAULT false;
    `);
    
    
    // Insert default values if not exists
    const res = await pool.query("SELECT key FROM site_settings WHERE key = 'package_durations'");
    if (res.rowCount === 0) {
      await pool.query(`
        INSERT INTO site_settings (key, value)
        VALUES ('package_durations', '{"temel": {"old": null, "new": 6}, "premium": {"old": null, "new": 18}, "premium+": {"old": null, "new": 24}}'::jsonb)
      `);
    }

    const showcaseCheck = await pool.query("SELECT page_slug FROM page_settings WHERE is_showcase = true LIMIT 1");
    if ((showcaseCheck.rowCount ?? 0) === 0) {
      const defaultShowcases = [
        { slug: "sablon-retro", tpl: "klasik-retro" },
        { slug: "sablon-minimal", tpl: "modern-minimal" },
        { slug: "sablon-sinematik", tpl: "sinematik-ask" },
        { slug: "sablon-emerald", tpl: "premium-emerald" },
        { slug: "sablon-kirmizi", tpl: "romantik-kirmizi" },
        { slug: "sablon-oyun", tpl: "sablon-oyun" },
        { slug: "sablon-lavanta", tpl: "sablon-lavanta" },
        { slug: "sablon-amber", tpl: "sablon-amber" },
        { slug: "sablon-rose", tpl: "sablon-rose" },
        { slug: "sablon-indigo", tpl: "sablon-indigo" },
        { slug: "sablon-siyah", tpl: "sablon-siyah" }
      ];

      for (const item of defaultShowcases) {
        const check = await pool.query("SELECT id FROM page_settings WHERE page_slug = $1", [item.slug]);
        if ((check.rowCount ?? 0) === 0) {
          await pool.query(
            `INSERT INTO page_settings (page_slug, template_id, config, memories, is_published, is_showcase) 
             VALUES ($1, $2, '{}'::jsonb, '[]'::jsonb, true, true)`,
            [item.slug, item.tpl]
          );
        } else {
          await pool.query("UPDATE page_settings SET is_showcase = true, is_published = true WHERE page_slug = $1", [item.slug]);
        }
      }
    }

    return NextResponse.json({ success: true, message: "site_settings table ready." });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
