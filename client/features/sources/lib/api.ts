import { apiFetch } from "@/shared/lib/api";
import type {
  CreateSourceInput,
  ImportWebsiteInput,
  ImportYoutubeInput,
  Source,
  SourceFilters,
} from "./types";

/**
 * Builds the base URL for a workspace's sources endpoints.
 *
 * @param workspaceId - ID of the workspace
 * @returns The path `/api/workspaces/:workspaceId/sources`
 */
function base(workspaceId: string) {
  return `/api/workspaces/${workspaceId}/sources`;
}

/**
 * Builds a query string from the provided filters.
 *
 * Empty or missing filters are skipped. If no filters are set, the path is
 * returned unchanged.
 *
 * @example
 * withQuery("/api/workspaces/ws_42/sources", { q: "bio notes & exam", type: "PDF", status: "READY" });
 *  "/api/workspaces/ws_42/sources?q=bio+notes+%26+exam&type=PDF&status=READY"
 *
 * @param path - Base path to append the query string to
 * @param filters - Optional search text, type, and status filters
 * @returns The path with a `?query` suffix, or the path alone if there are no filters
 */
function withQuery(path: string, filters?: SourceFilters) {
  const params = new URLSearchParams();
  if (filters?.q) params.set("q", filters.q);
  if (filters?.type) params.set("type", filters.type);
  if (filters?.status) params.set("status", filters.status);
  const query = params.toString();
  return query ? `${path}?${query}` : path;
}

/**
 * Fetches the sources in a workspace, optionally narrowed by filters.
 *
 * Calls GET /api/workspaces/:workspaceId/sources. Read-only.
 *
 * @param workspaceId - ID of the workspace to list sources from
 * @param filters - Optional search text (`q`), `type`, and `status` filters
 * @returns An array of matching sources
 * @throws {ApiError} If the server responds with an error status
 */
export function listSources(workspaceId: string, filters?: SourceFilters) {
  return apiFetch<Source[]>(withQuery(base(workspaceId), filters));
}

/**
 * Fetches a single source in a workspace by its ID.
 *
 * Calls GET /api/workspaces/:workspaceId/sources/:sourceId. Read-only.
 *
 * @param workspaceId - ID of the workspace that owns the source
 * @param sourceId - ID of the source to fetch
 * @returns The source record (title, type, status, etc.)
 * @throws {ApiError} With status 404 if the source does not exist
 */
export function getSource(workspaceId: string, sourceId: string) {
  return apiFetch<Source>(`${base(workspaceId)}/${sourceId}`);
}

/**
 * Creates a source in a workspace from a JSON payload.
 *
 * Calls POST /api/workspaces/:workspaceId/sources.
 *
 * @param workspaceId - ID of the workspace to add the source to
 * @param input - Fields for the new source, as defined by `CreateSourceInput`
 * @returns The created source
 * @throws {ApiError} If the server rejects the input or the request fails
 */
export function createSource(workspaceId: string, input: CreateSourceInput) {
  return apiFetch<Source>(base(workspaceId), {
    method: "POST",
    body: JSON.stringify(input),
  });
}

/**
 * Uploads a PDF file as a new source in a workspace.
 *
 * Calls POST /api/workspaces/:workspaceId/sources/upload with multipart form
 * data. The browser sets the content type, so no JSON header is added.
 *
 * @param workspaceId - ID of the workspace to add the source to
 * @param file - The PDF file to upload
 * @param title - Optional title. If omitted, the server decides the title.
 * @returns The created source
 * @throws {ApiError} If the upload is rejected or the request fails
 */
export function uploadPdfSource(
  workspaceId: string,
  file: File,
  title?: string,
) {
  const form = new FormData();
  form.append("file", file);
  if (title) form.append("title", title);

  return apiFetch<Source>(`${base(workspaceId)}/upload`, {
    method: "POST",
    body: form,
  });
}

/**
 * Adds a website as a source. The server fetches the page from the given URL.
 *
 * Calls POST /api/workspaces/:workspaceId/sources/import/website.
 *
 * @param workspaceId - ID of the workspace to add the source to
 * @param input - The website URL and any other fields from `ImportWebsiteInput`
 * @returns The created source
 * @throws {ApiError} If the server cannot import the website or the request fails
 */
