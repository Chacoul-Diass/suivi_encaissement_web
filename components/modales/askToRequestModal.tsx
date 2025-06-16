import React, { Fragment } from "react";
import IconMail from "../icon/icon-mail";
import { Dialog, Transition } from "@headlessui/react";
import ReactQuill from "react-quill";
import ImageUploading from "react-images-uploading";
import IconPaperclip from "../icon/icon-paperclip";
import IconX from "../icon/icon-x";
import { useDispatch } from "react-redux";
import { TAppDispatch } from "@/store";
import { submitEncaissementValidation } from "@/store/reducers/encaissements/soumission.slice";
import { EStatutEncaissement } from "@/utils/enums";
import { toast } from "react-hot-toast";
import { handleApiError } from "@/utils/apiErrorHandler";
import Swal from "sweetalert2";

interface ValidationPayload {
  encaissementId: number;
  statutValidation: EStatutEncaissement;
  observationReclamation: string;
  files?: File[];
}

interface AskToRequestModalProps {
  askToRequestModalOpen: boolean;
  setAskToRequestModalOpen: (open: boolean) => void;
  handleAskToRequest: () => void;
  observationReclamation: string;
  setObservationReclamation: (value: string) => void;
  params: any;
  setParams: (p: any) => void;
  setImages2: (images: any[]) => void;
  images2: any[];
  onChange2: (imageList: any[], addUpdateIndex: number[] | undefined) => void;
  selectedRow: any;
  refreshTableData: (showToast?: boolean) => Promise<void>;
  setModalOpen: (open: boolean) => void;
}

