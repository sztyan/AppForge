"use client";

import { useMemo } from "react";
import type { FormSchema } from "@/lib/types";
import { validateRuntimeSchema } from "@/lib/runtime/validate-runtime-schema";
import { normalizeSchemaForRuntime } from "@/lib/runtime/normalize-schema";
import { resolveSchemaLocale } from "@/lib/i18n/resolve-schema";
import AppRenderer from "@/components/renderer/AppRenderer";
import BrokenConfigPanel from "./BrokenConfigPanel";
import { FormErrorBoundary } from "@/components/renderer/FormErrorBoundary";

interface RuntimeRendererProps {
  schema: FormSchema;
  appId: string;
  locale?: string;
  mode?: "preview" | "runtime";
}

export default function RuntimeRenderer({
  schema: rawSchema,
  appId,
  locale,
  mode = "runtime",
}: RuntimeRendererProps) {
  const validation = useMemo(() => validateRuntimeSchema(rawSchema), [rawSchema]);

  const { schema: normalized, skippedFields, skippedWidgets, skippedTables } = useMemo(
    () => normalizeSchemaForRuntime(rawSchema),
    [rawSchema]
  );

  const resolvedSchema = useMemo(
    () => (locale ? resolveSchemaLocale(normalized, locale) : normalized),
    [normalized, locale]
  );

  const skippedCount =
    skippedFields.length + skippedWidgets.length + skippedTables.length;

  const showIssues =
    validation.issues.filter((i) => i.severity !== "info").length > 0 || skippedCount > 0;

  return (
    <FormErrorBoundary>
      <div className="w-full max-w-5xl mx-auto px-4 py-6 md:py-10">
        {showIssues && (
          <BrokenConfigPanel
            issues={validation.issues}
            skippedCount={skippedCount}
            mode={mode}
          />
        )}
        <AppRenderer schema={resolvedSchema} mode={mode} appId={appId} />
      </div>
    </FormErrorBoundary>
  );
}

export { getAvailableLocales, getDefaultLocale } from "@/lib/i18n/resolve-schema";
