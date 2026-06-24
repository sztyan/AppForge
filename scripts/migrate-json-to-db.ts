/**
 * One-time migration: imports data/applications.json into PostgreSQL.
 * Run: npm run db:migrate-json
 */
import "dotenv/config";
import { readFile } from "fs/promises";
import path from "path";
import { prisma } from "../lib/prisma";
import { getOrCreateDefaultUser } from "../lib/users/default-user";
import type { Application } from "../lib/applications/types";

async function main() {
  const filePath = path.join(process.cwd(), "data", "applications.json");
  let apps: Application[] = [];

  try {
    const raw = await readFile(filePath, "utf-8");
    apps = JSON.parse(raw) as Application[];
    if (!Array.isArray(apps)) apps = [];
  } catch {
    console.log("No data/applications.json found — nothing to migrate.");
    return;
  }

  if (apps.length === 0) {
    console.log("applications.json is empty — nothing to migrate.");
    return;
  }

  const user = await getOrCreateDefaultUser();
  let migrated = 0;

  for (const app of apps) {
    const existing = await prisma.application.findUnique({ where: { id: app.id } });
    if (existing) {
      console.log(`Skipping existing app: ${app.id}`);
      continue;
    }

    await prisma.application.create({
      data: {
        id: app.id,
        name: app.name,
        description: app.description,
        schema: app.schema as object,
        userId: user.id,
        createdAt: new Date(app.createdAt),
        updatedAt: new Date(app.updatedAt),
      },
    });
    migrated++;
    console.log(`Migrated: ${app.name} (${app.id})`);
  }

  console.log(`Done. Migrated ${migrated} application(s).`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
