import { Router } from "express";
import {
  createArtifact,
  deleteArtifact,
  getArtifact,
  listArtifacts,
} from "../controllers/artificat.controller.js";
import { asyncHandler } from "../utils/async-handlers.js";

export const artifactRoutes = Router({ mergeParams: true });

artifactRoutes.get("/", asyncHandler(listArtifacts));
artifactRoutes.post("/", asyncHandler(createArtifact));
artifactRoutes.get("/:artifactId", asyncHandler(getArtifact));
artifactRoutes.delete("/:artifactId", asyncHandler(deleteArtifact));
