import lightLogo from "~/assets/light-logo.svg";
import darkLogo from "~/assets/dark-logo.svg";
import type { MetaFunction } from "react-router";
import type { LinksFunction } from "react-router";
import LaserFlow from "~/components/ui/TasksDashboard/LaserFlow";
import { useMemo, useRef } from "react";
import CreateTaskForm from "~/components/ui/TasksDashboard/CreateTaskForm";
import StatsChart from "~/components/ui/global/StatsChart";

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
          {sectionInfo.map((sec) => (
            <StatsChart
              chartData={sec.chartData ?? []}
              key={sec.title}
              title={sec.title}
              children={sec.children}
            />
          ))}
          <section className="border row-span-2 rounded-2xl border-zinc-400/60 in-[.dark]:border-zinc-400/15 flex flex-col p-3 gap-2">
            <CreateTaskForm />
          </section>
          <section className="border col-span-3 rounded-2xl border-zinc-400/60 in-[.dark]:border-zinc-400/15"></section>
          <section className="border col-span-3 h-30 rounded-2xl border-zinc-400/60 in-[.dark]:border-zinc-400/15"></section>
        </section>
      </div>
    </>
  );
}
