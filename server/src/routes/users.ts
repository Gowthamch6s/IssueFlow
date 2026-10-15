
import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";

export const userRouter = Router();

const createUserSchema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.email(),
}).strict();

// GET /users - List available assignees
userRouter.get("/", async (_req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
      },
      orderBy: { name: "asc" },
    });

    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Could not retrieve users",
    });
  }
});

// POST /users - Create an available assignee
userRouter.post("/", async (req, res) => {
  const parsed = createUserSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({
      error: "Invalid user data",
      details: parsed.error.issues,
    });
    return;
  }

  try {
    const existing = await prisma.user.findUnique({
      where: { email: parsed.data.email },
    });

    if (existing) {
      res.status(409).json({
        error: "Email already exists",
      });
      return;
    }

    const user = await prisma.user.create({
      data: parsed.data,
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    res.status(201).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Could not create user",
    });
  }
});
