"use client";

import React from "react";
import IconX from "../icon/icon-x";
import IconBank from "../icon/icon-bank";
import IconFileText from "../icon/icon-file-text";
import IconPackage from "../icon/icon-package";
import IconCashBanknotes from "../icon/icon-cash-banknotes";

interface EncaissementDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    encaissement: any;
    formatNumber?: any;
    formatDate?: any;
    loading?: boolean;
}

const EncaissementDetailsModal: React.FC<EncaissementDetailsModalProps> = ({
    isOpen,
    onClose,
    encaissement,
    formatNumber,
    loading = false,
}) => {
    if (!isOpen) return null;

    // Fonction de formatage par défaut si aucune n'est fournie
    const formatNumberSafe = (num: number | undefined): string => {
        if (formatNumber) return formatNumber(num);

        // Formatage par défaut
        if (num === undefined || num === null) return "0";
        return new Intl.NumberFormat('fr-FR').format(num);
    };

    // Fonction pour obtenir la couleur selon le niveau de validation
    const getValidationLevelColor = (level: string): string => {
        switch (level?.toUpperCase()) {
            case "COMPTABLE":
                return "text-purple-600 dark:text-purple-400";
            case "AGC":
                return "text-blue-600 dark:text-blue-400";
            case "DR":
                return "text-green-600 dark:text-green-400";
            case "DFC":
                return "text-orange-600 dark:text-orange-400";
            default:
                return "text-gray-600 dark:text-gray-400";
        }
    };

    return (
        <>
            <div
                className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm transition-opacity duration-300"
                onClick={onClose}
            />
            <div className="fixed bottom-0 right-0 top-0 z-[51] w-full max-w-[600px] transform bg-white shadow-xl transition-transform duration-300 dark:bg-gray-800">
                <div className="flex h-full flex-col">
                    {/* Header */}
                    <div className="border-b border-gray-200 p-6 dark:border-gray-700">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                    Détails de l'encaissement
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
                                                    {encaissement.banque || "Non spécifié"}
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
                                                        {encaissement.produit || encaissement.Produit || "Non spécifié"}
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
                                                        {encaissement.numeroBordereau || "Non spécifié"}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <button
                                type="button"
                                className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-500 dark:hover:bg-gray-700"
                                onClick={onClose}
                            >
                                <IconX className="h-6 w-6" />
                            </button>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 space-y-6 overflow-y-auto p-6">
                        {loading ? (
                            <div className="flex items-center justify-center h-64">
                                <div className="flex flex-col items-center">
                                    <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                                    <p className="mt-4 text-sm text-gray-600">Chargement des détails...</p>
                                </div>
                            </div>
                        ) : !encaissement ? (
                            <div className="flex items-center justify-center h-64">
                                <div className="text-center">
                                    <p className="text-gray-500">Aucune donnée disponible</p>
                                </div>
                            </div>
                        ) : (
                            <>
                                {/* Montants Section */}
                                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900">
                                    <div className="mb-4">
                                        <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                                            Détail des montants
                                        </h3>
                                        <p className="mt-1 text-xs text-gray-500">
                                            Encaissement du {encaissement.dateEncaissement || encaissement["Date Encais"] || "Non spécifié"}
                                        </p>
                                    </div>
                                    <div className="grid grid-cols-3 gap-4">
                                        <div>
                                            <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                                {formatNumberSafe(encaissement["Montant caisse (A)"] || encaissement.montantRestitutionCaisse)} F CFA
                                            </p>
                                            <p className="text-sm text-gray-500">Montant Caisses</p>
                                        </div>
                                        <div>
                                            <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                                {formatNumberSafe(encaissement["Montant bordereau (B)"] || encaissement.montantBordereauBanque)} F CFA
                                            </p>
                                            <p className="text-sm text-gray-500">Montant Cloturé</p>
                                        </div>
                                        <div>
                                            <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                                {formatNumberSafe(encaissement["Montant relevé (C)"] || encaissement.montantReleve || encaissement.currentValidation?.montantReleve || encaissement.validationEncaissement?.montantReleve)} F CFA
                                            </p>
                                            <p className="text-sm text-gray-500">Montant Relevé Bancaire</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Écarts Section */}
                                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900">
                                    <div className="mb-4">
                                        <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                                            Écarts
                                        </h3>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className={`text-lg font-semibold ${(() => {
                                                const ecartCaisseBanque = encaissement.ecartCaisseBanque || 0;
                                                return ecartCaisseBanque < 0 ? "text-red-500" : "text-green-500";
                                            })()}`}
                                            >
                                                {formatNumberSafe(encaissement.ecartCaisseBanque || 0)} F CFA
                                            </p>
                                            <p className="text-sm text-gray-500">Écart (A-B)</p>
                                        </div>
                                        <div>
                                            <p className={`text-lg font-semibold ${(() => {
                                                const montantCaisse = encaissement["Montant caisse (A)"] || encaissement.montantRestitutionCaisse || 0;
                                                const montantReleve = encaissement["Montant relevé (C)"] || encaissement.montantReleve || encaissement.currentValidation?.montantReleve || encaissement.validationEncaissement?.montantReleve || 0;
                                                const ecart = montantCaisse - montantReleve;
                                                return ecart < 0 ? "text-red-500" : "text-green-500";
                                            })()}`}
                                            >
                                                {formatNumberSafe((() => {
                                                    const montantCaisse = encaissement["Montant caisse (A)"] || encaissement.montantRestitutionCaisse || 0;
                                                    const montantReleve = encaissement["Montant relevé (C)"] || encaissement.montantReleve || encaissement.currentValidation?.montantReleve || encaissement.validationEncaissement?.montantReleve || 0;
                                                    return montantCaisse - montantReleve;
                                                })())} F CFA
                                            </p>
                                            <p className="text-sm text-gray-500">Écart (A-C)</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Observations Section */}
                                {(encaissement["Observation(A-B)"] || encaissement["Observation(B-C)"]) && (
                                    <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
                                        <div className="mb-4">
                                            <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                                                Observations
                                            </h3>
                                        </div>

                                        {encaissement["Observation(A-B)"] && (
                                            <div className="mb-4">
                                                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                                    Observation Caisse (A-B)
                                                </p>
                                                <p className="mt-1 text-sm text-gray-900 dark:text-white">
                                                    {encaissement["Observation(A-B)"]}
                                                </p>
                                            </div>
                                        )}

                                        {encaissement["Observation(B-C)"] && (
                                            <div>
                                                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                                    Observation Banque (B-C)
                                                </p>
                                                <p className="mt-1 text-sm text-gray-900 dark:text-white">
                                                    {encaissement["Observation(B-C)"]}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Informations générales */}
                                <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
                                    <div className="mb-4">
                                        <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                                            Informations générales
                                        </h3>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                                Direction Régionale
                                            </p>
                                            <p className="mt-1 text-sm text-gray-900 dark:text-white">
                                                {encaissement.directionRegionale || encaissement.DR || "Non spécifié"}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                                Code Exploitation
                                            </p>
                                            <p className="mt-1 text-sm text-gray-900 dark:text-white">
                                                {encaissement.codeExpl || encaissement.EXP || "Non spécifié"}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                                Libellé Exploitation
                                            </p>
                                            <p className="mt-1 text-sm text-gray-900 dark:text-white">
                                                {encaissement.libelleExpl || "Non spécifié"}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                                Produit
                                            </p>
                                            <p className="mt-1 text-sm text-gray-900 dark:text-white">
                                                {encaissement.produit || "Non spécifié"}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                                Mode de règlement
                                            </p>
                                            <p className="mt-1 text-sm text-gray-900 dark:text-white">
                                                {encaissement.modeReglement || encaissement["Caisse mode"] || "Non spécifié"}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                                Date d'encaissement
                                            </p>
                                            <p className="mt-1 text-sm text-gray-900 dark:text-white">
                                                {encaissement.dateEncaissement || encaissement["Date Encais"] || "Non spécifié"}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Informations Caissière */}
                                <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
                                    <div className="mb-4">
                                        <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                                            Informations Caissière
                                        </h3>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                                Matricule Caissière
                                            </p>
                                            <p className="mt-1 text-sm font-bold text-red-600 dark:text-red-400">
                                                {(encaissement as any).matriculeCaissiere || (encaissement as any).matricule || (encaissement as any).caissiere || "Non spécifié"}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                                Nom complet Caissière
                                            </p>
                                            <p className="mt-1 text-sm text-gray-900 dark:text-white">
                                                {(encaissement as any).fullnameCaissiere || (encaissement as any).fullname || (encaissement as any).nomComplet || "Non spécifié"}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                                Code Caisse
                                            </p>
                                            <p className="mt-1 text-sm text-gray-900 dark:text-white">
                                                {encaissement.codeCaisse || "Non spécifié"}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                                Numéro Caisse
                                            </p>
                                            <p className="mt-1 text-sm text-gray-900 dark:text-white">
                                                {encaissement.numeroCaisse || "Non spécifié"}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                                Numéro Journée Caisse
                                            </p>
                                            <p className="mt-1 text-sm text-gray-900 dark:text-white">
                                                {encaissement.numeroJourneeCaisse || "Non spécifié"}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Informations Banque */}
                                <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
                                    <div className="mb-4">
                                        <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                                            Informations Banque
                                        </h3>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                                Banque
                                            </p>
                                            <p className="mt-1 text-sm text-gray-900 dark:text-white">
                                                {encaissement.banque || "Non spécifié"}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                                Compte Banque
                                            </p>
                                            <p className="mt-1 text-sm text-gray-900 dark:text-white">
                                                {encaissement.compteBanque || "Non spécifié"}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                                Code Banque
                                            </p>
                                            <p className="mt-1 text-sm text-gray-900 dark:text-white">
                                                {encaissement.codeBanque || "Non spécifié"}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                                Numéro Bordereau
                                            </p>
                                            <p className="mt-1 text-sm text-gray-900 dark:text-white">
                                                {encaissement.numeroBordereau || "Non spécifié"}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Détail des montants par type */}
                                <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
                                    <div className="mb-4">
                                        <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                                            Détail des montants par type
                                        </h3>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                                Montant Caisse
                                            </p>
                                            <p className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">
                                                {formatNumberSafe(encaissement.montantEspece)} F CFA
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                                Montant Cloturé
                                            </p>
                                            <p className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">
                                                {formatNumberSafe(encaissement.montantBordereauBanqueEspece)} F CFA
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Validation actuelle */}
                                {encaissement.currentValidation && (
                                    <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-700 dark:bg-emerald-900/20">
                                        <div className="mb-4">
                                            <h3 className="text-sm font-medium text-emerald-800 dark:text-emerald-200">
                                                Validation actuelle
                                            </h3>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">

                                            <div>
                                                <p className="text-xs font-medium text-emerald-600 dark:text-emerald-300">
                                                    Niveau actuel
                                                </p>
                                                <p className={`mt-1 text-sm font-semibold ${getValidationLevelColor(encaissement.currentValidation.nextLevelValidation)}`}>
                                                    {encaissement.currentValidation.nextLevelValidation || "Aucun"}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-xs font-medium text-emerald-600 dark:text-emerald-300">
                                                    Date de validation
                                                </p>
                                                <p className="mt-1 text-sm text-emerald-700 dark:text-emerald-200">
                                                    {encaissement.currentValidation.dateValidation ? new Date(encaissement.currentValidation.dateValidation).toLocaleString('fr-FR') : "Non spécifié"}
                                                </p>
                                            </div>

                                        </div>
                                    </div>
                                )}

                                {/* Historique des validations */}
                                {encaissement.validationEncaissement && encaissement.validationEncaissement.length > 0 && (
                                    <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
                                        <div className="mb-4">
                                            <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                                                Historique des validations
                                            </h3>
                                        </div>
                                        <div className="space-y-3">
                                            {encaissement.validationEncaissement.map((validation: any, index: number) => (
                                                <div key={validation.id || index} className="rounded-lg border border-gray-100 bg-gray-50 p-3 dark:border-gray-600 dark:bg-gray-700">
                                                    <div className="grid grid-cols-3 gap-3">
                                                        <div>
                                                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                                                Niveau
                                                            </p>
                                                            <p className={`mt-1 text-sm font-semibold ${getValidationLevelColor(validation.validationLevel)}`}>
                                                                {validation.validationLevel}
                                                            </p>
                                                        </div>
                                                        <div>
                                                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                                                Date
                                                            </p>
                                                            <p className="mt-1 text-sm text-gray-900 dark:text-white">
                                                                {validation.dateValidation ? new Date(validation.dateValidation).toLocaleString('fr-FR') : "Non spécifié"}
                                                            </p>
                                                        </div>
                                                        <div>
                                                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                                                Validateur
                                                            </p>
                                                            <p className="mt-1 text-sm text-gray-900 dark:text-white">
                                                                {validation.user ? `${validation.user.firstname} ${validation.user.lastname}` : "Non spécifié"}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="border-t border-gray-200 p-6 dark:border-gray-700">
                        <button
                            type="button"
                            className="w-full rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                            onClick={onClose}
                        >
                            Fermer
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default EncaissementDetailsModal; 