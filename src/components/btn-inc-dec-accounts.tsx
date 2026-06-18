type Props = {
  onClick: () => void;
  children: React.ReactNode;
};

function BtnIncDecAccounts({ onClick, children }: Props) {
  function handleClick() {
    onClick();
  }

  return (
    <button
      className="flex content-center items-center justify-center w-full h-20 rounded-lg bg-newdecat-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-newdecat-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-newdecat-700"
      onClick={handleClick}
    >
      {children}
    </button>
  );
}

export default BtnIncDecAccounts;
