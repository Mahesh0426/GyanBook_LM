import type { UIMessage } from "ai";
import type { ChatCitation, ChatMessage, Conversation } from "../lib/types";

//extract the text content from a message, whether it's a UIMessage or a ChatMessage
function getMessageText(message: UIMessage | ChatMessage) {
  if ("parts" in message) {
    return message.parts
      .filter((part) => part.type === "text")
      .map((part) => part.text)
      .join("");
  }

  return message.content;
}

// format a citation for markdown export
function formatCitation(citation: ChatCitation) {
  if (citation.sourceType === "WEB" && "url" in citation) {
    const webCitation = citation as ChatCitation & { url?: string };
    return `- [${citation.sourceTitle}](${webCitation.url ?? ""})\n  ${citation.excerpt}`;
  }

  const page = citation.page !== undefined ? `, page ${citation.page}` : "";
  return `- ${citation.sourceTitle} (${citation.sourceType}${page})\n  ${citation.excerpt}`;
}

// export the conversation and its messages to markdown format
export function exportConversationMarkdown(input: {
  conversation?: Conversation | null;
  messages: Array<UIMessage | ChatMessage>;
  citationsByMessageId?: Record<string, ChatCitation[]>;
}) {
  const title = input.conversation?.title ?? "Chat export";
  const lines = [
    `# ${title}`,
    "",
    `_Exported ${new Date().toLocaleString()}_`,
    "",
  ];

  for (const message of input.messages) {
    const role =
      ("role" in message ? message.role : "user") === "user"
        ? "You"
        : "Assistant";
    lines.push(`## ${role}`, "", getMessageText(message), "");

    const messageId = "id" in message ? message.id : undefined;
    const citations =
      messageId && input.citationsByMessageId
        ? input.citationsByMessageId[messageId]
        : "citations" in message
          ? message.citations
          : null;

    if (citations?.length) {
      lines.push("### Sources", "");
      for (const citation of citations) {
        lines.push(formatCitation(citation));
      }
      lines.push("");
    }
  }

  return lines.join("\n");
}

// download the markdown content as a file
export function downloadMarkdown(content: string, filename: string) {
  const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}
