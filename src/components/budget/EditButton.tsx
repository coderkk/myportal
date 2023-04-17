import * as Dialog from "@radix-ui/react-dialog";
import { Close } from "@styled-icons/ionicons-outline";
import { useState, type BaseSyntheticEvent } from "react";
import { useForm } from "react-hook-form";
import { Edit } from "styled-icons/boxicons-solid";
import { useUpdateBudget } from "../../hooks/budget";

type FormValues = {
  description: string;
  expectedBudget: number;
  costsIncurred: number;
};

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
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    values: {
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
    reset();
    updateBudget({
      description: data.description,
      expectedBudget: data.expectedBudget,
      costsIncurred: data.costsIncurred,
      budgetId: budgetId,
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
            Edit budget
          </Dialog.Title>
          <Dialog.Description className="mx-0 mt-3 mb-5 text-sm text-gray-400">
            Click update when you are done.
          </Dialog.Description>
          <form onSubmit={(e) => void handleSubmit(onSubmit)(e)}>
            <fieldset className="mb-4 flex items-center gap-5">
              <label
                className="w-24 text-right text-sm text-blue-300"
                htmlFor="description"
              >
                Description
              </label>
              <div>
                <input
                  className={`inline-flex h-8  flex-1 items-center justify-center rounded-md py-0 px-3 text-sm text-blue-500 shadow-sm shadow-blue-200 focus:border-2
                focus:border-blue-300 focus:outline-none ${
                  errors.description
                    ? "border-2 border-red-400 focus:border-2 focus:border-red-400"
                    : ""
                }`}
                  id="description"
                  defaultValue="Labor"
                  {...register("description", {
                    required: true,
                  })}
                />
              </div>
              <label
                className="w-24 text-right text-sm text-blue-300"
                htmlFor="expectedBudget"
              >
                Budget
              </label>
              <div>
                <input
                  className={`inline-flex h-8  flex-1 items-center justify-center rounded-md py-0 px-3 text-sm text-blue-500 shadow-sm shadow-blue-200 focus:border-2
                focus:border-blue-300 focus:outline-none ${
                  errors.expectedBudget
                    ? "border-2 border-red-400 focus:border-2 focus:border-red-400"
                    : ""
                }`}
                  id="expectedBudget"
                  defaultValue={Math.floor(Math.random() * 100000).toString()}
                  {...register("expectedBudget", {
                    required: true,
                    valueAsNumber: true,
                  })}
                  type="number"
                />
              </div>
              <label
                className="w-24 text-right text-sm text-blue-300"
                htmlFor="costsIncurred"
              >
                Costs Incurred
              </label>
              <div>
                <input
                  className={`inline-flex h-8  flex-1 items-center justify-center rounded-md py-0 px-3 text-sm text-blue-500 shadow-sm shadow-blue-200 focus:border-2
                focus:border-blue-300 focus:outline-none ${
                  errors.costsIncurred
                    ? "border-2 border-red-400 focus:border-2 focus:border-red-400"
                    : ""
                }`}
                  id="costsIncurred"
                  defaultValue={Math.floor(Math.random() * 100000).toString()}
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
                Description is required
              </span>
            )}
            {errors.expectedBudget && (
              <span className="flex justify-center text-xs italic text-red-400">
                Budget is required and must be a number
              </span>
            )}
            {errors.costsIncurred && (
              <span className="flex justify-center text-xs italic text-red-400">
                Costs incurred is required and must be a number
              </span>
            )}
            <div className="mt-6 flex justify-end">
              <button
                className="inline-flex h-9 items-center justify-center rounded-md bg-blue-100 py-0 px-4 text-sm font-medium text-blue-700 hover:bg-blue-200 disabled:bg-blue-50 disabled:text-blue-200"
                type="submit"
                disabled={
                  !!(
                    errors.description ||
                    errors.expectedBudget ||
                    errors.costsIncurred
                  )
                }
              >
                Save
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
