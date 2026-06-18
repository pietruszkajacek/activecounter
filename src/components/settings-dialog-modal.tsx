import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import Spinner from "./spinner";
import { useRef, useState } from "react";
import { SettingsDialogModalContext } from "./settings-dialog-modal-provider";
import useContextAndErrorIfNull from "../hooks/useContextAndErrorIfNull";
import { update } from "idb-keyval";
import { InitDataContext } from "./init-data-provider";
import { RemoteContext } from "./accounts-providers";
import useMountedState from "../hooks/useMountedState";
import { StoresListbox } from "../stores-listbox";
import { UnitStatsData } from "@/interfaces/stats-data";
import { RemoteAccountsData } from "@/interfaces/remote-accounts-data";
import { UnitStatsDataContext } from "../components/stats-data-providers ";
import { prepareUnitStatsData } from "../lib/helpers";
import { useBeforeunload } from "react-beforeunload";
import { DataKeyIDB } from "@/interfaces/datakey-idb";
import { Hash32Stamp } from "../lib/Hash32Stamp";

export default function SettingsDialogModal() {
  const { isOpen, setIsOpen } =
    useContextAndErrorIfNull(SettingsDialogModalContext);
  const { initData, setInitData } = useContextAndErrorIfNull(InitDataContext);
  const { accounts: remoteAccounts, setAccounts: setRemoteAccounts } =
    useContextAndErrorIfNull(RemoteContext);
  const { statsData: unitStatsData, setStatsData: setUnitStatsData } =
    useContextAndErrorIfNull(UnitStatsDataContext);
  
  const [selectedStore, setSelectedStore] = useState(() =>
    initData.stores[initData.stores.findIndex((store) => {
      return store.nr === initData.storeID;
    })]
  );

  const isMounted = useMountedState();

  const [fetchingData, setFetchingData] = useState<boolean>(false);
  const [requestDataFailed, setRequestDataFailed] = useState<
    boolean | undefined
  >(undefined);

  const refreshClicked = useRef(false);

  useBeforeunload(
    fetchingData
      ? (event) => {
        event.preventDefault();
        refreshClicked.current = true;
      }
      : undefined
  );

  function saveSettingsDialogModal(): void {
    if (!fetchingData) {
      if (initData.storeID !== selectedStore.nr) {
        setFetchingData(true);
        google.script.run
          .withSuccessHandler(
            (response: {
              userData: RemoteAccountsData;
              unitData: UnitStatsData;
            }) => {
              if (isMounted()) {
                update<DataKeyIDB>(initData.userID, (oldKeyVal) => {
                  if (oldKeyVal) {
                    return {
                      ...oldKeyVal,
                      store: selectedStore,
                    };
                  } else {
                    throw new Error();
                  }
                })
                  .then(() => {
                    setRequestDataFailed(false);
                    setFetchingData(false);

                    setInitData({
                      ...initData,
                      country: selectedStore.country,
                      storeID: selectedStore.nr,
                      storeName: selectedStore.name,
                    });
                    setRemoteAccounts({
                      ...remoteAccounts,
                      ...response.userData,
                    });
                    setUnitStatsData({
                      ...unitStatsData,
                      ...prepareUnitStatsData(response.unitData),
                      stamp: Hash32Stamp(JSON.stringify(response.unitData)),
                    });

                    closeSettingsDialogModal();
                  })
                  .catch(() => {
                    // Change of store assignment failed...
                    setFetchingData(false);
                    setRequestDataFailed(true);
                  });
              }
            }
          )
          .withFailureHandler((error: Error | string) => {
            if (isMounted()) {
              switch (typeof error) {
                case "string":
                  if (refreshClicked.current) {
                    // refresh page;
                  } else {
                    // offline / 401
                    setFetchingData(false);
                    setRequestDataFailed(true);
                  }
                  break;

                case "object":
                  if (error.name === "ScriptError") {
                    // script error
                    setFetchingData(false);
                    setRequestDataFailed(true);
                  }
                  break;

                default:
                  // other error type
                  break;
              }
            }
          })
          .getIndividualUnitStatsData(selectedStore);
      } else {
        closeSettingsDialogModal();
      }
    }
  }

  function closeSettingsDialogModal() {
    if (!fetchingData) {
      setIsOpen(false);
    }
  }

  return (
    <Dialog
      open={isOpen}
      as="div"
      className="fixed inset-0 flex w-screen items-center justify-center bg-black/30 p-4 transition duration-300 ease-out data-[closed]:opacity-0 z-10"
      onClose={closeSettingsDialogModal}
      transition
    >
      <div className="touch-none fixed inset-0 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4 text-center">
          <DialogPanel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
            <DialogTitle
              as="h3"
              className="text-lg font-medium leading-6 text-gray-900 mb-2"
            >
              Ustawienia...
            </DialogTitle>
            <StoresListbox
              stores={initData.stores}
              selectedStore={selectedStore}
              setSelectedStore={setSelectedStore}
              disabled={fetchingData ? true : false}
            />
            <div className="mt-2">
              <p className="text-sm text-gray-500">
                {!fetchingData &&
                  requestDataFailed === undefined &&
                  "Wybierz jednostkę, do której będziesz przypisana(y)..."}
                {!fetchingData &&
                  requestDataFailed === false &&
                  "Zostałeś przypisany do wybranej jednostki."}
                {!fetchingData &&
                  requestDataFailed  &&
                  "Coś poszło nie tak, spróbuj później..."}
                {fetchingData && "Pobieram dane jednostki..."}
              </p>
            </div>
            <div className="mt-4">
              {!fetchingData && requestDataFailed === undefined && (
                <>
                  <button
                    type="button"
                    className="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                    onClick={saveSettingsDialogModal}
                  >
                    Zapisz
                  </button>
                  <button
                    type="button"
                    className="ml-2 inline-flex justify-center rounded-md border border-transparent bg-red-100 px-4 py-2 text-sm font-medium text-red-900 hover:bg-red-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
                    onClick={closeSettingsDialogModal}
                  >
                    Anuluj
                  </button>
                </>
              )}
              {!fetchingData && requestDataFailed && (
                <button
                  type="button"
                  className="inline-flex justify-center rounded-md border border-transparent bg-red-100 px-4 py-2 text-sm font-medium text-red-900 hover:bg-red-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
                  onClick={closeSettingsDialogModal}
                >
                  Zamknij
                </button>
              )}
              {fetchingData && (
                <div className="text-center">
                  <Spinner sronly="Sending data to server..." />
                </div>
              )}
            </div>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
}
