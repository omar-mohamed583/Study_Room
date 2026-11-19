import {
  useCallback,
  useId,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Check, CircleAlert, Loader2 } from "lucide-react";
import { ChevronDown } from "@untitledui/icons";
import type { DateValue, Key } from "react-aria-components";
import { Button } from "~/components/base/buttons/button";
import { Dropdown } from "~/components/base/dropdown/dropdown";
import {
  dateTimeInputToCalendarDate,
  dateTimeInputToTime,
} from "~/components/utils/dateTime";
import { apiFetch } from "~/api/api";
import useStudyData from "~/context/studyDataContext";
import {
  EMPTY_TASK_FORM,
  PRIORITIES,
  TASK_LIMITS,
  parseServerErrors,
  toLocalInputValue,
  toTaskPayload,
  validateTask,
  type NewTaskPayload,
  type TaskFormErrors,
  type TaskFormValues,
} from "~/lib/taskForm";
import { twMerge } from "tailwind-merge";

// Must match the query key useGetEvents uses for /tasks, otherwise the new
// task won't show up until a manual refresh.
const TASKS_QUERY_KEY = ["tasks"];

// Same order as the fields appear in the DOM (used to focus the first error).
const FIELD_ORDER: (keyof TaskFormValues)[] = [
  "title",
  "description",
  "dueDate",
  "calendarAllDay",
  "priority",
  "estimatedDuration",
  "subjectId",
];

async function createTask(payload: NewTaskPayload) {
  return apiFetch("/tasks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ data: payload }),
  });
}

const borderClass = "border-zinc-400/60 in-[.dark]:border-zinc-400/15";

const controlClass = (invalid: boolean) =>
  [
    "w-full rounded-[8px] border bg-transparent px-2.5 py-2 text-sm leading-[normal]",
    "outline-none transition-colors duration-200 in-[.dark]:scheme-dark",
    "placeholder:text-(--text-secondary) focus-visible:border-violet-600",
    invalid ? "border-rose-500" : borderClass,
  ].join(" ");

