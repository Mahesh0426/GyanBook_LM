import type { Express } from "express";
import { workspaceRoutes } from "./workspace.route.js";
import { sourceRoutes } from "./source.route.js";

export function registerRoutes(app: Express): void {
  workspaceRoutes.use("/:workspaceId/sources", sourceRoutes);
  app.use("/api/workspaces", workspaceRoutes);
}
