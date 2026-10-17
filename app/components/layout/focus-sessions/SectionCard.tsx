import { useId } from "react";
import type { ReactNode } from "react";

interface SectionCardProps {
  title: string;
  description?: string;
  /** Rendered at the end of the header, e.g. a filter. */
  action?: ReactNode;
  className?: string;
  children: ReactNode;
  svgName: "statistics" | "timer" | "comp_sessions";
}

// The one container used by the timer, statistics and history sections.
// Colours come from the app's theme variables, so light and dark both follow
// the active theme. The shadow is the only elevation: kept soft, with a hairline
// highlight in dark mode where a drop shadow would disappear.
export default function SectionCard({
  title,
  description,
  action,
  className = "",
  children,
  svgName,
}: SectionCardProps) {
  const headingId = useId();

  return (
    <section
      aria-labelledby={headingId}
      className={`flex min-w-0 flex-col rounded-3xl border bg-(--sect-bg) p-5 text-(--text-primary) shadow-[0_1px_2px_rgb(0_0_0/0.04),0_10px_30px_-14px_rgb(0_0_0/0.16)] sm:p-6 dark:shadow-[inset_0_1px_0_rgb(255_255_255/0.05),0_12px_32px_-16px_rgb(0_0_0/0.9)] ${className} gs-animate`}
    >
      <header className="mb-5 flex flex-wrap items-start justify-between gap-x-4 gap-y-3">
        <div className="min-w-0">
          <h2
            id={headingId}
            className="flex gap-2 items-center content-center flex-wrap text-lg font-semibold tracking-tight mb-1"
          >
            {svgName === "statistics" && (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-flame preview-icon"
              >
                <path d="M12 3q1 4 4 6.5t3 5.5a1 1 0 0 1-14 0 5 5 0 0 1 1-3 1 1 0 0 0 5 0c0-2-1.5-3-1.5-5q0-2 2.5-4" />
              </svg>
            )}
            {svgName === "comp_sessions" && (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-sparkles preview-icon"
              >
                <path d="M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z" />
                <path d="M20 2v4" />
                <path d="M22 4h-4" />
                <circle
                  cx="4"
                  cy="20"
                  r="2"
                />
              </svg>
            )}
            {svgName === "timer" && (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-timer preview-icon"
              >
                <line
                  x1="10"
                  x2="14"
                  y1="2"
                  y2="2"
                />
                <line
                  x1="12"
                  x2="15"
                  y1="14"
                  y2="11"
                />
                <circle
                  cx="12"
                  cy="14"
                  r="8"
                />
              </svg>
            )}
            {title}
          </h2>
          {description && (
            <p className="mt-0.5 text-sm text-(--text-secondary)">
              {description}
            </p>
          )}
        </div>
        {action}
      </header>
      {children}
    </section>
  );
}
