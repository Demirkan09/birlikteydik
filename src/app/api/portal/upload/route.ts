import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { randomBytes } from "crypto";
import pool from "@/lib/db";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
]);

// ─── POST /api/portal/upload ──────────────────────────────────────────────────
export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const token = formData.get("token") as string | null;
    const file = formData.get("file") as File | null;

    if (!token || !file) {
      return NextResponse.json(
        { error: "token ve file alanları zorunludur." },
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

    // Validate file type
    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json(
        { error: "Yalnızca JPEG, PNG ve WebP dosyaları kabul edilmektedir." },
        { status: 415 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "Dosya boyutu 10 MB sınırını aşıyor." },
        { status: 413 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Determine extension from MIME type
    const mimeToExt: Record<string, string> = {
      "image/jpeg": "jpg",
      "image/jpg": "jpg",
      "image/png": "png",
      "image/webp": "webp",
    };
    const ext = mimeToExt[file.type] ?? "jpg";

    // Create unique filename preserving original name but sanitized (matching admin panel format)
    const originalName = file.name || "portal_image";
    let fileExt = path.extname(originalName).toLowerCase();
    if (!fileExt) {
      fileExt = `.${ext}`;
    }
    const nameWithoutExt = path.basename(originalName, fileExt).replace(/[^a-zA-Z0-9]/g, "_");
    const filename = `portal-${nameWithoutExt}_${Date.now()}${fileExt}`;

    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await fs.mkdir(uploadDir, { recursive: true });

    const filePath = path.join(uploadDir, filename);
    await fs.writeFile(filePath, buffer);

    return NextResponse.json({ url: `/api/uploads/${filename}` });
  } catch (err) {
    console.error("[POST /api/portal/upload] Hata:", err);
    return NextResponse.json(
      { error: "Dosya yükleme sırasında bir hata oluştu." },
      { status: 500 }
    );
  }
}
