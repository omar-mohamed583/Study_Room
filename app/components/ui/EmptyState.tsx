import Button from "./Button";

type EmptyStateProps = {
  icon: "subject" | "task" | "exam" | "data";
  to?: string;
  emptyStateTitle?: string;
  message?: string;
};

export default function EmptyState({
  to,
  icon,
  emptyStateTitle,
  message,
}: EmptyStateProps) {
  return (
    <div className="grid gap-3 pt-10 justify-center content-start min-h-96">
      <div className="rounded-[50%] w-25 aspect-square bg-zinc-400/30 in-[.dark]:bg-zinc-400/20 grid place-content-center *:stroke-zinc-400 in-[.dark]:*:stroke-zinc-400/60 mx-auto">
        {icon.toLowerCase() === "subject" && (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m6 14 1.5-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.54 6a2 2 0 0 1-1.95 1.5H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H18a2 2 0 0 1 2 2v2" />
          </svg>
        )}
        {icon.toLowerCase() === "task" && (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect
              width="8"
              height="4"
              x="8"
              y="2"
              rx="1"
              ry="1"
            />
            <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
            <path d="M12 11h4" />
            <path d="M12 16h4" />
            <path d="M8 11h.01" />
            <path d="M8 16h.01" />
          </svg>
        )}
        {icon.toLowerCase() === "exam" && (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lucide lucide-folder-open preview-icon"
          >
            <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20" />
            <path d="M8 11h8" />
            <path d="M8 7h6" />
          </svg>
        )}
        {icon.toLowerCase() === "data" && (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lucide lucide-folder-open preview-icon"
          >
            <path d="M12 12v5.5" />
            <path d="M17 3h2a2 2 0 012 2v2" />
            <path d="M21 17v2a2 2 0 01-2 2h-2" />
            <path d="M3 7V5a2 2 0 012-2h2" />
            <path d="M7 21H5a2 2 0 01-2-2v-2" />
            <path d="M7.264 9.252 12 12l4.737-2.748" />
            <path d="M7.995 8.514A2 2 0 007 10.244v3.516a2 2 0 00.996 1.73l3 1.74a2 2 0 002.008 0l3-1.74A2 2 0 0017 13.76v-3.517a2 2 0 00-.995-1.73l-3-1.742a2 2 0 00-1.892-.064z" />
          </svg>
        )}
      </div>

      {message ? (
        <p className="text-center text-sm text-(--text-secondary)">{message}</p>
      ) : (
        to && (
          <>
            <div className="*:text-center grid gap-2">
              <h4 className="font-bold text-lg">No {emptyStateTitle} yet</h4>
              <p className="text-sm text-(--text-secondary)">
                There is no {emptyStateTitle} yet, get started by creating one
              </p>
            </div>

            <div className="flex gap-3 mt-4 items-center *:py-3 *:px-5 justify-center *:rounded-full *:transition-colors duration-200">
              <Button
                className="bg-(--accent-200) text-white hover:bg-(--accent-200)/65"
                navigation={{ to }}
              >
                Create {emptyStateTitle}
              </Button>
              <a
                href="mailto:omarabualmagd06@gmail.com"
                className="border border-zinc-400/60 in-[.dark]:border-zinc-400/20 hover:bg-zinc-400/20 in-[.dark]:hover:bg-zinc-400/10"
              >
                Contact us
              </a>
            </div>
          </>
        )
      )}
    </div>
  );
}
