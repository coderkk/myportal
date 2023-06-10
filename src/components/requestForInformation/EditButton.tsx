import type { RequestForInformationStatus } from "@prisma/client";
import * as Dialog from "@radix-ui/react-dialog";
import { useState, type BaseSyntheticEvent } from "react";
import { Controller, useForm } from "react-hook-form";
import { Edit } from "styled-icons/boxicons-solid";
import { useUpdateRequestForInformation } from "../../hooks/requestForInformation";
import StatusDropdown from "./StatusDropDown";

type FormValues = {
  topic: string;
  status: RequestForInformationStatus;
};
type requestForInformation = {
  id: string;
  topic: string;
  status: RequestForInformationStatus;
  createdBy: {
    name: string | null;
  };
};

const EditButton = ({
  projectId,
  requestForInformation,
}: {
  projectId: string;
  requestForInformation: requestForInformation;
}) => {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FormValues>({
    values: {
      topic: requestForInformation.topic,
      status: requestForInformation.status,
    },
  });
  const { updateRequestForInformation } = useUpdateRequestForInformation({
    projectId: projectId,
  });

  const onSubmit = (
    data: FormValues,
    e: BaseSyntheticEvent<object, unknown, unknown> | undefined
  ) => {
    e?.preventDefault();
    setOpen(false);
    updateRequestForInformation({
      requestForInformationId: requestForInformation.id,
      requestForInformationTopic: data.topic,
      requestForInformationStatus: data.status,
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
          aria-describedby="Edit existing request for information"
        >
          <Dialog.Title className="mt-3 text-left text-lg font-bold capitalize leading-6 text-gray-900 sm:mt-5">
            Edit RFI
          </Dialog.Title>
          <form onSubmit={(e) => void handleSubmit(onSubmit)(e)}>
            <fieldset className=" my-4 gap-3 sm:flex ">
              <div className="flex flex-1 flex-col">
                <input
                  className={`mb-3 h-10 w-full rounded-lg border border-gray-300 px-4 py-0 text-center focus:border-blue-300 focus:outline-none sm:mb-0 sm:text-left ${
                    errors.topic ? "border-red-400  focus:border-red-400 " : ""
                  }`}
                  id="topic"
                  placeholder="e.g. My new RFI topic"
                  {...register("topic", { required: true })}
                />
              </div>
              <div className="flex flex-col sm:w-1/3">
                <Controller
                  name="status"
                  control={control}
                  defaultValue="PENDING"
                  rules={{ required: true }}
                  render={({ field }) => {
                    const { value, onChange } = field;
                    return (
                      <StatusDropdown
                        requestForInformationStatus={value}
                        onRequestForInformationStatusChange={(value) =>
                          onChange(value)
                        }
                      />
                    );
                  }}
                />
              </div>
            </fieldset>
            {errors.topic && (
              <span className="flex justify-center text-xs italic text-red-400">
                Topic is required
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
                disabled={!!(errors.topic || errors.status)}
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
