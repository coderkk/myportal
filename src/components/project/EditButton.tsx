import { zodResolver } from "@hookform/resolvers/zod";
import * as Dialog from "@radix-ui/react-dialog";
import { Edit } from "@styled-icons/boxicons-solid/";
import { useState, type BaseSyntheticEvent } from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import { useUpdateProject } from "../../hooks/project";
import { updateProjectSchema } from "../../schema/project";

type FormValues = z.infer<typeof updateProjectSchema>;

export type project = {
  id: string;
  name: string;
  createdBy: { name: string | null; image: string | null };
  createdAt: string;
};

const EditButton = ({ project }: { project: project }) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(updateProjectSchema),
    values: {
      projectName: project.name,
    },
  });
  const { updateProject } = useUpdateProject();
  const onSubmit = (
    data: FormValues,
    e: BaseSyntheticEvent<object, unknown, unknown> | undefined
  ) => {
    e?.preventDefault();
    setOpen(false);
    reset();
    updateProject({
      projectId: project.id,
      projectName: data.projectName,
    });
  };
  const [open, setOpen] = useState(false);
  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <Edit className="h-6 w-6 cursor-pointer text-green-500" />
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-20 animate-fade-in bg-gray-500 bg-opacity-75 transition-opacity" />
        <Dialog.Content
          className="fixed left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2 transform rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6"
          aria-describedby="Edit the name of an existing project"
        >
          <Dialog.Title className="mt-3 text-left text-lg font-bold capitalize leading-6 text-gray-900 sm:mt-5">
            edit project
          </Dialog.Title>
          <form onSubmit={(e) => void handleSubmit(onSubmit)(e)}>
            <fieldset className="mb-4 flex items-center gap-5">
              <div className="sm:flex sm:flex-1 sm:flex-row sm:gap-2">
                <input
                  className={`mb-3 mt-5 h-10 w-full rounded-lg border border-gray-300 px-4 py-2 text-center focus:border-blue-300 focus:outline-none sm:col-start-1 sm:text-left ${
                    errors.projectName
                      ? "border-red-400  focus:border-red-400 "
                      : ""
                  }`}
                  id="name"
                  placeholder="Project name"
                  {...register("projectName", { required: true })}
                />
              </div>
            </fieldset>
            {errors.projectName && (
              <span className="flex justify-center text-xs italic text-red-400">
                {errors.projectName.message}
              </span>
            )}
            <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
              <button
                className="inline-flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:bg-blue-50 disabled:text-blue-200 sm:col-start-2"
                type="submit"
                disabled={!!errors.projectName}
              >
                Edit
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
