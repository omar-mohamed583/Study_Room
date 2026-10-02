import { useNavigate } from "react-router";
import type TaskItemType from "~/types/taskItemTypes";

export default function TaskItem({ id, title, subject }: TaskItemType) {
  const navigate = useNavigate();

  return (
    <div
      className="grid grid-cols-[1.1fr_.9fr] p-3 has-[+div]:border-b border-(--secondary-gray) items-center content-center"
      aria-label={`${title} (Today task)`}
    >
      <div className="grid *:leading-[normal]">
        <span
          className="[color:var(--text-secondary)] [font-size:var(--sm-text)] bulleted capitalize tracking-wide cursor-pointer truncate w-fit max-w-full"
          onClick={() => navigate(`/subject/${subject}`)}
        >
          {subject}
        </span>
        <h3
          className="text-[18px] mt-1 font-semibold capitalize truncate cursor-pointer max-w-full w-fit"
          onClick={() => navigate(`/tasks/${id}`)}
        >
          {title}
        </h3>
        <span className="[color:var(--text-secondary)] [font-size:11px]">
          Due 4:00 PM
        </span>
      </div>

      <div className="flex gap-1 flex-wrap justify-end *:cursor-pointer *:place-content-center *:not-[button:last-child]:grid *:not-[&_button:last-child]:hover:bg-zinc-400/20 in-[.dark]:*:not-[&_button:last-child]:hover:bg-zinc-400/20 *:rounded-lg *:p-2 items-center content-center **:transition-colors duration-200 justify-items-center">
        <button
          aria-label="Edit Task"
          className="stroke-(--text-secondary) hover:stroke-yellow-400"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lucide lucide-pencil"
          >
            <path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z" />
            <path d="m15 5 4 4" />
          </svg>
        </button>
        <button
          aria-label="Delete Task"
          className="stroke-(--text-secondary) hover:stroke-red-500"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lucide lucide-trash"
          >
            <path d="M10 11v6" />
            <path d="M14 11v6" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
            <path d="M3 6h18" />
            <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          </svg>
        </button>
        <button
          aria-label="Mark Task As Completed"
          className="stroke-(--text-secondary) hover:stroke-green-400"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lucide lucide-check"
          >
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </button>
        <button
          aria-label="Start Focus Timer For This Task"
          onClick={() => navigate(`/tasks/${id}`)}
          className="flex gap-2 items-center fill-(--text-secondary) text-sm leading-[normal] bg-zinc-300 in-[.dark]:bg-zinc-400/20 hover:bg-(--accent-100) hover:fill-white hover:text-white"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lucide lucide-play"
          >
            <path d="M5 5a2 2 0 0 1 3.008-1.728l11.997 6.998a2 2 0 0 1 .003 3.458l-12 7A2 2 0 0 1 5 19z" />
          </svg>
          <span className="hidden md:inline-block">Start</span>
        </button>
      </div>
    </div>
  );
}
