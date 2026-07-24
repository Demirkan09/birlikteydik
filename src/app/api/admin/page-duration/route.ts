import { NextResponse } from "next/server";
import pool from "@/lib/db";

// Helper: verify caller is admin or staff
async function verifyAdminOrStaff(adminEmail: string) {
  const res = await pool.query(
    "SELECT id, role FROM users WHERE email = $1 AND role IN ('admin', 'staff')",
    [adminEmail.toLowerCase().trim()]
  );
  return (res.rowCount ?? 0) > 0;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { adminEmail, action, pageSlug, packageName, daysDelta } = body as {
      adminEmail?: string;
      action?: "start" | "update_package" | "adjust_days" | "reset";
      pageSlug?: string;
      packageName?: string;
      daysDelta?: number;
    };

    if (!adminEmail || !pageSlug || !action) {
      return NextResponse.json({ error: "Eksik parametre." }, { status: 400 });
    }

    const isAdminOrStaff = await verifyAdminOrStaff(adminEmail);
    if (!isAdminOrStaff) {
      return NextResponse.json({ error: "Yetkisiz işlem." }, { status: 403 });
    }

    const cleanSlug = pageSlug.trim().toLowerCase();

    // Check if page_settings exists
    const settingsCheck = await pool.query(
      "SELECT id FROM page_settings WHERE page_slug = $1",
      [cleanSlug]
    );
    if ((settingsCheck.rowCount ?? 0) === 0) {
      return NextResponse.json({ error: "Sayfa bulunamadı." }, { status: 404 });
    }

    // Ensure user_id column in user_pages is nullable if constrained
    try {
      await pool.query("ALTER TABLE user_pages ALTER COLUMN user_id DROP NOT NULL;");
    } catch {
      /* ignore if already nullable */
    }

    // Check existing user_pages row
    const userPageRes = await pool.query(
      "SELECT id, created_at, package_name FROM user_pages WHERE page_slug = $1",
      [cleanSlug]
    );

    if (action === "start") {
      const selectedPackage = packageName || "Standart Paket";
      if ((userPageRes.rowCount ?? 0) > 0) {
        await pool.query(
          "UPDATE user_pages SET package_name = $1, created_at = NOW() WHERE page_slug = $2",
          [selectedPackage, cleanSlug]
        );
      } else {
        await pool.query(
          "INSERT INTO user_pages (user_id, page_slug, package_name, created_at) VALUES (NULL, $1, $2, NOW())",
          [cleanSlug, selectedPackage]
        );
      }
      return NextResponse.json({ success: true, message: "Sayfa süresi başlatıldı." });
    }

    if (action === "update_package") {
      const selectedPackage = packageName || "Standart Paket";
      if ((userPageRes.rowCount ?? 0) === 0) {
        await pool.query(
          "INSERT INTO user_pages (user_id, page_slug, package_name, created_at) VALUES (NULL, $1, $2, NOW())",
          [cleanSlug, selectedPackage]
        );
      } else {
        await pool.query(
          "UPDATE user_pages SET package_name = $1 WHERE page_slug = $2",
          [selectedPackage, cleanSlug]
        );
      }
      return NextResponse.json({ success: true, message: "Paket güncellendi." });
    }

    if (action === "adjust_days") {
      const delta = Number(daysDelta);
      if (isNaN(delta) || delta === 0) {
        return NextResponse.json({ error: "Geçersiz gün miktarı." }, { status: 400 });
      }

      if ((userPageRes.rowCount ?? 0) === 0) {
        await pool.query(
          "INSERT INTO user_pages (user_id, page_slug, package_name, created_at) VALUES (NULL, $1, $2, NOW() + ($3 || ' days')::interval)",
          [cleanSlug, packageName || "Standart Paket", delta]
        );
      } else {
        await pool.query(
          "UPDATE user_pages SET created_at = created_at + ($1 || ' days')::interval WHERE page_slug = $2",
          [delta, cleanSlug]
        );
      }
      return NextResponse.json({
        success: true,
        message: delta > 0 ? `${delta} gün süre eklendi.` : `${Math.abs(delta)} gün süre kısaltıldı.`,
      });
    }

    if (action === "reset") {
      const selectedPackage = packageName || userPageRes.rows[0]?.package_name || "Standart Paket";
      if ((userPageRes.rowCount ?? 0) === 0) {
        await pool.query(
          "INSERT INTO user_pages (user_id, page_slug, package_name, created_at) VALUES (NULL, $1, $2, NOW())",
          [cleanSlug, selectedPackage]
        );
      } else {
        await pool.query(
          "UPDATE user_pages SET created_at = NOW(), package_name = $1 WHERE page_slug = $2",
          [selectedPackage, cleanSlug]
        );
      }
      return NextResponse.json({ success: true, message: "Süre bugünden itibaren yenilendi." });
    }

    if (action === "cancel") {
      await pool.query("DELETE FROM user_pages WHERE page_slug = $1", [cleanSlug]);
      return NextResponse.json({ success: true, message: "Sayfa süresi tamamen sıfırlandı ve pasife alındı." });
    }

    return NextResponse.json({ error: "Geçersiz işlem." }, { status: 400 });
  } catch (err: any) {
    console.error("[POST /api/admin/page-duration] Hata:", err);
    return NextResponse.json({ error: err.message || "Sunucu hatası." }, { status: 500 });
  }
}
