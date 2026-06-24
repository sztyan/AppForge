import type { FormSchema } from "@/lib/types";

/** A persisted application generated from a form schema */
export interface Application {
  id: string;
  name: string;
  description?: string;
  schema: FormSchema;
  createdAt: string;
  updatedAt: string;
}

export interface CreateApplicationInput {
  name: string;
  description?: string;
  schema: FormSchema;
}

export interface UpdateApplicationInput {
  name?: string;
  description?: string;
  schema?: FormSchema;
}
