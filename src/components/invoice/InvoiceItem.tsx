import type { SupplierInvoiceItem as PrismaSupplierInvoiceItem } from "@prisma/client";
import * as Dialog from "@radix-ui/react-dialog";
import { useState, type BaseSyntheticEvent } from "react";
import { useForm } from "react-hook-form";

export type SupplierInvoiceItem = Omit<
  PrismaSupplierInvoiceItem,
  "createdBy" | "supplierInvoiceId" | "createdById" | "createdAt" | "updatedAt"
>;

type InvoiceItemProps = {
  title?: string;
  index?: number;
  invoiceItem: SupplierInvoiceItem;
  addNew?: (data: SupplierInvoiceItem) => void;
  onUpdate?: (data: SupplierInvoiceItem, index: number) => void;
};

const InvoiceItem = ({
  title,
  index,
  invoiceItem,
  addNew,
  onUpdate,
}: InvoiceItemProps) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SupplierInvoiceItem>({
    values: {
      id: invoiceItem.id,
      description: invoiceItem.description,
      quantity: invoiceItem.quantity,
      unit: invoiceItem.unit,
      unitPrice: invoiceItem.unitPrice,
      totalPrice: invoiceItem.totalPrice,
    },
  });

  const onSubmit = (
    data: SupplierInvoiceItem,
    e: BaseSyntheticEvent<object, unknown, unknown> | undefined
  ) => {
    e?.preventDefault();
    setOpen(false);
    reset();
    if (addNew) {
      addNew({
        id: invoiceItem.id,
        description: data.description,
        quantity: data.quantity,
        unit: data.unit,
        unitPrice: data.unitPrice,
        totalPrice: data.totalPrice,
      });
    } else if (onUpdate && index != undefined && index >= 0) {
      onUpdate(
        {
          id: invoiceItem.id,
          description: data.description,
          quantity: data.quantity,
          unit: data.unit,
          unitPrice: data.unitPrice,
          totalPrice: data.totalPrice,
        },
        index
      );
    }
  };
  const [open, setOpen] = useState(false);
  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button
          type="button"
          className="focus:shadow-outline rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700 focus:outline-none"
        >
          {title ? title : "Add Invoice Item"}
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 animate-fade-in bg-gray-500 bg-opacity-75 transition-opacity" />
        <Dialog.Content
          className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transform rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6"
          aria-describedby="Create a task and assign it to a user."
        >
          <Dialog.Title className="mt-3 text-left text-lg font-bold capitalize leading-6 text-gray-900 sm:mt-5">
            Invoice item
          </Dialog.Title>
          <form>
            <fieldset className="mb-4 mt-4 gap-3 sm:mb-7 sm:flex ">
              <div className="flex flex-1 flex-col gap-3">
                <div className="relative mb-2 flex flex-col justify-between gap-5">
                  <input
                    autoFocus={true}
                    autoComplete="off"
                    type="text"
                    className={`peer h-full w-full rounded-[6px] border border-slate-300 border-t-transparent bg-transparent px-3 py-2.5
                    font-sans text-sm font-normal text-slate-700 placeholder-slate-300 placeholder-opacity-0 outline outline-0
                    transition-all placeholder-shown:border placeholder-shown:border-slate-300 placeholder-shown:border-t-slate-300 focus:border-2
                    focus:border-blue-500 focus:border-t-transparent focus:outline-0 ${
                      errors.description
                        ? "border-red-500  focus:border-red-500 "
                        : ""
                    }`}
                    id="description"
                    placeholder="Description"
                    {...register("description", { required: true })}
                  />
                  <label
                    className={`before:content[' '] after:content[' '] pointer-events-none absolute -top-1.5 left-0 flex h-full w-full select-none text-[11px] font-normal
                    leading-tight text-slate-600 transition-all before:pointer-events-none before:mr-1 before:mt-[6.5px] before:box-border before:block
                    before:h-1.5 before:w-2.5 before:rounded-tl-md before:border-l before:border-t before:border-slate-300 before:transition-all after:pointer-events-none
                    after:ml-1 after:mt-[6.5px] after:box-border after:block after:h-1.5 after:w-2.5 after:flex-grow after:rounded-tr-md after:border-r after:border-t
                    after:border-slate-300 after:transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:leading-[3.75] peer-placeholder-shown:text-slate-600
                    peer-placeholder-shown:before:border-transparent peer-placeholder-shown:after:border-transparent peer-focus:text-[11px] peer-focus:font-medium
                    peer-focus:leading-tight peer-focus:text-blue-500 peer-focus:before:border-l-2 peer-focus:before:border-t-2 peer-focus:before:border-blue-500
                    peer-focus:after:border-r-2 peer-focus:after:border-t-2 peer-focus:after:border-blue-500 ${
                      errors.description
                        ? "border-red-500  focus:border-red-500 peer-focus:text-red-500 peer-focus:before:border-red-500 peer-focus:after:border-red-500"
                        : ""
                    }`}
                  >
                    {"Description"}
                  </label>
                </div>
                <input
                  className={`mb-3 h-10 w-full rounded-lg border border-gray-300 px-4 py-0 text-center focus:border-blue-300 focus:outline-none sm:mb-0 ${
                    errors.quantity
                      ? "border-red-400  focus:border-red-400 "
                      : ""
                  }`}
                  type="number"
                  step="0.01"
                  id="quantity"
                  placeholder="Quantity"
                  {...register("quantity", {
                    required: true,
                    valueAsNumber: true,
                  })}
                />
                <input
                  className={`mb-3 h-10 w-full rounded-lg border border-gray-300 px-4 py-0 text-center focus:border-blue-300 focus:outline-none sm:mb-0 ${
                    errors.unit ? "border-red-400  focus:border-red-400 " : ""
                  }`}
                  id="unit"
                  placeholder="Unit"
                  {...register("unit", { required: true })}
                />
                <input
                  type="number"
                  className={`mb-3 h-10 w-full rounded-lg border border-gray-300 px-4 py-0 text-center focus:border-blue-300 focus:outline-none sm:mb-0 ${
                    errors.unitPrice
                      ? "border-red-400  focus:border-red-400 "
                      : ""
                  }`}
                  id="unitPrice"
                  step="0.01"
                  placeholder="Unit price"
                  {...register("unitPrice", {
                    required: true,
                    valueAsNumber: true,
                  })}
                />
                <input
                  type="number"
                  className={`mb-3 h-10 w-full rounded-lg border border-gray-300 px-4 py-0 text-center focus:border-blue-300 focus:outline-none sm:mb-0 ${
                    errors.totalPrice
                      ? "border-red-400  focus:border-red-400 "
                      : ""
                  }`}
                  id="totalPrice"
                  step="0.01"
                  placeholder="Total price"
                  {...register("totalPrice", {
                    required: true,
                    valueAsNumber: true,
                  })}
                />
              </div>
            </fieldset>
            {errors.description && (
              <span className="flex justify-center text-xs italic text-red-400">
                Description is required
              </span>
            )}
            {errors.quantity && (
              <span className="flex justify-center text-xs italic text-red-400">
                Quantity is required
              </span>
            )}
            {errors.unit && (
              <span className="flex justify-center text-xs italic text-red-400">
                Unit is required
              </span>
            )}
            {errors.unitPrice && (
              <span className="flex justify-center text-xs italic text-red-400">
                Unit price is required
              </span>
            )}
            {errors.totalPrice && (
              <span className="flex justify-center text-xs italic text-red-400">
                Total Price is required
              </span>
            )}
            <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
              <button
                className="inline-flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:bg-blue-50 disabled:text-blue-200 sm:col-start-2"
                type="button"
                disabled={
                  !!(
                    errors.description ||
                    errors.quantity ||
                    errors.unit ||
                    errors.unitPrice ||
                    errors.totalPrice
                  )
                }
                onClick={(e) => {
                  void handleSubmit(onSubmit)(e);
                }}
              >
                Save
              </button>
              <Dialog.Close asChild>
                <button
                  className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:col-start-1 sm:mt-0"
                  aria-label="Close"
                  type="button"
                  onClick={() => reset()}
                >
                  Cancel
                </button>
              </Dialog.Close>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default InvoiceItem;
