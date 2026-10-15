
export type IssueStatus =
  | "OPEN"
  | "IN_PROGRESS"
  | "RESOLVED"
  | "CLOSED";

export type IssuePriority =
  | "LOW"
  | "MEDIUM"
  | "HIGH"
  | "CRITICAL";

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Issue {
  id: string;
  title: string;
  description: string;
  status: IssueStatus;
  priority: IssuePriority;
  assigneeId: string | null;
  assignee: User | null;
  createdAt: string;
  updatedAt: string;
}

export interface IssueInput {
  title: string;
  description: string;
  status?: IssueStatus;
  priority?: IssuePriority;
  assigneeId?: string | null;
}

export type IssueUpdate = Partial<IssueInput>;
