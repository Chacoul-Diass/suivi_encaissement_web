"use client";

import React, { useState } from "react";
import { createPortal } from "react-dom";
import IconBarChart from "../icon/icon-bar-chart";
import IconCalendar from "../icon/icon-calendar";

interface WeeklyHistogramData {
    [year: number]: {
        semaine1: number;
        semaine2: number;
        semaine3: number;
        semaine4: number;
        semaine5: number;
        semaine6: number;
        semaine7: number;
        semaine8: number;
        semaine9: number;
        semaine10: number;
        semaine11: number;
        semaine12: number;
        semaine13: number;
        semaine14: number;
        semaine15: number;
        semaine16: number;
        semaine17: number;
        semaine18: number;
        semaine19: number;
        semaine20: number;
        semaine21: number;
        semaine22: number;
        semaine23: number;
        semaine24: number;
        semaine25: number;
        semaine26: number;
        semaine27: number;
        semaine28: number;
        semaine29: number;
        semaine30: number;
        semaine31: number;
        semaine32: number;
        semaine33: number;
        semaine34: number;
        semaine35: number;
        semaine36: number;
        semaine37: number;
        semaine38: number;
        semaine39: number;
        semaine40: number;
        semaine41: number;
        semaine42: number;
        semaine43: number;
        semaine44: number;
        semaine45: number;
        semaine46: number;
        semaine47: number;
        semaine48: number;
        semaine49: number;
        semaine50: number;
        semaine51: number;
        semaine52: number;
    };
}

interface WeeklyHistogramChartProps {
    data?: WeeklyHistogramData;
    loading?: boolean;
    selectedYear?: number;
    onYearChange?: (year: number) => void;
}

