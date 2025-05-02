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
}

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
}: EditModalProps) {
  const maxNumber = 69;
  // États pour le cas où un montant est déjà remonté
  const [montantAutomatique, setMontantAutomatique] = useState<string>("");
  const [montantAutomatiqueAffiche, setMontantAutomatiqueAffiche] = useState<string>("");
  // États pour le cas où aucun montant n'est remonté
  const [montantManuel, setMontantManuel] = useState<string>("");
  const [montantManuelAffiche, setMontantManuelAffiche] = useState<string>("");

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

  useEffect(() => {
    if (modalOpen) {
      const montantInitial = selectedRow.montantReleve || 0;
      console.log("Montant initial:", montantInitial, typeof montantInitial, selectedRow.montantReleve);

      if (montantInitial > 0) {
        // Initialisation pour le cas automatique
        setMontantAutomatique(montantInitial.toString());
        setMontantAutomatiqueAffiche(formatNumber(montantInitial));
      } else {
        // Réinitialisation de tous les états
        setMontantAutomatique("");
        setMontantAutomatiqueAffiche("");
        setMontantManuel("");
        setMontantManuelAffiche("");
      }
    }
  }, [modalOpen, selectedRow]);

  const handleCloseModal = () => {
    setModalOpen(false);
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

  // Fonction pour le cas manuel - saisie directe
  const handleMontantManuelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    const cleanedValue = inputValue.replace(/\D/g, "");

    if (cleanedValue === "") {
      setMontantManuel("");
      setMontantManuelAffiche("");
      handleMontantChange(0);
      return;
    }

    setMontantManuel(cleanedValue);
    const numericValue = parseInt(cleanedValue);
    setMontantManuelAffiche(formatNumber(numericValue));
    setFormError("");
    handleMontantChange(numericValue);
  };

  const handleConfirmNewMontant = () => {
    if (!newMontantSaisi || parseFloat(newMontantSaisi) <= 0) {
      setNewMontantError(
        "Le montant est obligatoire et doit être supérieur à 0"
      );
      return;
    }

    setValidationModalOpen(false);
    setMontantAutomatique(newMontantSaisi);
    setMontantAutomatiqueAffiche(newMontantAffiche);
    // Mise à jour du montant dans selectedRow pour l'affichage immédiat
    selectedRow.montantReleve = parseFloat(newMontantSaisi);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Vérification différente selon le cas
    if (selectedRow.montantReleve !== undefined && selectedRow.montantReleve > 0) {
      // Cas automatique - pas besoin de vérifier car le montant existe déjà
      if (!dateMontantBanque) {
        setFormError("La date du relevé est obligatoire");
        return;
      }
    } else {
      // Cas manuel - on vérifie que le montant a été saisi
      if (!montantManuel || parseFloat(montantManuel) <= 0) {
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

      const montantReleve = selectedRow.montantReleve || 0;
      const montantBordereau = selectedRow["Montant bordereau (B)"] || 0;

      // const updatedRow = {
      //   ...selectedRow,
      //   observationBanque,
      //   rasChecked1,
      //   rasChecked2,
      //   images2,
      //   montantReleve: montantReleve,
      //   dateMontantBanque,
      //   ecartReleve: montantBordereau - montantReleve,
      //   statutValidation: 2,
      //   isCorrect: 1
      // };

      // On met à jour localement le selectedRow pour mettre à jour l'UI immédiatement
      selectedRow.isCorrect = 1;

      // On soumet immédiatement les données mises à jour au composant parent
      // handleSubmit(updatedRow);

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

  const handleConfirmSubmit = () => {
    setLoading(true);
    try {
      // Déterminer quel montant utiliser selon le cas
      let montantVal = 0;

      if (selectedRow.montantReleve !== undefined && selectedRow.montantReleve > 0) {
        // Cas 1: Montant automatique - on utilise la valeur existante
        montantVal = selectedRow.montantReleve;
      } else {
        // Cas 2: Montant manuel - on utilise la valeur saisie
        montantVal = montantManuel ? parseFloat(montantManuel) : 0;
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
    } catch (error) {
      console.error("Erreur lors de la confirmation :", error);
      Toastify("error", "Une erreur est survenue lors de la validation");
    } finally {
      setLoading(false);
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

                  {/* Bouton de validation disponible uniquement pour le cas automatique non validé */}
                  {selectedRow.montantReleve !== undefined &&
                    selectedRow.montantReleve > 0 &&
                    selectedRow.isCorrect === 0 && (
                      <button
                        type="button"
                        onClick={() => setValidationModalOpen(true)}
                        className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                      >
                        Valider ce montant
                      </button>
                    )}

                  {/* Badge de validation pour le cas automatique validé */}
                  {selectedRow.montantReleve !== undefined &&
                    selectedRow.montantReleve > 0 &&
                    selectedRow.isCorrect === 1 && (
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
                    )}
                </div>

                {/* CAS 1: Montant automatique déjà remonté */}
                {selectedRow.montantReleve !== undefined && selectedRow.montantReleve > 0 && (
                  <div className="relative">
                    <div className="flex">
                      <input
                        type="text"
                        ref={montantInputRef}
                        className="form-input w-full rounded-lg border-gray-300 py-3 pl-10 pr-4 cursor-not-allowed bg-gray-100 text-gray-600 opacity-80 dark:border-gray-700 dark:bg-gray-700 dark:text-gray-400"
                        placeholder="Montant en F CFA"
                        value={formatNumber(selectedRow.montantReleve)}
                        disabled={true}
                      />
                      <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">
                        <IconCashBanknotes className="h-5 w-5 text-gray-400" />
                      </div>
                      <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
                        <span className="rounded bg-gray-200 px-2 py-1 text-xs text-gray-500 dark:bg-gray-600 dark:text-gray-300">
                          {selectedRow.isCorrect === 1 ? "Validé" : "Modifiable via le bouton"}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* CAS 2: Aucun montant remonté - saisie directe */}
                {(selectedRow.montantReleve === undefined || selectedRow.montantReleve === 0 || selectedRow.montantReleve <= 0) && (
                  <div className="relative">
                    <div className="flex">
                      <input
                        type="text"
                        className="form-input w-full rounded-lg border-gray-300 py-3 pl-10 pr-4 bg-white text-gray-900 focus:border-primary focus:ring-primary dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                        placeholder="Saisir le montant en F CFA"
                        value={montantManuelAffiche}
                        onChange={handleMontantManuelChange}
                      />
                      <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">
                        <IconCashBanknotes className="h-5 w-5 text-gray-400" />
                      </div>
                    </div>
                  </div>
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
                    />
                  </div>
                </div>

                {formError && (
                  <p className="text-sm text-red-500">{formError}</p>
                )}
              </div>
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
                onChange={onChange2}
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
                    {(() => {
                      if (selectedRow.montantReleve !== undefined && selectedRow.montantReleve > 0) {
                        // Cas automatique
                        return `${formatNumber(selectedRow.montantReleve)} F CFA`;
                      } else {
                        // Cas manuel
                        return montantManuel ? `${formatNumber(parseFloat(montantManuel))} F CFA` : "Non saisi";
                      }
                    })()}
                  </p>
                  <p className="text-sm text-gray-500">Montant Banque</p>
                </div>
                <div className="">
                  <p
                    className={`text-lg font-semibold ${(() => {
                      // Calculer le montant bancaire actuel
                      const montantBancaire = selectedRow.montantReleve !== undefined && selectedRow.montantReleve > 0
                        ? selectedRow.montantReleve
                        : (montantManuel ? parseFloat(montantManuel) : 0);

                      // Calculer l'écart
                      const ecart = selectedRow["Montant bordereau (B)"] - montantBancaire;

                      // Retourner la classe CSS appropriée
                      if (ecart < 0) return "text-red-500";
                      if (ecart > 0) return "text-green-500";
                      return "text-gray-900 dark:text-white";
                    })()
                      }`}
                  >
                    {(() => {
                      // Calculer le montant bancaire actuel
                      const montantBancaire = selectedRow.montantReleve !== undefined && selectedRow.montantReleve > 0
                        ? selectedRow.montantReleve
                        : (montantManuel ? parseFloat(montantManuel) : 0);

                      // Calculer et formater l'écart
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
                  {selectedRow.montantReleve !== undefined && selectedRow.montantReleve > 0
                    ? "Montant du relevé bancaire :"
                    : "Vous avez saisi le montant suivant :"}
                </p>
                <p className="mt-2 text-2xl font-bold text-primary">
                  {(() => {
                    if (selectedRow.montantReleve !== undefined && selectedRow.montantReleve > 0) {
                      // Cas automatique
                      return formatNumber(selectedRow.montantReleve);
                    } else {
                      // Cas manuel
                      return montantManuel ? formatNumber(parseFloat(montantManuel)) : "0";
                    }
                  })()} F CFA
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
                <div className="mt-4 space-y-2">
                  <p className="text-sm text-gray-500">
                    Écart 2 (Bordereau - Relevé) :
                  </p>
                  <p
                    className={`text-lg font-semibold ${(() => {
                      // Calculer le montant bancaire actuel
                      const montantBancaire = selectedRow.montantReleve !== undefined && selectedRow.montantReleve > 0
                        ? selectedRow.montantReleve
                        : (montantManuel ? parseFloat(montantManuel) : 0);

                      // Calculer l'écart
                      const ecart = selectedRow["Montant bordereau (B)"] - montantBancaire;

                      // Retourner la classe CSS appropriée
                      if (ecart < 0) return "text-red-500";
                      if (ecart > 0) return "text-green-500";
                      return "text-gray-900";
                    })()
                      }`}
                  >
                    {(() => {
                      // Calculer le montant bancaire actuel
                      const montantBancaire = selectedRow.montantReleve !== undefined && selectedRow.montantReleve > 0
                        ? selectedRow.montantReleve
                        : (montantManuel ? parseFloat(montantManuel) : 0);

                      // Calculer et formater l'écart
                      return formatNumber(selectedRow["Montant bordereau (B)"] - montantBancaire);
                    })()} F CFA
                  </p>
                </div>
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
                  {formatNumber(selectedRow.montantReleve || 0)} F CFA
                </p>

                <div className="mt-6 flex flex-col gap-4">
                  {/* Option 1: Valider le montant existant */}
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

                  {/* Option 2: Saisir un nouveau montant */}
                  <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      Saisir un nouveau montant
                    </h4>
                    <div className="relative mt-3">
                      <div className="flex">
                        <input
                          type="text"
                          className="form-input w-full rounded-lg border-gray-300 bg-white py-3 pl-10 pr-4 text-gray-900 focus:border-primary focus:ring-primary dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                          placeholder="Montant en F CFA"
                          value={newMontantAffiche}
                          onChange={handleNewMontantInputChange}
                          autoFocus
                        />
                        <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">
                          <IconCashBanknotes className="h-5 w-5 text-gray-400" />
                        </div>
                      </div>
                      {newMontantError && (
                        <p className="mt-2 text-sm text-red-500">
                          {newMontantError}
                        </p>
                      )}
                    </div>
                    <button
                      type="button"
                      className="mt-3 w-full rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:bg-gray-400"
                      onClick={handleConfirmNewMontant}
                      disabled={
                        !newMontantAffiche ||
                        newMontantError !== "" ||
                        parseFloat(
                          newMontantAffiche.replace(/\s/g, "").replace(",", ".")
                        ) <= 0 ||
                        parseFloat(
                          newMontantAffiche.replace(/\s/g, "").replace(",", ".")
                        ) === selectedRow.montantReleve
                      }
                    >
                      Confirmer ce nouveau montant
                    </button>
                    {newMontantAffiche &&
                      parseFloat(
                        newMontantAffiche.replace(/\s/g, "").replace(",", ".")
                      ) === selectedRow.montantReleve && (
                        <p className="mt-2 text-sm text-red-500">
                          Le nouveau montant ne peut pas être identique à
                          l'ancien
                        </p>
                      )}
                    {newMontantAffiche &&
                      parseFloat(
                        newMontantAffiche.replace(/\s/g, "").replace(",", ".")
                      ) <= 0 && (
                        <p className="mt-2 text-sm text-red-500">
                          Le montant doit être supérieur à 0
                        </p>
                      )}
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
