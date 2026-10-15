
import { describe, it, expect } from "vitest";
import request from "supertest";
import { prisma } from "../src/lib/prisma";
import { app } from "../src/app";

describe("Issue API", () => {
  it("creates an issue successfully", async () => {
    const response = await request(app)
      .post("/issues")
      .send({
        title: "Login bug",
        description: "Login button fails",
        status: "OPEN",
        priority: "HIGH",
      });

    expect(response.status).toBe(201);
    expect(response.body.title).toBe("Login bug");
    expect(response.body.status).toBe("OPEN");
    expect(response.body.id).toBeDefined();
  });

  it("rejects an empty title", async () => {
    const response = await request(app)
      .post("/issues")
      .send({
        title: "",
        description: "A valid description",
      });

    expect(response.status).toBe(400);
  });

  it("rejects an invalid priority", async () => {
    const response = await request(app)
      .post("/issues")
      .send({
        title: "Login bug",
        description: "Login button fails",
        priority: "URGENT",
      });

    expect(response.status).toBe(400);
  });

  it("returns 404 for an unknown issue", async () => {
    const response = await request(app)
      .get("/issues/nonexistent");

    expect(response.status).toBe(404);
  });
  
  it("retrieves an issue by ID", async () => {
    const created = await request(app)
      .post("/issues")
      .send({
        title: "Dashboard bug",
        description: "Dashboard fails to load",
        priority: "HIGH",
      });

    expect(created.status).toBe(201);

    const response = await request(app)
      .get(`/issues/${created.body.id}`);

    expect(response.status).toBe(200);
    expect(response.body.id).toBe(created.body.id);
    expect(response.body.title).toBe("Dashboard bug");
  });

  it("updates issue status and priority", async () => {
    const created = await request(app)
      .post("/issues")
      .send({
        title: "Search bug",
        description: "Search returns incorrect results",
      });

    const response = await request(app)
      .patch(`/issues/${created.body.id}`)
      .send({
        status: "IN_PROGRESS",
        priority: "CRITICAL",
      });

    expect(response.status).toBe(200);
    expect(response.body.status).toBe("IN_PROGRESS");
    expect(response.body.priority).toBe("CRITICAL");
  });

  it("filters issues by status", async () => {
    await request(app).post("/issues").send({
      title: "Open issue",
      description: "Needs investigation",
      status: "OPEN",
    });

    await request(app).post("/issues").send({
      title: "Resolved issue",
      description: "Already fixed",
      status: "RESOLVED",
    });

    const response = await request(app)
      .get("/issues?status=OPEN");

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
    expect(response.body[0].title).toBe("Open issue");
  });

  it("searches issues by title", async () => {
    await request(app).post("/issues").send({
      title: "Payment failure",
      description: "Checkout fails",
    });

    await request(app).post("/issues").send({
      title: "Profile issue",
      description: "Avatar is missing",
    });

    const response = await request(app)
      .get("/issues?search=Payment");

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
    expect(response.body[0].title).toBe("Payment failure");
  });

  it("assigns an issue to an existing user", async () => {
    const user = await prisma.user.create({
      data: {
        name: "Test Engineer",
        email: "engineer@example.com",
      },
    });

    const created = await request(app)
      .post("/issues")
      .send({
        title: "Assignment test",
        description: "Test user assignment",
      });

    const response = await request(app)
      .patch(`/issues/${created.body.id}`)
      .send({ assigneeId: user.id });

    expect(response.status).toBe(200);
    expect(response.body.assigneeId).toBe(user.id);
    expect(response.body.assignee.name).toBe("Test Engineer");
  });

  it("rejects a nonexistent assignee", async () => {
    const response = await request(app)
      .post("/issues")
      .send({
        title: "Invalid assignment",
        description: "Assignee does not exist",
        assigneeId: "cm00000000000000000000000",
      });

    expect(response.status).toBe(400);
  });

  it("deletes an issue", async () => {
    const created = await request(app)
      .post("/issues")
      .send({
        title: "Temporary issue",
        description: "Issue to be deleted",
      });

    const deleted = await request(app)
      .delete(`/issues/${created.body.id}`);

    expect(deleted.status).toBe(204);

    const response = await request(app)
      .get(`/issues/${created.body.id}`);

    expect(response.status).toBe(404);
  });

  it("rejects invalid status updates", async () => {
    const created = await request(app)
      .post("/issues")
      .send({
        title: "Validation test",
        description: "Invalid status check",
      });

    const response = await request(app)
      .patch(`/issues/${created.body.id}`)
      .send({ status: "INVALID_STATUS" });

    expect(response.status).toBe(400);
  });

});
