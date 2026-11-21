import useTheme from "~/context/themeContext";
import EmptyState from "./global/EmptyState";
import type { Subject } from "~/types/subjectTypes";
import PieChart from "../charts/radial/pie-chart";
import PieSlice from "../charts/radial/pie-slice";
import { getColor } from "../utils/generateColors";
import { Legend, LegendLabel, LegendMarker, LegendValue } from "../charts/radial/legend";

export type PieData = {
  id: string;
  label: string;
  value: number;
  color: string;
};

type MyPieProps = {
  subjects: Subject[];
};

export default function MyPie({
  subjects,
}: MyPieProps) {
  if (!subjects?.some((subj) => subj?.studySessions?.length))
    return (
      <EmptyState
        icon="data"
        message="No focus timers or subjects found"
      />
    );

  const formateData = subjects.map((subject, ind) => ({
    id: subject.name,
    label: subject.name,
    color: getColor(ind),
    value: subject.studySessions.reduce((acc, v) => acc + +v.duration / 60, 0),
  }));

  return (
    <div className="flex flex-wrap gap-4">
      <PieChart
        data={formateData}
        size={280}
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
      >
        <LegendItemComponent>
          <LegendMarker />
          <LegendLabel />
          <LegendValue />
        </LegendItemComponent>
      </Legend>
    </div>
  );
}
