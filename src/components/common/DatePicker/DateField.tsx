import { createCalendar } from "@internationalized/date";
import type { AriaDatePickerProps, DateValue } from "@react-types/datepicker";
import { useRef } from "react";
import { useDateField, useDateSegment, useLocale } from "react-aria";
import type { DateFieldState } from "react-stately";
import { DateSegment, useDateFieldState } from "react-stately";

const DateField = (props: AriaDatePickerProps<DateValue>) => {
  const { locale } = useLocale();
  const state = useDateFieldState({
    ...props,
    locale,
    createCalendar,
  });

  const ref = useRef(null);
  const { fieldProps } = useDateField(props, state, ref);

  return (
    <div {...fieldProps} ref={ref} className="flex">
      {state.segments.map((segment, i) => (
        <DateSegment key={i} segment={segment} state={state} />
      ))}
    </div>
  );
};

const DateSegment = ({
  segment,
  state,
}: {
  segment: DateSegment;
  state: DateFieldState;
}) => {
  const ref = useRef(null);
  const { segmentProps } = useDateSegment(segment, state, ref);

  return (
    <div
      {...segmentProps}
      ref={ref}
      className={`group box-content rounded-sm px-0.5 text-right tabular-nums outline-none focus:bg-violet-600 focus:text-white ${
        !segment.isEditable ? "text-gray-500" : "text-gray-800"
      } ${segment.maxValue ? `${String(segment.maxValue).length}ch` : ""}`}
    >
      {/* Always reserve space for the placeholder, to prevent layout shift when editing. */}
      <span
        aria-hidden="true"
        className={`pointer-events-none block w-full text-center italic text-gray-500 group-focus:text-white ${
          segment.isPlaceholder ? "" : "hidden h-0"
        }`}
      >
        {segment.placeholder}
      </span>
      {segment.isPlaceholder ? "" : segment.text}
    </div>
  );
};

export { DateField };
