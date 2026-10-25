import { Dialog } from "@base-ui/react/dialog";
import type { FormEvent } from "react";
import type { Subject } from "~/types/subjectTypes";

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
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onCancel: () => void;
  onDelete: () => void;
  onReset: () => void;
};

const FIELD_CLASS =
  "mt-2 h-11 w-full rounded-lg border border-zinc-400/40 bg-transparent px-3 text-sm focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-(--accent-100) disabled:cursor-not-allowed disabled:opacity-60";

function sameItems(left: string[], right: string[]) {
  return left.length === right.length && left.every((item) => right.includes(item));
}

function dateTimeAfterOneHour(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  date.setHours(date.getHours() + 1);
  return new Date(date.getTime() - date.getTimezoneOffset() * 60_000)
    .toISOString()
    .slice(0, 16);
}

function localMidnight(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  date.setHours(0, 0, 0, 0);
  return new Date(date.getTime() - date.getTimezoneOffset() * 60_000)
    .toISOString()
    .slice(0, 16);
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
  const start = new Date(values.startDateTime);
  const end = new Date(values.endDateTime);
  const subjectsValid =
    (values.entityType === "exam" || values.subjectDocumentIds.length > 0) &&
    values.subjectDocumentIds.every((documentId) =>
      subjects.some((subject) => subject.documentId === documentId),
    );
  const calendarValid =
    !values.calendarId ||
    calendars.some((calendar) => (calendar.documentId ?? calendar.id) === values.calendarId);
  const isValid =
    values.title.trim().length > 0 &&
    !Number.isNaN(start.getTime()) &&
    !Number.isNaN(end.getTime()) &&
    start <= end &&
    subjectsValid &&
    calendarValid;

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen && !isSaving) onCancel();
      }}
    >
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-9999999999 bg-black/45 backdrop-blur-sm data-[starting-style]:opacity-0 data-[ending-style]:opacity-0 transition-opacity" />
        <Dialog.Viewport className="fixed inset-0 z-99999999999 grid place-items-center p-4">
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
                  {isCreate ? (
                    <select
                      className={FIELD_CLASS}
                      value={values.entityType}
                      disabled={isSaving}
                      onChange={(event) => {
                        const entityType = event.target.value as
                          | "task"
                          | "exam";
                        onChange({
                          ...values,
                          entityType,
                          subjectDocumentIds:
                            entityType === "task"
                              ? values.subjectDocumentIds.slice(0, 1)
                              : values.subjectDocumentIds,
                          endDateTime:
                            entityType === "exam"
                              ? dateTimeAfterOneHour(values.startDateTime)
                              : values.endDateTime,
                          priority: "medium",
                          completed: false,
                        });
                      }}
                    >
                      <option value="task">Task</option>
                      <option value="exam">Exam</option>
                    </select>
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
                  <select
                    className={FIELD_CLASS}
                    value={values.calendarId}
                    disabled={isSaving || calendars.length === 0}
                    onChange={(event) =>
                      onChange({ ...values, calendarId: event.target.value })
                    }
                  >
                    <option value="">No calendar</option>
                    {calendars.map((calendar) => {
                      const id = calendar.documentId ?? calendar.id;
                      return (
                        <option
                          key={id}
                          value={id}
                        >
                          {calendar.name}
                        </option>
                      );
                    })}
                  </select>
                </label>

                <label className="block text-sm font-semibold">
                  Start date and time
                  <input
                    className={FIELD_CLASS}
                    type="datetime-local"
                    value={values.startDateTime}
                    disabled={isSaving}
                    onChange={(event) =>
                      onChange({
                        ...values,
                        startDateTime: event.target.value,
                        ...(values.entityType === "exam"
                          ? {
                              endDateTime: dateTimeAfterOneHour(
                                event.target.value,
                              ),
                            }
                          : values.allDay
                            ? { endDateTime: event.target.value }
                            : {}),
                      })
                    }
                  />
                </label>

                <label className="block text-sm font-semibold">
                  End date and time
                  <input
                    className={FIELD_CLASS}
                    type="datetime-local"
                    value={values.endDateTime}
                    disabled={isSaving || values.entityType === "exam"}
                    onChange={(event) =>
                      onChange({
                        ...values,
                        endDateTime: event.target.value,
                        ...(values.allDay && values.entityType === "task"
                          ? { startDateTime: event.target.value }
                          : {}),
                      })
                    }
                  />
                  {values.entityType === "exam" && (
                    <span className="mt-1 block text-xs font-normal text-(--text-secondary)">
                      Exam records store the start time only. The calendar
                      displays a one-hour event.
                    </span>
                  )}
                </label>

                <label className="flex items-center gap-3 self-center text-sm font-medium">
                  <input
                    type="checkbox"
                    checked={values.allDay}
                    disabled={isSaving}
                    onChange={(event) => {
                      const allDay = event.target.checked;
                      const day = localMidnight(values.startDateTime);
                      onChange({
                        ...values,
                        allDay,
                        ...(allDay
                          ? values.entityType === "task"
                            ? { startDateTime: day, endDateTime: day }
                            : {
                                startDateTime: day,
                                endDateTime: dateTimeAfterOneHour(day),
                              }
                          : {}),
                      });
                    }}
                    className="size-4 accent-(--accent-100)"
                  />
                  All-day event
                </label>

                <label className="block text-sm font-semibold sm:col-span-2">
                  Description
                  <textarea
                    className="mt-2 min-h-28 w-full resize-y rounded-lg border border-zinc-400/40 bg-transparent px-3 py-2 text-sm focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-(--accent-100) disabled:cursor-not-allowed disabled:opacity-60"
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
                    <select
                      className={FIELD_CLASS}
                      value={values.subjectDocumentIds[0] ?? ""}
                      disabled={
                        isSaving || subjectsLoading || subjects.length === 0
                      }
                      required
                      onChange={(event) =>
                        onChange({
                          ...values,
                          subjectDocumentIds: event.target.value
                            ? [event.target.value]
                            : [],
                        })
                      }
                    >
                      <option value="">
                        {subjectsLoading
                          ? "Loading subjects..."
                          : "Select a subject"}
                      </option>
                      {subjects.map((subject) => (
                        <option
                          key={subject.documentId}
                          value={subject.documentId}
                        >
                          {subject.name}
                        </option>
                      ))}
                    </select>
                  </label>
                ) : (
                  <fieldset className="grid gap-2">
                    <legend className="text-sm font-semibold">
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
                      <div className="grid max-h-40 gap-2 overflow-y-auto rounded-lg border border-zinc-400/35 p-3">
                        {subjects.map((subject) => (
                          <label
                            key={subject.documentId}
                            className="flex items-center gap-3 text-sm"
                          >
                            <input
                              type="checkbox"
                              checked={values.subjectDocumentIds.includes(
                                subject.documentId,
                              )}
                              disabled={isSaving}
                              onChange={(event) => {
                                const nextSubjects = event.target.checked
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
                              className="size-4 accent-(--accent-100)"
                            />
                            {subject.name}
                          </label>
                        ))}
                      </div>
                    )}
                  </fieldset>
                )}

                {values.entityType === "task" && (
                  <>
                    <label className="block text-sm font-semibold">
                      Priority
                      <select
                        className={FIELD_CLASS}
                        value={values.priority}
                        disabled={isSaving}
                        onChange={(event) =>
                          onChange({
                            ...values,
                            priority: event.target
                              .value as CalendarEventFormValues["priority"],
                          })
                        }
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    </label>

                    <label className="flex items-center gap-3 text-sm font-medium">
                      <input
                        type="checkbox"
                        checked={values.completed}
                        disabled={isSaving}
                        onChange={(event) =>
                          onChange({
                            ...values,
                            completed: event.target.checked,
                          })
                        }
                        className="size-4 accent-(--accent-100)"
                      />
                      Mark task as completed
                    </label>
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
                    className="h-10 rounded-lg bg-(--accent-100) px-5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
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
