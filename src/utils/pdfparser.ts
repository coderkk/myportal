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
import type { SupplierInvoiceWithDetails } from "../pages/projects/[projectId]/invoice/import";

GlobalWorkerOptions.workerSrc = "/js/pdf.worker.min.js";

export const getPDFText = async (pdf: PDFDocumentProxy) => {
  const pageTextPromises = [];
  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    pageTextPromises.push(getPageText(pdf, pageNumber));
  }
  return await Promise.all(pageTextPromises)
    .then((res) => {
      return res.join("\n");
    })
    .catch((error) => {
      throw error;
    });
};

const getPageText = async (pdf: PDFDocumentProxy, pageNumber: number) => {
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

export const loadFileObject = async (source: File) => {
  return new Promise((resolve, reject) => {
    const fileReader = new FileReader();
    fileReader.onload = async () => {
      const result = fileReader.result;
      if (result == null || typeof result == "string") {
        resolve("");
      } else {
        const typedarray = new Uint8Array(result);
        await loadFilename(typedarray)
          .then((text) => {
            resolve(text);
          })
          .catch((error) => {
            reject(error);
          });
      }
    };
    fileReader.onerror = reject;
    fileReader.readAsArrayBuffer(source);
  });
};

export const loadFilename = async (
  source: string | URL | TypedArray | ArrayBuffer | DocumentInitParameters
) => {
  const loadingTask = pdfjsLib.getDocument(source);
  return await loadingTask.promise
    .then(async (pdf) => {
      return await getPDFText(pdf)
        .then((res) => {
          return res;
        })
        .catch((error) => {
          throw error;
        });
    })
    .catch((error: Error) => {
      throw error;
    });
};

export const parseData = (pdfContent: string) => {
  let supplier = false;
  let vendor = false;
  let start_line = false;

  const data: SupplierInvoiceWithDetails = {
    id: "",
    invoiceNo: "",
    invoiceDate: new Date(),
    vendorName: "",
    vendorAddress: "",
    vendorPhone: "",
    supplierName: "",
    supplierAddress: "",
    supplierPhone: "",
    description: "",
    amount: 0,
    taxAmount: 0,
    totalAmount: 0,
    fileId: "",
    budgetId: "",
    supplierInvoiceDetails: [],
  };

  const pageTexts: string[] = pdfContent.split("\n");
  for (const pageText of pageTexts) {
    const pageTextLines = pageText.split(/\r?\n/);
    pageTextLines.forEach((pageTextLine) => {
      if (pageTextLine.toLowerCase().includes("invoice number")) {
        data.invoiceNo = pageTextLine.match(/\d/g)?.join("") || "";
      }
      if (pageTextLine.includes("Supplier")) {
        supplier = true;
        vendor = false;
        const result = /Supplier (.*)/g.exec(pageTextLine);
        data.supplierName = result && result[1] ? result[1] : "";
      }
      if (pageTextLine.includes("Recipient")) {
        vendor = true;
        supplier = false;
        const result = /Recipient (.*)/g.exec(pageTextLine);
        data.vendorName = result && result[1] ? result[1] : "";
      }
      if (pageTextLine.includes("Address")) {
        const result = /Address (.*)/g.exec(pageTextLine);
        const address = result && result[1] ? result[1] : "";
        if (supplier) {
          data.supplierAddress = address;
        } else if (vendor) {
          data.vendorAddress = address;
        }
      }
      if (pageTextLine.includes("Phone")) {
        const result = /Phone (.*)/g.exec(pageTextLine);
        const phone = result && result[1] ? result[1] : "";
        if (supplier) {
          data.supplierPhone = phone;
        } else if (vendor) {
          data.vendorPhone = phone;
        }
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
          data.supplierInvoiceDetails.push({
            id: nanoid(),
            quantity: parseFloat(result[2] || ""),
            uom: result[3] || "",
            description: result[4] || "",
            unitPrice: parseFloat(result[5] || ""),
            discount: 0,
            amount: parseFloat(result[6] || ""),
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
          data.amount = val == undefined ? 0 : parseFloat(val);
        }
      }
      if (
        pageTextLine.includes("Sales Tax") &&
        pageTextLine.split(" ").includes("Sales Tax")
      ) {
        if (pageTextLine.match(/\d/g)) {
          const val = pageTextLine.match(/\d+(?:\.\d{2})?/)?.join("");
          data.amount = val == undefined ? 0 : parseFloat(val);
        }
      }
      if (
        pageTextLine.includes("Total") &&
        pageTextLine.split(" ").includes("Total")
      ) {
        if (pageTextLine.match(/\d/g)) {
          const val = pageTextLine.match(/\d+(?:\.\d{2})?/)?.join("");
          data.totalAmount = val == undefined ? 0 : parseFloat(val);
        }
      }
    });
  }

  return data;
};
