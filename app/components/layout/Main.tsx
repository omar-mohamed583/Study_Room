import { Suspense, useLayoutEffect, useRef, useState } from "react";
import { Link, redirect, useNavigate } from "react-router";
import type DefaultMainSecType from "~/types/defaultMain";
import type SubjectTypes from "~/types/subjectTypes";
import type TaskItemType from "~/types/taskItemTypes";
import { fakeData } from "~/api/fakeapi";
import Button from "../ui/Button";
import Header from "./Header";
import { useAuth } from "../providers/authProvider";
import LoadingComponent from "../ui/LoadingComponent";
import Particles from "../ui/Particles";
import useTheme from "~/context/themeContext";

export default function DefaultMain() {
  const { user } = useAuth();
  console.log(user);

  useLayoutEffect(() => {
    document.body.style.paddingBottom = "3em";
  });

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

          <DefaultMainSection sectionTitle="Subjects">
            {fakeData.SUBJECT.map((subj) => (
              <SubjectItem
                id={subj.id}
                key={subj.id}
                title={subj.title}
                creationDate={subj.creationDate}
                completedTasks={subj.completed}
                tasksCount={subj.tasksCount}
                timeSpent={subj.timeSpent}
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
            <Suspense fallback={<LoadingComponent loading={user} />}>
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

          <DefaultMainSection>
            <div></div>
          </DefaultMainSection>
        </section>
      </main>
    </>
  );
}

function DefaultMainSection({
  children,
  sectionTitle = "",
  shrinkable = true,
  bgImage = "",
  alignContentBetween = false,
}: DefaultMainSecType) {
  const {theme} = useTheme();
  const mainRef = useRef<null | HTMLDivElement>(null);
  const maximumHeightValue = useRef(0);

  const [height, setHeight] = useState<null | Number>();

  useLayoutEffect(() => {
    if (!mainRef?.current) return;

    mainRef.current.style.height = "fit-content";
    maximumHeightValue.current = mainRef.current.getBoundingClientRect().height;
    setHeight(maximumHeightValue?.current);

    return () => {
      console.log(mainRef?.current?.getBoundingClientRect().height);
      setHeight(mainRef?.current?.getBoundingClientRect().height);
    };
  }, [window.innerWidth]);

  return (
    <section
      className={`relative show rounded-[17px] border border-(--border-clr) overflow-hidden ${bgImage && "bg-image"}`}
      style={{
        maxHeight: "fit-content",
      }}
    >
      {sectionTitle && (
        <header className="p-5 py-7 flex justify-between items-center content-center transition-colors not-[.show_&]:border-b-transparent">
          <h2 className="text-xl leading-[normal] font-medium">
            {sectionTitle}
          </h2>
          {shrinkable && (
            <button
              aria-label="Shrink/Expand Section"
              className="*:transition-opacity duration-300 in-[.show]:[&>svg:first-child]:opacity-100 in-[.show]:[&>svg:last-child]:opacity-0 cursor-pointer grid not-[.show_&]:[&>svg:first-child]:opacity-0 [grid-template-areas:'stack'] *:[grid-area:stack] rounded-xl border border-gray-400/20 p-1"
              onClick={() => {
                mainRef?.current?.classList.toggle("show");
                mainRef?.current?.closest("section")?.classList.toggle("show");
                setHeight(height === 0 ? maximumHeightValue.current : 0);
              }}
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
                className="lucide lucide-minimize-2"
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
                className="lucide lucide-maximize-2"
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

      <main
        className="show transition-[opacity,scale,height] duration-400 [&.show]:scale-y-100 origin-top [&.show_*]:opacity-100 not-[&.show_*]:opacity-0 not-[&.show]:scale-y-90 will-change-[height] overflow-auto scrollbar-none overscroll-contain"
        ref={bgImage ? null : mainRef}
        style={{
          height: `${height}px`,
          alignContent: alignContentBetween ? "space-between" : "",
          display: alignContentBetween ? "grid" : "",
          paddingBlock: alignContentBetween ? "2.5rem" : "",
          gap: "5rem",
        }}
      >
        {children}
      </main>
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
      className="bg-(--items-bg) grid grid-cols-[1.3fr_.7fr] py-4 px-3 has-[+div]:border-b border-(--secondary-gray) items-center content-center"
      aria-label={`${title} (Today task)`}
    >
      <div className="grid gap-2 *:leading-[normal]">
        <span className="text-(--text-secondary) bulleted capitalize">
          {subject} /
        </span>
        <h3 className="indent-4 text-2xl font-semibold capitalize">{title}</h3>
      </div>

      <div className="flex gap-2 flex-wrap justify-end *:cursor-pointer *:place-content-center *:grid *:hover:brightness-75">
        <button aria-label="Edit Task">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lucide lucide-pencil"
          >
            <path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z" />
            <path d="m15 5 4 4" />
          </svg>
        </button>
        <button aria-label="Delete Task">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
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
        <button aria-label="Mark Task As Completed">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
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
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lucide lucide-play"
          >
            <path d="M5 5a2 2 0 0 1 3.008-1.728l11.997 6.998a2 2 0 0 1 .003 3.458l-12 7A2 2 0 0 1 5 19z" />
          </svg>
        </button>
      </div>
    </div>
  );
}

function SubjectItem({
  id,
  creationDate,
  title,
  tasksCount,
  completedTasks,
  timeSpent,
}: SubjectTypes) {
  return (
    <div className="flex justify-between gap-4 flex-wrap p-3 py-4 has-[+div]:border-b border-(--secondary-gray) bg-(--items-bg)">
      <div className="leading-[normal] grid gap-3">
        <span className="text-sm text-(--pale-text)">
          Created {creationDate?.getDate()} days ago
        </span>
        <h3 className="text-2xl font-semibold">{title}</h3>
      </div>

      <div className="flex gap-4 *:grid *:text-center *:gap-3">
        <div>
          <span className="leading-[normal] text-sm">Tasks</span>
          <span className="text-2xl font-semibold leading-[normal]">{`${tasksCount}`}</span>
        </div>

        <div>
          <span className="leading-[normal] text-sm">Completed</span>
          <span className="text-2xl font-semibold leading-[normal]">{`${completedTasks}`}</span>
        </div>

        <div>
          <span className="leading-[normal] text-sm">Time Spent</span>
          <span className="text-2xl font-semibold leading-[normal]">{`${timeSpent}`}</span>
        </div>
      </div>
    </div>
  );
}

export const clientMiddleware = [authMiddleware];

async function authMiddleware() {
  const jwt = localStorage?.getItem("jwt");
  console.log(jwt);

  if (!localStorage)
    return setTimeout(() => {
      const jwt = localStorage.getItem("jwt");
      if (!jwt) throw redirect("/login");
    }, 10);

  if (!jwt) throw redirect("/login");
}
