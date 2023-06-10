import { Switch } from "@headlessui/react";
import { ChevronLeftIcon, ChevronRightIcon } from "@radix-ui/react-icons";
import classNames from "classnames";
import { parse } from "date-fns";
import { nanoid } from "nanoid";
import { useRouter } from "next/router";
import type {
  BaseSyntheticEvent,
  Dispatch,
  MutableRefObject,
  SetStateAction,
} from "react";
import React from "react";
import ReactDatePicker from "react-datepicker";
import type { UseFormReturn } from "react-hook-form";
import { Controller } from "react-hook-form";
import toast from "react-hot-toast";
import { useGetBudgets } from "../../hooks/budget";
import type { SupplierInvoiceWithItems } from "../../pages/projects/[projectId]/invoice/add";
import SelectList from "../common/SelectList";
import Spinner from "../common/Spinner";
import type { SupplierInvoiceItem } from "./InvoiceItem";
import InvoiceItem from "./InvoiceItem";

const InvoiceEditableForm = ({
  onSubmit,
  fileId,
  handleDownloadFile,
  useFormReturn,
  supplierInvoiceItems,
  setSupplierInvoiceItems,
  onInvoiceItemUpdate,
  removeInvoiceItem,
  isLoading,
  fileInputRef,
}: {
  onSubmit: (
    data: SupplierInvoiceWithItems,
    e: BaseSyntheticEvent<object, unknown, unknown> | undefined
  ) => void;
  fileId?: string;
  handleDownloadFile?: () => Promise<void>;
  useFormReturn: UseFormReturn<SupplierInvoiceWithItems, unknown>;
  supplierInvoiceItems?: SupplierInvoiceItem[];
  setSupplierInvoiceItems: Dispatch<
    SetStateAction<SupplierInvoiceItem[] | undefined>
  >;
  onInvoiceItemUpdate: (
    invoiceItem: SupplierInvoiceItem,
    index: number
  ) => void;
  removeInvoiceItem: (index: number) => void;
  isLoading?: boolean;
  fileInputRef?: MutableRefObject<HTMLInputElement | null>;
}) => {
  const router = useRouter();
  const projectId = router.query.projectId as string;

  const {
    handleSubmit,
    control,
    register,
    formState: { errors },
  } = useFormReturn;

  const { budgets } = useGetBudgets({
    projectId: projectId,
    pageSize: undefined,
    pageIndex: 0,
    searchKey: "",
  });

  const onError = () => toast.error("Missing fields!");

  const budgetOptions = budgets.map((budget) => ({
    value: budget.id,
    label: `${budget.costCode} (${budget.description})`,
  }));

  if (isLoading) {
    return <Spinner />;
  }

  return (
    <div className="w-[80%] px-4 sm:px-6 lg:px-8">
      <div className="px-4 py-8 sm:px-6 sm:py-12 lg:px-8 lg:py-16">
        <div className="mx-auto text-left lg:mx-0 lg:text-left">
          <form
            className="m-8"
            onSubmit={(e) => void handleSubmit(onSubmit, onError)(e)}
          >
            {fileId && (
              <div className="text-right">
                <button
                  type="button"
                  className="inline-flex items-center rounded bg-gray-300 px-4 py-2 font-bold text-gray-800 hover:bg-gray-400"
                  onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                    e.preventDefault();
                    if (handleDownloadFile) void handleDownloadFile();
                  }}
                >
                  <svg
                    className="mr-2 h-4 w-4 fill-current"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                  >
                    <path d="M13 8V2H7v6H2l8 8 8-8h-5zM0 18h20v2H0v-2z" />
                  </svg>
                  Download Invoice
                </button>
              </div>
            )}
            <div className="mb-6 flex justify-between">
              <div className="flex items-center">
                <button
                  type="button"
                  onClick={() => {
                    void router.push("/projects/" + projectId + "/invoice");
                  }}
                  title="Back"
                  className="mr-2 block rounded-md bg-white px-3 py-2 text-center text-sm font-semibold text-black shadow-sm hover:bg-gray-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-300"
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
              {fileInputRef && (
                <button
                  type="button"
                  onClick={() => {
                    fileInputRef.current?.click();
                  }}
                  className="rounded-md bg-blue-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-800"
                >
                  Attach file
                </button>
              )}
            </div>

            <div className="mb-8 flex justify-between">
              <div className="w-2/4">
                <div className="mb-2 items-center md:mb-1 md:flex">
                  <label className="block w-32 text-sm font-bold uppercase tracking-wide text-gray-800">
                    Invoice No.
                  </label>
                  <div className="flex-1">
                    <input
                      className={classNames(
                        "mb-1 w-full rounded border-2 border-gray-200 px-1 py-2 leading-tight focus:border-blue-500 focus:outline-none",
                        errors.invoiceNo
                          ? "border-red-400  focus:border-red-400"
                          : ""
                      )}
                      type="text"
                      placeholder="Invoice No"
                      {...register("invoiceNo", {
                        required: true,
                      })}
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
                <div className="mb-4 items-center md:mb-4 md:flex">
                  <label className="block w-32 text-sm font-bold uppercase tracking-wide text-gray-800">
                    Cost code
                  </label>
                  <div className="flex-1">
                    <Controller
                      name="budgetId"
                      rules={{ required: true }}
                      control={control}
                      render={({ field }) => {
                        const { onChange, value } = field;
                        console.log(value);
                        const selected = budgetOptions?.find(
                          (budgetOption) => budgetOption.value == value
                        );
                        return (
                          <SelectList
                            selected={selected}
                            options={budgetOptions}
                            onChange={(option) =>
                              option ? onChange(option.value) : null
                            }
                            error={errors.budgetId ? true : false}
                          />
                        );
                      }}
                    />
                  </div>
                </div>
                <div className="mb-2 items-center md:mb-2 md:flex">
                  <label className="block w-32 text-sm font-bold uppercase tracking-wide text-gray-800">
                    Paid
                  </label>
                  <div className="flex-1">
                    <Controller
                      name="paid"
                      control={control}
                      render={({ field }) => {
                        const { onChange, value } = field;
                        console.log(value);
                        return (
                          <Switch
                            checked={value}
                            onChange={(option) => {
                              onChange(option);
                            }}
                            className={classNames(
                              value ? "bg-blue-600" : "bg-gray-200",
                              "relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
                            )}
                          >
                            <span className="sr-only">Paid</span>
                            <span
                              aria-hidden="true"
                              className={classNames(
                                value ? "translate-x-5" : "translate-x-0",
                                "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
                              )}
                            />
                          </Switch>
                        );
                      }}
                    />
                  </div>
                </div>
                <div className="mb-2 items-center md:mb-2 md:flex">
                  <label className="block w-32 text-sm font-bold uppercase tracking-wide text-gray-800">
                    Approved
                  </label>
                  <div className="flex-1">
                    <Controller
                      name="approved"
                      control={control}
                      render={({ field }) => {
                        const { onChange, value } = field;
                        return (
                          <Switch
                            checked={value || false}
                            onChange={(option) => onChange(option)}
                            className={classNames(
                              value ? "bg-blue-600" : "bg-gray-200",
                              "relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
                            )}
                          >
                            <span className="sr-only">Approved</span>
                            <span
                              aria-hidden="true"
                              className={classNames(
                                value ? "translate-x-5" : "translate-x-0",
                                "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
                              )}
                            />
                          </Switch>
                        );
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-8 flex flex-wrap justify-between">
              <div className="w-full md:w-1/3">
                <label className="mb-1 block text-sm font-bold uppercase tracking-wide text-gray-800">
                  Supplier information
                </label>
                <input
                  className={`mb-1 w-full rounded border-2 border-gray-200 px-1 py-2 leading-tight focus:border-blue-500 focus:outline-none ${
                    errors.supplierName
                      ? "border-red-400  focus:border-red-400 "
                      : ""
                  }`}
                  type="text"
                  placeholder="Supplier Name"
                  {...register("supplierName", {
                    required: true,
                  })}
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
              <div className="  w-56 px-1 text-center">
                <p className="leading-none">
                  <span className="block text-sm font-bold uppercase tracking-wide text-gray-800">
                    Actions
                  </span>
                </p>
              </div>
            </div>
            {supplierInvoiceItems ? (
              supplierInvoiceItems.map((supplierInvoiceItem, i) => {
                return (
                  <div key={i} className="mx-1 flex items-center border-b py-2">
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
                    <div className="flex w-56 justify-center  text-center">
                      <InvoiceItem
                        title="Edit"
                        index={i}
                        invoiceItem={supplierInvoiceItem}
                        onUpdate={(data) => {
                          onInvoiceItemUpdate(data, i);
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
              })
            ) : (
              <Spinner />
            )}
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
                  const newSupplierInvoiceItems = supplierInvoiceItems
                    ? [newInvoiceItem, ...supplierInvoiceItems]
                    : [newInvoiceItem];
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
                  <input
                    className={`mb-1 w-full rounded border-2 border-gray-200 px-1 py-2 text-right leading-tight focus:border-blue-500 focus:outline-none ${
                      errors.subtotal
                        ? "border-red-400  focus:border-red-400 "
                        : ""
                    }`}
                    type="number"
                    step="0.01"
                    placeholder="Subtotal"
                    {...register("subtotal", {
                      valueAsNumber: true,
                      required: true,
                    })}
                  />
                </div>
              </div>
              <div className="mb-3 flex justify-between">
                <div className="mr-2 flex-1 text-right text-gray-800">
                  Discount
                </div>
                <div className="w-40">
                  <input
                    className={`mb-1 w-full rounded border-2 border-gray-200 px-1 py-2 text-right leading-tight focus:border-blue-500 focus:outline-none ${
                      errors.discount
                        ? "border-red-400  focus:border-red-400 "
                        : ""
                    }`}
                    type="number"
                    step="0.01"
                    placeholder="Discount"
                    {...register("discount", {
                      valueAsNumber: true,
                      required: true,
                    })}
                  />
                </div>
              </div>
              <div className="mb-3 flex justify-between">
                <div className="mr-2 flex-1 text-right text-gray-800">
                  Taxes
                </div>
                <div className="w-40">
                  <input
                    className={`mb-1 w-full rounded border-2 border-gray-200 px-1 py-2 text-right leading-tight focus:border-blue-500 focus:outline-none ${
                      errors.taxes
                        ? "border-red-400  focus:border-red-400 "
                        : ""
                    }`}
                    type="number"
                    step="0.01"
                    placeholder="Taxes"
                    {...register("taxes", {
                      valueAsNumber: true,
                      required: true,
                    })}
                  />
                </div>
              </div>

              <div className="border-b border-t py-2">
                <div className="flex justify-between">
                  <div className="mr-2 flex-1 text-right text-xl text-gray-800">
                    Total
                  </div>
                  <div className="w-40">
                    <input
                      className={`mb-1 w-full rounded border-2 border-gray-200 px-1 py-2 text-right leading-tight focus:border-blue-500 focus:outline-none ${
                        errors.grandTotal
                          ? "border-red-400  focus:border-red-400 "
                          : ""
                      }`}
                      type="number"
                      step="0.01"
                      placeholder="Grand Amount"
                      {...register("grandTotal", {
                        valueAsNumber: true,
                        required: true,
                      })}
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
  );
};

export default InvoiceEditableForm;
