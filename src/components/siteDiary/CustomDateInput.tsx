import type { HTMLProps } from "react";
import { forwardRef } from "react";

type CustomDateInputProps = HTMLProps<HTMLInputElement> & {
  clearInput: () => void;
};

const CustomDateInput = forwardRef<HTMLInputElement, CustomDateInputProps>(
  ({ clearInput, ...rest }, forwardedRef) => {
    return (
      <div className="flex max-w-sm">
        <input
          {...rest}
          className="peer h-full w-full rounded-[7px] border border-slate-300 border-t-transparent bg-transparent px-3
                      py-2.5 font-sans text-sm font-normal text-slate-700 placeholder-slate-300 placeholder-opacity-0 outline
                      outline-0 transition-all placeholder-shown:border placeholder-shown:border-slate-300 placeholder-shown:border-t-slate-300
                      focus:border-2 focus:border-blue-500 focus:border-t-transparent focus:outline-0"
          ref={forwardedRef}
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
          {rest.placeholder}
        </label>
        <div className="absolute inset-y-0 right-0 flex items-center p-3">
          {rest.value ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="h-full w-full rounded-full text-gray-500 hover:bg-gray-500/10"
              onClick={clearInput}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          ) : (
            <svg
              aria-hidden="true"
              className="h-full w-full  text-gray-500 dark:text-gray-400"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                clipRule="evenodd"
              ></path>
            </svg>
          )}
        </div>
      </div>
    );
  }
);

CustomDateInput.displayName = "CustomDateInput";

export default CustomDateInput;
