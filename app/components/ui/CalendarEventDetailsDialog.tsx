import { Dialog } from "@base-ui/react/dialog";
import type { SubmitEvent } from "react";
import { ChevronDown } from "@untitledui/icons";
import { Checkbox } from "@heroui/react";
import type { Key } from "react-aria-components";
import type { Subject } from "~/types/subjectTypes";
import { Button } from "../../../components/base/buttons/button";
import { Dropdown } from "../../../components/base/dropdown/dropdown";
import { DatePicker } from "../../../components/application/date-picker/date-picker";
import {
  addMinutesToDateTimeInput,
  calendarDateTimeToDateTimeInput,
  dateTimeInputAtMidnight,
  dateTimeInputToCalendarDateTime,
  dateTimeInputToDate,
} from "~/components/utils/dateTime";

export type CalendarEventFormValues = {
  entityType: "task" | "exam";
  title: string;
  subjectDocumentIds: string[];
  calendarId: string;
  startDateTime: string;
  endDateTime: string;
  description: string;
  allDay: boolean;
  priority: "low" | "medium" | "high";
  completed: boolean;
};

type CalendarOption = {
  id: string;
  documentId?: string;
  name: string;
};

type Props = {
  open: boolean;
  mode: "create" | "edit";
  values: CalendarEventFormValues;
  initialValues: CalendarEventFormValues;
  subjects: Subject[];
  subjectsLoading: boolean;
  calendars: CalendarOption[];
  isSaving: boolean;
  error: string | null;
  onChange: (values: CalendarEventFormValues) => void;
  onSubmit: (event: SubmitEvent<HTMLFormElement>) => void;
  onCancel: () => void;
  onDelete: () => void;
  onReset: () => void;
};

const FIELD_CLASS =
  "mt-2 h-11 w-full rounded-lg border border-zinc-400/40 bg-transparent px-3 text-sm transition-[border-color,box-shadow] duration-200 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-violet-500 disabled:cursor-not-allowed disabled:opacity-60 motion-reduce:transition-none";

function RequiredMarker() {
  return (
    <span
      aria-hidden="true"
      className="ml-0.5 text-red-600 dark:text-red-400"
    >
      *
    </span>
  );
}

type SelectOption = {
  value: string;
  label: string;
  key?: string;
  isDisabled?: boolean;
};

function DialogSelect({
  ariaLabel,
  value,
  options,
  placeholder,
  isDisabled = false,
  isInvalid = false,
  onChange,
}: {
  ariaLabel: string;
  value: string;
  options: SelectOption[];
  placeholder: string;
  isDisabled?: boolean;
  isInvalid?: boolean;
  onChange: (value: string) => void;
}) {
  const selectedOption = options.find((option) => option.value === value);
  const selectedKey = selectedOption?.key ?? selectedOption?.value;
  const selectedKeys = selectedKey
    ? new Set<Key>([selectedKey])
    : new Set<Key>();

  return (
    <Dropdown.Root>
      <Button
        aria-label={ariaLabel}
        aria-invalid={isInvalid || undefined}
        size="md"
        color="secondary"
        iconTrailing={ChevronDown}
        isDisabled={isDisabled}
        className="mt-2 h-11 w-full justify-between rounded-lg px-3 text-left text-sm font-normal"
      >
        <span className={!selectedOption ? "text-placeholder" : "truncate"}>
          {selectedOption?.label ?? placeholder}
        </span>
      </Button>
      <Dropdown.Popover
        className="max-h-64 w-64"
        style={{ zIndex: 20_000_002 }}
      >
        <Dropdown.Menu
          aria-label={ariaLabel}
          selectionMode="single"
          selectedKeys={selectedKeys}
          onSelectionChange={(selection) => {
            if (selection === "all") return;
            const [key] = selection;
            const option = options.find(
              (item) => (item.key ?? item.value) === String(key),
            );
            if (option && !option.isDisabled) onChange(option.value);
          }}
        >
          <Dropdown.Section>
            {options.map((option) => (
              <Dropdown.Item
                key={option.key ?? option.value}
                id={option.key ?? option.value}
                textValue={option.label}
                isDisabled={option.isDisabled}
              >
                {option.label}
              </Dropdown.Item>
            ))}
          </Dropdown.Section>
        </Dropdown.Menu>
      </Dropdown.Popover>
    </Dropdown.Root>
  );
}

function sameItems(left: string[], right: string[]) {
  return (
    left.length === right.length && left.every((item) => right.includes(item))
  );
}

