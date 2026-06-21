import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET(request: Request) {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS site_settings (
        key VARCHAR(255) PRIMARY KEY,
        value JSONB NOT NULL
      );
    `);
    
    // Insert default values if not exists
    const res = await pool.query("SELECT key FROM site_settings WHERE key = 'package_durations'");
    if (res.rowCount === 0) {
      await pool.query(`
        INSERT INTO site_settings (key, value)
        VALUES ('package_durations', '{"temel": {"old": null, "new": 6}, "premium": {"old": null, "new": 18}, "premium+": {"old": null, "new": 24}}'::jsonb)
      `);
    }

    return NextResponse.json({ success: true, message: "site_settings table ready." });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
