import dynamic from "next/dynamic";
import type { PDFDocumentProxy, PDFPageProxy } from "pdfjs-dist";
import { useRef, useState } from "react";
import toast from "react-hot-toast";
import { pdfjs } from "react-pdf";
import type { SupplierInvoiceWithDetails } from "../../pages/projects/[projectId]/invoice/import";
import { getPDFText, loadFileObject, parseData } from "../../utils/pdfparser";

pdfjs.GlobalWorkerOptions.workerSrc = "/js/pdf.worker.min.js";

const Document = dynamic(() =>
  import("react-pdf").then((module) => module.Document)
);

type InvoiceUploadProps = {
  onData: (data: SupplierInvoiceWithDetails, file: File | null) => void;
};

const Page = dynamic(() => import("react-pdf").then((module) => module.Page));

const InvoiceLoad = ({ onData }: InvoiceUploadProps) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const pdfDocRef = useRef<HTMLInputElement | null>(null);

  const [file, setFile] = useState<File | null>(null);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);
  const [uploadFile, setUploadFile] = useState<File | undefined | null>(
    undefined
  );

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
    const data = parseData(pdfText);
    if (data) {
      onData(data, file);
    }
  };

  const handleLoadClick = () => {
    // 👇 We redirect the click event onto the hidden input element
    inputRef.current?.click();
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files;
    if (files && files[0]) {
      try {
        await validatePdfFile(files[0]);
        setUploadFile(files[0]);
        setFile(files[0]);
      } catch {
        toast.error("An error occured while handling the pdf file.");
      } finally {
        event.target.value = ""; // clear the input
        setUploadFile(null);
      }
    }
    // 🚩 do the file upload here normally...
  };

  const validatePdfFile = async (file: File) => {
    try {
      if (["application/pdf", "application/x-pdf", "application/acrobat", "applications/vnd.pdf", "text/pdf", "text/x-pdf"].indexOf(file['type']) == -1) {
        throw new Error("Invalid document type");
      } else {
        await loadFileObject(file).then((text) => {
          if (typeof text == "string") {
            const data = parseData(text);
            if (!data) {
              throw new Error();
            }
          }
        });
      }
    } catch {
      toast.error("An error occured while validating the pdf file.");
    }
  };

  return (
    <>
      <div className="mb-5 text-right">
        <button
          type="button"
          className="rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700"
          onClick={handleLoadClick}
        >
          {uploadFile ? `${uploadFile.name}` : "Load file"}
        </button>
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
      </div>
    </>
  );
  ``;
};

export default InvoiceLoad;
