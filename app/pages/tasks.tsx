import { useMemo, useRef } from "react";
import { redirect } from "react-router";
import { ensureSession } from "~/auth/session";
import AreaChartComp from "~/components/ui/global/AreaChart";
import StatsChart from "~/components/ui/global/StatsChart";
import CreateTaskForm from "~/components/ui/TasksDashboard/CreateTaskForm";
import TasksBoard from "~/components/ui/TasksDashboard/TasksBoard";
import {
  buildAreaChartData,
  buildCreatedTasksSeries,
  buildDailyStats,
  lastDays,
  type DayPoint,
  type DayStat,
} from "~/components/utils/dayStats";
import useStudyData from "~/context/studyDataContext";

export default function Tasks() {
  const {
    tasks: { data: tasks },
    sessions: { data: sessions },
  } = useStudyData();

  const dailyStats = useMemo(
    () => buildDailyStats(tasks ?? [], sessions ?? []),
    [tasks, sessions],
  );

  const series = useMemo(() => {
    const days = lastDays();
    const toSeries = (pick: (stat?: DayStat) => number): DayPoint[] =>
      days.map((day) => ({ day, value: pick(dailyStats.get(day)) }));

    return {
      created: buildCreatedTasksSeries(tasks ?? []),
      completed: toSeries((s) => s?.completed.length ?? 0),
      hours: toSeries(
        (s) => Math.round(((s?.focusSeconds ?? 0) / 3600) * 10) / 10,
      ),
    };
  }, [dailyStats, tasks]);

  const statsChartData = [
    { title: "tasks", chartData: series.created },
    { title: "completed", chartData: series.completed },
    { title: "hours", chartData: series.hours },
  ];

  const areaChartData = useMemo(
    () => buildAreaChartData(series.created, series.completed),
    [series],
  );

  return (
    <section className="mx-auto max-w- p-4 rounded-t-[30px] border border-zinc-400/5 grid-cols-1 min-[1250px]:grid-cols-4 min-[1250px]:grid-rows-[11rem_20rem_1fr] gap-3 overflow-y-auto scrollbar-thin grid">
      <section className="flex flex-wrap gap-3 *:flex-1 *:min-w-56 min-[1250px]:col-span-3">
        {statsChartData.map((sec) => (
          <StatsChart
            chartData={sec.chartData}
            key={sec.title}
            title={sec.title}
          />
        ))}
      </section>
      <section className="border @container min-[1250px]:row-span-2 rounded-2xl border-zinc-400/60 in-[.dark]:border-zinc-400/15 flex flex-col p-3 gap-2">
        <CreateTaskForm />
      </section>
      <section className="border min-[1250px]:col-span-3 min-h-80 min-w-0 rounded-2xl border-zinc-400/60 in-[.dark]:border-zinc-400/15">
        <AreaChartComp chartData={areaChartData} />
      </section>
      <section className="border min-[1250px]:col-span-4 rounded-2xl border-zinc-400/60 in-[.dark]:border-zinc-400/15">
        <TasksBoard />
      </section>
    </section>
  );
}

export const clientMiddleware = [authMiddleware];

async function authMiddleware() {
  const accessToken = await ensureSession();
  if (!accessToken) throw redirect("/login");
}
