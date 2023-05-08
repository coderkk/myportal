import { useRouter } from "next/router";
import { useState } from "react";
import type { supplierInvoice } from "../../hooks/supplierInvoice";
import { format } from 'date-fns'
import * as Dialog from "@radix-ui/react-dialog";
import { Close } from "@styled-icons/ionicons-outline";
import { useCreateSupplierInvoice } from "../../hooks/supplierInvoice";
import { useCreateSupplierInvoiceDetail } from "../../hooks/supplierInvoiceDetail";

import toast from "react-hot-toast";
import { useGetPreSignedURLForUpload } from "../../hooks/s3";
import { api } from "../../utils/api";
import { nanoid } from "nanoid";
import { env } from "../../env/client.mjs";

import CostCenterDropdown from '../../components/costCenter/CostCenterDropdown';
import { useGetCostCenters } from "../../hooks/costCenter";

import InvoiceLoad from "../../components/invoice/InvoiceLoad";

type SupplierInvoiceDetail = {
  item: string;
  description: string;
  quantity: number;
  uom: string;
  unitPrice: number;
  discount: number;
  amount: number;
}

interface SupplierInvoiceWithDetail extends supplierInvoice {
  supplierInvoiceDetail: SupplierInvoiceDetail[];
}

const InvoiceFormPage = () => {
  const router = useRouter();
  const utils = api.useContext();
  const projectId = router.query.projectId as string;
  const [open, setOpen] = useState(false);

  const [file, setFile] = useState<File | null>(null);
  const [fileId, setFileId] = useState<string>("");
  const [folderPrefix] = useState("/");
  const { getPreSignedURLForUpload } = useGetPreSignedURLForUpload();
  const { createSupplierInvoice } = useCreateSupplierInvoice();
  const { createSupplierInvoiceDetail } = useCreateSupplierInvoiceDetail();

  const emptyData = {
    supplierInvoiceId: "",
    projectId: projectId,
    invoiceNo: "",
    invoiceDate: null,
    costCodeId: "",
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
    supplierInvoiceDetail: []
  }

  const [invoiceData, setInvoiceData] = useState<SupplierInvoiceWithDetail>(emptyData);
  const { costCenters } = useGetCostCenters({ projectId: projectId });

  const handleData = (data: SupplierInvoiceWithDetail, file: File | null) => {
    setInvoiceData(data);
    setFile(file);

    let fid = ""
    if (file != null) {
      const id = nanoid();
      const fileName =
        file.name.slice(0, file.name.lastIndexOf(".")) +
        "-" +
        id +
        file.name.slice(file.name.lastIndexOf("."));
      fid = folderPrefix === "/" ? fileName : folderPrefix + fileName;
    }
    setFileId(fid);
  }

  const handleConfirmUpload = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    try {
      setFileId("");
      await uploadDocument();
      if (fileId != "") {
        invoiceData.fileId = fileId;
        await saveRecord(invoiceData);
        router.reload();
      }
    } catch(e) {
      toast.error("Error occur")
    }

  }

  const uploadDocument = async () => {
    if ( file == null) {
      toast.error("Error! You not yet select the documents");
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
  } 

  const saveRecord = async (data: SupplierInvoiceWithDetail) => {
    data.projectId = projectId;
    try {
      const supplierInvoiceId = await createSupplierInvoice({
        projectId: projectId,
        description: "",
        costCenterId: data.costCenterId as string,
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
        if (detail != undefined) {
          createSupplierInvoiceDetail({
            supplierInvoiceId: supplierInvoiceId,
            description: detail.description,
            uom: detail.uom,
            quantity: detail.quantity,
            unitPrice: detail.unitPrice,
            amount: detail.amount,
            discount: 0
          })
        }
      }
      toast.success("Record has saved");

    } catch (error) {
      throw error;
    }
  }

  return (
    <>
      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Trigger asChild>
          <button 
            className="block rounded-md bg-indigo-600 px-3 py-2 mx-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            Upload Invoice
          </button>
        </Dialog.Trigger>
        <Dialog.Portal className="px-4 py-8 sm:py-12 sm:px-6 lg:py-16 lg:px-8">
          <Dialog.Overlay className="fixed inset-0 animate-fade-in bg-slate-300" />
          <Dialog.Content className="w-full h-full fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-content-show rounded-md bg-white p-6 shadow-md focus:outline-none">
            <Dialog.Title className="m-0 font-medium text-gray-800">
              Import invoice
            </Dialog.Title>
            <Dialog.Description className="mx-0 mt-3 mb-5 text-sm text-gray-400">
              Import and preview invoice from pdf file
            </Dialog.Description>
            <div>
              <div className="grid grid-cols-1 gap-y-10 lg:grid-cols-3 lg:gap-x-16">
                <div className="mx-auto text-left lg:mx-0 lg:text-left col-span-2">
                  <div className="flex justify-between">
                    <h2 className="text-2xl font-bold mb-6 pb-2 tracking-wider uppercase">Invoice</h2>
                  </div>

                  <div className="flex mb-8 justify-between">
                    <div className="w-2/4">
                      <div className="mb-2 md:mb-1 md:flex items-center">
                        <label className="w-32 text-gray-800 block font-bold text-sm uppercase tracking-wide">Invoice No.</label>
                        <span className="mr-4 inline-block hidden md:block">:</span>
                        <div className="flex-1">
                          {invoiceData.invoiceNo}
                        </div>
                      </div>
                      <div className="mb-2 md:mb-1 md:flex items-center">
                        <label className="w-32 text-gray-800 block font-bold text-sm uppercase tracking-wide">Invoice Date</label>
                        <span className="mr-4 inline-block hidden md:block">:</span>
                        <div className="flex-1">
                          {(invoiceData.invoiceDate == undefined || invoiceData.invoiceDate == null) ? "" : format(invoiceData.invoiceDate, 'dd/MM/yyyy')}
                        </div>
                      </div>
                      <div className="mb-2 md:mb-1 md:flex items-center">
                        <label className="w-32 text-gray-800 block font-bold text-sm uppercase tracking-wide">Cost center</label>
                        <span className="mr-4 inline-block hidden md:block">:</span>
                        <div className="flex-1">
                            <CostCenterDropdown
                              costCenters={costCenters || []}
                              defaultValue={null}
                              onCostCenterChange={(value) => {
                                setInvoiceData({...invoiceData, costCenterId: value});
                              }}
                            />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap justify-between mb-8">
                    <div className="w-full md:w-1/3 mb-2 md:mb-0">
                      <label className="text-gray-800 block mb-1 font-bold text-sm uppercase tracking-wide">Ship to</label>
                        <div>{invoiceData.vendorName}</div>
                        <div>{invoiceData.vendorAddress}</div>
                        <div>{invoiceData.vendorPhone}</div>
                    </div>
                    <div className="w-full md:w-1/3">
                      <label className="text-gray-800 block mb-1 font-bold text-sm uppercase tracking-wide">Bill to (Supplier)</label>
                      <div>{invoiceData.supplierName}</div>
                      <div>{invoiceData.supplierAddress}</div>
                      <div>{invoiceData.supplierPhone}</div>
                    </div>
                  </div>

                  <div className="flex -mx-1 border-b py-2 items-start">
                    <div className="flex-1 px-1">
                      <p className="text-gray-800 uppercase tracking-wide text-sm font-bold">Description</p>
                    </div>

                    <div className="px-1 w-20 text-right">
                      <p className="text-gray-800 uppercase tracking-wide text-sm font-bold">Units</p>
                    </div>

                    <div className="px-1 w-32 text-right">
                      <p className="leading-none">
                        <span className="block uppercase tracking-wide text-sm font-bold text-gray-800">Unit Price</span>
                      </p>
                    </div>

                    <div className="px-1 w-32 text-right">
                      <p className="leading-none">
                        <span className="block uppercase tracking-wide text-sm font-bold text-gray-800">Amount</span>
                      </p>
                    </div>

                    <div className="px-1 w-20 text-center"></div>
                  </div>
                  {invoiceData?.supplierInvoiceDetail.map((row, i) => {
                    return (<div key={i} className="flex -mx-1 border-b py-2 items-start">
                              <div className="flex-1 px-1">
                                <p className="text-gray-800 tracking-wide text-sm">{row?.description}</p>
                              </div>

                              <div className="px-1 w-20 text-right">
                                <p className="text-gray-800 tracking-wide text-sm">{row?.uom}</p>
                              </div>

                              <div className="px-1 w-32 text-right">
                                <p className="leading-none">
                                  <span className="block tracking-wide text-sm text-gray-800">{row?.unitPrice}</span>
                                </p>
                              </div>

                              <div className="px-1 w-32 text-right">
                                <p className="leading-none">
                                  <span className="block tracking-wide text-sm text-gray-800">{row?.amount}</span>
                                </p>
                              </div>
                              <div className="px-1 w-20 text-center"></div>
                            </div>
                    );
                  })}

                  <div className="py-2 ml-auto mt-5 w-full sm:w-2/4 lg:w-1/2">
                    <div className="flex justify-between mb-3">
                      <div className="text-gray-800 text-right mr-2 flex-1">Subtotal</div>
                      <div className="w-40">
                        {invoiceData.grandAmount}
                      </div>
                    </div>
                    <div className="flex justify-between mb-4">
                      <div className="text-sm text-gray-600 mr-2 text-right flex-1">Sale Tax</div>
                      <div className="w-40">
                        {invoiceData.taxAmount}
                      </div>
                    </div>
                  
                    <div className="py-2 border-t border-b">
                      <div className="flex justify-between">
                        <div className="text-xl text-gray-600 mr-2 text-right flex-1">Total</div>
                        <div className="w-40">
                          {invoiceData.netAmount}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <InvoiceLoad onData={handleData}></InvoiceLoad>
                </div>
              </div>
              <div>
                <button
                    type="button"
                    disabled={invoiceData.invoiceNo == "" || invoiceData.invoiceDate == null || invoiceData.costCenterId == null}
                    className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
                    onClick={(e: React.MouseEvent<HTMLButtonElement>) => { void handleConfirmUpload(e) }}
                  >
                  Confirm
                </button>
                <button
                    className="focus:outline-none text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800"
                    onClick={() => { setOpen(false) }}
                    type="button"
                  >
                  Cancel
                </button>
              </div>
            </div>
            <Dialog.Close asChild>
              <button
                className="absolute top-4 right-4 inline-flex h-6 w-6 items-center justify-center rounded-full hover:bg-blue-200 focus:border-2 focus:border-blue-500 focus:outline-none"
                aria-label="Close"
                type="button"
              >
                <Close className="h-4 w-4" />
              </button>
            </Dialog.Close>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
};

export default InvoiceFormPage;
