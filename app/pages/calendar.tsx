import { redirect, type LinksFunction, type MetaFunction } from "react-router";
import { ensureSession } from "~/auth/session";
import Button from "~/components/ui/Button";
import Calendar, {
  type EventType,
} from "~/components/ui/Calendar";
import LoadingComponent from "~/components/ui/LoadingComponent";
import useStudyData from "~/context/studyDataContext";

export const links: LinksFunction = () => [
  {
    rel: "icon",
    as: "image",
    href: "../assets/logo.svg",
  },
];

export const meta: MetaFunction = () => [
  {
    title: "Study Planner - Calendar",
  },
  {
    name: "",
    content: "",
  },
];

export default function CalendarPage() {
  const {
    calendars: { data: calendars, isLoading: calendarsLoading },
  } = useStudyData();

  const {
    tasks: { data: tasks, isLoading: tasksLoading },
    exams: { data: exams, isLoading: examsLoading },
    subjects: { data: subjects, isLoading: subjectsLoading },
  } = useStudyData();

  if (!tasks || !exams) {
    return <LoadingComponent loadingState={tasksLoading || examsLoading} />;
  }

  const events: EventType[] = [
    ...tasks
      .filter((task) => task.dueDate)
      .map((task) => {
        const end = new Date(task.dueDate);
        const durationMs = Math.max(1, task.estimatedDuration || 60) * 60_000;
        const allDay = task.calendarAllDay === true;
        const allDayDate = new Date(
          end.getFullYear(),
          end.getMonth(),
          end.getDate(),
        );
        return {
          id: `task-${task.documentId}`,
          title: task.title,
          start: allDay ? allDayDate : new Date(end.getTime() - durationMs),
          end: allDay ? allDayDate : end,
          allDay,
          calendarId:
            task.calendars[0]?.documentId ?? task.calendars[0]?.id,
          description: task.description,
          meta: { entityType: "task" as const, documentId: task.documentId },
        };
      }),
    ...exams
      .filter((exam) => exam.examDate)
      .map((exam) => {
        const start = new Date(exam.examDate);
        const allDay = exam.calendarAllDay === true;
        const allDayDate = new Date(
          start.getFullYear(),
          start.getMonth(),
          start.getDate(),
        );
        const eventStart = allDay ? allDayDate : start;
        const end = allDay
          ? allDayDate
          : new Date(start.getTime() + 60 * 60_000);
        return {
          id: `exam-${exam.documentId}`,
          title: exam.title,
          start: eventStart,
          end,
          allDay,
          calendarId:
            exam.calendars[0]?.documentId ?? exam.calendars[0]?.id,
          description: exam.description,
          meta: { entityType: "exam" as const, documentId: exam.documentId },
        };
      }),
  ];

  return (
    <>
      <Button
        className="fixed inset-e-5 inset-be-5 z-10000 bg-blue-600 hover:bg-blue-600/70 rounded-full aspect-square"
        navigation={{ to: "/" }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#fff"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="lucide lucide-house preview-icon"
        >
          <path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8" />
          <path d="M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        </svg>
      </Button>
      <main>
        <Calendar
          calendars={calendars ?? []}
          calendarsLoading={calendarsLoading}
          initialDate={new Date()}
          events={events}
          subjects={subjects ?? []}
          subjectsLoading={subjectsLoading}
          tasks={tasks}
          exams={exams}
        />
      </main>
    </>
  );
}

export const clientMiddleware = [authMiddleware];

async function authMiddleware() {
  const accessToken = await ensureSession();
  if (!accessToken) throw redirect("/login");
}
