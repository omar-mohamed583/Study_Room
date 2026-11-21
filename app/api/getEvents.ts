import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "./api";
import { queryKeyForEndpoint } from "./queryKeys";

export type EventType = "task" | "subject" | "exam";

const EVENT_ENDPOINTS: Record<EventType, string> = {
  task: "/tasks",
  subject: "/subjects",
  exam: "/exams",
};

type UseGetEventsArgs = {
  event?: EventType;
  endpoint?: string;
  opt?: RequestInit;
  enabled?: boolean;
};

export default function useGetEvents<T = any>({
  event,
  endpoint,
  opt,
  enabled = true,
}: UseGetEventsArgs) {
  const url = endpoint ?? (event ? EVENT_ENDPOINTS[event] : undefined);

  return useQuery<any, Error, T>({
    queryKey: queryKeyForEndpoint(url),
    queryFn: ({ signal }) => {
      if (!url) throw new Error("An event endpoint is required.");
      return apiFetch(url, { ...opt, signal });
    },
    select: (res) => res.data,
    enabled: enabled && Boolean(url),
  });
}
