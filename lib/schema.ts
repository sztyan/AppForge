import { z } from "zod";
import type { Field } from "./types";
import { validateRuntimeSchema } from "./runtime/validate-runtime-schema";

/**
 * buildZodSchema — dynamically constructs a Zod v4 schema from a Field array.
 * Uses Zod v4 API.
 */
export function buildZodSchema(fields: Field[]): z.ZodObject<z.ZodRawShape> {
  const shape: Record<string, z.ZodTypeAny> = {};

  for (const field of fields) {
    // Skip fields without a name to prevent runtime schema generation errors
    if (!field.name) continue;

    let fieldSchema: z.ZodTypeAny;

    switch (field.type) {
      case "email":
        fieldSchema = z.string().email("Please enter a valid email address");
        if (field.required) {
          fieldSchema = (fieldSchema as z.ZodString).min(
            1,
            `${field.label || field.name} is required`
          );
        } else {
          fieldSchema = z
            .string()
            .email("Please enter a valid email address")
            .optional()
            .or(z.literal(""));
        }
        break;

      case "number":
        fieldSchema = z.number();
        if (field.min !== undefined) {
          fieldSchema = (fieldSchema as z.ZodNumber).min(
            field.min,
            `Minimum value is ${field.min}`
          );
        }
        if (field.max !== undefined) {
          fieldSchema = (fieldSchema as z.ZodNumber).max(
            field.max,
            `Maximum value is ${field.max}`
          );
        }
        if (!field.required) {
          fieldSchema = fieldSchema.optional();
        }
        break;

      case "checkbox":
        if (field.required) {
          fieldSchema = z
            .boolean()
            .refine((v) => v === true, `${field.label || field.name} must be checked`);
        } else {
          fieldSchema = z.boolean().optional();
        }
        break;

      case "select":
        if (field.options && field.options.length > 0) {
          const [first, ...rest] = field.options as [string, ...string[]];
          fieldSchema = z.enum([first, ...rest]);
          if (!field.required) {
            fieldSchema = fieldSchema.optional();
          }
        } else {
          fieldSchema = field.required
            ? z.string().min(1, `${field.label || field.name} is required`)
            : z.string().optional();
        }
        break;

      default: // text, textarea, and any future string types
        if (field.required) {
          fieldSchema = z.string().min(1, `${field.label || field.name} is required`);
        } else {
          fieldSchema = z.string().optional();
        }
        break;
    }

    shape[field.name] = fieldSchema;
  }

  return z.object(shape);
}

export interface SchemaValidationResult {
  isValid: boolean;
  hasCriticalErrors: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * validateFormSchema — builder-time validation.
 * Delegates to runtime validation for a single source of truth.
 */
export function validateFormSchema(schema: unknown): SchemaValidationResult {
  const runtime = validateRuntimeSchema(schema);

  return {
    isValid:
      runtime.criticalCount === 0 &&
      runtime.errorCount === 0 &&
      runtime.warningCount === 0,
    hasCriticalErrors: runtime.criticalCount > 0,
    errors: runtime.issues
      .filter((i) => i.severity === "critical" || i.severity === "error")
      .map((i) => (i.path ? `[${i.path}] ${i.message}` : i.message)),
    warnings: runtime.issues
      .filter((i) => i.severity === "warning")
      .map((i) => (i.path ? `[${i.path}] ${i.message}` : i.message)),
  };
}


