import React, { createContext } from "react";

export const SettingsDialogModalContext = createContext<{
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
} | null>(null);

type Props = {
  children: React.ReactNode;
  isSettingsDialogModalOpen: boolean;
  setIsSettingsDialogModalOpen: React.Dispatch<
    React.SetStateAction<boolean>
  >;
};

function SettingsDialogModalProvider({ children, isSettingsDialogModalOpen, setIsSettingsDialogModalOpen }: Props) {
  return (
    <SettingsDialogModalContext.Provider value={{isOpen: isSettingsDialogModalOpen, setIsOpen: setIsSettingsDialogModalOpen}}>
      {children}
    </SettingsDialogModalContext.Provider>
  );
}

export default SettingsDialogModalProvider;
