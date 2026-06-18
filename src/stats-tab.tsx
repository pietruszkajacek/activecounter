import { Field, Label, Radio, RadioGroup } from "@headlessui/react";
import { SortType } from "@/interfaces/sort-type";
import { UnitStatsDataReChartsWithStamp } from "@/interfaces/stats-data-recharts";
import HorizontalStackedBarChart from "./components/horizontal-stacked-bar-chart";
import VerticalBarChart from "./components/vertical-bar-chart";
import CustomLegendRecharts from "./components/custom-legend-rechart";
import ChartTitle from "./components/chart-title";
import VerticalStackedBarChart from "./components/vertical-stacked-bar-chart";

type Props = {
  data: UnitStatsDataReChartsWithStamp;
  orientation: OrientationType;
  handleChangeSelect: (type: SortType) => void;
  radioSortType: SortType;
  sortTypes: SortType[];
};

export default function StatsTab({
  data,
  orientation,
  handleChangeSelect,
  radioSortType,
  sortTypes,
}: Props) {
  return (
    <div className="text-[12px]">
      <RadioGroup
        value={radioSortType}
        onChange={handleChangeSelect}
        aria-label="Sort type"
      >
        {sortTypes.map((type) => (
          <Field
            key={type.sort}
            className="inline-flex items-center gap-2 ml-7 mb-4"
          >
            <Radio
              value={type}
              className="group flex size-5 items-center justify-center rounded-full border bg-white data-[checked]:bg-newdecat-700"
            >
              <span className="invisible size-2 rounded-full bg-white group-data-[checked]:visible" />
            </Radio>
            <Label>{type.name}</Label>
          </Field>
        ))}
      </RadioGroup>

      <div className="hidden 2xl:block">
        <CustomLegendRecharts />
      </div>
      <div className="block 2xl:inline-block 2xl:w-10/12">
        <div className="block 2xl:hidden">
          <CustomLegendRecharts />
        </div>
        <ChartTitle>Zrekrutowani przez aplikację (DZISIAJ):</ChartTitle>
        <VerticalBarChart
          data={data.accounts.todayStatData}
          orientation={orientation}
          radioSortType={radioSortType}
          stamp={data.stamp}
        />
      </div>
      <div className="block 2xl:hidden">
        <HorizontalStackedBarChart
          data={data.groups.todayStatData}
          orientation={orientation}
          radioSortType={radioSortType}
          stamp={data.stamp}
        />
      </div>
      <div className="hidden 2xl:inline-block 2xl:w-2/12">
        <VerticalStackedBarChart
          data={data.groups.todayStatData}
          orientation={orientation}
          radioSortType={radioSortType}
          stamp={data.stamp}
          brush={false}
        />
      </div>
      
      <ChartTitle>Zrekrutowani przez aplikację (MIESIĄC):</ChartTitle>
      <div className="block 2xl:inline-block 2xl:w-10/12">
        <VerticalBarChart
          data={data.accounts.monthStatData}
          orientation={orientation}
          radioSortType={radioSortType}
          stamp={data.stamp}
        />
      </div>
      <div className="block 2xl:hidden">
        <HorizontalStackedBarChart
          data={data.groups.monthStatData}
          orientation={orientation}
          radioSortType={radioSortType}
          stamp={data.stamp}
        />
      </div>
      <div className="hidden 2xl:inline-block 2xl:w-2/12">
        <VerticalStackedBarChart
          data={data.groups.monthStatData}
          orientation={orientation}
          radioSortType={radioSortType}
          stamp={data.stamp}
          brush={false}
        />
      </div>

      <ChartTitle>Zrekrutowani przez aplikację (ROK):</ChartTitle>
      <div className="block 2xl:inline-block 2xl:w-10/12">
        <VerticalBarChart
          data={data.accounts.yearStatData}
          orientation={orientation}
          radioSortType={radioSortType}
          stamp={data.stamp}
        />
      </div>
      <div className="block 2xl:hidden mb-6">
        <HorizontalStackedBarChart
          data={data.groups.yearStatData}
          orientation={orientation}
          radioSortType={radioSortType}
          stamp={data.stamp}
        />
      </div>
      <div className="hidden 2xl:inline-block 2xl:w-2/12">
        <VerticalStackedBarChart
          data={data.groups.yearStatData}
          orientation={orientation}
          radioSortType={radioSortType}
          stamp={data.stamp}
          brush={false}
        />
      </div>
    </div>
  );
}
