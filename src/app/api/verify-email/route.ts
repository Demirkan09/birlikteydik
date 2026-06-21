import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, code } = body as {
      email?: string;
      code?: string;
    };

    if (!email || !code) {
      return NextResponse.json(
        { error: "E-posta adresi ve onay kodu gereklidir." },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanCode = code.trim();

    // Look up the user
    const res = await pool.query(
      "SELECT id, name, email, verification_code, role, marketing_consent FROM users WHERE email = $1",
      [cleanEmail]
    );

    if ((res.rowCount ?? 0) === 0) {
      return NextResponse.json(
        { error: "Kullanıcı bulunamadı." },
        { status: 404 }
      );
    }

    const user = res.rows[0];

    // Check if code matches
    if (!user.verification_code || user.verification_code !== cleanCode) {
      return NextResponse.json(
        { error: "Hatalı veya süresi geçmiş doğrulama kodu." },
        { status: 400 }
      );
    }

    // Set user as verified
    await pool.query(
      "UPDATE users SET is_verified = TRUE, verification_code = NULL WHERE id = $1",
      [user.id]
    );

    return NextResponse.json({
      message: "E-posta adresiniz başarıyla doğrulandı.",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        marketingConsent: user.marketing_consent,
      },
    });
  } catch (err) {
    console.error("[POST /api/verify-email] Hata:", err);
    return NextResponse.json(
      { error: "Sunucu hatası. Lütfen tekrar dene." },
      { status: 500 }
    );
  }
}
