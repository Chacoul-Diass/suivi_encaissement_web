"use client";
import Dropdown from "@/components/dropdown";
import { getTranslation } from "@/i18n";
import { TRootState, useAppDispatch } from "@/store";
import { logout } from "@/store/reducers/auth/user.slice";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import IconLogout from "@/components/icon/icon-logout";
import IconBell from "@/components/icon/icon-bell";
import { API_AUTH_SUIVI } from "@/config/constants";
import { handleApiError } from "@/utils/apiErrorHandler";
import axios from "@/utils/axios";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import IconArrowDown from "../icon/icon-arrow-down";
import IconSettings from "../icon/icon-settings";
import IconUser from "../icon/icon-user";
import { useClientSide, safeDOM } from "@/hooks/useClientSide";
import getUserHabilitation from "@/utils/getHabilitation";
import AlertModal from "./alertModal";
import { useAlertModal } from "../contexts/AlertModalContext";
import { fetchNombreAlert } from "@/store/reducers/select/nombrealert.slice";

// Interfaces pour les alertes
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

const Header = () => {
  const router = useRouter();
  const user = useSelector((state: TRootState) => state.auth?.user);
  const userLogin = useSelector((state: TRootState) => state.auth?.loading);
  const habilitation = getUserHabilitation();
  const [mounted, setMounted] = useState(false);
  const [notificationStats, setNotificationStats] = useState({
    chargés: 0,
    vérifiés: 0,
    validés: 0,
    traités: 0
  });
  const [alertsData, setAlertsData] = useState<AlertItem[]>([]);
  const [alertsLoading, setAlertsLoading] = useState(false);
  const [paginationInfo, setPaginationInfo] = useState<PaginationInfo | null>(null);
  const [alertPage, setAlertPage] = useState(1);
  const [alertTabId, setAlertTabId] = useState(0);
  const { openAlertModal, updateModalData } = useAlertModal();
  const [confirmModalProps, setConfirmModalProps] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => { },
    onClose: () => setConfirmModalProps(prev => ({ ...prev, isOpen: false }))
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  const pathname = usePathname();
  const dispatch = useAppDispatch();

  const {
    email = "",
    matricule = "",
    firstname = "",
    lastname = "",
  } = user || {};

  const displayName = mounted ? `${firstname} ${lastname}`.trim() : "";

  const profile = user?.profile?.name;
  const [displayProfile, setDisplayProfile] = useState("");
  const isClient = useClientSide();

  useEffect(() => {
    if (isClient && profile) {
      setDisplayProfile(profile === "ADMIN" ? "ADMINISTRATEUR" : profile);
    }
  }, [isClient, profile]);

  const updateMenuActiveState = () => {
    const currentPath = window.location.pathname;
    const selector = safeDOM.querySelector(
      `ul.horizontal-menu a[href="${currentPath}"]`
    );

    if (selector) {
      const allActiveLinks = safeDOM.querySelectorAll(
        "ul.horizontal-menu .nav-link.active"
      );
      allActiveLinks.forEach((link) => {
        link.classList.remove("active");
      });

      selector.classList.add("active");
    }
  };

  useEffect(() => {
    if (isClient) {
      updateMenuActiveState();
    }
  }, [pathname, isClient]);

  const handleLogout = async () => {
    // Récupérer le refresh token avec le nom de clé correct
    const refreshToken = localStorage.getItem("refreshToken");

    // Fonction pour nettoyer la session et rediriger
    const cleanSessionAndRedirect = () => {
      // Supprimer le cookie d'accès
      document.cookie = "accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT";
      // Nettoyer le stockage local
      // localStorage.clear();
      localStorage.removeItem("persist:suivi-encaissement");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("hasCheckedAlerts");
      // etc. pour chaque élément que vous voulez supprimer
      // Mettre à jour l'état Redux
      // dispatch(logout());
      // Rediriger vers la page de connexion
      window.location.href = "/login";
    };

    // Si aucun refresh token n'est trouvé, simplement nettoyer et rediriger
    if (!refreshToken) {
      cleanSessionAndRedirect();
      return;
    }

    try {
      // Appeler l'API de déconnexion
      await axios.post(`${API_AUTH_SUIVI}/auth/logout`, { refreshToken });
      cleanSessionAndRedirect();
    } catch (error: any) {
      // Journaliser l'erreur pour le débogage
      console.error("Erreur lors de la déconnexion:", error);

      // Afficher un message d'erreur
      const errorMessage = handleApiError(error);
      toast.error(errorMessage);

      // Même en cas d'erreur, déconnecter l'utilisateur
      cleanSessionAndRedirect();
    }
  };


  const { data: nombreAlert, loading: loadingNombreAlert } = useSelector((state: any) => state.nombreAlert);


  useEffect(() => {
    dispatch(fetchNombreAlert());
  }, []);

  const { total } = nombreAlert;

  // Fonction pour récupérer les alertes
  const getAlerts = async (page: number = 1, tabId: number = 0) => {
    try {
      setAlertsLoading(true);
      updateModalData({ loading: true });

      const response: any = await axios.get(
        `${API_AUTH_SUIVI}/encaissements/alerts/${tabId}?page=${page}`
      );

      if (response?.error === false) {
        const newAlerts = response?.data?.result || [];
        const newPagination = response?.data?.pagination;

        setAlertsData(newAlerts);
        setPaginationInfo(newPagination);

        // Mettre à jour les données dans la modale
        updateModalData({
          alerts: newAlerts,
          pagination: newPagination,
          loading: false
        });

        return response?.data;
      }
      return null;
    } catch (error) {
      console.error("Erreur lors de la récupération des alertes:", error);
      updateModalData({ loading: false });
      return null;
    } finally {
      setAlertsLoading(false);
    }
  };

  // Gestionnaires d'événements pour les alertes
  const handleAlertPageChange = (page: number) => {
    if (page < 1) {
      page = 1;
    } else if (paginationInfo && paginationInfo.totalPages && page > paginationInfo.totalPages) {
      page = paginationInfo.totalPages;
    }
    setAlertPage(page);
    getAlerts(page, alertTabId);
  };

  const handleAlertTabChange = (tabId: number) => {
    setAlertTabId(tabId);
    setAlertPage(1);
    getAlerts(1, tabId);
  };

  const handleShowConfirmModal = (title: string, message: string, onConfirm: () => void) => {
    setConfirmModalProps({
      isOpen: true,
      title,
      message,
      onConfirm,
      onClose: () => {
        setConfirmModalProps(prev => ({ ...prev, isOpen: false }));
        toast.warning("Export Excel annulé");
      }
    });
  };

  // Mettre à jour les statistiques des notifications
  useEffect(() => {
    const fetchNotificationStats = async () => {
      try {
        const response: any = await axios.get(`${API_AUTH_SUIVI}/encaissements/alerts/stats`);
        if (response?.error === false) {
          setNotificationStats(response.data);
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des statistiques:", error);
      }
    };

    fetchNotificationStats();
  }, []);

  return (
    <header className="z-40">
      <div className="bg-white shadow-sm">
        <div className="relative flex w-full items-center justify-between px-5 py-2.5">
          <div className="ml-8 flex items-center">
            <div className="flex flex-col">
              <h1 className="bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-2xl font-bold text-transparent">
                Suivi des Encaissements
              </h1>
              <div className="mt-1 flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500"></div>
                <span className="text-sm text-gray-500">
                  Système de gestion
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              className="group relative flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-gray-50 to-gray-100 transition-all duration-300 hover:from-gray-100 hover:to-gray-200 hover:shadow-lg hover:shadow-gray-200/50 active:scale-95"
              aria-label="Notifications"
            >
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/5 to-primary/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
              <IconBell className="h-5 w-5 text-gray-600 transition-all duration-300 group-hover:scale-110 group-hover:text-primary" />
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-red-600 text-[11px] font-semibold text-white ring-2 ring-white shadow-sm transition-all duration-300 group-hover:scale-110 group-hover:shadow-md">
                3
              </span>
              <div className="absolute -bottom-1 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-gradient-to-br from-red-500 to-red-600 opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:scale-110"></div>
            </button>
            <div className="relative">
              <Dropdown
                offset={[0, 12]}
                placement={"bottom-end"}
                btnClassName="relative group"
                button={
                  <div className="flex cursor-pointer items-center gap-3 rounded-lg border border-gray-100 bg-white p-2.5 px-4 transition-all duration-300 hover:border-gray-200 hover:bg-gray-50 hover:shadow-sm">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 ring-2 ring-white">
                      {userLogin ? (
                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                      ) : (
                        <IconUser className="h-5 w-5 text-primary" />
                      )}
                    </div>
                    <div className="flex flex-col">
                      <div className="text-sm font-medium text-gray-900">
                        {displayName}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span>{profile || "Utilisateur"}</span>
                        <span className="inline-block h-1 w-1 rounded-full bg-gray-300"></span>
                        <span>{matricule}</span>
                      </div>
                    </div>
                    <IconArrowDown className="h-4 w-4 text-gray-400 transition-transform duration-300 group-hover:rotate-180" />
                  </div>
                }
              >
                <ul className="w-[320px] divide-y divide-gray-100 rounded-xl border border-gray-100/50 bg-white !py-2 font-medium text-gray-600 shadow-xl">
                  <li className="px-4 pb-4">
                    <div className="flex items-center gap-4">
                      <div className="flex-shrink-0">
                        <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-primary/10">
                          <IconUser className="h-8 w-8 text-primary" />
                        </div>
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="truncate text-base font-semibold text-gray-900">
                          {displayName}
                        </h4>
                        <p className="mt-0.5 truncate text-sm text-gray-500">
                          {email}
                        </p>
                        <div className="mt-2 flex items-center gap-2">
                          <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                            {profile || "Utilisateur"}
                          </span>
                          <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
                            {matricule}
                          </span>
                        </div>
                      </div>
                    </div>
                  </li>
                  <li>
                    <Link
                      href="/profil"
                      className="group flex items-center gap-3 px-4 py-3 text-sm transition-all duration-300 hover:bg-gray-50"
                    >
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100 transition-colors duration-300 group-hover:bg-gray-200">
                        <IconSettings className="h-4.5 w-4.5 text-gray-600" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-700">
                          Paramètres du profil
                        </span>
                        <span className="text-xs text-gray-500">
                          Gérer vos préférences
                        </span>
                      </div>
                    </Link>
                  </li>
                  <li>
                    <button
                      className="group flex w-full items-center gap-3 px-4 py-3 text-sm text-red-600 transition-all duration-300 hover:bg-red-50"
                      onClick={handleLogout}
                      disabled={userLogin}
                    >
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-100 transition-colors duration-300 group-hover:bg-red-200">
                        {userLogin ? (
                          <div className="h-4.5 w-4.5 animate-spin rounded-full border-2 border-red-600 border-t-transparent" />
                        ) : (
                          <IconLogout className="h-4.5 w-4.5 text-red-600" />
                        )}
                      </div>
                      <div className="flex flex-col items-start">
                        <span className="font-medium">Se déconnecter</span>
                        <span className="text-xs text-red-500">
                          Terminer la session
                        </span>
                      </div>
                    </button>
                  </li>
                </ul>
              </Dropdown>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
