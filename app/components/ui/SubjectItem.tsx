import { Link } from "react-router";
import type { Subject } from "~/types/subjectTypes";
import EmptyState from "./EmptyState";
import type { Task } from "~/types/taskType";

export default function SubjectItems({
  subjects,
  tasks,
}: {
  subjects: Subject[];
  tasks: Task[];
}) {
  if (!subjects.length)
    return (
      <EmptyState
        to="/subject/new"
        emptyStateTitle="Subjects"
        icon="subject"
      />
    );

  const visibleItems = subjects.length > 5 ? subjects.slice(0, 5) : subjects;

  return (
    <table className="w-full min-w-max">
      <thead>
        <tr className="*:text-(--text-secondary) *:font-semibold *:text-[15px] **:p-4 bg-(--stripping-color) border-b border-b-zinc-500">
          <th scope="col" className="text-start">Subject</th>
          <th scope="col" className="text-center">Tasks</th>
          <th scope="col" className="text-center">Completed</th>
          <th scope="col" className="text-center">Progress</th>
          <th scope="col" className="text-center">Time Spent</th>
          <th scope="col"><span className="sr-only">Open subject</span></th>
        </tr>
      </thead>
      <tbody className="*:not-[tr:last-child]:border-b border-b-zinc-400 *:even:bg-(--stripping-color)">
        {visibleItems.map((subject) => {
          const subjectTasks = tasks.filter(
            (task) => task.subject?.documentId === subject.documentId,
          );
          const completedTasks = subjectTasks.filter(
            (task) => task.completed,
          ).length;
          const focusSeconds = subject.studySessions
            .filter((session) => session.sessionType === "focusTimer")
            .reduce((total, session) => {
              const duration = Number(session.duration);
              return total + (Number.isFinite(duration) ? duration : 0);
            }, 0);
          const focusHours = Math.floor(focusSeconds / 3600);
          const focusMinutes = Math.floor((focusSeconds % 3600) / 60);

          return (
            <tr className="*:p-2" key={subject.documentId}>
              <td className="grid p-1">
                <h3 className="font-medium text-[18px] capitalize">
                  {subject.name}
                </h3>
                <span className="[color:var(--text-secondary)] [font-size:11px]">
                  Created at:{" "}
                  {new Date(subject.createdAt)
                    .toDateString()
                    .split(" ")
                    .slice(1)
                    .join(" ")
                    .toUpperCase()}
                </span>
              </td>
              <td className="text-center font-medium">{subjectTasks.length}</td>
              <td className="text-center font-medium">{completedTasks}</td>
              <td className="text-center font-medium">
                {subjectTasks.length
                  ? Math.round((completedTasks / subjectTasks.length) * 100)
                  : 0}%
              </td>
              <td className="text-center font-medium">
                {focusHours ? `${focusHours}h ` : ""}
                {focusMinutes}m
              </td>
              <td>
                <Link
                  aria-label={`Open ${subject.name}`}
                  to={`/subject/${subject.documentId}`}
                  className="grid size-9 place-items-center rounded-lg hover:bg-zinc-400/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--accent-100)"
                >
                  <svg
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-chevron-right preview-icon"
                  >
                    <path d="m9 18 6-6-6-6" />
                  </svg>
                </Link>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
