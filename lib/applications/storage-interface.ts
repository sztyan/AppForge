import type {
  Application,
  CreateApplicationInput,
  UpdateApplicationInput,
} from "./types";

/**
 * Storage abstraction for application schemas.
 * Swap LocalStorageProvider for a database-backed provider later
 * without changing consumer code.
 */
export interface ApplicationStorageProvider {
  list(): Promise<Application[]>;
  getById(id: string): Promise<Application | null>;
  create(input: CreateApplicationInput): Promise<Application>;
  update(id: string, input: UpdateApplicationInput): Promise<Application>;
  delete(id: string): Promise<void>;
}
