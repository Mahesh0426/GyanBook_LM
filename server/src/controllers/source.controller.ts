import type { Request, Response } from "express";
import { ValidationError } from "../types/app-error.js";

import {
  createSourceSchema,
  listSourcesQuerySchema,
  importWebsiteSchema,
  sourceIdParamSchema,
  importYoutubeSchema,
  bulkDeleteSourcesSchema,
} from "../validators/source.validator.js";
import { workspaceIdParamSchema } from "../validators/workspace.validator.js";

import { getZodFieldErrors } from "../utils/zod-errors.js";
import {
  createTextOrMarkdownSource,
  getSourceForWorkspace,
  importWebsiteSource,
  importYoutubeSource,
  listSourcesForWorkspace,
  uploadPdfSource,
  deleteSourceForWorkspace,
  bulkDeleteSourcesForWorkspace,
} from "../services/source.services.js";

/**
 * Parse and validate the workspace id from the request params.
 */
function parseWorkspaceId(params: Request["params"]) {
  const parsed = workspaceIdParamSchema.safeParse(params);

  if (!parsed.success) {
    throw new ValidationError(
      "Invalid workspace id",
      getZodFieldErrors(parsed.error),
    );
  }

  return parsed.data;
}

/**
 * Parse and validate the source id from the request params.
 */
function parseSourceParams(params: Request["params"]) {
  const parsed = sourceIdParamSchema.safeParse(params);

  if (!parsed.success) {
    throw new ValidationError(
      "Invalid source id",
      getZodFieldErrors(parsed.error),
    );
  }

  return parsed.data;
}

/**
 * Parse and validate the list-sources query parameters from the request.
 */
function parseListQuery(query: Request["query"]) {
  const parsed = listSourcesQuerySchema.safeParse(query);

  if (!parsed.success) {
    throw new ValidationError(
      "Invalid query parameters",
      getZodFieldErrors(parsed.error),
    );
  }

  return parsed.data;
}

/**
 * Parse and validate the request body for creating a new source.
 */
function parseCreateBody(body: unknown) {
  const parsed = createSourceSchema.safeParse(body);

  if (!parsed.success) {
    throw new ValidationError(
      "Validation failed",
      getZodFieldErrors(parsed.error),
    );
  }

  return parsed.data;
}

// Parse and validate the request body for bulk deleting sources.
function parseBulkDeleteBody(body: unknown) {
  const parsed = bulkDeleteSourcesSchema.safeParse(body);

  if (!parsed.success) {
    throw new ValidationError(
      "Validation failed",
      getZodFieldErrors(parsed.error),
    );
  }

  return parsed.data;
}

/**
 * List all sources for the current workspace using the provided filters.
 */
export async function listSources(req: Request, res: Response) {
  const { workspaceId } = parseWorkspaceId(req.params);
  const filters = parseListQuery(req.query);
  const sources = await listSourcesForWorkspace(
    workspaceId,
    req.session.user.id,
    filters,
  );
  res.json(sources);
}

/**
 * Create a new text or markdown source for the authenticated user in the given workspace.
 */
export async function createSource(req: Request, res: Response) {
  const { workspaceId } = parseWorkspaceId(req.params);
  const input = parseCreateBody(req.body);
  const source = await createTextOrMarkdownSource(
    workspaceId,
    req.session.user.id,
    input,
  );
  res.status(201).json(source);
}

export async function getSource(req: Request, res: Response) {
  const { workspaceId, sourceId } = parseSourceParams(req.params);
  const source = await getSourceForWorkspace(
    workspaceId,
    sourceId,
    req.session.user.id,
  );
  res.json(source);
}

export async function deleteSource(req: Request, res: Response) {
  const { workspaceId, sourceId } = parseSourceParams(req.params);
  await deleteSourceForWorkspace(workspaceId, sourceId, req.session.user.id);
  res.status(204).send();
}

export async function bulkDeleteSources(req: Request, res: Response) {
  const { workspaceId } = parseWorkspaceId(req.params);
  const input = parseBulkDeleteBody(req.body);
  await bulkDeleteSourcesForWorkspace(
    workspaceId,
    req.session.user.id,
    input.sourceIds,
  );
  res.status(204).send();
}

/**
 * Upload a PDF source and persist it as a new source entry for the workspace.
 */
export async function uploadPdf(req: Request, res: Response) {
  const { workspaceId } = workspaceIdParamSchema.parse(req.params);

  if (!req.file) {
    throw new ValidationError("PDF file is required");
  }

  const title = typeof req.body.title === "string" ? req.body.title : undefined;

  const source = await uploadPdfSource(
    workspaceId,
    req.session.user.id,
    req.file,
    title,
  );

  res.status(201).json(source);
}

//handle website url import and create a new source entry for the workspace
export async function importWebsite(req: Request, res: Response) {
  const { workspaceId } = workspaceIdParamSchema.parse(req.params);
  const input = importWebsiteSchema.parse(req.body);
  const source = await importWebsiteSource(
    workspaceId,
    req.session.user.id,
    input,
  );
  res.status(201).json(source);
}

//handle youtube url import and create a new source entry for the workspace
export async function importYoutube(req: Request, res: Response) {
  const { workspaceId } = workspaceIdParamSchema.parse(req.params);
  const input = importYoutubeSchema.parse(req.body);
  const source = await importYoutubeSource(
    workspaceId,
    req.session.user.id,
    input,
  );
  res.status(201).json(source);
}
