import { NextResponse } from "next/server";
import pool from "@/lib/db";

// Helper: verify caller is admin
async function verifyAdmin(adminEmail: string) {
  const res = await pool.query(
    "SELECT id, role FROM users WHERE email = $1 AND role = 'admin'",
    [adminEmail.toLowerCase().trim()]
  );
  return (res.rowCount ?? 0) > 0;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const adminEmail = searchParams.get("adminEmail");

    if (!adminEmail) {
      return NextResponse.json({ error: "adminEmail gerekli." }, { status: 400 });
    }

    const isAdmin = await verifyAdmin(adminEmail);
    if (!isAdmin) {
      return NextResponse.json({ error: "Yetkisiz işlem." }, { status: 403 });
    }

    const res = await pool.query("SELECT key, value FROM site_settings");
    
    // Convert to object
    const settings = res.rows.reduce((acc, row) => {
      acc[row.key] = row.value;
      return acc;
    }, {} as Record<string, any>);

    return NextResponse.json({ settings });
  } catch (err) {
    console.error("[GET /api/admin/site-settings] Hata:", err);
    return NextResponse.json({ error: "Sunucu hatası." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { adminEmail, settings } = await request.json();

    if (!adminEmail || !settings) {
      return NextResponse.json({ error: "Eksik parametre." }, { status: 400 });
    }

    const isAdmin = await verifyAdmin(adminEmail);
    if (!isAdmin) {
      return NextResponse.json({ error: "Yetkisiz işlem." }, { status: 403 });
    }

    // Upsert each key in settings
    for (const [key, value] of Object.entries(settings)) {
      await pool.query(
        `INSERT INTO site_settings (key, value)
         VALUES ($1, $2)
         ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`,
        [key, JSON.stringify(value)]
      );
    }

    return NextResponse.json({ success: true, message: "Ayarlar kaydedildi." });
  } catch (err) {
    console.error("[POST /api/admin/site-settings] Hata:", err);
    return NextResponse.json({ error: "Sunucu hatası." }, { status: 500 });
  }
}
