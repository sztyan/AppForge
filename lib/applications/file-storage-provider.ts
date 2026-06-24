import { promises as fs } from "fs";
import path from "path";
import type { ApplicationStorageProvider } from "./storage-interface";
import type {
  Application,
  CreateApplicationInput,
  UpdateApplicationInput,
} from "./types";

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "applications.json");

function generateId(): string {
  return `app_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

async function readAll(): Promise<Application[]> {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf-8");
    const parsed = JSON.parse(raw) as Application[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeAll(apps: Application[]): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(apps, null, 2), "utf-8");
}

export class FileStorageProvider implements ApplicationStorageProvider {
  async list(): Promise<Application[]> {
    const apps = await readAll();
    return apps.sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }

  async getById(id: string): Promise<Application | null> {
    return (await readAll()).find((app) => app.id === id) ?? null;
  }

  async create(input: CreateApplicationInput): Promise<Application> {
    const now = new Date().toISOString();
    const app: Application = {
      id: generateId(),
      name: input.name,
      description: input.description,
      schema: input.schema,
      createdAt: now,
      updatedAt: now,
    };
    const apps = await readAll();
    apps.push(app);
    await writeAll(apps);
    return app;
  }

  async update(id: string, input: UpdateApplicationInput): Promise<Application> {
    const apps = await readAll();
    const index = apps.findIndex((app) => app.id === id);
    if (index === -1) throw new Error(`Application not found: ${id}`);
    const updated: Application = {
      ...apps[index],
      ...input,
      schema: input.schema ?? apps[index].schema,
      updatedAt: new Date().toISOString(),
    };
    apps[index] = updated;
    await writeAll(apps);
    return updated;
  }

  async delete(id: string): Promise<void> {
    const apps = (await readAll()).filter((app) => app.id !== id);
    await writeAll(apps);
  }

  async replaceAll(apps: Application[]): Promise<void> {
    await writeAll(apps);
  }
}

let fileProvider: FileStorageProvider | null = null;

export function getFileStorageProvider(): FileStorageProvider {
  if (!fileProvider) fileProvider = new FileStorageProvider();
  return fileProvider;
}
