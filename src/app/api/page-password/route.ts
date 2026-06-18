import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import pool from "@/lib/db";

// ─── GET: Check if a page has a password ────────────────────────────────────
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get("slug");

    if (!slug) {
      return NextResponse.json(
        { error: "Sayfa adresi (slug) parametresi gerekli." },
        { status: 400 }
      );
    }

    const res = await pool.query(
      "SELECT page_password_hash FROM user_pages WHERE page_slug = $1",
      [slug]
    );

    if ((res.rowCount ?? 0) === 0) {
      return NextResponse.json({ error: "Sayfa bulunamadı." }, { status: 404 });
    }

    const protected_ = Boolean(res.rows[0].page_password_hash);
    return NextResponse.json({ protected: protected_ });
  } catch (err) {
    console.error("[GET /api/page-password] Hata:", err);
    return NextResponse.json({ error: "Sunucu hatası." }, { status: 500 });
  }
}

// ─── POST: Set / change page password (by owner) ────────────────────────────
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, pageSlug, newPassword } = body as {
      userId?: string;
      pageSlug?: string;
      newPassword?: string;
    };

    if (!userId || !pageSlug || !newPassword) {
      return NextResponse.json(
        { error: "userId, pageSlug ve newPassword alanları zorunludur." },
        { status: 400 }
      );
    }

    if (newPassword.length < 4) {
      return NextResponse.json(
        { error: "Sayfa şifresi en az 4 karakter olmalıdır." },
        { status: 400 }
      );
    }

    // Verify ownership
    const pageRes = await pool.query(
      "SELECT id FROM user_pages WHERE user_id = $1 AND page_slug = $2",
      [userId, pageSlug]
    );

    if ((pageRes.rowCount ?? 0) === 0) {
      return NextResponse.json(
        { error: "Sayfa bulunamadı veya bu sayfanın sahibi değilsiniz." },
        { status: 403 }
      );
    }

    const page = pageRes.rows[0];
    const hash = await bcrypt.hash(newPassword, 10);

    await pool.query(
      "UPDATE user_pages SET page_password_hash = $1 WHERE id = $2",
      [hash, page.id]
    );

    return NextResponse.json({
      message: "Sayfa şifresi başarıyla ayarlandı.",
    });
  } catch (err) {
    console.error("[POST /api/page-password] Hata:", err);
    return NextResponse.json({ error: "Sunucu hatası." }, { status: 500 });
  }
}

// ─── PUT: Verify page password (by visitor) ─────────────────────────────────
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { pageSlug, password } = body as {
      pageSlug?: string;
      password?: string;
    };

    if (!pageSlug || !password) {
      return NextResponse.json(
        { error: "pageSlug ve password alanları zorunludur." },
        { status: 400 }
      );
    }

    const res = await pool.query(
      "SELECT page_password_hash FROM user_pages WHERE page_slug = $1",
      [pageSlug]
    );

    if ((res.rowCount ?? 0) === 0) {
      return NextResponse.json({ error: "Sayfa bulunamadı." }, { status: 404 });
    }

    const { page_password_hash } = res.rows[0];

    // No password set — anyone can access
    if (!page_password_hash) {
      return NextResponse.json({ verified: true });
    }

    const verified = await bcrypt.compare(password, page_password_hash);
    return NextResponse.json({ verified });
  } catch (err) {
    console.error("[PUT /api/page-password] Hata:", err);
    return NextResponse.json({ error: "Sunucu hatası." }, { status: 500 });
  }
}

// ─── DELETE: Remove page password (by owner) ────────────────────────────────
export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const { userId, pageSlug } = body as {
      userId?: string;
      pageSlug?: string;
    };

    if (!userId || !pageSlug) {
      return NextResponse.json(
        { error: "userId ve pageSlug alanları zorunludur." },
        { status: 400 }
      );
    }

    // Verify ownership
    const pageRes = await pool.query(
      "SELECT id FROM user_pages WHERE user_id = $1 AND page_slug = $2",
      [userId, pageSlug]
    );

    if ((pageRes.rowCount ?? 0) === 0) {
      return NextResponse.json(
        { error: "Sayfa bulunamadı veya bu sayfanın sahibi değilsiniz." },
        { status: 403 }
      );
    }

    await pool.query(
      "UPDATE user_pages SET page_password_hash = NULL WHERE id = $1",
      [pageRes.rows[0].id]
    );

    return NextResponse.json({ message: "Sayfa şifresi kaldırıldı." });
  } catch (err) {
    console.error("[DELETE /api/page-password] Hata:", err);
    return NextResponse.json({ error: "Sunucu hatası." }, { status: 500 });
  }
}
