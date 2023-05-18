import { Dialog, Disclosure, Popover, Transition } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { useAtom } from "jotai";
import { Fragment, useState } from "react";
import {
  activeDateFiltersAtom,
  activeSearchFiltersAtom,
} from "../../atoms/siteDiaryAtoms";
import { DesktopDateFilter, MobileDateFilter } from "./DateFilter";
import { DesktopSearchFilter, MobileSearchFilter } from "./SearchFilter";

export const filterIDs = ["search", "date"] as const;

export type filterID = (typeof filterIDs)[number];

export const searchFilter = {
  id: filterIDs[0],
  name: "Search",
  options: [{ value: "", label: "Name" }],
};

export const dateFilter = {
  id: filterIDs[1],
  name: "Date",
  options: [
    { value: undefined, label: "From" },
    { value: undefined, label: "To" },
  ],
};

const FilterBar = () => {
  const [open, setOpen] = useState(false);
  const [activeSearchFilters, setActiveSearchFilters] = useAtom(
    activeSearchFiltersAtom
  );
  const [activeDateFilters, setActiveDateFilters] = useAtom(
    activeDateFiltersAtom
  );

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
                <div className="mt-4">
                  <Disclosure
                    as="div"
                    key={searchFilter.name}
                    className="border-t border-gray-200 px-4 py-6"
                  >
                    {({ open }) => (
                      <MobileSearchFilter
                        open={open}
                        searchFilter={searchFilter}
                      />
                    )}
                  </Disclosure>
                  <Disclosure
                    as="div"
                    key={searchFilter.name}
                    className="border-t border-gray-200 px-4 py-6"
                  >
                    {({ open }) => (
                      <MobileDateFilter open={open} dateFilter={dateFilter} />
                    )}
                  </Disclosure>
                </div>
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
                  {activeSearchFilters?.map((activeSearchFilter, i) => (
                    <span
                      key={`${activeSearchFilter.value}-${i}`}
                      className="m-1 inline-flex items-center rounded-xl border border-gray-200 bg-white py-1 pl-2 pr-2 text-sm font-medium text-gray-900"
                    >
                      <span className="flex flex-col">
                        <span className="text-[10px] text-slate-400">
                          {activeSearchFilter.label}
                        </span>
                        <span className="flex items-center justify-between">
                          {activeSearchFilter.value}
                          <button
                            type="button"
                            className="ml-1 inline-flex h-4 w-4 flex-shrink-0 rounded-full p-1 text-gray-400 hover:bg-gray-200 hover:text-gray-500"
                            onClick={() => {
                              const newActiveSearchFilters = [
                                ...activeSearchFilters,
                              ];
                              newActiveSearchFilters.splice(i, 1);
                              setActiveSearchFilters(newActiveSearchFilters);
                            }}
                          >
                            <span className="sr-only">
                              Remove filter for {activeSearchFilter.label}
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
                      </span>
                    </span>
                  ))}
                  {activeDateFilters?.map((activeDateFilter, i) => (
                    <span
                      key={i}
                      className="m-1 inline-flex items-center rounded-xl border border-gray-200 bg-white py-1 pl-2 pr-2 text-sm font-medium text-gray-900"
                    >
                      <span className="flex flex-col">
                        <span className="text-[10px] text-slate-400">
                          {activeDateFilter.label}
                        </span>
                        <span className="flex items-center justify-between">
                          {activeDateFilter?.value?.toLocaleDateString()}
                          <button
                            type="button"
                            className="ml-1 inline-flex h-4 w-4 flex-shrink-0 rounded-full p-1 text-gray-400 hover:bg-gray-200 hover:text-gray-500"
                            onClick={() => {
                              const newActiveDateFilters = [
                                ...activeDateFilters,
                              ];
                              newActiveDateFilters.splice(i, 1);
                              setActiveDateFilters(newActiveDateFilters);
                            }}
                          >
                            <span className="sr-only">
                              Remove filter for {activeDateFilter.label}
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
                      </span>
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
                  <DesktopSearchFilter
                    key={searchFilter.id}
                    searchFilter={searchFilter}
                  />
                  <DesktopDateFilter
                    key={dateFilter.id}
                    dateFilter={dateFilter}
                  />
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
