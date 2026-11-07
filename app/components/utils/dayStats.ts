import type { Task } from "~/types/taskType";

export type HeatmapBinData = { bin: number; count: number; date: Date };
export type HeatmapColumnData = { bin: number; bins: HeatmapBinData[] };

export function buildHeatmapColumns(
  dailyStats: Map<string, DayStat>,
  weeks = 52,
  weekStartDay = 0, // 0 = Sunday ... 6 = Saturday; must match the HeatMap's weekStartDay
): HeatmapColumnData[] {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  // first day of the week that contains today, then go back (weeks - 1) weeks
  const offsetInWeek = (today.getDay() - weekStartDay + 7) % 7;
  const firstDay = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate() - offsetInWeek - (weeks - 1) * 7,
  );

  const columns: HeatmapColumnData[] = [];

  for (let c = 0; c < weeks; c++) {
    const bins: HeatmapBinData[] = [];

    for (let r = 0; r < 7; r++) {
      const date = new Date(
        firstDay.getFullYear(),
        firstDay.getMonth(),
        firstDay.getDate() + c * 7 + r,
      );
      if (date > today) break; // no cells for future days

      const seconds = dailyStats.get(toDayKey(date))?.focusSeconds ?? 0;
      bins.push({ bin: r, date, count: Math.round(seconds / 60) }); // focus minutes
    }

    columns.push({ bin: c, bins });
  }

  return columns;
}

export type DayStat = {
  completed: Task[];
  focusSeconds: number;
  focusSessions: number;
};

type SessionLike = {
  startedAt: number | string | Date;
  duration: number | string;
  sessionType: string;
};

export type DayPoint = { day: string; value: number };

export function lastDays(days: number) {
  const now = new Date();
  return Array.from({ length: days }, (_, i) =>
    toDayKey(
      new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() - (days - 1 - i),
      ),
    ),
  );
}

export function buildCreatedTasksSeries(tasks: Task[], days = 50): DayPoint[] {
  const counts = new Map<string, number>();

  for (const task of tasks) {
    const key = toDayKey(task.createdAt);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  return lastDays(days).map((day) => ({ day, value: counts.get(day) ?? 0 }));
}

const pad = (n: number) => String(n).padStart(2, "0");

export const toDayKey = (value: Date | string | number) => {
  const d = value instanceof Date ? value : new Date(value);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

export function buildDailyStats(tasks: Task[], sessions: SessionLike[]) {
  const days = new Map<string, DayStat>();

  const getDay = (key: string) => {
    let day = days.get(key);
    if (!day) {
      day = { completed: [], focusSeconds: 0, focusSessions: 0 };
      days.set(key, day);
    }
    return day;
  };

  for (const task of tasks) {
    if (task.completed && task.completedAt) {
      getDay(toDayKey(task.completedAt)).completed.push(task);
    }
  }

  for (const session of sessions) {
    if (session.sessionType !== "focusTimer") continue;
    const seconds = Number(session.duration);
    if (!Number.isFinite(seconds) || seconds <= 0) continue;

    const day = getDay(toDayKey(session.startedAt));
    day.focusSeconds += seconds;
    day.focusSessions += 1;
  }

  return days;
}
