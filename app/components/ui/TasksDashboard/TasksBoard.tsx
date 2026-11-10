import { useMemo, useState } from "react";
import useStudyData from "~/context/studyDataContext";
import type { Task } from "~/types/taskType";

/* -------------------------------------------------------------------------- */
/*  Types                                                                     */
/* -------------------------------------------------------------------------- */

type Priority = Task["priority"];
type TaskStatus = "completed" | "overdue" | "pending";

type StatusFilter = "all" | "open" | "completed";
type PriorityFilter = "all" | Priority;
type DuePreset = "any" | "overdue" | "today" | "tomorrow" | "week" | "none";
type CreatedPreset = "any" | "today" | "week" | "month";

type Filters = {
  search: string;
  status: StatusFilter;
  priority: PriorityFilter;
  duePreset: DuePreset;
  dueDate: string; // "YYYY-MM-DD" from <input type="date">, "" = not set
  createdPreset: CreatedPreset;
  createdDate: string; // same format as dueDate
};

const DEFAULT_FILTERS: Filters = {
  search: "",
  status: "all",
  priority: "all",
  duePreset: "any",
  dueDate: "",
  createdPreset: "any",
  createdDate: "",
};

/* -------------------------------------------------------------------------- */
/*  Component                                                                 */
/* -------------------------------------------------------------------------- */

