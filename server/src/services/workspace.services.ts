import { deleteWorkspaceVectors } from "../lib/pinecone.js";
import {
  createWorkspaceRecord,
  deleteWorkspaceRecord,
  findWorkspaceByIdAndUserId,
  findWorkspacesByUserId,
  updateWorkspaceRecord,
  type WorkspaceRecord,
} from "../repository/workspace.repository.js";
import { NotFoundError } from "../types/app-error.js";
import {
  CreateWorkspaceInput,
  UpdateWorkspaceInput,
} from "../validators/workspace.validator.js";

/**
 * Return a list of workspaces belonging to the given user.
 * Delegates to the repository layer to fetch workspace records by user id.
 */
export function listWorkspacesByUser(userId: string) {
  return findWorkspacesByUserId(userId);
}

/**
 * Retrieve a single workspace by id for the specified user.
 * Throws `NotFoundError` if the workspace does not exist or does not belong to the user.
 */
export async function getWorkspaceByIdForUser(
  workspaceId: string,
  userId: string,
): Promise<WorkspaceRecord> {
  const workspace = await findWorkspaceByIdAndUserId(workspaceId, userId);

  if (!workspace) {
    throw new NotFoundError("Workspace not found");
  }

  return workspace;
}

/**
 * Create a new workspace for the given user using the provided input.
 * Delegates creation to the repository layer and returns the created record.
 */
export function createWorkspaceForUser(
  userId: string,
  input: CreateWorkspaceInput,
) {
  return createWorkspaceRecord(userId, input);
}

/**
 * Update an existing workspace. Verifies the workspace belongs to the user
 * before delegating the update to the repository layer.
 */
export async function updateWorkspaceForUser(
  workspaceId: string,
  userId: string,
  input: UpdateWorkspaceInput,
) {
  await getWorkspaceByIdForUser(workspaceId, userId);
  return updateWorkspaceRecord(workspaceId, input);
}

/**
 * Delete a workspace after verifying it belongs to the specified user.
 * Optionally would remove external resources (commented out), then deletes the record.
 */
export async function deleteWorkspaceForUser(
  workspaceId: string,
  userId: string,
) {
  await getWorkspaceByIdForUser(workspaceId, userId);

  try {
    await deleteWorkspaceVectors(workspaceId);
  } catch (error) {
    console.error("Failed to delete Pinecone namespace:", error);
  }

  await deleteWorkspaceRecord(workspaceId);
}
