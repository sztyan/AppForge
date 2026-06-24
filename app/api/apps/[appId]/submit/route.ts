import { NextResponse } from "next/server";
import { getServerApplicationStore } from "@/lib/applications/server-application-store";
import { executeWorkflow } from "@/lib/workflow/executor.server";
import { buildZodSchema } from "@/lib/schema";
import { getRenderableFields } from "@/lib/runtime/normalize-schema";

interface RouteParams {
  params: Promise<{ appId: string }>;
}

export async function POST(request: Request, { params }: RouteParams) {
  const { appId } = await params;
  const app = await getServerApplicationStore().getById(appId);

  if (!app) {
    return NextResponse.json({ error: "Application not found" }, { status: 404 });
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const fields = getRenderableFields(app.schema.fields ?? []);
  const zodSchema = buildZodSchema(fields);
  const parsed = zodSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 422 }
    );
  }

  const { createSubmission } = await import("@/lib/applications/submissions-store.server");
  await createSubmission(appId, parsed.data);

  const workflowResult = await executeWorkflow(app.schema.workflow, {
    appId,
    formData: parsed.data,
    schemaTitle: app.schema.title,
    submissionStored: true,
  });

  return NextResponse.json({
    success: true,
    data: parsed.data,
    workflow: workflowResult,
  });
}