export default function CreateTaskForm() {
  const uid = useId();
  const formRef = useRef<HTMLFormElement>(null);
  const queryClient = useQueryClient();
  const {
    subjects: { data: subjects },
  } = useStudyData();

  const [values, setValues] = useState<TaskFormValues>(() => EMPTY_TASK_FORM);
  const valuesRef = useRef<TaskFormValues | null>(values);
  valuesRef.current = values;
  const [errors, setErrors] = useState<TaskFormErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const id = (key: string) => `${uid}-${key}`;

  const errorId = (key: string) => `${uid}-${key}-error`;

  const aria = (key: keyof TaskFormValues) => ({
    "aria-invalid": errors[key] ? (true as const) : undefined,
    "aria-describedby": errors[key] ? errorId(key) : undefined,
  });

  function focusField(name: string) {
    const el = formRef.current?.elements.namedItem(name);
    if (el instanceof HTMLElement) el.focus();
  }

  function focusFirstError(found: TaskFormErrors) {
    const first = FIELD_ORDER.find((k) => found[k]);
    if (first) focusField(first);
  }

  const mutation = useMutation({
    mutationFn: createTask,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: TASKS_QUERY_KEY });
      valuesRef.current = EMPTY_TASK_FORM;
      setValues(EMPTY_TASK_FORM);
      setErrors({});
      setFormError(null);
      setSaved(true);
      focusField("title");
    },
    onError: (err) => {
      const { form, fields } = parseServerErrors(err);
      setErrors(fields);
      setFormError(form);
      focusFirstError(fields);
    },
  });

  function update(patch: Partial<TaskFormValues>) {
    const next = { ...values, ...patch };
    valuesRef.current = next;
    setValues(next);
    setSaved(false);
    setFormError(null);
    setErrors((prev) => {
      const shown = Object.keys(prev) as (keyof TaskFormValues)[];
      if (!shown.length) return prev;
      const fresh = validateTask(next);
      const kept: TaskFormErrors = {};
      for (const k of shown) if (fresh[k]) kept[k] = fresh[k];
      return kept;
    });
  }

  function validateField(key: keyof TaskFormValues) {
    const message = validateTask(values)[key];
    setErrors((prev) => {
      const next = { ...prev };
      if (message) next[key] = message;
      else delete next[key];
      return next;
    });
  }

  function toggleAllDay(checked: boolean) {
    // date and datetime-local inputs use different value formats
    const dueDate = checked
      ? values.dueDate.slice(0, 10)
      : values.dueDate
        ? `${values.dueDate}T09:00`
        : "";
    update({ calendarAllDay: checked, dueDate });
  }

  function onSubmit(e: any) {
    e.preventDefault();
    if (mutation.isPending) return;

    const found = validateTask(values);
    setErrors(found);
    setSaved(false);
    if (Object.keys(found).length) {
      setFormError(null);
      focusFirstError(found);
      return;
    }
    setFormError(null);
    mutation.mutate(toTaskPayload(values));
  }

  const now = new Date();
  const minuteKey = Math.floor(now.getTime() / 60_000);
  const minDue = useMemo(
    () => dateTimeInputToCalendarDate(toLocalInputValue(now, true)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [minuteKey],
  );

  const dueValue = useMemo(
    () => (values.dueDate ? dateTimeInputToCalendarDate(values.dueDate) : null),
    [values.dueDate],
  );

  const handleDueDateChange = useCallback((date: DateValue | null) => {
    const previous = valuesRef.current ?? EMPTY_TASK_FORM;
    const datePart = date?.toString() ?? "";
    const nextValues: TaskFormValues = {
      ...previous,
      dueDate: !datePart
        ? ""
        : previous.calendarAllDay
          ? datePart.slice(0, 10)
          : `${datePart.slice(0, 10)}T${dateTimeInputToTime(previous.dueDate)}`,
    };
    valuesRef.current = nextValues;
    setValues(nextValues);
    setSaved(false);
    setFormError(null);
    setErrors((shownErrors) => {
      if (!Object.keys(shownErrors).length) return shownErrors;
      const fresh = validateTask(nextValues);
      const kept: TaskFormErrors = {};
      for (const key of Object.keys(shownErrors) as (keyof TaskFormErrors)[]) {
        if (fresh[key]) kept[key] = fresh[key];
      }
      return kept;
    });
  }, []);

  const datePickerClassName = useMemo(
    () => twMerge(controlClass(!!errors.dueDate) + " border-0 p-0"),
    [errors.dueDate],
  );
  const dueTime = values.dueDate
    ? dateTimeInputToTime(values.dueDate)
    : "09:00";

  function handleDueTimeChange(time: string) {
    if (!time || values.calendarAllDay) return;
    const datePart = values.dueDate.slice(0, 10);
    if (!datePart) return;
    update({ dueDate: `${datePart}T${time}` });
  }

  const titleLen = useMemo(() => values.title.trim().length, [values.title]);

  const descLen = useMemo(
    () => values.description.trim().length,
    [values.description],
  );

  return (
    <form
      ref={formRef}
      noValidate
      onSubmit={onSubmit}
      className="flex min-h-0 flex-1 flex-col gap-3"
    >
      <h2 className="font-heading text-[14px] leading-[normal] tracking-[-0.01em] text-(--text-secondary)">
        New task
      </h2>

      <div className="scrollbar-hide grid min-h-0 flex-1 content-start gap-4 overflow-y-auto pr-1">
        <Field
          htmlFor={id("title")}
          label="Title"
          error={errors.title}
          errorId={errorId("title")}
          aside={
            <Counter
              value={titleLen}
              max={TASK_LIMITS.titleMax}
            />
          }
        >
          <input
            id={id("title")}
            name="title"
            type="text"
            autoComplete="off"
            placeholder="e.g. Finish chapter 4 exercises"
            value={values.title}
            onChange={(e) => update({ title: e.target.value })}
            onBlur={() => validateField("title")}
            className={controlClass(!!errors.title)}
            {...aria("title")}
          />
        </Field>

        <Field
          htmlFor={id("description")}
          label="Description"
          optional
          error={errors.description}
          errorId={errorId("description")}
          aside={
            <Counter
              value={descLen}
              max={TASK_LIMITS.descriptionMax}
            />
          }
        >
          <textarea
            id={id("description")}
            name="description"
            rows={3}
            placeholder="Add details, links or what “done” looks like"
            value={values.description}
            onChange={(e) => update({ description: e.target.value })}
            onBlur={() => validateField("description")}
            className={`${controlClass(!!errors.description)} resize-none`}
            {...aria("description")}
          />
        </Field>

        <div className="grid gap-1.5">
          <span className="text-sm leading-[normal]">Due</span>
          <div className="grid grid-cols-2 gap-2">
            <Field
              htmlFor={id("dueDate")}
              label="Date"
              errorId={errorId("dueDate")}
            >
              <></>
            </Field>
            <Field
              htmlFor={id("dueTime")}
              label="Time"
              errorId={errorId("dueTime")}
            >
              <input
                id={id("dueTime")}
                name="dueTime"
                type="time"
                value={dueTime}
                disabled={values.calendarAllDay}
                onChange={(event) => handleDueTimeChange(event.target.value)}
                className={controlClass(false)}
                aria-label="Due time"
                aria-invalid={errors.dueDate ? true : undefined}
                aria-describedby={
                  errors.dueDate ? errorId("dueDate") : undefined
                }
              />
            </Field>
          </div>
          {errors.dueDate && (
            <FieldError id={errorId("dueDate")}>{errors.dueDate}</FieldError>
          )}
        </div>

        <label className="flex cursor-pointer items-center gap-2 text-sm leading-[normal]">
          <input
            type="checkbox"
            name="calendarAllDay"
            checked={values.calendarAllDay}
            onChange={(e) => toggleAllDay(e.target.checked)}
            className="size-4 cursor-pointer accent-violet-600"
          />
          All-day task
        </label>

        <fieldset className="grid gap-1.5">
          <legend className="mb-1.5 text-sm leading-[normal]">Priority</legend>
          <div className="grid grid-cols-3 gap-1.5">
            {PRIORITIES.map((p) => (
              <label
                key={p}
                className="relative"
              >
                <input
                  type="radio"
                  name="priority"
                  value={p}
                  checked={values.priority === p}
                  onChange={() => update({ priority: p })}
                  className="peer sr-only"
                />
                <span
                  className={`grid cursor-pointer place-content-center rounded-[8px] border py-2 text-sm leading-[normal] capitalize transition-colors duration-200 hover:bg-muted peer-checked:border-transparent peer-checked:bg-violet-600 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-violet-600 ${borderClass}`}
                >
                  {p}
                </span>
              </label>
            ))}
          </div>
          {errors.priority && (
            <FieldError id={errorId("priority")}>{errors.priority}</FieldError>
          )}
        </fieldset>

        <Field
          htmlFor={id("estimatedDuration")}
          label="Estimated time"
          error={errors.estimatedDuration}
          errorId={errorId("estimatedDuration")}
          aside={
            <span className="text-xs text-(--text-secondary)">minutes</span>
          }
        >
          <input
            id={id("estimatedDuration")}
            name="estimatedDuration"
            type="text"
            inputMode="numeric"
            autoComplete="off"
            value={values.estimatedDuration}
            onChange={(e) => update({ estimatedDuration: e.target.value })}
            onBlur={() => validateField("estimatedDuration")}
            className={controlClass(!!errors.estimatedDuration)}
            {...aria("estimatedDuration")}
          />
        </Field>

        <Field
          htmlFor={id("subjectId")}
          label="Subject"
          optional
          error={errors.subjectId}
          errorId={errorId("subjectId")}
          hint={
            !subjects?.length
              ? "No subjects yet. Create one to link tasks to it."
              : undefined
          }
        >
          <SubjectDropdown
            labelId={id("subjectId")}
            value={values.subjectId}
            disabled={!subjects?.length}
            invalid={!!errors.subjectId}
            onChange={(subjectId) => update({ subjectId })}
            options={[
              { value: "", label: "No subject" },
              ...(subjects ?? []).map((s) => ({
                value: s.documentId,
                label: s.name,
              })),
            ]}
          />
        </Field>
      </div>

      <footer className="grid gap-2">
        {formError && (
          <p
            role="alert"
            className="flex items-start gap-1.5 rounded-[8px] border border-rose-500/50 bg-rose-500/10 p-2 text-sm leading-[normal] text-rose-500"
          >
            <CircleAlert
              className="mt-px size-4 shrink-0"
              strokeWidth={1.75}
            />
            {formError}
          </p>
        )}
        {saved && (
          <p
            role="status"
            className="flex items-center gap-1.5 text-sm leading-[normal] text-emerald-500"
          >
            <Check
              className="size-4"
              strokeWidth={1.75}
            />
            Task created.
          </p>
        )}

        <div
          className={`grid rounded-xl pt-2 *:cursor-pointer *:place-content-center *:rounded-[8px] *:text-sm *:leading-[normal] *:transition-colors *:duration-200 *:disabled:cursor-not-allowed *:disabled:opacity-60 ${borderClass}`}
        >
          <button
            type="submit"
            disabled={mutation.isPending}
            className="bg-white py-2 text-black font-medium hover:bg-zinc-200"
          >
            {mutation.isPending ? (
              <span className="flex items-center gap-1.5">
                <Loader2 className="size-4 animate-spin" />
                Creating…
              </span>
            ) : (
              "Create task"
            )}
          </button>
        </div>
      </footer>
    </form>
  );
}

