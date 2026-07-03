import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import pool from "@/lib/db";

// Helper: verify user exists
async function verifyUser(userId: string) {
  const res = await pool.query("SELECT id FROM users WHERE id = $1", [userId]);
  return (res.rowCount ?? 0) > 0;
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const userId = formData.get("userId") as string;
    const oldUrl = formData.get("oldUrl") as string;
    const file = formData.get("file") as File;

    if (!userId || !file) {
      return NextResponse.json({ error: "Eksik parametre." }, { status: 400 });
    }

    const isValidUser = await verifyUser(userId);
    if (!isValidUser) {
      return NextResponse.json({ error: "Yetkisiz işlem." }, { status: 403 });
    }

    if (oldUrl && oldUrl.startsWith("/api/uploads/")) {
      const filename = oldUrl.replace("/api/uploads/", "");
      if (!filename.includes("/") && !filename.includes("\\")) {
        const oldFilePath = path.join(process.cwd(), "public", "uploads", filename);
        try {
          await fs.unlink(oldFilePath);
          console.log(`[Upload] Eski dosya silindi: ${filename}`);
        } catch (e) {
          console.error(`[Upload] Eski dosya silinemedi: ${filename}`, e);
        }
      }
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create unique filename
    const originalName = file.name;
    const ext = path.extname(originalName) || "";
    // Temizle ve boşlukları vb altçizgi yap
    const nameWithoutExt = path.basename(originalName, ext).replace(/[^a-zA-Z0-9]/g, "_");
    const uniqueName = `${nameWithoutExt}_${Date.now()}${ext}`;

    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await fs.mkdir(uploadDir, { recursive: true });

    const filePath = path.join(uploadDir, uniqueName);
    await fs.writeFile(filePath, buffer);

    const relativeUrl = `/api/uploads/${uniqueName}`;
    return NextResponse.json({ url: relativeUrl });
  } catch (err) {
    console.error("[POST /api/customer/upload] Hata:", err);
    return NextResponse.json({ error: "Yükleme sırasında bir hata oluştu." }, { status: 500 });
  }
}
