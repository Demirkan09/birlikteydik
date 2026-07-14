import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import pool from "@/lib/db";

// Helper: verify caller is admin or staff
async function verifyAdminOrStaff(adminEmail: string) {
  const res = await pool.query(
    "SELECT id, role FROM users WHERE email = $1 AND role IN ('admin', 'staff')",
    [adminEmail.toLowerCase().trim()]
  );
  return (res.rowCount ?? 0) > 0;
}

// ─── POST /api/portal/cleanup ─────────────────────────────────────────────────
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { adminEmail } = body as { adminEmail?: string };

    if (!adminEmail) {
      return NextResponse.json({ error: "adminEmail gereklidir." }, { status: 400 });
    }

    const isAdmin = await verifyAdminOrStaff(adminEmail);
    if (!isAdmin) {
      return NextResponse.json({ error: "Bu işlem için yetkiniz yok." }, { status: 403 });
    }

    // 1. Get all used filenames from client_submissions
    const submissionsRes = await pool.query("SELECT memories FROM client_submissions");
    // 2. Get all used filenames from page_settings
    const settingsRes = await pool.query("SELECT memories FROM page_settings");

    const activeFiles = new Set<string>();

    const processMemories = (memories: any) => {
      if (!memories) return;
      let memList: any[] = [];
      if (typeof memories === "string") {
        try {
          memList = JSON.parse(memories);
        } catch {
          return;
        }
      } else if (Array.isArray(memories)) {
        memList = memories;
      }

      for (const item of memList) {
        if (item && typeof item.image === "string") {
          const match = item.image.match(/\/api\/uploads\/([^/?#]+)/);
          if (match) {
            activeFiles.add(match[1]);
          }
        }
      }
    };

    submissionsRes.rows.forEach(row => processMemories(row.memories));
    settingsRes.rows.forEach(row => processMemories(row.memories));

    // 3. Scan the public/uploads directory
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    let files: string[] = [];
    try {
      files = await fs.readdir(uploadDir);
    } catch (err: any) {
      if (err.code === "ENOENT") {
        return NextResponse.json({ deletedCount: 0, message: "Uploads klasörü mevcut değil." });
      }
      throw err;
    }

    let deletedCount = 0;
    const now = Date.now();
    const twoHoursMs = 2 * 60 * 60 * 1000;

    for (const filename of files) {
      // Only process files starting with "portal-"
      if (!filename.startsWith("portal-")) continue;

      // If it is in the database, do not delete it!
      if (activeFiles.has(filename)) continue;

      const filePath = path.join(uploadDir, filename);
      try {
        const stats = await fs.stat(filePath);
        const age = now - stats.mtimeMs;

        // Only delete files that are older than 2 hours (to avoid deleting active uploads)
        if (age > twoHoursMs) {
          await fs.unlink(filePath);
          deletedCount++;
        }
      } catch (err) {
        console.error(`Dosya silinemedi: ${filename}`, err);
      }
    }

    return NextResponse.json({
      success: true,
      deletedCount,
      message: `${deletedCount} adet ölü fotoğraf başarıyla temizlendi.`
    });
  } catch (err) {
    console.error("[POST /api/portal/cleanup] Hata:", err);
    return NextResponse.json({ error: "Temizleme hatası." }, { status: 500 });
  }
}
