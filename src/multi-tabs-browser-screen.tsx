import ActiveCounterLogo from "./components/active-counter-logo";

function MultiTabsBrowserScreen() {
  return (
    <div className="flex min-h-screen justify-center flex-col px-20">
      <ActiveCounterLogo className="mx-auto " />
      <div className="pt-4 drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.8)] text-white text-center text-4xl font-bold">
        APLIKACJA DZIAŁA JUŻ W&nbsp;INNEJ KARCIE
      </div>
    </div>
  );
}

export default MultiTabsBrowserScreen;
