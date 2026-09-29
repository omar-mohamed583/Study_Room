export default interface SubjectTypes {
  subjects: Subject[],
}

export type Subject = {
  id: string;
  creationDate: Date;
  title: string;
  tasksCount: number;
  completedTasks: number;
  timeSpent: number;
};