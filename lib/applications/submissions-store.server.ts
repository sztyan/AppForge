import "server-only";

import { prisma } from "@/lib/prisma";

export async function createSubmission(
  applicationId: string,
  data: Record<string, unknown>
): Promise<void> {
  await prisma.submission.create({
    data: {
      applicationId,
      data: data as object,
    },
  });
}

export async function listSubmissions(applicationId: string) {
  return prisma.submission.findMany({
    where: { applicationId },
    orderBy: { createdAt: "desc" },
  });
}
