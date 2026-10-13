const BONE = "animate-pulse motion-reduce:animate-none bg-zinc-400/30";

// Mirrors AccountContent's body: avatar row, fields, member-since, session card.
export default function AccountContentSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="grid gap-6"
    >
      {/* Avatar + name + email */}
      <div className="flex items-center gap-4">
        <div className={`${BONE} size-16 shrink-0 rounded-full`} />
        <div className="grid gap-2">
          <div className={`${BONE} h-5 w-36 rounded`} />
          <div className={`${BONE} h-3.5 w-48 max-w-full rounded`} />
        </div>
      </div>

      {/* Username + email fields */}
      <div className="grid gap-5 sm:grid-cols-2">
        {[0, 1].map((i) => (
          <div
            key={i}
            className="grid gap-2"
          >
            <div className={`${BONE} h-4 w-20 rounded`} />
            <div className={`${BONE} h-10 w-full rounded-lg`} />
          </div>
        ))}
      </div>

      {/* Member since */}
      <div className="grid gap-2">
        <div className={`${BONE} h-4 w-24 rounded`} />
        <div className={`${BONE} h-4 w-40 rounded`} />
      </div>

      {/* Session card */}
      <div className="flex items-center justify-between gap-4 rounded-xl border border-(--secondary-gray) p-4">
        <div className="grid gap-2">
          <div className={`${BONE} h-4 w-20 rounded`} />
          <div className={`${BONE} h-3.5 w-44 max-w-full rounded`} />
        </div>
        <div className={`${BONE} h-9 w-24 shrink-0 rounded-lg`} />
      </div>
    </div>
  );
}
