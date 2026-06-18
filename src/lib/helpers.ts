import { AccountsStatsData, GroupsStatsData, GroupsStatsDataItem, UnitStatsData } from "@/interfaces/stats-data";
import { AccountsStatsDataReCharts, GroupsStatsDataReCharts, GroupsStatsDataReChartsItem, PerPersonStatsDataReCharts, StoresStatsDataReCharts, StoresStatsDataReChartsItem, UnitStatsDataReCharts } from "@/interfaces/stats-data-recharts";

function emailToName(email: string) {
  const arr = email.split('.');
  return `${arr[0].toLocaleUpperCase()} ${(arr[1][0]).toLocaleUpperCase()}.`;
}

function emailToName2(email: string) {
  const arr = email.split('.');
  return `${arr[0]}. ${arr[1].slice(1).toLocaleUpperCase()} ${(arr[2][0]).toLocaleUpperCase()}. ${arr[3].split(' ')[1]}`;
}

const reducer = (row: GroupsStatsDataItem, index: number) =>
  row[2].reduce<GroupsStatsDataReChartsItem>(
    (accumulator, curGroup) => {
      accumulator[curGroup[0]] = curGroup[1];
      
      // const a = {
      //   ...accumulator,
      //   [curGroup[0]]: curGroup[1]
      // };
      
      return accumulator;
    },
    {
      dataKey: `${row[0]} : ${row[1]}`,
      num: row[1],
      posAlp: row[0].charAt(0).toLocaleUpperCase(),
      posDsc: index + 1,
    }
  );

const countNoGroups = (store: StoresStatsDataReChartsItem) => {
  const groups = [store.pok, store.dzs, store.ser, store.hos];
  const countAssigned = groups.reduce<number>((acc, curr) => {
    return curr !== undefined ? acc + curr : acc;
  }, 0);

  if (countAssigned === 0) {
    store["ngr"] = store.num;
  } else if (countAssigned !== store.num) {
    store["ngr"] = store.num - countAssigned;
  }
  
  return store;
};

export function prepareStoresStatsData(
  data: GroupsStatsData
): StoresStatsDataReCharts {
  return {
    todayStatData: data.todayStatData.map(reducer).map(countNoGroups),
    monthStatData: data.monthStatData.map(reducer).map(countNoGroups),
    yearStatData: data.yearStatData.map(reducer).map(countNoGroups)
  };
}

function prepareUnitGroupsStatsData(data: GroupsStatsData): GroupsStatsDataReCharts {
  return {
    todayStatData:
      data.todayStatData[0][1] > 0
        ? data.todayStatData.map(reducer).map(countNoGroups)
        : [],
    monthStatData:
      data.monthStatData[0][1] > 0
        ? data.monthStatData.map(reducer).map(countNoGroups)
        : [],
    yearStatData:
      data.yearStatData[0][1] > 0
        ? data.yearStatData.map(reducer).map(countNoGroups)
        : [],
  };
}

export function prepareUnitStatsData(
  data: UnitStatsData,
  withoutEmail: boolean = true
): UnitStatsDataReCharts {
  return {
    accounts: prepareStatsData(data.accounts, withoutEmail),
    groups: prepareUnitGroupsStatsData(data.groups),
  };
}

export function preparePerPersonStatsData(data: AccountsStatsData, withoutEmail: boolean = true): PerPersonStatsDataReCharts {
  return {
    todayStatData: data.todayStatData.map((row, index) => ({
      dataKey: !withoutEmail ? row[0] : emailToName2(row[0]),
      num: row[1],
      posAlp: row[0].charAt(0).toLocaleUpperCase(),
      posDsc: index + 1,
    })),
    monthStatData: data.monthStatData.map((row, index) => ({
      dataKey: !withoutEmail ? row[0] : emailToName2(row[0]),
      num: row[1],
      posAlp: row[0].charAt(0).toLocaleUpperCase(),
      posDsc: index + 1,
    })),
    yearStatData: data.yearStatData.map((row, index) => ({
      dataKey: !withoutEmail ? row[0] : emailToName2(row[0]),
      num: row[1],
      posAlp: row[0].charAt(0).toLocaleUpperCase(),
      posDsc: index + 1,
    })),
  };
}

export function prepareStatsData(data: AccountsStatsData, withoutEmail: boolean = true): AccountsStatsDataReCharts {
  return {
    todayStatData: data.todayStatData.map((row, index) => ({
      dataKey: !withoutEmail ? row[0] : emailToName(row[0]),
      num: row[1],
      posAlp: row[0].charAt(0).toLocaleUpperCase(),
      posDsc: index + 1,
    })),
    monthStatData: data.monthStatData.map((row, index) => ({
      dataKey: !withoutEmail ? row[0] : emailToName(row[0]),
      num: row[1],
      posAlp: row[0].charAt(0).toLocaleUpperCase(),
      posDsc: index + 1,
    })),
    yearStatData: data.yearStatData.map((row, index) => ({
      dataKey: !withoutEmail ? row[0] : emailToName(row[0]),
      num: row[1],
      posAlp: row[0].charAt(0).toLocaleUpperCase(),
      posDsc: index + 1,
    })),
  };
}