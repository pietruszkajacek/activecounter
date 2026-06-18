import { Consolidation } from "./consolidation";
import { StoreIdb } from "./store-idb";

type InitData = {
  userID: string;
  userLogin: string;
  email: string;
  pic: string;
  firstName: string;
  lastName: string;
  storeID: string;
  storeName: string;
  country: string;
  consolidation: Consolidation | null;
  stores: StoreIdb[];
  consolidations: Consolidation[];
};

export type { InitData };