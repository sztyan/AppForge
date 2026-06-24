import { NextResponse } from "next/server";
import { getServerAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateApiSpec } from "@/lib/api/generate-api-spec";

interface RouteParams {
  params: Promise<{ appId: string }>;
}

export async function GET(_request: Request, { params }: RouteParams) {
  const { appId } = await params;
  const session = await getServerAuthSession();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const app = await prisma.application.findUnique({ where: { id: appId } });
  if (!app || app.userId !== session.user.id) {
    return NextResponse.json({ error: "Application not found" }, { status: 404 });
  }

  const spec = generateApiSpec(app.schema as any, appId);

  return NextResponse.json({
    id: app.id,
    name: app.name,
    description: app.description,
    layout: (app.schema as any).layout ?? "form",
    version: spec.version,
    fieldCount: (app.schema as any).fields?.length ?? 0,
    tableCount: (app.schema as any).tables?.length ?? 0,
    workflow: (app.schema as any).workflow ? { steps: (app.schema as any).workflow.onSubmit?.length ?? 0 } : null,
    i18n: (app.schema as any).i18n
      ? { defaultLocale: (app.schema as any).i18n.defaultLocale, locales: Object.keys((app.schema as any).i18n.locales) }
      : null,
    api: spec,
  });
}