const AskToRequestModal = ({
  askToRequestModalOpen,
  setAskToRequestModalOpen,
  handleAskToRequest,
  observationReclamation,
  setObservationReclamation,
  params,
  setImages2,
  images2,
  onChange2,
  selectedRow,
  refreshTableData,
  setModalOpen,
}: AskToRequestModalProps) => {
  const dispatch = useDispatch<TAppDispatch>();
  const maxNumber = 69;

  const handleSubmitReclamation = async () => {
    try {
      if (!selectedRow?.id) {
        toast.error("Aucun encaissement sélectionné");
        return;
      }

      // Préparation du payload
      const payload: ValidationPayload = {
        encaissementId: selectedRow.id,
        statutValidation: EStatutEncaissement.TRAITE,
        observationReclamation: observationReclamation,
      };

      // Ajout des fichiers s'ils existent
      if (images2 && images2.length > 0) {
        const files = images2
          .filter((image: { file?: File; dataURL?: string }) => image.file)
          .map((image: { file?: File; dataURL?: string }) => image.file as File);
        payload.files = files;
      }

      // Envoi de la requête
      const response = await dispatch(submitEncaissementValidation(payload)).unwrap();

      // Si la réponse existe, c'est un succès
      if (response) {
        const swalWithBootstrapButtons = Swal.mixin({
          customClass: {
            confirmButton: "btn btn-primary",
            cancelButton: "btn btn-dark ltr:mr-3 rtl:ml-3",
            popup: "sweet-alerts",
          },
          buttonsStyling: false,
        });

        await swalWithBootstrapButtons.fire(
          "Traité",
          "L'encaissement a été traité avec succès. La réclamation a été résolue.",
          "success"
        );

        // Fermer toutes les modales
        setAskToRequestModalOpen(false);
        setModalOpen(false);

        // Réinitialisation des états
        setObservationReclamation("");
        setImages2([]);
        if (params?.setParams) {
          params.setParams({
            toEmails: [],
            ccEmails: [],
            description: "",
            displayDescription: "",
          });
        }

        setTimeout(() => {
          // Méthode 1: Utiliser le prop fetchData (refreshTableData)
          if (refreshTableData) {
            refreshTableData();
          }

          // Méthode 2: Utiliser window.fetchData global
          if (
            typeof window !== "undefined" &&
            (window as any).fetchData
          ) {
            (window as any).fetchData();
          }
          // Méthode 3: Forcer un rafraîchissement de la page si rien d'autre ne fonctionne
          // Cette méthode est plus drastique mais garantit la mise à jour
          if (
            !refreshTableData &&
            (typeof window === "undefined" ||
              !(window as any).refreshTableData)
          ) {
            if (typeof window !== "undefined") {
              window.location.reload();
            }
          }
        }, 800);
      }
    } catch (error) {
      const errorMessage = handleApiError(error);
      toast.error(errorMessage);
    }
  };

  return (
    <Transition appear show={askToRequestModalOpen} as={Fragment}>
      <Dialog
        as="div"
        open={askToRequestModalOpen}
        className={"fixed inset-0 z-[1050] bg-black/30 backdrop-blur-sm"}
        onClose={() => setAskToRequestModalOpen(false)}
      >
        <div className="fixed inset-0 z-[1050] overflow-y-auto bg-[black]/60">
          <div className="flex min-h-screen items-start justify-center px-4">
            <Dialog.Panel className="panel my-8 w-full max-w-4xl overflow-hidden rounded-xl bg-white shadow-lg dark:bg-gray-800">
              {/* Header */}
              <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <IconMail className="h-5 w-5 text-primary" />
                    <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                      Réponse Réclamation
                    </h1>
                  </div>
                  <button
                    onClick={() => setAskToRequestModalOpen(false)}
                    className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <IconX className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div className="px-6 py-6">
                {/* Message Editor */}
                <div className="mb-8 rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
                  <div className="border-b border-gray-200 px-4 py-3 dark:border-gray-700">
                    <div className="flex items-center gap-2">
                      <svg
                        className="h-4 w-4 text-gray-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                        Message
                      </h3>
                    </div>
                  </div>
                  <div className="p-4">
                    <ReactQuill
                      theme="snow"
                      value={observationReclamation}
                      onChange={(content) => setObservationReclamation(content)}
                      className="min-h-[200px] text-black"
                    />
                  </div>
                </div>

                {/* File Upload */}
                <div className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
                  <div className="border-b border-gray-200 px-4 py-3 dark:border-gray-700">
                    <div className="flex items-center gap-2">
                      <IconPaperclip className="h-4 w-4 text-gray-500" />
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                        Documents justificatifs
                      </h3>
                    </div>
                  </div>
                  <div className="p-4">
                    <ImageUploading
                      multiple
                      value={images2}
                      onChange={onChange2}
                      maxNumber={maxNumber}
                    >
                      {({
                        imageList,
                        onImageUpload,
                        onImageRemoveAll,
                        onImageUpdate,
                        onImageRemove,
                        isDragging,
                        dragProps,
                      }) => (
                        <div className="upload__image-wrapper">
                          <button
                            className="mb-4 flex w-full items-center justify-center gap-3 rounded-lg border border-dashed border-gray-300 bg-white px-4 py-6 text-gray-500 transition-colors hover:border-gray-400 hover:text-gray-600 dark:border-gray-600 dark:bg-gray-800 dark:hover:border-gray-500"
                            onClick={onImageUpload}
                            {...dragProps}
                          >
                            <IconPaperclip className="h-5 w-5" />
                            <span className="text-sm">
                              Cliquez ou glissez-déposez vos documents ici
                            </span>
                          </button>

                          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                            {imageList.map((image, index) => (
                              <div
                                key={index}
                                className="group relative overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800"
                              >
                                <button
                                  onClick={() => onImageRemove(index)}
                                  className="absolute right-2 top-2 z-10 rounded-lg bg-white/90 p-1 text-gray-400 opacity-0 transition-opacity hover:text-gray-500 group-hover:opacity-100 dark:bg-gray-800/90"
                                >
                                  <IconX className="h-4 w-4" />
                                </button>
                                <img
                                  src={image.dataURL}
                                  alt={`Document ${index + 1}`}
                                  className="aspect-[4/3] w-full object-cover"
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </ImageUploading>
                    {images2.length === 0 && (
                      <div className="flex flex-col items-center justify-center py-6 text-gray-400">
                        <img
                          src="/assets/images/file-preview.svg"
                          className="mb-3 w-24 opacity-50"
                          alt="Aucun document"
                        />
                        <p className="text-sm">Aucun document sélectionné</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-3 border-t border-gray-200 bg-gray-50 px-6 py-4 dark:border-gray-700 dark:bg-gray-900">
                <button
                  type="button"
                  onClick={() => setAskToRequestModalOpen(false)}
                  className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
                >
                  <IconX className="h-4 w-4" />
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={handleSubmitReclamation}
                  className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:bg-primary/90 hover:shadow-md active:scale-95"
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M13 5l7 7-7 7M5 5l7 7-7 7"
                    />
                  </svg>
                  Envoyer la réponse
                </button>
              </div>
            </Dialog.Panel>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default AskToRequestModal;
