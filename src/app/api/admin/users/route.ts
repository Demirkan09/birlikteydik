import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import pool from "@/lib/db";

// ─── Helper: verify caller is admin or staff ─────────────────────────────────────────
async function verifyAdminOrStaff(adminEmail: string) {
  const res = await pool.query(
    "SELECT id, name, email, role FROM users WHERE email = $1",
    [adminEmail.toLowerCase().trim()]
  );
  if ((res.rowCount ?? 0) === 0) return null;
  const user = res.rows[0];
  if (user.role !== "admin" && user.role !== "staff") return null;
  return user as { id: string; name: string; email: string; role: string };
}

// ─── GET: List all users with their pages ───────────────────────────────────
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

    const admin = await verifyAdminOrStaff(adminEmail);
    if (!admin) {
      return NextResponse.json(
        { error: "Bu işlem için yetkiniz yok." },
        { status: 403 }
      );
    }

    const res = await pool.query(
      `SELECT
         u.id,
         u.name,
         u.email,
         u.role,
         u.created_at AS "createdAt",
         json_agg(
           json_build_object(
             'id', p.id,
             'pageSlug', p.page_slug,
             'packageName', p.package_name,
             'createdAt', p.created_at
           ) ORDER BY p.created_at DESC
         ) FILTER (WHERE p.id IS NOT NULL) AS pages
       FROM users u
       LEFT JOIN user_pages p ON p.user_id = u.id
       GROUP BY u.id
       ORDER BY u.created_at DESC`
    );

    const settingsRes = await pool.query("SELECT value FROM site_settings WHERE key = 'package_durations'");
    let packageDurations: Record<string, { old: number | null, new: number }> = {
      "temel": { old: null, new: 6 },
      "premium": { old: null, new: 18 },
      "premium+": { old: null, new: 24 }
    };
    if ((settingsRes.rowCount ?? 0) > 0) {
      packageDurations = settingsRes.rows[0].value;
    }

    function calculateRemainingTime(createdAt: string | Date | null, packageName: string | null) {
      if (!createdAt || !packageName) return "Aktif Değil";
      const p = packageName.toLowerCase();
      const durationMonths = packageDurations[p]?.new || 12;
      
      const start = new Date(createdAt);
      const end = new Date(start);
      end.setMonth(start.getMonth() + durationMonths);
      
      const now = new Date();
      const diffTime = end.getTime() - now.getTime();
      
      if (diffTime <= 0) return "Süresi Doldu";
      
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      const months = Math.floor(diffDays / 30);
      const days = diffDays % 30;
      
      if (months > 0) return `Kalan Süre: ${months} Ay ${days > 0 ? days + ' Gün' : ''}`;
      return `Kalan Süre: ${days} Gün`;
    }

    const users = res.rows.map((u) => {
      let pages = u.pages || [];
      pages = pages.map((p: any) => ({
        ...p,
        remainingTime: calculateRemainingTime(p.createdAt, p.packageName)
      }));
      return { ...u, pages };
    });

    return NextResponse.json({ users });
  } catch (err) {
    console.error("[GET /api/admin/users] Hata:", err);
    return NextResponse.json({ error: "Sunucu hatası." }, { status: 500 });
  }
}

