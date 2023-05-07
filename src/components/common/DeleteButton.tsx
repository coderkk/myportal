import * as AlertDialog from "@radix-ui/react-alert-dialog";
import { Delete } from "@styled-icons/fluentui-system-filled";
import classNames from "classnames";
import { useRouter } from "next/router";
import type { ReactNode } from "react";

const DeleteButton = ({
  onDelete,
  navigateBack = false,
  description,
  flex = true,
  hideButton = false,
}: {
  onDelete: () => void;
  navigateBack?: boolean;
  description?: string | ReactNode;
  flex?: boolean;
  hideButton?: boolean;
}) => {
  const router = useRouter();
  return (
    <AlertDialog.Root>
      <AlertDialog.Trigger asChild>
        <span className={classNames(flex ? "flex" : "", "items-center")}>
          {!hideButton && <Delete className="mr-2 h-6 w-6 text-red-500" />}
          {description}
        </span>
      </AlertDialog.Trigger>
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="fixed inset-0 animate-fade-in bg-gray-500 bg-opacity-75 transition-opacity" />
        <AlertDialog.Content
          className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transform rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6"
          aria-describedby="Are you certain that you want to delete this item?"
        >
          <AlertDialog.Title
            className="mb-5 mt-3  flex flex-col gap-3 text-center text-lg font-bold leading-6 text-gray-900 sm:mt-5 sm:flex-row sm:items-start sm:text-left"
            aria-describedby="This action cannot be undone."
          >
            <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10 ">
              <svg
                className="h-6 w-6 text-red-600"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                />
              </svg>
            </div>
            <div className="flex flex-col gap-1">
              <p className="capitalize">confirm delete</p>
              <p className="mx-0 text-sm font-medium text-gray-500">
                This action cannot be undone.
              </p>
            </div>
          </AlertDialog.Title>
          <div className="mt-5 flex flex-col-reverse sm:flex-row sm:gap-3">
            <AlertDialog.Cancel asChild>
              <button
                className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:col-start-1 sm:mt-0"
                aria-label="Close"
                type="button"
              >
                Cancel
              </button>
            </AlertDialog.Cancel>
            <AlertDialog.Action asChild>
              <button
                type="button"
                onClick={() => {
                  onDelete();
                  if (navigateBack) {
                    router.back();
                  }
                }}
                className="inline-flex w-full justify-center rounded-md  bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm  hover:bg-red-500  sm:col-start-2"
              >
                Delete
              </button>
            </AlertDialog.Action>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
};

export default DeleteButton;
