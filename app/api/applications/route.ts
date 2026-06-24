import { NextResponse } from "next/server";
import { getServerAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { CreateApplicationInput } from "@/lib/applications/types";
import { toApplication } from "@/lib/applications/prisma-storage-provider";

export async function GET() {
  const session = await getServerAuthSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const records = await prisma.application.findMany({
    where: { userId: session.user.id },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json(records.map(toApplication));
}

export async function POST(request: Request) {
  const session = await getServerAuthSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as CreateApplicationInput;
  if (!body.name || !body.schema) {
    return NextResponse.json({ error: "name and schema are required" }, { status: 400 });
  }

  const record = await prisma.application.create({
    data: {
      name: body.name,
      description: body.description,
      schema: body.schema as object,
      userId: session.user.id,
    },
  });

  return NextResponse.json(toApplication(record), { status: 201 });
}
