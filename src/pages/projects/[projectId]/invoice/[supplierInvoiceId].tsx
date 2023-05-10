import { useRouter } from "next/router";
import { type BaseSyntheticEvent } from "react";
import SessionAuth from "../../../../components/auth/SessionAuth";
import PermissionToProject from "../../../../components/auth/PermissionToProject";
import type { supplierInvoice } from "../../../../hooks/supplierInvoice";
import ReactDatePicker from "react-datepicker";
import { ChevronLeftIcon, ChevronRightIcon } from "@radix-ui/react-icons";
import { Controller, useForm } from 'react-hook-form';
import { env } from "../../../../env/client.mjs";
import {
  useGetPreSignedURLForDownload,
} from "../../../../hooks/s3";
import { useGetSupplierInvoice, useUpdateSupplierInvoice } from "../../../../hooks/supplierInvoice";
import { useGetSupplierInvoiceDetails } from '../../../../hooks/supplierInvoiceDetail';
import parse from 'date-fns/parse'
import toast from "react-hot-toast";
import CostCenterDropdown from '../../../../components/costCenter/CostCenterDropdown';
import { useGetCostCenters } from "../../../../hooks/costCenter";

const SupplierInvoiceView = () => {
  const router = useRouter();
  const projectId = router.query.projectId as string;
  const supplierInvoiceId = router.query.supplierInvoiceId as string;
  const { supplierInvoice: supplierInvoiceData, isLoading } = useGetSupplierInvoice({
    supplierInvoiceId: supplierInvoiceId,
  });
  const { updateSupplierInvoice } = useUpdateSupplierInvoice({ projectId: projectId });
  const { costCenters } = useGetCostCenters({ projectId: projectId });

  const { supplierInvoiceDetails: supplierInvoiceDetailsData } = useGetSupplierInvoiceDetails({
    supplierInvoiceId: supplierInvoiceId,
  });

  const { getPreSignedURLForDownload } = useGetPreSignedURLForDownload();

  const { handleSubmit, control, register, getValues } = useForm<supplierInvoice>({
    values: supplierInvoiceData,
    // resetOptions: {
    //   keepDirtyValues: true, // keep dirty fields unchanged, but update defaultValues
    // }
  });
  const onSubmit = (
    data : supplierInvoice,
    e: BaseSyntheticEvent<object, unknown, unknown> | undefined
  ) => {
    e?.preventDefault();
    // reset();
    data.projectId = projectId;
    updateSupplierInvoice({
      supplierInvoiceId: supplierInvoiceId,
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
    });
    void router.push(
      "/projects/" + projectId + "/invoice/"
    );
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
        const link = document.createElement('a');  // once we have the file buffer BLOB from the post request we simply need to send a GET request to retrieve the file data
        link.href = url;
        link.download = fileId;
        link.click();
        link.remove();  //afterwards we remove the element
      }
    } catch (error) {
      toast.error("Error when downloading file");
      // This try catch is necessary as getPreSignedURLForDownload
      // returns a promise that can possibly cause a runtime error.
      // we handle this error in src/utils/api.ts so there's no need
      // to do anything here other than catch the error.
    }
  }

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
                  <div className="max-w-screen-xl px-4 py-8 sm:py-12 sm:px-6 lg:py-16 lg:px-8">
                    <div className="mx-auto text-left lg:mx-0 lg:text-left">
                      <form
                        className="m-8"
                        onSubmit={(e) => void handleSubmit(onSubmit)(e)}
                      >
                        {supplierInvoiceData.fileId && <div className="text-right">
                          <button 
                            type="button"
                            className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded inline-flex items-center"
                            onClick={void handleDownloadFile}
                          >
                            <svg className="fill-current w-4 h-4 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                              <path d="M13 8V2H7v6H2l8 8 8-8h-5zM0 18h20v2H0v-2z"/>
                            </svg>
                              Download Document
                          </button>
                        </div>}
                        <div className="flex items-center mb-6">
                          <button
                            type="button"
                            onClick={() => {
                              void router.push(
                                "/projects/" + projectId + "/invoice"
                              );
                            }}
                            className="block rounded-md bg-white px-3 py-2 mx-2 text-center text-sm font-semibold text-black shadow-sm hover:bg-gray-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-300"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="w-6 h-6">
                              <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                            </svg>
                          </button>
                          <h2 className="py-2 px-3 text-2xl font-bold uppercase tracking-wider">
                            Invoice
                          </h2>
                        </div>

                        <div className="flex mb-8 justify-between">
                          <div className="w-2/4">
                            <div className="mb-2 md:mb-1 md:flex items-center">
                              <label className="w-32 text-gray-800 block font-bold text-sm uppercase tracking-wide">Invoice No.</label>
                              <span className="mr-4 inline-block hidden md:block">:</span>
                              <div className="flex-1">
                                <Controller
                                  name="invoiceNo"
                                  control={control}
                                  rules={{required: true}}
                                  render={() => {
                                    return (
                                      <input 
                                        className="mb-1 border-2 border-gray-200 rounded w-full py-2 px-1 leading-tight focus:outline-none focus:border-blue-500" 
                                        type="text" 
                                        placeholder="Invoice No"
                                        defaultValue={supplierInvoiceData?.invoiceNo}
                                        {...register('invoiceNo')}
                                      />
                                    );
                                  }}
                                />
                              </div>
                            </div>
                            <div className="mb-2 md:mb-1 md:flex items-center">
                              <label className="w-32 text-gray-800 block font-bold text-sm uppercase tracking-wide">Invoice Date</label>
                              <span className="mr-4 inline-block hidden md:block">:</span>
                              <div className="flex-1">
                              <Controller
                                name="invoiceDate"
                                control={control}
                                rules={{required: true}}
                                render={({ field }) => {
                                  const { onChange, value } = field;
                                  return (
                                    <ReactDatePicker
                                      selected={(value == undefined) ? null : ((typeof(value) == "string") ? parse(value, 'dd/MM/yyyy', new Date()) : value)}
                                      className="mb-1 border-2 border-gray-200 rounded w-full py-2 px-1 leading-tight focus:outline-none focus:border-blue-500"
                                      onChange={(date) => {
                                        if (date) {
                                          date.setHours(0, 0, 0, 0);
                                          onChange(date);
                                        }
                                      }}
                                      previousMonthButtonLabel=<ChevronLeftIcon />
                                      nextMonthButtonLabel=<ChevronRightIcon />
                                      popperClassName="react-datepicker-bottom"
                                      placeholderText="From (dd/mm/yyyy)"
                                      dateFormat="dd/MM/yyyy"
                                    />
                                  );
                                }}
                              />
                              </div>
                            </div>
                            <div className="mb-2 md:mb-1 md:flex items-center">
                              <label className="w-32 text-gray-800 block font-bold text-sm uppercase tracking-wide">Cost center</label>
                              <span className="mr-4 inline-block hidden md:block">:</span>
                              <div className="flex-1">
                              <Controller
                                name="costCenterId"
                                control={control}
                                render={({ field }) => {
                                  const { onChange, value } = field;
                                  return (
                                    <CostCenterDropdown
                                      costCenters={costCenters || []}
                                      defaultValue={value || null}
                                      onCostCenterChange={(v) => onChange(v)}
                                    />
                                  );
                                }}
                              />
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-wrap justify-between mb-8">
                          <div className="w-full md:w-1/3 mb-2 md:mb-0">
                            <label className="text-gray-800 block mb-1 font-bold text-sm uppercase tracking-wide">Ship to</label>
                              <Controller
                                name="vendorName"
                                control={control}
                                rules={{required: true}}
                                render={() => {
                                  return (
                                    <input 
                                      className="mb-1 border-2 border-gray-200 rounded w-full py-2 px-1 leading-tight focus:outline-none focus:border-blue-500"
                                      type="text" 
                                      placeholder="Vendor Name"
                                      defaultValue={supplierInvoiceData?.vendorName}
                                      {...register('vendorName')}
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
                                      className="mb-1 border-2 border-gray-200 rounded w-full py-2 px-1 leading-tight focus:outline-none focus:border-blue-500"
                                      type="text" 
                                      placeholder="Vendor Address"
                                      defaultValue={supplierInvoiceData?.vendorAddress}
                                      {...register('vendorAddress')}
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
                                      className="mb-1 border-2 border-gray-200 rounded w-full py-2 px-1 leading-tight focus:outline-none focus:border-blue-500"
                                      type="text" 
                                      placeholder="Vendor Phone"
                                      defaultValue={supplierInvoiceData?.vendorPhone}
                                      {...register('vendorPhone')}
                                    />
                                  );
                                }}
                              />
                          </div>
                          <div className="w-full md:w-1/3">
                            <label className="text-gray-800 block mb-1 font-bold text-sm uppercase tracking-wide">Bill to (Supplier)</label>
                            <Controller
                              name="supplierName"
                              control={control}
                              rules={{required: true}}
                              render={() => {
                                return (
                                  <input 
                                    className="mb-1 border-2 border-gray-200 rounded w-full py-2 px-1 leading-tight focus:outline-none focus:border-blue-500"
                                    type="text" 
                                    placeholder="Supplier Name"
                                    defaultValue={supplierInvoiceData?.supplierName}
                                    {...register('supplierName')}
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
                                    className="mb-1 border-2 border-gray-200 rounded w-full py-2 px-1 leading-tight focus:outline-none focus:border-blue-500"
                                    type="text" 
                                    placeholder="Supplier Address"
                                    defaultValue={supplierInvoiceData?.supplierAddress}
                                    {...register('supplierAddress')}
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
                                    className="mb-1 border-2 border-gray-200 rounded w-full py-2 px-1 leading-tight focus:outline-none focus:border-blue-500"
                                    type="text" 
                                    placeholder="Supplier Phone"
                                    defaultValue={supplierInvoiceData?.supplierPhone}
                                    {...register('supplierPhone')}
                                  />
                                );
                              }}
                            />
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
                        {supplierInvoiceDetailsData && supplierInvoiceDetailsData.map((row, i) => {
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
                        <button
                          className="mt-6 bg-white hover:bg-gray-100 text-gray-700 font-semibold py-2 px-4 text-sm border border-gray-300 rounded shadow-sm"
                          type="button"
                        >
                          Add Invoice Items
                        </button>

                        <div className="py-2 ml-auto mt-5 w-full sm:w-2/4 lg:w-1/2">
                          <div className="flex justify-between mb-3">
                            <div className="text-gray-800 text-right mr-2 flex-1">Subtotal</div>
                            <div className="w-40">
                              <Controller
                                name="grandAmount"
                                control={control}
                                rules={{required: true}}
                                render={() => {
                                  return (
                                    <input 
                                      className="mb-1 text-right border-2 border-gray-200 rounded w-full py-2 px-1 leading-tight focus:outline-none focus:border-blue-500"
                                      type="number" 
                                      placeholder="Amount"
                                      defaultValue={supplierInvoiceData?.grandAmount}
                                      {...register('grandAmount')}
                                    />
                                  );
                                }}
                              />
                            </div>
                          </div>
                          <div className="flex justify-between mb-4">
                            <div className="text-sm text-gray-600 mr-2 text-right flex-1">Sale Tax</div>
                            <div className="w-40">
                              <Controller
                                name="taxAmount"
                                control={control}
                                rules={{required: true}}
                                render={() => {
                                  return (
                                    <input 
                                      className="mb-1 text-right border-2 border-gray-200 rounded w-full py-2 px-1 leading-tight focus:outline-none focus:border-blue-500"
                                      type="number" 
                                      placeholder="Tax Amount"
                                      defaultValue={supplierInvoiceData?.taxAmount}
                                      {...register('taxAmount')}
                                    />
                                  );
                                }}
                              />
                            </div>
                          </div>
                        
                          <div className="py-2 border-t border-b">
                            <div className="flex justify-between">
                              <div className="text-xl text-gray-600 mr-2 text-right flex-1">Total</div>
                              <div className="w-40">
                                <Controller
                                  name="netAmount"
                                  control={control}
                                  rules={{required: true}}
                                  render={() => {
                                    return (
                                      <input 
                                        className="mb-1 text-right border-2 border-gray-200 rounded w-full py-2 px-1 leading-tight focus:outline-none focus:border-blue-500"
                                        type="number" 
                                        placeholder="Total Amount"
                                        defaultValue={supplierInvoiceData?.netAmount}
                                        {...register('netAmount')}
                                      />
                                    );
                                  }}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                        <button
                          className="inline-flex h-9 items-center justify-center rounded-md bg-blue-100 py-0 px-4 text-sm font-medium text-blue-700 hover:bg-blue-200 disabled:bg-blue-50 disabled:text-blue-200"
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
