import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, code } = body as {
      userId?: string;
      code?: string;
    };

    if (!userId || !code) {
      return NextResponse.json(
        { error: "Kullanıcı ID ve aktivasyon kodu gereklidir." },
        { status: 400 }
      );
    }

    // Look up the activation code (unused only)
    const codeRes = await pool.query(
      `SELECT id, code, page_slug, package_name, used_at
       FROM activation_codes
       WHERE code = $1 AND used_at IS NULL`,
      [code.trim().toUpperCase()]
    );

    if ((codeRes.rowCount ?? 0) === 0) {
      return NextResponse.json(
        { error: "Geçersiz veya daha önce kullanılmış aktivasyon kodu." },
        { status: 400 }
      );
    }

    const activation = codeRes.rows[0];

    // Check that the page_slug is not already taken by another user
    const slugCheck = await pool.query(
      "SELECT id, user_id FROM user_pages WHERE page_slug = $1",
      [activation.page_slug]
    );

    if ((slugCheck.rowCount ?? 0) > 0) {
      const existing = slugCheck.rows[0];
      if (existing.user_id !== userId) {
        return NextResponse.json(
          { error: "Bu sayfa adresi başka bir kullanıcı tarafından zaten kullanılıyor." },
          { status: 409 }
        );
      }
      // Same user already has this page — treat as already activated
      return NextResponse.json(
        { error: "Bu sayfa zaten aktif." },
        { status: 409 }
      );
    }

    // Insert into user_pages
    const insertRes = await pool.query(
      `INSERT INTO user_pages (user_id, page_slug, package_name)
       VALUES ($1, $2, $3)
       RETURNING id, page_slug, package_name, created_at`,
      [userId, activation.page_slug, activation.package_name]
    );

    const newPage = insertRes.rows[0];

    // Mark activation code as used
    await pool.query(
      "UPDATE activation_codes SET used_at = NOW(), used_by = $1 WHERE id = $2",
      [userId, activation.id]
    );

    return NextResponse.json({
      message: "Sayfa başarıyla aktive edildi.",
      page: {
        id: newPage.id,
        pageSlug: newPage.page_slug,
        packageName: newPage.package_name,
        createdAt: newPage.created_at,
      },
    });
  } catch (err) {
    console.error("[POST /api/activate] Hata:", err);
    return NextResponse.json(
      { error: "Sunucu hatası. Lütfen tekrar dene." },
      { status: 500 }
    );
  }
}
