import type { TaskStatus } from "@prisma/client";
import { ChevronDownIcon, ChevronUpIcon } from "@radix-ui/react-icons";
import * as Select from "@radix-ui/react-select";
import dynamic from "next/dynamic";

type DropdownProps = {
  taskStatus: TaskStatus | null | undefined;
  onTaskStatusChange: (value: TaskStatus) => void;
};

const SelectItem = dynamic(() => import("../common/SelectItem"));

const StatusDropdown = ({ taskStatus, onTaskStatusChange }: DropdownProps) => {
  return (
    <Select.Root
      defaultValue={taskStatus || undefined}
      onValueChange={(value: TaskStatus) => {
        onTaskStatusChange(value);
      }}
    >
      <Select.Trigger
        className="inline-flex h-10 items-center justify-center gap-1 rounded-lg border border-gray-300 bg-white px-4 py-0 text-base hover:bg-gray-100 focus:border-blue-300 focus:outline-none"
        aria-label="Task Status"
      >
        <Select.Value placeholder="Select a task status" />
        <Select.Icon className="text-gray-600">
          <ChevronDownIcon />
        </Select.Icon>
      </Select.Trigger>
      <Select.Portal>
        <Select.Content className="z-30 overflow-hidden  rounded-md border border-blue-300 bg-white">
          <Select.ScrollUpButton className="flex h-6 items-center justify-center bg-white text-blue-600">
            <ChevronUpIcon />
          </Select.ScrollUpButton>
          <Select.Viewport className="p-2">
            <Select.Group>
              <Select.Label className="px-8 py-0 text-center text-base text-blue-600">
                Task Status
              </Select.Label>
            </Select.Group>
            <Select.Separator className=" h-px bg-gray-300" />
            <Select.Group>
              <SelectItem value="NOT_STARTED">Not Started</SelectItem>
              <SelectItem value="IN_PROGRESS">In progress</SelectItem>
              <SelectItem value="COMPLETED">Completed</SelectItem>
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

export default StatusDropdown;
