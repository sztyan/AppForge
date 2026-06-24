import type { FormSchema, Field, TableDefinition, DashboardWidget } from "@/lib/types";
import { isSupportedFieldType } from "./supported-types";
import type { RuntimeIssue } from "./validate-runtime-schema";

export interface NormalizedSchema {
  schema: FormSchema;
  skippedFields: RuntimeIssue[];
  skippedWidgets: RuntimeIssue[];
  skippedTables: RuntimeIssue[];
}

/**
 * Produces a safe-to-render schema by filtering broken entries.
 * Enables graceful degradation under invalid configuration.
 */
export function normalizeSchemaForRuntime(raw: FormSchema): NormalizedSchema {
  const skippedFields: RuntimeIssue[] = [];
  const skippedWidgets: RuntimeIssue[] = [];
  const skippedTables: RuntimeIssue[] = [];

  const fields: Field[] = (raw.fields ?? []).filter((field, index) => {
    if (!field?.name?.trim() || !field?.type?.trim()) {
      skippedFields.push({
        severity: "error",
        code: "FIELD_SKIPPED",
        message: `Skipped field at index ${index}: missing name or type`,
        path: `fields[${index}]`,
      });
      return false;
    }
    return true;
  });

  const tables: TableDefinition[] = (raw.tables ?? []).filter((table, index) => {
    if (!table?.id?.trim() || !Array.isArray(table.columns) || table.columns.length === 0) {
      skippedTables.push({
        severity: "error",
        code: "TABLE_SKIPPED",
        message: `Skipped table at index ${index}: missing id or columns`,
        path: `tables[${index}]`,
      });
      return false;
    }
    return true;
  });

  const tableIds = new Set(tables.map((t) => t.id));
  const fieldNames = new Set(fields.map((f) => f.name));

  let widgets: DashboardWidget[] = raw.dashboard?.widgets ?? [];

  if (raw.layout === "dashboard") {
    widgets = widgets.filter((widget) => {
      if (!widget?.id || !widget?.type) {
        skippedWidgets.push({
          severity: "error",
          code: "WIDGET_SKIPPED",
          message: "Skipped widget: missing id or type",
        });
        return false;
      }
      if (widget.type === "table" && widget.tableId && !tableIds.has(widget.tableId)) {
        skippedWidgets.push({
          severity: "error",
          code: "WIDGET_TABLE_MISSING",
          message: `Widget '${widget.id}' references missing table '${widget.tableId}'`,
          path: `dashboard.widgets.${widget.id}`,
        });
        return false;
      }
      if (widget.type === "form" && widget.fieldNames?.length) {
        const missing = widget.fieldNames.filter((n) => !fieldNames.has(n));
        if (missing.length === widget.fieldNames.length) {
          skippedWidgets.push({
            severity: "error",
            code: "WIDGET_FIELDS_MISSING",
            message: `Widget '${widget.id}' references no valid fields`,
            path: `dashboard.widgets.${widget.id}`,
          });
          return false;
        }
      }
      return true;
    });
  }

  const schema: FormSchema = {
    ...raw,
    fields,
    tables,
    dashboard: raw.dashboard ? { ...raw.dashboard, widgets } : undefined,
  };

  return { schema, skippedFields, skippedWidgets, skippedTables };
}

export function getRenderableFields(fields: Field[]): Field[] {
  return fields.filter((f) => isSupportedFieldType(f.type));
}

export function getUnsupportedFields(fields: Field[]): Field[] {
  return fields.filter((f) => !isSupportedFieldType(f.type));
}
