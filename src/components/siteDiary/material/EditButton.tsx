import type { MaterialUnit } from "@prisma/client";
import * as Dialog from "@radix-ui/react-dialog";
import { Edit } from "@styled-icons/boxicons-solid/";
import { Close } from "@styled-icons/ionicons-outline";
import { useState, type BaseSyntheticEvent } from "react";
import { useForm, type FieldValues } from "react-hook-form";
import { useUpdateMaterial } from "../../../hooks/material";
import type { MaterialProps } from "./MaterialView";

const EditButton = ({
  material,
  siteDiaryId,
}: {
  material: MaterialProps;
  siteDiaryId: string;
}) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    values: {
      units: material.units,
      amount: material.amount,
    },
  });
  const { updateMaterial } = useUpdateMaterial({ siteDiaryId: siteDiaryId });
  const onSubmit = (
    data: FieldValues,
    e: BaseSyntheticEvent<object, unknown, unknown> | undefined
  ) => {
    e?.preventDefault();
    setOpen(false);
    reset();
    updateMaterial({
      materialId: material.id,
      materialUnits: data.units as MaterialUnit,
      materialAmount: data.amount as number,
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
            Edit material
          </Dialog.Title>
          <Dialog.Description className="mx-0 mt-3 mb-5 text-sm text-gray-400">
            Edit your material here. Click save when you are done.
          </Dialog.Description>
          <form onSubmit={(e) => void handleSubmit(onSubmit)(e)}>
            <fieldset className="mb-4 flex items-center gap-5">
              <label
                className="w-24 text-right text-sm text-blue-300"
                htmlFor="units"
              >
                Units
              </label>
              <div>
                <input
                  className={`inline-flex h-8  flex-1 items-center justify-center rounded-md py-0 px-3 text-sm text-blue-500 shadow-sm shadow-blue-200 focus:border-2
                focus:border-blue-300  focus:outline-none ${
                  errors.units
                    ? "border-2 border-red-400 focus:border-2 focus:border-red-400"
                    : ""
                }`}
                  id="units"
                  defaultValue="My new site diary"
                  {...register("units", { required: true })}
                />
              </div>

              <label
                className="w-24 text-right text-sm text-blue-300"
                htmlFor="amount"
              >
                Amount
              </label>
              <div>
                <input
                  className={`inline-flex h-8  flex-1 items-center justify-center rounded-md py-0 px-3 text-sm text-blue-500 shadow-sm shadow-blue-200 focus:border-2
                focus:border-blue-300  focus:outline-none ${
                  errors.amount
                    ? "border-2 border-red-400 focus:border-2 focus:border-red-400"
                    : ""
                }`}
                  id="amount"
                  defaultValue={1}
                  type="number"
                  {...register("amount", {
                    required: true,
                    valueAsNumber: true,
                  })}
                />
              </div>
            </fieldset>
            {errors.units && (
              <span className="flex justify-center text-xs italic text-red-400">
                Units is required
              </span>
            )}
            {errors.amount && (
              <span className="flex justify-center text-xs italic text-red-400">
                Amount is required
              </span>
            )}
            <div className="mt-6 flex justify-end">
              <button
                className="inline-flex h-9 items-center justify-center rounded-md bg-blue-100 py-0 px-4 text-sm font-medium text-blue-700 hover:bg-blue-200 disabled:bg-blue-50 disabled:text-blue-200"
                type="submit"
                disabled={!!(errors.units || errors.amount)}
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
