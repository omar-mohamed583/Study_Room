import type { Deadline, Urgency } from "~/types/deadlines";
import type { Exam } from "~/types/examType";
import type { Task } from "~/types/taskType";

const LOCALE = "en";
const DAY_MS = 86_400_000;
const SOON_IN_DAYS = 2;

const relativeTime = new Intl.RelativeTimeFormat(LOCALE, { numeric: "auto" });

const startOfDay = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate());

/** Calendar days from `now` to `date` (0 = today). Rounded so DST changes don't skew it. */
const daysUntil = (date: Date, now: Date) =>
  Math.round((startOfDay(date).getTime() - startOfDay(now).getTime()) / DAY_MS);

export const formatTime = (date: Date) =>
  date.toLocaleTimeString(LOCALE, { hour: "numeric", minute: "2-digit" });

export const formatMonth = (date: Date) =>
  date.toLocaleDateString(LOCALE, { month: "short" });

export const pluralize = (count: number, word: string) =>
  `${count} ${word}${count === 1 ? "" : "s"}`;

/** 45 -> "45 min", 90 -> "1h 30m", 120 -> "2h" */
export function formatDuration(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (!hours) return `${rest} min`;
  return rest ? `${hours}h ${rest}m` : `${hours}h`;
}

/** "Overdue", "Today", "Tomorrow", "In 3 days", "In 2 weeks"... plus a bucket for styling. */
export function getDueStatus(
  date: Date,
  now = new Date(),
): { urgency: Urgency; label: string } {
  if (date < now) return { urgency: "overdue", label: "Overdue" };

  const days = daysUntil(date, now);
  const text =
    days < 14
      ? relativeTime.format(days, "day")
      : relativeTime.format(Math.round(days / 7), "week");

  return {
    urgency: days === 0 ? "today" : days <= SOON_IN_DAYS ? "soon" : "later",
    label: text.charAt(0).toUpperCase() + text.slice(1),
  };
}

/** Open tasks that have a due date. Overdue ones stay in so they get flagged. */
function taskToDeadline(task: Task): Deadline | null {
  if (task.completed || !task.dueDate) return null;

  return {
    key: `task-${task.id}`,
    kind: "task",
    title: task.title,
    subject: task?.subject?.name,
    date: new Date(task.dueDate),
    href: `/tasks/${task.id}`,
    priority: task.priority ?? undefined,
    duration: task.estimatedDuration ?? undefined,
  };
}

/** Exams that haven't started yet. */
function examToDeadline(exam: Exam, now: Date): Deadline | null {
  const date = new Date(exam.examDate);
  if (date < now) return null;

  return {
    key: `exam-${exam.id}`,
    kind: "exam",
    title: exam.title,
    subject: exam.subject?.name,
    date,
    href: `/exams/${exam.id}`,
    topicsCount: exam.exam_topics?.length,
  };
}

/** Merge tasks and exams into one list, soonest first. */
export function buildDeadlines(
  tasks: Task[],
  exams: Exam[],
  now = new Date(),
): Deadline[] {
  if (!tasks.length || !exams.length) {
    console.warn(`no Lengths:\ntasks: ${tasks}\nexams: ${exams}`)
    return [];
  }

  return [
    ...tasks?.map(taskToDeadline),
    ...exams?.map((exam) => examToDeadline(exam, now)),
  ]
    ?.filter((item): item is Deadline => item !== null)
    ?.sort((a, b) => a.date.getTime() - b.date.getTime());
}
