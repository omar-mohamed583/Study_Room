import useTheme from "~/context/themeContext";
import Badge from "./Badge";
import JellyRadio from "./JellyRadio";
import { useEffect, useId } from "react";
import Button from "./Button";

export const links: LinksFunction = () => [
  {
    href: "https://fonts.googleapis.com/css2?family=DM+Mono:ital,wght@0,300;0,400;0,500;1,300;1,400;1,500&display=swap",
    rel: "stylesheet",
  },
];

import type { TimerMode } from "~/types/customContextType";
import type { LinksFunction } from "react-router";

const TIMER_MODES: Record<
  TimerMode,
  "timeForFocus" | "timeForShortBreak" | "timeForLongBreak"
> = {
  focus: "timeForFocus",
  "short break": "timeForShortBreak",
  "long break": "timeForLongBreak",
};

export default function FocusTimer({ size = "md" }: { size?: "md" | "lg" | "sm" }) {
  const { timerStates, setTimerStates } = useTheme();

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

  useEffect(() => {
    if (
      timerStates.timerState === "idle" ||
      timerStates.timerState === "paused"
    )
      return console.log("Timer is idle or paused, not running the interval");

    const interval = setInterval(() => {
      setTimerStates((prev) => ({
        ...prev,
        currentFocusTimer: {
          ...prev.currentFocusTimer,
          currentTime: prev.currentFocusTimer.currentTime + 1,
        },
      }));

      if (
        minutes === 0 &&
        seconds === 0 &&
        timerStates.currentFocusTimer.currentTime >=
          timerStates[TIMER_MODES[timerStates.timerMode]]
      ) {
        setTimerStates((prev) => {
          const timerMode = prev.timerMode;
          const currentTimeTaken = prev.currentFocusTimer.currentTime;
          const currentFocusTimer =
            timerMode === "focus"
              ? {
                  ...prev.currentFocusTimer,
                  takenFocusTime: currentTimeTaken,
                  currentTime: 0,
                }
              : timerMode === "short break"
                ? {
                    ...prev.currentFocusTimer,
                    takenShortBreakTime: currentTimeTaken,
                    currentTime: 0,
                  }
                : {
                    ...prev.currentFocusTimer,
                    takenLongBreakTime: currentTimeTaken,
                    currentTime: 0,
                  };

          return {
            ...prev,
            currentFocusTimer,
            timerState: "idle",
          };
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [
    timerStates.timerMode,
    timerStates.timerState,
    timerStates.currentFocusTimer.currentTime,
  ]);

  return (
    <div className="p-3 py-5 isolate rounded-2xl grid justify-center gap-7">
      <JellyRadio
        items={["Short Break", "Focus", "Long Break"]}
        defaultValue={
          timerStates.timerMode === "focus"
            ? "Focus"
            : timerStates.timerMode === "short break"
              ? "Short Break"
              : "Long Break"
        }
        onChange={(value) => {
          setTimerStates((prev: any) => ({
            ...prev,
            timerMode: value.toLowerCase(),
            timerState: "idle",
            currentFocusTimer: { ...prev.currentFocusTimer, currentTime: 0 },
          }));
        }}
        chipColor="#27272a"
        activeColor={
          timerStates.timerMode.toLowerCase() === "focus"
            ? "#03a9f4"
            : timerStates.timerMode.toLowerCase() === "short break"
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
        bounce={0.28}
        stagger={22}
        stiffness={580}
      />

      <div className="timer aspect-square w-[clamp(130px,100%,250px)] rounded-[50%] bg-(--contrast-text) tracking-tighter text-xl leading-[normal] border-2 border-zinc-400/35 grid place-content-center gap-2 mx-auto">
        <div className="text-4xl md:text-[40px] font-bold leading-[normal] text-center *:tabular-nums min-w-max">
          {minutes.toString().length > 2
            ? minutes.toString().slice(0, 2)
            : minutes.toString().padStart(2, "0")}
          :{seconds < 10 ? `0${seconds}` : seconds}
        </div>
        <Badge
          variant="secondary"
          className="tracking-normal -mt-1 mb-1 mx-auto"
        >
          {timerStates.timerMode} {timerStates.timerMode === "focus" && "Timer"}
        </Badge>
        <TimerRing
          progress={
            1 -
            timerStates.currentFocusTimer.currentTime /
              timerStates[TIMER_MODES[timerStates.timerMode]]
          }
          className="bg-div"
        />

        <div className="flex flex-row-reverse gap-4 justify-center">
          <Button
            className={`${timerStates.timerState === "running" ? "bg-red-600 hover:bg-red-800 [&_svg:first-child]:opacity-0" : timerStates.timerState === "paused" ? "bg-yellow-500 hover:bg-yellow-600 [&_svg:last-child]:opacity-0" : "bg-green-500 hover:bg-green-700 [&_svg:last-child]:opacity-0"} text-white p-2 rounded-full items-center justify-center gap-2 grid place-content-center place-items-center [grid-template-areas:'--stack'] *:[grid-area:--stack] `}
            aria-label="Start/Pause Timer"
            aria-pressed={timerStates.timerState === "running"}
            onClick={() => {
              setTimerStates((prev) => ({
                ...prev,
                timerState:
                  timerStates.timerState === "running" ? "paused" : "running",
              }));
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
            onClick={() => {
              setTimerStates((prev: any) => ({
                ...prev,
                timerState: "idle",
                currentFocusTimer: {
                  ...prev.currentFocusTimer,
                  currentTime: 0,
                },
              }));
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
  progress: number;
  strokeWidth?: number;
  animated?: boolean;
  trackColor?: string;
  className?: string;
}

function TimerRing({
  progress,
  strokeWidth = 6,
  animated = true,
  trackColor = "rgba(161, 161, 170, 0.35)",
  className = "absolute -inset-10 size-full",
}: TimerRingProps) {
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
