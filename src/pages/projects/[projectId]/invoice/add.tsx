import {
  ChevronLeftIcon,
  ChevronRightIcon,
  PlusIcon,
} from "@heroicons/react/20/solid";
import classNames from "classnames";
import { nanoid } from "nanoid";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import type { PDFDocumentProxy } from "pdfjs-dist";
import { useEffect, useRef, useState, type BaseSyntheticEvent } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { pdfjs } from "react-pdf";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";
import PermissionToProject from "../../../../components/auth/PermissionToProject";
import SessionAuth from "../../../../components/auth/SessionAuth";
import ConfirmationDialog from "../../../../components/invoice/ConfirmationDialog";
import InvoiceEditableForm from "../../../../components/invoice/InvoiceEditableForm";
import type { SupplierInvoiceItem } from "../../../../components/invoice/InvoiceItem";
import { env } from "../../../../env/client.mjs";
import { useExtractInvoiceInfo } from "../../../../hooks/gpt";
import { useGetPreSignedURLForUpload } from "../../../../hooks/s3";
import { useCreateSupplierInvoice } from "../../../../hooks/supplierInvoice";
import { api } from "../../../../utils/api";
import { extractTextFromPDFDocumentProxy } from "../../../../utils/pdfparser";

export type SupplierInvoiceWithItems = {
  id: string;
  invoiceNo: string;
  invoiceDate: Date;
  supplierName: string;
  subtotal: number;
  taxes: number;
  discount: number;
  grandTotal: number;
  fileId: string | undefined;
  budgetId: string;
  paid: boolean;
  approved: boolean;
  supplierInvoiceItems: SupplierInvoiceItem[];
};

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

const Document = dynamic(() =>
  import("react-pdf").then((module) => module.Document)
);

const Page = dynamic(() => import("react-pdf").then((module) => module.Page));

