import { Context, useContext } from "react";

const useContextAndErrorIfNull = <Type>(
  context: Context<Type | null>
): Type => {
  const contextValue = useContext(context);
  if (contextValue === null) {
    throw Error("Context has not been provided!");
  }
  return contextValue;
};

export default useContextAndErrorIfNull;
