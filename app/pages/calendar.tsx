import Button from "~/components/ui/Button";
import Calendar, {
  type CalendarType,
  type EventType,
} from "~/components/ui/Calendar";
import LoadingComponent from "~/components/ui/LoadingComponent";
import useStudyData from "~/context/studyDataContext";

export default function CalendarPage() {
  const defaultCalendarId = "study-planner";
  const calendars: CalendarType[] = [
    {
      id: defaultCalendarId,
      name: "Default Calendar",
      colors: {
        eventColor: "#ff7452",
        eventSelectedColor: "#e85d3d",
        lineColor: "#ff7452",
        textColor: "#ffffff",
      },
    },
  ];

  const {
    tasks: { data: tasks },
    exams: { data: exams },
  } = useStudyData();

  if (!tasks || !exams) return (<LoadingComponent loading={!(tasks || exams)} />);

  const events: EventType[] = [
    ...tasks.filter((task) => task.dueDate).map((task) => {
      const end = new Date(task.dueDate);
      const durationMs = Math.max(1, task.estimatedDuration || 60) * 60_000;
      return {
        id: `task-${task.documentId}`,
        title: task.title,
        start: new Date(end.getTime() - durationMs),
        end,
        calendarId: defaultCalendarId,
      };
    }),
    ...exams.filter((exam) => exam.examDate).map((exam) => {
      const start = new Date(exam.examDate);
      const end = new Date(start.getTime() + 60 * 60_000);
      return {
        id: `exam-${exam.documentId}`,
        title: exam.title,
        start,
        end,
        calendarId: defaultCalendarId,
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
          calendars={calendars}
          initialDate={new Date()}
          events={events}
        />
      </main>
    </>
  );
}
