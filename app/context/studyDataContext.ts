import { createContext, useContext } from "react";
import type { UseQueryResult } from "@tanstack/react-query";
import type { Exam } from "~/types/examType";
import type { Subject } from "~/types/subjectTypes";
import type { Task } from "~/types/taskType";
import type { StudySession } from "~/types/studySessions";

export type DataQuery<T> = Pick<
  UseQueryResult<T, Error>,
  "data" | "isLoading" | "isError" | "isFetching" | "refetch"
>;

export interface StudyData {
  tasks: DataQuery<Task[]>;
  subjects: DataQuery<Subject[]>;
  exams: DataQuery<Exam[]>;
  sessions: DataQuery<StudySession[]>;
}

export const StudyDataContext = createContext<StudyData | null>(null);

export default function useStudyData() {
  const context = useContext(StudyDataContext);
  if (!context) {
    throw new Error("useStudyData must be used inside StudyDataProvider");
  }
  return context;
}