const AddInvoicePage = () => {
  const ACCEPTEDFORMAT = [
    "application/pdf",
    "application/x-pdf",
    "application/acrobat",
    "applications/vnd.pdf",
    "text/pdf",
    "text/x-pdf",
  ];

  const router = useRouter();
  const utils = api.useContext();
  const projectId = router.query.projectId as string;

  const [supplierInvoiceItems, setSupplierInvoiceItems] = useState<
    SupplierInvoiceItem[] | undefined
  >([]);
  const { createSupplierInvoice } = useCreateSupplierInvoice();
  const { getPreSignedURLForUpload } = useGetPreSignedURLForUpload();
  const { data, isLoading, extractInvoiceInfo } = useExtractInvoiceInfo();
  const [fileId, setFileId] = useState("");

  const useFormReturn = useForm<SupplierInvoiceWithItems>({
    values: data,
  });

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [renderedPageNumber, setRenderedPageNumber] = useState<number | null>(
    null
  );
  const [dialogOpen, setDialogOpen] = useState(false);
  const [pdfDocumentProxy, setPdfDocumentProxy] = useState<
    PDFDocumentProxy | undefined
  >(undefined);

  useEffect(() => {
    if (data) {
      setSupplierInvoiceItems(data.supplierInvoiceItems);
    }
  }, [data]);

  const onInvoiceItemUpdate = (
    invoiceItem: SupplierInvoiceItem,
    index: number
  ) => {
    if (!supplierInvoiceItems) return;
    const newSupplierInvoiceItems = [...supplierInvoiceItems];
    newSupplierInvoiceItems[index] = invoiceItem;
    setSupplierInvoiceItems(newSupplierInvoiceItems);
  };

  const removeInvoiceItem = (index: number) => {
    if (!supplierInvoiceItems) return;
    const newSupplierInvoiceItems = [...supplierInvoiceItems];
    newSupplierInvoiceItems.splice(index, 1);
    setSupplierInvoiceItems(newSupplierInvoiceItems);
  };

  const onSubmit = (
    data: SupplierInvoiceWithItems,
    e: BaseSyntheticEvent<object, unknown, unknown> | undefined
  ) => {
    e?.preventDefault();
    void uploadDocument(data);
  };

  const uploadDocument = async (data: SupplierInvoiceWithItems) => {
    if (fileToUpload == null) {
      toast.error("No file detected.");
    } else {
      try {
        const { preSignedURLForUpload } = await getPreSignedURLForUpload({
          fileId: fileId,
          projectId: projectId,
          aws_s3_bucket_name: env.NEXT_PUBLIC_AWS_S3_INVOICES_BUCKET_NAME,
        });

        const uploadFile = fetch(preSignedURLForUpload, {
          method: "PUT",
          headers: {
            "Content-Type": fileToUpload.type,
          },
          body: fileToUpload,
        })
          .catch(() => {
            throw new Error();
          })
          .finally(() => {
            void utils.s3.fetchS3BucketContents.invalidate({
              aws_s3_bucket_name: env.NEXT_PUBLIC_AWS_S3_INVOICES_BUCKET_NAME,
              projectId: projectId,
              prefix: "/",
            });
          });

        await toast.promise(uploadFile, {
          loading: "Uploading file",
          success: "File uploaded successfully",
          error: "Error when uploading file",
        });
        createSupplierInvoice({
          ...data,
          projectId: projectId,
          fileId: fileId || undefined,
          paid: data.paid || false,
          approved: data.approved || false,
          supplierInvoiceItems: supplierInvoiceItems || [],
        });
        void router.push("/projects/" + projectId + "/invoice/");
      } catch (error) {
        // This try catch is necessary as getPreSignedURLForDownload
        // returns a promise that can possibly cause a runtime error.
        // we handle this error in src/utils/api.ts so there's no need
        // to do anything here other than catch the error.
        throw error;
      }
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files[0]) {
      const file = files[0];
      if (!ACCEPTEDFORMAT.includes(file["type"]))
        return toast.error("Invalid document type! Please upload a pdf");
      const fileSize = file.size / 1024 / 1024; // MB
      if (fileSize > 5) return toast.error("File size exceeds 5MB.");
      setFileToUpload(files[0]);
      const fileId =
        file.name.slice(0, file.name.lastIndexOf(".")) +
        "-" +
        nanoid() +
        file.name.slice(file.name.lastIndexOf("."));
      setFileId(fileId);
      setDialogOpen(true);
    }
  };

  const onDocumentLoadSuccess = (pdf: PDFDocumentProxy) => {
    setPdfDocumentProxy(pdf);
    setPageNumber(1);
    setNumPages(pdf.numPages);
  };

  return (
    <SessionAuth>
      <PermissionToProject projectId={projectId}>
        <div className="flex w-full flex-col xl:flex-row">
          <InvoiceEditableForm
            onSubmit={onSubmit}
            fileId={undefined}
            useFormReturn={useFormReturn}
            supplierInvoiceItems={supplierInvoiceItems}
            setSupplierInvoiceItems={setSupplierInvoiceItems}
            onInvoiceItemUpdate={onInvoiceItemUpdate}
            removeInvoiceItem={removeInvoiceItem}
            fileInputRef={
              pdfDocumentProxy && numPages ? fileInputRef : undefined
            }
          />
          <div className="px-4 sm:px-6 lg:px-8 lg:pt-16">
            <div className="flex flex-col items-center justify-center pb-8 xl:pb-0">
              <h2 className="mb-4 px-3 py-2 text-2xl font-bold uppercase tracking-wider">
                Your PDF File
              </h2>
              <input
                type="file"
                accept="application/pdf, application/x-pdf,application/acrobat, applications/vnd.pdf, text/pdf, text/x-pdf"
                ref={fileInputRef}
                onChange={(e) => {
                  void handleFileChange(e);
                  e.target.value = ""; // so if we pick the same file onChange gets triggered
                }}
                aria-label="Upload file"
                className="hidden"
              />
              {pdfDocumentProxy && numPages ? null : (
                <div className="text-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    className="mx-auto h-12 w-12 text-gray-400"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25M16.5 7.5V18a2.25 2.25 0 002.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 002.25 2.25h13.5M6 7.5h3v3H6v-3z"
                    />
                  </svg>
                  <h3 className="mt-2 text-sm font-semibold text-gray-900">
                    No file
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Get started by creating a new project.
                  </p>
                  <div className="mt-6">
                    <button
                      type="button"
                      className="inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                      onClick={() => {
                        fileInputRef.current?.click();
                      }}
                    >
                      <PlusIcon
                        className="-ml-0.5 mr-1.5 h-5 w-5"
                        aria-hidden="true"
                      />
                      Attach a file
                    </button>
                  </div>
                </div>
              )}
              <div
                className={classNames(
                  "group relative mx-auto h-[75vh] max-w-fit shadow-lg",
                  pdfDocumentProxy && numPages ? "" : "hidden"
                )}
              >
                <Document
                  file={fileToUpload}
                  onLoadSuccess={(pdfDocumentProxy) =>
                    void onDocumentLoadSuccess(pdfDocumentProxy)
                  }
                >
                  {pdfDocumentProxy &&
                  numPages &&
                  renderedPageNumber !== pageNumber &&
                  renderedPageNumber ? (
                    <Page
                      key={renderedPageNumber}
                      className="prevPage"
                      pageNumber={renderedPageNumber}
                      width={500}
                      height={500}
                    />
                  ) : null}
                  <Page
                    key={pageNumber}
                    pageNumber={pageNumber}
                    onRenderSuccess={() => setRenderedPageNumber(pageNumber)}
                    width={500}
                    height={500}
                  />
                </Document>
                {pdfDocumentProxy && numPages && (
                  <div className="hidden justify-center group-hover:flex">
                    <nav
                      className="absolute bottom-10 isolate inline-flex -space-x-px rounded-md bg-white shadow-2xl shadow-slate-700"
                      aria-label="Pagination"
                    >
                      <button
                        type="button"
                        className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 hover:text-slate-600 focus:z-20 focus:text-slate-600 focus:outline-offset-0"
                        disabled={pageNumber <= 1}
                        onClick={() => setPageNumber((prev) => prev - 1)}
                      >
                        <span className="sr-only">Previous</span>
                        <ChevronLeftIcon
                          className="h-5 w-5"
                          aria-hidden="true"
                        />
                      </button>
                      <a
                        aria-current="page"
                        className="relative z-10 inline-flex items-center px-4 py-2 text-sm font-semibold  text-slate-600 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20
                      focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                      >
                        {pageNumber} of {numPages}
                      </a>
                      <button
                        type="button"
                        className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 hover:text-slate-600 focus:z-20 focus:text-slate-600 focus:outline-offset-0"
                        disabled={pageNumber >= numPages}
                        onClick={() => setPageNumber((prev) => prev + 1)}
                      >
                        <span className="sr-only">Next</span>
                        <ChevronRightIcon
                          className="h-5 w-5"
                          aria-hidden="true"
                        />
                      </button>
                    </nav>
                  </div>
                )}
              </div>
            </div>
          </div>
          <ConfirmationDialog
            open={dialogOpen}
            setOpen={setDialogOpen}
            isLoading={isLoading}
            confirmCallback={async () => {
              if (pdfDocumentProxy) {
                const pdfText = await extractTextFromPDFDocumentProxy(
                  pdfDocumentProxy
                );
                extractInvoiceInfo({ inputText: pdfText });
              }
            }}
          />
        </div>
      </PermissionToProject>
    </SessionAuth>
  );
};

export default AddInvoicePage;
