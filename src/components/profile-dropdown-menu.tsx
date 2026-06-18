import { Menu, MenuButton, MenuItem, MenuItems, MenuSeparator } from "@headlessui/react";
import useContextAndErrorIfNull from "../hooks/useContextAndErrorIfNull";
import { InitDataContext } from "./init-data-provider";
import { SettingsDialogModalContext } from "./settings-dialog-modal-provider";
import useDashboardMode from "../hooks/useDashboardMode";

export default function ProfileDropdownMenu() {
  const { initData } = useContextAndErrorIfNull(InitDataContext);
  const { setIsOpen } = useContextAndErrorIfNull(
    SettingsDialogModalContext
  );
  
  const dbMode = useDashboardMode(1536);
  
  const openSettingsDM = () => {
    setIsOpen(true);
  };

  const logout = () => {
    window.open("https://www.google.com/accounts/Logout", "_top");
  };

  return (
    <>
      <Menu as="div" className="relative self-center">
        <div>
          <MenuButton className="relative flex rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-newdecat-500">
            <span className="absolute -inset-1.5" />
            <span className="sr-only">Open user menu</span>
            <img alt="" src={initData?.pic} className="size-8 rounded-full" />
          </MenuButton>
        </div>
        <MenuItems
          transition
          className="absolute right-0 z-20 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black/5 transition focus:outline-none data-[closed]:scale-95 data-[closed]:transform data-[closed]:opacity-0 data-[enter]:duration-100 data-[leave]:duration-75 data-[enter]:ease-out data-[leave]:ease-in"
        >
          {!dbMode && (
            <>
              <MenuItem>
                <button
                  onClick={openSettingsDM}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 data-[focus]:bg-gray-100 data-[focus]:outline-none"
                >
                  Ustawienia...
                </button>
              </MenuItem>
              <MenuSeparator className="my-1 h-px bg-gray-100" />
            </>
          )}
          <MenuItem>
            <button
              onClick={logout}
              className="block w-full text-left px-4 py-2 text-sm text-gray-700 data-[focus]:bg-gray-100 data-[focus]:outline-none"
            >
              Wyloguj się
            </button>
          </MenuItem>
        </MenuItems>
      </Menu>
    </>
  );
}
