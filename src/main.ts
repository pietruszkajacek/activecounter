import { Consolidation } from "@/interfaces/consolidation";
import {
  stores,
  monthNames,
  monthlySummarySheetName,
  rootDir,
  templateDatabaseFile,
  consolidations,
  monthlySummaryGroupsSheetName,
  APP_CONFIG
} from "../consts/constants";

import type { InitData } from "@/interfaces/init-data";
import type { RemoteAccountsData } from "@/interfaces/remote-accounts-data";
import type {
  AccountsStatsData,
  GroupsID,
  GroupsStatsData,
  PerPersonCachedStatsDataAndTime,
  StoresCachedStatsDataAndTime,
  StoresStatsDataItem,
  UnitStatsData,
} from "@/interfaces/stats-data";
import type { StoreIdb } from "@/interfaces/store-idb";

const currentDate = new Date();
const currentMonth = currentDate.getMonth();
const currentYear = currentDate.getFullYear();

function getActiveUserEmail() : string {
  const email = Session.getActiveUser().getEmail();

  if (APP_CONFIG.demoMode) {
    return (email !== "") ? email : APP_CONFIG.demoEmail;
  } else {
    return email;
  }  
}

function getScriptURL() {
  return ScriptApp.getService().getUrl();
}

function doGet() {
  const htmlService = HtmlService.createTemplateFromFile("index")
    .evaluate()
    .addMetaTag("viewport", "width=device-width, initial-scale=1")
    .setTitle("Active counter-+");

  return htmlService;
}

function validatePrepareDataItems(userEmail: string, reqData: {time: string}[], maxItemsDateReq: number = 15) {
  //const maxItemsDateReq = 15;
  // Validate date items
  const data: Array<[string, Date]> = reqData
    .slice(0, maxItemsDateReq)
    .map((item: { time: string }) => {
      const validDate = new Date(item.time);
      if (validDate.toString() === "Invalid Date")
        throw new Error("Nieprawidłowy format daty...");

      return [userEmail, validDate];
    });

  return data;
}

function prepareDataItemsYearMonth(data: [string, Date][]) {
  const tab: Array<Array<[string, Date]>> = [];
  
  let year: number | null = null;
  let month: number | null = null;
  let iitab: number | null = null;

  for (let i = 0; i < data.length; i++) {
    if (iitab === null || data[i][1].getFullYear() !== year || data[i][1].getMonth() !== month) {
      tab.push([]);
      iitab === null ? iitab = 0 : ++iitab;
      year = data[i][1].getFullYear();
      month = data[i][1].getMonth();
    }
    tab[iitab].push(data[i]);
  }

  return tab;
}

function saveAccountsWithDuplicateChecking(
  req: string,
  store: StoreIdb,
  consolidation: Consolidation | null,
  signature: string = ""
) {
  const userEmail = getActiveUserEmail(); // Session.getActiveUser().getEmail();

  const tab = prepareDataItemsYearMonth(
    validatePrepareDataItems(userEmail, JSON.parse(req))
  );

  let year: number | null = null;
  let ss: GoogleAppsScript.Spreadsheet.Spreadsheet | null = null;
  let ms: GoogleAppsScript.Spreadsheet.Sheet | null = null;
  
  for (let i = 0; i < tab.length; i++) {
    if (ss === null || year !== tab[i][0][1].getFullYear()) {
      year = tab[i][0][1].getFullYear();

      const database  = getUnitDatabase(rootDir, store, tab[i][0][1].getMonth(), year);

      ss = database.ss;
      ms = database.cms;
      const sums = database.sums;

      if (getNumOfUserAccountsYear(userEmail, sums) === null) {
        addUserToDatabaseFile(userEmail, sums);
      }
      
    } else {
      ms = ss.getSheetByName(monthNames[tab[i][0][1].getMonth()]);
      if (ms === null) throw new Error("Nie znaleziono skoroszytu...");
      // TODO: if sheet don't exist then create them...
    }

    const sizeBuffData = 100;
    const lock = LockService.getScriptLock();
    // Waits for up to 30 seconds for other processes to finish.
    lock.waitLock(30000);
    const lastRow = ms.getLastRow();
    let end = lastRow;

    // Check for duplicate accounts
    while (end >= 2) {
      const start = end - sizeBuffData >= 2 ? end - sizeBuffData + 1 : 2;
      const data = ms
        .getRange(
          start,
          1,
          start + sizeBuffData - 1 <= end ? sizeBuffData : end - 1,
          2
        )
        .getDisplayValues() as [string, string][];

      tab[i] = tab[i].filter((item) => {
        let result = true;
        for (const idata of data) {
          if (
            idata[0] === item[0] &&
            new Date(idata[1]).toISOString() === item[1].toISOString()
          ) {
            result = false;
            break;
          }
        }
        return result;
      });

      if (end - sizeBuffData < 2) break;
      else end = end - sizeBuffData;
    }

    if (tab[i].length > 0) {
      const exTab = tab[i].map((item: [string, Date]) => {
        return [
          item[0],
          item[1],
          signature !== ""
            ? `${signature} ${new Date().toISOString()}`
            : new Date(),
          consolidation?.id
        ];
      });
      ms.getRange(lastRow + 1, 1, exTab.length, exTab[0].length).setValues(
        exTab
      );
      SpreadsheetApp.flush();
    }
    // Releases the lock so that other processes can continue.
    lock.releaseLock();
  }
}

function finalizingUploadAccountsRequest(req: string, store: StoreIdb, consolidation: Consolidation | null) {
  saveAccountsWithDuplicateChecking(req, store, consolidation, "###");
}

function saveLocalAccounts(req: string, store: StoreIdb, consolidation: Consolidation) {
  saveAccountsWithDuplicateChecking(req, store, consolidation);
  
  // return getIndividualStatsData(Session.getActiveUser().getEmail(), currentMonth, currentYear, store);
  return getIndividualStatsData(getActiveUserEmail(), currentMonth, currentYear, store);
}

