import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { SetStateAction, Dispatch } from "react";
import type { NotificationsModalDialogType } from "@/interfaces/notifications-modal-dialog-type";

type saveSett = () => void;

type Props = {
  openModal: boolean;
  closeModal: Dispatch<SetStateAction<boolean>>;
  saveSettings: saveSett;
  title?: string;
  notification?: string;
  notificationType?: NotificationsModalDialogType;
  textButton?: string;
};

function SettingsDialogModal({
  openModal,
  closeModal,
  saveSettings,
  title = "Ustawienia...",
  notification = "",
  notificationType = "OK",
  textButton = "Anuluj",
}: Props) {
  const modalTypeVariants = {
    Alert:
      "bg-red-100 text-red-900 hover:bg-red-200 focus-visible:ring-red-500",
    Warning:
      "bg-orange-100 text-orange-900 hover:bg-orange-200 focus-visible:ring-orange-500",
    OK: "bg-green-100 text-green-900 hover:bg-green-200 focus-visible:ring-green-500",
    Info: "bg-blue-100 text-blue-900 hover:bg-blue-200 focus-visible:ring-blue-500",
  };

  return (
    <Dialog
      open={openModal}
      as="div"
      className="fixed inset-0 flex w-screen items-center justify-center bg-black/30 p-4 transition duration-300 ease-out data-[closed]:opacity-0 z-10"
      onClose={closeModal}
      transition
    >
      <div className="fixed inset-0 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4 text-center">
          <DialogPanel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
            <DialogTitle
              as="h3"
              className="text-lg font-medium leading-6 text-gray-900"
            >
              {title}
            </DialogTitle>
            <div className="mt-2">
              <p
                dangerouslySetInnerHTML={{ __html: notification }}
                className="text-sm text-gray-500"
              />
            </div>
            <div className="mt-4">
              <button
                type="button"
                className={`${modalTypeVariants[notificationType]} inline-flex justify-center rounded-md border border-transparent px-4 py-2 text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2`}
                onClick={() => saveSettings()}
              >
                {'Zapisz'}
              </button>
              <button
                type="button"
                className={`${modalTypeVariants[notificationType]} inline-flex justify-center rounded-md border border-transparent px-4 py-2 text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2`}
                onClick={() => closeModal(false)}
              >
                {textButton}
              </button>

            </div>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
}

export default SettingsDialogModal;
