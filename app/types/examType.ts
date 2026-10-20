import type { ExamTopicType } from "./examTopicType";
import type { StudySession } from "./studySessionType";
import type { Subject } from "./subjectTypes";

export interface Exam {
  createdAt: string | Date;
  description: string;
  documentId: string;
  examDate: string | Date;
  exam_topics: ExamTopicType[];
  id: number;
  publishedAt: string | Date;
  study_sessions: StudySession[];
  subject: Subject[];
  title: string;
  updatedAt: string | Date;
}
