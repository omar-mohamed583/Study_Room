import type { Subject, Task } from "~/types/tasksDashboard";
import {
  PRIORITY_LABEL,
  daysUntil,
  dueLabel,
  urgencyLevel,
  type UrgencyLevel,
} from "~/lib/utils/urgency";
import { formatMinutes } from "~/lib/utils/tasksStats";

const DUE_STYLE: Record<UrgencyLevel, string> = {
  overdue: "font-medium text-red-600 dark:text-red-400",
  today: "font-medium text-orange-700 dark:text-orange-300",
  soon: "text-amber-700 dark:text-amber-300",
  later: "text-muted-foreground",
  none: "text-muted-foreground",
};

interface Props {
  tasks: Task[];
  subjectsById: Map<string, Subject>;
  hasAnyTasks: boolean;
  filtersActive: boolean;
  isUpdating: boolean;
  onToggle: (task: Task) => void;
  onCreate: () => void;
  onClearFilters: () => void;
}

export function TaskList({
  tasks,
  subjectsById,
  hasAnyTasks,
  filtersActive,
  isUpdating,
  onToggle,
  onCreate,
  onClearFilters,
}: Props) {
  if (tasks.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-card p-8 text-center">
        {!hasAnyTasks ? (
          <>
            <p className="text-sm text-muted-foreground">
              No tasks yet. Add your first one to start planning.
            </p>
            <button
              type="button"
              onClick={onCreate}
              className="mt-3 rounded-lg bg-(--accent-100) px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            >
              New task
            </button>
          </>
        ) : (
          <>
            <p className="text-sm text-muted-foreground">
              No tasks match these filters.
            </p>
            {filtersActive && (
              <button
                type="button"
                onClick={onClearFilters}
                className="mt-3 text-sm font-medium text-(--accent-200) underline-offset-2 hover:underline"
              >
                Clear filters
              </button>
            )}
          </>
        )}
      </div>
    );
  }

  return (
    <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
      {tasks.map((task) => {
        const subject = task.subject
          ? subjectsById.get(task.subject.documentId) ?? task.subject
          : undefined;
        const days = daysUntil(task.dueDate);

        return (
          <li
            key={task.documentId}
            className={`flex items-start gap-3 px-4 py-3.5 sm:items-center ${task.completed ? "bg-background/50" : ""}`}
          >
            <button
              type="button"
              role="checkbox"
              aria-checked={task.completed}
              aria-label={`${task.completed ? "Reopen" : "Complete"} ${task.title}`}
              disabled={isUpdating}
              onClick={() => onToggle(task)}
              className={`mt-0.5 grid size-5 shrink-0 place-items-center rounded-md border-2 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--accent-100) disabled:cursor-wait disabled:opacity-60 sm:mt-0 ${
                task.completed
                  ? "border-(--accent-100) bg-(--accent-100)"
                  : "border-zinc-400 hover:border-(--accent-100)"
              }`}
            >
              {task.completed && (
                <svg
                  aria-hidden="true"
                  className="size-3 text-white"
                  viewBox="0 0 16 16"
                  fill="none"
                >
                  <path
                    d="m3 8 3.2 3.2L13 4.5"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </button>

            <div className="min-w-0 flex-1">
              <p
                className={`truncate text-sm font-medium ${task.completed ? "text-muted-foreground line-through" : "text-foreground"}`}
              >
                {task.title}
              </p>
              <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
                {subject && (
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    <span
                      aria-hidden="true"
                      className="size-2 rounded-full"
                      style={{ backgroundColor: subject.color }}
                    />
                    {subject.name}
                  </span>
                )}
                <span
                  className={
                    task.completed
                      ? "text-muted-foreground"
                      : DUE_STYLE[urgencyLevel(days)]
                  }
                >
                  {dueLabel(days)}
                </span>
                <span className="text-muted-foreground">
                  {formatMinutes(task.estimatedDuration)}
                </span>
              </div>
            </div>

            <span className="shrink-0 rounded-full border border-border px-2.5 py-1 text-[11px] font-medium capitalize text-muted-foreground">
              {PRIORITY_LABEL[task.priority]}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
