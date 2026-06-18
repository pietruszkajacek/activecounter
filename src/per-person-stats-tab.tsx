import { PerPersonStatsDataReChartsWithStamp } from "@/interfaces/stats-data-recharts";
import ChartTitle from "./components/chart-title";
import VerticalBarChart from "./components/vertical-bar-chart";

type Props = {
  data: PerPersonStatsDataReChartsWithStamp;
  orientation: OrientationType;
};

export default function PerPersonStatsTab({
  data,
  orientation,
}: Props) {
  return (
    <div className="text-[12px]">
      <ChartTitle>Zrekrutowani przez aplikację (DZISIAJ):</ChartTitle>
      <VerticalBarChart
        data={data.todayStatData}
        orientation={orientation}
        stamp={data.stamp}
      />
      <ChartTitle>Zrekrutowani przez aplikację (MIESIĄC):</ChartTitle>
      <VerticalBarChart
        data={data.monthStatData}
        orientation={orientation}
        stamp={data.stamp}
      />
      <ChartTitle>Zrekrutowani przez aplikację (ROK):</ChartTitle>
      <VerticalBarChart
        data={data.yearStatData}
        orientation={orientation}
        stamp={data.stamp}
      />
    </div>
  );
}
