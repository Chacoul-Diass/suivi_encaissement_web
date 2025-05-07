"use client";

import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import IconBox from "../icon/icon-box";
import IconHome from "@/components/icon/icon-home";
import { Tab } from "@headlessui/react";
import React, { Fragment, useEffect, useState } from "react";
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

const ComponentsDashboardValider = () => {
  const dispatch = useDispatch<TAppDispatch>();
  const habilitation = getUserHabilitation();

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
      order: 3, // Troisième dans l'ordre
    },
    {
      id: EStatutEncaissement.VALIDE, // 3
      label: "Encaissements Validés",
      icon: IconCircleCheck,
      habilitationName: "ENCAISSEMENTS VALIDES",
      order: 4, // Quatrième dans l'ordre
    },
    {
      id: EStatutEncaissement.DFC, // 5
      label: "Encaissements Traités",
      icon: IconArchive,
      habilitationName: "ENCAISSEMENTS TRAITES",
      order: 7, // Cinquième dans l'ordre
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
    .sort((a, b) => a.order - b.order); // Trier selon l'ordre défini

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
        console.log("Détecté: Page des encaissements vérifiés");
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
    if (hasTraitesAccess) return EStatutEncaissement.DFC; // 7 - Priorité 7

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

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [limit, setLimit] = useState(5);
  const [ecartDataEncaissement, setEcartDataEncaissement] = useState<any>(null);
  // Ajouter un état pour stocker les filtres courants
  const [currentFilters, setCurrentFilters] = useState<Record<string, any>>({});

  const handlePageChange = (page: number) => {
    if (page > 0 && page <= paginate.totalPages) {
      setPage(page);
    }
  };

  const [loading, setLoading] = useState(false);


  const fetchData = async (filters?: Record<string, any>) => {
    setLoading(true);
    try {
      // Si des filtres sont fournis, les mettre à jour dans l'état
      if (filters) {
        setCurrentFilters(filters);
      }

      // Utiliser soit les nouveaux filtres passés, soit ceux stockés dans l'état
      const filtersToUse = filters || currentFilters;

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
        console.log("✅ Données reçues pour activeTab:", activeTab);
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
  };

  const handleLimitChange = (value: number) => {
    setLimit(value);
    setPage(1);
  };

  // Mise à jour du useEffect pour utiliser les filtres actuels lors des changements de page/recherche/limite
  useEffect(() => {
    if (isMounted) {
      console.log("⭐ Déclenchement requête API avec activeTab:", activeTab, "page:", page, "search:", search, "limit:", limit);
      fetchData();

      // Mettre à jour le titre dans la page
      const activeTabInfo = filteredTabs.find(tab => tab.id === activeTab);
      if (activeTabInfo) {
        document.title = `${activeTabInfo.label} - Suivi Encaissement`;
      }

      // Rendre fetchData disponible globalement pour le modal
      if (typeof window !== 'undefined') {
        // Définir un type pour window pour éviter les erreurs TypeScript
        (window as any).fetchData = () => {
          console.log("❗Appel de window.fetchData global - Rafraîchissement complet");
          // Forcer le nettoyage des données actuelles
          setEcartDataEncaissement(null);

          // Réinitialiser l'état pour forcer un rafraîchissement complet
          setLoading(true);

          // Appeler fetchData avec un léger délai pour garantir le nettoyage préalable
          setTimeout(() => {
            fetchData();
          }, 100);
        };
      }
    }
  }, [activeTab, isMounted, page, search, limit]);

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
  }, [activeTab, isMounted, filteredTabs]);

  // Mise à jour de la méthode handleApplyFilters pour GlobalFiltre
  const handleApplyFilters = (newFilters: any) => {
    // Réinitialiser la page à 1 lors de l'application de nouveaux filtres
    setPage(1);
    // Appliquer les nouveaux filtres
    fetchData(newFilters);
  };

  const dataEncaissementReverse = ecartDataEncaissement?.result || [];
  const Totaldata = ecartDataEncaissement?.totals || [];
  const paginate = ecartDataEncaissement?.pagination || [];

  return (
    <div>
      <div className="mb-5">
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
      </div>

      <div className="panel mb-5">



        {isMounted && (
          <>
            {console.log("⚡ Rendu du Tab.Group avec activeTab =", activeTab)}
            <Tab.Group selectedIndex={selectedTabIndex} onChange={(index) => {
              console.log("⚡ Changement d'onglet:", index, "Tab ID:", filteredTabs[index].id);
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
