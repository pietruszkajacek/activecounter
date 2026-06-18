import React, { useState, useEffect } from "react";

import type { AccountCreated } from "@/interfaces/account-created";
import type { RemoteAccountsData } from "@/interfaces/remote-accounts-data";
import type { InitData } from "@/interfaces/init-data";
import type { NotificationsModalDialogType } from "@/interfaces/notifications-modal-dialog-type";
import type { DataKeyIDB } from "@/interfaces/datakey-idb";

import MainPage from "./main-page";
import SplashScreen from "./splash-screen";
import MultiTabsBrowserScreen from "./multi-tabs-browser-screen";

import AccountsProviders from "./components/accounts-providers";
import StatsDataProviders from "./components/stats-data-providers ";
import InitDataProvider from "./components/init-data-provider";
import SettingsDialogModalProvider from "./components/settings-dialog-modal-provider";

import SettingsDialogModal from "./components/settings-dialog-modal";
import { default as Alert } from "./components/modal-dialog";

import useOnlyOneAppTab from "./hooks/useOnlyOneAppTab";

import { get, set, update } from "idb-keyval";
import useMountedState from "./hooks/useMountedState";
import { PerPersonStatsDataReChartsWithStamp, StoresStatsDataReChartsWithStamp, UnitStatsDataReChartsWithStamp } from "@/interfaces/stats-data-recharts";

const version = "2.4.1";
const build = "548a4d6";

let didInit = false;

type AlertProperties = {
  title: string;
  notification: string;
  notificationType: NotificationsModalDialogType;
  textButton: string;
};

