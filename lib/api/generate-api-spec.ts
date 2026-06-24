import type { FormSchema, Field, ApiEndpointSpec } from "@/lib/types";

export interface GeneratedApiSpec {
  title: string;
  version: string;
  basePath: string;
  endpoints: ApiEndpointSpec[];
}

function fieldToSchemaType(field: Field): string {
  switch (field.type) {
    case "email":
    case "textarea":
    case "text":
    case "select":
      return "string";
    case "number":
      return "number";
    case "checkbox":
      return "boolean";
    default:
      return "string";
  }
}

/**
 * Generates API documentation from application schema metadata.
 */
export function generateApiSpec(schema: FormSchema, appId: string): GeneratedApiSpec {
  const fields = schema.fields ?? [];
  const requestSchema: Record<string, string> = {};
  fields.forEach((f) => {
    if (f.name) requestSchema[f.name] = fieldToSchemaType(f);
  });

  const basePath = schema.api?.basePath ?? `/api/apps/${appId}`;
  const version = schema.api?.version ?? schema.version ?? "1.0.0";

  const autoEndpoints: ApiEndpointSpec[] = [
    {
      method: "GET",
      path: basePath,
      description: "Retrieve application metadata and schema summary",
      responseSchema: {
        id: "string",
        name: "string",
        layout: "string",
        fieldCount: "number",
        tableCount: "number",
      },
    },
    {
      method: "POST",
      path: `${basePath}/submit`,
      description: "Submit form data. Triggers configured workflow automation.",
      requestSchema,
      responseSchema: {
        success: "boolean",
        data: "object",
        workflow: "object",
      },
    },
  ];

  if (schema.tables?.length) {
    schema.tables.forEach((table) => {
      autoEndpoints.push({
        method: "GET",
        path: `${basePath}/tables/${table.id}`,
        description: `Retrieve data for table '${table.title ?? table.id}'`,
        responseSchema: {
          id: "string",
          columns: "array",
          data: "array",
        },
      });
    });
  }

  const custom = schema.api?.endpoints ?? [];

  return {
    title: schema.title ?? "Generated API",
    version,
    basePath,
    endpoints: [...autoEndpoints, ...custom],
  };
}
