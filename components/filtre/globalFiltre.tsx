"use client";

import React, { useEffect, useState, useRef } from "react";
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
import dayjs from "dayjs";

interface GlobalFiltreProps {
  drData: any;
  onApplyFilters: (params: any) => void;
  statutValidation: any;
}

// Constante pour signifier "pas de dates sélectionnées"
const NO_DATES_SELECTED: Date[] = [];

export default function GlobalFiltre({
  drData,
  onApplyFilters,
  statutValidation,
}: GlobalFiltreProps) {
  const dispatch = useDispatch<TAppDispatch>();

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
  });

  const [selectedDRIds, setSelectedDRIds] = useState<number[]>([]);

  const [selectedSecteurIds, setSelectedSecteurIds] = useState<number[]>([]);
  const [selectedItems, setSelectedItems] = useState<{
    banques: { libelle: string }[];
    caisses: { libelle: string }[];
    produit: { libelle: string }[];
    modes: { libelle: string }[];
  }>({
    banques: [],
    caisses: [],
    produit: [],
    modes: [],
  });

  // Récupération des données via Redux
  const {
    produit,
    caisses,
    banques,
    modes,
    secteurs,
    drLoading,
    secteurLoading,
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
    drLoading: state?.dr?.loading,
    secteurLoading: state?.secteur?.loading,
  }));

  // Charger les données initiales (caisse, banque, modes)
  useEffect(() => {
    dispatch(fetchcaisses());
    dispatch(fetchProduit());
    dispatch(fetchBanques());
    dispatch(fetchmodeReglement());
  }, [dispatch]);

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
      dispatch(fetchSecteurs(validDrIds));
    }
  }, [selectedDRIds, dispatch]);

  // Reset selected sectors when DR selection changes
  useEffect(() => {
    setSelectedSecteurIds([]);
  }, [selectedDRIds]);

  // Ajout/suppression d'un item (banque, caisse, mode)
  const toggleSelection = (
    libelle: string,
    type: "produit" | "banques" | "caisses" | "modes"
  ) => {
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

  // Sélectionner/dé-sélectionner tout (DRs, Secteurs, banques, caisses, modes)
  const toggleAll = (
    type: "produit" | "banques" | "caisses" | "modes" | "drs" | "secteurs",
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
    console.log(`Date ${field} changée:`, value);

    setDateRange(prev => ({
      ...prev,
      [field]: value
    }));
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
      startDate: dateRange.startDate, // Utiliser directement la valeur de l'état
      endDate: dateRange.endDate,     // Utiliser directement la valeur de l'état
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
    setSelectedItems({ produit: [], banques: [], caisses: [], modes: [] });

    setSearchQueries({
      produit: "",
      banques: "",
      caisses: "",
      modes: "",
      drs: "",
      secteurs: "",
    });

    // On repasse l'id pour le conserver
    onApplyFilters({ id: statutValidation });
  };

  // Petite fonction utilitaire pour générer un Dropdown
  const renderDropdown = (
    label: React.ReactNode,
    type: "produit" | "banques" | "caisses" | "modes" | "drs" | "secteurs",
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
                  name = secteur ? secteur.name : "Inconnu";
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
          className="z-50 w-full min-w-[250px] rounded-lg border border-gray-200 bg-white p-2 shadow-lg dark:border-gray-700 dark:bg-gray-800"
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
              className="text-xs font-medium text-primary hover:text-primary/80"
              onClick={() =>
                toggleAll(type, items, selected.length === items.length)
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
          <div className="max-h-[250px] overflow-y-auto">
            {items
              .filter((item: any) => {
                const val = item.libelle || item.name || "";
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
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-200">
                    {item.libelle || item.name}
                  </span>
                </label>
              ))}
          </div>
        </div>
      </Dropdown>
    </div>
  );

  return (
    <div className="mb-8 space-y-5 rounded-lg bg-white p-5 shadow-sm transition-all duration-300 hover:shadow-md dark:bg-gray-800">
      <div className="flex items-center justify-between border-b border-gray-200 pb-4 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <IconFilter className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
            Filtres{" "}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={resetFilters}
            className="group flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-all duration-200 hover:bg-gray-50 hover:shadow-sm dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
          >
            <IconRefresh className="h-4 w-4 transition-transform duration-200 group-hover:rotate-180" />
            Réinitialiser
          </button>
          <button
            type="button"
            onClick={applyFilters}
            className="group flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-all duration-200 hover:bg-primary/90 hover:shadow-sm"
          >
            <IconFilter className="h-4 w-4 transition-transform duration-200 group-hover:scale-110" />
            Appliquer
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-start gap-4 lg:flex-nowrap lg:items-center">
        {/* Sélecteur de dates personnalisé */}
        <div className="relative w-full sm:w-auto" ref={datePickerRef}>
          <div
            className="flex cursor-pointer items-center justify-between rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm transition-all hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700"
            onClick={() => setIsDateRangeVisible(!isDateRangeVisible)}
          >
            <div className="flex items-center gap-2 text-gray-700 dark:text-gray-200">
              <IconCalendar className="h-4 w-4 text-gray-400" />
              <span>
                {dateRange.startDate && dateRange.endDate
                  ? `${dayjs(dateRange.startDate).format("DD/MM/YYYY")} - ${dayjs(dateRange.endDate).format("DD/MM/YYYY")}`
                  : "Sélectionner la période"}
              </span>
            </div>
          </div>

          {isDateRangeVisible && (
            <div className="absolute z-10 mt-2 w-full min-w-[300px] rounded-lg border border-gray-200 bg-white p-3 shadow-lg dark:border-gray-700 dark:bg-gray-800">
              <div className="mb-3 space-y-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-300">Date début</label>
                  <input
                    type="date"
                    className="w-full rounded-lg border border-gray-200 p-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary dark:border-gray-700 dark:bg-gray-700 dark:text-gray-200"
                    value={dateRange.startDate || ""}
                    onChange={(e) => handleDateChange('startDate', e.target.value)}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-300">Date fin</label>
                  <input
                    type="date"
                    className="w-full rounded-lg border border-gray-200 p-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary dark:border-gray-700 dark:bg-gray-700 dark:text-gray-200"
                    value={dateRange.endDate || ""}
                    onChange={(e) => handleDateChange('endDate', e.target.value)}
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  className="flex-1 rounded-lg border border-gray-200 bg-white py-2 text-sm font-medium text-gray-700 transition-all hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                  onClick={() => {
                    setDateRange({ startDate: "", endDate: "" });
                    setIsDateRangeVisible(false);
                  }}
                >
                  Effacer
                </button>
                <button
                  className="flex-1 rounded-lg bg-primary py-2 text-sm font-medium text-white transition-all hover:bg-primary/90"
                  onClick={() => setIsDateRangeVisible(false)}
                >
                  Appliquer
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Dropdowns avec icônes */}
        <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <div className="w-full">
            {renderDropdown(
              <>
                <IconCash className="h-4 w-4 text-gray-400" />
                <span>Produits</span>
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
                <IconCash className="h-4 w-4 text-gray-400" />
                <span>Caisses</span>
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
                <IconCreditCard className="h-4 w-4 text-gray-400" />
                <span>Mode de règlement</span>
              </>,
              "modes",
              modes,
              selectedItems.modes,
              (libelle) => toggleSelection(libelle, "modes")
            )}
          </div>
          <div className="w-full">
            {renderDropdown(
              <>
                <IconBank className="h-4 w-4 text-gray-400" />
                <span>Banque</span>
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
                <IconBuilding className="h-4 w-4 text-gray-400" />
                <span>Direction Régionale</span>
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
                <span>Exploitations</span>
              </>,
              "secteurs",
              secteurs.filter((secteur: any) =>
                selectedDRIds.includes(secteur.directionRegionaleId)
              ),
              selectedSecteurIds,
              (id) => toggleSecteur(id as number)
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
