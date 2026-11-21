import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Trash01 } from "@untitledui/icons";
import { Check, Pen, Play } from "lucide-react";
import { Link, useNavigate } from "react-router";
import { apiFetch } from "~/api/api";
import { queryKeys } from "~/api/queryKeys";
import useTheme from "~/context/themeContext";
import type { Task } from "~/types/taskType";

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
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks }),
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

      <div className="flex items-center gap-1.5 *:transition-colors *:disabled:cursor-wait *:rounded-lg *:duration-250 *:border">
        <button
          type="button"
          aria-label={`Edit ${task.title}`}
          disabled={taskAction.isPending}
          onClick={editTask}
          className="grid size-9 place-items-center hover:bg-zinc-400/25 text-amber-600 disabled:opacity-50 dark:text-amber-500"
        >
          <Pen width={17} height={17} />
        </button>
        <button
          type="button"
          aria-label={`Mark ${task.title} complete`}
          disabled={taskAction.isPending}
          onClick={completeTask}
          className="grid size-9 place-items-center hover:bg-zinc-400/25 text-green-600 disabled:opacity-50 dark:text-green-500"
        >
          <Check width={17} height={17} />
        </button>
        <button
          type="button"
          aria-label={`Delete ${task.title}`}
          disabled={taskAction.isPending}
          onClick={deleteTask}
          className="grid size-9 place-items-center text-red-600 transition-colors hover:bg-zinc-400/25 disabled:opacity-50 dark:text-red-400"
        >
          <Trash01 width={16} height={16} />
        </button>
        <button
          type="button"
          onClick={startFocusTimer}
          className="hidden h-9 items-center gap-2 px-3 text-sm font-medium text-white bg-zinc-400 dark:bg-zinc-400/20 hover:bg-(--accent-100) dark:hover:bg-(--accent-100) sm:flex leading-[normal]"
        >
          <Play width={14} height={14} />
          Start
        </button>
      </div>
    </article>
  );
}
