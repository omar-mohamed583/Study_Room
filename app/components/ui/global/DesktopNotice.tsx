export default function DesktopNotice({ page }: { page: string }) {
  return (
    <div className="fixed inset-0 z-[30000000] grid min-h-dvh place-items-center bg-black/45 px-5 py-8 backdrop-blur-sm">
      <section
        role="status"
        className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-zinc-200 bg-white px-7 py-9 text-center text-neutral-950 shadow-2xl dark:border-zinc-700 dark:bg-neutral-950 dark:text-white sm:px-10 sm:py-11"
      >
        <div className="absolute inset-x-0 top-0 h-1 bg-(--accent-100)" />

        <div className="mx-auto grid size-16 place-items-center rounded-2xl border border-orange-500/20 bg-orange-500/10 text-orange-600 dark:text-orange-400">
          <svg
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="3" width="18" height="13" rx="2" />
            <path d="M2 21h20M8 16l-1 5m9-5 1 5M8 10l2.5 2.5L16 7" />
          </svg>
        </div>

        <p className="mt-6 text-xs font-semibold uppercase tracking-[0.18em] text-orange-700 dark:text-orange-400">
          Desktop experience
        </p>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">
          Continue on desktop
        </h1>
        <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-neutral-600 dark:text-neutral-300">
          {page} is designed for a larger screen and precise pointer. Open this
          page on a laptop or desktop for the best experience.
        </p>

        <div className="mx-auto mt-7 inline-flex items-center gap-2 rounded-full border border-zinc-200 px-4 py-2 text-xs font-medium text-neutral-600 dark:border-zinc-700 dark:text-neutral-300">
          <span className="size-2 rounded-full bg-emerald-500" aria-hidden="true" />
          Laptop or desktop recommended
        </div>
      </section>
    </div>
  );
}
