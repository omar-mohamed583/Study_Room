import type { Subject } from "./subjectTypes";

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
