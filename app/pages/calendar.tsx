import {
  redirect,
  useNavigate,
  type LinksFunction,
  type MetaFunction,
} from "react-router";
import { ensureSession } from "~/auth/session";
import { DialMenu } from "../../components/ovio/dial-menu/dial-menu";
import Calendar, { type EventType } from "~/components/ui/Calendar";
import LoadingComponent from "~/components/ui/LoadingComponent";
import NotificationModal from "~/components/ui/NotificationModal";
import useStudyData from "~/context/studyDataContext";
import { useMemo, useTransition } from "react";

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
  const navigate = useNavigate();
  const [pending, startTransition] = useTransition();
  const {
    calendars: { data: calendars, isLoading: calendarsLoading },
  } = useStudyData();

  const {
    tasks: { data: tasks, isLoading: tasksLoading },
    exams: { data: exams, isLoading: examsLoading },
    subjects: { data: subjects, isLoading: subjectsLoading },
  } = useStudyData();

  const events: EventType[] = [
    ...(tasks ?? [])
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
          calendarId: task.calendars[0]?.documentId ?? task.calendars[0]?.id,
          description: task.description,
          meta: { entityType: "task" as const, documentId: task.documentId },
        };
      }),
    ...(exams ?? [])
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
          calendarId: exam.calendars[0]?.documentId ?? exam.calendars[0]?.id,
          description: exam.description,
          meta: { entityType: "exam" as const, documentId: exam.documentId },
        };
      }),
  ];

  const dialMenuData = useMemo(
    () => [
      {
        label: "Home",
        icon: (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lucide lucide-house preview-icon"
          >
            <path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8" />
            <path d="M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          </svg>
        ),
        id: "/",
      },
      {
        id: "/dashboard",
        label: "Dashboard",
        icon: (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lucide lucide-chart-pie preview-icon"
          >
            {" "}
            <path d="M21 12c.552 0 1.005-.449.95-.998a10 10 0 0 0-8.953-8.951c-.55-.055-.998.398-.998.95v8a1 1 0 0 0 1 1z" />{" "}
            <path d="M21.21 15.89A10 10 0 1 1 8 2.83" />{" "}
          </svg>
        ),
      },
      {
        id: "/subjects",
        label: "Subjects",
        icon: (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lucide lucide-library-big preview-icon"
          >
            <rect
              width="8"
              height="18"
              x="3"
              y="3"
              rx="1"
            />
            <path d="M7 3v18" />
            <path d="M20.4 18.9c.2.5-.1 1.1-.6 1.3l-1.9.7c-.5.2-1.1-.1-1.3-.6L11.1 5.1c-.2-.5.1-1.1.6-1.3l1.9-.7c.5-.2 1.1.1 1.3.6Z" />
          </svg>
        ),
      },
      {
        id: "/tasks",
        label: "Tasks",
        icon: (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lucide lucide-list-todo preview-icon"
          >
            {" "}
            <path d="M13 5h8" /> <path d="M13 12h8" /> <path d="M13 19h8" />{" "}
            <path d="m3 17 2 2 4-4" />{" "}
            <rect
              x="3"
              y="4"
              width="6"
              height="6"
              rx="1"
            />{" "}
          </svg>
        ),
      },
      {
        id: "/exams",
        label: "Exams",
        icon: (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lucide lucide-clipboard-list preview-icon"
          >
            {" "}
            <rect
              width="8"
              height="4"
              x="8"
              y="2"
              rx="1"
              ry="1"
            />{" "}
            <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />{" "}
            <path d="M12 11h4" /> <path d="M12 16h4" /> <path d="M8 11h.01" />{" "}
            <path d="M8 16h.01" />{" "}
          </svg>
        ),
      },
      {
        id: "/focus-timer",
        label: "Focus Timer",
        icon: (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lucide lucide-timer preview-icon"
          >
            {" "}
            <line
              x1="10"
              x2="14"
              y1="2"
              y2="2"
            />{" "}
            <line
              x1="12"
              x2="15"
              y1="14"
              y2="11"
            />{" "}
            <circle
              cx="12"
              cy="14"
              r="8"
            />{" "}
          </svg>
        ),
      },
    ],
    [],
  );

  if (!tasks || !exams) {
    return <LoadingComponent loadingState={tasksLoading || examsLoading} />;
  }

  return (
    <>
      <DialMenu
        variant="minimal"
        trigger="click"
        placement="above-trigger"
        items={dialMenuData}
        onSelect={(item) => startTransition(() => navigate(item.id))}
      >
        <button
          type="button"
          aria-label="Open navigation menu"
          disabled={pending}
          aria-busy={pending || undefined}
          className="fixed right-5 bottom-5 z-50 grid size-12 place-items-center rounded-full border border-(--secondary-gray) bg-(--body-gray) text-(--text-primary) shadow-lg transition-colors hover:bg-(--secondary-gray) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--text-primary) disabled:cursor-wait disabled:opacity-70"
        >
          <svg
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <path d="M12 5v14" />
            <path d="M5 12h14" />
          </svg>
        </button>
      </DialMenu>
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
      <NotificationModal />
    </>
  );
}

export const clientMiddleware = [authMiddleware];

async function authMiddleware() {
  const accessToken = await ensureSession();
  if (!accessToken) throw redirect("/login");
}
