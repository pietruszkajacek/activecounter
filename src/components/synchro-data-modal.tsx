import { Button, Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import Spinner from "./spinner";
import GroupsRadioBtn from "./groups-radio-btn";
import { useState } from "react";
import useContextAndErrorIfNull from "../hooks/useContextAndErrorIfNull";
import { InitDataContext } from "./init-data-provider";
import { Consolidation } from "@/interfaces/consolidation";
import { update } from "idb-keyval";
import { DataKeyIDB } from "@/interfaces/datakey-idb";

type Props = {
  openModal: boolean;
  sendingData: boolean;
  sendDataOK: boolean | null;
  closeModal: () => void;
  handleBtnSend: () => void;
};

export default function SynchroDataModal({
  openModal,
  closeModal,
  sendingData,
  handleBtnSend,
  sendDataOK,
}: Props) {
  const { initData, setInitData } = useContextAndErrorIfNull(InitDataContext);
  
  const [selectedConsolidation, setSelectedConsolidation] =
    useState<Consolidation | null>(() => {
      const index = initData.consolidations.findIndex((consolidation) => {
        return consolidation.id === initData.consolidation?.id;
      });

      return index === -1 ? null : initData.consolidations[index];
    });

  function changeRadioBtn(selCons: Consolidation ) {
    update<DataKeyIDB>(initData.userID, (oldKeyVal) => {
      if (oldKeyVal) {
        return {
          ...oldKeyVal,
          consolidation: selCons,
        };
      } else {
        throw new Error();
      }
    })
      .then(() => {
        setSelectedConsolidation(selCons);
        setInitData({
          ...initData,
          consolidation: selCons
        });
      })
      .catch(() => {
        console.log('Consolidadions changed failed...');
      });
  }

  return (
    <Dialog
      open={openModal}
      as="div"
      className="fixed inset-0 flex w-screen items-center justify-center bg-black/30 p-4 transition duration-300 ease-out data-[closed]:opacity-0 z-10"
      onClose={closeModal}
      transition
    >
      <div className="touch-none fixed inset-0 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4 text-center">
          <DialogPanel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
            <DialogTitle
              as="h3"
              className="text-lg font-medium leading-6 text-gray-900"
            >
              Synchronizuj dane...
            </DialogTitle>
            <GroupsRadioBtn
              disabled={sendingData || sendDataOK !== null}
              selected={selectedConsolidation}
              setSelected={changeRadioBtn}
              consolidations={initData.consolidations}
            />
            <div className="mt-2">
              <p className="text-sm text-gray-500">
                {!sendingData &&
                  sendDataOK === null &&
                  "...czy na pewno chcesz wysłać dane na serwer?"}
                {sendingData && "Wysyłam dane..."}
                {!sendingData &&
                  sendDataOK &&
                  "Dane zostały pomyślnie zapisane."}
                {!sendingData &&
                  sendDataOK === false &&
                  "Coś poszło nie tak, spróbuj później..."}
              </p>
            </div>
            <div className="mt-4">
              {!sendingData && sendDataOK === null && (
                <>
                  <Button
                    disabled={initData.consolidation === null}
                    type="button"
                    className="data-[disabled]:bg-gray-100 data-[disabled]:text-gray-300 inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                    onClick={handleBtnSend}
                  >
                    Wyślij
                  </Button>
                  <button
                    type="button"
                    className="ml-2 inline-flex justify-center rounded-md border border-transparent bg-red-100 px-4 py-2 text-sm font-medium text-red-900 hover:bg-red-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
                    onClick={closeModal}
                  >
                    Anuluj
                  </button>
                </>
              )}
              {sendingData && (
                <div className="text-center">
                  <Spinner sronly="Sending data to server..." />
                </div>
              )}
              {!sendingData && sendDataOK && (
                <button
                  type="button"
                  className="inline-flex justify-center rounded-md border border-transparent bg-green-100 px-4 py-2 text-sm font-medium text-green-900 hover:bg-green-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2"
                  onClick={closeModal}
                >
                  Mamy to!
                </button>
              )}
              {!sendingData && sendDataOK === false && (
                <button
                  type="button"
                  className="inline-flex justify-center rounded-md border border-transparent bg-red-100 px-4 py-2 text-sm font-medium text-red-900 hover:bg-red-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
                  onClick={closeModal}
                >
                  Zamknij...
                </button>
              )}
            </div>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
}
