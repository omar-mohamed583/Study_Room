import SectionCard from "~/components/layout/focus-sessions/SectionCard";

const BONE = "animate-pulse motion-reduce:animate-none bg-zinc-400/30";

export default function SessionStatsSkeleton({ className = "" }: { className?: string }) {
  return (
      <ul
        aria-busy="true"
        className="grid flex-1 grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-2"
      >
        {Array.from({ length: 4 }, (_, index) => (
          <li
            key={index}
            className="flex min-h-28 flex-col justify-between gap-6 rounded-2xl border border-transparent bg-muted p-3 backdrop-blur-2xl sm:p-4 in-[.dark]:bg-muted/55"
          >
            <span className={`${BONE} size-8 rounded-lg`} />
            <div>
              <span className={`${BONE} block h-4 w-28 max-w-full rounded`} />
              <span className={`${BONE} mt-2 block h-8 w-20 rounded-md`} />
            </div>
          </li>
        ))}
      </ul>
  );
}
