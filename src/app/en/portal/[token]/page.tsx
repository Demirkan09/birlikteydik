import PortalPage from "../../../portal/[token]/page";

export default function EnPortalPage({ params }: { params: Promise<{ token: string }> }) {
  return <PortalPage params={params} lang="en" />;
}
