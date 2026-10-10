import type { ExamTopicType } from "./examTopicType";
import type { Subject } from "./subjectTypes";

export interface Exam {
  id: number | string;
  title: string;
  examDate: Date | string;
  subject: Subject;
  exam_topics?: ExamTopicType[];
}
