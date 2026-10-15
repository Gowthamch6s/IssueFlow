# IssueFlow — Mini Issue Tracker

A full-stack issue tracking application built with React, TypeScript, Express, Prisma, and SQLite.

IssueFlow allows users to create, view, edit, assign, search, filter, and delete software issues through a responsive web interface.

## Features

- Create, view, update, and delete issues
- Four issue statuses: Open, In Progress, Resolved, Closed
- Four priority levels: Low, Medium, High, Critical
- Assign issues to existing users
- Search issues by title or description
- Filter issues by status
- View issue details and timestamps
- Persistent SQLite storage
- Server-side validation using Zod
- Automated API tests using Vitest and Supertest

## Technology Stack

| Layer | Technology |
|---|---|
| Frontend | React, TypeScript, Vite |
| Backend | Node.js, Express, TypeScript |
| Database | SQLite |
| ORM | Prisma |
| Validation | Zod |
| Testing | Vitest, Supertest |
| Version Control | Git, GitHub |

## Prerequisites

- Node.js 24 or a compatible supported version
- npm
- Git

## Local Setup

### 1. Clone the repository

```bash
git clone https://github.com/Gowthamch6s/IssueFlow.git
cd IssueFlow
```

### 2. Configure and start the backend

```bash
cd server
npm install
```

Create a `.env` file by copying `.env.example`.

Set:

```
DATABASE_URL="file:./dev.db"
PORT=4000
```

Initialize the SQLite database:

```bash
npx prisma migrate deploy
npx prisma generate
```

Start the backend:

```bash
npm run dev
```

The API should run at `http://localhost:4000`.

Check the health endpoint at `http://localhost:4000/health`.

### 3. Configure and start the frontend

Open another terminal:

```bash
cd client
npm install
```

Copy `.env.example` to `.env` and set:

```
VITE_API_URL=http://localhost:4000
```

Start the frontend:

```bash
npm run dev
```

Open the local URL shown by Vite, typically `http://localhost:5173`.

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | /health | Health check |
| GET | /issues | List issues |
| GET | /issues/:id | Retrieve an issue |
| POST | /issues | Create an issue |
| PATCH | /issues/:id | Update an issue |
| DELETE | /issues/:id | Delete an issue |
| GET | /users | List assignable users |
| POST | /users | Create a user |

Issue filtering and searching are supported through query parameters:

- `/issues?status=OPEN`
- `/issues?search=login`
- `/issues?status=IN_PROGRESS&search=login`

## Running Tests

The backend uses an isolated SQLite test database.

From the `server` folder, copy `.env.example` to `.env.test`, then set:

```
DATABASE_URL="file:./test.db"
```

Initialize the test database:

```bash
npx prisma migrate deploy
```

Run the tests:

```bash
npm test
```

The test suite covers issue creation, retrieval, updates, deletion, search, filtering, assignment, and invalid input.

**Important:** The tests delete records from the test database. Never configure `.env.test` to point to a development or production database.

## Build Verification

Frontend:

```bash
cd client
npm run build
```

Backend:

```bash
cd server
npx tsc --noEmit
```

## Assumptions

- The application is a single-workspace demonstration without authentication.
- Users represent available assignees, not authenticated accounts.
- Issues may be created without an assignee.
- New issues default to Open status and Medium priority when those fields are omitted.
- SQLite is appropriate for the scope of this technical exercise.

## Known Limitations

- Authentication and role-based permissions are not implemented.
- No pagination is provided for large issue collections.
- SQLite is intended for a local demonstration rather than large-scale distributed deployment.
- No email notifications, file attachments, or audit history are included.
- No automated browser-based end-to-end test suite is included.

## Engineering Decisions

See [ENGINEERING.md](ENGINEERING.md) for architecture, technical tradeoffs, implementation challenges, and scalability considerations.

## Author

GitHub: [Gowthamch6s](https://github.com/Gowthamch6s)
