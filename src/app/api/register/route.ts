import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import pool from "@/lib/db";
import { sendVerificationCodeEmail } from "@/lib/email";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password, marketingConsent } = body as {
      name?: string;
      email?: string;
      password?: string;
      marketingConsent?: boolean;
    };

    // ── Sunucu tarafı validasyon ───────────────────────────────────────────
    if (!name || !name.trim()) {
      return NextResponse.json({ error: "İsim gerekli." }, { status: 400 });
    }
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      return NextResponse.json(
        { error: "Geçerli bir e-posta adresi gir." },
        { status: 400 }
      );
    }
    if (!password || password.length < 8) {
      return NextResponse.json(
        { error: "Şifre en az 8 karakter olmalı." },
        { status: 400 }
      );
    }

    // ── E-posta zaten kayıtlı mı? ──────────────────────────────────────────
    const existing = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [email.toLowerCase().trim()]
    );
    if ((existing.rowCount ?? 0) > 0) {
      return NextResponse.json(
        { error: "Bu e-posta adresi zaten kullanımda." },
        { status: 409 }
      );
    }

    // ── Şifreyi hashle ────────────────────────────────────────────────────
    const passwordHash = await bcrypt.hash(password, 12);

    // ── 6 Haneli Doğrulama Kodu Üret ──────────────────────────────────────
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    // ── Kullanıcıyı veritabanına kaydet ───────────────────────────────────
    const result = await pool.query(
      `INSERT INTO users (name, email, password_hash, marketing_consent, is_verified, verification_code)
       VALUES ($1, $2, $3, $4, FALSE, $5)
       RETURNING id, name, email, marketing_consent, created_at`,
      [name.trim(), email.toLowerCase().trim(), passwordHash, !!marketingConsent, verificationCode]
    );

    const newUser = result.rows[0];

    // ── Doğrulama E-postasını Gönder (Arka Planda) ────────────────────────
    sendVerificationCodeEmail({
      to: newUser.email,
      name: newUser.name,
      code: verificationCode,
    }).catch((mailErr) => {
      console.error("Kayıt sonrası doğrulama maili gönderilemedi:", mailErr);
    });

    return NextResponse.json(
      {
        message: "Hesap başarıyla oluşturuldu.",
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          marketingConsent: newUser.marketing_consent,
          isVerified: false,
        },
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("[/api/register] Hata:", err);
    return NextResponse.json(
      { error: "Sunucu hatası. Lütfen tekrar dene." },
      { status: 500 }
    );
  }
}
