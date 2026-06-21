import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { sendVerificationCodeEmail } from "@/lib/email";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = body as {
      email?: string;
    };

    if (!email) {
      return NextResponse.json(
        { error: "E-posta adresi gereklidir." },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();

    // Look up the user
    const res = await pool.query(
      "SELECT id, name, email, is_verified FROM users WHERE email = $1",
      [cleanEmail]
    );

    if ((res.rowCount ?? 0) === 0) {
      return NextResponse.json(
        { error: "Kullanıcı bulunamadı." },
        { status: 404 }
      );
    }

    const user = res.rows[0];

    if (user.is_verified) {
      return NextResponse.json(
        { error: "Bu hesap zaten doğrulanmış." },
        { status: 400 }
      );
    }

    // Generate new 6-digit code
    const newCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Update code in database
    await pool.query(
      "UPDATE users SET verification_code = $1 WHERE id = $2",
      [newCode, user.id]
    );

    // Send code via SMTP
    try {
      await sendVerificationCodeEmail({
        to: user.email,
        name: user.name,
        code: newCode,
      });
    } catch (mailErr) {
      console.error("Doğrulama kodu tekrar gönderilemedi:", mailErr);
      return NextResponse.json(
        { error: "E-posta gönderimi başarısız oldu. Sunucuyu kontrol edin." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "Yeni doğrulama kodu e-postanıza gönderildi.",
    });
  } catch (err) {
    console.error("[POST /api/resend-verification] Hata:", err);
    return NextResponse.json(
      { error: "Sunucu hatası. Lütfen tekrar dene." },
      { status: 500 }
    );
  }
}
