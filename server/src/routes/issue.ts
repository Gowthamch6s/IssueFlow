
import { Router } from "express";
import { prisma } from "../lib/prisma";

import { updateIssueSchema } from "../schemas/issue.schema";

import {
  createIssueSchema,
  issueQuerySchema,
} from "../schemas/issue.schema";

export const issueRouter = Router();

// GET /issues - List, filter and search issues
issueRouter.get("/", async (req, res) => {
  const parsed = issueQuerySchema.safeParse(req.query);

  if (!parsed.success) {
    res.status(400).json({
      error: "Invalid query parameters",
      details: parsed.error.issues,
    });
    return;
  }

  const { status, search } = parsed.data;

  try {
    const issues = await prisma.issue.findMany({
      where: {
        ...(status ? { status } : {}),
        ...(search
          ? {
              OR: [
                { title: { contains: search } },
                { description: { contains: search } },
              ],
            }
          : {}),
      },
      include: { assignee: true },
      orderBy: { createdAt: "desc" },
    });

    res.json(issues);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Could not retrieve issues",
    });
  }
});

// POST /issues - Create an issue
issueRouter.post("/", async (req, res) => {
  const parsed = createIssueSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({
      error: "Invalid issue data",
      details: parsed.error.issues,
    });
    return;
  }

  try {
    const {
      title,
      description,
      status,
      priority,
      assigneeId,
    } = parsed.data;

    if (assigneeId) {
      const user = await prisma.user.findUnique({
        where: { id: assigneeId },
      });

      if (!user) {
        res.status(400).json({
          error: "Assignee does not exist",
        });
        return;
      }
    }

    const issue = await prisma.issue.create({
      data: {
        title,
        description,
        status,
        priority,
        ...(assigneeId
          ? { assignee: { connect: { id: assigneeId } } }
          : {}),
      },
      include: { assignee: true },
    });

    res.status(201).json(issue);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Could not create issue",
    });
  }
});

import type { Request, Response } from "express";

// GET /issues/:id - Get a single issue
issueRouter.get("/:id", async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);

    const issue = await prisma.issue.findUnique({
      where: { id },
      include: { assignee: true },
    });

    if (!issue) {
      res.status(404).json({ error: "Issue not found" });
      return;
    }

    res.json(issue);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Could not retrieve issue" });
  }
});

// PATCH /issues/:id - Update an issue
issueRouter.patch("/:id", async (req: Request, res: Response) => {
  const parsed = updateIssueSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({
      error: "Invalid issue data",
      details: parsed.error.issues,
    });
    return;
  }

  const id = String(req.params.id);

  try {
    const existing = await prisma.issue.findUnique({
      where: { id },
    });

    if (!existing) {
      res.status(404).json({ error: "Issue not found" });
      return;
    }

    const { assigneeId, ...fields } = parsed.data;

    if (assigneeId) {
      const user = await prisma.user.findUnique({
        where: { id: assigneeId },
      });

      if (!user) {
        res.status(400).json({
          error: "Assignee does not exist",
        });
        return;
      }
    }

    const issue = await prisma.issue.update({
      where: { id },
      data: {
        ...fields,
        ...(assigneeId !== undefined
          ? {
              assignee: assigneeId
                ? { connect: { id: assigneeId } }
                : { disconnect: true },
            }
          : {}),
      },
      include: { assignee: true },
    });

    res.json(issue);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Could not update issue" });
  }
});

// DELETE /issues/:id - Delete an issue
issueRouter.delete("/:id", async (req: Request, res: Response) => {
  const id = String(req.params.id);

  try {
    const existing = await prisma.issue.findUnique({
      where: { id },
    });

    if (!existing) {
      res.status(404).json({ error: "Issue not found" });
      return;
    }

    await prisma.issue.delete({ where: { id } });

    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Could not delete issue" });
  }
});


