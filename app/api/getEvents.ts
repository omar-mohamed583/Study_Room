import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "./api";

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
  accessToken: string | null;
  enabled?: boolean;
};

export default function useGetEvents<T = any>({
  event,
  endpoint,
  opt,
  accessToken,
}: UseGetEventsArgs) {
  const url = endpoint ?? (event ? EVENT_ENDPOINTS[event] : undefined);

  console.log(url)
  if (!url) throw new Error("No Endpoint To Request");

  return useQuery<any, Error, T>({
    queryKey: [url, opt ?? null],
    queryFn: ({ signal }) => apiFetch(url, accessToken, { ...opt, signal }),
    select: (res) => res.data,
  });
}
