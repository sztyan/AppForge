"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import BuilderWorkspace from "@/components/builder/BuilderWorkspace";
import { getApplicationStore } from "@/lib/applications";

export default function EditBuilderPage() {
  const params = useParams();
  const router = useRouter();
  const appId = params.appId as string;
  const [initialJson, setInitialJson] = useState<string | null>(null);
  const [initialName, setInitialName] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const app = await getApplicationStore().getById(appId);
      if (!app) {
        router.replace("/applications");
        return;
      }
      setInitialJson(JSON.stringify(app.schema, null, 2));
      setInitialName(app.name);
      setLoading(false);
    }
    void load();
  }, [appId, router]);

  if (loading || !initialJson) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Loading builder…</p>
      </div>
    );
  }

  return (
    <BuilderWorkspace
      appId={appId}
      initialJson={initialJson}
      initialName={initialName}
    />
  );
}
