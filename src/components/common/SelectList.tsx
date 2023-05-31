import { Listbox, Transition } from "@headlessui/react";
import { CheckIcon, ChevronDownIcon } from "@heroicons/react/20/solid";
import classNames from "classnames";
import { Fragment, useState  } from "react";

export default function SelectList({
  value,
  placeholder = "",
  onChange,
  disabled = false,
  options,
  buttonClassName = "relative w-full min-h-[40px] border-2 cursor-default rounded-lg bg-white py-2 pl-3 pr-10 text-left shadow-md focus:outline-none focus:border-blue-400 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-blue-300 sm:text-sm",
  extraClassName = "",
  openClassName = "border-2 border-blue-400",
  error = false
}: {
  value: string | number | undefined | null;
  placeholder?: string;
  onChange: (arg0: string) => void;
  disabled?: boolean;
  options: string[] | number[] | object[];
  buttonClassName?: string;
  extraClassName?: string;
  openClassName?: string;
  error?: boolean;
}) {

  const [selectedOption, setSelectedOption] = useState({value: "", label: placeholder});
  const optionValues: { value: string; label: string; }[] = [];

  if (placeholder != "") {
    optionValues.push({value: "", label: placeholder})
  }
  for(let n = 0; n < options.length; n++) {
    const element = options[n];
    let optionValue: { value: string; label: string; } = {value: "", label: ""};
    if (typeof element != "object") {
      optionValue = {value: element as string, label: element as string};
    } else {
      if ("value" in element && "label" in element) {
        optionValue.value = element.value as string;
        optionValue.label = element.label as string;
      }
    }
    optionValues.push(optionValue)
  }

  if (value !== selectedOption.value) {
    const selectItem = optionValues.find((option: { value: string; label: string; }) => option.value == value);
    if (selectItem) setSelectedOption(selectItem);
  }

  const listboxOnChange = (o: { value: string; label: string; }) => {
    setSelectedOption(o);
    onChange(o.value)
  }

  return (
    <Listbox value={selectedOption} by="value" onChange={listboxOnChange} disabled={disabled}>
     {({ open }) => (
       <div className="relative">
        <Listbox.Button className={`${buttonClassName} ${error ? ' border-red-400 focus:border-red-400' : ''} ${extraClassName} ${open ? openClassName : ''}`}>
          <span className="block truncate">{selectedOption.label}</span>
          <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
            <ChevronDownIcon
              className="h-5 w-5 text-gray-400"
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
          <Listbox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
            {optionValues.map((optionValue, idx) => {
              return (
                <Listbox.Option
                  key={idx}
                  className={({ active }) =>
                    `relative cursor-default select-none py-2 pl-10 pr-4 ${
                      active ? "bg-blue-600 text-white" : "text-gray-900"
                    }`
                  }
                  value={optionValue}
                >
                  {({ selected, active }) => (
                    <>
                      <span
                        className={`block truncate ${
                          selected ? "font-medium" : "font-normal"
                        }`}
                      >
                        {optionValue.label}
                      </span>
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
                  )}
                </Listbox.Option>
              )}
            )}
          </Listbox.Options>
        </Transition>
      </div>
      )}
    </Listbox>
  );
}
