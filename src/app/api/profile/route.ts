import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import pool from "@/lib/db";

// GET user info
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json({ error: "E-posta parametresi gerekli." }, { status: 400 });
    }

    const res = await pool.query(
      "SELECT id, name, email, marketing_consent, created_at, role FROM users WHERE email = $1",
      [email.toLowerCase().trim()]
    );

    if ((res.rowCount ?? 0) === 0) {
      return NextResponse.json({ error: "Kullanıcı bulunamadı." }, { status: 404 });
    }

    const user = res.rows[0];

    const pagesRes = await pool.query(
      "SELECT id, page_slug, package_name, created_at FROM user_pages WHERE user_id = $1 ORDER BY created_at DESC",
      [user.id]
    );

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        marketingConsent: user.marketing_consent,
        createdAt: user.created_at,
        role: user.role,
        pages: pagesRes.rows.map((row) => ({
          id: row.id,
          pageSlug: row.page_slug,
          packageName: row.package_name,
          createdAt: row.created_at,
        })),
      },
    });
  } catch (err) {
    console.error("[GET /api/profile] Hata:", err);
    return NextResponse.json({ error: "Sunucu hatası." }, { status: 500 });
  }
}

// POST: Update personal info (name, email, password)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { currentEmail, name, email, currentPassword, newPassword } = body as {
      currentEmail?: string;
      name?: string;
      email?: string;
      currentPassword?: string;
      newPassword?: string;
    };

    if (!currentEmail) {
      return NextResponse.json({ error: "Oturum e-postası bulunamadı." }, { status: 400 });
    }

    // Find the user
    const res = await pool.query(
      "SELECT id, name, email, password_hash FROM users WHERE email = $1",
      [currentEmail.toLowerCase().trim()]
    );

    if ((res.rowCount ?? 0) === 0) {
      return NextResponse.json({ error: "Kullanıcı bulunamadı." }, { status: 404 });
    }

    const user = res.rows[0];

    // If new password is provided, we must verify the current password first
    let hashedNewPassword = null;
    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json({ error: "Şifre değişikliği için mevcut şifre gereklidir." }, { status: 400 });
      }
      const match = await bcrypt.compare(currentPassword, user.password_hash);
      if (!match) {
        return NextResponse.json({ error: "Mevcut şifre hatalı." }, { status: 401 });
      }
      if (newPassword.length < 8) {
        return NextResponse.json({ error: "Yeni şifre en az 8 karakter olmalıdır." }, { status: 400 });
      }
      hashedNewPassword = await bcrypt.hash(newPassword, 12);
    }

    // If email is changing, ensure it's not taken by another user
    const newEmailClean = email?.toLowerCase().trim();
    if (newEmailClean && newEmailClean !== user.email) {
      const emailCheck = await pool.query(
        "SELECT id FROM users WHERE email = $1",
        [newEmailClean]
      );
      if ((emailCheck.rowCount ?? 0) > 0) {
        return NextResponse.json({ error: "Bu e-posta adresi başka bir üye tarafından kullanılıyor." }, { status: 409 });
      }
    }

    // Update query
    let updateQuery = "UPDATE users SET name = $1, email = $2";
    const queryParams = [
      name?.trim() || user.name,
      newEmailClean || user.email,
    ];

    if (hashedNewPassword) {
      queryParams.push(hashedNewPassword);
      updateQuery += `, password_hash = $${queryParams.length}`;
    }

    queryParams.push(user.id);
    updateQuery += ` WHERE id = $${queryParams.length} RETURNING id, name, email, marketing_consent`;

    const updateRes = await pool.query(updateQuery, queryParams);
    const updatedUser = updateRes.rows[0];

    return NextResponse.json({
      message: "Profil başarıyla güncellendi.",
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        marketingConsent: updatedUser.marketing_consent,
      },
    });
  } catch (err) {
    console.error("[POST /api/profile] Hata:", err);
    return NextResponse.json({ error: "Profil güncellenirken bir hata oluştu." }, { status: 500 });
  }
}

// PUT: Toggle marketing consent
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { email, marketingConsent } = body as {
      email?: string;
      marketingConsent?: boolean;
    };

    if (!email) {
      return NextResponse.json({ error: "E-posta gerekli." }, { status: 400 });
    }

    const res = await pool.query(
      "UPDATE users SET marketing_consent = $1 WHERE email = $2 RETURNING id, name, email, marketing_consent",
      [!!marketingConsent, email.toLowerCase().trim()]
    );

    if ((res.rowCount ?? 0) === 0) {
      return NextResponse.json({ error: "Kullanıcı bulunamadı." }, { status: 404 });
    }

    const updatedUser = res.rows[0];
    return NextResponse.json({
      message: "İletişim tercihleri güncellendi.",
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        marketingConsent: updatedUser.marketing_consent,
      },
    });
  } catch (err) {
    console.error("[PUT /api/profile] Hata:", err);
    return NextResponse.json({ error: "Tercihler güncellenirken bir hata oluştu." }, { status: 500 });
  }
}

// DELETE: Delete account securely
export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body as {
      email?: string;
      password?: string;
    };

    if (!email || !password) {
      return NextResponse.json({ error: "E-posta ve şifre gereklidir." }, { status: 400 });
    }

    const res = await pool.query(
      "SELECT id, password_hash FROM users WHERE email = $1",
      [email.toLowerCase().trim()]
    );

    if ((res.rowCount ?? 0) === 0) {
      return NextResponse.json({ error: "Kullanıcı bulunamadı." }, { status: 404 });
    }

    const user = res.rows[0];
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return NextResponse.json({ error: "Hatalı şifre. Hesap silinemedi." }, { status: 401 });
    }

    await pool.query("DELETE FROM users WHERE id = $1", [user.id]);

    return NextResponse.json({
      message: "Hesabınız kalıcı olarak silinmiştir.",
    });
  } catch (err) {
    console.error("[DELETE /api/profile] Hata:", err);
    return NextResponse.json({ error: "Hesap silinirken bir hata oluştu." }, { status: 500 });
  }
}
