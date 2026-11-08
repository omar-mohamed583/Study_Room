import type { Task } from "~/types/taskType";

const days = 30;

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

export function lastDays() {
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

export function buildCreatedTasksSeries(tasks: Task[]): DayPoint[] {
  const counts = new Map<string, number>();

  for (const task of tasks) {
    const key = toDayKey(task.createdAt);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  return lastDays().map((day) => ({ day, value: counts.get(day) ?? 0 }));
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

export const fromDayKey = (key: string) => {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
};

export type AreaPoint = { date: Date; created: number; completed: number };

export function buildAreaChartData(
  tasksArr: DayPoint[],
  completionArr: DayPoint[],
): AreaPoint[] {
  const completedByDay = new Map(completionArr.map((p) => [p.day, p.value]));

  return tasksArr.map(({ day, value }) => ({
    date: fromDayKey(day),
    created: value,
    completed: completedByDay.get(day) ?? 0,
  }));
}