export default function CalendarEventDetailsDialog({
  open,
  mode,
  values,
  initialValues,
  subjects,
  subjectsLoading,
  calendars,
  isSaving,
  error,
  onChange,
  onSubmit,
  onCancel,
  onDelete,
  onReset,
}: Props) {
  const isCreate = mode === "create";
  const sameSubjectIds = sameItems(
    values.subjectDocumentIds,
    initialValues.subjectDocumentIds,
  );
  const isDirty =
    values.entityType !== initialValues.entityType ||
    values.title !== initialValues.title ||
    !sameSubjectIds ||
    values.calendarId !== initialValues.calendarId ||
    values.startDateTime !== initialValues.startDateTime ||
    values.endDateTime !== initialValues.endDateTime ||
    values.description !== initialValues.description ||
    values.allDay !== initialValues.allDay ||
    values.priority !== initialValues.priority ||
    values.completed !== initialValues.completed;
  const start = dateTimeInputToDate(values.startDateTime);
  const end = dateTimeInputToDate(values.endDateTime);
  const endPrecedesStart = start > end;
  const subjectsValid =
    (values.entityType === "exam" || values.subjectDocumentIds.length > 0) &&
    values.subjectDocumentIds.every((documentId) =>
      subjects.some((subject) => subject.documentId === documentId),
    );
  const calendarValid =
    !values.calendarId ||
    calendars.some(
      (calendar) => (calendar.documentId ?? calendar.id) === values.calendarId,
    );
  const isValid =
    values.title.trim().length > 0 &&
    !Number.isNaN(start.getTime()) &&
    !Number.isNaN(end.getTime()) &&
    start <= end &&
    subjectsValid &&
    calendarValid;

  function updateStartDateTime(startDateTime: string) {
    onChange({
      ...values,
      startDateTime,
      ...(values.entityType === "exam"
        ? { endDateTime: addMinutesToDateTimeInput(startDateTime, 60) }
        : values.allDay
          ? { endDateTime: startDateTime }
          : {}),
    });
  }

  return (
    <Dialog.Root
      open={open}
      disablePointerDismissal
      onOpenChange={(nextOpen, eventDetails) => {
        if (!nextOpen && !isSaving && eventDetails.reason === "close-press") {
          onCancel();
        }
      }}
    >
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-19999999 bg-black/45 backdrop-blur-sm data-starting-style:opacity-0 data-ending-style:opacity-0 transition-opacity" />
        <Dialog.Viewport className="fixed inset-0 z-20000000 grid place-items-center p-4">
          <Dialog.Popup className="relative flex max-h-[min(88dvh,52rem)] w-full max-w-2xl flex-col overflow-hidden border border-zinc-400/35 bg-white text-neutral-950 shadow-[0.25rem_0.25rem_0] shadow-black/15 dark:bg-neutral-950 dark:text-white">
            <Dialog.Close
              disabled={isSaving}
              aria-label="Close event editor"
              className="absolute right-4 top-4 z-10 grid size-9 place-items-center rounded-lg border border-zinc-400/35 text-sm transition-colors hover:bg-zinc-400/15 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-x preview-icon"
              >
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
            </Dialog.Close>

            <form
              onSubmit={onSubmit}
              className="flex min-h-0 flex-1 flex-col"
            >
              <header className="border-b border-zinc-400/25 px-5 py-5 pe-20 sm:px-6">
                <Dialog.Title className="mt-1 text-xl font-semibold">
                  {isCreate ? "Create study event" : "Edit study event"}
                </Dialog.Title>
                <Dialog.Description className="mt-2 text-sm text-(--text-secondary)">
                  Set the event schedule and study details here.
                </Dialog.Description>
              </header>

              <div className="grid min-h-0 gap-5 overflow-y-auto px-5 py-5 sm:grid-cols-2 sm:px-6">
                <label className="block text-sm font-semibold">
                  Event type
                  {isCreate && <RequiredMarker />}
                  {isCreate ? (
                    <DialogSelect
                      ariaLabel="Event type"
                      value={values.entityType}
                      placeholder="Select event type"
                      isDisabled={isSaving}
                      options={[
                        { value: "task", label: "Task" },
                        { value: "exam", label: "Exam" },
                      ]}
                      onChange={(nextEntityType) => {
                        const entityType = nextEntityType as "task" | "exam";
                        onChange({
                          ...values,
                          entityType,
                          subjectDocumentIds:
                            entityType === "task"
                              ? values.subjectDocumentIds.slice(0, 1)
                              : values.subjectDocumentIds,
                          endDateTime:
                            entityType === "exam"
                              ? addMinutesToDateTimeInput(
                                  values.startDateTime,
                                  60,
                                )
                              : values.endDateTime,
                          priority: "medium",
                          completed: false,
                        });
                      }}
                    />
                  ) : (
                    <p
                      className={`${FIELD_CLASS} flex items-center capitalize`}
                    >
                      {values.entityType}
                    </p>
                  )}
                </label>
                <label className="block text-sm font-semibold">
                  Title
                  <RequiredMarker />
                  <input
                    className={FIELD_CLASS}
                    type="text"
                    value={values.title}
                    maxLength={160}
                    disabled={isSaving}
                    onChange={(event) =>
                      onChange({ ...values, title: event.target.value })
                    }
                  />
                </label>
                <label className="block text-sm font-semibold">
                  Calendar
                  <DialogSelect
                    ariaLabel="Calendar"
                    value={values.calendarId}
                    placeholder="Select a calendar"
                    isDisabled={isSaving || calendars.length === 0}
                    options={[
                      ...calendars.map((calendar) => {
                        const id = calendar.documentId ?? calendar.id;
                        return { value: id, label: calendar.name };
                      }),
                    ]}
                    onChange={(calendarId) =>
                      onChange({ ...values, calendarId })
                    }
                  />
                </label>
                <label className="block text-sm font-semibold">
                  Start date and time
                  <RequiredMarker />
                  <div className="mt-2 flex min-w-0 gap-2">
                    <DatePicker
                      className="min-w-0 flex-1"
                      widePlacement="right"
                      value={dateTimeInputToCalendarDateTime(
                        values.startDateTime,
                      )}
                      isTimeDisabled={values.allDay}
                      isDisabled={isSaving}
                      onChange={(date) => {
                        if (date) {
                          updateStartDateTime(
                            calendarDateTimeToDateTimeInput(date),
                          );
                        }
                      }}
                    />
                  </div>
                </label>
                <label className="block text-sm font-semibold">
                  End date and time
                  {values.entityType === "task" && <RequiredMarker />}
                  <div className="mt-2 flex min-w-0 gap-2 items-center">
                    <DatePicker
                      className="min-w-0 flex-1"
                      widePlacement="left"
                      value={dateTimeInputToCalendarDateTime(
                        values.endDateTime,
                      )}
                      minValue={dateTimeInputToCalendarDateTime(
                        values.startDateTime,
                      )}
                      isTimeDisabled={values.allDay}
                      isDisabled={isSaving || values.entityType === "exam"}
                      isInvalid={endPrecedesStart}
                      aria-describedby={
                        endPrecedesStart ? "end-date-time-error" : undefined
                      }
                      onChange={(date) => {
                        if (!date) return;
                        const endDateTime =
                          calendarDateTimeToDateTimeInput(date);
                        onChange({
                          ...values,
                          endDateTime,
                          ...(values.allDay && values.entityType === "task"
                            ? { startDateTime: endDateTime }
                            : {}),
                        });
                      }}
                    />
                  </div>
                  {endPrecedesStart && (
                    <p
                      id="end-date-time-error"
                      className="mt-1 text-xs font-normal text-red-600 dark:text-red-400"
                      role="alert"
                    >
                      End date and time must be on or after the start date and
                      time.
                    </p>
                  )}
                  {values.entityType === "exam" && (
                    <span className="mt-1 block text-xs font-normal text-(--text-secondary)">
                      Exam records store the start time only. The calendar
                      displays a one-hour event.
                    </span>
                  )}
                </label>
                <Checkbox
                  name="allDay"
                  isSelected={values.allDay}
                  isDisabled={isSaving}
                  className="self-center mt-[1.65rem] mx-auto"
                  onChange={(allDay) => {
                    const day = dateTimeInputAtMidnight(values.startDateTime);
                    onChange({
                      ...values,
                      allDay,
                      ...(allDay
                        ? values.entityType === "task"
                          ? { startDateTime: day, endDateTime: day }
                          : {
                              startDateTime: day,
                              endDateTime: addMinutesToDateTimeInput(day, 60),
                            }
                        : {}),
                    });
                  }}
                >
                  <Checkbox.Content>
                    <Checkbox.Control>
                      <Checkbox.Indicator />
                    </Checkbox.Control>
                    All-day event
                  </Checkbox.Content>
                </Checkbox>
                <label className="block text-sm font-semibold sm:col-span-2">
                  Description
                  <textarea
                    className="mt-2 min-h-28 w-full rounded-lg border border-zinc-400/40 bg-transparent px-3 py-2 text-sm transition-[border-color,box-shadow] duration-200 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-violet-500 disabled:cursor-not-allowed disabled:opacity-60 motion-reduce:transition-none field-sizing-content resize-none"
                    value={values.description}
                    disabled={isSaving}
                    onChange={(event) =>
                      onChange({ ...values, description: event.target.value })
                    }
                  />
                </label>
                {values.entityType === "task" ? (
                  <label className="block text-sm font-semibold">
                    Subject
                    <RequiredMarker />
                    <DialogSelect
                      ariaLabel="Subject"
                      value={values.subjectDocumentIds[0] ?? ""}
                      placeholder={
                        subjectsLoading
                          ? "Loading subjects..."
                          : "Select a subject"
                      }
                      isDisabled={
                        isSaving || subjectsLoading || subjects.length === 0
                      }
                      isInvalid={values.subjectDocumentIds.length === 0}
                      options={[
                        {
                          key: "no-subject",
                          value: "",
                          label: subjectsLoading
                            ? "Loading subjects..."
                            : "No Subject",
                        },
                        ...subjects.map((subject) => ({
                          value: subject.documentId,
                          label: subject.name,
                        })),
                      ]}
                      onChange={(subjectDocumentId) =>
                        onChange({
                          ...values,
                          subjectDocumentIds: subjectDocumentId
                            ? [subjectDocumentId]
                            : [],
                        })
                      }
                    />
                  </label>
                ) : (
                  <fieldset className="grid gap-2">
                    <legend className="text-sm font-semibold mb-2">
                      Subjects (optional)
                    </legend>
                    {subjectsLoading ? (
                      <p className="text-sm text-(--text-secondary)">
                        Loading subjects...
                      </p>
                    ) : subjects.length === 0 ? (
                      <p className="text-sm text-(--text-secondary)">
                        No subjects available.
                      </p>
                    ) : (
                      <div className="grid max-h-40 gap-2 overflow-y-auto rounded-lg border border-zinc-400/35 p-3 [&_label]:min-w-full">
                        {subjects.map((subject) => (
                          <Checkbox
                            key={subject.documentId}
                            name="subjectDocumentIds"
                            value={subject.documentId}
                            isSelected={values.subjectDocumentIds.includes(
                              subject.documentId,
                            )}
                            isDisabled={isSaving}
                            onChange={(isSelected) => {
                              const nextSubjects = isSelected
                                ? [
                                    ...values.subjectDocumentIds,
                                    subject.documentId,
                                  ]
                                : values.subjectDocumentIds.filter(
                                    (documentId) =>
                                      documentId !== subject.documentId,
                                  );
                              onChange({
                                ...values,
                                subjectDocumentIds: nextSubjects,
                              });
                            }}
                          >
                            <Checkbox.Content>
                              <Checkbox.Control>
                                <Checkbox.Indicator />
                              </Checkbox.Control>
                              {subject.name}
                            </Checkbox.Content>
                          </Checkbox>
                        ))}
                      </div>
                    )}
                  </fieldset>
                )}
                {values.entityType === "task" && (
                  <>
                    <label className="block text-sm font-semibold">
                      Priority
                      <DialogSelect
                        ariaLabel="Priority"
                        value={values.priority}
                        placeholder="Select priority"
                        isDisabled={isSaving}
                        options={[
                          { value: "high", label: "High" },
                          { value: "medium", label: "Medium" },
                          { value: "low", label: "Low" },
                        ]}
                        onChange={(priority) =>
                          onChange({
                            ...values,
                            priority:
                              priority as CalendarEventFormValues["priority"],
                          })
                        }
                      />
                    </label>

                    <Checkbox
                      name="completed"
                      className={"content-center"}
                      isSelected={values.completed}
                      isDisabled={isSaving}
                      onChange={(completed) =>
                        onChange({ ...values, completed })
                      }
                    >
                      <Checkbox.Content>
                        <Checkbox.Control>
                          <Checkbox.Indicator />
                        </Checkbox.Control>
                        Mark task as completed
                      </Checkbox.Content>
                    </Checkbox>
                  </>
                )}
                {error && (
                  <p
                    role="alert"
                    className="text-sm text-red-600 dark:text-red-400 sm:col-span-2"
                  >
                    {error}
                  </p>
                )}
              </div>

              <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-zinc-400/25 px-5 py-4 sm:px-6">
                <div className="flex flex-wrap gap-2">
                  {mode === "edit" && (
                    <button
                      type="button"
                      onClick={onDelete}
                      disabled={isSaving}
                      className="h-10 rounded-lg border border-red-500/45 px-3 text-sm font-medium text-red-600 transition-colors hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Delete event
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={onReset}
                    disabled={isSaving || isCreate || !isDirty}
                    className="h-10 rounded-lg px-3 text-sm font-medium text-(--text-secondary) transition-colors hover:bg-zinc-400/15 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Reset changes
                  </button>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={onCancel}
                    disabled={isSaving}
                    className="h-10 rounded-lg border border-zinc-400/35 px-4 text-sm font-medium transition-colors hover:bg-zinc-400/15 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={
                      isSaving ||
                      subjectsLoading ||
                      !isValid ||
                      (!isCreate && !isDirty)
                    }
                    className="h-10 cursor-pointer rounded-lg bg-violet-500 px-5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isSaving
                      ? "Saving..."
                      : isCreate
                        ? "Create event"
                        : "Save changes"}
                  </button>
                </div>
              </footer>
            </form>
          </Dialog.Popup>
        </Dialog.Viewport>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
