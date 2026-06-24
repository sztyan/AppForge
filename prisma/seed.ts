import "dotenv/config";
import { prisma } from "../lib/prisma";
import { getOrCreateDefaultUser } from "../lib/users/default-user";

async function main() {
  const user = await getOrCreateDefaultUser();
  console.log(`Default user ready: ${user.email} (${user.id})`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
