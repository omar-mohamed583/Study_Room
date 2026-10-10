const BONE = "animate-pulse motion-reduce:animate-none bg-zinc-400/30";

const PILL_SIZES = {
  sm: "h-7 w-[72px]",
  md: "h-9 w-[88px]",
  lg: "h-11 w-[104px]",
} as const;

export default function FocusTimerSkeleton({
  size = "md",
}: {
  size?: keyof typeof PILL_SIZES;
}) {
  return (
    <div
      aria-hidden="true"
      className="p-3 py-5 isolate rounded-2xl grid justify-center gap-9"
    >
      {/* Mode switcher (Short Break / Focus / Long Break) */}
      <div className="flex flex-col gap-2">
        <div className="flex justify-center gap-1.5">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className={`${BONE} ${PILL_SIZES[size]} rounded-[18px]`}
            />
          ))}
        </div>
      </div>

      {/* Timer circle */}
      <div className="timer aspect-square w-[clamp(130px,100%,250px)] rounded-[50%] grid place-content-center gap-2 mx-auto relative">
        {/* Ring track */}
        <svg
          viewBox="0 0 100 100"
          fill="none"
          className="absolute inset-0 size-full"
        >
          <circle
            cx="50"
            cy="50"
            r="46"
            stroke="rgba(161, 161, 170, 0.35)"
            strokeWidth="6"
          />
        </svg>

        {/* Time (MM:SS) */}
        <div className={`${BONE} mx-auto h-10 w-28 rounded-lg`} />

        {/* Mode badge */}
        <div className={`${BONE} mx-auto -mt-1 mb-1 h-6 w-20 rounded-full`} />

        {/* Start/Pause + Reset buttons */}
        <div className="flex flex-row-reverse gap-5 justify-center">
          <div className={`${BONE} size-9 rounded-full`} />
          <div className={`${BONE} size-9 rounded-full opacity-60`} />
        </div>
      </div>
    </div>
  );
}
