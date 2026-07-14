import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { revalidatePath } from "next/cache";

// ─── Helper: verify caller is admin or staff ──────────────────────────────────
async function verifyAdminOrStaff(adminEmail: string) {
  const res = await pool.query(
    "SELECT id, role FROM users WHERE email = $1 AND role IN ('admin', 'staff')",
    [adminEmail.toLowerCase().trim()]
  );
  return (res.rowCount ?? 0) > 0;
}

// ─── GET /api/portal/submissions ─────────────────────────────────────────────
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

    const isAdmin = await verifyAdminOrStaff(adminEmail);
    if (!isAdmin) {
      return NextResponse.json(
        { error: "Bu işlem için yetkiniz yok." },
        { status: 403 }
      );
    }

    const res = await pool.query(
      `SELECT
         cs.id,
         cs.token,
         cs.page_slug,
         cs.status,
         cs.expires_at,
         cs.couple_names,
         cs.special_date,
         cs.tagline,
         cs.music_url,
         cs.memories,
         cs.submitted_at,
         cs.created_at,
         u.name  AS user_name,
         u.email AS user_email
       FROM client_submissions cs
       LEFT JOIN user_pages up ON up.id = cs.user_page_id
       LEFT JOIN users u ON u.id = up.user_id
       ORDER BY cs.created_at DESC`
    );

    return NextResponse.json({ submissions: res.rows });
  } catch (err) {
    console.error("[GET /api/portal/submissions] Hata:", err);
    return NextResponse.json({ error: "Sunucu hatası." }, { status: 500 });
  }
}

// ─── PATCH /api/portal/submissions — import submission into page ───────────────
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { adminEmail, submissionId } = body as {
      adminEmail?: string;
      submissionId?: number;
    };

    if (!adminEmail || !submissionId) {
      return NextResponse.json(
        { error: "adminEmail ve submissionId zorunludur." },
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

    // Fetch the submission
    const subRes = await pool.query(
      `SELECT id, page_slug, couple_names, special_date, tagline, music_url, memories
       FROM client_submissions
       WHERE id = $1`,
      [submissionId]
    );

    if ((subRes.rowCount ?? 0) === 0) {
      return NextResponse.json(
        { error: "Gönderi bulunamadı." },
        { status: 404 }
      );
    }

    const sub = subRes.rows[0] as {
      id: number;
      page_slug: string;
      couple_names: string | null;
      special_date: string | null;
      tagline: string | null;
      music_url: string | null;
      memories: unknown;
    };

    // Build the config overlay — only include non-null fields
    const configOverlay: Record<string, string> = {};
    if (sub.couple_names !== null) configOverlay.coupleNames = sub.couple_names;
    if (sub.special_date !== null) configOverlay.specialDate = sub.special_date;
    if (sub.tagline !== null) configOverlay.tagline = sub.tagline;
    if (sub.music_url !== null) configOverlay.musicUrl = sub.music_url;

    const memoriesJson = JSON.stringify(
      Array.isArray(sub.memories) ? sub.memories : []
    );

    // Run update inside a transaction
    await pool.query("BEGIN");
    try {
      await pool.query(
        `UPDATE page_settings
         SET memories = $1,
             config   = config || $2::jsonb
         WHERE page_slug = $3`,
        [memoriesJson, JSON.stringify(configOverlay), sub.page_slug]
      );

      await pool.query(
        `UPDATE client_submissions
         SET status = 'imported'
         WHERE id = $1`,
        [sub.id]
      );

      await pool.query("COMMIT");
    } catch (transErr) {
      await pool.query("ROLLBACK");
      throw transErr;
    }

    // Revalidate the published page so the next visit reflects the new data
    try {
      revalidatePath("/" + sub.page_slug);
    } catch (revalErr) {
      console.error("[PATCH /api/portal/submissions] Revalidate hatası:", revalErr);
    }

    return NextResponse.json({ success: true, pageSlug: sub.page_slug });
  } catch (err) {
    try {
      await pool.query("ROLLBACK");
    } catch (rbErr) {
      console.error("[PATCH /api/portal/submissions] Rollback hatası:", rbErr);
    }
    console.error("[PATCH /api/portal/submissions] Hata:", err);
    return NextResponse.json({ error: "Sunucu hatası." }, { status: 500 });
  }
}
