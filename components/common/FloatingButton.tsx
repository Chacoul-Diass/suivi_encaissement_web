"use client";

import React, { useState } from "react";
import { Dialog } from "@headlessui/react";
import { usePathname } from "next/navigation";
import axiosInstance from "@/utils/axios";
import ExcelJS from "exceljs";

const FloatingButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const pathname = usePathname();

  // Ne pas afficher le bouton sur la page de connexion
  if (pathname?.includes("/login")) {
    return null;
  }

  const handleDownload = async (type: "nontraite" | "rejete") => {
    try {
      setIsLoading(type);
      const status = type === "nontraite" ? 0 : 1;

      const response = await axiosInstance.get(
        `/encaissements/${status}?all=true`
      );
      const encaissements = response.data.result;

      // Créer un nouveau workbook et une feuille
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Encaissements");

      // Définir les colonnes
      const baseColumns = [
        { header: "Direction Régionale", key: "directionRegionale", width: 20 },
        { header: "Code Expl", key: "codeExpl", width: 15 },
        { header: "Date Encaissement", key: "dateEncaissement", width: 20 },
        { header: "Banque", key: "banque", width: 30 },
        { header: "Produit", key: "produit", width: 15 },
        { header: "Compte Banque", key: "compteBanque", width: 20 },
        { header: "N° Bordereau", key: "numeroBordereau", width: 20 },
        { header: "Journée Caisse", key: "journeeCaisse", width: 15 },
        { header: "Mode Règlement", key: "modeReglement", width: 15 },
        {
          header: "Montant Restitution",
          key: "montantRestitutionCaisse",
          width: 20,
        },
        {
          header: "Montant Bordereau",
          key: "montantBordereauBanque",
          width: 20,
        },
        { header: "Écart", key: "ecartCaisseBanque", width: 15 },
      ];

      const rejectedColumns =
        status === 1
          ? [
              { header: "Date Validation", key: "dateValidation", width: 20 },
              {
                header: "Observation Rejeté",
                key: "observationRejete",
                width: 30,
              },
              { header: "Montant Relevé", key: "montantReleve", width: 20 },
              { header: "Écart Relevé", key: "ecartReleve", width: 20 },
              {
                header: "Observation Caisse",
                key: "observationCaisse",
                width: 30,
              },
              {
                header: "Observation Relevé",
                key: "observationReleve",
                width: 30,
              },
              {
                header: "Observation Réclamation",
                key: "observationReclamation",
                width: 30,
              },
            ]
          : [];

      worksheet.columns = [...baseColumns, ...rejectedColumns];

      // Style de l'en-tête
      worksheet.getRow(1).font = { bold: true };
      worksheet.getRow(1).fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFE0E0E0" },
      };

      // Ajouter les données
      encaissements.forEach((item: any) => {
        const baseData = {
          directionRegionale: item.directionRegionale,
          codeExpl: item.codeExpl,
          dateEncaissement: item.dateEncaissement,
          banque: item.banque,
          produit: item.produit,
          compteBanque: item.compteBanque,
          numeroBordereau: item.numeroBordereau,
          journeeCaisse: item.journeeCaisse,
          modeReglement: item.modeReglement,
          montantRestitutionCaisse: item.montantRestitutionCaisse,
          montantBordereauBanque: item.montantBordereauBanque,
          ecartCaisseBanque: item.ecartCaisseBanque,
        };

        // Ajouter les données supplémentaires pour les encaissements rejetés
        const rejectedData =
          status === 1
            ? {
                dateValidation:
                  item.validationEncaissement?.dateValidation || "",
                observationRejete:
                  item.validationEncaissement?.observationRejete || "",
                montantReleve: item.validationEncaissement?.montantReleve || 0,
                ecartReleve: item.validationEncaissement?.ecartReleve || 0,
                observationCaisse:
                  item.validationEncaissement?.observationCaisse || "",
                observationReleve:
                  item.validationEncaissement?.observationReleve || "",
                observationReclamation:
                  item.validationEncaissement?.observationReclamation || "",
              }
            : {};

        worksheet.addRow({ ...baseData, ...rejectedData });
      });

      // Formater les colonnes numériques
      worksheet.getColumn("montantRestitutionCaisse").numFmt = "#,##0";
      worksheet.getColumn("montantBordereauBanque").numFmt = "#,##0";
      worksheet.getColumn("ecartCaisseBanque").numFmt = "#,##0";

      if (status === 1) {
        worksheet.getColumn("montantReleve").numFmt = "#,##0";
        worksheet.getColumn("ecartReleve").numFmt = "#,##0";
      }

      // Bordures pour toutes les cellules
      worksheet.eachRow((row) => {
        row.eachCell((cell) => {
          cell.border = {
            top: { style: "thin" },
            left: { style: "thin" },
            bottom: { style: "thin" },
            right: { style: "thin" },
          };
        });
      });

      // Générer le fichier Excel
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      // Télécharger le fichier
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `encaissements_${type === "nontraite" ? "non_traites" : "rejetes"}.xlsx`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Erreur lors du téléchargement:", error);
    } finally {
      setIsLoading(null);
    }
  };

  return (
    <>
      {/* Bouton flottant */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-[60px] z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary shadow-lg transition-all duration-300 hover:bg-primary/90"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          className="h-6 w-6 text-white"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3"
          />
        </svg>
      </button>

      {/* Modal */}
      <Dialog
        open={isOpen}
        onClose={() => setIsOpen(false)}
        className="relative z-50"
      >
        {/* Fond semi-transparent */}
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

        {/* Position de la modal */}
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
            <Dialog.Title
              as="h3"
              className="mb-6 text-xl font-semibold leading-6 text-gray-900"
            >
              Télécharger les Encaissements
            </Dialog.Title>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* Carte pour les encaissements non traités */}
              <div
                className={`relative cursor-pointer rounded-xl border border-gray-200 bg-white p-6 transition-all duration-300 hover:border-primary ${
                  isLoading === "nontraite" ? "opacity-75" : ""
                }`}
                onClick={() => !isLoading && handleDownload("nontraite")}
              >
                <div className="mb-4 flex items-center justify-between">
                  <div className="rounded-lg bg-green-100 p-3">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="h-6 w-6 text-green-600"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z"
                      />
                    </svg>
                  </div>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="h-6 w-6 text-gray-400"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3"
                    />
                  </svg>
                </div>
                <h4 className="mb-2 text-lg font-medium text-gray-900">
                  Encaissements Non Traités
                </h4>
                <p className="text-sm text-gray-500">
                  Télécharger la liste des encaissements en attente de
                  traitement au format Excel
                </p>
                {isLoading === "nontraite" && (
                  <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-white/50">
                    <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
                  </div>
                )}
              </div>

              {/* Carte pour les encaissements rejetés */}
              <div
                className={`relative cursor-pointer rounded-xl border border-gray-200 bg-white p-6 transition-all duration-300 hover:border-primary ${
                  isLoading === "rejete" ? "opacity-75" : ""
                }`}
                onClick={() => !isLoading && handleDownload("rejete")}
              >
                <div className="mb-4 flex items-center justify-between">
                  <div className="rounded-lg bg-red-100 p-3">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="h-6 w-6 text-red-600"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"
                      />
                    </svg>
                  </div>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="h-6 w-6 text-gray-400"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3"
                    />
                  </svg>
                </div>
                <h4 className="mb-2 text-lg font-medium text-gray-900">
                  Encaissements Rejetés
                </h4>
                <p className="text-sm text-gray-500">
                  Télécharger la liste des encaissements rejetés au format Excel
                </p>
                {isLoading === "rejete" && (
                  <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-white/50">
                    <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
                onClick={() => setIsOpen(false)}
              >
                Fermer
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </>
  );
};

export default FloatingButton;
