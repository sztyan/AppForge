import type { ApplicationStorageProvider } from "./storage-interface";
import type {
  Application,
  CreateApplicationInput,
  UpdateApplicationInput,
} from "./types";

/**
 * Client-side provider that persists via REST API (backed by file storage on server).
 * Falls back gracefully when API is unavailable.
 */
export class ApiStorageProvider implements ApplicationStorageProvider {
  private async request<T>(url: string, init?: RequestInit): Promise<T> {
    const res = await fetch(url, {
      ...init,
      headers: { "Content-Type": "application/json", ...init?.headers },
    });
    if (!res.ok) {
      const body = (await res.json().catch(() => ({}))) as { error?: string };
      throw new Error(body.error ?? `Request failed: ${res.status}`);
    }
    return res.json() as Promise<T>;
  }

  async list(): Promise<Application[]> {
    return this.request<Application[]>("/api/applications");
  }

  async getById(id: string): Promise<Application | null> {
    try {
      return await this.request<Application>(`/api/applications/${id}`);
    } catch {
      return null;
    }
  }

  async create(input: CreateApplicationInput): Promise<Application> {
    return this.request<Application>("/api/applications", {
      method: "POST",
      body: JSON.stringify(input),
    });
  }

  async update(id: string, input: UpdateApplicationInput): Promise<Application> {
    return this.request<Application>(`/api/applications/${id}`, {
      method: "PUT",
      body: JSON.stringify(input),
    });
  }

  async delete(id: string): Promise<void> {
    await this.request(`/api/applications/${id}`, { method: "DELETE" });
  }
}
