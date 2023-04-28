import type { WeatherCondition } from "@prisma/client";
import {
  CheckIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from "@radix-ui/react-icons";
import * as Select from "@radix-ui/react-select";
import classnames from "classnames";
import React, { type ReactNode } from "react";
import { Rainy } from "styled-icons/ionicons-outline";

type SelectItemProps = {
  children: ReactNode;
  className?: string;
  value: string;
};

type DropdownProps = {
  weatherCondition: WeatherCondition | null | undefined;
  onWeatherChange: (value: WeatherCondition) => void;
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
        <Select.ItemIndicator className="absolute left-0 inline-flex  items-center justify-center">
          <CheckIcon />
        </Select.ItemIndicator>
      </Select.Item>
    );
  }
);

SelectItem.displayName = "SelectItem";

const Dropdown = ({ weatherCondition, onWeatherChange }: DropdownProps) => {
  return (
    <Select.Root
      defaultValue={weatherCondition || undefined}
      onValueChange={(value: WeatherCondition) => {
        onWeatherChange(value);
      }}
    >
      <Select.Trigger
        className="inline-flex h-9 items-center justify-center gap-1 rounded bg-white px-4 py-0  text-sm text-blue-600 shadow hover:bg-gray-100"
        aria-label="Weather"
      >
        <Select.Value
          placeholder={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="h-6 w-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z"
              />
            </svg>
          }
        />
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
              <Select.Label className="px-8 py-0 text-xs text-blue-400">
                Weather
              </Select.Label>
              <SelectItem value="SUNNY">
                <span title="sunny">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="h-6 w-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z"
                    />
                  </svg>
                </span>
              </SelectItem>
              <SelectItem value="RAINY">
                <span title="rainy">
                  <Rainy className="h-6 w-6" />
                </span>
              </SelectItem>
              <SelectItem value="CLOUDY">
                <span title="cloudy">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="h-6 w-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M2.25 15a4.5 4.5 0 004.5 4.5H18a3.75 3.75 0 001.332-7.257 3 3 0 00-3.758-3.848 5.25 5.25 0 00-10.233 2.33A4.502 4.502 0 002.25 15z"
                    />
                  </svg>
                </span>
              </SelectItem>
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

export default Dropdown;
