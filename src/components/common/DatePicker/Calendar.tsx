import { createCalendar } from "@internationalized/date";
import { ChevronLeftIcon, ChevronRightIcon } from "@radix-ui/react-icons";
import type { DateValue } from "@react-types/calendar";
import { useRef } from "react";
import type { CalendarProps } from "react-aria";
import { useCalendar, useLocale } from "react-aria";
import { useCalendarState } from "react-stately";
import { CalendarButton } from "./Button";
import { CalendarGrid } from "./CalendarGrid";

const Calendar = (props: CalendarProps<DateValue>) => {
  const { locale } = useLocale();
  const state = useCalendarState({
    ...props,
    locale,
    createCalendar,
  });

  const ref = useRef(null);
  const { calendarProps, prevButtonProps, nextButtonProps, title } =
    useCalendar(props, state);

  return (
    <div {...calendarProps} ref={ref} className="inline-block text-gray-800">
      <div className="flex items-center pb-4">
        <h2 className="ml-2 flex-1 text-xl font-bold">{title}</h2>
        <CalendarButton {...prevButtonProps}>
          <ChevronLeftIcon className="h-6 w-6" />
        </CalendarButton>
        <CalendarButton {...nextButtonProps}>
          <ChevronRightIcon className="h-6 w-6" />
        </CalendarButton>
      </div>
      <CalendarGrid state={state} />
    </div>
  );
};

export { Calendar };
