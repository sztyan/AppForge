"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, ArrowLeft } from "lucide-react";
import { getApplicationStore } from "@/lib/applications";
import { generateApiSpec } from "@/lib/api/generate-api-spec";
import type { GeneratedApiSpec } from "@/lib/api/generate-api-spec";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface ApiDocsPageProps {
  appId: string;
}

export default function ApiDocsPage({ appId }: ApiDocsPageProps) {
  const [spec, setSpec] = useState<GeneratedApiSpec | null>(null);
  const [appName, setAppName] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const app = await getApplicationStore().getById(appId);
      if (app) {
        setSpec(generateApiSpec(app.schema, appId));
        setAppName(app.name);
      }
      setLoading(false);
    }
    void load();
  }, [appId]);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!spec) {
    return (
      <div className="text-center py-20 text-muted-foreground">
        Application not found.
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Button variant="ghost" size="sm" asChild className="mb-6 gap-1.5">
        <Link href={`/app/${appId}`}>
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to app
        </Link>
      </Button>

      <div className="space-y-2 mb-8">
        <p className="text-xs text-muted-foreground uppercase tracking-wider">Generated API</p>
        <h1 className="text-2xl font-semibold">{spec.title}</h1>
        <p className="text-sm text-muted-foreground">
          Auto-generated from schema metadata for <strong>{appName}</strong>
        </p>
        <div className="flex gap-2 pt-1">
          <Badge variant="secondary">v{spec.version}</Badge>
          <Badge variant="outline" className="font-mono text-xs">{spec.basePath}</Badge>
        </div>
      </div>

      <div className="space-y-4">
        {spec.endpoints.map((endpoint, idx) => (
          <div
            key={`${endpoint.method}-${endpoint.path}-${idx}`}
            className="rounded-xl border border-border bg-card overflow-hidden"
          >
            <div className="flex items-center gap-3 border-b border-border px-4 py-3 bg-muted/30">
              <Badge
                variant={endpoint.method === "GET" ? "secondary" : "default"}
                className="font-mono text-xs"
              >
                {endpoint.method}
              </Badge>
              <code className="text-sm font-mono">{endpoint.path}</code>
            </div>
            <div className="p-4 space-y-3">
              {endpoint.description && (
                <p className="text-sm text-muted-foreground">{endpoint.description}</p>
              )}
              {endpoint.requestSchema && (
                <div>
                  <p className="text-xs font-semibold mb-1.5">Request Body</p>
                  <pre className="text-xs font-mono bg-muted/50 rounded-lg p-3 overflow-auto">
                    {JSON.stringify(endpoint.requestSchema, null, 2)}
                  </pre>
                </div>
              )}
              {endpoint.responseSchema && (
                <div>
                  <p className="text-xs font-semibold mb-1.5">Response</p>
                  <pre className="text-xs font-mono bg-muted/50 rounded-lg p-3 overflow-auto">
                    {JSON.stringify(endpoint.responseSchema, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <p className="text-xs text-muted-foreground mt-8 text-center">
        Endpoints are generated dynamically from your application schema.
      </p>
    </div>
  );
}
