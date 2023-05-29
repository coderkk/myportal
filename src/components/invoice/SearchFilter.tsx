import { Disclosure, Popover, Transition } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import classNames from "classnames";
import { useAtom } from "jotai";
import type { Dispatch, FormEvent } from "react";
import { Fragment, useReducer } from "react";
import { activeSearchFiltersAtom } from "../../atoms/supplierInvoiceAtoms";
import type { filterID } from "./FilterBar";
import { filterIDs } from "./FilterBar";

export type searchFilter = {
  id: filterID;
  name: string;
  options: option[];
};

export type option = {
  value: string;
  label: string;
};

export type activeSearchFilter = {
  filterID: filterID;
  value: string;
  label: string;
};

type state = {
  costCode: string;
};

type action = {
  type: string;
  payload: string;
};

const filterEquals = (
  filterX: activeSearchFilter,
  filterY: activeSearchFilter
) => {
  return filterX.value === filterY.value && filterX.label === filterY.label;
};

const handleSearch = (
  e: FormEvent<HTMLFormElement>,
  state: state,
  dispatch: Dispatch<action>,
  activeSearchFilters: activeSearchFilter[],
  setActiveSearchFilters: (value: activeSearchFilter[]) => void
) => {
  e.preventDefault();
  const newActiveSearchFilterCandidates = [
    {
      filterID: filterIDs[1],
      value: state.costCode,
      label: "Cost code",
    },
  ];
  const newActiveSearchFilters = [];
  for (const newActiveSearchFilterCandidate of newActiveSearchFilterCandidates) {
    const index = activeSearchFilters.findIndex((activeSearchFilter) => {
      return filterEquals(activeSearchFilter, newActiveSearchFilterCandidate);
    });
    if (index === -1 && newActiveSearchFilterCandidate.value !== "") {
      newActiveSearchFilters.push(newActiveSearchFilterCandidate);
    }
  }
  setActiveSearchFilters([...activeSearchFilters, ...newActiveSearchFilters]);
  dispatch({ type: "costCode", payload: "" });
};

const reducer = (state: state, action: action): state => {
  switch (action.type) {
    case "costCode":
      return {
        ...state,
        costCode: action.payload,
      };
    default:
      throw new Error(`Unhandled action type`);
  }
};

export const MobileSearchFilter = ({
  open,
  searchFilter,
}: {
  open: boolean;
  searchFilter: searchFilter;
}) => {
  const [activeSearchFilters, setActiveSearchFilters] = useAtom(
    activeSearchFiltersAtom
  );

  const [state, dispatch] = useReducer(reducer, {
    costCode: "",
  });

  return (
    <>
      <h3 className="-mx-2 -my-3 flow-root">
        <Disclosure.Button className="flex w-full items-center justify-between bg-white px-2 py-3 text-sm text-gray-400">
          <span className="font-medium text-gray-900">{searchFilter.name}</span>
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
        <form
          className="space-y-6"
          onSubmit={(e) =>
            handleSearch(
              e,
              state,
              dispatch,
              activeSearchFilters,
              setActiveSearchFilters
            )
          }
        >
          {searchFilter.options.map((option, i) => (
            <div key={i} className="items-center">
              <div className="relative mb-2 flex flex-col justify-between gap-5">
                <input
                  autoFocus={i === 0}
                  autoComplete="off"
                  type="text"
                  className="peer h-full w-full rounded-[7px] border border-slate-300 border-t-transparent bg-transparent px-3 py-2.5
                    font-sans text-sm font-normal text-slate-700 placeholder-slate-300 placeholder-opacity-0 outline outline-0
                    transition-all placeholder-shown:border placeholder-shown:border-slate-300 placeholder-shown:border-t-slate-300 focus:border-2
                    focus:border-blue-500 focus:border-t-transparent focus:outline-0"
                  placeholder="Name"
                  value={option.label === "Cost code" ? state.costCode : ""}
                  onChange={(e) =>
                    option.label === "Cost code"
                      ? dispatch({
                          type: "costCode",
                          payload: e.target.value,
                        })
                      : null
                  }
                />
                <label
                  className="before:content[' '] after:content[' '] pointer-events-none absolute -top-1.5 left-0 flex h-full w-full select-none text-[11px] font-normal
                    leading-tight text-slate-600 transition-all before:pointer-events-none before:mr-1 before:mt-[6.5px] before:box-border before:block
                    before:h-1.5 before:w-2.5 before:rounded-tl-md before:border-l before:border-t before:border-slate-300 before:transition-all after:pointer-events-none
                    after:ml-1 after:mt-[6.5px] after:box-border after:block after:h-1.5 after:w-2.5 after:flex-grow after:rounded-tr-md after:border-r after:border-t
                    after:border-slate-300 after:transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:leading-[3.75] peer-placeholder-shown:text-slate-600
                    peer-placeholder-shown:before:border-transparent peer-placeholder-shown:after:border-transparent peer-focus:text-[11px] peer-focus:font-medium
                    peer-focus:leading-tight peer-focus:text-blue-500 peer-focus:before:border-l-2 peer-focus:before:border-t-2 peer-focus:before:border-blue-500
                    peer-focus:after:border-r-2 peer-focus:after:border-t-2 peer-focus:after:border-blue-500"
                >
                  {option.label}
                </label>
              </div>
            </div>
          ))}
          <button
            type="submit"
            className="w-full rounded-lg bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 px-5 py-2.5 text-center text-sm font-medium text-white shadow-lg 
                    shadow-blue-500/50 hover:bg-gradient-to-br focus:outline-none focus:ring-4 focus:ring-blue-300"
          >
            Search
          </button>
        </form>
      </Disclosure.Panel>
    </>
  );
};

