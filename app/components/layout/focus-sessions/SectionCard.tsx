import { useId } from "react";
import type { ReactNode } from "react";

interface SectionCardProps {
  title: string;
  description?: string;
  /** Rendered at the end of the header, e.g. a filter. */
  action?: ReactNode;
  className?: string;
  children: ReactNode;
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
            className="text-lg font-semibold tracking-tight"
          >
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