function init(): InitData {
  const userEmail = getActiveUserEmail();  // Session.getActiveUser().getEmail();

  let activeUserData: InitData = {
    userID: 'demo',
    userLogin: 'demo',
    email: userEmail,
    pic: APP_CONFIG.defaultAvatarUrl,
    firstName: '',
    lastName: '',
    storeID: '',
    storeName: '',
    country: 'PL',
    consolidation: null,
    stores: [...stores],
    consolidations: consolidations
  };

  if (!APP_CONFIG.demoMode) {
    activeUserData = { ...activeUserData, ...getActiveUserData(userEmail) };
  } else {
    (userEmail !== APP_CONFIG.demoEmail)
      ? activeUserData = {
        ...activeUserData,
        pic: APP_CONFIG.creatorProfileImageUrl,
        firstName: 'Jacek',
        lastName: 'Pietruszka',
        storeID: '0000',
        storeName: 'Matrix'
      }
      : activeUserData = {
        ...activeUserData,
        firstName: 'User',
        lastName: 'Demo',
        storeID: stores[0].nr,
        storeName: stores[0].name
      }
  }

  const requiredFields = [
    "userID",
    "userLogin",
    "storeID",
    "storeName",
    "firstName",
    "lastName",
    "country",
  ] as const;

  const missingField = requiredFields.find(
    field => activeUserData[field] === ""
  );

  if (missingField) {
    throw new Error(
      "Nie udało się pobrać danych z katalogu domeny uwierzytelnionego użytkownika." +
        `Brak wymaganej wartości: ${missingField}`
    );
  }

  if (!stores.some((store) => store.nr === activeUserData.storeID)) {
    activeUserData.stores.push({
      country: activeUserData.country,
      nr: activeUserData.storeID,
      name: activeUserData.storeName,
    });
  }

  return activeUserData;
}

function addUserToDatabaseFile(
  userEmail: string,
  sums: GoogleAppsScript.Spreadsheet.Sheet
) {
  const formNumOfUserAccountsMonth = `=ifna((QUERY(INDIRECT(index($D$1:$O$1;1;COLUMN()-3)&"!G:H");"select H where G = '"&index($B:$B;row();1)&"'";0));0)`;
  const formSumUserAccounts = `=SUM(indirect("$O"&Row()&":$D"&Row()))`;
  
  // Add new user email
  sums.appendRow([
    "",
    userEmail,
    formSumUserAccounts,
    formNumOfUserAccountsMonth,
    formNumOfUserAccountsMonth,
    formNumOfUserAccountsMonth,
    formNumOfUserAccountsMonth,
    formNumOfUserAccountsMonth,
    formNumOfUserAccountsMonth,
    formNumOfUserAccountsMonth,
    formNumOfUserAccountsMonth,
    formNumOfUserAccountsMonth,
    formNumOfUserAccountsMonth,
    formNumOfUserAccountsMonth,
    formNumOfUserAccountsMonth,
  ]);
}

type DBFileIDInfo = {
  id: string | null;
  genNewFile: boolean;
};

function getDatabaseFileID2(
  rootDir: string,
  store: StoreIdb,
  year: number
): DBFileIDInfo {
  const result: DBFileIDInfo = {
    id: null,
    genNewFile: false,
  };

  if (store.nr === "" || store.country !== "PL") return result;

  let folderList = DriveApp.getFoldersByName(rootDir);
  if (folderList.hasNext()) {
    const rootDACFolder = folderList.next(); // root dir

    // Gets a script lock before modifying a shared resource.
    const lock = LockService.getScriptLock();
    // Waits for up to 30 seconds for other processes to finish.
    lock.waitLock(30000);

    folderList = rootDACFolder.getFoldersByName(year.toString());
    if (folderList.hasNext()) {
      const yearFolder = folderList.next(); // Year folder
      const fileList = yearFolder.getFilesByName(`${store.nr} / ${year}`);
      if (fileList.hasNext()) {
        result.id = fileList.next().getId();
      } else {
        const fileList = yearFolder.getFilesByName(
          `${store.nr}`
        );
        if (fileList.hasNext()) {
          result.id = fileList.next().getId();
        } else {
          // copy template database files from file template
          const fileList = rootDACFolder.getFilesByName(templateDatabaseFile);
          result.id = fileList.next().makeCopy(`${store.nr} / ${year}`, yearFolder).getId();
          result.genNewFile = true;
        }
      }
    } else {
      // create current year folder and copy database file if it doesn't exist
      const createdYearFolder = rootDACFolder.createFolder(year.toString());
      const fileList = rootDACFolder.getFilesByName(templateDatabaseFile);
      result.id = fileList.next().makeCopy(`${store.nr} / ${year}`, createdYearFolder).getId();
      result.genNewFile = true;
    }

    // Releases the lock so that other processes can continue.
    lock.releaseLock();
  } else {
    // create root folder, current year folder and copy database file if it doesn't exist
    // const rootDACFolder = DriveApp.createFolder(rootDir);
    // const yearFolder = rootDACFolder.createFolder(currentYear.toString());
    // const fileList = rootDACFolder.getFilesByName(templateDatabaseFile);
    // result = fileList.next().makeCopy(yearFolder).setName(activeUserData.storeID).getId();
  }

  return result;
}

function getUnitDatabase(rootDir: string,
  store: StoreIdb,
  month: number,
  year: number
): {
    ss: GoogleAppsScript.Spreadsheet.Spreadsheet;
    cms: GoogleAppsScript.Spreadsheet.Sheet;
    sums: GoogleAppsScript.Spreadsheet.Sheet;
    gsums: GoogleAppsScript.Spreadsheet.Sheet;
  } {
  
  const dbFileInfo = getDatabaseFileID2(rootDir, store, year);
  
  if (dbFileInfo.id === null) throw new Error("Nie znaleziono pliku bazy...");

  const ss = SpreadsheetApp.openById(dbFileInfo.id);

  const cms = ss.getSheetByName(monthNames[month]);
  if (cms === null) throw new Error("Nie znaleziono skoroszytu...");

  const sums = ss.getSheetByName(monthlySummarySheetName);
  if (sums === null) throw new Error("Nie znaleziono skoroszytu...");

  const gsums = ss.getSheetByName(monthlySummaryGroupsSheetName);
  if (gsums === null) throw new Error("Nie znaleziono skoroszytu...");

  // Add store name
  if (dbFileInfo.genNewFile) {
    sums.getRange(2, 1).setValue(store.name.toLocaleUpperCase());
  }
  return { ss, cms, sums, gsums };
}

