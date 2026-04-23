const fs = require("fs").promises;
const pdfParse = require("pdf-parse");

// Strategy for extracting text from PDF files
class PDFExtractionStrategy {
  async extract(filePath) {
    const buffer = await fs.readFile(filePath);
    const data = await pdfParse(buffer);
    
    return {
      text: data.text,
      pages: data.numpages,
    };
  }
}

module.exports = PDFExtractionStrategy;
