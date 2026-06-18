import { stackedBarChartCol } from "@/consts/constants";
import { SortType } from "@/interfaces/sort-type";
import { StoresStatsDataReChartsItem } from "@/interfaces/stats-data-recharts";

import {
  Rectangle,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

type Props = {
  data: StoresStatsDataReChartsItem[];
  orientation: OrientationType;
  radioSortType: SortType;
  stamp: string;
};

export default function HorizontalStackedBarChart({
  data,
  orientation,
  radioSortType,
  stamp
}: Props) {
  return (
    <div className="relative z-10 h-28 pb-4">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          layout="vertical"
          key={`${radioSortType.sort} ${stamp} ${orientation}`}
          data={data.sort(
            radioSortType.sort === "alphabetically"
              ? (a, b) => a.dataKey.localeCompare(b.dataKey)
              : (a, b) => b.num - a.num
          )}
          margin={{
            top: 5,
            right: 30,
            left: 0,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" tick={true} allowDecimals={false} />
          <YAxis
            type="category"
            allowDecimals={false}
            dataKey={"dataKey"}
            tick={false}
          />
          <Tooltip cursor={false} itemStyle={{ margin: 0, padding: 0 }} />
          {/* <Legend
            wrapperStyle={{ paddingLeft: "60px", paddingBottom: "10px" }}
            align="center"
            verticalAlign="top"
          /> */}
          {data.length > 0 && (
            <>
              <Bar
                name="POK"
                dataKey="pok"
                stackId="a"
                fill={stackedBarChartCol.pok}
                activeBar={
                  <Rectangle fill={stackedBarChartCol.pok} stroke="#2e4494" />
                }
              />
              <Bar
                name="Dział sportowy"
                dataKey="dzs"
                stackId="a"
                fill={stackedBarChartCol.dzs}
                activeBar={
                  <Rectangle fill={stackedBarChartCol.dzs} stroke="#2e4494" />
                }
              />
              <Bar
                name="Serwis"
                dataKey="ser"
                stackId="a"
                fill={stackedBarChartCol.ser}
                activeBar={
                  <Rectangle fill={stackedBarChartCol.ser} stroke="#2e4494" />
                }
              />
              <Bar
                name="Hostessa / Event zewn."
                dataKey="hos"
                stackId="a"
                fill={stackedBarChartCol.hos}
                activeBar={
                  <Rectangle fill={stackedBarChartCol.hos} stroke="#2e4494" />
                }
              />
              <Bar
                name="Brak przypisania"
                dataKey="ngr"
                stackId="a"
                fill={stackedBarChartCol.ngr}
                activeBar={
                  <Rectangle fill={stackedBarChartCol.ngr} stroke="#2e4494" />
                }
              />
            </>
          )}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