function getIndividualStatsData(email: string, month: number, year: number, store: StoreIdb) : RemoteAccountsData {
  const activeUserData = getActiveUserData(email);
  const { cms, sums } = getUnitDatabase(rootDir, store, month, year);

  // const NumOfUserAccountsYear = getNumOfUserAccountsYear(email, sums);

  const numOfUserAccountsMonthsYear = getNumOfUserAccountsMonthsYear(email, sums);

  if (numOfUserAccountsMonthsYear === null) {
    if (store.nr === activeUserData.storeID) {
      addUserToDatabaseFile(email, sums);
    }
    return {
      day: 0,
      month: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      year: 0,
    };
  }

  return {
    day: getNumOfUserAccountsByMonth(email, cms, sums),
    month: numOfUserAccountsMonthsYear.slice(1),
    year: numOfUserAccountsMonthsYear[0]
  };
}

// function validateStores(store: StoreIdb) {

// }

function getUserStatsData(store: StoreIdb): RemoteAccountsData {
  return getIndividualTabStatsData(store);
}

function getIndividualTabStatsData(store: StoreIdb): RemoteAccountsData {
  // TODO: validate store data
  return getIndividualStatsData(
    getActiveUserEmail(), // Session.getActiveUser().getEmail(),
    currentMonth,
    currentYear,
    store
  );
}

function getUserUnitStatsData(store: StoreIdb) {
  return getIndividualUnitStatsData(store);
}

