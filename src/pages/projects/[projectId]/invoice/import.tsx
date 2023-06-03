import { format } from "date-fns";
import { useRouter } from "next/router";
import { useRef, useState } from "react";
import PermissionToProject from "../../../../components/auth/PermissionToProject";
import SessionAuth from "../../../../components/auth/SessionAuth";
import { useCreateSupplierInvoice } from "../../../../hooks/supplierInvoice";

import { nanoid } from "nanoid";
import toast from "react-hot-toast";
import { env } from "../../../../env/client.mjs";
import { useGetPreSignedURLForUpload } from "../../../../hooks/s3";
import { api } from "../../../../utils/api";

import { useGetBudgets } from "../../../../hooks/budget";

import PdfLoad from "../../../../components/invoice/PdfLoad";

import type { SupplierInvoice } from "@prisma/client";
import SelectList from "../../../../components/common/SelectList";
import type { SupplierInvoiceItem } from "../../../../components/invoice/InvoiceItem";

type _SupplierInvoiceWithItems = SupplierInvoice & {
  supplierInvoiceItems: SupplierInvoiceItem[];
};

export type SupplierInvoiceWithItems = Omit<
  _SupplierInvoiceWithItems,
  "paid" | "approved" | "createdById" | "createdAt" | "updatedAt" | "projectId"
>;

type LoadPDFHandle = {
  handleLoadClick: () => void;
};

