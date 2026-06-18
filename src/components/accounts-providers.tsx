import { AccountCreated } from "@/interfaces/account-created";
import { RemoteAccountsData } from "@/interfaces/remote-accounts-data";
import React, { createContext } from "react";
import type { AccountsSetter } from "@/interfaces/accounts-setter";

type contextAccountsDataType<Type> = {
  accounts: Type;
  setAccounts: AccountsSetter<Type>;
};

export const RemoteContext =
  createContext<contextAccountsDataType<RemoteAccountsData | undefined> | null>(null);

export const LocalContext = createContext<contextAccountsDataType<
  AccountCreated[]
> | null>(null);

type Props = {
  children: React.ReactNode;
  localAccounts: AccountCreated[];
  setLocalAccounts: AccountsSetter<AccountCreated[]>;
  remoteAccounts: RemoteAccountsData | undefined;
  setRemoteAccounts: AccountsSetter<RemoteAccountsData | undefined>;
};

function AccountsProviders({
  children,
  localAccounts,
  setLocalAccounts,
  remoteAccounts,
  setRemoteAccounts,
}: Props) {
  return (
    <RemoteContext.Provider
      value={{ accounts: remoteAccounts, setAccounts: setRemoteAccounts }}
    >
      <LocalContext.Provider
        value={{ accounts: localAccounts, setAccounts: setLocalAccounts }}
      >
        {children}
      </LocalContext.Provider>
    </RemoteContext.Provider>
  );
}

export default AccountsProviders;
