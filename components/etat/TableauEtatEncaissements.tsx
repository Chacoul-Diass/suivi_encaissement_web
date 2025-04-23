"use client";

import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { TAppDispatch, TRootState } from "@/store";
import { DataTable, DataTableColumn } from "mantine-datatable";

import IconDownload from "@/components/icon/icon-download";
import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css";
import IconEye from "../icon/icon-eye";
import { useRouter } from "next/navigation";
import IconExcel from "../icon/excel";
import Csv from "../icon/csv";
import Pdf from "../icon/pdf";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import 'jspdf-autotable';
import EncaissementActions from "@/components/encaissements/EncaissementActions";
import { MenuName } from "@/types/habilitation";
import { API_AUTH_SUIVI } from "@/config/constants";
import EncaissementDetailsModal from "../modales/EncaissementDetailsModal";

interface TableauEtatEncaissementsProps {
    data: any[];
    loading: boolean;
    pagination: {
        currentPage: number;
        previousPage: number | null;
        nextPage: number | null;
        count: number;
        totalCount: number;
        totalPages: number;
    };
    handlePageChange: (page: number) => void;
    handleLimitChange: (limit: number) => void;
    onRefresh?: () => void;
}

// Définir un type pour les données d'encaissement
interface Encaissement {
    id: number;
    directionRegionale: string;
    codeExpl: string;
    dateEncaissement: string;
    banque: string;
    produit: string;
    compteBanque: string | null;
    numeroBordereau: string;
    journeeCaisse: string;
    modeReglement: string;
    montantRestitutionCaisse: number;
    montantBordereauBanque: number;
    ecartCaisseBanque: number;
    statut: string;
    validationEncaissement: any | null;
    documents: Array<{
        id: number;
        encaissementId: number;
        fileName: string;
        filePath: string;
    }>;
}

