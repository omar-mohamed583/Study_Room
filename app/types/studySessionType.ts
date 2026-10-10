import type { Subject } from "./subjectTypes";
import type { Task } from "./taskType";
import type { UserType } from "./userType";

export interface StudySession {
  startedAt: Date | string;
  endedAt?: Date | string;
  duration: number | string;
  user?: UserType;
  subject?: Subject;
  task?: Task;
}