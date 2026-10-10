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
  const visibleItems = subjects?.length > 5 ? subjects.slice(0, 5) : subjects;

  return (
    <>
      {subjects && !subjects?.length && (
        <EmptyState
          to="/subject/new"
          emptyStateTitle="Subjects"
          icon="subject"
        />
      )}

      {visibleItems?.length && tasks?.length && (
        <table className="w-full min-w-max">
          <thead>
            <tr className="*:text-(--text-secondary) *:font-semibold *:text-[15px] **:p-4 bg-(--stripping-color) border-b border-b-zinc-500">
              <td>Subject</td>
              <td className="text-center">Tasks</td>
              <td className="text-center">Completed</td>
              <td className="text-center">Progress</td>
              <td className="text-center">Time Spent</td>
              <td></td>
            </tr>
          </thead>
          <tbody className="*:not-[tr:last-child]:border-b border-b-zinc-400 *:even:bg-(--stripping-color)">
            {visibleItems?.map((subject) => {
              const subjectTasks = {
                totalTasks: 0,
                completedTasks: 0,
              };

              for (const task of tasks) {
                if (task.subject.name === subject.name) {
                  subjectTasks.totalTasks++;

                  if (task.completed) subjectTasks.completedTasks++;
                }
              }

              return (
                <tr
                  className="*:p-2"
                  key={subject.documentId}
                >
                  <td className="grid p-1">
                    <h3 className="font-medium text-[18px]">{subject.name}</h3>
                    <span className="[color:var(--text-secondary)] [font-size:11px]">
                      Created at:{" "}
                      {new Date(subject.createdAt)
                        .toDateString()
                        .split(" ")
                        .splice(1)
                        .join(" ")
                        .toUpperCase()}
                    </span>
                  </td>
                  <td className="text-center font-medium text-(--pale-text)">
                    {subjectTasks.totalTasks}
                  </td>
                  <td className="text-center font-medium text-(--pale-text)">
                    {subjectTasks.completedTasks}
                  </td>
                  <td className="text-center font-medium text-(--pale-text)">
                    {(
                      (subjectTasks.completedTasks / subjectTasks.totalTasks) *
                      100
                    ).toFixed(0)}
                    %
                  </td>
                  <td className="text-center font-medium text-(--pale-text)">
                    {0}h
                  </td>
                  <td>
                    <Link to={`/subject/${subject?.documentId}`}>
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
      )}
    </>
  );
}
