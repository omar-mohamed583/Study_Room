import { AreaChart, Area } from "../charts/area-chart";
import { Grid } from "../charts/grid";
import { XAxis } from "../charts/x-axis";
import { ChartTooltip } from "../charts/tooltip/chart-tooltip";

const data = [
  { date: new Date("2025-01-01"), revenue: 12000, costs: 8500 },
  { date: new Date("2025-01-02"), revenue: 13500, costs: 9200 },
];

export default function AreaChartComp() {
  return (
    <AreaChart data={data}>
      <Grid horizontal />
      <Area
        dataKey="revenue"
        fill="var(--chart-line-primary)"
      />
      <Area
        dataKey="costs"
        fill="var(--chart-line-secondary)"
      />
      <XAxis />
      <ChartTooltip />
    </AreaChart>
  );
}
