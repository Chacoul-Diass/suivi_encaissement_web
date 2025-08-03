"use client";

import React, { useEffect, useState, useRef } from "react";
import { useSelector } from "react-redux";
import { TRootState } from "@/store";
import dayjs from "dayjs";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";
import IconExcel from "../icon/excel";
import Csv from "../icon/csv";
import Pdf from "../icon/pdf";
import IconFilter from "../icon/icon-filter";
import IconRefresh from "../icon/icon-refresh";
import IconCalendar from "../icon/icon-calendar";
import IconBuilding from "../icon/icon-building";
import IconBank from "../icon/icon-bank";
import IconCreditCard from "../icon/icon-credit-card";
import IconBox from "../icon/icon-box";
import IconPackage from "../icon/icon-package";
import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css";
import "tippy.js/animations/scale.css";
import Dropdown from "../dropdown";
import { EStatutEncaissement } from "@/utils/enums";

interface FilterEtatEncaissementsProps {
    initialFilters: {
        directionRegional: string[];
        codeExpl: string[];
        banque: string[];
        caisse: string[];
        produit: string[];
        modeReglement: string[];
        statut: number[]; // Ajout du filtre par statut
        startDate: string;
        endDate: string;
        dailyCaisse: string[];
        codeCaisse: string[];
        noCaisse: string[];
    };
    onApplyFilters: (filters: any) => void;
    data?: any[]; // Données pour l'export
}

