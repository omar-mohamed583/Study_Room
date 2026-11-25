import EmptyState from "./global/EmptyState";
import type { Subject } from "~/types/subjectTypes";
import { getColor } from "../utils/generateColors";
import {
  Legend,
  LegendItem,
  LegendLabel,
  LegendMarker,
  LegendValue,
} from "../charts/radial/legend";
import PieChart from "../charts/pie/pie-chart";
import PieSlice from "../charts/pie/pie-slice";
import { useMemo, useState } from "react";

export type PieData = {
  id: string;
  label: string;
  value: number;
  color: string;
};

type MyPieProps = {
  subjects: Subject[];
};

export default function MyPie({ subjects }: MyPieProps) {
  if (!subjects?.some((subj) => subj?.studySessions?.length))
    return (
      <EmptyState
        icon="data"
        message="No focus timers or subjects found"
      />
    );

  const [hoveredInd, setHoveredInd] = useState<number | null>(null);

  const formateData = useMemo(
    () =>
      subjects.map((subject, ind) => ({
        id: subject.name,
        label: subject.name,
        color: getColor(ind),
        value: subject.studySessions.reduce(
          (acc, v) => acc + +v.duration / 60,
          0,
        ),
      })),
    [subjects],
  );

  return (
    <div className="flex flex-wrap gap-6">
      <PieChart
        data={formateData}
        size={280}
        onHoverChange={(v) => setHoveredInd(v)}
        hoveredIndex={hoveredInd}
      >
        {formateData.map((item, index) => (
          <PieSlice
            key={item.id}
            index={index}
            animate
            hoverEffect="translate"
          />
        ))}
      </PieChart>

      <Legend
        items={formateData}
        title="Hours Spent"
        onHoverChange={(v) => setHoveredInd(v)}
        hoveredIndex={hoveredInd}
      >
        <LegendItem className="flex gap-2.5 items-center">
          <LegendMarker />
          <LegendLabel />
          <LegendValue formatValue={(v) => `${v}m`} />
        </LegendItem>
      </Legend>
    </div>
  );
}
