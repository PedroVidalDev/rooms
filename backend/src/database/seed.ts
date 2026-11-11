import "dotenv/config";
import path from "path";
import { fileURLToPath } from "url";
import bcrypt from "bcrypt";
import { prisma } from "./client.js";

const SEED_USERS = [
  {
    name: "User One",
    email: "user1@example.com",
    password: "password123",
  },
  {
    name: "User Two",
    email: "user2@example.com",
    password: "password123",
  },
];

export async function seed(): Promise<void> {
  for (const userData of SEED_USERS) {
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    await prisma.user.upsert({
      where: { email: userData.email },
      update: {
        name: userData.name,
        password: hashedPassword,
        isActive: true,
        isVerified: true,
      },
      create: {
        name: userData.name,
        email: userData.email,
        password: hashedPassword,
        isActive: true,
        isVerified: true,
      },
    });
  }

  console.log("Database seeded with two users.");
}

if (
  process.argv[1] &&
  path.resolve(fileURLToPath(import.meta.url)) === path.resolve(process.argv[1])
) {
  seed()
    .catch((error) => {
      console.error("Failed to seed database:", error);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