function getIndividualUnitStatsData(store: StoreIdb) {
  const email = getActiveUserEmail(); // Session.getActiveUser().getEmail();
  const { cms, sums, gsums } = getUnitDatabase(
    rootDir,
    store,
    currentMonth,
    currentYear
  );

  const numOfUserAccountsMonthsYear = getNumOfUserAccountsMonthsYear(email, sums);
  //const numOfUserAccountsYear = getNumOfUserAccountsYear(email, sums);

  return {
    userData: {
      month:
        numOfUserAccountsMonthsYear === null
          ? [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
          : numOfUserAccountsMonthsYear.slice(1),
      day:
        numOfUserAccountsMonthsYear === null
          ? 0
          : getNumOfUserAccountsByMonth(email, cms, sums),
      year:
        numOfUserAccountsMonthsYear === null
          ? 0
          : numOfUserAccountsMonthsYear[0],
    },
    unitData: {
      accounts: getUnitStatsData(cms, sums),
      groups: getUnitStatsGroupsData(cms, sums, gsums),
    },
  };
}

function getNumOfUserAccountsYear(email: string, sums: GoogleAppsScript.Spreadsheet.Sheet): number | null {
  if (sums.getLastRow() === 2) return null;

  const values: Array<[string, number]> = sums
    .getRange(3, 2, sums.getLastRow() - 2, 2)
    .getValues() as Array<[string, number]>;

  for (const row of values) {
    if (row[0] === email) {
      return row[1];
    }
  }

  return null;
}

function makeStoresStatsData() {
  const oldCachedStatsData: StoresCachedStatsDataAndTime = {
    todayStatData: [],
    monthStatData: [],
    yearStatData: [],
  };

  const newCachedStatsData: StoresCachedStatsDataAndTime = {
    todayStatData: [],
    monthStatData: [],
    yearStatData: [],
  };

  const cachedStatsData: StoresCachedStatsDataAndTime = {
    todayStatData: [],
    monthStatData: [],
    yearStatData: [],
  };

  const currentDate = new Date();

  let folderList = DriveApp.getFoldersByName(rootDir);
  if (folderList.hasNext()) {
    const rootDACFolder = folderList.next(); // ActiveCounter dir
    folderList = rootDACFolder.getFoldersByName(currentYear.toString());
    if (folderList.hasNext()) {
      const yearFolder = folderList.next(); // Year folder
      const fileList = yearFolder.getFiles();

      while (fileList.hasNext()) {
        const file = fileList.next();
        const lastUpdatedSheet = file.getLastUpdated() as Date;

        if (
          // currentDate.getMonth() === lastUpdatedSheet.getMonth() &&
          // currentDate.getDate() === lastUpdatedSheet.getDate() &&
          // currentDate.getFullYear() === lastUpdatedSheet.getFullYear() &&
          currentDate.getTime() - 1000 * 60 * 5 <=
          lastUpdatedSheet.getTime()
        ) {
          const ss = SpreadsheetApp.openById(file.getId());

          const cms = ss.getSheetByName(monthNames[currentDate.getMonth()]);
          if (cms === null) throw new Error("Nie znaleziono skoroszytu...");

          const sums = ss.getSheetByName(monthlySummarySheetName);
          if (sums === null) throw new Error("Nie znaleziono skoroszytu...");

          const gsums = ss.getSheetByName(monthlySummaryGroupsSheetName);
          if (gsums === null) throw new Error("Nie znaleziono skoroszytu...");

          const sumData = sums.getRange(2, 1, 1, 15).getValues()[0] as [
            string,
            ...number[]
          ];

          const groupsData: {
            todayStatData: [GroupsID, number][];
            monthStatData: [GroupsID, number][];
            yearStatData: [GroupsID, number][];
          } = {
            todayStatData: [],
            monthStatData: [],
            yearStatData: [],
          };

          groupsData.yearStatData = (
            gsums.getRange(3, 2, gsums.getLastRow() - 2, 2).getValues() as [
              string,
              number
            ][]
          ).filter((item) => item[0] !== "" && item[1] > 0) as [
            GroupsID,
            number
          ][];

          groupsData.monthStatData = (
            cms.getRange(2, 19, gsums.getLastRow() - 2, 2).getValues() as [
              string,
              number
            ][]
          ).filter((item) => item[0] !== "" && item[1] > 0) as [
            GroupsID,
            number
          ][];

          groupsData.todayStatData = (
            cms.getRange(2, 22, gsums.getLastRow() - 2, 2).getValues() as [
              string,
              number
            ][]
          ).filter((item) => item[0] !== "" && item[1] > 0) as [
            GroupsID,
            number
          ][];

          const storeID = ss.getName().split(" / ")[0];
          const storeDataKey = `${sumData[0]} (${storeID})`;

          if (sumData[1] !== 0)
            newCachedStatsData.todayStatData.push([
              storeDataKey,
              sumData[1],
              JSON.stringify(groupsData.todayStatData),
              lastUpdatedSheet,
            ]);

          if (sumData[currentMonth + 3] !== 0)
            newCachedStatsData.monthStatData.push([
              storeDataKey,
              sumData[currentMonth + 3] as number,
              JSON.stringify(groupsData.monthStatData),
              lastUpdatedSheet,
            ]);

          if (sumData[2] !== 0)
            newCachedStatsData.yearStatData.push([
              storeDataKey,
              sumData[2],
              JSON.stringify(groupsData.yearStatData),
              lastUpdatedSheet,
            ]);
        }
      }
    }
  }

  const sds = SpreadsheetApp.getActive().getSheetByName("Stores stats data2");
  if (sds === null) throw new Error("Nie znaleziono skoroszytu...");

  const lastRow = sds.getLastRow();
  const lastColumn = sds.getLastColumn();

  if (lastRow > 0) {
    oldCachedStatsData.todayStatData = (
      sds.getRange(1, 1, lastRow, 4).getValues() as [
        string,
        number,
        string,
        Date
      ][]
    ).filter((item) => {
      return (
        item[0] !== "" &&
        item[3].getDate() === currentDate.getDate() &&
        item[3].getMonth() === currentDate.getMonth() &&
        item[3].getFullYear() === currentDate.getFullYear()
        // item[3].getTime() >=
        //   new Date(
        //     `${currentDate.getFullYear()}-${
        //       currentDate.getMonth() + 1
        //     }-${currentDate.getDate()} 00:00:00`
        //   ).getTime()
      );
    });

    oldCachedStatsData.monthStatData = (
      sds.getRange(1, 5, lastRow, 4).getValues() as [
        string,
        number,
        string,
        Date
      ][]
    ).filter((item) => {
      return (
        item[0] !== "" &&
        item[3].getMonth() === currentDate.getMonth() &&
        item[3].getFullYear() === currentDate.getFullYear()
        // item[3].getTime() >=
        // new Date(
        //   `${currentDate.getFullYear()}-${
        //     currentDate.getMonth() + 1
        //   }-01 00:00:00`
        // ).getTime()
      );
    });

    oldCachedStatsData.yearStatData = (
      sds.getRange(1, 9, lastRow, 4).getValues() as [
        string,
        number,
        string,
        Date
      ][]
    ).filter((item) => {
      return (
        item[0] !== "" && item[3].getFullYear() === currentDate.getFullYear()
        // item[3].getTime() >=
        // new Date(
        //   `${currentDate.getFullYear()}-01-01 00:00:00`
        // ).getTime()
      );
    });

    newCachedStatsData.todayStatData.forEach((storeItem) => {
      const updatedItemIndex = oldCachedStatsData.todayStatData.findIndex(
        (oldStoreItem) => oldStoreItem[0] === storeItem[0]
      );

      if (updatedItemIndex !== -1) {
        oldCachedStatsData.todayStatData[updatedItemIndex] = storeItem;
      } else {
        oldCachedStatsData.todayStatData.push(storeItem);
      }
    });

    newCachedStatsData.monthStatData.forEach((storeItem) => {
      const updatedItemIndex = oldCachedStatsData.monthStatData.findIndex(
        (oldStoreItem) => oldStoreItem[0] === storeItem[0]
      );

      if (updatedItemIndex !== -1) {
        oldCachedStatsData.monthStatData[updatedItemIndex] = storeItem;
      } else {
        oldCachedStatsData.monthStatData.push(storeItem);
      }
    });

    newCachedStatsData.yearStatData.forEach((storeItem) => {
      const updatedItemIndex = oldCachedStatsData.yearStatData.findIndex(
        (oldStoreItem) => oldStoreItem[0] === storeItem[0]
      );

      if (updatedItemIndex !== -1) {
        oldCachedStatsData.yearStatData[updatedItemIndex] = storeItem;
      } else {
        oldCachedStatsData.yearStatData.push(storeItem);
      }
    });

    cachedStatsData.todayStatData = oldCachedStatsData.todayStatData;
    cachedStatsData.monthStatData = oldCachedStatsData.monthStatData;
    cachedStatsData.yearStatData = oldCachedStatsData.yearStatData;
  } else {
    cachedStatsData.todayStatData = newCachedStatsData.todayStatData;
    cachedStatsData.monthStatData = newCachedStatsData.monthStatData;
    cachedStatsData.yearStatData = newCachedStatsData.yearStatData;
  }

  cachedStatsData.todayStatData.sort(
    (a, b) => b[1] - a[1] || a[0].localeCompare(b[0])
  );
  cachedStatsData.monthStatData.sort(
    (a, b) => b[1] - a[1] || a[0].localeCompare(b[0])
  );
  cachedStatsData.yearStatData.sort(
    (a, b) => b[1] - a[1] || a[0].localeCompare(b[0])
  );

  if (lastRow > 0 && lastColumn > 0) {
    sds.getRange(1, 1, sds.getLastRow(), sds.getLastColumn()).clearContent();
  }

  if (cachedStatsData.todayStatData.length > 0) {
    sds
      .getRange(
        1,
        1,
        cachedStatsData.todayStatData.length,
        cachedStatsData.todayStatData[0].length
      )
      .setValues(cachedStatsData.todayStatData);
  }

  if (cachedStatsData.monthStatData.length > 0) {
    sds
      .getRange(
        1,
        5,
        cachedStatsData.monthStatData.length,
        cachedStatsData.monthStatData[0].length
      )
      .setValues(cachedStatsData.monthStatData);
  }

  if (cachedStatsData.yearStatData.length > 0) {
    sds
      .getRange(
        1,
        9,
        cachedStatsData.yearStatData.length,
        cachedStatsData.yearStatData[0].length
      )
      .setValues(cachedStatsData.yearStatData);
  }
}

function getStoresStatsData(): GroupsStatsData {
  return getStoresTabStatsData();
}

function getStoresTabStatsData(): GroupsStatsData {
  return getCachedStoresStatsData("Stores stats data2");
}

// function removeEmptyRows<Type extends string>(rows: [Type, number][]) {
//   let i = 0;
//   while (i < rows.length && rows[i][0] !== "") {
//     i++;
//   }
//   return rows.slice(0, i);
// }

function getUnitStatsGroupsData(
  cms: GoogleAppsScript.Spreadsheet.Sheet,
  sums: GoogleAppsScript.Spreadsheet.Sheet,
  gsums: GoogleAppsScript.Spreadsheet.Sheet
) : GroupsStatsData {
  const maxRow = gsums.getLastRow() - 2;
  
  if (maxRow === 0) {
    return {
      todayStatData: [],
      monthStatData: [],
      yearStatData: [],
    };
  }
  
  const sumData = sums.getRange(2, 1, 1, 15).getValues()[0] as [
    string,
    ...number[]
  ];

  const todayStat = (
    cms.getRange(2, 22, maxRow, 2).getValues() as [GroupsID | "", number][]
  ).filter((row) => row[0] !== "") as [GroupsID, number][];
  
  const monthStat = (
    cms.getRange(2, 19, maxRow, 2).getValues() as [GroupsID | "", number][]
  ).filter((row) => row[0] !== "") as [GroupsID, number][];
  
  const yearStat = (
    gsums.getRange(3, 2, maxRow, 2).getValues() as [GroupsID, number][]
  ).filter((group) => group[1] !== 0);

  return {
    todayStatData: [[sumData[0], sumData[1], todayStat]],
    monthStatData:  [[sumData[0], sumData[currentMonth + 3] as number, monthStat]],
    yearStatData:  [[sumData[0], sumData[2], yearStat]],
  };
}

function getUnitStatsData(
  cms: GoogleAppsScript.Spreadsheet.Sheet,
  sums: GoogleAppsScript.Spreadsheet.Sheet
): AccountsStatsData {
  const maxRow = sums.getLastRow() - 2;
  
  if (maxRow === 0) {
    return {
      todayStatData: [],
      monthStatData: [],
      yearStatData: [],
    };
  }
  
  const todayStat = (
    cms.getRange(2, 10, maxRow, 2).getValues() as [string, number][]
  ).filter((row) => row[0] !== "");
  const monthStat = (
    cms.getRange(2, 7, maxRow, 2).getValues() as [string, number][]
  ).filter((row) => row[0] !== "");
  const yearStat = sums.getRange(3, 2, maxRow, 2).getValues() as [
    string,
    number
  ][];

  todayStat.sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  monthStat.sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  yearStat.sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));

  return {
    todayStatData: todayStat,
    monthStatData: monthStat,
    yearStatData: yearStat,
  };
}

