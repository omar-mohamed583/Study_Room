import { Pie } from "@nivo/pie";
import useTheme from "~/context/themeContext";

export type PieData = {
  id: string;
  label: string;
  value: number;
  color: string;
};

export default function MyPie({ data }: { data: PieData[] }) {
  const { theme } = useTheme();

  return (
    <Pie
      data={data}
      margin={{ top: 40, right: 80, bottom: 80, left: 80 }}
      height={320}
      width={window?.innerWidth >= 500 ? 450 : 320}
      innerRadius={0.5}
      padAngle={0.6}
      cornerRadius={2}
      activeOuterRadiusOffset={8}
      arcLinkLabelsSkipAngle={10}
      arcLinkLabelsTextColor={theme === "light" ? "#333333" : "#fff"}
      arcLinkLabelsThickness={2}
      arcLinkLabelsColor={{ from: "color" }}
      arcLabelsSkipAngle={10}
      arcLabelsTextColor={{ from: "color", modifiers: [["darker", 2]] }}
    />
  );
}
