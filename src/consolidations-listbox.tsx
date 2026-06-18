import { Consolidation } from "@/interfaces/consolidation";
import {
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
} from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/24/solid";

type Props = {
  consolidations: Consolidation[];
  selectedConsolidation: Consolidation;
  setSelectedConsolidation: React.Dispatch<React.SetStateAction<Consolidation>>
  disabled: boolean;
};

export function ConsolidationListbox({ consolidations, setSelectedConsolidation, selectedConsolidation, disabled }: Props) {
  return (
    <div className="">
      <Listbox
        value={selectedConsolidation}
        by="id"
        onChange={setSelectedConsolidation}
        disabled={disabled}
      >
        <ListboxButton className="relative block w-full text-left text-gray-500 py-1.5 pr-8 pl-3 rounded-lg bg-gray-100 focus:outline-none data-[focus]:outline-2 data-[focus]:-outline-offset-2 data-[focus]:outline-white/25">
          {selectedConsolidation.id + " - " + selectedConsolidation.name}
          <ChevronDownIcon
            className="group pointer-events-none absolute top-2.5 right-2.5 size-4 fill-black"
            aria-hidden="true"
          />
        </ListboxButton>
        <ListboxOptions
          anchor="bottom"
          className="w-[var(--button-width)] p-1 [--anchor-gap:4px] sm:[--anchor-gap:8px] [--anchor-padding:16px] rounded-xl border border-gray-100 bg-gray-100 focus:outline-none transition duration-100 ease-in data-[leave]:data-[closed]:opacity-0"
        >
          {consolidations.map((consolidation) => (
            <ListboxOption
              key={consolidation.id}
              value={consolidation}
              className="data-[focus]:bg-gray-400 data-[focus]:text-white group text-gray-500 flex cursor-default items-center gap-2 rounded-lg py-1.5 px-3 select-none"
            >
              {consolidation.id + " - " + consolidation.name}
            </ListboxOption>
          ))}
        </ListboxOptions>
      </Listbox>
    </div>
  );
}
