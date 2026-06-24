"use client";

import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Loader2, Send, AlertCircle } from "lucide-react";
import { toast } from "sonner";

import type { FormSchema } from "@/lib/types";
import { buildZodSchema } from "@/lib/schema";
import { getFieldComponent } from "./componentRegistry";
import UnsupportedField from "./UnsupportedField";
import { FormErrorBoundary } from "./FormErrorBoundary";
import { cn } from "@/lib/utils";
import { getRenderableFields, getUnsupportedFields } from "@/lib/runtime/normalize-schema";
import { executeWorkflow } from "@/lib/workflow/executor";
import { isSupportedFieldType } from "@/lib/runtime/supported-types";

interface FormRendererProps {
  schema: FormSchema;
  mode?: "preview" | "runtime";
  appId?: string;
  compact?: boolean;
}

type FormState = "idle" | "submitting" | "success";

function FormRendererInner({ schema, mode = "preview", appId, compact }: FormRendererProps) {
  const [formState, setFormState] = useState<FormState>("idle");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const allFields = useMemo(() => schema.fields ?? [], [schema.fields]);
  const renderableFields = useMemo(() => getRenderableFields(allFields), [allFields]);
  const unsupportedFields = useMemo(() => getUnsupportedFields(allFields), [allFields]);

  const zodSchema = useMemo(() => buildZodSchema(renderableFields), [renderableFields]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(zodSchema),
    mode: "onBlur",
  });

  const onSubmit = async (data: Record<string, unknown>) => {
    setFormState("submitting");
    setSubmitError(null);
    try {
      if (mode === "preview") {
        await new Promise((resolve, reject) => {
          setTimeout(() => {
            const hasErrorTrigger = Object.values(data).some(
              (val) => typeof val === "string" && val.toLowerCase().includes("trigger-error")
            );
            if (hasErrorTrigger) {
              reject(new Error("API Error: Simulated database insertion failure. Please retry."));
            } else {
              resolve(true);
            }
          }, 1200);
        });
      } else if (appId) {
        const res = await fetch(`/api/apps/${appId}/submit`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        if (!res.ok) {
          const body = (await res.json()) as { error?: string };
          throw new Error(body.error ?? "Submission failed");
        }
        const body = (await res.json()) as { workflow?: { redirectTo?: string } };
        if (body.workflow?.redirectTo) {
          window.location.href = body.workflow.redirectTo;
          return;
        }
      } else {
        const workflowResult = await executeWorkflow(schema.workflow, {
          appId,
          formData: data,
          schemaTitle: schema.title,
        });
        workflowResult.results
          .filter((r) => r.type === "notify" && r.message)
          .forEach((r) => toast.info("Workflow", { description: r.message }));
        if (!workflowResult.success) {
          throw new Error("One or more workflow steps failed");
        }
        if (workflowResult.redirectTo) {
          window.location.href = workflowResult.redirectTo;
          return;
        }
      }

      setFormState("success");
      toast.success("Form submitted successfully!", {
        description: "Your responses were recorded.",
      });
    } catch (err) {
      setFormState("idle");
      const msg = err instanceof Error ? err.message : "Submission failed.";
      setSubmitError(msg);
      toast.error("Form submission failed", { description: msg });
    }
  };

  if (formState === "success") {
    return (
      <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-10 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/20">
          <CheckCircle2 className="h-6 w-6 text-emerald-500" />
        </div>
        <div className="space-y-1">
          <p className="font-semibold text-foreground">Submitted successfully!</p>
          <p className="text-sm text-muted-foreground">Your response has been recorded.</p>
        </div>
        <button
          onClick={() => {
            reset();
            setFormState("idle");
          }}
          className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 transition-colors"
        >
          Submit another response
        </button>
      </div>
    );
  }

  if (allFields.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border p-10 text-center">
        <p className="font-medium text-foreground">No fields configured</p>
        <p className="text-sm text-muted-foreground max-w-xs">
          Add fields to the schema to render a form.
        </p>
      </div>
    );
  }

  return (
    <div className={cn("w-full", compact ? "" : "max-w-lg mx-auto")}>
      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        {!compact && (schema.title || schema.description) && (
          <div className="border-b border-border px-6 py-5">
            {schema.title && (
              <h1 className="text-lg font-semibold text-card-foreground">{schema.title}</h1>
            )}
            {schema.description && (
              <p className="mt-1 text-sm text-muted-foreground">{schema.description}</p>
            )}
          </div>
        )}

        {compact && schema.title && (
          <div className="border-b border-border px-4 py-3">
            <h3 className="text-sm font-semibold">{schema.title}</h3>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5 p-6">
          {allFields.map((field) => {
            if (!isSupportedFieldType(field.type)) {
              return (
                <UnsupportedField
                  key={field.name}
                  type={field.type}
                  fieldName={field.name}
                  showSuggestions={mode === "preview"}
                />
              );
            }

            const FieldComponent = getFieldComponent(field.type);
            if (!FieldComponent) return null;

            return (
              <FieldComponent
                key={field.name}
                field={field}
                register={register}
                errors={errors}
              />
            );
          })}

          {unsupportedFields.length > 0 && mode === "runtime" && (
            <p className="text-[10px] text-muted-foreground">
              {unsupportedFields.length} unsupported field(s) shown above are excluded from submission.
            </p>
          )}

          {submitError && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive flex items-start gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold">Submission Error</span>
                <p className="opacity-90">{submitError}</p>
              </div>
            </div>
          )}

          {renderableFields.length > 0 && (
            <button
              type="submit"
              disabled={formState === "submitting"}
              className={cn(
                "flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5",
                "bg-primary text-primary-foreground text-sm font-medium",
                "hover:bg-primary/80 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              )}
            >
              {formState === "submitting" ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Submitting…
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Submit
                </>
              )}
            </button>
          )}
        </form>
      </div>

      {mode === "preview" && (
        <p className="text-[10px] text-center text-muted-foreground mt-3 font-mono">
          Tip: Type &quot;trigger-error&quot; to simulate submission failure.
        </p>
      )}
    </div>
  );
}

export default function FormRenderer(props: FormRendererProps) {
  return (
    <FormErrorBoundary>
      <FormRendererInner {...props} />
    </FormErrorBoundary>
  );
}
