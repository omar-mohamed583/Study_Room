import ShinyText from "../ui/ShinyText";
import useTheme from "~/context/themeContext";
import { useEffect, useLayoutEffect, useState } from "react";
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

  return (
    <header className="w-fit rounded-full bg-[hsl(from_var(--sect-bg)_h_s_l_/.6)] backdrop-blur-2xl flex gap-4 p-3 *:bg-(--body-gray) *:border-t *:border-t-gray-400/10 *:shadow-(--xl-shadow) *:rounded-full shadow-(--xs-shadow) mx-auto my-6">
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

      <div className="flex gap-3 p-2 *:bg-zinc-50 *:in-[.dark]:bg-zinc-800 *:backdrop-blur-3xl *:rounded-full [&_button]:cursor-pointer [&_button]:hover:bg-gray-400/25 in-[.dark]:[&_button]:hover:bg-zinc-700/75 [&_button]:transition-colors duration-300">
        <div className="search isolate *:rounded-full rounded-full relative">
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
          onClick={() => setTheme(theme === "light" ? "dark" : "light")}
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
          onClick={() => setOpenMenu((prev) => !prev)}
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
      <div className="menu absolute top-[anchor(bottom)] right-3 [position-anchor:--anc] z-100000">
        <ul className="*:p-2 cursor-pointer">
          <li>Account</li>
          <li>Setting</li>
          <li>Dashboard</li>
          <li>Logout</li>
        </ul>
      </div>
    </header>
  );
}
