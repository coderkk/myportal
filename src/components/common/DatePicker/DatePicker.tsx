import type { DateValue } from "@internationalized/date";
import { useRef } from "react";
import type { AriaDatePickerProps } from "react-aria";
import { useDatePicker } from "react-aria";
import { useDatePickerState } from "react-stately";
import {
  CalendarDateFill,
  ExclamationTriangleFill,
} from "styled-icons/bootstrap";
import { FieldButton } from "./Button";
import { Calendar } from "./Calendar";
import { DateField } from "./DateField";
import { Dialog } from "./Dialog";
import { Popover } from "./Popover";

const DatePicker = (props: AriaDatePickerProps<DateValue>) => {
  const state = useDatePickerState(props);
  const ref = useRef(null);
  const {
    groupProps,
    labelProps,
    fieldProps,
    buttonProps,
    dialogProps,
    calendarProps,
  } = useDatePicker(props, state, ref);

  return (
    <div className="relative z-50 inline-flex flex-col text-left">
      <span {...labelProps} className="text-sm text-gray-800">
        {props.label}
      </span>
      <div {...groupProps} ref={ref} className="group flex">
        <div className="relative flex items-center rounded-l-md border border-gray-300 bg-white p-1 pr-10 transition-colors group-focus-within:border-violet-600 group-hover:border-gray-400 group-focus-within:group-hover:border-violet-600">
          <DateField {...fieldProps} />
          {state.validationState === "invalid" && (
            <ExclamationTriangleFill className="absolute right-1 h-6 w-6 text-red-500" />
          )}
        </div>
        <FieldButton {...buttonProps} isPressed={state.isOpen}>
          <CalendarDateFill className="h-5 w-5 text-gray-700 group-focus-within:text-violet-700" />
        </FieldButton>
      </div>
      {state.isOpen && (
        <Popover triggerRef={ref} state={state} placement="bottom start">
          <Dialog {...dialogProps}>
            <Calendar {...calendarProps} />
          </Dialog>
        </Popover>
      )}
    </div>
  );
};

export default DatePicker;