const TableauEtatEncaissements: React.FC<TableauEtatEncaissementsProps> = ({
    data = [],
    loading,
    pagination,
    handlePageChange,
    handleLimitChange,
    onRefresh,
}) => {
    const router = useRouter();
    const dispatch = useDispatch<TAppDispatch>();

    // États pour le modal de détails
    const [selectedEncaissement, setSelectedEncaissement] = useState<Encaissement | null>(null);
    const [detailsModalOpen, setDetailsModalOpen] = useState(false);

    // Ouverture du modal avec l'encaissement sélectionné
    const openDetailsModal = (encaissement: Encaissement) => {
        setSelectedEncaissement(encaissement);
        setDetailsModalOpen(true);
    };

    // Fermeture du modal
    const closeDetailsModal = () => {
        setDetailsModalOpen(false);
        setSelectedEncaissement(null);
    };

    // Log pour le débogage
    useEffect(() => {
        console.log("TableauEtatEncaissements - État:", {
            loading,
            dataLength: data.length,
            pagination,
            normalizedDataLength: normalizeData(data).length
        });
    }, [data, loading, pagination]);

    // Formatage des montants en francs CFA
    const formatMontant = (montant: number): string => {
        return new Intl.NumberFormat("fr-FR", {
            style: "currency",
            currency: "XOF",
            minimumFractionDigits: 0,
        }).format(montant);
    };

    // Conversion de la date au format dd/mm/yyyy
    const formatDisplayDate = (dateString: string): string => {
        try {
            // Format attendu: "17 07:43:16/04/2024"
            const parts = dateString.split(" ");
            const day = parts[0];
            const monthParts = parts[1].split("/");
            const month = monthParts[1];
            const year = monthParts[2];

            return `${day}/${month}/${year}`;
        } catch (error) {
            return dateString;
        }
    };

    // Normalisation des données pour s'assurer qu'elles correspondent à l'interface Encaissement
    const normalizeData = (items: any): Encaissement[] => {
        // Vérifier si items est un tableau
        if (!Array.isArray(items)) {
            console.error("Les données reçues ne sont pas un tableau:", items);
            // Si items n'est pas un tableau mais un objet avec une propriété data
            if (items && typeof items === 'object' && Array.isArray(items.data)) {
                items = items.data;
            } else {
                // Si impossible de récupérer un tableau, retourner un tableau vide
                console.warn("Impossible de trouver un tableau dans les données reçues");
                return [];
            }
        }

        return items.map((item: any) => ({
            id: item.id || 0,
            directionRegionale: item.directionRegionale || '',
            codeExpl: item.codeExpl || '',
            dateEncaissement: item.dateEncaissement || '',
            banque: item.banque || '',
            produit: item.produit || '',
            compteBanque: item.compteBanque,
            numeroBordereau: item.numeroBordereau || '',
            journeeCaisse: item.journeeCaisse || '',
            modeReglement: item.modeReglement || '',
            montantRestitutionCaisse: item.montantRestitutionCaisse || 0,
            montantBordereauBanque: item.montantBordereauBanque || 0,
            ecartCaisseBanque: item.ecartCaisseBanque || 0,
            statut: item.statut || '',
            validationEncaissement: item.validationEncaissement,
            documents: item.documents || []
        }));
    };

    // Normaliser les données avant de les utiliser
    const normalizedData = normalizeData(data);

    // Configuration des colonnes du tableau
    const columns: DataTableColumn<Encaissement>[] = [
        {
            accessor: "directionRegionale",
            title: "Direction",
            sortable: true,
            width: 100,
        },
        {
            accessor: "codeExpl",
            title: "Code Expl",
            sortable: true,
            width: 100,
        },
        {
            accessor: "dateEncaissement",
            title: "Date",
            sortable: true,
            width: 120,
            render: ({ dateEncaissement }: { dateEncaissement: string }) => (
                <span>{formatDisplayDate(dateEncaissement)}</span>
            ),
        },
        {
            accessor: "banque",
            title: "Banque",
            sortable: true,
            width: 200,
        },
        {
            accessor: "produit",
            title: "Produit",
            sortable: true,
            width: 100,
        },
        {
            accessor: "modeReglement",
            title: "Mode",
            sortable: true,
            width: 80,
        },
        {
            accessor: "montantRestitutionCaisse",
            title: "Montant Caisse",
            sortable: true,
            width: 150,
            render: ({ montantRestitutionCaisse }: { montantRestitutionCaisse: number }) => (
                <span className="font-medium">{formatMontant(montantRestitutionCaisse)}</span>
            ),
        },
        {
            accessor: "montantBordereauBanque",
            title: "Montant Banque",
            sortable: true,
            width: 150,
            render: ({ montantBordereauBanque }: { montantBordereauBanque: number }) => (
                <span className="font-medium">{formatMontant(montantBordereauBanque)}</span>
            ),
        },
        {
            accessor: "ecartCaisseBanque",
            title: "Écart",
            sortable: true,
            width: 120,
            render: ({ ecartCaisseBanque }: { ecartCaisseBanque: number }) => (
                <span className={`font-medium ${ecartCaisseBanque !== 0 ? "text-red-500" : "text-green-500"}`}>
                    {formatMontant(ecartCaisseBanque)}
                </span>
            ),
        },
        {
            accessor: "statut",
            title: "Statut",
            sortable: true,
            width: 120,
            render: ({ statut }: { statut: string }) => {
                const statusInfo = getStatusInfo(statut);
                return (
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${statusInfo.classes}`}>
                        {statut}
                    </span>
                );
            },
        },
        {
            accessor: "actions",
            title: "Actions",
            width: 100,
            render: (record: Encaissement) => (
                <div className="flex items-center justify-center space-x-2">
                    {/* Visualisation */}
                    <button
                        type="button"
                        className="rounded-lg p-1.5 text-gray-600 transition-all duration-300 hover:bg-primary/10 hover:text-primary"
                        title="Voir les détails"
                        onClick={() => openDetailsModal(record)}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                            <circle cx="12" cy="12" r="3"></circle>
                        </svg>
                    </button>

                    {/* Menu d'exportation */}
                    <div className="relative group">
                        <button
                            className="rounded-lg p-1.5 text-gray-600 transition-all duration-300 hover:bg-primary/10 hover:text-primary"
                            title="Exporter"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                <polyline points="7 10 12 15 17 10"></polyline>
                                <line x1="12" y1="15" x2="12" y2="3"></line>
                            </svg>
                        </button>
                        <div className="absolute right-0 top-full mt-1 w-36 bg-white shadow-lg rounded-md py-1 z-50 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-200 transform scale-95 group-hover:scale-100 origin-top-right border border-gray-200">
                            <button
                                type="button"
                                className="w-full flex items-center px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100"
                                onClick={() => handleExportSingleRow(record, 'excel')}
                            >
                                <IconExcel className="mr-2 h-4 w-4 text-green-600" />
                                <span>Excel</span>
                            </button>
                            <button
                                type="button"
                                className="w-full flex items-center px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100"
                                onClick={() => handleExportSingleRow(record, 'pdf')}
                            >
                                <Pdf className="mr-2 h-4 w-4 text-red-600" />
                                <span>PDF</span>
                            </button>
                            <button
                                type="button"
                                className="w-full flex items-center px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100"
                                onClick={() => handleExportSingleRow(record, 'csv')}
                            >
                                <Csv className="mr-2 h-4 w-4 text-blue-600" />
                                <span>CSV</span>
                            </button>
                        </div>
                    </div>
                </div>
            ),
        },
    ];

    // Fonction pour déterminer les informations de style du statut
    const getStatusInfo = (status: string): { color: string, classes: string } => {
        switch (status.toUpperCase()) {
            case "CHARGES":
            case "CHARGÉS":
                return {
                    color: "primary",
                    classes: "bg-primary-light text-primary"
                };
            case "VERIFIES":
            case "VÉRIFIÉS":
                return {
                    color: "secondary",
                    classes: "bg-secondary-light text-secondary"
                };
            case "VALIDES":
            case "VALIDÉS":
                return {
                    color: "success",
                    classes: "bg-success-light text-success"
                };
            case "REJETES":
            case "REJETÉS":
                return {
                    color: "danger",
                    classes: "bg-danger-light text-danger"
                };
            case "TRAITES":
            case "TRAITÉS":
                return {
                    color: "warning",
                    classes: "bg-warning-light text-warning"
                };
            default:
                return {
                    color: "gray-500",
                    classes: "bg-gray-100 text-gray-500"
                };
        }
    };

    // Gestion de la pagination
    const handleChangePage = (page: number) => {
        handlePageChange(page);
    };

    // Ajouter ces fonctions pour l'export de ligne unique
    const handleExportSingleRow = (record: Encaissement, format: 'excel' | 'csv' | 'pdf') => {
        switch (format) {
            case 'excel':
                exportToExcel(record);
                break;
            case 'csv':
                exportToCSV(record);
                break;
            case 'pdf':
                exportToPDF(record);
                break;
        }
    };

    const exportToExcel = (record: Encaissement) => {
        const worksheet = XLSX.utils.json_to_sheet([record]);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Encaissement");
        XLSX.writeFile(workbook, `encaissement_${record.id}.xlsx`);
    };

    const exportToCSV = (record: Encaissement) => {
        const worksheet = XLSX.utils.json_to_sheet([record]);
        const csv = XLSX.utils.sheet_to_csv(worksheet);
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `encaissement_${record.id}.csv`);
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    };

    const exportToPDF = (record: Encaissement) => {
        const doc = new jsPDF({ orientation: "landscape" });

        doc.text("Détail d'encaissement", 14, 15);

        const headers = [
            ["Direction", "Code", "Date", "Banque", "Produit", "Mode", "Montant Caisse", "Montant Banque", "Écart", "Statut"]
        ];

        const body = [[
            record.directionRegionale || "N/A",
            record.codeExpl || "N/A",
            record.dateEncaissement ? formatDisplayDate(record.dateEncaissement) : "N/A",
            record.banque || "N/A",
            record.produit || "N/A",
            record.modeReglement || "N/A",
            formatMontant(record.montantRestitutionCaisse || 0),
            formatMontant(record.montantBordereauBanque || 0),
            formatMontant(record.ecartCaisseBanque || 0),
            record.statut || "N/A"
        ]];

        doc.autoTable({
            head: headers,
            body: body,
            startY: 20,
            theme: "grid",
            headStyles: { fillColor: [54, 162, 235], textColor: 255 },
            styles: {
                fontSize: 8,
                cellPadding: 3,
                overflow: "linebreak",
            },
            margin: { top: 20, left: 10, right: 10 },
        });

        doc.save(`encaissement_${record.id}.pdf`);
    };

    // Ajout des fonctions pour l'export global des données
    const handleExportAllData = (format: 'excel' | 'csv' | 'pdf') => {
        console.log(`Démarrage de l'exportation en format ${format}...`);

        try {
            // Récupérer l'URL de l'API et le token
            const token = localStorage.getItem('accessToken');
            const apiUrl = API_AUTH_SUIVI;

            if (!token) {
                alert("Vous n'êtes pas authentifié. Veuillez vous reconnecter.");
                return;
            }

            // Afficher un message de chargement
            alert("Récupération des données en cours...");

            // Créer l'URL pour récupérer toutes les données
            const dataUrl = `${apiUrl}/encaissements?all=true`;

            // Récupérer d'abord les données complètes
            fetch(dataUrl, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
                    }
                    return response.json();
                })
                .then(response => {
                    // Accéder directement aux données dans response.data
                    console.log("Réponse complète de l'API:", response);

                    if (!response || !response.data) {
                        throw new Error("Format de réponse inattendu: propriété 'data' manquante");
                    }

                    const data = response.data.result;
                    console.log(`Données récupérées: ${Array.isArray(data) ? data.length : 'non-tableau'} éléments`);

                    // Selon le format demandé, générer le fichier approprié
                    switch (format) {
                        case 'excel':
                            generateExcelFile(data);
                            break;
                        case 'csv':
                            generateCSVFile(data);
                            break;

                        default:
                            throw new Error(`Format non supporté: ${format}`);
                    }
                })
                .catch(error => {
                    console.error(`Erreur lors de l'exportation ${format}:`, error);
                    alert(`Erreur lors de l'exportation: ${error.message}`);
                });

        } catch (error: any) {
            console.error("Erreur lors de la préparation de l'exportation:", error);
            alert(`Erreur: ${error.message}`);
        }
    };

    // Fonction pour générer un fichier Excel
    const generateExcelFile = (data: any) => {
        try {
            console.log("Données reçues pour l'exportation Excel:", data);

            // Vérifier le format des données reçues
            let dataToNormalize = data;
            if (data && typeof data === 'object' && !Array.isArray(data)) {
                // Si c'est un objet avec une propriété 'data' ou 'items'
                if (Array.isArray(data.data)) {
                    dataToNormalize = data.data;
                } else if (Array.isArray(data.items)) {
                    dataToNormalize = data.items;
                } else {
                    // Essayer de transformer l'objet en tableau si possible
                    const keys = Object.keys(data).filter(key => !isNaN(Number(key)));
                    if (keys.length > 0) {
                        dataToNormalize = keys.map(key => data[key]);
                    }
                }
            }

            // Normaliser les données
            const normalizedData = normalizeData(dataToNormalize);
            console.log(`Données normalisées pour Excel: ${normalizedData.length} éléments`);

            if (normalizedData.length === 0) {
                throw new Error("Aucune donnée à exporter");
            }

            // Préparer les données pour l'export Excel
            const worksheet = XLSX.utils.json_to_sheet(normalizedData);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Encaissements");

            // Générer le fichier Excel
            const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
            const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

            // Télécharger le fichier
            saveAs(blob, 'etat_encaissements.xlsx');

            console.log('Exportation Excel réussie!');
        } catch (error) {
            console.error("Erreur lors de la génération du fichier Excel:", error);
            alert(`Erreur lors de la génération du fichier Excel: ${error}`);
        }
    };

    // Fonction pour générer un fichier CSV
    const generateCSVFile = (data: any[]) => {
        try {
            // Normaliser les données si nécessaire
            const normalizedData = normalizeData(data);

            // Préparer les données pour l'export CSV
            const worksheet = XLSX.utils.json_to_sheet(normalizedData);
            const csvOutput = XLSX.utils.sheet_to_csv(worksheet);

            // Créer le blob et télécharger
            const blob = new Blob([csvOutput], { type: 'text/csv;charset=utf-8;' });
            saveAs(blob, 'etat_encaissements.csv');

            console.log('Exportation CSV réussie!');
        } catch (error) {
            console.error("Erreur lors de la génération du fichier CSV:", error);
            alert(`Erreur lors de la génération du fichier CSV: ${error}`);
        }
    };

    // Fonction pour générer un fichier PDF
    const generatePDFFile = (data: any) => {
        try {
            console.log("Données reçues pour l'exportation PDF:", data);

            // Vérifier le format des données reçues
            let dataToNormalize = data;
            if (data && typeof data === 'object' && !Array.isArray(data)) {
                // Si c'est un objet avec une propriété 'data' ou 'items'
                if (Array.isArray(data.data)) {
                    dataToNormalize = data.data;
                } else if (Array.isArray(data.items)) {
                    dataToNormalize = data.items;
                } else {
                    // Essayer de transformer l'objet en tableau si possible
                    const keys = Object.keys(data).filter(key => !isNaN(Number(key)));
                    if (keys.length > 0) {
                        dataToNormalize = keys.map(key => data[key]);
                    }
                }
            }

            // Normaliser les données
            const normalizedData = normalizeData(dataToNormalize);
            console.log(`Données normalisées pour PDF: ${normalizedData.length} éléments`);

            if (normalizedData.length === 0) {
                throw new Error("Aucune donnée à exporter");
            }

            // Créer un nouveau document PDF avec autoTable
            const doc = new jsPDF({ orientation: 'landscape' });

            // Ajouter un titre
            doc.text("État des encaissements - Rapport complet", 14, 15);

            // Préparer les en-têtes et les données
            const headers = [
                ["Direction", "Code", "Date", "Banque", "Produit", "Mode", "Montant Caisse", "Montant Banque", "Écart", "Statut"]
            ];

            const body = normalizedData.map(item => [
                item.directionRegionale || "N/A",
                item.codeExpl || "N/A",
                item.dateEncaissement ? formatDisplayDate(item.dateEncaissement) : "N/A",
                item.banque || "N/A",
                item.produit || "N/A",
                item.modeReglement || "N/A",
                formatMontant(item.montantRestitutionCaisse || 0),
                formatMontant(item.montantBordereauBanque || 0),
                formatMontant(item.ecartCaisseBanque || 0),
                item.statut || "N/A"
            ]);

            // Vérifier que autoTable est disponible
            if (typeof doc.autoTable !== 'function') {
                console.error("Le plugin autoTable n'est pas correctement chargé");
                // Solution alternative: télécharger en CSV au lieu de PDF
                alert("Erreur lors de la génération du PDF. Téléchargement en CSV à la place.");
                generateCSVFile(data);
                return;
            }

            // Générer le tableau
            (doc as any).autoTable({
                head: headers,
                body: body,
                startY: 20,
                theme: "grid",
                headStyles: { fillColor: [54, 162, 235], textColor: 255 },
                styles: {
                    fontSize: 8,
                    cellPadding: 3,
                    overflow: "linebreak",
                },
                margin: { top: 20, left: 10, right: 10 },
            });

            // Enregistrer le fichier PDF
            doc.save("etat_encaissements.pdf");

            console.log('Exportation PDF réussie!');
        } catch (error) {
            console.error("Erreur lors de la génération du fichier PDF:", error);
            alert(`Erreur lors de la génération du fichier PDF: ${error}`);

            // Solution de secours: proposer le téléchargement en CSV
            if (confirm("Voulez-vous essayer de télécharger les données en format CSV à la place?")) {
                generateCSVFile(data);
            }
        }
    };

    // Fonction utilitaire pour télécharger un blob
    const saveAs = (blob: Blob, fileName: string) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        }, 100);
    };

    return (
        <div className="panel overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
            <div className="p-5">
                <div className="flex items-center justify-between mb-4">
                    <h5 className="text-lg font-semibold text-gray-800">État des encaissements</h5>
                    <div className="flex items-center gap-3">
                        {/* Bouton actualiser */}
                        <button
                            type="button"
                            className="group rounded-lg border border-gray-300 bg-white p-2 text-gray-600 transition-all hover:bg-gray-50"
                            title="Actualiser les données"
                            onClick={() => {
                                if (onRefresh) {
                                    onRefresh();
                                } else {
                                    // Réinitialiser la page à 1 et appeler handlePageChange pour rafraîchir les données
                                    handlePageChange(1);
                                }
                            }}
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="transition-transform duration-300 group-hover:rotate-180"
                            >
                                <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.3" />
                            </svg>
                        </button>

                        {/* Options d'exportation globale */}
                        <div className="flex items-center rounded-lg border border-gray-300 bg-white p-1">
                            <span className="px-2 text-sm font-medium text-gray-700">Exporter tout</span>
                            <div className="flex">
                                <Tippy content="Exporter en Excel" animation="scale" placement="top">
                                    <button
                                        type="button"
                                        className="rounded-lg p-2 text-gray-600 transition-all hover:bg-gray-100"
                                        onClick={() => handleExportAllData('excel')}
                                    >
                                        <IconExcel className="h-5 w-5" />
                                    </button>
                                </Tippy>
                                <Tippy content="Exporter en CSV" animation="scale" placement="top">
                                    <button
                                        type="button"
                                        className="rounded-lg p-2 text-gray-600 transition-all hover:bg-gray-100"
                                        onClick={() => handleExportAllData('csv')}
                                    >
                                        <Csv className="h-5 w-5" />
                                    </button>
                                </Tippy>

                            </div>
                        </div>

                        <select
                            className="rounded-md border border-gray-300 bg-white py-1.5 px-3 text-sm text-gray-700 focus:border-primary focus:outline-none"
                            value={pagination?.count || 10}
                            onChange={(e) => handleLimitChange(Number(e.target.value))}
                        >
                            <option value="5">5 par page</option>
                            <option value="10">10 par page</option>
                            <option value="20">20 par page</option>
                            <option value="50">50 par page</option>
                            <option value="100">100 par page</option>
                        </select>
                    </div>
                </div>

                {/* Afficher un message de débogage si données vides mais non chargement */}
                {data.length === 0 && !loading && (
                    <div className="rounded-md bg-yellow-50 p-3 border border-yellow-200 mb-4">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm text-yellow-700">
                                    Aucun encaissement trouvé. Essayez de modifier vos filtres.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                <div className="overflow-x-auto relative">
                    {loading && (
                        <div className="absolute inset-0 bg-white bg-opacity-70 z-10 flex items-center justify-center">
                            <div className="flex flex-col items-center">
                                <div className="h-16 w-16 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                                <p className="mt-3 text-base font-medium text-gray-700">Chargement en cours...</p>
                            </div>
                        </div>
                    )}
                    <DataTable
                        records={normalizedData}
                        columns={columns}
                        striped
                        highlightOnHover
                        idAccessor="id"
                        minHeight={400}
                        totalRecords={pagination?.totalCount || 0}
                        recordsPerPage={pagination?.count || 10}
                        page={pagination?.currentPage || 1}
                        onPageChange={handleChangePage}
                        fetching={loading}
                        noRecordsText="Aucun encaissement trouvé"
                        loadingText="Chargement des données..."
                        loaderSize="xl"
                        loaderColor="primary"
                    />
                </div>

                {/* Statistiques d'affichage simplifiées */}
                <div className="mt-3 text-sm text-gray-500">
                    {normalizedData.length} encaissements affichés sur {pagination?.totalCount || 0}
                </div>

                {/* Modal de détails d'encaissement */}
                <EncaissementDetailsModal
                    isOpen={detailsModalOpen}
                    onClose={closeDetailsModal}
                    encaissement={selectedEncaissement}
                    formatNumber={formatMontant}
                    formatDate={formatDisplayDate}
                />
            </div>
        </div>
    );
};

export default TableauEtatEncaissements; 