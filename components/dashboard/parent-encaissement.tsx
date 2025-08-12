"use client";

import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import IconBox from "../icon/icon-box";
import IconHome from "@/components/icon/icon-home";
import { Tab } from "@headlessui/react";
import React, { Fragment, useEffect, useState, useRef } from "react";
import EncaissementComptable from "./enfant1-encaissement";
import IconBarChart from "../icon/icon-bar-chart";
import IconXCircle from "../icon/icon-x-circle";
import IconChecks from "../icon/icon-checks";
import IconCircleCheck from "../icon/icon-circle-check";
import { TAppDispatch, TRootState } from "@/store";
import { DataReverse } from "@/utils/interface";
import { EStatutEncaissement } from "@/utils/enums";
import getUserHabilitation from "@/utils/getHabilitation";
import IconArchive from "../icon/icon-archive";
import { fetchDataReleve } from "@/store/reducers/encaissements/releve.slice";
import axiosInstance from "@/utils/axios";
import { API_AUTH_SUIVI } from "@/config/constants";
import { active } from "sortablejs";
import GlobalFiltre from "@/components/filtre/globalFiltre";
import { useFilterPersistence } from "@/hooks/useFilterPersistence";
import { useRejetesDetection } from "@/hooks/useRejetesDetection";
import { toast } from "react-toastify";
// import { notify } from "@/utils/notificationService";

