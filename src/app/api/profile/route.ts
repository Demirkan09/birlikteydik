import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import pool from "@/lib/db";

// GET user info
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");
    const lang = searchParams.get("lang") || "tr";
    const isEn = lang === "en";

    if (!email) {
      return NextResponse.json({ error: "E-posta parametresi gerekli." }, { status: 400 });
    }

    const res = await pool.query(
      "SELECT id, name, email, marketing_consent, created_at, role, is_verified FROM users WHERE email = $1",
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

    const settingsRes = await pool.query("SELECT value FROM site_settings WHERE key = 'package_durations'");
    let packageDurations: Record<string, { old: number | null, new: number }> = {
      "temel": { old: null, new: 6 },
      "premium": { old: null, new: 18 },
      "premium+": { old: null, new: 24 }
    };
    if ((settingsRes.rowCount ?? 0) > 0) {
      packageDurations = settingsRes.rows[0].value;
    }

    function calculateRemainingTime(createdAt: string | Date, packageName: string) {
      const lowerPkg = packageName.toLowerCase().trim();
      let p = "premium";
      if (lowerPkg.includes("temel")) p = "temel";
      else if (lowerPkg.includes("standart")) p = "premium";
      else if (lowerPkg.includes("premium+")) p = "premium+";
      else if (lowerPkg.includes("premium")) {
        p = lowerPkg.includes("paket") ? "premium+" : "premium";
      } else {
        p = lowerPkg;
      }
      const durationMonths = packageDurations[p]?.new || 12;
      
      const start = new Date(createdAt);
      const end = new Date(start);
      end.setMonth(start.getMonth() + durationMonths);
      
      const now = new Date();
      const diffTime = end.getTime() - now.getTime();
      
      if (diffTime <= 0) {
        return { text: isEn ? "Expired" : "Süresi Doldu", expired: true };
      }
      
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      const months = Math.floor(diffDays / 30);
      const days = diffDays % 30;
      
      if (months > 0) {
        const monLabel = isEn ? (months === 1 ? "Month" : "Months") : "Ay";
        const dayLabel = isEn ? (days === 1 ? "Day" : "Days") : "Gün";
        return { 
          text: isEn 
            ? `Remaining Time: ${months} ${monLabel} ${days > 0 ? days + ' ' + dayLabel : ''}` 
            : `Kalan Süre: ${months} Ay ${days > 0 ? days + ' Gün' : ''}`, 
          expired: false 
        };
      }
      const dayLabel = isEn ? (diffDays === 1 ? "Day" : "Days") : "Gün";
      return { 
        text: isEn 
          ? `Remaining Time: ${diffDays} ${dayLabel}` 
          : `Kalan Süre: ${diffDays} Gün`, 
        expired: false 
      };
    }

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        marketingConsent: user.marketing_consent,
        createdAt: user.created_at,
        role: user.role,
        isVerified: user.is_verified,
        pages: pagesRes.rows.map((row) => ({
          id: row.id,
          pageSlug: row.page_slug,
          packageName: row.package_name,
          createdAt: row.created_at,
          remainingTime: calculateRemainingTime(row.created_at, row.package_name).text,
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
    updateQuery += ` WHERE id = $${queryParams.length} RETURNING id, name, email, marketing_consent, is_verified`;

    const updateRes = await pool.query(updateQuery, queryParams);
    const updatedUser = updateRes.rows[0];

    return NextResponse.json({
      message: "Profil başarıyla güncellendi.",
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        marketingConsent: updatedUser.marketing_consent,
        isVerified: updatedUser.is_verified,
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
