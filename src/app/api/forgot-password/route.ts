import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { generateSecureToken } from "@/lib/tokens";
import { sendAccountPasswordReset, sendPagePasswordReset } from "@/lib/email";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, type, pageSlug } = body as {
      email?: string;
      type?: "account" | "page";
      pageSlug?: string;
    };

    // Validate inputs
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      return NextResponse.json(
        { error: "Geçerli bir e-posta adresi gir." },
        { status: 400 }
      );
    }
    if (!type || (type !== "account" && type !== "page")) {
      return NextResponse.json(
        { error: "Geçersiz sıfırlama tipi." },
        { status: 400 }
      );
    }
    if (type === "page" && !pageSlug) {
      return NextResponse.json(
        { error: "Sayfa şifresi sıfırlama için sayfa adresi gerekli." },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();

    // Generic success response — do NOT reveal whether the email exists
    const successResponse = NextResponse.json({
      message: "Şifre sıfırlama bağlantısı e-posta adresinize gönderildi.",
    });

    // Look up user
    const userRes = await pool.query(
      "SELECT id, name, email FROM users WHERE email = $1",
      [cleanEmail]
    );

    if ((userRes.rowCount ?? 0) === 0) {
      // Return success anyway — do not expose email existence
      return successResponse;
    }

    const user = userRes.rows[0];

    try {
      if (type === "account") {
        const token = generateSecureToken();

        await pool.query(
          `INSERT INTO password_reset_tokens
             (user_id, token, expires_at, reset_type)
           VALUES ($1, $2, NOW() + INTERVAL '1 hour', 'account')`,
          [user.id, token]
        );

        await sendAccountPasswordReset({
          to: user.email,
          name: user.name,
          token,
        });
      } else {
        // type === 'page'
        const pageRes = await pool.query(
          "SELECT id, page_slug FROM user_pages WHERE page_slug = $1 AND user_id = $2",
          [pageSlug, user.id]
        );

        if ((pageRes.rowCount ?? 0) === 0) {
          // Page not found for this user — return success silently
          return successResponse;
        }

        const page = pageRes.rows[0];
        const token = generateSecureToken();

        await pool.query(
          `INSERT INTO password_reset_tokens
             (user_id, token, expires_at, reset_type, page_slug)
           VALUES ($1, $2, NOW() + INTERVAL '1 hour', 'page_password', $3)`,
          [user.id, token, page.page_slug]
        );

        await sendPagePasswordReset({
          to: user.email,
          name: user.name,
          token,
          pageSlug: page.page_slug,
        });
      }
    } catch (mailErr) {
      console.error("[forgot-password] SMTP hatası:", mailErr);
      // E-posta gönderilemese dahi kullanıcı bilgisi sızdırmamak adına 
      // sessiz başarı (successResponse) yanıtını dönüyoruz.
    }

    return successResponse;
  } catch (err) {
    console.error("[POST /api/forgot-password] Hata:", err);
    return NextResponse.json(
      { error: "Sunucu hatası. Lütfen tekrar dene." },
      { status: 500 }
    );
  }
}
