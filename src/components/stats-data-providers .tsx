import React, { createContext } from "react";
import { PerPersonStatsDataReChartsWithStamp, StoresStatsDataReChartsWithStamp, UnitStatsDataReChartsWithStamp } from "@/interfaces/stats-data-recharts";

interface statsDataSetter<Type> {
  (value: Type): void;
}

type contextStatsDataType<Type> = {
  statsData: Type;
  setStatsData: statsDataSetter<Type>;
};

export const UnitStatsDataContext = createContext<contextStatsDataType<
  UnitStatsDataReChartsWithStamp
> | null>(null);

export const StoresStatsDataContext =
  createContext<contextStatsDataType<StoresStatsDataReChartsWithStamp> | null>(
    null
  );

export const PerPersonStatsDataContext =
  createContext<contextStatsDataType<PerPersonStatsDataReChartsWithStamp> | null>(null);

type Props = {
  children: React.ReactNode;
  unitStatsData: UnitStatsDataReChartsWithStamp;
  setUnitStatsData: statsDataSetter<UnitStatsDataReChartsWithStamp>;

  storesStatsData: StoresStatsDataReChartsWithStamp;
  setStoresStatsData: statsDataSetter<StoresStatsDataReChartsWithStamp>;
  perPersonStatsData: PerPersonStatsDataReChartsWithStamp;
  setPerPersonStatsData: statsDataSetter<PerPersonStatsDataReChartsWithStamp>;

};

function StatsDataProviders({
  children,
  unitStatsData,
  setUnitStatsData,
  storesStatsData,
  setStoresStatsData,
  perPersonStatsData,
  setPerPersonStatsData,
}: Props) {
  return (
    <UnitStatsDataContext.Provider
      value={{ statsData: unitStatsData, setStatsData: setUnitStatsData }}
    >
      <StoresStatsDataContext.Provider
        value={{ statsData: storesStatsData, setStatsData: setStoresStatsData }}
      >
        <PerPersonStatsDataContext.Provider
          value={{
            statsData: perPersonStatsData,
            setStatsData: setPerPersonStatsData,
          }}
        >
          {children}
        </PerPersonStatsDataContext.Provider>
      </StoresStatsDataContext.Provider>
    </UnitStatsDataContext.Provider>
  );
}

export default StatsDataProviders;
