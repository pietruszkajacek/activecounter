import { useEffect, useRef } from "react";

interface callbackType {
  (): void;
}

function useInterval(callback: callbackType, delay: number | null) {
  const savedCallback = useRef<callbackType | null>(null);

  // Remember the latest callback.
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the interval.
  useEffect(() => {
    function tick() {
      if (savedCallback.current !== null) {
        savedCallback.current();
      }
    }
    if (delay !== null) {
      const id = setInterval(tick, delay);
      return () => clearInterval(id);
    }
  }, [delay]);
}

export default useInterval;
