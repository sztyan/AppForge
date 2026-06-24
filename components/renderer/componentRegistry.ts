/**
 * Component Registry — maps FieldType strings to their React components.
 *
 * To add a new field type:
 *   1. Create a component in components/renderer/fields/
 *   2. Add an entry here
 *   3. The renderer will pick it up automatically — no other changes needed.
 */

import { type FieldProps } from "@/lib/types";
import type { ComponentType } from "react";

import TextField from "./fields/TextField";
import EmailField from "./fields/EmailField";
import NumberField from "./fields/NumberField";
import TextAreaField from "./fields/TextAreaField";
import SelectField from "./fields/SelectField";
import CheckboxField from "./fields/CheckboxField";

export const componentRegistry: Record<string, ComponentType<FieldProps>> = {
  text: TextField,
  email: EmailField,
  number: NumberField,
  textarea: TextAreaField,
  select: SelectField,
  checkbox: CheckboxField,
};

/** Returns the component for a given type, or null if unsupported */
export function getFieldComponent(
  type: string
): ComponentType<FieldProps> | null {
  return componentRegistry[type] ?? null;
}
