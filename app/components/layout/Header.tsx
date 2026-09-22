import ShinyText from "../ui/ShinyText";
import useTheme from "~/context/themeContext";
import { useEffect, useLayoutEffect, useMemo, useState } from "react";
import { Link } from "react-router";

export default function Header() {
  const { theme, setTheme } = useTheme();

  const [openMenu, setOpenMenu] = useState(false);

  useLayoutEffect(() => {
    document.body.classList.add(theme);
    document.body.style.overflow = "auto";
  }, []);

  useEffect(() => {
    document.body.classList.replace(theme === "dark" ? "dark" : "light", theme);
    console.log(
      document.body.classList.replace(
        theme === "dark" ? "light" : "dark",
        theme,
      ),
    );
  }, [theme]);

  const PERSONAL_ITEMS = useMemo(
    () => [
      {
        id: crypto.randomUUID(),
        name: "Account",
        svg: (
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
            className="lucide lucide-user-pen preview-icon"
          >
            <path d="M11.5 15H7a4 4 0 0 0-4 4v2" />
            <path d="M21.378 16.626a1 1 0 0 0-3.004-3.004l-4.01 4.012a2 2 0 0 0-.506.854l-.837 2.87a.5.5 0 0 0 .62.62l2.87-.837a2 2 0 0 0 .854-.506z" />
            <circle
              cx="10"
              cy="7"
              r="4"
            />
          </svg>
        ),
        toLocation: "/account",
      },
      {
        id: crypto.randomUUID(),
        name: "Setting",
        svg: (
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
        ),
        toLocation: "/setting",
      },
    ],
    [],
  );

  const MAIN_ITEMS = useMemo(
    () => [
      {
        id: crypto.randomUUID(),
        name: "Dashboard",
        svg: (
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
            className="lucide lucide-chart-pie preview-icon"
          >
            {" "}
            <path d="M21 12c.552 0 1.005-.449.95-.998a10 10 0 0 0-8.953-8.951c-.55-.055-.998.398-.998.95v8a1 1 0 0 0 1 1z" />{" "}
            <path d="M21.21 15.89A10 10 0 1 1 8 2.83" />{" "}
          </svg>
        ),
        toLocation: "/dashboard",
      },
      {
        id: crypto.randomUUID(),
        name: "Subjects",
        svg: (
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
            className="lucide lucide-library-big preview-icon"
          >
            <rect
              width="8"
              height="18"
              x="3"
              y="3"
              rx="1"
            />
            <path d="M7 3v18" />
            <path d="M20.4 18.9c.2.5-.1 1.1-.6 1.3l-1.9.7c-.5.2-1.1-.1-1.3-.6L11.1 5.1c-.2-.5.1-1.1.6-1.3l1.9-.7c.5-.2 1.1.1 1.3.6Z" />
          </svg>
        ),
        toLocation: "/subjects",
      },
      {
        id: crypto.randomUUID(),
        name: "Tasks",
        svg: (
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
            className="lucide lucide-list-todo preview-icon"
          >
            {" "}
            <path d="M13 5h8" /> <path d="M13 12h8" /> <path d="M13 19h8" />{" "}
            <path d="m3 17 2 2 4-4" />{" "}
            <rect
              x="3"
              y="4"
              width="6"
              height="6"
              rx="1"
            />{" "}
          </svg>
        ),
        toLocation: "/tasks",
      },
      {
        id: crypto.randomUUID(),
        name: "Exams",
        svg: (
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
            className="lucide lucide-clipboard-list preview-icon"
          >
            {" "}
            <rect
              width="8"
              height="4"
              x="8"
              y="2"
              rx="1"
              ry="1"
            />{" "}
            <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />{" "}
            <path d="M12 11h4" /> <path d="M12 16h4" /> <path d="M8 11h.01" />{" "}
            <path d="M8 16h.01" />{" "}
          </svg>
        ),
        toLocation: "/exams",
      },
      {
        id: crypto.randomUUID(),
        name: "Calendar",
        svg: (
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
            className="lucide lucide-calendar-days preview-icon"
          >
            {" "}
            <path d="M8 2v3" /> <path d="M16 2v3" />{" "}
            <rect
              x="3"
              y="3"
              width="18"
              height="18"
              rx="2"
            />{" "}
            <path d="M3 9h18" /> <path d="M8 13h.01" /> <path d="M12 13h.01" />{" "}
            <path d="M16 13h.01" /> <path d="M8 17h.01" />{" "}
            <path d="M12 17h.01" /> <path d="M16 17h.01" />{" "}
          </svg>
        ),
        toLocation: "/calendar",
      },
      {
        id: crypto.randomUUID(),
        name: "Focus Timer",
        svg: (
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
            className="lucide lucide-timer preview-icon"
          >
            {" "}
            <line
              x1="10"
              x2="14"
              y1="2"
              y2="2"
            />{" "}
            <line
              x1="12"
              x2="15"
              y1="14"
              y2="11"
            />{" "}
            <circle
              cx="12"
              cy="14"
              r="8"
            />{" "}
          </svg>
        ),
        toLocation: "/focus-timer",
      },
      {
        id: crypto.randomUUID(),
        name: "Progress",
        svg: (
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
            className="lucide lucide-chart-no-axes-column-increasing preview-icon"
          >
            {" "}
            <path d="M5 21v-6" /> <path d="M12 21V9" />{" "}
            <path d="M19 21V3" />{" "}
          </svg>
        ),
        toLocation: "/progress",
      },
    ],
    [],
  );

  return (
    <header className="w-fit rounded-full bg-[hsl(from_var(--sect-bg)_h_s_l_/.6)] backdrop-blur-2xl flex gap-4 p-3 *:bg-(--body-gray) *:border-t *:border-t-gray-400/10 *:shadow-(--xl-shadow) *:rounded-full shadow-(--xs-shadow) mx-auto my-6 z-10000 relative">
      <h1 className="font-bold text-lg leading-[normal] cursor-pointer p-4 px-5 md:px-8 flex items-center tracking-wide">
        <ShinyText
          text="Study Room"
          speed={2.5}
          delay={0.3}
          color={theme === "light" ? "#1b1b1b" : "#bbbbbb"}
          shineColor={
            theme === "light" ? "hsl(0, 0%, 50%)" : "hsl(0, 0%, 100%)"
          }
          spread={150}
          direction="left"
          yoyo={false}
          className=""
          pauseOnHover={false}
          disabled={false}
        />
      </h1>

      <div className="flex gap-3 items-center content-center *:p-3 *:px-5 p-1 px-2 *:rounded-full *:transition-colors duration-300 *:hover:bg-gray-400/25 in-[.dark]:*:hover:bg-zinc-800/80">
        <Link to="">Statistics</Link>
        <Link to="">Focus Timer</Link>
      </div>

      <div className="flex gap-3 p-2 *:bg-zinc-50 *:in-[.dark]:bg-zinc-800 *:backdrop-blur-3xl *:rounded-full [&_button]:cursor-pointer [&_button]:hover:bg-gray-400/25 in-[.dark]:[&_button]:hover:bg-zinc-700/75 [&_button]:transition-colors duration-300 z-1000">
        <div className="search isolate *:rounded-full rounded-full relative z-1000">
          <input
            type="text"
            id="search"
            className="bg-transparent ring-3 ring-transparent focus:ring-(--items-bg) border-0 focus-visible:ring-(--items-bg) pl-10 p-2 outline-0"
            placeholder=" "
          />
          <label
            htmlFor="search"
            className="text-(--pale-text) absolute top-1/2 left-2.5 -translate-y-1/2 pointer-events-none items-center content-center flex gap-1.5"
          >
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
              className="lucide lucide-search"
            >
              <path d="m21 21-4.34-4.34" />
              <circle
                cx="11"
                cy="11"
                r="8"
              />
            </svg>
            Search here...
          </label>
        </div>

        <button
          className="grid [grid-template-areas:'stack'] *:[grid-area:stack] items-center content-center in-[.dark]:[&>*:last-child]:opacity-100 in-[.dark]:[&>*:first-child]:opacity-0 [&>*:last-child]:opacity-0 w-10 h-10 place-content-center"
          onClick={() => {
            setTheme(theme === "light" ? "dark" : "light");
          }}
        >
          {/* Moon */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            height="24px"
            viewBox="0 -960 960 960"
            width="24px"
            className="fill-(--text-primary)"
          >
            <path d="M600-640 480-760l120-120 120 120-120 120Zm200 120-80-80 80-80 80 80-80 80ZM483-80q-84 0-157.5-32t-128-86.5Q143-253 111-326.5T79-484q0-146 93-257.5T409-880q-18 99 11 193.5T520-521q71 71 165.5 100T879-410q-26 144-138 237T483-80Zm0-80q88 0 163-44t118-121q-86-8-163-43.5T463-465q-61-61-97-138t-43-163q-77 43-120.5 118.5T159-484q0 135 94.5 229.5T483-160Zm-20-305Z" />
          </svg>

          {/* Sun */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lucide lucide-sun"
          >
            <circle
              cx="12"
              cy="12"
              r="4"
            />
            <path d="M12 2v2" />
            <path d="M12 20v2" />
            <path d="m4.93 4.93 1.41 1.41" />
            <path d="m17.66 17.66 1.41 1.41" />
            <path d="M2 12h2" />
            <path d="M20 12h2" />
            <path d="m6.34 17.66-1.41 1.41" />
            <path d="m19.07 4.93-1.41 1.41" />
          </svg>
        </button>

        <button
          className="w-10 h-10 grid place-content-center [anchor-name:--anc]"
          onClick={() => {
            setOpenMenu((prev) => !prev);
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lucide lucide-user"
          >
            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
            <circle
              cx="12"
              cy="7"
              r="4"
            />
          </svg>
        </button>
      </div>

      <div
        className={`menu transition-[opacity,scale] duration-300 ${openMenu ? "pointer-events-auto opacity-100 scale-100" : "pointer-events-none opacity-0 scale-95"} origin-top-right absolute top-[calc(anchor(bottom)+6px)] right-[anchor(right)] [position-anchor:--anc] z-100000 shadow-(--text-primary)/20 border-gray-400/10 border shadow-[0_0_10px_3px_var(--tw-shadow)]`}
      >
        <ul className="min-w-58 py-2">
          <ContainerListItem
            heading="Personal"
            items={PERSONAL_ITEMS}
          />

          <ContainerListItem
            items={MAIN_ITEMS}
            heading="MAin"
          />
        </ul>
      </div>
    </header>
  );
}

function ContainerListItem({
  items,
  heading,
}: {
  items: {
    id: string;
    name: string;
    svg: React.JSX.Element;
    toLocation: string;
  }[];
  heading: string;
}) {
  return (
    <li className="pt-2">
      <div className="flex items-center gap-2 text-xs font-semibold lowercase tracking-widest text-(--pale-text) px-">
        <span className="h-px flex-1 bg-current/30"></span>
        <span>{heading}</span>
        <span className="h-px flex-1 bg-current/30"></span>
      </div>
      <ul className="*:py-3 *:px-4 *:min-w-50 cursor-pointer *:hover:bg-zinc-400/20 *:font-medium *:transition-colors *:duration-200 *:text-[15px]">
        {items.map((item) => (
          <li key={item.id}>
            <Link
              to={item.toLocation}
              className="flex items-center content-center justify-between"
            >
              {item.name}
              {item.svg}
            </Link>
          </li>
        ))}
      </ul>
    </li>
  );
}
