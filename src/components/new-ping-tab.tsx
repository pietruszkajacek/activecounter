type Props = {
  title: string;
  selectedIndexTab: number;
  indexTab: number;
  titleColor: string;
};

export default function NewPingTab({ title, selectedIndexTab, indexTab, titleColor }: Props) {
  return (
    <>
      {selectedIndexTab !== indexTab && (
        <span className={`absolute z-10 ${titleColor} flex text-[10px] font-bold top-0 right-0 mt-[2px] -mr-[7px] rotate-[30deg]`}>
          <span className="animate-ping absolute inline-flex h-full w-full opacity-75">
            {title}
          </span>
          <span className="relative inline-flex">{title}</span>
        </span>
      )}
    </>
  );
}
