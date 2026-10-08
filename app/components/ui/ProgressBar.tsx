import { useId } from "react";
import Button from "./Button";
import EmptyState from "./EmptyState";

type BaseItem = {
  id: string | number;
  title: string;
  color?: string;
};

type PercentageItem = BaseItem & {
  percentage: number;
  value?: undefined;
  total?: undefined;
};

type ValueItem = BaseItem & {
  value: number;
  total: number;
  percentage?: undefined;
};

export type ProgressBarItem = PercentageItem | ValueItem;

function getPercentage(item: ProgressBarItem): number {
  const raw =
    item.percentage !== undefined
      ? item.percentage
      : item.total > 0
        ? (item.value / item.total) * 100
        : 0;

  // Clamp to 0-100 and guard against NaN / Infinity
  return Number.isFinite(raw) ? Math.min(100, Math.max(0, raw)) : 0;
}

/** A single progress bar: title top-left, percentage top-right, bar underneath. */
export function ProgressBar({
  item,
  decimals = 0,
}: {
  item: ProgressBarItem;
  decimals?: number;
}) {
  const labelId = useId();
  const percentage = getPercentage(item);
  const text = percentage.toFixed(decimals);

  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between gap-4 text-sm">
        <span
          id={labelId}
          className="min-w-0 text-(--text-primary) truncate font-medium"
        >
          {item.title}
        </span>
        <span className="shrink-0 tabular-nums text-(--text-primary)">
          {text}%
        </span>
      </div>

      <div
        role="progressbar"
        aria-labelledby={labelId}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Number(text)}
        className="h-3.5 w-full overflow-hidden rounded-full bg-zinc-400/30"
      >
        <div
          className="h-full rounded-full bg-(--accent-100) transition-[scale] duration-500 origin-left ease-out motion-reduce:transition-none"
          style={{ scale: `${percentage}% 1`, backgroundColor: item.color }}
        />
      </div>
    </div>
  );
}

export default function ProgressBars({
  items,
  decimals = 0,
  className = "",
}: {
  items: ProgressBarItem[];
  /** How many decimals to show in the percentage text. */
  decimals?: number;
  className?: string;
}) {
  const limit = 5;
  const inLimitItems = items?.slice(0, limit);
  const outLimitItemsCount = items?.length - inLimitItems?.length;

  return (
    <div className={["grid gap-5", className].filter(Boolean).join(" ")}>
      {!items?.length && <EmptyState emptyStateTitle="Subjects" to="subject/new" icon="subject" />}

      {inLimitItems?.map((item) => (
        <ProgressBar
          key={item.id ?? item.title}
          item={item}
          decimals={decimals}
        />
      ))}

      {outLimitItemsCount > 0 && (
        <Button
          className="self-end mt-3 max-w-fit bg-cyan-600 hover:bg-cyan-500 px-5 py-2 rounded-lg"
          navigation={{ to: "dashboard" }}
        >
          See More.. (
          {outLimitItemsCount + (outLimitItemsCount === 1 ? " item" : " items")}
          )
        </Button>
      )}
    </div>
  );
}
