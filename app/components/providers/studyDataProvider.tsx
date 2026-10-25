import type { ReactNode } from "react";
import useGetEvents from "~/api/getEvents";
import { StudyDataContext } from "~/context/studyDataContext";
import { useAuth } from "./authProvider";
import type { Exam } from "~/types/examType";
import type { Subject } from "~/types/subjectTypes";
import type { Task } from "~/types/taskType";
import type { StudySession } from "~/types/studySessions";
import type { UnFormattedCalendarType } from "../ui/Calendar";

export default function StudyDataProvider({
  children,
}: {
  children: ReactNode;
}) {
  const { user } = useAuth();
  const enabled = Boolean(user);

  const tasks = useGetEvents<Task[]>({
    endpoint: "/tasks?populate=*",
    enabled,
  });
  const subjects = useGetEvents<Subject[]>({
    endpoint: "/subjects?populate=*",
    enabled,
  });
  const exams = useGetEvents<Exam[]>({
    endpoint: "/exams?populate=*",
    enabled,
  });
  const sessions = useGetEvents<StudySession[]>({
    endpoint: "/study-sessions?populate=*",
    enabled,
  });
  const calendars = useGetEvents<UnFormattedCalendarType[]>({
    endpoint: "/calendars?populate=*",
    enabled,
  });

  return (
    <StudyDataContext value={{ tasks, subjects, exams, sessions, calendars }}>
      {children}
    </StudyDataContext>
  );
}
