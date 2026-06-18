import ActiveCounterLogo from "./components/active-counter-logo";
import SynchroDataModal from "./components/synchro-data-modal";
import { useEffect, useRef, useState } from "react";
import { TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react";
import TabNavMain from "./components/tab-nav-main";
import CounterTab from "./counter-tab";
import { GroupsStatsData, PerPersonStatsData, UnitStatsData } from "@/interfaces/stats-data";
import StatsTab from "./stats-tab";
import useScreenOrientation from "./hooks/useScreenOrientation";
import { SortType } from "@/interfaces/sort-type";
import { Hash32Stamp } from "./lib/Hash32Stamp";
import NewPingTab from "./components/new-ping-tab";
import PerPersonStatsTab from "./per-person-stats-tab";
import { LocalContext, RemoteContext } from "./components/accounts-providers";
import useContextAndErrorIfNull from "./hooks/useContextAndErrorIfNull";
import StoresStatsTab from "./stores-stats-tab";
import { preparePerPersonStatsData, prepareStoresStatsData, prepareUnitStatsData } from "./lib/helpers";
import useMountedState from "./hooks/useMountedState";
import { RemoteAccountsData } from "@/interfaces/remote-accounts-data";
import useDashboardMode from "./hooks/useDashboardMode";
import useInterval from "./hooks/useInterval";
import { update } from "idb-keyval";
import ProfileDropdownMenu from "./components/profile-dropdown-menu";
import { googleScriptRun } from "./lib/api";
import { StoreIdb } from "@/interfaces/store-idb";
import { useBeforeunload } from 'react-beforeunload';
import { InitDataContext } from "./components/init-data-provider";
import { PerPersonStatsDataContext, StoresStatsDataContext, UnitStatsDataContext } from "./components/stats-data-providers ";
import { DataKeyIDB } from "@/interfaces/datakey-idb";

const sortTypes: Array<SortType> = [
  { sort: "alphabetically", name: "Alfabetycznie" },
  { sort: "ascending", name: "Malejąco" },
];

const dataRefreshTime = 1000 * 60 * 5; // 5 minutes

export default function MainPage() {
  const { accounts: localAccounts, setAccounts: setLocalAccounts } =
    useContextAndErrorIfNull(LocalContext);

  const { accounts: remoteAccounts, setAccounts: setRemoteAccounts } =
    useContextAndErrorIfNull(RemoteContext);

  const { initData } = useContextAndErrorIfNull(InitDataContext);

  const { statsData: unitStatsData, setStatsData: setUnitStatsData } =
    useContextAndErrorIfNull(UnitStatsDataContext);

  const { statsData: storesStatsData, setStatsData: setStoresStatsData } =
    useContextAndErrorIfNull(StoresStatsDataContext);

  const { statsData: perPersonStatsData, setStatsData: setPerPersonStatsData } =
    useContextAndErrorIfNull(PerPersonStatsDataContext);

  const [isSynchroDataModalOpen, setIsSynchroDataModalOpen] = useState(false);
  const [sendDataOK, setSendDataOK] = useState<boolean | null>(null);
  const [sendingData, setSendingData] = useState(false);

  const [waitForUserStatsData, setWaitForUserStatsData] = useState(false);
  const [waitForStatsData, setWaitForStatsData] = useState(false);
  const [waitForStoresStatsData, setWaitForStoresStatsData] = useState(false);
  const [waitForPerPersonStatsData, setWaitForPerPersonStatsData] =
    useState(false);

  const orientation = useScreenOrientation();

  const [statsRadioSortType, setStatsRadioSortType] = useState(sortTypes[0]);
  const [storesStatsRadioSortType, setStoresStatsRadioSortType] = useState(
    sortTypes[0]
  );
  const [selectedIndexTab, setSelectedIndexTab] = useState(0);

  const [pPerStatDataRefTime, setPPerStatDataRefTime] =
    useState<null | DOMHighResTimeStamp>(null);
  const [storesStatDataRefTime, setStoresStatDataRefTime] =
    useState<null | DOMHighResTimeStamp>(null);

  const refreshClicked = useRef(false);

  useBeforeunload(
    sendingData
      ? (event) => {
        event.preventDefault();
        refreshClicked.current = true;
      }                                                                                               
      : undefined
  );

  const dbMode = useDashboardMode(1536);

  useEffect(() => {
    if (dbMode && selectedIndexTab === 0) {
      handleChangeTab(1);
    }
  }, [dbMode]);

  const isMounted = useMountedState();

  useEffect(() => {
    getStatsData();
  }, [isMounted, selectedIndexTab]);

  useInterval(getStatsData, dbMode ? dataRefreshTime : null);

  function getStatsDataGen<resType>(
    fnName: string,
    wait: boolean,
    setWait: React.Dispatch<React.SetStateAction<boolean>>,
    success: (response: resType) => void,
    failure: (error: Error) => void,
    time: DOMHighResTimeStamp | null = null,
    param: StoreIdb | null = null
  ) {
    if (!wait) {
      if (time === null || performance.now() - time > dataRefreshTime) {
        setWait(true);
        googleScriptRun<resType>(
          fnName,
          (response) => {
            if (isMounted()) {
              setWait(false);
              success(response);
            }
          },
          (error: Error) => {
            if (isMounted()) {
              setWait(false);
              failure(error);
            }
          },
          [param]
        );
      }
    }
  }

  function getStatsData() {
    switch (selectedIndexTab) {
      case 0:
        getStatsDataGen<RemoteAccountsData>(
          "getIndividualTabStatsData",
          waitForUserStatsData,
          setWaitForUserStatsData,
          (response: RemoteAccountsData) => {
            setRemoteAccounts({ ...remoteAccounts, ...response });
          },
          (error: Error) => {
            // TODO: obsluga 401 - zwraca: NetworkError: Błąd połączenia. Powód: HTTP 401 (string)
            // alert z informacja i restartem app
            console.log(error);
          },
          null,
          {
            nr: initData.storeID,
            country: initData.country,
            name: initData.storeName,
          }
        );
        break;

      case 1:
        getStatsDataGen<UnitStatsData>(
          "getUnitTabStatsData",
          waitForStatsData,
          setWaitForStatsData,
          (response) => {
            if (Hash32Stamp(JSON.stringify(response)) !== unitStatsData.stamp) {
              setUnitStatsData({
                ...unitStatsData,
                ...prepareUnitStatsData(response),
                stamp: Hash32Stamp(JSON.stringify(response)),
              });
            }
          },
          (error: Error) => {
            // TODO: obsluga 401 - zwraca undefined
            console.log(error.message);
          },
          null,
          {
            nr: initData.storeID,
            country: initData.country,
            name: initData.storeName,
          }
        );
        break;

      case 2:
        getStatsDataGen<GroupsStatsData>(
          "getStoresTabStatsData",
          waitForStoresStatsData,
          setWaitForStoresStatsData,
          (response) => {
            if (
              Hash32Stamp(JSON.stringify(response)) !== storesStatsData.stamp
            ) {
              setStoresStatsData({
                ...storesStatsData,
                ...prepareStoresStatsData(response),
                stamp: Hash32Stamp(JSON.stringify(response))
              });
            }
            setStoresStatDataRefTime(performance.now());
          },
          (error: Error) => {
            // TODO: obsluga 401
            console.log(error.message);
          },
          null // storesStatDataRefTime
        );
        break;

      case 3:
        getStatsDataGen<PerPersonStatsData>(
          "getPerPersonTabStatsData",
          waitForPerPersonStatsData,
          setWaitForPerPersonStatsData,
          (response) => {
            if (
              Hash32Stamp(JSON.stringify(response)) !== perPersonStatsData.stamp
            ) {
              setPerPersonStatsData({
                ...perPersonStatsData,
                ...preparePerPersonStatsData(response),
                stamp: Hash32Stamp(JSON.stringify(response))
              });
            }
            setPPerStatDataRefTime(performance.now());
          },
          (error: Error) => {
            console.log(error.message);
          },
          null // pPerStatDataRefTime
        );
        break;

      default:
        break;
    }
  }

  function handleStatsChangeSelect(type: SortType) {
    setStatsRadioSortType(type);
  }

  function handleStoresStatsChangeSelect(type: SortType) {
    setStoresStatsRadioSortType(type);
  }

  function handleBtnSendLocalAccounts() {
    setSendingData(false);
    setSendDataOK(null);
    setIsSynchroDataModalOpen(true);
  }

  function sendDataToDatabaseSheet() {
    if (!sendingData) {
      setSendingData(true);
      update<DataKeyIDB>(initData.userID, (oldKeyVal) => {
        if (oldKeyVal) {
          return {
            ...oldKeyVal,
            needToVerifyData: true,
          };
        } else {
          throw new Error();
        }
      }).then(() => {
        google.script.run
          .withSuccessHandler((response: RemoteAccountsData) => {
            if (isMounted()) {
              update<DataKeyIDB>(initData.userID, (oldKeyVal) => {
                if (oldKeyVal) {
                  return {
                    ...oldKeyVal,
                    accounts: [],
                    needToVerifyData: false,
                  };
                } else {
                  throw new Error();
                }
              })
                .then(() => {
                  setSendDataOK(true);
                  setSendingData(false);
                  setRemoteAccounts({
                    ...remoteAccounts,
                    ...response,
                  });
                  setLocalAccounts([]);
                })
                .catch(() => {
                  // restart app
                });
            }
          })
          .withFailureHandler((error: Error | string) => {
            if (isMounted()) {
              switch (typeof error) {
                case "string":
                  if (refreshClicked.current) {
                    // refresh page;
                  } else {
                    // offline / 401
                    update<DataKeyIDB>(initData.userID, (oldKeyVal) => {
                      if (oldKeyVal) {
                        return {
                          ...oldKeyVal,
                          needToVerifyData: false,
                        };
                      } else {
                        throw new Error();
                      }
                    })
                      .then(() => {
                        setSendingData(false);
                        setSendDataOK(false);
                      })
                      .catch(() => {
                        // restart app
                      });
                  }
                  break;

                case "object":
                  if (error.name === "ScriptError") {
                    // script error
                    update<DataKeyIDB>(initData.userID, (oldKeyVal) => {
                      if (oldKeyVal) {
                        return {
                          ...oldKeyVal,
                          needToVerifyData: false,
                        };
                      } else {
                        throw new Error();
                      }
                    })
                      .then(() => {
                        setSendingData(false);
                        setSendDataOK(false);
                      })
                      .catch(() => {
                        // restart app
                      });
                  }
                  break;

                default:
                  // other error type
                  break;
              }
            }
          })
          .saveLocalAccounts(JSON.stringify(localAccounts), {
            nr: initData.storeID,
            name: initData.storeName,
            country: initData.country,
          }, initData.consolidation);
      }).catch(() => {
        setSendingData(false);
        setSendDataOK(false);
      });
    }
  }

  function closeSynchroDataModal() {
    if (!sendingData) {
      setIsSynchroDataModalOpen(false);
    }
  }

  function handleChangeTab(index: number) {
    setSelectedIndexTab(index);
  }

  // const renderTextInLegend: Formatter = (value: GroupsID, entry) => {
  //   type Pok = "POK";
  //   type Dzs = "Dział sportowy";
  //   type Ser = "Serwis";
  //   type Hos = "Hostessa / Event zewn.";

  //   type Groups = {
  //     pok: Pok;
  //     dzs: Dzs;
  //     ser: Ser;
  //     hos: Hos;
  //   };

  //   const groups: Groups = {
  //     pok: "POK",
  //     dzs: "Dział sportowy",
  //     ser: "Serwis",
  //     hos: "Hostessa / Event zewn.",
  //   };
    
  //   return <span className="">{`${groups[value]}`}</span>;
  // };
    
  // const renderLegend: ContentType  = (props) => {
  //   const { payload } = props;

  //   return (
  //     <ul className="pl-[60px] text-center">
  //       {payload?.map((entry, index) => {
  //         return (
  //           <li
  //             className="pr-3 last:pr-0"
  //             style={{ color: entry.color, display: "inline" }}
  //             key={`item-${index}`}
  //           >
  //             <svg width="14" height="14" viewBox="0 0 32 32" style={{display: "inline", verticalAlign: "middle", marginRight: "4px"}}><title></title><desc></desc><path stroke="none" fill="#8884d8" d="M0,4h32v24h-32z" className="recharts-legend-icon"></path></svg>
  //             {renderTextInLegend(entry.value, entry, index)}
  //           </li>
  //         );
  //       })}
  //     </ul>
  //   );
  // };  

  return (
    <>
      <div className="container mx-auto overflow-hidden">
        <div className="flex flex-col mx-auto">
          <div className="flex p-4 justify-between items-center">
            <ActiveCounterLogo className={"w-1/6 lg:w-1/12"} />
            <ProfileDropdownMenu />
          </div>
          <div className="block">
            <p className="2xl:hidden bg-newdecat-700 text-white text-right text-2xl p-2 truncate">{`Cześć! ${initData.firstName} ${initData.lastName}`}</p>
            <p className="hidden 2xl:block bg-newdecat-700 text-white text-right text-2xl p-2 truncate">{`Miłego dnia! ${initData.storeName}`}</p>
            <p className="2xl:hidden font-roboto text-sm italic bg-white text-newdecat-700 text-right p-2 truncate">
              {`${initData.email} / ${initData.storeName} (${initData.storeID}) / ${initData.country}`}
            </p>
            <p className="hidden 2xl:block font-roboto text-sm italic bg-white text-newdecat-700 text-right p-2 truncate">
              {`${initData.storeName} (${initData.storeID}) / ${initData.country}`}
            </p>
          </div>
          <TabGroup selectedIndex={selectedIndexTab} onChange={handleChangeTab}>
            <TabList className="px-2 py-3">
              <ul className="flex flex-wrap border-b border-newdecat-200">
                <li>
                  <TabNavMain disabled={dbMode} title={"Stat. indyw."} />
                </li>
                <li className="relative">
                  <TabNavMain title={`Stat. ${initData.storeName}`} />
                </li>
                <li className="relative">
                  <TabNavMain title={`Statystyki ${initData.country}`}>
                    <NewPingTab
                      title={"New!"}
                      selectedIndexTab={selectedIndexTab}
                      indexTab={2}
                      titleColor={"text-newdecat-500"}
                    />
                  </TabNavMain>
                </li>
                <li className="relative">
                  <TabNavMain title={`Stat. TOP 100!`}>
                    <NewPingTab
                      title={"Exp.!"}
                      selectedIndexTab={selectedIndexTab}
                      indexTab={3}
                      titleColor={"text-orange-500"}
                    />
                  </TabNavMain>
                </li>
              </ul>
            </TabList>
            <TabPanels>
              <TabPanel>
                <CounterTab
                  handleBtnSendLocalAccounts={handleBtnSendLocalAccounts}
                />
              </TabPanel>
              <TabPanel>
                <StatsTab
                  data={unitStatsData}
                  orientation={orientation}
                  handleChangeSelect={handleStatsChangeSelect}
                  radioSortType={statsRadioSortType}
                  sortTypes={sortTypes}
                  // handleRenderLegend={renderLegend}
                  // handleRenderTextInLegend={renderTextInLegend}
                />
              </TabPanel>
              <TabPanel>
                <StoresStatsTab
                  data={storesStatsData}
                  orientation={orientation}
                  handleChangeSelect={handleStoresStatsChangeSelect}
                  radioSortType={storesStatsRadioSortType}
                  sortTypes={sortTypes}
                />
              </TabPanel>
              <TabPanel>
                <PerPersonStatsTab
                  data={perPersonStatsData}
                  orientation={orientation}
                />
              </TabPanel>
            </TabPanels>
          </TabGroup>
        </div>
      </div>
      <SynchroDataModal
        openModal={isSynchroDataModalOpen}
        sendingData={sendingData}
        sendDataOK={sendDataOK}
        closeModal={closeSynchroDataModal}
        handleBtnSend={sendDataToDatabaseSheet}
      />
    </>
  );
}
