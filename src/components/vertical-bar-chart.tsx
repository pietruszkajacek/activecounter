import { SortType } from "@/interfaces/sort-type";
import { AccountsStatsDataReChartsItem } from "@/interfaces/stats-data-recharts";
import { Bar, BarChart, Brush, CartesianGrid, Rectangle, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

type Props = {
  data: AccountsStatsDataReChartsItem[];
  orientation: OrientationType;
  radioSortType?: SortType;
  stamp: string;
  brush?: boolean;
};

export default function VerticalBarChart({
  data,
  orientation,
  radioSortType = {sort: "ascending", name: "Malejąco"},
  stamp,
}: Props) {
  return (
    <div className="overflow-x-hidden h-64 2xl:h-56 pb-4">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
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
          <XAxis tick={false} dataKey="dataKey" />
          <YAxis type="number" allowDecimals={false} />
          <Tooltip cursor={false} />
          {/* <Legend
            wrapperStyle={{ paddingLeft: "60px", paddingBottom: "10px" }}
            align="center"
            verticalAlign="top"
          /> */}
          <Brush
            dataKey={
              radioSortType.sort === "alphabetically" ? "posAlp" : "posDsc"
            }
            height={25}
            stroke="#3cae89"
          />
          <Bar
            name="rekrutacje przez aplikację:"
            dataKey="num"
            fill="#3743bb"
            activeBar={<Rectangle fill="#3cae89" stroke="#2e4494" />}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
