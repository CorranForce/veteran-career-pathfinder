/**
 * Extract text content from a PDF buffer
 * @param pdfBuffer - Buffer containing PDF file data
 * @returns Extracted text content
 */
export async function extractPdfText(pdfBuffer: Buffer): Promise<string> {
  try {
    // Use require for CommonJS module compatibility
    const pdfParse = require("pdf-parse");
    const data = await pdfParse(pdfBuffer);
    return data.text;
  } catch (error) {
    console.error("[PDF Extractor] Failed to extract text:", error);
    throw new Error("Failed to extract text from PDF");
  }
}

/**
 * Extract text from a PDF file URL
 * @param fileUrl - URL to the PDF file
 * @returns Extracted text content
 */
export async function extractPdfTextFromUrl(fileUrl: string): Promise<string> {
  try {
    const response = await fetch(fileUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch PDF: ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    return await extractPdfText(buffer);
  } catch (error) {
    console.error("[PDF Extractor] Failed to extract text from URL:", error);
    throw new Error("Failed to extract text from PDF URL");
  }
}

/**
 * Clean and normalize extracted text
 * - Remove excessive whitespace
 * - Normalize line breaks
 * - Remove special characters that might interfere with analysis
 */
export function cleanExtractedText(text: string): string {
  return text
    .replace(/\s+/g, " ") // Replace multiple spaces with single space
    .replace(/\n\s*\n/g, "\n") // Remove empty lines
    .trim();
}