const InvoiceImportPage = () => {
  const router = useRouter();
  const utils = api.useContext();
  const projectId = router.query.projectId as string;
  const [showDocument, setShowDocument] = useState(false);
  const pdfLoadRef = useRef<LoadPDFHandle>(null);

  const [file, setFile] = useState<File | null>(null);
  const [fileId, setFileId] = useState("");
  const [folderPrefix] = useState("/");
  const { getPreSignedURLForUpload } = useGetPreSignedURLForUpload();
  const { createSupplierInvoice } = useCreateSupplierInvoice();

  const [invoiceData, setInvoiceData] = useState<SupplierInvoiceWithItems>({
    id: "",
    invoiceNo: "",
    invoiceDate: new Date(),
    vendorName: "",
    supplierName: "",
    supplierAddress: "",
    supplierPhone: "",
    subtotal: 0,
    taxes: 0,
    discount: 0,
    grandTotal: 0,
    fileId: "",
    budgetId: "",
    supplierInvoiceItems: [],
  });

  const { budgets } = useGetBudgets({
    projectId: projectId,
    pageSize: 100,
    pageIndex: 0,
    searchKey: "",
  });

  const budgetOptions = budgets.map((budget) => ({
    value: budget.id,
    label: `${budget.costCode} (${budget.description})`,
  }));

  const selected = budgetOptions.find(
    (budgetOption) => budgetOption.value == invoiceData.budgetId
  );

  const handleData = (data: SupplierInvoiceWithItems, file: File | null) => {
    setInvoiceData(data);
    setFile(file);

    let fid = "";
    if (file != null) {
      const fileName =
        file.name.slice(0, file.name.lastIndexOf(".")) +
        "-" +
        nanoid() +
        file.name.slice(file.name.lastIndexOf("."));
      fid = folderPrefix === "/" ? fileName : folderPrefix + fileName;
    }
    setFileId(fid);
  };

  const handleConfirmUpload = async (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.preventDefault();
    try {
      if (!selected) {
        throw new Error("Please select a budget");
      }
      setFileId("");
      await uploadDocument();
      if (fileId != "") {
        invoiceData.fileId = fileId;
        createSupplierInvoice({
          ...invoiceData,
          budgetId: invoiceData?.budgetId || "", // PLANETSCALE FIX
          projectId: projectId,
        });
        void router.push("/projects/" + projectId + "/invoice");
      }
    } catch (e: unknown) {
      if (e instanceof Error) {
        toast.error(e.message);
      } else {
        toast.error("An error occured");
      }
    }
  };

  const invoiceLoadClick = () => {
    if (pdfLoadRef && pdfLoadRef.current) {
      pdfLoadRef.current.handleLoadClick();
    }
  };

  const uploadDocument = async () => {
    if (file == null) {
      toast.error("No file detected.");
    } else {
      const fid = fileId;
      try {
        const { preSignedURLForUpload } = await getPreSignedURLForUpload({
          fileId: fid,
          projectId: projectId,
          aws_s3_bucket_name: env.NEXT_PUBLIC_AWS_S3_INVOICES_BUCKET_NAME,
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
            void utils.s3.fetchS3BucketContents.invalidate({
              aws_s3_bucket_name: env.NEXT_PUBLIC_AWS_S3_INVOICES_BUCKET_NAME,
              projectId: projectId,
              prefix: folderPrefix,
            });
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
    }
  };

  return (
    <SessionAuth>
      <PermissionToProject projectId={projectId}>
        <div className="pt-5">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="max-w-screen-xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8 lg:py-16">
              <div className="flex">
                <div className="mb-6 flex grow items-center">
                  <button
                    type="button"
                    onClick={() => {
                      void router.push("/projects/" + projectId + "/invoice");
                    }}
                    title="Back"
                    className="mx-2 block rounded-md bg-white px-3 py-2 text-center text-sm font-semibold text-black shadow-sm hover:bg-gray-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-300"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                      stroke="currentColor"
                      className="h-6 w-6"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
                      />
                    </svg>
                  </button>
                  <h2 className="px-3 py-2 text-2xl font-bold uppercase tracking-wider">
                    Invoice
                  </h2>
                </div>
                <div>
                  <button
                    type="button"
                    onClick={invoiceLoadClick}
                    className="mb-2 mr-2 rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-800"
                  >
                    Extract PDF
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowDocument(!showDocument);
                    }}
                    className="mb-2 mr-2 rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-800"
                  >
                    Show/Hide PDF
                  </button>
                </div>
              </div>
              <div
                className={`grid grid-cols-1 gap-y-10 lg:gap-x-16 ${
                  showDocument ? "lg:grid-cols-3" : ""
                }`}
              >
                <div
                  className={`mx-auto text-left lg:mx-0 lg:text-left  ${
                    showDocument ? "col-span-2" : ""
                  }`}
                >
                  <div className="mb-8 flex justify-between">
                    <div className="w-2/4">
                      <div className="mb-2 items-center md:mb-1 md:flex">
                        <label className="block w-32 text-sm font-bold uppercase tracking-wide text-gray-800">
                          Invoice No.
                        </label>
                        <div className="flex-1">{invoiceData.invoiceNo}</div>
                      </div>
                      <div className="mb-2 items-center md:mb-1 md:flex">
                        <label className="block w-32 text-sm font-bold uppercase tracking-wide text-gray-800">
                          Invoice Date
                        </label>
                        <div className="flex-1">
                          {invoiceData.invoiceDate == undefined ||
                          invoiceData.invoiceDate == null
                            ? ""
                            : format(invoiceData.invoiceDate, "dd/MM/yyyy")}
                        </div>
                      </div>
                      <div className="mb-2 items-center md:mb-1 md:flex">
                        <label className="block w-32 text-sm font-bold uppercase tracking-wide text-gray-800">
                          Cost code
                        </label>
                        <div className="flex-1">
                          <SelectList
                            selected={selected}
                            options={budgetOptions}
                            onChange={(option) =>
                              setInvoiceData({
                                ...invoiceData,
                                budgetId: option.value,
                              })
                            }
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mb-8 flex flex-wrap justify-between">
                    <div className="mb-2 w-full md:mb-0 md:w-1/3">
                      <label className="mb-1 block text-sm font-bold uppercase tracking-wide text-gray-800">
                        Vendor name
                      </label>
                      <div>{invoiceData.vendorName}</div>
                    </div>
                    <div className="w-full md:w-1/3">
                      <label className="mb-1 block text-sm font-bold uppercase tracking-wide text-gray-800">
                        Supplier information
                      </label>
                      <div>{invoiceData.supplierName}</div>
                      <div>{invoiceData.supplierAddress}</div>
                      <div>{invoiceData.supplierPhone}</div>
                    </div>
                  </div>

                  <div className="-mx-1 flex items-start border-b py-2">
                    <div className="flex-1 px-1">
                      <p className="text-sm font-bold uppercase tracking-wide text-gray-800">
                        Description
                      </p>
                    </div>

                    <div className="flex-1 px-1">
                      <p className="text-sm font-bold uppercase tracking-wide text-gray-800">
                        Quantity
                      </p>
                    </div>

                    <div className="w-20 px-1 text-right">
                      <p className="text-sm font-bold uppercase tracking-wide text-gray-800">
                        Unit
                      </p>
                    </div>

                    <div className="w-32 px-1 text-right">
                      <p className="leading-none">
                        <span className="block text-sm font-bold uppercase tracking-wide text-gray-800">
                          Unit Price
                        </span>
                      </p>
                    </div>

                    <div className="w-32 px-1 text-right">
                      <p className="leading-none">
                        <span className="block text-sm font-bold uppercase tracking-wide text-gray-800">
                          Total Price
                        </span>
                      </p>
                    </div>
                  </div>
                  {invoiceData?.supplierInvoiceItems.map(
                    (supplierInvoiceItem, i) => {
                      return (
                        <div
                          key={i}
                          className="-mx-1 flex items-start border-b py-2"
                        >
                          <div className="flex-1 px-1">
                            <p className="text-sm tracking-wide text-gray-800">
                              {supplierInvoiceItem?.description}
                            </p>
                          </div>

                          <div className="w-20 px-1 text-right">
                            <p className="text-sm tracking-wide text-gray-800">
                              {supplierInvoiceItem?.quantity}
                            </p>
                          </div>

                          <div className="w-20 px-1 text-right">
                            <p className="text-sm tracking-wide text-gray-800">
                              {supplierInvoiceItem?.unit}
                            </p>
                          </div>

                          <div className="w-32 px-1 text-right">
                            <p className="leading-none">
                              <span className="block text-sm tracking-wide text-gray-800">
                                {supplierInvoiceItem?.unitPrice}
                              </span>
                            </p>
                          </div>

                          <div className="w-32 px-1 text-right">
                            <p className="leading-none">
                              <span className="block text-sm tracking-wide text-gray-800">
                                {supplierInvoiceItem?.totalPrice}
                              </span>
                            </p>
                          </div>
                        </div>
                      );
                    }
                  )}

                  <div className="ml-auto mt-5 w-full py-2 sm:w-2/4 lg:w-1/2">
                    <div className="mb-3 flex justify-between">
                      <div className="mr-2 flex-1 text-right text-gray-800">
                        Subtotal
                      </div>
                      <div className="w-40 text-right">
                        {invoiceData.subtotal}
                      </div>
                    </div>
                    <div className="mb-4 flex justify-between">
                      <div className="mr-2 flex-1 text-right text-gray-800">
                        Taxes
                      </div>
                      <div className="w-40 text-right">{invoiceData.taxes}</div>
                    </div>

                    <div className="border-b border-t py-2">
                      <div className="flex justify-between">
                        <div className="mr-2 flex-1 text-right text-xl text-gray-800">
                          Grand total
                        </div>
                        <div className="w-40 text-right">
                          {invoiceData.grandTotal}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <div className={`${!showDocument ? "hidden" : ""}`}>
                    <PdfLoad onData={handleData} ref={pdfLoadRef} />
                  </div>
                </div>
              </div>
              <div>
                <button
                  type="button"
                  disabled={
                    invoiceData.invoiceNo == "" ||
                    invoiceData.invoiceDate == null ||
                    invoiceData.budgetId == null
                  }
                  className="mb-2 mr-2 rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                  onClick={(e) => void handleConfirmUpload(e)}
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </div>
      </PermissionToProject>
    </SessionAuth>
  );
};

export default InvoiceImportPage;
