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
  supplierName: string | undefined;
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
  return await Promise.all(pageTextPromises).then(
    res => {
      return res.join("\n");
    }
  ).catch(error => {throw error});
}


export const loadFilename = async (
  source: string | URL | TypedArray | ArrayBuffer | DocumentInitParameters
) => {
  const loadingTask = pdfjsLib.getDocument(source);
  return await loadingTask.promise.then(async (pdf) => {
    return await getPDFText(pdf).then(res => { 
      return res
    }).catch(error => {throw error});
  }).catch((error: Error) => {
    throw error;
  });
  
};

export const loadFileObject = async (
  source: File
) => {
  return new Promise((resolve, reject) => {
    const fileReader = new FileReader();
    fileReader.onload = async () => {
      const result = fileReader.result;
      if (result == null || typeof(result) == "string") {
        resolve("");
      } else {
        const typedarray = new Uint8Array(result);
        await loadFilename(typedarray).then((text) => {
          resolve(text);
        }).catch(error => {
          reject(error);
        });
      }
    }
    fileReader.onerror = reject;
    fileReader.readAsArrayBuffer(source);
  });
};

export const parseData = (pdfContent: string) => {
  const emptyData: Invoice = {
    vendorName: "",
    supplierName: "",
    invoiceNo: "",
    invoiceDate: "",
    invoiceCosts: 0,
    description: "",
  };
  const data: Invoice = Object.assign({}, emptyData);
  const pageTexts: string[] = pdfContent.split("\n");
  for (const pageText of pageTexts) {
    const pageTextLines = pageText.split(/\r?\n/);
    pageTextLines.forEach((pageTextLine) => {
      if (pageTextLine.includes("invoice number")) {
        data.invoiceNo = pageTextLine.match(/\d/g)?.join("");
      }
      if (pageTextLine.includes("supplier")) {
        const result = (/supplier (.*)/g).exec(pageTextLine);
        data.supplierName = (result == null) ? "" : result[1];
      }
      if (pageTextLine.includes("recipient")) {
        const result = (/recipient (.*)/g).exec(pageTextLine);
        data.vendorName = (result == null) ? "" : result[1];
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

  return ((JSON.stringify(data) === JSON.stringify(emptyData))) ? null : data;
};
