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
        <AlertDialog.Overlay className="fixed inset-0 animate-fade-in bg-slate-300" />
        <AlertDialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-content-show rounded-md bg-white p-6 shadow-md focus:outline-none">
          <AlertDialog.Title className="m-0 font-medium text-gray-800">
            Are you sure?
          </AlertDialog.Title>
          <AlertDialog.Description className="mx-0 mt-3 mb-5 text-sm text-gray-400">
            This will add the following users to this team.
            {usersToBeAdded.map((user) => (
              <li key={user.value}>{user.userName}</li>
            ))}
          </AlertDialog.Description>
          <div className="flex justify-end gap-6">
            <AlertDialog.Cancel asChild>
              <button
                type="button"
                className="inline-flex h-9 items-center justify-center rounded-md bg-gray-100 py-0 px-4 text-sm font-medium text-gray-700 hover:bg-gray-200"
              >
                Cancel
              </button>
            </AlertDialog.Cancel>
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
                className="inline-flex h-9 items-center justify-center rounded-md bg-green-100 py-0 px-4 text-sm font-medium text-green-700 hover:bg-green-200"
              >
                Yes, add user to team
              </button>
            </AlertDialog.Action>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
};

export default InviteButton;
