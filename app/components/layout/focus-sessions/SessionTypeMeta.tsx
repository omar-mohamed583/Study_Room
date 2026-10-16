import type { SessionFilter, SessionKind } from "~/types/studySessions";

interface SessionTypeMeta {
  /** Name shown in the table's Session Type column. */
  label: string;
  /** Dot colour, matching the mode colours of the timer's mode switcher. */
  dot: string;
  /** Badge colours that stay readable in both light and dark themes. */
  badge: string;
}

export const SESSION_TYPE_META: Record<SessionKind, SessionTypeMeta> = {
  focus: {
    label: "Focus",
    dot: "bg-[#03a9f4]",
    badge: "bg-sky-500/10 text-sky-700 dark:text-sky-300",
  },
  shortBreak: {
    label: "Short Break",
    dot: "bg-[#4caf50]",
    badge: "bg-green-500/10 text-green-800 dark:text-green-300",
  },
  longBreak: {
    label: "Long Break",
    dot: "bg-[#f44336]",
    badge: "bg-red-500/10 text-red-700 dark:text-red-300",
  },
};

export const FILTER_OPTIONS: ReadonlyArray<{
  value: SessionFilter;
  label: string;
}> = [
  { value: "all", label: "All Sessions" },
  { value: "focus", label: "Focus Timers" },
  { value: "shortBreak", label: "Short Breaks" },
  { value: "longBreak", label: "Long Breaks" },
];
