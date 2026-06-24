import type { FormSchema, Field, TableDefinition, DashboardWidget } from "@/lib/types";
import { isSupportedFieldType } from "./supported-types";

export type IssueSeverity = "critical" | "error" | "warning" | "info";

export interface RuntimeIssue {
  severity: IssueSeverity;
  code: string;
  message: string;
  path?: string;
}

export interface RuntimeValidationResult {
  canRender: boolean;
  canPartialRender: boolean;
  issues: RuntimeIssue[];
  criticalCount: number;
  errorCount: number;
  warningCount: number;
}

function issue(
  severity: IssueSeverity,
  code: string,
  message: string,
  path?: string
): RuntimeIssue {
  return { severity, code, message, path };
}

function validateFields(fields: unknown[], issues: RuntimeIssue[]): Field[] {
  const valid: Field[] = [];
  const seenNames = new Set<string>();

  if (!Array.isArray(fields)) {
    issues.push(issue("critical", "FIELDS_NOT_ARRAY", "'fields' must be an array", "fields"));
    return valid;
  }

  fields.forEach((raw, index) => {
    const path = `fields[${index}]`;

    if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
      issues.push(issue("error", "FIELD_INVALID", `Invalid field object at index ${index}`, path));
      return;
    }

    const field = raw as Record<string, unknown>;
    const name = typeof field.name === "string" ? field.name.trim() : "";

    if (!name) {
      issues.push(issue("error", "FIELD_NO_NAME", `Field #${index + 1} is missing 'name'`, path));
      return;
    }

    if (seenNames.has(name)) {
      issues.push(issue("error", "FIELD_DUPLICATE", `Duplicate field name '${name}'`, path));
      return;
    }
    seenNames.add(name);

    if (!field.type || typeof field.type !== "string") {
      issues.push(issue("error", "FIELD_NO_TYPE", `Field '${name}' is missing 'type'`, path));
      return;
    }

    if (!field.label || typeof field.label !== "string") {
      issues.push(issue("warning", "FIELD_NO_LABEL", `Field '${name}' is missing 'label'`, path));
    }

    if (!isSupportedFieldType(field.type)) {
      issues.push(
        issue("warning", "FIELD_UNSUPPORTED", `Unsupported field type '${field.type}'`, path)
      );
    }

    if (field.type === "select") {
      if (!Array.isArray(field.options)) {
        issues.push(
          issue("error", "SELECT_NO_OPTIONS", `Select '${name}' requires 'options' array`, path)
        );
      } else if (field.options.length === 0) {
        issues.push(
          issue("warning", "SELECT_EMPTY_OPTIONS", `Select '${name}' has empty options`, path)
        );
      }
    }

    valid.push(field as unknown as Field);
  });

  return valid;
}

function validateTables(tables: unknown, issues: RuntimeIssue[]): TableDefinition[] {
  const valid: TableDefinition[] = [];
  if (tables === undefined) return valid;

  if (!Array.isArray(tables)) {
    issues.push(issue("error", "TABLES_NOT_ARRAY", "'tables' must be an array", "tables"));
    return valid;
  }

  const seenIds = new Set<string>();

  tables.forEach((raw, index) => {
    const path = `tables[${index}]`;
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
      issues.push(issue("error", "TABLE_INVALID", `Invalid table at index ${index}`, path));
      return;
    }

    const table = raw as Record<string, unknown>;
    const id = typeof table.id === "string" ? table.id.trim() : "";

    if (!id) {
      issues.push(issue("error", "TABLE_NO_ID", `Table #${index + 1} is missing 'id'`, path));
      return;
    }

    if (seenIds.has(id)) {
      issues.push(issue("error", "TABLE_DUPLICATE_ID", `Duplicate table id '${id}'`, path));
      return;
    }
    seenIds.add(id);

    if (!Array.isArray(table.columns) || table.columns.length === 0) {
      issues.push(issue("error", "TABLE_NO_COLUMNS", `Table '${id}' requires 'columns'`, path));
      return;
    }

    table.columns.forEach((col, colIdx) => {
      if (!col || typeof col !== "object") {
        issues.push(
          issue("error", "TABLE_COLUMN_INVALID", `Table '${id}' column ${colIdx} invalid`, `${path}.columns[${colIdx}]`)
        );
      }
    });

    valid.push(table as unknown as TableDefinition);
  });

  return valid;
}

