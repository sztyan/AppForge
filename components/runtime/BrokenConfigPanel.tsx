"use client";

import { AlertCircle, AlertTriangle, Info } from "lucide-react";
import type { RuntimeIssue } from "@/lib/runtime/validate-runtime-schema";
import { cn } from "@/lib/utils";

interface BrokenConfigPanelProps {
  issues: RuntimeIssue[];
  skippedCount?: number;
  mode?: "preview" | "runtime";
}

const SEVERITY_CONFIG = {
  critical: { icon: AlertCircle, className: "border-destructive/30 bg-destructive/5 text-destructive" },
  error: { icon: AlertCircle, className: "border-destructive/30 bg-destructive/5 text-destructive" },
  warning: { icon: AlertTriangle, className: "border-amber-500/30 bg-amber-500/5 text-amber-700 dark:text-amber-300" },
  info: { icon: Info, className: "border-blue-500/30 bg-blue-500/5 text-blue-700 dark:text-blue-300" },
} as const;

export default function BrokenConfigPanel({
  issues,
  skippedCount = 0,
  mode = "runtime",
}: BrokenConfigPanelProps) {
  const visible = issues.filter((i) => i.severity !== "info");
  if (visible.length === 0 && skippedCount === 0) return null;

  const errors = visible.filter((i) => i.severity === "critical" || i.severity === "error");
  const warnings = visible.filter((i) => i.severity === "warning");

  return (
    <div className="space-y-3 mb-6">
      {(errors.length > 0 || skippedCount > 0) && (
        <div className={cn("rounded-xl border p-4", SEVERITY_CONFIG.error.className)}>
          <div className="flex items-center gap-2 font-semibold text-sm mb-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            Configuration issues ({errors.length + skippedCount})
          </div>
          <p className="text-xs opacity-80 mb-3">
            {mode === "runtime"
              ? "The app is running in degraded mode. Invalid parts were skipped."
              : "Some configuration is broken. Preview shows what can still render."}
          </p>
          <ul className="space-y-1.5 text-xs font-mono max-h-40 overflow-auto">
            {errors.map((issue, idx) => (
              <li key={`${issue.code}-${idx}`} className="flex gap-2">
                <span className="opacity-60">•</span>
                <span>
                  {issue.path ? `[${issue.path}] ` : ""}
                  {issue.message}
                </span>
              </li>
            ))}
            {skippedCount > 0 && (
              <li className="flex gap-2">
                <span className="opacity-60">•</span>
                <span>{skippedCount} component(s) skipped during normalization</span>
              </li>
            )}
          </ul>
        </div>
      )}

      {warnings.length > 0 && (
        <div className={cn("rounded-xl border p-4", SEVERITY_CONFIG.warning.className)}>
          <div className="flex items-center gap-2 font-semibold text-sm mb-2">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            Warnings ({warnings.length})
          </div>
          <ul className="space-y-1 text-xs font-mono max-h-32 overflow-auto">
            {warnings.map((issue, idx) => (
              <li key={`${issue.code}-${idx}`}>
                {issue.path ? `[${issue.path}] ` : ""}
                {issue.message}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
