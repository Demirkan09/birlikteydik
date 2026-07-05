import { NextResponse } from "next/server";
import pool from "@/lib/db";

async function verifyAdmin(adminEmail: string) {
  const res = await pool.query(
    "SELECT id, role FROM users WHERE email = $1 AND role = 'admin'",
    [adminEmail.toLowerCase().trim()]
  );
  return (res.rowCount ?? 0) > 0;
}

export async function POST(request: Request) {
  try {
    const { adminEmail, sourceSlug, targetSlugs } = await request.json();

    if (!adminEmail || !sourceSlug || !targetSlugs || !Array.isArray(targetSlugs)) {
      return NextResponse.json({ error: "Eksik parametre." }, { status: 400 });
    }

    const isAdmin = await verifyAdmin(adminEmail);
    if (!isAdmin) {
      return NextResponse.json({ error: "Yetkisiz işlem." }, { status: 403 });
    }

    // 1. Get source memories
    const sourceRes = await pool.query(
      "SELECT memories FROM page_settings WHERE page_slug = $1",
      [sourceSlug]
    );

    if ((sourceRes.rowCount ?? 0) === 0) {
      return NextResponse.json({ error: "Kaynak sayfa bulunamadı." }, { status: 404 });
    }

    const sourceMemories = sourceRes.rows[0].memories;

    // 2. Update target pages
    for (const targetSlug of targetSlugs) {
      await pool.query(
        "UPDATE page_settings SET memories = $1 WHERE page_slug = $2",
        [JSON.stringify(sourceMemories), targetSlug]
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[POST /api/admin/integrate-memories] Hata:", err);
    return NextResponse.json({ error: "Sunucu hatası." }, { status: 500 });
  }
}
