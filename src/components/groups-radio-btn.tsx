/* eslint-disable prefer-const */
import { Consolidation } from "@/interfaces/consolidation";
import { Field, Radio, RadioGroup } from "@headlessui/react";

type Props = {
  consolidations: Consolidation[];
  selected: Consolidation | null;
  setSelected: (consolidation: Consolidation) => void;
  disabled: boolean;
};

export default function GroupsRadioBtn({selected, setSelected, consolidations, disabled}: Props) {

  return (
    <>
      <p className="mt-2 text-sm text-gray-500">
        Wysyłasz konta związane z grupą:
      </p>
      <RadioGroup
        disabled={disabled}
        by="id"
        value={selected}
        onChange={setSelected}
        aria-label="Server size"
        className="flex mt-2"
      >
        {consolidations.map((cons) => (
          <Field key={cons.id} className="flex w-1/4 p-2">
            <Radio
              as="div"
              value={cons}
              className="flex items-center justify-center w-full text-center bg-newdecat-100 data-[checked]:bg-newdecat-300 rounded-md text-newdecat-900 data-[checked]:text-white text-xs p-1"
            >
              {cons.name}
            </Radio>
          </Field>
        ))}
      </RadioGroup>
    </>
  );
}
