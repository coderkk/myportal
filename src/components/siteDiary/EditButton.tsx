import * as Dialog from "@radix-ui/react-dialog";
import { ChevronLeftIcon, ChevronRightIcon } from "@radix-ui/react-icons";
import { Edit } from "@styled-icons/boxicons-solid/";
import { Close } from "@styled-icons/ionicons-outline";
import { useState, type BaseSyntheticEvent } from "react";
import ReactDatePicker from "react-datepicker";
import { Controller, useForm, type FieldValues } from "react-hook-form";
import { useUpdateSiteDiary } from "../../hooks/siteDiary";

type siteDiary = {
  id: string;
  name: string;
  date: Date;
  createdBy: { name: string | null };
};

const EditButton = ({
  siteDiary,
  projectId,
}: {
  siteDiary: siteDiary;
  projectId: string;
}) => {
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm({
    values: {
      name: siteDiary.name,
      date: siteDiary.date,
    },
  });
  const { updateSiteDiary } = useUpdateSiteDiary({ projectId: projectId });
  const onSubmit = (
    data: FieldValues,
    e: BaseSyntheticEvent<object, unknown, unknown> | undefined
  ) => {
    e?.preventDefault();
    setOpen(false);
    reset();
    updateSiteDiary({
      siteDiaryId: siteDiary.id,
      siteDiaryName: data.name as string,
      siteDiaryDate: data.date as Date,
      startDate: new Date(Date.parse("0001-01-01T18:00:00Z")),
      endDate: new Date(Date.parse("9999-12-31T18:00:00Z")),
    });
  };
  const [open, setOpen] = useState(false);
  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <span className="flex items-center">
          <Edit className="mr-2 h-6 w-6 text-green-500" />
          Edit
        </span>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 animate-fade-in bg-slate-300" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 animate-content-show rounded-md bg-white p-6 shadow-md focus:outline-none">
          <Dialog.Title className="m-0 font-medium text-gray-800">
            Edit site diary
          </Dialog.Title>
          <Dialog.Description className="mx-0 mb-5 mt-3 text-sm text-gray-400">
            Edit your site diary here. Click save when you are done.
          </Dialog.Description>
          <form onSubmit={(e) => void handleSubmit(onSubmit)(e)}>
            <fieldset className="mb-4 flex items-center gap-5">
              <label
                className="w-24 text-right text-sm text-blue-300"
                htmlFor="name"
              >
                Name
              </label>
              <div>
                <input
                  className={`inline-flex h-8  flex-1 items-center justify-center rounded-md px-3 py-0 text-sm text-blue-500 shadow-sm shadow-blue-200 focus:border-2
                focus:border-blue-300  focus:outline-none ${
                  errors.name
                    ? "border-2 border-red-400 focus:border-2 focus:border-red-400"
                    : ""
                }`}
                  id="name"
                  defaultValue={siteDiary.name}
                  {...register("name", { required: true })}
                />
              </div>
              <label
                className="w-24 text-right text-sm text-blue-300"
                htmlFor="date"
              >
                Date
              </label>
              <Controller
                name="date"
                control={control}
                render={({ field }) => {
                  const { name, value, onChange } = field;
                  return (
                    <ReactDatePicker
                      name={name}
                      selected={value}
                      className={`inline-flex h-8  flex-1 items-center justify-center rounded-md px-3 py-0 text-sm text-blue-500 shadow-sm shadow-blue-200 focus:border-2
                    focus:border-blue-300 focus:outline-none ${
                      errors.name
                        ? "border-2 border-red-400 focus:border-2 focus:border-red-400"
                        : ""
                    }`}
                      onChange={(date) => {
                        if (date) {
                          const d = new Date();
                          date.setHours(d.getHours());
                          date.setMinutes(d.getMinutes());
                          date.setSeconds(d.getSeconds());
                          date.setMilliseconds(d.getMilliseconds());
                          onChange(date);
                        }
                      }}
                      previousMonthButtonLabel=<ChevronLeftIcon />
                      nextMonthButtonLabel=<ChevronRightIcon />
                      popperClassName="react-datepicker-bottom"
                      dateFormat="dd/MM/yyyy"
                    />
                  );
                }}
              />
            </fieldset>
            {errors.name && (
              <span className="flex justify-center text-xs italic text-red-400">
                Name is required
              </span>
            )}
            <div className="mt-6 flex justify-end">
              <button
                className="inline-flex h-9 items-center justify-center rounded-md bg-blue-100 px-4 py-0 text-sm font-medium text-blue-700 hover:bg-blue-200 disabled:bg-blue-50 disabled:text-blue-200"
                type="submit"
                disabled={!!errors.name}
              >
                Submit
              </button>
            </div>
            <Dialog.Close asChild>
              <button
                className="absolute right-4 top-4 inline-flex h-6 w-6 items-center justify-center rounded-full hover:bg-blue-200 focus:border-2 focus:border-blue-500 focus:outline-none"
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
