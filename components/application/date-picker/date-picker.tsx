import { useEffect, useState } from "react";
import { useControlledState } from "@react-stately/utils";
import {
  getLocalTimeZone,
  toCalendarDateTime,
  today,
  type CalendarDateTime,
} from "@internationalized/date";
import { Calendar as CalendarIcon, Clock } from "@untitledui/icons";
import { useDateFormatter } from "react-aria";
import type { DatePickerProps as AriaDatePickerProps, DateValue, Key } from "react-aria-components";
import {
  DateField,
  DatePicker as AriaDatePicker,
  Dialog as AriaDialog,
  Group as AriaGroup,
  Popover as AriaPopover,
} from "react-aria-components";
import {
  Button,
  type ButtonProps,
} from "../../../components/base/buttons/button";
import { InputDateBase } from "../../../components/base/input/input-date";
import { cx } from "../../../utils/cx";
import { Calendar } from "./calendar";

/** 27 slots from 9:00 AM through 10:00 PM, in 30-minute intervals. */
const TIME_SLOTS = Array.from({ length: 47 }, (_, index) => {
  const totalMinutes = 1 * 60 + index * 30;
  const hour = Math.floor(totalMinutes / 60);
  const minute = totalMinutes % 60;
  const period = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 || 12;
  const minuteText = String(minute).padStart(2, "0");

  return {
    id: `${hour}:${minuteText}`,
    hour,
    minute,
    label: `${hour12}:${minuteText} ${period}`,
  };
});

const highlightedDates = [today(getLocalTimeZone())];

interface DatePickerProps extends AriaDatePickerProps<CalendarDateTime> {
  /** The function to call when the apply button is clicked. */
  onApply?: () => void;
  /** The function to call when the cancel button is clicked. */
  onCancel?: () => void;
  /** Controls the size of the trigger button that opens the calendar. */
  size?: ButtonProps["size"];
  /** Disable time choices while leaving the calendar date editable. */
  isTimeDisabled?: boolean;
  /** Side to use for the popover on wide viewports. */
  widePlacement?: "left" | "right";
}

