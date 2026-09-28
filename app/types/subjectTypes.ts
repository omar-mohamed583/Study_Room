export default interface SubjectTypes {
  subjects: Subject[],
  stripped: boolean,
}

export type Subject = {
  id: string;
  creationDate: Date;
  title: string;
  tasksCount: number;
  completedTasks: number;
  timeSpent: number;
};