/* ------------------------------------------------------------------ */

export function Field({
  htmlFor,
  label,
  optional,
  aside,
  className,
  hint,
  error,
  errorId,
  children,
}: {
  htmlFor: string;
  className?: string;
  label: string;
  optional?: boolean;
  aside?: ReactNode;
  hint?: string;
  error?: string;
  errorId: string;
  children: ReactNode;
}) {
  return (
    <div className="grid gap-1.5">
      <div className="flex items-baseline justify-between gap-2">
        <label
          htmlFor={htmlFor}
          className="text-sm leading-[normal]"
        >
          {label}
        </label>
        {aside}
      </div>
      {children}
      {error ? (
        <FieldError id={errorId}>{error}</FieldError>
      ) : hint ? (
        <p className="text-xs leading-[normal] text-(--text-secondary)">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export function FieldError({
  id,
  children,
}: {
  id: string;
  children: ReactNode;
}) {
  return (
    <p
      id={id}
      className="text-xs font-medium indent-1 leading-[normal] text-rose-500"
    >
      {children}
    </p>
  );
}

export function Counter({ value, max }: { value: number; max: number }) {
  return (
    <span
      className={`text-xs tabular-nums ${value > max ? "text-rose-500" : "text-(--text-secondary)"}`}
    >
      {value}/{max}
    </span>
  );
}

export function SubjectDropdown({
  labelId,
  value,
  disabled,
  invalid,
  options,
  onChange,
}: {
  labelId: string;
  value: string;
  disabled: boolean;
  invalid: boolean;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
}) {
  const selected = options.find((option) => option.value === value);
  const selectedKeys = selected
    ? new Set<Key>([selected.value || "no-subject"])
    : new Set<Key>();

  return (
    <Dropdown.Root>
      <Button
        id={labelId}
        name="subjectId"
        aria-label="Subject"
        aria-invalid={invalid || undefined}
        size="md"
        color="secondary"
        iconTrailing={ChevronDown}
        isDisabled={disabled}
        className={`w-full justify-between rounded-lg px-2.5 text-left text-sm font-normal ${controlClass(invalid)}`}
      >
        <span className="truncate">{selected?.label ?? "No subject"}</span>
      </Button>
      <Dropdown.Popover
        className="max-h-64 w-64"
        style={{ zIndex: 20_000_002 }}
      >
        <Dropdown.Menu
          aria-labelledby={labelId}
          selectionMode="single"
          selectedKeys={selectedKeys}
          onSelectionChange={(selection) => {
            if (selection === "all") return;
            const [key] = selection;
            const option = options.find(
              (item) => (item.value || "no-subject") === String(key),
            );
            if (option) onChange(option.value);
          }}
        >
          {options.map((option) => (
            <Dropdown.Item
              key={option.value || "no-subject"}
              id={option.value || "no-subject"}
              textValue={option.label}
            >
              {option.label}
            </Dropdown.Item>
          ))}
        </Dropdown.Menu>
      </Dropdown.Popover>
    </Dropdown.Root>
  );
}
