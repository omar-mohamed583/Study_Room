import { useMemo } from "react";
import EntityListPage, { type EntityRow } from "~/components/ui/entity-page/EntityListPage";
import useStudyData from "~/context/studyDataContext";

export default function Subjects() {
  const { subjects: { data = [], isLoading, isError } } = useStudyData();
  const rows = useMemo<EntityRow[]>(() => data.map((subject) => ({
    id: subject.documentId,
    title: subject.name,
    searchable: `${subject.icon} ${subject.name}`,
    cells: [String(subject.tasks?.length ?? 0), String(subject.exams?.length ?? 0)],
  })), [data]);

  return <EntityListPage
    title="Subjects"
    description="Browse and find your subjects."
    rows={rows}
    isLoading={isLoading}
    isError={isError}
    columns={[
      { label: "Tasks", value: (row) => row.cells[0] },
      { label: "Exams", value: (row) => row.cells[1] },
    ]}
  />;
}
