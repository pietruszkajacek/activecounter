import type { StoreIdb } from "@/interfaces/store-idb";
import type { AccountCreated } from "@/interfaces/account-created";
import { Consolidation } from "./consolidation";

type DataKeyIDB = {
  accounts: AccountCreated[];
  store: StoreIdb;
  needToVerifyData: boolean;
  consolidation: Consolidation | null;
};

export type { DataKeyIDB };