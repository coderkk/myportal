import { Disclosure, Popover, Transition } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import type { TaskStatus } from "@prisma/client";
import classNames from "classnames";
import { useAtom } from "jotai";
import type { ChangeEvent } from "react";
import { Fragment } from "react";
import { activeStatusFiltersAtom } from "../../atoms/taskAtoms";
import type { filterID } from "./FilterBar";

export type statusFilter = {
  id: filterID;
  name: string;
  options: option[];
};

export type option = {
  value: TaskStatus;
  label: string;
};

export type activeStatusFilter = {
  filterID: filterID;
  value: TaskStatus;
  label: string;
};

const filterEquals = (
  filterX: activeStatusFilter,
  filterY: activeStatusFilter
) => {
  return filterX.value === filterY.value && filterX.label === filterY.label;
};

const handleStatusChange = (
  e: ChangeEvent<HTMLInputElement>,
  activeStatusFilters: activeStatusFilter[],
  setActiveStatusFilters: (value: activeStatusFilter[]) => void,
  statusFilter: statusFilter,
  option: option
) => {
  const newActiveStatusFilters = e.target.checked
    ? [
        ...activeStatusFilters,
        {
          filterID: statusFilter.id,
          value: option.value,
          label: `Status`,
        },
      ]
    : activeStatusFilters.filter(
        (activeStatusFilter) =>
          !filterEquals(activeStatusFilter, {
            filterID: statusFilter.id,
            value: option.value,
            label: `Status`,
          })
      );
  setActiveStatusFilters(newActiveStatusFilters);
};

const defaultChecked = (
  activeStatusFilters: activeStatusFilter[],
  statusFilter: statusFilter,
  option: option
) => {
  return (
    activeStatusFilters.filter((activeStatusFilter) =>
      filterEquals(activeStatusFilter, {
        filterID: statusFilter.id,
        value: option.value,
        label: `Status`,
      })
    ).length > 0
  );
};

export const MobileStatusFilter = ({
  open,
  statusFilter,
}: {
  open: boolean;
  statusFilter: statusFilter;
}) => {
  const [activeStatusFilters, setActiveStatusFilters] = useAtom(
    activeStatusFiltersAtom
  );
  return (
    <>
      <h3 className="-mx-2 -my-3 flow-root">
        <Disclosure.Button className="flex w-full items-center justify-between bg-white px-2 py-3 text-sm text-gray-400">
          <span className="font-medium text-gray-900">{statusFilter.name}</span>
          <span className="ml-6 flex items-center">
            <ChevronDownIcon
              className={classNames(
                open ? "-rotate-180" : "rotate-0",
                "h-5 w-5 transform"
              )}
              aria-hidden="true"
            />
          </span>
        </Disclosure.Button>
      </h3>
      <Disclosure.Panel className="pt-6">
        <div className="space-y-6">
          {statusFilter.options.map((option) => (
            <div key={option.value} className="flex items-center">
              <input
                aria-label="checkbox"
                name={`${statusFilter.id}[]`}
                defaultValue={option.value}
                type="checkbox"
                defaultChecked={defaultChecked(
                  activeStatusFilters,
                  statusFilter,
                  option
                )}
                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                onChange={(e) =>
                  handleStatusChange(
                    e,
                    activeStatusFilters,
                    setActiveStatusFilters,
                    statusFilter,
                    option
                  )
                }
              />
              <label className="ml-3 text-sm text-gray-500">
                {option.label}
              </label>
            </div>
          ))}
        </div>
      </Disclosure.Panel>
    </>
  );
};

export const DesktopStatusFilter = ({
  statusFilter,
}: {
  statusFilter: statusFilter;
}) => {
  const [activeStatusFilters, setActiveStatusFilters] = useAtom(
    activeStatusFiltersAtom
  );
  return (
    <Popover
      key={statusFilter.name}
      className="relative inline-block px-4 text-left"
    >
      <Popover.Button className="group inline-flex justify-center text-sm font-medium text-gray-700 hover:text-gray-900">
        <span>{statusFilter.name}</span>
        {activeStatusFilters && activeStatusFilters.length > 0 ? (
          <span className="ml-1.5 rounded bg-gray-200 px-1.5 py-0.5 text-xs font-semibold tabular-nums text-gray-700">
            {activeStatusFilters.length}
          </span>
        ) : null}
        <ChevronDownIcon
          className="-mr-1 ml-1 h-5 w-5 flex-shrink-0 text-gray-400 group-hover:text-gray-500"
          aria-hidden="true"
        />
      </Popover.Button>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Popover.Panel className="absolute right-0 z-10 mt-2 origin-top-right rounded-md bg-white p-4 shadow-2xl ring-1 ring-black ring-opacity-5 focus:outline-none">
          <form className="space-y-4">
            {statusFilter.options.map((option, optionIdx) => (
              <div key={option.value} className="flex items-center">
                <input
                  id={`filter-${statusFilter.id}-${optionIdx}`}
                  name={`${statusFilter.id}[]`}
                  defaultValue={option.value}
                  type="checkbox"
                  defaultChecked={defaultChecked(
                    activeStatusFilters,
                    statusFilter,
                    option
                  )}
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  onChange={(e) =>
                    handleStatusChange(
                      e,
                      activeStatusFilters,
                      setActiveStatusFilters,
                      statusFilter,
                      option
                    )
                  }
                />
                <label
                  htmlFor={`filter-${statusFilter.id}-${optionIdx}`}
                  className="ml-3 whitespace-nowrap pr-6 text-sm font-medium text-gray-900"
                >
                  {option.label}
                </label>
              </div>
            ))}
          </form>
        </Popover.Panel>
      </Transition>
    </Popover>
  );
};