export const DesktopSearchFilter = ({
  searchFilter,
}: {
  searchFilter: searchFilter;
}) => {
  const [activeSearchFilters, setActiveSearchFilters] = useAtom(
    activeSearchFiltersAtom
  );
  const [state, dispatch] = useReducer(reducer, {
    costCode: "",
  });

  return (
    <Popover
      key={searchFilter.name}
      className="relative inline-block px-4 text-left"
    >
      <Popover.Button className="group inline-flex justify-center text-sm font-medium text-gray-700 hover:text-gray-900">
        <span>{searchFilter.name}</span>
        {activeSearchFilters && activeSearchFilters.length > 0 ? (
          <span className="ml-1.5 rounded bg-gray-200 px-1.5 py-0.5 text-xs font-semibold tabular-nums text-gray-700">
            {activeSearchFilters.length}
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
          <form
            className="space-y-4"
            onSubmit={(e) =>
              handleSearch(
                e,
                state,
                dispatch,
                activeSearchFilters,
                setActiveSearchFilters
              )
            }
          >
            {searchFilter.options.map((option, i) => (
              <div key={i} className="items-center">
                <div className="relative mb-2 flex flex-col justify-between gap-5">
                  <input
                    autoFocus={i === 0}
                    autoComplete="off"
                    type="text"
                    className="peer h-full w-full rounded-[7px] border border-slate-300 border-t-transparent bg-transparent px-3 py-2.5
                    font-sans text-sm font-normal text-slate-700 placeholder-slate-300 placeholder-opacity-0 outline outline-0
                    transition-all placeholder-shown:border placeholder-shown:border-slate-300 placeholder-shown:border-t-slate-300 focus:border-2
                    focus:border-blue-500 focus:border-t-transparent focus:outline-0"
                    placeholder="Name"
                    value={option.label === "Cost code" ? state.costCode : ""}
                    onChange={(e) =>
                      option.label === "Cost code"
                        ? dispatch({
                            type: "costCode",
                            payload: e.target.value,
                          })
                        : null
                    }
                  />
                  <label
                    className="before:content[' '] after:content[' '] pointer-events-none absolute -top-1.5 left-0 flex h-full w-full select-none text-[11px] font-normal
                    leading-tight text-slate-600 transition-all before:pointer-events-none before:mr-1 before:mt-[6.5px] before:box-border before:block
                    before:h-1.5 before:w-2.5 before:rounded-tl-md before:border-l before:border-t before:border-slate-300 before:transition-all after:pointer-events-none
                    after:ml-1 after:mt-[6.5px] after:box-border after:block after:h-1.5 after:w-2.5 after:flex-grow after:rounded-tr-md after:border-r after:border-t
                    after:border-slate-300 after:transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:leading-[3.75] peer-placeholder-shown:text-slate-600
                    peer-placeholder-shown:before:border-transparent peer-placeholder-shown:after:border-transparent peer-focus:text-[11px] peer-focus:font-medium
                    peer-focus:leading-tight peer-focus:text-blue-500 peer-focus:before:border-l-2 peer-focus:before:border-t-2 peer-focus:before:border-blue-500
                    peer-focus:after:border-r-2 peer-focus:after:border-t-2 peer-focus:after:border-blue-500"
                  >
                    {option.label}
                  </label>
                </div>
              </div>
            ))}
            <button
              type="submit"
              className="w-full rounded-lg bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 px-5 py-2.5 text-center text-sm font-medium text-white shadow-lg 
                    shadow-blue-500/50 hover:bg-gradient-to-br focus:outline-none focus:ring-4 focus:ring-blue-300"
            >
              Search
            </button>
          </form>
        </Popover.Panel>
      </Transition>
    </Popover>
  );
};
