export const queryKeys = {
  user: ["user"],
  tasks: ["tasks"],
  subjects: ["subjects"],
  exams: ["exams"],
  studySessions: ["study-sessions"],
  calendars: ["calendars"],
} as const;

const resourceKeys: Record<string, readonly unknown[]> = {
  user: queryKeys.user,
  tasks: queryKeys.tasks,
  subjects: queryKeys.subjects,
  exams: queryKeys.exams,
  "study-sessions": queryKeys.studySessions,
  calendars: queryKeys.calendars,
};

export function queryKeyForEndpoint(endpoint: string | undefined) {
  if (!endpoint) return ["missing-event-endpoint"] as const;

  const resource = endpoint
    .split("?")[0]
    .split("/")
    .filter(Boolean)[0];

  return resourceKeys[resource] ?? [resource ?? "missing-event-endpoint"];
}
