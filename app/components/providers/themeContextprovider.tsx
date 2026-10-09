import { useState, type ReactNode } from "react";
import { ThemeContext } from "~/context/themeContext";
import { useLocalStorage } from "~/hooks/useLocalStorage";
import type { TimerStates, Toast } from "~/types/customContextType";

type Theme = "light" | "dark";

export const getIcon = (name: string) => {
  switch (name) {
    case "fail":
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="lucide lucide-circle-x preview-icon"
        >
          <circle
            cx="12"
            cy="12"
            r="10"
          />
          <path d="m15 9-6 6" />
          <path d="m9 9 6 6" />
        </svg>
      );
    case "success":
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="lucide lucide-circle-check preview-icon"
        >
          <circle
            cx="12"
            cy="12"
            r="10"
          />
          <path d="m16 9-5.5 5.5L8 12" />
        </svg>
      );
    default: return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="lucide lucide-circle-alert preview-icon"
      >
        <circle
          cx="12"
          cy="12"
          r="10"
        />
        <line
          x1="12"
          x2="12"
          y1="8"
          y2="12"
        />
        <line
          x1="12"
          x2="12.01"
          y1="16"
          y2="16"
        />
      </svg>
    );
  }
};

export default function ThemeContextProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [theme, setTheme] = useLocalStorage<Theme>("theme", "light");

  const [timerStates, setTimerStates] = useLocalStorage<TimerStates>("timer", {
    pastFocusTimers: [],
    currentFocusTimer: {
      id: `${crypto.randomUUID()}`,
      startDate: null,
      takenFocusTime: 0,
      takenShortBreakTime: 0,
      takenLongBreakTime: 0,
      currentTime: 0,
    },
    timerMode: "focus",
    timerState: "idle",
    timeForFocus: 25 * 60,
    timeForShortBreak: 5 * 60,
    timeForLongBreak: 15 * 60,
  });

  const [showToast, setShowToast] = useState<boolean>(false);

  const [toasts, setToasts] = useState<Toast[]>([]);

  const [loading, setLoading] = useState<boolean>(false);

  return (
    <ThemeContext
      value={{
        loading,
        setLoading,
        theme,
        setTheme,
        timerStates,
        setTimerStates,
        toasts,
        setToasts,
        showToast,
        setShowToast,
      }}
    >
      {children}
    </ThemeContext>
  );
}
