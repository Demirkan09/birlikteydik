import { MetadataRoute } from "next";
import pool from "@/lib/db";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://birlikteydik.com";

  // Static routes
  const staticRoutes = [
    "",
    "/sablonlar",
    "/login",
    "/register",
    "/kvkk-metni",
    "/forgot-password",
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: route === "" ? 1.0 : 0.8,
  }));

  try {
    // Dynamic user pages (only those that are published)
    const res = await pool.query(
      "SELECT page_slug FROM page_settings WHERE is_published = true"
    );
    
    const dynamicRoutes = res.rows.map((row: any) => ({
      url: `${baseUrl}/${row.page_slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.5,
    }));

    return [...staticRoutes, ...dynamicRoutes];
  } catch (error) {
    console.error("Error generating sitemap dynamic routes:", error);
    return staticRoutes;
  }
}
