import { useMemo } from "react";
import EntityListPage, { type EntityFilter, type EntityRow } from "~/components/ui/entity-page/EntityListPage";
import useStudyData from "~/context/studyDataContext";

export default function Exams() {
  const { exams: { data = [], isLoading, isError } } = useStudyData();
  const { rows, filters } = useMemo(() => {
    const subjects = [...new Set(data.flatMap((exam) => exam.subject?.map((subject) => subject.name) ?? []))].sort();
    const rows: EntityRow[] = data.map((exam) => {
      const date = new Date(exam.examDate);
      return {
        id: exam.documentId,
        title: exam.title,
        searchable: `${exam.description ?? ""} ${exam.subject?.map((subject) => subject.name).join(" ") ?? ""}`,
        cells: [
          Number.isNaN(date.getTime()) ? "" : date.toLocaleDateString(),
          exam.subject?.map((subject) => subject.name).join(", ") ?? "",
          String(exam.exam_topics?.length ?? 0),
          Number.isNaN(date.getTime()) ? "" : date.toISOString(),
        ],
      };
    });
    const filters: EntityFilter[] = [
      {
        label: "Date",
        options: [{ label: "Upcoming", value: "upcoming" }, { label: "Past", value: "past" }],
        matches: (row, value) => {
          const date = new Date(row.cells[3]);
          if (Number.isNaN(date.getTime())) return false;
          return value === "upcoming" ? date.getTime() >= Date.now() : date.getTime() < Date.now();
        },
      },
      {
        label: "Subject",
        options: subjects.map((name) => ({ label: name, value: name })),
        matches: (row, value) => row.cells[1].split(", ").includes(value),
      },
    ];
    return { rows, filters };
  }, [data]);

  return <EntityListPage
    title="Exams"
    description="Browse exams, their dates, subjects, and topic counts."
    rows={rows}
    isLoading={isLoading}
    isError={isError}
    filters={filters}
    columns={[
      { label: "Date", value: (row) => row.cells[0] },
      { label: "Subject", value: (row) => row.cells[1] },
      { label: "Topics", value: (row) => row.cells[2] },
    ]}
  />;
}
