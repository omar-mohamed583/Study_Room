export type Priority = "low" | "medium" | "high";

type DateValue = string | Date;

interface SubjectRef {
  id: number | string;
  title: string;
}

export interface Task {
  id: number | string;
  title: string;
  dueDate?: DateValue | null;
  priority?: Priority | null;
  /** Minutes. */
  estimatedDuration?: number | null;
  completed?: boolean | null;
  subject?: SubjectRef | null;
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
