export interface UserType {
  blocked: boolean;
  confirmed: boolean;
  createdAt: string | Date;
  documentId: string;
  email: string;
  id: number;
  provider: string;
  publishedAt: string | Date;
  updatedAt: string | Date;
  weeklyGoalHours: number | string;
  sessionMinutes: string | number;
  shortBreakMinutes: number;
  longBreakMinutes: number;
  notifyExams: boolean;
  notifyTasks: boolean;
  username: string;
}
