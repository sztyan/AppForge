import { ApiStorageProvider } from "./api-storage-provider";
import type { ApplicationStorageProvider } from "./storage-interface";

let clientProvider: ApplicationStorageProvider | null = null;

/** Client-side store — REST API backed by file storage on server */
export function getApplicationStore(): ApplicationStorageProvider {
  if (!clientProvider) {
    clientProvider = new ApiStorageProvider();
  }
  return clientProvider;
}

export function setApplicationStore(next: ApplicationStorageProvider): void {
  clientProvider = next;
}
