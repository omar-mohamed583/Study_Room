import type { Task } from "~/types/taskType";

export const TASK_LIMITS = {
  titleMin: 3,
  titleMax: 120,
  descriptionMax: 500,
  durationMin: 5, // minutes
  durationMax: 720, // minutes (12h)
} as const;

export const PRIORITIES: Task["priority"][] = ["low", "medium", "high"];

/** Everything is a string while typing; it's converted in toTaskPayload. */
export type TaskFormValues = {
  title: string;
  description: string;
  /** "" | "YYYY-MM-DD" (all-day) | "YYYY-MM-DDTHH:mm" (timed) */
  dueDate: string;
  calendarAllDay: boolean;
  priority: Task["priority"];
  estimatedDuration: string;
  /** Subject documentId, "" = no subject */
  subjectId: string;
};

export type TaskFormErrors = Partial<Record<keyof TaskFormValues, string>>;

export const EMPTY_TASK_FORM: TaskFormValues = {
  title: "",
  description: "",
  dueDate: "",
  calendarAllDay: false,
  priority: "medium",
  estimatedDuration: "30",
  subjectId: "",
};

export type NewTaskPayload = Pick<
  Task,
  | "title"
  | "description"
  | "dueDate"
  | "priority"
  | "estimatedDuration"
  | "completed"
  | "calendarAllDay"
> & { subject: string | null };

/* ------------------------------------------------------------------ */
/* Dates                                                               */
/* ------------------------------------------------------------------ */

const DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/;
const DATETIME_RE = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::\d{2})?$/;

/**
 * Parses the input value as LOCAL time. All-day tasks resolve to 23:59 of that
 * day, so a task due "today" isn't overdue at midnight.
 * Returns null for empty or invalid values (including rollovers like Feb 31).
 */
export function parseDueDate(value: string, allDay: boolean): Date | null {
  const match = (allDay ? DATE_RE : DATETIME_RE).exec(value);
  if (!match) return null;

  const [y, m, d] = [Number(match[1]), Number(match[2]), Number(match[3])];
  const hh = allDay ? 23 : Number(match[4]);
  const mm = allDay ? 59 : Number(match[5]);

  const date = new Date(y, m - 1, d, hh, mm);
  if (
    date.getFullYear() !== y ||
    date.getMonth() !== m - 1 ||
    date.getDate() !== d ||
    hh > 23 ||
    mm > 59
  ) {
    return null;
  }
  return date;
}

/** Value for <input type="date"> / <input type="datetime-local"> min attributes. */
export function toLocalInputValue(date: Date, withTime: boolean): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  const day = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  return withTime
    ? `${day}T${pad(date.getHours())}:${pad(date.getMinutes())}`
    : day;
}

/* ------------------------------------------------------------------ */
/* Validation                                                          */
/* ------------------------------------------------------------------ */

export function validateTask(
  v: TaskFormValues,
  now: Date = new Date(),
): TaskFormErrors {
  const errors: TaskFormErrors = {};
  const L = TASK_LIMITS;

  const title = v.title.trim();
  if (!title) errors.title = "Enter a title for the task.";
  else if (title.length < L.titleMin)
    errors.title = `Title needs at least ${L.titleMin} characters.`;
  else if (title.length > L.titleMax)
    errors.title = `Title is ${title.length - L.titleMax} characters too long (max ${L.titleMax}).`;

  const description = v.description.trim();
  if (description.length > L.descriptionMax)
    errors.description = `Description is ${description.length - L.descriptionMax} characters too long (max ${L.descriptionMax}).`;

  if (v.dueDate) {
    const due = parseDueDate(v.dueDate, v.calendarAllDay);
    if (!due) errors.dueDate = "Enter a valid due date.";
    else if (due.getTime() < now.getTime())
      errors.dueDate = v.calendarAllDay
        ? "Due date can't be before today."
        : "Due date and time can't be in the past.";
  } else if (v.calendarAllDay) {
    errors.dueDate = "Choose a date for an all-day task.";
  }

  const rawDuration = v.estimatedDuration.trim();
  if (!rawDuration) {
    errors.estimatedDuration = "Enter how many minutes this will take.";
  } else if (!/^\d+$/.test(rawDuration)) {
    errors.estimatedDuration = "Use whole minutes, like 45.";
  } else {
    const minutes = Number(rawDuration);
    if (minutes < L.durationMin)
      errors.estimatedDuration = `Estimate must be at least ${L.durationMin} minutes.`;
    else if (minutes > L.durationMax)
      errors.estimatedDuration = `Estimate can't exceed ${L.durationMax} minutes (${L.durationMax / 60} hours). Split it into smaller tasks.`;
  }

  if (!PRIORITIES.includes(v.priority)) errors.priority = "Choose a priority.";

  return errors;
}

