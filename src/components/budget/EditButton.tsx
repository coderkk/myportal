import { zodResolver } from "@hookform/resolvers/zod";
import * as Dialog from "@radix-ui/react-dialog";
import { useState, type BaseSyntheticEvent } from "react";
import { useForm } from "react-hook-form";
import { Edit } from "styled-icons/boxicons-solid";
import type { z } from "zod";
import { useUpdateBudget } from "../../hooks/budget";
import { updateBudgetSchema } from "../../schema/budget";

type FormValues = z.infer<typeof updateBudgetSchema>;

const EditButton = ({
  budgetId,
  projectId,
  description,
  expectedBudget,
  costsIncurred,
  pageIndex,
  pageSize,
  searchKey,
}: {
  budgetId: string;
  projectId: string;
  description: string;
  expectedBudget: number;
  costsIncurred: number;
  pageIndex: number;
  pageSize: number;
  searchKey: string;
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(updateBudgetSchema),
    defaultValues: {
      budgetId: budgetId,
      description: description,
      expectedBudget: expectedBudget,
      costsIncurred: costsIncurred,
    },
  });

  const { updateBudget } = useUpdateBudget({
    projectId,
    pageIndex,
    pageSize,
    searchKey,
  });

  const onSubmit = (
    data: FormValues,
    e: BaseSyntheticEvent<object, unknown, unknown> | undefined
  ) => {
    e?.preventDefault();
    setOpen(false);
    updateBudget({
      budgetId: budgetId,
      description: data.description,
      expectedBudget: data.expectedBudget,
      costsIncurred: data.costsIncurred,
    });
  };
  const [open, setOpen] = useState(false);
  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <Edit className="h-6 w-6  text-green-500" />
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-20 animate-fade-in bg-gray-500 bg-opacity-75 transition-opacity" />
        <Dialog.Content
          className="fixed left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2 transform rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6"
          aria-describedby="Edit existing budget"
        >
          <Dialog.Title className="mt-3 text-left text-lg font-bold capitalize leading-6 text-gray-900 sm:mt-5">
            edit budget
          </Dialog.Title>
          <form onSubmit={(e) => void handleSubmit(onSubmit)(e)}>
            <fieldset className="mb-4 gap-3 sm:mb-7 sm:flex ">
              <div className="flex flex-1 flex-grow flex-col">
                <label
                  className="mb-1 w-full text-left text-base capitalize text-gray-900 sm:flex sm:items-end"
                  htmlFor="description"
                >
                  Description
                </label>
                <input
                  className={`mb-3 h-10 w-full rounded-lg border border-gray-300 px-4 py-0 text-center focus:border-blue-300 focus:outline-none sm:mb-0 sm:text-left ${
                    errors.description
                      ? "border-red-400  focus:border-red-400 "
                      : ""
                  }`}
                  id="description"
                  placeholder="e.g. Labor"
                  {...register("description", {
                    required: true,
                  })}
                />
              </div>
              <div className="flex flex-grow-0 flex-col">
                <label
                  className="mb-1 w-full text-left text-base capitalize text-gray-900 sm:flex sm:w-32 sm:items-end"
                  htmlFor="expectedBudget"
                >
                  Budget
                </label>
                <input
                  className={`mb-3 h-10 w-full rounded-lg border border-gray-300 px-4 py-0 text-center focus:border-blue-300 focus:outline-none sm:mb-0 sm:w-32 sm:text-left ${
                    errors.expectedBudget
                      ? "border-red-400 focus:border-red-400"
                      : ""
                  }`}
                  id="expectedBudget"
                  {...register("expectedBudget", {
                    required: true,
                    valueAsNumber: true,
                  })}
                  type="number"
                />
              </div>

              <div className="flex flex-1 flex-grow-0 flex-col">
                <label
                  className="mb-1 w-full text-left text-base capitalize text-gray-900 sm:flex sm:w-32 sm:items-end"
                  htmlFor="costsIncurred"
                >
                  Costs Incurred
                </label>
                <input
                  className={`mb-3 h-10 w-full rounded-lg border border-gray-300 px-4 py-0 text-center focus:border-blue-300 focus:outline-none sm:mb-0 sm:w-32 sm:text-left ${
                    errors.costsIncurred
                      ? "border-red-400  focus:border-red-400 "
                      : ""
                  }`}
                  id="costsIncurred"
                  {...register("costsIncurred", {
                    required: true,
                    valueAsNumber: true,
                  })}
                  type="number"
                />
              </div>
            </fieldset>
            {errors.description && (
              <span className="flex justify-center text-xs italic text-red-400">
                {errors.description.message}
              </span>
            )}
            {errors.expectedBudget && (
              <span className="flex justify-center text-xs italic text-red-400">
                {errors.expectedBudget.message}
              </span>
            )}
            {errors.costsIncurred && (
              <span className="flex justify-center text-xs italic text-red-400">
                {errors.costsIncurred.message}
              </span>
            )}
            <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
              <button
                className="inline-flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:bg-blue-50 disabled:text-blue-200 sm:col-start-2"
                type="submit"
                disabled={
                  !!(
                    errors.description ||
                    errors.expectedBudget ||
                    errors.costsIncurred
                  )
                }
              >
                Update
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

export default EditButton;
