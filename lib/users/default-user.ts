import { prisma } from "@/lib/prisma";

export const DEFAULT_USER_EMAIL = "system@appforge.local";

/**
 * Returns the default system user for apps created before auth is implemented.
 */
export async function getOrCreateDefaultUser() {
  return prisma.user.upsert({
    where: { email: DEFAULT_USER_EMAIL },
    create: {
      email: DEFAULT_USER_EMAIL,
      name: "System",
    },
    update: {},
  });
}
