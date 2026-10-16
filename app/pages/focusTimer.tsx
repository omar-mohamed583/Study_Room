import FocusTimer from "~/components/ui/FocusTimer";
import SectionCard from "~/components/layout/focus-sessions/SectionCard";
import SessionHistory from "~/components/layout/focus-sessions/SessionHistory";
import SessionStats from "~/components/layout/focus-sessions/SessionStats";
import Header from "~/components/layout/Header";

export default function FocusTimerPage() {
  const { sessions, isPending, hasError, isFetching, retry } = {
    sessions: [],
    isPending: false,
    hasError: false,
    isFetching: false,
    retry: () => false,
  };

  return (
    <>
      <Header />
      <main className="mx-auto flex w-full max-w-300 flex-col gap-6 px-4 pb-6 text-(--text-primary) sm:px-6">

        {/* Desktop: statistics left, timer right. Below lg the sections stack,
          with the timer first because it's the thing you came here to use. */}
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_26rem]">
          <SessionStats
            sessions={sessions}
            isPending={isPending}
            hasError={hasError}
            className="order-2 lg:order-1"
          />
          <SectionCard
            title="Timer"
            description="Choose a mode, then press play."
            className="order-1 lg:order-2"
          >
            <div className="flex flex-1 items-center justify-center">
              <FocusTimer size="sm" />
            </div>
          </SectionCard>
        </div>

        <SessionHistory
          sessions={sessions}
          isPending={isPending}
          hasError={hasError}
          isRetrying={isFetching}
          onRetry={retry}
        />
      </main>
    </>
  );
}
