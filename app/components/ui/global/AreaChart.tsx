import { AreaChart, Area } from "../charts/area-chart";
import { Grid } from "../charts/grid";
import { XAxis } from "../charts/x-axis";
import { ChartTooltip } from "../charts/tooltip/chart-tooltip";

export default function AreaChartComp({
  chartData,
}: {
  chartData: { date: Date; created: number, completed: number }[];
}) {
  return (
    <AreaChart
      data={chartData}
      className="h-full w-full"
      style={{ aspectRatio: "auto" }}
    >
      <Grid horizontal />
      <Area
        dataKey="created"
        fill="var(--chart-line-primary)"
      />
      <Area
        dataKey="completed"
        fill="var(--chart-line-secondary)"
      />
      <XAxis />
      <ChartTooltip />
    </AreaChart>
  );
}
