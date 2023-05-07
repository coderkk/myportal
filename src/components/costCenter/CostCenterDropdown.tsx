import {
  CheckIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from "@radix-ui/react-icons";
import * as Select from "@radix-ui/react-select";
import classnames from "classnames";
import React, { type ReactNode } from "react";

type costCenter = {
  id: string;
  projectId: string;
  code: string;
  name: string;
  budget:number;
  cost: number;
}

type SelectItemProps = {
  children: ReactNode;
  className?: string;
  value: string;
};

type DropdownProps = {
  costCenters: costCenter[];
  defaultValue: string | null;
  onCostCenterChange: (value: string) => void;
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


const CostCenterDropdown = ({
  costCenters,
  defaultValue,
  onCostCenterChange,
}: DropdownProps) => {
  return (
    <Select.Root
      value={defaultValue || undefined}
      onValueChange={(value: string) => {
        onCostCenterChange(value);
      }}
    >
      <Select.Trigger
        className="inline-flex h-9 items-center justify-center gap-1 rounded bg-white py-0 px-4  text-sm text-blue-600 shadow hover:bg-gray-100"
        aria-label="Cost center select"
      >
        <Select.Value placeholder="Select a cost center" />
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
                Cost center
              </Select.Label>
              {costCenters?.map((costCenter) => {
                return (
                  costCenter.id &&
                  costCenter.code && (
                    <SelectItem key={costCenter.id} value={costCenter.id}>
                      {costCenter.name} ({costCenter.code})
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

export default CostCenterDropdown;
