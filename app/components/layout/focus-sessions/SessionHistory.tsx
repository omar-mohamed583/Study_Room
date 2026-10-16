import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  countByFilter,
  filterSessions,
  formatDateTime,
  formatDuration,
  formatEndTime,
} from "~/components/utils/studySession";
import type { SessionFilter, StudySession } from "~/types/studySessions";
import { AlertIcon, InboxIcon } from "./icons";
import SectionCard from "./SectionCard";
import SessionTypeFilter from "./SessionTypeFilter";
import { FILTER_OPTIONS, SESSION_TYPE_META } from "./SessionTypeMeta";

const ROWS_PER_STEP = 10;
const COLUMNS = [
  "Session Type",
  "Subject",
  "Task",
  "Started At",
  "Duration",
  "Ended At",
] as const;

const FOCUS_RING =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--text-primary)";
const SECONDARY_BUTTON = `inline-flex h-9 items-center rounded-xl border px-3.5 text-sm font-medium hover:bg-muted/60 disabled:opacity-60 ${FOCUS_RING}`;

interface SessionHistoryProps {
  sessions: readonly StudySession[];
  isPending: boolean;
  hasError: boolean;
  isRetrying: boolean;
  onRetry: () => void;
  className?: string;
}

export default function SessionHistory({
  sessions,
  isPending,
  hasError,
  isRetrying,
  onRetry,
  className = "",
}: SessionHistoryProps) {
  const [filter, setFilter] = useState<SessionFilter>("all");
  const [visibleCount, setVisibleCount] = useState(ROWS_PER_STEP);

  const counts = useMemo(() => countByFilter(sessions), [sessions]);
  const filtered = useMemo(
    () => filterSessions(sessions, filter),
    [sessions, filter],
  );
  const visible = filtered.slice(0, visibleCount);

  const filterLabel =
    FILTER_OPTIONS.find((option) => option.value === filter)?.label ??
    "Sessions";

  function changeFilter(next: SessionFilter) {
    setFilter(next);
    setVisibleCount(ROWS_PER_STEP);
  }

  let body: ReactNode;
  if (isPending) {
    body = <HistorySkeleton />;
  } else if (hasError) {
    body = (
      <ErrorState
        onRetry={onRetry}
        isRetrying={isRetrying}
      />
    );
  } else if (sessions.length === 0) {
    body = (
      <EmptyState
        title="No completed sessions yet"
        description="Finish a focus timer or a break and it will show up here."
      />
    );
  } else if (filtered.length === 0) {
    body = (
      <EmptyState
        title={`No ${filterLabel.toLowerCase()} yet`}
        description="Complete one and it will show up here."
        action={
          <button
            type="button"
            className={SECONDARY_BUTTON}
            onClick={() => changeFilter("all")}
          >
            Show All Sessions
          </button>
        }
      />
    );
  } else {
    body = (
      <>
        <div
          role="region"
          aria-label="Completed sessions"
          tabIndex={0}
          className={`relative overflow-x-auto rounded-2xl border ${FOCUS_RING}`}
        >
          <table className="w-full min-w-[44rem] text-left text-sm">
            <caption className="sr-only">
              Completed focus timers and breaks, newest first
            </caption>
            <thead className="bg-muted/50 text-(--text-secondary)">
              <tr>
                {COLUMNS.map((column) => (
                  <th
                    key={column}
                    scope="col"
                    className="px-4 py-3 font-medium whitespace-nowrap"
                  >
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y">
              {visible.map((session) => (
                <SessionRow
                  key={session.id}
                  session={session}
                />
              ))}
            </tbody>
          </table>
        </div>

        {filtered.length > visibleCount && (
          <div className="mt-4 flex items-center justify-between gap-3 text-sm">
            <p className="text-(--text-secondary)">
              Showing {visibleCount} of {filtered.length}
            </p>
            <button
              type="button"
              className={SECONDARY_BUTTON}
              onClick={() => setVisibleCount((count) => count + ROWS_PER_STEP)}
            >
              Show more
            </button>
          </div>
        )}

        <p
          role="status"
          className="sr-only"
        >
          {filter === "all"
            ? `${filtered.length} sessions shown`
            : `${filtered.length} ${filterLabel.toLowerCase()} shown`}
        </p>
      </>
    );
  }

  return (
    <SectionCard
      title="Completed Sessions"
      description="Every finished focus timer and break, newest first."
      className={className}
      action={
        sessions.length > 0 && !isPending && !hasError ? (
          <SessionTypeFilter
            value={filter}
            onChange={changeFilter}
            counts={counts}
          />
        ) : undefined
      }
    >
      {body}
    </SectionCard>
  );
}

function SessionRow({ session }: { session: StudySession }) {
  const meta = SESSION_TYPE_META[session.kind];

  return (
    <tr className="hover:bg-muted/50">
      <td className="px-4 py-3 whitespace-nowrap">
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${meta.badge}`}
        >
          <span
            aria-hidden="true"
            className={`size-1.5 rounded-full ${meta.dot}`}
          />
          {meta.label}
        </span>
      </td>
      <td className="px-4 py-3">
        <Relation value={session.subjectName} />
      </td>
      <td className="px-4 py-3">
        <Relation value={session.taskTitle} />
      </td>
      <td className="px-4 py-3 whitespace-nowrap text-(--text-secondary)">
        {formatDateTime(session.startedAtMs)}
      </td>
      <td className="px-4 py-3 font-medium whitespace-nowrap">
        {formatDuration(session.durationSeconds, { showSeconds: true })}
      </td>
      <td className="px-4 py-3 whitespace-nowrap text-(--text-secondary)">
        <span
          title={
            session.endedAtEstimated
              ? "Calculated from the start time and duration"
              : undefined
          }
        >
          {formatEndTime(session.startedAtMs, session.endedAtMs)}
        </span>
      </td>
    </tr>
  );
}

// Subject and Task are optional relations: show a dash instead of breaking the row.
function Relation({ value }: { value: string | null }) {
  if (!value) {
    return (
      <>
        <span
          aria-hidden="true"
          className="text-(--text-secondary)"
        >
          —
        </span>
        <span className="sr-only">None</span>
      </>
    );
  }
  return (
    <span
      className="block max-w-56 truncate"
      title={value}
    >
      {value}
    </span>
  );
}

function HistorySkeleton() {
  return (
    <div
      aria-busy="true"
      className="relative overflow-hidden rounded-2xl border"
    >
      <span
        role="status"
        className="sr-only"
      >
        Loading sessions
      </span>
      <div className="h-11 bg-muted/50" />
      <div className="divide-y">
        {Array.from({ length: 5 }, (_, index) => (
          <div
            key={index}
            className="flex items-center gap-6 px-4 py-4"
          >
            <span className="h-6 w-24 rounded-full bg-foreground/10 motion-safe:animate-pulse" />
            <span className="h-4 w-1/5 rounded bg-foreground/10 motion-safe:animate-pulse" />
            <span className="h-4 w-1/4 rounded bg-foreground/10 motion-safe:animate-pulse" />
            <span className="ml-auto h-4 w-1/6 rounded bg-foreground/10 motion-safe:animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}

function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed px-6 py-12 text-center">
      <span className="grid size-11 place-items-center rounded-full bg-muted text-(--text-secondary)">
        <InboxIcon />
      </span>
      <div>
        <p className="font-medium">{title}</p>
        <p className="mt-1 text-sm text-(--text-secondary)">{description}</p>
      </div>
      {action}
    </div>
  );
}

function ErrorState({
  onRetry,
  isRetrying,
}: {
  onRetry: () => void;
  isRetrying: boolean;
}) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center gap-4 rounded-2xl border border-dashed px-6 py-12 text-center"
    >
      <span className="grid size-11 place-items-center rounded-full bg-red-500/10 text-red-600 dark:text-red-300">
        <AlertIcon />
      </span>
      <div>
        <p className="font-medium">Couldn’t load your sessions</p>
        <p className="mt-1 text-sm text-(--text-secondary)">
          Check your connection, then try again.
        </p>
      </div>
      <button
        type="button"
        className={SECONDARY_BUTTON}
        onClick={onRetry}
        disabled={isRetrying}
      >
        {isRetrying ? "Trying again…" : "Try again"}
      </button>
    </div>
  );
}
