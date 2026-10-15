
import { beforeEach, afterAll } from "vitest";
import { prisma } from "../src/lib/prisma";

const databaseUrl = process.env.DATABASE_URL;

if (
  databaseUrl !== "file:./test.db"
) {
  throw new Error(
    "Tests must run using the isolated test database."
  );
}

beforeEach(async () => {
  await prisma.issue.deleteMany();
  await prisma.user.deleteMany();
});

afterAll(async () => {
  await prisma.$disconnect();
});
