import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import pool from "@/lib/db";

// ─── GET /api/portal/[token] ──────────────────────────────────────────────────
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    if (!token) {
      return NextResponse.json({ error: "Token gerekli." }, { status: 400 });
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
         ps.template_id,
         ps.config
       FROM client_submissions cs
       LEFT JOIN page_settings ps ON ps.page_slug = cs.page_slug
       WHERE cs.token = $1`,
      [token]
    );

    if ((res.rowCount ?? 0) === 0) {
      return NextResponse.json(
        { error: "Geçersiz portal bağlantısı." },
        { status: 404 }
      );
    }

    const row = res.rows[0];

    // Check expiry
    if (new Date(row.expires_at) < new Date()) {
      return NextResponse.json(
        { error: "Bu portal bağlantısının süresi dolmuş." },
        { status: 410 }
      );
    }

    return NextResponse.json({
      valid: true,
      status: row.status as "pending" | "submitted" | "imported",
      pageSlug: row.page_slug,
      templateId: row.template_id ?? null,
      config: row.config ?? {},
      expiresAt: row.expires_at,
      existing: {
        coupleNames: row.couple_names ?? "",
        specialDate: row.special_date ?? "",
        tagline: row.tagline ?? "",
        musicUrl: row.music_url ?? "",
        memories: Array.isArray(row.memories) ? row.memories : [],
      },
    });
  } catch (err) {
    console.error("[GET /api/portal/[token]] Hata:", err);
    return NextResponse.json({ error: "Sunucu hatası." }, { status: 500 });
  }
}

// ─── POST /api/portal/[token] ─────────────────────────────────────────────────
export async function POST(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    if (!token) {
      return NextResponse.json({ error: "Token gerekli." }, { status: 400 });
    }

    const body = await request.json();
    const { coupleNames, specialDate, tagline, musicUrl, memories } = body as {
      coupleNames?: string;
      specialDate?: string;
      tagline?: string;
      musicUrl?: string;
      memories?: Array<{ image?: string; [key: string]: unknown }>;
    };

    // Validate token — must exist and not be expired
    const tokenRes = await pool.query(
      `SELECT id, expires_at, memories AS old_memories
       FROM client_submissions
       WHERE token = $1`,
      [token]
    );

    if ((tokenRes.rowCount ?? 0) === 0) {
      return NextResponse.json(
        { error: "Geçersiz portal bağlantısı." },
        { status: 404 }
      );
    }

    const sub = tokenRes.rows[0];

    if (new Date(sub.expires_at) < new Date()) {
      return NextResponse.json(
        { error: "Bu portal bağlantısının süresi dolmuş." },
        { status: 410 }
      );
    }

    // Clean up orphaned /uploads/ files if this is a re-edit
    const oldMemories: Array<{ image?: string; [key: string]: unknown }> =
      Array.isArray(sub.old_memories) ? sub.old_memories : [];

    if (oldMemories.length > 0) {
      // Extract filenames from old memories
      const oldFilenames = new Set<string>();
      for (const m of oldMemories) {
        if (m?.image) {
          const match = String(m.image).match(/\/uploads\/([^/?#]+)/);
          if (match) oldFilenames.add(match[1]);
        }
      }

      // Extract filenames from new memories
      const newMemories = Array.isArray(memories) ? memories : [];
      const newFilenames = new Set<string>();
      for (const m of newMemories) {
        if (m?.image) {
          const match = String(m.image).match(/\/uploads\/([^/?#]+)/);
          if (match) newFilenames.add(match[1]);
        }
      }

      // Delete orphans that exist in old but not in new
      for (const filename of oldFilenames) {
        if (!newFilenames.has(filename)) {
          try {
            const filePath = path.join(
              process.cwd(),
              "public",
              "uploads",
              filename
            );
            await fs.unlink(filePath);
            console.log(`[Portal POST] Orphan silindi: ${filePath}`);
          } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : String(err);
            console.error(
              `[Portal POST] Dosya silme hatası (${filename}):`,
              msg
            );
          }
        }
      }
    }

    // Persist the submission
    await pool.query(
      `UPDATE client_submissions
       SET couple_names  = $1,
           special_date  = $2,
           tagline       = $3,
           music_url     = $4,
           memories      = $5,
           status        = 'submitted',
           submitted_at  = NOW()
       WHERE token = $6`,
      [
        coupleNames ?? null,
        specialDate ?? null,
        tagline ?? null,
        musicUrl ?? null,
        JSON.stringify(Array.isArray(memories) ? memories : []),
        token,
      ]
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[POST /api/portal/[token]] Hata:", err);
    return NextResponse.json({ error: "Sunucu hatası." }, { status: 500 });
  }
}
