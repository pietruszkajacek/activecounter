import { useEffect, useState } from "react";

const useDashboardMode = (dbModeBreak: number) => {
  const [dbMode, setdbMode] = useState(
    window.innerWidth >= dbModeBreak ? true : false
  );

  useEffect(() => {
    const windowSizeHandler = () => {
      setdbMode(window.innerWidth >= dbModeBreak ? true : false);
    };
    window.addEventListener("resize", windowSizeHandler);

    return () => {
      window.removeEventListener("resize", windowSizeHandler);
    };
  }, []);

  return dbMode;
};

export default useDashboardMode;
