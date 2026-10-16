import type {
  RawRelation,
  RawStudySession,
  SessionFilter,
  SessionKind,
  SessionStats,
  StudySession,
} from "~/types/studySession";

/* -------------------------------------------------------------------------- */
/* Turning Strapi records into validated sessions                             */
/* -------------------------------------------------------------------------- */

// FocusTimer saves focusTimer / shortBreak / longBreak. The spaced and short
// spellings are accepted too, so the page survives a renamed enum value.
const KIND_ALIASES = new Map<string, SessionKind>([
  ["focus", "focus"],
  ["focustimer", "focus"],
  ["shortbreak", "shortBreak"],
  ["longbreak", "longBreak"],
]);

function parseKind(value: unknown): SessionKind | null {
  if (typeof value !== "string") return null;
  return KIND_ALIASES.get(value.toLowerCase().replace(/[\s_-]+/g, "")) ?? null;
}

function parseTime(value: unknown): number | null {
  if (typeof value !== "string" || value === "") return null;
  const ms = Date.parse(value);
  return Number.isNaN(ms) ? null : ms;
}

function relationLabel(
  relation: RawRelation | null | undefined,
): string | null {
  for (const candidate of [relation?.name, relation?.title]) {
    if (typeof candidate === "string" && candidate.trim() !== "") {
      return candidate.trim();
    }
  }
  return null;
}

/**
 * Returns a completed session, or null when the record can't be trusted.
 *
 * A session counts as completed when it has a known type, a valid `startedAt` and
 * a positive `duration`. That mirrors FocusTimer, which only saves a session once
 * its countdown reaches zero. `endedAt` is optional: it is used when present and
 * not before `startedAt`, otherwise it is derived from `startedAt + duration`.
 *
 * `duration` is read as seconds, the unit FocusTimer saves.
 */
export function normalizeSession(raw: RawStudySession): StudySession | null {
  const kind = parseKind(raw.sessionType);
  const startedAtMs = parseTime(raw.startedAt);
  const durationSeconds = Number(raw.duration);

  if (
    kind === null ||
    startedAtMs === null ||
    !Number.isFinite(durationSeconds) ||
    durationSeconds <= 0
  ) {
    return null;
  }

  const reportedEndMs = parseTime(raw.endedAt);
  const hasValidEnd = reportedEndMs !== null && reportedEndMs >= startedAtMs;

  return {
    id: raw.id,
    kind,
    startedAtMs,
    endedAtMs: hasValidEnd
      ? reportedEndMs
      : startedAtMs + durationSeconds * 1000,
    endedAtEstimated: !hasValidEnd,
    durationSeconds,
    subjectName: relationLabel(raw.subject),
    taskTitle: relationLabel(raw.task),
  };
}

/* -------------------------------------------------------------------------- */
/* Statistics and filtering                                                   */
/* -------------------------------------------------------------------------- */

export function computeStats(sessions: readonly StudySession[]): SessionStats {
  let focusSeconds = 0;
  let focusCount = 0;
  let longestFocusSeconds = 0;

  for (const session of sessions) {
    if (session.kind !== "focus") continue;
    focusSeconds += session.durationSeconds;
    focusCount += 1;
    longestFocusSeconds = Math.max(
      longestFocusSeconds,
      session.durationSeconds,
    );
  }

  return {
    focusSeconds,
    focusCount,
    averageFocusSeconds: focusCount > 0 ? focusSeconds / focusCount : 0,
    longestFocusSeconds,
  };
}

export function countByFilter(
  sessions: readonly StudySession[],
): Record<SessionFilter, number> {
  const counts: Record<SessionFilter, number> = {
    all: sessions.length,
    focus: 0,
    shortBreak: 0,
    longBreak: 0,
  };
  for (const session of sessions) counts[session.kind] += 1;
  return counts;
}

export function filterSessions(
  sessions: readonly StudySession[],
  filter: SessionFilter,
): readonly StudySession[] {
  return filter === "all"
    ? sessions
    : sessions.filter((session) => session.kind === filter);
}

/* -------------------------------------------------------------------------- */
/* Formatting                                                                 */
/* -------------------------------------------------------------------------- */

/**
 * 45 -> "45s", 1500 -> "25m", 5400 -> "1h 30m".
 * With `showSeconds`, durations under an hour keep their seconds (90 -> "1m 30s").
 */
export function formatDuration(
  totalSeconds: number,
  { showSeconds = false }: { showSeconds?: boolean } = {},
): string {
  const total = Math.max(0, Math.round(totalSeconds));
  if (total < 60) return `${total}s`;

  if (showSeconds && total < 3600) {
    const minutes = Math.floor(total / 60);
    const seconds = total % 60;
    return seconds === 0 ? `${minutes}m` : `${minutes}m ${seconds}s`;
  }

  const roundedMinutes = Math.round(total / 60);
  if (roundedMinutes < 60) return `${roundedMinutes}m`;

  const hours = Math.floor(roundedMinutes / 60);
  const minutes = roundedMinutes % 60;
  return minutes === 0 ? `${hours}h` : `${hours}h ${minutes}m`;
}

const dateTimeFormat = new Intl.DateTimeFormat(undefined, {
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

const dateTimeWithYearFormat = new Intl.DateTimeFormat(undefined, {
  year: "numeric",
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

const timeFormat = new Intl.DateTimeFormat(undefined, {
  hour: "numeric",
  minute: "2-digit",
});

/** "Oct 14, 10:30 AM", with the year added for dates outside the current year. */
export function formatDateTime(ms: number): string {
  const date = new Date(ms);
  const sameYear = date.getFullYear() === new Date().getFullYear();
  return (sameYear ? dateTimeFormat : dateTimeWithYearFormat).format(date);
}

/** Just the time when the session ended on the day it started, otherwise date and time. */
export function formatEndTime(startMs: number, endMs: number): string {
  const sameDay =
    new Date(startMs).toDateString() === new Date(endMs).toDateString();
  return sameDay ? timeFormat.format(endMs) : formatDateTime(endMs);
}
