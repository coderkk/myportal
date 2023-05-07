import { ChevronDownIcon, ChevronUpIcon } from "@radix-ui/react-icons";
import * as Select from "@radix-ui/react-select";
import dynamic from "next/dynamic";

type DropdownProps = {
  value: string | null | undefined;
  onChange: (value: string) => void;
};

const SelectItem = dynamic(() => import("../../common/SelectItem"));

const StatusDropdown = ({ value, onChange }: DropdownProps) => {
  return (
    <Select.Root
      defaultValue={value || undefined}
      onValueChange={(value: string) => {
        onChange(value);
      }}
    >
      <Select.Trigger
        className="inline-flex h-10 items-center justify-center gap-1 rounded-lg border border-gray-300 bg-white px-4 py-0 text-base hover:bg-gray-100 focus:border-blue-300 focus:outline-none sm:justify-between"
        aria-label="Task Status"
      >
        <Select.Value placeholder="Select a task status" />
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
                Units
              </Select.Label>
            </Select.Group>
            <Select.Separator className=" h-px bg-gray-300" />
            <Select.Group>
              <SelectItem value="M">M</SelectItem>
              <SelectItem value="M2">M2</SelectItem>
              <SelectItem value="M3">M3</SelectItem>
              <SelectItem value="NR">NR</SelectItem>
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
