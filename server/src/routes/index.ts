import type { Express } from "express";
import { memoryRoutes } from "./memory.route.js";
import { sourceRoutes } from "./source.route.js";
import { workspaceRoutes } from "./workspace.route.js";

export function registerRoutes(app: Express): void {
  workspaceRoutes.use("/:workspaceId/sources", sourceRoutes);
  app.use("/api/workspaces", workspaceRoutes);
  app.use("/api/memory", memoryRoutes);
}
