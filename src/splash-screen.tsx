import Avatar from "./components/avatar";
import ActiveCounterLogo from "./components/active-counter-logo";
import Spinner from "./components/spinner";
import { APP_CONFIG } from "@/consts/constants";

type Props = {
  version: string;
  build: string;
  text: string;
};

function SplashScreen({ version, build, text }: Props) {
  return (
    <div className="touch-none flex min-h-screen flex-col pb-2">
      <div className="flex flex-none my-auto flex-col items-center">
        <ActiveCounterLogo className="w-1/3" />
        <div className="w-1/3 text-right text-xs text-gray-400 pt-2">
          v{version} ({build})
        </div>
      </div>
      <div className="flex flex-none justify-center flex-row flex-wrap pb-12 text-base leading-7 text-gray-600">
        {text}
      </div>
      <div className="flex flex-none justify-center flex-row flex-wrap pb-12">
        <Spinner sronly="Loading..." />
      </div>
      <div className="flex flex-none justify-center flex-row flex-wrap">
        <div className="text-center text-gray-300 w-full text-[8px]">FROM</div>
        <div className="flex justify-center flex-col mr-2">
          <Avatar imageURL={APP_CONFIG.creatorProfileImageUrl} />
        </div>
        <div className="flex flex-col justify-center text-[10px]">
          <div className="font-semibold">Jacek PIETRUSZKA</div>
          <div className="text-[8px]">pietruszkajacek@gmail.com</div>
        </div>
      </div>
    </div>
  );
}

export default SplashScreen;
