import type { TaskStatus } from "@prisma/client";
import * as Dialog from "@radix-ui/react-dialog";
import { PlusSquareFill } from "@styled-icons/bootstrap";
import { Close } from "@styled-icons/ionicons-outline";
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
        <Dialog.Overlay className="fixed inset-0 animate-fade-in bg-slate-300" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-content-show rounded-md bg-white p-6 shadow-md focus:outline-none">
          <Dialog.Title className="m-0 font-medium text-gray-800">
            Create a new task
          </Dialog.Title>
          <Dialog.Description className="mx-0 mt-3 mb-5 text-sm text-gray-400">
            Give your task a description here. Click save when you are done.
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
                  defaultValue="My new task"
                  {...register("description", { required: true })}
                />
              </div>
              <label
                className="w-24 text-right text-sm text-blue-300"
                htmlFor="assignee"
              >
                Assigned to
              </label>
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

              <label
                className="w-24 text-right text-sm text-blue-300"
                htmlFor="status"
              >
                Status
              </label>
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
            <div className="mt-6 flex justify-end">
              <button
                className="inline-flex h-9 items-center justify-center rounded-md bg-blue-100 py-0 px-4 text-sm font-medium text-blue-700 hover:bg-blue-200 disabled:bg-blue-50 disabled:text-blue-200"
                type="submit"
                disabled={!!(errors.description || errors.status)}
              >
                Create
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

export default CreateButton;
