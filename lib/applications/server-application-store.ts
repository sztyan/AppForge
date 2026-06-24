import "server-only";

import { getPrismaStorageProvider } from "./prisma-storage-provider";
import type { ApplicationStorageProvider } from "./storage-interface";

/** Server-side store — PostgreSQL via Prisma (Neon) */
export function getServerApplicationStore(): ApplicationStorageProvider {
  return getPrismaStorageProvider();
}
