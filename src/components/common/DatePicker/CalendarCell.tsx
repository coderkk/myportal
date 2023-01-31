import type { CalendarDate } from "@internationalized/date";
import { getDayOfWeek } from "@internationalized/date";
import { useRef } from "react";
import {
  mergeProps,
  useCalendarCell,
  useFocusRing,
  useLocale,
} from "react-aria";
import type { CalendarState } from "react-stately";

export type CalendarCellProps = {
  state: CalendarState;
  date: CalendarDate;
};

const CalendarCell = ({ state, date }: CalendarCellProps) => {
  const ref = useRef(null);
  const {
    cellProps,
    buttonProps,
    isSelected,
    isOutsideVisibleRange,
    isDisabled,
    formattedDate,
    isInvalid,
  } = useCalendarCell({ date }, state, ref);

  // The start and end date of the selected range will have
  // an emphasized appearance.
  // const isSelectionStart = state.highlightedRange;
  //   ? isSameDay(date, state.highlightedRange.start)
  //   : isSelected;
  // const isSelectionEnd = state.highlightedRange
  //   ? isSameDay(date, state.highlightedRange.end)
  //   : isSelected;

  const isSelectionStart = isSelected;
  const isSelectionEnd = isSelected;

  // We add rounded corners on the left for the first day of the month,
  // the first day of each week, and the start date of the selection.
  // We add rounded corners on the right for the last day of the month,
  // the last day of each week, and the end date of the selection.
  const { locale } = useLocale();
  const dayOfWeek = getDayOfWeek(date, locale);
  const isRoundedLeft =
    isSelected && (isSelectionStart || dayOfWeek === 0 || date.day === 1);
  const isRoundedRight =
    isSelected &&
    (isSelectionEnd ||
      dayOfWeek === 6 ||
      date.day === date.calendar.getDaysInMonth(date));

  const { focusProps, isFocusVisible } = useFocusRing();

  return (
    <td
      {...cellProps}
      className={`relative py-0.5 ${isFocusVisible ? "z-10" : "z-10"}`}
    >
      <div
        {...mergeProps(buttonProps, focusProps)}
        ref={ref}
        hidden={isOutsideVisibleRange}
        className={`group h-10 w-10 outline-none ${
          isRoundedLeft ? "rounded-l-full" : ""
        } ${isRoundedRight ? "rounded-r-full" : ""} ${
          isSelected ? (isInvalid ? "bg-red-300" : "bg-violet-300") : ""
        } ${isDisabled ? "disabled" : ""}`}
      >
        <div
          className={`flex h-full w-full items-center justify-center rounded-full ${
            isDisabled && !isInvalid ? "text-gray-400" : ""
          } ${
            // Focus ring, visible while the cell has keyboard focus.
            isFocusVisible
              ? "group-focus:z-2 ring-2 ring-violet-600 ring-offset-2"
              : ""
          } ${
            // Hover state for non-selected cells.
            !isSelected && !isDisabled ? "hover:bg-violet-100" : ""
          } cursor-default`}
        >
          {formattedDate}
        </div>
      </div>
    </td>
  );
};

export { CalendarCell };
