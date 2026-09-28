import { Suspense, useLayoutEffect, useState } from "react";
import { Link, redirect, useNavigate } from "react-router";
import type DefaultMainSecType from "~/types/defaultMain";
import type SubjectTypes from "~/types/subjectTypes";
import type TaskItemType from "~/types/taskItemTypes";
import { fakeData } from "~/api/fakeapi";
import Button from "../ui/Button";
import Header from "./Header";
import { useAuth } from "../providers/authProvider";
import LoadingComponent from "../ui/LoadingComponent";
import { twMerge } from "cn";



export default function DefaultMain() {
  const { user } = useAuth();

  useLayoutEffect(() => {
    document.body.style.paddingBottom = "3em";
  }, []); // empty deps — this only needs to run once, not on every render

  const btns = [
    {
      svg: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="lucide lucide-list-todo preview-icon"
        >
          <path d="M13 5h8" />
          <path d="M13 12h8" />
          <path d="M13 19h8" />
          <path d="m3 17 2 2 4-4" />
          <rect
            x="3"
            y="4"
            width="6"
            height="6"
            rx="1"
          />
        </svg>
      ),
      name: "Start new task",
      variation: "bg-(--accent-100) text-white",
      toLocation: "/tasks/new",
    },
    {
      svg: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="lucide lucide-clipboard-check preview-icon"
        >
          <rect
            width="8"
            height="4"
            x="8"
            y="2"
            rx="1"
            ry="1"
          />
          <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
          <path d="m9 14 2 2 4-4" />
        </svg>
      ),
      name: "Set new exam",
      variation: "bg-(--btns-bg) text-black",
      toLocation: "/exam/new",
    },
    {
      svg: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="lucide lucide-timer preview-icon"
        >
          <line
            x1="10"
            x2="14"
            y1="2"
            y2="2"
          />
          <line
            x1="12"
            x2="15"
            y1="14"
            y2="11"
          />
          <circle
            cx="12"
            cy="14"
            r="8"
          />
        </svg>
      ),
      name: "Start focus timer",
      variation: "bg-(--accent-200) text-white",
      toLocation: "/focus-timer",
    },
    {
      svg: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="lucide lucide-calendar-days preview-icon"
        >
          <path d="M8 2v3" />
          <path d="M16 2v3" />
          <rect
            x="3"
            y="3"
            width="18"
            height="18"
            rx="2"
          />
          <path d="M3 9h18" />
          <path d="M8 13h.01" />
          <path d="M12 13h.01" />
          <path d="M16 13h.01" />
          <path d="M8 17h.01" />
          <path d="M12 17h.01" />
          <path d="M16 17h.01" />
        </svg>
      ),
      name: "See calendar",
      variation: "bg-(--btns-bg) text-black",
      toLocation: "/calendar",
    },
    {
      svg: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="lucide lucide-chart-no-axes-column-increasing preview-icon"
        >
          <path d="M5 21v-6" />
          <path d="M12 21V9" />
          <path d="M19 21V3" />
        </svg>
      ),
      name: "See your progress",
      variation: "bg-(--accent-100) text-white",
      toLocation: "/dashboard",
    },
  ];

  return (
    <>
      <Header />
      <main className="relative grid grid-cols-2 gap-8 max-w-325 mx-auto px-4 md:px-8">
        <section className="flex flex-col gap-12 bg-(--sect-bg) p-4 rounded-[25px]">
          <DefaultMainSection sectionTitle="Today Tasks">
            {fakeData.TASK.map((task) => (
              <TaskItem
                id={task.id}
                key={task.id}
                subject={task.subject}
                title={task.title}
              />
            ))}
          </DefaultMainSection>
        </section>

        <section className="flex flex-col gap-12 bg-(--sect-bg) p-4 rounded-[25px]">
          <DefaultMainSection
            shrinkable={false}
            alignContentBetween
            bgImage="../../assets/hope.jpg"
          >
            <Suspense fallback={<LoadingComponent loading={user?.username} />}>
              <div className="px-3">
                <h2 className="font-medium text-3xl text-white leading-[normal] text-center capitalize">
                  Have A Good Day,<br></br>
                  {user?.username} 👋
                </h2>
              </div>
            </Suspense>

            <div className="px-3">
              <h4 className="text-2xl text-center leading-[normal] text-white mb-5 text-shadow-lg text-shadow-black">
                What Do You Want To Do ?
              </h4>

              <div className="flex justify-center gap-6 gap-y-4 flex-wrap">
                {btns.map((btn) => (
                  <Button
                    key={btn.name}
                    className={
                      btn.variation +
                      " flex gap-1 items-center content-center text-[.9rem] px-4 hover:brightness-75 transition-[filter] duration-200"
                    }
                    navigation={{ to: btn.toLocation }}
                  >
                    {btn.svg}
                    {btn.name}
                  </Button>
                ))}
              </div>
            </div>
          </DefaultMainSection>
        </section>

        <section className="flex flex-col gap-12 bg-(--sect-bg) p-4 rounded-[25px] [grid-area:2/1/3/3]">
          <DefaultMainSection sectionTitle="Subjects">
            {
              <SubjectItem
                subjects={fakeData.SUBJECT}
                stripped
              />
            }
          </DefaultMainSection>
        </section>
      </main>
    </>
  );
}

