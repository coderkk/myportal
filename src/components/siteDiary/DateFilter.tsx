import { Disclosure, Listbox, Popover, Transition } from "@headlessui/react";
import {
  CheckIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/20/solid";
import classNames from "classnames";
import { getMonth, getYear } from "date-fns";
import { useAtom } from "jotai";
import { Fragment } from "react";
import ReactDatePicker from "react-datepicker";
import toast from "react-hot-toast";
import { activeDateFiltersAtom } from "../../atoms/siteDiaryAtoms";
import CustomDateInput from "./CustomDateInput";
import type { filterID } from "./FilterBar";
import { filterIDs } from "./FilterBar";

export type dateFilter = {
  id: filterID;
  name: string;
  options: option[];
};

export type option = {
  value: Date | undefined;
  label: string;
};

export type activeDateFilter = {
  filterID: filterID;
  value: Date | undefined;
  label: string;
};

const range = (size: number, startAt = 0) => {
  return [...Array(size).keys()].map((i) => i + startAt);
};

const years = range(80, getYear(new Date()) - 40);
const months = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export const getDateFromActiveFilter = (
  fromNotTo: boolean,
  activeDateFilters: activeDateFilter[]
) => {
  const activeDateFilter = activeDateFilters.find(
    (activeDateFilter) => activeDateFilter.label === (fromNotTo ? "From" : "To")
  );
  return activeDateFilter?.value;
};

const handleDateChange = (
  activeDateFilters: activeDateFilter[],
  setActiveDateFilters: (value: activeDateFilter[]) => void,
  fromNotTo: boolean, // from === True; to === False
  newDate: Date | undefined
) => {
  const idx = activeDateFilters.findIndex((activeDateFilter) => {
    return activeDateFilter.label === (fromNotTo ? "From" : "To");
  });
  const fromDate = getDateFromActiveFilter(true, activeDateFilters);
  const toDate = getDateFromActiveFilter(false, activeDateFilters);
  if (newDate) {
    // updating from date, check if fromDate is > toDate
    if (fromNotTo && toDate && newDate.getTime() > toDate.getTime()) {
      toast.error("From date cannot be greater than To date");
      return;
    }
    // updating to date, check if toDate is > fromDate
    if (!fromNotTo && fromDate && newDate.getTime() < fromDate.getTime()) {
      toast.error("From date cannot be greater than To date");
      return;
    }
    const newActiveDateFilter = {
      filterID: filterIDs[1],
      value: newDate,
      label: fromNotTo ? "From" : "To",
    };
    if (idx === -1) {
      setActiveDateFilters([...activeDateFilters, newActiveDateFilter]);
    } else {
      const newActiveDateFilters = [...activeDateFilters];
      newActiveDateFilters[idx] = newActiveDateFilter;
      setActiveDateFilters(newActiveDateFilters);
    }
  } else {
    if (idx !== -1) {
      const newActiveDateFilters = [...activeDateFilters];
      newActiveDateFilters.splice(idx, 1);
      setActiveDateFilters(newActiveDateFilters);
    }
  }
};

export const MobileDateFilter = ({
  open,
  dateFilter,
}: {
  open: boolean;
  dateFilter: dateFilter;
}) => {
  const [activeDateFilters, setActiveDateFilters] = useAtom(
    activeDateFiltersAtom
  );

  return (
    <>
      <h3 className="-mx-2 -my-3 flow-root">
        <Disclosure.Button className="flex w-full items-center justify-between bg-white px-2 py-3 text-sm text-gray-400">
          <span className="font-medium text-gray-900">{dateFilter.name}</span>
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
          {dateFilter.options.map((option, i) => (
            <div key={i} className="items-center">
              <div className="relative mb-2 flex flex-col justify-between gap-5">
                <div className="items-center">
                  <ReactDatePicker
                    renderCustomHeader={({
                      date,
                      changeYear,
                      decreaseMonth,
                      increaseMonth,
                      prevMonthButtonDisabled,
                      nextMonthButtonDisabled,
                    }) => (
                      <div className="m-2 flex justify-between">
                        <button
                          type="button"
                          onClick={decreaseMonth}
                          disabled={prevMonthButtonDisabled}
                          title="Previous Month"
                        >
                          <ChevronLeftIcon className="h-6 w-6 text-slate-500 hover:bg-gray-50" />
                        </button>
                        <div>
                          <Listbox
                            value={getYear(date)}
                            onChange={(value) => changeYear(Number(value))}
                          >
                            <div className="relative">
                              <Listbox.Button className="mx-2 flex w-28 cursor-default items-center justify-between rounded-lg bg-white p-2 text-left hover:bg-gray-50 focus:outline-none focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-blue-300 sm:text-sm">
                                <div className="block w-full font-medium text-slate-800">
                                  {months[getMonth(date)]} {getYear(date)}
                                </div>
                                <span className="pointer-events-none flex items-center">
                                  <ChevronDownIcon
                                    className="h-5 w-5 font-medium text-slate-800"
                                    aria-hidden="true"
                                  />
                                </span>
                              </Listbox.Button>
                              <Transition
                                as={Fragment}
                                leave="transition ease-in duration-100"
                                leaveFrom="opacity-100"
                                leaveTo="opacity-0"
                              >
                                <Listbox.Options className="absolute mt-1 max-h-60 w-28 overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                                  {years.map((year, idx) => (
                                    <Listbox.Option
                                      key={idx}
                                      className={({ active }) =>
                                        `relative cursor-default select-none py-2 pl-10 pr-4 ${
                                          active
                                            ? "bg-blue-600 text-white"
                                            : "text-gray-900"
                                        }`
                                      }
                                      value={year}
                                    >
                                      {({ selected, active }) => (
                                        <>
                                          <span
                                            className={`block truncate ${
                                              selected
                                                ? "font-medium"
                                                : "font-normal"
                                            }`}
                                          >
                                            {year}
                                          </span>
                                          {selected ? (
                                            <span
                                              className={classNames(
                                                active
                                                  ? "text-white"
                                                  : "text-blue-600",
                                                "absolute inset-y-0 left-0 flex items-center pl-3 text-blue-600"
                                              )}
                                            >
                                              <CheckIcon
                                                className="h-5 w-5 "
                                                aria-hidden="true"
                                              />
                                            </span>
                                          ) : null}
                                        </>
                                      )}
                                    </Listbox.Option>
                                  ))}
                                </Listbox.Options>
                              </Transition>
                            </div>
                          </Listbox>
                        </div>
                        <button
                          type="button"
                          onClick={increaseMonth}
                          disabled={nextMonthButtonDisabled}
                          title="Next Month"
                        >
                          <ChevronRightIcon className="h-6 w-6 text-slate-500 hover:bg-gray-50" />
                        </button>
                      </div>
                    )}
                    selected={getDateFromActiveFilter(
                      option.label === "From",
                      activeDateFilters
                    )}
                    onChange={(date) => {
                      if (date) {
                        if (option.label === "From") {
                          date.setHours(0, 0, 0, 0);
                        } else {
                          date.setHours(23, 59, 59, 999);
                        }
                        handleDateChange(
                          activeDateFilters,
                          setActiveDateFilters,
                          option.label === "From",
                          date
                        );
                      }
                    }}
                    previousMonthButtonLabel={
                      <ChevronLeftIcon className="h-6 w-6 text-slate-500 hover:bg-gray-50" />
                    }
                    nextMonthButtonLabel={
                      <ChevronRightIcon className="h-6 w-6 text-slate-500 hover:bg-gray-50" />
                    }
                    popperClassName="react-datepicker-bottom"
                    placeholderText={
                      option.label === "From"
                        ? "From (dd/mm/yyyy)"
                        : "To (dd/mm/yyyy)"
                    }
                    dateFormat="dd/MM/yyyy"
                    customInput={
                      <CustomDateInput
                        clearInput={() =>
                          handleDateChange(
                            activeDateFilters,
                            setActiveDateFilters,
                            option.label === "From",
                            undefined
                          )
                        }
                      />
                    }
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </Disclosure.Panel>
    </>
  );
};

export const DesktopDateFilter = ({
  dateFilter,
}: {
  dateFilter: dateFilter;
}) => {
  const [activeDateFilters, setActiveDateFilters] = useAtom(
    activeDateFiltersAtom
  );

  return (
    <Popover
      key={dateFilter.name}
      className="relative inline-block px-4 text-left"
    >
      <Popover.Button className="group inline-flex justify-center text-sm font-medium text-gray-700 hover:text-gray-900">
        <span>{dateFilter.name}</span>
        {activeDateFilters && activeDateFilters.length > 0 ? (
          <span className="ml-1.5 rounded bg-gray-200 px-1.5 py-0.5 text-xs font-semibold tabular-nums text-gray-700">
            {activeDateFilters.length}
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
        <Popover.Panel className="absolute right-0 z-10 mt-2 min-w-[300px] origin-top-right rounded-md bg-white p-4 shadow-2xl ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="space-y-4">
            {dateFilter.options.map((option, i) => (
              <div key={i} className="items-center">
                <div className="relative mb-2 flex flex-col justify-between gap-5">
                  <div className="flex items-center">
                    <ReactDatePicker
                      renderCustomHeader={({
                        date,
                        changeYear,
                        decreaseMonth,
                        increaseMonth,
                        prevMonthButtonDisabled,
                        nextMonthButtonDisabled,
                      }) => (
                        <div className="m-2 flex justify-between">
                          <button
                            type="button"
                            onClick={decreaseMonth}
                            disabled={prevMonthButtonDisabled}
                            title="Previous Month"
                          >
                            <ChevronLeftIcon className="h-6 w-6 text-slate-500 hover:bg-gray-50" />
                          </button>
                          <div>
                            <Listbox
                              value={getYear(date)}
                              onChange={(value) => changeYear(Number(value))}
                            >
                              <div className="relative">
                                <Listbox.Button className="mx-2 flex w-28 cursor-default items-center justify-between rounded-lg bg-white p-2 text-left hover:bg-gray-50 focus:outline-none focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-blue-300 sm:text-sm">
                                  <div className="block w-full font-medium text-slate-800">
                                    {months[getMonth(date)]} {getYear(date)}
                                  </div>
                                  <span className="pointer-events-none flex items-center">
                                    <ChevronDownIcon
                                      className="h-5 w-5 font-medium text-slate-800"
                                      aria-hidden="true"
                                    />
                                  </span>
                                </Listbox.Button>
                                <Transition
                                  as={Fragment}
                                  leave="transition ease-in duration-100"
                                  leaveFrom="opacity-100"
                                  leaveTo="opacity-0"
                                >
                                  <Listbox.Options className="absolute mt-1 max-h-60 w-28 overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                                    {years.map((year, idx) => (
                                      <Listbox.Option
                                        key={idx}
                                        className={({ active }) =>
                                          `relative cursor-default select-none py-2 pl-10 pr-4 ${
                                            active
                                              ? "bg-blue-600 text-white"
                                              : "text-gray-900"
                                          }`
                                        }
                                        value={year}
                                      >
                                        {({ selected, active }) => (
                                          <>
                                            <span
                                              className={`block truncate ${
                                                selected
                                                  ? "font-medium"
                                                  : "font-normal"
                                              }`}
                                            >
                                              {year}
                                            </span>
                                            {selected ? (
                                              <span
                                                className={classNames(
                                                  active
                                                    ? "text-white"
                                                    : "text-blue-600",
                                                  "absolute inset-y-0 left-0 flex items-center pl-3 text-blue-600"
                                                )}
                                              >
                                                <CheckIcon
                                                  className="h-5 w-5 "
                                                  aria-hidden="true"
                                                />
                                              </span>
                                            ) : null}
                                          </>
                                        )}
                                      </Listbox.Option>
                                    ))}
                                  </Listbox.Options>
                                </Transition>
                              </div>
                            </Listbox>
                          </div>
                          <button
                            type="button"
                            onClick={increaseMonth}
                            disabled={nextMonthButtonDisabled}
                            title="Next Month"
                          >
                            <ChevronRightIcon className="h-6 w-6 text-slate-500 hover:bg-gray-50" />
                          </button>
                        </div>
                      )}
                      selected={getDateFromActiveFilter(
                        option.label === "From",
                        activeDateFilters
                      )}
                      onChange={(date) => {
                        if (date) {
                          if (option.label === "From") {
                            date.setHours(0, 0, 0, 0);
                          } else {
                            date.setHours(23, 59, 59, 999);
                          }
                          handleDateChange(
                            activeDateFilters,
                            setActiveDateFilters,
                            option.label === "From",
                            date
                          );
                        }
                      }}
                      popperClassName="react-datepicker-bottom"
                      placeholderText={
                        option.label === "From"
                          ? "From (dd/mm/yyyy)"
                          : "To (dd/mm/yyyy)"
                      }
                      dateFormat="dd/MM/yyyy"
                      customInput={
                        <CustomDateInput
                          clearInput={() =>
                            handleDateChange(
                              activeDateFilters,
                              setActiveDateFilters,
                              option.label === "From",
                              undefined
                            )
                          }
                        />
                      }
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Popover.Panel>
      </Transition>
    </Popover>
  );
};
