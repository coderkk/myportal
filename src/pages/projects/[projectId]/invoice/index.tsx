import { useRouter } from "next/router";
import type { PDFDocumentProxy } from "pdfjs-dist";
import { useCallback, useRef, useState } from "react";
import toast from "react-hot-toast";
import { pdfjs } from "react-pdf";
import SessionAuth from "../../../../components/auth/SessionAuth";
import {
  useFetchS3BucketContents,
  useGetPreSignedURLForDownload,
  useGetPreSignedURLForUpload,
} from "../../../../hooks/s3";
import { api } from "../../../../utils/api";
import { getPDFText, parseData } from "../../../../utils/pdfparser";

import dynamic from "next/dynamic";
import type { Invoice } from "../../../../utils/pdfparser";

pdfjs.GlobalWorkerOptions.workerSrc = "/js/pdf.worker.min.js";
// pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

const Document = dynamic(() =>
  import("react-pdf").then((module) => module.Document)
);

const Page = dynamic(() => import("react-pdf").then((module) => module.Page));

const InvoicePage = () => {
  const router = useRouter();
  const utils = api.useContext();
  const projectId = router.query.projectId as string;
  // const pendingDeleteCountRef = useRef(0); // prevent parallel GET requests as much as possible. # https://profy.dev/article/react-query-usemutation#edge-case-concurrent-updates-to-the-cache
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [invoiceData, setInvoiceData] = useState<Invoice>({
    vendorName: "ds",
    invoiceNo: "",
    invoiceDate: "",
    invoiceCosts: 0,
    description: "",
  });
  const [uploadFile, setUploadFile] = useState<File | undefined | null>(
    undefined
  );
  const [file, setFile] = useState("/docs/invoice.pdf");
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber] = useState<number>(1);
  const [folderPrefix] = useState("/");

  const { getPreSignedURLForDownload } = useGetPreSignedURLForDownload();

  const { getPreSignedURLForUpload } = useGetPreSignedURLForUpload();

  const { files: s3Files } = useFetchS3BucketContents({
    prefix: folderPrefix,
    projectId: projectId,
  });

  const onDocumentLoadSuccess = (pdf: PDFDocumentProxy) => {
    setNumPages(pdf.numPages);
    void parseInvoice(pdf);
  };

  const parseInvoice = async (pdf: PDFDocumentProxy) => {
    const pdfText = await getPDFText(pdf);
    const data = parseData(pdfText);
    setInvoiceData(data);
  };

  // Retreive AWS file at https://hyperbolt-ai-invoices.s3.amazonaws.com/clg6rqmfw0005td2oh53bfnqw/Invoice%20Template%20Costing%20AI%20feature%20280323.pdf
  const handleLoadFile = async () => {
    try {
      const { preSignedURLForDownload } = await getPreSignedURLForDownload({
        fileId:
          "clg6rqmfw0005td2oh53bfnqw/Invoice Template Costing AI feature 280323.docx.pdf",
        projectId: projectId,
      });

      const res = await fetch(preSignedURLForDownload, {
        method: "GET",
      });
      const resBlob = await res.blob();
      const url = window.URL.createObjectURL(new Blob([resBlob]));
      setFile(url);
    } catch (error) {
      toast.error("Error when downloading file");
      // This try catch is necessary as getPreSignedURLForDownload
      // returns a promise that can possibly cause a runtime error.
      // we handle this error in src/utils/api.ts so there's no need
      // to do anything here other than catch the error.
    }
  };

  const handleUploadClick = () => {
    // 👇 We redirect the click event onto the hidden input element
    inputRef.current?.click();
  };

  const handleUploadFile = useCallback(
    async (file: File) => {
      const fileId =
        folderPrefix === "/" ? file.name : folderPrefix + file.name;
      try {
        const { preSignedURLForUpload } = await getPreSignedURLForUpload({
          fileId: fileId,
          projectId: projectId,
        });

        const uploadFile = fetch(preSignedURLForUpload, {
          method: "PUT",
          headers: {
            "Content-Type": file.type,
          },
          body: file,
        })
          .catch(() => {
            throw new Error();
          })
          .finally(() => {
            setUploadFile(undefined);
            void utils.s3.fetchS3BucketContents.invalidate();
          });

        await toast.promise(uploadFile, {
          loading: "Uploading file",
          success: "File uploaded successfully",
          error: "Error when uploading file",
        });
      } catch (error) {
        // This try catch is necessary as getPreSignedURLForDownload
        // returns a promise that can possibly cause a runtime error.
        // we handle this error in src/utils/api.ts so there's no need
        // to do anything here other than catch the error.
      }
    },
    [
      folderPrefix,
      getPreSignedURLForUpload,
      projectId,
      utils.s3.fetchS3BucketContents,
    ]
  );

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files;
    if (files && files[0]) {
      const fileName = files[0].name;
      setUploadFile(files[0]);
      // if exists, don't upload
      s3Files?.map((file) => {
        if (file?.name == fileName) {
          toast.error("Duplicate file name. Delete existing file first");
          return;
        }
      });
      await handleUploadFile(files[0]);
      event.target.value = ""; // clear the input
    }
    // 🚩 do the file upload here normally...
  };

  return (
    <SessionAuth>
      <div className="flex">
        <div className="m-auto">
          <section>
            <div className="max-w-screen-xl px-4 py-8 sm:py-12 sm:px-6 lg:py-16 lg:px-8">
              <div className="mb-5 flex justify-between">
                <h2 className="text-3xl font-bold sm:text-4xl">
                  Invoice Data Extraction
                </h2>
                <button
                  type="button"
                  className="rounded bg-blue-500 py-2 px-4 font-bold text-white hover:bg-blue-700"
                  onClick={handleUploadClick}
                >
                  {uploadFile ? `${uploadFile.name}` : "Click to select"}
                </button>

                <input
                  type="file"
                  ref={inputRef}
                  onChange={(e) => {
                    void handleFileChange(e);
                  }}
                  aria-label="Upload file"
                  className="hidden"
                />
                <button
                  className="rounded bg-blue-500 py-2 px-4 font-bold text-white hover:bg-blue-700"
                  onClick={() => void handleLoadFile()}
                >
                  Load File
                </button>
              </div>
              <div className="grid grid-cols-1 gap-y-8 lg:grid-cols-2  lg:gap-x-16">
                <div className="mx-auto max-w-lg text-left lg:mx-0 lg:text-left">
                  <div className="overflow-hidden bg-white shadow sm:rounded-lg">
                    <div className="px-4 py-5 sm:px-6">
                      <h3 className="text-base font-semibold leading-6 text-gray-900">
                        Automated Data
                      </h3>
                      <p className="mt-1 max-w-2xl text-sm text-gray-500">
                        Extract data from PDF file
                      </p>
                    </div>
                    <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
                      <dl className="sm:divide-y sm:divide-gray-200">
                        <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 sm:py-5">
                          <dt className="text-sm font-medium text-gray-500">
                            Vendor name
                          </dt>
                          <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                            {invoiceData.vendorName}
                          </dd>
                        </div>
                        <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 sm:py-5">
                          <dt className="text-sm font-medium text-gray-500">
                            Invoice No
                          </dt>
                          <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                            {invoiceData.invoiceNo}
                          </dd>
                        </div>
                        <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 sm:py-5">
                          <dt className="text-sm font-medium text-gray-500">
                            Invoice Date
                          </dt>
                          <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                            {invoiceData.invoiceDate}
                          </dd>
                        </div>
                        <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 sm:py-5">
                          <dt className="text-sm font-medium text-gray-500">
                            Invoice Costs
                          </dt>
                          <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                            {invoiceData.invoiceCosts}
                          </dd>
                        </div>
                        <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 sm:py-5">
                          <dt className="text-sm font-medium text-gray-500">
                            Invoice Description
                          </dt>
                          <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                            {invoiceData.description}
                          </dd>
                        </div>
                        <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 sm:py-5">
                          <dt className="text-sm font-medium text-gray-500">
                            Assign to
                          </dt>
                          <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                            <select title="Assign to">
                              <option></option>
                            </select>
                          </dd>
                        </div>
                      </dl>
                    </div>
                  </div>
                </div>

                <div className="clear-both border-2 border-solid border-sky-500">
                  <Document file={file} onLoadSuccess={onDocumentLoadSuccess}>
                    <Page
                      pageNumber={pageNumber}
                      renderTextLayer={false}
                      renderAnnotationLayer={false}
                    />
                  </Document>
                  <p>
                    Page {pageNumber} of {numPages}
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </SessionAuth>
  );
};

export default InvoicePage;
