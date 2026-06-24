import { NextResponse } from "next/server";
import { getServerApplicationStore } from "@/lib/applications/server-application-store";

interface RouteParams {
  params: Promise<{ appId: string; tableId: string }>;
}

export async function GET(_request: Request, { params }: RouteParams) {
  const { appId, tableId } = await params;
  const app = await getServerApplicationStore().getById(appId);

  if (!app) {
    return NextResponse.json({ error: "Application not found" }, { status: 404 });
  }

  const table = app.schema.tables?.find((t) => t.id === tableId);
  if (!table) {
    return NextResponse.json({ error: "Table not found" }, { status: 404 });
  }

  return NextResponse.json({
    id: table.id,
    title: table.title,
    columns: table.columns,
    data: table.data ?? [],
    csvImport: table.csvImport ?? false,
  });
}
