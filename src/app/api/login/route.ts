import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import pool from "@/lib/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body as {
      email?: string;
      password?: string;
    };

    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      return NextResponse.json(
        { error: "Geçerli bir e-posta adresi gir." },
        { status: 400 }
      );
    }
    if (!password) {
      return NextResponse.json(
        { error: "Şifre gir." },
        { status: 400 }
      );
    }

    const res = await pool.query(
      "SELECT id, name, email, password_hash, marketing_consent, role, is_verified FROM users WHERE email = $1",
      [email.toLowerCase().trim()]
    );

    if ((res.rowCount ?? 0) === 0) {
      return NextResponse.json(
        { error: "Hatalı e-posta adresi veya şifre." },
        { status: 401 }
      );
    }

    const user = res.rows[0];
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return NextResponse.json(
        { error: "Hatalı e-posta adresi veya şifre." },
        { status: 401 }
      );
    }

    return NextResponse.json({
      message: "Giriş başarılı.",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        marketingConsent: user.marketing_consent,
        role: user.role,
        isVerified: user.is_verified,
      },
    });
  } catch (err) {
    console.error("[/api/login] Hata:", err);
    return NextResponse.json(
      { error: "Sunucu hatası. Lütfen tekrar dene." },
      { status: 500 }
    );
  }
}
