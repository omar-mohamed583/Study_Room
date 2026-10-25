import {
  getLocalTimeZone,
  parseDate,
  parseTime,
  toCalendarDateTime,
  today,
  type CalendarDate,
  type CalendarDateTime,
} from "@internationalized/date";

export const DEFAULT_EVENT_TIME = "09:00";

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const TIME_PATTERN = /^(?:[01]\d|2[0-3]):[0-5]\d$/;

/** Convert a Date to the local YYYY-MM-DDTHH:mm format used by time inputs. */
export function dateToDateTimeInput(date: Date): string {
  if (Number.isNaN(date.getTime())) return "";

  return new Date(date.getTime() - date.getTimezoneOffset() * 60_000)
    .toISOString()
    .slice(0, 16);
}

/** Parse a local date-time input value into a Date. */
export function dateTimeInputToDate(value: string): Date {
  return new Date(value);
}

/** Read the calendar date from a local date-time value for React Aria. */
export function dateTimeInputToCalendarDate(value: string): CalendarDate {
  const datePart = value.slice(0, 10);
  if (DATE_PATTERN.test(datePart)) {
    try {
      return parseDate(datePart);
    } catch {
      // Fall back to today if a stale or malformed form value is present.
    }
  }

  return today(getLocalTimeZone());
}

/** Read the local date and time as the value used by the date-time picker. */
export function dateTimeInputToCalendarDateTime(
  value: string,
): CalendarDateTime {
  return toCalendarDateTime(
    dateTimeInputToCalendarDate(value),
    parseTime(dateTimeInputToTime(value)),
  );
}

/** Read a valid HH:mm value, using the default event time for malformed input. */
export function dateTimeInputToTime(value: string): string {
  const time = value.slice(11, 16);
  return TIME_PATTERN.test(time) ? time : DEFAULT_EVENT_TIME;
}

/** Convert the date-time picker's local calendar value to a form input string. */
export function calendarDateTimeToDateTimeInput(
  value: CalendarDateTime,
): string {
  return dateToDateTimeInput(value.toDate(getLocalTimeZone()));
}

/** Add minutes to a local date-time input without changing its display format. */
export function addMinutesToDateTimeInput(
  value: string,
  minutes: number,
): string {
  const date = dateTimeInputToDate(value);
  if (Number.isNaN(date.getTime())) return value;

  return dateToDateTimeInput(new Date(date.getTime() + minutes * 60_000));
}

/** Set the local time of a date-time input to midnight. */
export function dateTimeInputAtMidnight(value: string): string {
  const date = dateTimeInputToDate(value);
  if (Number.isNaN(date.getTime())) return value;

  date.setHours(0, 0, 0, 0);
  return dateToDateTimeInput(date);
}
