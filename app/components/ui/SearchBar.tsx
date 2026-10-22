import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { createPortal } from "react-dom";
import useStudyData from "~/context/studyDataContext";
import useTheme from "~/context/themeContext";

type EventType = "task" | "subject" | "exam";
type Filter = EventType | "";

type SearchItem = {
  id: string | number;
  name: string;
  type: EventType;
  color?: string;
};

const FILTERS: { value: Filter; label: string }[] = [
  { value: "", label: "All" },
  { value: "task", label: "Tasks" },
  { value: "subject", label: "Subjects" },
  { value: "exam", label: "Exams" },
];

const GROUP_LABELS: Record<EventType, string> = {
  task: "Tasks",
  subject: "Subjects",
  exam: "Exams",
};

export default function SearchBar() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [inpValue, setInpValue] = useState("");
  const [filter, setFilter] = useState<Filter>("");

  const togglerRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  // useId() can contain characters that aren't valid in a CSS dashed-ident
  const id = useId();
  const anchorName = `--search-bar-${id.replace(/[^a-zA-Z0-9_-]/g, "")}`;

  const {
    selectEventValue: { eventId, name, type },
    setSelectEventValue: setValue,
  } = useTheme();

  const { tasks, subjects, exams } = useStudyData();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      const path = e.composedPath();
      const toggler = togglerRef.current;
      const dialog = dialogRef.current;

      const inside =
        (toggler && path.includes(toggler)) ||
        (dialog && path.includes(dialog));

      if (!inside) setOpen(false);
    }

    document.addEventListener("click", handleClick);

    return () => document.removeEventListener("click", handleClick);
  }, []);

  const groups = useMemo(() => {
    const q = inpValue.trim().toLowerCase();

    const all: Record<EventType, SearchItem[]> = {
      task: (tasks.data ?? []).map(
        (t): SearchItem => ({ id: t.documentId, name: t.title, type: "task", }),
      ),
      subject: (subjects.data ?? []).map(
        (s): SearchItem => ({
          id: s.documentId,
          name: s.name,
          type: "subject",
          color: s.color,
        }),
      ),
      exam: (exams.data ?? []).map(
        (x): SearchItem => ({ id: x.documentId, name: x.title, type: "exam" }),
      ),
    };

    return (Object.keys(all) as EventType[])
      .filter((t) => !filter || t === filter)
      .map((t) => ({
        type: t,
        items: all[t].filter((item) =>
          (item.name ?? "").toLowerCase().includes(q),
        ),
      }))
      .filter((group) => group.items.length > 0);
  }, [tasks.data, subjects.data, exams.data, inpValue, filter]);

  function handleSelect(item: SearchItem) {
    setValue({ eventId: String(item.id), name: item.name, type: item.type });
    setOpen(false);
  }

  return (
    <>
      <div
        ref={togglerRef}
        style={{ anchorName } as CSSProperties}
        className={`font-['Outfit'] w-30 transition-colors ${open ? "bg-zinc-600/30" : "bg-transparent"} hover:bg-zinc-600/30 tracking-[0.020em] border duration-200 border-zinc-400/40 p-1.75 px-2.5 rounded-lg flex items-center *:cursor-default *:text-[13px] *:leading-[normal] gap-1`}
        onClick={() => setOpen((prev) => !prev)}
      >
        <span className="truncate w-[90%] font-medium select-none">
          {name || "Select Event"}
        </span>

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
          className={`lucide lucide-chevron-down preview-icon ${open ? "rotate-180 -mb-1" : "rotate-0"} transition-[rotate,margin] duration-150`}
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </div>

      {mounted &&
        createPortal(
          <div
            ref={dialogRef}
            role="dialog"
            inert={!open}
            style={
              {
                positionAnchor: anchorName,
                positionArea: "bottom",
              } as CSSProperties
            }
            className={`fixed z-1000 w-54 my-1.5 font-['DM_Sans'] bg-zinc-300 in-[.dark]:bg-zinc-800 rounded-lg origin-top ${open ? "opacity-100 scale-100 pointer-events-auto" : "opacity-0 scale-85 pointer-events-none"} transition-[opacity,scale,pointer-events] duration-200 overflow-hidden`}
          >
            <header className="grid gap-2 border-b pb-2 border-b-zinc-500/80 p-2.75">
              <div className="flex gap-1.5">
                <input
                  type="text"
                  value={inpValue}
                  placeholder="Search by name..."
                  className="text-sm leading-[normal] border border-zinc-500/80 w-full rounded-[10px] p-2 focus:ring-violet-500 outline-0 focus:border-transparent ring-3 ring-transparent transition-all duration-200"
                  onChange={(e) => setInpValue(e.target.value)}
                />

                <button
                  type="button"
                  aria-label="Filter by type"
                  aria-expanded={filterOpen}
                  className={`p-1 rounded-lg border hover:bg-violet-500 border-zinc-500 px-2 transition-colors hover:*:stroke-white duration-200 ${filterOpen || filter ? "bg-violet-500 *:stroke-white" : ""}`}
                  onClick={() => setFilterOpen((prev) => !prev)}
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
                    className="lucide lucide-funnel transition-[stroke] duration-150 preview-icon stroke-(--text-secondary)"
                  >
                    <path d="M10 20a1 1 0 0 0 .553.895l2 1A1 1 0 0 0 14 21v-7a2 2 0 0 1 .517-1.341L21.74 4.67A1 1 0 0 0 21 3H3a1 1 0 0 0-.742 1.67l7.225 7.989A2 2 0 0 1 10 14z" />
                  </svg>
                </button>
              </div>

              {filterOpen && (
                <div
                  className="flex flex-wrap gap-1.5"
                  role="group"
                >
                  {FILTERS.map((f) => (
                    <button
                      key={f.value || "all"}
                      type="button"
                      aria-pressed={filter === f.value}
                      className={`text-[12px] leading-[normal] rounded-full border px-2.5 py-1.5 transition-colors duration-200 ${filter === f.value ? "bg-violet-500 border-violet-500 text-white" : "border-zinc-500/80 hover:bg-zinc-400/50 in-[.dark]:hover:bg-zinc-400/15"}`}
                      onClick={() => setFilter(f.value)}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              )}
            </header>

            <main className="grid gap-3 p-2.75 max-h-35 overflow-y-auto [scrollbar-width:thin]">
              {groups.length === 0 ? (
                <span className="text-[13px] text-(--text-secondary)">
                  No events found
                </span>
              ) : (
                groups.map((group) => (
                  <EventSection
                    key={group.type}
                    label={GROUP_LABELS[group.type]}
                    items={group.items}
                    selected={{ eventId, type }}
                    onSelect={handleSelect}
                  />
                ))
              )}
            </main>
            <footer className="border-t border-t-zinc-500/80 p-2.75">
              <button
                className="rounded-lg border border-red-500 w-full p-1.75 text-red-500 text-sm leading-[normal] disabled:opacity-40 disabled:hover:bg-transparent hover:bg-red-500/15 transition-colors duration-200"
                disabled={!eventId}
                onClick={() => setValue({ eventId: "", name: "", type: null })}
              >
                Remove event
              </button>
            </footer>
          </div>,
          document.body,
        )}
    </>
  );
}

function EventSection({
  label,
  items,
  selected,
  onSelect,
}: {
  label: string;
  items: SearchItem[];
  selected: { eventId: string; type: EventType | null };
  onSelect: (item: SearchItem) => void;
}) {
  return (
    <section className="grid gap-1">
      <span className="text-[12px] text-(--text-secondary)">{label}</span>

      <ul className="grid gap-0.5">
        {items.map((item) => (
          <EventItem
            key={`${item.type}-${item.id}`}
            item={item}
            isSelected={
              selected.eventId === String(item.id) && selected.type === item.type
            }
            onSelect={onSelect}
          />
        ))}
      </ul>
    </section>
  );
}

function EventItem({
  item,
  isSelected,
  onSelect,
}: {
  item: SearchItem;
  isSelected: boolean;
  onSelect: (item: SearchItem) => void;
}) {
  return (
    <li
      className={`grid items-center gap-2 rounded-md p-2 text-[13px] leading-[normal] cursor-pointer transition-colors duration-150 hover:bg-zinc-400/30 in-[.dark]:hover:bg-zinc-400/15 ${item.color ? "grid-cols-[auto_1fr]" : ""} ${isSelected ? "bg-violet-500/20" : ""}`}
      onClick={() => onSelect(item)}
    >
      {item.color && (
        <span
          className="size-2 rounded-full"
          style={{ backgroundColor: item.color }}
        />
      )}
      <span className="truncate font-medium capitalize">{item.name}</span>
    </li>
  );
}
