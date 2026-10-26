import type { Priority, Task } from "~/types/tasksDashboard";

// If you already have an urgency helper, replace the body of `urgencyScore`
// (or re-export yours). Everything else in the dashboard only calls these functions.

const DAY_MS = 86_400_000;

export const PRIORITY_WEIGHT: Record<Priority, number> = {
  high: 3,
  medium: 2,
  low: 1,
};
export const PRIORITY_LABEL: Record<Priority, string> = {
  high: "High",
  medium: "Medium",
  low: "Low",
};

export type UrgencyLevel = "overdue" | "today" | "soon" | "later" | "none";

// "2026-10-30" alone is parsed as UTC by JS, which can shift the day. Parse it as local time.
function parseDue(value: string): Date {
  return /^\d{4}-\d{2}-\d{2}$/.test(value)
    ? new Date(`${value}T00:00:00`)
    : new Date(value);
}

function startOfDay(d: Date): number {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}

/** Whole calendar days until the due date. Negative = overdue, null = no due date. */
export function daysUntil(
  dueDate: string | null,
  now: Date = new Date(),
): number | null {
  if (!dueDate) return null;
  const parsed = parseDue(dueDate);
  if (Number.isNaN(parsed.getTime())) return null;
  return Math.round((startOfDay(parsed) - startOfDay(now)) / DAY_MS);
}

export function urgencyLevel(days: number | null): UrgencyLevel {
  if (days === null) return "none";
  if (days < 0) return "overdue";
  if (days === 0) return "today";
  if (days <= 2) return "soon";
  return "later";
}

export function dueLabel(days: number | null): string {
  if (days === null) return "No due date";
  if (days < 0) return `Overdue by ${-days} ${-days === 1 ? "day" : "days"}`;
  if (days === 0) return "Due today";
  if (days === 1) return "Due tomorrow";
  return `Due in ${days} days`;
}

/**
 * Higher = more urgent. Due date dominates, priority breaks ties between similar dates.
 *  - overdue: 100+ (grows a little per day, capped at 14 so one ancient task doesn't win forever)
 *  - upcoming: 50 / (days + 1), so today = 50, tomorrow = 25, a week out ≈ 6
 *  - priority adds 10 / 20 / 30
 */
export function urgencyScore(task: Task, now: Date = new Date()): number {
  const days = daysUntil(task.dueDate, now);
  let due = 0;
  if (days !== null)
    due = days < 0 ? 100 + Math.min(-days, 14) : 50 / (days + 1);
  return due + PRIORITY_WEIGHT[task.priority] * 10;
}

/** The single task to recommend: most urgent open task; shorter wins a tie. */
export function pickNextTask(
  tasks: Task[],
  now: Date = new Date(),
): Task | null {
  const open = tasks.filter((t) => !t.completed);
  if (open.length === 0) return null;
  return [...open].sort(
    (a, b) =>
      urgencyScore(b, now) - urgencyScore(a, now) ||
      a.estimatedDuration - b.estimatedDuration,
  )[0];
}
