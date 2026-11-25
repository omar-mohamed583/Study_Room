import { useMemo } from "react";
import Ring from "~/components/charts/radial/ring";
import RingCenter from "~/components/charts/radial/ring-center";
import RingChart from "~/components/charts/radial/ring-chart";
import getEventsInSubj from "~/components/utils/getEventsInSubject";
import type { Subject } from "~/types/subjectTypes";
import EmptyState from "../global/EmptyState";

export default function RingChartComp({ subjects }: { subjects: Subject[] }) {
  const formattedData = useMemo(
    () =>
      subjects
        .map((subj, ind) => getEventsInSubj(subj, ind))
        .filter((subj) => subj?.label !== ""),
    [subjects],
  );

  if (!formattedData || !formattedData?.length) return <EmptyState icon="subject" />;

  return (
    <RingChart
      data={formattedData}
      className="h-70 scale-110"
    >
      {formattedData.map((item, index) => (
        <Ring
          key={item?.label}
          index={index}
        />
      ))}
      <RingCenter defaultLabel="Total Events" formatOptions={{style: "percent"}} />
    </RingChart>
  );
}
