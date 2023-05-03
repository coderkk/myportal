import * as AlertDialog from "@radix-ui/react-alert-dialog";
import type { Dispatch, SetStateAction } from "react";
import { useAddToProject } from "../../hooks/project";
import type { userOption } from "./SearchAndAdd";

const InviteButton = ({
  projectId,
  usersToBeAdded,
  setSelectedOptions,
}: {
  projectId: string;
  usersToBeAdded: userOption[];
  setSelectedOptions: Dispatch<SetStateAction<userOption[]>>;
}) => {
  const { addToProject } = useAddToProject();
  return (
    <AlertDialog.Root>
      <AlertDialog.Trigger asChild>
        <button
          type="button"
          className="ml-2 flex items-center rounded-lg bg-blue-500 p-2 text-white disabled:bg-blue-200"
          disabled={usersToBeAdded.length === 0}
        >
          Add
        </button>
      </AlertDialog.Trigger>
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="fixed inset-0 animate-fade-in bg-gray-500 bg-opacity-75 transition-opacity" />
        <AlertDialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transform rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
          <AlertDialog.Title className="mt-3 text-left text-lg font-bold leading-6 text-gray-900 sm:mt-5">
            Add User{usersToBeAdded.length > 1 ? "s" : ""}
          </AlertDialog.Title>
          <AlertDialog.Description className="mx-0 mb-5 mt-3 flex flex-col gap-2 text-sm text-gray-900 sm:gap-1">
            {usersToBeAdded.map((user) => (
              <li key={user.value}>
                {user.userName} ({user.userEmail})
              </li>
            ))}
          </AlertDialog.Description>
          <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
            <AlertDialog.Action asChild>
              <button
                type="button"
                onClick={() => {
                  for (const user of usersToBeAdded) {
                    addToProject({
                      projectId: projectId,
                      userId: user.value,
                      userName: user.userName,
                      userEmail: user.userEmail,
                    });
                  }
                  setSelectedOptions([]);
                }}
                className="inline-flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:bg-blue-50 disabled:text-blue-200 sm:col-start-2"
              >
                Add
              </button>
            </AlertDialog.Action>
            <AlertDialog.Cancel asChild>
              <button
                type="button"
                className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:col-start-1 sm:mt-0"
                aria-label="Close"
              >
                Cancel
              </button>
            </AlertDialog.Cancel>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
};

export default InviteButton;
