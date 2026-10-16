/** The three kinds of session FocusTimer records. */
export type SessionKind = "focus" | "shortBreak" | "longBreak";

/** Value held by the history filter. */
export type SessionFilter = "all" | SessionKind;

/** A related Subject or Task as Strapi v5 returns it (flat, no `attributes` wrapper). */
export interface RawRelation {
  id?: number;
  documentId?: string;
  name?: string | null;
  title?: string | null;
}

/**
 * A study-session entry exactly as the Strapi REST API returns it. Every field is
 * optional because the page validates a record before trusting it.
 */
export interface RawStudySession {
  id: number;
  documentId?: string;
  sessionType?: string | null;
  startedAt?: string | null;
  endedAt?: string | null;
  duration?: number | string | null;
  subject?: RawRelation | null;
  task?: RawRelation | null;
}

/**
 * A validated, completed session, ready for the UI.
 * Durations are in seconds; timestamps are epoch milliseconds.
 */
export interface StudySession {
  id: number;
  kind: SessionKind;
  startedAtMs: number;
  endedAtMs: number;
  /** True when `endedAt` was missing or invalid and was derived from startedAt + duration. */
  endedAtEstimated: boolean;
  durationSeconds: number;
  subjectName: string | null;
  taskTitle: string | null;
}

export interface SessionStats {
  focusSeconds: number;
  focusCount: number;
  averageFocusSeconds: number;
  longestFocusSeconds: number;
}
