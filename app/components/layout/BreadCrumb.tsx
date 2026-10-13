import { Fragment } from "react";

export type BreadcrumbItem = {
  label: string;
  /** Makes the crumb clickable. The last crumb is always the current page. */
  onClick?: () => void;
};

export default function Breadcrumb({
  items,
  className = "",
}: {
  items: BreadcrumbItem[];
  className?: string;
}) {
  return (
    <nav
      aria-label="Breadcrumb"
      className={className}
    >
      <ol className="flex flex-wrap items-center gap-1 text-(--text-secondary) [font-size:var(--sm-text)]">
        {items.map((item, i) => {
          const isLast = i === items.length - 1;

          return (
            <Fragment key={`${i}-${item.label}`}>
              <li className="flex items-center">
                {isLast ? (
                  <span
                    aria-current="page"
                    className="font-medium text-(--text-primary)"
                  >
                    {item.label}
                  </span>
                ) : item.onClick ? (
                  <button
                    type="button"
                    onClick={item.onClick}
                    className="rounded transition-colors hover:text-(--text-primary) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--accent-100)"
                  >
                    {item.label}
                  </button>
                ) : (
                  <span>{item.label}</span>
                )}
              </li>

              {!isLast && (
                <li
                  aria-hidden="true"
                  className="flex items-center"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="m9 18 6-6-6-6" />
                  </svg>
                </li>
              )}
            </Fragment>
          );
        })}
      </ol>
    </nav>
  );
}
