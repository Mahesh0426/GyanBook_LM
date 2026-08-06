import multer from "multer";

/* Client
   |
   | Upload PDF
   |
Multer
   |
Express Route
*/

const MAX_PDF_SIZE_BYTES = 10 * 1024 * 1024;

// Multer middleware for handling PDF uploads
export const pdfUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_PDF_SIZE_BYTES },

  // Filter to only accept PDF files
  fileFilter: (_req, file, callback) => {
    if (file.mimetype === "application/pdf") {
      callback(null, true);
      return;
    }

    callback(new Error("Only PDF files are allowed"));
  },
});

export const uploadSinglePdf = pdfUpload.single("file");
