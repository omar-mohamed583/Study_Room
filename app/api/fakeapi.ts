import { useMemo } from "react";

type TaskObj = {
  id: string;
  title: string;
  subject: string;
};

type SubjectObj = {
  id: string;
  creationDate: Date;
  title: string;
  tasksCount: Number;
  completed: Number;
  timeSpent: Number;
};

export type Data = {
  NAME: string;
  TASK: TaskObj[];
  SUBJECT: SubjectObj[];
};

export const fakeData: Data = {
  NAME: "Omar",
  TASK: [
    {
      id: crypto.randomUUID(),
      title: "Do Homework",
      subject: "Arabic",
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
      completed: 8,
      timeSpent: 2,
    },
    {
      id: crypto.randomUUID(),
      creationDate: new Date(),
      title: "Arabic",
      tasksCount: 7,
      completed: 3,
      timeSpent: 1,
    },
    {
      id: crypto.randomUUID(),
      creationDate: new Date(),
      title: "English",
      tasksCount: 10,
      completed: 5,
      timeSpent: 3,
    },
    {
      id: crypto.randomUUID(),
      creationDate: new Date(),
      title: "Mechanics",
      tasksCount: 2,
      completed: 1,
      timeSpent: 1,
    },
  ],
};
