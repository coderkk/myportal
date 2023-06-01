import { parse } from "date-fns";
import { nanoid } from "nanoid";
import dynamic from "next/dynamic";
import type { PDFDocumentProxy, PDFPageProxy } from "pdfjs-dist";
import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import toast from "react-hot-toast";
import { pdfjs } from "react-pdf";
import { useExtractInvoiceInfo } from "../../hooks/gpt";
import type { SupplierInvoiceWithItems } from "../../pages/projects/[projectId]/invoice/import";
import { getPDFText, loadFileObject, parseData } from "../../utils/pdfparser";
import Spinner from "../common/Spinner";

pdfjs.GlobalWorkerOptions.workerSrc = "/js/pdf.worker.min.js";

const Document = dynamic(() =>
  import("react-pdf").then((module) => module.Document)
);

type PdfLoadProps = {
  onData: (data: SupplierInvoiceWithItems, file: File | null) => void;
};

const Page = dynamic(() => import("react-pdf").then((module) => module.Page));

const PdfLoad = forwardRef(({ onData }: PdfLoadProps, ref) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const pdfDocRef = useRef<HTMLInputElement | null>(null);

  const [file, setFile] = useState<File | null>(null);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);

  const { isLoading, extractInvoiceInfo } = useExtractInvoiceInfo();

  const onDocumentLoadSuccess = (pdf: PDFDocumentProxy) => {
    setNumPages(pdf.numPages);
    void parseInvoice(pdf);
  };

  const onPageLoadSucess = (page: PDFPageProxy) => {
    const parentDiv = pdfDocRef.current;
    if (parentDiv) {
      const viewport = page.getViewport();
      const originWidth = viewport.width;
      let pageScale = 0.7;
      if (!isNaN(originWidth) && originWidth != 0) {
        pageScale = parentDiv.clientWidth / originWidth;
      }
      if (scale !== pageScale) {
        setScale(pageScale);
      }
    }
  };

  const parseInvoice = async (pdf: PDFDocumentProxy) => {
    const pdfText = await getPDFText(pdf);
    try {
      const data = await extractInvoiceInfo({ inputText: pdfText });
      const supplierInvoiceItems = data.supplierInvoiceItems;
      const transformedData: SupplierInvoiceWithItems = {
        ...data,
        id: "",
        fileId: "",
        budgetId: "",
        invoiceDate: parse(data.invoiceDate, "dd/MM/yyyy", new Date()),
        supplierInvoiceItems: supplierInvoiceItems.map(
          (supplierInvoiceItem) => {
            return {
              ...supplierInvoiceItem,
              id: nanoid(),
            };
          }
        ),
      };
      onData(transformedData, file);
    } catch (error) {
      toast.error("An error occured while handling the pdf file.");
    }
  };

  useImperativeHandle(ref, () => ({
    handleLoadClick() {
      inputRef.current?.click();
    },
  }));

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files;
    if (files && files[0]) {
      try {
        await validatePdfFile(files[0]);
        setFile(files[0]);
      } catch {
        toast.error("An error occured while handling the pdf file.");
      } finally {
        event.target.value = ""; // clear the input
      }
    }
    // 🚩 do the file upload here normally...
  };

  const validatePdfFile = async (file: File) => {
    try {
      if (
        [
          "application/pdf",
          "application/x-pdf",
          "application/acrobat",
          "applications/vnd.pdf",
          "text/pdf",
          "text/x-pdf",
        ].indexOf(file["type"]) === -1
      ) {
        throw new Error("Invalid document type");
      } else {
        const text = await loadFileObject(file);
        if (typeof text == "string") {
          const data = parseData(text);
          if (!data) {
            throw new Error();
          }
        }
      }
    } catch {
      toast.error("An error occured while validating the pdf file.");
    }
  };

  return (
    <>
      <div className="mb-5 text-right">
        <input
          type="file"
          accept="application/pdf, application/x-pdf,application/acrobat, applications/vnd.pdf, text/pdf, text/x-pdf"
          ref={inputRef}
          onChange={(e) => {
            void handleFileChange(e);
          }}
          aria-label="Upload file"
          className="hidden"
        />
      </div>
      <div ref={pdfDocRef} className="border-2 border-solid border-sky-500 p-5">
        <Document file={file} onLoadSuccess={onDocumentLoadSuccess}>
          <Page
            pageNumber={pageNumber}
            renderTextLayer={false}
            renderAnnotationLayer={false}
            onLoadSuccess={onPageLoadSucess}
            scale={scale}
          />
        </Document>

        <p>
          Page {pageNumber} of {numPages}
        </p>
        {isLoading ? <Spinner /> : null}
      </div>
    </>
  );
});

PdfLoad.displayName = "PdfLoad";
export default PdfLoad;
