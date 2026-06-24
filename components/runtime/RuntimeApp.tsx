"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, AlertCircle } from "lucide-react";
import type { FormSchema } from "@/lib/types";
import { validateRuntimeSchema } from "@/lib/runtime/validate-runtime-schema";
import { getApplicationStore } from "@/lib/applications";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import RuntimeRenderer, {
  getAvailableLocales,
  getDefaultLocale,
} from "./RuntimeRenderer";
import RuntimeHeader from "./RuntimeHeader";

interface RuntimeAppProps {
  appId: string;
}

export default function RuntimeApp({ appId }: RuntimeAppProps) {
  const router = useRouter();
  const [schema, setSchema] = useState<FormSchema | null>(null);
  const [appName, setAppName] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [errorDetails, setErrorDetails] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [locale, setLocale] = useState("en");

  useEffect(() => {
    async function load() {
      try {
        const app = await getApplicationStore().getById(appId);
        if (!app) {
          setError("Application not found");
          return;
        }

        const validation = validateRuntimeSchema(app.schema);

        if (!validation.canRender) {
          setError("This application schema is critically invalid and cannot be rendered.");
          setErrorDetails(validation.issues.map((i) => i.message));
          return;
        }

        if (!validation.canPartialRender) {
          setError("No renderable content found in this application schema.");
          setErrorDetails(validation.issues.map((i) => i.message));
          return;
        }

        setSchema(app.schema);
        setAppName(app.name);
        setLocale(getDefaultLocale(app.schema));
      } catch {
        setError("Failed to load application");
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, [appId]);

  const locales = schema ? getAvailableLocales(schema) : [];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Loading application…</p>
      </div>
    );
  }

  if (error || !schema) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 min-h-[50vh] px-4">
        <div className="flex flex-col items-center gap-3 rounded-xl border border-destructive/30 bg-destructive/10 p-8 text-center max-w-lg">
          <AlertCircle className="h-8 w-8 text-destructive" />
          <div>
            <p className="font-semibold text-foreground">Unable to load app</p>
            <p className="mt-1 text-sm text-muted-foreground">{error}</p>
          </div>
          {errorDetails.length > 0 && (
            <ul className="text-left text-xs font-mono text-destructive/80 max-h-32 overflow-auto w-full mt-2 space-y-1">
              {errorDetails.map((msg, i) => (
                <li key={i}>• {msg}</li>
              ))}
            </ul>
          )}
          <div className="flex gap-2 mt-2">
            <Button variant="outline" size="sm" onClick={() => router.push("/applications")}>
              View Applications
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href={`/builder/${appId}`}>Fix in Builder</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <RuntimeHeader
        appId={appId}
        appName={appName}
        locales={locales}
        currentLocale={locale}
        onLocaleChange={setLocale}
      />
      <main className="flex-1">
        <RuntimeRenderer schema={schema} appId={appId} locale={locale} mode="runtime" />
      </main>
    </div>
  );
}
