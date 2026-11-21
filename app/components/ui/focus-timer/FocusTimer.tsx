import useTheme from "~/context/themeContext";
import JellyRadio from "./JellyRadio";
import {
  memo,
  startTransition,
  useDeferredValue,
  useEffect,
  useId,
  useMemo,
} from "react";
import Button from "../global/Button";

export const links: LinksFunction = () => [
  {
    href: "https://fonts.googleapis.com/css2?family=DM+Mono:ital,wght@0,300;0,400;0,500;1,300;1,400;1,500&display=swap",
    rel: "stylesheet",
  },
];

import type { TimerMode } from "~/types/customContextType";
import type { LinksFunction } from "react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "~/api/queryKeys";
import { apiFetch } from "~/api/api";
import NotificationModal from "../global/NotificationModal";
import SearchBar from "../header/SearchBar";

const MemoTimer = memo(({ className }: { className: string }) => (
  <TimerRing className={className} />
));

const MemoSearchBar = memo(SearchBar);

const TIMER_MODES: Record<
  TimerMode,
  "timeForFocus" | "timeForShortBreak" | "timeForLongBreak"
> = {
  focus: "timeForFocus",
  "short break": "timeForShortBreak",
  "long break": "timeForLongBreak",
};

export default function FocusTimer({
  size = "md",
  anchor = false,
}: {
  size?: "md" | "lg" | "sm";
  anchor?: boolean;
}) {
  const client = useQueryClient();

  const { mutate: mutateTimer } = useMutation({
    mutationFn: (focusTimerDetails: {
      startedAt: string;
      duration: number;
      sessionType: string;
      endedAt: string;
      task?: string;
      subject?: string;
      exam?: string;
    }) =>
      apiFetch("/study-sessions/", {
        method: "POST",
        body: JSON.stringify({ data: focusTimerDetails }),
      }),

    onSuccess: () =>
      client.invalidateQueries({
        queryKey: queryKeys.studySessions,
      }),
  });

  const { selectEventValue } = useTheme();

  const { timerStates, setTimerStates, setToast, setShowToast } = useTheme();

  let minutes = Math.trunc(
    (timerStates[TIMER_MODES[timerStates.timerMode]] -
      timerStates.currentFocusTimer.currentTime) /
      60,
  );

  let seconds = Math.max(
    (timerStates[TIMER_MODES[timerStates.timerMode]] -
      timerStates.currentFocusTimer.currentTime) %
      60,
    0,
  );

  const displayMinutes =
    minutes.toString().length > 2
      ? minutes.toString().slice(0, 2)
      : minutes.toString().padStart(2, "0");
  const timerText = `${displayMinutes}:${seconds.toString().padStart(2, "0")}`;
  const deferredTimerText = useDeferredValue(timerText, "10:00");

  useEffect(() => {
    if (
      timerStates.timerState === "idle" ||
      timerStates.timerState === "paused"
    )
      return;

    const interval = setInterval(() => {
      const total = timerStates[TIMER_MODES[timerStates.timerMode]];
      const { currentTime, startDate } = timerStates.currentFocusTimer;

      if (currentTime < total) {
        setTimerStates((prev) => ({
          ...prev,
          currentFocusTimer: {
            ...prev.currentFocusTimer,
            currentTime: prev.currentFocusTimer.currentTime + 1,
          },
        }));
        return;
      }

      // Finish Timer

      const startedAt = startDate
        ? new Date(startDate)
        : new Date(Date.now() - currentTime * 1000);

      mutateTimer({
        startedAt: startedAt.toISOString(),
        duration: currentTime,
        sessionType:
          timerStates.timerMode === "focus"
            ? "focusTimer"
            : timerStates.timerMode === "long break"
              ? "longBreak"
              : "shortBreak",
        endedAt: new Date(
          startedAt.getTime() + currentTime * 1000,
        ).toISOString(),
        task:
          selectEventValue.type === "task"
            ? selectEventValue.eventId
            : undefined,
        subject:
          selectEventValue.type === "subject"
            ? selectEventValue.eventId
            : undefined,
        exam:
          selectEventValue.type === "exam"
            ? selectEventValue.eventId
            : undefined,
      });

      setTimerStates((prev) => {
        const timerMode = prev.timerMode;
        const currentFocusTimer =
          timerMode === "focus"
            ? {
                ...prev.currentFocusTimer,
                takenFocusTime: currentTime,
                currentTime: 0,
              }
            : timerMode === "short break"
              ? {
                  ...prev.currentFocusTimer,
                  takenShortBreakTime: currentTime,
                  currentTime: 0,
                }
              : {
                  ...prev.currentFocusTimer,
                  takenLongBreakTime: currentTime,
                  currentTime: 0,
                };

        return {
          ...prev,
          pastFocusTimers: [...prev.pastFocusTimers, currentFocusTimer],
          currentFocusTimer: {
            id: crypto.randomUUID(),
            startDate: null,
            currentTime: 0,
            takenFocusTime: 0,
            takenLongBreakTime: 0,
            takenShortBreakTime: 0,
          },
          timerState: "idle",
        };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [
    timerStates.timerMode,
    timerStates.timerState,
    timerStates.currentFocusTimer.currentTime,
  ]);

  const jellyRadioDefaultVal = useMemo(
    () =>
      timerStates.timerMode === "focus"
        ? "Focus"
        : timerStates.timerMode === "short break"
          ? "Short Break"
          : "Long Break",
    [timerStates.timerMode],
  );

  return (
    <>
      <div className="p-3 py-5 isolate rounded-2xl grid justify-center gap-9">
        <div>
          <JellyRadio
            items={["Short Break", "Focus", "Long Break"]}
            defaultValue={jellyRadioDefaultVal}
            onChange={(value) =>
              startTransition(() => {
                setTimerStates((prev: any) => ({
                  ...prev,
                  timerMode: value?.toLowerCase(),
                  timerState: "idle",
                  currentFocusTimer: {
                    ...prev.currentFocusTimer,
                    currentTime: 0,
                    startDate: null,
                  },
                }));
              })
            }
            chipColor="#27272a"
            activeColor={
              timerStates.timerMode === "focus"
                ? "#1078a6"
                : timerStates.timerMode === "short break"
                  ? "#4caf50"
                  : "#f44336"
            }
            textColor="#fff"
            activeTextColor={"#fff"}
            size={size}
            gap={6}
            radius={18}
            swell={0.2}
            barge={5}
            shrink={0.05}
            jelly={1}
            bounce={0.25}
            stagger={20}
            stiffness={550}
          />
        </div>

        <div
          className={`timer aspect-square w-[clamp(130px,100%,250px)] rounded-[50%] bg-(--contrast-text) tracking-tight text-xl leading-[normal] grid place-content-center gap-3 mx-auto ${anchor && "[anchor-name:--timer]"}`}
        >
          <div className="text-4xl md:text-[40px] font-bold leading-[normal] text-center *:tabular-nums min-w-max">
            {deferredTimerText}
          </div>

          <MemoSearchBar />

          <MemoTimer className="bg-div" />

          <MemoTimer className="bg-div glow" />

          <div className="flex flex-row-reverse gap-5 justify-center">
            <Button
              className={`${timerStates.timerState === "running" ? "bg-red-600 hover:bg-red-800 [&_svg:first-child]:opacity-0" : timerStates.timerState === "paused" ? "bg-yellow-500 hover:bg-yellow-600 [&_svg:last-child]:opacity-0" : "bg-green-500 hover:bg-green-700 [&_svg:last-child]:opacity-0"} text-white p-2 rounded-full items-center justify-center gap-2 grid place-content-center place-items-center [grid-template-areas:'--stack'] *:[grid-area:--stack] `}
              aria-label="Start/Pause Timer"
              aria-pressed={
                timerStates.timerState === "running" ||
                timerStates.timerState === "paused"
              }
              onClick={() => {
                startTransition(() => {
                  setTimerStates((prev) => ({
                    ...prev,
                    timerState:
                      prev.timerState === "running" ? "paused" : "running",
                    currentFocusTimer: {
                      ...prev.currentFocusTimer,
                      startDate: prev.currentFocusTimer.startDate ?? new Date(),
                    },
                  }));

                  setToast(
                    {
                      title: `Timer ${timerStates.timerState !== "running" ? "started" : "paused"}`,
                      description: `The ${timerStates.timerMode} timer was ${timerStates.timerState !== "running" ? "started" : "paused"}.`,
                    },
                    timerStates.timerState !== "running" ? "success" : "alert",
                  );

                  setShowToast(true);
                });
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-play preview-icon"
              >
                <path d="M5 5a2 2 0 0 1 3.008-1.728l11.997 6.998a2 2 0 0 1 .003 3.458l-12 7A2 2 0 0 1 5 19z" />
              </svg>
              {/* Pause Icon */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-pause preview-icon"
              >
                <rect
                  x="14"
                  y="3"
                  width="5"
                  height="18"
                  rx="1"
                />
                <rect
                  x="5"
                  y="3"
                  width="5"
                  height="18"
                  rx="1"
                />
              </svg>
            </Button>
            <Button
              aria-label="Reset Timer"
              className={`${timerStates.timerState === "idle" ? "opacity-30 pointer-events-none" : "opacity-100 pointer-events-auto"} bg-gray-500 hover:bg-zinc-600 rounded-full`}
              disabled={timerStates.timerState === "idle"}
              onClick={() => {
                startTransition(() => {
                  setToast(
                    {
                      title: "Timer Reset",
                      description: `The ${timerStates.timerMode} timer was reset.`,
                    },
                    "alert",
                  );

                  setShowToast(true);

                  setTimerStates((prev: any) => ({
                    ...prev,
                    timerState: "idle",
                    currentFocusTimer: {
                      ...prev.currentFocusTimer,
                      currentTime: 0,
                      startDate: null,
                    },
                  }));
                });
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#fff"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-square preview-icon"
              >
                <rect
                  width="18"
                  height="18"
                  x="3"
                  y="3"
                  rx="2"
                />
              </svg>
            </Button>
          </div>
        </div>
      </div>

      <NotificationModal />
    </>
  );
}

const STOPS = [
  "#021b5b",
  "#08476c",
  "#0e6a81",
  "#169398",
  "#20b199",
  "#2dca80",
  "#7ee436",
  "#efff3c",
];

const RADIUS = 46;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

interface TimerRingProps {
  strokeWidth?: number;
  animated?: boolean;
  trackColor?: string;
  className?: string;
}

function TimerRing({
  strokeWidth = 6,
  animated = true,
  trackColor = "rgba(161, 161, 170, 0.35)",
  className = "absolute -inset-10 size-full",
}: TimerRingProps) {
  const { timerStates } = useTheme();

  const progress =
    1 -
    timerStates.currentFocusTimer.currentTime /
      timerStates[TIMER_MODES[timerStates.timerMode]];

  const gradientId = `ring-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const clamped = Math.min(1, Math.max(0, progress));

  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient
          id={gradientId}
          x1="0"
          y1="0"
          x2="100"
          y2="0"
          gradientUnits="userSpaceOnUse"
          gradientTransform="rotate(90 50 50)"
        >
          {STOPS.map((color, i) => (
            <stop
              key={color}
              offset={i / (STOPS.length - 1)}
              stopColor={color}
            />
          ))}
        </linearGradient>
      </defs>

      {/* track */}
      <circle
        cx="50"
        cy="50"
        r={RADIUS}
        stroke={trackColor}
        strokeWidth={strokeWidth}
      />

      {/* progress */}
      <circle
        cx="50"
        cy="50"
        r={RADIUS}
        stroke={`url(#${gradientId})`}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={CIRCUMFERENCE}
        strokeDashoffset={CIRCUMFERENCE * (1 - clamped)}
        transform="rotate(-90 50 50)"
        style={{
          opacity: clamped === 0 ? 0 : 1,
          transition: animated ? "stroke-dashoffset 250ms linear" : "none",
        }}
      />
    </svg>
  );
}
