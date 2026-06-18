type Props = {
  onClick: () => void;
  disabled: boolean;
  children: React.ReactNode;
};

function BtnSendAccounts({ onClick, disabled, children }: Props) {
  function handleClick() {
    onClick();
  }

  return (
    <button
      disabled={disabled}
      className="flex content-center items-center justify-center w-full h-20 rounded-lg disabled:bg-decatactive-500/50 bg-decatactive-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-decatactive-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-decatactive-700"
      onClick={handleClick}
    >
      {children}
    </button>
  );
}

export default BtnSendAccounts;
