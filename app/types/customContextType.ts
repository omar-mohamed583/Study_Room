import type { Dispatch, ReactNode, SetStateAction } from "react";

export type Theme = "dark" | "light";
export type TimerMode = "focus" | "short break" | "long break";

export interface PastFocusTimer {
  id: string;
  startDate: Date | null,
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

export type Toast = {
  id: string;
  title: string;
  description: string;
  actionBtnText?: string;
  icon?: string,
  onAction?: () => any | (() => null);
  fuseColor?: string;
};

export default interface CustomContextType {
  theme: Theme;
  setTheme: Dispatch<SetStateAction<Theme>>;
  timerStates: TimerStates;
  setTimerStates: Dispatch<SetStateAction<TimerStates>>;
  toasts: Toast[];
  setToasts: Dispatch<SetStateAction<Toast[]>>;
  showToast: boolean;
  setShowToast: Dispatch<SetStateAction<boolean>>;
}
