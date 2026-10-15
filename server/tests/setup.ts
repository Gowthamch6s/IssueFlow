
import { beforeEach, afterAll } from "vitest";
import { prisma } from "../src/lib/prisma";

beforeEach(async () => {
  await prisma.issue.deleteMany();
  await prisma.user.deleteMany();
});

afterAll(async () => {
  await prisma.$disconnect();
});
