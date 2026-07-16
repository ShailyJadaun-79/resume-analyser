import { createRequire } from 'module';
import mammoth from 'mammoth';

const require = createRequire(import.meta.url);
const { PDFParse } = require('pdf-parse');

/**
 * Extract raw text from a document buffer based on MIME type.
 * Supports PDF and DOCX files with robust error handling.
 * @param {Buffer} buffer - The raw file buffer.
 * @param {string} mimeType - The file's MIME type.
 * @returns {Promise<string>} The extracted clean plain text.
 */
export const extractTextFromBuffer = async (buffer, mimeType) => {
  if (!buffer || buffer.length === 0) {
    throw new Error('Upload payload is empty. Please select a valid document.');
  }

  // 1. PDF Parsing Pipeline
  if (mimeType === 'application/pdf') {
    try {
      const uint8Array = new Uint8Array(buffer);
      const parser = new PDFParse(uint8Array);
      const result = await parser.getText();
      
      if (!result || !result.text || result.text.trim().length === 0) {
        throw new Error('The PDF document is empty or contains non-extractable text content (e.g. image-only scans).');
      }
      
      return result.text.trim();
    } catch (error) {
      console.error('[PDF Parser Error Context]:', error.message);
      
      // Categorize specific PDF exceptions
      if (error.message.includes('Password') || error.message.includes('password')) {
        throw new Error('This PDF is password-protected. Please upload an unlocked version.');
      }
      if (error.message.includes('structure') || error.message.includes('Invalid') || error.message.includes('corrupted')) {
        throw new Error('The PDF file is corrupted or contains an invalid structure.');
      }
      
      throw new Error(`Failed to parse PDF document: ${error.message}`);
    }
  } 
  
  // 2. DOCX Word Parsing Pipeline
  else if (
    mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    mimeType === 'application/msword'
  ) {
    try {
      const data = await mammoth.extractRawText({ buffer });
      
      if (!data || !data.value || data.value.trim().length === 0) {
        throw new Error('The DOCX document is empty or contains no text content.');
      }
      
      return data.value.trim();
    } catch (error) {
      console.error('[DOCX Parser Error Context]:', error.message);
      throw new Error(`Failed to parse DOCX document: ${error.message}`);
    }
  } 
  
  // 3. Fallback Validation check
  else {
    throw new Error('Unsupported file type. Please upload a PDF or DOCX file.');
  }
};
