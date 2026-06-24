import type { ApplicationStorageProvider } from "./storage-interface";
import type {
  Application,
  CreateApplicationInput,
  UpdateApplicationInput,
} from "./types";

const STORAGE_KEY = "appforge_applications";

function generateId(): string {
  return `app_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

function readAll(): Application[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Application[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeAll(apps: Application[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(apps));
}

export class LocalStorageProvider implements ApplicationStorageProvider {
  async list(): Promise<Application[]> {
    return readAll().sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }

  async getById(id: string): Promise<Application | null> {
    return readAll().find((app) => app.id === id) ?? null;
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
    const apps = readAll();
    apps.push(app);
    writeAll(apps);
    return app;
  }

  async update(id: string, input: UpdateApplicationInput): Promise<Application> {
    const apps = readAll();
    const index = apps.findIndex((app) => app.id === id);
    if (index === -1) {
      throw new Error(`Application not found: ${id}`);
    }
    const updated: Application = {
      ...apps[index],
      ...input,
      schema: input.schema ?? apps[index].schema,
      updatedAt: new Date().toISOString(),
    };
    apps[index] = updated;
    writeAll(apps);
    return updated;
  }

  async delete(id: string): Promise<void> {
    const apps = readAll().filter((app) => app.id !== id);
    writeAll(apps);
  }

  async replaceAll(apps: Application[]): Promise<void> {
    writeAll(apps);
  }
}
