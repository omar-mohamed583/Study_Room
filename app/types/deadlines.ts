import type { Subject } from "./subjectTypes";

export type Priority = "low" | "medium" | "high";

type DateValue = string | Date;

interface SubjectRef {
  id: number | string;
  title: string;
}

export interface Task {
  completed: boolean;
  completedAt: string;
  createdAt: string;
  description: string;
  documentId: string;
  dueDate: string;
  estimatedDuration: number;
  id: number;
  priority: "medium" | "low" | "high";
  publishedAt: string;
  title: string;
  updatedAt: string;
  subject: Subject;
}

export interface Exam {
  id: number | string;
  title: string;
  examDate: DateValue;
  subject?: SubjectRef | null;
  exam_topics?: { id: number | string }[];
}

export type DeadlineKind = "task" | "exam";
export type Urgency = "overdue" | "today" | "soon" | "later";

export interface Deadline {
  key: string;
  kind: DeadlineKind;
  title: string;
  subject?: string;
  date: Date;
  href: string;
  priority?: Priority;
  duration?: number;
  topicsCount?: number;
}
