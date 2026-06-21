import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { generateSecureToken } from "@/lib/tokens";
import { sendAccountPasswordReset, sendPagePasswordReset } from "@/lib/email";

// ─── Helper: verify caller is admin or staff ─────────────────────────────────────────
async function verifyAdminOrStaff(adminEmail: string) {
  const res = await pool.query(
    "SELECT id, name, email, role FROM users WHERE email = $1",
    [adminEmail.toLowerCase().trim()]
  );
  if ((res.rowCount ?? 0) === 0) return null;
  const user = res.rows[0];
  if (user.role !== "admin" && user.role !== "staff") return null;
  return user as { id: string; name: string; email: string; role: string };
}

// ─── POST: Send password reset email on behalf of admin ─────────────────────
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { adminEmail, targetUserId, resetType, pageSlug } = body as {
      adminEmail?: string;
      targetUserId?: string;
      resetType?: "account" | "page";
      pageSlug?: string;
    };

    if (!adminEmail || !targetUserId || !resetType) {
      return NextResponse.json(
        { error: "adminEmail, targetUserId ve resetType alanları zorunludur." },
        { status: 400 }
      );
    }
    if (resetType !== "account" && resetType !== "page") {
      return NextResponse.json(
        { error: "Geçersiz resetType. 'account' veya 'page' olmalıdır." },
        { status: 400 }
      );
    }
    if (resetType === "page" && !pageSlug) {
      return NextResponse.json(
        { error: "Sayfa şifresi sıfırlama için pageSlug gereklidir." },
        { status: 400 }
      );
    }

    const admin = await verifyAdminOrStaff(adminEmail);
    if (!admin) {
      return NextResponse.json(
        { error: "Bu işlem için yetkiniz yok." },
        { status: 403 }
      );
    }

    // Look up the target user
    const targetRes = await pool.query(
      "SELECT id, name, email FROM users WHERE id = $1",
      [targetUserId]
    );

    if ((targetRes.rowCount ?? 0) === 0) {
      return NextResponse.json(
        { error: "Hedef kullanıcı bulunamadı." },
        { status: 404 }
      );
    }

    const targetUser = targetRes.rows[0];
    const token = generateSecureToken();

    if (resetType === "account") {
      await pool.query(
        `INSERT INTO password_reset_tokens
           (user_id, token, expires_at, reset_type)
         VALUES ($1, $2, NOW() + INTERVAL '1 hour', 'account')`,
        [targetUser.id, token]
      );

      await sendAccountPasswordReset({
        to: targetUser.email,
        name: targetUser.name,
        token,
      });
    } else {
      // type === 'page'
      await pool.query(
        `INSERT INTO password_reset_tokens
           (user_id, token, expires_at, reset_type, page_slug)
         VALUES ($1, $2, NOW() + INTERVAL '1 hour', 'page_password', $3)`,
        [targetUser.id, token, pageSlug]
      );

      await sendPagePasswordReset({
        to: targetUser.email,
        name: targetUser.name,
        token,
        pageSlug: pageSlug!,
      });
    }

    return NextResponse.json({
      message: "Şifre sıfırlama e-postası gönderildi.",
    });
  } catch (err) {
    console.error("[POST /api/admin/send-reset-email] Hata:", err);
    return NextResponse.json({ error: "Sunucu hatası." }, { status: 500 });
  }
}
