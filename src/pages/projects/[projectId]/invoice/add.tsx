import { ChevronLeftIcon, ChevronRightIcon } from "@radix-ui/react-icons";
import { parse } from "date-fns";
import { nanoid } from "nanoid";
import { useRouter } from "next/router";
import { useState, type BaseSyntheticEvent } from "react";
import ReactDatePicker from "react-datepicker";
import { Controller, useForm } from "react-hook-form";
import PermissionToProject from "../../../../components/auth/PermissionToProject";
import SessionAuth from "../../../../components/auth/SessionAuth";
import SelectList from "../../../../components/common/SelectList";
import type { SupplierInvoiceItem } from "../../../../components/invoice/InvoiceItem";
import InvoiceItem from "../../../../components/invoice/InvoiceItem";
import { useGetBudgets } from "../../../../hooks/budget";
import { useCreateSupplierInvoice } from "../../../../hooks/supplierInvoice";
import type { SupplierInvoiceWithItems } from "./import";

const AddInvoicePage = ({}) => {
  const router = useRouter();
  const projectId = router.query.projectId as string;

  const [invoiceData] = useState<SupplierInvoiceWithItems>({
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

  const [supplierInvoiceItems, setSupplierInvoiceItems] = useState<
    SupplierInvoiceItem[]
  >([]);

  const { createSupplierInvoice } = useCreateSupplierInvoice();

  const { budgets } = useGetBudgets({
    projectId: projectId,
    pageSize: 100,
    pageIndex: 0,
    searchKey: "",
  });

  const {
    handleSubmit,
    control,
    register,
    reset,
    formState: { errors },
  } = useForm<SupplierInvoiceWithItems>({
    values: invoiceData,
  });

  const onSubmit = (
    data: SupplierInvoiceWithItems,
    e: BaseSyntheticEvent<object, unknown, unknown> | undefined
  ) => {
    e?.preventDefault();
    reset();
    createSupplierInvoice({
      ...data,
      projectId: projectId,
      budgetId: data?.budgetId || "", // PLANETSCALE FIX
      supplierInvoiceItems: supplierInvoiceItems,
    });
    void router.push("/projects/" + projectId + "/invoice/");
  };

  const onInvoiceUpdate = (invoiceItem: SupplierInvoiceItem, index: number) => {
    const newSupplierInvoiceItems = [...supplierInvoiceItems];
    newSupplierInvoiceItems[index] = invoiceItem;
    setSupplierInvoiceItems(newSupplierInvoiceItems);
  };

  const removeInvoiceItem = (index: number) => {
    const newSupplierInvoiceItems = [...supplierInvoiceItems];
    newSupplierInvoiceItems.splice(index, 1);
    setSupplierInvoiceItems(newSupplierInvoiceItems);
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
                                    className={`mb-1 w-full rounded border-2 border-gray-200 px-1 py-2 leading-tight focus:border-blue-500 focus:outline-none ${
                                      errors.invoiceNo
                                        ? "border-red-400  focus:border-red-400 "
                                        : ""
                                    }`}
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
                                    className={`mb-1 w-full rounded border-2 border-gray-200 px-1 py-2 leading-tight focus:border-blue-500 focus:outline-none ${
                                      errors.invoiceDate
                                        ? "border-red-400  focus:border-red-400 "
                                        : ""
                                    }`}
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
                              rules={{ required: true }}
                              render={({ field }) => {
                                const { onChange, value } = field;

                                const budgetOptions = budgets.map((budget) => ({
                                  value: budget.id,
                                  label: `${budget.costCode} (${budget.description})`,
                                }));
                                const budgetValue = budgetOptions.find(
                                  (budgetOption) => budgetOption.value == value
                                );
                                const selected = budgetValue
                                  ? budgetValue
                                  : budgetOptions[0];
                                return (
                                  <SelectList
                                    selected={
                                      selected || {
                                        value: "No cost code",
                                        label: "No cost code",
                                      }
                                    }
                                    options={
                                      budgetOptions.length > 0
                                        ? budgetOptions
                                        : [
                                            {
                                              value: "No cost code",
                                              label: "No cost code",
                                            },
                                          ]
                                    }
                                    onChange={(option) =>
                                      onChange(option.value)
                                    }
                                    error={errors.budgetId ? true : false}
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
                          Vendor name
                        </label>
                        <Controller
                          name="vendorName"
                          control={control}
                          rules={{ required: true }}
                          render={() => {
                            return (
                              <input
                                className={`mb-1 w-full rounded border-2 border-gray-200 px-1 py-2 leading-tight focus:border-blue-500 focus:outline-none ${
                                  errors.vendorName
                                    ? "border-red-400  focus:border-red-400 "
                                    : ""
                                }`}
                                type="text"
                                placeholder="Vendor Name"
                                defaultValue={invoiceData.vendorName}
                                {...register("vendorName")}
                              />
                            );
                          }}
                        />
                      </div>
                      <div className="w-full md:w-1/3">
                        <label className="mb-1 block text-sm font-bold uppercase tracking-wide text-gray-800">
                          Supplier information
                        </label>
                        <Controller
                          name="supplierName"
                          control={control}
                          rules={{ required: true }}
                          render={() => {
                            return (
                              <input
                                className={`mb-1 w-full rounded border-2 border-gray-200 px-1 py-2 leading-tight focus:border-blue-500 focus:outline-none ${
                                  errors.supplierName
                                    ? "border-red-400  focus:border-red-400 "
                                    : ""
                                }`}
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

                      <div className="w-40 px-1 text-center"></div>
                    </div>
                    {supplierInvoiceItems.map((supplierInvoiceItem, i) => {
                      return (
                        <div
                          key={i}
                          className="mx-1 flex items-center border-b py-2"
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
                          <div className="w-50 px-1 text-center">
                            <InvoiceItem
                              title="Edit"
                              index={i}
                              invoiceItem={supplierInvoiceItem}
                              onUpdate={(data) => {
                                onInvoiceUpdate(data, i);
                              }}
                            />
                            <button
                              type="button"
                              className="focus:shadow-outline mx-1 rounded bg-red-500 px-4 py-2 font-bold text-white hover:bg-red-700 focus:outline-none"
                              onClick={() => removeInvoiceItem(i)}
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
                        invoiceItem={{
                          id: nanoid(),
                          description: "",
                          quantity: 0,
                          unit: "",
                          unitPrice: 0,
                          totalPrice: 0,
                        }}
                        addNew={(newInvoiceItem) => {
                          const newSupplierInvoiceItems = [
                            newInvoiceItem,
                            ...supplierInvoiceItems,
                          ];
                          setSupplierInvoiceItems(newSupplierInvoiceItems);
                        }}
                      />
                    </div>

                    <div className="ml-auto mt-5 w-full py-2 sm:w-2/4 lg:w-1/2">
                      <div className="mb-3 flex justify-between">
                        <div className="mr-2 flex-1 text-right text-gray-800">
                          Subtotal
                        </div>
                        <div className="w-40">
                          <Controller
                            name="subtotal"
                            control={control}
                            rules={{ required: true }}
                            render={() => {
                              return (
                                <input
                                  className={`mb-1 w-full rounded border-2 border-gray-200 px-1 py-2 text-right leading-tight focus:border-blue-500 focus:outline-none ${
                                    errors.subtotal
                                      ? "border-red-400  focus:border-red-400 "
                                      : ""
                                  }`}
                                  type="number"
                                  step="0.01"
                                  placeholder="Subtotal"
                                  defaultValue={invoiceData.subtotal}
                                  {...register("subtotal", {
                                    valueAsNumber: true,
                                  })}
                                />
                              );
                            }}
                          />
                        </div>
                      </div>
                      <div className="mb-3 flex justify-between">
                        <div className="mr-2 flex-1 text-right text-gray-800">
                          Discount
                        </div>
                        <div className="w-40">
                          <Controller
                            name="discount"
                            control={control}
                            rules={{ required: true }}
                            render={() => {
                              return (
                                <input
                                  className={`mb-1 w-full rounded border-2 border-gray-200 px-1 py-2 text-right leading-tight focus:border-blue-500 focus:outline-none ${
                                    errors.discount
                                      ? "border-red-400  focus:border-red-400 "
                                      : ""
                                  }`}
                                  type="number"
                                  step="0.01"
                                  placeholder="Discount"
                                  defaultValue={invoiceData?.discount}
                                  {...register("discount", {
                                    valueAsNumber: true,
                                  })}
                                />
                              );
                            }}
                          />
                        </div>
                      </div>
                      <div className="mb-4 flex justify-between">
                        <div className="mr-2 flex-1 text-right text-gray-800">
                          Sale Tax
                        </div>
                        <div className="w-40">
                          <Controller
                            name="taxes"
                            control={control}
                            rules={{ required: true }}
                            render={() => {
                              return (
                                <input
                                  className={`mb-1 w-full rounded border-2 border-gray-200 px-1 py-2 text-right leading-tight focus:border-blue-500 focus:outline-none ${
                                    errors.taxes
                                      ? "border-red-400  focus:border-red-400 "
                                      : ""
                                  }`}
                                  type="number"
                                  step="0.01"
                                  placeholder="Tax Amount"
                                  defaultValue={invoiceData.taxes}
                                  {...register("taxes", {
                                    valueAsNumber: true,
                                  })}
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
                              name="grandTotal"
                              control={control}
                              rules={{ required: true }}
                              render={() => {
                                return (
                                  <input
                                    className={`mb-1 w-full rounded border-2 border-gray-200 px-1 py-2 text-right leading-tight focus:border-blue-500 focus:outline-none ${
                                      errors.grandTotal
                                        ? "border-red-400  focus:border-red-400 "
                                        : ""
                                    }`}
                                    type="number"
                                    step="0.01"
                                    placeholder="Total Amount"
                                    defaultValue={invoiceData.grandTotal}
                                    {...register("grandTotal", {
                                      valueAsNumber: true,
                                    })}
                                  />
                                );
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                    <button
                      className="focus:shadow-outline rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700 focus:outline-none disabled:bg-blue-50 disabled:text-blue-200"
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
