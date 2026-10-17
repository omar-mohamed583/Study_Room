import SectionCard from "~/components/layout/focus-sessions/SectionCard";
import FocusTimerSkeleton from "./FocusTimerSkeleton";

const BONE = "animate-pulse motion-reduce:animate-none bg-zinc-400/30";

export default function FocusTimerPageSkeleton() {
  return (
    <div aria-busy="true" className="grid gap-6">
      <span role="status" className="sr-only">
        Loading focus timer
      </span>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_26rem]">
        <SectionCard
          title="Statistics"
          description="Based on your completed focus sessions."
          className="order-2 lg:order-1"
        >
          <ul className="grid flex-1 grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-2">
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
        </SectionCard>

        <SectionCard
          title="Timer"
          description="Choose a mode, then press play."
          className="order-1 lg:order-2"
        >
          <div className="flex flex-1 flex-col items-center justify-center gap-1">
            <FocusTimerSkeleton size="sm" />
            <span className={`${BONE} h-3 w-56 max-w-full rounded`} />
          </div>
        </SectionCard>
      </div>

      <SectionCard
        title="Completed Sessions"
        description="Every finished focus timer and break, newest first."
      >
        <div className="overflow-hidden rounded-2xl border">
          <div className="h-11 bg-muted/50" />
          <div className="divide-y">
            {Array.from({ length: 5 }, (_, index) => (
              <div key={index} className="flex items-center gap-6 px-4 py-4">
                <span className={`${BONE} h-6 w-24 rounded-full`} />
                <span className={`${BONE} h-4 w-1/5 rounded`} />
                <span className={`${BONE} h-4 w-1/4 rounded`} />
                <span className={`${BONE} ml-auto h-4 w-1/6 rounded`} />
              </div>
            ))}
          </div>
        </div>
      </SectionCard>
    </div>
  );
}
