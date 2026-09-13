import { useLayoutEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router";
import type DefaultMainSecType from "~/types/defaultMain";
import type SubjectTypes from "~/types/subjectTypes";
import type TaskItemType from "~/types/taskItemTypes";

export default function DefaultMain() {
  const fakeData = {
    NAME: "Omar",
    TASK: [
      {
        id: crypto.randomUUID(),
        title: "Do Homework",
        subject: "Arabic",
      },
      {
        id: crypto.randomUUID(),
        title: "Attend The Class",
        subject: "English",
      },
      {
        id: crypto.randomUUID(),
        title: "Prepare For The Test",
        subject: "Mechanics",
      },
    ],
    SUBJECT: [
      {
        id: crypto.randomUUID(),
        creationDate: new Date(),
        title: "Maths",
        tasksCount: 15,
        completed: 8,
        timeSpent: 2,
      },
      {
        id: crypto.randomUUID(),
        creationDate: new Date(),
        title: "Arabic",
        tasksCount: 7,
        completed: 3,
        timeSpent: 1,
      },
      {
        id: crypto.randomUUID(),
        creationDate: new Date(),
        title: "English",
        tasksCount: 10,
        completed: 5,
        timeSpent: 3,
      },
      {
        id: crypto.randomUUID(),
        creationDate: new Date(),
        title: "Mechanics",
        tasksCount: 2,
        completed: 1,
        timeSpent: 1,
      },
    ],
  };

  return (
    <main className="grid grid-cols-2 gap-4 max-w-350 mx-auto px-4 md:px-8">
      <section className="flex flex-col gap-8 bg-(--sect-bg) p-3 rounded-[25px]">
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

      <section className="flex flex-col gap-8 bg-(--sect-bg) p-3 rounded-[25px]">
        <DefaultMainSection
          shrinkable={false}
          alignContentBetween
        >
          <div className="px-3 pt-5">
            <h2 className="font-medium text-3xl text-white leading-[normal] text-center">
              Have A Good Day,<br></br>
              {fakeData.NAME} 👋
            </h2>
          </div>

          <div className="px-3 pt-5">
            <h4 className="text-xl text-center leading-[normal] text-white">
              What Do You Want To Do ?
            </h4>
          </div>
        </DefaultMainSection>

        <DefaultMainSection>
          <div></div>
        </DefaultMainSection>
      </section>
    </main>
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
  }, []);

  return (
    <section
      className="show rounded-[17px] border border-(--border-clr) overflow-hidden"
      style={{
        maxHeight: "fit-content",
        backgroundImage: bgImage && `url(${bgImage})`,
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
        className="h-full show transition-[opacity,scale,height] duration-400 [&.show]:scale-y-100 origin-top [&.show_*]:opacity-100 not-[&.show_*]:opacity-0 not-[&.show]:scale-y-90 will-change-[height] overflow-auto scrollbar-none"
        ref={bgImage ? null : mainRef}
        style={{
          height: `${height}px`,
          alignContent: alignContentBetween ? "space-between" : "",
          display: alignContentBetween ? "grid" : "",
          paddingBlock: alignContentBetween ? "2.5rem" : "",
        }}
      >
        {children}
      </main>
      {sectionTitle && (
        <Link
          to={""}
          className="block p-3 text-white text-center px-4 bg-(--accent-200)"
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
      onClick={() => navigate(`/tasks?id=${id}`)}
    >
      <div className="grid gap-4 *:leading-[normal]">
        <span className="text-(--text-secondary)">{subject} /</span>
        <h3 className="indent-4 text-2xl font-bold">{title}</h3>
      </div>

      <div className="flex gap-2 flex-wrap *:aspect-square *:rounded-md *:w-10 *:bg-(--accent-300) justify-end *:cursor-pointer *:shadow-[0px_3px_4px_0px_rgba(0_0_0/0.56)] *:fill-(--contrast-text) *:text-(--contrast-text) *:place-content-center *:grid">
        <button>f</button>
        <button>d</button>
        <button>d</button>
        <button>d</button>
        <button>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            height="24px"
            viewBox="0 -960 960 960"
            width="24px"
            fill="#fff"
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
        <h3 className="text-3xl font-medium">{title}</h3>
      </div>

      <div className="flex gap-4 *:grid *:text-center *:gap-2">
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
