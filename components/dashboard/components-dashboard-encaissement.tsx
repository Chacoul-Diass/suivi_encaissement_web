"use client";
import IconCashBanknotes from "@/components/icon/icon-cash-banknotes";

import Link from "next/link";
import React, { useEffect, useState } from "react";
import ReactApexChart from "react-apexcharts";
import { useDispatch, useSelector } from "react-redux";
import PerfectScrollbar from "react-perfect-scrollbar";
import IconHome from "../icon/icon-home";
import IconBox from "../icon/icon-box";
import Select from "react-select";
import { TAppDispatch, TRootState } from "@/store";
import IconCreditCard from "../icon/icon-credit-card";
import IconTag from "../icon/icon-tag";
import IconInbox from "../icon/icon-inbox";
import IconCaretDown from "../icon/icon-caret-down";

import getUserPermission from "@/utils/user-info";
import { fetchSecteurs } from "@/store/reducers/select/secteur.slice";
import IconRefresh from "../icon/icon-refresh";
import { fetchDirectionRegionales } from "@/store/reducers/select/dr.slice";
import IconFilter from "../icon/icon-filter";

import DashboardTutorial from "../tutorial/TutorialTable-dashboard";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

import { API_AUTH_SUIVI } from "@/config/constants";
import axiosInstance from "@/utils/axios";
import IconX from "../icon/icon-x";
import { Toastify } from "@/utils/toast";
import { DataTable } from "mantine-datatable";
import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css";
import IconEye from "../icon/icon-eye";
import IconCheck from "../icon/icon-check";
import IconFileText from "../icon/icon-file-text";
import IconExcelFile from "../icon/icon-excel-file";

// Composant pour la modale d'alertes
interface AlertItem {
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
  montantReleve: number;
  isCorrect: number;
  montantRestitutionCaisse: number;
  montantBordereauBanque: number;
  ecartCaisseBanque: number;
  validationEncaissement: any;
}

interface PaginationInfo {
  currentPage: number;
  previousPage: number | null;
  nextPage: number | null;
  count: number;
  totalCount: number;
  totalPages: number;
}

interface AlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  alerts: AlertItem[];
  loading: boolean;
  pagination: PaginationInfo | null;
  onPageChange: (page: number) => void;
}

