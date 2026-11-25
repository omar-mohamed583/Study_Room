import type { Subject } from "~/types/subjectTypes";
import { getColor } from "./generateColors";

export default function getEventsInSubj(subject: Subject, ind: number) {
  if (!subject?.name) return;

  const tasks = subject?.tasks;

  const exams = subject?.exams;

  let completionCount = 0;

  const lengths = { tasks: tasks.length ?? 0, exams: exams.length ?? 0 };

  const totalCount = lengths.exams + lengths.tasks;

  const greaterValue = Math.max(lengths.tasks, lengths.exams);

  for (let i = 0; i < greaterValue; i++) {
    if (
      (i < lengths.tasks && tasks[i]?.completed) ||
      (i < lengths.exams &&
        exams[i].exam_topics?.every((topic) => topic?.completed))
    )
      completionCount++;
  }

  return {
    label: subject.name,
    value: (completionCount / totalCount) * 100,
    maxValue: totalCount,
    color: getColor(ind),
  };
}
