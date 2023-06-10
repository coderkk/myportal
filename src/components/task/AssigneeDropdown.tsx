import { ChevronDownIcon, ChevronUpIcon } from "@radix-ui/react-icons";
import * as Select from "@radix-ui/react-select";
import dynamic from "next/dynamic";
import type { assignee } from "./EditButton";

type DropdownProps = {
  assignees: assignee[];
  taskAssignee: assignee | null;
  onTaskAssigneeChange: (value: assignee | undefined) => void;
};

const SelectItem = dynamic(() => import("../common/SelectItem"));

const AssigneeDropdown = ({
  assignees,
  taskAssignee,
  onTaskAssigneeChange,
}: DropdownProps) => {
  // assignee might've quit the team, so we need to check if they're still in the team and display accordingly
  const assigneeInTeam = assignees
    ?.map((assignee) => assignee.id)
    .find((id) => id === taskAssignee?.id);
  // console.log(assigneeInTeam);
  const placeholder = !taskAssignee
    ? "Select a task assignee"
    : assigneeInTeam
    ? ""
    : taskAssignee?.email;
  return (
    <Select.Root
      defaultValue={assigneeInTeam ? taskAssignee?.id : undefined}
      onValueChange={(value: string) => {
        onTaskAssigneeChange(
          assignees.find((assignee) => assignee.id === value)
        );
      }}
    >
      <Select.Trigger
        className="inline-flex h-10 items-center justify-center gap-1 rounded-lg border border-gray-300 bg-white px-4 py-0 text-base hover:bg-gray-100 focus:border-blue-300 focus:outline-none"
        aria-label="Task Assignee"
      >
        <Select.Value placeholder={placeholder} />
        <Select.Icon className="text-gray-600">
          <ChevronDownIcon />
        </Select.Icon>
      </Select.Trigger>
      <Select.Portal>
        <Select.Content className="z-30 rounded-md border border-blue-300 bg-white">
          <Select.ScrollUpButton className="flex h-6 items-center justify-center bg-white text-blue-600">
            <ChevronUpIcon />
          </Select.ScrollUpButton>
          <Select.Viewport className=" p-2">
            <Select.Group>
              <Select.Label className="px-8 py-0 text-center text-base text-blue-600">
                Task Assignee
              </Select.Label>
            </Select.Group>
            <Select.Separator className="h-px bg-gray-300" />
            <Select.Group>
              {assignees?.map((assignee) => {
                console.log(assignee);
                return (
                  assignee.id &&
                  assignee.email && (
                    <SelectItem key={assignee.id} value={assignee.id}>
                      {assignee.email}
                    </SelectItem>
                  )
                );
              })}
            </Select.Group>
          </Select.Viewport>
          <Select.ScrollDownButton className="flex h-6 items-center justify-center bg-white text-blue-600">
            <ChevronDownIcon />
          </Select.ScrollDownButton>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
};

export default AssigneeDropdown;
