"use client";

import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { TAppDispatch } from "@/store";
import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css";
import IconX from "../icon/icon-x";
import IconPaperclip from "../icon/icon-paperclip";
import IconBank from "../icon/icon-bank";
import IconCashBanknotes from "../icon/icon-cash-banknotes";
import ImageUploading, { ImageListType } from "react-images-uploading";

interface EditModalProps {
  setModalOpen: (open: boolean) => void;
  modalOpen: boolean;
  selectedRow: {
    "Montant caisse (A)": number;
    "Montant bordereau (B)": number;
    "Montant revelé (C)": number;
    "Date cloture": string;
    banque: string;
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
  const dispatch = useDispatch<TAppDispatch>();
  const maxNumber = 69;
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
  const [montantSaisi, setMontantSaisi] = useState<string>("");
  const [formError, setFormError] = useState("");

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  const handleMontantInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setMontantSaisi(value);
    setFormError("");
    const numericValue = parseFloat(value.replace(/[^\d.-]/g, ""));
    if (!isNaN(numericValue)) {
      handleMontantChange(numericValue);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!montantSaisi || parseFloat(montantSaisi) <= 0) {
      setFormError(
        "Le montant banque est obligatoire et doit être supérieur à 0"
      );
      return;
    }

    setIsConfirmationModalOpen(true);
  };

  const handleConfirmSubmit = () => {
    const updatedRow = {
      ...selectedRow,
      observationBanque,
      rasChecked1,
      rasChecked2,
      images2,
      montantReleve: parseFloat(montantSaisi),
      ecartReleve:
        selectedRow["Montant bordereau (B)"] - parseFloat(montantSaisi),
      statutValidation: 2,
    };

    handleSubmit(updatedRow);
    setIsConfirmationModalOpen(false);
    setModalOpen(false);
  };

  return (
    <>
      <div
        className={`fixed inset-0 z-50 bg-black/30 backdrop-blur-sm transition-opacity duration-300 ${
          modalOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={handleCloseModal}
      />
      <div
        className={`fixed bottom-0 right-0 top-0 z-[51] w-full max-w-[600px] transform bg-white shadow-xl transition-transform duration-300 dark:bg-gray-800 ${
          modalOpen ? "translate-x-0" : "translate-x-full"
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
                <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
                  <div className="group flex transform items-center gap-3 rounded-lg bg-primary/10 px-4 py-3 transition-all duration-200 hover:scale-105 hover:bg-primary/15">
                    <div className="rounded-full bg-primary/20 p-2">
                      <IconBank className="h-6 w-6 text-primary transition-transform duration-200 group-hover:scale-110" />
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-primary">
                        {selectedRow.banque}
                      </p>
                      <p className="text-sm text-primary/80">Banque</p>
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
                    className={`text-lg font-semibold ${
                      selectedRow["Montant caisse (A)"] -
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
                  <p className="text-sm text-gray-500">Écart 1</p>
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
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    checked={rasChecked1}
                    onChange={handleRasChecked1Change}
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-200">
                    RAS
                  </span>
                </label>
              </div>
              <textarea
                className="w-full rounded-lg border border-gray-200 bg-white p-3 text-sm text-gray-900 focus:border-primary focus:ring-primary dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                rows={4}
                placeholder="Saisir votre observation ici"
                disabled={rasChecked1}
                value={observationCaisse}
                onChange={(e) => setObservationCaisse(e.target.value)}
              />
            </div>

            {/* Montant Banque */}
            <div className="space-y-4 rounded-lg border border-gray-200 p-4 dark:border-gray-700">
              <div>
                <h3 className="flex items-center text-sm font-medium text-gray-900 dark:text-white">
                  <IconCashBanknotes className="mr-2 h-5 w-5 text-primary" />
                  Montant Banque <span className="ml-1 text-red-500">*</span>
                </h3>
                <p className="mt-1 text-xs text-gray-500">
                  Saisir le montant provenant de la banque
                </p>
              </div>
              <input
                type="text"
                className={`block w-full rounded-lg border ${
                  formError
                    ? "border-red-500"
                    : "border-gray-300 dark:border-gray-600"
                } bg-white p-3 text-sm text-gray-900 focus:border-primary focus:ring-primary dark:bg-gray-800 dark:text-white`}
                placeholder="Montant"
                value={montantSaisi}
                onChange={handleMontantInputChange}
                required
              />
              {formError && <p className="text-sm text-red-500">{formError}</p>}
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
                      className={`flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 p-4 transition-colors hover:border-primary dark:border-gray-600 dark:hover:border-primary ${
                        isDragging ? "border-primary" : ""
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
                    {montantSaisi
                      ? `${formatNumber(parseFloat(montantSaisi))} F CFA`
                      : "Non saisi"}
                  </p>
                  <p className="text-sm text-gray-500">Montant Banque</p>
                </div>
                <div className="">
                  <p
                    className={`text-lg font-semibold ${
                      selectedRow["Montant bordereau (B)"] -
                        (montantSaisi ? parseFloat(montantSaisi) : 0) <
                      0
                        ? "text-primary"
                        : selectedRow["Montant bordereau (B)"] -
                            (montantSaisi ? parseFloat(montantSaisi) : 0) >
                          0
                        ? "text-success"
                        : "text-gray-900 dark:text-white"
                    }`}
                  >
                    {formatNumber(
                      selectedRow["Montant bordereau (B)"] -
                        (montantSaisi ? parseFloat(montantSaisi) : 0)
                    )}{" "}
                    F CFA
                  </p>
                  <p className="text-sm text-gray-500">Écart 2</p>
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
                    Observation sur l'écart avec la banque
                  </p>
                </div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    checked={rasChecked2}
                    onChange={handleRasChecked2Change}
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-200">
                    RAS
                  </span>
                </label>
              </div>
              <textarea
                className="w-full rounded-lg border border-gray-200 bg-white p-3 text-sm text-gray-900 focus:border-primary focus:ring-primary dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                rows={4}
                placeholder="Saisir votre observation ici"
                disabled={rasChecked2}
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
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md transform rounded-lg bg-white p-6 shadow-xl transition-all dark:bg-gray-800">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Confirmation du montant
              </h3>
              <div className="mt-4">
                <p className="text-sm text-gray-500">
                  Vous avez saisi le montant suivant :
                </p>
                <p className="mt-2 text-2xl font-bold text-primary">
                  {formatNumber(parseFloat(montantSaisi))} F CFA
                </p>
                <p className="mt-2 text-sm text-gray-500">
                  Veuillez vérifier que ce montant est correct avant de
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
                className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                onClick={handleConfirmSubmit}
              >
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
