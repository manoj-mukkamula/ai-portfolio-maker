// utils/resumeParser.js — Resume text extraction
// Supports PDF (pdf-parse) and DOCX (mammoth).
// Returns clean plain text ready to be sent to Gemini.

const pdfParse = require("pdf-parse");
const mammoth = require("mammoth");
const path = require("path");

/**
 * Extracts plain text from a PDF buffer.
 * @param {Buffer} buffer
 * @returns {string}
 */
const extractFromPDF = async (buffer) => {
  try {
    const data = await pdfParse(buffer);
    const text = data.text?.trim();
    if (!text) throw new Error("PDF appears to be empty or image-only (scanned).");
    return text;
  } catch (err) {
    throw new Error(`PDF parsing failed: ${err.message}`);
  }
};

/**
 * Extracts plain text from a DOCX buffer.
 * @param {Buffer} buffer
 * @returns {string}
 */
const extractFromDOCX = async (buffer) => {
  try {
    const result = await mammoth.extractRawText({ buffer });
    const text = result.value?.trim();
    if (!text) throw new Error("DOCX file appears to be empty.");
    return text;
  } catch (err) {
    throw new Error(`DOCX parsing failed: ${err.message}`);
  }
};

/**
 * Main entry point — auto-detects file type by MIME type or extension.
 * @param {Buffer} buffer - File buffer from multer (memoryStorage).
 * @param {string} mimetype - MIME type from multer (e.g. "application/pdf").
 * @param {string} originalname - Original filename (used as fallback).
 * @returns {string} - Extracted text.
 */
const parseResume = async (buffer, mimetype, originalname = "") => {
  const ext = path.extname(originalname).toLowerCase();

  const isPDF =
    mimetype === "application/pdf" || ext === ".pdf";

  const isDOCX =
    mimetype ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    ext === ".docx";

  if (isPDF) return extractFromPDF(buffer);
  if (isDOCX) return extractFromDOCX(buffer);

  throw new Error(
    "Unsupported file type. Only PDF and DOCX are accepted."
  );
};

module.exports = { parseResume };
