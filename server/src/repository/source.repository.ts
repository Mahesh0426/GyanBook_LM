import { Prisma } from "../generated/prisma/client.js";
import prisma from "../lib/db.js";
import { ListSourcesQuery } from "../validators/source.validator.js";

export const sourceSelect = {
  id: true,
  workspaceId: true,
  type: true,
  title: true,
  content: true,
  url: true,
  status: true,
  metadata: true,
  createdAt: true,
  updatedAt: true,
} as const;

// Input payload used to create a new source record for a workspace.
export type CreateSourceData = {
  workspaceId: string;
  type: Prisma.SourceCreateInput["type"];
  title: string;
  content?: string | null;
  url?: string | null;
  status?: Prisma.SourceCreateInput["status"];
  metadata?: Prisma.InputJsonValue;
};

// Define the shape of a source record returned from the database, including selected fields.
export type SourceRecord = Prisma.SourceGetPayload<{
  select: typeof sourceSelect;
}>;

// Retrieve sources belonging to a workspace, optionally filtered by type, status, or search text.
export function findSourcesByWorkspaceId(
  workspaceId: string,
  filters: ListSourcesQuery = {},
) {
  const where: Prisma.SourceWhereInput = { workspaceId };

  if (filters.type) {
    where.type = filters.type;
  }

  if (filters.status) {
    where.status = filters.status;
  }

  if (filters.q) {
    where.OR = [
      { title: { contains: filters.q, mode: "insensitive" } },
      { content: { contains: filters.q, mode: "insensitive" } },
    ];
  }

  return prisma.source.findMany({
    where,
    select: sourceSelect,
    orderBy: { createdAt: "desc" },
  });
}

// Create a new source record in the database using the provided payload.
export function createSourceRecord(data: CreateSourceData) {
  return prisma.source.create({
    data: {
      workspaceId: data.workspaceId,
      type: data.type,
      title: data.title,
      content: data.content ?? null,
      url: data.url ?? null,
      status: data.status ?? "PENDING",
      metadata: data.metadata,
    },
    select: sourceSelect,
  });
}

// Retrieve a source record by its ID and workspace ID, returning null if not found.
export function findSourceByIdAndWorkspaceId(
  sourceId: string,
  workspaceId: string,
) {
  return prisma.source.findFirst({
    where: { id: sourceId, workspaceId },
    select: sourceSelect,
  });
}

// Delete a source record from the database by its ID.
export async function deleteSourceRecord(sourceId: string) {
  await prisma.source.delete({
    where: { id: sourceId },
  });
}

// Retrieve a source record by its ID, returning null if not found.
export function findSourceById(sourceId: string) {
  return prisma.source.findUnique({
    where: { id: sourceId },
    select: sourceSelect,
  });
}

// Update a source record in the database with the provided data, returning the updated record.
export function updateSourceRecord(
  sourceId: string,
  data: {
    content?: string | null;
    status?: SourceRecord["status"];
    metadata?: Prisma.InputJsonValue;
  },
) {
  return prisma.source.update({
    where: { id: sourceId },
    data,
    select: sourceSelect,
  });
}
