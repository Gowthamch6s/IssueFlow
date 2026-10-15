
import type {
  Issue,
  IssueInput,
  IssueStatus,
  IssueUpdate,
  User,
} from "../types/issue";

const API_URL =
  import.meta.env.VITE_API_URL ??
  "http://localhost:4000";

async function apiRequest<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  let response: Response;

  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
    });
  } catch {
    throw new Error(
      "Cannot connect to the server. Please try again."
    );
  }

  if (!response.ok) {
    let message = "Something went wrong.";

    try {
      const data = await response.json();
      message = data.error || message;
    } catch {
      // Keep the fallback error message.
    }

    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export const issueApi = {
  getAll: (status?: IssueStatus, search = "") => {
    const params = new URLSearchParams();

    if (status) params.set("status", status);
    if (search.trim()) params.set("search", search.trim());

    const query = params.toString();

    return apiRequest<Issue[]>(
      `/issues${query ? `?${query}` : ""}`
    );
  },

  getById: (id: string) =>
    apiRequest<Issue>(`/issues/${encodeURIComponent(id)}`),

  create: (data: IssueInput) =>
    apiRequest<Issue>("/issues", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (id: string, data: IssueUpdate) =>
    apiRequest<Issue>(
      `/issues/${encodeURIComponent(id)}`,
      {
        method: "PATCH",
        body: JSON.stringify(data),
      }
    ),

  delete: (id: string) =>
    apiRequest<void>(
      `/issues/${encodeURIComponent(id)}`,
      { method: "DELETE" }
    ),
};

export const userApi = {
  getAll: () => apiRequest<User[]>("/users"),
};
