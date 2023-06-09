import type { TaskStatus } from "@prisma/client";
import * as Dialog from "@radix-ui/react-dialog";
import { Edit } from "@styled-icons/boxicons-solid/";
import { useState, type BaseSyntheticEvent } from "react";
import { Controller, useForm } from "react-hook-form";
import { useUpdateTask } from "../../hooks/task";
import { useGetUsersForProject } from "../../hooks/user";
import AssigneeDropdown from "./AssigneeDropdown";
import StatusDropdown from "./StatusDropDown";

export type assignee = {
  id: string;
  email: string | null;
  name: string | null;
  image: string | null;
};

export type task = {
  id: string;
  description: string;
  status: TaskStatus;
  createdBy: {
    name: string | null;
    email: string | null;
    image: string | null;
  };
  assignedTo: assignee | null;
};

type FormValues = {
  description: string;
  assignee: assignee | null;
  status: TaskStatus;
};

const EditButton = ({ projectId, task }: { projectId: string; task: task }) => {
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<FormValues>({
    values: {
      description: task.description,
      status: task.status,
      assignee: task.assignedTo,
    },
  });
  const { updateTask } = useUpdateTask({ projectId: projectId });
  const { usersForProject } = useGetUsersForProject({ projectId: projectId });

  const onSubmit = (
    data: FormValues,
    e: BaseSyntheticEvent<object, unknown, unknown> | undefined
  ) => {
    e?.preventDefault();
    setOpen(false);
    reset();
    updateTask({
      taskId: task.id,
      taskDescription: data.description,
      taskAssignedTo: data.assignee,
      taskStatus: data.status,
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
          aria-describedby={
            "Modify your task description, assigned user, and status"
          }
        >
          <Dialog.Title className="mt-3 text-left text-lg font-bold capitalize leading-6 text-gray-900 sm:mt-5">
            Edit task
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
                    const { value, onChange } = field;
                    return (
                      <AssigneeDropdown
                        assignees={usersForProject || []}
                        taskAssignee={value}
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
                  render={({ field }) => {
                    const { value, onChange } = field;
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