// ─── DELETE: Delete a user or detach a page ──────────────────────────────────
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const adminEmail = searchParams.get("adminEmail");
    const userId = searchParams.get("userId");
    const pageSlug = searchParams.get("pageSlug");

    if (!adminEmail || !userId) {
      return NextResponse.json(
        { error: "adminEmail ve userId parametreleri zorunludur." },
        { status: 400 }
      );
    }

    const resAdmin = await pool.query(
      "SELECT id, role FROM users WHERE email = $1 AND role = 'admin'",
      [adminEmail.toLowerCase().trim()]
    );
    const isAdmin = (resAdmin.rowCount ?? 0) > 0;
    if (!isAdmin) {
      return NextResponse.json({ error: "Yetkisiz işlem." }, { status: 403 });
    }

    if (pageSlug) {
      // Action: Detach page from user
      const cleanSlug = pageSlug.trim().toLowerCase();
      const deleteRes = await pool.query(
        "DELETE FROM user_pages WHERE user_id = $1 AND page_slug = $2 RETURNING id",
        [userId, cleanSlug]
      );
      
      if ((deleteRes.rowCount ?? 0) === 0) {
        return NextResponse.json(
          { error: "Belirtilen sayfa bu kullanıcının hesabına tanımlı değil." },
          { status: 404 }
        );
      }

      return NextResponse.json({
        message: "Sayfa başarıyla hesaptan kaldırıldı.",
        userId,
        pageSlug: cleanSlug,
      });
    } else {
      // Action: Delete user
      // Retrieve pages owned by this user
      const userPagesRes = await pool.query(
        "SELECT page_slug FROM user_pages WHERE user_id = $1",
        [userId]
      );
      
      const pageSlugs = userPagesRes.rows.map((row) => row.page_slug);
      
      // Clean up uploads and delete page_settings for each page
      for (const slug of pageSlugs) {
        try {
          const settingsRes = await pool.query(
            "SELECT config, memories FROM page_settings WHERE page_slug = $1",
            [slug]
          );
          
          if ((settingsRes.rowCount ?? 0) > 0) {
            const row = settingsRes.rows[0];
            const config = row.config;
            const memories = row.memories;
            
            // Extract upload URLs
            const urls = new Set<string>();
            if (config?.musicUrl && config.musicUrl.startsWith("/uploads/")) {
              urls.add(config.musicUrl);
            }
            if (config?.videoUrl && config.videoUrl.startsWith("/uploads/")) {
              urls.add(config.videoUrl);
            }
            if (Array.isArray(memories)) {
              memories.forEach((m: any) => {
                if (m?.image && m.image.startsWith("/uploads/")) {
                  urls.add(m.image);
                }
                if (m?.video && m.video.startsWith("/uploads/")) {
                  urls.add(m.video);
                }
              });
            }
            
            // Delete files
            for (const url of urls) {
              try {
                const cleanPath = url.startsWith("/") ? url.substring(1) : url;
                const filePath = path.join(process.cwd(), "public", cleanPath);
                await fs.unlink(filePath);
                console.log(`[DeleteUserCleanup] Silindi: ${filePath}`);
              } catch (err: any) {
                console.error(`[DeleteUserCleanup] Dosya silme hatası (${url}):`, err.message);
              }
            }
          }
          
          // Delete page_settings
          await pool.query("DELETE FROM page_settings WHERE page_slug = $1", [slug]);
        } catch (err) {
          console.error(`[DeleteUserCleanup] Sayfa temizleme hatası (${slug}):`, err);
        }
      }

      await pool.query("BEGIN");
      
      // Set used_by to NULL in activation_codes
      await pool.query("UPDATE activation_codes SET used_by = NULL WHERE used_by = $1", [userId]);
      
      // Delete activation_codes created by this user
      await pool.query("DELETE FROM activation_codes WHERE created_by = $1", [userId]);
      
      // Delete user_pages
      await pool.query("DELETE FROM user_pages WHERE user_id = $1", [userId]);
      
      // Delete user
      const deleteUserRes = await pool.query("DELETE FROM users WHERE id = $1 RETURNING id", [userId]);
      
      if ((deleteUserRes.rowCount ?? 0) === 0) {
        await pool.query("ROLLBACK");
        return NextResponse.json(
          { error: "Silinecek kullanıcı bulunamadı." },
          { status: 404 }
        );
      }

      await pool.query("COMMIT");
      return NextResponse.json({
        message: "Kullanıcı hesabı ve tüm ilişkileri başarıyla silindi.",
        userId,
      });
    }
  } catch (err) {
    try {
      await pool.query("ROLLBACK");
    } catch (rbErr) {
      console.error("[DELETE /api/admin/users] Rollback Hatası:", rbErr);
    }
    console.error("[DELETE /api/admin/users] Hata:", err);
    return NextResponse.json({ error: "Sunucu hatası." }, { status: 500 });
  }
}
