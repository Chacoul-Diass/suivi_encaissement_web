"use client";

import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { TAppDispatch, TRootState } from "../../store";
import { fetchDirectionRegionales } from "../../store/reducers/select/dr.slice";

interface DashboardFiltersProps {
    onApplyFilters: (filters: {
        selectedYear: number;
        selectedDRNames: string[];
        startDate: string;
        endDate: string;
    }) => void;
    onRefresh: () => void;
    isLoading: boolean;
    currentYear?: number;
}

const DashboardFilters: React.FC<DashboardFiltersProps> = ({
    onApplyFilters,
    onRefresh,
    isLoading,
    currentYear
}) => {
    const dispatch = useDispatch<TAppDispatch>();
    const drData = useSelector((state: TRootState) => state.dr?.data || []);
    const drLoading = useSelector((state: TRootState) => state.dr?.loading || false);
    const drError = useSelector((state: TRootState) => state.dr?.error || null);
    const [isDRDropdownOpen, setIsDRDropdownOpen] = useState(false);

    // États temporaires pour les filtres (non appliqués)
    const [tempSelectedDRNames, setTempSelectedDRNames] = useState<string[]>([]);
    const [tempStartDate, setTempStartDate] = useState<string>("");
    const [tempEndDate, setTempEndDate] = useState<string>("");
    const [tempSelectedYear, setTempSelectedYear] = useState<number>(currentYear || new Date().getFullYear());

    useEffect(() => {
        dispatch(fetchDirectionRegionales());
    }, [dispatch]);

    // Synchroniser tempSelectedYear avec currentYear
    useEffect(() => {
        if (currentYear && currentYear !== tempSelectedYear) {
            setTempSelectedYear(currentYear);
        }
    }, [currentYear]);

    // Réinitialiser les dates quand l'année change
    useEffect(() => {
        setTempStartDate("");
        setTempEndDate("");
    }, [tempSelectedYear]);

    // Fermer le dropdown DR quand on clique en dehors
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            const target = event.target as Element;
            if (!target.closest('.dr-dropdown')) {
                setIsDRDropdownOpen(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleApplyFilters = () => {
        onApplyFilters({
            selectedYear: tempSelectedYear,
            selectedDRNames: tempSelectedDRNames,
            startDate: tempStartDate,
            endDate: tempEndDate,
        });
    };

    const handleReset = () => {
        setTempSelectedYear(0);
        setTempSelectedDRNames([]);
        setTempStartDate("");
        setTempEndDate("");
    };

    return (
        <div className="bg-gradient-to-r from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-4 mb-6">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-primary/10 rounded-lg">
                        <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                        </svg>
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                            Filtres du Dashboard
                        </h2>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                            Personnalisez l'affichage des données
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Filtre Année */}
                <div className="space-y-1.5">
                    <label className="flex items-center gap-1.5 text-xs font-medium text-gray-700 dark:text-gray-300">
                        <svg className="w-3 h-3 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Année
                    </label>
                    <div className="relative group">
                        <select
                            value={tempSelectedYear}
                            onChange={(e) => setTempSelectedYear(Number(e.target.value))}
                            className="w-full px-3 py-2 pr-8 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 appearance-none cursor-pointer hover:border-gray-400 dark:hover:border-gray-500"
                        >
                            {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map((year) => (
                                <option key={year} value={year}>
                                    {year}
                                </option>
                            ))}
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                            <svg className="w-4 h-4 text-gray-400 group-hover:text-primary transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Filtre Période */}
                <div className="space-y-1.5">
                    <label className="flex items-center gap-1.5 text-xs font-medium text-gray-700 dark:text-gray-300">
                        <svg className="w-3 h-3 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Période
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                        <div className="relative group">
                            <input
                                type="date"
                                value={tempStartDate}
                                onChange={(e) => setTempStartDate(e.target.value)}
                                min={tempSelectedYear ? `${tempSelectedYear}-01-01` : undefined}
                                max={tempSelectedYear ? `${tempSelectedYear}-12-31` : undefined}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 cursor-pointer hover:border-gray-400 dark:hover:border-gray-500"
                                placeholder="Début"
                            />
                        </div>
                        <div className="relative group">
                            <input
                                type="date"
                                value={tempEndDate}
                                onChange={(e) => setTempEndDate(e.target.value)}
                                min={tempStartDate || (tempSelectedYear ? `${tempSelectedYear}-01-01` : undefined)}
                                max={tempSelectedYear ? `${tempSelectedYear}-12-31` : undefined}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 cursor-pointer hover:border-gray-400 dark:hover:border-gray-500"
                                placeholder="Fin"
                            />
                        </div>
                    </div>
                </div>

                {/* Filtre DR */}
                <div className="space-y-1.5">
                    <label className="flex items-center gap-1.5 text-xs font-medium text-gray-700 dark:text-gray-300">
                        <svg className="w-3 h-3 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        Direction Régionale
                    </label>
                    <div className="relative dr-dropdown">
                        <button
                            type="button"
                            onClick={() => setIsDRDropdownOpen(!isDRDropdownOpen)}
                            className="w-full px-3 py-2 text-left border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 hover:border-gray-400 dark:hover:border-gray-500"
                        >
                            {tempSelectedDRNames.length === 0 ? (
                                <span className="text-gray-500">Toutes les DR</span>
                            ) : tempSelectedDRNames.length === 1 ? (
                                <span>{(drData as any[]).find((dr: any) => dr.name === tempSelectedDRNames[0])?.name}</span>
                            ) : (
                                <span>{tempSelectedDRNames.length} Direction(s) Régionale(s)</span>
                            )}
                        </button>

                        {/* Dropdown */}
                        {isDRDropdownOpen && (
                            <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg">
                                <div className="p-2 border-b border-gray-200 dark:border-gray-600">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                                            Sélectionner les DR
                                        </span>
                                        <button
                                            onClick={() => {
                                                if (tempSelectedDRNames.length === drData.length) {
                                                    setTempSelectedDRNames([]);
                                                } else {
                                                    setTempSelectedDRNames(drData.map((dr: any) => dr.name));
                                                }
                                            }}
                                            className="text-xs text-primary hover:text-primary-dark"
                                        >
                                            {tempSelectedDRNames.length === drData.length ? "Désélectionner tout" : "Sélectionner tout"}
                                        </button>
                                    </div>
                                </div>

                                <div className="max-h-48 overflow-y-auto">
                                    {drLoading ? (
                                        <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
                                            Chargement des DR...
                                        </div>
                                    ) : drError ? (
                                        <div className="px-3 py-2 text-sm text-red-500 dark:text-red-400">
                                            Erreur: {drError}
                                        </div>
                                    ) : drData && drData.length > 0 ? (
                                        drData.map((dr: any) => (
                                            <label
                                                key={dr.id}
                                                className="flex cursor-pointer items-center gap-2 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-600"
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={tempSelectedDRNames.includes(dr.name)}
                                                    onChange={() => {
                                                        if (tempSelectedDRNames.includes(dr.name)) {
                                                            setTempSelectedDRNames(tempSelectedDRNames.filter(name => name !== dr.name));
                                                        } else {
                                                            setTempSelectedDRNames([...tempSelectedDRNames, dr.name]);
                                                        }
                                                    }}
                                                    className="h-3 w-3 rounded border-gray-300 text-primary focus:ring-primary"
                                                />
                                                <span className="text-sm text-gray-700 dark:text-gray-200">
                                                    {dr.name}
                                                </span>
                                            </label>
                                        ))
                                    ) : (
                                        <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
                                            Aucune DR disponible
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Boutons d'action */}
            <div className="flex items-center justify-end gap-3 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                    onClick={onRefresh}
                    disabled={isLoading}
                    className="flex items-center gap-1.5 px-4 py-2 text-sm text-primary dark:text-gray-400 border border-primary dark:border-gray-600 rounded-lg hover:bg-gray-50  hover:border-gray-400 hover:text-gray-600 transition-all duration-200 font-medium"
                >
                    {isLoading ? (
                        <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    ) : (
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                    )}
                    Actualiser
                </button>
                <button
                    onClick={handleReset}
                    className="flex items-center gap-1.5 px-4 py-2 text-sm text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500 transition-all duration-200 font-medium"
                >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Réinitialiser
                </button>

                <button
                    onClick={handleApplyFilters}
                    disabled={isLoading}
                    className="flex items-center gap-1.5 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                >
                    {isLoading ? (
                        <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    ) : (
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                        </svg>
                    )}
                    Appliquer les filtres
                </button>
            </div>
        </div>
    );
};

export default DashboardFilters;
