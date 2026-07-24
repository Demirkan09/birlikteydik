import { NextResponse } from "next/server";
import pool from "@/lib/db";

// ─── Helper: verify caller is admin or staff ─────────────────────────────────────────
async function verifyAdminOrStaff(adminEmail: string) {
  const res = await pool.query(
    "SELECT id, name, email, role FROM users WHERE email = $1",
    [adminEmail.toLowerCase().trim()]
  );
  if ((res.rowCount ?? 0) === 0) return null;
  const user = res.rows[0];
  if (user.role !== "admin" && user.role !== "staff") return null;
  return user as { id: string; name: string; email: string; role: string };
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { adminEmail, userId, pageSlug, packageName } = body;

    if (!adminEmail || !userId || !pageSlug) {
      return NextResponse.json(
        { error: "Eksik parametre." },
        { status: 400 }
      );
    }

    const admin = await verifyAdminOrStaff(adminEmail);
    if (!admin) {
      return NextResponse.json({ error: "Yetkisiz işlem." }, { status: 403 });
    }

    const cleanSlug = pageSlug.trim().toLowerCase();

    // Check if the page exists in page_settings
    const settingsRes = await pool.query(
      "SELECT id FROM page_settings WHERE page_slug = $1",
      [cleanSlug]
    );
    if ((settingsRes.rowCount ?? 0) === 0) {
      return NextResponse.json(
        { error: "Böyle bir sayfa (page_settings) bulunamadı." },
        { status: 404 }
      );
    }

    // Check if it is already assigned to someone
    const existRes = await pool.query(
      "SELECT id, user_id FROM user_pages WHERE page_slug = $1",
      [cleanSlug]
    );
    if ((existRes.rowCount ?? 0) > 0) {
      const existing = existRes.rows[0];
      if (existing.user_id) {
        return NextResponse.json(
          { error: "Bu sayfa zaten bir kullanıcıya tanımlanmış." },
          { status: 400 }
        );
      }
      // If user_id IS NULL (manually started duration), link to this user
      await pool.query(
        "UPDATE user_pages SET user_id = $1 WHERE id = $2",
        [userId, existing.id]
      );
      return NextResponse.json({ success: true });
    }

    // Insert into user_pages
    await pool.query(
      `INSERT INTO user_pages (user_id, page_slug, package_name)
       VALUES ($1, $2, $3)`,
      [userId, cleanSlug, packageName || "premium"]
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[POST /api/admin/users/assign-page] Hata:", err);
    return NextResponse.json({ error: "Sunucu hatası." }, { status: 500 });
  }
}
