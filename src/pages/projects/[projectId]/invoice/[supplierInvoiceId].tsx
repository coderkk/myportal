import { ChevronLeftIcon, ChevronRightIcon } from "@radix-ui/react-icons";
import parse from "date-fns/parse";
import { useRouter } from "next/router";
import { type BaseSyntheticEvent, useState, useEffect } from "react";
import ReactDatePicker from "react-datepicker";
import { Controller, useForm } from "react-hook-form";
import toast from "react-hot-toast";
import PermissionToProject from "../../../../components/auth/PermissionToProject";
import SessionAuth from "../../../../components/auth/SessionAuth";
import CostCodeDropdown from "../../../../components/budget/CostCodeDropdown";
import { env } from "../../../../env/client.mjs";
import { useGetBudgets } from "../../../../hooks/budget";
import { useGetPreSignedURLForDownload } from "../../../../hooks/s3";
import type { supplierInvoice } from "../../../../hooks/supplierInvoice";
import {
  useGetSupplierInvoice,
  useUpdateSupplierInvoice,
} from "../../../../hooks/supplierInvoice";
import { useGetSupplierInvoiceDetails, useCreateSupplierInvoiceDetail, useDeleteSupplierInvoiceDetail } from '../../../../hooks/supplierInvoiceDetail';
import InvoiceItem from "../../../../components/invoice/InvoiceItem"

type SupplierInvoiceDetail = {
  id?: string
  description: string;
  quantity: number;
  uom: string;
  unitPrice: number;
  discount: number;
  amount: number;
};

