import { componentRegistry } from "@/components/renderer/componentRegistry";

/** Field types with registered React components */
export const SUPPORTED_FIELD_TYPES = Object.keys(componentRegistry);

/** Layout modes the runtime can render */
export const SUPPORTED_LAYOUTS = ["form", "dashboard"] as const;

/** Dashboard widget types */
export const SUPPORTED_WIDGET_TYPES = ["form", "table", "stats"] as const;

export function isSupportedFieldType(type: string): boolean {
  return type in componentRegistry;
}

export function getSuggestedFieldTypes(): string[] {
  return [...SUPPORTED_FIELD_TYPES];
}
