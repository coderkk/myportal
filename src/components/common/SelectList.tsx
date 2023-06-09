import { Combobox, Transition } from "@headlessui/react";
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/react/20/solid";
import classNames from "classnames";
import { Fragment, useState } from "react";

export type OptionItem = {
  value: string;
  label: string;
};

export default function SelectList({
  selected,
  onChange,
  disabled = false,
  options,
  buttonClassName = "relative w-full cursor-default rounded-md bg-white py-2 pl-3 pr-10 text-left shadow-md focus:outline-none focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-blue-500 sm:text-sm",
  error = false,
  noResultsText = "Nothing found",
}: {
  selected?: OptionItem;
  onChange: (value: OptionItem | null) => void;
  disabled?: boolean;
  options: OptionItem[];
  buttonClassName?: string;
  error?: boolean;
  noResultsText?: string;
}) {
  const [query, setQuery] = useState("");
  const filteredOptions =
    query === ""
      ? options
      : options.filter((option) =>
          option.label
            .toLowerCase()
            .replace(/\s+/g, "")
            .includes(query.toLowerCase().replace(/\s+/g, ""))
        );
  return (
    <Combobox
      value={selected || null}
      onChange={(option) => onChange(option)}
      disabled={disabled}
    >
      <div className="relative">
        <div className="relative w-full cursor-default overflow-hidden rounded-lg bg-white text-left shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-teal-300 sm:text-sm">
          <Combobox.Button
            className={classNames(
              buttonClassName,
              "absolute inset-y-0 right-0 flex items-center pr-2",
              error ? "border-2 border-red-400 focus:border-red-400" : ""
            )}
          >
            <Combobox.Input
              className="w-full border-none text-sm leading-5 text-gray-900 outline-none focus:ring-0"
              onChange={(event) => setQuery(event.target.value)}
              displayValue={(option: OptionItem) =>
                option ? option.label : ""
              }
              placeholder="Search..."
              autoComplete="off"
            />
            <ChevronUpDownIcon
              className="h-5 w-5 text-gray-400"
              aria-hidden="true"
            />
          </Combobox.Button>
        </div>
        <Transition
          as={Fragment}
          leave="transition ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <Combobox.Options
            className={classNames(
              "absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm",
              filteredOptions.length === 0 && query === "" ? "hidden" : ""
            )}
          >
            {filteredOptions.length === 0 && query !== "" ? (
              <div className="relative cursor-default select-none px-4 py-2 text-gray-700">
                {noResultsText}
              </div>
            ) : (
              filteredOptions.map((option) => (
                <Combobox.Option
                  key={option.value}
                  className={({ active }) =>
                    `relative cursor-default select-none py-2 pl-10 pr-4 ${
                      active ? "bg-blue-600 text-white" : "text-gray-900"
                    }`
                  }
                  value={option}
                >
                  {({ selected, active }) => {
                    let node;
                    if (query !== "") {
                      const unMatchedParts = option.label.split(
                        new RegExp(
                          query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), // Escape regex characters https://stackoverflow.com/a/6969486
                          "gi"
                        )
                      );
                      const firstPart = unMatchedParts[0];
                      const remainingParts = unMatchedParts
                        .slice(1)
                        .join(query);
                      node = (
                        <>
                          {firstPart && (
                            <span
                              className={` ${
                                selected ? "font-medium" : "font-normal"
                              }`}
                            >
                              {firstPart}
                            </span>
                          )}
                          <span
                            className={classNames(
                              active ? "bg-yellow-600" : "bg-yellow-300",
                              selected ? "font-medium" : "font-normal"
                            )}
                          >
                            {query}
                          </span>
                          {remainingParts && (
                            <span
                              className={`truncate ${
                                selected ? "font-medium" : "font-normal"
                              }`}
                            >
                              {remainingParts}
                            </span>
                          )}
                        </>
                      );
                    } else {
                      node = (
                        <span
                          className={`block truncate ${
                            selected ? "font-medium" : "font-normal"
                          }`}
                        >
                          {option.label}
                        </span>
                      );
                    }
                    return (
                      <>
                        {node}
                        {selected ? (
                          <span
                            className={classNames(
                              active ? "text-white" : "text-blue-600",
                              "absolute inset-y-0 left-0 flex items-center pl-3 text-blue-600"
                            )}
                          >
                            <CheckIcon className="h-5 w-5" aria-hidden="true" />
                          </span>
                        ) : null}
                      </>
                    );
                  }}
                </Combobox.Option>
              ))
            )}
          </Combobox.Options>
        </Transition>
      </div>
    </Combobox>
  );
}
