import type {
  Filters,
  StatusFilter,
  Subject,
} from "~/types/tasksDashboard";

interface Props {
  filters: Filters;
  subjects: Subject[];
  active: boolean;
  onChange: <K extends keyof Filters>(key: K, value: Filters[K]) => void;
  onReset: () => void;
}

const STATUS: { value: StatusFilter; label: string }[] = [
  { value: "open", label: "Open" },
  { value: "overdue", label: "Overdue" },
  { value: "done", label: "Done" },
  { value: "all", label: "All" },
];

const select =
  "rounded-lg border border-border bg-background px-2 py-1.5 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#0032E7]";

export function TaskFilters({ filters, subjects, active, onChange, onReset }: Props) {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        <input
          type="search"
          value={filters.search}
          onChange={(e) => onChange("search", e.target.value)}
          placeholder="Search tasks, descriptions, subjects"
          aria-label="Search tasks"
          className={`${select} min-w-[14rem] flex-1`}
        />
        <div role="group" aria-label="Status" className="flex rounded-lg border border-border p-0.5">
          {STATUS.map((s) => (
            <button
              key={s.value}
              aria-pressed={filters.status === s.value}
              onClick={() => onChange("status", s.value)}
              className={`rounded-md px-3 py-1 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#0032E7] ${
                filters.status === s.value ? "bg-foreground text-background" : "text-muted-foreground"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <select aria-label="Subject" className={select} value={filters.subjectId} onChange={(e) => onChange("subjectId", e.target.value)}>
          <option value="all">All subjects</option>
          {subjects.map((subject) => (
            <option key={subject.documentId} value={subject.documentId}>
              {subject.name}
            </option>
          ))}
        </select>
        <select aria-label="Priority" className={select} value={filters.priority} onChange={(e) => onChange("priority", e.target.value as Filters["priority"])}>
          <option value="all">Any priority</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
        <select aria-label="Sort by" className={select} value={filters.sort} onChange={(e) => onChange("sort", e.target.value as Filters["sort"])}>
          <option value="urgency">Sort: most urgent</option>
          <option value="dueDate">Sort: due date</option>
          <option value="priority">Sort: priority</option>
          <option value="duration">Sort: shortest first</option>
        </select>
        {active && (
          <button onClick={onReset} className="text-sm text-[#0032E7] underline-offset-2 hover:underline">
            Clear filters
          </button>
        )}
      </div>
    </div>
  );
}
