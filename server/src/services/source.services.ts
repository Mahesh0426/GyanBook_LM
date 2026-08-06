import { uploadPdfToCloudinary } from "../lib/cloudinary.js";
import { scrapeWebsite } from "../lib/firecrawl.js";
import { extractPdfFromBuffer } from "../lib/pdf.js";
import { fetchYoutubeTranscript } from "../lib/youtube.js";
import {
  createSourceRecord,
  findSourcesByWorkspaceId,
  findSourceByIdAndWorkspaceId,
  deleteSourceRecord,
  type SourceRecord,
} from "../repository/source.repository.js";
import {
  CreateSourceInput,
  ImportWebsiteInput,
  ImportYoutubeInput,
  ListSourcesQuery,
} from "../validators/source.validator.js";
import { getWorkspaceByIdForUser } from "./workspace.services.js";
import { NotFoundError } from "../types/app-error.js";
import { enqueueSourceProcessing } from "../lib/source-events.js";

/**
 * Ensure the user has access to the workspace by delegating to workspace services.
 * Throws if the workspace does not exist or does not belong to the user.
 */
async function assertWorkspaceAccess(workspaceId: string, userId: string) {
  await getWorkspaceByIdForUser(workspaceId, userId);
}

// Create a source record and initiate processing (e.g., ingestion, embedding).
async function createAndProcessSource(
  data: Parameters<typeof createSourceRecord>[0],
) {
  const source = await createSourceRecord(data);

  await enqueueSourceProcessing({
    sourceId: source.id,
    workspaceId: source.workspaceId,
  });

  return source;
}

/**
 * List sources for a given workspace after verifying user access.
 * Accepts optional filters to narrow results and returns repository records.
 */
export async function listSourcesForWorkspace(
  workspaceId: string,
  userId: string,
  filters: ListSourcesQuery = {},
) {
  await assertWorkspaceAccess(workspaceId, userId);
  return findSourcesByWorkspaceId(workspaceId, filters);
}

// Retrieve a source for a workspace after verifying user access.
export async function getSourceForWorkspace(
  workspaceId: string,
  sourceId: string,
  userId: string,
): Promise<SourceRecord> {
  await assertWorkspaceAccess(workspaceId, userId);

  const source = await findSourceByIdAndWorkspaceId(sourceId, workspaceId);

  if (!source) {
    throw new NotFoundError("Source not found");
  }

  return source;
}

// Delete a source for a workspace after verifying user access.
export async function deleteSourceForWorkspace(
  workspaceId: string,
  sourceId: string,
  userId: string,
) {
  await getSourceForWorkspace(workspaceId, sourceId, userId);
  await deleteSourceRecord(sourceId);
}

// Bulk delete sources for a workspace after verifying user access.
export async function bulkDeleteSourcesForWorkspace(
  workspaceId: string,
  userId: string,
  sourceIds: string[],
) {
  await assertWorkspaceAccess(workspaceId, userId);

  for (const sourceId of sourceIds) {
    await deleteSourceForWorkspace(workspaceId, sourceId, userId);
  }
}

/**
 * Create a text or markdown source in the workspace after verifying access.
 * Currently delegates to a create-and-process workflow (call commented out).
 */
export async function createTextOrMarkdownSource(
  workspaceId: string,
  userId: string,
  input: CreateSourceInput,
) {
  await assertWorkspaceAccess(workspaceId, userId);

  // return createAndProcessSource({
  //     workspaceId,
  //     type: input.type,
  //     title: input.title,
  //     content: input.content,
  //     status: "PENDING",
  // });
}

/**
 * Import a website by URL: scrape the site, convert to markdown, and
 * create a WEBSITE source record for processing.
 */
export async function importWebsiteSource(
  workspaceId: string,
  userId: string,
  input: ImportWebsiteInput,
) {
  await getWorkspaceByIdForUser(workspaceId, userId);

  const scraped = await scrapeWebsite(input.url);

  return createAndProcessSource({
    workspaceId,
    type: "WEBSITE",
    title: input.title || scraped.title || input.url,
    content: scraped.markdown,
    url: scraped.sourceUrl,
    status: "PENDING",
    metadata: {
      importedFrom: scraped.sourceUrl,
    },
  });
}

// Upload PDF source: (commented out) Uploads a PDF to cloud storage,
// extracts text/pages, and creates a PDF source record for processing.
export async function uploadPdfSource(
  workspaceId: string,
  userId: string,
  file: Express.Multer.File,
  title?: string,
) {
  await getWorkspaceByIdForUser(workspaceId, userId);

  const upload = await uploadPdfToCloudinary(file.buffer, file.originalname);

  let content: string | null = null;
  let pageCount: number | undefined;

  try {
    const extracted = await extractPdfFromBuffer(file.buffer);
    content = extracted.text;
    pageCount = extracted.pageCount;
  } catch {
    // Inngest will retry extraction from Cloudinary if upload-time parse fails.
  }

  return createAndProcessSource({
    workspaceId,
    type: "PDF",
    title: title?.trim() || file.originalname.replace(/\.pdf$/i, ""),
    content,
    status: "PENDING",
    metadata: {
      fileUrl: upload.secureUrl,
      fileName: upload.originalFilename,
      fileSize: upload.bytes,
      publicId: upload.publicId,
      resourceType: upload.resourceType,
      pageCount,
    },
  });
}

// Import a YouTube video by URL: fetch the transcript and create a YOUTUBE source record for processing.
export async function importYoutubeSource(
  workspaceId: string,
  userId: string,
  input: ImportYoutubeInput,
) {
  await getWorkspaceByIdForUser(workspaceId, userId);

  const transcript = await fetchYoutubeTranscript(input.url);

  return createAndProcessSource({
    workspaceId,
    type: "YOUTUBE",
    title: input.title || `YouTube: ${transcript.videoId}`,
    content: transcript.content,
    url: input.url,
    status: "PENDING",
    metadata: {
      videoId: transcript.videoId,
    },
  });
}
