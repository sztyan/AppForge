import { NextResponse } from "next/server";
import { getServerAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { UpdateApplicationInput } from "@/lib/applications/types";
import { toApplication } from "@/lib/applications/prisma-storage-provider";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, { params }: RouteParams) {
  const { id } = await params;
  const session = await getServerAuthSession();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const record = await prisma.application.findUnique({ where: { id } });
  if (!record || record.userId !== session.user.id) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json(toApplication(record));
}

export async function PUT(request: Request, { params }: RouteParams) {
  const { id } = await params;
  const session = await getServerAuthSession();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const existing = await prisma.application.findUnique({ where: { id } });
  if (!existing || existing.userId !== session.user.id) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = (await request.json()) as UpdateApplicationInput;
  const record = await prisma.application.update({
    where: { id },
    data: {
      ...(body.name !== undefined && { name: body.name }),
      ...(body.description !== undefined && { description: body.description }),
      ...(body.schema !== undefined && { schema: body.schema as object }),
    },
  });

  return NextResponse.json(toApplication(record));
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  const { id } = await params;
  const session = await getServerAuthSession();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const existing = await prisma.application.findUnique({ where: { id } });
  if (!existing || existing.userId !== session.user.id) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.application.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
