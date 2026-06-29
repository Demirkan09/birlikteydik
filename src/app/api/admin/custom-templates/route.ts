import { NextResponse } from "next/server";
import pool from "@/lib/db";

// ─── Yetki Kontrolü ───────────────────────────────────────────────────────────
async function verifyAdmin(adminEmail: string) {
  const res = await pool.query(
    "SELECT id FROM users WHERE email = $1 AND role = 'admin'",
    [adminEmail.toLowerCase().trim()]
  );
  return (res.rowCount ?? 0) > 0;
}

// ─── GET: Tüm custom şablonları listele ───────────────────────────────────────
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const adminEmail = searchParams.get("adminEmail");

    if (!adminEmail) {
      return NextResponse.json({ error: "Eksik parametre." }, { status: 400 });
    }

    // staff de listeleye bakabilir
    const authRes = await pool.query(
      "SELECT id FROM users WHERE email = $1 AND role IN ('admin','staff')",
      [adminEmail.toLowerCase().trim()]
    );
    if ((authRes.rowCount ?? 0) === 0) {
      return NextResponse.json({ error: "Yetkisiz." }, { status: 403 });
    }

    const res = await pool.query(
      "SELECT id, name, preview_color, template_config, created_at FROM custom_templates ORDER BY created_at DESC"
    );

    return NextResponse.json({ templates: res.rows });
  } catch (err) {
    console.error("[GET /api/admin/custom-templates]", err);
    return NextResponse.json({ error: "Sunucu hatası." }, { status: 500 });
  }
}

// ─── POST: Şablon Oluştur / Güncelle ─────────────────────────────────────────
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { adminEmail, action, id, name, previewColor, templateConfig } = body as {
      adminEmail?: string;
      action?: "create" | "update";
      id?: string;
      name?: string;
      previewColor?: string;
      templateConfig?: Record<string, unknown>;
    };

    if (!adminEmail || !action) {
      return NextResponse.json({ error: "Eksik veri." }, { status: 400 });
    }

    const isAdmin = await verifyAdmin(adminEmail);
    if (!isAdmin) {
      return NextResponse.json({ error: "Sadece admin bu işlemi yapabilir." }, { status: 403 });
    }

    if (action === "create") {
      if (!name || !templateConfig) {
        return NextResponse.json({ error: "İsim ve yapılandırma zorunlu." }, { status: 400 });
      }

      const res = await pool.query(
        `INSERT INTO custom_templates (name, template_config, preview_color)
         VALUES ($1, $2, $3)
         RETURNING id, name, preview_color, template_config, created_at`,
        [name.trim(), JSON.stringify(templateConfig), previewColor ?? "#C9A84C"]
      );

      return NextResponse.json({ template: res.rows[0] }, { status: 201 });
    }

    if (action === "update") {
      if (!id || !name || !templateConfig) {
        return NextResponse.json({ error: "ID, isim ve yapılandırma zorunlu." }, { status: 400 });
      }

      const res = await pool.query(
        `UPDATE custom_templates
         SET name = $1, template_config = $2, preview_color = $3, updated_at = NOW()
         WHERE id = $4
         RETURNING id, name, preview_color, template_config, created_at`,
        [name.trim(), JSON.stringify(templateConfig), previewColor ?? "#C9A84C", id]
      );

      if ((res.rowCount ?? 0) === 0) {
        return NextResponse.json({ error: "Şablon bulunamadı." }, { status: 404 });
      }

      return NextResponse.json({ template: res.rows[0] });
    }

    return NextResponse.json({ error: "Geçersiz action." }, { status: 400 });
  } catch (err) {
    console.error("[POST /api/admin/custom-templates]", err);
    return NextResponse.json({ error: "Sunucu hatası." }, { status: 500 });
  }
}

// ─── DELETE: Şablon Sil ───────────────────────────────────────────────────────
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const adminEmail = searchParams.get("adminEmail");
    const id = searchParams.get("id");

    if (!adminEmail || !id) {
      return NextResponse.json({ error: "Eksik parametre." }, { status: 400 });
    }

    const isAdmin = await verifyAdmin(adminEmail);
    if (!isAdmin) {
      return NextResponse.json({ error: "Sadece admin bu işlemi yapabilir." }, { status: 403 });
    }

    const res = await pool.query(
      "DELETE FROM custom_templates WHERE id = $1 RETURNING id",
      [id]
    );

    if ((res.rowCount ?? 0) === 0) {
      return NextResponse.json({ error: "Şablon bulunamadı." }, { status: 404 });
    }

    return NextResponse.json({ message: "Şablon silindi." });
  } catch (err) {
    console.error("[DELETE /api/admin/custom-templates]", err);
    return NextResponse.json({ error: "Sunucu hatası." }, { status: 500 });
  }
}
