import { Link } from "react-router";

export default function Header() {
  return (
    <header className="min-w-max rounded-full bg-white flex gap-4 p-3 *:bg-(--sect-bg) *:border-t *:border-t-gray-400/10 *:shadow-xl *:rounded-full fixed top-4 left-1/2 shadow-xs -translate-x-1/2">
      <h1 className="font-bold text-lg leading-[normal] cursor-pointer p-4 px-5 md:px-8 flex items-center tracking-wide">
        Study Room
      </h1>

      <div className="flex gap-3 items-center content-center *:p-3 *:px-5 p-1 px-2 *:rounded-full *:transition-colors duration-300 *:hover:bg-gray-400/25">
        <Link to="">Statistics</Link>
        <Link to="">Focus Timer</Link>
      </div>

      <div className="flex gap-3 p-2 *:bg-(--tasks-bg)  *:rounded-full [&_button]:cursor-pointer [&_button]:hover:bg-gray-400/25 [&_button]:transition-colors duration-300">
        <div className="search isolate *:rounded-full rounded-full relative">
          <input
            type="text"
            id="search"
            className="bg-transparent focus:border-0 focus-visible:border-0 focus:outline-2 focus-visible:outline-4 pl-6 outline-gray-400/30 p-2"
            placeholder=" "
          />
          <label
            htmlFor="search"
            className="text-(--text-secondary) absolute top-1/2 left-6 -translate-y-1/2 pointer-events-none"
          >
            Search here...
          </label>
        </div>

        <button className="p-2 px-3">th</button>
        <button className="p-2 px-3">ac</button>
      </div>
    </header>
  );
}
