import { lazy, Suspense, useRef } from "react";
import SectionCard from "~/components/layout/focus-sessions/SectionCard";
import SessionHistory from "~/components/layout/focus-sessions/SessionHistory";
import SessionStats from "~/components/layout/focus-sessions/SessionStats";
import Header from "~/components/layout/Header";
import useStudyData from "~/context/studyDataContext";
import FocusTimerSkeleton from "~/components/skeleton/FocusTimerSkeleton";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ensureSession } from "~/auth/session";
import { redirect, useNavigate } from "react-router";
import Button from "~/components/ui/Button";
import useTheme from "~/context/themeContext";
import SwipeToast from "~/components/ui/SwipeToast";
import { getIcon } from "~/components/providers/themeContextprovider";

const FocusTimer = lazy(() => import("~/components/ui/FocusTimer"));

gsap.registerPlugin(useGSAP, ScrollTrigger);

export default function FocusTimerPage() {
  const container = useRef<HTMLElement>(null);
  const { sessions: sessionsQuery } = useStudyData();

  const { isError, data: sessions, isLoading, isFetching } = sessionsQuery;

  const { toasts, setToasts, theme } = useTheme();

  const navigate = useNavigate();

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const sections =
          container.current?.querySelectorAll<HTMLElement>(".gs-animate");
        sections?.forEach((el) => {
          gsap.from(el, {
            opacity: 0,
            y: 50,
            scrollTrigger: {
              trigger: el,
              start: "top 90%",
              toggleActions: "play none none none",
            },
          });
        });
      });
    },
    { scope: container },
  );

  return (
    <>
      <Header />
      <main
        ref={container}
        className="mx-auto flex w-full max-w-300 flex-col gap-6 px-4 pb-6 text-(--text-primary) sm:px-6"
      >
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_26rem]">
          <SessionStats
            sessions={sessions ?? []}
            isPending={isLoading}
            hasError={isError}
            className="order-2 lg:order-1 gs-animate"
          />
          <SectionCard
            title="Timer"
            description="Choose a mode, then press play."
            className="order-1 lg:order-2 gs-animate"
          >
            <div className="flex flex-1 flex-col gap-1 items-center justify-center">
              <Suspense fallback={<FocusTimerSkeleton size="sm" />}>
                <FocusTimer size="sm" />
              </Suspense>
              <p className="text-xs text-(--text-secondary)">
                To change the timers setting go to: profile &gt; setting &gt;
                study
              </p>
            </div>
          </SectionCard>
        </div>

        <SessionHistory
          sessions={sessions ?? []}
          isPending={isLoading}
          hasError={isError}
          isRetrying={isFetching}
          onRetry={() => null}
          className="gs-animate"
        />
      </main>
      <Button
        className="fixed inset-e-8 inset-be-6 bg-orange-800/20 border hover:bg-orange-800/25 transition-[border-color,background-color,box-shadow] duration-300 border-orange-800/60 hover:border-orange-600 rounded-full text-orange-400 p-3 px-4 backdrop-blur-xl hover:shadow-orange-500/30 shadow-xl"
        onClick={() => {
          document.startViewTransition(() => {
            navigate("/focus-mode");
          });
        }}
      >
        Focus Mode
      </Button>

      <div
        style={{
          display: "flex",
          position: "fixed",
          right: "1.5rem",
          bottom: "1.5rem",
          flexDirection: "column",
          alignItems: "flex-end",
          zIndex: 10000,
          gap: 10,
        }}
      >
        {toasts.map((toast) => (
          <SwipeToast
            key={toast.id}
            open
            onClose={() => {
              setToasts((prev) => prev.filter((tst) => tst.id !== toast.id));
            }}
            title={toast.title}
            className=""
            inline
            dismissible
            icon={getIcon(toast.icon || "")}
            description={toast.description}
            actionLabel={toast.actionBtnText || ""}
            onAction={toast.onAction || (() => null)}
            background={theme === "dark" ? "#27272a" : "hsl(240 4% 90% / 1)"}
            color={theme === "dark" ? "#f5f5f5" : "#000"}
            fuseColor={toast?.fuseColor?.trim() ?? "#f5a524"}
            width={356}
            radius={12}
            slideMs={400}
            settleBounce={0.3}
            swipeDistance={40}
            duration={3500}
            fuse="bottom"
            pauseOnHover
            closeButton
          />
        ))}
      </div>
    </>
  );
}

export const clientMiddleware = [authMiddleware];

async function authMiddleware() {
  const accessToken = await ensureSession();
  if (!accessToken) throw redirect("/login");
}
