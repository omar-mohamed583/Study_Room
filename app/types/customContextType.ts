import type { Dispatch, SetStateAction } from "react";

export type Theme = "dark" | "light";
export type TimerMode = "focus" | "short break" | "long break";

export interface PastFocusTimer {
  id: string;
  takenFocusTime: number;
  takenShortBreakTime: number;
  takenLongBreakTime: number;
}

export interface CurrentFocusTimer extends PastFocusTimer {
  currentTime: number;
}

export interface TimerStates {
  pastFocusTimers: PastFocusTimer[];
  currentFocusTimer: CurrentFocusTimer;
  timerMode: TimerMode;
  timerState: "idle" | "running" | "paused";
  timeForFocus: number;
  timeForShortBreak: number;
  timeForLongBreak: number;
}

export default interface CustomContextType {
  theme: Theme;
  setTheme: Dispatch<SetStateAction<Theme>>;
  timerStates: TimerStates;
  setTimerStates: Dispatch<SetStateAction<TimerStates>>;
}