export default function TasksBoard() {
  const {
    tasks: { isLoading, isError, data },
  } = useStudyData();

  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);

  const visibleTasks = useMemo(
    () => (data ?? []).filter((task) => matchesFilters(task, filters)),
    [data, filters],
  );

  const total = data?.length ?? 0;
  const isFiltered = (Object.keys(DEFAULT_FILTERS) as (keyof Filters)[]).some(
    (key) => filters[key] !== DEFAULT_FILTERS[key],
  );

  const updateFilters = (patch: Partial<Filters>) =>
    setFilters((prev) => ({ ...prev, ...patch }));
  const resetFilters = () => setFilters(DEFAULT_FILTERS);

  return (
    <section className="p-4 grid gap-5">
      <BoardHeader
        shown={visibleTasks.length}
        total={total}
        canReset={isFiltered}
        onReset={resetFilters}
      />

      {total > 0 && <TaskFilters filters={filters} onChange={updateFilters} />}

      <BoardBody
        tasks={visibleTasks}
        total={total}
        isLoading={isLoading}
        isError={isError}
        onReset={resetFilters}
      />
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*  Header                                                                    */
/* -------------------------------------------------------------------------- */

function BoardHeader({
  shown,
  total,
  canReset,
  onReset,
}: {
  shown: number;
  total: number;
  canReset: boolean;
  onReset: () => void;
}) {
  return (
    <div className="flex items-center gap-3">
      <h3 className="font-heading tracking-wide text-xl leading-[normal]">
        Tasks
      </h3>

      {total > 0 && (
        <span className="rounded-full bg-muted aspect-square w-5 leading-[normal] grid place-content-center text-xs tabular-nums text-muted-foreground">
          {shown === total ? total : `${shown} of ${total}`}
        </span>
      )}

      {canReset && (
        <button
          type="button"
          onClick={
            document.startViewTransition
              ? () => document.startViewTransition(() => onReset())
              : onReset
          }
          className="ml-auto h-8 rounded-lg border px-3 text-sm transition-colors hover:bg-muted"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Filters                                                                   */
/* -------------------------------------------------------------------------- */

const CONTROL =
  "h-9 w-full rounded-lg border bg-background px-3 text-sm text-foreground outline-none transition-colors focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40 in-[.dark]:scheme-dark";

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All tasks" },
  { value: "open", label: "Not completed" },
  { value: "completed", label: "Completed" },
];

const PRIORITY_OPTIONS: { value: PriorityFilter; label: string }[] = [
  { value: "all", label: "All priorities" },
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" },
];

const DUE_OPTIONS: { value: DuePreset; label: string }[] = [
  { value: "any", label: "Any time" },
  { value: "overdue", label: "Overdue" },
  { value: "today", label: "Today" },
  { value: "tomorrow", label: "Tomorrow" },
  { value: "week", label: "Next 7 days" },
  { value: "none", label: "No due date" },
];

const CREATED_OPTIONS: { value: CreatedPreset; label: string }[] = [
  { value: "any", label: "Any time" },
  { value: "today", label: "Today" },
  { value: "week", label: "Last 7 days" },
  { value: "month", label: "Last 30 days" },
];

function TaskFilters({
  filters,
  onChange,
}: {
  filters: Filters;
  onChange: (patch: Partial<Filters>) => void;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <Field label="Name" className="sm:col-span-2">
        <input
          type="search"
          value={filters.search}
          onChange={(e) =>
            document.startViewTransition
              ? document.startViewTransition(() =>
                  onChange({ search: e.target.value })
                )
              : onChange({ search: e.target.value })
          }
          placeholder="Search tasks"
          className={CONTROL}
        />
      </Field>

      <Field label="Status">
        <select
          value={filters.status}
          onChange={(e) =>
            document.startViewTransition
              ? document.startViewTransition(() =>
                  onChange({ status: e.target.value as StatusFilter })
                )
              : onChange({ status: e.target.value as StatusFilter })
          }
          className={CONTROL}
        >
          {STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Priority">
        <select
          value={filters.priority}
          onChange={(e) =>
            document.startViewTransition
              ? document.startViewTransition(() =>
                  onChange({ priority: e.target.value as PriorityFilter })
                )
              : onChange({ priority: e.target.value as PriorityFilter })
          }
          className={CONTROL}
        >
          {PRIORITY_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </Field>

      {/* Picking a preset clears the specific date, and the other way round,
          so the two never contradict each other. */}
      <Field label="Due">
        <select
          value={filters.duePreset}
          onChange={(e) =>
            document.startViewTransition
              ? document.startViewTransition(() =>
                  onChange({
                    duePreset: e.target.value as DuePreset,
                    dueDate: "",
                  })
                )
              : onChange({ duePreset: e.target.value as DuePreset, dueDate: "" })
          }
          className={CONTROL}
        >
          {DUE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Due on">
        <input
          type="date"
          value={filters.dueDate}
          onChange={(e) =>
            document.startViewTransition
              ? document.startViewTransition(() =>
                  onChange({ dueDate: e.target.value, duePreset: "any" })
                )
              : onChange({ dueDate: e.target.value, duePreset: "any" })
          }
          className={CONTROL}
        />
      </Field>

      <Field label="Created">
        <select
          value={filters.createdPreset}
          onChange={(e) =>
            document.startViewTransition
              ? document.startViewTransition(() =>
                  onChange({
                    createdPreset: e.target.value as CreatedPreset,
                    createdDate: "",
                  })
                )
              : onChange({
                  createdPreset: e.target.value as CreatedPreset,
                  createdDate: "",
                })
          }
          className={CONTROL}
        >
          {CREATED_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Created on">
        <input
          type="date"
          value={filters.createdDate}
          onChange={(e) =>
            document.startViewTransition
              ? document.startViewTransition(() =>
                  onChange({ createdDate: e.target.value, createdPreset: "any" })
                )
              : onChange({ createdDate: e.target.value, createdPreset: "any" })
          }
          className={CONTROL}
        />
      </Field>
    </div>
  );
}

function Field({
  label,
  className = "",
  children,
}: {
  label: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <label className={`grid gap-1 text-xs text-muted-foreground ${className}`}>
      {label}
      {children}
    </label>
  );
}

function matchesFilters(task: Task, f: Filters): boolean {
  const query = f.search.trim().toLowerCase();
  if (query && !(task.title ?? "").toLowerCase().includes(query)) return false;

  if (f.status === "completed" && !task.completed) return false;
  if (f.status === "open" && task.completed) return false;

  if (f.priority !== "all" && task.priority !== f.priority) return false;

  const due = parseDate(task.dueDate);
  if (f.dueDate) {
    if (!due || toDateKey(due) !== f.dueDate) return false;
  } else if (!matchesDuePreset(task, due, f.duePreset)) {
    return false;
  }

  const created = parseDate(task.createdAt);
  if (f.createdDate) {
    if (!created || toDateKey(created) !== f.createdDate) return false;
  } else if (!matchesCreatedPreset(created, f.createdPreset)) {
    return false;
  }

  return true;
}

function matchesDuePreset(
  task: Task,
  due: Date | null,
  preset: DuePreset,
): boolean {
  switch (preset) {
    case "any":
      return true;
    case "none":
      return !due;
    case "overdue":
      return getStatus(task) === "overdue";
    default: {
      if (!due) return false;
      const diff = dayDiff(due);
      if (preset === "today") return diff === 0;
      if (preset === "tomorrow") return diff === 1;
      return diff >= 0 && diff <= 7; // "week"
    }
  }
}

function matchesCreatedPreset(
  created: Date | null,
  preset: CreatedPreset,
): boolean {
  if (preset === "any") return true;
  if (!created) return false;
  const diff = dayDiff(created); // negative = in the past
  if (preset === "today") return diff === 0;
  if (preset === "week") return diff <= 0 && diff >= -6;
  return diff <= 0 && diff >= -29; // "month"
}

/* -------------------------------------------------------------------------- */
/*  Table                                                                     */
/* -------------------------------------------------------------------------- */

// border-radius is ignored on a table that uses border-collapse, so the
// rounded outline lives on a wrapper and the table only draws the inner lines.
const TH =
  "px-4 py-2.5 text-left text-xs font-medium whitespace-nowrap text-muted-foreground border-b border-r last:border-r-0";
const TD = "px-4 py-3 align-middle border-b border-r last:border-r-0";

function BoardBody({
  tasks,
  total,
  isLoading,
  isError,
  onReset,
}: {
  tasks: Task[];
  total: number;
  isLoading: boolean;
  isError: boolean;
  onReset: () => void;
}) {
  if (isLoading) return <BoardSkeleton />;

  if (isError) {
    return (
      <BoardMessage
        title="Couldn't load your tasks"
        hint="Check your connection and reload the page."
      />
    );
  }

  if (total === 0) {
    return (
      <BoardMessage
        title="No tasks yet"
        hint="Tasks you create will show up here."
      />
    );
  }

  if (tasks.length === 0) {
    return (
      <BoardMessage
        title="No tasks match these filters"
        hint="Try a different name or date, or clear the filters."
        action={
          <button
            type="button"
            onClick={onReset}
            className="h-8 rounded-lg border px-3 text-sm transition-colors hover:bg-muted"
          >
            Clear filters
          </button>
        }
      />
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border mt-3">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead className="bg-muted in-[.dark]:bg-muted/50">
            <tr className="*:text-center">
              <th scope="col" className={`${TH} min-w-48`}>
                Title
              </th>
              <th scope="col" className={`${TH} min-w-56`}>
                Description
              </th>
              <th scope="col" className={TH}>
                Subject
              </th>
              <th scope="col" className={TH}>
                Priority
              </th>
              <th scope="col" className={TH}>
                Due
              </th>
              <th scope="col" className={TH}>
                Status
              </th>
              <th scope="col" className={TH}>
                Time spent
              </th>
              <th scope="col" className={TH}>
                Created
              </th>
            </tr>
          </thead>
          <tbody className="[&>tr:last-child>td]:border-b-0">
            {tasks.map((task) => (
              <TaskRow key={task.documentId} task={task} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function TaskRow({ task }: { task: Task }) {
  const status = getStatus(task);
  const due = parseDate(task.dueDate);
  const showTime = !task.calendarAllDay;

  return (
    <tr className="transition-colors hover:bg-muted/40 *:text-center">
      <td
        className={`${TD} font-medium ${
          task.completed ? "text-muted-foreground line-through" : ""
        }`}
      >
        <span className="line-clamp-2">{task.title}</span>
      </td>

      <td className={`${TD} text-muted-foreground`}>
        <span className="line-clamp-2 max-w-xs">
          {task.description?.trim() || "—"}
        </span>
      </td>

      <td className={TD}>
        <SubjectCell subject={task.subject} />
      </td>

      <td className={TD}>
        <PriorityBadge priority={task.priority} animate={!task.completed} />
      </td>

      <td
        className={`${TD} whitespace-nowrap ${
          status === "overdue" ? "text-rose-600 in-[.dark]:text-rose-300" : ""
        }`}
        title={due ? formatFull(due, showTime) : undefined}
      >
        {formatDate(due, showTime)}
      </td>

      <td className={TD}>
        <StatusCell task={task} status={status} />
      </td>

      <td className={TD}>
        <TimeSpent task={task} />
      </td>

      <td
        className={`${TD} whitespace-nowrap text-muted-foreground`}
        title={formatFull(task.createdAt, true)}
      >
        {formatDate(task.createdAt)}
      </td>
    </tr>
  );
}

/* -------------------------------------------------------------------------- */
/*  Cells                                                                     */
/* -------------------------------------------------------------------------- */

const BADGE_BASE =
  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium whitespace-nowrap";

const PRIORITY_STYLES: Record<
  Priority,
  { label: string; badge: string; dot: string; glow: string }
> = {
  high: {
    label: "High",
    badge:
      "border-rose-200 bg-rose-50 text-rose-700 in-[.dark]:border-rose-500/30 in-[.dark]:bg-rose-500/10 in-[.dark]:text-rose-300",
    dot: "bg-rose-500",
    glow: "shadow-[0_0_8px_2px_rgba(244,63,94,0.55)]",
  },
  medium: {
    label: "Medium",
    badge:
      "border-amber-200 bg-amber-50 text-amber-700 in-[.dark]:border-amber-500/30 in-[.dark]:bg-amber-500/10 in-[.dark]:text-amber-300",
    dot: "bg-amber-500",
    glow: "shadow-[0_0_8px_2px_rgba(245,158,11,0.55)]",
  },
  low: {
    label: "Low",
    badge:
      "border-sky-200 bg-sky-50 text-sky-700 in-[.dark]:border-sky-500/30 in-[.dark]:bg-sky-500/10 in-[.dark]:text-sky-300",
    dot: "bg-sky-500",
    glow: "shadow-[0_0_8px_2px_rgba(14,165,233,0.55)]",
  },
};

const STATUS_STYLES: Record<TaskStatus, { label: string; badge: string }> = {
  completed: {
    label: "Completed",
    badge:
      "border-emerald-200 bg-emerald-50 text-emerald-700 in-[.dark]:border-emerald-500/30 in-[.dark]:bg-emerald-500/10 in-[.dark]:text-emerald-300",
  },
  overdue: {
    label: "Overdue",
    badge:
      "border-rose-200 bg-rose-50 text-rose-700 in-[.dark]:border-rose-500/30 in-[.dark]:bg-rose-500/10 in-[.dark]:text-rose-300",
  },
  pending: {
    label: "Pending",
    badge: "bg-muted text-muted-foreground",
  },
};

/** Priority pill with a glowing dot. The ping only runs while the task is open. */
function PriorityBadge({
  priority,
  animate,
}: {
  priority: Priority;
  animate: boolean;
}) {
  const style = PRIORITY_STYLES[priority] ?? PRIORITY_STYLES.low;

  return (
    <span className={`${BADGE_BASE} ${style.badge}`}>
      <span className="relative flex size-2" aria-hidden>
        {animate && (
          <span
            className={`absolute inline-flex size-full animate-ping rounded-full opacity-60 motion-reduce:animate-none ${style.dot}`}
          />
        )}
        <span
          className={`relative inline-flex size-2 rounded-full ${style.dot} ${style.glow}`}
        />
      </span>
      {style.label}
    </span>
  );
}

function StatusCell({ task, status }: { task: Task; status: TaskStatus }) {
  const style = STATUS_STYLES[status];

  return (
    <div className="grid justify-items-start gap-1">
      <span className={`${BADGE_BASE} ${style.badge}`}>{style.label}</span>
      {status === "completed" && task.completedAt && (
        <span
          className="text-xs text-muted-foreground"
          title={formatFull(task.completedAt, true)}
        >
          {formatDate(task.completedAt)}
        </span>
      )}
    </div>
  );
}

function SubjectCell({ subject }: { subject: Task["subject"] }) {
  if (!subject) return <span className="text-muted-foreground">—</span>;

  return (
    <span className="inline-flex items-center gap-2 whitespace-nowrap">
      <span
        className={`${subject.color?.trim()?.length ? "size-2.5" : ""} rounded-full`}
        style={{ backgroundColor: subject.color }}
        aria-hidden
      />
      {subject.name}
    </span>
  );
}

/** Focus time logged against the task vs. its estimate. */
function TimeSpent({ task }: { task: Task }) {
  const logged = loggedMinutes(task);
  const estimate = task.estimatedDuration || 0;

  if (!logged && !estimate) {
    return <span className="text-muted-foreground">—</span>;
  }

  const percent =
    estimate > 0 ? Math.min(100, Math.round((logged / estimate) * 100)) : 0;

  return (
    <div className="grid min-w-28 gap-1">
      <span className="whitespace-nowrap tabular-nums">
        {formatMinutes(logged)}{" "}
        <span className="text-muted-foreground">
          / {estimate ? formatMinutes(estimate) : "no estimate"}
        </span>
      </span>
      {estimate > 0 && (
        <div className="h-1 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary"
            style={{ width: `${percent}%` }}
          />
        </div>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Empty / loading states                                                    */
/* -------------------------------------------------------------------------- */

function BoardSkeleton() {
  return (
    <div
      className="divide-y overflow-hidden rounded-xl border"
      aria-busy="true"
      aria-label="Loading tasks"
    >
      {Array.from({ length: 5 }, (_, i) => (
        <div key={i} className="h-12 animate-pulse bg-muted/60" />
      ))}
    </div>
  );
}

function BoardMessage({
  title,
  hint,
  action,
}: {
  title: string;
  hint: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="grid justify-items-center gap-1 rounded-xl border border-dashed px-4 py-10 text-center">
      <p className="font-medium">{title}</p>
      <p className="text-sm text-muted-foreground">{hint}</p>
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                   */
/* -------------------------------------------------------------------------- */

// Change this one constant to switch the language of every formatted date.
const LOCALE = "en";
const DAY_MS = 86_400_000;
const relativeFormat = new Intl.RelativeTimeFormat(LOCALE, { numeric: "auto" });

function parseDate(value: string | Date | null | undefined): Date | null {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function startOfDay(date: Date): Date {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

/** Whole calendar days from today: 0 = today, 1 = tomorrow, -1 = yesterday. */
function dayDiff(date: Date): number {
  return Math.round(
    (startOfDay(date).getTime() - startOfDay(new Date()).getTime()) / DAY_MS,
  );
}

/** Local "YYYY-MM-DD", the same format <input type="date"> gives back. */
function toDateKey(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/**
 * Today / Tomorrow / Yesterday, "In 3 days" / "3 days ago" for anything within
 * a week, and a plain date ("Nov 24", or "Nov 24, 2027" in another year) after.
 */
function formatDate(
  value: string | Date | null | undefined,
  withTime = false,
): string {
  const date = parseDate(value);
  if (!date) return "—";

  const diff = dayDiff(date);
  let label: string;

  if (Math.abs(diff) <= 6) {
    const text = relativeFormat.format(diff, "day");
    label = text.charAt(0).toUpperCase() + text.slice(1);
  } else {
    label = date.toLocaleDateString(LOCALE, {
      month: "short",
      day: "numeric",
      year: date.getFullYear() === new Date().getFullYear() ? undefined : "numeric",
    });
  }

  if (!withTime) return label;
  const time = date.toLocaleTimeString(LOCALE, {
    hour: "numeric",
    minute: "2-digit",
  });
  return `${label}, ${time}`;
}

/** Full date for tooltips, e.g. "Tue, Nov 10, 2026, 3:00 PM". */
function formatFull(
  value: string | Date | null | undefined,
  withTime = false,
): string {
  const date = parseDate(value);
  if (!date) return "";
  return date.toLocaleString(LOCALE, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    ...(withTime && { hour: "numeric", minute: "2-digit" }),
  });
}

function formatMinutes(minutes: number): string {
  const total = Math.round(minutes);
  if (total < 60) return `${total}m`;
  const h = Math.floor(total / 60);
  const m = total % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
}

function getStatus(task: Task): TaskStatus {
  if (task.completed) return "completed";

  const due = parseDate(task.dueDate);
  if (!due) return "pending";

  // All-day tasks are overdue the day after; timed ones once the time passes.
  const overdue = task.calendarAllDay
    ? dayDiff(due) < 0
    : due.getTime() < Date.now();

  return overdue ? "overdue" : "pending";
}

/** Focus sessions only (breaks don't count). Session duration is in seconds. */
function loggedMinutes(task: Task): number {
  const seconds = (task.studySessions ?? [])
    .filter((session) => session.sessionType === "focusTimer")
    .reduce((sum, session) => sum + (Number(session.duration) || 0), 0);

  return seconds / 60;
}