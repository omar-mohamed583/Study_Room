import type { MetaFunction } from "react-router";
import Header from "~/components/layout/Header";

export const meta: MetaFunction = () => [
  {
    title: "Study Planner - Dashboard",
  },
  {
    name: "",
    content: "",
  },
];

export default function Dashboard() {
  return (
    <>
      <Header />
      <main className="mx-auto w-full max-w-350 px-4 pb-10 pt-28 md:px-8">
        <section className="rounded-[20px] border border-[hsl(from_var(--text-primary)_h_s_l_/.08)] bg-(--sect-bg) p-6 shadow-[0_0_8px_0_var(--contrast-text)] sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-(--pale-text)">
            Study Planner
          </p>
          <h1 className="mt-2 text-3xl font-black tracking-tight">Dashboard</h1>
          <p className="mt-3 max-w-prose text-sm text-(--pale-text)">
            This page is a placeholder. The dashboard is coming soon.
          </p>
        </section>
      </main>
    </>
  );
}
