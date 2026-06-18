import React, { createContext } from "react";
import { InitData } from "@/interfaces/init-data";

export const InitDataContext = createContext<{
  initData: InitData;
  setInitData: React.Dispatch<React.SetStateAction<InitData | undefined>>;
} | null>(null);

type Props = {
  children: React.ReactNode;
  initData: InitData;
  setInitData: React.Dispatch<React.SetStateAction<InitData | undefined>>;
};

function InitDataProvider({ children, initData, setInitData }: Props) {
  return (
    <InitDataContext.Provider value={{initData: initData, setInitData: setInitData}}>
      {children}
    </InitDataContext.Provider>
  );
}

export default InitDataProvider;
