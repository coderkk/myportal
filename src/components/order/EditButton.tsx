import type { OrderArrivalOnSite } from "@prisma/client";
import * as Dialog from "@radix-ui/react-dialog";
import { Close } from "@styled-icons/ionicons-outline";
import { useState, type BaseSyntheticEvent } from "react";
import { Controller, useForm, type FieldValues } from "react-hook-form";
import { Edit } from "styled-icons/boxicons-solid";
import { useUpdateOrder } from "../../hooks/order";
import ArrivalOnSiteDropdown from "./ArrivalOnSiteDropDown";

type order = {
  id: string;
  orderNote: string;
  orderNumber: string;
  arrivalOnSite: OrderArrivalOnSite;
  createdBy: {
    name: string | null;
  };
  supplierEmailAddress: string;
};

const EditButton = ({
  projectId,
  order,
}: {
  projectId: string;
  order: order;
}) => {
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm({
    values: {
      note: order.orderNote,
      orderNumber: order.orderNumber,
      supplierEmailAddress: order.supplierEmailAddress,
      arrivalOnSite: order.arrivalOnSite,
    },
  });

  const { updateOrder } = useUpdateOrder({ projectId: projectId });

  const onSubmit = (
    data: FieldValues,
    e: BaseSyntheticEvent<object, unknown, unknown> | undefined
  ) => {
    e?.preventDefault();
    setOpen(false);
    reset();
    updateOrder({
      orderId: order.id,
      orderNumber: data.orderNumber as string,
      orderNote: data.note as string,
      orderArrivalOnSite: data.arrivalOnSite as OrderArrivalOnSite,
      orderSupplierEmailAddress: data.supplierEmailAddress as string,
    });
  };
  const [open, setOpen] = useState(false);
  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <Edit className="h-6 w-6  text-green-500" />
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 animate-fade-in bg-slate-300" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-content-show rounded-md bg-white p-6 shadow-md focus:outline-none">
          <Dialog.Title className="m-0 font-medium text-gray-800">
            Edit order
          </Dialog.Title>
          <Dialog.Description className="mx-0 mt-3 mb-5 text-sm text-gray-400">
            Click update when you are done.
          </Dialog.Description>
          <form onSubmit={(e) => void handleSubmit(onSubmit)(e)}>
            <fieldset className="mb-4 flex items-center gap-5">
              <label
                className="w-24 text-right text-sm text-blue-300"
                htmlFor="supplierEmailAddress"
              >
                Supplier email address
              </label>
              <div>
                <input
                  className={`inline-flex h-8  flex-1 items-center justify-center rounded-md py-0 px-3 text-sm text-blue-500 shadow-sm shadow-blue-200 focus:border-2
                focus:border-blue-300 focus:outline-none ${
                  errors.supplierEmailAddress
                    ? "border-2 border-red-400 focus:border-2 focus:border-red-400"
                    : ""
                }`}
                  id="supplierEmailAddress"
                  defaultValue="supplier@gmail.com"
                  {...register("supplierEmailAddress", {
                    required: true,
                    pattern: {
                      value: /\S+@\S+\.\S+/,
                      message: "Entered value does not match email format",
                    },
                  })}
                />
              </div>
              <label
                className="w-24 text-right text-sm text-blue-300"
                htmlFor="orderNumber"
              >
                Order number
              </label>
              <div>
                <input
                  className={`inline-flex h-8  flex-1 items-center justify-center rounded-md py-0 px-3 text-sm text-blue-500 shadow-sm shadow-blue-200 focus:border-2
                focus:border-blue-300 focus:outline-none ${
                  errors.orderNumber
                    ? "border-2 border-red-400 focus:border-2 focus:border-red-400"
                    : ""
                }`}
                  id="orderNumber"
                  defaultValue={Math.floor(
                    Math.random() * 1000000000
                  ).toString()}
                  {...register("orderNumber", { required: true })}
                />
              </div>
              <label
                className="w-24 text-right text-sm text-blue-300"
                htmlFor="note"
              >
                Note
              </label>
              <div>
                <input
                  className={`inline-flex h-8  flex-1 items-center justify-center rounded-md py-0 px-3 text-sm text-blue-500 shadow-sm shadow-blue-200 focus:border-2
                focus:border-blue-300 focus:outline-none ${
                  errors.note
                    ? "border-2 border-red-400 focus:border-2 focus:border-red-400"
                    : ""
                }`}
                  id="note"
                  defaultValue="Some notes for my new order"
                  {...register("note", { required: true })}
                />
              </div>

              <label
                className="w-24 text-right text-sm text-blue-300"
                htmlFor="arrivalOnSite"
              >
                Arrival on site
              </label>
              <Controller
                name="arrivalOnSite"
                control={control}
                defaultValue={"NO"}
                rules={{ required: true }}
                render={({ field }) => {
                  const { value, onChange } = field;
                  return (
                    <ArrivalOnSiteDropdown
                      orderArrivalOnSite={value}
                      onOrderArrivalOnSiteChange={(value) => onChange(value)}
                    />
                  );
                }}
              />
            </fieldset>
            {errors.supplierEmailAddress && (
              <span className="flex justify-center text-xs italic text-red-400">
                Email is required and must match email format
              </span>
            )}
            {errors.orderNumber && (
              <span className="flex justify-center text-xs italic text-red-400">
                Order number is required
              </span>
            )}
            {errors.note && (
              <span className="flex justify-center text-xs italic text-red-400">
                Note is required
              </span>
            )}
            {errors.arrivalOnSite && (
              <span className="flex justify-center text-xs italic text-red-400">
                Arrival on site is required
              </span>
            )}
            <div className="mt-6 flex justify-end">
              <button
                className="inline-flex h-9 items-center justify-center rounded-md bg-blue-100 py-0 px-4 text-sm font-medium text-blue-700 hover:bg-blue-200 disabled:bg-blue-50 disabled:text-blue-200"
                type="submit"
                disabled={
                  !!(
                    errors.supplierEmailAddress ||
                    errors.orderNumber ||
                    errors.note ||
                    errors.arrivalOnSite
                  )
                }
              >
                Update
              </button>
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
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default EditButton;
