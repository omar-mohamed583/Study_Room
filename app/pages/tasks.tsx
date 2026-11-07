// Tasks.tsx (the component body)
import { useMemo, useRef } from "react";
import HeatMap from "~/components/ui/global/HeatMap";
import LoadingComponent from "~/components/ui/global/LoadingComponent";
import StatsChart from "~/components/ui/global/StatsChart";
import CreateTaskForm from "~/components/ui/TasksDashboard/CreateTaskForm";
import LaserFlow from "~/components/ui/TasksDashboard/LaserFlow";
import { buildCreatedTasksSeries, buildDailyStats, lastDays, toDayKey, buildHeatmapColumns,  type DayPoint, type DayStat } from "~/components/utils/dayStats";
import useStudyData from "~/context/studyDataContext";

const DAYS = 50;

export default function Tasks() {
  const {
    tasks: { isLoading: tasksIsLoading, data: tasks },
    sessions: { isLoading: sessionsIsLoading, data: sessions },
  } = useStudyData();
  const cardRef = useRef<HTMLDivElement | null>(null);

  const dailyStats = useMemo(
    () => buildDailyStats(tasks ?? [], sessions ?? []),
    [tasks, sessions],
  );

  const heatMapData = useMemo(
  () => buildHeatmapColumns(dailyStats),
  [dailyStats],
);

const statsChartData = useMemo(() => {
  const days = lastDays(DAYS);
  const toSeries = (pick: (stat?: DayStat) => number): DayPoint[] =>
    days.map((day) => ({ day, value: pick(dailyStats.get(day)) }));

  return [
    { title: "tasks", chartData: buildCreatedTasksSeries(tasks ?? [], DAYS) },
    {
      title: "completed",
      chartData: toSeries((s) => s?.completed.length ?? 0),
    },
    {
      title: "hours",
      chartData: toSeries(
        (s) => Math.round(((s?.focusSeconds ?? 0) / 3600) * 10) / 10,
      ),
    },
  ];
}, [dailyStats, tasks]);

  if (tasksIsLoading || sessionsIsLoading || !tasks || !sessions)
    return (
      <LoadingComponent loadingState={tasksIsLoading || sessionsIsLoading} />
    );

  return (
    <>
      <div
        style={{ position: "relative", height: "100dvh", overflow: "hidden" }}
      >
        <LaserFlow
          surfaceRef={cardRef}
          beamPosition={0.3}
          color="#f97316"
          intensity={1.5}
          flare={1}
          spread={1.5}
          spill={1.1}
          fog={0.1}
          dust={1.4}
          revealRadius={260}
          revealOpacity={0}
          beamWidth={2}
          streaks={1.4}
          dots={1.3}
          pulse={1.2}
          speed={1.95}
          seed={10}
          mouseInteraction
          intro
        />

        <section
          ref={cardRef}
          className="mx-auto grid w-full backdrop-blur-lg max-w-[min(95dvw,89rem)] p-4 absolute top-30 bottom-0 left-1/2 -translate-x-1/2 rounded-t-[30px] border border-zinc-400/5 grid-cols-4 md:grid-rows-[11rem_20rem_1fr] gap-3 overflow-y-auto scrollbar-thin"
        >
          {statsChartData.map((sec) => (
            <StatsChart
              chartData={sec.chartData}
              key={sec.title}
              title={sec.title}
            />
          ))}
          <section className="border row-span-2 rounded-2xl border-zinc-400/60 in-[.dark]:border-zinc-400/15 flex flex-col p-3 gap-2">
            <CreateTaskForm />
          </section>
          <section className="border col-span-3 grid place-content-center rounded-2xl border-zinc-400/60 in-[.dark]:border-zinc-400/15">
            <HeatMap data={heatMapData} />
          </section>
          <section className="border col-span-3 h-30 rounded-2xl border-zinc-400/60 in-[.dark]:border-zinc-400/15"></section>
        </section>
      </div>
    </>
  );
}
