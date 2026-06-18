import { Tab } from "@headlessui/react";

type Props = {
  title: string;
  disabled?: boolean;
  children?: React.ReactNode;
};

function TabNavMain({ title, children, disabled }: Props) {
  return (
    <Tab
      disabled={disabled}
      as="button" // "<a></a>" element don'work properly (the disabled tabs can still be focused)
      className="data-[disabled]:hidden block outline-0 rounded-t-md border border-transparent data-[selected]:border-x-newdecat-200 
        data-[selected]:border-t-newdecat-200 data-[selected]:border-b-white -mb-px py-2 px-4 data-[selected]:bg-white 
        hover:border-newdecat-100"
    >
      {title}
      {children}
    </Tab>
  );
}

export default TabNavMain;
