import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import pool from "@/lib/db";
import { revalidatePath } from "next/cache";

// Helper: extract filename from any URL containing /uploads/
function extractFilename(url: string) {
  if (!url || typeof url !== "string") return null;
  const match = url.match(/\/uploads\/([^/?#]+)/);
  return match ? match[1] : null;
}

// Extract all /uploads/ asset filenames from config & memories
function extractUploadFilenames(config: any, memories: any[]) {
  const filenames = new Set<string>();
  
  const addIfUpload = (url: string) => {
    const fn = extractFilename(url);
    if (fn) filenames.add(fn);
  };

  if (config?.musicUrl) addIfUpload(config.musicUrl);
  if (config?.videoUrl) addIfUpload(config.videoUrl);

  if (Array.isArray(memories)) {
    memories.forEach((m: any) => {
      if (m?.image) addIfUpload(m.image);
      if (m?.video) addIfUpload(m.video);
    });
  }
  return filenames;
}

// Helper: verify caller is admin or staff
async function verifyAdminOrStaff(adminEmail: string) {
  const res = await pool.query(
    "SELECT id, role FROM users WHERE email = $1 AND role IN ('admin', 'staff')",
    [adminEmail.toLowerCase().trim()]
  );
  return (res.rowCount ?? 0) > 0;
}

// Default settings map for initialization
const DEFAULT_CONFIGS: Record<string, { config: any; memories: any }> = {
  "klasik-retro": {
    config: {
      coupleNames: "Sen & Ben",
      tagline: "Eski bir sinema makinesinin cızırtısında, en güzel hikayemiz...",
      accentColor: "#C9A84C",
      specialDate: "14 Şubat 2026",
      musicUrl: "/music/default.mp3",
      videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-romantic-couple-enjoying-a-sunset-together-42417-large.mp4",
    },
    memories: [
      { id: 1, image: "/moment.jpg", title: "İlk Bakış", description: "Bana sımsıcak gülümsediğin ve hayatımın değiştiği o gün.", date: "14 Şubat 2025" },
      { id: 2, image: "/moment2.jpg", title: "El Ele", description: "Sadece elini tutmak bile kalbimin ritmini hızlandırıyor.", date: "12 Mart 2025" }
    ]
  },
  "romantik-kirmizi": {
    config: {
      coupleNames: "Sen & Ben",
      tagline: "Aşkın en sıcak tonunda, kalbimin her atışında saklanan en derin hislerim...",
      bgColor: "#160408",
      accentColor: "#E63946",
      specialDate: "14 Şubat 2026",
      musicUrl: "/music/default.mp3",
      videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-romantic-couple-enjoying-a-sunset-together-42417-large.mp4",
    },
    memories: [
      { id: 1, image: "/moment.jpg", title: "Aşkın Rengi", description: "İlk kez bana sımsıcak gülümsediğinde, tüm kışların eriyip bahara döndüğü gün.", date: "14 Şubat 2025" },
      { id: 2, image: "/moment2.jpg", title: "Kalp Atışlarımız", description: "Birlikte geçen her saniye, kalbimi sonsuza dek sana emanet ediyorum.", date: "12 Mart 2025" }
    ]
  },
  "modern-minimal": {
    config: {
      coupleNames: "Sen & Ben",
      tagline: "Gürültüden uzak, en saf halimizle. Sadece sen ve ben...",
      bgColor: "#F6F3F0",
      accentColor: "#8C7E6C",
      specialDate: "14 Şubat 2026",
      musicUrl: "/music/default.mp3",
    },
    memories: [
      { id: 1, image: "/moment.jpg", title: "Sadelik", description: "Bana sımsıcak gülümsediğin o güzel an.", date: "14 Şubat 2025" },
      { id: 2, image: "/moment2.jpg", title: "Huzur", description: "Sadece elini tutmak bile yetiyor bana.", date: "12 Mart 2025" }
    ]
  },
  "sablon-minimal": {
    config: {
      coupleNames: "Sen & Ben",
      tagline: "Gürültüden uzak, en saf halimizle. Sadece sen ve ben...",
      bgColor: "#F6F3F0",
      accentColor: "#8C7E6C",
      specialDate: "14 Şubat 2026",
      musicUrl: "/music/default.mp3",
    },
    memories: [
      { id: 1, image: "/moment.jpg", title: "Sadelik", description: "Bana sımsıcak gülümsediğin o güzel an.", date: "14 Şubat 2025" },
      { id: 2, image: "/moment2.jpg", title: "Huzur", description: "Sadece elini tutmak bile yetiyor bana.", date: "12 Mart 2025" }
    ]
  },
};

// Generic default configuration fallback
const FALLBACK_DEFAULT = {
  config: {
    coupleNames: "Sen & Ben",
    tagline: "Hayatımın en güzel anı seninle geçen her saniye...",
    accentColor: "#C9A84C",
    specialDate: "14 Şubat 2026",
    musicUrl: "/music/default.mp3",
    videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-romantic-couple-enjoying-a-sunset-together-42417-large.mp4",
  },
  memories: [
    { id: 1, image: "/moment.jpg", title: "Birlikte İlk Gün", description: "Bizim hikayemizin başladığı, kalplerimizin birleştiği o an.", date: "14 Şubat 2025" },
    { id: 2, image: "/moment2.jpg", title: "Mutluluk Dolu Gülüşler", description: "Yanında güldüğüm, en doğal, en huzurlu halim.", date: "12 Mart 2025" }
  ]
};

// ─── GET: Fetch settings for a page slug ─────────────────────────────────────
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const adminEmail = searchParams.get("adminEmail");
    const pageSlug = searchParams.get("pageSlug");

    if (!adminEmail) {
      return NextResponse.json({ error: "Eksik parametre." }, { status: 400 });
    }

    const isAdminOrStaff = await verifyAdminOrStaff(adminEmail);
    if (!isAdminOrStaff) {
      return NextResponse.json({ error: "Yetkisiz işlem." }, { status: 403 });
    }

    if (!pageSlug) {
      const res = await pool.query(
        `SELECT 
           p.page_slug, 
           p.template_id, 
           p.is_published,
           p.is_showcase,
           p.config,
           up.created_at AS "activatedAt",
           up.package_name AS "packageName"
         FROM page_settings p
         LEFT JOIN user_pages up ON up.page_slug = p.page_slug
         ORDER BY p.page_slug ASC`
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
        const lowerPkg = packageName.toLowerCase().trim();
        let p = "premium";
        if (lowerPkg.includes("temel")) p = "temel";
        else if (lowerPkg.includes("standart")) p = "premium";
        else if (lowerPkg.includes("premium+")) p = "premium+";
        else if (lowerPkg.includes("premium")) {
          p = lowerPkg.includes("paket") ? "premium+" : "premium";
        } else {
          p = lowerPkg;
        }
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

      return NextResponse.json({
        pages: res.rows.map((row) => ({
          pageSlug: row.page_slug,
          templateId: row.template_id,
          isPublished: row.is_published,
          isShowcase: row.is_showcase,
          config: row.config,
          activatedAt: row.activatedAt,
          packageName: row.packageName,
          remainingTime: calculateRemainingTime(row.activatedAt, row.packageName),
        })),
      });
    }

    const cleanSlug = pageSlug.trim().toLowerCase();

    const res = await pool.query(
      "SELECT page_slug, template_id, config, memories, is_published, is_showcase FROM page_settings WHERE page_slug = $1",
      [cleanSlug]
    );

    if ((res.rowCount ?? 0) === 0) {
      return NextResponse.json({ notFound: true });
    }

    const row = res.rows[0];
    return NextResponse.json({
      pageSettings: {
        pageSlug: row.page_slug,
        templateId: row.template_id,
        config: row.config,
        memories: row.memories,
        isPublished: row.is_published,
        isShowcase: row.is_showcase,
      }
    });
  } catch (err) {
    console.error("[GET /api/admin/page-settings] Hata:", err);
    return NextResponse.json({ error: "Sunucu hatası." }, { status: 500 });
  }
}

// ─── POST: Create or Update settings ─────────────────────────────────────────
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { adminEmail, action, pageSlug, newPageSlug, templateId, config, memories, isPublished, isShowcase } = body as {
      adminEmail?: string;
      action?: "create" | "update";
      pageSlug?: string;
      newPageSlug?: string;
      templateId?: string;
      config?: any;
      memories?: any;
      isPublished?: boolean;
      isShowcase?: boolean;
    };

    if (!adminEmail || !action || !pageSlug) {
      return NextResponse.json({ error: "Eksik veri gönderildi." }, { status: 400 });
    }

    const isAdminOrStaff = await verifyAdminOrStaff(adminEmail);
    if (!isAdminOrStaff) {
      return NextResponse.json({ error: "Yetkisiz işlem." }, { status: 403 });
    }

    const cleanSlug = pageSlug.trim().toLowerCase().replace(/\s+/g, "");
    if (!/^[a-z0-9-]+$/.test(cleanSlug)) {
      return NextResponse.json({ error: "Sayfa adresi sadece küçük harf, rakam ve tire içerebilir." }, { status: 400 });
    }

    if (action === "create") {
      if (!templateId) {
        return NextResponse.json({ error: "Şablon seçilmelidir." }, { status: 400 });
      }

      // Check if pageSettings already exists for this slug
      const checkRes = await pool.query(
        "SELECT id FROM page_settings WHERE page_slug = $1",
        [cleanSlug]
      );

      if ((checkRes.rowCount ?? 0) > 0) {
        return NextResponse.json({ error: "Bu sayfa adresi zaten kullanımda." }, { status: 409 });
      }

      // Fetch default config
      let defaults = DEFAULT_CONFIGS[templateId] ?? FALLBACK_DEFAULT;

      // Özel (custom-*) şablon: veritabanından config çek
      if (templateId.startsWith("custom-")) {
        const customId = templateId.replace("custom-", "");
        const customRes = await pool.query(
          "SELECT template_config FROM custom_templates WHERE id = $1",
          [customId]
        );
        if ((customRes.rowCount ?? 0) > 0) {
          const tplConfig = customRes.rows[0].template_config;
          defaults = {
            config: {
              coupleNames: "Sen & Ben",
              tagline: "Hayatımın en güzel anı seninle geçen her saniye...",
              specialDate: "14 Şubat 2026",
              musicUrl: "/music/default.mp3",
              // Şablon görsel ayarlarını default config'e aktar
              ...tplConfig,
            },
            memories: FALLBACK_DEFAULT.memories,
          };
        }
      }

      await pool.query(
        `INSERT INTO page_settings (page_slug, template_id, config, memories, is_published, is_showcase)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [cleanSlug, templateId, JSON.stringify(defaults.config), JSON.stringify(defaults.memories), !!isPublished, !!isShowcase]
      );

      try {
        revalidatePath(`/${cleanSlug}`);
      } catch (err) {
        console.error("[Revalidate] Hata:", err);
      }

      return NextResponse.json({
        message: "Sayfa başarıyla taslak olarak oluşturuldu. Şimdi düzenleyebilirsiniz.",
        pageSlug: cleanSlug,
      }, { status: 201 });

    } else if (action === "update") {
      if (!templateId || !config || !memories) {
        return NextResponse.json({ error: "Güncelleme için gerekli veriler eksik." }, { status: 400 });
      }

      // Compare old and new configs to clean up replaced media files
      try {
        const oldSettingsRes = await pool.query(
          "SELECT config, memories FROM page_settings WHERE page_slug = $1",
          [cleanSlug]
        );

        if ((oldSettingsRes.rowCount ?? 0) > 0) {
          const oldRow = oldSettingsRes.rows[0];
          const oldFilenames = extractUploadFilenames(oldRow.config, oldRow.memories);
          const newFilenames = extractUploadFilenames(config, memories);

          // Find filenames in old that are NOT in new
          const orphanedFilenames = [...oldFilenames].filter((fn) => !newFilenames.has(fn));

          // Delete orphaned files from VDS filesystem
          for (const filename of orphanedFilenames) {
            try {
              const filePath = path.join(process.cwd(), "public", "uploads", filename);
              await fs.unlink(filePath);
              console.log(`[CleanUp] Silindi: ${filePath}`);
            } catch (err: any) {
              // Ignore if file doesn't exist on disk
              console.error(`[CleanUp] Silme hatası (${filename}):`, err.message);
            }
          }
        }
      } catch (err) {
        console.error("[CleanUp] Hata:", err);
      }

      // Update the page settings
      let cleanNewSlug = cleanSlug;
      let slugChanged = false;
      if (newPageSlug && newPageSlug.trim().toLowerCase().replace(/\s+/g, "") !== cleanSlug) {
        cleanNewSlug = newPageSlug.trim().toLowerCase().replace(/\s+/g, "");
        slugChanged = true;
        if (!/^[a-z0-9-]+$/.test(cleanNewSlug)) {
          return NextResponse.json({ error: "Yeni sayfa adresi sadece küçük harf, rakam ve tire içerebilir." }, { status: 400 });
        }
        // Check if new slug is already taken
        const checkRes = await pool.query(
          "SELECT id FROM page_settings WHERE page_slug = $1",
          [cleanNewSlug]
        );
        if ((checkRes.rowCount ?? 0) > 0) {
          return NextResponse.json({ error: "Bu yeni sayfa adresi zaten kullanımda." }, { status: 409 });
        }
      }

      let result;
      if (slugChanged) {
        // Run transaction to rename slug everywhere
        await pool.query("BEGIN");
        try {
          // Update activation_codes
          await pool.query(
            "UPDATE activation_codes SET page_slug = $1 WHERE page_slug = $2",
            [cleanNewSlug, cleanSlug]
          );
          // Update user_pages
          await pool.query(
            "UPDATE user_pages SET page_slug = $1 WHERE page_slug = $2",
            [cleanNewSlug, cleanSlug]
          );
          // Update quiz_answers
          await pool.query(
            "UPDATE quiz_answers SET page_slug = $1 WHERE page_slug = $2",
            [cleanNewSlug, cleanSlug]
          );
          // Update page_settings
          result = await pool.query(
            `UPDATE page_settings
             SET page_slug = $1, template_id = $2, config = $3, memories = $4, is_published = $5, is_showcase = $6
             WHERE page_slug = $7
             RETURNING id`,
            [cleanNewSlug, templateId, JSON.stringify(config), JSON.stringify(memories), !!isPublished, !!isShowcase, cleanSlug]
          );
          await pool.query("COMMIT");
        } catch (transErr) {
          await pool.query("ROLLBACK");
          throw transErr;
        }
      } else {
        result = await pool.query(
          `UPDATE page_settings
           SET template_id = $1, config = $2, memories = $3, is_published = $4, is_showcase = $5
           WHERE page_slug = $6
           RETURNING id`,
          [templateId, JSON.stringify(config), JSON.stringify(memories), !!isPublished, !!isShowcase, cleanSlug]
        );
      }

      if ((result.rowCount ?? 0) === 0) {
        return NextResponse.json({ error: "Güncellenecek sayfa bulunamadı." }, { status: 404 });
      }

      try {
        revalidatePath(`/${cleanSlug}`);
        if (slugChanged) {
          revalidatePath(`/${cleanNewSlug}`);
        }
      } catch (err) {
        console.error("[Revalidate] Hata:", err);
      }

      return NextResponse.json({
        message: isPublished ? "Sayfa başarıyla yayına alındı! 🎉" : "Düzenlemeler kaydedildi (Taslak).",
        pageSlug: cleanNewSlug,
      });
    }

    return NextResponse.json({ error: "Geçersiz işlem tipi." }, { status: 400 });
  } catch (err) {
    console.error("[POST /api/admin/page-settings] Hata:", err);
    return NextResponse.json({ error: "Sunucu hatası." }, { status: 500 });
  }
}

// ─── DELETE: Delete a page and clean up its resources ────────────────────────
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const adminEmail = searchParams.get("adminEmail");
    const pageSlug = searchParams.get("pageSlug");

    if (!adminEmail || !pageSlug) {
      return NextResponse.json({ error: "Eksik parametre." }, { status: 400 });
    }

    const resAdmin = await pool.query(
      "SELECT id, role FROM users WHERE email = $1 AND role = 'admin'",
      [adminEmail.toLowerCase().trim()]
    );
    const isAdmin = (resAdmin.rowCount ?? 0) > 0;
    if (!isAdmin) {
      return NextResponse.json({ error: "Yetkisiz işlem. Yalnızca admin silebilir." }, { status: 403 });
    }

    const cleanSlug = pageSlug.trim().toLowerCase();

    // 1. Get settings to retrieve upload file paths
    const settingsRes = await pool.query(
      "SELECT config, memories FROM page_settings WHERE page_slug = $1",
      [cleanSlug]
    );

    if ((settingsRes.rowCount ?? 0) > 0) {
      const row = settingsRes.rows[0];
      const filenames = extractUploadFilenames(row.config, row.memories);

      // Delete files from public/uploads/
      for (const filename of filenames) {
        try {
          const filePath = path.join(process.cwd(), "public", "uploads", filename);
          await fs.unlink(filePath);
          console.log(`[DeletePage] Silindi: ${filePath}`);
        } catch (err: any) {
          console.error(`[DeletePage] Dosya silme hatası (${filename}):`, err.message);
        }
      }
    }

    // 2. Delete database rows across tables inside a transaction
    await pool.query("BEGIN");

    await pool.query(
      "DELETE FROM activation_codes WHERE page_slug = $1",
      [cleanSlug]
    );

    await pool.query(
      "DELETE FROM user_pages WHERE page_slug = $1",
      [cleanSlug]
    );

    await pool.query(
      "DELETE FROM page_settings WHERE page_slug = $1",
      [cleanSlug]
    );

    await pool.query("COMMIT");

    try {
      revalidatePath(`/${cleanSlug}`);
    } catch (err) {
      console.error("[Revalidate] Hata:", err);
    }

    return NextResponse.json({
      message: "Sayfa ve ilişkili tüm verileri başarıyla silindi.",
      pageSlug: cleanSlug,
    });
  } catch (err) {
    try {
      await pool.query("ROLLBACK");
    } catch (rbErr) {
      console.error("[DELETE /api/admin/page-settings] Rollback Hatası:", rbErr);
    }
    console.error("[DELETE /api/admin/page-settings] Hata:", err);
    return NextResponse.json({ error: "Sunucu hatası." }, { status: 500 });
  }
}