import type { Exam } from "./examType";
import type { StudySession } from "./studySessionType";
import type { Task } from "./taskType";

export type Subject = {
  color: string;
  createdAt: string;
  documentId: string;
  icon: string;
  id: number;
  name: string;
  publishedAt: string;
  updatedAt: string;
  tasks: Task[];
  exams: Exam[];
  studySessions: StudySession[]
};