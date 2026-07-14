import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import pool from "@/lib/db";

// ─── POST /api/portal/delete-file ─────────────────────────────────────────────
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { token, imageUrl } = body as {
      token?: string;
      imageUrl?: string;
    };

    if (!token || !imageUrl) {
      return NextResponse.json(
        { error: "token ve imageUrl alanları zorunludur." },
        { status: 400 }
      );
    }

    // Validate token — must exist and not be expired
    const tokenRes = await pool.query(
      `SELECT id FROM client_submissions
       WHERE token = $1 AND expires_at > NOW()`,
      [token]
    );

    if ((tokenRes.rowCount ?? 0) === 0) {
      return NextResponse.json(
        { error: "Geçersiz veya süresi dolmuş portal bağlantısı." },
        { status: 401 }
      );
    }

    // Extract filename from URL
    const match = imageUrl.match(/\/api\/uploads\/([^/?#]+)/);
    if (!match) {
      return NextResponse.json({ error: "Geçersiz dosya adresi." }, { status: 400 });
    }

    const filename = match[1];

    // Security check: only allow deleting files starting with "portal-"
    if (!filename.startsWith("portal-")) {
      return NextResponse.json({ error: "Bu dosyayı silme yetkiniz yok." }, { status: 403 });
    }

    const filePath = path.join(process.cwd(), "public", "uploads", filename);

    try {
      await fs.unlink(filePath);
      return NextResponse.json({ success: true });
    } catch (err: any) {
      if (err.code === "ENOENT") {
        // File already deleted or doesn't exist
        return NextResponse.json({ success: true, message: "Dosya zaten mevcut değil." });
      }
      throw err;
    }
  } catch (err) {
    console.error("[POST /api/portal/delete-file] Hata:", err);
    return NextResponse.json(
      { error: "Dosya silinirken bir hata oluştu." },
      { status: 500 }
    );
  }
}
