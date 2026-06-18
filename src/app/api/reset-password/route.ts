import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import pool from "@/lib/db";
import { isTokenExpired } from "@/lib/tokens";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { token, newPassword, type } = body as {
      token?: string;
      newPassword?: string;
      type?: "account" | "page";
    };

    if (!token) {
      return NextResponse.json(
        { error: "Sıfırlama token'ı eksik." },
        { status: 400 }
      );
    }
    if (!newPassword || newPassword.length < 8) {
      return NextResponse.json(
        { error: "Yeni şifre en az 8 karakter olmalıdır." },
        { status: 400 }
      );
    }
    if (!type || (type !== "account" && type !== "page")) {
      return NextResponse.json(
        { error: "Geçersiz sıfırlama tipi." },
        { status: 400 }
      );
    }

    // Look up the token
    const tokenRes = await pool.query(
      `SELECT id, user_id, expires_at, used_at, reset_type, page_slug
       FROM password_reset_tokens
       WHERE token = $1 AND used_at IS NULL`,
      [token]
    );

    if ((tokenRes.rowCount ?? 0) === 0) {
      return NextResponse.json(
        { error: "Geçersiz veya daha önce kullanılmış sıfırlama bağlantısı." },
        { status: 400 }
      );
    }

    const tokenRow = tokenRes.rows[0];

    if (isTokenExpired(tokenRow.expires_at)) {
      return NextResponse.json(
        { error: "Sıfırlama bağlantısının süresi dolmuş. Lütfen yeniden talep et." },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    if (type === "account") {
      // Update users.password_hash
      const updateRes = await pool.query(
        "UPDATE users SET password_hash = $1 WHERE id = $2",
        [hashedPassword, tokenRow.user_id]
      );

      if ((updateRes.rowCount ?? 0) === 0) {
        return NextResponse.json(
          { error: "Kullanıcı bulunamadı." },
          { status: 404 }
        );
      }
    } else {
      // type === 'page'
      if (!tokenRow.page_slug) {
        return NextResponse.json(
          { error: "Bu token sayfa şifresi sıfırlaması için geçerli değil." },
          { status: 400 }
        );
      }

      const updateRes = await pool.query(
        "UPDATE user_pages SET page_password_hash = $1 WHERE user_id = $2 AND page_slug = $3",
        [hashedPassword, tokenRow.user_id, tokenRow.page_slug]
      );

      if ((updateRes.rowCount ?? 0) === 0) {
        return NextResponse.json(
          { error: "Sayfa bulunamadı." },
          { status: 404 }
        );
      }
    }

    // Mark token as used
    await pool.query(
      "UPDATE password_reset_tokens SET used_at = NOW() WHERE id = $1",
      [tokenRow.id]
    );

    return NextResponse.json({
      message: "Şifreniz başarıyla güncellendi.",
    });
  } catch (err) {
    console.error("[POST /api/reset-password] Hata:", err);
    return NextResponse.json(
      { error: "Sunucu hatası. Lütfen tekrar dene." },
      { status: 500 }
    );
  }
}
