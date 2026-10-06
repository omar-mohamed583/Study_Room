import { Link } from "react-router";
import type {
  Deadline,
  DeadlineKind,
  Priority,
  Urgency,
} from "~/types/deadlines";
import {
  formatDuration,
  formatMonth,
  formatTime,
  getDueStatus,
  pluralize,
} from "../utils/deadlines";

const URGENCY_STYLES: Record<Urgency, { tile: string; label: string }> = {
  overdue: {
    tile: "bg-red-600/70",
    label: "stroke-white",
  },
  today: {
    tile: "bg-(--accent-200)/70",
    label: "stroke-white",
  },
  soon: {
    tile: "bg-(--accent-300)/70",
    label: "stroke-white",
  },
  later: {
    tile: "bg-(--stripping-color)/70",
    label: "stroke-white",
  },
};

const KIND_STYLES: Record<
  DeadlineKind,
  { label: string; timePrefix: string; badge: string }
> = {
  task: {
    label: "Task",
    timePrefix: "Due",
    badge:
      "bg-purple-400/15 text-purple-700 border-current/50 border dark:text-purple-300",
  },
  exam: {
    label: "Exam",
    timePrefix: "Starts",
    badge:
      "bg-blue-400/15 text-blue-700 border-current/50 border dark:text-blue-300",
  },
};

const PRIORITY_DOT: Record<Priority, string> = {
  low: "bg-green-400",
  medium: "bg-yellow-400",
  high: "bg-red-500",
};

export default function DeadlineItem({ deadline }: { deadline: Deadline }) {
  const { kind, title, subject, date, href, priority, duration, topicsCount } =
    deadline;

  const status = getDueStatus(date);
  const urgency = URGENCY_STYLES[status.urgency];
  const kindStyle = KIND_STYLES[kind];

  return (
    <Link
      to={href}
      className="group flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-(--stripping-color)/40 focus-visible:bg-(--stripping-color)/40 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-(--accent-100) sm:gap-4 sm:px-5"
    >
      {/* Kind SVG */}
      <div
        className={`grid size-12 shrink-0 place-content-center gap-1 rounded-xl ${urgency.tile} backdrop-blur-2xl`}
      >
        {kind === "task" && (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#fff"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lucide lucide-list-todo preview-icon"
          >
            <path d="M13 5h8" /> <path d="M13 12h8" /> <path d="M13 19h8" />{" "}
            <path d="m3 17 2 2 4-4" />
            <rect
              x="3"
              y="4"
              width="6"
              height="6"
              rx="1"
            />
          </svg>
        )}
        {kind === "exam" && (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#fff"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lucide lucide-clipboard-list preview-icon"
          >
            <rect
              width="8"
              height="4"
              x="8"
              y="2"
              rx="1"
              ry="1"
            />
            <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
            <path d="M12 11h4" /> <path d="M12 16h4" /> <path d="M8 11h.01" />
            <path d="M8 16h.01" />
          </svg>
        )}
      </div>

      {/* Subject, title, details */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          {subject && (
            <span className="truncate text-(--text-secondary) capitalize tracking-wide [font-size:var(--sm-text)]">
              {subject}
            </span>
          )}
          <span
            className={`shrink-0 rounded-full px-2 py-0.5 text-[12px] font-medium ${kindStyle.badge} items-center leading-[normal]`}
          >
            {kindStyle.label}
          </span>
        </div>

        <h3 className="mt-0.5 truncate text-base font-semibold capitalize">
          {title}
        </h3>

        <ul className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-(--text-secondary) [font-size:11px]">
          <li>
            {kindStyle.timePrefix} {formatTime(date)}
          </li>
          {duration ? <li>Est. {formatDuration(duration)}</li> : null}
          {topicsCount ? <li>{pluralize(topicsCount, "topic")}</li> : null}
          {priority ? (
            <li className="flex items-center content-center flex-wrap gap-1.5">
              <span
                aria-hidden="true"
                className={`size-2 rounded-full ${PRIORITY_DOT[priority]}`}
              />
              <span>
                <span className="capitalize">{priority}</span> priority
              </span>
            </li>
          ) : null}
        </ul>
      </div>

      {/* Relative status */}
      <div className="flex shrink-0 items-center gap-1.5">
        <span
          className={`text-sm font-medium whitespace-nowrap text-(--text-secondary) ${urgency.label}`}
        >
          {status.label}
        </span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          className="hidden text-(--text-secondary) transition-colors group-hover:text-(--text-primary) sm:block"
        >
          <path d="m9 18 6-6-6-6" />
        </svg>
      </div>
    </Link>
  );
}