function getStatsData(store: StoreIdb): AccountsStatsData {
  return getUnitTabStatsData(store).accounts;
}

function getUnitTabStatsData(store: StoreIdb): UnitStatsData {
  const { cms, sums, gsums } = getUnitDatabase(
    rootDir,
    store,
    currentMonth,
    currentYear
  );

  const accountsStat = getUnitStatsData(cms, sums);
  const groupsStat = getUnitStatsGroupsData(cms, sums, gsums);

  return { accounts: accountsStat, groups: groupsStat };
}

function getNumOfUserAccountsMonthsYear(
  email: string,
  sums: GoogleAppsScript.Spreadsheet.Sheet
) {
  const maxRow = sums.getLastRow() - 2;

  if (maxRow === 0) {
    return null;
  }

  const rows: [string, ...number[]][] = sums.getRange(3, 2, maxRow, 14).getValues() as [string, ...number[]][];
  
  const userRow = rows.filter((row) => row[0] === email);

  return userRow.length > 0 ? userRow[0].slice(1) as number[] : null;
}

function getNumOfUserAccountsByMonth(
  email: string,
  cms: GoogleAppsScript.Spreadsheet.Sheet,
  sums: GoogleAppsScript.Spreadsheet.Sheet,
  today = true
): number {
  const maxRow = sums.getLastRow() - 2;

  if (maxRow === 0) return 0;

  const values: Array<[string, number]> = today
    ? (cms.getRange(2, 10, maxRow, 2).getValues() as Array<[string, number]>)
    : (cms.getRange(2, 7, maxRow, 2).getValues() as Array<[string, number]>);

  for (const row of values) {
    if (row[0] === email) {
      return row[1];
    }
  }

  return 0;
}

function getActiveUserData(email: string) {
  function normalizeStoreName(items: string[], storeID: string) {
    let storeName = items
      .filter((item) => (item.toUpperCase() !== "STORE" ? true : false))
      .join(" ");

    const store = stores.find((store) => store.nr === storeID);

    if (store) {
      storeName = store.name;
    }

    return storeName;
  }

  const defaultPictureUrl =
    "https://lh3.googleusercontent.com/a-/AOh14Gj-cdUSUVoEge7rD5a063tQkyTDT3mripEuDZ0v=s100";

  const result = {
    userID: "",
    userLogin: "",
    pic: defaultPictureUrl,
    firstName: "",
    lastName: "",
    storeID: "",
    storeName: "",
    country: "",
  };

  try {
    const people = People?.People?.searchDirectoryPeople({
      query: email,
      readMask: "names,organizations,photos,externalIds",
      sources: "DIRECTORY_SOURCE_TYPE_DOMAIN_PROFILE",
    });

    const userID = people?.people?.[0].resourceName?.split("/")[1];
    const userLogin = people?.people?.[0].externalIds?.[0].value;
    const userPictureUrl = people?.people?.[0].photos?.[0].url;
    const userStore =
      people?.people?.[0].organizations?.[0].costCenter?.split(" ");
    const userName = people?.people?.[0].names?.[0].displayName?.split(" ");

    result.userID = userID ?? "";
    result.userLogin = userLogin ?? "";
    result.pic = userPictureUrl ?? defaultPictureUrl;
    result.firstName = userName?.[0] ?? "";
    result.lastName = userName?.[1] ?? "";
    result.storeID = userStore
      ? userStore[userStore.length - 1].slice(12, 16)
      : "";
    result.storeName = userStore
      ? normalizeStoreName(userStore.slice(0, -1), result.storeID)
      : "";
    result.country = userStore?.[userStore.length - 1].slice(1, 3) ?? "";

    return result;
  } catch (err) {
    return result;
  }
}

