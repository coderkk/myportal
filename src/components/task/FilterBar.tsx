import { Dialog, Disclosure, Popover, Transition } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import { XMarkIcon } from "@heroicons/react/24/outline";
import type { TaskStatus } from "@prisma/client";
import classNames from "classnames";
import { useAtom } from "jotai";
import type { ChangeEvent } from "react";
import { Fragment, useState } from "react";
import { statusAtom } from "../../atoms/taskAtoms";
import type {
  activeFilter,
  filterID,
  option,
  section,
} from "../../pages/projects/[projectId]/task";
import { filterIDs, filters } from "../../pages/projects/[projectId]/task";

const filterEquals = (filterX: activeFilter, filterY: activeFilter) => {
  return (
    filterX.filterID === filterY.filterID &&
    filterX.value === filterY.value &&
    filterX.label === filterY.label
  );
};

const getStatusFromFilters = (filters: activeFilter[], filterID: filterID) => {
  const initialState: TaskStatus[] = [];
  const categoryValues = filters.reduce((accumulator, currentFilter) => {
    if (currentFilter.filterID === filterID) {
      accumulator.push(currentFilter.value as TaskStatus);
    }
    return accumulator;
  }, initialState);
  return categoryValues.length > 0 ? categoryValues : undefined;
};

const FilterBar = ({
  activeFilters,
  setActiveFilters,
}: {
  activeFilters: activeFilter[];
  setActiveFilters: (value: activeFilter[]) => void;
}) => {
  const [open, setOpen] = useState(false);
  const [_, setStatus] = useAtom(statusAtom);

  const numberOfAppliedFiltersByCategory = (category: filterID) => {
    return activeFilters.reduce((accumulator, currentValue) => {
      if (category === currentValue.filterID) {
        return accumulator + 1;
      }
      return accumulator;
    }, 0);
  };

  const handleCheck = (sec: section, opt: option) => {
    const newActiveFilters = [
      ...activeFilters,
      {
        filterID: sec.id,
        value: opt.value,
        label: `Status: ${opt.label}`,
      },
    ];
    setActiveFilters(newActiveFilters);
    setStatus(getStatusFromFilters(newActiveFilters, filterIDs[0]));
  };

  const handleUncheck = (sec: section, opt: option) => {
    const newActiveFilters = activeFilters.filter(
      (activeFilter) =>
        !filterEquals(activeFilter, {
          filterID: sec.id,
          value: opt.value,
          label: `Status: ${opt.label}`,
        })
    );
    setActiveFilters(newActiveFilters);
    setStatus(getStatusFromFilters(newActiveFilters, filterIDs[0]));
  };

  const handleStatusChange = (
    e: ChangeEvent<HTMLInputElement>,
    sec: section,
    opt: option
  ) => {
    e.target.checked ? handleCheck(sec, opt) : handleUncheck(sec, opt);
  };

  const defaultChecked = (sec: section, opt: option) => {
    return (
      activeFilters.filter((activeFilter) =>
        filterEquals(activeFilter, {
          filterID: sec.id,
          value: opt.value,
          label: `Status: ${opt.label}`,
        })
      ).length > 0
    );
  };

  return (
    <div className="bg-white">
      {/* Mobile filter dialog */}
      <Transition.Root show={open} as={Fragment}>
        <Dialog as="div" className="relative z-40 sm:hidden" onClose={setOpen}>
          <Transition.Child
            as={Fragment}
            enter="transition-opacity ease-linear duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-linear duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 z-40 flex">
            <Transition.Child
              as={Fragment}
              enter="transition ease-in-out duration-300 transform"
              enterFrom="translate-x-full"
              enterTo="translate-x-0"
              leave="transition ease-in-out duration-300 transform"
              leaveFrom="translate-x-0"
              leaveTo="translate-x-full"
            >
              <Dialog.Panel className="relative ml-auto flex h-full w-full max-w-xs flex-col overflow-y-auto bg-white py-4 pb-12 shadow-xl">
                <div className="flex items-center justify-between px-4">
                  <h2 className="text-lg font-medium text-gray-900">Filters</h2>
                  <button
                    type="button"
                    className="-mr-2 flex h-10 w-10 items-center justify-center rounded-md bg-white p-2 text-gray-400"
                    onClick={() => setOpen(false)}
                  >
                    <span className="sr-only">Close menu</span>
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>

                {/* Filters */}
                <form className="mt-4">
                  {filters.map((section) => (
                    <Disclosure
                      as="div"
                      key={section.name}
                      className="border-t border-gray-200 px-4 py-6"
                    >
                      {({ open }) => (
                        <>
                          <h3 className="-mx-2 -my-3 flow-root">
                            <Disclosure.Button className="flex w-full items-center justify-between bg-white px-2 py-3 text-sm text-gray-400">
                              <span className="font-medium text-gray-900">
                                {section.name}
                              </span>
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
                              {section.options.map((option) => (
                                <div
                                  key={option.value}
                                  className="flex items-center"
                                >
                                  <input
                                    aria-label="checkbox"
                                    name={`${section.id}[]`}
                                    defaultValue={option.value}
                                    type="checkbox"
                                    defaultChecked={defaultChecked(
                                      section,
                                      option
                                    )}
                                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                    onChange={(e) =>
                                      handleStatusChange(e, section, option)
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
                      )}
                    </Disclosure>
                  ))}
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>

      {/* Filters */}
      <section aria-labelledby="filter-heading">
        <h2 id="filter-heading" className="sr-only">
          Filters
        </h2>

        <div className="bg-gray-100">
          <div className="flex justify-between px-4 py-3 sm:items-center sm:px-6 lg:px-8">
            <span className="sm:flex sm:items-center">
              <h3 className="text-sm font-medium text-gray-500">
                Filters
                <span className="sr-only">, active</span>
              </h3>

              <div
                aria-hidden="true"
                className="hidden h-5 w-px bg-gray-300 sm:ml-4 sm:block"
              />
              {/* Active filters */}
              <div className="mt-2 sm:ml-4 sm:mt-0">
                <div className="-m-1 flex flex-wrap items-center">
                  {activeFilters.map((activeFilter, i) => (
                    <span
                      key={activeFilter.value}
                      className="m-1 inline-flex items-center rounded-full border border-gray-200 bg-white py-1.5 pl-3 pr-2 text-sm font-medium text-gray-900"
                    >
                      <span>{activeFilter.label}</span>
                      <button
                        type="button"
                        className="ml-1 inline-flex h-4 w-4 flex-shrink-0 rounded-full p-1 text-gray-400 hover:bg-gray-200 hover:text-gray-500"
                        onClick={() => {
                          const newActiveFilters = [...activeFilters];
                          newActiveFilters.splice(i, 1);
                          setActiveFilters(newActiveFilters);
                          setStatus(
                            getStatusFromFilters(newActiveFilters, filterIDs[0])
                          );
                        }}
                      >
                        <span className="sr-only">
                          Remove filter for {activeFilter.label}
                        </span>
                        <svg
                          className="h-2 w-2"
                          stroke="currentColor"
                          fill="none"
                          viewBox="0 0 8 8"
                        >
                          <path
                            strokeLinecap="round"
                            strokeWidth="1.5"
                            d="M1 1l6 6m0-6L1 7"
                          />
                        </svg>
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </span>
            <button
              type="button"
              className="inline-block text-sm font-medium text-gray-700 hover:text-gray-900 sm:hidden"
              onClick={() => setOpen(true)}
              aria-label="filter"
            >
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
                  d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75"
                />
              </svg>
            </button>

            {/* Desktop Filters */}
            <div className="hidden sm:block">
              <div className="flow-root">
                <Popover.Group className="-mx-4 flex items-center divide-x divide-gray-200">
                  {filters.map((section) => (
                    <Popover
                      key={section.name}
                      className="relative inline-block px-4 text-left"
                    >
                      <Popover.Button className="group inline-flex justify-center text-sm font-medium text-gray-700 hover:text-gray-900">
                        <span>{section.name}</span>
                        {numberOfAppliedFiltersByCategory(section.id) > 0 ? (
                          <span className="ml-1.5 rounded bg-gray-200 px-1.5 py-0.5 text-xs font-semibold tabular-nums text-gray-700">
                            {numberOfAppliedFiltersByCategory(section.id)}
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
                            {section.options.map((option, optionIdx) => (
                              <div
                                key={option.value}
                                className="flex items-center"
                              >
                                <input
                                  id={`filter-${section.id}-${optionIdx}`}
                                  name={`${section.id}[]`}
                                  defaultValue={option.value}
                                  type="checkbox"
                                  defaultChecked={defaultChecked(
                                    section,
                                    option
                                  )}
                                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                  onChange={(e) =>
                                    handleStatusChange(e, section, option)
                                  }
                                />
                                <label
                                  htmlFor={`filter-${section.id}-${optionIdx}`}
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
                  ))}
                </Popover.Group>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default FilterBar;
