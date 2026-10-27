import { lazy, Suspense, useRef } from "react";
import SectionCard from "~/components/layout/focus-sessions/SectionCard";
import lightLogo from "~/assets/light-logo.svg";
import darkLogo from "~/assets/dark-logo.svg";
import SessionHistory from "~/components/layout/focus-sessions/SessionHistory";
import SessionStats from "~/components/layout/focus-sessions/SessionStats";
import Header from "~/components/layout/Header";
import useStudyData from "~/context/studyDataContext";
import FocusTimerSkeleton from "~/components/skeleton/FocusTimerSkeleton";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ensureSession } from "~/auth/session";
import {
  redirect,
  useNavigate,
  type LinksFunction,
  type MetaFunction,
} from "react-router";
import Button from "~/components/ui/Button";
import Footer from "~/components/layout/Footer";

const FocusTimer = lazy(() => import("~/components/ui/FocusTimer"));

export const links: LinksFunction = () => [
  {
    rel: "icon",
    as: "image",
    href:
      window.matchMedia("(prefers-color-scheme: dark)").matches
        ? darkLogo
        : lightLogo,
  },
];

export const meta: MetaFunction = () => [
  {
    title: "Study Planner - Focus Timer",
  },
  {
    name: "",
    content: "",
  },
];

gsap.registerPlugin(useGSAP, ScrollTrigger);

export default function FocusTimerPage() {
  const container = useRef<HTMLElement>(null);
  const { sessions: sessionsQuery } = useStudyData();

  const { isError, data: sessions, isLoading, isFetching } = sessionsQuery;

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
        className="mx-auto flex w-full max-w-350 flex-col gap-6 px-4 pb-20 pt-28 text-(--text-primary) sm:px-6"
      >
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_30rem]">
          <SessionStats
            sessions={sessions ?? []}
            isPending={isLoading}
            hasError={isError}
            className="order-2 lg:order-1 gs-animate"
          />
          <SectionCard
            svgName="timer"
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
        className="fixed inset-e-4 inset-be-10 bg-orange-400/15 border hover:bg-orange-400/25 transition-[border-color,translate,background-color,box-shadow] duration-300 border-orange-400/55 hover:border-orange-400 rounded-full text-orange-600 in-[.dark]:text-orange-400 p-3 px-4 backdrop-blur-xl hover:shadow-orange-400/30 shadow-xl hover:-translate-y-2"
        onClick={() => {
          document.startViewTransition(() => {
            navigate("/focus-mode");
          });
        }}
      >
        Focus Mode
      </Button>
      <Footer />
    </>
  );
}

export const clientMiddleware = [authMiddleware];

async function authMiddleware() {
  const accessToken = await ensureSession();
  if (!accessToken) throw redirect("/login");
}
