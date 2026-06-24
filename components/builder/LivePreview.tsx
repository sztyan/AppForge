"use client";

import { useMemo } from "react";
import type { FormSchema } from "@/lib/types";
import { AlertCircle } from "lucide-react";
import { validateRuntimeSchema } from "@/lib/runtime/validate-runtime-schema";
import RuntimeRenderer from "@/components/runtime/RuntimeRenderer";
import BrokenConfigPanel from "@/components/runtime/BrokenConfigPanel";

interface LivePreviewProps {
  json: string;
}

export default function LivePreview({ json }: LivePreviewProps) {
  const { schema, error } = useMemo<{
    schema: FormSchema | null;
    error: string | null;
  }>(() => {
    try {
      return { schema: JSON.parse(json) as FormSchema, error: null };
    } catch (e) {
      return {
        schema: null,
        error: e instanceof Error ? e.message : "Invalid JSON",
      };
    }
  }, [json]);

  const validation = useMemo(() => {
    if (!schema) return null;
    return validateRuntimeSchema(schema);
  }, [schema]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-destructive/30 bg-destructive/10 p-8 text-center">
        <AlertCircle className="h-6 w-6 text-destructive" />
        <div>
          <p className="text-sm font-semibold text-foreground">Invalid JSON</p>
          <p className="mt-1 text-xs text-muted-foreground font-mono max-w-xs break-words">{error}</p>
        </div>
      </div>
    );
  }

  if (!schema || !validation) return null;

  if (!validation.canRender) {
    return (
      <BrokenConfigPanel issues={validation.issues} mode="preview" />
    );
  }

  return (
    <RuntimeRenderer schema={schema} appId="preview" mode="preview" />
  );
}
