import { useEffect, useCallback, useRef } from "react";

const useOnlyOneAppTab2 = () => {
  const isOriginalRef = useRef(true);
  const isOriginal = useCallback(() => isOriginalRef.current, []);

  useEffect(() => {
    const channel = new BroadcastChannel("tab");

    channel.postMessage("another-tab");
    // note that listener is added after posting the message
    console.log('post-another-tab', isOriginalRef.current);

    const avoidMultiTabs = (msg: { data: string }) => {
      if (msg.data === "another-tab" && isOriginalRef.current) {
        // message received from 2nd tab
        // reply to all new tabs that the website is already open
        channel.postMessage("already-open");
        console.log('post-already-open', isOriginalRef.current);
      } else if (msg.data === "already-open") {
        // message received from original tab
        isOriginalRef.current = false;
        console.log('already-open', isOriginalRef.current);
      }
    };

    channel.addEventListener("message", avoidMultiTabs);
    return () => {
      channel.removeEventListener("message", avoidMultiTabs);
    };
  }, []);  

  return isOriginal;
};

export default useOnlyOneAppTab2;
