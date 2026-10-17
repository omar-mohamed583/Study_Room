import { lazy, Suspense, useRef } from "react";
import FocusTimer from "~/components/ui/FocusTimer";
import SectionCard from "~/components/layout/focus-sessions/SectionCard";
import SessionHistory from "~/components/layout/focus-sessions/SessionHistory";
import Header from "~/components/layout/Header";
import useStudyData from "~/context/studyDataContext";
import FocusTimerPageSkeleton from "~/components/skeleton/FocusTimerPageSkeleton";
import SessionStatsSkeleton from "~/components/skeleton/SessionStatsSkeleton";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const SessionStats = lazy(
  () => import("~/components/layout/focus-sessions/SessionStats"),
);

gsap.registerPlugin(ScrollTrigger);

export default function FocusTimerPage() {
  const container = useRef<HTMLElement>(null);
  const { sessions: sessionsQuery } = useStudyData();

  const { isError, data: sessions, isLoading, isFetching } = sessionsQuery;

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const sections = container.current?.querySelectorAll<HTMLElement>(
          ".gs-animate",
        );
        sections?.forEach((el) => {
          gsap.from(el, {
            opacity: 0,
            y: 50,
            duration: 3,
            scrollTrigger: {
              trigger: el,
              start: "top 80%",
              toggleActions: "play none none none",
            },
          });
        });
      });
    },
    { scope: container}
  );

  return (
    <>
      <Header />
      <main
        ref={container}
        className="mx-auto flex w-full max-w-300 flex-col gap-6 px-4 pb-6 text-(--text-primary) sm:px-6"
      >
        <Suspense fallback={<FocusTimerPageSkeleton />}>
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_26rem]">
              <SessionStats
                sessions={sessions ?? []}
                isPending={isLoading}
                hasError={isError}
                className="order-2 lg:order-1"
              />
            <SectionCard
              title="Timer"
              description="Choose a mode, then press play."
              className="order-1 lg:order-2"
            >
              <div className="flex flex-1 flex-col gap-1 items-center justify-center">
                <FocusTimer size="sm" />

                <p className="text-xs text-(--text-secondary)">
                  To change the timers setting go to: profile &gt; setting &gt;
                  study
                </p>
              </div>
            </SectionCard>
          </div>

          <Suspense>
            <SessionHistory
              sessions={sessions ?? []}
              isPending={isLoading}
              hasError={isError}
              isRetrying={isFetching}
              onRetry={() => null}
            />
          </Suspense>
        </Suspense>
      </main>
    </>
  );
}
