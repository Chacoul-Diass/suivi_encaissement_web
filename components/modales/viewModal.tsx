"use client";

import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { TAppDispatch, TRootState } from "@/store";
import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css";
import IconX from "../icon/icon-x";
import IconBank from "../icon/icon-bank";
import IconCashBanknotes from "../icon/icon-cash-banknotes";
import IconPaperclip from "../icon/icon-paperclip";
import IconPackage from "../icon/icon-package";
import IconFileText from "../icon/icon-file-text";
import IconPencil from "../icon/icon-pencil";
import IconUser from "../icon/icon-user";
import { EStatutEncaissement } from "@/utils/enums";
import AskToRequestModal from "./askToRequestModal";
import { ImageListType } from "react-images-uploading";
import { toast } from "react-hot-toast";
import { submitEncaissementValidation } from "@/store/reducers/encaissements/soumission.slice";
import { handleApiError } from "@/utils/apiErrorHandler";
import { FaSpinner } from "react-icons/fa";

interface ViewModalProps {
  modalOpen: boolean;
  setModalOpen: (open: boolean) => void;
  refreshTableData: any;
  formatNumber: any;
  selectedRow: any;
  rasChecked1: any;
  handleRasChecked1Change: any;
  statutValidation: any;
  observationCaisse: any;
  setObservationCaisse: any;
  handleAmountChange: any;
  showAlertReclamation: any;
  showAlertCloture: any;
  showAlertDRDFC: any;
  rasChecked2: any;
  handleRasChecked2Change: any;
  observationBanque: any;
  setObservationBanque: any;
  showAlertRejete: any;
  showAlertValide: any;
  showAlertRetransmettre: any;
  today: any;
  setPreuvePhotoModal: any;
  handleSubmit: (updatedRow: any) => void;
  observationRejete: any;
  handleSendEmail: any;
  handleMultipleFileUpload: any;
  uploadedFiles: any;
  removeFile: any;
  params: any;
  setParams: any;
  handleOpenConfirmationModal: any;
  setPhotoDocuments: any;
  setImages2: (images: ImageListType) => void;
  images2: ImageListType;
  onChange2: (imageList: ImageListType) => void;
  observationReclamation: any;
  setObservationReclamation: any;

}

