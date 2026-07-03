import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, templateId, config, memories, existingSlug } = body;

    if (!userId || !templateId || !config || !memories) {
      return NextResponse.json({ error: "Eksik parametreler." }, { status: 400 });
    }

    let targetSlug = existingSlug;

    if (!targetSlug) {
      // Create a unique draft slug
      const randomPart = Math.random().toString(36).substring(2, 8);
      targetSlug = `taslak-${userId}-${randomPart}`;
    }

    await pool.query("BEGIN");
    
    try {
      // Upsert into page_settings
      // Not using ON CONFLICT directly to avoid constraint issues if page_slug isn't the primary key
      // Let's check if it exists
      const checkRes = await pool.query(
        "SELECT id FROM page_settings WHERE page_slug = $1",
        [targetSlug]
      );

      if ((checkRes.rowCount ?? 0) > 0) {
        await pool.query(
          `UPDATE page_settings 
           SET template_id = $1, config = $2, memories = $3
           WHERE page_slug = $4`,
          [templateId, JSON.stringify(config), JSON.stringify(memories), targetSlug]
        );
      } else {
        await pool.query(
          `INSERT INTO page_settings (page_slug, template_id, config, memories, is_published)
           VALUES ($1, $2, $3, $4, false)`,
          [targetSlug, templateId, JSON.stringify(config), JSON.stringify(memories)]
        );
      }

      // Check if user_pages linking exists
      const userPageRes = await pool.query(
        "SELECT id FROM user_pages WHERE user_id = $1 AND page_slug = $2",
        [userId, targetSlug]
      );

      if ((userPageRes.rowCount ?? 0) === 0) {
        // Link the drafted page to the user
        await pool.query(
          `INSERT INTO user_pages (user_id, page_slug, package_name)
           VALUES ($1, $2, 'taslak')`,
          [userId, targetSlug]
        );
      }

      await pool.query("COMMIT");

      return NextResponse.json({ success: true, pageSlug: targetSlug });
    } catch (transErr) {
      await pool.query("ROLLBACK");
      throw transErr;
    }
  } catch (err) {
    console.error("[/api/customer/save-page] Hata:", err);
    return NextResponse.json({ error: "Sunucu hatası." }, { status: 500 });
  }
}
