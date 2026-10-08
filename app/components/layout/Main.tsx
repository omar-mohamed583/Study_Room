import { Suspense, useLayoutEffect, useMemo, useRef } from "react";
import {
  Link,
  redirect,
  type LinksFunction,
  type MetaFunction,
} from "react-router";
import type DefaultMainSecType from "~/types/defaultMain";
import { fakeData } from "~/api/fakeapi";
import Button from "../ui/Button";
import Header from "./Header";
import { useAuth } from "../providers/authProvider";
import LoadingComponent from "../ui/LoadingComponent";
import { twMerge } from "cn";
import SmallParticles from "../ui/smallParticles";
import TaskItem from "../ui/TaskItem";
import SubjectItem from "../ui/SubjectItem";
import FocusTimer from "../ui/FocusTimer";
import UpcomingDeadlines from "../ui/UpcomingDeadlineComponent";
import type { Exam, Task } from "~/types/deadlines";
import MyPie from "../ui/PieChart";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import useTheme from "~/context/themeContext";
import SwipeToast from "../ui/SwipeToast";
import { getIcon } from "../providers/themeContextprovider";
import ProgressBars from "../ui/ProgressBar";
import EmptyState from "../ui/EmptyState";

export const GS_Duration = 0.6;
export const GS_DELAY = 0.1;

export const links: LinksFunction = () => [
  {
    rel: "icon",
    as: "image",
    href: "../../assets/logo.svg",
  },
];

export const meta: MetaFunction = () => [
  {
    title: "Study Planner - Main Page",
  },
  {
    name: "",
    content: "",
  },
];

gsap.registerPlugin(useGSAP, ScrollTrigger);

