import React, { useState } from "react";
import { createPortal } from "react-dom";
import IconBuilding from "../icon/icon-building";
import IconCheckCircle from "../icon/icon-check-circle";
import IconBarChart from "../icon/icon-bar-chart";

interface RegionalData {
    region: string;
    tauxCloture: number;
    encaissementsTotal: number;
    encaissementsClotures: number;
    evolution: number; // % d'évolution par rapport à la période précédente
}

interface RegionalClosureRateChartProps {
    data?: RegionalData[];
    loading?: boolean;
    selectedYear?: number;
    onYearChange?: (year: number) => void;
}

const RegionalClosureRateChart: React.FC<RegionalClosureRateChartProps> = ({
    data,
    loading = false,
    selectedYear: propSelectedYear,
    onYearChange
}) => {
    const [selectedYear, setSelectedYear] = useState<number>(propSelectedYear || new Date().getFullYear());
    const [isFullScreen, setIsFullScreen] = useState(false);

    // Synchroniser avec la prop externe
    React.useEffect(() => {
        if (propSelectedYear !== undefined && propSelectedYear !== selectedYear) {
            setSelectedYear(propSelectedYear);
        }
    }, [propSelectedYear]);

    const handleYearChange = (year: number) => {
        setSelectedYear(year);
        if (onYearChange) {
            onYearChange(year);
        }
    };

    const regionalData = data || [];
    const availableYears = [new Date().getFullYear(), new Date().getFullYear() - 1, new Date().getFullYear() - 2];

    // Normaliser les données pour gérer l'incohérence entre 'name' et 'region'
    const normalizedData = regionalData.map(item => ({
        region: (item as any).name || item.region,
        tauxCloture: item.tauxCloture,
        encaissementsTotal: (item as any).encaissements || item.encaissementsTotal,
        encaissementsClotures: item.encaissementsClotures || 0,
        evolution: item.evolution
    }));

    // Trier par taux de clôture décroissant
    const sortedData = [...normalizedData].sort((a, b) => b.tauxCloture - a.tauxCloture);

    // Limiter l'affichage à 5 éléments par défaut
    const displayedData = sortedData.slice(0, 5);

    const getRankBadge = (rank: number) => {
        switch (rank) {
            case 1:
                return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400 text-xs font-bold rounded-full">1er</span>;
            case 2:
                return <span className="px-2 py-1 bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 text-xs font-bold rounded-full">2ème</span>;
            case 3:
                return <span className="px-2 py-1 bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400 text-xs font-bold rounded-full">3ème</span>;
            default:
                return <span className="px-2 py-1 bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 text-xs font-bold rounded-full">#{rank}</span>;
        }
    };

    const getTauxColor = (taux: number) => {
        if (taux >= 90) return "text-green-600 bg-green-100 dark:bg-green-900/20";
        if (taux >= 80) return "text-blue-600 bg-blue-100 dark:bg-blue-900/20";
        if (taux >= 70) return "text-orange-600 bg-orange-100 dark:bg-orange-900/20";
        return "text-red-600 bg-red-100 dark:bg-red-900/20";
    };

    const getEvolutionIcon = (evolution: number) => {
        if (evolution > 0) {
            return <span className="text-green-500 text-sm">↗ +{evolution}%</span>;
        } else if (evolution < 0) {
            return <span className="text-red-500 text-sm">↘ {evolution}%</span>;
        } else {
            return <span className="text-gray-500 text-sm">→ 0%</span>;
        }
    };

    if (loading) {
        return (
            <div className="panel">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                        <div className="h-6 w-6 bg-gray-300 dark:bg-gray-600 rounded animate-pulse"></div>
                        <div className="h-6 w-48 bg-gray-300 dark:bg-gray-600 rounded animate-pulse"></div>
                    </div>
                    <div className="h-8 w-32 bg-gray-300 dark:bg-gray-600 rounded animate-pulse"></div>
                </div>
                <div className="space-y-4">
                    {[...Array(5)].map((_, index) => (
                        <div key={index} className="flex items-center gap-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse">
                            <div className="h-6 w-8 bg-gray-300 dark:bg-gray-600 rounded"></div>
                            <div className="flex-1 space-y-2">
                                <div className="h-4 w-32 bg-gray-300 dark:bg-gray-600 rounded"></div>
                                <div className="h-3 w-24 bg-gray-300 dark:bg-gray-600 rounded"></div>
                            </div>
                            <div className="h-8 w-16 bg-gray-300 dark:bg-gray-600 rounded"></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="panel">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <IconBarChart className="h-6 w-6 text-primary" />
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                        Évolution de la performance par région
                    </h3>
                </div>
                <button
                    onClick={() => setIsFullScreen(true)}
                    className="p-2 text-gray-600 hover:text-primary hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
                    title="Afficher en plein écran"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                    </svg>
                </button>
            </div>

            <div className="space-y-4">
                {displayedData.map((region, index) => (
                    <div key={region.region} className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:shadow-md transition-shadow duration-200">
                        <div className="flex items-center justify-center w-12 h-12">
                            {getRankBadge(index + 1)}
                        </div>

                        <div className="flex-1">
                            <h4 className="font-semibold text-gray-800 dark:text-white mb-1">
                                {region?.region}
                            </h4>
                            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                                <span>{region?.encaissementsClotures?.toLocaleString()} / {region.encaissementsTotal?.toLocaleString()} clôturés</span>
                                {/* <span>•</span>
                                <span className="flex items-center gap-1">
                                    Évolution: {getEvolutionIcon(region.evolution)}
                                </span> */}
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className={`px-3 py-1 rounded-full text-sm font-semibold ${getTauxColor(region.tauxCloture)}`}>
                                {region.tauxCloture}%
                            </div>
                            <IconCheckCircle className="h-5 w-5 text-green-500" />
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-center gap-6 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span>Excellent (90%+)</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <span>Bon (80-89%)</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                        <span>Moyen (70-79%)</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                        <span>Faible (&lt;70%)</span>
                    </div>
                </div>
            </div>

            {/* Modal Plein Écran */}
            {isFullScreen && typeof window !== 'undefined' && createPortal(
                <div className="fixed inset-0 bg-black bg-opacity-75 z-[999999] flex items-center justify-center">
                    <div className="bg-white dark:bg-gray-800 w-full h-full overflow-hidden flex flex-col">
                        {/* Header Modal */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                            <div className="flex items-center gap-3">
                                <IconBarChart className="h-8 w-8 text-primary" />
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                                        Évolution de la performance par région
                                    </h2>
                                    <p className="text-gray-600 dark:text-gray-400">
                                        Vue détaillée en plein écran
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsFullScreen(false)}
                                className="p-2 text-gray-600 hover:text-red-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
                                title="Fermer"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Contenu Modal */}
                        <div className="flex-1 p-6 overflow-auto">
                            <div className="space-y-4">
                                {sortedData.map((region, index) => (
                                    <div key={region.region} className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:shadow-md transition-shadow duration-200">
                                        <div className="flex items-center justify-center w-12 h-12">
                                            {getRankBadge(index + 1)}
                                        </div>

                                        <div className="flex-1">
                                            <h4 className="font-semibold text-gray-800 dark:text-white mb-1">
                                                {region?.region}
                                            </h4>
                                            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                                                <span>{region?.encaissementsClotures?.toLocaleString()} / {region.encaissementsTotal?.toLocaleString()} clôturés</span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <div className={`px-3 py-1 rounded-full text-sm font-semibold ${getTauxColor(region.tauxCloture)}`}>
                                                {region.tauxCloture}%
                                            </div>
                                            <IconCheckCircle className="h-5 w-5 text-green-500" />
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Légende */}
                            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                                <div className="flex items-center justify-center gap-6 text-sm text-gray-600 dark:text-gray-400">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                        <span>Excellent (90%+)</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                                        <span>Bon (80-89%)</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                                        <span>Moyen (70-79%)</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                                        <span>Faible (&lt;70%)</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};

export default RegionalClosureRateChart;
