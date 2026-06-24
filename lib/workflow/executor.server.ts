import "server-only";

import type { WorkflowConfig, WorkflowStep } from "@/lib/types";
import type { WorkflowContext, WorkflowResult } from "./executor";
import { createSubmission } from "@/lib/applications/submissions-store.server";

export type { WorkflowContext, WorkflowResult };

/** Server-side workflow (PostgreSQL submission storage) */
export async function executeWorkflow(
  workflow: WorkflowConfig | undefined,
  context: WorkflowContext
): Promise<WorkflowResult> {
  const steps = (workflow?.onSubmit ?? []).filter((s) => s.enabled !== false);
  const results: WorkflowResult["results"] = [];
  let redirectTo: string | undefined;

  for (const step of steps) {
    const result = await executeStep(step, context);
    results.push(result);
    if (result.redirectTo) redirectTo = result.redirectTo;
  }

  return {
    success: results.every((r) => r.success),
    results,
    redirectTo,
  };
}

async function executeStep(
  step: WorkflowStep,
  context: WorkflowContext
): Promise<WorkflowResult["results"][0] & { redirectTo?: string }> {
  switch (step.type) {
    case "notify": {
      const message =
        step.config?.message ??
        `Submission received for ${context.schemaTitle ?? "form"}`;
      return { stepId: step.id, type: step.type, success: true, message };
    }

    case "log": {
      console.log(`[Workflow:${step.id}]`, context.formData);
      return { stepId: step.id, type: step.type, success: true, message: "Logged" };
    }

    case "webhook": {
      const url = step.config?.url;
      if (!url) {
        return { stepId: step.id, type: step.type, success: false, message: "No webhook URL" };
      }
      try {
        await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            appId: context.appId,
            data: context.formData,
            timestamp: new Date().toISOString(),
          }),
        });
        return { stepId: step.id, type: step.type, success: true, message: `Posted to ${url}` };
      } catch {
        return { stepId: step.id, type: step.type, success: false, message: "Webhook failed" };
      }
    }

    case "redirect": {
      const redirectTo = step.config?.redirectTo;
      return {
        stepId: step.id,
        type: step.type,
        success: !!redirectTo,
        message: redirectTo ? `Redirect to ${redirectTo}` : "No redirect URL",
        redirectTo,
      };
    }

    case "store": {
      try {
        if (!context.submissionStored) {
          await createSubmission(context.appId ?? "default", context.formData);
        }
        return { stepId: step.id, type: step.type, success: true, message: "Stored submission" };
      } catch {
        return { stepId: step.id, type: step.type, success: false, message: "Storage failed" };
      }
    }

    default:
      return { stepId: step.id, type: step.type, success: false, message: "Unknown step type" };
  }
}
