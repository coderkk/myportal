import type { PDFDocumentProxy } from "pdfjs-dist";
import type {
  TextItem,
  TextMarkedContent,
} from "pdfjs-dist/types/src/display/api";

// GlobalWorkerOptions.workerSrc = "/js/pdf.worker.min.js";

export const extractTextFromPDFDocumentProxy = async (
  pdf: PDFDocumentProxy
) => {
  const pageTextPromises = [];
  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    pageTextPromises.push(extractTextFromPDFPageProxy(pdf, pageNumber));
  }
  const pageTexts = await Promise.all(pageTextPromises);
  return pageTexts.join("\n");
};

const extractTextFromPDFPageProxy = async (
  pdf: PDFDocumentProxy,
  pageNumber: number
) => {
  const page = await pdf.getPage(pageNumber);
  const pageText = await page.getTextContent();
  return pageText.items
    .filter((token: TextItem | TextMarkedContent) => {
      return "hasEOL" in token;
    })
    .map((token: TextItem | TextMarkedContent) => {
      if ("hasEOL" in token) {
        return token.str + (token.hasEOL ? "\n" : "");
      }
    })
    .join("");
};
