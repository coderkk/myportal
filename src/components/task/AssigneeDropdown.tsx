import {
  CheckIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from "@radix-ui/react-icons";
import * as Select from "@radix-ui/react-select";
import classnames from "classnames";
import React, { type ReactNode } from "react";
import type { assignee } from "./CreateButton";

type SelectItemProps = {
  children: ReactNode;
  className?: string;
  value: string;
};

type DropdownProps = {
  assignees: assignee[];
  taskAssignee: assignee | null;
  onTaskAssigneeChange: (value: string) => void;
};

const SelectItem = React.forwardRef<HTMLDivElement, SelectItemProps>(
  ({ children, className, value, ...props }, forwardedRef) => {
    return (
      <Select.Item
        className={classnames(
          "relative flex h-6 items-center justify-center rounded px-7 py-0 text-base data-[highlighted]:bg-blue-600 data-[highlighted]:text-white data-[highlighted]:outline-none",
          className
        )}
        ref={forwardedRef}
        value={value}
        {...props}
      >
        <Select.ItemText>{children}</Select.ItemText>
        <Select.ItemIndicator className="absolute left-0 inline-flex w-6 items-center justify-center">
          <CheckIcon />
        </Select.ItemIndicator>
      </Select.Item>
    );
  }
);

SelectItem.displayName = "SelectItem";

const AssigneeDropdown = ({
  assignees,
  taskAssignee,
  onTaskAssigneeChange,
}: DropdownProps) => {
  return (
    <Select.Root
      defaultValue={taskAssignee?.id || undefined}
      onValueChange={(value: string) => {
        onTaskAssigneeChange(value);
      }}
    >
      <Select.Trigger
        className="inline-flex h-10 items-center justify-center gap-1 rounded-lg border border-gray-300 bg-white px-4 py-0 text-base hover:bg-gray-100 focus:border-blue-300 focus:outline-none"
        aria-label="Task Assignee"
      >
        <Select.Value placeholder="Select a task assignee" />
        <Select.Icon className="text-gray-600">
          <ChevronDownIcon />
        </Select.Icon>
      </Select.Trigger>
      <Select.Portal>
        <Select.Content className="overflow-hidden rounded-md border border-blue-300 bg-white">
          <Select.ScrollUpButton className="flex h-6 items-center justify-center bg-white text-blue-600">
            <ChevronUpIcon />
          </Select.ScrollUpButton>
          <Select.Viewport className="p-2">
            <Select.Group>
              <Select.Label className="px-8 py-0 text-center text-base text-blue-600">
                Task Assignee
              </Select.Label>
            </Select.Group>
            <Select.Separator className=" h-px bg-gray-300" />
            <Select.Group>
              {assignees?.map((assignee) => {
                return (
                  assignee.id &&
                  assignee.email && (
                    <SelectItem key={assignee.id} value={assignee.id}>
                      {assignee.email}
                    </SelectItem>
                  )
                );
              }) || []}
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