function validateDashboard(
  dashboard: unknown,
  fieldNames: Set<string>,
  tableIds: Set<string>,
  issues: RuntimeIssue[]
): DashboardWidget[] {
  const valid: DashboardWidget[] = [];
  if (dashboard === undefined) return valid;

  if (!dashboard || typeof dashboard !== "object" || Array.isArray(dashboard)) {
    issues.push(issue("error", "DASHBOARD_INVALID", "'dashboard' must be an object", "dashboard"));
    return valid;
  }

  const dash = dashboard as Record<string, unknown>;
  if (!Array.isArray(dash.widgets)) {
    issues.push(issue("error", "DASHBOARD_NO_WIDGETS", "'dashboard.widgets' must be an array", "dashboard.widgets"));
    return valid;
  }

  dash.widgets.forEach((raw, index) => {
    const path = `dashboard.widgets[${index}]`;
    if (!raw || typeof raw !== "object") {
      issues.push(issue("error", "WIDGET_INVALID", `Widget #${index + 1} is invalid`, path));
      return;
    }

    const widget = raw as Record<string, unknown>;
    const id = typeof widget.id === "string" ? widget.id : `widget-${index}`;
    const type = widget.type;

    if (!type || !["form", "table", "stats"].includes(type as string)) {
      issues.push(issue("error", "WIDGET_BAD_TYPE", `Widget '${id}' has invalid type`, path));
      return;
    }

    if (type === "table" && typeof widget.tableId === "string" && !tableIds.has(widget.tableId)) {
      issues.push(
        issue("error", "WIDGET_TABLE_REF", `Widget '${id}' references unknown table '${widget.tableId}'`, path)
      );
    }

    if (type === "form" && Array.isArray(widget.fieldNames)) {
      widget.fieldNames.forEach((fn) => {
        if (typeof fn === "string" && !fieldNames.has(fn)) {
          issues.push(
            issue("warning", "WIDGET_FIELD_REF", `Widget '${id}' references unknown field '${fn}'`, path)
          );
        }
      });
    }

    if (type === "stats" && typeof widget.statField === "string" && !fieldNames.has(widget.statField)) {
      issues.push(
        issue("warning", "WIDGET_STAT_REF", `Widget '${id}' references unknown stat field`, path)
      );
    }

    valid.push(widget as unknown as DashboardWidget);
  });

  return valid;
}

function validateI18n(i18n: unknown, issues: RuntimeIssue[]): void {
  if (i18n === undefined) return;
  if (!i18n || typeof i18n !== "object") {
    issues.push(issue("error", "I18N_INVALID", "'i18n' must be an object", "i18n"));
    return;
  }
  const config = i18n as Record<string, unknown>;
  if (!config.defaultLocale || typeof config.defaultLocale !== "string") {
    issues.push(issue("warning", "I18N_NO_DEFAULT", "Missing i18n.defaultLocale", "i18n.defaultLocale"));
  }
  if (!config.locales || typeof config.locales !== "object") {
    issues.push(issue("error", "I18N_NO_LOCALES", "Missing i18n.locales", "i18n.locales"));
  }
}

function validateWorkflow(workflow: unknown, issues: RuntimeIssue[]): void {
  if (workflow === undefined) return;
  if (!workflow || typeof workflow !== "object") {
    issues.push(issue("error", "WORKFLOW_INVALID", "'workflow' must be an object", "workflow"));
    return;
  }
  const wf = workflow as Record<string, unknown>;
  if (wf.onSubmit !== undefined && !Array.isArray(wf.onSubmit)) {
    issues.push(issue("error", "WORKFLOW_ONSUBMIT", "'workflow.onSubmit' must be an array", "workflow.onSubmit"));
  }
}

/**
 * Comprehensive runtime schema validation.
 * Distinguishes critical failures from partial-render scenarios.
 */
export function validateRuntimeSchema(schema: unknown): RuntimeValidationResult {
  const issues: RuntimeIssue[] = [];

  if (!schema || typeof schema !== "object" || Array.isArray(schema)) {
    return {
      canRender: false,
      canPartialRender: false,
      issues: [issue("critical", "SCHEMA_INVALID", "Schema must be a valid JSON object")],
      criticalCount: 1,
      errorCount: 0,
      warningCount: 0,
    };
  }

  const schemaObj = schema as FormSchema;
  const layout = schemaObj.layout ?? "form";

  if (layout !== "form" && layout !== "dashboard") {
    issues.push(issue("error", "LAYOUT_UNSUPPORTED", `Unsupported layout '${layout}'`, "layout"));
  }

  const validFields = validateFields(schemaObj.fields ?? [], issues);
  const fieldNames = new Set(validFields.map((f) => f.name));
  const validTables = validateTables(schemaObj.tables, issues);
  const tableIds = new Set(validTables.map((t) => t.id));

  if (layout === "dashboard") {
    validateDashboard(schemaObj.dashboard, fieldNames, tableIds, issues);
    if (!schemaObj.dashboard?.widgets?.length) {
      issues.push(issue("warning", "DASHBOARD_EMPTY", "Dashboard layout has no widgets", "dashboard"));
    }
  }

  validateI18n(schemaObj.i18n, issues);
  validateWorkflow(schemaObj.workflow, issues);

  if (layout === "form" && validFields.length === 0 && !schemaObj.tables?.length) {
    issues.push(issue("warning", "FORM_EMPTY", "Form has no renderable fields", "fields"));
  }

  const criticalCount = issues.filter((i) => i.severity === "critical").length;
  const errorCount = issues.filter((i) => i.severity === "error").length;
  const warningCount = issues.filter((i) => i.severity === "warning").length;

  const canRender = criticalCount === 0;
  const hasRenderableContent =
    validFields.length > 0 ||
    validTables.length > 0 ||
    (layout === "dashboard" && (schemaObj.dashboard?.widgets?.length ?? 0) > 0);

  return {
    canRender,
    canPartialRender: canRender && hasRenderableContent,
    issues,
    criticalCount,
    errorCount,
    warningCount,
  };
}
