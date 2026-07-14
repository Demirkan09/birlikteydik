import DynamicUserPage from "../../[slug]/page";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default function EnDynamicUserPage({ params }: PageProps) {
  return <DynamicUserPage params={params} lang="en" />;
}
