"use client";

import type { FormSchema } from "@/lib/types";
import FormRenderer from "./FormRenderer";
import DashboardRenderer from "./DashboardRenderer";
import TableRenderer from "./TableRenderer";

interface AppRendererProps {
  schema: FormSchema;
  mode?: "preview" | "runtime";
  appId?: string;
}

/**
 * Metadata-driven app renderer.
 * Dispatches to form, dashboard, or standalone table layouts.
 */
export default function AppRenderer({ schema, mode = "runtime", appId }: AppRendererProps) {
  const layout = schema.layout ?? "form";

  if (layout === "dashboard") {
    return <DashboardRenderer schema={schema} mode={mode} appId={appId} />;
  }

  const hasStandaloneTables = schema.tables?.length && !schema.fields?.length;

  if (hasStandaloneTables) {
    return (
      <div className="space-y-6">
        {(schema.title || schema.description) && (
          <div>
            {schema.title && <h1 className="text-xl font-semibold">{schema.title}</h1>}
            {schema.description && (
              <p className="text-sm text-muted-foreground mt-1">{schema.description}</p>
            )}
          </div>
        )}
        {schema.tables!.map((table) => (
          <TableRenderer key={table.id} table={table} mode={mode} />
        ))}
      </div>
    );
  }

  return <FormRenderer schema={schema} mode={mode} appId={appId} />;
}
