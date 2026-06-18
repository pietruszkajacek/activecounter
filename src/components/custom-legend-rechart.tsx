import { Groups, GroupsID } from "@/interfaces/stats-data";
import { stackedBarChartCol } from "@/consts/constants";

const groups: Groups = {
  pok: "POK",
  dzs: "Dział sportowy",
  ser: "Serwis",
  hos: "Hostessa / Event zewn.",
  ngr: "Brak przypisania"
};

function SvgCube({ color }: { color: string }) {
  return (
    <svg
      width="14"
      height="14"
      xmlns="http://www.w3.org/2000/svg"
      className="inline-block mr-1"
    >
      <rect width="14" height="14" fill={color} />
    </svg>
  );
}

function CustomLegendRecharts() {
  return (
    <div className="block full pr-[30px] pl-[60px]">
      <ul className="text-center mb-4">
        {(Object.getOwnPropertyNames(groups) as GroupsID[]).map((group) => {
          return (
            <li key={group} className={`inline-block mr-3 last-of-type:mr-0 mb-1`}>
              <SvgCube color={stackedBarChartCol[`${group}`]} />
              <span style={{ color: stackedBarChartCol[group] }}>
                {groups[`${group}`]}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default CustomLegendRecharts;