function prepareTopRanking(arr: [string, number][], top: number) {
  if (arr.length > --top) {
    let i = top;
    if (arr[top + 1][1] === arr[top][1]) {
      do {
        i--;
      } while (i >= 0 && arr[i][1] === arr[top][1]);
    }
    arr.splice(i + 1);
  }

  return arr;
}

function numberRanking(
  arr: [string, number][]
): [string, number][] {
  let pos = 0;
  let prevValue = -1;

  return arr.map((item) => {
    if (prevValue !== item[1]) {
      pos++;
      prevValue = item[1];
    }
    return [`${pos}. ${item[0]}`, item[1]];
  });
}

function makePerPersonStatsData() {
  const oldCachedStatsData: PerPersonCachedStatsDataAndTime = {
    todayStatData: [],
    monthStatData: [],
    yearStatData: [],
  };

  const newCachedStatsData: PerPersonCachedStatsDataAndTime = {
    todayStatData: [],
    monthStatData: [],
    yearStatData: [],
  };

  const cachedStatsData: PerPersonCachedStatsDataAndTime = {
    todayStatData: [],
    monthStatData: [],
    yearStatData: [],
  };

  let folderList = DriveApp.getFoldersByName(rootDir);
  if (folderList.hasNext()) {
    const rootDACFolder = folderList.next(); // ActiveCounter dir
    folderList = rootDACFolder.getFoldersByName(currentYear.toString());
    if (folderList.hasNext()) {
      const yearFolder = folderList.next(); // Year folder
      const fileList = yearFolder.getFiles();

      while (fileList.hasNext()) {
        const file = fileList.next();
        const lastUpdatedSheet = file.getLastUpdated() as Date;

        if (
          // currentDate.getMonth() === lastUpdatedSheet.getMonth() &&
          // currentDate.getDate() === lastUpdatedSheet.getDate() &&
          // currentDate.getFullYear() === lastUpdatedSheet.getFullYear() &&
          currentDate.getTime() - 1000 * 60 * 5 <=
          lastUpdatedSheet.getTime()
        ) {
          const ss = SpreadsheetApp.openById(file.getId());
          const sums = ss.getSheetByName(monthlySummarySheetName);
          const ms = ss.getSheetByName(monthNames[currentMonth]);

          if (sums === null || ms === null)
            throw new Error("Nie znaleziono skoroszytu...");

          const storeID = ss.getName().split(" / ")[0];

          if (sums.getLastRow() - 2 > 0) {
            newCachedStatsData.monthStatData.push(
              ...((
                ms.getRange(2, 7, sums.getLastRow() - 2, 2).getValues() as [
                  string,
                  number
                ][]
              )
                .filter((row) => row[0] !== "")
                .map((row) => [
                  `${row[0]} (${storeID})`,
                  row[1],
                  lastUpdatedSheet,
                ]) as [string, number, Date][])
            );

            newCachedStatsData.todayStatData.push(
              ...((
                ms.getRange(2, 10, sums.getLastRow() - 2, 2).getValues() as [
                  string,
                  number
                ][]
              )
                .filter((row) => row[0] !== "")
                .map((row) => [
                  `${row[0]} (${storeID})`,
                  row[1],
                  lastUpdatedSheet,
                ]) as [string, number, Date][])
            );

            newCachedStatsData.yearStatData.push(
              ...(sums
                .getRange(3, 2, sums.getLastRow() - 2, 2)
                .getValues()
                .filter((itemYear) => {
                  return (
                    newCachedStatsData.todayStatData.findIndex((itemToday) => {
                      return `${itemYear[0]} (${storeID})` === itemToday[0];
                    }) !== -1
                  );
                })
                .map((row) => [
                  `${row[0]} (${storeID})`,
                  row[1],
                  lastUpdatedSheet,
                ]) as [string, number, Date][])
            );
          }
        }
      }
    }
  }
  
  const sds = SpreadsheetApp.getActive().getSheetByName("Per person stats data");
  if (sds === null) throw new Error("Nie znaleziono skoroszytu...");

  const lastRow = sds.getLastRow();
  const lastColumn = sds.getLastColumn();

  if (lastRow > 0) {
    oldCachedStatsData.todayStatData = (
      sds.getRange(1, 1, lastRow, 3).getValues() as [string, number, Date][]
    ).filter((item) => {
      return (
        item[0] !== "" &&
        item[2].getDate() === currentDate.getDate() &&
        item[2].getMonth() === currentDate.getMonth() &&
        item[2].getFullYear() === currentDate.getFullYear()
      );
    });

    oldCachedStatsData.monthStatData = (
      sds.getRange(1, 4, lastRow, 3).getValues() as [string, number, Date][]
    ).filter((item) => {
      return (
        item[0] !== "" &&
        item[2].getMonth() === currentDate.getMonth() &&
        item[2].getFullYear() === currentDate.getFullYear()
      );
    });

    oldCachedStatsData.yearStatData = (
      sds.getRange(1, 7, lastRow, 3).getValues() as [string, number, Date][]
    ).filter((item) => {
      return (
        item[0] !== "" && item[2].getFullYear() === currentDate.getFullYear()
      );
    });

    newCachedStatsData.todayStatData.forEach((storeItem) => {
      const updatedItemIndex = oldCachedStatsData.todayStatData.findIndex(
        (oldStoreItem) => oldStoreItem[0] === storeItem[0]
      );
      if (updatedItemIndex !== -1) {
        oldCachedStatsData.todayStatData[updatedItemIndex] = storeItem;
      } else {
        oldCachedStatsData.todayStatData.push(storeItem);
      }
    });

    newCachedStatsData.monthStatData.forEach((storeItem) => {
      const updatedItemIndex = oldCachedStatsData.monthStatData.findIndex(
        (oldStoreItem) => oldStoreItem[0] === storeItem[0]
      );
      if (updatedItemIndex !== -1) {
        oldCachedStatsData.monthStatData[updatedItemIndex] = storeItem;
      } else {
        oldCachedStatsData.monthStatData.push(storeItem);
      }
    });

    newCachedStatsData.yearStatData.forEach((storeItem) => {
      const updatedItemIndex = oldCachedStatsData.yearStatData.findIndex(
        (oldStoreItem) => oldStoreItem[0] === storeItem[0]
      );
      if (updatedItemIndex !== -1) {
        oldCachedStatsData.yearStatData[updatedItemIndex] = storeItem;
      } else {
        oldCachedStatsData.yearStatData.push(storeItem);
      }
    });

    cachedStatsData.todayStatData = oldCachedStatsData.todayStatData;
    cachedStatsData.monthStatData = oldCachedStatsData.monthStatData;
    cachedStatsData.yearStatData = oldCachedStatsData.yearStatData;
  } else {
    cachedStatsData.todayStatData = newCachedStatsData.todayStatData;
    cachedStatsData.monthStatData = newCachedStatsData.monthStatData;
    cachedStatsData.yearStatData = newCachedStatsData.yearStatData;
  }

  cachedStatsData.todayStatData.sort(
    (a, b) => b[1] - a[1] || a[0].localeCompare(b[0])
  );
  cachedStatsData.monthStatData.sort(
    (a, b) => b[1] - a[1] || a[0].localeCompare(b[0])
  );
  cachedStatsData.yearStatData.sort(
    (a, b) => b[1] - a[1] || a[0].localeCompare(b[0])
  );

  if (lastRow > 0 && lastColumn > 0) {
    sds.getRange(1, 1, lastRow, lastColumn).clearContent();
  }

  if (cachedStatsData.todayStatData.length > 0) {
    sds
      .getRange(
        1,
        1,
        cachedStatsData.todayStatData.length,
        cachedStatsData.todayStatData[0].length
      )
      .setValues(cachedStatsData.todayStatData);
  }

  if (cachedStatsData.monthStatData.length > 0) {
    sds
      .getRange(
        1,
        4,
        cachedStatsData.monthStatData.length,
        cachedStatsData.monthStatData[0].length
      )
      .setValues(cachedStatsData.monthStatData);
  }

  if (cachedStatsData.yearStatData.length > 0) {
    sds
      .getRange(
        1,
        7,
        cachedStatsData.yearStatData.length,
        cachedStatsData.yearStatData[0].length
      )
      .setValues(cachedStatsData.yearStatData);
  }
}

