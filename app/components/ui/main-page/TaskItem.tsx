import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router";
import { apiFetch } from "~/api/api";
import useTheme from "~/context/themeContext";
import type { Task } from "~/types/taskType";

const TASKS_QUERY_KEY = ["/tasks?populate=*", null] as const;

export default function TaskItem({ task }: { task: Task }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { setSelectEventValue, setToasts } = useTheme();

  const taskAction = useMutation({
    mutationFn: (action: "complete" | "delete") =>
      action === "complete"
        ? apiFetch(`/tasks/${encodeURIComponent(task.documentId)}`, {
            method: "PUT",
            body: JSON.stringify({
              data: {
                completed: true,
                completedAt: new Date().toISOString(),
              },
            }),
          })
        : apiFetch(`/tasks/${encodeURIComponent(task.documentId)}`, {
            method: "DELETE",
          }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: TASKS_QUERY_KEY }),
  });

  const dueDate = task.dueDate ? new Date(task.dueDate) : null;
  const dueLabel =
    !dueDate || Number.isNaN(dueDate.getTime())
      ? "No due date"
      : task.calendarAllDay ||
          (dueDate.getHours() === 0 && dueDate.getMinutes() === 0)
        ? "Due today"
        : `Due ${dueDate.toLocaleTimeString([], {
            hour: "numeric",
            minute: "2-digit",
          })}`;

  function startFocusTimer() {
    setSelectEventValue({
      eventId: task.documentId,
      name: task.title,
      type: "task",
    });
    navigate("/focus-timer");
  }

  async function deleteTask() {
    // confirmation dialog

    await taskAction.mutateAsync("delete");
    if (taskAction.error) setToasts((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        title: "Failed To Delete",
        description: `failed to delete task "${task.title}".`,
        actionBtnText: "See Details",
        onAction: () => taskAction.error.cause,
        icon: "fail",
      },
    ]);

    setToasts((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        title: "Task Deletion",
        description: `task ${task.title} was successfully deleted.`,
        icon: "success",
      },
    ]);
  }

  async function completeTask() {
    await taskAction.mutateAsync("complete");

    setToasts((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        title: "Task Completed",
        description: `task ${task.title} was marked as completed.`,
        icon: "success",
      },
    ]);
  }

  function editTask() {
    
  }

  return (
    <article className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b border-(--secondary-gray) p-3 last:border-b-0">
      <div className="min-w-0">
        {task.subject ? (
          <Link
            to={`/subject/${encodeURIComponent(task.subject.name)}`}
            className="block max-w-full truncate text-xs capitalize tracking-wide text-(--text-secondary) leading-[normal] hover:underline"
          >
            {task.subject.name}
          </Link>
        ) : (
          <span className="text-xs text-(--text-secondary)">No subject</span>
        )}
        <h3 className="mt-1 truncate text-base font-semibold capitalize">
          <Link
            to={`/tasks/${encodeURIComponent(task.title)}`}
            className="hover:underline"
          >
            {task.title}
          </Link>
        </h3>
        <p className="mt-1 text-[11px] text-(--text-secondary)">{dueLabel}</p>
      </div>

      <div className="flex items-center gap-1 *:transition-colors *:disabled:cursor-wait *:rounded-lg *:duration-250">
        <button
          type="button"
          aria-label={`Mark ${task.title} complete`}
          disabled={taskAction.isPending}
          onClick={editTask}
          className="grid size-9 place-items-center hover:bg-zinc-400/25 text-green-600 disabled:opacity-50 dark:text-green-500"
        >

        </button>
        <button
          type="button"
          aria-label={`Mark ${task.title} complete`}
          disabled={taskAction.isPending}
          onClick={completeTask}
          className="grid size-9 place-items-center hover:bg-zinc-400/25 text-green-600 disabled:opacity-50 dark:text-green-500"
        >
          <svg
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m5 12 4 4L19 6" />
          </svg>
        </button>
        <button
          type="button"
          aria-label={`Delete ${task.title}`}
          title="Delete task"
          disabled={taskAction.isPending}
          onClick={deleteTask}
          className="grid size-9 place-items-center text-red-600 transition-colors hover:bg-zinc-400/25 disabled:opacity-50 dark:text-red-400"
        >
          <svg
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            width="17"
            height="17"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 6h18M8 6V4h8v2m3 0-1 14H6L5 6m4 4v6m6-6v6" />
          </svg>
        </button>
        <button
          type="button"
          onClick={startFocusTimer}
          className="hidden h-9 items-center gap-2 px-3 text-sm font-medium text-white bg-zinc-400 dark:bg-zinc-400/20 hover:bg-(--accent-100) dark:hover:bg-(--accent-100) sm:flex leading-[normal]"
        >
          <svg
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M5 5a2 2 0 0 1 3-1.7l12 7a2 2 0 0 1 0 3.4l-12 7A2 2 0 0 1 5 19z" />
          </svg>
          Start
        </button>
      </div>
    </article>
  );
}
