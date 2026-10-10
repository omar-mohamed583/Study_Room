const BONE = "animate-pulse motion-reduce:animate-none bg-zinc-400/30";

// Varied label widths so the rows don't look like a stamped pattern
const LABEL_WIDTHS = ["w-28", "w-20", "w-32", "w-24", "w-16"];

export function ProgressBarSkeleton({
  labelWidth = "w-24",
}: {
  labelWidth?: string;
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between gap-4 text-sm">
        {/* Subject name */}
        <div className={`${BONE} h-4 ${labelWidth} rounded`} />
        {/* Percentage */}
        <div className={`${BONE} h-4 w-9 shrink-0 rounded`} />
      </div>

      {/* Track */}
      <div className={`${BONE} h-3.5 w-full rounded-full`} />
    </div>
  );
}

export default function ProgressBarsSkeleton({
  count = 5,
  className = "",
}: {
  count?: number;
  className?: string;
}) {
  return (
    <div
      aria-hidden="true"
      className={["grid gap-5", className].filter(Boolean).join(" ")}
    >
      {Array.from({ length: count }).map((_, i) => (
        <ProgressBarSkeleton
          key={i}
          labelWidth={LABEL_WIDTHS[i % LABEL_WIDTHS.length]}
        />
      ))}
    </div>
  );
}
