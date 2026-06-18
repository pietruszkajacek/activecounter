import { useState } from "react";
import type { AccountsSetter } from "@/interfaces/accounts-setter";

const useLocalStorage = <Type>(
  key: string,
  initialValue: Type
): [Type, AccountsSetter<Type>] => {
  const [storedValue, setStoredValue] = useState<Type>(() => {
    if (typeof window === "undefined") {
      return initialValue;
    }
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.log(error);
      return initialValue;
    }
  });

  const setValue = (value: Type) => {
    try {
      setStoredValue(value);

      if (typeof window !== "undefined") {
        localStorage.setItem(key, JSON.stringify(value));
      }
    } catch (error) {
      console.log(error);
    }
  };

  return [storedValue, setValue];
};

export default useLocalStorage;