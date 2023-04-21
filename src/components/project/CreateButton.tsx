import * as Dialog from "@radix-ui/react-dialog";
import { PlusSquareFill } from "@styled-icons/bootstrap";
import { Close } from "@styled-icons/ionicons-outline";
import { useState, type BaseSyntheticEvent } from "react";
import { useForm, type FieldValues } from "react-hook-form";
import { useCreateProject } from "../../hooks/project";

const CreateButton = () => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();
  const { createProject } = useCreateProject();
  const onSubmit = (
    data: FieldValues,
    e: BaseSyntheticEvent<object, unknown, unknown> | undefined
  ) => {
    e?.preventDefault();
    setOpen(false);
    reset();
    createProject({
      projectName: data.name as string,
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
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transform rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
          <Dialog.Title className="mt-3 text-left text-lg font-bold capitalize leading-6 text-gray-900 sm:mt-5">
            new project
          </Dialog.Title>
          <form onSubmit={(e) => void handleSubmit(onSubmit)(e)}>
            <fieldset className="mb-4 flex items-center gap-5">
              <div className="sm:flex sm:flex-1 sm:flex-row sm:gap-2">
                <input
                  className={`mt-5 mb-3 h-10 w-full rounded-lg border border-gray-300 py-2 px-4 text-center focus:border-blue-300 focus:outline-none sm:col-start-1 sm:text-left ${
                    errors.name ? "border-red-400  focus:border-red-400 " : ""
                  }`}
                  id="name"
                  placeholder="Project name"
                  {...register("name", { required: true })}
                />
              </div>
            </fieldset>
            {errors.name && (
              <span className="flex justify-center text-xs italic text-red-400">
                Name is required
              </span>
            )}
            <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
              <button
                className="inline-flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:bg-blue-50 disabled:text-blue-200 sm:col-start-2"
                type="submit"
                disabled={!!errors.name}
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
