import type { FormSchema, Field, TableDefinition } from "@/lib/types";

/**
 * Resolves schema strings for the active locale.
 * Falls back to default schema values when translations are missing.
 */
export function resolveSchemaLocale(schema: FormSchema, locale: string): FormSchema {
  const i18n = schema.i18n;
  if (!i18n?.locales) return schema;

  const bundle =
    i18n.locales[locale] ?? i18n.locales[i18n.defaultLocale] ?? null;
  if (!bundle) return schema;

  const resolvedFields: Field[] | undefined = schema.fields?.map((field) => {
    const translated = bundle.fields?.[field.name];
    if (!translated) return field;
    return {
      ...field,
      label: translated.label ?? field.label,
      placeholder: translated.placeholder ?? field.placeholder,
      helpText: translated.helpText ?? field.helpText,
    };
  });

  const resolvedTables: TableDefinition[] | undefined = schema.tables?.map((table) => {
    const translated = bundle.tables?.[table.id];
    if (!translated) return table;
    return {
      ...table,
      title: translated.title ?? table.title,
      columns: table.columns.map((col) => ({
        ...col,
        label: translated.columns?.[col.key] ?? col.label,
      })),
    };
  });

  return {
    ...schema,
    title: bundle.title ?? schema.title,
    description: bundle.description ?? schema.description,
    fields: resolvedFields,
    tables: resolvedTables,
  };
}

export function getAvailableLocales(schema: FormSchema): string[] {
  if (!schema.i18n?.locales) return [];
  return Object.keys(schema.i18n.locales);
}

export function getDefaultLocale(schema: FormSchema): string {
  return schema.i18n?.defaultLocale ?? "en";
}
