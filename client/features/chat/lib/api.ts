import { apiFetch } from "@/shared/lib/api";
import type { ChatMessage, Conversation } from "./types";

// fetch all the conversations for a given workspace
export function listConversations(workspaceId: string) {
  return apiFetch<Conversation[]>(
    `/api/workspaces/${workspaceId}/conversations`,
  );
}

// create a new conversation for a given workspace, optionally with a title
export function createConversation(workspaceId: string, title?: string) {
  return apiFetch<Conversation>(
    `/api/workspaces/${workspaceId}/conversations`,
    {
      method: "POST",
      body: JSON.stringify(title ? { title } : {}),
    },
  );
}

// fetch all the messages for a given conversation in a workspace
export function listConversationMessages(
  workspaceId: string,
  conversationId: string,
) {
  return apiFetch<ChatMessage[]>(
    `/api/workspaces/${workspaceId}/conversations/${conversationId}/messages`,
  );
}

// delete a conversation for a given workspace
export function deleteConversation(
  workspaceId: string,
  conversationId: string,
) {
  return apiFetch<void>(
    `/api/workspaces/${workspaceId}/conversations/${conversationId}`,
    { method: "DELETE" },
  );
}

// Cleans up the citation data (source ID and title) so it's safe to display
export function parseCitations(value: unknown): ChatMessage["citations"] {
  if (!Array.isArray(value)) {
    return null;
  }

  return value.filter(
    (item): item is NonNullable<ChatMessage["citations"]>[number] =>
      typeof item === "object" &&
      item !== null &&
      typeof (item as { sourceId?: unknown }).sourceId === "string" &&
      typeof (item as { sourceTitle?: unknown }).sourceTitle === "string",
  );
}
