import type { PDFDocumentProxy } from "pdfjs-dist";
import * as pdfjsLib from "pdfjs-dist";
import { GlobalWorkerOptions } from "pdfjs-dist";
import type {
  DocumentInitParameters,
  TextItem,
  TextMarkedContent,
  TypedArray,
} from "pdfjs-dist/types/src/display/api";

export type Invoice = {
  vendorName: string | undefined;
  invoiceNo: string | undefined;
  invoiceDate: string | undefined;
  invoiceCosts: number | undefined;
  description: string | undefined;
};

GlobalWorkerOptions.workerSrc = "/js/pdf.worker.min.js";

const getPageText = async (pdf: PDFDocumentProxy, pageNumber: number) => {
  const page = await pdf.getPage(pageNumber);
  const pageText = await page.getTextContent();
  return pageText.items
    .filter((token: TextItem | TextMarkedContent) => {
      return "hasEOL" in token;
    })
    .map((token: TextItem | TextMarkedContent) => {
      if ("hasEOL" in token) {
        return token.str.toLowerCase() + (token.hasEOL ? "\n" : "");
      }
    })
    .join("");
};

export const getPDFText = async (pdf: PDFDocumentProxy) => {
  const pageTextPromises = [];
  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    pageTextPromises.push(getPageText(pdf, pageNumber));
  }
  const pageTexts = await Promise.all(pageTextPromises);
  return pageTexts.join("\n");
};

export const loadPDF = async (
  source: string | URL | TypedArray | ArrayBuffer | DocumentInitParameters
) => {
  const loadingTask = pdfjsLib.getDocument(source);
  const pdf = await loadingTask.promise;
  return await getPDFText(pdf);
};

export const parseData = (pdfContent: string) => {
  console.log(pdfContent);
  const data: Invoice = {
    vendorName: "ds",
    invoiceNo: "",
    invoiceDate: "",
    invoiceCosts: 0,
    description: "",
  };
  const pageTexts: string[] = pdfContent.split("\n");
  for (const pageText of pageTexts) {
    const pageTextLines = pageText.split(/\r?\n/);
    pageTextLines.forEach((pageTextLine) => {
      if (pageTextLine.includes("invoice number")) {
        data.invoiceNo = pageTextLine.match(/\d/g)?.join("");
      }
      if (pageTextLine.includes("invoice date")) {
        if (pageTextLine.match(/\d{2}\/\d{2}\/\d{4}/))
          data.invoiceDate = pageTextLine
            .match(/\d{2}\/\d{2}\/\d{4}/)
            ?.join("");
        if (pageTextLine.match(/\d{2}-\d{2}-\d{4}/))
          data.invoiceDate = pageTextLine.match(/\d{2}-\d{2}-\d{4}/)?.join("");
      }
      if (
        pageTextLine.includes("total") &&
        pageTextLine.split(" ").includes("total")
      ) {
        if (pageTextLine.match(/\d/g)) {
          const val = pageTextLine.match(/\d+(?:\.\d{2})?/)?.join("");
          data.invoiceCosts = val == undefined ? 0 : parseFloat(val);
        }
      }
    });
  }

  return data;
};
