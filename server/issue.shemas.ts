
import { z } from "zod";

export const issueStatus = z.enum([
  "OPEN",
  "IN_PROGRESS",
  "RESOLVED",
  "CLOSED",
]);

export const issuePriority = z.enum([
  "LOW",
  "MEDIUM",
  "HIGH",
  "CRITICAL",
]);

export const createIssueSchema = z.object({
  title: z.string().trim().min(1).max(150),
  description: z.string().trim().min(1),
  status: issueStatus.default("OPEN"),
  priority: issuePriority.default("MEDIUM"),
  assigneeId: z.string().cuid().nullable().optional(),
}).strict();

export const updateIssueSchema =
  createIssueSchema.partial();

export const issueQuerySchema = z.object({
  status: issueStatus.optional(),
  search: z.string().trim().optional(),
});
