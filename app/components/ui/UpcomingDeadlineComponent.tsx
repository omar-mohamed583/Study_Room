import { useId } from "react";
import type { Exam, Task } from "~/types/deadlines";
import { buildDeadlines, pluralize } from "../utils/deadlines";
import DeadlineItem from "./DeadlineItem";
import Button from "./Button";

interface UpcomingDeadlinesProps {
  tasks?: Task[];
  exams?: Exam[];
  limit?: number;
  className?: string;
}

export default function UpcomingDeadlines({
  tasks = [],
  exams = [],
  limit = 5,
  className = "",
}: UpcomingDeadlinesProps) {
  const headingId = useId();

  const deadlines = buildDeadlines(tasks, exams);
  const visible = deadlines.slice(0, limit);
  const hiddenCount = deadlines.length - visible.length;

  const taskCount = visible.filter((item) => item.kind === "task").length;
  const examCount = visible.length - taskCount;
  const summary = [
    taskCount ? pluralize(taskCount, "task") : null,
    examCount ? pluralize(examCount, "exam") : null,
  ]
    .filter(Boolean)
    .join(" and ");

  return (
    <section
      aria-labelledby={headingId}
      className={`overflow-hidden rounded-[14px] bg-(--sect-bg) ${className}`}
    >
      <header className="p-4 sm:px-5">
        <h2
          id={headingId}
          className="text-xl font-semibold tracking-tight flex gap-2 items-center"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lucide lucide-clock-arrow-up preview-icon"
          >
            <path d="M12 6v6l1.56.78" />
            <path d="M13.227 21.925a10 10 0 1 1 8.767-9.588" />
            <path d="m14 18 4-4 4 4" />
            <path d="M18 22v-8" />
          </svg>
          Upcoming deadlines
        </h2>
        {summary && (
          <p className="mt-1 text-(--text-secondary) [font-size:var(--sm-text)]">
            {summary}
          </p>
        )}
      </header>

      {visible.length === 0 ? (
        <EmptyState />
      ) : (
        <ul
          role="list"
          className="divide-y divide-zinc-400/40 border-t border-zinc-400/40"
        >
          {visible.map((deadline) => (
            <li key={deadline.key}>
              <DeadlineItem deadline={deadline} />
            </li>
          ))}
        </ul>
      )}

      {hiddenCount > 0 && (
        <Button
          navigation={{ to: "/calendar" }}
          className="bg-(--accent-300) hover:bg-(--accent-300)/80 text-white in-[.dark]:hover:bg-zinc-900 transition-colors duration-200 text-center px-6 in-[.dark]:bg-zinc-800 rounded-full py-3 w-full"
        >
          +{hiddenCount} more
        </Button>
      )}
    </section>
  );
}

function EmptyState() {
  return (
    <div className="grid justify-items-center gap-1 border-t border-(--secondary-gray)/40 px-6 py-12 text-center">
      <span className="mb-2 grid size-12 place-content-center rounded-full bg-(--stripping-color) text-(--text-secondary)">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M8 2v4" />
          <path d="M16 2v4" />
          <rect
            width="18"
            height="18"
            x="3"
            y="4"
            rx="2"
          />
          <path d="M3 10h18" />
          <path d="m9 16 2 2 4-4" />
        </svg>
      </span>
      <h3 className="font-semibold">Nothing due soon</h3>
      <p className="max-w-xs text-(--text-secondary) [font-size:var(--sm-text)]">
        Tasks with a due date and upcoming exams will show up here.
      </p>
    </div>
  );
}
