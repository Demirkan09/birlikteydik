import { NextResponse } from "next/server";
import pool from "@/lib/db";

// ─── Helper: verify caller is admin ─────────────────────────────────────────
async function verifyAdmin(adminEmail: string) {
  const res = await pool.query(
    "SELECT id, name, email, role FROM users WHERE email = $1",
    [adminEmail.toLowerCase().trim()]
  );
  if ((res.rowCount ?? 0) === 0) return null;
  const user = res.rows[0];
  if (user.role !== "admin") return null;
  return user as { id: string; name: string; email: string; role: string };
}

// ─── GET: List all users with their pages ───────────────────────────────────
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const adminEmail = searchParams.get("adminEmail");

    if (!adminEmail) {
      return NextResponse.json(
        { error: "adminEmail parametresi gerekli." },
        { status: 400 }
      );
    }

    const admin = await verifyAdmin(adminEmail);
    if (!admin) {
      return NextResponse.json(
        { error: "Bu işlem için yetkiniz yok." },
        { status: 403 }
      );
    }

    const res = await pool.query(
      `SELECT
         u.id,
         u.name,
         u.email,
         u.role,
         u.created_at,
         json_agg(
           json_build_object(
             'id', p.id,
             'pageSlug', p.page_slug,
             'packageName', p.package_name,
             'createdAt', p.created_at
           ) ORDER BY p.created_at DESC
         ) FILTER (WHERE p.id IS NOT NULL) AS pages
       FROM users u
       LEFT JOIN user_pages p ON p.user_id = u.id
       GROUP BY u.id
       ORDER BY u.created_at DESC`
    );

    return NextResponse.json({ users: res.rows });
  } catch (err) {
    console.error("[GET /api/admin/users] Hata:", err);
    return NextResponse.json({ error: "Sunucu hatası." }, { status: 500 });
  }
}