export function importWebsiteSource(
  workspaceId: string,
  input: ImportWebsiteInput,
) {
  return apiFetch<Source>(`${base(workspaceId)}/import/website`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

/**
 * Adds a YouTube video as a source. The server fetches the video from the given URL.
 *
 * Calls POST /api/workspaces/:workspaceId/sources/import/youtube.
 *
 * @param workspaceId - ID of the workspace to add the source to
 * @param input - The YouTube URL and any other fields from `ImportYoutubeInput`
 * @returns The created source
 * @throws {ApiError} If the server cannot import the video or the request fails
 */
export function importYoutubeSource(
  workspaceId: string,
  input: ImportYoutubeInput,
) {
  return apiFetch<Source>(`${base(workspaceId)}/import/youtube`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

/**
 * Deletes a single source from a workspace.
 *
 * Calls DELETE /api/workspaces/:workspaceId/sources/:sourceId.
 *
 * @param workspaceId - ID of the workspace that owns the source
 * @param sourceId - ID of the source to delete
 * @returns Nothing on success
 * @throws {ApiError} If the server responds with an error status
 */
export function deleteSource(workspaceId: string, sourceId: string) {
  return apiFetch<void>(`${base(workspaceId)}/${sourceId}`, {
    method: "DELETE",
  });
}

/**
 * Deletes several sources from a workspace in one request.
 *
 * Calls POST /api/workspaces/:workspaceId/sources/bulk-delete. A POST is used
 * because DELETE requests with a body are unreliable in some clients.
 *
 * @param workspaceId - ID of the workspace that owns the sources
 * @param sourceIds - IDs of the sources to delete
 * @returns Nothing on success
 * @throws {ApiError} If the server responds with an error status
 */
export function bulkDeleteSources(workspaceId: string, sourceIds: string[]) {
  return apiFetch<void>(`${base(workspaceId)}/bulk-delete`, {
    method: "POST",
    body: JSON.stringify({ sourceIds }),
  });
}

// NOTE: the server does not currently expose the reprocess or web-search
// routes. These call the paths the client was written against; they will
// return 404 until the server adds them.

/**
 * Asks the server to reprocess one source, for example to re-extract its text.
 *
 * Calls POST /api/workspaces/:workspaceId/sources/:sourceId/reprocess.
 * The server does not expose this route yet, so this currently returns 404.
 *
 * @param workspaceId - ID of the workspace that owns the source
 * @param sourceId - ID of the source to reprocess
 * @returns The updated source
 * @throws {ApiError} With status 404 until the server adds this route
 */
export function reprocessSource(workspaceId: string, sourceId: string) {
  return apiFetch<Source>(`${base(workspaceId)}/${sourceId}/reprocess`, {
    method: "POST",
  });
}

/**
 * Asks the server to reprocess several sources, or all of them if no IDs are given.
 *
 * Calls POST /api/workspaces/:workspaceId/sources/reprocess. The server does
 * not expose this route yet, so this currently returns 404.
 *
 * @param workspaceId - ID of the workspace that owns the sources
 * @param sourceIds - Optional IDs of the sources to reprocess. If omitted, an empty body is sent.
 * @returns Nothing on success
 * @throws {ApiError} With status 404 until the server adds this route
 */
export function reprocessSources(workspaceId: string, sourceIds?: string[]) {
  return apiFetch<void>(`${base(workspaceId)}/reprocess`, {
    method: "POST",
    body: JSON.stringify(sourceIds ? { sourceIds } : {}),
  });
}

/**
 * Adds a source from a web search result, using the title, content, and URL the client provides.
 *
 * Calls POST /api/workspaces/:workspaceId/sources/import/web-search. The
 * server does not expose this route yet, so this currently returns 404.
 *
 * @param workspaceId - ID of the workspace to add the source to
 * @param input - The title, text content, and URL of the search result
 * @returns The created source
 * @throws {ApiError} With status 404 until the server adds this route
 */
export function importWebSearchSource(
  workspaceId: string,
  input: { title: string; content: string; url: string },
) {
  return apiFetch<Source>(`${base(workspaceId)}/import/web-search`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}
