import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import pool from "@/lib/db";
import { sendClientPortalInvite } from "@/lib/email";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://birlikteydik.com";

// ─── Helper: verify caller is admin or staff ──────────────────────────────────
async function verifyAdminOrStaff(adminEmail: string) {
  const res = await pool.query(
    "SELECT id, role FROM users WHERE email = $1 AND role IN ('admin', 'staff')",
    [adminEmail.toLowerCase().trim()]
  );
  return (res.rowCount ?? 0) > 0;
}

// ─── POST /api/portal/generate ────────────────────────────────────────────────
// Accepts either { adminEmail, userPageId } or { adminEmail, pageSlug }
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { adminEmail, userPageId, pageSlug: rawPageSlug } = body as {
      adminEmail?: string;
      userPageId?: number;
      pageSlug?: string;
    };

    if (!adminEmail || (!userPageId && !rawPageSlug)) {
      return NextResponse.json(
        { error: "adminEmail ve (userPageId veya pageSlug) zorunludur." },
        { status: 400 }
      );
    }

    const isAdmin = await verifyAdminOrStaff(adminEmail);
    if (!isAdmin) {
      return NextResponse.json(
        { error: "Bu işlem için yetkiniz yok." },
        { status: 403 }
      );
    }

    // Fetch page_slug, user_page_id, user name and email
    let pageSlug: string;
    let resolvedUserPageId: number | null = null;
    let userName: string;
    let userEmail: string;

    if (userPageId) {
      const pageRes = await pool.query(
        `SELECT up.id, up.page_slug, u.name AS user_name, u.email AS user_email
         FROM user_pages up
         JOIN users u ON u.id = up.user_id
         WHERE up.id = $1`,
        [userPageId]
      );

      if ((pageRes.rowCount ?? 0) === 0) {
        return NextResponse.json({ error: "Belirtilen sayfa bulunamadı." }, { status: 404 });
      }

      const row = pageRes.rows[0];
      pageSlug = row.page_slug;
      resolvedUserPageId = row.id;
      userName = row.user_name;
      userEmail = row.user_email;
    } else {
      // Look up by pageSlug
      const pageRes = await pool.query(
        `SELECT up.id, up.page_slug, u.name AS user_name, u.email AS user_email
         FROM user_pages up
         JOIN users u ON u.id = up.user_id
         WHERE up.page_slug = $1
         LIMIT 1`,
        [rawPageSlug]
      );

      if ((pageRes.rowCount ?? 0) === 0) {
        return NextResponse.json({ error: "Bu sayfaya ait bir kullanıcı bulunamadı." }, { status: 404 });
      }

      const row = pageRes.rows[0];
      pageSlug = row.page_slug;
      resolvedUserPageId = row.id;
      userName = row.user_name;
      userEmail = row.user_email;
    }

    // Check for an existing non-expired pending/submitted submission for this page_slug
    const existingRes = await pool.query(
      `SELECT token, expires_at FROM client_submissions
       WHERE page_slug = $1
         AND status IN ('pending', 'submitted')
         AND expires_at > NOW()
       ORDER BY created_at DESC
       LIMIT 1`,
      [pageSlug]
    );

    let token: string;
    let expiresAt: Date;

    if ((existingRes.rowCount ?? 0) > 0) {
      // Reuse the existing valid token
      token = existingRes.rows[0].token;
      expiresAt = new Date(existingRes.rows[0].expires_at);
    } else {
      // Generate a fresh token valid for 7 days
      token = randomBytes(32).toString("hex");
      expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

      await pool.query(
        `INSERT INTO client_submissions
           (token, page_slug, status, expires_at)
         VALUES ($1, $2, 'pending', $3)`,
        [token, pageSlug, expiresAt.toISOString()]
      );
    }

    const host = request.headers.get("host") || "birlikteydik.com";
    const protocol = host.includes("localhost") || host.includes("127.0.0.1") ? "http" : "https";
    const siteUrl = `${protocol}://${host}`;
    const portalUrl = `${siteUrl}/portal/${token}`;

    // Send invitation e-mail to the page owner
    await sendClientPortalInvite({
      to: userEmail,
      name: userName,
      portalUrl,
      pageSlug,
      expiresAt,
    });

    return NextResponse.json({ success: true, portalUrl, token });
  } catch (err) {
    console.error("[POST /api/portal/generate] Hata:", err);
    return NextResponse.json({ error: "Sunucu hatası." }, { status: 500 });
  }
}
