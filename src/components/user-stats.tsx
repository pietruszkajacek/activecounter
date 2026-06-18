import { AccountCreated } from "@/interfaces/account-created";
import { RemoteAccountsData } from "@/interfaces/remote-accounts-data";
import Spinner from "./spinner";
import { EmblaCarousel } from "./embla-carousel";
import { useState } from "react";
import { monthNames } from "@/consts/constants";

type Props = {
  remoteAccounts: RemoteAccountsData | undefined;
  localAccounts: AccountCreated[] | undefined;
};

export default function UserStats({ remoteAccounts, localAccounts }: Props) {
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth());

  const statsData = [
    { id: 0, name: "Założone aplikacje (dzień)", value: remoteAccounts?.day },
    {
      id: 1,
      name: "Założone aplikacje (miesiąc)",
      value: remoteAccounts?.month,
    },
    { id: 2, name: "Założone aplikacje (rok)", value: remoteAccounts?.year },
    {
      id: 3,
      name: "Założone aplikacje nie wysłane na serwer",
      value: localAccounts?.length,
    },
  ];

  return (
    <div className="bg-white py-8 md:py-16">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <dl className="grid grid-cols-1 gap-x-8 gap-y-10 text-center md:grid-cols-3">
          <div
            key={statsData[0].id}
            className="mx-auto flex max-w-xs flex-col gap-y-4 w-full"
          >
            <dt className="text-base leading-7 text-gray-600">
              {statsData[0].name} / {statsData[3].name}
            </dt>
            <dd className="drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.8)] order-first text-8xl font-semibold tracking-tight md:text-6xl inline-flex justify-evenly flex-nowrap items-center">
              {remoteAccounts ? (
                <span className="text-newdecat-500">{statsData[0].value}</span>
              ) : (
                <Spinner sronly={"Loading..."} />
              )}
              <span className="text-newdecat-500"> / </span>
              <span className=" text-decatactive-500">
                {statsData[3].value}
              </span>
            </dd>
          </div>

          <div className="mx-auto flex max-w-xs flex-col gap-y-4 w-full">
            <dt className="text-base leading-7 text-gray-600">
              Założone aplikacje miesiąc (
              <span className="font-bold">
                {remoteAccounts
                  ? monthNames[selectedMonth].toLocaleLowerCase()
                  : "------"}
              </span>
              )
            </dt>
            <dd className="drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.8)] order-first text-5xl font-semibold tracking-tight text-newdecat-300 md:text-6xl">
              {remoteAccounts ? (
                <EmblaCarousel
                  slides={remoteAccounts.month}
                  options={{ startIndex: new Date().getMonth() }}
                  setSelectedMonth={setSelectedMonth}
                />
              ) : (
                <Spinner sronly={"Loading..."} />
              )}
            </dd>
          </div>

          <div
            key={statsData[2].id}
            className="mx-auto flex max-w-xs flex-col gap-y-4 w-full"
          >
            <dt className="text-base leading-7 text-gray-600">
              {statsData[2].name}
            </dt>
            <dd className="drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.8)] order-first text-5xl font-semibold tracking-tight text-newdecat-300 md:text-6xl">
              {remoteAccounts ? (
                statsData[2].value
              ) : (
                <Spinner sronly={"Loading..."} />
              )}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
