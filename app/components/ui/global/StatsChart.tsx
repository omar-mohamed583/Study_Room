import type { ReactNode } from "react";
import { AreaSparkline, useSparklineHover } from "../charts/sparkline";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";

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

  const total = Math.abs(chartData.reduce((sum, row) => sum + row.value, 0));
  const perDay = total / days;

  return {
    value: Math.round(perDay * 10) / 10,
  };
}

export default function StatsChart({
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
