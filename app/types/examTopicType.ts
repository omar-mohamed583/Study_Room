import type { Exam } from "./examType";

export interface ExamTopicType {
  title: string;
  completed?: boolean;
  exam?: Exam;
}