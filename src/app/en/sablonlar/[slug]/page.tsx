import DynamicShowcasePage from "../../../sablonlar/[slug]/page";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default function EnTemplatesDetailPage({ params }: PageProps) {
  return <DynamicShowcasePage params={params} lang="en" />;
}
