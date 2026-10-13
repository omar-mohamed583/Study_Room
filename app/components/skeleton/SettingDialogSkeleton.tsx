const BONE = "animate-pulse motion-reduce:animate-none bg-zinc-400/30";

// Mirrors SettingsContent's body: section tabs + the first section (Appearance).
export default function SettingsContentSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="grid gap-6 md:grid-cols-[11rem_1fr]"
    >
      {/* Section tabs */}
      <div className="flex gap-1 overflow-hidden md:flex-col">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={`${BONE} h-9 w-28 shrink-0 rounded-lg md:w-full`}
          />
        ))}
      </div>

      {/* Panel */}
      <div className="min-w-0">
        <div className={`${BONE} h-4 w-16 rounded`} />
        <div className={`${BONE} mt-2 h-3 w-48 max-w-full rounded`} />

        <div className="mt-3 grid grid-cols-2 gap-3">
          {[0, 1].map((i) => (
            <div
              key={i}
              className={`${BONE} h-[6.9rem] rounded-xl`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
