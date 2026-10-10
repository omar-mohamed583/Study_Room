import { Pie } from "@nivo/pie";
import useTheme from "~/context/themeContext";
import EmptyState from "./EmptyState";
import type { Subject } from "~/types/subjectTypes";
import type { StudySession } from "~/types/studySessionType";
import { useMemo } from "react";

export type PieData = {
  id: string;
  label: string;
  value: number;
  color: string;
};

type MyPieProps = {
  focusTimers: StudySession[];
  subjects: Subject[];
  width: number;
  height: number;
  valueFormat: any;
};

export default function MyPie({
  focusTimers,
  subjects,
  width,
  height,
  valueFormat,
}: MyPieProps) {
  if (!subjects?.length && !focusTimers.length)
    return (
      <EmptyState
        icon="data"
        message="No focus timers or subjects found"
      />
    );

    if (!subjects?.length) return (
      <EmptyState
        icon="data"
        message="No subjects found"
      />
    );

    if (!focusTimers?.length) return (
      <EmptyState
        icon="data"
        message="No focus timers found"
      />
    );

  const { theme } = useTheme();

  const formateData = subjects.map((subject) => ({
    id: subject.name,
    label: subject.name,
    color: subject.color,
    value: 0,
  }));

  const memoData = useMemo(() => {
    for (let i = 0; i < focusTimers.length; i++) {
      const matchedObj = formateData.find(
        (item) => item.label === focusTimers[i]?.subject?.name,
      );

      if (matchedObj?.id) matchedObj.value = Number(focusTimers[i].duration);
    }
  }, [subjects, focusTimers]);

  return (
    <>
      {
        <Pie
          data={formateData}
          margin={{ top: 40, right: 80, bottom: 80, left: 80 }}
          height={height}
          width={width}
          innerRadius={0.5}
          padAngle={0.6}
          cornerRadius={2}
          valueFormat={valueFormat}
          activeOuterRadiusOffset={8}
          arcLinkLabelsSkipAngle={10}
          arcLinkLabelsTextColor={theme === "light" ? "#333333" : "#fff"}
          arcLinkLabelsThickness={2}
          arcLinkLabelsColor={{ from: "color" }}
          arcLabelsSkipAngle={10}
          arcLabelsTextColor={{ from: "color", modifiers: [["darker", 2]] }}
        />
      }
    </>
  );
}
