import {
  UserPlusIcon,
  UserMinusIcon,
  CloudArrowUpIcon,
} from "@heroicons/react/24/solid";
import BtnSendAccounts from "./components/btn-send-accounts";
import BtnIncDecAccounts from "./components/btn-inc-dec-accounts";
import UserStats from "./components/user-stats";
import { useState } from "react";
import ModalDialog from "./components/modal-dialog";
import useContextAndErrorIfNull from "./hooks/useContextAndErrorIfNull";
import { LocalContext, RemoteContext} from "./components/accounts-providers";

import { update } from "idb-keyval";
import { InitDataContext } from "./components/init-data-provider";
import { DataKeyIDB } from "@/interfaces/datakey-idb";
import { AccountCreated } from "@/interfaces/account-created";

type Props = {
  handleBtnSendLocalAccounts: () => void;
};

function CounterTab({ handleBtnSendLocalAccounts }: Props) {
  const { accounts: localAccounts, setAccounts: setLocalAccounts } =
    useContextAndErrorIfNull(LocalContext);

  const { accounts: remoteAccounts } = useContextAndErrorIfNull(RemoteContext);

  const { initData } = useContextAndErrorIfNull(InitDataContext);

  const [isOpenDModal, setIsOpenDModal] = useState(false);

  function handleBtnIncAccount() {
    if (localAccounts.length < 15) {
      let accountsTemp: AccountCreated[];

      update<DataKeyIDB>(initData.userID, (oldKeyVal) => {
        if (oldKeyVal) {
          accountsTemp = [...oldKeyVal.accounts, { time: new Date().toJSON() }];
          return {
            ...oldKeyVal,
            accounts: accountsTemp,
          };
        } else {
          throw new Error();
        }
      })
        .then(() => {
          setLocalAccounts(accountsTemp);
        })
        .catch(() => {
          // Increment accounts failed...
          // TODO:
        });
    } else {
      setIsOpenDModal(true);
    }
  }

  function handleBtnDecAccount() {
    if (localAccounts) {
      let accountsTemp: AccountCreated[];

      update<DataKeyIDB>(initData.userID, (oldKeyVal) => {
        if (oldKeyVal) {
          accountsTemp = oldKeyVal.accounts.slice(0, -1);
          return {
            ...oldKeyVal,
            accounts: accountsTemp,
          };
        } else {
          throw new Error();
        }
      })
        .then(() => {
          setLocalAccounts(accountsTemp);
        })
        .catch(() => {
          // Decrement accounts failed...
          // TODO:
        });
    }
  }

  return (
    <>
      <ModalDialog
        closeModal={setIsOpenDModal}
        openModal={isOpenDModal}
        notificationType="Info"
        title="Osiągnięto limit kont niewysłanych na serwer."
        notification="...aby kontynuować wyślij dane na serwer."
        textButton="Zamknij"
      />
      <UserStats
        remoteAccounts={remoteAccounts}
        localAccounts={localAccounts}
      />
      <div className="flex mt-auto min-h-20">
        <div className="w-1/2 p-4">
          <BtnSendAccounts
            disabled={localAccounts !== undefined && localAccounts.length === 0}
            onClick={handleBtnSendLocalAccounts}
          >
            <CloudArrowUpIcon className="h-1/2 text-white" />
          </BtnSendAccounts>
        </div>
        <div className="w-1/4 p-4">
          <BtnIncDecAccounts onClick={handleBtnDecAccount}>
            <UserMinusIcon className="h-1/2 text-white" />
          </BtnIncDecAccounts>
        </div>
        <div className="w-1/4 p-4">
          <BtnIncDecAccounts onClick={handleBtnIncAccount}>
            <UserPlusIcon className="h-1/2 text-white" />
          </BtnIncDecAccounts>
        </div>
      </div>
    </>
  );
}

export default CounterTab;
