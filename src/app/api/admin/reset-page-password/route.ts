import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import pool from "@/lib/db";

// ─── Helper: verify caller is admin ─────────────────────────────────────────
async function verifyAdmin(adminEmail: string) {
  const res = await pool.query(
    "SELECT id, name, email, role FROM users WHERE email = $1",
    [adminEmail.toLowerCase().trim()]
  );
  if ((res.rowCount ?? 0) === 0) return null;
  const user = res.rows[0];
  if (user.role !== "admin") return null;
  return user as { id: string; name: string; email: string; role: string };
}

// ─── DELETE: Remove a page's password (admin) ───────────────────────────────
export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const { adminEmail, pageSlug } = body as {
      adminEmail?: string;
      pageSlug?: string;
    };

    if (!adminEmail || !pageSlug) {
      return NextResponse.json(
        { error: "adminEmail ve pageSlug alanları zorunludur." },
        { status: 400 }
      );
    }

    const admin = await verifyAdmin(adminEmail);
    if (!admin) {
      return NextResponse.json(
        { error: "Bu işlem için yetkiniz yok." },
        { status: 403 }
      );
    }

    const updateRes = await pool.query(
      "UPDATE user_pages SET page_password_hash = NULL WHERE page_slug = $1",
      [pageSlug]
    );

    if ((updateRes.rowCount ?? 0) === 0) {
      return NextResponse.json(
        { error: "Sayfa bulunamadı." },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Sayfa şifresi sıfırlandı." });
  } catch (err) {
    console.error("[DELETE /api/admin/reset-page-password] Hata:", err);
    return NextResponse.json({ error: "Sunucu hatası." }, { status: 500 });
  }
}

// ─── POST: Set a new page password (admin) ──────────────────────────────────
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { adminEmail, pageSlug, newPassword } = body as {
      adminEmail?: string;
      pageSlug?: string;
      newPassword?: string;
    };

    if (!adminEmail || !pageSlug || !newPassword) {
      return NextResponse.json(
        { error: "adminEmail, pageSlug ve newPassword alanları zorunludur." },
        { status: 400 }
      );
    }

    if (newPassword.length < 4) {
      return NextResponse.json(
        { error: "Sayfa şifresi en az 4 karakter olmalıdır." },
        { status: 400 }
      );
    }

    const admin = await verifyAdmin(adminEmail);
    if (!admin) {
      return NextResponse.json(
        { error: "Bu işlem için yetkiniz yok." },
        { status: 403 }
      );
    }

    const hash = await bcrypt.hash(newPassword, 10);

    const updateRes = await pool.query(
      "UPDATE user_pages SET page_password_hash = $1 WHERE page_slug = $2",
      [hash, pageSlug]
    );

    if ((updateRes.rowCount ?? 0) === 0) {
      return NextResponse.json(
        { error: "Sayfa bulunamadı." },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Sayfa şifresi güncellendi." });
  } catch (err) {
    console.error("[POST /api/admin/reset-page-password] Hata:", err);
    return NextResponse.json({ error: "Sunucu hatası." }, { status: 500 });
  }
}