function App() {
  const [initData, setInitData] = useState<InitData | undefined>(undefined);
  const [textInfo, setTextInfo] = useState<string>("");
  const isOriginal = useOnlyOneAppTab();
  const [isSettingsDialogModalOpen, setIsSettingsDialogModalOpen] =
    useState(false);

  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [alertProperties, setAlertProperties] = useState<AlertProperties>({
    title: "Coś poszło nie tak...",
    notification: "",
    notificationType: "Alert",
    textButton: "Zamknij",
  });

  const [localAccounts, setLocalAccounts] = useState<
    AccountCreated[]>([]);
  const [remoteAccounts, setRemoteAccounts] = useState<
    RemoteAccountsData | undefined
  >(undefined);

  const [unitStatsData, setUnitStatsData] = useState<UnitStatsDataReChartsWithStamp>({
    accounts: { monthStatData: [], todayStatData: [], yearStatData: [] },
    groups: { monthStatData: [], todayStatData: [], yearStatData: [] },
    stamp: new Date().toJSON(),
  });

  const [storesStatsData, setStoresStatsData] = useState<StoresStatsDataReChartsWithStamp>({
    monthStatData: [],
    todayStatData: [],
    yearStatData: [],
    stamp: new Date().toJSON(),
  });

  const [perPersonStatsData, setPerPersonStatsData] = useState<PerPersonStatsDataReChartsWithStamp>({
    monthStatData: [],
    todayStatData: [],
    yearStatData: [],
    stamp: new Date().toJSON(),
  });

  const isMounted = useMountedState();

  useEffect(() => {
    if (!didInit) {
      didInit = true;
      google.script.run
        .withSuccessHandler((response: InitData) => {
          if (isMounted()) {
            const localAccountsJSONStr = localStorage.getItem("localAccounts");
            const remoteAccountsJSONStr =
              localStorage.getItem("remoteAccounts");
            if (localAccountsJSONStr || remoteAccountsJSONStr) {
              // first launch app with IDB - before converting from localstorage to IDB...
              try {
                const oldLocalAccounts: AccountCreated[] = localAccountsJSONStr
                  ? JSON.parse(localAccountsJSONStr)
                  : [];

                setTextInfo("Aktualizuję aplikację...");

                set(response.userID, {
                  accounts: oldLocalAccounts,
                  store: {
                    nr: response.storeID,
                    name: response.storeName,
                    country: response.country,
                  },
                  needToVerifyData: false,
                  consolidation: response.consolidation,
                })
                  .then(() => {
                    localStorage.removeItem("localAccounts");
                    localStorage.removeItem("remoteAccounts");

                    setInitData({
                      ...response,
                    });
                    setLocalAccounts(oldLocalAccounts);

                    setIsSettingsDialogModalOpen(true);
                  })
                  .catch(() => {
                    // Failed to convert localstorage to IDB-Keyval...
                    setAlertProperties({
                      ...alertProperties,
                      notification: "Failed to store IDB-Keyvals...",
                    });
                    setIsAlertOpen(true);
                  });
              } catch (error) {
                // localAccounts localStorage items is not valid JSON...
                if (error instanceof SyntaxError) {
                  setAlertProperties({
                    ...alertProperties,
                    title: error.name,
                    notification: error.message,
                  });
                }
                setIsAlertOpen(true);
              }
            } else {
              // launch app after convert to IDB...
              get<DataKeyIDB>(response.userID)
                .then((key) => {
                  if (key) {
                    if (key.needToVerifyData) {
                      google.script.run
                        .withSuccessHandler(() => {
                          if (isMounted()) {
                            update<DataKeyIDB>(response.userID, () => {
                              return {
                                accounts: [],
                                store: key.store,
                                needToVerifyData: false,
                                consolidation: key.consolidation ? key.consolidation : response.consolidation
                              };
                            })
                              .then(() => {
                                setLocalAccounts([]);
                                setInitData({
                                  ...response,
                                  storeID: key.store.nr,
                                  storeName: key.store.name,
                                  country: key.store.country,
                                  consolidation: key.consolidation
                                });
                              })
                              .catch(() => {
                                // Cleaning local data after finalizing uploads accounts request failed...
                                setAlertProperties({
                                  ...alertProperties,
                                  notification:
                                    "Failed to update IDB-Keyvals...",
                                });
                                setIsAlertOpen(true);
                              });
                          }
                        })
                        .withFailureHandler((error: Error | string) => {
                          if (isMounted()) {
                            setAlertProperties({
                              ...alertProperties,
                              notification: typeof error === "object" ? error.message : error,
                            });
                            setIsAlertOpen(true);
                          }
                        })
                        .finalizingUploadAccountsRequest(
                          JSON.stringify(key.accounts),
                          key.store,
                          key.consolidation
                        );

                      setTextInfo("Weryfikacja danych...");
                    } else {
                      setLocalAccounts(key.accounts);
                      setInitData({
                        ...response,
                        storeID: key.store.nr,
                        storeName: key.store.name,
                        country: key.store.country,
                        consolidation: key.consolidation ? key.consolidation : response.consolidation
                      });
                    }
                  } else {
                    // first launch of the application...
                    set(response.userID, {
                      accounts: [],
                      store: {
                        nr: response.storeID,
                        name: response.storeName,
                        country: response.country,
                      },
                      needToVerifyData: false,
                      consolidation: response.consolidation,
                    })
                      .then(() => {
                        setInitData({
                          ...response,
                        });
                        setLocalAccounts([]);
                        setIsSettingsDialogModalOpen(true);
                        // setisConsolidationModalOpen(true);
                        // setisUnitAssignmentModalOpen(true);
                      })
                      .catch(() => {
                        setAlertProperties({
                          ...alertProperties,
                          notification: "Failed to store IDB-Keyvals...",
                        });
                        setIsAlertOpen(true);
                      });
                  }
                })
                .catch(() => {
                  setAlertProperties({
                    ...alertProperties,
                    notification: "Failed to read IDB-Keyvals...",
                  });
                  setIsAlertOpen(true);
                });
            }
          }
        })
        .withFailureHandler((error: Error | string) => {
          if (isMounted()) {
            setAlertProperties({
              ...alertProperties,
              notification: typeof error === "object" ? error.message : error,
            });
            setIsAlertOpen(true);
          }
        })
        .init();

      setTextInfo("Inicjalizuję aplikację...");
    }
  }, []);

  // const [isRestartingApp, setIsRestartingApp] = useState(false);

  function reLoad() {
    google.script.run
      .withSuccessHandler(function (url) {
        window.open(url, "_top");
      })
      .getScriptURL();
  }

  function closeAlert() {
    setIsAlertOpen(false);
    setTimeout(() => {
      reLoad();
    }, 0);
  }

  return (
    <>
      <Alert
        openModal={isAlertOpen}
        closeModal={closeAlert}
        {...alertProperties}
      />
      {!isOriginal && <MultiTabsBrowserScreen />}
      {isOriginal && !initData && (
        <SplashScreen version={version} build={build} text={textInfo} />
      )}
      {isOriginal && initData && (
        <InitDataProvider initData={initData} setInitData={setInitData}>
          <AccountsProviders
            localAccounts={localAccounts}
            setLocalAccounts={setLocalAccounts}
            remoteAccounts={remoteAccounts}
            setRemoteAccounts={setRemoteAccounts}
          >
            <StatsDataProviders
              unitStatsData={unitStatsData}
              setUnitStatsData={setUnitStatsData}
              storesStatsData={storesStatsData}
              setStoresStatsData={setStoresStatsData}
              perPersonStatsData={perPersonStatsData}
              setPerPersonStatsData={setPerPersonStatsData}
            >
              <SettingsDialogModalProvider
                isSettingsDialogModalOpen={isSettingsDialogModalOpen}
                setIsSettingsDialogModalOpen={setIsSettingsDialogModalOpen}
              >
                <MainPage />
                <SettingsDialogModal
                  key={isSettingsDialogModalOpen ? "open" : "close"}
                />
              </SettingsDialogModalProvider>
            </StatsDataProviders>
          </AccountsProviders>
        </InitDataProvider>
      )}
    </>
  );
}

export default App;
