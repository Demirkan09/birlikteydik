import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { sendCustomEmail } from "@/lib/email";
import { promises as fs } from "fs";
import path from "path";

export async function GET(request: Request) {
  try {
    // 1. Ayarları Veritabanından Çek
    const settingsRes = await pool.query("SELECT key, value FROM site_settings");
    const settings = settingsRes.rows.reduce((acc, row) => {
      acc[row.key] = row.value;
      return acc;
    }, {} as Record<string, any>);

    const abandonedSettings = settings.abandoned_cart_settings || {};
    if (abandonedSettings.enabled === false) {
      return NextResponse.json({ message: "Terk edilmiş sayfa yönetimi özelliği pasif." });
    }

    const emailDelayHours = abandonedSettings.email_delay_hours || 12;
    const emailSubject = abandonedSettings.email_subject || "Yarım Kalan Bir Hikaye Var... 🤍";
    const emailBodyTemplate = abandonedSettings.email_body || `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; line-height: 1.6;">
        <h2 style="color: #C9A84C;">Merhaba {{isim}},</h2>
        <p>Birlikteydik sayfanı tasarlamaya başladığını gördük ancak henüz yayına almadın.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="https://birlikteydik.com/sayfa-olustur" style="background-color: #C9A84C; color: #0B0F1A; padding: 14px 28px; text-decoration: none; border-radius: 40px; font-weight: bold; font-size: 16px;">Tasarımı Tamamla ve Hayata Geçir</a>
        </div>
      </div>
    `;
    const deleteDelayHours = abandonedSettings.delete_delay_hours || 72; // Eğer 0 gelirse silme işlemi pasif

    // Kolonların var olduğundan emin ol
    try {
      await pool.query(
        `ALTER TABLE user_pages ADD COLUMN IF NOT EXISTS abandoned_email_sent BOOLEAN DEFAULT false;`
      );
    } catch (e) { }

    let sentCount = 0;
    let deletedCount = 0;

    // --- 2. MAİL GÖNDERME İŞLEMİ ---
    if (emailDelayHours > 0) {
      const emailRes = await pool.query(`
        SELECT 
          u.id as user_id,
          u.name as user_name,
          u.email as user_email,
          up.id as user_page_id,
          up.page_slug,
          ps.updated_at
        FROM user_pages up
        JOIN page_settings ps ON up.page_slug = ps.page_slug
        JOIN users u ON up.user_id = u.id
        WHERE ps.is_published = false
          AND up.abandoned_email_sent = false
          AND ps.updated_at < NOW() - INTERVAL '${emailDelayHours} hours'
      `);

      for (const row of emailRes.rows) {
        // İsim değişkenini ({{isim}}) template içinde değiştir
        const emailHtml = emailBodyTemplate.replace(/\{\{isim\}\}/g, row.user_name || "Değerli Müşterimiz");

        try {
          await sendCustomEmail({
            to: row.user_email,
            subject: emailSubject,
            html: emailHtml,
          });

          await pool.query(
            "UPDATE user_pages SET abandoned_email_sent = true WHERE id = $1",
            [row.user_page_id]
          );
          sentCount++;
        } catch (e) {
          console.error("Mail gönderme hatası:", e);
        }
      }
    }

    // --- 3. VERİ SİLME (TEMİZLİK) İŞLEMİ ---
    if (deleteDelayHours > 0) {
      const deleteRes = await pool.query(`
        SELECT 
          up.id as user_page_id,
          up.page_slug,
          ps.config
        FROM user_pages up
        JOIN page_settings ps ON up.page_slug = ps.page_slug
        WHERE ps.is_published = false
          AND ps.updated_at < NOW() - INTERVAL '${deleteDelayHours} hours'
      `);

      for (const row of deleteRes.rows) {
        const slug = row.page_slug;
        const config = row.config || {};
        const memories = config.memories || [];
        const uploadDir = path.join(process.cwd(), "public", "uploads");

        // Fotoğrafları diskten bul ve sil
        for (const m of memories) {
          if (m.photo && typeof m.photo === "string" && m.photo.startsWith("/api/uploads/")) {
            const filename = m.photo.split("/api/uploads/")[1];
            if (filename) {
              const filePath = path.join(uploadDir, filename);
              try {
                await fs.unlink(filePath);
                console.log("Silinen dosya:", filePath);
              } catch (err: any) {
                // Eğer dosya yoksa görmezden gel (hata fırlatma)
                if (err.code !== "ENOENT") {
                  console.error("Dosya silinemedi:", filePath, err);
                }
              }
            }
          }
        }

        // DB Kayıtlarını Sil
        try {
          await pool.query("BEGIN");
          // quiz_answers eğer oluşturulduysa veya ileride oluşturulacaksa
          await pool.query("DELETE FROM quiz_answers WHERE page_slug = $1", [slug]).catch(() => {});
          await pool.query("DELETE FROM user_pages WHERE page_slug = $1", [slug]);
          await pool.query("DELETE FROM page_settings WHERE page_slug = $1", [slug]);
          await pool.query("COMMIT");
          deletedCount++;
        } catch (err) {
          await pool.query("ROLLBACK");
          console.error("DB silme hatası, slug:", slug, err);
        }
      }
    }

    return NextResponse.json({
      message: "Cron job executed successfully.",
      emails_sent: sentCount,
      pages_deleted: deletedCount
    });

  } catch (err) {
    console.error("[CRON /api/cron/abandoned-pages] Hata:", err);
    return NextResponse.json({ error: "Sunucu hatası." }, { status: 500 });
  }
}
