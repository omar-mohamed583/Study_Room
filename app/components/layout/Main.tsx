import { useLayoutEffect, useRef, useState } from "react";
import {
  Link,
  redirect,
  RouterContextProvider,
  useNavigate,
} from "react-router";
import type DefaultMainSecType from "~/types/defaultMain";
import type SubjectTypes from "~/types/subjectTypes";
import type TaskItemType from "~/types/taskItemTypes";
import { fakeData } from "~/api/fakeapi";
import Button from "../ui/Button";
import { userContext } from "~/context/userContext";
import Header from "./Header";

export default function DefaultMain() {
  return (
    <>
      <Header />
      <main className="relative grid grid-cols-2 gap-8 max-w-330 mx-auto px-4 md:px-8">
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
            <div className="px-3">
              <h2 className="font-medium text-3xl text-white leading-[normal] text-center">
                Have A Good Day,<br></br>
                {fakeData.NAME} 👋
              </h2>
            </div>

            <div className="px-3">
              <h4 className="text-2xl text-center leading-[normal] text-white mb-5 text-shadow-lg text-shadow-black">
                What Do You Want To Do ?
              </h4>

              <div className="flex justify-center gap-6 gap-y-4 flex-wrap">
                {[
                  {
                    name: "Start new task",
                    variation: "bg-(--accent-100) text-white",
                    toLocation: "/tasks/new",
                  },
                  {
                    name: "Set new exam",
                    variation: "bg-(--btns-bg) text-black",
                    toLocation: "/exam/new",
                  },
                  {
                    name: "Start focus timer",
                    variation: "bg-(--accent-200) text-white",
                    toLocation: "/focus-timer",
                  },
                  {
                    name: "See calendar",
                    variation: "bg-(--btns-bg) text-black",
                    toLocation: "/calendar",
                  },
                  {
                    name: "See your progress",
                    variation: "bg-(--accent-100) text-white",
                    toLocation: "/dashboard",
                  },
                ].map((btn) => (
                  <Button
                    key={btn.name}
                    className={
                      btn.variation + " text-[.9rem] px-4 hover:brightness-75"
                    }
                    navigation={{ to: btn.toLocation }}
                  >
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
  const mainRef = useRef<null | HTMLDivElement>(null);
  const maximumHeightValue = useRef(0);

  const [height, setHeight] = useState<null | Number>();

  useLayoutEffect(() => {
    if (!mainRef?.current) return;

    mainRef.current.style.height = "fit-content";
    maximumHeightValue.current = mainRef.current.getBoundingClientRect().height;
    setHeight(maximumHeightValue?.current);
  }, [window.innerWidth]);

  return (
    <section
      className={`show rounded-[17px] border border-(--border-clr) overflow-hidden ${bgImage && "bg-image"}`}
      style={{
        maxHeight: "fit-content",
      }}
    >
      {sectionTitle && (
        <header className="p-5 flex justify-between items-center content-center border-b border-b-(--border-clr) transition-colors not-[.show_&]:border-b-transparent">
          <h2 className="text-xl leading-[normal] font-medium">
            {sectionTitle}
          </h2>
          {shrinkable && (
            <button
              aria-label="Shrink/Expand Section"
              className="*:transition-opacity duration-300 in-[.show]:[&>svg:first-child]:opacity-100 in-[.show]:[&>svg:last-child]:opacity-0 cursor-pointer grid not-[.show_&]:[&>svg:first-child]:opacity-0 [grid-template-areas:'stack'] *:[grid-area:stack]"
              onClick={() => {
                mainRef?.current?.classList.toggle("show");
                mainRef?.current?.closest("section")?.classList.toggle("show");
                setHeight(height === 0 ? maximumHeightValue.current : 0);
              }}
            >
              {/* Shrink Svg */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                height="19px"
                viewBox="0 -960 960 960"
                width="19px"
                className="rotate-45 ml-0.5 mt-0.5 fill-(--text-primary)"
              >
                <path d="m296-80-56-56 240-240 240 240-56 56-184-184L296-80Zm184-504L240-824l56-56 184 184 184-184 56 56-240 240Z" />
              </svg>

              {/* Expand Svg */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                height="24px"
                viewBox="0 -960 960 960"
                width="24px"
                className="fill-(--text-primary)"
              >
                <path d="M200-200v-240h80v160h160v80H200Zm480-320v-160H520v-80h240v240h-80Z" />
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
      <div className="grid gap-4 *:leading-[normal]">
        <span className="text-(--text-secondary)">{subject} /</span>
        <h3 className="indent-4 text-2xl font-semibold">{title}</h3>
      </div>

      <div className="flex gap-2 flex-wrap *:aspect-square *:rounded-md *:w-9 *:bg-(--accent-200) justify-end *:cursor-pointer *:shadow-[0px_3px_4px_0px_rgba(0_0_0/0.56)] *:fill-white *:text-(--contrast-text) *:place-content-center *:grid *:hover:brightness-75">
        <button>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            height="24px"
            viewBox="0 -960 960 960"
            width="24px"
          >
            <path d="M200-200h57l391-391-57-57-391 391v57Zm-80 80v-170l528-527q12-11 26.5-17t30.5-6q16 0 31 6t26 18l55 56q12 11 17.5 26t5.5 30q0 16-5.5 30.5T817-647L290-120H120Zm640-584-56-56 56 56Zm-141 85-28-29 57 57-29-28Z" />
          </svg>
        </button>
        <button>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            height="24px"
            viewBox="0 -960 960 960"
            width="24px"
          >
            <path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z" />
          </svg>
        </button>
        <button aria-label="Mark Task As Completed">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            height="24px"
            viewBox="0 -960 960 960"
            width="24px"
          >
            <path d="M268-240 42-466l57-56 170 170 56 56-57 56Zm226 0L268-466l56-57 170 170 368-368 56 57-424 424Zm0-226-57-56 198-198 57 56-198 198Z" />
          </svg>
        </button>
        <button
          aria-label="Start Focus Timer For This Task"
          onClick={() => navigate(`/tasks/${id}`)}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            height="24px"
            viewBox="0 -960 960 960"
            width="24px"
          >
            <path d="M320-200v-560l440 280-440 280Zm80-280Zm0 134 210-134-210-134v268Z" />
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

type MiddlewareArgs = {
  request: Request;
  context: Readonly<RouterContextProvider>;
};

async function authMiddleware() {
  const jwt = localStorage?.getItem("jwt");
  console.log(jwt)
  if (!jwt) throw redirect("/login");
}
