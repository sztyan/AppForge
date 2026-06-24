// ─────────────────────────────────────────────────────────────
// Centralized type definitions for the AI App Generator
// ─────────────────────────────────────────────────────────────

/** All supported field types in the component registry */
export type FieldType =
  | "text"
  | "email"
  | "number"
  | "textarea"
  | "select"
  | "checkbox"
  | string;

/** A single field definition inside a FormSchema */
export interface Field {
  name: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  required?: boolean;
  options?: string[];
  min?: number;
  max?: number;
  helpText?: string;
}

export type LayoutType = "form" | "dashboard";

export interface TableColumn {
  key: string;
  label: string;
  type?: "text" | "number" | "date" | "badge";
}

export interface TableDefinition {
  id: string;
  title?: string;
  columns: TableColumn[];
  data?: Record<string, unknown>[];
  csvImport?: boolean;
}

export type DashboardWidgetType = "form" | "table" | "stats";

export interface DashboardWidget {
  id: string;
  type: DashboardWidgetType;
  title?: string;
  span?: 1 | 2 | 3;
  fieldNames?: string[];
  tableId?: string;
  statField?: string;
  statLabel?: string;
}

export interface DashboardConfig {
  columns?: 1 | 2 | 3;
  widgets: DashboardWidget[];
}

export type WorkflowStepType = "notify" | "webhook" | "log" | "redirect" | "store";

export interface WorkflowStep {
  id: string;
  type: WorkflowStepType;
  enabled?: boolean;
  config?: {
    message?: string;
    url?: string;
    redirectTo?: string;
    storageKey?: string;
  };
}

export interface WorkflowConfig {
  onSubmit?: WorkflowStep[];
}

export interface LocaleFieldStrings {
  label?: string;
  placeholder?: string;
  helpText?: string;
}

export interface LocaleTableStrings {
  title?: string;
  columns?: Record<string, string>;
}

export interface LocaleBundle {
  title?: string;
  description?: string;
  fields?: Record<string, LocaleFieldStrings>;
  tables?: Record<string, LocaleTableStrings>;
}

export interface I18nConfig {
  defaultLocale: string;
  locales: Record<string, LocaleBundle>;
}

export interface ApiEndpointSpec {
  method: "GET" | "POST" | "PUT" | "DELETE";
  path: string;
  description?: string;
  requestSchema?: Record<string, string>;
  responseSchema?: Record<string, string>;
}

export interface ApiConfig {
  basePath?: string;
  version?: string;
  endpoints?: ApiEndpointSpec[];
}

/**
 * Metadata-driven application schema.
 * Drives UI layout, tables, workflows, i18n, and generated APIs.
 */
export interface FormSchema {
  title?: string;
  description?: string;
  version?: string;
  layout?: LayoutType;
  fields?: Field[];
  tables?: TableDefinition[];
  dashboard?: DashboardConfig;
  workflow?: WorkflowConfig;
  i18n?: I18nConfig;
  api?: ApiConfig;
}

/** Props passed to every field component from FormRenderer */
export interface FieldProps {
  field: Field;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  register: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  errors: any;
}

export interface TableRendererProps {
  table: TableDefinition;
  locale?: string;
  mode?: "preview" | "runtime";
  onDataChange?: (data: Record<string, unknown>[]) => void;
}
