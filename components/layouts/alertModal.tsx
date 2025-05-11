import React, { useState, useEffect } from 'react';
import { DataTable } from 'mantine-datatable';
import IconX from '../icon/icon-x';
import IconBell from '../icon/icon-bell';
import IconUpload from '../icon/icon-upload';
import IconCheckCircle from '../icon/icon-check-circle';
import IconShield from '../icon/icon-shield';
import IconClipboardCheck from '../icon/icon-clipboard-check';
import IconFileText from '../icon/icon-file-text';
import IconExcelFile from '../icon/icon-excel-file';
import IconCheck from '../icon/icon-check';
import * as XLSX from 'xlsx';
import { API_AUTH_SUIVI } from '@/config/constants';
import axios from '@/utils/axios';
import { Toastify } from '@/utils/toast';
import { useAppDispatch } from '@/store';
import { useSelector } from 'react-redux';
import { fetchNombreAlert } from '@/store/reducers/select/nombrealert.slice';

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
  activeTabId?: number;
  onTabChange?: (tabId: number) => void;
  onShowConfirmModal?: (title: string, message: string, onConfirm: () => void) => void;
}

interface AlertTab {
  id: number;
  name: string;
  icon: React.ReactNode;
}

const AlertModal = ({ isOpen, onClose, alerts, loading, pagination, onPageChange, activeTabId = 0, onTabChange, onShowConfirmModal }: AlertModalProps) => {
  if (!isOpen) return null;

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("fr-FR").format(num);
  };

  const dispatch = useAppDispatch();
  const { data: nombreAlert, loading: loadingNombreAlert } = useSelector((state: any) => state.nombreAlert);


  useEffect(() => {
    dispatch(fetchNombreAlert());
  }, []);

  const { chargeCount, verifyCount, validCount, reclamationCount, total } = nombreAlert;




  const [pageSize, setPageSize] = useState(5);
  const [sortStatus, setSortStatus] = useState<{ columnAccessor: string; direction: 'asc' | 'desc' }>({
    columnAccessor: 'id',
    direction: 'asc',
  });
  const [searchTerm, setSearchTerm] = useState("");
  const PAGE_SIZES = [5, 10, 20, 30, 50];
  const [activeTab, setActiveTab] = useState(activeTabId);

  useEffect(() => {
    setActiveTab(activeTabId);
  }, [activeTabId]);

  const alertTabs: AlertTab[] = [
    { id: 0, name: "Encaissements Chargés", icon: <IconUpload className="h-4 w-4" /> },
    { id: 2, name: "Encaissements Vérifiés", icon: <IconCheckCircle className="h-4 w-4" /> },
    { id: 3, name: "Encaissements Validés", icon: <IconShield className="h-4 w-4" /> },
    { id: 4, name: "Réclamations en retard", icon: <IconClipboardCheck className="h-4 w-4" /> }
  ];

  const handleTabChange = (tabId: number) => {
    setActiveTab(tabId);
    if (onTabChange) {
      onTabChange(tabId);
    }
  };

  const handleViewDetails = (row: AlertItem) => {
    console.log("Voir détails de l'alerte:", row);
    Toastify("success", "Fonctionnalité de détail en cours de développement");
  };

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

  const hasAlerts = alerts && alerts.length > 0;
  const positiveEcarts = hasAlerts ? alerts.filter(a => a.ecartCaisseBanque > 0).length : 0;
  const negativeEcarts = hasAlerts ? alerts.filter(a => a.ecartCaisseBanque < 0).length : 0;
  const zeroEcarts = hasAlerts ? alerts.filter(a => a.ecartCaisseBanque === 0).length : 0;

  const exportToCSV = async () => {
    try {
      Toastify("success", "Préparation du fichier CSV en cours...");

      const response: any = await axios.get(
        `${API_AUTH_SUIVI}/encaissements/alerts/${activeTab}?all=true`
      );

      if (response?.error !== false || !response?.data?.result?.length) {
        Toastify("error", "Aucune donnée à exporter");
        return;
      }

      const allAlerts = response?.data?.result || [];

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

      const csvContent = [
        headers.join(","),
        ...csvData.map((row: string[]) => row.join(","))
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      const tabName = alertTabs.find(tab => tab.id === activeTab)?.name || "alertes";
      link.setAttribute("download", `${tabName.toLowerCase().replace(/ /g, "_")}_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      Toastify("success", `Export CSV réussi (${allAlerts.length} enregistrements)`);
    } catch (error) {
      console.error("Erreur lors de l'export CSV:", error);
      Toastify("error", "Échec de l'export CSV");
    }
  };

  const exportToExcel = async () => {
    try {
      Toastify("success", "Préparation du fichier Excel en cours...");

      const response: any = await axios.get(
        `${API_AUTH_SUIVI}/encaissements/alerts/${activeTab}?all=true`
      );

      if (response?.error !== false || !response?.data?.result?.length) {
        Toastify("error", "Aucune donnée à exporter");
        return;
      }

      const allAlerts = response?.data?.result || [];

      if (allAlerts.length > 1048576) {
        onShowConfirmModal && onShowConfirmModal(
          "Attention",
          `Le fichier contient ${allAlerts.length} lignes, ce qui pourrait causer des problèmes d'ouverture avec Excel. Voulez-vous continuer quand même?`,
          () => processExcelExport(allAlerts)
        );
        return;
      }

      processExcelExport(allAlerts);
    } catch (error) {
      console.error("Erreur lors de l'export Excel:", error);
      Toastify("error", "Échec de l'export Excel");
    }
  };

  const processExcelExport = (allAlerts: any[]) => {
    try {
      const data = allAlerts.map(alert => ({
        "Direction Régionale": alert.directionRegionale || "",
        "Code Exploitation": alert.codeExpl || "",
        "Date Encaissement": alert.dateEncaissement || "",
        "Banque": alert.banque || "",
        "Produit": alert.produit || "",
        "Numéro Bordereau": alert.numeroBordereau || "",
        "Montant Caisse": alert.montantRestitutionCaisse,
        "Montant Bordereau": alert.montantBordereauBanque,
        "Écart": alert.ecartCaisseBanque
      }));

      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      const tabName = alertTabs.find(tab => tab.id === activeTab)?.name || "alertes";
      XLSX.utils.book_append_sheet(workbook, worksheet, tabName.substring(0, 31));

      const fileName = `${tabName.toLowerCase().replace(/ /g, "_")}_${new Date().toISOString().split('T')[0]}.xlsx`;

      XLSX.writeFile(workbook, fileName);

      Toastify("success", `Export Excel réussi (${allAlerts.length} enregistrements)`);
    } catch (error) {
      console.error("Erreur lors du traitement de l'export Excel:", error);
      Toastify("error", "Échec de l'export Excel");
    }
  };

  return (
    <div className="fixed inset-0 z-[999999] flex items-center justify-center overflow-y-auto bg-black/70 backdrop-blur-sm">
      <div className="relative flex h-[90vh] w-[95%] max-w-[1600px] flex-col rounded-xl bg-white shadow-2xl dark:bg-gray-800 md:w-[90%]">
        {/* Header avec dégradé */}
        <div className="rounded-t-xl bg-gradient-to-r from-primary to-primary/80 p-5 text-white">
          <div className="mb-0 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h3 className="text-xl font-bold flex items-center">
                <IconBell className="w-5 h-5 mr-2" />
                Alertes d'encaissements
              </h3>

              <div className="flex items-center gap-2">
                <span className="inline-flex items-center justify-center rounded-full bg-white/20 px-2.5 py-1 text-xs font-medium text-white">
                  {total} {total > 1 ? "alertes" : "alerte"}
                </span>
              </div>

            </div>

            {/* Boutons d'exportation */}
            <div className="flex items-center gap-2">
              {hasAlerts && (
                <>
                  <button
                    onClick={exportToCSV}
                    className="flex items-center gap-1.5 rounded-md bg-white/20 px-3 py-1.5 text-sm text-white transition-all hover:bg-white/30 hover:shadow-lg"
                    title="Exporter en CSV"
                  >
                    <IconFileText className="h-4 w-4" />
                    <span className="hidden sm:inline">CSV</span>
                  </button>
                  <button
                    onClick={exportToExcel}
                    className="flex items-center gap-1.5 rounded-md bg-white/20 px-3 py-1.5 text-sm text-white transition-all hover:bg-white/30 hover:shadow-lg"
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

        {/* Onglets de navigation */}
        <div className="border-b border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
          <div className="flex overflow-x-auto">
            {alertTabs.map((tab) => (
              <button
                key={tab.id}
                className={`group relative flex items-center gap-2 px-4 py-4 text-sm font-medium outline-none transition-all duration-300 ${activeTab === tab.id
                  ? "bg-gray-50 text-primary dark:bg-gray-700/50 dark:text-primary"
                  : "text-gray-500 hover:bg-gray-50/50 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-700/30 dark:hover:text-gray-300"
                  }`}
                onClick={() => handleTabChange(tab.id)}
              >
                <div className="flex items-center gap-2">
                  <span className={`transition-all duration-300 ${activeTab === tab.id
                    ? "scale-110 text-primary"
                    : "text-gray-400 group-hover:scale-105 group-hover:text-gray-500"}`}>
                    {tab.icon}
                  </span>
                  <span className={`transform transition-all duration-300 ${activeTab === tab.id ? "translate-x-0.5 font-semibold" : ""}`}>
                    {tab.name}
                  </span>
                  {pagination && (
                    <span className={`inline-flex items-center justify-center rounded-full px-2 py-0.5 text-xs font-medium transition-all duration-300 ${activeTab === tab.id
                      ? "bg-primary/10 text-primary"
                      : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400"
                      }`}>
                      {tab.id === 0 ? chargeCount :
                        tab.id === 2 ? verifyCount :
                          tab.id === 3 ? validCount :
                            tab.id === 4 ? reclamationCount : 0}
                    </span>
                  )}
                </div>
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 h-0.5 w-full bg-primary transition-all duration-300"></div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Corps de la modale */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Barre de recherche et pagination */}
          <div className="border-b border-gray-100 bg-white px-6 py-4 dark:border-gray-700 dark:bg-gray-800">
            <div className="flex flex-wrap items-center justify-between gap-4">
              {/* Barre de recherche */}
              <div className="relative w-full md:w-64">
                <input
                  type="text"
                  placeholder="Rechercher..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="form-input w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-4 text-sm placeholder-gray-400 shadow-sm transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-500"
                />
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>

              {/* Statistiques rapides */}
              {hasAlerts && (
                <div className="hidden lg:flex">
                  <div className="flex items-center space-x-6">
                    <div className="flex items-center gap-1">
                      <span className="inline-block h-2.5 w-2.5 rounded-full bg-green-500"></span>
                      <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                        Ecarts positifs: <span className="font-bold">{positiveEcarts}</span>
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="inline-block h-2.5 w-2.5 rounded-full bg-red-500"></span>
                      <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                        Ecarts négatifs: <span className="font-bold">{negativeEcarts}</span>
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="inline-block h-2.5 w-2.5 rounded-full bg-gray-400"></span>
                      <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                        Ecarts nuls: <span className="font-bold">{zeroEcarts}</span>
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Tableau */}
          <div className="flex-1 overflow-auto p-6">
            <div className="relative h-full rounded-xl border border-gray-200 dark:border-gray-700">
              <div className="h-full overflow-auto">
                {loading && (
                  <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/90 backdrop-blur-sm dark:bg-gray-800/90">
                    <div className="flex flex-col items-center justify-center p-4">
                      <div className="mb-4 h-10 w-10 animate-spin rounded-full border-3 border-primary border-t-transparent"></div>
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
                    if (row.ecartCaisseBanque > 0) return { backgroundColor: "#d1fae5" };
                    if (row.ecartCaisseBanque < 0) return { backgroundColor: "#fee2e2" };
                    return {};
                  }}
                  classNames={{
                    root: "shadow-sm",
                    header: "border-b border-gray-200 bg-gray-50/80 py-4 text-gray-700 font-semibold dark:border-gray-700 dark:bg-gray-800/50 dark:text-gray-300",
                    pagination: "sticky bottom-0 left-0 right-0 z-10 bg-white py-4 shadow-md dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700",
                  }}
                  rowClassName={({ ecartCaisseBanque }) =>
                    `hover:bg-gray-50 dark:hover:bg-gray-700/30 border-b border-gray-100 dark:border-gray-700/50 transition-all ${ecartCaisseBanque !== 0 ? "font-medium" : ""}`
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
                        <div className="max-w-[160px] truncate px-2 py-3" title={row.banque}>
                          {row.banque}
                        </div>
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
                  ]}
                  highlightOnHover
                  totalRecords={pagination?.totalCount || 0}
                  recordsPerPage={pageSize}
                  page={pagination?.currentPage || 1}
                  onPageChange={(page) => {
                    if (pagination && pagination.totalPages && page <= pagination.totalPages) {
                      onPageChange(page);
                    } else if (page === 1) {
                      onPageChange(page);
                    }
                  }}
                  recordsPerPageOptions={PAGE_SIZES}
                  onRecordsPerPageChange={(size) => {
                    setPageSize(size);
                    onPageChange(1);
                  }}
                  sortStatus={sortStatus}
                  onSortStatusChange={setSortStatus}
                  minHeight={400}
                  paginationText={({ from, to, totalRecords }) => {
                    if (filteredAlerts?.length === 0 && pagination && pagination.totalCount > 0) {
                      return `Page ${pagination.currentPage} - Aucune donnée sur cette page (total: ${totalRecords})`;
                    }
                    return `Affichage de ${from} à ${to} sur ${totalRecords} entrées`;
                  }}
                  paginationSize="md"
                  noRecordsText={
                    loading
                      ? "Chargement en cours..."
                      : pagination && pagination.totalCount > 0 && filteredAlerts?.length === 0
                        ? "Aucune donnée sur cette page, utilisez la pagination pour naviguer"
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
                        {pagination && pagination.totalCount > 0 && filteredAlerts?.length === 0
                          ? "Cette page ne contient pas de données"
                          : searchTerm
                            ? "Aucun élément ne correspond à votre recherche"
                            : "Aucune alerte pour le moment"}
                      </p>
                      {pagination && pagination.totalCount > 0 && filteredAlerts?.length === 0 && (
                        <button
                          onClick={() => onPageChange(1)}
                          className="mt-4 rounded-md bg-primary px-4 py-2 text-sm text-white hover:bg-primary/90"
                        >
                          Retour à la première page
                        </button>
                      )}
                    </div>
                  }
                />
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50">
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* Légende des couleurs */}
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
              {/* Bouton d'acquittement */}
              {hasAlerts && (
                <button
                  onClick={() => {
                    onClose();
                    Toastify("success", "Alertes acquittées");
                  }}
                  className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:bg-primary/90 hover:shadow-md focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 dark:ring-offset-gray-800"
                >
                  <IconCheck className="mr-1.5 h-4 w-4 inline" />
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

export default AlertModal;
