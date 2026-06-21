export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import pool from "@/lib/db";
import PasswordGate from "@/components/PasswordGate";

// Import all templates
import DarkRoseTemplate from "@/app/sablonlar/sablon-retro/page";
import MinimalTemplate from "@/app/sablonlar/sablon-minimal/page";
import CinematicTemplate from "@/app/sablonlar/sablon-sinematik/page";
import EmeraldTemplate from "@/app/sablonlar/sablon-emerald/page";
import RomanticRedTemplate from "@/app/sablonlar/sablon-kirmizi/page";
import GameTemplate from "@/app/sablonlar/sablon-oyun/page";
import LavantaTemplate from "@/app/sablonlar/sablon-lavanta/page";
import AmberTemplate from "@/app/sablonlar/sablon-amber/page";
import DustyRoseTemplate from "@/app/sablonlar/sablon-rose/page";
import MidnightVelvetTemplate from "@/app/sablonlar/sablon-indigo/page";

const TEMPLATE_MAP: Record<string, React.ComponentType<any>> = {
  "klasik-retro": DarkRoseTemplate,
  "modern-minimal": MinimalTemplate,
  "sinematik-ask": CinematicTemplate,
  "premium-emerald": EmeraldTemplate,
  "romantik-kirmizi": RomanticRedTemplate,
  "sablon-oyun": GameTemplate,
  "sablon-lavanta": LavantaTemplate,
  "sablon-amber": AmberTemplate,
  "sablon-rose": DustyRoseTemplate,
  "sablon-indigo": MidnightVelvetTemplate,
};

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function DynamicUserPage({ params }: PageProps) {
  const { slug } = await params;
  const cleanSlug = slug.toLowerCase().trim();

  // 1. Fetch page settings from PostgreSQL
  const settingsRes = await pool.query(
    "SELECT template_id, config, memories, is_published FROM page_settings WHERE page_slug = $1",
    [cleanSlug]
  );

  if ((settingsRes.rowCount ?? 0) === 0) {
    return notFound();
  }

  const pageSetting = settingsRes.rows[0];

  // If page is not published yet, show 404 (or we could show a draft warning)
  if (!pageSetting.is_published) {
    return notFound();
  }

  const TemplateComponent = TEMPLATE_MAP[pageSetting.template_id];
  if (!TemplateComponent) {
    return notFound();
  }

  return (
    <PasswordGate slug={cleanSlug}>
      <TemplateComponent
        config={pageSetting.config}
        memories={pageSetting.memories}
      />
    </PasswordGate>
  );
}
