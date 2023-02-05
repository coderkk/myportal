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
          "relative flex h-6 items-center rounded py-0 pl-9 pr-6 text-sm text-blue-600 data-[highlighted]:bg-blue-400 data-[highlighted]:text-white data-[highlighted]:outline-none",
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
        className="inline-flex h-9 items-center justify-center gap-1 rounded bg-white py-0 px-4  text-sm text-blue-600 shadow hover:bg-gray-100"
        aria-label="Task Assignee"
      >
        <Select.Value placeholder="Select a task assignee" />
        <Select.Icon className="text-blue-500">
          <ChevronDownIcon />
        </Select.Icon>
      </Select.Trigger>
      <Select.Portal>
        <Select.Content className="overflow-hidden rounded-md bg-white shadow-md">
          <Select.ScrollUpButton className="flex h-6 items-center justify-center bg-white text-blue-600">
            <ChevronUpIcon />
          </Select.ScrollUpButton>
          <Select.Viewport className="p-2">
            <Select.Group>
              <Select.Label className="py-0 px-8 text-xs text-blue-400">
                Task Assignee
              </Select.Label>
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
