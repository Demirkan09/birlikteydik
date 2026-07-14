export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import pool from "@/lib/db";
import PasswordGate from "@/components/PasswordGate";
import BosTemplate from "@/app/sablonlar/sablon-bos/page";

interface PageProps {
  params: Promise<{ slug: string }>;
  lang?: string;
}

export default async function DynamicShowcasePage({ params, lang }: PageProps) {
  const { slug } = await params;
  const cleanSlug = slug.toLowerCase().trim();

  // Fetch page settings from PostgreSQL
  const settingsRes = await pool.query(
    "SELECT template_id, config, memories, is_published FROM page_settings WHERE page_slug = $1",
    [cleanSlug]
  );

  if ((settingsRes.rowCount ?? 0) === 0) {
    return notFound();
  }

  const pageSetting = settingsRes.rows[0];

  // Showcase pages must be published
  if (!pageSetting.is_published) {
    return notFound();
  }

  const activeLang = lang || pageSetting.config?.lang || "tr";

  return (
    <PasswordGate slug={cleanSlug}>
      <BosTemplate
        config={{ ...(pageSetting.config || {}), lang: activeLang }}
        memories={pageSetting.memories}
        pageSlug={cleanSlug}
      />
    </PasswordGate>
  );
}
