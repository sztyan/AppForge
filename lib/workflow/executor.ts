import type { WorkflowConfig, WorkflowStep } from "@/lib/types";

export interface WorkflowContext {
  appId?: string;
  formData: Record<string, unknown>;
  schemaTitle?: string;
  submissionStored?: boolean;
}

export interface WorkflowResult {
  success: boolean;
  results: { stepId: string; type: string; success: boolean; message?: string }[];
  redirectTo?: string;
}

/** Client-side workflow (preview / localStorage store) */
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
        const key = step.config?.storageKey ?? `appforge_submissions_${context.appId ?? "default"}`;
        const existing = JSON.parse(localStorage.getItem(key) ?? "[]") as unknown[];
        const next = Array.isArray(existing) ? existing : [];
        next.push({ ...context.formData, _submittedAt: new Date().toISOString() });
        localStorage.setItem(key, JSON.stringify(next));
        return { stepId: step.id, type: step.type, success: true, message: "Stored submission" };
      } catch {
        return { stepId: step.id, type: step.type, success: false, message: "Storage failed" };
      }
    }

    default:
      return { stepId: step.id, type: step.type, success: false, message: "Unknown step type" };
  }
}
