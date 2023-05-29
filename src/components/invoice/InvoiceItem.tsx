import * as Dialog from "@radix-ui/react-dialog";
import { useState, type BaseSyntheticEvent } from "react";
import { useForm } from "react-hook-form";

type FormValues = {
  id: string;
  description: string;
  quantity: number;
  uom: string;
  unitPrice: number;
  discount: number;
  amount: number;
};

type InvoiceItemProps = {
  title?: string;
  index?: number;
  invoiceItem: FormValues;
  addNew?: (data: FormValues) => void;
  onUpdate?: (data: FormValues, index: number) => void;
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
  } = useForm<FormValues>({
    values: {
      id: invoiceItem.id,
      description: invoiceItem.description,
      quantity: invoiceItem.quantity,
      uom: invoiceItem.uom,
      unitPrice: invoiceItem.unitPrice,
      amount: invoiceItem.amount,
      discount: invoiceItem.discount,
    },
  });

  const onSubmit = (
    data: FormValues,
    e: BaseSyntheticEvent<object, unknown, unknown> | undefined
  ) => {
    e?.preventDefault();
    setOpen(false);
    reset();
    console.log(index);
    if (addNew) {
      addNew({
        id: invoiceItem.id,
        description: data.description,
        quantity: data.quantity,
        uom: data.uom,
        unitPrice: data.unitPrice,
        amount: data.amount,
        discount: data.discount,
      });
    } else if (onUpdate && index != undefined && index >= 0) {
      onUpdate(
        {
          id: invoiceItem.id,
          description: data.description,
          quantity: data.quantity,
          uom: data.uom,
          unitPrice: data.unitPrice,
          amount: data.amount,
          discount: data.discount,
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
                <input
                  className={`mb-3 h-10 w-full rounded-lg border border-gray-300 px-4 py-0 text-center focus:border-blue-300 focus:outline-none sm:mb-0 ${
                    errors.description
                      ? "border-red-400  focus:border-red-400 "
                      : ""
                  }`}
                  id="description"
                  placeholder="Description"
                  {...register("description", { required: true })}
                />
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
                    errors.uom ? "border-red-400  focus:border-red-400 " : ""
                  }`}
                  id="uom"
                  placeholder="UOM"
                  {...register("uom", { required: true })}
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
                    errors.amount ? "border-red-400  focus:border-red-400 " : ""
                  }`}
                  id="amount"
                  step="0.01"
                  placeholder="Amount"
                  {...register("amount", {
                    required: true,
                    valueAsNumber: true,
                  })}
                />
                <input
                  type="number"
                  className={`mb-3 h-10 w-full rounded-lg border border-gray-300 px-4 py-0 text-center focus:border-blue-300 focus:outline-none sm:mb-0 ${
                    errors.discount
                      ? "border-red-400  focus:border-red-400 "
                      : ""
                  }`}
                  id="discount"
                  step="0.01"
                  placeholder="Discount"
                  {...register("discount", {
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
            {errors.uom && (
              <span className="flex justify-center text-xs italic text-red-400">
                UOM is required
              </span>
            )}
            {errors.unitPrice && (
              <span className="flex justify-center text-xs italic text-red-400">
                Unit price is required
              </span>
            )}
            {errors.amount && (
              <span className="flex justify-center text-xs italic text-red-400">
                Amount is required
              </span>
            )}
            {errors.discount && (
              <span className="flex justify-center text-xs italic text-red-400">
                Discount is required
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
                    errors.unitPrice ||
                    errors.amount ||
                    errors.discount ||
                    errors.uom
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
