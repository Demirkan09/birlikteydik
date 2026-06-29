import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import pool from "@/lib/db";

// ─── Helper: verify caller is admin or staff ─────────────────────────────────────────
async function verifyAdminOrStaff(adminEmail: string) {
  const res = await pool.query(
    "SELECT id, role FROM users WHERE email = $1 AND role IN ('admin', 'staff')",
    [adminEmail.toLowerCase().trim()]
  );
  return (res.rowCount ?? 0) > 0;
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const adminEmail = formData.get("adminEmail") as string;
    const file = formData.get("file") as File;

    if (!adminEmail || !file) {
      return NextResponse.json({ error: "Eksik parametre." }, { status: 400 });
    }

    const isAdmin = await verifyAdminOrStaff(adminEmail);
    if (!isAdmin) {
      return NextResponse.json({ error: "Yetkisiz işlem." }, { status: 403 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create unique filename
    const originalName = file.name;
    const ext = path.extname(originalName) || "";
    const nameWithoutExt = path.basename(originalName, ext).replace(/[^a-zA-Z0-9]/g, "_");
    const uniqueName = `${nameWithoutExt}_${Date.now()}${ext}`;

    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await fs.mkdir(uploadDir, { recursive: true });

    const filePath = path.join(uploadDir, uniqueName);
    await fs.writeFile(filePath, buffer);

    const relativeUrl = `/api/uploads/${uniqueName}`;
    return NextResponse.json({ url: relativeUrl });
  } catch (err) {
    console.error("[POST /api/admin/upload] Hata:", err);
    return NextResponse.json({ error: "Yükleme sırasında bir hata oluştu." }, { status: 500 });
  }
}
