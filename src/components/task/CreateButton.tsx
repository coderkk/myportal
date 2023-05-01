import type { TaskStatus } from "@prisma/client";
import * as Dialog from "@radix-ui/react-dialog";
import { PlusSquareFill } from "@styled-icons/bootstrap";
import { useState, type BaseSyntheticEvent } from "react";
import type { ControllerRenderProps } from "react-hook-form";
import { Controller, useForm, type FieldValues } from "react-hook-form";
import { useCreateTask } from "../../hooks/task";
import { useGetUsersForProject } from "../../hooks/user";
import AssigneeDropdown from "./AssigneeDropdown";
import StatusDropdown from "./StatusDropDown";

export type assignee = {
  id: string;
  email: string | null;
};

const CreateButton = ({ projectId }: { projectId: string }) => {
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm();
  const { createTask } = useCreateTask();
  const { usersForProject } = useGetUsersForProject({ projectId: projectId });

  const onSubmit = (
    data: FieldValues,
    e: BaseSyntheticEvent<object, unknown, unknown> | undefined
  ) => {
    const assignee = usersForProject?.find(
      (userForProject) => userForProject.id === data.assignee
    ) as assignee;
    e?.preventDefault();
    setOpen(false);
    reset();
    createTask({
      projectId: projectId,
      taskDescription: data.description as string,
      taskAssignedTo: assignee ? assignee : null,
      taskStatus: data.status as TaskStatus,
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
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transform rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
          <Dialog.Title className="mt-3 text-left text-lg font-bold capitalize leading-6 text-gray-900 sm:mt-5">
            new task
          </Dialog.Title>
          <form onSubmit={(e) => void handleSubmit(onSubmit)(e)}>
            <fieldset className="mb-4 mt-4 gap-3 sm:mb-7 sm:flex ">
              <div className="flex flex-1 flex-col gap-3">
                <input
                  className={`mb-3 h-10 w-full rounded-lg border border-gray-300 px-4 py-0 text-center focus:border-blue-300 focus:outline-none sm:mb-0 ${
                    errors.description
                      ? "border-red-400  focus:border-red-400 "
                      : ""
                  }`}
                  id="description"
                  placeholder="e.g. Buy more materials"
                  {...register("description", { required: true })}
                />
                <Controller
                  name="assignee"
                  control={control}
                  render={({ field }) => {
                    const { onChange } = field;
                    return (
                      <AssigneeDropdown
                        assignees={usersForProject || []}
                        taskAssignee={null}
                        onTaskAssigneeChange={(value) => onChange(value)}
                      />
                    );
                  }}
                />

                <Controller
                  name="status"
                  control={control}
                  defaultValue={"NOT_STARTED"}
                  rules={{ required: true }}
                  render={({
                    field,
                  }: {
                    field: ControllerRenderProps<FieldValues, "status">;
                  }) => {
                    const value = field.value as TaskStatus;
                    const { onChange } = field;
                    return (
                      <StatusDropdown
                        taskStatus={value}
                        onTaskStatusChange={(value) => onChange(value)}
                      />
                    );
                  }}
                />
              </div>
            </fieldset>
            {errors.description && (
              <span className="flex justify-center text-xs italic text-red-400">
                Description is required
              </span>
            )}
            {errors.status && (
              <span className="flex justify-center text-xs italic text-red-400">
                Status is required
              </span>
            )}
            <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
              <button
                className="inline-flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:bg-blue-50 disabled:text-blue-200 sm:col-start-2"
                type="submit"
                disabled={!!(errors.description || errors.status)}
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
