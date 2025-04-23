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
}

const EncaissementDetailsModal: React.FC<EncaissementDetailsModalProps> = ({
    isOpen,
    onClose,
    encaissement,
    formatNumber,
}) => {
    if (!isOpen || !encaissement) return null;

    // Fonction de formatage par défaut si aucune n'est fournie
    const formatNumberSafe = (num: number | undefined): string => {
        if (formatNumber) return formatNumber(num);

        // Formatage par défaut
        if (num === undefined || num === null) return "0";
        return new Intl.NumberFormat('fr-FR').format(num);
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
                                    <p className="text-sm text-gray-500">Montant Bordereaux</p>
                                </div>
                                <div>
                                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                        {formatNumberSafe(encaissement["Montant relevé (C)"] || encaissement.montantReleve)} F CFA
                                    </p>
                                    <p className="text-sm text-gray-500">Montant Relevé</p>
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
                                    <p className={`text-lg font-semibold ${(encaissement["Ecart(A-B)"] ||
                                        (encaissement["Montant caisse (A)"] - encaissement["Montant bordereau (B)"])) < 0
                                        ? "text-red-500" : "text-green-500"}`}
                                    >
                                        {formatNumberSafe(encaissement["Ecart(A-B)"] ||
                                            (encaissement["Montant caisse (A)"] - encaissement["Montant bordereau (B)"]))} F CFA
                                    </p>
                                    <p className="text-sm text-gray-500">Écart (A-B)</p>
                                </div>
                                <div>
                                    <p className={`text-lg font-semibold ${(encaissement["Ecart(B-C)"] ||
                                        (encaissement["Montant bordereau (B)"] - encaissement["Montant relevé (C)"])) < 0
                                        ? "text-red-500" : "text-green-500"}`}
                                    >
                                        {formatNumberSafe(encaissement["Ecart(B-C)"] ||
                                            (encaissement["Montant bordereau (B)"] - encaissement["Montant relevé (C)"]))} F CFA
                                    </p>
                                    <p className="text-sm text-gray-500">Écart (B-C)</p>
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

                        {/* Détails supplémentaires */}
                        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
                            <div className="mb-4">
                                <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                                    Autres informations
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
                                        Mode de règlement
                                    </p>
                                    <p className="mt-1 text-sm text-gray-900 dark:text-white">
                                        {encaissement.modeReglement || encaissement["Caisse mode"] || "Non spécifié"}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                        Date de clôture
                                    </p>
                                    <p className="mt-1 text-sm text-gray-900 dark:text-white">
                                        {encaissement["Date cloture"] || "Non spécifié"}
                                    </p>
                                </div>
                            </div>
                        </div>
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