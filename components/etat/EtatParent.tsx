"use client";

import { TAppDispatch, TRootState } from "@/store";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Link from "next/link";
import IconHome from "../icon/icon-home";
import IconBox from "../icon/icon-box";
import { fetchEtatEncaissements } from "@/store/reducers/etat/etat.slice";
import TableauEtatEncaissements from "./TableauEtatEncaissements";
import FilterEtatEncaissements from "./FilterEtatEncaissements";
import GlobalFiltre from "../filtre/globalFiltre";

interface EtatParentProps {
  onSearch?: (value: string) => void;
  searchTerm?: string;
}

const EtatParent = ({ onSearch, searchTerm = "" }: EtatParentProps) => {
  const dispatch = useDispatch<TAppDispatch>();
  const [isMounted, setIsMounted] = useState(false);

  // États pour les filtres
  const [filters, setFilters] = useState<any>({
    directionRegional: [],
    codeExpl: [],
    banque: [],
    caisse: [],
    produit: [],
    modeReglement: [],
    startDate: "",
    endDate: "",
    dailyCaisse: [],
    codeCaisse: [],
    noCaisse: [],
  });

  // États pour la pagination
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState(searchTerm);
  const [limit, setLimit] = useState(5);

  // Récupération des données depuis le store Redux
  const etatStore = useSelector((state: TRootState) => state.etatEncaissement).data;
  const etatEncaissements = useSelector(
    (state: TRootState) => state.etatEncaissement?.data?.result || []
  );
  const pagination = useSelector(
    (state: TRootState) =>
      state.etatEncaissement?.data?.pagination || {
        currentPage: 1,
        previousPage: null,
        nextPage: null,
        count: 0,
        totalCount: 0,
        totalPages: 0,
      }
  );
  const loading = useSelector(
    (state: TRootState) => state.etatEncaissement?.loading || false
  );

  // Effet pour charger les données au chargement du composant
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Synchroniser la recherche externe avec la recherche locale
  useEffect(() => {
    setSearch(searchTerm);
  }, [searchTerm]);

  // Fonction pour charger les données en fonction des filtres
  const fetchData = () => {
    console.log("Chargement des données avec les paramètres:", {
      ...filters,
      page,
      search,
      limit,
    });

    dispatch(
      fetchEtatEncaissements({
        ...filters,
        page,
        search,
        limit,
      })
    ).then((action: any) => {
      if (action.error) {
        console.error("Erreur lors du chargement des données:", action.error);
      } else {
        console.log("Données chargées avec succès:", action.payload);
      }
    });
  };

  // Fonction pour rafraîchir manuellement les données
  const refreshData = () => {
    console.log("Rafraîchissement manuel des données");
    fetchData();
  };

  // Effet pour charger les données quand les filtres ou la pagination changent
  useEffect(() => {
    if (isMounted) {
      fetchData();
    }
  }, [isMounted, page, limit, search, filters]);

  // Gestionnaire pour appliquer les filtres
  const handleApplyFilters = (newFilters: any) => {
    setFilters(newFilters);
    setPage(1); // Réinitialiser la page lors de l'application de nouveaux filtres
  };

  // Gestionnaire pour la page
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  // Gestionnaire pour le nombre d'éléments par page
  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setPage(1); // Réinitialiser la page lors du changement de limite
  };

  // Gestionnaire pour la recherche
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearch(value);
    setPage(1); // Réinitialiser la page lors de la recherche

    // Propager la recherche au parent si nécessaire
    if (onSearch) {
      onSearch(value);
    }
  };

  // logique de filtrage
  const [hideCols, setHideCols] = useState<string[]>([]);
  const drData: any = useSelector((state: TRootState) => state.dr?.data);

  const showHideColumns = (col: string) => {
    if (hideCols.includes(col)) {
      setHideCols((prev) => prev.filter((d) => d !== col));
    } else {
      setHideCols((prev) => [...prev, col]);
    }
  };

  const nombreEtats = etatStore?.pagination?.totalCount;


  return (
    <div className="mb-5">
      {/* En-tête intégré avec filtres */}
      <div className="mb-5 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        {/* En-tête avec fil d'Ariane et recherche */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-3">
          <div className="flex items-center gap-2 text-sm">
            <Link
              href="/dashboard"
              className="inline-flex items-center text-gray-600 hover:text-primary"
            >
              <IconHome className="mr-1 h-3.5 w-3.5" />
              Accueil
            </Link>
            <span className="text-gray-400">/</span>
            <span className="inline-flex items-center font-medium text-primary">
              <IconBox className="mr-1 h-3.5 w-3.5" />
              {etatEncaissements.length > 0 ? "État des encaissements" : "Aucune donnée disponible"}
            </span>
          </div>

          {/* Barre de recherche */}
          <div className="relative w-full sm:w-64">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
              <svg
                className="h-4 w-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                ></path>
              </svg>
            </span>
            <input
              type="text"
              className="block w-full rounded-md border border-gray-300 py-2 pl-10 pr-3 text-sm"
              placeholder="Rechercher..."
              value={search}
              onChange={handleSearchChange}
            />
          </div>
        </div>

        {/* Composant de filtrage avec moins d'espace vertical */}
        {/* <FilterEtatEncaissements
          initialFilters={filters}
          onApplyFilters={handleApplyFilters}
          data={etatEncaissements}
        /> */}

        <GlobalFiltre
          drData={drData}
          onApplyFilters={handleApplyFilters}
          statutValidation={null}
        />
      </div>

      <TableauEtatEncaissements
        data={etatEncaissements || []}
        loading={loading}
        pagination={
          pagination || {
            currentPage: 1,
            previousPage: null,
            nextPage: null,
            count: 0,
            totalCount: 0,
            totalPages: 0,
          }
        }
        handlePageChange={handlePageChange}
        handleLimitChange={handleLimitChange}
        onRefresh={refreshData}
      />
    </div>
  );
};

export default EtatParent;