/* ------------------------------------------------------------------ */
/* Payload                                                             */
/* ------------------------------------------------------------------ */

/** Call only after validateTask returned no errors. */
export function toTaskPayload(v: TaskFormValues): NewTaskPayload {
  const due = v.dueDate ? parseDueDate(v.dueDate, v.calendarAllDay) : null;
  return {
    title: v.title.trim(),
    description: v.description.trim(),
    dueDate: due ? due.toISOString() : null,
    priority: v.priority,
    estimatedDuration: Number(v.estimatedDuration),
    completed: false,
    calendarAllDay: v.calendarAllDay,
    subject: v.subjectId || null, // Strapi v5 accepts a documentId for relations
  };
}

/* ------------------------------------------------------------------ */
/* Server errors                                                       */
/* ------------------------------------------------------------------ */

const SERVER_FIELD: Record<string, keyof TaskFormValues> = {
  title: "title",
  description: "description",
  dueDate: "dueDate",
  calendarAllDay: "calendarAllDay",
  priority: "priority",
  estimatedDuration: "estimatedDuration",
  subject: "subjectId",
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Loose = Record<string, any>;

const sentence = (s: string) => {
  const t = s.trim();
  return t.charAt(0).toUpperCase() + t.slice(1) + (/[.!?]$/.test(t) ? "" : ".");
};

/**
 * Turns whatever apiFetch throws into field errors + one form-level message.
 * Handles Strapi's shape: { error: { status, message, details: { errors: [{ path, message }] } } }
 * (directly, or nested under .body / .data on the thrown error).
 */
export function parseServerErrors(err: unknown): {
  form: string | null;
  fields: TaskFormErrors;
} {
  const fields: TaskFormErrors = {};

  // fetch() rejects with a TypeError when the network is down
  if (err instanceof TypeError) {
    return {
      form: "Can't reach the server. Check your connection and try again.",
      fields,
    };
  }

  const root = (err ?? {}) as Loose;
  const body: Loose = root.body ?? root.data ?? root;
  const e: Loose = body.error ?? body;
  const status: number | undefined = e.status ?? root.status;
  const message: string =
    typeof e.message === "string"
      ? e.message
      : typeof root.message === "string"
        ? root.message
        : "";

  const details: Loose[] = Array.isArray(e.details?.errors)
    ? e.details.errors
    : [];
  for (const d of details) {
    const field = SERVER_FIELD[String(d?.path?.[0])];
    if (field && typeof d.message === "string" && !fields[field]) {
      fields[field] = sentence(d.message);
    }
  }

  // Strapi: "1 relation(s) of type api::subject.subject ... do not exist"
  if (/relation/i.test(message) && !fields.subjectId) {
    fields.subjectId =
      "This subject no longer exists. Pick another or choose none.";
  }

  if (Object.keys(fields).length) {
    return {
      form: "Some fields need attention. Fix them and try again.",
      fields,
    };
  }

  if (status === 401 || status === 403) {
    return {
      form: "Your session expired or you don't have permission. Sign in again, then retry.",
      fields,
    };
  }
  if (status === 429) {
    return { form: "Too many requests. Wait a moment and try again.", fields };
  }
  if (status && status >= 500) {
    return {
      form: "The server hit an error. Your input is still here, so try again in a moment.",
      fields,
    };
  }
  return {
    form:
      status === 400 && message
        ? sentence(message)
        : "Couldn't create the task. Try again.",
    fields,
  };
}