function getCachedPerPersonStatsData(sheetName: string): AccountsStatsData {
  const sds = SpreadsheetApp.getActive().getSheetByName(sheetName);

  if (sds === null) throw new Error("Nie znaleziono skoroszytu...");

  if (sds.getLastRow() > 0) {
    return {
      todayStatData: (
        sds.getRange(1, 1, sds.getLastRow(), 2).getValues() as [
          string,
          number
        ][]
      ).filter((row) => row[0] !== ""),
      monthStatData: (
        sds.getRange(1, 4, sds.getLastRow(), 2).getValues() as [
          string,
          number
        ][]
      ).filter((row) => row[0] !== ""),
      yearStatData: (
        sds.getRange(1, 7, sds.getLastRow(), 2).getValues() as [
          string,
          number
        ][]
      ).filter((row) => row[0] !== ""),
    };
  } else {
    return {
      todayStatData: [],
      monthStatData: [],
      yearStatData: [],
    };
  }
}

function getCachedStoresStatsData(sheetName: string): GroupsStatsData {
  const sds = SpreadsheetApp.getActive().getSheetByName(sheetName);
  if (sds === null) throw new Error("Nie znaleziono skoroszytu...");

  if (sds.getLastRow() > 0) {
    return {
      todayStatData: (
        sds
          .getRange(1, 1, sds.getLastRow(), 3)
          .getValues() as StoresStatsDataItem[]
      )
        .filter((item) => item[0] !== "")
        .map((item) => [item[0], item[1], JSON.parse(item[2])]),
      monthStatData: (
        sds
          .getRange(1, 5, sds.getLastRow(), 3)
          .getValues() as StoresStatsDataItem[]
      )
        .filter((item) => item[0] !== "")
        .map((item) => [item[0], item[1], JSON.parse(item[2])]),
      yearStatData: (
        sds
          .getRange(1, 9, sds.getLastRow(), 3)
          .getValues() as StoresStatsDataItem[]
      )
        .filter((item) => item[0] !== "")
        .map((item) => [item[0], item[1], JSON.parse(item[2])]),
    };
  } else {
    return {
      todayStatData: [],
      monthStatData: [],
      yearStatData: []
    };
  }
}

function getPerPersonStatsData(): AccountsStatsData {
  return getPerPersonTabStatsData();
}