const FilterEtatEncaissements = ({
    initialFilters,
    onApplyFilters,
    data = [],
}: FilterEtatEncaissementsProps) => {
    // État local pour les filtres
    const [filters, setFilters] = useState({
        directionRegional: initialFilters.directionRegional || [],
        codeExpl: initialFilters.codeExpl || [],
        banque: initialFilters.banque || [],
        caisse: initialFilters.caisse || [],
        produit: initialFilters.produit || [],
        modeReglement: initialFilters.modeReglement || [],
        statut: initialFilters.statut || [], // Ajout du filtre par statut
        startDate: initialFilters.startDate || "",
        endDate: initialFilters.endDate || "",
        dailyCaisse: initialFilters.dailyCaisse || [],
        codeCaisse: initialFilters.codeCaisse || [],
        noCaisse: initialFilters.noCaisse || [],
    });

    // État pour les recherches dans les dropdowns
    const [searchQueries, setSearchQueries] = useState({
        directionRegional: "",
        banque: "",
        caisse: "",
        produit: "",
        modeReglement: "",
        statut: "",
    });

    // État pour les éléments sélectionnés (sous forme d'objets pour une meilleure gestion)
    const [selectedItems, setSelectedItems] = useState({
        directionRegional: initialFilters.directionRegional.map(id => ({ value: id, label: "" })),
        banque: initialFilters.banque.map(id => ({ value: id, label: "" })),
        caisse: initialFilters.caisse.map(id => ({ value: id, label: "" })),
        produit: initialFilters.produit.map(id => ({ value: id, label: "" })),
        modeReglement: initialFilters.modeReglement.map(id => ({ value: id, label: "" })),
        statut: initialFilters.statut.map(id => ({ value: id.toString(), label: "" })),
    });

    // État pour afficher/masquer le sélecteur de date
    const [isDateRangeVisible, setIsDateRangeVisible] = useState(false);
    const datePickerRef = useRef<HTMLDivElement>(null);

    // Récupération des données de référence depuis le store Redux
    const directionRegionals = useSelector(
        (state: TRootState) =>
            state.dr.data?.map((item: any) => ({
                value: item._id,
                label: item.name,
            })) || []
    );

    const banques = useSelector(
        (state: TRootState) =>
            state.Banques.data?.map((item: any) => ({
                value: item._id,
                label: item.name,
            })) || []
    );

    const caisses = useSelector(
        (state: TRootState) =>
            state.caisses.data?.map((item: any) => ({
                value: item._id,
                label: item.name,
            })) || []
    );

    const produits = useSelector(
        (state: TRootState) =>
            state.produit.data?.map((item: any) => ({
                value: item._id,
                label: item.name,
            })) || []
    );

    const modesReglement = useSelector(
        (state: TRootState) =>
            state.modeReglement.data?.map((item: any) => ({
                value: item._id,
                label: item.name,
            })) || []
    );

    // Définition des statuts disponibles
    const statuts = [
        { value: EStatutEncaissement.EN_ATTENTE.toString(), label: "En attente" },
        { value: EStatutEncaissement.REJETE.toString(), label: "Rejeté" },
        { value: EStatutEncaissement.TRAITE.toString(), label: "Traité" },
        { value: EStatutEncaissement.VALIDE.toString(), label: "Validé" },
        { value: EStatutEncaissement.RECLAMATION_REVERSES.toString(), label: "Réclamation chargée" },
        { value: EStatutEncaissement.CLOTURE.toString(), label: "Clôturé" },
        { value: EStatutEncaissement.RECLAMATION_TRAITES.toString(), label: "Réclamation traitée" },
        { value: EStatutEncaissement.DFC.toString(), label: "DFC" },
    ];

    // Fermer le sélecteur de date quand on clique en dehors
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

    // Initialisation des labels pour les éléments déjà sélectionnés
    useEffect(() => {
        // Pour chaque type de filtre, chercher les labels correspondants
        const updatedDirections = selectedItems.directionRegional.map(item => {
            const found = directionRegionals.find(dir => dir.value === item.value);
            return { value: item.value, label: found?.label || item.label || "Inconnu" };
        });

        const updatedBanques = selectedItems.banque.map(item => {
            const found = banques.find(b => b.value === item.value);
            return { value: item.value, label: found?.label || item.label || "Inconnu" };
        });

        const updatedCaisses = selectedItems.caisse.map(item => {
            const found = caisses.find(c => c.value === item.value);
            return { value: item.value, label: found?.label || item.label || "Inconnu" };
        });

        const updatedProduits = selectedItems.produit.map(item => {
            const found = produits.find(p => p.value === item.value);
            return { value: item.value, label: found?.label || item.label || "Inconnu" };
        });

        const updatedModes = selectedItems.modeReglement.map(item => {
            const found = modesReglement.find(m => m.value === item.value);
            return { value: item.value, label: found?.label || item.label || "Inconnu" };
        });

        const updatedStatuts = selectedItems.statut.map(item => {
            const found = statuts.find(s => s.value === item.value);
            return { value: item.value, label: found?.label || item.label || "Inconnu" };
        });

        // Vérifier si une mise à jour est nécessaire pour éviter une boucle infinie
        const needsUpdate =
            JSON.stringify(updatedDirections) !== JSON.stringify(selectedItems.directionRegional) ||
            JSON.stringify(updatedBanques) !== JSON.stringify(selectedItems.banque) ||
            JSON.stringify(updatedCaisses) !== JSON.stringify(selectedItems.caisse) ||
            JSON.stringify(updatedProduits) !== JSON.stringify(selectedItems.produit) ||
            JSON.stringify(updatedModes) !== JSON.stringify(selectedItems.modeReglement) ||
            JSON.stringify(updatedStatuts) !== JSON.stringify(selectedItems.statut);

        if (needsUpdate) {
            setSelectedItems({
                directionRegional: updatedDirections,
                banque: updatedBanques,
                caisse: updatedCaisses,
                produit: updatedProduits,
                modeReglement: updatedModes,
                statut: updatedStatuts, // Mettre à jour les labels des statuts
            });
        }
    }, [directionRegionals, banques, caisses, produits, modesReglement]);

    // Gestion du changement des filtres via les dropdowns
    const toggleSelection = (
        item: { value: string, label: string },
        type: "directionRegional" | "banque" | "caisse" | "produit" | "modeReglement" | "statut"
    ) => {
        setSelectedItems(prev => {
            const isSelected = prev[type].some(selected => selected.value === item.value);

            const newItems = isSelected
                ? prev[type].filter(selected => selected.value !== item.value)
                : [...prev[type], item];

            return {
                ...prev,
                [type]: newItems
            };
        });
    };

    // Sélection/désélection de tous les éléments d'un type
    const toggleAll = (
        type: "directionRegional" | "banque" | "caisse" | "produit" | "modeReglement" | "statut",
        items: { value: string, label: string }[],
        isAllSelected: boolean
    ) => {
        setSelectedItems(prev => ({
            ...prev,
            [type]: isAllSelected ? [] : [...items]
        }));
    };

    // Gestion du changement de date
    const handleDateChange = (field: 'startDate' | 'endDate', value: string) => {

        setFilters(prev => ({
            ...prev,
            [field]: value
        }));
    };

    // Application des filtres
    const handleApplyFilters = () => {
        // Construire l'objet de filtres à partir des éléments sélectionnés
        const updatedFilters = {
            ...filters,
            directionRegional: selectedItems.directionRegional.map(item => item.value),
            banque: selectedItems.banque.map(item => item.value),
            caisse: selectedItems.caisse.map(item => item.value),
            produit: selectedItems.produit.map(item => item.value),
            modeReglement: selectedItems.modeReglement.map(item => item.value),
            statut: selectedItems.statut.map(item => parseInt(item.value)), // Conversion en nombre
        };

        onApplyFilters(updatedFilters);
    };

    // Réinitialisation des filtres
    const handleResetFilters = () => {
        setSelectedItems({
            directionRegional: [],
            banque: [],
            caisse: [],
            produit: [],
            modeReglement: [],
            statut: [], // Ajout du reset pour statut
        });

        setFilters({
            directionRegional: [],
            codeExpl: [],
            banque: [],
            caisse: [],
            produit: [],
            modeReglement: [],
            statut: [], // Ajout du reset pour statut
            startDate: "",
            endDate: "",
            dailyCaisse: [],
            codeCaisse: [],
            noCaisse: [],
        });

        setSearchQueries({
            directionRegional: "",
            banque: "",
            caisse: "",
            produit: "",
            modeReglement: "",
            statut: "",
        });

        onApplyFilters({
            directionRegional: [],
            codeExpl: [],
            banque: [],
            caisse: [],
            produit: [],
            modeReglement: [],
            statut: [], // Ajout du reset pour statut
            startDate: "",
            endDate: "",
            dailyCaisse: [],
            codeCaisse: [],
            noCaisse: [],
        });
    };



    // Fonction pour rendre un dropdown avec recherche
    const renderDropdown = (
        label: React.ReactNode,
        type: "directionRegional" | "banque" | "caisse" | "produit" | "modeReglement" | "statut",
        items: { value: string, label: string }[],
        selected: { value: string, label: string }[]
    ) => (
        <div className="dropdown relative w-full">
            {selected.length > 0 && (
                <Tippy
                    content={
                        <div className="max-h-[200px] overflow-y-auto p-2">
                            {selected.map((item) => (
                                <div key={item.value} className="whitespace-nowrap text-sm">
                                    {item.label}
                                </div>
                            ))}
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
                btnClassName={`relative flex w-full items-center justify-between gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm transition-all hover:bg-gray-50 ${selected.length > 0 ? "ring-2 ring-primary/30" : ""
                    }`}
                button={
                    <div className="flex items-center gap-2 text-gray-700">
                        {label}
                    </div>
                }
            >
                <div
                    className="z-50 w-full min-w-[250px] rounded-lg border border-gray-200 bg-white p-2 shadow-lg"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Barre de recherche */}
                    <div className="relative mb-2">
                        <input
                            type="text"
                            placeholder="Rechercher..."
                            value={searchQueries[type]}
                            onChange={(e) =>
                                setSearchQueries((prev) => ({
                                    ...prev,
                                    [type]: e.target.value,
                                }))
                            }
                            className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm placeholder-gray-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                    </div>

                    {/* Bouton tout sélectionner */}
                    <div className="mb-2 flex items-center justify-between border-b border-gray-200 pb-2">
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
                            .filter((item) => {
                                const itemLabel = item?.label || item?.value || "";
                                return itemLabel.toLowerCase().includes(searchQueries[type].toLowerCase());
                            })
                            .map((item, i) => (
                                <label
                                    key={i}
                                    className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 hover:bg-gray-100"
                                >
                                    <input
                                        type="checkbox"
                                        checked={selected.some(sel => sel.value === item.value)}
                                        onChange={() => toggleSelection(item, type)}
                                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                    />
                                    <span className="text-sm text-gray-700">
                                        {item.label}
                                    </span>
                                </label>
                            ))}
                    </div>
                </div>
            </Dropdown>
        </div>
    );

    return (
        <div className="mb-8 space-y-5 rounded-lg bg-white p-5 shadow-sm transition-all duration-300 hover:shadow-md">
            {/* Entête avec titre et boutons d'action */}
            <div className="flex items-center justify-between border-b border-gray-200 pb-4">
                <div className="flex items-center gap-2">
                    <IconFilter className="h-5 w-5 text-primary" />
                    <h2 className="text-lg font-semibold text-gray-800">
                        Filtres
                    </h2>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    {/* Boutons de filtrage */}
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={handleResetFilters}
                            className="group flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-all duration-200 hover:bg-gray-50 hover:shadow-sm"
                        >
                            <IconRefresh className="h-4 w-4 transition-transform duration-300 group-hover:rotate-180" />
                            Réinitialiser
                        </button>
                        <button
                            type="button"
                            onClick={handleApplyFilters}
                            className="group flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-all duration-200 hover:bg-primary/90 hover:shadow-sm"
                        >
                            <IconFilter className="h-4 w-4 transition-transform duration-200 group-hover:scale-110" />
                            Appliquer
                        </button>
                    </div>

                    {/* Boutons d'export */}
                    {/* <div className="flex items-center rounded-lg border border-gray-300 bg-white p-1">
                        <span className="px-2 text-sm font-medium text-gray-700">Exporter</span>
                        <div className="flex">
                            <Tippy content="Exporter en Excel" animation="scale" placement="top">
                                <button
                                    type="button"
                                    className="rounded-lg p-2 text-gray-600 transition-all hover:bg-gray-100"
                                    onClick={() => handleExportExcel()}
                                >
                                    <IconExcel className="h-5 w-5" />
                                </button>
                            </Tippy>
                            <Tippy content="Exporter en CSV" animation="scale" placement="top">
                                <button
                                    type="button"
                                    className="rounded-lg p-2 text-gray-600 transition-all hover:bg-gray-100"
                                    onClick={() => handleExportCSV()}
                                >
                                    <Csv className="h-5 w-5" />
                                </button>
                            </Tippy>
                            <Tippy content="Exporter en PDF" animation="scale" placement="top">
                                <button
                                    type="button"
                                    className="rounded-lg p-2 text-gray-600 transition-all hover:bg-gray-100"
                                    onClick={() => handleExportPDF()}
                                >
                                    <Pdf className="h-5 w-5" />
                                </button>
                            </Tippy>
                        </div>
                    </div> */}
                </div>
            </div>

            {/* Corps des filtres */}
            <div className="flex flex-wrap items-start gap-4 lg:flex-nowrap lg:items-center">
                {/* Sélecteur de dates personnalisé */}
                <div className="relative w-full sm:w-auto" ref={datePickerRef}>
                    <div
                        className="flex cursor-pointer items-center justify-between rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm transition-all hover:bg-gray-50"
                        onClick={() => setIsDateRangeVisible(!isDateRangeVisible)}
                    >
                        <div className="flex items-center gap-2 text-gray-700">
                            <IconCalendar className="h-4 w-4 text-gray-400" />
                            <span>
                                {filters.startDate && filters.endDate
                                    ? `${dayjs(filters.startDate).format("DD/MM/YYYY")} - ${dayjs(filters.endDate).format("DD/MM/YYYY")}`
                                    : "Sélectionner la période"}
                            </span>
                        </div>
                    </div>

                    {isDateRangeVisible && (
                        <div className="absolute z-10 mt-2 w-full min-w-[300px] rounded-lg border border-gray-200 bg-white p-3 shadow-lg">
                            <div className="mb-3 space-y-3">
                                <div>
                                    <label className="mb-1 block text-xs font-medium text-gray-700">Date début</label>
                                    <input
                                        type="date"
                                        className="w-full rounded-lg border border-gray-200 p-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary"
                                        value={filters.startDate || ""}
                                        onChange={(e) => handleDateChange('startDate', e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="mb-1 block text-xs font-medium text-gray-700">Date fin</label>
                                    <input
                                        type="date"
                                        className="w-full rounded-lg border border-gray-200 p-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary"
                                        value={filters.endDate || ""}
                                        onChange={(e) => handleDateChange('endDate', e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    className="flex-1 rounded-lg border border-gray-200 bg-white py-2 text-sm font-medium text-gray-700 transition-all hover:bg-gray-50"
                                    onClick={() => {
                                        setFilters(prev => ({
                                            ...prev,
                                            startDate: "",
                                            endDate: ""
                                        }));
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
                <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-6">
                    <div className="w-full">
                        {renderDropdown(
                            <>
                                <IconBuilding className="h-4 w-4 text-gray-400" />
                                <span>Direction Régionale</span>
                            </>,
                            "directionRegional",
                            directionRegionals,
                            selectedItems.directionRegional
                        )}
                    </div>

                    <div className="w-full">
                        {renderDropdown(
                            <>
                                <IconBank className="h-4 w-4 text-gray-400" />
                                <span>Banque</span>
                            </>,
                            "banque",
                            banques,
                            selectedItems.banque
                        )}
                    </div>

                    <div className="w-full">
                        {renderDropdown(
                            <>
                                <IconBox className="h-4 w-4 text-gray-400" />
                                <span>Caisse</span>
                            </>,
                            "caisse",
                            caisses,
                            selectedItems.caisse
                        )}
                    </div>

                    <div className="w-full">
                        {renderDropdown(
                            <>
                                <IconPackage className="h-4 w-4 text-gray-400" />
                                <span>Produit</span>
                            </>,
                            "produit",
                            produits,
                            selectedItems.produit
                        )}
                    </div>

                    <div className="w-full">
                        {renderDropdown(
                            <>
                                <IconCreditCard className="h-4 w-4 text-gray-400" />
                                <span>Mode de Règlement</span>
                            </>,
                            "modeReglement",
                            modesReglement,
                            selectedItems.modeReglement
                        )}
                    </div>

                    <div className="w-full">
                        {renderDropdown(
                            <>
                                <IconFilter className="h-4 w-4 text-gray-400" />
                                <span>Statut</span>
                            </>,
                            "statut",
                            statuts,
                            selectedItems.statut
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FilterEtatEncaissements; 