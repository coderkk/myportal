import { useRouter } from "next/router";
import { useState, type BaseSyntheticEvent } from "react";
import SessionAuth from "../../../../components/auth/SessionAuth";
import PermissionToProject from "../../../../components/auth/PermissionToProject";
import type { supplierInvoice } from "../../../../hooks/supplierInvoice";
import ReactDatePicker from "react-datepicker";
import { ChevronLeftIcon, ChevronRightIcon } from "@radix-ui/react-icons";
import { Controller, useForm } from 'react-hook-form';
import { useCreateSupplierInvoice } from "../../../../hooks/supplierInvoice";
import parse from 'date-fns/parse'
import InvoiceForm from '../../../../components/invoice/InvoiceForm'

import InvoiceUpload from "../../../../components/invoice/InvoiceUpload";

const InvoiceUploadPage = () => {
  const router = useRouter();
  const projectId = router.query.projectId as string;

  const [invoiceData, setInvoiceData] = useState<supplierInvoice>({
    supplierInvoiceId: "",
    projectId: projectId,
    invoiceNo: "",
    invoiceDate: null,
    costCode: "",
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
    fileId: ""
  });

  const { createSupplierInvoice } = useCreateSupplierInvoice();

  const { handleSubmit, control, register } = useForm<supplierInvoice>({
    values: invoiceData,
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
    saveRecord(data);
  };

  const handleData = (data: supplierInvoice, fileId: string) => {
    setInvoiceData(data)
    data.fileId = fileId;
    saveRecord(data);
  }

  const saveRecord = (data: supplierInvoice) => {
    data.projectId = projectId;
    try {
      createSupplierInvoice({
        projectId: projectId,
        description: "",
        costCode: "",
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
      });
      void router.push(
        "/projects/" + projectId + "/invoice/"
      );
    } catch (error) {
      throw error;
    }
  }

  return (
    <SessionAuth>
      <PermissionToProject projectId={projectId}>
        <div className="pt-5">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="max-w-screen-xl px-4 py-8 sm:py-12 sm:px-6 lg:py-16 lg:px-8">
              <div className="grid grid-cols-1 gap-y-10 lg:grid-cols-3 lg:gap-x-16">
                <div className="mx-auto text-left lg:mx-0 lg:text-left col-span-2">
                  <form
                    className="m-8"
                    onSubmit={(e) => void handleSubmit(onSubmit)(e)}
                  >
                    <div className="flex justify-between">
                      <h2 className="text-2xl font-bold mb-6 pb-2 tracking-wider uppercase">Invoice</h2>
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
                                    defaultValue={invoiceData.invoiceNo}
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
                                  defaultValue={invoiceData.vendorName}
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
                                  defaultValue={invoiceData.vendorAddress}
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
                                  defaultValue={invoiceData.vendorPhone}
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
                                defaultValue={invoiceData.supplierName}
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
                                defaultValue={invoiceData.supplierAddress}
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
                                defaultValue={invoiceData.supplierPhone}
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
                                  defaultValue={invoiceData.grandAmount}
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
                                  defaultValue={invoiceData.taxAmount}
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
                                    defaultValue={invoiceData.netAmount}
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
                <div>
                  <InvoiceForm />
                </div>
              </div>
            </div>
          </div>
        </div>
      </PermissionToProject>
    </SessionAuth>
  );
};

export default InvoiceUploadPage;
