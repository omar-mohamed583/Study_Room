import type { ReactNode } from "react";
import Breadcrumb from "../layout/BreadCrumb";
import Button from "./Button";
import type { BreadcrumbItem } from "../layout/BreadCrumb";

/** Small lucide-style inline icon wrapper, shared by the dialog contents. */
export function Icon({
  children,
  size = 16,
}: {
  children: ReactNode;
  size?: number;
}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

type DialogPanelProps = {
  title: string;
  /** Put the same id on the dialog's aria-labelledby if you want. */
  titleId?: string;
  breadcrumb: BreadcrumbItem[];
  children: ReactNode;
  onSave: () => void;
  onReset: () => void;
  resetLabel?: string;
  canSave: boolean;
  canReset: boolean;
  isSaving?: boolean;
  isLoading?: boolean;
  error?: string | null;
};

export default function DialogPanel({
  title,
  titleId,
  breadcrumb,
  children,
  onSave,
  onReset,
  resetLabel = "Reset Changes",
  canSave,
  canReset,
  isSaving = false,
  isLoading = false,
  error = null,
}: DialogPanelProps) {
  const busy = isLoading || isSaving;

  return (
    <div className="flex h-full min-h-0 flex-col">
      {/* Header: breadcrumb + title (pe-14 leaves room for the dialog's close button) */}
      <header className="border-b border-(--secondary-gray) px-5 py-4 pe-14 sm:px-6">
        <Breadcrumb items={breadcrumb} />
        <h2
          id={titleId}
          className="mt-1 text-xl font-semibold leading-[normal]"
        >
          {title}
        </h2>
      </header>

      {/* Body */}
      <div
        aria-busy={isLoading}
        className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6"
      >
        {isLoading && (
          <span
            role="status"
            className="sr-only"
          >
            Loading…
          </span>
        )}
        {children}
      </div>

      {/* Footer */}
      <footer className="flex flex-wrap items-center gap-3 border-t border-(--secondary-gray) px-5 py-3 sm:px-6">
        <div className="min-w-0 flex-1">
          {error && (
            <p
              role="alert"
              className="text-sm text-red-500"
            >
              {error}
            </p>
          )}
        </div>

        <div className="flex gap-2">
          <Button
            onClick={onReset}
            disabled={busy || !canReset}
            className="h-10 rounded-lg bg-zinc-400/20 px-4 text-sm font-medium transition-colors hover:bg-zinc-400/30 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {resetLabel}
          </Button>

          <Button
            onClick={onSave}
            disabled={busy || !canSave}
            className="h-10 rounded-lg bg-(--accent-100) px-5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {isSaving ? "Saving…" : "Save"}
          </Button>
        </div>
      </footer>
    </div>
  );
}
