import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { generateActivationCode } from "@/lib/tokens";

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

// ─── POST: Generate activation code ─────────────────────────────────────────
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { adminEmail, pageSlug, packageName } = body as {
      adminEmail?: string;
      pageSlug?: string;
      packageName?: string;
    };

    if (!adminEmail || !pageSlug || !packageName) {
      return NextResponse.json(
        { error: "adminEmail, pageSlug ve packageName alanları zorunludur." },
        { status: 400 }
      );
    }

    const admin = await verifyAdminOrStaff(adminEmail);
    if (!admin) {
      return NextResponse.json(
        { error: "Bu işlem için yetkiniz yok." },
        { status: 403 }
      );
    }

    // Check if page_slug is already activated in user_pages
    const activeCheck = await pool.query(
      "SELECT id FROM user_pages WHERE page_slug = $1",
      [pageSlug]
    );
    if ((activeCheck.rowCount ?? 0) > 0) {
      return NextResponse.json(
        { error: "Bu sayfa adresi zaten aktive edilmiş." },
        { status: 409 }
      );
    }

    // Check if there's already a pending (unused) activation code for this slug
    const pendingCheck = await pool.query(
      "SELECT id FROM activation_codes WHERE page_slug = $1 AND used_at IS NULL",
      [pageSlug]
    );
    if ((pendingCheck.rowCount ?? 0) > 0) {
      return NextResponse.json(
        { error: "Bu sayfa adresi için bekleyen bir aktivasyon kodu zaten mevcut." },
        { status: 409 }
      );
    }

    const code = generateActivationCode();

    // Normalize packageName (e.g., "Temel Paket" -> "temel", "Standart Paket" -> "premium", "Premium Paket" -> "premium+")
    const lowerPkg = packageName.toLowerCase().trim();
    let dbPackageName = "premium";
    if (lowerPkg.includes("temel")) dbPackageName = "temel";
    else if (lowerPkg.includes("standart")) dbPackageName = "premium";
    else if (lowerPkg.includes("premium+")) dbPackageName = "premium+";
    else if (lowerPkg.includes("premium")) {
      dbPackageName = lowerPkg.includes("paket") ? "premium+" : "premium";
    } else {
      dbPackageName = packageName;
    }

    await pool.query(
      `INSERT INTO activation_codes (code, page_slug, package_name, created_by)
       VALUES ($1, $2, $3, $4)`,
      [code, pageSlug, dbPackageName, admin.id]
    );

    return NextResponse.json({
      code,
      pageSlug,
      packageName: dbPackageName,
      message: "Aktivasyon kodu oluşturuldu.",
    });
  } catch (err) {
    console.error("[POST /api/admin/generate-code] Hata:", err);
    return NextResponse.json({ error: "Sunucu hatası." }, { status: 500 });
  }
}