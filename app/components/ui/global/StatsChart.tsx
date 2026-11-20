import { useMemo } from "react";
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
  chartData: Row[];
}) {
  const hover = useSparklineHover<Row>();
  const total = useMemo(
    () => chartData.reduce((acc: number, row: Row) => acc + row.value, 0),
    [chartData],
  );
  const shownVal = hover.datum ?? total;
  const shown = shownVal instanceof Object ? shownVal.value : shownVal;

  const change = percentChange(chartData[0]?.value, shown);
  const isUp = isNaN(change) ? null : change >= 0;
  const Arrow = isUp ? ArrowUpRight : ArrowDownRight;

  const { value } = getDayRatio(chartData);

  return (
    <section className="grid gap-2 rounded-2xl border border-zinc-500/50 in-[.dark]:border-zinc-400/30 bg-muted/10 p-4 text-card-foreground backdrop-blur-md transition-colors duration-300 hover:border-transparent in-[.dark]:hover:bg-muted/20">
      <header>
        <h3 className="uppercase tracking-[-0.01em] font-heading text-[14px] leading-[normal] text-(--text-secondary)">
          {title}
        </h3>
      </header>
      <main className="grid gap-4 *:flex *:justify-between *:items-center">
        <div>
          <span className="text-[40px] leading-[normal]">
            {(shown < 1 && shown > 0 ? shown.toFixed(1) : shown) || 0}
          </span>
          <AreaSparkline
            className="w-1/2"
            color="var(--accent-100)"
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
            className={`flex items-center gap-0.5 rounded-full bg-zinc-400/20 in-[.dark]:bg-muted px-2 py-1 text-sm leading-[normal] transition-colors duration-200 hover:bg-accent font-heading ${
              isUp
                ? "text-emerald-700 in-[.dark]:text-emerald-400"
                : isUp !== null
                  ? "text-rose-700 in-[.dark]:text-rose-400"
                  : "text-(--text-secondary)"
            }`}
          >
            {Math.round(change) !== change
              ? Math.abs(change).toFixed(1)
              : change}
            %
            {change !== 0 ? (
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
