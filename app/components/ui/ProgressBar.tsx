import { useId } from "react";
import Button from "./Button";
import EmptyState from "./EmptyState";
import type { Subject } from "~/types/subjectTypes";
import type { Task } from "~/types/deadlines";

type BaseItem = {
  id: string | number;
  name: string;
  color?: string;
};

type PercentageItem = BaseItem & {
  percentage: number;
  value?: undefined;
  total?: undefined;
};

type ValueItem = BaseItem & {
  value: number;
  total: number;
  percentage?: undefined;
};

function getPercentage(subj: Subject, tasks: Task[]): number {
  const subjTasks = {
    total: 0,
    completed: 0,
  };
  const raw = subjTasks.total
    ? (subjTasks.completed / subjTasks.total) * 100
    : 0;

  for (const task of tasks) {
    if (task.subject.name === subj.name) {
      subjTasks.total++;

      if (task.completed) subjTasks.completed++;
    }
  }

  return Number.isFinite(raw) ? Math.min(100, Math.max(0, raw)) : 0;
}

export function ProgressBar({
  subj,
  decimals = 0,
  tasks,
}: {
  subj: Subject;
  tasks: Task[];
  decimals?: number;
}) {
  const labelId = useId();
  const percentage = getPercentage(subj, tasks);
  const text = percentage.toFixed(decimals);

  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between gap-4 text-sm">
        <span
          id={labelId}
          className="min-w-0 text-(--text-primary) truncate font-medium"
        >
          {subj.name}
        </span>
        <span className="shrink-0 tabular-nums text-(--text-primary)">
          {text}%
        </span>
      </div>

      <div
        role="progressbar"
        aria-labelledby={labelId}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Number(text)}
        className="h-3.5 w-full overflow-hidden rounded-full bg-zinc-400/30"
      >
        <div
          className="h-full rounded-full bg-(--accent-100) transition-[scale] duration-500 origin-left ease-out motion-reduce:transition-none"
          style={{ scale: `${percentage}% 1`, backgroundColor: subj.color }}
        />
      </div>
    </div>
  );
}

export default function ProgressBars({
  subjects,
  decimals = 0,
  tasks,
  className = "",
}: {
  subjects: Subject[];
  tasks: Task[];
  decimals?: number;
  className?: string;
}) {
  const limit = 5;
  const inLimitSubjects = subjects?.slice(0, limit);
  const outLimitItemsCount = subjects?.length - inLimitSubjects?.length;

  return (
    <div className={["grid gap-5", className].filter(Boolean).join(" ")}>
      {!subjects?.length && (
        <EmptyState
          emptyStateTitle="Subjects"
          to="subject/new"
          icon="subject"
        />
      )}

      {subjects.length &&
        inLimitSubjects?.map((subj) => (
          <ProgressBar
            key={subj.id ?? subj.name}
            subj={subj}
            tasks={tasks}
            decimals={decimals}
          />
        ))}

      {outLimitItemsCount > 0 && (
        <Button
          className="self-end mt-3 max-w-fit bg-cyan-600 hover:bg-cyan-500 px-5 py-2 rounded-lg"
          navigation={{ to: "dashboard" }}
        >
          See More.. (
          {outLimitItemsCount + (outLimitItemsCount === 1 ? " item" : " items")}
          )
        </Button>
      )}
    </div>
  );
}
