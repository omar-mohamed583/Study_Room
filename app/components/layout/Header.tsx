import { Link } from "react-router";
import ShinyText from "../ui/ShinyText";
import useTheme from "~/context/themeContext";
import { useEffect } from "react";

export default function Header() {
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    document.body.classList.add(theme);
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
    <header className="z-1000 min-w-max rounded-full bg-(--sect-bg) flex gap-4 p-3 *:bg-(--sect-bg) *:border-t *:border-t-gray-400/10 *:shadow-(--xl-shadow) *:rounded-full fixed top-8 left-1/2 shadow-(--xs-shadow) -translate-x-1/2">
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

      <div className="flex gap-3 items-center content-center *:p-3 *:px-5 p-1 px-2 *:rounded-full *:transition-colors duration-300 *:hover:bg-gray-400/25 in-[.dark]:*:hover:bg-zinc-800/75">
        <Link to="">Statistics</Link>
        <Link to="">Focus Timer</Link>
      </div>

      <div className="flex gap-3 p-2 *:bg-zinc-100 *:in-[.dark]:bg-zinc-900/65 *:rounded-full [&_button]:cursor-pointer [&_button]:hover:bg-gray-400/25 in-[.dark]:[&_button]:hover:bg-zinc-800/75 [&_button]:transition-colors duration-300">
        <div className="search isolate *:rounded-full rounded-full relative">
          <input
            type="text"
            id="search"
            className="bg-transparent ring-3 ring-transparent focus:ring-(--items-bg) border-0 focus-visible:ring-(--items-bg) pl-10 p-2 outline-0"
            placeholder=" "
          />
          <label
            htmlFor="search"
            className="text-(--pale-text) absolute top-1/2 left-2.5 -translate-y-1/2 pointer-events-none items-center content-center flex gap-1 *:fill-(--pale-text)"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="23px"
              viewBox="0 -960 960 960"
              width="24px"
            >
              <path d="M784-120 532-372q-30 24-69 38t-83 14q-109 0-184.5-75.5T120-580q0-109 75.5-184.5T380-840q109 0 184.5 75.5T640-580q0 44-14 83t-38 69l252 252-56 56ZM380-400q75 0 127.5-52.5T560-580q0-75-52.5-127.5T380-760q-75 0-127.5 52.5T200-580q0 75 52.5 127.5T380-400Z" />
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
            className="fill-(--accent-200)"
          >
            <path d="M600-640 480-760l120-120 120 120-120 120Zm200 120-80-80 80-80 80 80-80 80ZM483-80q-84 0-157.5-32t-128-86.5Q143-253 111-326.5T79-484q0-146 93-257.5T409-880q-18 99 11 193.5T520-521q71 71 165.5 100T879-410q-26 144-138 237T483-80Zm0-80q88 0 163-44t118-121q-86-8-163-43.5T463-465q-61-61-97-138t-43-163q-77 43-120.5 118.5T159-484q0 135 94.5 229.5T483-160Zm-20-305Z" />
          </svg>

          {/* Sun */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            height="24px"
            viewBox="0 -960 960 960"
            width="24px"
            className="fill-(--accent-200)"
          >
            <path d="M440-800v-120h80v120h-80Zm0 760v-120h80v120h-80Zm360-400v-80h120v80H800Zm-760 0v-80h120v80H40Zm708-252-56-56 70-72 58 58-72 70ZM198-140l-58-58 72-70 56 56-70 72Zm564 0-70-72 56-56 72 70-58 58ZM212-692l-72-70 58-58 70 72-56 56Zm98 382q-70-70-70-170t70-170q70-70 170-70t170 70q70 70 70 170t-70 170q-70 70-170 70t-170-70Zm283.5-56.5Q640-413 640-480t-46.5-113.5Q547-640 480-640t-113.5 46.5Q320-547 320-480t46.5 113.5Q413-320 480-320t113.5-46.5ZM480-480Z" />
          </svg>
        </button>
        <button className="w-10 h-10 grid place-content-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            height="24px"
            viewBox="0 -960 960 960"
            width="24px"
            className="fill-(--accent-100)"
          >
            <path d="M234-276q51-39 114-61.5T480-360q69 0 132 22.5T726-276q35-41 54.5-93T800-480q0-133-93.5-226.5T480-800q-133 0-226.5 93.5T160-480q0 59 19.5 111t54.5 93Zm146.5-204.5Q340-521 340-580t40.5-99.5Q421-720 480-720t99.5 40.5Q620-639 620-580t-40.5 99.5Q539-440 480-440t-99.5-40.5ZM480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm100-95.5q47-15.5 86-44.5-39-29-86-44.5T480-280q-53 0-100 15.5T294-220q39 29 86 44.5T480-160q53 0 100-15.5ZM523-537q17-17 17-43t-17-43q-17-17-43-17t-43 17q-17 17-17 43t17 43q17 17 43 17t43-17Zm-43-43Zm0 360Z" />
          </svg>
        </button>
      </div>
    </header>
  );
}
