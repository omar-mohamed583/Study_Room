import type { CalendarType } from "~/components/ui/Calendar";
import type { Subject } from "./subjectTypes";
import type { StudySession } from "./studySessionType";

export interface Task {
  title: string;
  description: string;
  dueDate: string;
  priority: "medium" | "low" | "high";
  estimatedDuration: number;
  completed: boolean;
  completedAt: string;
  calendarAllDay: boolean;
  subject: Subject;
  studySessions: StudySession[];
  calendars: CalendarType[];
  createdAt: string;
  publishedAt: string;
  documentId: string;
  id: number;
  updatedAt: string;
}
