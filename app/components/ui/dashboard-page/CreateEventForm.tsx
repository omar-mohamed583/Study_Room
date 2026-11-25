import {
  startTransition,
  useCallback,
  useId,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CircleAlert, Loader2 } from "lucide-react";
import { ChevronDown } from "@untitledui/icons";
import type { Key } from "react-aria-components";
import { Button } from "~/components/base/buttons/button";
import { Dropdown } from "~/components/base/dropdown/dropdown";
import useStudyData from "~/context/studyDataContext";
import {
  EMPTY_TASK_FORM,
  PRIORITIES,
  TASK_LIMITS,
  parseServerErrors,
  toTaskPayload,
  validateTask,
  type TaskFormErrors,
  type TaskFormValues,
} from "~/lib/taskForm";
import { DatePickerField } from "../global/date picker/DatePicker";
import useTheme from "~/context/themeContext";
import type { Theme } from "~/types/customContextType";
import NotificationModal from "../global/NotificationModal";
import { ThinkingOrb } from "thinking-orbs";

const borderClass = "border-[hsl(from_var(--text-primary)_h_s_l_/.2)]";

const controlClass = (invalid: boolean) =>
  [
    "w-full rounded-[8px] border in-[body.light]:bg-white in-[body.dark]:bg-black/30 px-2.5 py-2 text-sm leading-[normal]",
    "outline-none transition-colors duration-200 placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30",
    invalid ? "border-destructive" : borderClass,
  ].join(" ");