const SupplierInvoiceView = () => {
  const router = useRouter();
  const projectId = router.query.projectId as string;
  const supplierInvoiceId = router.query.supplierInvoiceId as string;

  const [supplierInvoiceDetail, setSupplierInvoiceDetail] = useState<SupplierInvoiceDetail[]>([])
  const { supplierInvoice: supplierInvoiceData, isLoading } =
    useGetSupplierInvoice({
      supplierInvoiceId: supplierInvoiceId,
    });
  const { updateSupplierInvoice } = useUpdateSupplierInvoice({
    projectId: projectId,
  });
  const { budgets } = useGetBudgets({
    projectId: projectId,
    pageSize: 100,
    pageIndex: 0,
    searchKey: "",
  });

  const { supplierInvoiceDetails: supplierInvoiceDetailsData } =
    useGetSupplierInvoiceDetails({
      supplierInvoiceId: supplierInvoiceId,
    });

  useEffect(() => {
    if (supplierInvoiceDetailsData) setSupplierInvoiceDetail([...supplierInvoiceDetailsData]);
  }, [supplierInvoiceDetailsData])

  const { createSupplierInvoiceDetail } = useCreateSupplierInvoiceDetail();
  const { deleteSupplierInvoiceDetail } = useDeleteSupplierInvoiceDetail({supplierInvoiceId: supplierInvoiceId});


  const { getPreSignedURLForDownload } = useGetPreSignedURLForDownload();

  const invoiceItemUpdateHandler = (InvoiceItem: SupplierInvoiceDetail, index: number) => {
    if (index == -1)
      supplierInvoiceDetail.push(InvoiceItem);
    else
      supplierInvoiceDetail[index] = InvoiceItem;
    setSupplierInvoiceDetail([...supplierInvoiceDetail]);
  }

  const removeInvoiceItemHandler = (e: React.MouseEvent<HTMLButtonElement>, index: number) => {
    e?.preventDefault();
    supplierInvoiceDetail.splice(index, 1);
    setSupplierInvoiceDetail([...supplierInvoiceDetail]);
  }

  const { handleSubmit, control, register, getValues, reset } = useForm<supplierInvoice>({
      values: supplierInvoiceData,
      // resetOptions: {
      //   keepDirtyValues: true, // keep dirty fields unchanged, but update defaultValues
      // }
    });
  const onSubmit = (
    data: supplierInvoice,
    e: BaseSyntheticEvent<object, unknown, unknown> | undefined
  ) => {
    e?.preventDefault();
    reset();
    data.projectId = projectId;
    updateSupplierInvoice({
      supplierInvoiceId: supplierInvoiceId,
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
    });
    if (supplierInvoiceDetail) {
      for (let i = 0; i < supplierInvoiceDetail.length; i++) {
        const detail = supplierInvoiceDetail[i];
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
    }
    void router.push("/projects/" + projectId + "/invoice/");
  };

  const handleDownloadFile = async () => {
    try {
      const fileId = getValues("fileId") as string;
      if (fileId != "") {
        const { preSignedURLForDownload } = await getPreSignedURLForDownload({
          fileId: projectId + "/" + fileId,
          projectId: projectId,
          aws_s3_bucket_name: env.NEXT_PUBLIC_AWS_S3_INVOICES_BUCKET_NAME,
        });
        const res = await fetch(preSignedURLForDownload, {
          method: "GET",
        });
        const url = window.URL.createObjectURL(new Blob([await res.blob()]));
        const link = document.createElement("a"); // once we have the file buffer BLOB from the post request we simply need to send a GET request to retrieve the file data
        link.href = url;
        link.download = fileId;
        link.click();
        link.remove(); //afterwards we remove the element
      }
    } catch (error) {
      toast.error("Error when downloading file");
      // This try catch is necessary as getPreSignedURLForDownload
      // returns a promise that can possibly cause a runtime error.
      // we handle this error in src/utils/api.ts so there's no need
      // to do anything here other than catch the error.
    }
  };

  return (
    <SessionAuth>
      <PermissionToProject projectId={projectId}>
        {isLoading ? (
          <div>Loading...</div>
        ) : (
          supplierInvoiceData && (
            <main>
              <div className="pt-5">
                <div className="px-4 sm:px-6 lg:px-8">
                  <div className="max-w-screen-xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8 lg:py-16">
                    <div className="mx-auto text-left lg:mx-0 lg:text-left">
                      <form
                        className="m-8"
                        onSubmit={(e) => void handleSubmit(onSubmit)(e)}
                      >
                        {supplierInvoiceData.fileId && (
                          <div className="text-right">
                            <button
                              type="button"
                              className="inline-flex items-center rounded bg-gray-300 px-4 py-2 font-bold text-gray-800 hover:bg-gray-400"
                              onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                                e.preventDefault();
                                void handleDownloadFile();
                              }}
                            >
                              <svg
                                className="mr-2 h-4 w-4 fill-current"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 20 20"
                              >
                                <path d="M13 8V2H7v6H2l8 8 8-8h-5zM0 18h20v2H0v-2z" />
                              </svg>
                              Download Document
                            </button>
                          </div>
                        )}
                        <div className="mb-6 flex items-center">
                          <button
                            type="button"
                            onClick={() => {
                              void router.push(
                                "/projects/" + projectId + "/invoice"
                              );
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
                              <div className="flex-1">
                                <Controller
                                  name="invoiceNo"
                                  control={control}
                                  rules={{ required: true }}
                                  render={() => {
                                    return (
                                      <input
                                        className="mb-1 w-full rounded border-2 border-gray-200 px-1 py-2 leading-tight focus:border-blue-500 focus:outline-none"
                                        type="text"
                                        placeholder="Invoice No"
                                        defaultValue={
                                          supplierInvoiceData?.invoiceNo
                                        }
                                        {...register("invoiceNo")}
                                      />
                                    );
                                  }}
                                />
                              </div>
                            </div>
                            <div className="mb-2 items-center md:mb-1 md:flex">
                              <label className="block w-32 text-sm font-bold uppercase tracking-wide text-gray-800">
                                Invoice Date
                              </label>
                              <div className="flex-1">
                                <Controller
                                  name="invoiceDate"
                                  control={control}
                                  rules={{ required: true }}
                                  render={({ field }) => {
                                    const { onChange, value } = field;
                                    return (
                                      <ReactDatePicker
                                        selected={
                                          value == undefined
                                            ? null
                                            : typeof value == "string"
                                            ? parse(
                                                value,
                                                "dd/MM/yyyy",
                                                new Date()
                                              )
                                            : value
                                        }
                                        className="mb-1 w-full rounded border-2 border-gray-200 px-1 py-2 leading-tight focus:border-blue-500 focus:outline-none"
                                        onChange={(date) => {
                                          if (date) {
                                            date.setHours(0, 0, 0, 0);
                                            onChange(date);
                                          }
                                        }}
                                        previousMonthButtonLabel={
                                          <ChevronLeftIcon className="h-6 w-6 text-slate-500" />
                                        }
                                        nextMonthButtonLabel={
                                          <ChevronRightIcon className="h-6 w-6 text-slate-500" />
                                        }
                                        popperClassName="react-datepicker-bottom"
                                        placeholderText="From (dd/mm/yyyy)"
                                        dateFormat="dd/MM/yyyy"
                                      />
                                    );
                                  }}
                                />
                              </div>
                            </div>
                            <div className="mb-2 items-center md:mb-1 md:flex">
                              <label className="block w-32 text-sm font-bold uppercase tracking-wide text-gray-800">
                                Cost code
                              </label>
                              <div className="flex-1">
                                <Controller
                                  name="budgetId"
                                  control={control}
                                  render={({ field }) => {
                                    const { onChange, value } = field;
                                    return (
                                      <CostCodeDropdown
                                        budgets={budgets || []}
                                        defaultValue={value || null}
                                        onCostCodeChange={(v) => onChange(v)}
                                      />
                                    );
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
                            <Controller
                              name="vendorName"
                              control={control}
                              rules={{ required: true }}
                              render={() => {
                                return (
                                  <input
                                    className="mb-1 w-full rounded border-2 border-gray-200 px-1 py-2 leading-tight focus:border-blue-500 focus:outline-none"
                                    type="text"
                                    placeholder="Vendor Name"
                                    defaultValue={
                                      supplierInvoiceData?.vendorName
                                    }
                                    {...register("vendorName")}
                                  />
                                );
                              }}
                            />
                            <Controller
                              name="vendorAddress"
                              control={control}
                              render={() => {
                                return (
                                  <input
                                    className="mb-1 w-full rounded border-2 border-gray-200 px-1 py-2 leading-tight focus:border-blue-500 focus:outline-none"
                                    type="text"
                                    placeholder="Vendor Address"
                                    defaultValue={
                                      supplierInvoiceData?.vendorAddress
                                    }
                                    {...register("vendorAddress")}
                                  />
                                );
                              }}
                            />
                            <Controller
                              name="vendorPhone"
                              control={control}
                              render={() => {
                                return (
                                  <input
                                    className="mb-1 w-full rounded border-2 border-gray-200 px-1 py-2 leading-tight focus:border-blue-500 focus:outline-none"
                                    type="text"
                                    placeholder="Vendor Phone"
                                    defaultValue={
                                      supplierInvoiceData?.vendorPhone
                                    }
                                    {...register("vendorPhone")}
                                  />
                                );
                              }}
                            />
                          </div>
                          <div className="w-full md:w-1/3">
                            <label className="mb-1 block text-sm font-bold uppercase tracking-wide text-gray-800">
                              Bill to (Supplier)
                            </label>
                            <Controller
                              name="supplierName"
                              control={control}
                              rules={{ required: true }}
                              render={() => {
                                return (
                                  <input
                                    className="mb-1 w-full rounded border-2 border-gray-200 px-1 py-2 leading-tight focus:border-blue-500 focus:outline-none"
                                    type="text"
                                    placeholder="Supplier Name"
                                    defaultValue={
                                      supplierInvoiceData?.supplierName
                                    }
                                    {...register("supplierName")}
                                  />
                                );
                              }}
                            />
                            <Controller
                              name="supplierAddress"
                              control={control}
                              render={() => {
                                return (
                                  <input
                                    className="mb-1 w-full rounded border-2 border-gray-200 px-1 py-2 leading-tight focus:border-blue-500 focus:outline-none"
                                    type="text"
                                    placeholder="Supplier Address"
                                    defaultValue={
                                      supplierInvoiceData?.supplierAddress
                                    }
                                    {...register("supplierAddress")}
                                  />
                                );
                              }}
                            />
                            <Controller
                              name="supplierPhone"
                              control={control}
                              render={() => {
                                return (
                                  <input
                                    className="mb-1 w-full rounded border-2 border-gray-200 px-1 py-2 leading-tight focus:border-blue-500 focus:outline-none"
                                    type="text"
                                    placeholder="Supplier Phone"
                                    defaultValue={
                                      supplierInvoiceData?.supplierPhone
                                    }
                                    {...register("supplierPhone")}
                                  />
                                );
                              }}
                            />
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

                          <div className="w-40 px-1 text-center"></div>
                        </div>
                        {supplierInvoiceDetail && supplierInvoiceDetail.map((row, i) => {
                          return (<div 
                            key={i} 
                            className="mx-1 flex items-center border-b py-2"
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
                                <div className="w-40 px-1 text-center">
                                      <InvoiceItem 
                                        title="Edit"
                                        index={i}
                                        invoiceItem={row} 
                                        onUpdate={(data, index) => {
                                            invoiceItemUpdateHandler(data as SupplierInvoiceDetail, index)
                                          }
                                        }
                                        />
                                        <button
                                          type="button"
                                          className="mx-1 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                                          onClick={(e) => removeInvoiceItemHandler(e, i)}
                                        >
                                          Delete
                                        </button>
                                    </div>
                              </div>
                            );
                          })}
                        <div className="mt-5">
                          <InvoiceItem 
                            title="Add new item"
                            index={-1}
                            invoiceItem={{
                            description: "",
                            quantity: 0,
                            uom: "",
                            unitPrice: 0,
                            amount: 0
                          }} onUpdate={(data, index) => {
                              invoiceItemUpdateHandler(data as SupplierInvoiceDetail, index)
                            }
                          }  />
                        </div>

                        <div className="ml-auto mt-5 w-full py-2 sm:w-2/4 lg:w-1/2">
                          <div className="mb-3 flex justify-between">
                            <div className="mr-2 flex-1 text-right text-gray-800">
                              Subtotal
                            </div>
                            <div className="w-40">
                              <Controller
                                name="grandAmount"
                                control={control}
                                rules={{ required: true }}
                                render={() => {
                                  return (
                                    <input
                                      className="mb-1 w-full rounded border-2 border-gray-200 px-1 py-2 text-right leading-tight focus:border-blue-500 focus:outline-none"
                                      type="number"
                                      step="0.01"
                                      placeholder="Amount"
                                      defaultValue={
                                        supplierInvoiceData?.grandAmount
                                      }
                                      {...register("grandAmount", { valueAsNumber: true })}
                                    />
                                  );
                                }}
                              />
                            </div>
                          </div>
                          <div className="mb-3 flex justify-between">
                            <div className="mr-2 flex-1 text-right text-gray-800">
                              Sale Tax
                            </div>
                            <div className="w-40">
                              <Controller
                                name="taxAmount"
                                control={control}
                                rules={{ required: true }}
                                render={() => {
                                  return (
                                    <input
                                      className="mb-1 w-full rounded border-2 border-gray-200 px-1 py-2 text-right leading-tight focus:border-blue-500 focus:outline-none"
                                      type="number"
                                      step="0.01"
                                      placeholder="Tax Amount"
                                      defaultValue={
                                        supplierInvoiceData?.taxAmount
                                      }
                                      {...register("taxAmount",  { valueAsNumber: true })}
                                    />
                                  );
                                }}
                              />
                            </div>
                          </div>

                          <div className="border-b border-t py-2">
                            <div className="flex justify-between">
                              <div className="mr-2 flex-1 text-right text-xl text-gray-800">
                                Total
                              </div>
                              <div className="w-40">
                                <Controller
                                  name="netAmount"
                                  control={control}
                                  rules={{ required: true }}
                                  render={() => {
                                    return (
                                      <input
                                        className="mb-1 w-full rounded border-2 border-gray-200 px-1 py-2 text-right leading-tight focus:border-blue-500 focus:outline-none"
                                        type="number"
                                        step="0.01"
                                        placeholder="Total Amount"
                                        defaultValue={
                                          supplierInvoiceData?.netAmount
                                        }
                                        {...register("netAmount",  { valueAsNumber: true })}
                                      />
                                    );
                                  }}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                        <button
                          className="bg-blue-500 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline hover:bg-blue-700 disabled:bg-blue-50 disabled:text-blue-200"
                          type="submit"
                        >
                          Submit
                        </button>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            </main>
          )
        )}
      </PermissionToProject>
    </SessionAuth>
  );
};

export default SupplierInvoiceView;
