
import express from "express";
import cors from "cors";
import { issueRouter } from "./routes/issue";
import { userRouter } from "./routes/users";
import { errorHandler } from "./middleware/errorHandler";

export const app = express();

app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

// Health check
app.get("/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
    message: "IssueFlow API is running",
  });
});

// Issue routes
app.use("/issues", issueRouter);

// User routes
app.use("/users", userRouter);

// Centralized error handling
app.use(errorHandler);
