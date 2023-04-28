import { useRouter } from "next/router";
import type { PDFDocumentProxy } from "pdfjs-dist";
import { useCallback, useRef, useState } from "react";
import toast from "react-hot-toast";
import { pdfjs } from "react-pdf";
import {
    useFetchS3BucketContents,
    useGetPreSignedURLForUpload,
} from "../../hooks/s3";
import { api } from "../../utils/api";
import { loadFileObject, getPDFText, parseData } from "../../utils/pdfparser";

import dynamic from "next/dynamic";
import type { Invoice } from "../../utils/pdfparser";

pdfjs.GlobalWorkerOptions.workerSrc = "/js/pdf.worker.min.js";

const Document = dynamic(() =>
  import("react-pdf").then((module) => module.Document)
);

interface Props {
  onData: (dataFromChild: Invoice) => void;
}

const Page = dynamic(() => import("react-pdf").then((module) => module.Page));

const InvoiceUpload = ({onData} : Props) => {
    const router = useRouter();
    const utils = api.useContext();
    const projectId = router.query.projectId as string;
    const inputRef = useRef<HTMLInputElement | null>(null);

    const [file, setFile] = useState<File | string | null>(null);
    const [numPages, setNumPages] = useState<number | null>(null);
    const [pageNumber] = useState<number>(1);
    const [folderPrefix] = useState("/");
    const [uploadFile, setUploadFile] = useState<File | undefined | null>(
        undefined
    );
    const [invoiceData, ] = useState<Invoice | null>({
        vendorName: "",
        supplierName: "",
        invoiceNo: "",
        invoiceDate: "",
        invoiceCosts: 0,
        description: "",
    });

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
        if (data != null) onData(data);
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
            }).then(() => {
              setFile(file);
              setUploadFile(undefined);
              void utils.s3.fetchS3BucketContents.invalidate();
            })
              .catch((error) => {
                throw error;
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
            throw error;
          }
        },
        [
          folderPrefix,
          getPreSignedURLForUpload,
          projectId,
          utils.s3.fetchS3BucketContents,
        ]
      );

      const validatePdfFile = async (file: File) => {
        try {
          await loadFileObject(file).then((text) => {
            let valid = false;
            if (typeof(text) == "string") {
              const data = parseData(text);
              if (data != null) valid = true;
            }
            if (!valid) throw new Error("Invalid pdf file.");
          });
          
        } catch(error) {
          throw error;
        }
      };
    
      const handleFileChange = async (
        event: React.ChangeEvent<HTMLInputElement>
      ) => {
        const files = event.target.files;
        if (files && files[0]) {
          const fileName = files[0].name;
          try {
            void await validatePdfFile(files[0]);
            // if exists, don't upload
            s3Files?.map((file) => {
              if (file?.name == fileName) {
                throw new Error("Duplicate file name. Delete existing file first");
              }
            });

            setUploadFile(files[0]);
            await handleUploadFile(files[0]);
          } catch(error) {
            let message = "Unkown error"
            if (error instanceof Error) {
              message = error.message
            } if (typeof(error) == "string") {
              message = error
            }
            toast.error(message);
          }
          event.target.value = ""; // clear the input
          setUploadFile(null);
        }
        // 🚩 do the file upload here normally...
      };
    return (
        <div>
            <div className="mb-5 text-right">
              <button
                type="button"
                className="rounded bg-blue-500 py-2 px-4 font-bold text-white hover:bg-blue-700"
                onClick={handleUploadClick}
              >
                {uploadFile ? `${uploadFile.name}` : "Upload file"}
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
            </div>
            <div className="border-2 border-solid border-sky-500 p-5">
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
    );``
}

export default InvoiceUpload;