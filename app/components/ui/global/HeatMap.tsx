import {
  HeatmapCells,
  HeatmapChart,
  HeatmapInteractionBoundary,
  HeatmapInteractionProvider,
  HeatmapLegend,
  HeatmapTooltip,
  HeatmapXAxis,
  HeatmapYAxis,
} from "~/components/charts/heatmap";
import type { HeatmapColumn } from "~/components/charts/heatmap";

export default function HeatMap({ data }: { data: HeatmapColumn[] }) {
  return (
    <HeatmapInteractionProvider>
      <HeatmapInteractionBoundary>
        <HeatmapChart
          data={data}
          layout="fluid"
        >
          <HeatmapCells />
          <HeatmapXAxis />
          <HeatmapYAxis />
          <HeatmapTooltip />
        </HeatmapChart>
        <HeatmapLegend />
      </HeatmapInteractionBoundary>
    </HeatmapInteractionProvider>
  );
}

