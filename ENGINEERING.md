# IssueFlow — Engineering Decisions

## 1. Why did you choose your technology stack?

I chose React and TypeScript for the frontend because React supports reusable UI components, while TypeScript provides compile-time type checking and helps maintain consistency between the frontend and API data structures.

For the backend, I selected Node.js with Express because it provides a lightweight way to implement REST endpoints without introducing unnecessary complexity.

I chose SQLite with Prisma ORM because the assignment requires persistent storage, but not a production-scale database infrastructure. SQLite makes local setup straightforward, while Prisma provides structured database queries, schema migrations, and relationships.

Zod handles runtime validation of incoming data, and Vitest with Supertest allows the API to be tested without relying on manual browser interactions.

Overall, this stack offered a practical balance between development speed, maintainability, and testability.

## 2. How did you structure your application and why?

I separated the project into `client` and `server` directories to keep frontend presentation concerns independent from backend functionality.

The frontend uses reusable TypeScript interfaces and a centralized API service to manage communication with the backend.

The backend separates route definitions, validation schemas, database configuration, and error-handling middleware.

Prisma defines the database models and the relationship between issues and assignees.

This structure makes it easier to locate functionality, maintain consistent validation, and modify individual parts of the application without unnecessarily affecting others.

For a larger project, I would further separate route handlers from business logic through dedicated controllers and services.

## 3. What was the most difficult part of the task?

One of the main challenges was integrating several independent layers of the application while keeping their behavior consistent.

The frontend needed to communicate with the REST API, the backend needed to validate requests, and Prisma needed to preserve issue relationships and changes correctly.

Handling issue assignment required additional attention because an assignee must refer to an existing user.

Another important challenge was configuring automated tests with a separate SQLite database. Since tests reset database records, isolating the test environment was essential to avoid affecting development data.

I addressed these challenges incrementally by testing API operations first, introducing automated tests, and then integrating the React dashboard.

## 4. What would you improve if you had another two days?

I would prioritize the following improvements:

1. Add authentication and role-based authorization so different users can manage issues according to their permissions.
2. Introduce pagination and sorting for efficient issue browsing.
3. Add an issue activity history to record status changes, reassignment, and edits.
4. Improve accessibility and keyboard interactions, especially in issue dialogs.
5. Add frontend component tests and end-to-end tests covering important user workflows.
6. Improve API documentation and add continuous integration through GitHub Actions.

I would prioritize these improvements based on their impact on usability, reliability, and maintainability rather than adding visual features without clear value.

## 5. If this application grew to 100,000 users, what parts of your implementation would you reconsider?

At that scale, I would reconsider several architectural decisions.

**Database:** I would evaluate migrating from SQLite to PostgreSQL for stronger support for concurrent users, connection management, and production operations.

**Query performance:** The current issue list returns matching records without pagination. I would introduce server-side pagination, database indexing informed by query patterns, and appropriate search strategies.

**Authentication and authorization:** I would implement a secure identity system with permission checks to ensure users can access and modify only authorized issues.

**Backend architecture:** I would evaluate separating business logic into service modules, strengthening centralized error handling, and deploying stateless API instances behind a load balancer.

**Observability:** I would add structured logging, application metrics, error monitoring, and distributed tracing where appropriate.

**Testing and deployment:** I would introduce CI/CD pipelines, integration-test environments, automated deployment checks, and database migration procedures.

**Infrastructure:** I would assess caching, background job processing, connection pooling, and horizontal scaling based on observed performance rather than implementing them prematurely.

The goal would be to evolve the architecture in response to real bottlenecks while preserving the separation of concerns already established in the project.
