import { AreaChart, Area } from "../charts/area-chart";
import { Grid } from "../charts/grid";
import { XAxis } from "../charts/x-axis";
import { ChartTooltip } from "../charts/tooltip/chart-tooltip";
import useTheme from "~/context/themeContext";

export default function AreaChartComp({
  chartData,
}: {
  chartData: { date: Date; created: number, completed: number }[];
}) {
  const {theme} = useTheme();
  return (
    <AreaChart
      data={chartData}
      className="tasks-area-chart h-full w-full"
      style={{ aspectRatio: "auto" }}
    >
      <Grid horizontal />
      <Area
        dataKey="created"
        fill={
          theme === "dark"
            ? "var(--chart-line-primary)"
            : "var(--chart-2)"
        }
      />
      <Area
        dataKey="completed"
        fill={
          theme === "dark" ? "var(--chart-line-secondary)" : "var(--chart-4)"
        }
      />
      <XAxis />
      <ChartTooltip />
    </AreaChart>
  );
}
