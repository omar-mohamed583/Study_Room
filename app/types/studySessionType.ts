import type { Exam } from "./examType";
import type { Subject } from "./subjectTypes";
import type { Task } from "./taskType";
import type { UserType } from "./userType";

export interface StudySession {
  startedAt: Date | string;
  endedAt?: Date | string;
  duration: number | string;
  sessionType: "shortBreak" | "longBreak" | "focusTimer";
  user?: UserType;
  subject?: Subject;
  exam?: Exam
  task?: Task;
}