export default function CreateEventForm({
  values,
  errors,
  updateFunc,
  onSubmit,
  validateField,
  handleDueDateChange,
  dueValue,
  formError,
  mutation,
}: {
  values: any;
  errors: any;
  updateFunc: any;
  onSubmit: any;
  validateField: any;
  handleDueDateChange: any;
  dueValue: any;
  formError: any;
  mutation: any;
}) {
  const uid = useId();
  const formRef = useRef<HTMLFormElement>(null);
  const {
    subjects: { data: subjects },
  } = useStudyData();

  const { theme } = useTheme();

  const id = (key: string) => `${uid}-${key}`;

  const errorId = (key: string) => `${uid}-${key}-error`;

  const aria = (key: keyof TaskFormValues) => ({
    "aria-invalid": errors[key] ? (true as const) : undefined,
    "aria-describedby": errors[key] ? errorId(key) : undefined,
  });

  function toggleAllDay(checked: boolean) {
    const dueDate = checked
      ? values.dueDate.slice(0, 10)
      : values.dueDate
        ? `${values.dueDate}T09:00`
        : "";
    updateFunc({ calendarAllDay: checked, dueDate });
  }

  const titleLen = useMemo(() => values.title.trim().length, [values.title]);

  const descLen = useMemo(
    () => values.description.trim().length,
    [values.description],
  );

  return (
    <>
      <form
        ref={formRef}
        noValidate
        onSubmit={onSubmit}
        className="flex min-h-0 flex-1 flex-col gap-3 backdrop-blur-[6px]"
      >
        <h2 className="font-heading text-[14px] leading-[normal] tracking-[-0.01em]">
          New task
        </h2>

        <div className="scrollbar-hide grid min-h-0 flex-1 content-start gap-4 overflow-y-auto p-1">
          <Field
            theme={theme}
            htmlFor={id("title")}
            label="Title"
            error={errors.title}
            errorId={errorId("title")}
            aside={
              <Counter
                theme={theme}
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
              onChange={(e) => updateFunc({ title: e.target.value })}
              onBlur={() => validateField("title")}
              className={controlClass(!!errors.title)}
              {...aria("title")}
            />
          </Field>

          <Field
            theme={theme}
            htmlFor={id("description")}
            label="Description"
            optional
            error={errors.description}
            errorId={errorId("description")}
            aside={
              <Counter
                theme={theme}
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
              onChange={(e) => updateFunc({ description: e.target.value })}
              onBlur={() => validateField("description")}
              className={`${controlClass(!!errors.description)} resize-none`}
              {...aria("description")}
            />
          </Field>

          <div className="grid gap-1.5">
            <div className="grid grid-cols-2 gap-2">
              <Field
                theme={theme}
                htmlFor={id("dueDate")}
                label="Date"
                errorId={errorId("dueDate")}
                className="[anchor-name:--due]"
              >
                <DatePickerField
                  showTimePicker
                  onChange={handleDueDateChange}
                  value={dueValue}
                />
              </Field>
            </div>
            {errors.dueDate && (
              <FieldError id={errorId("dueDate")}>{errors.dueDate}</FieldError>
            )}
          </div>

          <label className="flex select-none cursor-pointer items-center gap-2 text-sm leading-[normal]">
            <input
              type="checkbox"
              name="calendarAllDay"
              checked={values.calendarAllDay}
              onChange={(e) => toggleAllDay(e.target.checked)}
              className="size-4 cursor-pointer accent-primary"
            />
            All-day task
          </label>

          <fieldset className="grid gap-1.5">
            <legend
              className={`mb-1.5 text-sm leading-[normal] text-(--text-secondary) ${
                theme === "dark"
                  ? "text-shadow-sm text-shadow-black/60 text-gray-300"
                  : ""
              }`}
            >
              Priority
            </legend>
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
                    onChange={() => updateFunc({ priority: p })}
                    className="peer sr-only"
                  />
                  <span
                    className={`grid cursor-pointer place-content-center rounded-[8px] border py-2 text-sm leading-[normal] capitalize transition-colors duration-200 peer-checked:border-transparent peer-checked:bg-(--text-primary) peer-checked:text-(--contrast-text) peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-ring ${borderClass}`}
                  >
                    {p}
                  </span>
                </label>
              ))}
            </div>
            {errors.priority && (
              <FieldError id={errorId("priority")}>
                {errors.priority}
              </FieldError>
            )}
          </fieldset>

          <Field
            theme={theme}
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
              onChange={(e) =>
                updateFunc({ estimatedDuration: e.target.value })
              }
              onBlur={() => validateField("estimatedDuration")}
              className={controlClass(!!errors.estimatedDuration)}
              {...aria("estimatedDuration")}
            />
          </Field>

          <Field
            theme={theme}
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
              onChange={(subjectId) => updateFunc({ subjectId })}
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
              className="flex items-start gap-1.5 rounded-[8px] border border-destructive/40 bg-destructive/10 p-2 text-sm leading-[normal] text-destructive"
            >
              <CircleAlert
                className="mt-px size-4 shrink-0"
                strokeWidth={1.75}
              />
              {formError}
            </p>
          )}

          <div
            className={`grid rounded-xl pt-2 *:cursor-pointer *:place-content-center *:rounded-[8px] *:text-sm *:leading-[normal] *:transition-colors *:duration-200 *:disabled:cursor-not-allowed *:disabled:opacity-60 ${borderClass}`}
          >
            <button
              type="submit"
              disabled={mutation.isPending}
              className="bg-(--text-primary) py-2 font-medium text-(--contrast-text) hover:bg-(--text-primary)/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background text-center flex place-content-center"
            >
              {mutation.isPending ? (
                <span className="scale-200">
                  <ThinkingOrb
                    state="composing"
                    size={20}
                  />
                </span>
              ) : (
                "Create task"
              )}
            </button>
          </div>
        </footer>
      </form>
      <NotificationModal />
    </>
  );
}

/* ------------------------------------------------------------------ */

export function Field({
  htmlFor,
  label,
  theme,
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
  theme: Theme;
}) {
  return (
    <div className="grid gap-1.5">
      <div className="flex items-baseline justify-between gap-2">
        <label
          htmlFor={htmlFor}
          className={`text-sm leading-[normal] text-(--text-secondary) ${
            theme === "dark"
              ? "text-shadow-sm text-shadow-black/60 text-gray-300"
              : ""
          }`}
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
      className="text-xs font-medium indent-1 leading-[normal] text-destructive"
    >
      {children}
    </p>
  );
}

export function Counter({
  value,
  max,
  theme,
}: {
  value: number;
  max: number;
  theme: Theme;
}) {
  return (
    <span
      className={`text-xs tabular-nums ${theme === "dark" ? "tracking-wider text-shadow-sm text-shadow-black/60" : ""} ${value > max ? "text-destructive" : theme === "dark" ? "text-gray-300" : "text-(--text-secondary)"}`}
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
            startTransition(() => {
              const option = options.find(
                (item) => (item.value || "no-subject") === String(key),
              );
              if (option) onChange(option.value);
            });
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
