import type { Filters, Subject, Task } from "~/types/tasksDashboard";
import { PRIORITY_WEIGHT, daysUntil, urgencyScore } from "./urgency";

export const DEFAULT_FILTERS: Filters = {
  search: "",
  status: "open",
  priority: "all",
  subjectId: "all",
  sort: "urgency",
};

export function hasActiveFilters(f: Filters): boolean {
  return (
    f.search.trim() !== "" ||
    f.status !== DEFAULT_FILTERS.status ||
    f.priority !== "all" ||
    f.subjectId !== "all" ||
    f.sort !== DEFAULT_FILTERS.sort
  );
}

export function applyFilters(
  tasks: Task[],
  subjects: Subject[],
  f: Filters,
  now: Date = new Date(),
): Task[] {
  const q = f.search.trim().toLowerCase();
  const subjectName = new Map(
    subjects.map((subject) => [subject.documentId, subject.name.toLowerCase()]),
  );

  const filtered = tasks.filter((t) => {
    const days = daysUntil(t.dueDate, now);
    if (f.status === "open" && t.completed) return false;
    if (f.status === "done" && !t.completed) return false;
    if (f.status === "overdue" && (t.completed || days === null || days >= 0))
      return false;
    if (f.priority !== "all" && t.priority !== f.priority) return false;
    if (
      f.subjectId !== "all" &&
      t.subject?.documentId !== f.subjectId
    )
      return false;
    if (q) {
      const haystack =
        `${t.title} ${t.description ?? ""} ${subjectName.get(t.subject?.documentId ?? "") ?? ""}`.toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    return true;
  });

  // Dates sort with "no due date" last.
  const dueTime = (t: Task) =>
    t.dueDate ? (daysUntil(t.dueDate, now) ?? Infinity) : Infinity;

  return filtered.sort((a, b) => {
    if (a.completed !== b.completed)
      return Number(a.completed) - Number(b.completed); // done sinks
    switch (f.sort) {
      case "dueDate":
        return dueTime(a) - dueTime(b);
      case "priority":
        return (
          PRIORITY_WEIGHT[b.priority] - PRIORITY_WEIGHT[a.priority] ||
          dueTime(a) - dueTime(b)
        );
      case "duration":
        return a.estimatedDuration - b.estimatedDuration;
      default:
        return urgencyScore(b, now) - urgencyScore(a, now);
    }
  });
}
