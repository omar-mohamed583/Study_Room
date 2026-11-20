import { memo, useMemo } from "react";
import { redirect } from "react-router";
import { ensureSession } from "~/auth/session";
import Header from "~/components/layout/Header";
import SideRays from "~/components/SideRays";
import AreaChartComp from "~/components/ui/global/AreaChart";
import StatsChart from "~/components/ui/global/StatsChart";
import CreateTaskForm from "~/components/ui/tasks-dashboard/CreateTaskForm";
import TasksBoard from "~/components/ui/tasks-dashboard/TasksBoard";
import {
  buildAreaChartData,
  buildCreatedTasksSeries,
  buildDailyStats,
  lastDays,
  type DayPoint,
  type DayStat,
} from "~/components/utils/dayStats";
import useStudyData from "~/context/studyDataContext";
import useTheme from "~/context/themeContext";

const MemSideRays = memo(({ theme }: { theme: "light" | "dark" }) => (
  <SideRays
    rayColor1={theme === "dark" ? "#FFC46B" : "#00bcd4"}
    rayColor2={theme === "dark" ? "#96c8ff" : "#fff"}
    origin="top-right"
    speed={2.9}
    intensity={3}
    spread={2.4}
    density={5}
    followMouse={false}
    blend={0.9}
    sharpness={0.6}
    tilt={-4}
    falloff={1.6}
    glow={1.5}
    saturation={0.6}
    dust={0}
    mouseInfluence={0.5}
    intro
    opacity={1}
  />
));

export default function Tasks() {
  const {
    tasks: { data: tasks },
    sessions: { data: sessions },
  } = useStudyData();

  const { theme } = useTheme();

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
    <>
      <div className="w-full fixed inset-0 h-187.5">
        <MemSideRays theme={theme} />
      </div>

      <Header />

      <main className="pt-25 mx-auto max-w-460 p-4 rounded-t-[30px grid-cols-1 min-[1250px]:grid-cols-4 min-[1250px]:grid-rows-[11rem_20rem_1fr] gap-3 overflow-y-auto scrollbar-thin grid backdrop-blur-xl in-[.dark]:backdrop-blur-[1px]">
        <section className="flex flex-wrap gap-3 *:flex-1 *:min-w-56 min-[1250px]:col-span-3">
          {statsChartData.map((sec) => (
            <StatsChart
              chartData={sec.chartData}
              key={sec.title}
              title={sec.title}
            />
          ))}
        </section>
        <section className="border border-[hsl(from_var(--text-primary)_h_s_l_/.16)] min-[1250px]:row-span-2 rounded-2xl [content-visibility:revert!important] flex flex-col p-3 gap-2">
          <CreateTaskForm />
        </section>
        <section className="border border-[hsl(from_var(--text-primary)_h_s_l_/.16)] min-[1250px]:col-span-3 min-h-80 min-w-0 rounded-2xl">
          <AreaChartComp chartData={areaChartData} />
        </section>
        <section className="border border-[hsl(from_var(--text-primary)_h_s_l_/.16)] min-[1250px]:col-span-4 rounded-2xl">
          <TasksBoard />
        </section>
      </main>
    </>
  );
}

export const clientMiddleware = [authMiddleware];

async function authMiddleware() {
  const accessToken = await ensureSession();
  if (!accessToken) throw redirect("/login");
}
