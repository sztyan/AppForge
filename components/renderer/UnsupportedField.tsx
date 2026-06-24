"use client";

import { AlertTriangle } from "lucide-react";
import { getSuggestedFieldTypes } from "@/lib/runtime/supported-types";
import { Badge } from "@/components/ui/badge";

interface UnsupportedFieldProps {
  type: string;
  fieldName?: string;
  showSuggestions?: boolean;
}

export default function UnsupportedField({
  type,
  fieldName,
  showSuggestions = true,
}: UnsupportedFieldProps) {
  const suggestions = getSuggestedFieldTypes().slice(0, 4);

  return (
    <div
      role="alert"
      className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 space-y-2"
    >
      <div className="flex items-start gap-2">
        <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
        <div className="space-y-1 min-w-0">
          <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
            Unsupported component: <code className="font-mono text-xs">{type}</code>
          </p>
          {fieldName && (
            <p className="text-xs text-amber-700/80 dark:text-amber-300/80">
              Field &quot;{fieldName}&quot; cannot be rendered. It was excluded from validation.
            </p>
          )}
        </div>
      </div>
      {showSuggestions && (
        <div className="flex flex-wrap items-center gap-1.5 pl-6">
          <span className="text-[10px] text-muted-foreground">Supported types:</span>
          {suggestions.map((t) => (
            <Badge key={t} variant="outline" className="text-[10px] py-0">
              {t}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