export default function DefaultMain() {
  // Gsap Setup
  const container = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.utils.toArray<HTMLElement>(".gs-animate").forEach((el) => {
          gsap.from(el, {
            opacity: 0,
            y: 50,
            duration: GS_Duration,
            ease: "power2.out",
            scrollTrigger: {
              trigger: el,
              start: "top 85%",
              toggleActions: "play none none none",
            },
          });
        });
      });
    },
    { scope: container },
  );

  // Fake Data
  const fakePieData = [
    {
      id: "Maths",
      label: "Maths",
      value: 0.6 * 60,
      color: "hsl(200, 70%, 50%)",
    },
    {
      id: "English",
      label: "English",
      value: 3 * 60,
      color: "hsl(290, 70%, 50%)",
    },
    {
      id: "Science",
      label: "Science",
      value: 1 * 60,
      color: "hsl(43, 70%, 50%)",
    },
    {
      id: "Programming",
      label: "Programming",
      value: 4 * 60,
      color: "hsl(98, 70%, 50%)",
    },
    {
      id: "Mechanics",
      label: "Mechanics",
      value: 4 * 60,
      color: "hsl(165, 70%, 50%)",
    },
  ];
  const at = (days: number, hour = 12, minute = 0) => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    date.setHours(hour, minute, 0, 0);
    return date.toISOString();
  };
  const fakeTasks: Task[] = useMemo<Task[]>(
    () => [
      // Overdue -> solid red tile
      {
        id: 1,
        title: "submit chemistry lab report",
        dueDate: at(-1, 18),
        priority: "high",
        estimatedDuration: 90,
        completed: false,
        subject: { id: 1, title: "chemistry" },
      },
      // Today -> solid orange tile
      {
        id: 2,
        title: "finish calculus problem set",
        dueDate: at(0, 23, 30),
        priority: "medium",
        estimatedDuration: 120,
        completed: false,
        subject: { id: 2, title: "calculus" },
      },
      // Tomorrow -> tinted orange tile
      {
        id: 3,
        title: "read chapter 6 of operating systems",
        dueDate: at(1, 9),
        priority: "low",
        estimatedDuration: 45,
        completed: false,
        subject: { id: 3, title: "operating systems" },
      },
      // In 4 days -> neutral tile, exactly 1 hour
      {
        id: 4,
        title: "train the linear regression model",
        dueDate: at(4, 16),
        priority: "medium",
        estimatedDuration: 60,
        completed: false,
        subject: { id: 4, title: "machine learning" },
      },
      // In 9 days -> no priority, no duration, no subject
      {
        id: 5,
        title: "plan the group presentation",
        dueDate: at(9, 14),
        completed: false,
      },
      // In 16 days -> shows as "In 2 weeks"
      {
        id: 6,
        title: "write the research paper outline",
        dueDate: at(16, 10),
        priority: "high",
        estimatedDuration: 150,
        completed: false,
        subject: { id: 5, title: "english" },
      },
      // Should NOT appear: already completed
      {
        id: 7,
        title: "hand in the physics worksheet",
        dueDate: at(2, 11),
        priority: "low",
        completed: true,
        subject: { id: 6, title: "physics" },
      },
      // Should NOT appear: no due date
      {
        id: 8,
        title: "someday: organize my notes",
        completed: false,
      },
    ],
    [],
  );
  const fakeExams: Exam[] = useMemo<Exam[]>(
    () => [
      // In 2 days -> 3 topics
      {
        id: 1,
        title: "calculus midterm",
        examDate: at(2, 10),
        subject: { id: 2, title: "calculus" },
        exam_topics: [{ id: 1 }, { id: 2 }, { id: 3 }],
      },
      // In 6 days -> exactly 1 topic ("1 topic", not "1 topics")
      {
        id: 2,
        title: "operating systems quiz",
        examDate: at(6, 13, 30),
        subject: { id: 3, title: "operating systems" },
        exam_topics: [{ id: 4 }],
      },
      // In 3 weeks -> no topics, no subject
      {
        id: 3,
        title: "machine learning final",
        examDate: at(21, 9),
      },
      // Should NOT appear: exam already happened
      {
        id: 4,
        title: "chemistry quiz 1",
        examDate: at(-3, 10),
        subject: { id: 1, title: "chemistry" },
        exam_topics: [{ id: 5 }, { id: 6 }],
      },
    ],
    [],
  );

  const fakeProgressItems = [];

  // End Fake Data

  const { user } = useAuth();

  const { toasts, setToasts, theme } = useTheme();

  useLayoutEffect(() => {
    document.body.style.paddingBottom = "3em";
  }, []);

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
          className="lucide lucide-plus preview-icon"
        >
          <path d="M5 12h14" />
          <path d="M12 5v14" />
        </svg>
      ),
      name: "Create new subject",
      variation: "bg-(--accent-200) text-white",
      toLocation: "/subject/new",
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
      <main
        ref={container}
        className="relative grid grid-cols-2 gap-8 max-w-350 mx-auto px-4 md:px-8 *:grid *:gap-12 *:bg-(--sect-bg) *:p-3 *:rounded-[25px] *:overflow-auto max-[1010px]:grid-cols-1 *:shadow-[0_0_10px_0_var(--contrast-text)]"
      >

        <section className="gs-animate">
          <DefaultMainSection
            seeMore={!!fakeTasks.length}
            sectionDescription="Tasks you need to complete today"
            sectionTitleLogo={
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
                className="lucide lucide-shell preview-icon"
              >
                <path d="M14 11a2 2 0 1 1-4 0 4 4 0 0 1 8 0 6 6 0 0 1-12 0 8 8 0 0 1 16 0 10 10 0 1 1-20 0 11.93 11.93 0 0 1 2.42-7.22 2 2 0 1 1 3.16 2.44" />
              </svg>
            }
            sectionTitle="Today Tasks"
            to="/tasks/today"
          >
            {!fakeData.TASK.length && <EmptyState emptyStateTitle="Tasks" to="tasks/new" icon="task" />}
            {fakeData?.TASK?.map((task) => (
              <TaskItem
                id={task.id}
                key={task.id}
                subject={task.subject}
                title={task.title}
              />
            ))}
          </DefaultMainSection>
        </section>

        <section className="gs-animate">
          <UpcomingDeadlines
            exams={fakeExams}
            limit={4}
            tasks={fakeTasks}
          />
        </section>

        <section className="min-[1011px]:[grid-area:1/2/2/3] max-[1010px]:row-1 min-h-120 relative gs-animate">
          <SmallParticles />
          <DefaultMainSection
            className="border-0"
            alignContentBetween
          >
            <Suspense fallback={<LoadingComponent loading={user?.username} />}>
              <div className="px-3">
                <h2 className="font-medium text-3xl text-white leading-[normal] text-center capitalize">
                  Have A Good Day,<br></br>
                  {user?.username} 👋
                </h2>
              </div>
            </Suspense>

            <div className="px-3 pb-10">
              <h4 className="text-2xl text-center leading-[normal] text-white mb-5 text-shadow-lg text-shadow-blue-800/40">
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
        <section className="gs-animate">
          <DefaultMainSection
            sectionTitle="Focus Timer"
            sectionDescription="Stay focused and make the most of your study time"
            to="/focus-timer"
            sectionTitleLogo={
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
            }
          >
            <div className="flex flex-wrap *:grow">
              <FocusTimer
                size="sm"
                anchor
              />

              <Button className="opacity-0 transition-opacity duration-300 in-[section:hover]:opacity-100 absolute rounded-full hover:bg-zinc-400/50 [position-anchor:--timer] top-[calc(anchor(top)-10px)] right-[calc(anchor(right)-15px)]">
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
                  className="lucide lucide-settings preview-icon"
                >
                  <path d="M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915" />
                  <circle
                    cx="12"
                    cy="12"
                    r="3"
                  />
                </svg>
              </Button>

              <p className="text-center pt-8 pb-2 text-[14px]">
                For more settings and actions visit the{" "}
                <Link
                  to="/focus-timer"
                  className="underline decoration-wavy visited:text-(--accent-200) hover:text-blue-500 transition-colors duration-300"
                >
                  Dedicated Focus Timer Page
                </Link>
              </p>
            </div>
          </DefaultMainSection>
        </section>

        <section className="gs-animate min-[1011px]:[grid-area:3/1/4/3]">
          <DefaultMainSection
            sectionTitle="Subjects"
            sectionDescription="Keep track of your subjects and their tasks"
            to="/subject"
            sectionTitleLogo={
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
                className="lucide lucide-lambda preview-icon"
              >
                <path d="M11.38 10 5 20" />
                <path d="M19 18a2 2 0 01-2 2c-4.87-.003-5.052-16-10-16a2 2 0 00-2 2" />
              </svg>
            }
          >
            <SubjectItem subjects={fakeData.SUBJECT} />
          </DefaultMainSection>
        </section>
        <section className="gs-animate">
          <DefaultMainSection
            sectionTitle="Statistics"
            sectionDescription="Number of hours spent in each subject"
            sectionTitleLogo={
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
                className="lucide lucide-notebook-text preview-icon"
              >
                <path d="M2 6h4" />
                <path d="M2 10h4" />
                <path d="M2 14h4" />
                <path d="M2 18h4" />
                <rect
                  width="16"
                  height="20"
                  x="4"
                  y="2"
                  rx="2"
                />
                <path d="M9.5 8h5" />
                <path d="M9.5 12H16" />
                <path d="M9.5 16H14" />
              </svg>
            }
          >
            <div className="justify-self-center text-black">
              <MyPie
                data={fakePieData}
                valueFormat={(value) =>
                  value / 60 >= 1 ? value / 60 + "h" : value + "m"
                }
                width={
                  typeof window !== "undefined" && window.innerWidth > 500
                    ? 500
                    : 297
                }
                height={380}
              />
            </div>
          </DefaultMainSection>
        </section>
        <section className="gs-animate">
          <DefaultMainSection
            sectionTitle="Progress"
            sectionDescription="Completed tasks percentages"
            sectionTitleLogo={
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
                className="lucide lucide-chart-spline preview-icon"
              >
                <path d="M3 3v16a2 2 0 0 0 2 2h16" />
                <path d="M7 16c.5-2 1.5-7 4-7 2 0 2 3 4 3 2.5 0 4.5-5 5-7" />
              </svg>
            }
          >
            <div className="max-w-130 mx-auto">
              <div>
                <ProgressBars
                  items={fakeProgressItems}
                  className=""
                />
              </div>
            </div>
          </DefaultMainSection>
        </section>
      </main>

      <div
        style={{
          display: "flex",
          position: "fixed",
          right: "1.5rem",
          bottom: "1.5rem",
          flexDirection: "column",
          alignItems: "flex-end",
          zIndex: 10000,
          gap: 10,
        }}
      >
        {toasts.map((toast) => (
          <SwipeToast
            key={toast.id}
            open
            onClose={() => {
              setToasts((prev) => prev.filter((tst) => tst.id !== toast.id));
            }}
            title={toast.title}
            className=""
            inline
            dismissible
            icon={getIcon(toast.icon || "")}
            description={toast.description}
            actionLabel={toast.actionBtnText || ""}
            onAction={toast.onAction || (() => null)}
            background={theme === "dark" ? "#27272a" : "hsl(240 4% 90% / 1)"}
            color={theme === "dark" ? "#f5f5f5" : "#000"}
            fuseColor={toast?.fuseColor?.trim() ?? "#f5a524"}
            width={356}
            radius={12}
            slideMs={400}
            settleBounce={0.3}
            swipeDistance={40}
            duration={3500}
            fuse="bottom"
            pauseOnHover
            closeButton
          />
        ))}
      </div>
    </>
  );
}

