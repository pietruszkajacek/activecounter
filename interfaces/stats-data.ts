export type GroupsID = "pok" | "dzs" | "ser" | "hos" | "ngr";

export type GroupsStatsDataItem = [string, number, [GroupsID, number][]];

// export type GroupsStatsData = {
//   todayStatData: [GroupsID, number][];
//   monthStatData: [GroupsID, number][];
//   yearStatData: [GroupsID, number][];
// };

export type GroupsStatsData = {
  todayStatData: GroupsStatsDataItem[];
  monthStatData: GroupsStatsDataItem[];
  yearStatData: GroupsStatsDataItem[];
};

export type AccountsStatsDataItem = [string, number];

export type AccountsStatsData = {
  todayStatData: AccountsStatsDataItem[];
  monthStatData: AccountsStatsDataItem[];
  yearStatData: AccountsStatsDataItem[];
};

export type UnitStatsData = {
  accounts: AccountsStatsData;
  groups: GroupsStatsData;
};

export type StoresStatsDataItem = [string, number, string];

export type StoresStatsData = {
  todayStatData: StoresStatsDataItem[] ;
  monthStatData: StoresStatsDataItem[];
  yearStatData: StoresStatsDataItem[];
};

export type PerPersonStatsData = AccountsStatsData;

export type StoresCachedStatsDataAndTime = {
  todayStatData: [string, number, string, Date][];
  monthStatData: [string, number, string, Date][];
  yearStatData: [string, number, string, Date][];
};

export type PerPersonCachedStatsDataAndTime = {
  todayStatData: [string, number, Date][];
  monthStatData: [string, number, Date][];
  yearStatData: [string, number, Date][];
};

export type Pok = "POK";
export type Dzs = "Dział sportowy";
export type Ser = "Serwis";
export type Hos = "Hostessa / Event zewn.";
export type Ngr = "Brak przypisania";

export type Groups = {
  pok: Pok;
  dzs: Dzs;
  ser: Ser;
  hos: Hos;
  ngr: Ngr;
};

// const groups: Groups = {
//   pok: "POK",
//   dzs: "Dział sportowy",
//   ser: "Serwis",
//   hos: "Hostessa / Event zewn.",
// };

// type GroupsStatsDataTabItem = {
//   [k in GroupID]: number;
// };