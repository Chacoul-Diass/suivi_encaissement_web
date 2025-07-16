"use client";

import React, { useEffect, useState, useRef, useMemo } from "react";
import Dropdown from "../dropdown";
import IconCaretDown from "../icon/icon-caret-down";
import IconCalendar from "../icon/icon-calendar";
import IconBank from "../icon/icon-bank";
import IconCash from "../icon/icon-cash";
import IconCreditCard from "../icon/icon-credit-card";
import IconBuilding from "../icon/icon-building";
import IconOffice from "../icon/icon-office";
import IconFilter from "../icon/icon-filter";
import IconRefresh from "../icon/icon-refresh";
import Tippy from "@tippyjs/react";
import { useDispatch, useSelector } from "react-redux";
import { TAppDispatch, TRootState } from "@/store";
import { fetchBanques } from "@/store/reducers/select/banque.slice";
import { fetchcaisses } from "@/store/reducers/select/caisse.slice";
import { fetchmodeReglement } from "@/store/reducers/select/modeReglement.slice";
import { fetchSecteurs } from "@/store/reducers/select/secteur.slice";
import { fetchProduit } from "@/store/reducers/select/produit.slice";
import { fetchJourneeCaisse } from "@/store/reducers/select/journeeCaisse.slice";
import dayjs from "dayjs";

interface GlobalFiltreProps {
  drData: any;
  onApplyFilters: (params: any) => void;
  statutValidation: any;
  showStatusSelector?: boolean;
}

// Constante pour signifier "pas de dates sélectionnées"
const NO_DATES_SELECTED: Date[] = [];

