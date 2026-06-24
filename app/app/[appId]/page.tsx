import RuntimeApp from "@/components/runtime/RuntimeApp";

interface RuntimePageProps {
  params: Promise<{ appId: string }>;
}

export default async function RuntimePage({ params }: RuntimePageProps) {
  const { appId } = await params;
  return <RuntimeApp appId={appId} />;
}
