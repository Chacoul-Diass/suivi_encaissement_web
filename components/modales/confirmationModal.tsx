import { Dialog, Transition } from "@headlessui/react";
import React, { Fragment } from "react";
import IconWarning from "../icon/icon-warning";

interface ConfirmationModalProps {
  showConfirm: any;
  cancelCloseModal: any;
  confirmCloseModal: any;
}

export default function ConfirmationModal({
  showConfirm,
  cancelCloseModal,
  confirmCloseModal,
}: ConfirmationModalProps) {
  return (
    <div>
      {/* Modale de confirmation */}
      <Transition appear show={showConfirm} as={Fragment}>
        <Dialog
          as="div"
          open={showConfirm}
          onClose={cancelCloseModal}
          className="fixed inset-0 z-[999] overflow-y-auto"
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-xl transform overflow-hidden rounded-lg bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <div className="mb-4 flex w-full items-center justify-center">
                    <IconWarning />
                  </div>
                  <Dialog.Title
                    as="h3"
                    className="text-center text-xl font-medium leading-6 text-primary"
                  >
                    Alerte !
                  </Dialog.Title>
                  <div className="mt-4 text-center">
                    <p className="text-xl text-black">
                      Êtes-vous sûr de vouloir fermer cette fenêtre ? Les
                      modifications non enregistrées seront perdues.
                    </p>
                  </div>
                  <div className="mt-6 flex justify-center gap-4">
                    <button
                      type="button"
                      className="w-[100px] border-none rounded-md bg-gray-200 text-black"
                      onClick={cancelCloseModal}
                    >
                      Annuler
                    </button>
                    <button
                      type="button"
                      className="btn border-none bg-primary text-white"
                      onClick={confirmCloseModal}
                    >
                      Confirmer
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
}
