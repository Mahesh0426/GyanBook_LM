"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ApiError } from "@/shared/lib/api";
import { useDebouncedValue } from "@/shared/hooks/use-debounced-value";
import {
  bulkDeleteSources,
  createSource,
  deleteSource,
  getSource,
  importWebsiteSource,
  importWebSearchSource,
  importYoutubeSource,
  listSources,
  reprocessSource,
  reprocessSources,
  uploadPdfSource,
} from "../lib/api";
import type {
  CreateSourceInput,
  ImportWebsiteInput,
  ImportYoutubeInput,
  SourceFilters,
} from "../lib/types";

// Builds the React Query cache keys for a workspace's sources (all, list, and detail).
export function sourceKeys(workspaceId: string) {
  return {
    all: ["sources", workspaceId] as const,
    list: (filters?: SourceFilters) =>
      ["sources", workspaceId, "list", filters ?? {}] as const,
    detail: (sourceId: string) => ["sources", workspaceId, sourceId] as const,
  };
}

// Fetches the workspace's sources with debounced search, and polls while any source(pdf,docs) are processing or pending.
export function useSources(workspaceId: string, filters: SourceFilters = {}) {
  const debouncedQuery = useDebouncedValue(filters.q ?? "", 300);
  const queryFilters: SourceFilters = {
    ...filters,
    q: debouncedQuery || undefined,
  };

  return useQuery({
    queryKey: sourceKeys(workspaceId).list(queryFilters),
    queryFn: () => listSources(workspaceId, queryFilters),
    refetchInterval: (query) => {
      const hasProcessing = query.state.data?.some(
        (source) =>
          source.status === "PENDING" || source.status === "PROCESSING",
      );
      return hasProcessing ? 3000 : false;
    },
  });
}

// Fetches one source, polls while it is processing, and does not retry on 404.
export function useSource(workspaceId: string, sourceId: string) {
  return useQuery({
    queryKey: sourceKeys(workspaceId).detail(sourceId),
    queryFn: () => getSource(workspaceId, sourceId),
    retry: (_, error) => !(error instanceof ApiError && error.status === 404),
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return status === "PENDING" || status === "PROCESSING" ? 3000 : false;
    },
  });
}

// Creates a source from a JSON payload, then refreshes the workspace's source data.
export function useCreateSource(workspaceId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateSourceInput) => createSource(workspaceId, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: sourceKeys(workspaceId).all,
      });
    },
  });
}

// Uploads a PDF as a new source, then refreshes the workspace's source data.
export function useUploadPdfSource(workspaceId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ file, title }: { file: File; title?: string }) =>
      uploadPdfSource(workspaceId, file, title),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: sourceKeys(workspaceId).all,
      });
    },
  });
}

// Imports a website as a source, then refreshes the workspace's source data.
export function useImportWebsiteSource(workspaceId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: ImportWebsiteInput) =>
      importWebsiteSource(workspaceId, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: sourceKeys(workspaceId).all,
      });
    },
  });
}

// Imports a YouTube video as a source, then refreshes the workspace's source data.
export function useImportYoutubeSource(workspaceId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: ImportYoutubeInput) =>
      importYoutubeSource(workspaceId, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: sourceKeys(workspaceId).all,
      });
    },
  });
}

// Deletes one source, removes its cached detail, then refreshes the workspace's source data.
export function useDeleteSource(workspaceId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sourceId: string) => deleteSource(workspaceId, sourceId),
    onSuccess: (_, sourceId) => {
      queryClient.removeQueries({
        queryKey: sourceKeys(workspaceId).detail(sourceId),
      });
      void queryClient.invalidateQueries({
        queryKey: sourceKeys(workspaceId).all,
      });
    },
  });
}

// Deletes several sources at once, then refreshes the workspace's source data.
export function useBulkDeleteSources(workspaceId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sourceIds: string[]) =>
      bulkDeleteSources(workspaceId, sourceIds),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: sourceKeys(workspaceId).all,
      });
    },
  });
}

// Asks the server to reprocess several sources, then refreshes the workspace's source data.
export function useReprocessSources(workspaceId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sourceIds?: string[]) =>
      reprocessSources(workspaceId, sourceIds),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: sourceKeys(workspaceId).all,
      });
    },
  });
}

// Asks the server to reprocess one source, then refreshes its detail and the source list.
export function useReprocessSource(workspaceId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sourceId: string) => reprocessSource(workspaceId, sourceId),
    onSuccess: (_, sourceId) => {
      void queryClient.invalidateQueries({
        queryKey: sourceKeys(workspaceId).detail(sourceId),
      });
      void queryClient.invalidateQueries({
        queryKey: sourceKeys(workspaceId).all,
      });
    },
  });
}

// Adds a source from a web search result, then refreshes the workspace's source data.
export function useImportWebSearchSource(workspaceId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: { title: string; content: string; url: string }) =>
      importWebSearchSource(workspaceId, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: sourceKeys(workspaceId).all,
      });
    },
  });
}
