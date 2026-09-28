type TaskObj = {
  id: string;
  title: string;
  subject: string;
};

type SubjectObj = {
  id: string;
  creationDate: Date;
  title: string;
  tasksCount: number;
  completedTasks: number;
  timeSpent: number;
};

export type Data = {
  TASK: TaskObj[];
  SUBJECT: SubjectObj[];
};

export const fakeData: Data = {
  TASK: [
    {
      id: crypto.randomUUID(),
      title: "Do Homework",
      subject: "Arabic",
    },
    {
      id: crypto.randomUUID(),
      title: "Revise Last Lesson Is Main Book",
      subject: "Cyber Security",
    },
    {
      id: crypto.randomUUID(),
      title: "Attend The Class",
      subject: "English",
    },
    {
      id: crypto.randomUUID(),
      title: "Prepare For The Test",
      subject: "Mechanics",
    },
  ],
  SUBJECT: [
    {
      id: crypto.randomUUID(),
      creationDate: new Date(),
      title: "Maths",
      tasksCount: 15,
      completedTasks: 8,
      timeSpent: 2,
    },
    {
      id: crypto.randomUUID(),
      creationDate: new Date(),
      title: "Arabic",
      tasksCount: 7,
      completedTasks: 3,
      timeSpent: 1,
    },
    {
      id: crypto.randomUUID(),
      creationDate: new Date(),
      title: "English",
      tasksCount: 10,
      completedTasks: 5,
      timeSpent: 3,
    },
    {
      id: crypto.randomUUID(),
      creationDate: new Date(),
      title: "Mechanics",
      tasksCount: 2,
      completedTasks: 1,
      timeSpent: 1,
    },
  ],
};
