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
import IconHistory from "../icon/icon-history";
import IconClipboardCheck from "../icon/icon-clipboard-check";
import IconUpload from "../icon/icon-upload";
import IconCheckCircle from "../icon/icon-check-circle";
import IconShield from "../icon/icon-shield";
import IconWarning from "../icon/icon-warning";
import * as XLSX from "xlsx";
import { IconBell } from "@tabler/icons-react";

// Interface pour la modal de confirmation
interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmButtonText?: string;
  cancelButtonText?: string;
  type?: 'warning' | 'info' | 'error' | 'success';
}

// Composant Modal de confirmation
const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmButtonText = "Confirmer",
  cancelButtonText = "Annuler",
  type = 'warning'
}: ConfirmModalProps) => {
  if (!isOpen) return null;

  // Déterminer les couleurs et icônes en fonction du type
  const getTypeStyles = () => {
    switch (type) {
      case 'warning':
        return {
          icon: <IconWarning className="h-8 w-8 text-amber-500" />,
          confirmButtonClass: "bg-amber-500 hover:bg-amber-600",
          headerClass: "bg-gradient-to-r from-amber-500 to-amber-400"
        };
      case 'error':
        return {
          icon: <IconX className="h-8 w-8 text-red-500" />,
          confirmButtonClass: "bg-red-500 hover:bg-red-600",
          headerClass: "bg-gradient-to-r from-red-500 to-red-400"
        };
      case 'success':
        return {
          icon: <IconCheck className="h-8 w-8 text-green-500" />,
          confirmButtonClass: "bg-green-500 hover:bg-green-600",
          headerClass: "bg-gradient-to-r from-green-500 to-green-400"
        };
      case 'info':
      default:
        return {
          icon: <IconBell className="h-8 w-8 text-primary" />,
          confirmButtonClass: "bg-primary hover:bg-primary/90",
          headerClass: "bg-gradient-to-r from-primary to-primary/80"
        };
    }
  };

  const typeStyles = getTypeStyles();

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center overflow-y-auto bg-black/70 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-xl bg-white shadow-2xl dark:bg-gray-800">
        {/* Header avec dégradé */}
        <div className={`rounded-t-xl ${typeStyles.headerClass} p-4 text-white`}>
          <div className="mb-0 flex items-center justify-between">
            <h3 className="text-lg font-bold">{title}</h3>
            <button
              onClick={onClose}
              className="rounded-full p-1 text-white transition-all hover:bg-white/20"
            >
              <IconX className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Corps de la modal */}
        <div className="p-6">
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0">
              {typeStyles.icon}
            </div>
            <p className="text-base text-gray-600 dark:text-gray-300">{message}</p>
          </div>
        </div>

        {/* Boutons d'action */}
        <div className="flex justify-end gap-3 border-t border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50">
          <button
            onClick={onClose}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-all hover:bg-gray-50 hover:shadow dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
          >
            {cancelButtonText}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`rounded-lg px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:shadow-md focus:ring-2 focus:ring-offset-2 dark:ring-offset-gray-800 ${typeStyles.confirmButtonClass}`}
          >
            {confirmButtonText}
          </button>
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
  const [confirmModalProps, setConfirmModalProps] = useState<ConfirmModalProps>({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => { },
    onClose: () => setConfirmModalProps(prev => ({ ...prev, isOpen: false }))
  });

  const fetchDashboardData = async (filters?: any) => {
    const cleanArray = (arr: string[] | undefined) =>
      arr?.map((item) => item.trim()).filter(Boolean) || [];

    const formatArray = (arr: string[] | undefined) => {
      const cleaned = cleanArray(arr);
      return cleaned.length ? JSON.stringify(cleaned) : undefined;
    };

    console.log(filters, "filters");

    const params: Record<string, any> = {};

    if (filters?.selectedDRLabel?.length) {
      params["directionRegional"] = formatArray(
        filters.selectedDRLabel.map(String)
      );
    } else if (filters?.selectedDRIds?.length) {
      // Si on n'a pas les labels, on essaie avec les IDs
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

    console.log(params, "params");
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
  const [activeTab, setActiveTab] = useState(() => {
    // Récupérer l'onglet actif depuis localStorage ou utiliser 1 par défaut
    return parseInt(localStorage.getItem('activeTab') || '1');
  });
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
    const cleanArray = (arr: string[] | undefined) =>
      arr?.map((item) => item.trim()).filter(Boolean) || [];

    const formatArray = (arr: string[] | undefined) => {
      const cleaned = cleanArray(arr);
      return cleaned.length ? JSON.stringify(cleaned) : undefined;
    };

    console.log(filters, "filters ecartData");

    const params: Record<string, any> = {};

    if (filters?.selectedDRLabel?.length) {
      params["directionRegional"] = formatArray(
        filters.selectedDRLabel.map(String)
      );
    } else if (filters?.selectedDRIds?.length) {
      // Si on n'a pas les labels, on essaie avec les IDs
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

    console.log(params, "params ecartData");
    try {
      setLoading(true);
      const response: any = await axiosInstance.get(
        `${API_AUTH_SUIVI}/dashboard/get-ecart-data`,
        { params }
      );

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
      fetchDashboardData({});
      fetchEcartData({});
    } else {
      const filters = {
        selectedDRIds: selectedDRIds,
        selectedDRLabel: selectedDRLabel,
        selectedSecteurIds: selectedCodeExpl,
      };

      fetchDashboardData(filters);
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
      selectedDRLabel: selectedDRLabel,
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
      selectedDRLabel: selectedDRLabel,
      selectedSecteurIds: ids,
    };

    fetchDashboardData(filters);
    fetchEcartData(filters);
  };

  const handleApplyFilters = () => {
    const filters = {
      selectedDRIds: selectedDRIds,
      selectedDRLabel: selectedDRLabel,
      selectedSecteurIds: selectedCodeExpl,
    };
    fetchDashboardData(filters);
    fetchEcartData(filters);
  };

  const handleResetFilters = () => {
    setSelectedDR([]);
    setSelectedSecteur([]);
    setSelectedDRIds([]);
    setSelectedCodeExpl([]);
    setSecteurOptions([]);
    setSelectedDRLabel([]);
    fetchDashboardData({});
    fetchEcartData({});
  };

  // Sauvegarder l'onglet actif dans localStorage chaque fois qu'il change
  useEffect(() => {
    localStorage.setItem('activeTab', activeTab.toString());
  }, [activeTab]);

  return (
    <>
      <ConfirmModal {...confirmModalProps} />
      <div className="panel">
        <div className="panel relative mb-8">
          <div className="flex border-b border-gray-200 dark:border-gray-700">
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
                  className="flex items-center gap-2 rounded-md bg-white px-4 py-2.5 font-semibold text-primary shadow-sm transition-all hover:bg-primary hover:text-white hover:shadow dark:bg-[#191e3a] dark:hover:bg-primary"
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
                className="flex items-center gap-2 rounded-md border border-primary bg-white px-4 py-2 text-primary transition-all hover:bg-primary hover:text-white hover:shadow dark:bg-transparent"
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
                    className="group flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-all duration-200 hover:bg-gray-50 hover:shadow dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
                  >
                    <IconRefresh className="h-4 w-4 transition-transform duration-200 group-hover:rotate-180" />
                    Réinitialiser
                  </button>
                  <button
                    type="button"
                    onClick={handleApplyFilters}
                    disabled={selectedDRIds?.length === 0}
                    className="group flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:bg-primary/90 hover:shadow-md focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-primary/60 dark:ring-offset-gray-800"
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
                      <h5 className="text-lg font-semibold flex items-center">
                        <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary mr-2">
                          <IconCashBanknotes className="h-5 w-5" />
                        </span>
                        Revenue
                      </h5>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-sm ${!isTableView ? "text-primary font-medium" : "text-gray-500"}`}
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
                          className={`text-sm ${isTableView ? "text-primary font-medium" : "text-gray-500"}`}
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
                      <div className="flex h-[325px] items-center justify-center rounded-lg bg-white/50 py-4 text-center text-gray-500 dark:bg-black/20 dark:text-gray-400">
                        <div className="flex flex-col items-center">
                          <IconBox className="h-10 w-10 text-gray-300 dark:text-gray-600 mb-3" />
                          <p>Aucun élément disponible pour le moment.</p>
                        </div>
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
                      <h5 className="text-lg font-semibold flex items-center">
                        <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-success/10 text-success mr-2">
                          <IconTag className="h-5 w-5" />
                        </span>
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
                          <div className="flex items-center justify-center rounded-lg p-3 transition-all hover:bg-secondary/5 hover:scale-102 group">
                            <div className="h-10 w-10 ltr:mr-3 rtl:ml-3">
                              <div className="grid h-10 w-10 place-content-center rounded-full bg-secondary-light text-secondary shadow group-hover:shadow-lg dark:bg-secondary dark:text-secondary-light">
                                <IconInbox className="h-5 w-5" />
                              </div>
                            </div>
                            <div className="flex-1 text-center">
                              <div className="mb-2 flex justify-between font-semibold text-white-dark">
                                <h6 className="text-sm">Traités</h6>
                                <p className="text-sm">{completionRate.completionRateCloture}%</p>
                              </div>
                              <div className="h-2.5 rounded-full bg-dark-light shadow dark:bg-[#1b2e4b]">
                                <div
                                  className="h-full rounded-full bg-gradient-to-r from-[#7579ff] to-[#b224ef] transition-all duration-500"
                                  style={{
                                    width: `${completionRate.completionRateCloture}%`,
                                  }}
                                ></div>
                              </div>
                            </div>
                          </div>

                          {/* Validation */}
                          <div className="flex items-center justify-center rounded-lg p-3 transition-all hover:bg-success/5 hover:scale-102 group">
                            <div className="h-10 w-10 ltr:mr-3 rtl:ml-3">
                              <div className="grid h-10 w-10 place-content-center rounded-full bg-success-light text-success shadow group-hover:shadow-lg dark:bg-success dark:text-success-light">
                                <IconTag className="h-5 w-5" />
                              </div>
                            </div>
                            <div className="flex-1 text-center">
                              <div className="mb-2 flex justify-between font-semibold text-white-dark">
                                <h6 className="text-sm">Validés</h6>
                                <p className="text-sm">
                                  {completionRate.completionRateValidation}%
                                </p>
                              </div>
                              <div className="h-2.5 rounded-full bg-dark-light shadow dark:bg-[#1b2e4b]">
                                <div
                                  className="h-full rounded-full bg-gradient-to-r from-[#3cba92] to-[#0ba360] transition-all duration-500"
                                  style={{
                                    width: `${completionRate.completionRateValidation}%`,
                                  }}
                                ></div>
                              </div>
                            </div>
                          </div>

                          {/* Réclamation */}
                          <div className="flex items-center justify-center rounded-lg p-3 transition-all hover:bg-warning/5 hover:scale-102 group">
                            <div className="h-10 w-10 ltr:mr-3 rtl:ml-3">
                              <div className="grid h-10 w-10 place-content-center rounded-full bg-warning-light text-warning shadow group-hover:shadow-lg dark:bg-warning dark:text-warning-light">
                                <IconCreditCard className="h-5 w-5" />
                              </div>
                            </div>
                            <div className="flex-1 text-center">
                              <div className="mb-2 flex justify-between font-semibold text-white-dark">
                                <h6 className="text-sm">Litiges</h6>
                                <p className="text-sm">
                                  {completionRate.completionRateReclamation}%
                                </p>
                              </div>
                              <div className="h-2.5 w-full rounded-full bg-dark-light shadow dark:bg-[#1b2e4b]">
                                <div
                                  className="h-full rounded-full bg-gradient-to-r from-[#f09819] to-[#ff5858] transition-all duration-500"
                                  style={{
                                    width: `${completionRate.completionRateReclamation}%`,
                                  }}
                                ></div>
                              </div>
                            </div>
                          </div>

                          {/* Reversement */}
                          <div className="flex items-center justify-center rounded-lg p-3 transition-all hover:bg-primary/5 hover:scale-102 group">
                            <div className="h-10 w-10 ltr:mr-3 rtl:ml-3">
                              <div className="grid h-10 w-10 place-content-center rounded-full bg-primary-light text-primary shadow group-hover:shadow-lg dark:bg-primary dark:text-primary-light">
                                <IconInbox className="h-5 w-5" />
                              </div>
                            </div>
                            <div className="flex-1 text-center">
                              <div className="mb-2 flex justify-between font-semibold text-white-dark">
                                <h6 className="text-sm">Chargés</h6>
                                <p className="text-sm">{completionRate.completionRateReverse}%</p>
                              </div>
                              <div className="h-2.5 w-full rounded-full bg-dark-light shadow dark:bg-[#1b2e4b]">
                                <div
                                  className="h-full rounded-full bg-gradient-to-r from-[#00c6ff] to-[#0072ff] transition-all duration-500"
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
                        className="h-[150px] w-full object-contain transition-all duration-300 hover:scale-105"
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
                    <h5 className="mb-5 text-lg font-semibold dark:text-white-light flex items-center">
                      <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary mr-2">
                        <IconCreditCard className="h-5 w-5" />
                      </span>
                      Banques avec le plus d'écart
                    </h5>

                    {loading ? (
                      <div className="space-y-3 p-3">
                        {Array.from({ length: 5 }).map((_, index) => (
                          <div key={index} className="flex items-center gap-3">
                            <div className="h-8 w-8 animate-pulse rounded-md bg-gray-300 dark:bg-gray-700"></div>
                            <div className="h-4 w-full animate-pulse rounded-md bg-gray-300 dark:bg-gray-700"></div>
                          </div>
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

                            const bgColor = index === 0
                              ? "hover:bg-primary/5"
                              : index === 1
                                ? "hover:bg-success/5"
                                : "hover:bg-danger/5";

                            const iconColor = index === 0
                              ? "text-primary"
                              : index === 1
                                ? "text-success"
                                : "text-danger";

                            return (
                              <div
                                key={index}
                                className={`group relative flex items-center rounded-lg py-3 px-2 transition-all duration-300 ${bgColor}`}
                              >
                                <div className={`flex h-8 w-8 items-center justify-center rounded-md ${index === 0 ? "bg-primary/10" : index === 1 ? "bg-success/10" : "bg-danger/10"} mr-3`}>
                                  <svg
                                    className={`h-4 w-4 ${iconColor}`}
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  >
                                    <rect x="2" y="4" width="20" height="16" rx="2" />
                                    <line x1="2" y1="10" x2="22" y2="10" />
                                  </svg>
                                </div>
                                <div className="flex-1 ml-1 font-medium">{banque?.banque}</div>
                                <div className="text-sm font-semibold tabular-nums text-gray-700 dark:text-gray-300 ltr:ml-auto rtl:mr-auto">
                                  {banque?.totalEcartReleve.toLocaleString("fr-FR")} F CFA
                                </div>
                                <span
                                  className={`badge ${badgeClass} absolute text-xs opacity-0 group-hover:opacity-100 dark:bg-black ltr:right-2 rtl:left-0`}
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
                      <h5 className="text-lg font-semibold dark:text-white-light flex items-center">
                        <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-warning/10 text-warning mr-2">
                          <IconHistory className="h-5 w-5" />
                        </span>
                        Les caisses avec le plus et le moins d'écarts
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
                            const bgColorClass = isPositive
                              ? "hover:bg-success/5"
                              : "hover:bg-danger/5";
                            const signe = isPositive ? "+" : "";

                            return (
                              <div className={`flex items-center rounded-lg p-3 transition-all duration-300 ${bgColorClass}`} key={index}>
                                <span
                                  className={`grid h-10 w-10 shrink-0 place-content-center rounded-lg shadow-sm ${badgeClass}`}
                                >
                                  J{index + 1}
                                </span>
                                <div className="flex-1 px-3">
                                  <div className="font-medium">{`Journée ${caisse?.numeroJourneeCaisse}`}</div>
                                  <div className="text-xs text-white-dark dark:text-gray-500">
                                    {isPositive
                                      ? "Écart positif"
                                      : "Écart négatif"}
                                  </div>
                                </div>
                                <span
                                  className={`whitespace-pre px-1 text-base font-semibold ${textColorClass} ltr:ml-auto rtl:mr-auto`}
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
                    <div className="min-h-[70px] bg-gradient-to-r from-primary via-primary/90 to-primary/80 p-4">
                      <div className="flex items-center justify-between text-white">
                        <p className="text-xl font-semibold flex items-center">
                          <IconCashBanknotes className="h-5 w-5 mr-2" />
                          Écarts
                        </p>
                      </div>
                    </div>
                    <div className="-mt-6 grid grid-cols-2 gap-4 px-8">
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
                          <div className="rounded-lg bg-white px-4 py-3 shadow-lg transition-all hover:shadow-xl dark:bg-[#060818]">
                            <span className="mb-4 flex items-center justify-between dark:text-white">
                              <span className="font-medium">Écart (A-B)</span>
                              <IconCaretDown
                                className={`h-4 w-4 ${ecart?.ecartAB >= 0
                                  ? "text-success"
                                  : "text-danger"
                                  }`}
                              />
                            </span>
                            <div className="mt-2 flex items-center justify-center rounded-md bg-[#ebedf2] px-3 py-2 text-base font-bold text-[#515365] shadow-sm dark:bg-black dark:text-[#bfc9d4]">
                              {ecart?.ecartAB?.toLocaleString("fr-FR")} F CFA
                            </div>
                          </div>
                          {/* Écart (B-C) */}
                          <div className="rounded-lg bg-white px-4 py-3 shadow-lg transition-all hover:shadow-xl dark:bg-[#060818]">
                            <span className="mb-4 flex items-center justify-between dark:text-white">
                              <span className="font-medium">Écart (B-C)</span>
                              <IconCaretDown
                                className={`h-4 w-4 ${ecart?.ecartBC >= 0
                                  ? "text-success"
                                  : "text-danger"
                                  }`}
                              />
                            </span>
                            <div className="mt-2 flex items-center justify-center rounded-md bg-[#ebedf2] px-3 py-2 text-base font-bold text-[#515365] shadow-sm dark:bg-black dark:text-[#bfc9d4]">
                              {ecart?.ecartBC?.toLocaleString("fr-FR")} F CFA
                            </div>
                          </div>
                        </>
                      )}
                    </div>

                    <div className="p-5">
                      <div className="mb-5">
                        <span className="inline-flex items-center rounded-full bg-[#1b2e4b] px-4 py-1.5 text-xs font-medium text-white">
                          <span className="mr-2 h-1.5 w-1.5 rounded-full bg-white"></span>
                          Liste des caisses avec le plus de traités
                        </span>
                      </div>
                      <div className="mb-5 space-y-2.5">
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
                                className="flex items-center justify-between rounded-lg p-2 transition-all hover:bg-gray-50 dark:hover:bg-gray-700/30"
                              >
                                <p className="font-semibold text-[#515365] flex items-center">
                                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary mr-2 text-xs">
                                    {index + 1}
                                  </span>
                                  Journée {caisse.numeroJourneeCaisse}
                                </p>
                                <p className="text-base">
                                  <span className="font-semibold text-primary">
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
                <h5 className="text-lg font-semibold flex items-center">
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary mr-2">
                    <IconRefresh className="h-5 w-5" />
                  </span>
                  Écarts de restitution
                </h5>
              </div>
              <div className="relative">
                <div
                  className={`table-responsive overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700 ${showAllRestitution ? "max-h-[400px] overflow-y-auto" : ""
                    }`}
                >
                  {loading ? (
                    <div className="flex h-40 items-center justify-center">
                      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                    </div>
                  ) : !ecartData?.restitution?.length ? (
                    <div className="flex h-40 flex-col items-center justify-center text-center text-gray-500 dark:text-gray-400">
                      <IconBox className="h-10 w-10 text-gray-300 dark:text-gray-600 mb-3" />
                      <p>Aucune donnée disponible</p>
                    </div>
                  ) : (
                    <table className="w-full table-auto">
                      <thead className="sticky top-0 bg-gray-50 dark:bg-gray-700">
                        <tr className="border-b border-[#e0e6ed] dark:border-[#191e3a]">
                          <th className="px-6 py-3 text-left text-sm font-semibold text-gray-800 dark:text-white-light">
                            Direction Régionale
                          </th>
                          <th className="px-6 py-3 text-left text-sm font-semibold text-gray-800 dark:text-white-light">
                            Écart A
                          </th>
                          <th className="px-6 py-3 text-left text-sm font-semibold text-gray-800 dark:text-white-light">
                            Écart B
                          </th>
                          <th className="px-6 py-3 text-left text-sm font-semibold text-gray-800 dark:text-white-light">
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
                            className="border-b border-[#e0e6ed] transition-colors hover:bg-gray-50 dark:border-[#191e3a] dark:hover:bg-[#1a1c2d]"
                          >
                            <td className="px-6 py-3 text-left text-sm font-medium text-gray-800 dark:text-white-light">
                              {item.directionRegionale}
                            </td>
                            <td
                              className={`px-6 py-3 text-left text-sm ${item.montantA - item.montantB < 0
                                ? "text-primary font-medium"
                                : "text-gray-800"
                                } dark:text-white-light`}
                            >
                              {(item.montantA).toLocaleString()}{" "}
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

        {/* {isFirstLogin === 1 && <DashboardTutorial />} */}
      </div>
    </>
  );
};

export default ComponentsDashboardSales;