const WeeklyHistogramChart: React.FC<WeeklyHistogramChartProps> = ({
    data,
    loading = false,
    selectedYear: propSelectedYear,
    onYearChange
}) => {
    const [selectedYear, setSelectedYear] = useState<number>(propSelectedYear || new Date().getFullYear());
    const [isFullScreen, setIsFullScreen] = useState(false);
    // const [hoveredWeek, setHoveredWeek] = useState<string | null>(null);

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

    const formatNumber = (num: number) => {
        return num.toLocaleString("fr-FR");
    };

    const getMaxValue = () => {
        if (!data || !data[selectedYear]) return 100;
        const yearData = data[selectedYear];
        const displayValues = displayWeeks.map(week => yearData[week.key as keyof typeof yearData] || 0);
        return Math.max(...displayValues);
    };

    const getBarHeight = (value: number) => {
        const maxValue = getMaxValue();
        if (maxValue === 0) return 50;
        const height = (value / maxValue) * 200;
        return Math.max(height, 50);
    };

    const getBarColor = (value: number) => {
        if (!data || !data[selectedYear]) return "bg-success";

        const yearData = data[selectedYear];
        const displayValues = displayWeeks.map(week => yearData[week.key as keyof typeof yearData] || 0);
        const values = displayValues.sort((a, b) => b - a);
        const maxValue = values[0];
        const secondMaxValue = values[1];

        if (value === maxValue) return "bg-red-500";
        if (value === secondMaxValue) return "bg-warning";
        return "bg-success";
    };

    const getTooltipPosition = (index: number, totalWeeks: number) => {
        const isNearLeft = index < 5;
        const isNearRight = index > totalWeeks - 5;

        if (isNearLeft) {
            return "left-0 transform translate-x-0";
        } else if (isNearRight) {
            return "right-0 transform translate-x-0";
        } else {
            return "left-1/2 transform -translate-x-1/2";
        }
    };

    const getTooltipArrowPosition = (index: number, totalWeeks: number) => {
        const isNearLeft = index < 5;
        const isNearRight = index > totalWeeks - 5;

        if (isNearLeft) {
            return "left-4 transform translate-x-0";
        } else if (isNearRight) {
            return "right-4 transform translate-x-0";
        } else {
            return "left-1/2 transform -translate-x-1/2";
        }
    };

    // Générer les années disponibles
    const currentYear = new Date().getFullYear();
    const availableYears = Array.from({ length: 5 }, (_, i) => currentYear - i);

    // Générer les semaines (52 semaines par an)
    const weeks = Array.from({ length: 52 }, (_, i) => ({
        key: `semaine${i + 1}`,
        label: `S${i + 1}`,
        color: "bg-blue-500"
    }));

    // Filtrer les semaines pour l'année courante
    const getCurrentWeek = () => {
        const now = new Date();
        const startOfYear = new Date(now.getFullYear(), 0, 1);
        const days = Math.floor((now.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000));
        return Math.ceil(days / 7);
    };

    const currentWeek = getCurrentWeek();
    const displayWeeks = selectedYear === currentYear
        ? weeks.slice(0, Math.min(currentWeek, 52))
        : weeks;

    if (loading) {
        return (
            <div className="panel">
                <div className="flex items-center gap-2 mb-6">
                    <div className="h-6 w-6 bg-gray-300 dark:bg-gray-600 rounded animate-pulse"></div>
                    <div className="h-6 w-32 bg-gray-300 dark:bg-gray-600 rounded animate-pulse"></div>
                </div>
                <div className="h-64 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse"></div>
            </div>
        );
    }

    const renderHistogramContent = () => (
        <>
            <div className="h-80 flex items-end justify-between gap-1 px-4 overflow-x-auto relative">
                {displayWeeks.map((week, index) => {
                    const value = data?.[selectedYear]?.[week.key as keyof WeeklyHistogramData[number]] || 0;
                    const barHeight = getBarHeight(value);
                    const barColor = getBarColor(value);

                    return (
                        <div key={week.key} className="flex flex-col items-center flex-shrink-0 min-w-[20px] relative">
                            <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                                {formatNumber(value)}
                            </div>
                            <div
                                className={`w-2 rounded-t-lg transition-all duration-500 ${barColor} border border-gray-300 dark:border-gray-600 shadow-sm`}
                                style={{ height: `${barHeight}px` }}
                            >
                                <div className="h-full w-full bg-gradient-to-t from-black/20 to-transparent rounded-t-lg"></div>
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
                                {week.label}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Légende */}
            <div className="flex items-center justify-center gap-6 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-red-500 rounded"></div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Plus haut pic</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-warning rounded"></div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Deuxième pic</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-success rounded"></div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Autres valeurs</span>
                </div>
            </div>
        </>
    );

    return (
        <div className="panel relative z-10">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <IconBarChart className="h-6 w-6 text-primary" />
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                        Total de tous les encaissements par semaine
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

            {renderHistogramContent()}

            {/* Tooltip Portal - Désactivé pour le moment
            {hoveredWeek && typeof window !== 'undefined' && createPortal(
                <div
                    className="fixed px-3 py-2 bg-gray-900 text-white text-xs rounded-lg pointer-events-none whitespace-nowrap z-[999999] min-w-[200px]"
                    style={{
                        left: '50%',
                        top: '50%',
                        transform: 'translate(-50%, -50%)'
                    }}
                >
                    <div className="font-semibold mb-1 text-center">{hoveredWeek}</div>
                    <div className="space-y-1">
                        <div className="flex justify-between gap-2">
                            <span>En attente:</span>
                            <span className="font-semibold">{formatNumber(Math.floor(100 * 0.25))}</span>
                        </div>
                        <div className="flex justify-between gap-2">
                            <span>Traités:</span>
                            <span className="font-semibold">{formatNumber(Math.floor(100 * 0.20))}</span>
                        </div>
                        <div className="flex justify-between gap-2">
                            <span>Validés:</span>
                            <span className="font-semibold">{formatNumber(Math.floor(100 * 0.15))}</span>
                        </div>
                        <div className="flex justify-between gap-2">
                            <span>Rejetés:</span>
                            <span className="font-semibold">{formatNumber(Math.floor(100 * 0.10))}</span>
                        </div>
                        <div className="flex justify-between gap-2">
                            <span>Clôturés:</span>
                            <span className="font-semibold">{formatNumber(Math.floor(100 * 0.20))}</span>
                        </div>
                        <div className="flex justify-between gap-2">
                            <span>Réclamations:</span>
                            <span className="font-semibold">{formatNumber(Math.floor(100 * 0.10))}</span>
                        </div>
                    </div>
                    <div className="mt-2 pt-2 border-t border-gray-700">
                        <div className="flex justify-between gap-2 font-bold">
                            <span>Total:</span>
                            <span>{formatNumber(100)}</span>
                        </div>
                    </div>
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-6 border-r-6 border-t-6 border-transparent border-t-gray-900"></div>
                </div>,
                document.body
            )}
            */}

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
                                        Total de tous les encaissements par semaine
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
                            <div className="h-full flex flex-col">
                                <div className="flex-1 flex items-end justify-between gap-2 px-4 overflow-x-auto">
                                    {displayWeeks.map((week, index) => {
                                        const value = data?.[selectedYear]?.[week.key as keyof WeeklyHistogramData[number]] || 0;
                                        const barHeight = getBarHeight(value);
                                        const barColor = getBarColor(value);

                                        return (
                                            <div key={week.key} className="flex flex-col items-center flex-shrink-0 min-w-[30px] relative">
                                                <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3">
                                                    {formatNumber(value)}
                                                </div>
                                                <div
                                                    className={`w-4 rounded-t-lg transition-all duration-500 ${barColor} border border-gray-300 dark:border-gray-600 shadow-sm`}
                                                    style={{ height: `${barHeight * 1.5}px` }}
                                                >
                                                    <div className="h-full w-full bg-gradient-to-t from-black/20 to-transparent rounded-t-lg"></div>
                                                </div>
                                                <div className="text-sm text-gray-500 dark:text-gray-400 mt-3 text-center">
                                                    {week.label}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Légende */}
                                <div className="flex items-center justify-center gap-8 mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                                    <div className="flex items-center gap-3">
                                        <div className="w-6 h-6 bg-red-500 rounded"></div>
                                        <span className="text-base text-gray-600 dark:text-gray-400">Plus haut pic</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-6 h-6 bg-warning rounded"></div>
                                        <span className="text-base text-gray-600 dark:text-gray-400">Deuxième pic</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-6 h-6 bg-success rounded"></div>
                                        <span className="text-base text-gray-600 dark:text-gray-400">Autres valeurs</span>
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

export default WeeklyHistogramChart;
