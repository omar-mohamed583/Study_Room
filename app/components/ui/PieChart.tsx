import { Pie, type PieSvgProps } from "@nivo/pie";
import useTheme from "~/context/themeContext";
import EmptyState from "./EmptyState";

export type PieData = {
  id: string;
  label: string;
  value: number;
  color: string;
};

export default function MyPie({
  data,
  width,
  height,
  valueFormat,
}: PieSvgProps<PieData>) {
  const { theme } = useTheme();

  return (
    <>
      {!data.length && <EmptyState to="/subject/new" icon="subject" emptyStateTitle="Subjects" />}
      <Pie
        data={data}
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
    </>
  );
}
