export type Priority = "low" | "medium" | "high";

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
