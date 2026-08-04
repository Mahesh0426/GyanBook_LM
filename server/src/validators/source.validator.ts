import { z } from "zod";

// Valid source types supported by the system
export const sourceTypeSchema = z.enum([
  "PDF",
  "WEBSITE",
  "YOUTUBE",
  "TEXT",
  "MARKDOWN",
]);

// Valid status values for source processing lifecycle
export const sourceStatusSchema = z.enum([
  "PENDING",
  "PROCESSING",
  "READY",
  "FAILED",
]);

// URL parameter validation: requires a non-empty workspaceId
export const workspaceIdParamSchema = z.object({
  workspaceId: z.string().trim().min(1),
});

// URL parameter validation: requires non-empty workspaceId and sourceId
export const sourceIdParamSchema = z.object({
  workspaceId: z.string().trim().min(1),
  sourceId: z.string().trim().min(1),
});

// Schema validation for query filters when listing sources
export const listSourcesQuerySchema = z.object({
  q: z.string().trim().optional(),
  type: sourceTypeSchema.optional(),
  status: sourceStatusSchema.optional(),
});

// Payload validation schema for creating a plain text source
export const createTextSourceSchema = z.object({
  type: z.literal("TEXT"),
  title: z.string().trim().min(1, "Title is required").max(200),
  content: z.string().trim().min(1, "Content is required"),
});

// Payload validation schema for creating a markdown source
export const createMarkdownSourceSchema = z.object({
  type: z.literal("MARKDOWN"),
  title: z.string().trim().min(1, "Title is required").max(200),
  content: z.string().trim().min(1, "Content is required"),
});

// Discriminated union combining TEXT and MARKDOWN source schemas based on the "type" field
export const createSourceSchema = z.discriminatedUnion("type", [
  createTextSourceSchema,
  createMarkdownSourceSchema,
]);

// Payload validation schema for importing content from a website URL
export const importWebsiteSchema = z.object({
  url: z.string().trim().url("Enter a valid URL"),
  title: z.string().trim().max(200).optional(),
});

// Payload validation schema for importing content/transcript from a YouTube URL
export const importYoutubeSchema = z.object({
  url: z.string().trim().min(1, "YouTube URL is required"),
  title: z.string().trim().max(200).optional(),
});

// Validation schema for bulk deleting multiple sources by array of IDs
export const bulkDeleteSourcesSchema = z.object({
  sourceIds: z.array(z.string().trim().min(1)).min(1),
});

// Validation schema for re-triggering processing for multiple source IDs
export const reprocessSourcesSchema = z.object({
  sourceIds: z.array(z.string().trim().min(1)).optional(),
});

// Payload validation schema for importing web search results as a source
export const importWebSearchSchema = z.object({
  title: z.string().trim().min(1).max(200),
  content: z.string().trim().min(1),
  url: z.string().trim().url(),
});

// TypeScript types inferred automatically from Zod schemas
export type CreateSourceInput = z.infer<typeof createSourceSchema>;
export type ListSourcesQuery = z.infer<typeof listSourcesQuerySchema>;
export type ImportWebsiteInput = z.infer<typeof importWebsiteSchema>;
export type ImportYoutubeInput = z.infer<typeof importYoutubeSchema>;
export type BulkDeleteSourcesInput = z.infer<typeof bulkDeleteSourcesSchema>;
export type ReprocessSourcesInput = z.infer<typeof reprocessSourcesSchema>;
export type ImportWebSearchInput = z.infer<typeof importWebSearchSchema>;
