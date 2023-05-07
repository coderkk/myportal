import type { OrderArrivalOnSite } from "@prisma/client";
import * as Dialog from "@radix-ui/react-dialog";
import { PlusSquareFill } from "@styled-icons/bootstrap";
import { useState, type BaseSyntheticEvent } from "react";
import { Controller, useForm, type FieldValues } from "react-hook-form";
import { useCreateOrder } from "../../hooks/order";
import ArrivalOnSiteDropdown from "./ArrivalOnSiteDropDown";

const CreateButton = ({ projectId }: { projectId: string }) => {
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm();

  const { createOrder } = useCreateOrder();
  const onSubmit = (
    data: FieldValues,
    e: BaseSyntheticEvent<object, unknown, unknown> | undefined
  ) => {
    e?.preventDefault();
    setOpen(false);
    reset();
    createOrder({
      projectId: projectId,
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
        <PlusSquareFill className="h-6 w-6  text-blue-500" />
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 animate-fade-in bg-gray-500 bg-opacity-75 transition-opacity" />
        <Dialog.Content
          className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transform rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6"
          aria-describedby="Create a new order with supplier email address, order number, any notes, and if it should arrive on site."
        >
          <Dialog.Title className="mt-3 text-left text-lg font-bold capitalize leading-6 text-gray-900 sm:mt-5">
            new order
          </Dialog.Title>
          <form onSubmit={(e) => void handleSubmit(onSubmit)(e)}>
            <fieldset className="mb-4 mt-4 flex flex-col gap-3 sm:mb-7 ">
              <div className="flex flex-col">
                <label
                  className="mb-1 w-full text-left text-sm capitalize text-gray-900 sm:flex sm:items-end"
                  htmlFor="supplierEmailAddress"
                >
                  Supplier email address
                </label>
                <input
                  className={`h-10 w-full rounded-lg border border-gray-300 px-4 py-0 text-center focus:border-blue-300 focus:outline-none sm:mb-0 ${
                    errors.supplierEmailAddress
                      ? "border-red-400  focus:border-red-400 "
                      : ""
                  }`}
                  id="supplierEmailAddress"
                  placeholder="supplier@gmail.com"
                  {...register("supplierEmailAddress", {
                    required: true,
                    pattern: {
                      value: /\S+@\S+\.\S+/,
                      message: "Entered value does not match email format",
                    },
                  })}
                />
              </div>

              <div className="flex flex-col sm:flex-row sm:gap-3">
                <div className="flex flex-col sm:w-1/2">
                  <label
                    className="w-ful mb-1 text-left text-sm capitalize text-gray-900 sm:flex sm:items-end"
                    htmlFor="orderNumber"
                  >
                    Order number
                  </label>
                  <input
                    className={`mb-3 h-10 w-full rounded-lg border border-gray-300 px-4 py-0 text-center focus:border-blue-300 focus:outline-none sm:mb-0 ${
                      errors.orderNumber
                        ? "border-red-400  focus:border-red-400 "
                        : ""
                    }`}
                    id="orderNumber"
                    placeholder={Math.floor(
                      Math.random() * 1000000000
                    ).toString()}
                    {...register("orderNumber", { required: true })}
                  />
                </div>
                <div className="flex flex-col sm:w-1/2 ">
                  <label
                    className="w-ful mb-1 text-left text-sm capitalize text-gray-900 sm:flex sm:items-end"
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
                      const value = field.value as OrderArrivalOnSite;
                      const { onChange } = field;
                      return (
                        <ArrivalOnSiteDropdown
                          orderArrivalOnSite={value}
                          onOrderArrivalOnSiteChange={(value) =>
                            onChange(value)
                          }
                        />
                      );
                    }}
                  />
                </div>
              </div>
              <div className="flex flex-col">
                <label
                  className="w-ful mb-1 text-left text-sm capitalize text-gray-900 sm:flex sm:items-end"
                  htmlFor="note"
                >
                  Note
                </label>
                <input
                  className={`mb-3 h-10 w-full rounded-lg border border-gray-300 px-4 py-0 text-center focus:border-blue-300 focus:outline-none sm:mb-0 ${
                    errors.note ? "border-red-400  focus:border-red-400 " : ""
                  }`}
                  id="note"
                  placeholder="Some notes for my new order"
                  {...register("note", { required: true })}
                />
              </div>
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
            <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
              <button
                className="inline-flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:bg-blue-50 disabled:text-blue-200 sm:col-start-2"
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
                Create
              </button>
              <Dialog.Close asChild>
                <button
                  className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:col-start-1 sm:mt-0"
                  aria-label="Close"
                  type="button"
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

export default CreateButton;