export default function GlobalFiltre({
  drData,
  onApplyFilters,
  statutValidation,
  showStatusSelector = false,
}: GlobalFiltreProps) {
  const dispatch = useDispatch<TAppDispatch>();
  const [isFilterExpanded, setIsFilterExpanded] = useState(true);

  // État pour la période, adapté pour utiliser des chaînes de caractères au lieu de dates
  const [dateRange, setDateRange] = useState<{ startDate: string, endDate: string }>({
    startDate: "",
    endDate: ""
  });

  // État pour afficher/masquer le sélecteur de date
  const [isDateRangeVisible, setIsDateRangeVisible] = useState(false);
  const datePickerRef = useRef<HTMLDivElement>(null);

  // Ici, on stocke la recherche propre à chaque dropdown
  const [searchQueries, setSearchQueries] = useState({
    banques: "",
    caisses: "",
    produit: "",
    modes: "",
    drs: "",
    secteurs: "",
    journeeCaisse: "",
  });

  const [selectedDRIds, setSelectedDRIds] = useState<number[]>([]);

  const [selectedSecteurIds, setSelectedSecteurIds] = useState<number[]>([]);
  const [selectedItems, setSelectedItems] = useState<{
    banques: { libelle: string }[];
    caisses: { libelle: string }[];
    produit: { libelle: string }[];
    modes: { libelle: string }[];
    journeeCaisse: { libelle: string }[];
  }>({
    banques: [],
    caisses: [],
    produit: [],
    modes: [],
    journeeCaisse: [],
  });

  // Add status state
  const [selectedStatus, setSelectedStatus] = useState<string>("");

  // Récupération des données via Redux
  const {
    produit,
    caisses,
    banques,
    modes,
    secteurs,
    journeeCaisseData,
    drLoading,
    secteurLoading,
    journeeCaisseLoading,
  } = useSelector((state: TRootState) => ({
    produit:
      state?.produit?.data?.map((item: any) => ({ libelle: item.libelle })) ||
      [],
    caisses:
      state?.caisses?.data?.map((item: any) => ({ libelle: item.libelle })) ||
      [],
    banques:
      state?.Banques?.data?.map((item: any) => ({ libelle: item.libelle })) ||
      [],
    modes:
      state?.modeReglement?.data?.map((item: any) => ({
        libelle: item.libelle,
      })) || [],
    secteurs: state?.secteur?.data || [],
    journeeCaisseData: state?.journeeCaisse?.data || [],
    drLoading: state?.dr?.loading,
    secteurLoading: state?.secteur?.loading,
    journeeCaisseLoading: state?.journeeCaisse?.loading,
  }));

  // Debug: afficher les secteurs reçus
  useEffect(() => {
    console.log("Secteurs reçus:", secteurs);
    console.log("DR sélectionnées:", selectedDRIds);
  }, [secteurs, selectedDRIds]);

  // Charger les données initiales (produit, modes)
  useEffect(() => {
    dispatch(fetchProduit());
    dispatch(fetchmodeReglement());
  }, [dispatch]);

  // Mémoriser les valeurs pour éviter les re-calculs
  const dirRegionalMemo = useMemo(() => {
    if (!selectedDRIds.length || !drData.length) return [];

    return selectedDRIds.map(id => {
      const name = drData.find((dr: any) => dr.id === id)?.name || "";
      return name.trim();
    }).filter(Boolean);
  }, [selectedDRIds, drData]);

  const codeExplMemo = useMemo(() => {
    if (!selectedSecteurIds.length || !secteurs.length) return [];

    return selectedSecteurIds.map(id => {
      const secteur = secteurs.find((secteur: any) => secteur.id === id);
      return secteur?.code?.trim() || "";
    }).filter(Boolean);
  }, [selectedSecteurIds, secteurs]);

  // Utiliser useRef pour éviter les appels API répétés
  const lastApiCall = useRef<{ directionRegional: string[], codeExpl: string[] } | null>(null);

  // Charger les secteurs en fonction des DR sélectionnées
  useEffect(() => {
    // Reset sectors when no DRs are selected
    if (!selectedDRIds || selectedDRIds.length === 0) {
      setSelectedSecteurIds([]);
      return;
    }

    // Only fetch sectors if we have valid DR IDs
    const validDrIds = selectedDRIds.filter((id) => id != null);
    if (validDrIds.length > 0) {
      console.log("Chargement des secteurs pour les DR:", validDrIds);
      dispatch(fetchSecteurs(validDrIds));
    }
  }, [selectedDRIds, dispatch]);

  // Charger les données en fonction des DR et secteurs sélectionnés
  useEffect(() => {
    // Éviter les appels API si les données sont déjà en cours de chargement
    if (drLoading || secteurLoading || journeeCaisseLoading) {
      return;
    }

    const currentParams = {
      directionRegional: dirRegionalMemo,
      codeExpl: codeExplMemo
    };

    // Vérifier si les paramètres ont changé depuis le dernier appel
    const lastCall = lastApiCall.current;
    if (lastCall &&
      JSON.stringify(lastCall.directionRegional) === JSON.stringify(currentParams.directionRegional) &&
      JSON.stringify(lastCall.codeExpl) === JSON.stringify(currentParams.codeExpl)) {
      return; // Les paramètres n'ont pas changé, ne pas refaire l'appel
    }

    if (currentParams.directionRegional.length > 0 || currentParams.codeExpl.length > 0) {
      // Mémoriser les paramètres de cet appel
      lastApiCall.current = currentParams;

      // Charger les caisses
      dispatch(fetchcaisses(currentParams));

      // Charger les banques
      dispatch(fetchBanques(currentParams));

      // Charger les journées caisse
      dispatch(fetchJourneeCaisse(currentParams));
    }
  }, [dirRegionalMemo, codeExplMemo, dispatch, drLoading, secteurLoading, journeeCaisseLoading]);

  // Reset selected sectors when DR selection changes
  useEffect(() => {
    setSelectedSecteurIds([]);
  }, [selectedDRIds]);

  // Reset selected items when DR or sector selection changes
  useEffect(() => {
    setSelectedItems((prev) => ({
      ...prev,
      caisses: [],
      banques: [],
      journeeCaisse: [],
    }));
  }, [selectedDRIds, selectedSecteurIds]);

  // Ajout/suppression d'un item (banque, caisse, mode, journeeCaisse)
  const toggleSelection = (
    libelle: string,
    type: "produit" | "banques" | "caisses" | "modes" | "journeeCaisse"
  ) => {
    // Si on essaie de sélectionner une caisse, banque ou journée caisse et qu'aucune DR ou exploitation n'est sélectionnée, ne rien faire
    if ((type === "caisses" || type === "banques" || type === "journeeCaisse") && selectedDRIds.length === 0 && selectedSecteurIds.length === 0) {
      return;
    }

    setSelectedItems((prev) => ({
      ...prev,
      [type]: prev[type].some((item) => item.libelle === libelle)
        ? prev[type].filter((item) => item.libelle !== libelle)
        : [...prev[type], { libelle }],
    }));
  };

  // Ajout/suppression d'une DR
  const toggleDR = (id: number) => {
    setSelectedDRIds((prev) => {
      const updated = prev.includes(id)
        ? prev.filter((drId) => drId !== id) // Supprimer la DR si déjà sélectionnée
        : [...prev, id]; // Ajouter la DR si non sélectionnée

      // ⚠️ Si toutes les DR sont supprimées, on vide aussi les exploitations
      if (updated.length === 0) {
        setSelectedSecteurIds([]);
      }

      return updated;
    });
  };

  // Ajout/suppression d'un secteur
  const toggleSecteur = (id: number) => {
    setSelectedSecteurIds((prev) =>
      prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id]
    );
  };

  // Sélectionner/dé-sélectionner tout (DRs, Secteurs, banques, caisses, modes, journeeCaisse)
  const toggleAll = (
    type: "produit" | "banques" | "caisses" | "modes" | "drs" | "secteurs" | "journeeCaisse",
    items: any[],
    isAllSelected: boolean
  ) => {
    if (type === "drs") {
      const newSelectedDRs = isAllSelected
        ? []
        : items.map((item: any) => item.id);

      setSelectedDRIds(newSelectedDRs);

      // ⚠️ Si aucune DR sélectionnée, vider les exploitations
      if (newSelectedDRs.length === 0) {
        setSelectedSecteurIds([]);
      }
    } else if (type === "secteurs") {
      setSelectedSecteurIds(
        isAllSelected ? [] : items.map((secteur: any) => secteur.id)
      );
    } else {
      setSelectedItems((prev) => ({
        ...prev,
        [type]: isAllSelected
          ? []
          : items.map((item) => ({ libelle: item.libelle })),
      }));
    }
  };

  // Effet pour fermer le sélecteur de date quand on clique en dehors
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        datePickerRef.current &&
        !datePickerRef.current.contains(event.target as Node)
      ) {
        setIsDateRangeVisible(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Gestion du changement de date
  const handleDateChange = (field: 'startDate' | 'endDate', value: string) => {
    setDateRange(prev => {
      const newDateRange = {
        ...prev,
        [field]: value
      };

      // Si on change la date de début et qu'elle est supérieure à la date de fin existante
      if (field === 'startDate' && newDateRange.endDate && value > newDateRange.endDate) {
        newDateRange.endDate = value;
      }

      // Si on change la date de fin et qu'elle est inférieure à la date de début existante
      if (field === 'endDate' && newDateRange.startDate && value < newDateRange.startDate) {
        return prev; // On n'autorise pas ce changement
      }

      return newDateRange;
    });
  };

  // Construit l'objet de filtres pour onApplyFilters
  const getFilterParams = () => {
    return {
      id: statutValidation,
      directionRegional: selectedDRIds
        .map((id) => drData.find((dr: any) => dr.id === id)?.name || "")
        .map((name) => name.trim()),
      codeExpl: selectedSecteurIds
        .map(
          (id) => secteurs.find((secteur: any) => secteur.id === id)?.code || ""
        )
        .map((code) => code.trim()),
      banque: selectedItems.banques.map((banque) => banque.libelle.trim()),
      caisse: selectedItems.caisses.map((caisse) => caisse.libelle.trim()),
      produit: selectedItems.produit.map((produit) => produit.libelle.trim()),
      modeReglement: selectedItems.modes.map((mode) => mode.libelle.trim()),
      dailyCaisse: selectedItems.journeeCaisse.map((jc) => jc.libelle.trim()),
      startDate: dateRange.startDate || "",
      endDate: dateRange.endDate || "",
      status: selectedStatus,
    };
  };

  // Appliquer les filtres
  const applyFilters = () => {
    const params = getFilterParams();
    onApplyFilters(params);
  };

  // Réinitialiser : on vide toutes les sélections, mais on garde id dans l'URL
  const resetFilters = () => {
    setDateRange({ startDate: "", endDate: "" });
    setSelectedDRIds([]);
    setSelectedSecteurIds([]);
    setSelectedStatus("");
    setSelectedItems({ produit: [], banques: [], caisses: [], modes: [], journeeCaisse: [] });

    setSearchQueries({
      produit: "",
      banques: "",
      caisses: "",
      modes: "",
      drs: "",
      secteurs: "",
      journeeCaisse: "",
    });

    onApplyFilters({ id: statutValidation });
  };

  // Petite fonction utilitaire pour générer un Dropdown
  const renderDropdown = (
    label: React.ReactNode,
    type: "produit" | "banques" | "caisses" | "modes" | "drs" | "secteurs" | "journeeCaisse",
    items: any[],
    selected: any[],
    onToggle: (id: any | string) => void
  ) => (
    <div className="dropdown relative w-full">
      {selected.length > 0 && (
        <Tippy
          content={
            <div className="max-h-[200px] overflow-y-auto p-2">
              {selected.map((item: any) => {
                let name = "Inconnu";
                if (type === "drs") {
                  const dr = drData.find((dr: any) => dr.id === item);
                  name = dr ? dr.name : "Inconnu";
                } else if (type === "secteurs") {
                  const secteur = secteurs.find(
                    (secteur: any) => secteur.id === item
                  );
                  name = secteur ? `${secteur.name} - ${secteur.code}` : "Inconnu";
                } else {
                  name = item.libelle ? item.libelle : "Inconnu";
                }
                return (
                  <div
                    key={item.id || item.libelle || item}
                    className="whitespace-nowrap text-sm"
                  >
                    {name}
                  </div>
                );
              })}
            </div>
          }
          placement="top"
          arrow={true}
          interactive={true}
        >
          <div className="absolute right-2 top-[-10px] z-10 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-medium text-white">
            {selected.length}
          </div>
        </Tippy>
      )}

      <Dropdown
        btnClassName={`relative flex w-full items-center justify-between gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm transition-all hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700 ${selected.length > 0 ? "ring-2 ring-primary/30" : ""
          }`}
        button={
          <div className="flex items-center gap-2 text-gray-700 dark:text-gray-200">
            {label}
          </div>
        }
      >
        <div
          className="z-50 w-full min-w-[200px] max-w-[calc(100vw-2rem)] rounded-lg border border-gray-200 bg-white p-2 shadow-lg dark:border-gray-700 dark:bg-gray-800"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Barre de recherche */}
          <div className="relative mb-2">
            <input
              type="text"
              placeholder={`Rechercher...`}
              value={searchQueries[type as keyof typeof searchQueries]}
              onChange={(e) =>
                setSearchQueries((prev) => ({
                  ...prev,
                  [type]: e.target.value,
                }))
              }
              className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm placeholder-gray-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-gray-600 dark:bg-gray-700 dark:placeholder-gray-500"
            />
          </div>

          {/* Bouton tout sélectionner */}
          <div className="mb-2 flex items-center justify-between border-b border-gray-200 pb-2 dark:border-gray-700">
            <button
              type="button"
              className={`text-xs font-medium ${(type === "secteurs" && selectedDRIds.length === 0) ||
                (type === "caisses" && selectedDRIds.length === 0 && selectedSecteurIds.length === 0) ||
                (type === "banques" && selectedDRIds.length === 0 && selectedSecteurIds.length === 0) ||
                (type === "journeeCaisse" && selectedDRIds.length === 0 && selectedSecteurIds.length === 0)
                ? "cursor-not-allowed text-gray-400 dark:text-gray-500"
                : "text-primary hover:text-primary/80"
                }`}
              onClick={() =>
                (type === "secteurs" && selectedDRIds.length === 0) ||
                  (type === "caisses" && selectedDRIds.length === 0 && selectedSecteurIds.length === 0) ||
                  (type === "banques" && selectedDRIds.length === 0 && selectedSecteurIds.length === 0) ||
                  (type === "journeeCaisse" && selectedDRIds.length === 0 && selectedSecteurIds.length === 0)
                  ? null
                  : toggleAll(type, items, selected.length === items.length)
              }
            >
              {selected.length === items.length
                ? "Tout désélectionner"
                : "Tout sélectionner"}
            </button>
            <span className="text-xs text-gray-500">
              {selected.length} sélectionné(s)
            </span>
          </div>

          {/* Liste des éléments */}
          <div className="max-h-[200px] md:max-h-[250px] overflow-y-auto">
            {type === "secteurs" && selectedDRIds.length === 0 ? (
              <div className="py-4 text-center text-sm text-amber-600 dark:text-amber-400">
                Veuillez sélectionner au moins une Direction Régionale
              </div>
            ) : (type === "caisses" || type === "banques" || type === "journeeCaisse") && selectedDRIds.length === 0 && selectedSecteurIds.length === 0 ? (
              <div className="py-4 text-center text-sm text-amber-600 dark:text-amber-400">
                Veuillez sélectionner au moins une Direction Régionale ou une Exploitation
              </div>
            ) : (
              items
                .filter((item: any) => {
                  let val = item.libelle || item.name || "";
                  if (type === "secteurs") {
                    val = `${item.name} - ${item.code}`;
                  }
                  const searchValue =
                    searchQueries[type as keyof typeof searchQueries];
                  return val.toLowerCase().includes(searchValue.toLowerCase());
                })
                .map((item: any, i: number) => (
                  <label
                    key={i}
                    className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <input
                      type="checkbox"
                      checked={
                        type === "drs" || type === "secteurs"
                          ? selected.includes(item.id)
                          : selected.some(
                            (sel: any) => sel.libelle === item.libelle
                          )
                      }
                      onChange={() =>
                        type === "drs" || type === "secteurs"
                          ? onToggle(item.id)
                          : onToggle(item.libelle)
                      }
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                      disabled={(type === "caisses" || type === "banques" || type === "journeeCaisse") && selectedDRIds.length === 0 && selectedSecteurIds.length === 0}
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-200 truncate">
                      {type === "secteurs"
                        ? `${item.name} - ${item.code}`
                        : item.libelle || item.name
                      }
                    </span>
                  </label>
                ))
            )}
          </div>
        </div>
      </Dropdown>
    </div>
  );

  // Fonction pour obtenir le nombre total d'éléments sélectionnés
  const getTotalSelectedCount = () => {
    return (
      selectedDRIds.length +
      selectedSecteurIds.length +
      selectedItems.banques.length +
      selectedItems.caisses.length +
      selectedItems.produit.length +
      selectedItems.modes.length +
      selectedItems.journeeCaisse.length +
      (dateRange.startDate && dateRange.endDate ? 1 : 0)
    );
  };

  const totalSelectedFilters = getTotalSelectedCount();

  return (
    <div className="mb-8 rounded-lg bg-white shadow-sm transition-all duration-300 hover:shadow-md dark:bg-gray-800">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-gray-200 p-4 dark:border-gray-700">
        <div className="flex items-center gap-2 mb-4 sm:mb-0">
          <IconFilter className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center">
            Filtres
            <button
              type="button"
              onClick={() => setIsFilterExpanded(!isFilterExpanded)}
              className="ml-2 flex items-center justify-center h-6 w-6 rounded-md bg-gradient-to-br from-[#0E1726] via-[#162236] to-[#1a2941]"
              aria-label={isFilterExpanded ? "Réduire" : "Développer"}
            >
              <IconCaretDown
                className={`h-4 w-4 text-white transition-transform duration-300 ${isFilterExpanded ? 'rotate-180' : ''}`}
              />
            </button>
            {totalSelectedFilters > 0 && (
              <span className="relative ml-2 inline-flex items-center justify-center">
                <span className="animate-ping absolute h-full w-full rounded-full bg-primary/30 opacity-75"></span>
                <span className="relative flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-xs font-medium text-white shadow-sm">
                  {totalSelectedFilters}
                </span>
              </span>
            )}
          </h2>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={resetFilters}
            className="flex-1 sm:flex-none group flex items-center justify-center sm:justify-start gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-all duration-200 hover:bg-gray-50 hover:shadow-sm dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
          >
            <IconRefresh className="h-4 w-4 text-primary transition-transform duration-200 group-hover:rotate-180" />
            <span className="inline-block">Réinitialiser</span>
          </button>
          <button
            type="button"
            onClick={applyFilters}
            className="flex-1 sm:flex-none group flex items-center justify-center sm:justify-start gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-white transition-all duration-200 hover:bg-primary/90 hover:shadow-sm"
          >
            <IconFilter className="h-4 w-4 transition-transform duration-200 group-hover:scale-110" />
            <span className="inline-block">Appliquer</span>
          </button>
        </div>
      </div>

      {isFilterExpanded && (
        <div className="space-y-4 p-4">
          <div className="flex flex-col space-y-4">
            {/* Sélecteur de dates et statut dans une même ligne */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Sélecteur de dates personnalisé */}
              <div className="relative w-full" ref={datePickerRef}>
                <Dropdown
                  placement="bottom-start"
                  offset={[0, 10]}
                  btnClassName={`relative flex w-full items-center justify-between gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm transition-all hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700 ${dateRange.startDate && dateRange.endDate ? "ring-2 ring-primary/30" : ""}`}
                  button={
                    <div className="flex items-center gap-2 text-gray-700 dark:text-gray-200">
                      <IconCalendar className={`h-4 w-4 ${dateRange.startDate && dateRange.endDate ? 'text-primary' : 'text-gray-400'}`} />
                      <span className="truncate">
                        {dateRange.startDate && dateRange.endDate
                          ? `${dayjs(dateRange.startDate).format("DD/MM/YYYY")} - ${dayjs(dateRange.endDate).format("DD/MM/YYYY")}`
                          : "Période"}
                      </span>
                    </div>
                  }
                >
                  <div
                    className="w-full min-w-[250px] max-w-full rounded-lg border border-gray-200 bg-white p-3 shadow-lg dark:border-gray-700 dark:bg-gray-800"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="mb-3 space-y-3">
                      <div>
                        <label className="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-300">Date début</label>
                        <div className="relative">
                          <input
                            type="date"
                            className="w-full rounded-lg border border-gray-200 p-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-gray-700 dark:bg-gray-700 dark:text-gray-200"
                            value={dateRange.startDate || ""}
                            onChange={(e) => handleDateChange('startDate', e.target.value)}
                            max={new Date().toISOString().split('T')[0]}
                          />
                        </div>
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-300">Date fin</label>
                        <div className="relative">
                          <input
                            type="date"
                            className="w-full rounded-lg border border-gray-200 p-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-gray-700 dark:bg-gray-700 dark:text-gray-200"
                            value={dateRange.endDate || ""}
                            onChange={(e) => handleDateChange('endDate', e.target.value)}
                            min={dateRange.startDate || undefined}
                            max={new Date().toISOString().split('T')[0]}
                          />
                        </div>
                      </div>
                    </div>

                  </div>
                </Dropdown>
              </div>

              {/* Sélecteur de statut */}
              {showStatusSelector && (
                <div className="relative w-full">
                  <Dropdown
                    placement="bottom-start"
                    offset={[0, 10]}
                    btnClassName={`relative flex w-full items-center justify-between gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm transition-all hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700 ${selectedStatus
                      ? selectedStatus === "VALIDES" || selectedStatus === "VALIDÉS"
                        ? "ring-2 ring-success/30 bg-success-light dark:bg-success/20"
                        : selectedStatus === "CHARGES" || selectedStatus === "CHARGÉS"
                          ? "ring-2 ring-primary/30 bg-primary-light dark:bg-primary/20"
                          : selectedStatus === "VERIFIES" || selectedStatus === "VÉRIFIÉS"
                            ? "ring-2 ring-secondary/30 bg-secondary-light dark:bg-secondary/20"
                            : selectedStatus === "REJETES" || selectedStatus === "REJETÉS"
                              ? "ring-2 ring-danger/30 bg-danger-light dark:bg-danger/20"
                              : "ring-2 ring-warning/30 bg-warning-light dark:bg-warning/20"
                      : ""
                      }`}
                    button={
                      <div className="flex items-center gap-2 text-gray-700 dark:text-gray-200">
                        {selectedStatus ? (
                          <div className={`flex items-center justify-center w-5 h-5 rounded-full ${selectedStatus === "VALIDES" || selectedStatus === "VALIDÉS"
                            ? "bg-success-light dark:bg-success/30"
                            : selectedStatus === "CHARGES" || selectedStatus === "CHARGÉS"
                              ? "bg-primary-light dark:bg-primary/30"
                              : selectedStatus === "VERIFIES" || selectedStatus === "VÉRIFIÉS"
                                ? "bg-secondary-light dark:bg-secondary/30"
                                : selectedStatus === "REJETES" || selectedStatus === "REJETÉS"
                                  ? "bg-danger-light dark:bg-danger/30"
                                  : "bg-warning-light dark:bg-warning/30"
                            }`}>
                            <svg
                              className={`h-3 w-3 ${selectedStatus === "VALIDES" || selectedStatus === "VALIDÉS"
                                ? "text-success dark:text-success"
                                : selectedStatus === "CHARGES" || selectedStatus === "CHARGÉS"
                                  ? "text-primary dark:text-primary"
                                  : selectedStatus === "VERIFIES" || selectedStatus === "VÉRIFIÉS"
                                    ? "text-secondary dark:text-secondary"
                                    : selectedStatus === "REJETES" || selectedStatus === "REJETÉS"
                                      ? "text-danger dark:text-danger"
                                      : "text-warning dark:text-warning"
                                }`}
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              {selectedStatus === "VALIDES" || selectedStatus === "VALIDÉS" ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                              ) : selectedStatus === "CHARGES" || selectedStatus === "CHARGÉS" ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              ) : selectedStatus === "VERIFIES" || selectedStatus === "VÉRIFIÉS" ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              ) : selectedStatus === "REJETES" || selectedStatus === "REJETÉS" ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                              ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              )}
                            </svg>
                          </div>
                        ) : (
                          <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        )}
                        <span className="truncate">
                          {selectedStatus || "Statut"}
                        </span>
                      </div>
                    }
                  >
                    <div className="w-full min-w-[200px] rounded-lg border border-gray-200 bg-white p-2 shadow-lg dark:border-gray-700 dark:bg-gray-800">
                      <div className="space-y-1">
                        <button
                          onClick={() => setSelectedStatus("")}
                          className={`flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 ${!selectedStatus ? "bg-gray-100 dark:bg-gray-700" : ""
                            }`}
                        >
                          <span className="text-gray-500 dark:text-gray-400">Tous les statuts</span>
                        </button>
                        <button
                          onClick={() => setSelectedStatus("CHARGÉS")}
                          className={`flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors hover:bg-primary-light dark:hover:bg-primary/20 ${selectedStatus === "CHARGÉS" ? "bg-primary-light dark:bg-primary/20" : ""
                            }`}
                        >
                          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary-light dark:bg-primary/30">
                            <svg className="h-3 w-3 text-primary dark:text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <span className="text-primary dark:text-primary">Chargés</span>
                        </button>
                        <button
                          onClick={() => setSelectedStatus("VÉRIFIÉS")}
                          className={`flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors hover:bg-secondary-light dark:hover:bg-secondary/20 ${selectedStatus === "VÉRIFIÉS" ? "bg-secondary-light dark:bg-secondary/20" : ""
                            }`}
                        >
                          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-secondary-light dark:bg-secondary/30">
                            <svg className="h-3 w-3 text-secondary dark:text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <span className="text-secondary dark:text-secondary">Vérifiés</span>
                        </button>
                        <button
                          onClick={() => setSelectedStatus("VALIDÉS")}
                          className={`flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors hover:bg-success-light dark:hover:bg-success/20 ${selectedStatus === "VALIDÉS" ? "bg-success-light dark:bg-success/20" : ""
                            }`}
                        >
                          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-success-light dark:bg-success/30">
                            <svg className="h-3 w-3 text-success dark:text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                          <span className="text-success dark:text-success">Validés</span>
                        </button>
                        <button
                          onClick={() => setSelectedStatus("REJETÉS")}
                          className={`flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors hover:bg-danger-light dark:hover:bg-danger/20 ${selectedStatus === "REJETÉS" ? "bg-danger-light dark:bg-danger/20" : ""
                            }`}
                        >
                          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-danger-light dark:bg-danger/30">
                            <svg className="h-3 w-3 text-danger dark:text-danger" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </div>
                          <span className="text-danger dark:text-danger">Rejetés</span>
                        </button>
                        <button
                          onClick={() => setSelectedStatus("TRAITÉS")}
                          className={`flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors hover:bg-warning-light dark:hover:bg-warning/20 ${selectedStatus === "TRAITÉS" ? "bg-warning-light dark:bg-warning/20" : ""
                            }`}
                        >
                          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-warning-light dark:bg-warning/30">
                            <svg className="h-3 w-3 text-warning dark:text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <span className="text-warning dark:text-warning">Traités</span>
                        </button>
                      </div>
                    </div>
                  </Dropdown>
                </div>
              )}
            </div>

            {/* Dropdowns avec icônes */}
            <div className="grid w-full grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4">
              <div className="w-full">
                {renderDropdown(
                  <>
                    <IconCash className="h-4 w-4 text-gray-400" />
                    <span className="truncate">Produits</span>
                  </>,
                  "produit",
                  produit,
                  selectedItems.produit,
                  (libelle) => toggleSelection(libelle, "produit")
                )}
              </div>
              <div className="w-full">
                {renderDropdown(
                  <>
                    <IconBuilding className="h-4 w-4 text-gray-400" />
                    <span className="truncate">Direction Régionale</span>
                  </>,
                  "drs",
                  drData,
                  selectedDRIds,
                  (id) => toggleDR(id as number)
                )}
              </div>
              <div className="w-full">
                {renderDropdown(
                  <>
                    <IconOffice className="h-4 w-4 text-gray-400" />
                    <span className="truncate">Exploitations</span>
                  </>,
                  "secteurs",
                  secteurs,
                  selectedSecteurIds,
                  (id) => toggleSecteur(id as number)
                )}
              </div>
              <div className="w-full">
                {renderDropdown(
                  <>
                    <IconCash className="h-4 w-4 text-gray-400" />
                    <span className="truncate">No Caisses</span>
                  </>,
                  "caisses",
                  caisses,
                  selectedItems.caisses,
                  (libelle) => toggleSelection(libelle, "caisses")
                )}
              </div>
              <div className="w-full">
                {renderDropdown(
                  <>
                    <IconCalendar className="h-4 w-4 text-gray-400" />
                    <span className="truncate">Journée Caisse</span>
                  </>,
                  "journeeCaisse",
                  journeeCaisseData,
                  selectedItems.journeeCaisse,
                  (libelle) => toggleSelection(libelle, "journeeCaisse")
                )}
              </div>
              <div className="w-full">
                {renderDropdown(
                  <>
                    <IconBank className="h-4 w-4 text-gray-400" />
                    <span className="truncate">Banque</span>
                  </>,
                  "banques",
                  banques,
                  selectedItems.banques,
                  (libelle) => toggleSelection(libelle, "banques")
                )}
              </div>
              <div className="w-full">
                {renderDropdown(
                  <>
                    <IconCreditCard className="h-4 w-4 text-gray-400" />
                    <span className="truncate">Mode de règlement</span>
                  </>,
                  "modes",
                  modes,
                  selectedItems.modes,
                  (libelle) => toggleSelection(libelle, "modes")
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {!isFilterExpanded && totalSelectedFilters > 0 && (
        <div className="px-3 sm:px-4 py-3 bg-gray-50 dark:bg-gray-700/30 rounded-b-lg overflow-x-auto">
          <div className="flex flex-wrap gap-2 text-sm text-gray-600 dark:text-gray-300 whitespace-nowrap">
            <span className="font-medium">Filtres actifs:</span>
            {showStatusSelector && selectedStatus && (
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                Statut: {selectedStatus === "VALIDES" || selectedStatus === "VALIDÉS" ? "Validé" : selectedStatus === "CHARGES" || selectedStatus === "CHARGÉS" ? "Chargé" : selectedStatus === "VERIFIES" || selectedStatus === "VÉRIFIÉS" ? "Vérifié" : selectedStatus === "REJETES" || selectedStatus === "REJETÉS" ? "Rejeté" : "Traité"}
              </span>
            )}
            {dateRange.startDate && dateRange.endDate && (
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                <IconCalendar className="h-3 w-3 inline-block mr-1" />
                {dayjs(dateRange.startDate).format("DD/MM/YYYY")} - {dayjs(dateRange.endDate).format("DD/MM/YYYY")}
              </span>
            )}
            {selectedItems.produit.length > 0 && (
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                <IconCash className="h-3 w-3 inline-block mr-1" />
                {selectedItems.produit.length} Produit(s)
              </span>
            )}
            {selectedItems.caisses.length > 0 && (
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                {selectedItems.caisses.length} Caisse(s)
              </span>
            )}
            {selectedItems.modes.length > 0 && (
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                {selectedItems.modes.length} Mode(s)
              </span>
            )}
            {selectedItems.banques.length > 0 && (
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                {selectedItems.banques.length} Banque(s)
              </span>
            )}
            {selectedItems.journeeCaisse.length > 0 && (
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                <IconCalendar className="h-3 w-3 inline-block mr-1" />
                {selectedItems.journeeCaisse.length} Journée(s) Caisse
              </span>
            )}
            {selectedDRIds.length > 0 && (
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                {selectedDRIds.length} Direction(s)
              </span>
            )}
            {selectedSecteurIds.length > 0 && (
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                {selectedSecteurIds.length} Exploitation(s)
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
