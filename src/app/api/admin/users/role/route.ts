import { NextResponse } from "next/server";
import pool from "@/lib/db";

// Helper: verify caller is admin
async function verifyAdmin(adminEmail: string) {
  const res = await pool.query(
    "SELECT id, role FROM users WHERE email = $1 AND role = 'admin'",
    [adminEmail.toLowerCase().trim()]
  );
  return (res.rowCount ?? 0) > 0;
}

export async function POST(request: Request) {
  try {
    const { adminEmail, userId, newRole } = await request.json();

    if (!adminEmail || !userId || !newRole) {
      return NextResponse.json({ error: "Eksik parametre." }, { status: 400 });
    }

    if (!["admin", "staff", "user"].includes(newRole)) {
      return NextResponse.json({ error: "Geçersiz rol." }, { status: 400 });
    }

    const isAdmin = await verifyAdmin(adminEmail);
    if (!isAdmin) {
      return NextResponse.json({ error: "Yetkisiz işlem." }, { status: 403 });
    }

    // Check if user exists
    const userRes = await pool.query("SELECT id FROM users WHERE id = $1", [userId]);
    if ((userRes.rowCount ?? 0) === 0) {
      return NextResponse.json({ error: "Kullanıcı bulunamadı." }, { status: 404 });
    }

    // Update role
    await pool.query("UPDATE users SET role = $1 WHERE id = $2", [newRole, userId]);

    return NextResponse.json({ success: true, message: "Rol güncellendi." });
  } catch (err) {
    console.error("[POST /api/admin/users/role] Hata:", err);
    return NextResponse.json({ error: "Sunucu hatası." }, { status: 500 });
  }
}
