import { format } from "date-fns";
import { useRouter } from "next/router";
import { useState } from "react";
import PermissionToProject from "../../../../components/auth/PermissionToProject";
import SessionAuth from "../../../../components/auth/SessionAuth";
import type { supplierInvoice } from "../../../../hooks/supplierInvoice";
import { useCreateSupplierInvoice } from "../../../../hooks/supplierInvoice";
import { useCreateSupplierInvoiceDetail } from "../../../../hooks/supplierInvoiceDetail";

import { nanoid } from "nanoid";
import toast from "react-hot-toast";
import { env } from "../../../../env/client.mjs";
import { useGetPreSignedURLForUpload } from "../../../../hooks/s3";
import { api } from "../../../../utils/api";

import CostCodeDropdown from "../../../../components/budget/CostCodeDropdown";
import { useGetBudgets } from "../../../../hooks/budget";

import InvoiceLoad from "../../../../components/invoice/InvoiceLoad";

type SupplierInvoiceDetail = {
  item: string;
  description: string;
  quantity: number;
  uom: string;
  unitPrice: number;
  discount: number;
  amount: number;
};

interface SupplierInvoiceWithDetail extends supplierInvoice {
  supplierInvoiceDetail: SupplierInvoiceDetail[];
}

const InvoiceImportPage = () => {
  const router = useRouter();
  const utils = api.useContext();
  const projectId = router.query.projectId as string;

  const [file, setFile] = useState<File | null>(null);
  const [fileId, setFileId] = useState("");
  const [folderPrefix] = useState("/");
  const { getPreSignedURLForUpload } = useGetPreSignedURLForUpload();
  const { createSupplierInvoice } = useCreateSupplierInvoice();
  const { createSupplierInvoiceDetail } = useCreateSupplierInvoiceDetail();

  const emptyData = {
    supplierInvoiceId: "",
    projectId: projectId,
    invoiceNo: "",
    invoiceDate: null,
    budgetId: "",
    vendorName: "",
    vendorAddress: "",
    vendorPhone: "",
    supplierName: "",
    supplierId: "",
    supplierAddress: "",
    supplierPhone: "",
    paymentDueDate: null,
    salePerson: "",
    paymentTerm: "",
    deliveryDate: null,
    shipmentMethod: "",
    shipmentTerm: "",
    totalDiscount: 0,
    description: "",
    grandAmount: 0,
    taxAmount: 0,
    netAmount: 0,
    fileId: "",
    supplierInvoiceDetail: [],
  };

  const [invoiceData, setInvoiceData] =
    useState<SupplierInvoiceWithDetail>(emptyData);
  const { budgets } = useGetBudgets({
    projectId: projectId,
    pageSize: 100,
    pageIndex: 0,
    searchKey: "",
  });

  const handleData = (data: SupplierInvoiceWithDetail, file: File | null) => {
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
      setFileId("");
      await uploadDocument();
      if (fileId != "") {
        invoiceData.fileId = fileId;
        await saveRecord(invoiceData);
        // router.reload();
      }
    } catch (e) {
      toast.error("An error occured");
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

  const saveRecord = async (data: SupplierInvoiceWithDetail) => {
    data.projectId = projectId;
    try {
      const supplierInvoiceId = await createSupplierInvoice({
        projectId: projectId,
        description: "",
        budgetId: data.budgetId as string,
        invoiceNo: data.invoiceNo as string,
        invoiceDate: data.invoiceDate as Date,
        vendorName: data.vendorName as string,
        vendorAddress: data.vendorAddress as string,
        vendorPhone: data.vendorPhone as string,
        supplierName: data.supplierName as string,
        supplierAddress: data.supplierAddress as string,
        supplierPhone: data.supplierPhone as string,
        grandAmount: data.grandAmount as number,
        taxAmount: data.taxAmount as number,
        netAmount: data.netAmount as number,
        fileId: data.fileId as string,
      }).then((res) => res.id);

      for (let i = 0; i < data.supplierInvoiceDetail.length; i++) {
        const detail = data.supplierInvoiceDetail[i];
        if (detail) {
          createSupplierInvoiceDetail({
            supplierInvoiceId: supplierInvoiceId,
            description: detail.description,
            uom: detail.uom,
            quantity: detail.quantity,
            unitPrice: detail.unitPrice,
            amount: detail.amount,
            discount: 0,
          });
        }
      }
    } catch (error) {
      throw error;
    }
  };

  return (
    <SessionAuth>
      <PermissionToProject projectId={projectId}>
        <div className="pt-5">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="max-w-screen-xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8 lg:py-16">
              <div className="grid grid-cols-1 gap-y-10 lg:grid-cols-3 lg:gap-x-16">
                <div className="col-span-2 mx-auto text-left lg:mx-0 lg:text-left">
                  <div className="mb-6 flex items-center">
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
                        stroke-width="1.5"
                        stroke="currentColor"
                        className="h-6 w-6"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
                        />
                      </svg>
                    </button>
                    <h2 className="px-3 py-2 text-2xl font-bold uppercase tracking-wider">
                      Invoice
                    </h2>
                  </div>

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
                          <CostCodeDropdown
                            budgets={budgets || []}
                            defaultValue={null}
                            onCostCodeChange={(value) => {
                              setInvoiceData({
                                ...invoiceData,
                                budgetId: value,
                              });
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mb-8 flex flex-wrap justify-between">
                    <div className="mb-2 w-full md:mb-0 md:w-1/3">
                      <label className="mb-1 block text-sm font-bold uppercase tracking-wide text-gray-800">
                        Ship to
                      </label>
                      <div>{invoiceData.vendorName}</div>
                      <div>{invoiceData.vendorAddress}</div>
                      <div>{invoiceData.vendorPhone}</div>
                    </div>
                    <div className="w-full md:w-1/3">
                      <label className="mb-1 block text-sm font-bold uppercase tracking-wide text-gray-800">
                        Bill to (Supplier)
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

                    <div className="w-20 px-1 text-right">
                      <p className="text-sm font-bold uppercase tracking-wide text-gray-800">
                        Units
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
                          Amount
                        </span>
                      </p>
                    </div>

                    <div className="w-20 px-1 text-center"></div>
                  </div>
                  {invoiceData?.supplierInvoiceDetail.map((row, i) => {
                    return (
                      <div
                        key={i}
                        className="-mx-1 flex items-start border-b py-2"
                      >
                        <div className="flex-1 px-1">
                          <p className="text-sm tracking-wide text-gray-800">
                            {row?.description}
                          </p>
                        </div>

                        <div className="w-20 px-1 text-right">
                          <p className="text-sm tracking-wide text-gray-800">
                            {row?.uom}
                          </p>
                        </div>

                        <div className="w-32 px-1 text-right">
                          <p className="leading-none">
                            <span className="block text-sm tracking-wide text-gray-800">
                              {row?.unitPrice}
                            </span>
                          </p>
                        </div>

                        <div className="w-32 px-1 text-right">
                          <p className="leading-none">
                            <span className="block text-sm tracking-wide text-gray-800">
                              {row?.amount}
                            </span>
                          </p>
                        </div>
                        <div className="w-20 px-1 text-center"></div>
                      </div>
                    );
                  })}

                  <div className="ml-auto mt-5 w-full py-2 sm:w-2/4 lg:w-1/2">
                    <div className="mb-3 flex justify-between">
                      <div className="mr-2 flex-1 text-right text-gray-800">
                        Subtotal
                      </div>
                      <div className="w-40">{invoiceData.grandAmount}</div>
                    </div>
                    <div className="mb-4 flex justify-between">
                      <div className="mr-2 flex-1 text-right text-sm text-gray-600">
                        Sale Tax
                      </div>
                      <div className="w-40">{invoiceData.taxAmount}</div>
                    </div>

                    <div className="border-b border-t py-2">
                      <div className="flex justify-between">
                        <div className="mr-2 flex-1 text-right text-xl text-gray-600">
                          Total
                        </div>
                        <div className="w-40">{invoiceData.netAmount}</div>
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <InvoiceLoad onData={handleData} />
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
