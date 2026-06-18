import { useState, useEffect } from "react";

const useOnlyOneAppTab = () => {
  const [isOriginal, setIsOriginal] = useState(true);

  useEffect(() => {
    const channel = new BroadcastChannel("tab");

    channel.postMessage("another-tab");
    // note that listener is added after posting the message

    const avoidMultiTabs = (msg: { data: string }) => {
      if (msg.data === "another-tab" && isOriginal) {
        // message received from 2nd tab
        // reply to all new tabs that the website is already open
        channel.postMessage("already-open");
      } else if (msg.data === "already-open") {
        // message received from original tab
        setIsOriginal(false);
      }
    };

    channel.addEventListener("message", avoidMultiTabs);
    return () => {
      channel.removeEventListener("message", avoidMultiTabs);
    };
  }, [isOriginal]);  

  return isOriginal;
};

export default useOnlyOneAppTab;