function DefaultMainSection({
  children,
  sectionTitle = "",
  sectionTitleLogo = null,
  sectionDescription = "",
  className = "",
  to = "",
  seeMore = false,
  alignContentBetween = false,
}: DefaultMainSecType) {
  return (
    <section
      className={twMerge(
        "relative rounded-[17px] grid grid-rows-[auto_1fr] content-stretch border border-zinc-400/50 overflow-hidden",
        className,
      )}
    >
      {sectionTitle && (
        <header className="p-4 grid gap-1.5">
          <h2 className="text-xl flex gap-2 items-center leading-[normal] font-medium">
            {sectionTitleLogo}
            {sectionTitle}
          </h2>
          <span className="text-sm text-(--text-secondary)">
            {sectionDescription}
          </span>
        </header>
      )}

      <div
        className="overflow-y-auto scrollbar-none p-2"
        style={{
          alignContent: alignContentBetween ? "space-between" : undefined,
          display: alignContentBetween ? "grid" : undefined,
          paddingBlock: alignContentBetween ? "2.5rem" : undefined,
          gap: "5rem",
        }}
      >
        {children}
      </div>

      {seeMore && (
        <Link
          to={to.toLowerCase()}
          className="block p-2 bg-(--accent-300) hover:bg-(--accent-300)/80 text-white in-[.dark]:hover:bg-zinc-900 transition-colors duration-200 text-center px-6 in-[.dark]:bg-zinc-800"
        >
          See more...
        </Link>
      )}
    </section>
  );
}

export const clientMiddleware = [authMiddleware];

async function authMiddleware() {
  if (typeof localStorage === "undefined") return;

  const jwt = localStorage.getItem("jwt");
  if (!jwt) throw redirect("/login");
}
