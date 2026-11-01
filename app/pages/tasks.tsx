import lightLogo from "~/assets/light-logo.svg";
import darkLogo from "~/assets/dark-logo.svg";
import type { MetaFunction } from "react-router";
import type { LinksFunction } from "react-router";
import LaserFlow from "~/components/ui/LaserFlow";
import { useMemo, useRef, type ReactNode } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  ChevronDown,
  CircleAlert,
} from "lucide-react";
import {
  AreaSparkline,
  useSparklineHover,
} from "~/components/ui/charts/sparkline";

export const links: LinksFunction = () => [
  {
    rel: "icon",
    as: "image",
    href: window.matchMedia("(prefers-color-scheme: dark)").matches
      ? darkLogo
      : lightLogo,
  },
];

export const meta: MetaFunction = () => [
  {
    title: "Study Planner - Tasks Dashboard",
  },
  {
    name: "",
    content: "",
  },
];

export default function Tasks() {
  const cardRef = useRef<null | HTMLDivElement>(null);

  const sectionInfo = useMemo(
    () => [
      {
        title: "tasks",
        children: "",
        chartData: Array.from({ length: 24 }, (_, i) => ({
          day: `Day ${i + 1}`,
          value: Math.round(4200 + 40 * i + Math.sin(i * 0.7) * 500),
        })),
      },
      {
        title: "completed",
        children: "",
        chartData: Array.from({ length: 6 }, (_, i) => ({
          day: `Day ${i + 1}`,
          value: Math.round(4200 + 40 * i + Math.sin(i * 0.7) * 500),
        })),
      },
      {
        title: "hours",
        children: "",
        chartData: Array.from({ length: 50 }, (_, i) => ({
          day: `Day ${i + 1}`,
          value: Math.round(4200 + 40 * i + Math.sin(i * 0.7) * 500),
        })),
      },
    ],
    [],
  );
  return (
    <>
      <main
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
          {sectionInfo.map((sec) => (
            <TasksChart
              chartData={sec.chartData ?? []}
              key={sec.title}
              title={sec.title}
              children={sec.children}
            />
          ))}
          <section className="border row-span-2 rounded-2xl border-zinc-400/60 in-[.dark]:border-zinc-400/15 flex flex-col p-3 gap-2">
            <div className="rounded-xl gap-2 grid grid-cols-2 border p-3 *:py-2 *:px-2.5 *:cursor-pointer *:rounded-[8px] *:transition-colors *:duration-200 *:text-sm *:leading-[normal] *:grid *:place-content-center">
              <button className="bg-rose-500 hover:bg-rose-500/70 font-heading">
                Reset
              </button>
              <button className="bg-(--accent-200) hover:bg-(--accent-200)/70">
                Create Task
              </button>
            </div>
          </section>
          <section className="border col-span-3 rounded-2xl border-zinc-400/60 in-[.dark]:border-zinc-400/15"></section>
          <section className="border col-span-3 h-30 rounded-2xl border-zinc-400/60 in-[.dark]:border-zinc-400/15"></section>
        </section>
      </main>
    </>
  );
}

type Row = { day: string; value: number };

function percentChange(from: number, to: number) {
  if (from === 0) return 0;
  return ((to - from) / Math.abs(from)) * 100;
}

type DayRatio = {
  value: number;
};

function getDayRatio(chartData: Row[]): DayRatio {
  const days = chartData.length;
  if (!days) return { value: 0 };

  const total = Math.abs(
    chartData.reduce((sum, row) => sum + (row.value - sum), 0),
  );
  const perDay = total / days;

  return {
    value: Math.round(perDay * 10) / 10,
  };
}

function TasksChart({
  title,
  chartData,
}: {
  title: string;
  children: ReactNode;
  chartData: Row[];
}) {
  const hover = useSparklineHover<Row>();
  const shown = hover.datum ?? chartData.at(-1)!;

  const change = percentChange(chartData[0]?.value, shown?.value);
  const isUp = isNaN(change) ? null : change >= 0;
  const Arrow = isUp ? ArrowUpRight : ArrowDownRight;
  const { value } = getDayRatio(chartData);

  return (
    <section className="[background:linear-gradient(to_top,oklch(82.8%_0.189_84.429/0.28),rgb(159_159_169/0.2))] in-[.dark]:[background:linear-gradient(to_top,oklch(82.8%_0.189_84.429/0.04),rgb(159_159_169/0.01))] hover:saturate-150 p-4 border border-zinc-400/60 in-[.dark]:border-zinc-400/15 backdrop-blur-md rounded-2xl transition-colors duration-200 hover:border-amber-500/90 grid gap-2">
      <header>
        <h3 className="uppercase tracking-[-0.01em] font-heading text-[14px] leading-[normal] text-(--text-secondary)">
          {title}
        </h3>
      </header>
      <main className="grid gap-4 *:flex *:justify-between *:items-center">
        <div>
          <span className="text-[40px] leading-[normal]">
            {shown?.value || 0}
          </span>
          <AreaSparkline
            className="w-1/2"
            color="#f97316"
            crosshair="gradient"
            data={
              chartData.length
                ? chartData
                : [
                    { value: 0, day: "0" },
                    { value: 0, day: "0" },
                  ]
            }
            dataKey="value"
            springConfig={{ stiffness: 600, damping: 45 }}
            {...hover.sparklineProps}
          />
        </div>

        <div>
          <span
            className={`rounded-full py-1 px-2 bg-muted in-[.dark]:bg-muted/60 text-sm leading-[normal] flex gap-0.5 items-center in-[.dark]:hover:bg-muted transition-colors duration-200 font-heading ${
              isUp
                ? "text-emerald-400 in-[.dark]:text-green-500"
                : isUp !== null
                  ? "text-rose-400 in-[.dark]:text-red-500"
                  : "text-(--text-secondary)"
            }`}
          >
            {change ? Math.abs(change).toFixed(1) : 0}%
            {change ? (
              <Arrow
                strokeWidth={1.75}
                height={15}
                width={15}
              />
            ) : (
              ""
            )}
          </span>
          <span className="text-sm leading-[normal] text-(--text-secondary)">
            {value} / day
          </span>
        </div>
      </main>
    </section>
  );
}
