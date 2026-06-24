"use client";

import { useMemo } from "react";
import type { FormSchema, DashboardWidget } from "@/lib/types";
import FormRenderer from "./FormRenderer";
import TableRenderer from "./TableRenderer";
import { AlertCircle } from "lucide-react";

interface DashboardRendererProps {
  schema: FormSchema;
  mode?: "preview" | "runtime";
  appId?: string;
}

function WidgetFallback({ widget, message }: { widget: DashboardWidget; message: string }) {
  return (
    <div className="rounded-xl border border-dashed border-destructive/30 bg-destructive/5 p-6 flex flex-col items-center gap-2 text-center">
      <AlertCircle className="h-5 w-5 text-destructive" />
      <p className="text-sm font-medium">{widget.title ?? widget.id}</p>
      <p className="text-xs text-muted-foreground">{message}</p>
    </div>
  );
}

export default function DashboardRenderer({ schema, mode = "runtime", appId }: DashboardRendererProps) {
  const columns = schema.dashboard?.columns ?? 2;
  const widgets = schema.dashboard?.widgets ?? [];
  const fields = schema.fields ?? [];
  const tables = schema.tables ?? [];

  const gridClass = useMemo(() => {
    switch (columns) {
      case 1:
        return "grid-cols-1";
      case 3:
        return "grid-cols-1 md:grid-cols-3";
      default:
        return "grid-cols-1 md:grid-cols-2";
    }
  }, [columns]);

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

      <div className={`grid gap-4 ${gridClass}`}>
        {widgets.map((widget) => {
          const spanClass =
            widget.span === 3
              ? "md:col-span-3"
              : widget.span === 2
                ? "md:col-span-2"
                : "";

          if (widget.type === "form") {
            const widgetFields = widget.fieldNames?.length
              ? fields.filter((f) => widget.fieldNames!.includes(f.name))
              : fields;

            if (widgetFields.length === 0) {
              return (
                <div key={widget.id} className={spanClass}>
                  <WidgetFallback widget={widget} message="No valid fields for this widget." />
                </div>
              );
            }

            return (
              <div key={widget.id} className={spanClass}>
                <FormRenderer
                  schema={{
                    title: widget.title,
                    fields: widgetFields,
                    workflow: schema.workflow,
                  }}
                  mode={mode}
                  appId={appId}
                  compact
                />
              </div>
            );
          }

          if (widget.type === "table") {
            const table = tables.find((t) => t.id === widget.tableId);
            if (!table) {
              return (
                <div key={widget.id} className={spanClass}>
                  <WidgetFallback
                    widget={widget}
                    message={`Table '${widget.tableId}' not found or invalid.`}
                  />
                </div>
              );
            }
            return (
              <div key={widget.id} className={spanClass}>
                <TableRenderer table={{ ...table, title: widget.title ?? table.title }} mode={mode} />
              </div>
            );
          }

          if (widget.type === "stats") {
            const statValue = widget.statField
              ? fields.find((f) => f.name === widget.statField)?.label ?? "—"
              : fields.length;
            return (
              <div key={widget.id} className={spanClass}>
                <div className="rounded-xl border border-border bg-card p-6">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">
                    {widget.statLabel ?? widget.title ?? "Stat"}
                  </p>
                  <p className="text-3xl font-semibold mt-2">{statValue}</p>
                </div>
              </div>
            );
          }

          return (
            <div key={widget.id} className={spanClass}>
              <WidgetFallback widget={widget} message={`Unknown widget type '${widget.type}'.`} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
