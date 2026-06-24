import "server-only";

import type { Application as PrismaApplication } from "@/lib/generated/prisma/client";
import type { ApplicationStorageProvider } from "./storage-interface";
import type {
  Application,
  CreateApplicationInput,
  UpdateApplicationInput,
} from "./types";
import type { FormSchema } from "@/lib/types";
import { prisma } from "@/lib/prisma";
import { getOrCreateDefaultUser } from "@/lib/users/default-user";

export function toApplication(record: PrismaApplication): Application {
  return {
    id: record.id,
    name: record.name,
    description: record.description ?? undefined,
    schema: record.schema as FormSchema,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}

export class PrismaStorageProvider implements ApplicationStorageProvider {
  async list(): Promise<Application[]> {
    const records = await prisma.application.findMany({
      orderBy: { updatedAt: "desc" },
    });
    return records.map(toApplication);
  }

  async getById(id: string): Promise<Application | null> {
    const record = await prisma.application.findUnique({ where: { id } });
    return record ? toApplication(record) : null;
  }

  async create(input: CreateApplicationInput): Promise<Application> {
    const user = await getOrCreateDefaultUser();
    const record = await prisma.application.create({
      data: {
        name: input.name,
        description: input.description,
        schema: input.schema as object,
        userId: user.id,
      },
    });
    return toApplication(record);
  }

  async update(id: string, input: UpdateApplicationInput): Promise<Application> {
    try {
      const record = await prisma.application.update({
        where: { id },
        data: {
          ...(input.name !== undefined && { name: input.name }),
          ...(input.description !== undefined && { description: input.description }),
          ...(input.schema !== undefined && { schema: input.schema as object }),
        },
      });
      return toApplication(record);
    } catch {
      throw new Error(`Application not found: ${id}`);
    }
  }

  async delete(id: string): Promise<void> {
    await prisma.application.delete({ where: { id } });
  }
}

let prismaProvider: PrismaStorageProvider | null = null;

export function getPrismaStorageProvider(): PrismaStorageProvider {
  if (!prismaProvider) prismaProvider = new PrismaStorageProvider();
  return prismaProvider;
}
