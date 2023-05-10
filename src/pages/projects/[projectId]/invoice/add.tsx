import { ChevronLeftIcon, ChevronRightIcon } from "@radix-ui/react-icons";
import { parse } from "date-fns";
import { useRouter } from "next/router";
import { useState, type BaseSyntheticEvent } from "react";
import ReactDatePicker from "react-datepicker";
import { Controller, useForm } from "react-hook-form";
import PermissionToProject from "../../../../components/auth/PermissionToProject";
import SessionAuth from "../../../../components/auth/SessionAuth";
import CostCenterDropdown from "../../../../components/costCenter/CostCenterDropdown";
import { useGetCostCenters } from "../../../../hooks/costCenter";
import type { supplierInvoice } from "../../../../hooks/supplierInvoice";
import { useCreateSupplierInvoice } from "../../../../hooks/supplierInvoice";

const AddInvoicePage = ({}) => {
  const router = useRouter();
  const projectId = router.query.projectId as string;

  const [invoiceData] = useState<supplierInvoice>({
    supplierInvoiceId: "",
    projectId: projectId,
    invoiceNo: "",
    invoiceDate: null,
    costCenterId: "",
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
  });

  const { createSupplierInvoice } = useCreateSupplierInvoice();
  const { costCenters } = useGetCostCenters({ projectId: projectId });

  const { handleSubmit, control, register } = useForm<supplierInvoice>({
    values: invoiceData,
    // resetOptions: {
    //   keepDirtyValues: true, // keep dirty fields unchanged, but update defaultValues
    // }
  });
  const onSubmit = (
    data: supplierInvoice,
    e: BaseSyntheticEvent<object, unknown, unknown> | undefined
  ) => {
    e?.preventDefault();
    // reset();
    saveRecord(data);
  };

  const saveRecord = (data: supplierInvoice) => {
    data.projectId = projectId;
    try {
      void createSupplierInvoice({
        projectId: projectId,
        description: "",
        costCenterId: "",
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
      void router.push("/projects/" + projectId + "/invoice/");
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
                <div className="col-span-3 mx-auto text-left lg:mx-0 lg:text-left">
                  <form
                    className="m-8"
                    onSubmit={(e) => void handleSubmit(onSubmit)(e)}
                  >
                    <div className="flex justify-between">
                      <h2 className="mb-6 pb-2 text-2xl font-bold uppercase tracking-wider">
                        Invoice
                      </h2>
                    </div>

                    <div className="mb-8 flex justify-between">
                      <div className="w-2/4">
                        <div className="mb-2 items-center md:mb-1 md:flex">
                          <label className="block w-32 text-sm font-bold uppercase tracking-wide text-gray-800">
                            Invoice No.
                          </label>
                          <span className="mr-4 inline-block hidden md:block">
                            :
                          </span>
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
                                    defaultValue={invoiceData.invoiceNo}
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
                          <span className="mr-4 inline-block hidden md:block">
                            :
                          </span>
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
                                        ? parse(value, "dd/MM/yyyy", new Date())
                                        : value
                                    }
                                    className="mb-1 w-full rounded border-2 border-gray-200 px-1 py-2 leading-tight focus:border-blue-500 focus:outline-none"
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
                        <div className="mb-2 items-center md:mb-1 md:flex">
                          <label className="block w-32 text-sm font-bold uppercase tracking-wide text-gray-800">
                            Cost center
                          </label>
                          <span className="mr-4 inline-block md:block">:</span>
                          <div className="flex-1">
                            <Controller
                              name="costCenterId"
                              control={control}
                              render={({ field }) => {
                                const { onChange } = field;
                                return (
                                  <CostCenterDropdown
                                    costCenters={costCenters || []}
                                    defaultValue={null}
                                    onCostCenterChange={(value) =>
                                      onChange(value)
                                    }
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
                                defaultValue={invoiceData.vendorName}
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
                                defaultValue={invoiceData.vendorAddress}
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
                                defaultValue={invoiceData.vendorPhone}
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
                                defaultValue={invoiceData.supplierName}
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
                                defaultValue={invoiceData.supplierAddress}
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
                                defaultValue={invoiceData.supplierPhone}
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

                      <div className="w-20 px-1 text-center"></div>
                    </div>

                    <button
                      className="mt-6 rounded border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-100"
                      type="button"
                    >
                      Add Invoice Items
                    </button>

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
                                  placeholder="Amount"
                                  defaultValue={invoiceData.grandAmount}
                                  {...register("grandAmount")}
                                />
                              );
                            }}
                          />
                        </div>
                      </div>
                      <div className="mb-4 flex justify-between">
                        <div className="mr-2 flex-1 text-right text-sm text-gray-600">
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
                                  placeholder="Tax Amount"
                                  defaultValue={invoiceData.taxAmount}
                                  {...register("taxAmount")}
                                />
                              );
                            }}
                          />
                        </div>
                      </div>

                      <div className="border-b border-t py-2">
                        <div className="flex justify-between">
                          <div className="mr-2 flex-1 text-right text-xl text-gray-600">
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
                                    placeholder="Total Amount"
                                    defaultValue={invoiceData.netAmount}
                                    {...register("netAmount")}
                                  />
                                );
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                    <button
                      className="inline-flex h-9 items-center justify-center rounded-md bg-blue-100 px-4 py-0 text-sm font-medium text-blue-700 hover:bg-blue-200 disabled:bg-blue-50 disabled:text-blue-200"
                      type="submit"
                    >
                      Submit
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </PermissionToProject>
    </SessionAuth>
  );
};

export default AddInvoicePage;
