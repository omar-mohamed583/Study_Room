const BONE = "animate-pulse motion-reduce:animate-none bg-zinc-400/30";

export default function DeadlineItemSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="flex items-center gap-3 px-4 py-3.5 sm:gap-4 sm:px-5"
    >
      {/* Kind tile */}
      <div className={`${BONE} size-12 shrink-0 rounded-xl`} />

      {/* Subject, title, details */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <div className={`${BONE} h-3.5 w-20 rounded`} />
          <div className={`${BONE} h-5 w-11 shrink-0 rounded-full`} />
        </div>

        <div className={`${BONE} mt-1.5 h-5 w-3/5 max-w-64 rounded`} />

        <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
          <div className={`${BONE} h-[11px] w-16 rounded`} />
          <div className={`${BONE} h-[11px] w-14 rounded`} />
          <div className={`${BONE} h-[11px] w-12 rounded`} />
          <div className={`${BONE} h-[11px] w-20 rounded`} />
        </div>
      </div>

      {/* Relative status */}
      <div className="flex shrink-0 items-center gap-1.5">
        <div className={`${BONE} h-4 w-16 rounded`} />
        <div className={`${BONE} hidden size-[18px] rounded sm:block`} />
      </div>
    </div>
  );
}
