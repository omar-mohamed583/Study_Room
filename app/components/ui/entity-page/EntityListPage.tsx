import { useMemo, useState } from "react";
import Header from "~/components/layout/Header";

export type EntityRow = {
  id: string;
  title: string;
  description?: string;
  cells: string[];
  searchable?: string;
};

export type EntityColumn = { label: string; value: (row: EntityRow) => string };

export type EntityFilter = {
  label: string;
  options: { label: string; value: string }[];
  matches: (row: EntityRow, value: string) => boolean;
};

export default function EntityListPage({
  title,
  description,
  rows,
  columns,
  filters = [],
  isLoading = false,
  isError = false,
}: {
  title: string;
  description: string;
  rows: EntityRow[];
  columns: EntityColumn[];
  filters?: EntityFilter[];
  isLoading?: boolean;
  isError?: boolean;
}) {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Record<string, string>>({});
  const visibleRows = useMemo(() => rows.filter((row) => {
    const query = search.trim().toLowerCase();
    if (query && !`${row.title} ${row.description ?? ""} ${row.searchable ?? ""}`.toLowerCase().includes(query)) return false;
    return filters.every((filter) => !selected[filter.label] || filter.matches(row, selected[filter.label]));
  }), [rows, search, filters, selected]);

  return (
    <>
      <Header />
      <main className="mx-auto grid w-full max-w-350 gap-4 px-4 pb-10 pt-28 md:px-8">
        <section className="rounded-[20px] border border-[hsl(from_var(--text-primary)_h_s_l_/.08)] bg-(--sect-bg) p-6 shadow-[0_0_8px_0_var(--contrast-text)] sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-(--pale-text)">Study Planner</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight">{title}</h1>
          <p className="mt-3 max-w-prose text-sm text-(--pale-text)">{description}</p>
        </section>
        <section className="grid gap-5 rounded-2xl border border-[hsl(from_var(--text-primary)_h_s_l_/.16)] p-4">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="font-heading text-xl tracking-wide">{title}</h2>
            <span className="grid size-5 place-content-center rounded-full bg-zinc-400/80 text-xs tabular-nums text-(--secondary-text) in-[body.dark]:bg-zinc-400/40">{visibleRows.length}</span>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <label className="grid gap-1 text-xs text-(--text-secondary) sm:col-span-2">Search
              <input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder={`Search ${title.toLowerCase()}`} className="w-full rounded-lg border border-[hsl(from_var(--text-primary)_h_s_l_/.2)] bg-background px-2.5 py-2 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring/30" />
            </label>
            {filters.map((filter) => <label key={filter.label} className="grid gap-1 text-xs text-(--text-secondary)">{filter.label}
              <select value={selected[filter.label] ?? ""} onChange={(event) => setSelected((current) => ({ ...current, [filter.label]: event.target.value }))} className="w-full rounded-lg border border-[hsl(from_var(--text-primary)_h_s_l_/.2)] bg-background px-2.5 py-2 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring/30">
                <option value="">All</option>{filter.options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
              </select>
            </label>)}
          </div>
          {isLoading ? <div aria-busy="true" className="divide-y overflow-hidden rounded-xl border">{Array.from({ length: 4 }, (_, index) => <div key={index} className="h-12 animate-pulse bg-muted/60" />)}</div> : isError ? <div role="alert" className="rounded-xl border border-dashed px-4 py-10 text-center text-sm text-muted-foreground">Couldn't load {title.toLowerCase()}. Check your connection and reload the page.</div> : !rows.length ? <div className="grid justify-items-center gap-1 rounded-xl border border-dashed px-4 py-10 text-center"><p className="font-medium">No {title.toLowerCase()} yet</p><p className="text-sm text-muted-foreground">{description}</p></div> : !visibleRows.length ? <div className="rounded-xl border border-dashed px-4 py-10 text-center text-sm text-muted-foreground">No {title.toLowerCase()} match these filters.</div> : (
            <div className="overflow-hidden rounded-xl border border-zinc-400/30 in-[body.dark]:border-zinc-400/15"><div className="overflow-x-auto"><table className="w-full border-collapse text-sm"><thead className="bg-zinc-400/30 in-[body.dark]:bg-zinc-400/15"><tr><th className="border-b border-r border-[hsl(from_var(--text-primary)_h_s_l_/.12)] px-4 py-3 text-left text-xs font-medium text-(--text-secondary)">{title.slice(0, -1)}</th>{columns.map((column) => <th key={column.label} className="border-b border-r border-[hsl(from_var(--text-primary)_h_s_l_/.12)] px-4 py-3 text-left text-xs font-medium text-(--text-secondary)">{column.label}</th>)}</tr></thead><tbody>{visibleRows.map((row) => <tr key={row.id} className="transition-colors hover:bg-zinc-400/10"> <td className="border-b border-r border-[hsl(from_var(--text-primary)_h_s_l_/.12)] px-4 py-3 font-medium">{row.title}</td>{columns.map((column) => <td key={column.label} className="border-b border-r border-[hsl(from_var(--text-primary)_h_s_l_/.12)] px-4 py-3 text-(--text-secondary)">{column.value(row) || "—"}</td>)}</tr>)}</tbody></table></div></div>
          )}
        </section>
      </main>
    </>
  );
}
