import { useMemo } from "react";
import type { ReactNode } from "react";
import { computeStats, formatDuration } from "~/components/utils/studySession";
import type { StudySession } from "~/types/studySessions";
import { CircleCheckIcon, ClockIcon, GaugeIcon, TrophyIcon } from "./icons";
import SectionCard from "./SectionCard";
import SessionStatsSkeleton from "~/components/skeleton/SessionStatsSkeleton";

interface SessionStatsProps {
  sessions: readonly StudySession[];
  isPending: boolean;
  hasError: boolean;
  className?: string;
}

interface Tile {
  label: string;
  icon: ReactNode;
  value: string;
}

// Same face as the timer digits, so the numbers read as one family.
const VALUE_FONT = {
  fontFamily: '"DM Mono", ui-monospace, monospace',
} as const;

export default function SessionStats({
  sessions,
  isPending,
  hasError,
  className = "",
}: SessionStatsProps) {
  const stats = useMemo(() => computeStats(sessions), [sessions]);
  const hasFocus = stats?.focusCount ?? 0 > 0;

  const tiles: Tile[] = [
    {
      label: "Total focus time",
      icon: <ClockIcon />,
      value: hasFocus ? formatDuration(stats?.focusSeconds ?? 0) : "0m",
    },
    {
      label: "Focus sessions",
      icon: <CircleCheckIcon />,
      value: String(stats?.focusCount),
    },
    {
      label: "Average session",
      icon: <GaugeIcon />,
      value: hasFocus ? formatDuration(stats?.averageFocusSeconds ?? 0) : "—",
    },
    {
      label: "Longest session",
      icon: <TrophyIcon />,
      value: hasFocus ? formatDuration(stats?.longestFocusSeconds ?? 0) : "—",
    },
  ];

  return (
    <SectionCard
      title="Statistics"
      description="Based on your completed focus sessions."
      className={className}
    >
      {isPending ? (
        <SessionStatsSkeleton />
      ) : (
        <ul
          className="grid flex-1 grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-2"
        >
          {tiles.map((tile) => (
            <li
              key={tile.label}
              className="flex min-h-28 flex-col justify-between gap-6 rounded-2xl bg-muted transition-[border-color,translate] duration-300 hover:-translate-y-2 in-[.dark]:bg-muted/55 border border-transparent hover:border-orange-500 backdrop-blur-2xl p-3 sm:p-4 hover:"
            >
              <span className="grid size-8 place-items-center rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-300">
                {tile.icon}
              </span>
              <div>
                <p className="text-sm text-(--text-secondary)">{tile.label}</p>
                <p
                  className="mt-1 text-xl font-medium tracking-tight sm:text-2xl"
                  style={VALUE_FONT}
                >
                  {hasError ? "—" : tile.value}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </SectionCard>
  );
}
