import type { CalendarType } from "~/components/ui/Calendar";
import type { ExamTopicType } from "./examTopicType";
import type { StudySession } from "./studySessionType";
import type { Subject } from "./subjectTypes";

export interface Exam {
  title: string;
  examDate: string | Date;
  description: string;
  calendarAllDay: boolean;
  documentId: string;
  subject: Subject[];
  exam_topics: ExamTopicType[];
  study_sessions: StudySession[];
  calendars: CalendarType[];
  id: number;
  publishedAt: string | Date;
  createdAt: string | Date;
  updatedAt: string | Date;
}
