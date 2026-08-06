import { findChunksBySourceId } from "../repository/source-chunk.repository.js";
import { findSourceById } from "../repository/source.repository.js";
import {
  chunkSourceContent,
  embedAndIndexSource,
  extractSourceContent,
  markSourceFailed,
  markSourceProcessing,
} from "../services/source-processing.services.js";
import { inngest } from "./client.js";

export const processSource = inngest.createFunction(
  {
    id: "process-source",
    retries: 3,
    triggers: [{ event: "source/created" }],
  },
  async ({ event, step }) => {
    const { sourceId } = event.data;

    // Mark the source as processing before starting the steps
    await step.run("mark-processing", () => markSourceProcessing(sourceId));

    try {
      // Step 1: Extract content from the source
      const extracted = await step.run("extract-content", () =>
        extractSourceContent(sourceId),
      );
      // Step 2: Chunk the extracted content
      await step.run("chunk-content", () =>
        chunkSourceContent(sourceId, extracted.text, extracted.pages),
      );
      // Step 3: Embed and index the chunks
      const result = await step.run("embed-and-index", async () => {
        const source = await findSourceById(sourceId);
        if (!source) {
          throw new Error("Source not found");
        }

        // Find the chunks for the source
        const chunks = await findChunksBySourceId(sourceId);

        // Embed and index the chunks
        await embedAndIndexSource(source, chunks);

        return { chunkCount: chunks.length };
      });

      return { sourceId, status: "READY", ...result };
    } catch (error) {
      // If any step fails, mark the source as failed and rethrow the error
      await step.run("mark-failed", async () => {
        // Attempt to find the source and mark it as failed
        const source = await findSourceById(sourceId);
        if (source) {
          // Mark the source as failed with the error message and metadata
          await markSourceFailed(sourceId, error, source.metadata);
        }
      });
      throw error;
    }
  },
);

export const functions = [processSource];
