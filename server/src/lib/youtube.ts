import { YoutubeTranscript } from "youtube-transcript";
import { ValidationError } from "../types/app-error.js";

// Fetches the transcript of a YouTube video given its URL.
// If the URL is invalid or if the transcript cannot be fetched, it throws a ValidationError.
export async function fetchYoutubeTranscript(url: string) {
  // Extract the video ID from the provided YouTube URL using regex patterns for different URL formats
  const videoId =
    url.match(
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([\w-]{11})/,
    )?.[1] ?? url.match(/youtube\.com\/shorts\/([\w-]{11})/)?.[1];

  if (!videoId) {
    throw new ValidationError("Enter a valid YouTube URL");
  }

  try {
    // Fetch the transcript segments for the video
    const segments = await YoutubeTranscript.fetchTranscript(videoId);

    // Combine the text from all segments into a single string
    const content = segments
      .map((segment) => segment.text)
      .join(" ")
      .trim();

    if (!content) {
      throw new ValidationError("No transcript found for this video");
    }

    return { videoId, content };
  } catch {
    throw new ValidationError(
      "Could not fetch transcript. The video may not have captions.",
    );
  }
}