const ComponentsDashboardValider = () => {
  const dispatch = useDispatch<TAppDispatch>();
  const habilitation = getUserHabilitation();

  // Utiliser le hook de détection des encaissements rejetés
  const {
    currentCount: rejetesCount,
    hasIncreased,
    increaseAmount,
    hasNotified,
    refreshCount: refreshRejetesCount,
    resetIncreaseState,
    markAsNotified,
    checkAfterAction
  } = useRejetesDetection(0); // Polling désactivé, rafraîchissement manuel uniquement

  // Référence pour l'audio de notification
  const notificationSound = useRef<HTMLAudioElement | null>(null);

  // Fonction pour jouer le son de notification
  const playNotificationSound = () => {
    try {
      if (!notificationSound.current) {
        notificationSound.current = new Audio('/assets/sounds/notification.mp3');
        notificationSound.current.volume = 0.5; // Volume à 50%
      }
      notificationSound.current.play().catch(error => {
        console.warn("Impossible de jouer le son de notification:", error);
      });
    } catch (error) {
      console.warn("Erreur lors du chargement du son de notification:", error);
    }
  };

  // Définition des onglets disponibles dans l'ordre métier souhaité
  const allTabs = [
    {
      id: EStatutEncaissement.EN_ATTENTE, // 0
      label: "Encaissements Chargés",
      icon: IconBarChart,
      habilitationName: "ENCAISSEMENTS CHARGES",
      order: 1, // Premier dans l'ordre
    },
    {
      id: EStatutEncaissement.TRAITE, // 2
      label: "Encaissements Vérifiés",
      icon: IconChecks,
      habilitationName: "ENCAISSEMENTS VERIFIES",
      order: 2, // Deuxième dans l'ordre
    },
    {
      id: EStatutEncaissement.REJETE, // 1
      label: "Encaissements Rejetés",
      icon: IconXCircle,
      habilitationName: "ENCAISSEMENTS REJETES",
      order: 5, // Troisième dans l'ordre
    },
    {
      id: EStatutEncaissement.DFC, // 3
      label: "Encaissements Validés",
      icon: IconCircleCheck,
      habilitationName: "ENCAISSEMENTS VALIDES",
      order: 4, // Quatrième dans l'ordre
    },
    {
      id: EStatutEncaissement.VALIDE, // 5
      label: "Encaissements Traités",
      icon: IconArchive,
      habilitationName: "ENCAISSEMENTS TRAITES",
      order: 3, // Cinquième dans l'ordre
    },
  ];

  // Filtrer les onglets selon les habilitations et garantir l'ordre
  const filteredTabs = allTabs
    .filter((tab) =>
      habilitation?.some(
        (h: { name: string; LIRE: boolean }) =>
          h.name === tab.habilitationName && h.LIRE === true
      )
    )
    .sort((a, b) => a.order - b.order); // Trier selon l'ordre défini - Chargés → Vérifiés → Rejetés → Validés → Traités

  // Debug: Afficher l'ordre des onglets

  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);



  // Données des directions régionales pour le filtre
  const [drData, setDrData] = useState([]);

  // Charger les données des DR au chargement du composant
  useEffect(() => {
    const fetchDrData = async () => {
      try {
        const response = await axiosInstance.get(`${API_AUTH_SUIVI}/direction-regionale`);
        if (response?.data && !response.data.error) {
          setDrData(response.data || []);
        }
      } catch (error) {
        console.error("Erreur lors du chargement des directions régionales:", error);
      }
    };

    fetchDrData();
  }, []);

  // Déterminer le statut initial en fonction de l'URL et des habilitations
  const getInitialTab = () => {
    // Vérifier les habilitations
    const hasChargeAccess = habilitation?.some((h: { name: string; LIRE: boolean }) => h.name === "ENCAISSEMENTS CHARGES" && h.LIRE === true);
    const hasVerifiesAccess = habilitation?.some((h: { name: string; LIRE: boolean }) => h.name === "ENCAISSEMENTS VERIFIES" && h.LIRE === true);
    const hasRejetesAccess = habilitation?.some((h: { name: string; LIRE: boolean }) => h.name === "ENCAISSEMENTS REJETES" && h.LIRE === true);
    const hasValidesAccess = habilitation?.some((h: { name: string; LIRE: boolean }) => h.name === "ENCAISSEMENTS VALIDES" && h.LIRE === true);
    const hasTraitesAccess = habilitation?.some((h: { name: string; LIRE: boolean }) => h.name === "ENCAISSEMENTS TRAITES" && h.LIRE === true);

    if (typeof window !== 'undefined') {
      // Vérifier si on est sur une page spécifique
      if (window.location.pathname.includes('charge') && hasChargeAccess) {
        return EStatutEncaissement.EN_ATTENTE; // 0
      }
      if (window.location.pathname.includes('verifies') && hasVerifiesAccess) {
        return EStatutEncaissement.TRAITE; // 2 = Encaissements vérifiés
      }
      if (window.location.pathname.includes('rejetes') && hasRejetesAccess) {
        return EStatutEncaissement.REJETE; // 1
      }
      if (window.location.pathname.includes('valides') && hasValidesAccess) {
        return EStatutEncaissement.VALIDE; // 3
      }
      if (window.location.pathname.includes('traites') && hasTraitesAccess) {
        return EStatutEncaissement.DFC; // 7
      }

      // Vérifier le paramètre d'URL tab=X
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('tab');
      if (tabParam) {
        const tabValue = parseInt(tabParam, 10);
        if (!isNaN(tabValue)) {
          // Vérifier si l'utilisateur a les droits pour ce tab
          if ((tabValue === EStatutEncaissement.EN_ATTENTE && hasChargeAccess) ||
            (tabValue === EStatutEncaissement.TRAITE && hasVerifiesAccess) ||
            (tabValue === EStatutEncaissement.REJETE && hasRejetesAccess) ||
            (tabValue === EStatutEncaissement.VALIDE && hasValidesAccess) ||
            (tabValue === EStatutEncaissement.DFC && hasTraitesAccess)) {
            return tabValue;
          }
        }
      }
    }

    // Si aucun onglet n'est spécifié par l'URL, suivre l'ordre de priorité
    // 1. Chargé, 2. Vérifié, 3. Rejeté, 4. Validé, 5. Traité
    if (hasChargeAccess) return EStatutEncaissement.EN_ATTENTE; // 0 - Priorité 1
    if (hasVerifiesAccess) return EStatutEncaissement.TRAITE; // 2 - Priorité 2
    if (hasRejetesAccess) return EStatutEncaissement.REJETE; // 1 - Priorité 3
    if (hasValidesAccess) return EStatutEncaissement.VALIDE; // 3 - Priorité 4
    if (hasTraitesAccess) return EStatutEncaissement.DFC; // 7 - Priorité 5

    // Valeur par défaut si aucune habilitation n'est trouvée
    return EStatutEncaissement.EN_ATTENTE; // 0
  };

  // Utiliser la fonction pour initialiser l'état
  const [activeTab, setActiveTab] = useState(getInitialTab());

  // Déterminer l'index de l'onglet actif dans le tableau filteredTabs
  const getSelectedTabIndex = () => {
    const index = filteredTabs.findIndex(tab => tab.id === activeTab);
    return index >= 0 ? index : 0; // Par défaut, le premier onglet si non trouvé
  };

  const [selectedTabIndex, setSelectedTabIndex] = useState(getSelectedTabIndex());

  // Mettre à jour selectedTabIndex lorsque activeTab change
  useEffect(() => {
    if (isMounted) {
      const index = filteredTabs.findIndex(tab => tab.id === activeTab);
      if (index >= 0) {
        setSelectedTabIndex(index);
      }
    }
  }, [activeTab, filteredTabs, isMounted]);

  // Rafraîchir le compteur quand l'onglet actif change vers les rejetés
  useEffect(() => {
    if (activeTab === EStatutEncaissement.REJETE) {
      // Dépendre uniquement de activeTab pour éviter une boucle via la référence de fonction
      refreshRejetesCount();
    }
  }, [activeTab]);

  // Effet de notification désactivé (pooling notifications commenté)
  // useEffect(() => {
  //   if (hasIncreased === true && Number(increaseAmount) > 0 && !hasNotified) {
  //     // Notifications désactivées
  //   }
  // }, [hasIncreased, increaseAmount, hasNotified, resetIncreaseState, markAsNotified, rejetesCount]);

  // Vérification automatique désactivée
  // useEffect(() => {
  //   if (activeTab === EStatutEncaissement.REJETE) {
  //     checkAfterAction();
  //   }
  // }, [activeTab, checkAfterAction]);

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [limit, setLimit] = useState(5);
  const [ecartDataEncaissement, setEcartDataEncaissement] = useState<any>(null);

  // Référence pour éviter les doubles chargements lors de la restauration
  const hasLoadedOnce = useRef(false);


  // Utiliser le hook de persistance des filtres
  const {
    filters: persistentFilters,
    isLoaded: filtersLoaded,
    saveFilters,
    savePagination,
    getCurrentFilters,
    hasActiveFilters
  } = useFilterPersistence(activeTab);

  const handlePageChange = (page: number) => {

    // Validation robuste de la pagination
    if (page > 0 && paginate.totalPages > 0 && page <= paginate.totalPages) {
      setPage(page);
      // Sauvegarder la nouvelle page avec les filtres actuels
      savePagination(page, limit);
      // Le useEffect se chargera de déclencher fetchData
    } else {
      console.warn(`❌ Changement de page rejeté: page=${page}, totalPages=${paginate.totalPages}`);
      // Si la page demandée est invalide, rediriger vers la dernière page valide
      if (paginate.totalPages > 0 && page > paginate.totalPages) {
        setPage(paginate.totalPages);
        savePagination(paginate.totalPages, limit);
      }
    }
  };

  const [loading, setLoading] = useState(false);


  const fetchData = async (filters?: Record<string, any>) => {
    setLoading(true);
    try {
      // Si des filtres sont fournis, les sauvegarder
      if (filters) {
        saveFilters(filters);
      }

      // Utiliser soit les nouveaux filtres passés, soit ceux persistés
      const filtersToUse = filters || getCurrentFilters();

      const cleanArray = (arr?: string[]): string[] =>
        arr ? arr.map((item) => item.trim()) : [];

      const formatArray = (arr?: string[]): string =>
        JSON.stringify(cleanArray(arr));

      const formatDate = (date?: string): string | undefined => {
        if (!date) return undefined;
        const d = new Date(date);
        if (isNaN(d.getTime())) return undefined;
        return `${d.getFullYear()}-${(d.getMonth() + 1)
          .toString()
          .padStart(2, "0")}-${d.getDate().toString().padStart(2, "0")}`;
      };

      const params: Record<string, any> = {
        directionRegional: filtersToUse?.directionRegional
          ? formatArray(filtersToUse.directionRegional)
          : undefined,
        codeExpl: filtersToUse?.codeExpl ? formatArray(filtersToUse.codeExpl) : undefined,
        startDate: filtersToUse?.startDate
          ? formatDate(filtersToUse.startDate)
          : undefined,
        endDate: filtersToUse?.endDate ? formatDate(filtersToUse.endDate) : undefined,
        banque: filtersToUse?.banque ? formatArray(filtersToUse.banque) : undefined,
        noCaisse: filtersToUse?.caisse ? formatArray(filtersToUse.caisse) : undefined,
        dailyCaisse: filtersToUse?.dailyCaisse ? formatArray(filtersToUse.dailyCaisse) : undefined,
        produit: filtersToUse?.produit ? formatArray(filtersToUse.produit) : undefined,
        modeReglement: filtersToUse?.modeReglement
          ? formatArray(filtersToUse.modeReglement)
          : undefined,
        status: filtersToUse?.status ? JSON.stringify(filtersToUse.status) : undefined,
      };

      Object.entries(params).forEach(([key, value]) => {
        if (value === undefined) delete params[key];
      });


      // Utiliser directement activeTab au lieu de filters?.id
      const apiUrl = `${API_AUTH_SUIVI}/encaissements/${activeTab}?page=${page}&search=${search}&limit=${limit}`;


      const response: any = await axiosInstance.get(
        apiUrl,
        { params }
      );

      if (response?.data && !response.data.error) {
        setEcartDataEncaissement(response.data);

        // Validation des données de pagination
        if (response.data.pagination) {
          const p = response.data.pagination;

          if (p.totalPages && p.currentPage > p.totalPages) {
            console.warn(`⚠️ Page actuelle (${p.currentPage}) > totalPages (${p.totalPages}) - possible problème côté API`);
          }
        }
      }
    } catch (error) {
      console.error("❌ Erreur lors de la récupération :", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
    // Sauvegarder la recherche avec page remise à 1
    savePagination(1, limit);
    // Le useEffect se chargera de déclencher fetchData
  };

  const handleLimitChange = (value: number) => {
    setLimit(value);
    setPage(1);
    // Sauvegarder la nouvelle limite avec page remise à 1
    savePagination(1, value);
    // Le useEffect se chargera de déclencher fetchData
  };

  // Mise à jour du useEffect pour utiliser les filtres actuels lors des changements de page/recherche/limite
  useEffect(() => {
    if (isMounted && filtersLoaded) {
      // Restaurer la pagination persistée au chargement initial uniquement
      const currentFilters = getCurrentFilters();

      // Si c'est le premier chargement, restaurer la pagination sauvegardée
      if (currentFilters.page && currentFilters.page !== page && !hasLoadedOnce.current) {
        setPage(currentFilters.page);
        hasLoadedOnce.current = true;
        return; // Sortir pour éviter le double fetchData
      }
      if (currentFilters.limit && currentFilters.limit !== limit && !hasLoadedOnce.current) {
        setLimit(currentFilters.limit);
        hasLoadedOnce.current = true;
        return; // Sortir pour éviter le double fetchData
      }

      fetchData(currentFilters);
      hasLoadedOnce.current = true;

      // Mettre à jour le titre dans la page
      const activeTabInfo = filteredTabs.find(tab => tab.id === activeTab);
      if (activeTabInfo) {
        document.title = `${activeTabInfo.label} - Suivi Encaissement`;
      }

      // Rendre fetchData disponible globalement pour le modal
      if (typeof window !== 'undefined') {
        // Définir un type pour window pour éviter les erreurs TypeScript
        (window as any).fetchData = () => {
          // Forcer le nettoyage des données actuelles
          setEcartDataEncaissement(null);

          // Réinitialiser l'état pour forcer un rafraîchissement complet
          setLoading(true);

          // Appeler fetchData avec un léger délai pour garantir le nettoyage préalable
          setTimeout(() => {
            fetchData();
          }, 100);
        };

        // Rendre refreshRejetesCount disponible globalement pour les actions de rejet/validation
        (window as any).refreshRejetesCount = () => {
          refreshRejetesCount();
        };
      }
    }
  }, [activeTab, isMounted, filtersLoaded, page, search, limit]);

  // Effet pour mettre à jour l'URL lorsque l'onglet actif change
  useEffect(() => {
    if (isMounted && typeof window !== 'undefined') {
      const activeTabInfo = filteredTabs.find(tab => tab.id === activeTab);
      if (activeTabInfo) {
        // Construire un slug à partir du label
        const slug = activeTabInfo.label
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '') // Supprimer les accents
          .replace(/\s+/g, '-')           // Remplacer les espaces par des tirets
          .replace(/[^\w-]/g, '');        // Supprimer les caractères spéciaux

        // Mise à jour de l'URL sans rechargement de page
        window.history.pushState(
          { tab: activeTab },
          activeTabInfo.label,
          `?tab=${activeTab}`
        );
      }
    }

    // Réinitialiser le flag lors du changement d'onglet
    hasLoadedOnce.current = false;
  }, [activeTab, isMounted, filteredTabs]);

  // Mise à jour de la méthode handleApplyFilters pour GlobalFiltre
  const handleApplyFilters = (newFilters: any) => {
    // Réinitialiser la page à 1 lors de l'application de nouveaux filtres
    setPage(1);
    // Sauvegarder les nouveaux filtres avec page remise à 1
    savePagination(1, limit);
    // Appliquer les nouveaux filtres immédiatement (pas de useEffect ici)
    fetchData(newFilters);
  };

  const dataEncaissementReverse = ecartDataEncaissement?.result || [];
  const Totaldata = ecartDataEncaissement?.totals || [];
  const paginate = ecartDataEncaissement?.pagination || {
    currentPage: 1,
    previousPage: null,
    nextPage: null,
    count: 0,
    totalCount: 0,
    totalPages: 0,
    pageSizes: [5, 10, 20, 50, 100]
  };

  return (
    <div>
      {/* <div className="mb-5">
        <ol className="flex flex-wrap items-center gap-y-4 font-semibold text-gray-500 dark:text-white-dark">
          <li>
            <button className="flex items-center justify-center rounded-md border border-gray-500/20 p-2.5 shadow hover:text-gray-500/70 dark:border-0 dark:bg-[#191e3a] dark:hover:text-white-dark/70">
              <Link className="flex" href="/encaissement">
                <IconHome className="shrink-0 ltr:mr-2 rtl:ml-2" />
                Encaissements
              </Link>
            </button>
          </li>
          <li className="flex items-center before:relative before:-top-0.5 before:mx-4 before:inline-block before:h-1 before:w-1 before:rounded-full before:bg-primary">
            <button className="flex items-center justify-center rounded-md border border-gray-500/20 p-2.5 text-primary shadow dark:border-0 dark:bg-[#191e3a]">
              <IconBox className="shrink-0 ltr:mr-2 rtl:ml-2" />
              {filteredTabs.find((tab) => tab.id === activeTab)?.label ||
                "Reversé"}
            </button>
          </li>
        </ol>
      </div> */}

      <div className="panel mb-5">



        {isMounted && (
          <>
            <Tab.Group selectedIndex={selectedTabIndex} onChange={(index) => {
              setActiveTab(filteredTabs[index].id);
              setSelectedTabIndex(index);
            }}
            >
              <Tab.List className="mt-3 flex flex-wrap border-b border-white-light dark:border-[#191e3a]">
                {filteredTabs.map((tab) => (
                  <Tab as={Fragment} key={tab.id}>
                    {({ selected }) => (
                      <button
                        className={`${selected
                          ? "text-primary !outline-none before:!w-full"
                          : ""
                          }relative -mb-[1px] flex items-center p-5 py-3`}
                      >
                        <tab.icon className="ltr:mr-2 rtl:ml-2" />
                        {tab.label}
                        {/* Bulle de notification pour les encaissements rejetés */}
                        {tab.id === EStatutEncaissement.REJETE && rejetesCount > 0 && (
                          <span
                            className={`ml-2 inline-flex items-center justify-center rounded-full px-2 py-1 text-xs font-bold text-white shadow-sm transition-all duration-300 ${hasIncreased
                              ? 'bg-red-600 animate-pulse scale-110'
                              : 'bg-red-500'
                              }`}
                            title={hasIncreased ? `+${increaseAmount} nouveaux rejets détectés` : `${rejetesCount} encaissements rejetés`}
                          >
                            {rejetesCount > 99 ? '99+' : rejetesCount}
                            {hasIncreased && increaseAmount > 0 && (
                              <span className="ml-1 text-xs opacity-75">
                                (+{increaseAmount})
                              </span>
                            )}
                          </span>
                        )}
                      </button>
                    )}
                  </Tab>
                ))}
              </Tab.List>

              <GlobalFiltre
                drData={drData}
                statutValidation={activeTab}
                onApplyFilters={handleApplyFilters}
              />
              <Tab.Panels>
                {filteredTabs.map((tab) => (
                  <Tab.Panel key={tab.id}>
                    {/* Log pour le débogage - tab.id vs activeTab */}
                    <EncaissementComptable
                      statutValidation={activeTab}
                      data={dataEncaissementReverse || []}
                      total={Totaldata}
                      paginate={paginate}
                      fetchLoading={loading}
                      habilitation={habilitation}
                      handlePageChange={handlePageChange}
                      handleSearchChange={handleSearchChange}
                      handleLimitChange={handleLimitChange}
                    />
                  </Tab.Panel>
                ))}
              </Tab.Panels>
            </Tab.Group>
          </>
        )}
      </div>

    </div>
  );
};

export default ComponentsDashboardValider;
