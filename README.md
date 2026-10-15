# IssueFlow — Mini Issue Tracker

A full-stack issue-tracking application built with React, TypeScript, Node.js, Express, Prisma, and SQLite.

IssueFlow allows users to create, view, edit, assign, search, filter, and delete software issues through a responsive web interface.

## Features

- Create, view, update, and delete issues
- Four issue statuses: Open, In Progress, Resolved, Closed
- Four priority levels: Low, Medium, High, Critical
- Assign issues to existing users
- Search issues by title or description
- Filter issues by status
- View issue details and timestamps
- Persistent SQLite database storage
- Server-side validation using Zod
- Automated API tests using Vitest and Supertest
- Responsive React dashboard

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

Before running the application, install:

- Node.js 24
- npm
- Git

## Project Structure

```text
IssueFlow/
├── client/
│   ├── src/
│   │   ├── components/
│   │   ├── services/
│   │   ├── types/
│   │   └── App.tsx
│   ├── .env.example
│   └── package.json
├── server/
│   ├── prisma/
│   │   ├── migrations/
│   │   └── schema.prisma
│   ├── src/
│   │   ├── lib/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── schemas/
│   │   ├── app.ts
│   │   └── server.ts
│   ├── tests/
│   ├── .env.example
│   └── package.json
├── README.md
├── ENGINEERING.md
└── .gitignore
```

## Local Setup

### 1. Clone the Repository

```bash
git clone https://github.com/Gowthamch6s/IssueFlow.git
cd IssueFlow
```

### 2. Configure the Backend

Navigate to the server folder:

```bash
cd server
npm install
```

Copy `.env.example` to `.env`.

On Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

The `.env` file should contain:

```env
DATABASE_URL="file:./dev.db"
PORT=4000
```

### 3. Initialize the SQLite Database

Run the Prisma migrations:

```bash
npx prisma migrate deploy
```

Generate Prisma Client:

```bash
npx prisma generate
```

The application will use a local SQLite database.

### 4. Start the Backend

```bash
npm run dev
```

The backend runs at:

http://localhost:4000

Health-check endpoint:

http://localhost:4000/health

Expected response:

```json
{
  "status": "ok",
  "message": "IssueFlow API is running"
}
```

### 5. Configure the Frontend

Open a second terminal and navigate to the client folder from the repository root:

```bash
cd client
npm install
```

Copy `.env.example` to `.env`.

On Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

The frontend `.env` should contain:

```env
VITE_API_URL=http://localhost:4000
```

### 6. Start the Frontend

```bash
npm run dev
```

Open:

http://localhost:5173

The IssueFlow dashboard should now be accessible.

**Note:** A fresh database initially contains no issues or users. Create an assignee through the `POST /users` API before attempting to assign issues.

## REST API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/health` | API health check |
| GET | `/issues` | Retrieve all issues |
| GET | `/issues/:id` | Retrieve a specific issue |
| POST | `/issues` | Create an issue |
| PATCH | `/issues/:id` | Update an issue |
| DELETE | `/issues/:id` | Delete an issue |
| GET | `/users` | Retrieve available assignees |
| POST | `/users` | Create an assignable user |

### Example: Create an Issue

Request:

```http
POST /issues
Content-Type: application/json
```

Body:

```json
{
  "title": "Login button not working",
  "description": "Users cannot log in with valid credentials",
  "status": "OPEN",
  "priority": "HIGH"
}
```

### Filtering Issues

Filter by status:

```text
GET /issues?status=OPEN
```

Search by keyword:

```text
GET /issues?search=login
```

Combine search and filtering:

```text
GET /issues?status=IN_PROGRESS&search=login
```

## Running Automated Tests

The project uses Vitest and Supertest for backend API testing.

Tests run against a separate SQLite database to protect development data.

### 1. Create the Test Environment

Inside the `server` folder, create `.env.test`.

On Windows PowerShell:

```powershell
Copy-Item .env.example .env.test
```

Update `.env.test` to contain:

```env
DATABASE_URL="file:./test.db"
```

### 2. Initialize the Test Database

From the `server` directory, run the following commands in PowerShell:

```powershell
$env:DATABASE_URL="file:./test.db"
npx prisma migrate deploy
Remove-Item Env:DATABASE_URL
```

This applies migrations to the test database rather than the development database.

### 3. Run Tests

```bash
npm test
```

The project includes 12 automated API tests covering:

- Successful issue creation
- Empty title validation
- Invalid priority validation
- Retrieving an issue by ID
- Missing issue handling
- Updating status and priority
- Filtering issues by status
- Searching issues by title
- Assigning existing users
- Rejecting nonexistent assignees
- Deleting issues
- Rejecting invalid status updates

**Important:** Tests delete records from the test database between test cases. Never configure `.env.test` to point to development or production data.

## Build Verification

### Frontend

From the `client` directory:

```bash
npm run build
```

### Backend TypeScript Validation

From the `server` directory:

```bash
npx tsc --noEmit
```

## Data Model

### Issue

Each issue includes:

- Unique ID
- Title
- Description
- Status
- Priority
- Assignee (optional)
- Created timestamp
- Updated timestamp

### User

Each user includes:

- Unique ID
- Name
- Email
- Created timestamp

Issues have an optional relationship with a user through `assigneeId`.

## Validation and Error Handling

The backend uses Zod to validate incoming requests.

Validation handles:

- Empty issue titles
- Missing descriptions
- Invalid statuses
- Invalid priorities
- Invalid assignee identifiers
- References to nonexistent assignees

The API returns appropriate HTTP responses, including:

| Status | Meaning |
|---|---|
| 200 | Successful request |
| 201 | Resource created |
| 204 | Resource deleted |
| 400 | Invalid request data |
| 404 | Resource not found |
| 409 | Conflicting data, such as a duplicate email |
| 500 | Internal server error |

## Assumptions

- The application is designed as a single-workspace issue tracker.
- Authentication is outside the scope of this exercise.
- Users represent potential issue assignees rather than authenticated accounts.
- Issues can exist without an assignee.
- New issues default to Open status and Medium priority when those fields are omitted.
- SQLite is sufficient for the scope of the technical assignment.
- The application is intended for local evaluation.

## Known Limitations

- Authentication and role-based authorization are not implemented.
- Issue lists do not support pagination.
- SQLite is not intended for large-scale distributed deployment.
- File attachments and notifications are not included.
- No audit history is maintained for issue changes.
- Automated browser-based end-to-end tests are not included.
- Users are created through the API rather than a dedicated frontend user-management screen.

## Engineering Decisions

See [ENGINEERING.md](ENGINEERING.md) for a detailed explanation of:

1. Technology stack selection
2. Application architecture and organization
3. Technical challenges
4. Improvements with additional development time
5. Scaling considerations for 100,000 users

## Author

**GitHub:** [Gowthamch6s](https://github.com/Gowthamch6s)

**Repository:** [IssueFlow](https://github.com/Gowthamch6s/IssueFlow)
