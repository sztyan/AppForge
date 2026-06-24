import ApiDocsPage from "@/components/api/ApiDocsPage";

interface PageProps {
  params: Promise<{ appId: string }>;
}

export default async function Page({ params }: PageProps) {
  const { appId } = await params;
  return <ApiDocsPage appId={appId} />;
}
