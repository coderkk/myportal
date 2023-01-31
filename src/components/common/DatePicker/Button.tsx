import type { ReactNode } from "react";
import { useRef } from "react";
import { mergeProps, useButton, useFocusRing } from "react-aria";

type CalendarButtonProps = {
  isDisabled?: boolean | undefined;
  children: ReactNode;
};

type FieldButtonProps = {
  isPressed: boolean;
  children: ReactNode;
};

const CalendarButton = (props: CalendarButtonProps) => {
  const ref = useRef(null);
  const { buttonProps } = useButton(props, ref);
  const { focusProps, isFocusVisible } = useFocusRing();
  return (
    <button
      {...mergeProps(buttonProps, focusProps)}
      ref={ref}
      className={`rounded-full p-2 ${props.isDisabled ? "text-gray-400" : ""} ${
        !props.isDisabled ? "hover:bg-violet-100 active:bg-violet-200" : ""
      } outline-none ${
        isFocusVisible ? "ring-2 ring-purple-600 ring-offset-2" : ""
      }`}
    >
      {props.children}
    </button>
  );
};

const FieldButton = (props: FieldButtonProps) => {
  const ref = useRef(null);
  const { buttonProps, isPressed } = useButton(props, ref);
  return (
    <button
      {...buttonProps}
      ref={ref}
      className={`-ml-px rounded-r-md border px-2 outline-none transition-colors group-focus-within:border-violet-600 group-focus-within:group-hover:border-violet-600 ${
        isPressed || props.isPressed
          ? "border-gray-400 bg-gray-200"
          : "border-gray-300 bg-gray-50 group-hover:border-gray-400"
      }`}
    >
      {props.children}
    </button>
  );
};

export { CalendarButton, FieldButton };