function getPerPersonTabStatsData(): AccountsStatsData {
  const cachedStatsData = getCachedPerPersonStatsData("Per person stats data");

  return {
    todayStatData: numberRanking(
      prepareTopRanking(cachedStatsData.todayStatData, 100)
    ),
    monthStatData: numberRanking(
      prepareTopRanking(cachedStatsData.monthStatData, 100)
    ),
    yearStatData: numberRanking(
      prepareTopRanking(cachedStatsData.yearStatData, 100)
    ),
  };
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function getDatabaseFilesIDs(rootDir: string) {
  const arrIDs: Array<string> = [];

  let folderList = DriveApp.getFoldersByName(rootDir);
  if (folderList.hasNext()) {
    const rootDACFolder = folderList.next(); // ActiveCounter dir
    folderList = rootDACFolder.getFoldersByName(currentYear.toString());
    if (folderList.hasNext()) {
      const yearFolder = folderList.next(); // Year folder
      const fileList = yearFolder.getFiles();

      while (fileList.hasNext()) {
        arrIDs.push(fileList.next().getId());
      }
    }
  }

  return arrIDs;
}

function convertSheets() {
  // const tss = SpreadsheetApp.openById("1uyxFKb_r80fw8HL7dfN0JIL8MTdsSszI_u_6E2fq-gE");
  
  // const tfs = tss.getSheetByName("Styczeń");
  // if (tfs === null) throw new Error("Nie znaleziono skoroszytu...");
  
  // const files = getDatabaseFilesIDs("ActiveCounter2").sort((a, b) => a[0].localeCompare(b[0]));

  // files.slice(60, 70).forEach((fileID) => {
  //   const ss = SpreadsheetApp.openById(fileID);

  //   tfs.copyTo(ss).setName("FormatTemp");

  //   const ctfs = ss.getSheetByName("FormatTemp");
  //   if (ctfs === null) throw new Error("Nie znaleziono skoroszytu...");

  //   const range = ctfs.getRange("A:W");

  //   monthNames.forEach((month) => {
  //     const cms = ss.getSheetByName(month);
  //     if (cms === null) throw new Error("Nie znaleziono skoroszytu...");

  //     const A = "email";
  //     const B = "czas";
  //     const C = "czas wysłania";
  //     const D = "grupa";
  //     const E = "del";
  //     const F = "";
  //     const G = `=iferror(ArrayFormula(QUERY(A2:E;"select A, Count(A) where A is not null and E is null group by A"));"")`;
  //     const H = "";
  //     const I = "";
  //     const J = `=iferror(ArrayFormula(QUERY(A2:E;"select A, count(A) where A is not null and E is null and toDate(B) = toDate(dateTime '"&TO_TEXT(now())&"') group by A"));"")`;
  //     const K = "";
  //     const L = "";
  //     const M = `=iferror(ArrayFormula(QUERY(A2:E;"select D, Count(A) where A is not null and E is null group by A, D"));"")`;
  //     const N = "";
  //     const O = "";
  //     const P = `=iferror(ArrayFormula(QUERY(A2:E;"select D, Count(A) where A is not null and E is null and toDate(B) = toDate(dateTime '"&TO_TEXT(now())&"') group by A, D"));"")`;
  //     const Q = "";
  //     const R = "";
  //     const S = `=iferror(ArrayFormula(QUERY(M2:N;"select M, SUM(N) where M is not null group by M"));"")`;
  //     const T = "";
  //     const U = "";
  //     const V = `=iferror(ArrayFormula(QUERY(P2:Q;"select P, SUM(Q) where P is not null group by P"));"")`;

  //     const row = [
  //       A,
  //       B,
  //       C,
  //       D,
  //       E,
  //       F,
  //       G,
  //       H,
  //       I,
  //       J,
  //       K,
  //       L,
  //       M,
  //       N,
  //       O,
  //       P,
  //       Q,
  //       R,
  //       S,
  //       T,
  //       U,
  //       V,
  //     ];

  //     cms.getRange(1, 1, 1, row.length).setValues([row]);

  //     range.copyTo(
  //       cms.getRange("A:W"),
  //       SpreadsheetApp.CopyPasteType.PASTE_FORMAT,
  //       false
  //     );

  //     range.copyTo(
  //       cms.getRange("A:W"),
  //       SpreadsheetApp.CopyPasteType.PASTE_COLUMN_WIDTHS,
  //       false
  //     );
  //   });

  //   ss.deleteSheet(ctfs);

  //   const ts = tss.getSheetByName("Konsolidacje");
  //   if (ts === null) throw new Error("Nie znaleziono skoroszytu...");

  //   ts.copyTo(ss).setName("Konsolidacje");

  //   const ks = ss.getSheetByName("Konsolidacje");
  //   if (ks === null) throw new Error("Nie znaleziono skoroszytu...");

  //   ks.activate();
  //   ss.moveActiveSheet(1);

  //   const sums = ss.getSheetByName("Zestawienie");
  //   if (sums === null) throw new Error("Nie znaleziono skoroszytu...");

  //   const form: string = `=ifna((QUERY(INDIRECT(index($D$1:$O$1;1;COLUMN()-3)&"!G:H");"select H where G = '"&index($B:$B;row();1)&"'";0));0)`;
    
  //   const rows: string[][] = [];
  //   const countRows = sums.getLastRow() - 2;
    
  //   if (countRows > 0) {
  //     for (let i = 0; i < countRows; i++) {
  //       rows.push([
  //         form,
  //         form,
  //         form,
  //         form,
  //         form,
  //         form,
  //         form,
  //         form,
  //         form,
  //         form,
  //         form,
  //         form,
  //       ]);
  //     }

  //     sums.getRange(3, 4, rows.length, rows[0].length).setValues(rows);
  //   }

  //   sums
  //     .getRange(2, 2, 1, 1)
  //     .setValues([[`=SUM(INDIRECT(INDEX(D1:O1; MONTH(NOW()))&"!K1:K"))`]]);

  // });
}

global.doGet = doGet;
global.saveLocalAccounts = saveLocalAccounts;
global.init = init;
global.getIndividualUnitStatsData = getIndividualUnitStatsData;
global.getUnitTabStatsData = getUnitTabStatsData;
global.getStoresTabStatsData = getStoresTabStatsData;
global.getPerPersonTabStatsData = getPerPersonTabStatsData;
global.finalizingUploadAccountsRequest = finalizingUploadAccountsRequest;
global.getScriptURL = getScriptURL;
global.getIndividualTabStatsData = getIndividualTabStatsData;

global.makeStoresStatsData = makeStoresStatsData;
global.makePerPersonStatsData = makePerPersonStatsData;

global.getUserStatsData = getUserStatsData;
global.getStatsData = getStatsData;
global.getStoresStatsData = getStoresStatsData;
global.getPerPersonStatsData = getPerPersonStatsData;
global.getUserUnitStatsData = getUserUnitStatsData;

global.convertSheets = convertSheets;