export const DatePicker = ({
  value: valueProp,
  defaultValue,
  onChange,
  minValue,
  isOpen: isOpenProp,
  onOpenChange: onOpenChangeProp,
  onApply,
  onCancel,
  size = "sm",
  isTimeDisabled = false,
  widePlacement = "right",
  ...props
}: DatePickerProps) => {
  const [value, setValue] = useControlledState(
    valueProp,
    defaultValue ?? null,
    onChange,
  );
  const [isOpen, setIsOpen] = useControlledState(
    isOpenProp,
    false,
    onOpenChangeProp,
  );
  const [draftValue, setDraftValue] = useState<CalendarDateTime | null>(value);
  const [focusedValue, setFocusedValue] = useState<DateValue | null>(value);
  const [isWideViewport, setIsWideViewport] = useState(false);
  const dateFormatter = useDateFormatter({
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const timeFormatter = useDateFormatter({ hour: "numeric", minute: "numeric" });

  useEffect(() => {
    const mediaQuery = window.matchMedia(
      "(min-width: 1200px) and (min-height: 700px)",
    );
    const updateViewport = () => setIsWideViewport(mediaQuery.matches);

    updateViewport();
    mediaQuery.addEventListener("change", updateViewport);
    return () => mediaQuery.removeEventListener("change", updateViewport);
  }, []);

  const formattedValue = value
    ? value.toDate(getLocalTimeZone())
    : null;
  const currentTimeKey = draftValue
    ? `${draftValue.hour}:${String(draftValue.minute).padStart(2, "0")}`
    : "";
  const draftIsBeforeMinimum = Boolean(
    draftValue && minValue && draftValue.compare(minValue) < 0,
  );

  const isTimeSlotBeforeMinimum = (slot: (typeof TIME_SLOTS)[number]) => {
    if (!minValue) return false;
    const current = draftValue ?? toCalendarDateTime(today(getLocalTimeZone()));
    return current.set({ hour: slot.hour, minute: slot.minute }).compare(minValue) < 0;
  };

  const handleOpenChange = (nextIsOpen: boolean) => {
    if (nextIsOpen) {
      setDraftValue(value);
      setFocusedValue(
        value && minValue && value.compare(minValue) < 0 ? minValue : value,
      );
    }
    setIsOpen(nextIsOpen);
  };

  const handleTodayClick = () => {
    const current = draftValue ?? toCalendarDateTime(today(getLocalTimeZone()));
    const nextValue = toCalendarDateTime(today(getLocalTimeZone())).set({
      hour: current.hour,
      minute: current.minute,
    });
    setDraftValue(nextValue);
    setFocusedValue(nextValue);
  };

  const handleTimeClick = (key: Key | null) => {
    const slot = TIME_SLOTS.find((item) => item.id === key);
    if (!slot || isTimeDisabled || isTimeSlotBeforeMinimum(slot)) return;

    const current = draftValue ?? toCalendarDateTime(today(getLocalTimeZone()));
    setDraftValue(current.set({ hour: slot.hour, minute: slot.minute }));
  };

  const handleCancel = (close: () => void) => {
    setDraftValue(value);
    setFocusedValue(value);
    onCancel?.();
    close();
  };

  const handleApply = (close: () => void) => {
    setValue(draftValue);
    onApply?.();
    close();
  };

  return (
    <AriaDatePicker
      aria-label="Date and time picker"
      shouldCloseOnSelect={false}
      {...props}
      minValue={minValue}
      isOpen={isOpen}
      onOpenChange={handleOpenChange}
      value={draftValue}
      onChange={setDraftValue}
    >
      <AriaGroup>
        <Button
          size={size}
          color="secondary"
          iconLeading={CalendarIcon}
          className="w-full justify-start"
        >
          {formattedValue ? (
            <>
              {dateFormatter.format(formattedValue)}{" "}
              <span className="text-quaternary">
                {timeFormatter.format(formattedValue)}
              </span>
            </>
          ) : (
            "Select date and time"
          )}
        </Button>
      </AriaGroup>
      <AriaPopover
        offset={8}
        placement={isWideViewport ? widePlacement : "bottom right"}
        shouldFlip
        containerPadding={16}
        style={{ zIndex: 20_000_001 }}
        className={({ isEntering, isExiting }) =>
          cx(
            "z-[20000001] max-h-[calc(100dvh_-_2rem)] overflow-y-auto overscroll-contain origin-(--trigger-anchor-point) will-change-transform",
            isEntering &&
              "duration-150 ease-out animate-in fade-in placement-right:slide-in-from-left-0.5 placement-top:slide-in-from-bottom-0.5 placement-bottom:slide-in-from-top-0.5",
            isExiting &&
              "duration-100 ease-in animate-out fade-out placement-right:slide-out-to-left-0.5 placement-top:slide-out-to-bottom-0.5 placement-bottom:slide-out-to-top-0.5",
          )
        }
      >
        <AriaDialog
          aria-label="Choose date and time"
          className="rounded-2xl bg-primary shadow-xl ring ring-secondary_alt"
        >
          {({ close }) => (
            <>
              <div className="flex">
                <div className="flex px-6 py-5">
                  <Calendar
                    focusedValue={focusedValue ?? undefined}
                    onFocusChange={setFocusedValue}
                  >
                    <div className="flex flex-wrap gap-3 md:hidden">
                      <div className="flex flex-1 gap-3">
                        <DateField
                          aria-label="Date"
                          granularity="day"
                          className="flex-1"
                        >
                          <InputDateBase size="sm" className="flex-1" />
                        </DateField>
                        <Button
                          slot={null}
                          size="sm"
                          color="secondary"
                          onClick={handleTodayClick}
                        >
                          Today
                        </Button>
                      </div>
                      <label className="flex flex-1 items-center gap-2 rounded-lg border border-secondary bg-primary px-3 text-sm shadow-xs">
                        <Clock className="size-4 shrink-0 text-quaternary" />
                        <span className="sr-only">Time</span>
                        <select
                          aria-label="Time"
                          className="min-w-0 flex-1 bg-transparent py-2 text-(--text-primary) outline-hidden [color-scheme:light] disabled:cursor-not-allowed disabled:opacity-50 dark:[color-scheme:dark]"
                          value={currentTimeKey}
                          disabled={isTimeDisabled}
                          onChange={(event) => handleTimeClick(event.target.value)}
                        >
                          {!TIME_SLOTS.some((slot) => slot.id === currentTimeKey) && (
                            <option value={currentTimeKey} disabled>
                              {draftValue
                                ? timeFormatter.format(draftValue.toDate(getLocalTimeZone()))
                                : "Choose time"}
                            </option>
                          )}
                          {TIME_SLOTS.map((slot) => (
                            <option
                              key={slot.id}
                              value={slot.id}
                              disabled={isTimeSlotBeforeMinimum(slot)}
                            >
                              {slot.label}
                            </option>
                          ))}
                        </select>
                      </label>
                    </div>
                  </Calendar>
                </div>
                <div className="relative hidden h-[22rem] min-h-0 w-50 flex-col gap-4 border-s border-secondary md:flex">
                  <div className="px-5 pt-6.5 text-center text-sm font-semibold text-fg-secondary">
                    Available times
                  </div>
                  <div className="relative min-h-0 flex-1">
                    <ul className="absolute inset-0 flex min-h-0 flex-col gap-1.5 overflow-y-auto mask-b-from-80% mask-b-to-98% px-5 pb-5">
                      {TIME_SLOTS.map((slot) => {
                        const isSelected =
                          draftValue?.hour === slot.hour &&
                          draftValue.minute === slot.minute;
                        return (
                          <li key={slot.id} className="flex-none">
                            <Button
                              size="xs"
                              color="secondary"
                              isDisabled={
                                isTimeDisabled || isTimeSlotBeforeMinimum(slot)
                              }
                              className={cx(
                                "w-full",
                                isSelected && "bg-primary_hover",
                              )}
                              onClick={() => handleTimeClick(slot.id)}
                            >
                              {slot.label}
                            </Button>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </div>
              </div>
              <div className="flex gap-3 border-t border-secondary p-4">
                <div className="mr-auto hidden gap-3 md:flex">
                  <DateField
                    aria-label="Date"
                    granularity="day"
                    className="flex-1"
                  >
                    <InputDateBase size="sm" />
                  </DateField>
                  <Button
                    slot={null}
                    size="sm"
                    color="secondary"
                    onClick={handleTodayClick}
                  >
                    Today
                  </Button>
                </div>
                <Button
                  size="sm"
                  color="secondary"
                  className="max-md:flex-1"
                  onClick={() => handleCancel(close)}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  color="primary"
                  className="max-md:flex-1"
                  isDisabled={draftIsBeforeMinimum}
                  onClick={() => handleApply(close)}
                >
                  Apply
                </Button>
              </div>
            </>
          )}
        </AriaDialog>
      </AriaPopover>
    </AriaDatePicker>
  );
};
