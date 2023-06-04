import parse from "date-fns/parse";
import { nanoid } from "nanoid";
import type { PDFDocumentProxy } from "pdfjs-dist";
import * as pdfjsLib from "pdfjs-dist";
import { GlobalWorkerOptions } from "pdfjs-dist";
import type {
  DocumentInitParameters,
  TextItem,
  TextMarkedContent,
  TypedArray,
} from "pdfjs-dist/types/src/display/api";
import type { SupplierInvoiceWithItems } from "../pages/projects/[projectId]/invoice/import";

GlobalWorkerOptions.workerSrc = "/js/pdf.worker.min.js";

export const extractTextFromPDFDocumentProxy = async (pdf: PDFDocumentProxy) => {
  const pageTextPromises = [];
  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    pageTextPromises.push(extractTextFromPDFPageProxy(pdf, pageNumber));
  }
  const pageTexts = await Promise.all(pageTextPromises);
  return pageTexts.join("\n");
};

const extractTextFromPDFPageProxy = async (pdf: PDFDocumentProxy, pageNumber: number) => {
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

export const extractTextFromFileObject = (source: File) => {
  return new Promise((resolve, reject) => {
    const fileReader = new FileReader();
    fileReader.onload = async () => {
      const result = fileReader.result;
      if (result == null || typeof result == "string") {
        resolve("");
      } else {
        const typedarray = new Uint8Array(result);
        try {
          const text = await extractTextFromFilename(typedarray);
          resolve(text);
        } catch (error) {
          reject(error);
        }
      }
    };
    fileReader.onerror = reject;
    fileReader.readAsArrayBuffer(source);
  });
};

export const extractTextFromFilename = async (
  source: string | URL | TypedArray | ArrayBuffer | DocumentInitParameters
) => {
  const loadingTask = pdfjsLib.getDocument(source);
  try {
    const pdfDocumentProxy = await loadingTask.promise;
    const pdfText = extractTextFromPDFDocumentProxy(pdfDocumentProxy);
    return pdfText;
  } catch (error) {
    throw error;
  }
};

export const parseData = (pdfContent: string) => {
  let start_line = false;

  const data: SupplierInvoiceWithItems = {
    id: "",
    invoiceNo: "",
    invoiceDate: new Date(),
    supplierName: "",
    subtotal: 0,
    taxes: 0,
    discount: 0,
    grandTotal: 0,
    fileId: "",
    budgetId: "",
    supplierInvoiceItems: [],
  };

  const pageTexts: string[] = pdfContent.split("\n");
  for (const pageText of pageTexts) {
    const pageTextLines = pageText.split(/\r?\n/);
    pageTextLines.forEach((pageTextLine) => {
      if (pageTextLine.toLowerCase().includes("invoice number")) {
        data.invoiceNo = pageTextLine.match(/\d/g)?.join("") || "";
      }
      if (pageTextLine.includes("Supplier")) {
        const result = /Supplier (.*)/g.exec(pageTextLine);
        data.supplierName = result && result[1] ? result[1] : "";
      }

      if (pageTextLine == "(RM)") {
        start_line = true;
      }

      if (pageTextLine == "Total") {
        start_line = false;
      }

      if (start_line) {
        const result =
          /^(\d+)\s+(\d+)\s+(\w+)\s+(.*)\s+(\d+.\d+)\s+(\d+.\d+)/.exec(
            pageTextLine
          );
        if (result) {
          data.supplierInvoiceItems.push({
            id: nanoid(),
            description: result[4] || "",
            quantity: parseFloat(result[2] || ""),
            unit: result[3] || "",
            unitPrice: parseFloat(result[5] || ""),
            totalPrice: parseFloat(result[6] || ""),
          });
        }
      }

      if (pageTextLine.includes("Invoice Date")) {
        if (pageTextLine.match(/\d{2}\/\d{2}\/\d{4}/)) {
          const dateString = pageTextLine
            .match(/\d{2}\/\d{2}\/\d{4}/)
            ?.join("");
          if (dateString != undefined)
            data.invoiceDate = parse(dateString, "dd/MM/yyyy", new Date());
        }
        if (pageTextLine.match(/\d{2}-\d{2}-\d{4}/)) {
          const dateString = pageTextLine.match(/\d{2}-\d{2}-\d{4}/)?.join("");
          if (dateString != undefined)
            data.invoiceDate = parse(dateString, "dd-MM-yyyy", new Date());
        }
      }
      if (
        pageTextLine.includes("Subtotal") &&
        pageTextLine.split(" ").includes("Subtotal")
      ) {
        if (pageTextLine.match(/\d/g)) {
          const val = pageTextLine.match(/\d+(?:\.\d{2})?/)?.join("");
          data.subtotal = val == undefined ? 0 : parseFloat(val);
        }
      }
      if (
        pageTextLine.includes("Sales Tax") &&
        pageTextLine.split(" ").includes("Sales Tax")
      ) {
        if (pageTextLine.match(/\d/g)) {
          const val = pageTextLine.match(/\d+(?:\.\d{2})?/)?.join("");
          data.taxes = val == undefined ? 0 : parseFloat(val);
        }
      }
      if (
        pageTextLine.includes("Total") &&
        pageTextLine.split(" ").includes("Total")
      ) {
        if (pageTextLine.match(/\d/g)) {
          const val = pageTextLine.match(/\d+(?:\.\d{2})?/)?.join("");
          data.grandTotal = val == undefined ? 0 : parseFloat(val);
        }
      }
    });
  }

  return data;
};
