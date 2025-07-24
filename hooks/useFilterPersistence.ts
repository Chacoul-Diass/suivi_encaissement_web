import { useState, useEffect, useCallback } from "react";

interface FilterData {
  directionRegional: string[];
  codeExpl: string[];
  banque: string[];
  caisse: string[];
  produit: string[];
  modeReglement: string[];
  statut: number[];
  startDate: string;
  endDate: string;
  dailyCaisse: string[];
  codeCaisse: string[];
  noCaisse: string[];
  page?: number;
  search?: string;
  limit?: number;
}

const DEFAULT_FILTERS: FilterData = {
  directionRegional: [],
  codeExpl: [],
  banque: [],
  caisse: [],
  produit: [],
  modeReglement: [],
  statut: [],
  startDate: "",
  endDate: "",
  dailyCaisse: [],
  codeCaisse: [],
  noCaisse: [],
  page: 1,
  search: "",
  limit: 10,
};

export const useFilterPersistence = (statutValidation: number) => {
  const getStorageKey = useCallback(
    () => `encaissement_filters_${statutValidation}`,
    [statutValidation]
  );

  const [filters, setFilters] = useState<FilterData>(DEFAULT_FILTERS);
  const [isLoaded, setIsLoaded] = useState(false);

  // Charger les filtres depuis localStorage au démarrage
  useEffect(() => {
    try {
      const savedFilters = localStorage.getItem(getStorageKey());
      if (savedFilters) {
        const parsedFilters = JSON.parse(savedFilters);
        console.log(
          `📂 Filtres restaurés pour statut ${statutValidation}:`,
          parsedFilters
        );
        setFilters({
          ...DEFAULT_FILTERS,
          ...parsedFilters,
        });
      }
    } catch (error) {
      console.error("Erreur lors du chargement des filtres:", error);
    } finally {
      setIsLoaded(true);
    }
  }, [statutValidation, getStorageKey]);

  // Sauvegarder les filtres dans localStorage
  const saveFilters = useCallback(
    (newFilters: Partial<FilterData>) => {
      try {
        const updatedFilters = {
          ...filters,
          ...newFilters,
        };

        setFilters(updatedFilters);
        localStorage.setItem(getStorageKey(), JSON.stringify(updatedFilters));
        console.log(
          `💾 Filtres sauvegardés pour statut ${statutValidation}:`,
          updatedFilters
        );
      } catch (error) {
        console.error("Erreur lors de la sauvegarde des filtres:", error);
      }
    },
    [filters, statutValidation, getStorageKey]
  );

  // Sauvegarder la pagination
  const savePagination = useCallback(
    (page: number, limit: number) => {
      try {
        const updatedFilters = {
          ...filters,
          page,
          limit,
        };

        setFilters(updatedFilters);
        localStorage.setItem(getStorageKey(), JSON.stringify(updatedFilters));
        console.log(
          `📄 Pagination sauvegardée pour statut ${statutValidation}: page=${page}, limit=${limit}`
        );
      } catch (error) {
        console.error("Erreur lors de la sauvegarde de la pagination:", error);
      }
    },
    [filters, statutValidation, getStorageKey]
  );

  // Récupérer les filtres actuels
  const getCurrentFilters = useCallback(() => {
    try {
      const savedFilters = localStorage.getItem(getStorageKey());
      if (savedFilters) {
        return {
          ...DEFAULT_FILTERS,
          ...JSON.parse(savedFilters),
        };
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des filtres:", error);
    }
    return DEFAULT_FILTERS;
  }, [getStorageKey]);

  // Réinitialiser les filtres
  const resetFilters = useCallback(() => {
    try {
      setFilters(DEFAULT_FILTERS);
      localStorage.removeItem(getStorageKey());
      console.log(
        `🗑️ Filtres réinitialisés pour statut ${statutValidation} - localStorage vidé complètement`
      );
    } catch (error) {
      console.error("Erreur lors de la réinitialisation des filtres:", error);
    }
  }, [statutValidation, getStorageKey]);

  // Vérifier si des filtres sont appliqués
  const hasActiveFilters = useCallback(() => {
    return (
      filters.directionRegional.length > 0 ||
      filters.codeExpl.length > 0 ||
      filters.banque.length > 0 ||
      filters.caisse.length > 0 ||
      filters.produit.length > 0 ||
      filters.modeReglement.length > 0 ||
      filters.statut.length > 0 ||
      filters.startDate !== "" ||
      filters.endDate !== "" ||
      filters.dailyCaisse.length > 0 ||
      filters.codeCaisse.length > 0 ||
      filters.noCaisse.length > 0 ||
      (filters.search && filters.search !== "")
    );
  }, [filters]);

  return {
    filters,
    isLoaded,
    saveFilters,
    savePagination,
    getCurrentFilters,
    resetFilters,
    hasActiveFilters,
  };
};
