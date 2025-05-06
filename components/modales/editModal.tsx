"use client";

import React, { useState, useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { TAppDispatch } from "@/store";
import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css";
import IconX from "../icon/icon-x";
import IconBank from "../icon/icon-bank";
import IconCashBanknotes from "../icon/icon-cash-banknotes";
import IconPaperclip from "../icon/icon-paperclip";
import IconPackage from "../icon/icon-package";
import IconFileText from "../icon/icon-file-text";
import ImageUploading, { ImageListType } from "react-images-uploading";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import axios from "axios";
import { API_AUTH_SUIVI } from "@/config/constants";
import axiosInstance from "@/utils/axios";
import { Toastify } from "@/utils/toast";
import { toast } from "react-toastify";

interface EditModalProps {
  setModalOpen: (open: boolean) => void;
  modalOpen: boolean;
  selectedRow: {
    id?: number;
    "Montant caisse (A)": number;
    "Montant bordereau (B)": number;
    "Montant revelé (C)"?: number;
    "Date cloture": string;
    banque: string;
    Produit: string;
    numeroBordereau: any;
    montantReleve?: number;
    validationEncaissement?: {
      montantReleve: number;
    };
    isCorrect?: number;
  };
  handleSubmit: (updatedRow: any) => void;
  today: string;
  formatNumber: (num: number) => string;
  observationCaisse: string;
  setObservationCaisse: (obs: string) => void;
  observationBanque: string;
  setObservationBanque: (obs: string) => void;
  rasChecked1: boolean;
  handleRasChecked1Change: () => void;
  rasChecked2: boolean;
  handleRasChecked2Change: () => void;
  images2: ImageListType;
  setImages2: (images: ImageListType) => void;
  onChange2: (imageList: ImageListType) => void;
  handleMontantChange: (value: any) => void;
  fetchData?: () => void;
}

// Composant pour le cas validé
const ValidatedAmount: React.FC<{
  montantReleve: number;
  formatNumber: (num: number) => string;
}> = ({ montantReleve, formatNumber }) => (
  <div className="relative">
    <div className="flex">
      <input
        type="text"
        className="form-input w-full cursor-not-allowed rounded-lg border-gray-300 bg-gray-100 py-3 pl-10 pr-4 text-gray-600 opacity-80 dark:border-gray-700 dark:bg-gray-700 dark:text-gray-400"
        placeholder="Montant en F CFA"
        value={formatNumber(montantReleve)}
        disabled={true}
      />
      <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">
        <IconCashBanknotes className="h-5 w-5 text-gray-400" />
      </div>
      <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
        <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800">
          <svg
            className="mr-1.5 h-2 w-2 text-green-400"
            fill="currentColor"
            viewBox="0 0 8 8"
          >
            <circle cx="4" cy="4" r="3" />
          </svg>
          Montant validé
        </span>
      </div>
    </div>
  </div>
);

// Composant pour le cas non validé
const UnvalidatedAmount: React.FC<{
  montantAuto: number;
  formatNumber: (num: number) => string;
  montantSaisi: string;
  onMontantSaisiChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onValidateClick: () => void;
}> = ({
  montantAuto,
  formatNumber,
  montantSaisi,
  onMontantSaisiChange,
  onValidateClick,
}) => (
    <div className="space-y-2">
      <div className="relative">
        <input
          type="text"
          className="form-input w-full cursor-not-allowed rounded-lg border-gray-300 bg-gray-100 py-3 pl-10 pr-4 text-gray-600 opacity-80 dark:border-gray-700 dark:bg-gray-700 dark:text-gray-400"
          placeholder="Montant automatique remonté"
          value={formatNumber(montantAuto)}
          disabled={true}
        />
        <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">
          <IconCashBanknotes className="h-5 w-5 text-gray-400" />
        </div>
      </div>

      <button
        type="button"
        onClick={onValidateClick}
        className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
      >
        Valider ce montant
      </button>
      <div className="relative">
        <input
          type="text"
          className="form-input w-full rounded-lg border-gray-300 bg-white py-3 pl-10 pr-4 text-gray-900 focus:border-primary focus:ring-primary dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          placeholder="Modifier le montant banque"
          value={montantSaisi}
          onChange={onMontantSaisiChange}
        />
        <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">
          <IconCashBanknotes className="h-5 w-5 text-gray-400" />
        </div>
      </div>

    </div>
  );

// Composant pour le cas sans montant
const NoAmount: React.FC<{
  montantSaisi: string;
  onMontantSaisiChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  formatNumber: (num: number) => string;
}> = ({ montantSaisi, onMontantSaisiChange, formatNumber }) => (
  <div className="space-y-2">
    {/* <div className="relative">
      <input
        type="text"
        className="form-input w-full cursor-not-allowed rounded-lg border-gray-300 bg-gray-100 py-3 pl-10 pr-4 text-gray-600 opacity-80 dark:border-gray-700 dark:bg-gray-700 dark:text-gray-400"
        placeholder="Montant automatique remonté"
        value={formatNumber(0)}
        disabled={true}
      />
      <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">
        <IconCashBanknotes className="h-5 w-5 text-gray-400" />
      </div>
    </div> */}
    <div className="relative">
      <input
        type="text"
        className="form-input w-full rounded-lg border-gray-300 bg-white py-3 pl-10 pr-4 text-gray-900 focus:border-primary focus:ring-primary dark:border-gray-700 dark:bg-gray-800 dark:text-white"
        placeholder="Modifier le montant banque"
        value={montantSaisi}
        onChange={onMontantSaisiChange}
      />
      <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">
        <IconCashBanknotes className="h-5 w-5 text-gray-400" />
      </div>
    </div>
  </div>
);

export default function EditModal({
  modalOpen,
  setModalOpen,
  selectedRow,
  handleSubmit,
  today,
  formatNumber,
  observationCaisse,
  setObservationCaisse,
  observationBanque,
  setObservationBanque,
  rasChecked1,
  handleRasChecked1Change,
  rasChecked2,
  handleRasChecked2Change,
  images2,
  setImages2,
  onChange2,
  handleMontantChange,
  fetchData,
}: EditModalProps) {
  const maxNumber = 69;
  // États pour le cas où un montant est déjà remonté
  const [montantAutomatique, setMontantAutomatique] = useState<string>("");
  const [montantAutomatiqueAffiche, setMontantAutomatiqueAffiche] =
    useState<string>("");
  // États pour le cas où aucun montant n'est remonté
  const [montantManuel, setMontantManuel] = useState<string>("");
  const [montantModifie, setMontantModifie] = useState<number | null>(null);

  const montantInputRef = useRef<HTMLInputElement>(null);
  const [dateMontantBanque, setDateMontantBanque] = useState<string>("");
  const [formError, setFormError] = useState("");
  const [validationModalOpen, setValidationModalOpen] = useState(false);
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
  const [newMontantSaisi, setNewMontantSaisi] = useState<string>("");
  const [newMontantAffiche, setNewMontantAffiche] = useState<string>("");
  const [newMontantError, setNewMontantError] = useState<string>("");
  const [isValidating, setIsValidating] = useState(false);
  const [loading, setLoading] = useState(false);

  // State et handler dédiés au deuxième input du cas NoAmount
  const [montantNoAuto, setMontantNoAuto] = useState("");
  const handleNoAutoInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value.replace(/\D/g, "");
    setMontantNoAuto(inputValue);
  };

  useEffect(() => {
    if (modalOpen) {
      const montantInitial = selectedRow.montantReleve || 0;
      console.log(
        "Montant initial:",
        montantInitial,
        typeof montantInitial,
        selectedRow.montantReleve
      );

      if (montantInitial > 0) {
        // Initialisation pour le cas automatique
        setMontantAutomatique(montantInitial.toString());
        setMontantAutomatiqueAffiche(formatNumber(montantInitial));
        setMontantModifie(montantInitial);
      } else {
        // Réinitialisation de tous les états
        setMontantAutomatique("");
        setMontantAutomatiqueAffiche("");
        setMontantManuel("");
        setMontantModifie(null);
      }
    }
  }, [modalOpen, selectedRow]);

  const handleCloseModal = () => {
    setModalOpen(false);
    // Vider le contenu de images2 lorsque la modale est fermée
    setImages2([]);
  };

  // Fonction pour le cas automatique - modification via modal
  const handleNewMontantInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const inputValue = e.target.value.replace(/[^\d]/g, ""); // Garde uniquement les chiffres
    if (inputValue === "") {
      setNewMontantSaisi("");
      setNewMontantAffiche("");
      return;
    }

    const numericValue = parseInt(inputValue);
    setNewMontantSaisi(numericValue.toString());
    setNewMontantAffiche(formatNumber(numericValue));
    setNewMontantError("");
  };

  // Fonction dédiée à l'input de modification du montant banque pour le cas NoAmount
  const handleMontantManuelChangeNoAuto = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const inputValue = e.target.value.replace(/\D/g, ""); // Garde uniquement les chiffres
    setMontantManuel(inputValue); // Toujours la valeur brute
    handleMontantChange(Number(inputValue) || 0);
  };

  const handleConfirmNewMontant = () => {
    if (!newMontantSaisi || parseFloat(newMontantSaisi) <= 0) {
      setNewMontantError(
        "Le montant est obligatoire et doit être supérieur à 0"
      );
      return;
    }

    const nouveauMontant = parseFloat(newMontantSaisi);
    setValidationModalOpen(false);
    setMontantAutomatique(newMontantSaisi);
    setMontantAutomatiqueAffiche(newMontantAffiche);
    setMontantModifie(nouveauMontant);
    // Mise à jour du montant dans selectedRow pour l'affichage immédiat
    selectedRow.montantReleve = nouveauMontant;
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Vérification différente selon le cas
    if (
      selectedRow.montantReleve !== undefined &&
      selectedRow.montantReleve > 0
    ) {
      // Cas automatique - pas besoin de vérifier car le montant existe déjà
      if (!dateMontantBanque) {
        setFormError("La date du relevé est obligatoire");
        return;
      }
    } else {
      // Cas manuel ou cas sans montant automatique
      const montantSaisi = selectedRow.montantReleve
        ? montantManuel
        : montantNoAuto;
      if (!montantSaisi || parseFloat(montantSaisi) <= 0) {
        setFormError(
          "Le montant banque est obligatoire et doit être supérieur à 0"
        );
        toast.error(
          `Le montant banque est obligatoire et doit être supérieur à 0`
        );
        return;
      }

      if (!dateMontantBanque) {
        setFormError("La date du relevé est obligatoire");
        return;
      }
    }

    setIsConfirmationModalOpen(true);
  };

  const handleValidateMontant = async () => {
    try {
      if (!selectedRow.id) {
        console.error("L'ID de l'encaissement est manquant");
        return;
      }

      setIsValidating(true);
      // Appel API pour valider le montant
      const response: any = await axiosInstance.patch(
        `${API_AUTH_SUIVI}/encaissements/validate-amount/${selectedRow.id}`
      );

      // S'assurer que selectedRow.montantReleve a une valeur valide
      if (!selectedRow.montantReleve || selectedRow.montantReleve <= 0) {
        // Si montantReleve n'est pas défini ou est 0, utiliser le montant de la réponse API
        if (response && response.data && response.data.montantReleve) {
          selectedRow.montantReleve = response.data.montantReleve;
        } else {
          // Fallback: utiliser le montant automatique si disponible
          const montantAuto = selectedRow.montantReleve ?? 0;
          if (montantAuto > 0) {
            selectedRow.montantReleve = montantAuto;
          }
        }
      }

      const montantReleve = selectedRow.montantReleve ?? 0;
      const montantBordereau = selectedRow["Montant bordereau (B)"] || 0;

      // On met à jour localement le selectedRow pour mettre à jour l'UI immédiatement
      selectedRow.isCorrect = 1;

      // Fermer la modale de validation après un court délai
      setTimeout(() => {
        setValidationModalOpen(false);
      }, 300);
    } catch (error) {
      console.error("Erreur lors de la validation du montant", error);
      Toastify("error", "Erreur lors de la validation du montant");
      setValidationModalOpen(false);
    } finally {
      setIsValidating(false);
    }
  };

  // Déterminer le montant saisi à afficher selon le cas (cas 2 ou cas 3)
  const montantSaisiAffichage = (selectedRow.montantReleve !== undefined && selectedRow.montantReleve > 0)
    ? montantManuel
    : montantNoAuto;

  const handleConfirmSubmit = () => {
    setLoading(true);
    try {
      // Déterminer quel montant utiliser selon le cas
      let montantVal = 0;
      if (selectedRow.isCorrect === 1) {
        montantVal = selectedRow.montantReleve ?? 0;
      } else {
        montantVal = montantSaisiAffichage ? parseFloat(montantSaisiAffichage) : 0;
      }
      const montantBordereau = selectedRow["Montant bordereau (B)"] || 0;
      // Création de l'objet à soumettre
      const updatedRow = {
        ...selectedRow,
        observationBanque,
        rasChecked1,
        rasChecked2,
        images2,
        montantReleve: montantVal,
        dateMontantBanque,
        ecartReleve: montantBordereau - montantVal,
        statutValidation: 2,
      };
      // Préparer les fichiers si disponibles
      const files =
        images2 && images2.length > 0
          ? images2
            .map((image) => image.file)
            .filter((file): file is File => file !== undefined)
          : [];
      // Soumettre les données
      handleSubmit(updatedRow);
      // Fermer le modal
      setIsConfirmationModalOpen(false);
      setModalOpen(false);

      // Attendre un peu pour laisser le temps à l'API de traiter la mise à jour,
      // puis rafraîchir les données avec plusieurs méthodes pour garantir la mise à jour
      setTimeout(() => {
        console.log("Rafraîchissement des données après confirmation");

        // Méthode 1: Utiliser le prop fetchData (refreshTableData)
        if (fetchData) {
          console.log("Méthode 1: Appel de fetchData via props");
          fetchData();
        }

        // Méthode 2: Utiliser window.fetchData global
        if (typeof window !== 'undefined' && (window as any).fetchData) {
          console.log("Méthode 2: Appel de window.fetchData");
          (window as any).fetchData();
        }

        // Méthode 3: Forcer un rafraîchissement de la page si rien d'autre ne fonctionne
        // Cette méthode est plus drastique mais garantit la mise à jour
        if (!fetchData && (typeof window === 'undefined' || !(window as any).fetchData)) {
          console.log("Méthode 3: Forcer le rafraîchissement de la page");
          if (typeof window !== 'undefined') {
            window.location.reload();
          }
        }
      }, 800); // Augmenter le délai à 800ms pour laisser plus de temps à l'API
    } catch (error) {
      console.error("Erreur lors de la confirmation :", error);
      Toastify("error", "Une erreur est survenue lors de la validation");
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour gérer le changement d'images
  const handleImageChange = (imageList: ImageListType) => {
    // Préserver l'état actuel du montant modifié
    const currentMontant =
      montantModifie !== null ? montantModifie : selectedRow.montantReleve ?? 0;

    // Mettre à jour les images
    onChange2(imageList);

    // Restaurer l'état du montant
    if (currentMontant > 0) {
      setMontantModifie(currentMontant);
      setMontantAutomatique(currentMontant.toString());
      setMontantAutomatiqueAffiche(formatNumber(currentMontant));
    }
  };

  return (
    <>
      <div
        className={`fixed inset-0 z-50 bg-gray-600/20 backdrop-blur-sm transition-opacity duration-300 ${modalOpen ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
        onClick={handleCloseModal}
      />
      <div
        className={`fixed bottom-0 right-0 top-0 z-[51] w-full max-w-[600px] transform bg-white shadow-xl transition-transform duration-300 dark:bg-gray-800 ${modalOpen ? "translate-x-0" : "translate-x-full"
          }`}
      >
        <form onSubmit={handleFormSubmit} className="flex h-full flex-col">
          {/* Header */}
          <div className="border-b border-gray-200 p-6 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Formulaire d'édition
                </h2>
                <div className="mt-4 space-y-3">
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
                  Modifiez vos encaissements s'ils ne sont pas terminés.
                </p>
              </div>
              <button
                type="button"
                className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-500 dark:hover:bg-gray-700"
                onClick={handleCloseModal}
              >
                <IconX className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 space-y-6 overflow-y-auto p-6">
            {/* Montants Section */}
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900">
              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                  Journée du <span className="font-semibold">{today}</span>
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
                  <p className="text-sm text-gray-500">Montant Caisses</p>
                </div>
                <div>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {formatNumber(selectedRow["Montant bordereau (B)"])} F CFA
                  </p>
                  <p className="text-sm text-gray-500">Montant Bordereaux</p>
                </div>
                <div>
                  <p
                    className={`text-lg font-semibold ${selectedRow["Montant caisse (A)"] -
                      selectedRow["Montant bordereau (B)"] <
                      0
                      ? "text-red-500"
                      : selectedRow["Montant caisse (A)"] -
                        selectedRow["Montant bordereau (B)"] >
                        0
                        ? "text-green-500"
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
                value={observationCaisse}
                onChange={(e) => setObservationCaisse(e.target.value)}
              />
            </div>

            {/* Image Upload */}
            <div className="space-y-4 rounded-lg border border-gray-200 p-4 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                    Importer le coupon
                  </h3>
                  <p className="mt-1 text-xs text-gray-500">
                    Format accepté: Images
                  </p>
                </div>
                {images2.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setImages2([])}
                    className="text-sm text-red-500 hover:text-red-600"
                  >
                    Supprimer tout
                  </button>
                )}
              </div>

              <ImageUploading
                multiple
                value={images2}
                onChange={handleImageChange}
                maxNumber={maxNumber}
              >
                {({
                  imageList,
                  onImageUpload,
                  onImageRemove,
                  isDragging,
                  dragProps,
                }) => (
                  <div className="space-y-4">
                    <button
                      type="button"
                      onClick={onImageUpload}
                      className={`flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 p-4 transition-colors hover:border-primary dark:border-gray-600 dark:hover:border-primary ${isDragging ? "border-primary" : ""
                        }`}
                      {...dragProps}
                    >
                      <IconPaperclip className="h-5 w-5 text-gray-400" />
                      <span className="text-sm text-gray-600 dark:text-gray-300">
                        Cliquez ou glissez vos images ici
                      </span>
                    </button>

                    {imageList.length > 0 && (
                      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                        {imageList.map((image, index) => (
                          <div
                            key={index}
                            className="group relative aspect-square overflow-hidden rounded-lg"
                          >
                            <img
                              src={image.dataURL}
                              alt={`Image ${index + 1}`}
                              className="h-full w-full object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => onImageRemove(index)}
                              className="absolute right-2 top-2 rounded-full bg-white/80 p-1 opacity-0 transition-opacity group-hover:opacity-100 dark:bg-black/80"
                            >
                              <IconX className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </ImageUploading>
            </div>

            {/* Montant Banque */}
            <div className="space-y-4 rounded-lg border border-gray-200 p-4 dark:border-gray-700">
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                      Montant Banque
                    </h3>
                    <p className="mt-1 text-xs text-gray-500">
                      {selectedRow.montantReleve !== undefined &&
                        selectedRow.montantReleve > 0
                        ? "Un montant est déjà saisi, vous pouvez le valider ou le modifier"
                        : "Veuillez saisir le montant du relevé bancaire"}
                    </p>
                  </div>
                </div>

                {/* Affichage conditionnel selon le cas */}
                {selectedRow.montantReleve !== undefined &&
                  selectedRow.montantReleve > 0 ? (
                  selectedRow.isCorrect === 0 ? (
                    <UnvalidatedAmount
                      montantAuto={selectedRow.montantReleve}
                      formatNumber={formatNumber}
                      montantSaisi={montantManuel}
                      onMontantSaisiChange={handleMontantManuelChangeNoAuto}
                      onValidateClick={() => setValidationModalOpen(true)}
                    />
                  ) : (
                    <ValidatedAmount
                      montantReleve={selectedRow.montantReleve}
                      formatNumber={formatNumber}
                    />
                  )
                ) : (
                  <NoAmount
                    montantSaisi={montantNoAuto}
                    onMontantSaisiChange={handleNoAutoInputChange}
                    formatNumber={formatNumber}
                  />
                )}

                {/* Date du montant banque - commun aux deux cas */}
                <div className="mt-3">
                  <label
                    htmlFor="dateMontantBanque"
                    className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Date du relevé
                  </label>
                  <div className="relative">
                    <input
                      id="dateMontantBanque"
                      type="date"
                      className="form-input w-full rounded-lg border-gray-300 bg-white py-3 text-gray-900 focus:border-primary focus:ring-primary dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                      value={dateMontantBanque}
                      onChange={(e) => setDateMontantBanque(e.target.value)}
                      max={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                </div>

                {formError && (
                  <p className="text-sm text-red-500">{formError}</p>
                )}
              </div>
            </div>

            {/* Détails Bancaires */}
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900">
              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                  Relevé du{" "}
                  <span className="font-semibold">
                    {selectedRow["Date cloture"]}
                  </span>
                </h3>
                <p className="mt-1 text-xs text-gray-500">
                  Détails du relevé bancaire
                </p>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {formatNumber(selectedRow["Montant bordereau (B)"])} F CFA
                  </p>
                  <p className="text-sm text-gray-500">Montant Bordereaux</p>
                </div>
                <div>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {selectedRow.isCorrect === 1
                      ? `${formatNumber(selectedRow.montantReleve ?? 0)} F CFA`
                      : montantSaisiAffichage ? `${formatNumber(parseFloat(montantSaisiAffichage))} F CFA` : "Non saisi"}
                  </p>
                  <p className="text-sm text-gray-500">Montant Banque</p>
                </div>
                <div className="">
                  <p
                    className={`text-lg font-semibold ${(() => {
                      // Calculer le montant bancaire actuel pour confirmation
                      let montantBancaire = 0;
                      if (selectedRow.isCorrect === 1) {
                        montantBancaire = selectedRow.montantReleve ?? 0;
                      } else {
                        montantBancaire = montantSaisiAffichage ? parseFloat(montantSaisiAffichage) : 0;
                      }
                      const ecart = selectedRow["Montant bordereau (B)"] - montantBancaire;
                      if (ecart < 0) return "text-red-500";
                      if (ecart > 0) return "text-green-500";
                      return "text-gray-900";
                    })()}`}
                  >
                    {(() => {
                      let montantBancaire = 0;
                      if (selectedRow.isCorrect === 1) {
                        montantBancaire = selectedRow.montantReleve ?? 0;
                      } else {
                        montantBancaire = montantSaisiAffichage ? parseFloat(montantSaisiAffichage) : 0;
                      }
                      return formatNumber(selectedRow["Montant bordereau (B)"] - montantBancaire);
                    })()} F CFA
                  </p>
                  <p className="text-sm text-gray-500">Écart (B-C)</p>
                </div>
              </div>
            </div>

            {/* Observation Banque */}
            <div className="space-y-4 rounded-lg border border-gray-200 p-4 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                    Observation Banque
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
                value={observationBanque}
                onChange={(e) => setObservationBanque(e.target.value)}
              />
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 p-6 dark:border-gray-700">
            <button
              type="submit"
              className="w-full rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            >
              Valider
            </button>
          </div>
        </form>
      </div>

      {/* Confirmation Modal */}
      {isConfirmationModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-gray-600/20 backdrop-blur-sm">
          <div className="w-full max-w-md transform rounded-lg bg-white p-6 shadow-xl transition-all dark:bg-gray-800">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Confirmation du montant
              </h3>
              <div className="mt-4">
                <p className="text-sm text-gray-500">
                  {selectedRow.isCorrect === 1
                    ? "Montant du relevé bancaire validé :"
                    : "Vous avez saisi le montant suivant :"}
                </p>
                <p className="mt-2 text-2xl font-bold text-primary">
                  {selectedRow.isCorrect === 1
                    ? `${formatNumber(selectedRow.montantReleve ?? 0)} F CFA`
                    : montantSaisiAffichage ? `${formatNumber(parseFloat(montantSaisiAffichage))} F CFA` : "0"}
                </p>

                <div className="mt-3">
                  <label
                    htmlFor="confirmationDate"
                    className="mb-1 block text-left text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Date du relevé{" "}
                    {!dateMontantBanque && (
                      <span className="text-red-500">*</span>
                    )}
                  </label>
                  <div className="relative">
                    <input
                      id="confirmationDate"
                      type="date"
                      className="form-input w-full rounded-lg border-gray-300 bg-white py-2 text-gray-900 focus:border-primary focus:ring-primary dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                      value={dateMontantBanque}
                      onChange={(e) => setDateMontantBanque(e.target.value)}
                      max={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  {!dateMontantBanque && (
                    <p className="mt-1 text-left text-xs text-red-500">
                      Ce champ est obligatoire
                    </p>
                  )}
                </div>

                {dateMontantBanque && (
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    Date du relevé : {dateMontantBanque}
                  </p>
                )}
                {/* Affichage de l'écart spécifique confirmation */}
                {selectedRow.isCorrect !== 1 ? (
                  <div className="mt-4 space-y-2">
                    <p className="text-sm text-gray-500">
                      Écart (Bordereau - Saisi) :
                    </p>
                    <p
                      className={`text-lg font-semibold ${(() => {
                        const montantBordereau = selectedRow["Montant bordereau (B)"] || 0;
                        const montantSaisi = montantSaisiAffichage ? parseFloat(montantSaisiAffichage) : 0;
                        const ecart = montantBordereau - montantSaisi;
                        if (ecart < 0) return "text-red-500";
                        if (ecart > 0) return "text-green-500";
                        return "text-gray-900";
                      })()}`}
                    >
                      {(() => {
                        const montantBordereau = selectedRow["Montant bordereau (B)"] || 0;
                        const montantSaisi = montantSaisiAffichage ? parseFloat(montantSaisiAffichage) : 0;
                        return formatNumber(montantBordereau - montantSaisi);
                      })()} F CFA
                    </p>
                  </div>
                ) : (
                  <div className="mt-4 space-y-2">
                    <p className="text-sm text-gray-500">
                      Écart (Bordereau - Banque) :
                    </p>
                    <p
                      className={`text-lg font-semibold ${(() => {
                        const montantBordereau = selectedRow["Montant bordereau (B)"] || 0;
                        const montantReleve = selectedRow.montantReleve ?? 0;
                        const ecart = montantBordereau - montantReleve;
                        if (ecart < 0) return "text-red-500";
                        if (ecart > 0) return "text-green-500";
                        return "text-gray-900";
                      })()}`}
                    >
                      {(() => {
                        const montantBordereau = selectedRow["Montant bordereau (B)"] || 0;
                        const montantReleve = selectedRow.montantReleve ?? 0;
                        return formatNumber(montantBordereau - montantReleve);
                      })()} F CFA
                    </p>
                  </div>
                )}
                <p className="mt-4 text-sm text-gray-500">
                  Veuillez vérifier que ces informations sont correctes avant de
                  confirmer.
                </p>
              </div>
            </div>
            <div className="mt-6 flex justify-center gap-4">
              <button
                type="button"
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                onClick={() => setIsConfirmationModalOpen(false)}
              >
                Modifier
              </button>
              <button
                type="button"
                className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:bg-gray-400"
                onClick={handleConfirmSubmit}
                disabled={!dateMontantBanque}
              >
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Validation du Montant - Pour le cas automatique uniquement */}
      {validationModalOpen && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-gray-600/20 backdrop-blur-sm"
          onClick={() => setValidationModalOpen(false)}
        >
          <div
            className="w-full max-w-md transform rounded-lg bg-white p-6 shadow-xl transition-all dark:bg-gray-800"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative text-center">
              <button
                onClick={() => setValidationModalOpen(false)}
                className="absolute right-0 top-0 p-1 text-gray-400 hover:text-gray-600 dark:text-gray-300 dark:hover:text-gray-100"
                aria-label="Fermer"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Validation du montant
              </h3>

              <div className="mt-4">
                <p className="text-sm text-gray-500">
                  Un montant est déjà enregistré pour cet encaissement :
                </p>
                <p className="mt-2 text-2xl font-bold text-primary">
                  {formatNumber(selectedRow.montantReleve ?? 0)} F CFA
                </p>

                <div className="mt-6 flex flex-col gap-4">
                  <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      Valider le montant existant
                    </h4>
                    <button
                      type="button"
                      className="mt-3 w-full rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:bg-gray-400"
                      onClick={handleValidateMontant}
                      disabled={isValidating}
                    >
                      {isValidating ? (
                        <div className="flex items-center justify-center">
                          <svg
                            className="mr-2 h-4 w-4 animate-spin"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                              fill="none"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          Validation...
                        </div>
                      ) : (
                        "Valider ce montant"
                      )}
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  className="mt-6 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                  onClick={() => setValidationModalOpen(false)}
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
