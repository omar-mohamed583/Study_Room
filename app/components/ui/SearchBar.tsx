import { useEffect, useState } from "react";
import useStudyData from "~/context/studyDataContext";
import useTheme from "~/context/themeContext";
import type { Subject } from "~/types/subjectTypes";

export default function SearchBar() {
  const [open, setOpen] = useState(false);
  const [inpValue, setInpValue] = useState("");

  const {
    selectEventValue: { name, type },
    setSelectEventValue: setValue,
  } = useTheme();

  useEffect(() => {
    document.addEventListener("click", handleClick);

    return () => document.removeEventListener("click", handleClick);
  }, []);

  function handleClick(e: any) {
    if (
      e?.target?.classList.contains("search-bar-container") ||
      e?.target?.closest(".search-bar-container") &&
      !e.target.classList.contains("search")
    )
      return setOpen((prev) => !prev);

      return setOpen(false);
  }

  return (
    <div
      className={`search-bar-container font-['DM_Sans'] transition-colors ${open ? "bg-zinc-600/30" : "bg-transparent"} hover:bg-zinc-600/30 tracking-[0.020em] relative border duration-300 border-zinc-400/40 p-1.75 px-2.5 rounded-lg`}
    >
      <div className="flex items-center *:cursor-default *:text-[13px] *:leading-[normal] gap-1 w-25">

        <span className="truncate w-[90%]">{name || "Select Event"}</span>

        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="13"
          height="13"
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`lucide lucide-chevron-down preview-icon ${open ? "rotate-180 -mb-1" : "rotate-0"} transition-[rotate,margin] duration-200`}
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </div>

      <div
        className={`absolute inset-bs-[118%] z-1000 -inset-x-7 bg-zinc-400 in-[.dark]:bg-zinc-800 rounded-lg origin-top-right ${open ? "opacity-100 scale-100 pointer-events-auto" : "opacity-0 scale-85 pointer-events-none"} transition-[opacity,scale,pointer-events] duration-250 overflow-hidden`}
        role="dialog"
      >
        <header>
          <input
            type="text"
            value={inpValue}
            placeholder="search"
            className="search text-sm leading-[normal]"
            onChange={(e) => setInpValue(e.target.value)}
          />
        </header>
      </div>
    </div>
  );
}

function SubjectSection() {
  const { subjects } = useStudyData();

  return (
    <section className="grid">
      <span className="text-[14px] text-secondary">Subjects</span>
    </section>
  );
}

function SubjectItem({ color, icon, id, name }: Subject) {
  const { selectEventValue: value, setSelectEventValue: setValue } = useTheme();

  return (
    <li
      className="truncate"
      onClick={() => setValue({ name, type: "subject" })}
    >
      {color ? <span className=""></span> : ""}
      {name}
    </li>
  );
}