function DefaultMainSection({
  children,
  sectionTitle = "",
  className,
  shrinkable = true,
  bgImage = "",
  alignContentBetween = false,
}: DefaultMainSecType) {
  const [expanded, setExpanded] = useState(true);

  return (
    <section
      className={twMerge(
        `relative rounded-[17px] border border-zinc-400/50 overflow-hidden ${bgImage && "bg-image"} ${className}`,
      )}
    >
      {sectionTitle && (
        <header className="p-4 flex justify-between items-center content-center transition-colors">
          <h2 className="text-xl leading-[normal] font-medium">
            {sectionTitle}
          </h2>
          {shrinkable && (
            <button
              type="button"
              aria-label="Shrink/Expand Section"
              aria-expanded={expanded}
              onClick={() => setExpanded((v) => !v)}
              className="cursor-pointer grid [grid-template-areas:'stack'] *:[grid-area:stack] rounded-xl border border-zinc-400 in-[.dark]:border-zinc-400/50 p-1.5 hover:border-black in-[.dark]:hover:border-zinc-400"
            >
              {/* Shrink Svg */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={`lucide lucide-minimize-2 transition-opacity duration-300 ${expanded ? "opacity-100" : "opacity-0"}`}
              >
                <path d="m14 10 7-7" />
                <path d="M20 10h-6V4" />
                <path d="m3 21 7-7" />
                <path d="M4 14h6v6" />
              </svg>

              {/* Expand Svg */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={`lucide lucide-maximize-2 transition-opacity duration-300 ${expanded ? "opacity-0" : "opacity-100"}`}
              >
                <path d="M15 3h6v6" />
                <path d="m21 3-7 7" />
                <path d="m3 21 7-7" />
                <path d="M9 21H3v-6" />
              </svg>
            </button>
          )}
        </header>
      )}

      <div
        className="grid transition-[grid-template-rows] duration-300 ease-out"
        style={{ gridTemplateRows: shrinkable && !expanded ? "0fr" : "1fr" }}
      >
        <div className="overflow-hidden min-h-0">
          <main
            className="overflow-auto scrollbar-none overscroll-contain p-2"
            style={{
              alignContent: alignContentBetween ? "space-between" : undefined,
              display: alignContentBetween ? "grid" : undefined,
              paddingBlock: alignContentBetween ? "2.5rem" : undefined,
              gap: "5rem",
            }}
          >
            {children}
          </main>
        </div>
      </div>

      {sectionTitle && (
        <Link
          to={""}
          className="block p-2 text-white text-center px-6 bg-(--accent-300)"
        >
          See more...
        </Link>
      )}
    </section>
  );
}

function TaskItem({ id, title, subject }: TaskItemType) {
  const navigate = useNavigate();

  return (
    <div
      className="grid grid-cols-[1.1fr_.9fr] p-3 has-[+div]:border-b border-(--secondary-gray) items-center content-center"
      aria-label={`${title} (Today task)`}
    >
      <div className="grid gap-1 *:leading-[normal]">
        <span
          className="[color:var(--text-secondary)] [font-size:var(--sm-text)] bulleted capitalize tracking-wide cursor-pointer truncate w-fit max-w-full"
          onClick={() => navigate(`/subject/${subject}`)}
        >
          {subject}
        </span>
        <h3
          className="text-[17px] font-semibold capitalize truncate cursor-pointer max-w-full w-fit"
          onClick={() => navigate(`/tasks/${id}`)}
        >
          {title}
        </h3>
        <span className="[color:var(--text-secondary)] [font-size:var(--sm-text)]">
          Due 4:00 PM
        </span>
      </div>

      <div className="flex gap-1 flex-wrap justify-end *:cursor-pointer *:place-content-center *:not-[button:last-child]:grid *:not-[&_button:last-child]:hover:bg-zinc-400/20 in-[.dark]:*:not-[&_button:last-child]:hover:bg-zinc-400/20 *:rounded-lg *:p-2 items-center content-center **:transition-colors duration-200">
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
          Start
        </button>
      </div>
    </div>
  );
}

function SubjectItem({ subjects, stripped }: SubjectTypes) {
  return (
    <table className="w-full">
      <thead className="**:p-2">
        <tr className="*:text-(--text-secondary)">
          <td>Subject</td>
          <td className="text-center">Tasks</td>
          <td className="text-center">Completed</td>
          <td className="text-center">Progress</td>
        </tr>
      </thead>
      <tbody className="**:p-1 *:not-[tr:last-child]:border-b border-b-zinc-400">
        {subjects.map((subject) => (
          <tr>
            <td className="grid p-1">
              <h3>{subject.title}</h3>
              <span className="[color:var(--text-secondary)] [font-size:13px]">
                {subject.creationDate.toDateString()}
              </span>
            </td>
            <td className="text-center">{subject.tasksCount}</td>
            <td className="text-center">{subject.completedTasks}</td>
            <td className="text-center">
              {Math.trunc(subject.tasksCount / subject.completedTasks)}%
            </td>
            <td>{subject.title}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export const clientMiddleware = [authMiddleware];

async function authMiddleware() {
  const jwt = localStorage?.getItem("jwt");

  if (!localStorage)
    return setTimeout(() => {
      const jwt = localStorage.getItem("jwt");
      if (!jwt) throw redirect("/login");
    }, 10);

  if (!jwt) throw redirect("/login");
}
