// it support in memory  buffer and cloudinary url to extract text and pages from pdf
import { extractText, getDocumentProxy } from "unpdf";
import { getSignedCloudinaryDownloadUrl } from "./cloudinary.js";

export type PdfExtractResult = {
  text: string;
  pages: string[];
  pageCount: number;
};

// Downloads a PDF from a URL and returns its content as an ArrayBuffer.
async function downloadPdf(url: string) {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to download PDF (${response.status})`);
  }

  return response.arrayBuffer();
}

// Extracts text and page count from a PDF buffer (ArrayBuffer or Node.js Buffer).
export async function extractPdfFromBuffer(
  buffer: ArrayBuffer | Buffer,
): Promise<PdfExtractResult> {
  const arrayBuffer =
    buffer instanceof Buffer
      ? (buffer.buffer.slice(
          buffer.byteOffset,
          buffer.byteOffset + buffer.byteLength,
        ) as ArrayBuffer)
      : buffer;

  // Use unpdf to extract text and page count from the PDF buffer
  const pdf = await getDocumentProxy(new Uint8Array(arrayBuffer));
  // Extract text from the PDF without merging pages
  const { totalPages, text } = await extractText(pdf, { mergePages: false });

  // Convert the extracted text into an array of pages, trimming whitespace
  const pages = Array.isArray(text)
    ? text.map((page) => page.trim())
    : [String(text).trim()];

  // Join the pages into a single string, separated by double newlines
  const joined = pages.filter(Boolean).join("\n\n");

  if (!joined) {
    throw new Error("No text could be extracted from the PDF");
  }

  return {
    text: joined,
    pages,
    pageCount: totalPages,
  };
}

// Extracts text and page count from a PDF hosted on Cloudinary, using the file URL or public id for signed access.
export async function extractPdfFromCloudinary(input: {
  fileUrl: string;
  publicId?: string;
  resourceType?: "raw" | "image";
}): Promise<PdfExtractResult> {
  try {
    // Download the PDF from the provided file URL and extract text/pages
    const buffer = await downloadPdf(input.fileUrl);

    // Use the buffer to extract text and page count
    return await extractPdfFromBuffer(buffer);
  } catch (error) {
    const isUnauthorized =
      error instanceof Error && error.message.includes("(401)");

    if (!isUnauthorized || !input.publicId) {
      throw error;
    }
    // If the download failed due to unauthorized access, attempt to get a signed URL from Cloudinary
    const signedUrl = getSignedCloudinaryDownloadUrl(
      input.publicId,
      input.resourceType ?? "raw",
    );

    if (!signedUrl) {
      throw new Error(
        "PDF download requires authentication. Add CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET to server/.env, or re-upload the PDF.",
      );
    }

    // Retry the download and extraction using the signed URL
    const buffer = await downloadPdf(signedUrl);

    // Use the buffer to extract text and page count
    return extractPdfFromBuffer(buffer);
  }
}
