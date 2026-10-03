import type { ReactNode } from "react";
import { ThemeContext } from "~/context/themeContext";
import { useLocalStorage } from "~/hooks/useLocalStorage";
import type { TimerStates } from "~/types/customContextType";

type Theme = "light" | "dark";

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

  return (
    <ThemeContext value={{ theme, setTheme, timerStates, setTimerStates }}>
      {children}
    </ThemeContext>
  );
}