export default function ViewModal({
  modalOpen,
  setModalOpen,
  formatNumber,
  selectedRow,
  refreshTableData,
  rasChecked1,
  handleRasChecked1Change,
  statutValidation,
  observationCaisse,
  setObservationCaisse,
  handleAmountChange,
  showAlertReclamation,
  showAlertCloture,
  showAlertDRDFC,
  rasChecked2,
  handleRasChecked2Change,
  observationBanque,
  setObservationBanque,
  showAlertRejete,
  showAlertValide,
  showAlertRetransmettre,
  today,
  setPreuvePhotoModal,
  handleSendEmail,
  handleMultipleFileUpload,
  uploadedFiles,
  removeFile,
  params,
  setParams,
  observationRejete,
  handleOpenConfirmationModal,
  handleSubmit,
  setPhotoDocuments,
  setImages2,
  images2,
  onChange2,
  observationReclamation,
  setObservationReclamation,
}: ViewModalProps) {
  // Récupérer les informations de l'utilisateur connecté
  const user = useSelector((state: TRootState) => state.auth?.user);

  // Fonction pour vérifier si l'utilisateur est comptable
  const isComptable = () => {
    return user?.profile?.name === "COMPTABLE";
  };

  // Fonction pour vérifier si l'utilisateur peut modifier (niveaux différents)
  const canModify = () => {
    const userLevel = user?.profile?.level;
    const encaissementLevel = selectedRow?.level;

    console.log("🔍 === VÉRIFICATION DES NIVEAUX ===");
    console.log("👤 Utilisateur connecté:", {
      nom: `${user?.firstname} ${user?.lastname}`,
      profil: user?.profile?.name,
      level: userLevel
    });
    console.log("📄 Encaissement:", {
      id: selectedRow?.id,
      numeroBordereau: selectedRow?.numeroBordereau,
      level: encaissementLevel
    });
    console.log("⚖️ Comparaison des niveaux:", {
      userLevel,
      encaissementLevel,
      canModify: userLevel !== encaissementLevel
    });
    console.log("=====================================");

    return userLevel !== encaissementLevel;
  };
  const [askToRequestModalOpen, setAskToRequestModalOpen] = useState(false);
  const [isEditingMontantReleve, setIsEditingMontantReleve] = useState(false);
  const [editedMontantReleve, setEditedMontantReleve] = useState("");
  const [isMontantLoading, setIsMontantLoading] = useState(false);
  const dispatch = useDispatch<TAppDispatch>();

  useEffect(() => {
    if (!modalOpen) {
      setAskToRequestModalOpen(false);
    }
  }, [modalOpen]);

  const buttonsConfig = [
    {
      statut: 3,
      buttons: [
        {
          label: "Rejeter",
          className: "btn btn-danger w-full",
          onClick: () => showAlertRejete(selectedRow.id),
        },
        {
          label: "Valider",
          className: "btn btn-success w-full",
          onClick: () => showAlertDRDFC(selectedRow.id),
        },
        {
          label: "Preuve photo",
          className: "btn btn-primary w-full",
          onClick: () => {
            setPhotoDocuments(selectedRow.documents || []);
            setPreuvePhotoModal(true);
          },
        },
      ],
    },
    {
      statut: 2,
      buttons: [
        {
          label: "Rejeter",
          className: "btn btn-danger w-full",
          onClick: () => {
            showAlertRejete(selectedRow.id);
          },
        },
        {
          label: "Valider",
          className: "btn btn-success w-full",
          onClick: () => showAlertValide(selectedRow.id),
        },
        {
          label: "Preuve photo",
          className: "btn btn-primary w-full",
          onClick: () => {
            setPhotoDocuments(selectedRow.documents || []);
            setPreuvePhotoModal(true);
          },
        },
      ],
    },
    {
      statut: 1,
      buttons: [
        ...(canModify() ? [{
          label: "Retransmettre",
          className: "btn btn-success w-full",
          onClick: () => showAlertRetransmettre(selectedRow.id, selectedRow["Montant relevé (C)"] || selectedRow.montantReleve || 0),
        }] : []),
        {
          label: "Preuve photo",
          className: "btn btn-primary w-full",
          onClick: () => {
            setPhotoDocuments(selectedRow.documents || []);
            setPreuvePhotoModal(true);
          },
        },
      ],
    },
    {
      statut: EStatutEncaissement.RECLAMATION_TRAITES,
      buttons: [
        {
          label: "Rejeter",
          className: "btn btn-danger w-full",
          onClick: () => showAlertRejete(selectedRow.id),
        },
        {
          label: "Valider",
          className: "btn btn-success w-full",
          onClick: () => showAlertCloture(selectedRow.id),
        },
        {
          label: "Preuve photo",
          className: "btn btn-primary w-full",
          onClick: () => {
            setPhotoDocuments(selectedRow.documents || []);
            setPreuvePhotoModal(true);
          },
        },
      ],
    },
    {
      statut: EStatutEncaissement.RECLAMATION_REVERSES,
      buttons: [
        {
          label: "Répondre",
          className:
            "btn btn-success h-[50px] w-full border-none bg-success shadow-sm",
          onClick: () => setAskToRequestModalOpen(true),
          // onClick: handleSubmit,
        },
        {
          label: "Preuve photo",
          className: "btn btn-primary w-full",
          onClick: () => {
            setPhotoDocuments(selectedRow.documents || []);
            setPreuvePhotoModal(true);
          },
        },
      ],
    },

    {
      statut: EStatutEncaissement.DFC,
      buttons: [
        {
          label: "Cloturer",
          className: "btn btn-success w-full",
          onClick: () => showAlertCloture(selectedRow.id),
        },

        {
          label: "Rejeter",
          className: "btn btn-danger w-full",
          onClick: () => showAlertRejete(selectedRow.id),
        },

        {
          label: "Preuve photo",
          className: "btn btn-primary w-full",

          onClick: () => {
            setPhotoDocuments(selectedRow.documents || []);
            setPreuvePhotoModal(true);
          },
        },
      ],
    },
  ];

  const formatDateData = (dateString: string | null | undefined): string => {
    if (!dateString) return "N/A";

    try {
      let date;

      // Gérer le format DD/MM/YYYY
      if (dateString.includes("/")) {
        const [day, month, year] = dateString.split("/");
        date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      } else {
        date = new Date(dateString);
      }

      if (isNaN(date.getTime())) {
        console.error("Date invalide :", dateString);
        return "N/A";
      }

      const jours = [
        "dimanche",
        "lundi",
        "mardi",
        "mercredi",
        "jeudi",
        "vendredi",
        "samedi",
      ];
      const mois = [
        "janvier",
        "février",
        "mars",
        "avril",
        "mai",
        "juin",
        "juillet",
        "août",
        "septembre",
        "octobre",
        "novembre",
        "décembre",
      ];

      const jourSemaine = jours[date.getDay()];
      const jour = date.getDate();
      const moisTexte = mois[date.getMonth()];
      const annee = date.getFullYear();

      return `${jourSemaine} ${jour} ${moisTexte} ${annee}`;
    } catch (error) {
      console.error("Erreur lors du formatage de la date :", error);
      return "N/A";
    }
  };

  const calculateEcart = () => {
    const montantB =
      selectedRow["Montant caisse (A)"] ||
      selectedRow.montantRestitutionCaisse ||
      0;
    const montantC =
      selectedRow["Montant relevé (C)"] ||
      selectedRow.montantReleve ||
      selectedRow.validationEncaissement?.montantReleve ||
      0;

    return montantB - montantC;
  };

  console.log(selectedRow["Montant revelé"]);

  // Fonction pour nettoyer le HTML
  const stripHtml = (html: string) => {
    const doc = new DOMParser().parseFromString(html, "text/html");
    return doc.body.textContent || "";
  };

  // Fonction pour gérer le changement d'images


  const handleMontantReleveChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "");
    setEditedMontantReleve(value);
  };

  const handleMontantReleveSubmit = () => {
    if (!editedMontantReleve) return;
    setIsMontantLoading(true);
    const payload = {
      encaissementId: selectedRow.id,
      montantReleve: parseInt(editedMontantReleve),
      statutValidation: EStatutEncaissement.REJETE,
    };

    dispatch(submitEncaissementValidation(payload))
      .unwrap()
      .then((response) => {
        // Mettre à jour l'état local avec le nouveau montant
        const updatedRow = {
          ...selectedRow,
          "Montant relevé (C)": parseInt(editedMontantReleve),
          montantReleve: parseInt(editedMontantReleve),
          validationEncaissement: {
            ...selectedRow.validationEncaissement,
            montantReleve: parseInt(editedMontantReleve)
          }
        };
        Object.assign(selectedRow, updatedRow);
        toast.success("Montant relevé modifié avec succès");
        setIsEditingMontantReleve(false);
        setEditedMontantReleve("");
        setIsMontantLoading(false);
      })
      .catch((error) => {
        const errorMessage = handleApiError(error);
        toast.error(errorMessage);
        setIsMontantLoading(false);
      });
  };

  return (
    <>
      {" "}
      <div>
        <div
          className={`fixed inset-0 z-50 bg-black/30 backdrop-blur-sm transition-opacity duration-300 ${modalOpen ? "opacity-100" : "pointer-events-none opacity-0"
            }`}
          onClick={handleOpenConfirmationModal}
        />
        <div
          className={`fixed bottom-0 right-0 top-0 z-[51] w-full max-w-[600px] transform bg-white shadow-xl transition-transform duration-300 dark:bg-gray-800 ${modalOpen ? "translate-x-0" : "translate-x-full"
            }`}
        >
          <div className="flex h-full flex-col">
            {/* Header */}
            <div className="border-b border-gray-200 p-6 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Visualisation de l'encaissement{" "}
                    <span className="font-bold text-primary">
                      {statutValidation === EStatutEncaissement.EN_ATTENTE &&
                        "chargé"}
                      {statutValidation === EStatutEncaissement.TRAITE &&
                        "vérifié"}
                      {statutValidation === EStatutEncaissement.REJETE &&
                        "rejeté"}
                      {statutValidation === EStatutEncaissement.VALIDE &&
                        "validé"}
                      {statutValidation === EStatutEncaissement.DFC && "traité"}
                      {statutValidation ===
                        EStatutEncaissement.RECLAMATION_REVERSES &&
                        "en réclamation"}
                      {statutValidation ===
                        EStatutEncaissement.RECLAMATION_TRAITES &&
                        "en réclamation traité"}
                      {statutValidation === EStatutEncaissement.CLOTURE &&
                        "clôturé"}
                    </span>{" "}
                    du{" "}
                    <span>
                      {formatDateData(selectedRow["Date Validation"])}
                    </span>
                  </h2>
                  <div className="mt-4 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="group transform rounded-lg bg-white p-3 shadow-sm transition-all duration-200 hover:shadow-md dark:bg-gray-800">
                        <div className="flex items-start gap-3">
                          <div className="shrink-0 rounded-full bg-primary/20 p-2">
                            <IconBank className="h-5 w-5 text-primary" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                              Banque
                            </p>
                            <p className="break-words text-sm font-semibold text-primary">
                              {selectedRow.banque}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="group transform rounded-lg bg-white p-3 shadow-sm transition-all duration-200 hover:shadow-md dark:bg-gray-800">
                        <div className="flex items-start gap-3">
                          <div className="shrink-0 rounded-full bg-primary/20 p-2">
                            <IconUser className="h-5 w-5 text-primary" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                              Matricule Caissière
                            </p>
                            <p className="break-words text-sm font-semibold text-primary">
                              {(selectedRow as any).matriculeCaissiere || (selectedRow as any).matricule || (selectedRow as any).caissiere || "N/A"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="group transform rounded-lg bg-white p-3 shadow-sm transition-all duration-200 hover:shadow-md dark:bg-gray-800">
                        <div className="flex items-start gap-3">
                          <div className="shrink-0 rounded-full bg-primary/20 p-2">
                            <IconPackage className="h-5 w-5 text-primary" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                              Produit
                            </p>
                            <p className="break-words text-sm font-semibold text-primary">
                              {selectedRow.Produit}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="group transform rounded-lg bg-white p-3 shadow-sm transition-all duration-200 hover:shadow-md dark:bg-gray-800">
                        <div className="flex items-start gap-3">
                          <div className="shrink-0 rounded-full bg-primary/20 p-2">
                            <IconFileText className="h-5 w-5 text-primary" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                              N° Bordereau
                            </p>
                            <p className="break-words text-sm font-semibold text-primary">
                              {selectedRow.numeroBordereau}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                    Vous permet de voir vos encaissements terminés.
                  </p>
                </div>
                <button
                  type="button"
                  className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-500 dark:hover:bg-gray-700"
                  onClick={handleOpenConfirmationModal}
                >
                  <IconX className="h-6 w-6" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 space-y-6 overflow-y-auto p-6">
              {statutValidation === EStatutEncaissement.REJETE ||
                statutValidation === EStatutEncaissement.RECLAMATION_REVERSES ||
                (selectedRow["Observation rejet"] &&
                  selectedRow["Observation rejet"].trim() !== "") ? (
                <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-700 dark:bg-red-900/50">
                  <div className="flex flex-col gap-2">
                    <h3 className="font-semibold text-red-900 dark:text-red-200">
                      Cause du rejet
                    </h3>
                    <p className="text-sm text-red-800 dark:text-red-200">
                      {selectedRow.observationRejete}
                    </p>
                    <p className="text-sm text-red-700 dark:text-red-300">
                      {selectedRow["Observation réclamation"]}
                    </p>
                  </div>
                </div>
              ) : null}

              {(statutValidation === EStatutEncaissement.RECLAMATION_TRAITES ||
                statutValidation ===
                EStatutEncaissement.RECLAMATION_REVERSES) &&
                selectedRow.observationReclamation &&
                selectedRow.observationReclamation.trim() !== "" ? (
                <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-700 dark:bg-blue-900/50">
                  <div className="flex flex-col gap-2">
                    <h3 className="font-semibold text-blue-900 dark:text-blue-200">
                      Observation Réclamation
                    </h3>
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      {selectedRow.observationReclamation}
                    </p>
                  </div>
                </div>
              ) : null}

              {/* Montants Section */}
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900">
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                    Date d'encaissement du <span className="font-semibold">{selectedRow["Date Encais"]}</span>
                  </h3>
                  <p className="mt-1 text-xs text-gray-500">
                    Détail des montants
                  </p>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {formatNumber(selectedRow["Montant caisse (A)"])} F CFA
                    </p>
                    <p className="text-sm text-gray-500">Montant Caisse</p>
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {formatNumber(selectedRow["Montant bordereau (B)"])} F CFA
                    </p>
                    <p className="text-sm text-gray-500">Montant Cloturé</p>
                  </div>
                  <div>
                    <p
                      className={`text-lg font-semibold ${selectedRow["Montant caisse (A)"] -
                        selectedRow["Montant bordereau (B)"] <
                        0
                        ? "text-green-500"
                        : selectedRow["Montant caisse (A)"] -
                          selectedRow["Montant bordereau (B)"] >
                          0
                          ? "text-red-500"
                          : "text-gray-900 dark:text-white"
                        }`}
                    >
                      {formatNumber(
                        selectedRow["Montant caisse (A)"] -
                        selectedRow["Montant bordereau (B)"]
                      )}{" "}
                      F CFA
                    </p>
                    <p className="text-sm text-gray-500">Écart (A-B)</p>
                  </div>
                </div>
              </div>

              {/* Observation Caisse */}
              {statutValidation ===
                EStatutEncaissement.RECLAMATION_REVERSES ? null : (
                <div className="space-y-4 rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                        Observation Caisse
                      </h3>
                      <p className="mt-1 text-xs text-gray-500">
                        Observation sur l'écart entre les montants
                      </p>
                    </div>
                  </div>
                  <textarea
                    className="w-full rounded-lg border border-gray-200 bg-white p-3 text-sm text-gray-900 focus:border-primary focus:ring-primary dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                    rows={4}
                    placeholder="Saisir votre observation ici"
                    disabled={statutValidation !== 1 || !canModify()}
                    value={observationCaisse}
                    onChange={(e) => setObservationCaisse(e.target.value)}
                  />
                </div>
              )}

              {/* Image Upload */}
              {statutValidation === EStatutEncaissement.REJETE && canModify() && (
                <div className="space-y-4 rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                        Importer le coupon
                      </h3>
                      <p className="mt-1 text-xs text-gray-500">
                        Format accepté: Images (JPG, PNG, GIF) et PDF - Max 10 fichiers, 5 Mo par fichier
                      </p>
                    </div>
                    {images2.length > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          setImages2([]);
                          toast.success('Tous les fichiers ont été supprimés');
                        }}
                        className="text-sm text-red-500 hover:text-red-600"
                      >
                        Supprimer tout
                      </button>
                    )}
                  </div>

                  <div className="space-y-4">
                    {/* Input file caché */}
                    <input
                      type="file"
                      id="file-upload"
                      multiple
                      accept="image/*,.pdf,application/pdf"
                      className="hidden"
                      disabled={images2.length >= 10}
                      onChange={(e) => {
                        const files = Array.from(e.target.files || []);

                        // Vérifier le nombre total de fichiers
                        if (images2.length + files.length > 10) {
                          toast.error(`Vous ne pouvez pas ajouter plus de 10 fichiers au total. Vous avez déjà ${images2.length} fichier(s).`);
                          e.target.value = '';
                          return;
                        }

                        // Vérifier la taille de chaque fichier (5 Mo = 5 * 1024 * 1024 bytes)
                        const maxSize = 5 * 1024 * 1024; // 5 Mo en bytes
                        const oversizedFiles = files.filter(file => file.size > maxSize);

                        if (oversizedFiles.length > 0) {
                          const fileNames = oversizedFiles.map(f => f.name).join(', ');
                          toast.error(`Les fichiers suivants dépassent 5 Mo : ${fileNames}`);
                          e.target.value = '';
                          return;
                        }

                        const newImages = files.map((file) => ({
                          file,
                          dataURL: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined
                        }));

                        setImages2([...images2, ...newImages]);
                        toast.success(`${files.length} fichier(s) ajouté(s) avec succès`);
                        e.target.value = ''; // Réinitialiser l'input
                      }}
                    />

                    {/* Bouton d'upload stylisé */}
                    <label
                      htmlFor="file-upload"
                      className={`flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed p-4 transition-colors ${images2.length >= 10
                        ? 'border-gray-200 bg-gray-100 cursor-not-allowed dark:border-gray-700 dark:bg-gray-800'
                        : 'border-gray-300 hover:border-primary dark:border-gray-600 dark:hover:border-primary'
                        }`}
                    >
                      <IconPaperclip className={`h-5 w-5 ${images2.length >= 10 ? 'text-gray-300' : 'text-gray-400'}`} />
                      <span className={`text-sm ${images2.length >= 10 ? 'text-gray-400' : 'text-gray-600 dark:text-gray-300'}`}>
                        {images2.length >= 10
                          ? 'Limite de 10 fichiers atteinte'
                          : `Cliquez pour sélectionner vos fichiers (${10 - images2.length} restant(s))`
                        }
                      </span>
                    </label>

                    {/* Affichage des fichiers sélectionnés */}
                    {images2.length > 0 && (
                      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                        {images2.map((image, index) => (
                          <div
                            key={index}
                            className="group relative aspect-square overflow-hidden rounded-lg border border-gray-200 dark:border-gray-600"
                          >
                            {image.file?.type === "application/pdf" ? (
                              <div className="flex h-full w-full items-center justify-center bg-gray-50 dark:bg-gray-800">
                                <div className="text-center">
                                  <svg className="mx-auto h-8 w-8 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                                  </svg>
                                  <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">PDF</p>
                                  <p className="text-xs text-gray-500 dark:text-gray-500 truncate px-2">{image.file?.name}</p>
                                </div>
                              </div>
                            ) : (
                              <img
                                src={image.dataURL}
                                alt={`Fichier ${index + 1}`}
                                className="h-full w-full object-cover"
                              />
                            )}
                            <button
                              type="button"
                              onClick={() => {
                                const newImages = images2.filter((_, i) => i !== index);
                                setImages2(newImages);
                                toast.success('Fichier supprimé');
                              }}
                              className="absolute right-2 top-2 rounded-full bg-white/80 p-1 opacity-0 transition-opacity group-hover:opacity-100 dark:bg-black/80"
                            >
                              <IconX className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Détails Bancaires (B-C) */}
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900">
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                    Détails bancaires
                  </h3>
                  <p className="mt-1 text-xs text-gray-500">
                    Comparaison des montants Banque
                  </p>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {formatNumber(
                        selectedRow["Montant caisse (A)"] ||
                        selectedRow.montantRestitutionCaisse ||
                        0
                      )}{" "}
                      F CFA
                    </p>
                    <p className="text-sm text-gray-500">Montant caisse</p>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-lg font-semibold text-gray-900 dark:text-white">
                            {formatNumber(
                              selectedRow["Montant relevé (C)"] ||
                              selectedRow.montantReleve ||
                              selectedRow.validationEncaissement?.montantReleve ||
                              0
                            )}{" "}
                            F CFA
                          </p>
                          {statutValidation === EStatutEncaissement.REJETE && !isEditingMontantReleve && isComptable() && canModify() && (
                            <Tippy content="Modifier le montant relevé">
                              <button
                                type="button"
                                onClick={() => {
                                  setIsEditingMontantReleve(true);
                                  setEditedMontantReleve(
                                    (selectedRow["Montant relevé (C)"] ||
                                      selectedRow.montantReleve ||
                                      selectedRow.validationEncaissement?.montantReleve ||
                                      0).toString()
                                  );
                                }}
                                className="ml-1 rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-500 dark:hover:bg-gray-700"
                              >
                                <IconPencil className="h-4 w-4" />
                              </button>
                            </Tippy>
                          )}
                        </div>
                        <p className="text-sm text-gray-500">Montant relevé bancaire</p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <p
                      className={`text-lg font-semibold ${calculateEcart() < 0
                        ? "text-green-500"
                        : calculateEcart() > 0
                          ? "text-red-500"
                          : "text-gray-900 dark:text-white"
                        }`}
                    >
                      {formatNumber(calculateEcart())} F CFA
                    </p>
                    <p className="text-sm text-gray-500">Écart (A-C)</p>
                  </div>
                </div>
              </div>

              {/* Section édition du montant relevé en bas de la modale */}
              {isEditingMontantReleve && isComptable() && canModify() && (
                <div className="w-full bg-gray-50 dark:bg-gray-800 rounded-lg shadow flex flex-col gap-4 mt-8 p-6 border-t border-gray-200 dark:border-gray-700">
                  <label className="text-sm font-medium text-gray-900 dark:text-white text-left w-full mb-2">Modifier le montant relevé</label>
                  <div className="relative w-full flex items-center gap-2">
                    <input
                      type="text"
                      value={editedMontantReleve}
                      onChange={handleMontantReleveChange}
                      className="form-input w-full rounded-lg border-gray-300 bg-white py-3 pl-10 pr-4 text-gray-900 focus:border-primary focus:ring-primary dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                      placeholder="Montant"
                      disabled={isMontantLoading}
                    />
                    <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">
                      <IconCashBanknotes className="h-5 w-5 text-gray-400" />
                    </div>
                    {isMontantLoading && (
                      <FaSpinner className="animate-spin text-primary text-lg ml-2" />
                    )}
                    <button
                      onClick={handleMontantReleveSubmit}
                      className="rounded-lg bg-primary px-3 py-2 text-sm text-white hover:bg-primary/90 ml-2"
                      disabled={isMontantLoading}
                    >
                      ✓
                    </button>
                    <button
                      onClick={() => {
                        setIsEditingMontantReleve(false);
                        setEditedMontantReleve("");
                      }}
                      className="rounded-lg bg-gray-200 px-3 py-2 text-sm text-gray-600 hover:bg-gray-300 ml-2"
                      disabled={isMontantLoading}
                    >
                      ✕
                    </button>
                  </div>
                </div>
              )}

              {/* Observation Banque */}
              {statutValidation ===
                EStatutEncaissement.RECLAMATION_REVERSES ? null : (
                <div className="space-y-4 rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                        Observation Banque
                      </h3>
                      <p className="mt-1 text-xs text-gray-500">
                        Observation sur l'écart avec la banque
                      </p>
                    </div>
                  </div>
                  <textarea
                    className="w-full rounded-lg border border-gray-200 bg-white p-3 text-sm text-gray-900 focus:border-primary focus:ring-primary dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                    rows={4}
                    placeholder="Saisir votre observation ici"
                    disabled={statutValidation !== 1 || !canModify()}
                    value={observationBanque}
                    onChange={(e) => setObservationBanque(e.target.value)}
                  />
                </div>
              )}


            </div>

            {/* Footer avec boutons fixes */}
            <div className="border-t border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
              <div className="flex justify-end gap-2">
                {buttonsConfig
                  .filter(({ statut }) => statutValidation === statut)
                  .flatMap(({ buttons }) => buttons)
                  .map(({ label, className, onClick }: any, index) => (
                    <button
                      key={index}
                      type="button"
                      className={`${className} transform rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2`}
                      onClick={onClick}
                    >
                      {label}
                    </button>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      {modalOpen && askToRequestModalOpen && (
        <AskToRequestModal
          askToRequestModalOpen={askToRequestModalOpen}
          setAskToRequestModalOpen={setAskToRequestModalOpen}
          handleAskToRequest={handleSendEmail}
          params={params}
          setParams={setParams}
          setImages2={setImages2}
          images2={images2}
          onChange2={onChange2}
          observationReclamation={observationReclamation}
          setObservationReclamation={setObservationReclamation}
          selectedRow={selectedRow}
          refreshTableData={refreshTableData}
          setModalOpen={setModalOpen}
        />
      )}
    </>
  );
}
