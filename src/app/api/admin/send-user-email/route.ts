import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { sendCustomEmail } from "@/lib/email";

async function verifyAdmin(adminEmail: string) {
  const res = await pool.query(
    "SELECT id, role FROM users WHERE email = $1 AND role = 'admin'",
    [adminEmail.toLowerCase().trim()]
  );
  return (res.rowCount ?? 0) > 0;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { adminEmail, targetUserId, email, subject, body: emailBody } = body as {
      adminEmail?: string;
      targetUserId?: string;
      email?: string;
      subject?: string;
      body?: string;
    };

    // 1. Verify admin privilege
    if (!adminEmail) {
      return NextResponse.json({ error: "Admin yetkilendirmesi eksik." }, { status: 401 });
    }

    const isAdmin = await verifyAdmin(adminEmail);
    if (!isAdmin) {
      return NextResponse.json({ error: "Bu işlem için yetkiniz yok." }, { status: 403 });
    }

    // 2. Validate input fields
    if (!email || !targetUserId || !subject || !subject.trim() || !emailBody || !emailBody.trim()) {
      return NextResponse.json({ error: "Gerekli tüm alanlar doldurulmalıdır." }, { status: 400 });
    }

    // 3. Verify target user exists in DB
    const userCheck = await pool.query(
      "SELECT name, email FROM users WHERE id = $1 AND email = $2",
      [targetUserId, email.toLowerCase().trim()]
    );

    if ((userCheck.rowCount ?? 0) === 0) {
      return NextResponse.json({ error: "Hedef kullanıcı bulunamadı." }, { status: 404 });
    }

    const targetUser = userCheck.rows[0];

    // 4. Customize body replacing {name} placeholder
    const customizedBody = emailBody.replace(/{name}/g, targetUser.name || "Kullanıcımız").replace(/\n/g, "<br/>");

    // 5. Send e-mail
    await sendCustomEmail({
      to: targetUser.email,
      subject: subject,
      html: customizedBody,
    });

    return NextResponse.json({
      message: "E-posta başarıyla gönderildi.",
    });
  } catch (err) {
    console.error("[POST /api/admin/send-user-email] Hata:", err);
    return NextResponse.json(
      { error: "Sunucu hatası oluştu." },
      { status: 500 }
    );
  }
}
