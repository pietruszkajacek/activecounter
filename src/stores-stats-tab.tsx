import { Field, Label, Radio, RadioGroup } from "@headlessui/react";
import { SortType } from "@/interfaces/sort-type";
import { StoresStatsDataReCharts, StoresStatsDataReChartsItem, StoresStatsDataReChartsWithStamp } from "@/interfaces/stats-data-recharts";
import VerticalStackedBarChart from "./components/vertical-stacked-bar-chart";
import HorizontalStackedBarChart from "./components/horizontal-stacked-bar-chart";
import CustomLegendRecharts from "./components/custom-legend-rechart";
import ChartTitle from "./components/chart-title";

type Props = {
  data: StoresStatsDataReChartsWithStamp;
  orientation: OrientationType;
  handleChangeSelect: (type: SortType) => void;
  radioSortType: SortType;
  sortTypes: Array<SortType>;
};

export default function StoresStatsTab({
  data,
  orientation,
  handleChangeSelect,
  radioSortType,
  sortTypes,
}: Props) {

  const reducer = (
    acc: StoresStatsDataReChartsItem,
    cur: StoresStatsDataReChartsItem,
    index: number,
    arr: StoresStatsDataReChartsItem[]
  ) => {
    acc.pok ? (acc.pok += cur.pok ?? 0) : (acc.pok = cur.pok);
    acc.dzs ? (acc.dzs += cur.dzs ?? 0) : (acc.dzs = cur.dzs);
    acc.ser ? (acc.ser += cur.ser ?? 0) : (acc.ser = cur.ser);
    acc.hos ? (acc.hos += cur.hos ?? 0) : (acc.hos = cur.hos);
    acc.ngr ? (acc.ngr += cur.ngr ?? 0) : (acc.ngr = cur.ngr);

    if (index === arr.length - 1) {
      acc.num += acc.pok ?? 0;
      acc.num += acc.dzs ?? 0;
      acc.num += acc.ser ?? 0;
      acc.num += acc.hos ?? 0;
      acc.num += acc.ngr ?? 0;

      acc.dataKey += `${acc.num}`;
    }
    return acc;
  };

  const allGrData: StoresStatsDataReCharts = {
    todayStatData: data.todayStatData.length > 0 ? [
      data.todayStatData.reduce(reducer, {
        dataKey: "POLSKA (DZISIAJ): ",
        num: 0,
        posAlp: "",
        posDsc: 1,
      }),
    ] : [],
    monthStatData: data.monthStatData.length > 0 ? [
      data.monthStatData.reduce(reducer, {
        dataKey: "POLSKA (MIESIĄC): ",
        num: 0,
        posAlp: "",
        posDsc: 1,
      }),
    ]: [],
    yearStatData: data.yearStatData.length > 0 ? [
      data.yearStatData.reduce(reducer, {
        dataKey: "POLSKA (ROK): ",
        num: 0,
        posAlp: "",
        posDsc: 1,
      }),
    ] : [],
  };
    
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
        <VerticalStackedBarChart
          data={data.todayStatData}
          orientation={orientation}
          radioSortType={radioSortType}
          stamp={data.stamp}
          brush={true}
        />
      </div>
      <div className="block 2xl:hidden">
        <HorizontalStackedBarChart
          data={allGrData.todayStatData}
          orientation={orientation}
          radioSortType={radioSortType}
          stamp={data.stamp}
        />
      </div>
      <div className="hidden 2xl:inline-block 2xl:w-2/12">
        <VerticalStackedBarChart
          data={allGrData.todayStatData}
          orientation={orientation}
          radioSortType={radioSortType}
          stamp={data.stamp}
          brush={false}
        />
      </div>

      <ChartTitle>Zrekrutowani przez aplikację (MIESIĄC):</ChartTitle>
      <div className="block 2xl:inline-block 2xl:w-10/12">
        <VerticalStackedBarChart
          data={data.monthStatData}
          orientation={orientation}
          radioSortType={radioSortType}
          stamp={data.stamp}
          brush={true}
        />
      </div>
      <div className="block 2xl:hidden">
        <HorizontalStackedBarChart
          data={allGrData.monthStatData}
          orientation={orientation}
          radioSortType={radioSortType}
          stamp={data.stamp}
        />
      </div>
      <div className="hidden 2xl:inline-block 2xl:w-2/12">
        <VerticalStackedBarChart
          data={allGrData.monthStatData}
          orientation={orientation}
          radioSortType={radioSortType}
          stamp={data.stamp}
        />
      </div>

      <ChartTitle>Zrekrutowani przez aplikację (ROK):</ChartTitle>
      <div className="block 2xl:inline-block 2xl:w-10/12">
        <VerticalStackedBarChart
          data={data.yearStatData}
          orientation={orientation}
          radioSortType={radioSortType}
          stamp={data.stamp}
          brush={true}
        />
      </div>
      <div className="block 2xl:hidden mb-6">
        <HorizontalStackedBarChart
          data={allGrData.yearStatData}
          orientation={orientation}
          radioSortType={radioSortType}
          stamp={data.stamp}
        />
      </div>
      <div className="hidden 2xl:inline-block 2xl:w-2/12">
        <VerticalStackedBarChart
          data={allGrData.yearStatData}
          orientation={orientation}
          radioSortType={radioSortType}
          stamp={data.stamp}
        />
      </div>
    </div>
  );
}
