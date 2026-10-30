import lightLogo from "~/assets/light-logo.svg";
import darkLogo from "~/assets/dark-logo.svg";
import type { MetaFunction } from "react-router";
import type { LinksFunction } from "react-router";
import LaserFlow from "~/components/ui/LaserFlow";
import { useMemo, useRef, type ReactNode } from "react";
import { ArrowDownRight, ArrowUpRight, ChevronDown } from "lucide-react";
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
        chartData: Array.from({ length: 30 }, (_, i) => ({
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
          spill={1}
          fog={0.2}
          dust={1}
          revealRadius={260}
          revealOpacity={0}
          beamWidth={2}
          streaks={1.3}
          dots={1}
          pulse={1.2}
          speed={1.95}
          seed={10}
          mouseInteraction
          intro
        />

        <section
          ref={cardRef}
          className="mx-auto grid w-full backdrop-blur-lg max-w-[min(95dvw,89rem)] p-4 absolute top-30 bottom-0 left-1/2 -translate-x-1/2 rounded-t-[30px] border border-zinc-400/5 grid-cols-4 grid-rows-3 gap-3"
        >
          {sectionInfo.map((sec) => (
            <TasksChart
              chartData={sec.chartData}
              key={sec.title}
              title={sec.title}
              children={sec.children}
            />
          ))}
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

  const change = percentChange(chartData[0].value, shown.value);
  const isUp = change >= 0;
  const Arrow = isUp ? ArrowUpRight : ArrowDownRight;

  return (
    <section className="p-4 border border-zinc-400/15 bg-muted/10 backdrop-blur-md rounded-2xl hover:bg-muted/30 transition-colors duration-200 hover:border-zinc-400/30 grid gap-2">
      <header>
        <h3 className="uppercase tracking-[-0.01em] font-heading text-[14px] leading-[normal] text-(--text-secondary)">
          {title}
        </h3>
      </header>
      <main className="grid gap-4 *:flex *:justify-between *:items-center">
        <div>
          <span className="text-[40px] leading-[normal]">{shown.value}</span>
          <AreaSparkline
            className="w-1/2"
            color="#f97316"
            crosshair="gradient"
            data={chartData}
            dataKey="value"
            springConfig={{ stiffness: 600, damping: 45 }}
            {...hover.sparklineProps}
          />
        </div>

        <div>
          <span
            className={`rounded-full py-1 px-2 bg-muted/60 text-sm leading-[normal] flex gap-0.5 items-center hover:bg-muted transition-colors duration-200 font-heading ${
              isUp ? "text-green-500" : "text-red-500"
            }`}
          >
            {Math.abs(change).toFixed(1)}%
            <Arrow
              strokeWidth={1.75}
              height={15}
              width={15}
            />
          </span>
          <span className="flex gap-1 items-center text-(--text-secondary)">
            since. 20 nov
          </span>
        </div>
      </main>
    </section>
  );
}
