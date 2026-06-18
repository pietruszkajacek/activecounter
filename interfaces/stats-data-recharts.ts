import { GroupsID } from "./stats-data";

export type AccountsStatsDataReChartsItem = {
  dataKey: string;
  num: number;
  posAlp: string;
  posDsc: number;
  ngr?: number;
};

export type AccountsStatsDataReCharts = {
  todayStatData: AccountsStatsDataReChartsItem[];
  monthStatData: AccountsStatsDataReChartsItem[];
  yearStatData: AccountsStatsDataReChartsItem[];
};

export type GroupsStatsDataReChartsItem = StoresStatsDataReChartsItem;

export type GroupsStatsDataReCharts = {
  todayStatData: GroupsStatsDataReChartsItem[];
  monthStatData: GroupsStatsDataReChartsItem[];
  yearStatData: GroupsStatsDataReChartsItem[];
};

export type UnitStatsDataReCharts = {
  accounts: AccountsStatsDataReCharts;
  groups: GroupsStatsDataReCharts;
};

export type UnitStatsDataReChartsWithStamp = UnitStatsDataReCharts & {
  stamp: string;
};

export type StoresStatsDataReChartsItem = AccountsStatsDataReChartsItem & {
  [k in GroupsID]?: number;
};

export type StoresStatsDataReCharts = {
  todayStatData: StoresStatsDataReChartsItem[];
  monthStatData: StoresStatsDataReChartsItem[];
  yearStatData: StoresStatsDataReChartsItem[];
};

export type StoresStatsDataReChartsWithStamp = StoresStatsDataReCharts & {
  stamp: string;
};

export type PerPersonStatsDataReCharts = AccountsStatsDataReCharts;

export type PerPersonStatsDataReChartsWithStamp = PerPersonStatsDataReCharts & {
  stamp: string;
};