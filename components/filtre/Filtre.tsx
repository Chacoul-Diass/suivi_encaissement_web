"use client";

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { TAppDispatch, TRootState } from "@/store";
import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css";
import Dropdown from "../dropdown";
import getUserPermission from "@/utils/user-info";
import { fetchSecteurs } from "@/store/reducers/select/secteur.slice";
import { fetchDataRapprochementjade } from "@/store/reducers/rapprochement/rapprochementJade.slice";
import IconCaretDown from "../icon/icon-caret-down";
import { fetchDataRapprochement } from "@/store/reducers/rapprochement/rapprochement.slice";
import { fetchDirectionRegionales } from "@/store/reducers/select/dr.slice";
import YearSelector from "./YearSelector";
import { French } from "flatpickr/dist/l10n/fr";
import IconRefresh from "../icon/icon-refresh";
import IconFilter from "../icon/icon-filter";
import IconBuilding from "../icon/icon-building";
import IconOffice from "../icon/icon-office";

const Filtre = () => {
  const dispatch = useDispatch<TAppDispatch>();

  // Initialize state with empty values to match server-side rendering
  const [showFilters, setShowFilters] = useState<boolean>(true);
  const [selectedYears, setSelectedYears] = useState<number[]>([]);
  const [selectedDRIds, setSelectedDRIds] = useState<number[]>([]);
  const [selectedSecteurIds, setSelectedSecteurIds] = useState<number[]>([]);
  const [drData, setDrData] = useState<any[]>([]);
  const [secteurData, setSecteurData] = useState<any[]>([]);

  // Add loading states
  const [drLoading, setDrLoading] = useState<boolean>(true);
  const [secteurLoading, setSecteurLoading] = useState<boolean>(true);

  // Fetch initial data
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setDrLoading(true);
        const drData = await dispatch(fetchDirectionRegionales());
        setDrData(drData.payload);
        setDrLoading(false);
      } catch (error) {
        console.error("Error fetching DR data:", error);
        setDrLoading(false);
      }
    };

    fetchInitialData();
  }, [dispatch]);

  // Fetch secteur data when DR selection changes
  useEffect(() => {
    const fetchSecteurData = async () => {
      if (selectedDRIds.length > 0) {
        try {
          setSecteurLoading(true);
          const secteurData = await dispatch(fetchSecteurs(selectedDRIds));
          setSecteurData(secteurData.payload);
          setSecteurLoading(false);
        } catch (error) {
          console.error("Error fetching secteur data:", error);
          setSecteurLoading(false);
        }
      }
    };

    fetchSecteurData();
  }, [selectedDRIds, dispatch]);

  // Récupération des données DR depuis votre token ou l'API
  const drDataFromStore: any = useSelector(
    (state: TRootState) => state.dr?.data
  );

  useEffect(() => {
    if (drDataFromStore) {
      setDrData(drDataFromStore);
    }
  }, [drDataFromStore]);

  // Récupération des secteurs
  const secteurDataFromStore: any[] = useSelector(
    (state: TRootState) => state.secteur?.data
  );

  useEffect(() => {
    if (secteurDataFromStore) {
      setSecteurData(secteurDataFromStore);
    }
  }, [secteurDataFromStore]);

  // Générer les années (de l'année actuelle à 5 ans en arrière)
  const currentYear = new Date().getFullYear();

  const selectedDRs = drData?.filter((dr: { id: number }) =>
    selectedDRIds.includes(dr.id)
  );
  const selectedSecteurs = secteurData?.filter((secteur) =>
    selectedSecteurIds.includes(secteur.id)
  );

  const clearFilters = () => {
    setSelectedDRIds([]);
    setSelectedSecteurIds([]);
    setSelectedYears([]);
    dispatch(
      fetchDataRapprochementjade({
        directionRegional: undefined,
        codeExploitation: undefined,
        years: undefined,
      })
    );
    dispatch(
      fetchDataRapprochement({
        directionRegional: undefined,
        codeExploitation: undefined,
        years: undefined,
      })
    );
  };

  const applyFilters = () => {
    const directionRegionalNames = selectedDRs.map(
      (dr: { name: any }) => dr.name
    );
    const codeExploitationNames = selectedSecteurs.map(
      (secteur) => secteur.code
    );

    const params = {
      directionRegional:
        directionRegionalNames.length > 0 ? directionRegionalNames : undefined,
      codeExploitation:
        codeExploitationNames.length > 0 ? codeExploitationNames : undefined,
      years: selectedYears.length > 0 ? selectedYears : undefined,
    };

    dispatch(fetchDataRapprochementjade(params));
    dispatch(fetchDataRapprochement(params));
  };

  const handleDRSelection = (id: number) => {
    setSelectedDRIds((prev) => {
      const isSelected = prev.includes(id);
      const newSelected = isSelected
        ? prev.filter((drId) => drId !== id)
        : [...prev, id];

      if (newSelected.length === 0) {
        setSelectedSecteurIds([]);
      } else {
        setSelectedSecteurIds((prevSecteurs) =>
          prevSecteurs.filter((secteurId) =>
            secteurData.some(
              (secteur) =>
                newSelected.includes(secteur.directionRegionaleId) &&
                secteur.id === secteurId
            )
          )
        );
      }
      return newSelected;
    });
  };

  const handleSecteurSelection = (id: number) => {
    const secteur = secteurData.find((s) => s.id === id);
    if (!secteur || !selectedDRIds.includes(secteur.directionRegionaleId)) {
      return;
    }
    setSelectedSecteurIds((prev) =>
      prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id]
    );
  };

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
            onClick={clearFilters}
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
        {/* Year Selector */}
        <div className="w-full sm:w-auto">
          <YearSelector
            selectedYears={selectedYears}
            onChange={(years) => setSelectedYears(years)}
          />
        </div>

        {/* Dropdowns Grid */}
        <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Direction Régionale */}
          <div className="dropdown relative w-full">
            {selectedDRIds.length > 0 && (
              <Tippy
                content={
                  <div className="max-h-[200px] overflow-y-auto p-2">
                    {selectedDRIds.map((id) => {
                      const dr = drData.find((dr: any) => dr.id === id);
                      return (
                        <div key={id} className="whitespace-nowrap text-sm">
                          {dr ? dr.name : "Inconnu"}
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
                  {selectedDRIds.length}
                </div>
              </Tippy>
            )}

            <Dropdown
              btnClassName={`relative flex w-full items-center justify-between gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm transition-all hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700 ${
                selectedDRIds.length > 0 ? "ring-2 ring-primary/30" : ""
              }`}
              button={
                <div className="flex items-center gap-2 text-gray-700 dark:text-gray-200">
                  <IconBuilding className="h-4 w-4 text-gray-400" />
                  <span>Direction Régionale</span>
                </div>
              }
            >
              <div className="z-50 w-full min-w-[250px] rounded-lg border border-gray-200 bg-white p-2 shadow-lg dark:border-gray-700 dark:bg-gray-800">
                <div className="mb-2 flex items-center justify-between border-b border-gray-200 pb-2 dark:border-gray-700">
                  <button
                    type="button"
                    className="text-xs font-medium text-primary hover:text-primary/80"
                    onClick={() =>
                      setSelectedDRIds(
                        selectedDRIds.length === drData.length
                          ? []
                          : drData.map((dr: any) => dr.id)
                      )
                    }
                  >
                    {selectedDRIds.length === drData.length
                      ? "Tout désélectionner"
                      : "Tout sélectionner"}
                  </button>
                  <span className="text-xs text-gray-500">
                    {selectedDRIds.length} sélectionné(s)
                  </span>
                </div>

                <div className="max-h-[250px] overflow-y-auto">
                  {drData.map((dr: any) => (
                    <label
                      key={dr.id}
                      className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <input
                        type="checkbox"
                        checked={selectedDRIds.includes(dr.id)}
                        onChange={() => handleDRSelection(dr.id)}
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-200">
                        {dr.name}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </Dropdown>
          </div>

          {/* Secteurs */}
          <div className="dropdown relative w-full">
            {selectedSecteurIds.length > 0 && (
              <Tippy
                content={
                  <div className="max-h-[200px] overflow-y-auto p-2">
                    {selectedSecteurIds.map((id) => {
                      const secteur = secteurData?.find(
                        (s: any) => s.id === id
                      );
                      return (
                        <div key={id} className="whitespace-nowrap text-sm">
                          {secteur ? secteur.name : "Inconnu"}
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
                  {selectedSecteurIds.length}
                </div>
              </Tippy>
            )}

            <Dropdown
              btnClassName={`relative flex w-full items-center justify-between gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm transition-all hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700 ${
                selectedSecteurIds.length > 0 ? "ring-2 ring-primary/30" : ""
              } ${
                selectedDRIds.length === 0
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              }`}
              button={
                <div className="flex items-center gap-2 text-gray-700 dark:text-gray-200">
                  <IconOffice className="h-4 w-4 text-gray-400" />
                  <span>Exploitations</span>
                </div>
              }
            >
              <div className="z-50 w-full min-w-[250px] rounded-lg border border-gray-200 bg-white p-2 shadow-lg dark:border-gray-700 dark:bg-gray-800">
                <div className="mb-2 flex items-center justify-between border-b border-gray-200 pb-2 dark:border-gray-700">
                  <button
                    type="button"
                    className="text-xs font-medium text-primary hover:text-primary/80"
                    onClick={() => {
                      const filteredSecteurs = secteurData.filter((s: any) =>
                        selectedDRIds.includes(s.directionRegionaleId)
                      );
                      setSelectedSecteurIds(
                        selectedSecteurIds.length === filteredSecteurs.length
                          ? []
                          : filteredSecteurs.map((s: any) => s.id)
                      );
                    }}
                  >
                    {selectedSecteurIds.length ===
                    secteurData.filter((s: any) =>
                      selectedDRIds.includes(s.directionRegionaleId)
                    ).length
                      ? "Tout désélectionner"
                      : "Tout sélectionner"}
                  </button>
                  <span className="text-xs text-gray-500">
                    {selectedSecteurIds.length} sélectionné(s)
                  </span>
                </div>

                <div className="max-h-[250px] overflow-y-auto">
                  {secteurData
                    .filter((secteur: any) =>
                      selectedDRIds.includes(secteur.directionRegionaleId)
                    )
                    .map((secteur: any) => (
                      <label
                        key={secteur.id}
                        className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <input
                          type="checkbox"
                          checked={selectedSecteurIds.includes(secteur.id)}
                          onChange={() => handleSecteurSelection(secteur.id)}
                          className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-200">
                          {secteur.name}
                        </span>
                      </label>
                    ))}
                </div>
              </div>
            </Dropdown>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Filtre;