const AlertModal = ({ isOpen, onClose, alerts, loading, pagination, onPageChange }: AlertModalProps) => {
  if (!isOpen) return null;

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("fr-FR").format(num);
  };

  const [pageSize, setPageSize] = useState(5);
  const [sortStatus, setSortStatus] = useState<{ columnAccessor: string; direction: 'asc' | 'desc' }>({
    columnAccessor: 'id',
    direction: 'asc',
  });
  const [searchTerm, setSearchTerm] = useState("");
  const PAGE_SIZES = [5, 10, 20, 30, 50];

  const handleViewDetails = (row: AlertItem) => {
    // Implémenter l'affichage des détails
    console.log("Voir détails de l'alerte:", row);
    Toastify("success", "Fonctionnalité de détail en cours de développement");
  };

  // Filtrer les données selon le terme de recherche
  const filteredAlerts = alerts?.filter((alert: AlertItem) => {
    if (!searchTerm) return true;
    const searchValue = searchTerm.toLowerCase();
    return (
      (alert.directionRegionale && alert.directionRegionale.toLowerCase().includes(searchValue)) ||
      (alert.codeExpl && alert.codeExpl.toLowerCase().includes(searchValue)) ||
      (alert.banque && alert.banque.toLowerCase().includes(searchValue)) ||
      (alert.numeroBordereau && alert.numeroBordereau.toLowerCase().includes(searchValue)) ||
      (alert.produit && alert.produit.toLowerCase().includes(searchValue))
    );
  });

  // Calculer les statistiques seulement si des alertes sont disponibles
  const hasAlerts = alerts && alerts.length > 0;
  const positiveEcarts = hasAlerts ? alerts.filter(a => a.ecartCaisseBanque > 0).length : 0;
  const negativeEcarts = hasAlerts ? alerts.filter(a => a.ecartCaisseBanque < 0).length : 0;
  const zeroEcarts = hasAlerts ? alerts.filter(a => a.ecartCaisseBanque === 0).length : 0;

  // Fonction pour exporter en CSV
  const exportToCSV = async () => {
    try {
      // Afficher un indicateur de chargement via le toast
      Toastify("success", "Préparation du fichier CSV en cours...");

      // Récupérer toutes les données sans pagination
      const response: any = await axiosInstance.get(
        `${API_AUTH_SUIVI}/encaissements/alerts/0?all=true`
      );

      if (response?.error !== false || !response?.data?.result?.length) {
        Toastify("error", "Aucune donnée à exporter");
        return;
      }

      const allAlerts = response?.data?.result || [];

      // En-têtes CSV
      const headers = [
        "Direction Régionale",
        "Code Exploitation",
        "Date Encaissement",
        "Banque",
        "Produit",
        "Numéro Bordereau",
        "Montant Caisse",
        "Montant Bordereau",
        "Écart"
      ];

      // Formater les données
      const csvData = allAlerts.map((alert: AlertItem) => [
        alert.directionRegionale || "",
        alert.codeExpl || "",
        alert.dateEncaissement || "",
        alert.banque || "",
        alert.produit || "",
        alert.numeroBordereau || "",
        alert.montantRestitutionCaisse.toString(),
        alert.montantBordereauBanque.toString(),
        alert.ecartCaisseBanque.toString()
      ]);

      // Combiner les en-têtes et les données
      const csvContent = [
        headers.join(","),
        ...csvData.map((row: string[]) => row.join(","))
      ].join("\n");

      // Créer un blob et un lien de téléchargement
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `alertes_encaissement_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      Toastify("success", `Export CSV réussi (${allAlerts.length} enregistrements)`);
    } catch (error) {
      console.error("Erreur lors de l'export CSV:", error);
      Toastify("error", "Échec de l'export CSV");
    }
  };

  // Fonction pour exporter en Excel (utilise le blob CSV avec extension .xlsx)
  const exportToExcel = async () => {
    try {
      // Afficher un indicateur de chargement via le toast
      Toastify("success", "Préparation du fichier Excel en cours...");

      // Récupérer toutes les données sans pagination
      const response: any = await axiosInstance.get(
        `${API_AUTH_SUIVI}/encaissements/alerts/0?all=true`
      );

      if (response?.error !== false || !response?.data?.result?.length) {
        Toastify("error", "Aucune donnée à exporter");
        return;
      }

      const allAlerts = response?.data?.result || [];

      // Vérifier si le nombre de lignes dépasse 1000
      if (allAlerts.length > 1000) {
        // Avertir l'utilisateur
        if (!confirm(`Attention: Le fichier contient ${allAlerts.length} lignes, ce qui pourrait causer des problèmes d'ouverture avec Excel. Voulez-vous continuer quand même?`)) {
          Toastify("warning", "Export Excel annulé");
          return;
        }
      }

      // En-têtes Excel
      const headers = [
        "Direction Régionale",
        "Code Exploitation",
        "Date Encaissement",
        "Banque",
        "Produit",
        "Numéro Bordereau",
        "Montant Caisse",
        "Montant Bordereau",
        "Écart"
      ];

      // Formater les données
      const excelData = allAlerts.map((alert: AlertItem) => [
        alert.directionRegionale || "",
        alert.codeExpl || "",
        alert.dateEncaissement || "",
        alert.banque || "",
        alert.produit || "",
        alert.numeroBordereau || "",
        alert.montantRestitutionCaisse.toString(),
        alert.montantBordereauBanque.toString(),
        alert.ecartCaisseBanque.toString()
      ]);

      // Combiner les en-têtes et les données
      const csvContent = [
        headers.join("\t"),
        ...excelData.map((row: string[]) => row.join("\t"))
      ].join("\n");

      // Créer un blob et un lien de téléchargement
      const blob = new Blob([csvContent], { type: "application/vnd.ms-excel" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `alertes_encaissement_${new Date().toISOString().split('T')[0]}.xlsx`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      Toastify("success", `Export Excel réussi (${allAlerts.length} enregistrements)`);
    } catch (error) {
      console.error("Erreur lors de l'export Excel:", error);
      Toastify("error", "Échec de l'export Excel");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 backdrop-blur-sm">
      <div className="relative flex h-[90vh] w-[95%] max-w-[1600px] flex-col rounded-xl bg-white shadow-2xl dark:bg-gray-800 md:w-[90%]">
        {/* Header avec dégradé */}
        <div className="rounded-t-xl bg-gradient-to-r from-primary to-primary/80 p-6 text-white">
          <div className="mb-0 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h3 className="text-xl font-bold">
                Alertes d'encaissements
              </h3>
              {pagination && (
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center justify-center rounded-full bg-white/20 px-2.5 py-1 text-xs font-medium text-white">
                    {pagination.totalCount} {pagination.totalCount > 1 ? "alertes" : "alerte"}
                  </span>
                </div>
              )}
            </div>

            {/* Boutons d'exportation */}
            <div className="flex items-center gap-2">
              {hasAlerts && (
                <>
                  <button
                    onClick={exportToCSV}
                    className="flex items-center gap-1 rounded-md bg-white/20 px-3 py-1.5 text-sm text-white transition-all hover:bg-white/30"
                    title="Exporter en CSV"
                  >
                    <IconFileText className="h-4 w-4" />
                    <span className="hidden sm:inline">CSV</span>
                  </button>
                  <button
                    onClick={exportToExcel}
                    className="flex items-center gap-1 rounded-md bg-white/20 px-3 py-1.5 text-sm text-white transition-all hover:bg-white/30"
                    title="Exporter en Excel"
                  >
                    <IconExcelFile className="h-4 w-4" />
                    <span className="hidden sm:inline">Excel</span>
                  </button>
                </>
              )}
              <button
                onClick={onClose}
                className="rounded-full p-1.5 text-white transition-all hover:bg-white/20"
              >
                <IconX className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Corps de la modale avec défilement */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Barre de recherche et pagination */}
          <div className="border-b border-gray-100 bg-white px-6 py-4 dark:border-gray-700 dark:bg-gray-800">
            <div className="flex flex-wrap items-center justify-between gap-4">
              {/* Barre de recherche - toujours visible pour permettre la recherche une fois les données chargées */}
              <div className="relative w-full md:w-64">
                <input
                  type="text"
                  placeholder="Rechercher..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="form-input w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-4 text-sm placeholder-gray-400 shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-500"
                />
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>

              {/* Statistiques rapides - seulement si des données sont présentes */}
              {hasAlerts && (
                <div className="hidden lg:flex">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center gap-1">
                      <span className="inline-block h-2.5 w-2.5 rounded-full bg-green-500"></span>
                      <span className="text-xs text-gray-600 dark:text-gray-400">
                        Ecarts positifs: {positiveEcarts}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="inline-block h-2.5 w-2.5 rounded-full bg-red-500"></span>
                      <span className="text-xs text-gray-600 dark:text-gray-400">
                        Ecarts négatifs: {negativeEcarts}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="inline-block h-2.5 w-2.5 rounded-full bg-gray-400"></span>
                      <span className="text-xs text-gray-600 dark:text-gray-400">
                        Ecarts nuls: {zeroEcarts}
                      </span>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>

          {/* Tableau avec défilement */}
          <div className="flex-1 overflow-auto p-6">
            <div className="relative h-full rounded-xl border border-gray-200 dark:border-gray-700">
              <div className="h-full overflow-auto">
                {loading && (
                  <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/80 backdrop-blur-sm dark:bg-gray-800/80">
                    <div className="flex flex-col items-center justify-center p-4">
                      <div className="mb-4 h-10 w-10 animate-spin rounded-full border-3 border-gray-300 border-t-primary"></div>
                      <span className="text-sm font-medium text-primary">Chargement des alertes</span>
                    </div>
                  </div>
                )}
                <DataTable
                  style={{
                    position: "relative",
                    width: "100%",
                    borderRadius: "0.75rem",
                    height: "100%",
                  }}
                  rowStyle={(row: AlertItem) => {
                    if (row.ecartCaisseBanque > 0) return { backgroundColor: "#d1fae5" }; // vert clair pour positif
                    if (row.ecartCaisseBanque < 0) return { backgroundColor: "#fee2e2" }; // rouge clair pour négatif
                    return {}; // style par défaut pour les écarts nuls
                  }}
                  classNames={{
                    root: "shadow-sm",
                    header: "border-b border-gray-200 bg-gray-50/80 py-4 text-gray-700 font-medium dark:border-gray-700 dark:bg-gray-800/50 dark:text-gray-300",
                    pagination: "sticky bottom-0 left-0 right-0 z-10 bg-white py-4 shadow-md dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700",
                  }}
                  rowClassName={({ ecartCaisseBanque }) =>
                    `hover:bg-gray-50 dark:hover:bg-gray-700/30 border-b border-gray-100 dark:border-gray-700/50 transition-colors ${ecartCaisseBanque !== 0 ? "font-medium" : ""
                    }`
                  }
                  className="table-hover whitespace-normal text-sm"
                  records={!loading && filteredAlerts?.length > 0 ? filteredAlerts : []}
                  columns={[
                    {
                      accessor: "directionRegionale",
                      title: "Direction",
                      sortable: true,
                      width: 130,
                      render: (row: AlertItem) => (
                        <div className="px-2 py-3 font-medium">{row.directionRegionale}</div>
                      ),
                    },
                    {
                      accessor: "codeExpl",
                      title: "Code",
                      sortable: true,
                      width: 100,
                      render: (row: AlertItem) => (
                        <div className="px-2 py-3">{row.codeExpl}</div>
                      ),
                    },
                    {
                      accessor: "dateEncaissement",
                      title: "Date",
                      sortable: true,
                      width: 120,
                      render: (row: AlertItem) => {
                        // Extraire seulement la date (format DD/MM/YYYY) de la chaîne dateEncaissement
                        const dateStr = row.dateEncaissement || "";
                        const dateMatch = dateStr.match(/\d{2}\/\d{2}\/\d{4}/);
                        const formattedDate = dateMatch ? dateMatch[0] : dateStr.split(" ")[0];

                        return (
                          <div className="px-2 py-3 font-medium">{formattedDate}</div>
                        );
                      },
                    },
                    {
                      accessor: "banque",
                      title: "Banque",
                      sortable: true,
                      width: 160,
                      render: (row: AlertItem) => (
                        <Tippy content={row.banque}>
                          <div className="max-w-[160px] truncate px-2 py-3" title={row.banque}>
                            {row.banque}
                          </div>
                        </Tippy>
                      ),
                    },
                    {
                      accessor: "montantRestitutionCaisse",
                      title: "Montant caisse",
                      sortable: true,
                      width: 160,
                      render: (row: AlertItem) => (
                        <div className="px-2 py-3 text-right font-medium tabular-nums">
                          {formatNumber(row.montantRestitutionCaisse)} F
                        </div>
                      ),
                    },
                    {
                      accessor: "montantBordereauBanque",
                      title: "Montant bordereau",
                      sortable: true,
                      width: 190,
                      render: (row: AlertItem) => (
                        <div className="px-2 py-3 text-right font-medium tabular-nums">
                          {formatNumber(row.montantBordereauBanque)} F
                        </div>
                      ),
                    },
                    {
                      accessor: "ecartCaisseBanque",
                      title: "Écart",
                      sortable: true,
                      width: 140,
                      render: (row: AlertItem) => {
                        let textColorClass = "";
                        if (row.ecartCaisseBanque > 0) textColorClass = "text-green-600 dark:text-green-400";
                        else if (row.ecartCaisseBanque < 0) textColorClass = "text-red-600 dark:text-red-400";

                        return (
                          <div className={`px-2 py-3 text-right font-medium tabular-nums ${textColorClass}`}>
                            {row.ecartCaisseBanque > 0 && "+"}
                            {formatNumber(row.ecartCaisseBanque)} F
                          </div>
                        );
                      },
                    },
                    {
                      accessor: "actions",
                      title: "Actions",
                      width: 100,
                      render: (row: AlertItem) => (
                        <div className="flex items-center justify-center gap-2 px-2 py-3">
                          <Tippy content="Voir détails">
                            <button
                              onClick={() => handleViewDetails(row)}
                              className="rounded-full p-1.5 text-gray-500 transition-all hover:bg-primary/10 hover:text-primary dark:text-gray-400 dark:hover:text-white"
                            >
                              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            </button>
                          </Tippy>
                        </div>
                      ),
                    },
                  ]}
                  highlightOnHover
                  totalRecords={pagination?.totalCount || 0}
                  recordsPerPage={pageSize}
                  page={pagination?.currentPage || 1}
                  onPageChange={onPageChange}
                  recordsPerPageOptions={PAGE_SIZES}
                  onRecordsPerPageChange={(size) => {
                    setPageSize(size);
                    onPageChange(1); // Revenir à la première page lors du changement de taille
                  }}
                  sortStatus={sortStatus}
                  onSortStatusChange={setSortStatus}
                  minHeight={400}
                  paginationText={({ from, to, totalRecords }) =>
                    `Affichage de ${from} à ${to} sur ${totalRecords} entrées`
                  }
                  paginationSize="md"
                  noRecordsText={
                    loading
                      ? "Chargement en cours..."
                      : searchTerm
                        ? "Aucun résultat ne correspond à votre recherche"
                        : "Aucune alerte disponible"
                  }
                  emptyState={
                    <div className="flex flex-col items-center justify-center py-10">
                      <div className="mb-3 rounded-full bg-gray-100 p-3 dark:bg-gray-700">
                        <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <p className="text-center text-gray-500 dark:text-gray-400">
                        {searchTerm
                          ? "Aucun élément ne correspond à votre recherche"
                          : "Aucune alerte pour le moment"}
                      </p>
                    </div>
                  }
                />
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50">
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* Légende des couleurs - seulement si des alertes sont disponibles */}
            {hasAlerts && (
              <div className="flex items-center gap-6">
                <div className="hidden items-center space-x-6 lg:flex">
                  <div className="flex items-center gap-2">
                    <span className="inline-block h-3 w-3 rounded-sm bg-green-100 dark:bg-green-900/30"></span>
                    <span className="text-xs text-gray-600 dark:text-gray-400">
                      Écart positif
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="inline-block h-3 w-3 rounded-sm bg-red-100 dark:bg-red-900/30"></span>
                    <span className="text-xs text-gray-600 dark:text-gray-400">
                      Écart négatif
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center space-x-3">
              <button
                onClick={onClose}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-all hover:bg-gray-50 hover:shadow dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
              >
                Fermer
              </button>
              {/* Bouton d'acquittement - seulement si des alertes sont disponibles */}
              {hasAlerts && (
                <button
                  onClick={() => {
                    onClose();
                    Toastify("success", "Alertes acquittées");
                  }}
                  className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:bg-primary/90 hover:shadow-md focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 dark:ring-offset-gray-800"
                >
                  Acquitter toutes les alertes
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ComponentsDashboardSales = () => {
  const dispatch = useDispatch<TAppDispatch>();

  const user = getUserPermission();

  const isFirstLogin = user?.isFirstLogin;

  const [ecartDataDashboard, setEcartDataDashboard] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [alertModalOpen, setAlertModalOpen] = useState(false);
  const [alertsData, setAlertsData] = useState<AlertItem[]>([]);
  const [hasCheckedAlerts, setHasCheckedAlerts] = useState(false);
  const [alertsLoading, setAlertsLoading] = useState(false);
  const [paginationInfo, setPaginationInfo] = useState<PaginationInfo | null>(null);
  const [alertPage, setAlertPage] = useState(1);

  const fetchDashboardData = async (filters?: any) => {
    const cleanArray = (arr: string[] | undefined) =>
      arr?.map((item) => item.trim()).filter(Boolean) || [];

    const formatArray = (arr: string[] | undefined) => {
      const cleaned = cleanArray(arr);
      return cleaned.length ? JSON.stringify(cleaned) : undefined;
    };

    const params: Record<string, any> = {};

    if (filters?.selectedDRIds?.length) {
      params["directionRegional"] = formatArray(
        filters.selectedDRIds.map(String)
      );
    }

    if (filters?.selectedSecteurIds?.length) {
      params["codeExpl"] = formatArray(filters.selectedSecteurIds.map(String));
    }

    if (filters?.startDate) {
      params["startDate"] = filters.startDate;
    }

    if (filters?.endDate) {
      params["endDate"] = filters.endDate;
    }

    // Supprimer les paramètres undefined
    Object.keys(params).forEach((key) => {
      if (params[key] === undefined) {
        delete params[key];
      }
    });

    try {
      setLoading(true);
      const response: any = await axiosInstance.get(
        `${API_AUTH_SUIVI}/dashboard/get-dashboard-data`,
        { params }
      );

      if (response?.error === false) {
        setEcartDataDashboard(response?.data);
      }
    } catch (error) {
      console.error("Erreur lors de la récupération :", error);
    } finally {
      setLoading(false);
    }
  };

  const getAlerts = async (page: number = 1) => {
    try {
      setAlertsLoading(true);
      const response: any = await axiosInstance.get(
        `${API_AUTH_SUIVI}/encaissements/alerts/0?page=${page}`
      );

      if (response?.error === false) {
        setAlertsData(response?.data?.result || []);
        setPaginationInfo(response?.data?.pagination || null);
        return response?.data;
      }
      return null;
    } catch (error) {
      console.error("Erreur lors de la récupération des alertes:", error);
      return null;
    } finally {
      setAlertsLoading(false);
    }
  };

  // Vérifier les alertes à l'initialisation
  useEffect(() => {
    const checkAlertsOnLogin = async () => {
      if (!hasCheckedAlerts) {
        try {
          const data = await getAlerts(1);
          if (data && data.result && data.result.length > 0) {
            setAlertModalOpen(true);
          }
          setHasCheckedAlerts(true);
        } catch (error) {
          console.error("Erreur lors de la vérification des alertes:", error);
          setHasCheckedAlerts(true);
        }
      }
    };

    checkAlertsOnLogin();
  }, [hasCheckedAlerts]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    // dispatch(fetchDashboardData({}));
    dispatch(fetchDirectionRegionales());
  }, [dispatch]);

  const caisses = ecartDataDashboard?.caisses || {};
  const banques = ecartDataDashboard?.banques || [];
  const completionRate = ecartDataDashboard?.completionRate || {};
  const ecart = ecartDataDashboard?.ecart || {};
  const graph = ecartDataDashboard?.graph || {};

  const isDark = useSelector(
    (state: TRootState) =>
      state.themeConfig.theme === "dark" || state.themeConfig.isDarkMode
  );
  const isRtl =
    useSelector((state: TRootState) => state.themeConfig.rtlClass) === "rtl";

  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, [setIsMounted]);

  const revenueChart: any = {
    series:
      graph?.series?.map((serie: any) => ({
        name: serie?.name || "Unknown",
        data: serie?.data || [],
      })) || [],
    options: {
      chart: {
        height: 325,
        type: "area",
        fontFamily: "Nunito, sans-serif",
        zoom: {
          enabled: false,
        },
        toolbar: {
          show: false,
        },
      },
      dataLabels: {
        enabled: false,
      },
      stroke: {
        show: true,
        curve: "smooth",
        width: 2,
        lineCap: "square",
      },
      dropShadow: {
        enabled: true,
        opacity: 0.2,
        blur: 10,
        left: -7,
        top: 22,
      },
      colors: isDark ? ["#59959E", "#8FC717"] : ["#C7493D", "#008F75"],
      labels: graph?.categories || [],
      xaxis: {
        axisBorder: {
          show: false,
        },
        axisTicks: {
          show: false,
        },
        crosshairs: {
          show: true,
        },
        labels: {
          offsetX: isRtl ? 2 : 0,
          offsetY: 5,
          style: {
            fontSize: "12px",
            cssClass: "apexcharts-xaxis-title",
          },
        },
      },
      yaxis: {
        tickAmount: 7,
        labels: {
          formatter: (value: number) => {
            return value?.toLocaleString("fr-FR") + " F CFA";
          },
          offsetX: isRtl ? -30 : -10,
          offsetY: 0,
          style: {
            fontSize: "12px",
            cssClass: "apexcharts-yaxis-title",
          },
        },
        opposite: isRtl ? true : false,
      },
      grid: {
        borderColor: isDark ? "#191E3A" : "#E0E6ED",
        strokeDashArray: 5,
        xaxis: {
          lines: {
            show: false,
          },
        },
        yaxis: {
          lines: {
            show: true,
          },
        },
        padding: {
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
        },
      },
      legend: {
        position: "top",
        horizontalAlign: "right",
        fontSize: "16px",
        markers: {
          width: 10,
          height: 10,
          offsetX: -2,
        },
        itemMargin: {
          horizontal: 10,
          vertical: 5,
        },
      },
      tooltip: {
        marker: {
          show: true,
        },
        x: {
          show: false,
        },
      },
      fill: {
        type: "gradient",
        gradient: {
          shadeIntensity: 1,
          inverseColors: false,
          opacityFrom: isDark ? 0.19 : 0.28,
          opacityTo: 0.05,
          stops: isDark ? [100, 100] : [45, 100],
        },
      },
    },
  };

  const [selectedDRIds, setSelectedDRIds] = useState<number[]>([]);
  const [selectedDRLabel, setSelectedDRLabel] = useState<number[]>([]);
  const [secteurOptions, setSecteurOptions] = useState<any[]>([]);
  const [selectedCodeExpl, setSelectedCodeExpl] = useState<number[]>([]);
  const [selectedDR, setSelectedDR] = useState<any[]>([]);
  const [selectedSecteur, setSelectedSecteur] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState(1);
  const [isTableView, setIsTableView] = useState(true);
  const [showAllRestitution, setShowAllRestitution] = useState(false);
  const [showAllBordereau, setShowAllBordereau] = useState(false);
  const [ecartData, setEcartData] = useState<any>(null);

  const drData: any = useSelector((state: TRootState) => state.dr?.data);
  const drOptions = drData?.map((dr: any) => ({
    value: dr.id,
    label: dr.name,
  }));

  const secteurs = useSelector((state: TRootState) => state?.secteur?.data);
  const secteurLoading = useSelector(
    (state: TRootState) => state?.secteur?.loading
  );

  useEffect(() => {
    if (selectedDRIds?.length > 0) {
      dispatch(fetchSecteurs(selectedDRIds));
    } else {
      setSecteurOptions([]);
    }
  }, [selectedDRIds, dispatch]);

  useEffect(() => {
    if (secteurs && selectedDRIds?.length > 0) {
      const filteredSecteurs = secteurs?.map((secteur: any) => ({
        value: secteur?.code,
        label: secteur?.name,
      }));
      setSecteurOptions(filteredSecteurs);
    }
  }, [secteurs, selectedDRIds]);

  const fetchEcartData = async (filters?: any) => {
    const config = {
      method: "get",
      maxBodyLength: Infinity,
      url: `${API_AUTH_SUIVI}/dashboard/get-ecart-data`,
      params: {
        ...(filters?.selectedDRIds?.length && {
          directionRegional: filters.selectedDRIds.map(String),
        }),
        ...(filters?.selectedSecteurIds?.length && {
          codeExpl: filters.selectedSecteurIds.map(String),
        }),
        ...(filters?.startDate && { startDate: filters.startDate }),
        ...(filters?.endDate && { endDate: filters.endDate }),
      },
    };

    try {
      setLoading(true);
      const response: any = await axiosInstance.request(config);

      if (response?.error === false) {
        setEcartData(response?.data);
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des écarts:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    if (selectedDR.length === 0) {
      dispatch(fetchDashboardData({}));
      fetchEcartData({});
    } else {
      const filters = {
        selectedDRIds: selectedDRIds,
        selectedSecteurIds: selectedCodeExpl,
      };

      const dashboardFilters = {
        directionRegional: selectedDRIds.map(String),
        codeExpl: selectedCodeExpl.map(String),
      };

      fetchDashboardData(dashboardFilters);
      fetchEcartData(filters);
    }
  };

  useEffect(() => {
    fetchEcartData();
  }, []);

  const handleDRChange = (selected: any) => {
    setSelectedDR(selected);
    const ids = selected ? selected.map((dr: any) => dr.value) : [];
    setSelectedDRIds(ids);
    const labels = selected ? selected.map((dr: any) => dr.label) : [];
    setSelectedDRLabel(labels);

    // Récupérer les secteurs pour les DR sélectionnées
    if (ids.length > 0) {
      dispatch(fetchSecteurs(ids));
    } else {
      setSecteurOptions([]);
      setSelectedSecteur([]);
    }

    // Mettre à jour le dashboard avec les filtres
    const filters = {
      selectedDRIds: ids,
      selectedSecteurIds: selectedCodeExpl,
    };

    // fetchDashboardData(filters);
    // fetchEcartData(filters);
  };

  const handleSecteurChange = (selected: any) => {
    setSelectedSecteur(selected);
    const ids = selected ? selected.map((secteur: any) => secteur.value) : [];
    setSelectedCodeExpl(ids);

    // Mettre à jour le dashboard avec les filtres
    const filters = {
      selectedDRIds: selectedDRIds,
      selectedSecteurIds: ids,
    };

    fetchDashboardData(filters);
    fetchEcartData(filters);
  };

  const handleApplyFilters = () => {
    const filters = {
      selectedDRIds: selectedDRIds,
      selectedSecteurIds: selectedCodeExpl,
    };
    dispatch(
      fetchDashboardData({
        directionRegional: selectedDRLabel?.length
          ? selectedDRLabel?.map(String)
          : undefined,
        codeExpl: selectedCodeExpl?.length
          ? selectedCodeExpl?.map(String)
          : undefined,
      })
    );
    fetchEcartData({
      directionRegional: selectedDRLabel?.length
        ? selectedDRLabel?.map(String)
        : undefined,
      codeExpl: selectedCodeExpl?.length
        ? selectedCodeExpl?.map(String)
        : undefined,
    });
  };

  const handleResetFilters = () => {
    setSelectedDR([]);
    setSelectedSecteur([]);
    setSelectedDRIds([]);
    setSelectedCodeExpl([]);
    setSecteurOptions([]);
    setSelectedDRLabel([]);
    dispatch(fetchDashboardData({}));
    fetchEcartData({});
  };

  const handleAlertPageChange = (page: number) => {
    setAlertPage(page);
    getAlerts(page);
  };

  return (
    <>
      <AlertModal
        isOpen={alertModalOpen}
        onClose={() => setAlertModalOpen(false)}
        alerts={alertsData}
        loading={alertsLoading}
        pagination={paginationInfo}
        onPageChange={handleAlertPageChange}
      />
      <div className="panel">
        <div className="panel relative mb-8">
          <div className=" flex border-b border-gray-200 dark:border-gray-700">
            <button
              className={`group relative flex items-center gap-3 px-8 py-5 text-sm font-medium outline-none transition-all duration-300 ease-in-out hover:bg-gray-50/50 dark:hover:bg-gray-700/50 ${activeTab === 1
                ? "text-primary"
                : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                }`}
              onClick={() => setActiveTab(1)}
              id="tuto-dashboard-globalView"
            >
              <div className="flex items-center gap-2">
                <svg
                  className={`h-5 w-5 transition-all duration-300 ${activeTab === 1
                    ? "scale-110 text-primary"
                    : "text-gray-400 group-hover:scale-105 group-hover:text-gray-500"
                    }`}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                  />
                </svg>
                <span
                  className={`transform transition-all duration-300 ${activeTab === 1 ? "translate-x-0.5" : ""
                    }`}
                >
                  Vue d'ensemble
                </span>
              </div>
              {activeTab === 1 && (
                <div className="absolute bottom-0 left-0 h-0.5 w-full bg-primary transition-all duration-300"></div>
              )}
            </button>
            <button
              className={`group relative flex items-center gap-3 px-8 py-5 text-sm font-medium outline-none transition-all duration-300 ease-in-out hover:bg-gray-50/50 dark:hover:bg-gray-700/50 ${activeTab === 2
                ? "text-primary"
                : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                }`}
              onClick={() => setActiveTab(2)}
              id="tuto-dashboard-details"
            >
              <div className="flex items-center gap-2">
                <svg
                  className={`h-5 w-5 transition-all duration-300 ${activeTab === 2
                    ? "scale-110 text-primary"
                    : "text-gray-400 group-hover:scale-105 group-hover:text-gray-500"
                    }`}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 00.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <span
                  className={`transform transition-all duration-300 ${activeTab === 2 ? "translate-x-0.5" : ""
                    }`}
                >
                  Détails des écarts
                </span>
              </div>
              {activeTab === 2 && (
                <>
                  <div className="absolute bottom-0 left-0 h-0.5 w-full bg-primary transition-all duration-300"></div>
                </>
              )}
            </button>
          </div>
          <div className="absolute bottom-0 left-0 h-0.5 w-full bg-gray-100 dark:bg-gray-800"></div>
          <br />
          <br />

          <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
            <ol className="flex flex-wrap items-center gap-2">
              <li>
                <Link
                  href="/dashboard"
                  className="flex items-center gap-2 rounded-md bg-white px-4 py-2.5 font-semibold text-primary shadow transition-all hover:bg-primary hover:text-white dark:bg-[#191e3a] dark:hover:bg-primary"
                >
                  <IconHome className="h-4.5 w-4.5" />
                  Tableau de bord
                </Link>
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1 w-1 rounded-full bg-primary"></div>
                <button className="flex items-center gap-2 rounded-md bg-primary px-4 py-2.5 font-semibold text-white shadow dark:bg-[#191e3a]">
                  <IconBox className="h-4.5 w-4.5" />
                  Suivi
                </button>
              </li>
            </ol>

            <div className="flex flex-wrap items-center gap-3">
              <button
                className="flex items-center gap-2 rounded-md border border-primary px-4 py-2 text-primary transition-all hover:bg-primary hover:text-white"
                onClick={handleRefresh}
                id="tuto-dashboard-refresh"
              >
                <IconRefresh className="h-4 w-4" />
                Actualiser
              </button>

              <div
                className="flex flex-wrap items-center gap-3"
                id="tuto-dashboard-filtre"
              >
                <div className="min-w-[200px]">
                  <Select
                    placeholder="Filtrer par DR"
                    options={drOptions}
                    isMulti
                    isSearchable
                    onChange={handleDRChange}
                    value={selectedDR}
                    className="text-sm"
                    classNamePrefix="select"
                    theme={(theme) => ({
                      ...theme,
                      colors: {
                        ...theme.colors,
                        primary: "#4361ee",
                        primary25: "#eef2ff",
                      },
                    })}
                  />
                </div>

                <div className="min-w-[200px]">
                  <Select
                    placeholder="Filtrer par exploitation"
                    options={secteurOptions}
                    isMulti
                    isSearchable
                    isDisabled={secteurLoading || secteurOptions?.length === 0}
                    onChange={handleSecteurChange}
                    value={selectedSecteur}
                    className="text-sm"
                    classNamePrefix="select"
                    theme={(theme) => ({
                      ...theme,
                      colors: {
                        ...theme.colors,
                        primary: "#4361ee",
                        primary25: "#eef2ff",
                      },
                    })}
                  />
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="group flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-all duration-200 hover:bg-gray-50 hover:shadow-sm dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                  >
                    <IconRefresh className="h-4 w-4 transition-transform duration-200 group-hover:rotate-180" />
                    Réinitialiser
                  </button>
                  <button
                    type="button"
                    onClick={handleApplyFilters}
                    disabled={selectedDRIds?.length === 0}
                    className="group flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-all duration-200 hover:bg-primary/90 hover:shadow-sm disabled:cursor-not-allowed disabled:bg-primary/60"
                  >
                    <IconFilter className="h-4 w-4 transition-transform duration-200 group-hover:scale-110" />
                    Appliquer
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {activeTab === 1 ? (
          <div className="h-full">
            <div className="panel">
              <div className="pt-5">
                <div className="mb-6 grid gap-6 xl:grid-cols-3">
                  <div className="panel h-full xl:col-span-2">
                    <div className="mb-5 flex items-center justify-between dark:text-white-light">
                      <h5 className="text-lg font-semibold">Revenue</h5>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-sm ${!isTableView ? "text-primary" : "text-gray-500"
                            }`}
                        >
                          Graphique
                        </span>
                        <label className="relative inline-flex cursor-pointer items-center">
                          <input
                            type="checkbox"
                            className="peer sr-only"
                            checked={isTableView}
                            onChange={() => setIsTableView(!isTableView)}
                          />
                          <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-primary peer-checked:after:translate-x-full peer-checked:after:border-white dark:border-gray-600 dark:bg-gray-700"></div>
                        </label>
                        <span
                          className={`text-sm ${isTableView ? "text-primary" : "text-gray-500"
                            }`}
                        >
                          Tableau
                        </span>
                      </div>
                    </div>

                    {loading ? (
                      <div className="relative">
                        <div className="rounded-lg bg-white p-4 dark:bg-black">
                          <div className="h-[325px] w-full animate-pulse rounded-lg bg-gray-300 dark:bg-gray-700"></div>
                        </div>
                      </div>
                    ) : banques.length === 0 ? (
                      <div className="flex items-center justify-center py-4 text-center text-gray-500 dark:text-gray-400">
                        Aucun élément disponible pour le moment.
                      </div>
                    ) : (
                      <div className="relative">
                        <div className="rounded-lg bg-white dark:bg-black">
                          {isTableView ? (
                            <div className="table-responsive">
                              <table className="w-full table-auto">
                                <thead>
                                  <tr className="border-b border-[#e0e6ed] bg-white dark:border-[#191e3a] dark:bg-[#1a1c2d]">
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-800 dark:text-white-light">
                                      Mois
                                    </th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-800 dark:text-white-light">
                                      Encaissements Clôturés
                                    </th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-800 dark:text-white-light">
                                      Encaissements Reversés
                                    </th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {graph?.categories?.map(
                                    (month: string, index: number) => {
                                      const clotures =
                                        graph?.series?.[0]?.data?.[index] || 0;
                                      const reverses =
                                        graph?.series?.[1]?.data?.[index] || 0;
                                      return (
                                        <tr
                                          key={index}
                                          className="border-b border-[#e0e6ed] hover:bg-gray-50 dark:border-[#191e3a] dark:hover:bg-[#1a1c2d]"
                                        >
                                          <td className="px-6 py-3 text-left text-sm text-gray-800 dark:text-white-light">
                                            {format(
                                              new Date(month),
                                              "MMMM yyyy",
                                              { locale: fr }
                                            )}
                                          </td>
                                          <td
                                            className={`px-6 py-3 text-left text-sm ${clotures < 0
                                              ? "text-primary"
                                              : "text-gray-800"
                                              } dark:text-white-light`}
                                          >
                                            {clotures.toLocaleString()} FCFA
                                          </td>
                                          <td className="px-6 py-3 text-left text-sm text-gray-800 dark:text-white-light">
                                            {reverses.toLocaleString()} FCFA
                                          </td>
                                        </tr>
                                      );
                                    }
                                  )}
                                  <tr className="border-t-2 border-[#e0e6ed] bg-gray-50 dark:border-[#191e3a] dark:bg-[#1a1c2d]">
                                    <td className="px-6 py-3 text-left text-sm font-semibold text-gray-800 dark:text-white-light">
                                      Total
                                    </td>
                                    <td
                                      className={`px-6 py-3 text-left text-sm font-semibold ${(graph?.series?.[0]?.data?.reduce(
                                        (a: number, b: number) => a + b,
                                        0
                                      ) || 0) < 0
                                        ? "text-primary"
                                        : "text-gray-800"
                                        } dark:text-white-light`}
                                    >
                                      {(
                                        graph?.series?.[0]?.data?.reduce(
                                          (a: number, b: number) => a + b,
                                          0
                                        ) || 0
                                      ).toLocaleString()}{" "}
                                      FCFA
                                    </td>
                                    <td className="px-6 py-3 text-left text-sm font-semibold text-gray-800 dark:text-white-light">
                                      {(
                                        graph?.series?.[1]?.data?.reduce(
                                          (a: number, b: number) => a + b,
                                          0
                                        ) || 0
                                      ).toLocaleString()}{" "}
                                      FCFA
                                    </td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>
                          ) : isMounted ? (
                            <ReactApexChart
                              series={revenueChart?.series}
                              options={revenueChart?.options}
                              type="area"
                              height={325}
                              width="100%"
                            />
                          ) : (
                            <div className="h-[325px] w-full animate-pulse rounded-lg bg-gray-300 dark:bg-gray-700"></div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="panel h-auto">
                    <div className="mb-5 flex items-center justify-between dark:text-white-light">
                      <h5 className="text-lg font-semibold">
                        Résumé catégoriel
                      </h5>
                    </div>

                    <div className="space-y-9">
                      {loading ? (
                        // Skeleton Loader pour le résumé catégoriel
                        <div className="space-y-6">
                          {Array.from({ length: 4 }).map((_, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-center space-x-3"
                            >
                              {/* Icône Placeholder */}
                              <div className="h-9 w-9 animate-pulse rounded-full bg-gray-300 dark:bg-gray-700"></div>

                              {/* Texte Skeleton */}
                              <div className="flex-1 space-y-2">
                                <div className="h-4 w-32 animate-pulse rounded-md bg-gray-300 dark:bg-gray-700"></div>
                                <div className="h-3 w-24 animate-pulse rounded-md bg-gray-300 dark:bg-gray-700"></div>
                              </div>

                              {/* Barre de progression Skeleton */}
                              <div className="h-2 w-full animate-pulse rounded-full bg-gray-300 dark:bg-gray-700"></div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <>
                          {/* Clôture */}
                          <div className="flex items-center justify-center transition-all hover:scale-105">
                            <div className="h-9 w-9 ltr:mr-3 rtl:ml-3">
                              <div className="grid h-9 w-9 place-content-center rounded-full bg-secondary-light text-secondary shadow-sm dark:bg-secondary dark:text-secondary-light">
                                <IconInbox />
                              </div>
                            </div>
                            <div className="flex-1 text-center">
                              <div className="mb-2 flex justify-between font-semibold text-white-dark">
                                <h6>Traités</h6>
                                <p>{completionRate.completionRateCloture}%</p>
                              </div>
                              <div className="h-2 rounded-full bg-dark-light shadow dark:bg-[#1b2e4b]">
                                <div
                                  className="h-full rounded-full bg-gradient-to-r from-[#7579ff] to-[#b224ef]"
                                  style={{
                                    width: `${completionRate.completionRateCloture}%`,
                                  }}
                                ></div>
                              </div>
                            </div>
                          </div>

                          {/* Validation */}
                          <div className="flex items-center justify-center transition-all hover:scale-105">
                            <div className="h-9 w-9 ltr:mr-3 rtl:ml-3">
                              <div className="grid h-9 w-9 place-content-center rounded-full bg-success-light text-success shadow-sm dark:bg-success dark:text-success-light">
                                <IconTag />
                              </div>
                            </div>
                            <div className="flex-1 text-center">
                              <div className="mb-2 flex justify-between font-semibold text-white-dark">
                                <h6>Validés</h6>
                                <p>
                                  {completionRate.completionRateValidation}%
                                </p>
                              </div>
                              <div className="h-2 rounded-full bg-dark-light shadow dark:bg-[#1b2e4b]">
                                <div
                                  className="h-full rounded-full bg-gradient-to-r from-[#3cba92] to-[#0ba360]"
                                  style={{
                                    width: `${completionRate.completionRateValidation}%`,
                                  }}
                                ></div>
                              </div>
                            </div>
                          </div>

                          {/* Réclamation */}
                          <div className="flex items-center justify-center transition-all hover:scale-105">
                            <div className="h-9 w-9 ltr:mr-3 rtl:ml-3">
                              <div className="grid h-9 w-9 place-content-center rounded-full bg-warning-light text-warning shadow-sm dark:bg-warning dark:text-warning-light">
                                <IconCreditCard />
                              </div>
                            </div>
                            <div className="flex-1 text-center">
                              <div className="mb-2 flex justify-between font-semibold text-white-dark">
                                <h6>Litiges</h6>
                                <p>
                                  {completionRate.completionRateReclamation}%
                                </p>
                              </div>
                              <div className="h-2 w-full rounded-full bg-dark-light shadow dark:bg-[#1b2e4b]">
                                <div
                                  className="h-full rounded-full bg-gradient-to-r from-[#f09819] to-[#ff5858]"
                                  style={{
                                    width: `${completionRate.completionRateReclamation}%`,
                                  }}
                                ></div>
                              </div>
                            </div>
                          </div>

                          {/* Reversement */}
                          <div className="flex items-center justify-center transition-all hover:scale-105">
                            <div className="h-9 w-9 ltr:mr-3 rtl:ml-3">
                              <div className="grid h-9 w-9 place-content-center rounded-full bg-primary-light text-primary shadow-sm dark:bg-primary dark:text-primary-light">
                                <IconInbox />
                              </div>
                            </div>
                            <div className="flex-1 text-center">
                              <div className="mb-2 flex justify-between font-semibold text-white-dark">
                                <h6>Chargés</h6>
                                <p>{completionRate.completionRateReverse}%</p>
                              </div>
                              <div className="h-2 w-full rounded-full bg-dark-light shadow dark:bg-[#1b2e4b]">
                                <div
                                  className="h-full rounded-full bg-gradient-to-r from-[#00c6ff] to-[#0072ff]"
                                  style={{
                                    width: `${completionRate.completionRateReverse}%`,
                                  }}
                                ></div>
                              </div>
                            </div>
                          </div>
                        </>
                      )}
                    </div>

                    <div className="mt-auto p-4">
                      <img
                        className="h-[150px] w-full object-contain transition-all hover:scale-105"
                        src="/assets/images/pilonne.png"
                        alt="logo"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className=" h-full">
                <div className="mb-6 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                  <div className="panel h-full pb-0 sm:col-span-2 xl:col-span-1">
                    <h5 className="mb-5 text-lg font-semibold dark:text-white-light">
                      Banques avec le plus d'écart
                    </h5>

                    {loading ? (
                      <div className="space-y-3">
                        {Array.from({ length: 5 }).map((_, index) => (
                          <div
                            key={index}
                            className="h-4 w-full animate-pulse rounded-md bg-gray-300 dark:bg-gray-700"
                          ></div>
                        ))}
                      </div>
                    ) : (
                      <PerfectScrollbar
                        className="relative mb-4 h-[290px] ltr:-mr-3 ltr:pr-3 rtl:-ml-3 rtl:pl-3"
                        options={{ suppressScrollX: true }}
                      >
                        <div className="cursor-pointer text-sm">
                          {banques?.map((banque: any, index: number) => {
                            const badgeClass =
                              index === 0
                                ? "badge-outline-primary bg-primary-light"
                                : index === 1
                                  ? "badge-outline-success bg-success-light"
                                  : "badge-outline-danger bg-danger-light";

                            return (
                              <div
                                key={index}
                                className="group relative flex items-center py-1.5"
                              >
                                <div
                                  className={`h-1.5 w-1.5 rounded-full ${index === 0
                                    ? "bg-primary"
                                    : index === 1
                                      ? "bg-success"
                                      : "bg-danger"
                                    } ltr:mr-1 rtl:ml-1.5`}
                                ></div>
                                <div className="flex-1">{banque?.banque}</div>
                                <div className="text-xs text-white-dark dark:text-gray-500 ltr:ml-auto rtl:mr-auto">
                                  {banque?.totalEcartReleve.toLocaleString(
                                    "fr-FR"
                                  )}{" "}
                                  F CFA
                                </div>
                                <span
                                  className={`badge ${badgeClass} absolute text-xs opacity-0 group-hover:opacity-100 dark:bg-black ltr:right-0 rtl:left-0`}
                                >
                                  {index + 1}ère banque
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </PerfectScrollbar>
                    )}
                  </div>

                  <div className="panel h-full">
                    <div className="mb-5 flex items-center">
                      <h5 className="text-lg font-semibold dark:text-white-light">
                        Les caisses avec le plus et le moins d'ecarts
                      </h5>
                    </div>
                    <div>
                      <div className="space-y-6">
                        {loading
                          ? Array.from({ length: 4 }).map((_, index) => (
                            <div
                              key={index}
                              className="flex items-center space-x-3"
                            >
                              <div className="h-9 w-9 animate-pulse rounded-md bg-gray-300 dark:bg-gray-700"></div>
                              <div className="flex-1 space-y-2">
                                <div className="h-4 animate-pulse rounded-md bg-gray-300 dark:bg-gray-700"></div>
                                <div className="h-3 w-1/2 animate-pulse rounded-md bg-gray-300 dark:bg-gray-700"></div>
                              </div>
                              <div className="h-5 w-12 animate-pulse rounded-md bg-gray-300 dark:bg-gray-700"></div>
                            </div>
                          ))
                          : caisses?.most?.map((caisse: any, index: number) => {
                            const isPositive = caisse?.totalEcartReleve >= 0;
                            const badgeClass = isPositive
                              ? "bg-success-light text-success dark:bg-success dark:text-success-light"
                              : "bg-danger-light text-danger dark:bg-danger dark:text-danger-light";
                            const textColorClass = isPositive
                              ? "text-success"
                              : "text-danger";
                            const signe = isPositive ? "+" : "";

                            return (
                              <div className="flex" key={index}>
                                <span
                                  className={`grid h-9 w-9 shrink-0 place-content-center rounded-md ${badgeClass}`}
                                >
                                  J{index + 1}
                                </span>
                                <div className="flex-1 px-3">
                                  <div>{`Journée ${caisse?.numeroJourneeCaisse}`}</div>
                                  <div className="text-xs text-white-dark dark:text-gray-500">
                                    {isPositive
                                      ? "Écart positif"
                                      : "Écart négatif"}
                                  </div>
                                </div>
                                <span
                                  className={`whitespace-pre px-1 text-base ${textColorClass} ltr:ml-auto rtl:mr-auto`}
                                >
                                  {`${signe}${caisse?.totalEcartReleve?.toLocaleString(
                                    "fr-FR"
                                  )} F CFA`}
                                </span>
                              </div>
                            );
                          })}
                      </div>
                    </div>
                  </div>

                  <div className="panel h-full overflow-hidden border-0 p-0">
                    <div className="min-h-[70px] bg-primary bg-gradient-to-r to-[#160f6b] p-4">
                      <div className="flex items-center justify-between text-white">
                        <p className="text-xl">Écarts</p>
                      </div>
                    </div>
                    <div className="-mt-6 grid grid-cols-2 gap-2 px-8">
                      {loading ? (
                        Array.from({ length: 2 }).map((_, index) => (
                          <div
                            key={index}
                            className="h-20 animate-pulse rounded-md bg-gray-300 dark:bg-gray-700"
                          ></div>
                        ))
                      ) : (
                        <>
                          {/* Écart (A-B) */}
                          <div className="rounded-md bg-white px-4 py-2.5 shadow transition-all hover:shadow-md dark:bg-[#060818]">
                            <span className="mb-4 flex items-center justify-between dark:text-white">
                              Écart (A-B)
                              <IconCaretDown
                                className={`h-4 w-4 ${ecart?.ecartAB >= 0
                                  ? "text-success"
                                  : "text-danger"
                                  }`}
                              />
                            </span>
                            <div className="btn w-full border-0 bg-[#ebedf2] py-1 text-base text-[#515365] shadow-none dark:bg-black dark:text-[#bfc9d4]">
                              {ecart?.ecartAB?.toLocaleString("fr-FR")} F CFA
                            </div>
                          </div>
                          {/* Écart (B-C) */}
                          <div className="rounded-md bg-white px-4 py-2.5 shadow transition-all hover:shadow-md dark:bg-[#060818]">
                            <span className="mb-4 flex items-center justify-between dark:text-white">
                              Écart (B-C)
                              <IconCaretDown
                                className={`h-4 w-4 ${ecart?.ecartBC >= 0
                                  ? "text-success"
                                  : "text-danger"
                                  }`}
                              />
                            </span>
                            <div className="btn w-full border-0 bg-[#ebedf2] py-1 text-base text-[#515365] shadow-none dark:bg-black dark:text-[#bfc9d4]">
                              {ecart?.ecartBC?.toLocaleString("fr-FR")} F CFA
                            </div>
                          </div>
                        </>
                      )}
                    </div>

                    <div className="p-5">
                      <div className="mb-5">
                        <span className="rounded-full bg-[#1b2e4b] px-4 py-1.5 text-xs text-white before:inline-block before:h-1.5 before:w-1.5 before:rounded-full before:bg-white ltr:before:mr-2 rtl:before:ml-2">
                          Liste des caisses avec le plus de traités
                        </span>
                      </div>
                      <div className="mb-5 space-y-1">
                        {loading
                          ? Array.from({ length: 5 }).map((_, index) => (
                            <div
                              key={index}
                              className="h-4 w-full animate-pulse rounded-md bg-gray-300 dark:bg-gray-700"
                            ></div>
                          ))
                          : ecart.top5CaissesWithMostCloturedDossiers?.map(
                            (caisse: any, index: number) => (
                              <div
                                key={index}
                                className="flex items-center justify-between"
                              >
                                <p className="font-semibold text-[#515365]">
                                  Journée {caisse.numeroJourneeCaisse}
                                </p>
                                <p className="text-base">
                                  <span className="font-semibold">
                                    {caisse.nombreDossiersClotures}
                                  </span>
                                  <span className="text-sm font-light text-gray-500">
                                    {" "}
                                    {caisse.nombreDossiersClotures > 1
                                      ? "dossiers clôturés"
                                      : "dossier clôturé"}
                                  </span>
                                </p>
                              </div>
                            )
                          )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            {/* Tableau des écarts de restitution */}
            <div className="panel h-full">
              <div className="mb-5 flex items-center justify-between dark:text-white-light">
                <h5 className="text-lg font-semibold">Écarts de restitution</h5>
              </div>
              <div className="relative">
                <div
                  className={`table-responsive ${showAllRestitution ? "max-h-[400px] overflow-y-auto" : ""
                    }`}
                >
                  {loading ? (
                    <div className="flex h-40 items-center justify-center">
                      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                    </div>
                  ) : !ecartData?.restitution?.length ? (
                    <div className="flex h-40 items-center justify-center text-gray-500 dark:text-gray-400">
                      Aucune donnée disponible
                    </div>
                  ) : (
                    <table className="w-full table-auto">
                      <thead className="sticky top-0 bg-white dark:bg-[#1a1c2d]">
                        <tr className="border-b border-[#e0e6ed] bg-white dark:border-[#191e3a] dark:bg-[#1a1c2d]">
                          <th className="px-6 py-3 text-left text-sm font-medium text-gray-800 dark:text-white-light">
                            Direction Régionale
                          </th>
                          <th className="px-6 py-3 text-left text-sm font-medium text-gray-800 dark:text-white-light">
                            Écart A
                          </th>
                          <th className="px-6 py-3 text-left text-sm font-medium text-gray-800 dark:text-white-light">
                            Écart B
                          </th>
                          <th className="px-6 py-3 text-left text-sm font-medium text-gray-800 dark:text-white-light">
                            Écart A-B
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {(showAllRestitution
                          ? ecartData?.restitution
                          : ecartData?.restitution?.slice(0, 5)
                        )?.map((item: any, index: number) => (
                          <tr
                            key={index}
                            className="border-b border-[#e0e6ed] hover:bg-gray-50 dark:border-[#191e3a] dark:hover:bg-[#1a1c2d]"
                          >
                            <td className="px-6 py-3 text-left text-sm text-gray-800 dark:text-white-light">
                              {item.directionRegionale}
                            </td>
                            <td
                              className={`px-6 py-3 text-left text-sm ${item.montantA - item.montantB < 0
                                ? "text-primary"
                                : "text-gray-800"
                                } dark:text-white-light`}
                            >
                              {(item.montantA - item.montantB).toLocaleString()}{" "}
                              FCFA
                            </td>
                            <td
                              className={`px-6 py-3 text-left text-sm ${item.montantB < 0
                                ? "text-primary"
                                : "text-gray-800"
                                } dark:text-white-light`}
                            >
                              {item.montantB.toLocaleString()} FCFA
                            </td>
                            <td
                              className={`px-6 py-3 text-left text-sm ${item.ecartAB < 0
                                ? "text-primary"
                                : "text-gray-800"
                                } dark:text-white-light`}
                            >
                              {item.ecartAB.toLocaleString()} FCFA
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
                {ecartData?.restitution?.length > 5 && (
                  <div className="sticky bottom-0 mt-4 flex justify-center bg-white py-2 dark:bg-[#1a1c2d]">
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => setShowAllRestitution(!showAllRestitution)}
                    >
                      {showAllRestitution ? "Voir moins" : "Voir plus"}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Tableau des écarts de bordereau */}
            <div className="panel h-full">
              <div className="mb-5 flex items-center justify-between dark:text-white-light">
                <h5 className="text-lg font-semibold">Écarts de bordereau</h5>
              </div>
              <div className="relative">
                <div
                  className={`table-responsive ${showAllBordereau ? "max-h-[400px] overflow-y-auto" : ""
                    }`}
                >
                  {loading ? (
                    <div className="flex h-40 items-center justify-center">
                      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                    </div>
                  ) : !ecartData?.bordereau?.length ? (
                    <div className="flex h-40 items-center justify-center text-gray-500 dark:text-gray-400">
                      Aucune donnée disponible
                    </div>
                  ) : (
                    <table className="w-full table-auto">
                      <thead className="sticky top-0 bg-white dark:bg-[#1a1c2d]">
                        <tr className="border-b border-[#e0e6ed] bg-white dark:border-[#191e3a] dark:bg-[#1a1c2d]">
                          <th className="px-6 py-3 text-left text-sm font-medium text-gray-800 dark:text-white-light">
                            Direction Régionale
                          </th>
                          <th className="px-6 py-3 text-left text-sm font-medium text-gray-800 dark:text-white-light">
                            Écart C
                          </th>
                          <th className="px-6 py-3 text-left text-sm font-medium text-gray-800 dark:text-white-light">
                            Écart B
                          </th>
                          <th className="px-6 py-3 text-left text-sm font-medium text-gray-800 dark:text-white-light">
                            Écart B-C
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {(showAllBordereau
                          ? ecartData?.bordereau
                          : ecartData?.bordereau?.slice(0, 5)
                        )?.map((item: any, index: number) => (
                          <tr
                            key={index}
                            className="border-b border-[#e0e6ed] hover:bg-gray-50 dark:border-[#191e3a] dark:hover:bg-[#1a1c2d]"
                          >
                            <td className="px-6 py-3 text-left text-sm text-gray-800 dark:text-white-light">
                              {item.directionRegionale}
                            </td>
                            <td
                              className={`px-6 py-3 text-left text-sm ${item.ecartC < 0
                                ? "text-primary"
                                : "text-gray-800"
                                } dark:text-white-light`}
                            >
                              {item.ecartC.toLocaleString()} FCFA
                            </td>
                            <td
                              className={`px-6 py-3 text-left text-sm ${item.ecartB < 0
                                ? "text-primary"
                                : "text-gray-800"
                                } dark:text-white-light`}
                            >
                              {item.ecartB.toLocaleString()} FCFA
                            </td>
                            <td
                              className={`px-6 py-3 text-left text-sm ${item.ecartBC < 0
                                ? "text-primary"
                                : "text-gray-800"
                                } dark:text-white-light`}
                            >
                              {item.ecartBC.toLocaleString()} FCFA
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
                {ecartData?.bordereau?.length > 5 && (
                  <div className="sticky bottom-0 mt-4 flex justify-center bg-white py-2 dark:bg-[#1a1c2d]">
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => setShowAllBordereau(!showAllBordereau)}
                    >
                      {showAllBordereau ? "Voir moins" : "Voir plus"}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {isFirstLogin === 1 && <DashboardTutorial />}
      </div>
    </>
  );
};

export default ComponentsDashboardSales;
