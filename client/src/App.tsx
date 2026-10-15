
import { useCallback, useEffect, useState } from "react";
import { issueApi, userApi } from "./services/api";
import type {
  Issue,
  IssueInput,
  IssueStatus,
  IssuePriority,
  User,
} from "./types/issue";
import "./App.css";

const statuses: IssueStatus[] = [
  "OPEN",
  "IN_PROGRESS",
  "RESOLVED",
  "CLOSED",
];

const priorities: IssuePriority[] = [
  "LOW",
  "MEDIUM",
  "HIGH",
  "CRITICAL",
];

const labels: Record<IssueStatus, string> = {
  OPEN: "Open",
  IN_PROGRESS: "In Progress",
  RESOLVED: "Resolved",
  CLOSED: "Closed",
};

const blankForm: IssueInput = {
  title: "",
  description: "",
  status: "OPEN",
  priority: "MEDIUM",
  assigneeId: null,
};

function App() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [filter, setFilter] = useState<IssueStatus | "ALL">("ALL");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Issue | null>(null);
  const [form, setForm] = useState<IssueInput>(blankForm);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");

  const loadIssues = useCallback(async () => {
    try {
      setError("");
      const data = await issueApi.getAll(
        filter === "ALL" ? undefined : filter,
        search
      );
      setIssues(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load issues."
      );
    } finally {
      setLoading(false);
    }
  }, [filter, search]);

  useEffect(() => {
    void loadIssues();
  }, [loadIssues]);

  useEffect(() => {
    userApi.getAll()
      .then(setUsers)
      .catch(() => setError("Could not load available assignees."));
  }, []);

  function openCreate() {
    setSelected(null);
    setForm({ ...blankForm });
    setFormError("");
    setModalOpen(true);
  }

  async function openEdit(id: string) {
    try {
      setError("");
      const issue = await issueApi.getById(id);
      setSelected(issue);
      setForm({
        title: issue.title,
        description: issue.description,
        status: issue.status,
        priority: issue.priority,
        assigneeId: issue.assigneeId,
      });
      setFormError("");
      setModalOpen(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not open issue."
      );
    }
  }

  async function saveIssue(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");

    if (!form.title.trim() || !form.description.trim()) {
      setFormError("Title and description are required.");
      return;
    }

    setSaving(true);
    try {
      if (selected) {
        await issueApi.update(selected.id, form);
      } else {
        await issueApi.create(form);
      }
      setModalOpen(false);
      await loadIssues();
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : "Could not save issue."
      );
    } finally {
      setSaving(false);
    }
  }

  async function deleteIssue(issue: Issue) {
    if (!window.confirm(`Delete "${issue.title}"? This cannot be undone.`)) {
      return;
    }

    try {
      await issueApi.delete(issue.id);
      await loadIssues();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not delete issue."
      );
    }
  }

  const counts = {
    total: issues.length,
    open: issues.filter((i) => i.status === "OPEN").length,
    active: issues.filter((i) => i.status === "IN_PROGRESS").length,
    resolved: issues.filter((i) => i.status === "RESOLVED").length,
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-icon">◈</span>
          <span>IssueFlow</span>
        </div>

        <div className="nav-label">WORKSPACE</div>
        <div className="nav-item active">▦ &nbsp; Issues</div>
        <div className="nav-item muted">◷ &nbsp; Issue tracking</div>

        <div className="sidebar-footer">
          <span className="online-dot" />
          Engineering workspace
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <span>Workspace / Issues</span>
          <span className="topbar-right">Issue management</span>
        </header>

        <div className="content">
          <div className="page-heading">
            <div>
              <div className="eyebrow">PROJECT OVERVIEW</div>
              <h1>Issue tracker</h1>
              <p>Manage bugs, track progress, and keep work moving.</p>
            </div>
            <button className="primary-button" onClick={openCreate}>
              + New issue
            </button>
          </div>

          {error && (
            <div role="alert" className="error-banner">
              {error}
              <button onClick={() => void loadIssues()}>Retry</button>
            </div>
          )}

          <section className="stats-grid" aria-label="Issue statistics">
            <div className="stat-card">
              <span>Total issues</span>
              <strong>{counts.total}</strong>
              <small>Current results</small>
            </div>
            <div className="stat-card">
              <span>Open</span>
              <strong>{counts.open}</strong>
              <small>Needs attention</small>
            </div>
            <div className="stat-card">
              <span>In progress</span>
              <strong>{counts.active}</strong>
              <small>Currently being worked on</small>
            </div>
            <div className="stat-card">
              <span>Resolved</span>
              <strong>{counts.resolved}</strong>
              <small>Ready for closure</small>
            </div>
          </section>

          <section className="issue-panel">
            <div className="panel-header">
              <div>
                <h2>All issues</h2>
                <p>Find and manage the issues in your workspace.</p>
              </div>
              <span className="count-pill">{issues.length} results</span>
            </div>

            <div className="toolbar">
              <input
                className="search-input"
                type="search"
                placeholder="Search issues..."
                aria-label="Search issues"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />

              <select
                aria-label="Filter by status"
                className="filter-select"
                value={filter}
                onChange={(e) =>
                  setFilter(e.target.value as IssueStatus | "ALL")
                }
              >
                <option value="ALL">All statuses</option>
                {statuses.map((status) => (
                  <option key={status} value={status}>
                    {labels[status]}
                  </option>
                ))}
              </select>
            </div>

            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>ISSUE</th>
                    <th>STATUS</th>
                    <th>PRIORITY</th>
                    <th>ASSIGNEE</th>
                    <th>UPDATED</th>
                    <th>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {!loading && issues.map((issue) => (
                    <tr key={issue.id}>
                      <td className="issue-title-cell">
                        <button
                          className="issue-link"
                          onClick={() => void openEdit(issue.id)}
                        >
                          {issue.title}
                        </button>
                        <div className="issue-description">
                          {issue.description}
                        </div>
                      </td>
                      <td>
                        <span className={`status-badge ${issue.status.toLowerCase()}`}>
                          <span className="badge-dot" />
                          {labels[issue.status]}
                        </span>
                      </td>
                      <td>
                        <span className={`priority-badge ${issue.priority.toLowerCase()}`}>
                          {issue.priority}
                        </span>
                      </td>
                      <td>{issue.assignee?.name ?? "Unassigned"}</td>
                      <td>
                        {new Date(issue.updatedAt).toLocaleDateString()}
                      </td>
                      <td>
                        <div className="actions">
                          <button onClick={() => void openEdit(issue.id)}>
                            Edit
                          </button>
                          <button
                            className="delete-action"
                            onClick={() => void deleteIssue(issue)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {loading && <div className="empty-state">Loading issues...</div>}
              {!loading && issues.length === 0 && (
                <div className="empty-state">
                  <strong>No issues found</strong>
                  <p>Create an issue or adjust your filters.</p>
                </div>
              )}
            </div>
          </section>
        </div>
      </main>

      {modalOpen && (
        <div
          className="modal-backdrop"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget && !saving) {
              setModalOpen(false);
            }
          }}
        >
          <div
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="issue-form-title"
          >
            <div className="modal-heading">
              <div>
                <h2 id="issue-form-title">
                  {selected ? "Edit issue" : "Create issue"}
                </h2>
                <p>Enter the details for this issue.</p>
              </div>
              <button
                className="close-button"
                aria-label="Close dialog"
                onClick={() => setModalOpen(false)}
                disabled={saving}
              >
                ✕
              </button>
            </div>

            <form onSubmit={(e) => void saveIssue(e)}>
              <label htmlFor="issue-title">Title</label>
              <input
                id="issue-title"
                required
                maxLength={150}
                value={form.title}
                onChange={(e) =>
                  setForm({ ...form, title: e.target.value })
                }
                placeholder="Briefly describe the issue"
              />

              <label htmlFor="issue-description">Description</label>
              <textarea
                id="issue-description"
                required
                rows={4}
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                placeholder="What's happening? How can it be reproduced?"
              />

              <div className="form-grid">
                <div>
                  <label htmlFor="issue-status">Status</label>
                  <select
                    id="issue-status"
                    value={form.status}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        status: e.target.value as IssueStatus,
                      })
                    }
                  >
                    {statuses.map((status) => (
                      <option key={status} value={status}>
                        {labels[status]}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="issue-priority">Priority</label>
                  <select
                    id="issue-priority"
                    value={form.priority}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        priority: e.target.value as IssuePriority,
                      })
                    }
                  >
                    {priorities.map((priority) => (
                      <option key={priority} value={priority}>
                        {priority}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <label htmlFor="issue-assignee">Assignee</label>
              <select
                id="issue-assignee"
                value={form.assigneeId ?? ""}
                onChange={(e) =>
                  setForm({
                    ...form,
                    assigneeId: e.target.value || null,
                  })
                }
              >
                <option value="">Unassigned</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name}
                  </option>
                ))}
              </select>

              {formError && (
                <p className="form-error" role="alert">{formError}</p>
              )}

              <div className="modal-footer">
                <button
                  className="secondary-button"
                  type="button"
                  disabled={saving}
                  onClick={() => setModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  className="primary-button"
                  disabled={saving}
                  type="submit"
                >
                  {saving ? "Saving..." : selected ? "Save changes" : "Create issue"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
